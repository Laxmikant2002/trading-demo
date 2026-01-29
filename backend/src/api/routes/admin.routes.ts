import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use((req, res, next) =>
  AdminController.requireAdmin(req as any, res, next),
);

// User Management Routes
router.get("/users", async (req, res) => {
  await AdminController.getUsers(req as any, res);
});
router.get("/users/:userId", async (req, res) => {
  await AdminController.getUserDetails(req as any, res);
});
router.post("/users/:userId/reset-balance", async (req, res) => {
  await AdminController.resetUserBalance(req as any, res);
});
router.patch("/users/:userId/status", async (req, res) => {
  await AdminController.toggleUserStatus(req as any, res);
});

// System Control Routes
router.get("/assets", async (req, res) => {
  await AdminController.getTradableAssets(req as any, res);
});
router.post("/assets", async (req, res) => {
  await AdminController.addTradableAsset(req as any, res);
});
router.delete("/assets/:symbol", async (req, res) => {
  await AdminController.removeTradableAsset(req as any, res);
});
router.post("/prices/adjust", async (req, res) => {
  await AdminController.adjustSimulatedPrice(req as any, res);
});
router.get("/metrics", async (req, res) => {
  await AdminController.getSystemMetrics(req as any, res);
});
router.post("/notifications/global", async (req, res) => {
  await AdminController.sendGlobalNotification(req as any, res);
});

// Reports Routes
router.get("/reports/usage", async (req, res) => {
  await AdminController.getPlatformUsageStats(req as any, res);
});
router.get("/reports/trading-patterns", async (req, res) => {
  await AdminController.getUserTradingPatterns(req as any, res);
});
router.get("/reports/revenue", async (req, res) => {
  await AdminController.getRevenueSimulationReport(req as any, res);
});

export default router;
