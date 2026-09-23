import type { Response, NextFunction } from "express";
import { prisma } from "@server/db/client";
import { shopSettingsSchema } from "@server/validators/schemas";
import { ok } from "@server/utils/response";
import { audit } from "@server/middleware/audit";
import type { AuthedRequest } from "@server/middleware/auth";

export async function get(_req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const settings = await prisma.shopSettings.findFirst();
    return ok(res, settings ?? null);
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const data = shopSettingsSchema.partial().parse(req.body);
    const existing = await prisma.shopSettings.findFirst();

    const row = existing
      ? await prisma.shopSettings.update({ where: { id: existing.id }, data })
      : await prisma.shopSettings.create({ data: { shopName: data.shopName ?? "My Shop", ...data } });

    await audit(req, "settings_changed", "shop_settings", row.id);
    return ok(res, row);
  } catch (err) {
    next(err);
  }
}
