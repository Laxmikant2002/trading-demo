import { Request, Response } from "express";
import axios from "axios";
import { AuthRequest } from "../middleware/auth.middleware";
import { sendTradeConfirmationEmail } from "../../utils/email";
import { io } from "../../app";

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

      // Send confirmation email
      await sendTradeConfirmationEmail(userId, response.data);

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
}
