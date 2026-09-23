import { Router } from "express";
import * as ctrl from "@server/controllers/settings.controller";
import { requireAuth, requirePermission } from "@server/middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/shop", ctrl.get);
router.put("/shop", requirePermission("settings:write"), ctrl.update);

export default router;
