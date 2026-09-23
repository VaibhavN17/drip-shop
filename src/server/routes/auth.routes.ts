import { Router } from "express";
import * as ctrl from "@server/controllers/auth.controller";
import { requireAuth } from "@server/middleware/auth";
import rateLimit from "express-rate-limit";

const router = Router();

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });

router.post("/login", loginLimiter, ctrl.login);
router.post("/refresh", ctrl.refresh);
router.post("/logout", ctrl.logout);
router.get("/me", requireAuth, ctrl.me);

export default router;
