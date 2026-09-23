import { createApp } from "../src/server/app";

// Vercel serverless entry point. IMPORTANT: no app.listen() here — Vercel
// invokes the exported Express app directly as a request handler for every
// request under /api/*. Local development uses src/server/dev-server.ts
// (which does call app.listen()) instead.
const app = createApp();

export default app;
