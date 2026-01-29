import { Request, Response } from "express";
import { AuthService } from "../../services/auth.service";
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
} from "../../validators/auth.validators";

interface AuthRequest extends Request {
  user?: { userId: number; email: string };
}

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const userData: RegisterInput = req.body;
      const user = await AuthService.createUser(userData);

      res.status(201).json({
        message:
          "User registered successfully. Please check your email to verify your account.",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error: any) {
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({ error: "Email already exists" });
      }
      res.status(500).json({ error: "Registration failed" });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password }: LoginInput = req.body;
      const user = await AuthService.authenticateUser(email, password);

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const tokens = await AuthService.generateTokens(user);

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        ...tokens,
      });
    } catch (error: any) {
      res.status(401).json({ error: error.message || "Login failed" });
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: "Refresh token is required" });
      }

      const tokens = await AuthService.refreshAccessToken(refreshToken);
      res.json(tokens);
    } catch (error: any) {
      res.status(401).json({ error: error.message || "Invalid refresh token" });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        await AuthService.revokeRefreshToken(refreshToken);
      }

      res.json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ error: "Logout failed" });
    }
  }

  static async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const user = await AuthService.verifyEmail(token);

      if (!user) {
        return res
          .status(400)
          .json({ error: "Invalid or expired verification token" });
      }

      res.json({ message: "Email verified successfully" });
    } catch (error) {
      res.status(500).json({ error: "Email verification failed" });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email }: ForgotPasswordInput = req.body;
      const success = await AuthService.initiatePasswordReset(email);

      // Always return success for security
      res.json({
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    } catch (error) {
      res.status(500).json({ error: "Password reset request failed" });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, password }: ResetPasswordInput = req.body;
      const user = await AuthService.resetPassword(token, password);

      if (!user) {
        return res
          .status(400)
          .json({ error: "Invalid or expired reset token" });
      }

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      res.status(500).json({ error: "Password reset failed" });
    }
  }

  static async changePassword(req: Request, res: Response) {
    try {
      const { currentPassword, newPassword }: ChangePasswordInput = req.body;
      const success = await AuthService.changePassword(
        (req as AuthRequest).user!.userId,
        currentPassword,
        newPassword,
      );

      if (!success) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      res.status(500).json({ error: "Password change failed" });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      // User data is already in req.user from JWT middleware
      res.json({ user: (req as AuthRequest).user });
    } catch (error) {
      res.status(500).json({ error: "Failed to get profile" });
    }
  }
}
