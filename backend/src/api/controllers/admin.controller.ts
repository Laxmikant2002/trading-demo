import { Request, Response } from "express";
import User from "../../models/User";

export class AdminController {
  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await User.find({}, "-password");
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  }
}
