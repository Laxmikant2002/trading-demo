import { Request, Response } from "express";

export class MarketController {
  static async getMarketData(req: Request, res: Response) {
    try {
      // Placeholder for market data
      const data = {
        symbol: req.params.symbol,
        price: 100.0,
        volume: 1000,
      };
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch market data" });
    }
  }

  static async getAllSymbols(req: Request, res: Response) {
    try {
      const symbols = ["AAPL", "GOOGL", "MSFT"]; // Placeholder
      res.json(symbols);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch symbols" });
    }
  }
}
