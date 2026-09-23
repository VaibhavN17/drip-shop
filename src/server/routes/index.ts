import { Router } from "express";
import authRoutes from "./auth.routes";
import customerRoutes from "./customers.routes";
import productRoutes from "./products.routes";
import categoryRoutes from "./categories.routes";
import governmentRateRoutes from "./governmentRates.routes";
import quotationRoutes from "./quotations.routes";
import invoiceRoutes from "./invoices.routes";
import reportRoutes from "./reports.routes";
import settingsRoutes from "./settings.routes";
import userRoutes from "./users.routes";
import pdfRoutes from "./pdf.routes";

const router = Router();

router.get("/health", (_req, res) => res.json({ success: true, data: { status: "ok", time: new Date().toISOString() } }));

router.use("/auth", authRoutes);
router.use("/customers", customerRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/government-rates", governmentRateRoutes);
router.use("/quotations", quotationRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/reports", reportRoutes);
router.use("/settings", settingsRoutes);
router.use("/users", userRoutes);
router.use("/pdf", pdfRoutes);

export default router;
