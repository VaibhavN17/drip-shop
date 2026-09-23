import { prisma } from "@server/db/client";
import type { AuthedRequest } from "@server/middleware/auth";

/**
 * Write an audit log entry. Never pass sensitive fields (passwords, tokens,
 * full Aadhaar/account numbers) in `metadata` — only non-sensitive context
 * like counts, IDs, or status transitions.
 */
export async function audit(
  req: AuthedRequest,
  action: string,
  entity: string,
  entityId?: string,
  metadata?: Record<string, unknown>
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action,
        entity,
        entityId,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
        ipAddress: req.ip,
      },
    });
  } catch (e) {
    // Audit logging must never break the primary request flow.
    console.error("Failed to write audit log", e);
  }
}
