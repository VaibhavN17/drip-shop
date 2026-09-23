import { Router } from "express";
import * as ctrl from "@server/controllers/reports.controller";
import { requireAuth, requirePermission } from "@server/middleware/auth";

const router = Router();
router.use(requireAuth, requirePermission("reports:read"));

router.get("/dashboard", ctrl.dashboard);
router.get("/sales", ctrl.sales);
router.get("/customers", ctrl.customerPurchases);
router.get("/outstanding", ctrl.outstanding);

export default router;
