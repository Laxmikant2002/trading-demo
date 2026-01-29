import User from "../models/User";

export class AdminService {
  static async getAllUsers() {
    return await User.findAll({
      attributes: { exclude: ["password"] },
    });
  }

  static async deleteUser(userId: string) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }
    await user.destroy();
    return user;
  }

  static async getSystemStats() {
    // Placeholder for system stats
    return {
      totalUsers: await User.count(),
      totalTrades: 0,
      totalOrders: 0,
    };
  }
}
