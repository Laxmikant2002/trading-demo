import crypto from "crypto";
import { Op } from "sequelize";
import User, { IUser } from "../models/User";
import RefreshToken from "../models/RefreshToken";
import { generateTokenPair, TokenPayload } from "../utils/jwt";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/email";

export class AuthService {
  static async createUser(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<IUser> {
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      ...userData,
      verificationToken,
    });

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    return user;
  }

  static async authenticateUser(
    email: string,
    password: string,
  ): Promise<IUser | null> {
    const user = await User.findOne({ where: { email } });
    if (!user || !user.password) return null;

    const isValidPassword = await user.checkPassword(password);
    if (!isValidPassword) return null;

    if (!user.isVerified) {
      throw new Error("Please verify your email before logging in");
    }

    return user;
  }

  static async generateTokens(user: IUser) {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
    };

    const { accessToken, refreshToken } = generateTokenPair(payload);

    // Store refresh token
    await RefreshToken.create({
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return { accessToken, refreshToken };
  }

  static async refreshAccessToken(refreshToken: string) {
    const tokenRecord = await RefreshToken.findOne({
      where: { token: refreshToken },
      include: [{ model: User, as: "user" }],
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new Error("Invalid or expired refresh token");
    }

    const user = tokenRecord.user!;
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
    };

    const newAccessToken = generateTokenPair(payload).accessToken;

    return { accessToken: newAccessToken };
  }

  static async revokeRefreshToken(refreshToken: string): Promise<void> {
    await RefreshToken.destroy({ where: { token: refreshToken } });
  }

  static async verifyEmail(token: string): Promise<IUser | null> {
    const user = await User.findOne({ where: { verificationToken: token } });
    if (!user) return null;

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return user;
  }

  static async initiatePasswordReset(email: string): Promise<boolean> {
    const user = await User.findOne({ where: { email } });
    if (!user) return false;

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    await sendPasswordResetEmail(email, resetToken);
    return true;
  }

  static async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<IUser | null> {
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!user) return null;

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Revoke all refresh tokens for security
    await RefreshToken.destroy({ where: { userId: user.id } });

    return user;
  }

  static async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> {
    const user = await User.findByPk(userId);
    if (!user || !user.password) return false;

    const isValidPassword = await user.checkPassword(currentPassword);
    if (!isValidPassword) return false;

    user.password = newPassword;
    await user.save();

    // Revoke all refresh tokens
    await RefreshToken.destroy({ where: { userId } });

    return true;
  }

  static async createOAuthUser(profile: any): Promise<IUser> {
    const user = await User.create({
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      googleId: profile.id,
      avatar: profile.photos[0].value,
      isVerified: true,
    });

    return user;
  }

  static async findOrCreateOAuthUser(profile: any): Promise<IUser> {
    let user = await User.findOne({ where: { googleId: profile.id } });

    if (!user) {
      user = await this.createOAuthUser(profile);
    }

    return user;
  }
}
