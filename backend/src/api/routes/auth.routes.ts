import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from "../../services/auth.service";
import { authMiddleware } from "../middleware/auth.middleware";
import { authRateLimit } from "../middleware/rateLimit.middleware";
import { validateRequest } from "../../middleware/validation.middleware";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "../../validators/auth.validators";
import passport from "../../config/passport";

const router = Router();

// Public routes with rate limiting
router.post(
  "/register",
  authRateLimit,
  validateRequest(registerSchema),
  AuthController.register,
);
router.post(
  "/login",
  authRateLimit,
  validateRequest(loginSchema),
  AuthController.login,
);
router.post("/refresh-token", AuthController.refreshToken);
router.post(
  "/forgot-password",
  authRateLimit,
  validateRequest(forgotPasswordSchema),
  AuthController.forgotPassword,
);
router.post(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  AuthController.resetPassword,
);

// Email verification
router.get("/verify-email/:token", AuthController.verifyEmail);

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    // Generate tokens for OAuth user
    const user = req.user as any;
    const tokens = await AuthService.generateTokens(user);

    // Redirect to frontend with tokens
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`;
    res.redirect(redirectUrl);
  },
);

// Protected routes
router.use(authMiddleware);
router.post("/logout", AuthController.logout);
router.post(
  "/change-password",
  validateRequest(changePasswordSchema),
  AuthController.changePassword,
);
router.get("/profile", AuthController.getProfile);

export default router;
