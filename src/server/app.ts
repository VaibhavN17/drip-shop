import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

/**
 * Builds the Express app. Exported as a plain app (no app.listen here) so it
 * can be wrapped for Vercel's serverless runtime (api/index.ts) as well as
 * driven by a local dev entry point (dev-server.ts) that DOES call listen().
 */
export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN?.split(",") ?? true,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(cookieParser());

  const apiLimiter = rateLimit({ windowMs: 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false });
  app.use("/api", apiLimiter);
  app.use("/api", routes);
  app.use(routes);

  app.use("/api", notFoundHandler);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
