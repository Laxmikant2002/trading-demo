import { Server } from "socket.io";

export class PriceBroadcaster {
  constructor(private io: Server) {}

  broadcastPriceUpdate(symbol: string, price: number) {
    this.io.emit("priceUpdate", { symbol, price });
  }

  startBroadcasting() {
    // Placeholder for periodic price updates
    setInterval(() => {
      // Simulate price updates
      this.broadcastPriceUpdate("AAPL", Math.random() * 200);
    }, 5000);
  }
}
