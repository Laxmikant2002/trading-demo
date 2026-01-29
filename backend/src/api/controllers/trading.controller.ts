import { Request, Response } from "express";
import axios from "axios";
import { AuthRequest } from "../middleware/auth.middleware";
import { sendTradeConfirmationEmail } from "../../utils/email";
import { io } from "../../app";
import { NotificationService } from "../../services/notification.service";

interface MarketOrderRequest {
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
}

interface LimitOrderRequest {
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  limitPrice: number;
}

interface StopLossRequest {
  orderId: string;
  stopPrice: number;
}

interface TakeProfitRequest {
  orderId: string;
  takeProfitPrice: number;
}

export class TradingController {
  private static readonly TRADING_ENGINE_URL =
    process.env.TRADING_ENGINE_URL || "http://localhost:8000";

  static async placeMarketOrder(req: AuthRequest, res: Response) {
    try {
      const { symbol, side, quantity }: MarketOrderRequest = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Validate required fields
      if (!symbol || !side || !quantity) {
        return res
          .status(400)
          .json({ error: "Missing required fields: symbol, side, quantity" });
      }

      if (!["buy", "sell"].includes(side)) {
        return res
          .status(400)
          .json({ error: "Invalid side. Must be buy or sell" });
      }

      if (quantity <= 0) {
        return res.status(400).json({ error: "Quantity must be positive" });
      }

      // Get current market price from our market data service
      const marketPrice = await TradingController.getCurrentMarketPrice(symbol);
      if (!marketPrice) {
        return res
          .status(400)
          .json({ error: `No market price available for ${symbol}` });
      }

      // Validate balance/position size
      const validation = await TradingController.validateTrade(
        symbol,
        side,
        quantity,
        marketPrice,
        userId,
      );
      if (!validation.valid) {
        return res
          .status(validation.status)
          .json({ error: validation.message });
      }

      // Place order with Python trading engine
      const orderRequest = {
        symbol: symbol.toUpperCase(),
        type: "market",
        side,
        quantity,
      };

      const response = await axios.post(
        `${this.TRADING_ENGINE_URL}/orders`,
        orderRequest,
      );

      // Send WebSocket notification
      io.emit("order-update", {
        userId,
        type: "market_order_placed",
        order: response.data,
        timestamp: new Date().toISOString(),
      });

      // Send trade confirmation notification
      await NotificationService.createNotification({
        userId,
        type: "trade_confirmation",
        title: "Trade Executed",
        message: `${side.toUpperCase()} ${quantity} ${symbol.toUpperCase()} at market price`,
        data: {
          orderId: response.data.id,
          symbol: symbol.toUpperCase(),
          side,
          quantity,
          price: response.data.price,
          total: response.data.total,
        },
      });

      // Check for margin calls and balance alerts after trade
      await TradingController.checkPortfolioHealth(userId);

      res.json({
        success: true,
        order: response.data,
        message: "Market order placed successfully",
      });
    } catch (error: any) {
      console.error("Error placing market order:", error);
      res.status(500).json({
        error: "Failed to place market order",
        details: error.response?.data || error.message,
      });
    }
  }

  static async placeLimitOrder(req: AuthRequest, res: Response) {
    try {
      const { symbol, side, quantity, limitPrice }: LimitOrderRequest =
        req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Validate required fields
      if (!symbol || !side || !quantity || !limitPrice) {
        return res.status(400).json({
          error: "Missing required fields: symbol, side, quantity, limitPrice",
        });
      }

      if (!["buy", "sell"].includes(side)) {
        return res
          .status(400)
          .json({ error: "Invalid side. Must be buy or sell" });
      }

      if (quantity <= 0) {
        return res.status(400).json({ error: "Quantity must be positive" });
      }

      if (limitPrice <= 0) {
        return res.status(400).json({ error: "Limit price must be positive" });
      }

      // Validate balance/position size
      const validation = await TradingController.validateTrade(
        symbol,
        side,
        quantity,
        limitPrice,
        userId,
      );
      if (!validation.valid) {
        return res
          .status(validation.status)
          .json({ error: validation.message });
      }

      // Place order with Python trading engine
      const orderRequest = {
        symbol: symbol.toUpperCase(),
        type: "limit",
        side,
        quantity,
        price: limitPrice,
      };

      const response = await axios.post(
        `${this.TRADING_ENGINE_URL}/orders`,
        orderRequest,
      );

      // Send WebSocket notification
      io.emit("order-update", {
        userId,
        type: "limit_order_placed",
        order: response.data,
        timestamp: new Date().toISOString(),
      });

      // Check for margin calls and balance alerts after trade
      await TradingController.checkPortfolioHealth(userId);

      res.json({
        success: true,
        order: response.data,
        message: "Limit order placed successfully",
      });
    } catch (error: any) {
      console.error("Error placing limit order:", error);
      res.status(500).json({
        error: "Failed to place limit order",
        details: error.response?.data || error.message,
      });
    }
  }

  static async setStopLoss(req: AuthRequest, res: Response) {
    try {
      const { orderId, stopPrice }: StopLossRequest = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      if (!orderId || !stopPrice) {
        return res
          .status(400)
          .json({ error: "Missing required fields: orderId, stopPrice" });
      }

      if (stopPrice <= 0) {
        return res.status(400).json({ error: "Stop price must be positive" });
      }

      // For now, we'll create a stop-loss order
      // In a full implementation, this would modify an existing position
      const orderRequest = {
        symbol: "BTC", // This should come from the position/order
        type: "stop_loss",
        side: "sell", // Assuming we're setting stop loss on long positions
        quantity: 0.1, // This should come from the position
        stop_price: stopPrice,
      };

      const response = await axios.post(
        `${this.TRADING_ENGINE_URL}/orders`,
        orderRequest,
      );

      // Send WebSocket notification
      io.emit("order-update", {
        userId,
        type: "stop_loss_set",
        orderId,
        stopPrice,
        timestamp: new Date().toISOString(),
      });

      res.json({
        success: true,
        message: "Stop loss order set successfully",
        stopPrice,
      });
    } catch (error: any) {
      console.error("Error setting stop loss:", error);
      res.status(500).json({
        error: "Failed to set stop loss",
        details: error.response?.data || error.message,
      });
    }
  }

  static async setTakeProfit(req: AuthRequest, res: Response) {
    try {
      const { orderId, takeProfitPrice }: TakeProfitRequest = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      if (!orderId || !takeProfitPrice) {
        return res
          .status(400)
          .json({ error: "Missing required fields: orderId, takeProfitPrice" });
      }

      if (takeProfitPrice <= 0) {
        return res
          .status(400)
          .json({ error: "Take profit price must be positive" });
      }

      // For now, we'll create a take-profit order
      const orderRequest = {
        symbol: "BTC", // This should come from the position/order
        type: "take_profit",
        side: "sell", // Assuming we're setting take profit on long positions
        quantity: 0.1, // This should come from the position
        stop_price: takeProfitPrice,
      };

      const response = await axios.post(
        `${this.TRADING_ENGINE_URL}/orders`,
        orderRequest,
      );

      // Send WebSocket notification
      io.emit("order-update", {
        userId,
        type: "take_profit_set",
        orderId,
        takeProfitPrice,
        timestamp: new Date().toISOString(),
      });

      res.json({
        success: true,
        message: "Take profit order set successfully",
        takeProfitPrice,
      });
    } catch (error: any) {
      console.error("Error setting take profit:", error);
      res.status(500).json({
        error: "Failed to set take profit",
        details: error.response?.data || error.message,
      });
    }
  }

  static async getOrders(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const response = await axios.get(`${this.TRADING_ENGINE_URL}/orders`);
      res.json(response.data);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      res.status(500).json({
        error: "Failed to fetch orders",
        details: error.response?.data || error.message,
      });
    }
  }

  static async getPositions(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const response = await axios.get(`${this.TRADING_ENGINE_URL}/positions`);
      res.json(response.data);
    } catch (error: any) {
      console.error("Error fetching positions:", error);
      res.status(500).json({
        error: "Failed to fetch positions",
        details: error.response?.data || error.message,
      });
    }
  }

  static async getPortfolio(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const response = await axios.get(`${this.TRADING_ENGINE_URL}/portfolio`);
      res.json(response.data);
    } catch (error: any) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({
        error: "Failed to fetch portfolio",
        details: error.response?.data || error.message,
      });
    }
  }

  static async getPortfolioOverview(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Get portfolio summary from trading engine
      const portfolioResponse = await axios.get(
        `${this.TRADING_ENGINE_URL}/portfolio`,
      );
      const portfolio = portfolioResponse.data;

      // Get performance metrics
      const performanceResponse = await axios.get(
        `${this.TRADING_ENGINE_URL}/performance`,
      );
      const performance = performanceResponse.data;

      // Get trades for chart data
      const tradesResponse = await axios.get(
        `${this.TRADING_ENGINE_URL}/trades`,
      );
      const trades = tradesResponse.data;

      // Calculate performance chart data (equity curve)
      const performanceChart = this.calculatePerformanceChart(
        trades,
        portfolio.initial_balance,
      );

      const overview = {
        totalBalance: portfolio.equity,
        unrealizedPL: portfolio.unrealized_pnl,
        realizedPL: performance.trading_stats.total_realized_pnl,
        marginLevel: portfolio.margin_level,
        openPositions: portfolio.positions,
        performanceChart: performanceChart,
      };

      res.json(overview);
    } catch (error: any) {
      console.error("Error fetching portfolio overview:", error);
      res.status(500).json({
        error: "Failed to fetch portfolio overview",
        details: error.response?.data || error.message,
      });
    }
  }

  static async getPortfolioHistory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { startDate, endDate, format } = req.query;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Get trades from trading engine
      const tradesResponse = await axios.get(
        `${this.TRADING_ENGINE_URL}/trades`,
      );
      let trades = tradesResponse.data;

      // Filter by date range if provided
      if (startDate || endDate) {
        const start = startDate ? new Date(startDate as string) : null;
        const end = endDate ? new Date(endDate as string) : null;

        trades = trades.filter((trade: any) => {
          const tradeDate = new Date(trade.timestamp);
          if (start && tradeDate < start) return false;
          if (end && tradeDate > end) return false;
          return true;
        });
      }

      // Calculate performance metrics
      const metrics = this.calculatePortfolioMetrics(trades);

      // If CSV export requested
      if (format === "csv") {
        const csvData = this.generateTradesCSV(trades);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="portfolio-history.csv"',
        );
        return res.send(csvData);
      }

      // Calculate daily P&L breakdown
      const dailyPL = this.calculateDailyPL(trades);

      // Calculate performance graph data (equity curve)
      const performanceGraph = this.calculatePerformanceChart(trades, 10000); // Assuming initial balance

      const history = {
        period: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
        metrics: metrics,
        dailyPL: dailyPL,
        performanceGraph: performanceGraph,
        trades: trades,
      };

      res.json(history);
    } catch (error: any) {
      console.error("Error fetching portfolio history:", error);
      res.status(500).json({
        error: "Failed to fetch portfolio history",
        details: error.response?.data || error.message,
      });
    }
  }

  private static async getCurrentMarketPrice(
    symbol: string,
  ): Promise<number | null> {
    try {
      // This would integrate with our market data service
      // For now, return a mock price
      const mockPrices: { [key: string]: number } = {
        BTC: 65000,
        ETH: 3500,
        SOL: 120,
      };
      return mockPrices[symbol.toUpperCase()] || null;
    } catch (error) {
      console.error("Error getting market price:", error);
      return null;
    }
  }

  private static async validateTrade(
    symbol: string,
    side: string,
    quantity: number,
    price: number,
    userId: number,
  ): Promise<{ valid: boolean; status: number; message: string }> {
    try {
      // Get current portfolio
      const portfolioResponse = await axios.get(
        `${this.TRADING_ENGINE_URL}/portfolio`,
      );
      const portfolio = portfolioResponse.data;

      const tradeValue = quantity * price;
      const requiredMargin = tradeValue / portfolio.leverage;

      // Check if user has sufficient margin
      if (portfolio.equity < requiredMargin) {
        return {
          valid: false,
          status: 400,
          message: `Insufficient funds. Required margin: $${requiredMargin.toFixed(2)}, Available equity: $${portfolio.equity.toFixed(2)}`,
        };
      }

      // Check margin level after trade
      const newUsedMargin = portfolio.used_margin + requiredMargin;
      const estimatedMarginLevel = (portfolio.equity / newUsedMargin) * 100;

      if (estimatedMarginLevel < 20) {
        // Conservative check
        return {
          valid: false,
          status: 400,
          message: `Trade would result in dangerously low margin level: ${estimatedMarginLevel.toFixed(2)}%`,
        };
      }

      return {
        valid: true,
        status: 200,
        message: "Trade validated successfully",
      };
    } catch (error) {
      console.error("Error validating trade:", error);
      return {
        valid: false,
        status: 500,
        message: "Failed to validate trade",
      };
    }
  }

  private static calculatePerformanceChart(
    trades: any[],
    initialBalance: number,
  ): any[] {
    let equity = initialBalance;
    const chartData = [
      {
        timestamp: new Date("2024-01-01").toISOString(),
        equity: initialBalance,
      },
    ];

    // Sort trades by timestamp
    const sortedTrades = [...trades].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    for (const trade of sortedTrades) {
      equity += trade.realized_pnl - trade.commission;
      chartData.push({
        timestamp: trade.timestamp,
        equity: equity,
      });
    }

    return chartData;
  }

  private static calculatePortfolioMetrics(trades: any[]): any {
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        averageProfit: 0,
        averageLoss: 0,
        profitFactor: 0,
        totalRealizedPL: 0,
        totalCommission: 0,
        netPL: 0,
      };
    }

    const winningTrades = trades.filter((t) => t.realized_pnl > 0);
    const losingTrades = trades.filter((t) => t.realized_pnl < 0);

    const totalRealizedPL = trades.reduce((sum, t) => sum + t.realized_pnl, 0);
    const totalCommission = trades.reduce((sum, t) => sum + t.commission, 0);
    const netPL = totalRealizedPL - totalCommission;

    const averageProfit =
      winningTrades.length > 0
        ? winningTrades.reduce((sum, t) => sum + t.realized_pnl, 0) /
          winningTrades.length
        : 0;

    const averageLoss =
      losingTrades.length > 0
        ? Math.abs(
            losingTrades.reduce((sum, t) => sum + t.realized_pnl, 0) /
              losingTrades.length,
          )
        : 0;

    const profitFactor = averageLoss > 0 ? averageProfit / averageLoss : 0;

    return {
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: (winningTrades.length / trades.length) * 100,
      averageProfit: averageProfit,
      averageLoss: averageLoss,
      profitFactor: profitFactor,
      totalRealizedPL: totalRealizedPL,
      totalCommission: totalCommission,
      netPL: netPL,
    };
  }

  private static calculateDailyPL(trades: any[]): any[] {
    const dailyMap = new Map<
      string,
      {
        date: string;
        realizedPL: number;
        commission: number;
        netPL: number;
        tradeCount: number;
      }
    >();

    for (const trade of trades) {
      const date = new Date(trade.timestamp).toISOString().split("T")[0];
      const existing = dailyMap.get(date) || {
        date,
        realizedPL: 0,
        commission: 0,
        netPL: 0,
        tradeCount: 0,
      };

      existing.realizedPL += trade.realized_pnl;
      existing.commission += trade.commission;
      existing.netPL += trade.realized_pnl - trade.commission;
      existing.tradeCount += 1;

      dailyMap.set(date, existing);
    }

    return Array.from(dailyMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );
  }

  private static generateTradesCSV(trades: any[]): string {
    const headers = [
      "Timestamp",
      "Symbol",
      "Side",
      "Quantity",
      "Price",
      "Realized P&L",
      "Commission",
      "Net P&L",
    ];

    const rows = trades.map((trade) => [
      trade.timestamp,
      trade.symbol,
      trade.side,
      trade.quantity,
      trade.price,
      trade.realized_pnl,
      trade.commission,
      trade.realized_pnl - trade.commission,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    return csvContent;
  }

  // Check portfolio health and send alerts if needed
  private static async checkPortfolioHealth(userId: number): Promise<void> {
    try {
      // Get current portfolio
      const portfolioResponse = await axios.get(
        `${this.TRADING_ENGINE_URL}/portfolio`,
      );
      const portfolio = portfolioResponse.data;

      // Calculate margin level
      const marginLevel =
        portfolio.used_margin > 0
          ? (portfolio.equity / portfolio.used_margin) * 100
          : 100;

      // Check for margin call (margin level below 50%)
      if (marginLevel < 50 && marginLevel > 20) {
        await NotificationService.createNotification({
          userId,
          type: "margin_call",
          title: "Margin Warning",
          message: `Your margin level is ${marginLevel.toFixed(2)}%. Consider reducing positions or adding funds.`,
          data: {
            marginLevel: marginLevel.toFixed(2),
            equity: portfolio.equity,
            usedMargin: portfolio.used_margin,
          },
        });
      }

      // Check for critical margin call (margin level below 20%)
      if (marginLevel < 20) {
        await NotificationService.createNotification({
          userId,
          type: "margin_call",
          title: "Critical Margin Call",
          message: `URGENT: Your margin level is critically low at ${marginLevel.toFixed(2)}%. Immediate action required.`,
          data: {
            marginLevel: marginLevel.toFixed(2),
            equity: portfolio.equity,
            usedMargin: portfolio.used_margin,
          },
        });
      }

      // Check for low balance alert (below $1000)
      if (portfolio.equity < 1000) {
        await NotificationService.createNotification({
          userId,
          type: "balance_alert",
          title: "Low Balance Alert",
          message: `Your account balance is low: $${portfolio.equity.toFixed(2)}. Consider adding funds.`,
          data: {
            balance: portfolio.equity,
            threshold: 1000,
          },
        });
      }
    } catch (error) {
      console.error("Error checking portfolio health:", error);
    }
  }
}
