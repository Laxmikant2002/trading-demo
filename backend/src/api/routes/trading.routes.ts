import { Router } from "express";
import { TradingController } from "../controllers/trading.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);
router.post("/orders", TradingController.placeOrder);
router.get("/orders", TradingController.getOrders);
router.get("/trades", TradingController.getTrades);

export default router;
