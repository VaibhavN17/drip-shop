import { Router } from "express";
import * as ctrl from "@server/controllers/categories.controller";
import { requireAuth, requirePermission } from "@server/middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/", requirePermission("categories:read"), ctrl.list);
router.post("/", requirePermission("categories:write"), ctrl.create);
router.put("/:id", requirePermission("categories:write"), ctrl.update);
router.delete("/:id", requirePermission("categories:delete"), ctrl.remove);

export default router;
