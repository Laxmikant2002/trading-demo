import Order from "../models/Order";
import Trade from "../models/Trade";

export class TradingService {
  static async createOrder(userId: string, orderData: any) {
    const order = new Order({ ...orderData, userId });
    return await order.save();
  }

  static async executeOrder(orderId: string) {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");

    // Placeholder for order execution logic
    const trade = new Trade({
      userId: order.userId,
      symbol: order.symbol,
      quantity: order.quantity,
      price: order.price,
      type: "buy", // or sell
    });
    await trade.save();
    await Order.findByIdAndDelete(orderId);
    return trade;
  }

  static async getUserOrders(userId: string) {
    return await Order.find({ userId });
  }

  static async getUserTrades(userId: string) {
    return await Trade.find({ userId });
  }
}
