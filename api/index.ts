import { createApp } from "../src/server/app";

let app: any;

export default function handler(req: any, res: any) {
  try {
    if (!app) {
      app = createApp();
    }
    return app(req, res);
  } catch (err: any) {
    console.error("Vercel Serverless Invocation Error:", err);
    return res.status(500).json({
      error: "SERVERLESS_ERROR",
      message: err?.message || String(err),
      stack: err?.stack,
    });
  }
}
