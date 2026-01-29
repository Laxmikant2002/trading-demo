import { createClient } from "redis";

export class PriceCache {
  private client = createClient();

  async setPrice(symbol: string, price: number) {
    await this.client.set(`price:${symbol}`, price.toString());
  }

  async getPrice(symbol: string) {
    const price = await this.client.get(`price:${symbol}`);
    return price ? parseFloat(price) : null;
  }

  async getAllPrices() {
    // Placeholder
    return {};
  }
}
