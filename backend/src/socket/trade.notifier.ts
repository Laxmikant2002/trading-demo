import { Server } from "socket.io";

export class TradeNotifier {
  constructor(private io: Server) {}

  notifyTrade(userId: string, trade: any) {
    this.io.to(userId).emit("tradeExecuted", trade);
  }

  notifyOrderUpdate(userId: string, order: any) {
    this.io.to(userId).emit("orderUpdate", order);
  }
}
