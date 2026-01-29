import cron from "node-cron";
import { MarketDataService } from "../services/marketData.service";

export class MarketDataScheduler {
  static start() {
    // Run every 30 seconds for real-time price updates
    cron.schedule("*/30 * * * * *", async () => {
      console.log("Running real-time market data update...");
      try {
        await MarketDataService.updateMarketData();
      } catch (error) {
        console.error("Real-time market data update failed:", error);
      }
    });

    // Run cleanup every day at 2 AM
    cron.schedule("0 2 * * *", async () => {
      console.log("Running daily data cleanup...");
      try {
        await MarketDataService.cleanupOldData();
      } catch (error) {
        console.error("Daily data cleanup failed:", error);
      }
    });

    console.log("Market data scheduler started (30-second intervals)");
  }
}
