import { Router } from "express";
import { MarketDataController } from "../controllers/marketData.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Public routes for market data
router.get("/", MarketDataController.getMarketData);
router.get("/:symbol", MarketDataController.getMarketData);
router.get("/:symbol/history", MarketDataController.getHistoricalData);

// Admin route to trigger manual update
router.post("/update", authMiddleware, MarketDataController.triggerUpdate);

export default router;
