import { Router } from "express";
import * as invCtrl from "@server/controllers/invoices.controller";
import * as payCtrl from "@server/controllers/payments.controller";
import { requireAuth, requirePermission } from "@server/middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/", requirePermission("invoices:read"), invCtrl.list);
router.post("/", requirePermission("invoices:write"), invCtrl.create);
router.get("/:id", requirePermission("invoices:read"), invCtrl.getById);
router.put("/:id", requirePermission("invoices:write"), invCtrl.update);

router.get("/:invoiceId/payments", requirePermission("payments:read"), payCtrl.listForInvoice);
router.post("/:invoiceId/payments", requirePermission("payments:write"), payCtrl.create);

export default router;
