# Drip Irrigation Shop Management System

A production-ready shop management system for a Maharashtra-based drip
irrigation / agricultural supplies shop — customers, products, government
subsidy rates, quotations, tax invoices, payments, reports, and PDF
generation — built to deploy on **Vercel** with **Neon PostgreSQL**.

## Stack

- **Frontend:** React + TypeScript + Vite, React Router, Tailwind CSS,
  shadcn-style UI primitives, TanStack Query, React Hook Form + Zod
- **Backend:** Node.js + Express (TypeScript), REST API, deployed as a
  single Vercel serverless function (`api/index.ts`) — no `app.listen()`
  in production, no Docker/PM2/VPS required
- **Database:** Neon PostgreSQL via `@neondatabase/serverless` +
  Prisma's Neon driver adapter (works over HTTP/WebSocket, no persistent
  TCP pool needed — serverless-safe)
- **PDF:** `@react-pdf/renderer` — pure JS PDF rendering, no headless
  Chromium/Puppeteer, so it runs fine inside a Vercel function
- **Auth:** JWT access tokens + HttpOnly-cookie refresh tokens, bcrypt
  password hashing, role-based access control (OWNER / ADMIN / STAFF)

## Project layout

```
/api/index.ts          Vercel serverless entry point (wraps the Express app)
/src/server             Express backend
  app.ts                App factory (no listen())
  dev-server.ts          Local dev entry point (calls listen())
  routes/ controllers/ services/ middleware/ validators/ db/ pdf/ utils/
  __tests__/            Vitest unit tests (subsidy/GST calculation)
/src/client             React frontend (Vite root is project root, source in src/client)
  pages/ components/ context/ i18n/ lib/
/src/shared             Types shared between client and server
/prisma/schema.prisma   Database schema (PostgreSQL, UUID PKs)
/prisma/seed.ts         Seed data: shop settings, owner login, sample products, a scheme
```

## Local development

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Neon Postgres database** at https://neon.tech, copy its
   connection string.

3. **Configure environment**

   ```bash
   cp .env.example .env
   # then edit .env — set DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET
   ```

   Generate strong secrets, e.g.:

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

4. **Run migrations and seed data**

   ```bash
   npx prisma migrate dev --name init
   npm run prisma:seed
   ```

   The seed script creates a default login:

   ```
   username: owner
   password: ChangeMe123!
   ```

   **Change this password immediately** (create a new OWNER/ADMIN user
   from the Users page and deactivate the seed account, or update its
   password directly).

5. **Run the app** (frontend + API together)

   ```bash
   npm run dev
   ```

   Frontend: http://localhost:5173 (proxies `/api` to the Express dev
   server on port 8787).

6. **Run tests**

   ```bash
   npm test
   ```

   Covers the subsidy-calculation and GST-split service — the module
   responsible for every financial figure on a quotation.

## Deploying to Vercel

1. Push this project to a GitHub repository.
2. Import the repo in Vercel.
3. Set environment variables in the Vercel project settings (Production
   + Preview): `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`,
   `CORS_ORIGIN` (your deployed URL), `NODE_ENV=production`. Never commit
   `.env` — `DATABASE_URL` is only ever read server-side and is never
   sent to the browser.
4. Vercel will run `npm run build:web && npx prisma generate` (see
   `vercel.json`) and deploy `api/index.ts` as a serverless function
   handling all `/api/*` routes, with the built frontend served as static
   files and client-side routes falling back to `index.html`.
5. Run migrations against the production database once, from your
   machine or CI: `DATABASE_URL=<prod-url> npx prisma migrate deploy`,
   then optionally `npm run prisma:seed` for initial shop settings and
   the first OWNER login.

`vercel.json` already routes `/api/*` to the Express app and everything
else to the SPA, and pins the function's memory/duration for PDF
generation.

## Key design notes

- **Server-authoritative totals.** The frontend's live quotation preview
  is a UX convenience only. `POST/PUT /api/quotations` always recomputes
  item amounts, subtotal, GST, subsidy split, and grand total from the
  raw item data server-side — client-submitted totals are never trusted
  or stored directly (`src/server/controllers/quotations.controller.ts`,
  `src/server/services/subsidy.service.ts`).
- **Subsidy calculation** respects a scheme's `maximumEligibleQuantity`
  cap instead of blindly applying `total × subsidy%` — see
  `calculateSubsidy` and its unit tests.
- **Payments** are hard-capped at the invoice balance; `paidAmount` /
  `balanceAmount` / `paymentStatus` are always derived, never trusted
  from the client.
- **Privacy:** Aadhaar and bank account numbers are stored as last-4
  digits only (`aadhaarLast4`, `accountLast4`); sensitive fields are
  redacted before anything is logged (`middleware/errorHandler.ts`).
- **RBAC** is enforced on every API route (`middleware/auth.ts`), not
  just hidden in the UI.
- **i18n:** `src/client/i18n/en.ts` and `mr.ts` hold UI strings; the
  language switch persists to `localStorage`. Add new keys to `en.ts`
  first (source of truth for the `TranslationKeys` type), then `mr.ts`.
- **PDF layout** is isolated in `src/server/pdf/*.tsx` so the rendering
  engine can be swapped later without touching business logic. Layouts
  follow the quotation/invoice structure from the spec (header, customer
  block, item table, totals, subsidy box, terms & signature) — no
  branding, signatures, or stamps were copied from any reference
  document.

## What's here vs. what to extend

This is a complete, working implementation of every module in the spec
(customers, products, categories, government rates, quotations,
invoices, payments, reports, users, settings, audit log, PDF, WhatsApp
share, English/Marathi i18n). A few things worth doing before go-live:

- Add an **Audit Log viewer page** in the UI (the backend already
  records every action — see `middleware/audit.ts` and the `audit_logs`
  table — but there's no dedicated screen to browse it yet).
- Add **stock quantity editing** in the product form if you plan to
  track inventory (the `stockQty` column exists per the spec's
  "prepare for later" instruction, but isn't yet wired into the UI).
- Consider code-splitting the frontend bundle (currently one ~230KB
  gzipped chunk) if load time on shop-floor devices matters.
- Rotate the seed OWNER password before go-live.
