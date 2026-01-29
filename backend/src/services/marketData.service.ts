import axios from "axios";
import { SMA, RSI } from "technicalindicators";
import { Op } from "sequelize";
import { Server } from "socket.io";
import MarketData, { IMarketData } from "../models/MarketData";
import { createClient, RedisClientType } from "redis";

interface TwelveDataQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  previous_close: number;
  day_high: number;
  day_low: number;
  volume: number;
  timestamp: number;
}

interface TwelveDataTimeSeries {
  meta: {
    symbol: string;
    interval: string;
    currency: string;
    exchange_timezone: string;
    exchange: string;
    mic_code: string;
    type: string;
  };
  values: Array<{
    datetime: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
  }>;
  status: string;
}

export class MarketDataService {
  private static redisClient: RedisClientType | null = null;
  private static io: Server | null = null;
  private static readonly CACHE_TTL = 15 * 60; // 15 minutes
  private static readonly SYMBOLS = ["BTC", "ETH", "SOL"];
  private static readonly TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY;
  private static readonly BASE_URL = "https://api.twelvedata.com";

  static setSocketIO(io: Server) {
    this.io = io;
  }

  static async initializeRedis() {
    if (!this.redisClient) {
      this.redisClient = createClient({
        url: process.env.REDIS_URL || "redis://localhost:6379",
      });
      await this.redisClient.connect();
    }
  }

  static async fetchRealTimePrices(): Promise<IMarketData[]> {
    try {
      const symbols = this.SYMBOLS.join(",");
      const response = await axios.get(`${this.BASE_URL}/quote`, {
        params: {
          symbol: symbols,
          apikey: this.TWELVE_DATA_API_KEY,
        },
      });

      const quotes: TwelveDataQuote[] = Array.isArray(response.data)
        ? response.data
        : [response.data];

      const marketData: IMarketData[] = [];

      for (const quote of quotes) {
        // Get 24h high/low from time series
        const timeSeriesData = await this.fetch24hData(quote.symbol);

        const data = await MarketData.create({
          symbol: quote.symbol,
          price: quote.price,
          change_24h: quote.change_percent,
          high_24h: timeSeriesData.high,
          low_24h: timeSeriesData.low,
          volume_24h: quote.volume,
          timestamp: new Date(),
          isDelayed: true,
        });

        marketData.push(data);
      }

      return marketData;
    } catch (error) {
      console.error("Error fetching real-time prices:", error);
      throw error;
    }
  }

  static async fetch24hData(
    symbol: string,
  ): Promise<{ high: number; low: number }> {
    try {
      const response = await axios.get<TwelveDataTimeSeries>(
        `${this.BASE_URL}/time_series`,
        {
          params: {
            symbol: symbol,
            interval: "1h",
            outputsize: 24, // 24 hours of hourly data
            apikey: this.TWELVE_DATA_API_KEY,
          },
        },
      );

      const values = response.data.values;
      const highs = values.map((v) => parseFloat(v.high));
      const lows = values.map((v) => parseFloat(v.low));

      return {
        high: Math.max(...highs),
        low: Math.min(...lows),
      };
    } catch (error) {
      console.error(`Error fetching 24h data for ${symbol}:`, error);
      return { high: 0, low: 0 };
    }
  }

  static async calculateTechnicalIndicators(symbol: string): Promise<void> {
    try {
      // Get last 100 data points for calculations
      const historicalData = await MarketData.findAll({
        where: { symbol },
        order: [["timestamp", "DESC"]],
        limit: 100,
      });

      if (historicalData.length < 50) return; // Need enough data for MA50

      const prices = historicalData.map((d) => d.price).reverse(); // Reverse to chronological order

      // Calculate MA20
      if (prices.length >= 20) {
        const ma20 = new SMA({ period: 20, values: prices });
        const ma20Values = ma20.getResult();

        // Calculate MA50
        const ma50 = new SMA({ period: 50, values: prices });
        const ma50Values = ma50.getResult();

        // Calculate RSI14
        const rsi = new RSI({ period: 14, values: prices });
        const rsiValues = rsi.getResult();

        // Update the most recent record with indicators
        const latestData = historicalData[0];
        await latestData.update({
          ma_20: ma20Values[ma20Values.length - 1],
          ma_50: ma50Values[ma50Values.length - 1],
          rsi_14: rsiValues[rsiValues.length - 1],
        });
      }
    } catch (error) {
      console.error(
        `Error calculating technical indicators for ${symbol}:`,
        error,
      );
    }
  }

  static async cacheMarketData(data: IMarketData[]): Promise<void> {
    if (!this.redisClient) await this.initializeRedis();

    const formattedData = [];
    for (const item of data) {
      const cacheKey = `market_data:${item.symbol}`;
      const formattedItem = {
        symbol: item.symbol,
        price: item.price,
        change_24h: item.change_24h,
        high_24h: item.high_24h,
        low_24h: item.low_24h,
        timestamp: item.timestamp,
        isDelayed: item.isDelayed,
        ma_20: item.ma_20,
        ma_50: item.ma_50,
        rsi_14: item.rsi_14,
      };

      await this.redisClient!.setEx(
        cacheKey,
        this.CACHE_TTL,
        JSON.stringify(formattedItem),
      );
      formattedData.push(formattedItem);
    }

    // WebSocket broadcasting is now handled by WebSocketService
  }

  static async getCachedMarketData(symbol: string): Promise<any | null> {
    if (!this.redisClient) await this.initializeRedis();

    const cacheKey = `market_data:${symbol}`;
    const cached = await this.redisClient!.get(cacheKey);

    return cached ? JSON.parse(cached) : null;
  }

  static async getAllCachedMarketData(): Promise<any[]> {
    if (!this.redisClient) await this.initializeRedis();

    const data: any[] = [];
    for (const symbol of this.SYMBOLS) {
      const cached = await this.getCachedMarketData(symbol);
      if (cached) data.push(cached);
    }

    return data;
  }

  static async updateMarketData(): Promise<void> {
    try {
      console.log("Updating market data...");

      // Fetch new data
      const newData = await this.fetchRealTimePrices();

      // Calculate technical indicators
      for (const symbol of this.SYMBOLS) {
        await this.calculateTechnicalIndicators(symbol);
      }

      // Cache in Redis
      await this.cacheMarketData(newData);

      console.log("Market data updated successfully");
    } catch (error) {
      console.error("Error updating market data:", error);
    }
  }

  static async cleanupOldData(): Promise<void> {
    try {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const deletedCount = await MarketData.destroy({
        where: {
          timestamp: {
            [Op.lt]: oneYearAgo,
          },
        },
      });

      console.log(`Cleaned up ${deletedCount} old market data records`);
    } catch (error) {
      console.error("Error cleaning up old data:", error);
    }
  }
}
