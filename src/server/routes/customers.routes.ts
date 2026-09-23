import { Router } from "express";
import * as ctrl from "@server/controllers/customers.controller";
import { requireAuth, requirePermission } from "@server/middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/", requirePermission("customers:read"), ctrl.list);
router.get("/:id", requirePermission("customers:read"), ctrl.getById);
router.post("/", requirePermission("customers:write"), ctrl.create);
router.put("/:id", requirePermission("customers:write"), ctrl.update);
router.delete("/:id", requirePermission("customers:delete"), ctrl.remove);

export default router;
