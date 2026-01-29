import User from "../models/User";

export class AdminService {
  static async getAllUsers() {
    return await User.find({}, "-password");
  }

  static async deleteUser(userId: string) {
    return await User.findByIdAndDelete(userId);
  }

  static async getSystemStats() {
    // Placeholder for system stats
    return {
      totalUsers: await User.countDocuments(),
      totalTrades: 0,
      totalOrders: 0,
    };
  }
}
