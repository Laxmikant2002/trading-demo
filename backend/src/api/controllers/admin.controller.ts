import { Request, Response } from "express";
import User from "../../models/User";
import { AuthRequest } from "../middleware/auth.middleware";
import { sendEmail } from "../../utils/email";
import axios from "axios";
import { Op } from "sequelize";

interface AdminRequest extends AuthRequest {
  user?: {
    userId: number;
    email: string;
    role: "user" | "admin" | "moderator";
  };
}

export class AdminController {
  private static readonly TRADING_ENGINE_URL =
    process.env.TRADING_ENGINE_URL || "http://localhost:8000";

  // Middleware to check admin role
  static requireAdmin(req: AdminRequest, res: Response, next: Function) {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  }

  // User Management Endpoints

  static async getUsers(req: AdminRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const { count, rows: users } = await User.findAndCountAll({
        attributes: [
          "id",
          "email",
          "firstName",
          "lastName",
          "isVerified",
          "role",
          "isActive",
          "demoBalance",
          "lastLoginAt",
          "createdAt",
        ],
        limit,
        offset,
        order: [["createdAt", "DESC"]],
      });

      res.json({
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalUsers: count,
          limit,
        },
      });
    } catch (error: any) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  static async getUserDetails(req: AdminRequest, res: Response) {
    try {
      const { userId } = req.params;

      const user = await User.findByPk(userId, {
        attributes: [
          "id",
          "email",
          "firstName",
          "lastName",
          "isVerified",
          "role",
          "isActive",
          "demoBalance",
          "lastLoginAt",
          "createdAt",
          "updatedAt",
        ],
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get user's trading activity from Python engine
      let tradingActivity = null;
      try {
        const [ordersRes, positionsRes, portfolioRes] = await Promise.all([
          axios.get(`${this.TRADING_ENGINE_URL}/orders`),
          axios.get(`${this.TRADING_ENGINE_URL}/positions`),
          axios.get(`${this.TRADING_ENGINE_URL}/portfolio`),
        ]);

        tradingActivity = {
          orders: ordersRes.data,
          positions: positionsRes.data,
          portfolio: portfolioRes.data,
        };
      } catch (engineError) {
        console.warn("Could not fetch trading activity:", engineError);
      }

      res.json({
        user,
        tradingActivity,
      });
    } catch (error: any) {
      console.error("Error fetching user details:", error);
      res.status(500).json({ error: "Failed to fetch user details" });
    }
  }

  static async resetUserBalance(req: AdminRequest, res: Response) {
    try {
      const { userId } = req.params;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Reset demo balance to $10,000
      user.demoBalance = 10000.0;
      await user.save();

      // Reset trading engine portfolio
      try {
        await axios.post(`${this.TRADING_ENGINE_URL}/reset`);
      } catch (engineError) {
        console.warn("Could not reset trading engine:", engineError);
      }

      res.json({
        message: "User balance reset successfully",
        user: {
          id: user.id,
          email: user.email,
          demoBalance: user.demoBalance,
        },
      });
    } catch (error: any) {
      console.error("Error resetting user balance:", error);
      res.status(500).json({ error: "Failed to reset user balance" });
    }
  }

  static async toggleUserStatus(req: AdminRequest, res: Response) {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
        return res.status(400).json({ error: "isActive must be a boolean" });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      user.isActive = isActive;
      await user.save();

      res.json({
        message: `User ${isActive ? "activated" : "deactivated"} successfully`,
        user: {
          id: user.id,
          email: user.email,
          isActive: user.isActive,
        },
      });
    } catch (error: any) {
      console.error("Error toggling user status:", error);
      res.status(500).json({ error: "Failed to toggle user status" });
    }
  }

  // System Control Endpoints

  static async getTradableAssets(req: AdminRequest, res: Response) {
    try {
      // For now, return mock data. In production, this would come from a database
      const assets = [
        { symbol: "BTC", name: "Bitcoin", isActive: true },
        { symbol: "ETH", name: "Ethereum", isActive: true },
        { symbol: "SOL", name: "Solana", isActive: true },
        { symbol: "ADA", name: "Cardano", isActive: false },
      ];

      res.json({ assets });
    } catch (error: any) {
      console.error("Error fetching tradable assets:", error);
      res.status(500).json({ error: "Failed to fetch tradable assets" });
    }
  }

  static async addTradableAsset(req: AdminRequest, res: Response) {
    try {
      const { symbol, name } = req.body;

      if (!symbol || !name) {
        return res.status(400).json({ error: "Symbol and name are required" });
      }

      // In production, save to database
      const newAsset = {
        symbol: symbol.toUpperCase(),
        name,
        isActive: true,
        createdAt: new Date(),
      };

      res.status(201).json({
        message: "Asset added successfully",
        asset: newAsset,
      });
    } catch (error: any) {
      console.error("Error adding tradable asset:", error);
      res.status(500).json({ error: "Failed to add tradable asset" });
    }
  }

  static async removeTradableAsset(req: AdminRequest, res: Response) {
    try {
      const { symbol } = req.params;

      // In production, update database
      res.json({
        message: `Asset ${symbol} removed successfully`,
      });
    } catch (error: any) {
      console.error("Error removing tradable asset:", error);
      res.status(500).json({ error: "Failed to remove tradable asset" });
    }
  }

  static async adjustSimulatedPrice(req: AdminRequest, res: Response) {
    try {
      const { symbol, price } = req.body;

      if (!symbol || !price || price <= 0) {
        return res
          .status(400)
          .json({ error: "Valid symbol and positive price required" });
      }

      // Update price in trading engine
      await axios.post(`${this.TRADING_ENGINE_URL}/market-price/${symbol}`, {
        price,
      });

      res.json({
        message: `Price for ${symbol} adjusted to $${price}`,
        symbol,
        newPrice: price,
      });
    } catch (error: any) {
      console.error("Error adjusting simulated price:", error);
      res.status(500).json({ error: "Failed to adjust simulated price" });
    }
  }

  static async getSystemMetrics(req: AdminRequest, res: Response) {
    try {
      const totalUsers = await User.count();
      const activeUsers = await User.count({ where: { isActive: true } });
      const verifiedUsers = await User.count({ where: { isVerified: true } });

      // Get trading engine metrics
      let engineMetrics = null;
      try {
        const response = await axios.get(
          `${this.TRADING_ENGINE_URL}/performance`,
        );
        engineMetrics = response.data;
      } catch (engineError) {
        console.warn("Could not fetch engine metrics:", engineError);
      }

      const metrics = {
        users: {
          total: totalUsers,
          active: activeUsers,
          verified: verifiedUsers,
          inactive: totalUsers - activeUsers,
        },
        trading: engineMetrics,
        system: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          nodeVersion: process.version,
        },
      };

      res.json(metrics);
    } catch (error: any) {
      console.error("Error fetching system metrics:", error);
      res.status(500).json({ error: "Failed to fetch system metrics" });
    }
  }

  static async sendGlobalNotification(req: AdminRequest, res: Response) {
    try {
      const { title, message, type = "info" } = req.body;

      if (!title || !message) {
        return res
          .status(400)
          .json({ error: "Title and message are required" });
      }

      // Get all active users
      const activeUsers = await User.findAll({
        where: { isActive: true, isVerified: true },
        attributes: ["email"],
      });

      // Send notification emails (in production, use a queue system)
      const emailPromises = activeUsers.map((user) =>
        sendEmail({
          to: user.email,
          subject: `XPro Trading: ${title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">${title}</h2>
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; line-height: 1.6;">${message}</p>
              </div>
              <p style="color: #666; font-size: 12px;">
                This is an automated notification from XPro Trading.
              </p>
            </div>
          `,
        }),
      );

      // Send emails in batches to avoid overwhelming the service
      const batchSize = 10;
      for (let i = 0; i < emailPromises.length; i += batchSize) {
        const batch = emailPromises.slice(i, i + batchSize);
        await Promise.all(batch);
      }

      res.json({
        message: "Global notification sent successfully",
        recipients: activeUsers.length,
        type,
      });
    } catch (error: any) {
      console.error("Error sending global notification:", error);
      res.status(500).json({ error: "Failed to send global notification" });
    }
  }

  // Reports Endpoints

  static async getPlatformUsageStats(req: AdminRequest, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      // User registration stats
      const userStats = await this.getUserRegistrationStats(
        startDate as string,
        endDate as string,
      );

      // Trading activity stats
      let tradingStats = null;
      try {
        const response = await axios.get(
          `${this.TRADING_ENGINE_URL}/performance`,
        );
        tradingStats = response.data;
      } catch (engineError) {
        console.warn("Could not fetch trading stats:", engineError);
      }

      res.json({
        period: { startDate, endDate },
        userStats,
        tradingStats,
      });
    } catch (error: any) {
      console.error("Error fetching platform usage stats:", error);
      res.status(500).json({ error: "Failed to fetch platform usage stats" });
    }
  }

  static async getUserTradingPatterns(req: AdminRequest, res: Response) {
    try {
      // Get trading patterns from engine
      let patterns = null;
      try {
        const response = await axios.get(
          `${this.TRADING_ENGINE_URL}/performance`,
        );
        patterns = response.data;
      } catch (engineError) {
        console.warn("Could not fetch trading patterns:", engineError);
      }

      // Get user activity patterns
      const userActivity = await this.getUserActivityPatterns();

      res.json({
        tradingPatterns: patterns,
        userActivity,
      });
    } catch (error: any) {
      console.error("Error fetching user trading patterns:", error);
      res.status(500).json({ error: "Failed to fetch user trading patterns" });
    }
  }

  static async getRevenueSimulationReport(req: AdminRequest, res: Response) {
    try {
      // Simulate revenue based on trading activity
      let tradingData = null;
      try {
        const response = await axios.get(
          `${this.TRADING_ENGINE_URL}/performance`,
        );
        tradingData = response.data;
      } catch (engineError) {
        console.warn("Could not fetch trading data:", engineError);
      }

      // Calculate simulated revenue (commission-based)
      const commissionRate = 0.001; // 0.1% commission
      const totalVolume = tradingData?.trading_stats?.total_realized_pnl || 0;
      const estimatedRevenue = Math.abs(totalVolume) * commissionRate;

      const report = {
        period: "Current simulation",
        totalTradingVolume: totalVolume,
        commissionRate: commissionRate * 100 + "%",
        estimatedRevenue: estimatedRevenue,
        assumptions: [
          "Commission rate: 0.1% per trade",
          "Based on realized P&L as proxy for volume",
          "Demo trading simulation",
        ],
      };

      res.json(report);
    } catch (error: any) {
      console.error("Error generating revenue simulation report:", error);
      res
        .status(500)
        .json({ error: "Failed to generate revenue simulation report" });
    }
  }

  // Helper methods

  private static async getUserRegistrationStats(
    startDate?: string,
    endDate?: string,
  ) {
    const whereClause: any = {};

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
      if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
    }

    const totalRegistrations = await User.count({ where: whereClause });
    const verifiedUsers = await User.count({
      where: { ...whereClause, isVerified: true },
    });
    const activeUsers = await User.count({
      where: { ...whereClause, isActive: true },
    });

    return {
      totalRegistrations,
      verifiedUsers,
      activeUsers,
      verificationRate:
        totalRegistrations > 0 ? (verifiedUsers / totalRegistrations) * 100 : 0,
    };
  }

  private static async getUserActivityPatterns() {
    // Get users with recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = await User.count({
      where: {
        lastLoginAt: { [Op.gte]: thirtyDaysAgo },
      },
    });

    const totalUsers = await User.count();

    return {
      activeUsersLast30Days: activeUsers,
      totalUsers,
      activityRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
    };
  }
}
