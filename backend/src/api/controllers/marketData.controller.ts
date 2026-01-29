import { Request, Response } from "express";
import { MarketDataService } from "../../services/marketData.service";
import { Op } from "sequelize";
import MarketData from "../../models/MarketData";

export class MarketDataController {
  static async getMarketData(req: Request, res: Response) {
    try {
      const { symbol } = req.params;

      if (symbol) {
        const data = await MarketDataService.getCachedMarketData(
          symbol.toUpperCase(),
        );
        if (!data) {
          return res.status(404).json({ error: "Market data not found" });
        }
        return res.json(data);
      }

      const allData = await MarketDataService.getAllCachedMarketData();
      res.json(allData);
    } catch (error) {
      console.error("Error fetching market data:", error);
      res.status(500).json({ error: "Failed to fetch market data" });
    }
  }

  static async getHistoricalData(req: Request, res: Response) {
    try {
      const { symbol } = req.params;
      const { limit = 100, startDate, endDate } = req.query;

      const whereClause: any = { symbol: symbol.toUpperCase() };

      if (startDate || endDate) {
        whereClause.timestamp = {};
        if (startDate)
          whereClause.timestamp[Op.gte] = new Date(startDate as string);
        if (endDate)
          whereClause.timestamp[Op.lte] = new Date(endDate as string);
      }

      const historicalData = await MarketData.findAll({
        where: whereClause,
        order: [["timestamp", "DESC"]],
        limit: parseInt(limit as string),
      });

      res.json(historicalData);
    } catch (error) {
      console.error("Error fetching historical data:", error);
      res.status(500).json({ error: "Failed to fetch historical data" });
    }
  }

  static async triggerUpdate(req: Request, res: Response) {
    try {
      await MarketDataService.updateMarketData();
      res.json({ message: "Market data update triggered successfully" });
    } catch (error) {
      console.error("Error triggering market data update:", error);
      res.status(500).json({ error: "Failed to update market data" });
    }
  }
}
