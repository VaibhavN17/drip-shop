import { Router } from "express";
import * as ctrl from "@server/controllers/users.controller";
import { requireAuth, requireRole } from "@server/middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/", requireRole("OWNER", "ADMIN"), ctrl.list);
router.post("/", requireRole("OWNER", "ADMIN"), ctrl.create);
router.patch("/:id/deactivate", requireRole("OWNER", "ADMIN"), ctrl.deactivate);

export default router;
