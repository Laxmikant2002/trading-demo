import { Request, Response } from "express";
import Portfolio from "../../models/Portfolio";

interface AuthRequest extends Request {
  user?: any;
}

export class PortfolioController {
  static async getPortfolio(req: AuthRequest, res: Response) {
    try {
      const portfolio = await Portfolio.findOne({ userId: req.user?.id });
      res.json(portfolio);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portfolio" });
    }
  }

  static async updatePortfolio(req: AuthRequest, res: Response) {
    try {
      const updates = req.body;
      const portfolio = await Portfolio.findOneAndUpdate(
        { userId: req.user?.id },
        updates,
        { new: true, upsert: true },
      );
      res.json(portfolio);
    } catch (error) {
      res.status(500).json({ error: "Failed to update portfolio" });
    }
  }
}
