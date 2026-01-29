import { Request, Response } from "express";
import Order from "../../models/Order";
import Trade from "../../models/Trade";

interface AuthRequest extends Request {
  user?: any;
}

export class TradingController {
  static async placeOrder(req: AuthRequest, res: Response) {
    try {
      const { symbol, type, quantity, price } = req.body;
      const order = new Order({
        userId: req.user?.id,
        symbol,
        type,
        quantity,
        price,
      });
      await order.save();
      res.status(201).json({ message: "Order placed successfully", order });
    } catch (error) {
      res.status(500).json({ error: "Failed to place order" });
    }
  }

  static async getOrders(req: AuthRequest, res: Response) {
    try {
      const orders = await Order.find({ userId: req.user?.id });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  }

  static async getTrades(req: AuthRequest, res: Response) {
    try {
      const trades = await Trade.find({ userId: req.user?.id });
      res.json(trades);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trades" });
    }
  }
}
