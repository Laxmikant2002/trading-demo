import { createClient } from "redis";

export class MarketCache {
  private client = createClient();

  async setMarketData(symbol: string, data: any) {
    await this.client.set(`market:${symbol}`, JSON.stringify(data));
  }

  async getMarketData(symbol: string) {
    const data = await this.client.get(`market:${symbol}`);
    return data ? JSON.parse(data) : null;
  }

  async getAllMarketData() {
    // Placeholder
    return {};
  }
}
