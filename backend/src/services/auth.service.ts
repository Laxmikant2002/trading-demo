import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";

export class AuthService {
  static async createUser(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    return await user.save();
  }

  static async authenticateUser(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid credentials");
    }
    return user;
  }

  static generateToken(userId: string) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET || "secret");
  }
}
