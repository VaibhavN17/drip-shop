import { Router } from "express";
import * as ctrl from "@server/controllers/products.controller";
import { requireAuth, requirePermission } from "@server/middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/", requirePermission("products:read"), ctrl.list);
router.get("/:id", requirePermission("products:read"), ctrl.getById);
router.post("/", requirePermission("products:write"), ctrl.create);
router.put("/:id", requirePermission("products:write"), ctrl.update);
router.delete("/:id", requirePermission("products:delete"), ctrl.remove);

export default router;
