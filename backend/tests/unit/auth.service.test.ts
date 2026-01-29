import { AuthService } from "../../src/services/auth.service";
import User from "../../src/models/User";
import RefreshToken from "../../src/models/RefreshToken";
import { generateTokenPair } from "../../src/utils/jwt";
import { Op } from "sequelize";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../../src/utils/email";

// Mock dependencies
jest.mock("../../src/models/User");
jest.mock("../../src/models/RefreshToken");
jest.mock("../../src/utils/email");

const mockUser = User as jest.Mocked<typeof User>;
const mockRefreshToken = RefreshToken as jest.Mocked<typeof RefreshToken>;
const mockSendVerificationEmail = sendVerificationEmail as jest.Mock;
const mockSendPasswordResetEmail = sendPasswordResetEmail as jest.Mock;

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    it("should create a user and send verification email", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
      };

      const mockCreatedUser = {
        id: 1,
        ...userData,
        verificationToken: "mock-token",
      };

      mockUser.create.mockResolvedValue(mockCreatedUser as any);

      const result = await AuthService.createUser(userData);

      expect(mockUser.create).toHaveBeenCalledWith({
        ...userData,
        verificationToken: expect.any(String),
      });
      expect(mockSendVerificationEmail).toHaveBeenCalledWith(
        userData.email,
        expect.any(String),
      );
      expect(result).toEqual(mockCreatedUser);
    });

    it("should throw error if user creation fails", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
      };

      mockUser.create.mockRejectedValue(new Error("Database error"));

      await expect(AuthService.createUser(userData)).rejects.toThrow(
        "Database error",
      );
    });
  });

  describe("authenticateUser", () => {
    it("should authenticate valid user", async () => {
      const email = "test@example.com";
      const password = "password123";

      const mockUserInstance = {
        id: 1,
        email,
        password: "hashed-password",
        isVerified: true,
        checkPassword: jest.fn().mockResolvedValue(true),
      };

      mockUser.findOne.mockResolvedValue(mockUserInstance as any);

      const result = await AuthService.authenticateUser(email, password);

      expect(mockUser.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(mockUserInstance.checkPassword).toHaveBeenCalledWith(password);
      expect(result).toEqual(mockUserInstance);
    });

    it("should return null for non-existent user", async () => {
      mockUser.findOne.mockResolvedValue(null);

      const result = await AuthService.authenticateUser(
        "nonexistent@example.com",
        "password",
      );

      expect(result).toBeNull();
    });

    it("should return null for invalid password", async () => {
      const mockUserInstance = {
        id: 1,
        email: "test@example.com",
        password: "hashed-password",
        checkPassword: jest.fn().mockResolvedValue(false),
      };

      mockUser.findOne.mockResolvedValue(mockUserInstance as any);

      const result = await AuthService.authenticateUser(
        "test@example.com",
        "wrongpassword",
      );

      expect(result).toBeNull();
    });

    it("should throw error for unverified user", async () => {
      const mockUserInstance = {
        id: 1,
        email: "test@example.com",
        password: "hashed-password",
        isVerified: false,
        checkPassword: jest.fn().mockResolvedValue(true),
      };

      mockUser.findOne.mockResolvedValue(mockUserInstance as any);

      await expect(
        AuthService.authenticateUser("test@example.com", "password"),
      ).rejects.toThrow("Please verify your email before logging in");
    });
  });

  describe("generateTokens", () => {
    it("should generate token pair", async () => {
      const user = {
        id: 1,
        email: "test@example.com",
        role: "user",
      };

      mockRefreshToken.create.mockResolvedValue({} as any);

      const result = await AuthService.generateTokens(user as any);

      expect(mockRefreshToken.create).toHaveBeenCalledWith({
        token: expect.any(String),
        userId: user.id,
        expiresAt: expect.any(Date),
      });
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(typeof result.accessToken).toBe("string");
      expect(typeof result.refreshToken).toBe("string");
    });
  });

  describe("verifyEmail", () => {
    it("should verify user email", async () => {
      const token = "verification-token";
      const mockUserInstance = {
        id: 1,
        email: "test@example.com",
        isVerified: false,
        save: jest.fn().mockResolvedValue(true),
      };

      mockUser.findOne.mockResolvedValue(mockUserInstance as any);

      const result = await AuthService.verifyEmail(token);

      expect(mockUser.findOne).toHaveBeenCalledWith({
        where: { verificationToken: token },
      });
      expect(mockUserInstance.save).toHaveBeenCalled();
      expect(result).toEqual(mockUserInstance);
    });

    it("should return null for invalid token", async () => {
      mockUser.findOne.mockResolvedValue(null);

      const result = await AuthService.verifyEmail("invalid-token");

      expect(result).toBeNull();
    });
  });

  describe("initiatePasswordReset", () => {
    it("should initiate password reset", async () => {
      const email = "test@example.com";
      const mockUserInstance = {
        id: 1,
        email,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        save: jest.fn().mockResolvedValue(true),
      };

      mockUser.findOne.mockResolvedValue(mockUserInstance as any);

      const result = await AuthService.initiatePasswordReset(email);

      expect(mockUser.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(
        email,
        expect.any(String),
      );
      expect(mockUserInstance.save).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should return false for non-existent user", async () => {
      mockUser.findOne.mockResolvedValue(null);

      const result = await AuthService.initiatePasswordReset(
        "nonexistent@example.com",
      );

      expect(result).toBe(false);
    });
  });

  describe("resetPassword", () => {
    it("should reset password", async () => {
      const token = "reset-token";
      const newPassword = "newpassword123";
      const mockUserInstance = {
        id: 1,
        email: "test@example.com",
        resetPasswordToken: token,
        resetPasswordExpires: new Date(Date.now() + 3600000), // Future date
        password: "oldpassword",
        save: jest.fn().mockResolvedValue(true),
      };

      mockUser.findOne.mockResolvedValue(mockUserInstance as any);
      mockRefreshToken.destroy.mockResolvedValue(1);

      const result = await AuthService.resetPassword(token, newPassword);

      expect(mockUser.findOne).toHaveBeenCalledWith({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: {
            [Op.gt]: expect.any(Date),
          },
        },
      });
      expect(mockUserInstance.save).toHaveBeenCalled();
      expect(mockRefreshToken.destroy).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
      expect(result).toEqual(mockUserInstance);
    });

    it("should return null for invalid token", async () => {
      mockUser.findOne.mockResolvedValue(null);

      const result = await AuthService.resetPassword(
        "invalid-token",
        "newpassword",
      );

      expect(result).toBeNull();
    });
  });

  describe("changePassword", () => {
    it("should change password", async () => {
      const userId = 1;
      const currentPassword = "oldpassword";
      const newPassword = "newpassword";
      const mockUserInstance = {
        id: userId,
        password: "oldpassword",
        checkPassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
      };

      mockUser.findByPk.mockResolvedValue(mockUserInstance as any);
      mockRefreshToken.destroy.mockResolvedValue(1);

      const result = await AuthService.changePassword(
        userId,
        currentPassword,
        newPassword,
      );

      expect(mockUser.findByPk).toHaveBeenCalledWith(userId);
      expect(mockUserInstance.checkPassword).toHaveBeenCalledWith(
        currentPassword,
      );
      expect(mockUserInstance.save).toHaveBeenCalled();
      expect(mockRefreshToken.destroy).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result).toBe(true);
    });

    it("should return false for incorrect current password", async () => {
      const userId = 1;
      const mockUserInstance = {
        id: userId,
        checkPassword: jest.fn().mockResolvedValue(false),
      };

      mockUser.findByPk.mockResolvedValue(mockUserInstance as any);

      const result = await AuthService.changePassword(
        userId,
        "wrongpassword",
        "newpassword",
      );

      expect(result).toBe(false);
    });

    it("should return false for non-existent user", async () => {
      mockUser.findByPk.mockResolvedValue(null);

      const result = await AuthService.changePassword(
        999,
        "password",
        "newpassword",
      );

      expect(result).toBe(false);
    });
  });

  describe("refreshAccessToken", () => {
    it("should refresh access token", async () => {
      const refreshTokenString = "refresh-token";
      const mockRefreshTokenInstance = {
        id: 1,
        token: "hashed-token",
        userId: 1,
        expiresAt: new Date(Date.now() + 86400000), // Future date
        user: {
          id: 1,
          email: "test@example.com",
          role: "user",
        },
      };

      mockRefreshToken.findOne.mockResolvedValue(
        mockRefreshTokenInstance as any,
      );

      const result = await AuthService.refreshAccessToken(refreshTokenString);

      expect(mockRefreshToken.findOne).toHaveBeenCalledWith({
        where: { token: expect.any(String) },
        include: [{ model: User, as: "user" }],
      });
      expect(result).toHaveProperty("accessToken");
      expect(typeof result.accessToken).toBe("string");
    });

    it("should throw error for invalid refresh token", async () => {
      mockRefreshToken.findOne.mockResolvedValue(null);

      await expect(
        AuthService.refreshAccessToken("invalid-token"),
      ).rejects.toThrow("Invalid or expired refresh token");
    });

    it("should throw error for expired refresh token", async () => {
      const mockRefreshTokenInstance = {
        id: 1,
        token: "hashed-token",
        userId: 1,
        expiresAt: new Date(Date.now() - 3600000), // Past date
      };

      mockRefreshToken.findOne.mockResolvedValue(
        mockRefreshTokenInstance as any,
      );

      await expect(
        AuthService.refreshAccessToken("expired-token"),
      ).rejects.toThrow("Invalid or expired refresh token");
    });
  });

  describe("revokeRefreshToken", () => {
    it("should revoke refresh token", async () => {
      const refreshTokenString = "refresh-token";

      mockRefreshToken.destroy.mockResolvedValue(1);

      await AuthService.revokeRefreshToken(refreshTokenString);

      expect(mockRefreshToken.destroy).toHaveBeenCalledWith({
        where: { token: refreshTokenString },
      });
    });

    it("should not throw error for non-existent token", async () => {
      mockRefreshToken.destroy.mockResolvedValue(0);

      await expect(
        AuthService.revokeRefreshToken("nonexistent-token"),
      ).resolves.not.toThrow();

      expect(mockRefreshToken.destroy).toHaveBeenCalledWith({
        where: { token: "nonexistent-token" },
      });
    });
  });
});
