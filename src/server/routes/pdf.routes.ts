import { Router } from "express";
import * as ctrl from "@server/controllers/pdf.controller";
import { requireAuth, requirePermission } from "@server/middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/quotations/:id", requirePermission("quotations:read"), ctrl.quotationPdf);
router.get("/invoices/:id", requirePermission("invoices:read"), ctrl.invoicePdf);

export default router;
