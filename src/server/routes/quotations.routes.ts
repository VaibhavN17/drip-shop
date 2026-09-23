import { Router } from "express";
import * as ctrl from "@server/controllers/quotations.controller";
import { requireAuth, requirePermission } from "@server/middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/", requirePermission("quotations:read"), ctrl.list);
router.get("/:id", requirePermission("quotations:read"), ctrl.getById);
router.post("/", requirePermission("quotations:write"), ctrl.create);
router.put("/:id", requirePermission("quotations:write"), ctrl.update);
router.patch("/:id/status", requirePermission("quotations:write"), ctrl.updateStatus);
router.delete("/:id", requirePermission("quotations:delete"), ctrl.remove);
router.post("/:id/duplicate", requirePermission("quotations:write"), ctrl.duplicate);
router.post("/:id/convert-to-invoice", requirePermission("invoices:write"), ctrl.convertToInvoice);

export default router;
