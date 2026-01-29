import cron from "node-cron";
import { MarketDataService } from "../services/marketData.service";

export class MarketDataScheduler {
  static start() {
    // Run every 15 minutes
    cron.schedule("*/15 * * * *", async () => {
      console.log("Running scheduled market data update...");
      try {
        await MarketDataService.updateMarketData();
      } catch (error) {
        console.error("Scheduled market data update failed:", error);
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

    console.log("Market data scheduler started");
  }
}
