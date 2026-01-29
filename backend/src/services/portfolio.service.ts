import Portfolio from "../models/Portfolio";

export class PortfolioService {
  static async getPortfolio(userId: string) {
    return (await Portfolio.findOne({ userId })) || { userId, holdings: [] };
  }

  static async updatePortfolio(userId: string, updates: any) {
    return await Portfolio.findOneAndUpdate({ userId }, updates, {
      new: true,
      upsert: true,
    });
  }

  static async calculatePnL(portfolio: any) {
    // Placeholder for P&L calculation
    return 0;
  }
}
