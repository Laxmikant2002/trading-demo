import { Router } from "express";
import { TradingController } from "../controllers/trading.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// All trading routes require authentication
router.use(authMiddleware);

// Market orders
router.post("/market", async (req, res) => {
  await TradingController.placeMarketOrder(req as any, res);
});

// Limit orders
router.post("/limit", async (req, res) => {
  await TradingController.placeLimitOrder(req as any, res);
});

// Stop loss orders
router.post("/stop-loss", async (req, res) => {
  await TradingController.setStopLoss(req as any, res);
});

// Take profit orders
router.post("/take-profit", async (req, res) => {
  await TradingController.setTakeProfit(req as any, res);
});

// Get orders
router.get("/orders", async (req, res) => {
  await TradingController.getOrders(req as any, res);
});

// Get positions
router.get("/positions", async (req, res) => {
  await TradingController.getPositions(req as any, res);
});

// Get portfolio
router.get("/portfolio", async (req, res) => {
  await TradingController.getPortfolio(req as any, res);
});

export default router;
