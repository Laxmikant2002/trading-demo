import { Router } from "express";
import { MarketController } from "../controllers/market.controller";

const router = Router();

router.get("/data/:symbol", MarketController.getMarketData);
router.get("/symbols", MarketController.getAllSymbols);

export default router;
