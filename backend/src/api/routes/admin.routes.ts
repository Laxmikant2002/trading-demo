import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);
// TODO: Add admin role check middleware
router.get("/users", AdminController.getAllUsers);
router.delete("/users/:id", AdminController.deleteUser);

export default router;
