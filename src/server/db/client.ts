import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
// @ts-ignore
import ws from "ws";

if (typeof WebSocket === "undefined") {
  try {
    neonConfig.webSocketConstructor = ws;
  } catch (e) {
    // ws is optional in serverless environments with native fetch/WebSocket
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const DEFAULT_DB_URL = "postgresql://neondb_owner:npg_b7cDOlvBhYw5@ep-late-heart-b5go9m9x-pooler.c-7.us-east-2.aws.neon.tech/dripshop?sslmode=require&channel_binding=require";

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL || DEFAULT_DB_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({ adapter });
}

// Reuse the client across hot reloads / serverless invocations on the same
// warm lambda instance, so we don't exhaust Neon connections.
export const prisma = globalThis.__prisma ?? createClient();
if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
