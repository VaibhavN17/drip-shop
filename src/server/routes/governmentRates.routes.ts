import { Router } from "express";
import * as ctrl from "@server/controllers/governmentRates.controller";
import { requireAuth, requirePermission } from "@server/middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/schemes", requirePermission("government-rates:read"), ctrl.listSchemes);
router.post("/schemes", requirePermission("government-rates:write"), ctrl.createScheme);
router.put("/schemes/:id", requirePermission("government-rates:write"), ctrl.updateScheme);

router.get("/", requirePermission("government-rates:read"), ctrl.listRates);
router.post("/", requirePermission("government-rates:write"), ctrl.createRate);
router.put("/:id", requirePermission("government-rates:write"), ctrl.updateRate);
router.delete("/:id", requirePermission("government-rates:delete"), ctrl.removeRate);

export default router;
