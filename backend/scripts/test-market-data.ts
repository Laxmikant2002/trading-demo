import dotenv from "dotenv";
import { MarketDataService } from "../src/services/marketData.service";

dotenv.config();

async function testMarketData() {
  try {
    console.log("Testing market data service...");

    // Initialize Redis
    await MarketDataService.initializeRedis();

    // Update market data
    await MarketDataService.updateMarketData();
    console.log("Market data updated successfully");

    // Get cached data
    const btcData = await MarketDataService.getCachedMarketData("BTC");
    console.log("BTC cached data:", btcData);

    const allData = await MarketDataService.getAllCachedMarketData();
    console.log("All cached data:", allData);
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testMarketData();
