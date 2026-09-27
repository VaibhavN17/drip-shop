// src/server/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit2 from "express-rate-limit";

// src/server/routes/index.ts
import { Router as Router12 } from "express";

// src/server/routes/auth.routes.ts
import { Router } from "express";

// src/server/db/client.ts
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
if (typeof WebSocket === "undefined") {
  try {
    neonConfig.webSocketConstructor = ws;
  } catch (e) {
  }
}
var DEFAULT_DB_URL = "postgresql://neondb_owner:npg_b7cDOlvBhYw5@ep-late-heart-b5go9m9x-pooler.c-7.us-east-2.aws.neon.tech/dripshop?sslmode=require&channel_binding=require";
function createClient() {
  const connectionString = process.env.DATABASE_URL || DEFAULT_DB_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({ adapter });
}
var prisma = globalThis.__prisma ?? createClient();
if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}

// src/server/validators/schemas.ts
import { z } from "zod";
var loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});
var customerSchema = z.object({
  fullName: z.string().min(1),
  mobile: z.string().min(10).max(15),
  alternateMobile: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  village: z.string().optional().nullable(),
  taluka: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  state: z.string().default("Maharashtra"),
  pincode: z.string().optional().nullable(),
  aadhaarLast4: z.string().length(4).optional().nullable(),
  farmerId: z.string().optional().nullable(),
  surveyNumber: z.string().optional().nullable(),
  gatNumber: z.string().optional().nullable(),
  landArea: z.number().nonnegative().optional().nullable(),
  landAreaUnit: z.enum(["ACRE", "HECTARE", "GUNTHA"]).optional().nullable(),
  crop: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  accountLast4: z.string().length(4).optional().nullable(),
  notes: z.string().optional().nullable()
});
var productCategorySchema = z.object({
  name: z.string().min(1),
  nameMarathi: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0)
});
var productSchema = z.object({
  name: z.string().min(1),
  nameMarathi: z.string().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  description: z.string().optional().nullable(),
  unit: z.string().default("Nos"),
  hsnCode: z.string().optional().nullable(),
  gstRate: z.number().min(0).max(100).default(18),
  purchaseRate: z.number().nonnegative().optional().nullable(),
  sellingRate: z.number().nonnegative(),
  governmentRate: z.number().nonnegative().optional().nullable(),
  stockQty: z.number().optional().nullable(),
  isActive: z.boolean().default(true)
});
var governmentSchemeSchema = z.object({
  schemeName: z.string().min(1),
  financialYear: z.string().min(1),
  component: z.string().optional().nullable(),
  isActive: z.boolean().default(true)
});
var governmentRateSchema = z.object({
  schemeId: z.string().uuid(),
  productId: z.string().uuid().optional().nullable(),
  unit: z.string().min(1),
  governmentRate: z.number().nonnegative(),
  maximumEligibleQuantity: z.number().nonnegative().optional().nullable(),
  subsidyPercentage: z.number().min(0).max(100),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional().nullable(),
  isActive: z.boolean().default(true)
});
var quotationItemSchema = z.object({
  productId: z.string().uuid().optional().nullable(),
  description: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  governmentRate: z.number().nonnegative().optional().nullable(),
  sellingRate: z.number().nonnegative(),
  gstRate: z.number().min(0).max(100).default(5)
});
var inlineCustomerSchema = z.object({
  fullName: z.string().min(1),
  mobile: z.string().min(10).max(15),
  village: z.string().optional().nullable(),
  taluka: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  surveyNumber: z.string().optional().nullable(),
  gatNumber: z.string().optional().nullable(),
  aadhar: z.string().optional().nullable(),
  landArea: z.number().nonnegative().optional().nullable(),
  crop: z.string().optional().nullable(),
  spacing: z.string().optional().nullable()
});
var quotationSchema = z.object({
  customerId: z.string().uuid().optional().nullable(),
  customer: inlineCustomerSchema.optional().nullable(),
  quotationDate: z.coerce.date().optional(),
  validUntil: z.coerce.date().optional().nullable(),
  schemeId: z.string().uuid().optional().nullable(),
  subsidyPercentage: z.number().min(0).max(100).optional().nullable(),
  isSubsidyBased: z.boolean().default(false),
  landArea: z.number().nonnegative().optional().nullable(),
  spacing: z.string().optional().nullable(),
  crop: z.string().optional().nullable(),
  fileExpense: z.number().nonnegative().default(0),
  otherCharges: z.number().nonnegative().default(0),
  gstRate: z.number().min(0).max(100).default(5),
  notes: z.string().optional().nullable(),
  items: z.array(quotationItemSchema).min(1)
}).refine((data) => data.customerId || data.customer, {
  message: "Either customerId or customer details must be provided",
  path: ["customerId"]
});
var quotationStatusSchema = z.object({
  status: z.enum(["DRAFT", "SENT", "APPROVED", "REJECTED", "EXPIRED", "CONVERTED"])
});
var invoiceItemSchema = z.object({
  productId: z.string().uuid().optional().nullable(),
  description: z.string().min(1),
  hsnCode: z.string().optional().nullable(),
  batchNo: z.string().optional().nullable(),
  cmlNo: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  quantity: z.number().positive(),
  unit: z.string().min(1).default("Nos"),
  govRate: z.number().nonnegative().optional().nullable(),
  rate: z.number().nonnegative(),
  taxableValue: z.number().nonnegative().optional(),
  gstRate: z.number().min(0).max(100).default(5)
});
var invoiceCreateSchema = z.object({
  customerId: z.string().uuid().optional().nullable(),
  customer: inlineCustomerSchema.optional().nullable(),
  quotationId: z.string().uuid().optional().nullable(),
  invoiceDate: z.coerce.date().optional(),
  setType: z.string().optional().nullable(),
  // "तुषार" or "ठिबक"
  spacing: z.string().optional().nullable(),
  crop: z.string().optional().nullable(),
  shiwar: z.string().optional().nullable(),
  discount: z.number().nonnegative().default(0),
  installation: z.number().nonnegative().default(0),
  roundOff: z.number().default(0),
  gstRate: z.number().min(0).max(100).default(5),
  isInterstate: z.boolean().default(false),
  notes: z.string().optional().nullable(),
  items: z.array(invoiceItemSchema).min(1)
}).refine((data) => data.customerId || data.customer, {
  message: "Either customerId or customer details must be provided",
  path: ["customerId"]
});
var invoiceUpdateSchema = z.object({
  discount: z.number().nonnegative().optional(),
  isInterstate: z.boolean().optional(),
  notes: z.string().optional().nullable()
});
var paymentSchema = z.object({
  amount: z.number().positive(),
  paymentDate: z.coerce.date().optional(),
  paymentMethod: z.enum(["CASH", "UPI", "BANK_TRANSFER", "CARD", "OTHER"]),
  referenceNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
});
var shopSettingsSchema = z.object({
  shopName: z.string().min(1),
  address: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  gstin: z.string().optional().nullable(),
  state: z.string().default("Maharashtra"),
  district: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  upiId: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  bankAccountNumber: z.string().optional().nullable(),
  bankIfsc: z.string().optional().nullable(),
  invoicePrefix: z.string().default("INV"),
  quotationPrefix: z.string().default("QTN"),
  defaultGstRate: z.number().min(0).max(100).default(18),
  defaultSubsidyPct: z.number().min(0).max(100).optional().nullable(),
  footerText: z.string().optional().nullable(),
  termsAndConditions: z.string().optional().nullable()
});
var userCreateSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1),
  role: z.enum(["OWNER", "ADMIN", "STAFF"]).default("STAFF")
});
var paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional()
});

// src/server/utils/auth.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createHash } from "crypto";
var ACCESS_SECRET = () => {
  return process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || "drip_shop_jwt_secret_key_prod_2026";
};
var REFRESH_SECRET = () => {
  return process.env.JWT_REFRESH_SECRET || "drip_shop_refresh_secret_key_prod_2026";
};
function signAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET(), { expiresIn: process.env.JWT_ACCESS_TTL || "15m" });
}
function signRefreshToken(userId) {
  return jwt.sign({ sub: userId }, REFRESH_SECRET(), { expiresIn: process.env.JWT_REFRESH_TTL || "7d" });
}
function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET());
}
function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET());
}
async function hashPassword(plain) {
  return bcrypt.hash(plain, 12);
}
async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}
function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

// src/server/utils/errors.ts
var AppError = class _AppError extends Error {
  status;
  code;
  details;
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
  static badRequest(message, code = "BAD_REQUEST", details) {
    return new _AppError(400, code, message, details);
  }
  static unauthorized(message = "Not authenticated", code = "UNAUTHORIZED") {
    return new _AppError(401, code, message);
  }
  static forbidden(message = "Not authorized", code = "FORBIDDEN") {
    return new _AppError(403, code, message);
  }
  static notFound(message = "Resource not found", code = "NOT_FOUND") {
    return new _AppError(404, code, message);
  }
  static conflict(message, code = "CONFLICT") {
    return new _AppError(409, code, message);
  }
};

// src/server/utils/response.ts
function ok(res, data, pagination, status = 200) {
  return res.status(status).json({ success: true, data, ...pagination ? { pagination } : {} });
}
function created(res, data) {
  return ok(res, data, void 0, 201);
}

// src/server/middleware/audit.ts
async function audit(req, action, entity, entityId, metadata) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action,
        entity,
        entityId,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : void 0,
        ipAddress: req.ip
      }
    });
  } catch (e) {
    console.error("Failed to write audit log", e);
  }
}

// src/server/controllers/auth.controller.ts
var REFRESH_COOKIE = "refresh_token";
var isProd = process.env.NODE_ENV === "production";
function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60 * 1e3
  });
}
async function login(req, res, next) {
  try {
    const { username, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findFirst({
      where: { OR: [{ username }, { email: username }], isActive: true }
    });
    if (!user || !await verifyPassword(password, user.passwordHash)) {
      throw AppError.unauthorized("Invalid username or password", "INVALID_CREDENTIALS");
    }
    const accessToken = signAccessToken({ sub: user.id, role: user.role, username: user.username });
    const refreshToken = signRefreshToken(user.id);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3)
      }
    });
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: /* @__PURE__ */ new Date() } });
    setRefreshCookie(res, refreshToken);
    req.user = { id: user.id, role: user.role, username: user.username };
    await audit(req, "login", "user", user.id);
    return ok(res, {
      accessToken,
      user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName, role: user.role }
    });
  } catch (err) {
    next(err);
  }
}
async function refresh(req, res, next) {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) throw AppError.unauthorized("No refresh token", "NO_REFRESH_TOKEN");
    const payload = verifyRefreshToken(token);
    const stored = await prisma.refreshToken.findFirst({
      where: { userId: payload.sub, tokenHash: hashToken(token), revoked: false }
    });
    if (!stored || stored.expiresAt < /* @__PURE__ */ new Date()) {
      throw AppError.unauthorized("Refresh token invalid or expired", "REFRESH_INVALID");
    }
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) throw AppError.unauthorized();
    const accessToken = signAccessToken({ sub: user.id, role: user.role, username: user.username });
    return ok(res, { accessToken });
  } catch (err) {
    next(err);
  }
}
async function logout(req, res, next) {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (token) {
      await prisma.refreshToken.updateMany({
        where: { tokenHash: hashToken(token) },
        data: { revoked: true }
      });
    }
    res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
    return ok(res, { loggedOut: true });
  } catch (err) {
    next(err);
  }
}
async function me(req, res, next) {
  try {
    if (!req.user) throw AppError.unauthorized();
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) throw AppError.unauthorized();
    return ok(res, {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    });
  } catch (err) {
    next(err);
  }
}

// src/shared/types.ts
var ROLE_PERMISSIONS = {
  OWNER: ["*"],
  ADMIN: [
    "customers:*",
    "products:*",
    "categories:*",
    "government-rates:*",
    "quotations:*",
    "invoices:*",
    "payments:*",
    "reports:*",
    "settings:*",
    "users:read"
  ],
  STAFF: [
    "customers:*",
    "products:read",
    "categories:read",
    "government-rates:read",
    "quotations:*",
    "invoices:*",
    "payments:*",
    "reports:read"
  ]
};

// src/server/middleware/auth.ts
function requireAuth(req, _res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : void 0;
  if (!token) return next(AppError.unauthorized());
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role, username: payload.username };
    next();
  } catch {
    next(AppError.unauthorized("Invalid or expired token", "TOKEN_INVALID"));
  }
}
function requirePermission(permission) {
  return (req, _res, next) => {
    if (!req.user) return next(AppError.unauthorized());
    const perms = ROLE_PERMISSIONS[req.user.role] || [];
    const [resource] = permission.split(":");
    const allowed = perms.includes("*") || perms.includes(permission) || perms.includes(`${resource}:*`);
    if (!allowed) return next(AppError.forbidden(`Missing permission: ${permission}`));
    next();
  };
}
function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(AppError.unauthorized());
    if (!roles.includes(req.user.role)) return next(AppError.forbidden());
    next();
  };
}

// src/server/routes/auth.routes.ts
import rateLimit from "express-rate-limit";
var router = Router();
var loginLimiter = rateLimit({ windowMs: 15 * 60 * 1e3, limit: 20, standardHeaders: true, legacyHeaders: false });
router.post("/login", loginLimiter, login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", requireAuth, me);
var auth_routes_default = router;

// src/server/routes/customers.routes.ts
import { Router as Router2 } from "express";

// src/server/services/numbering.service.ts
async function generateQuotationNumber(prefix) {
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  const count = await prisma.quotation.count({
    where: { quotationNumber: { startsWith: `${prefix}-${year}-` } }
  });
  const next = String(count + 1).padStart(6, "0");
  return `${prefix}-${year}-${next}`;
}
async function generateInvoiceNumber(prefix) {
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  const count = await prisma.invoice.count({
    where: { invoiceNumber: { startsWith: `${prefix}-${year}-` } }
  });
  const next = String(count + 1).padStart(6, "0");
  return `${prefix}-${year}-${next}`;
}
async function generateCustomerCode() {
  const count = await prisma.customer.count();
  return `CUST-${String(count + 1).padStart(5, "0")}`;
}
async function generateProductCode() {
  const count = await prisma.product.count();
  return `PRD-${String(count + 1).padStart(5, "0")}`;
}

// src/server/utils/numberFormat.ts
function toNumber(value) {
  if (value === null || value === void 0) return null;
  return typeof value === "object" && "toNumber" in value ? value.toNumber() : Number(value);
}
function amountInWords(amount) {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen"
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  function twoDigits(n2) {
    if (n2 < 20) return ones[n2];
    return tens[Math.floor(n2 / 10)] + (n2 % 10 ? " " + ones[n2 % 10] : "");
  }
  function threeDigits(n2) {
    if (n2 >= 100) return ones[Math.floor(n2 / 100)] + " Hundred" + (n2 % 100 ? " " + twoDigits(n2 % 100) : "");
    return twoDigits(n2);
  }
  let n = Math.floor(Math.abs(amount));
  if (n === 0) return "Zero Rupees Only";
  const parts = [];
  const crore = Math.floor(n / 1e7);
  n %= 1e7;
  const lakh = Math.floor(n / 1e5);
  n %= 1e5;
  const thousand = Math.floor(n / 1e3);
  n %= 1e3;
  const hundred = n;
  if (crore) parts.push(threeDigits(crore) + " Crore");
  if (lakh) parts.push(threeDigits(lakh) + " Lakh");
  if (thousand) parts.push(threeDigits(thousand) + " Thousand");
  if (hundred) parts.push(threeDigits(hundred));
  return parts.join(" ") + " Rupees Only";
}

// src/server/controllers/customers.controller.ts
async function list(req, res, next) {
  try {
    const { page, limit, search } = paginationSchema.parse(req.query);
    const where = search ? {
      OR: [
        { fullName: { contains: search, mode: "insensitive" } },
        { mobile: { contains: search } },
        { village: { contains: search, mode: "insensitive" } },
        { customerCode: { contains: search, mode: "insensitive" } },
        { farmerId: { contains: search, mode: "insensitive" } }
      ]
    } : {};
    const [rows, total] = await Promise.all([
      prisma.customer.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.customer.count({ where })
    ]);
    return ok(
      res,
      rows.map((c) => ({ ...c, landArea: toNumber(c.landArea) })),
      { page, limit, total, totalPages: Math.ceil(total / limit) }
    );
  } catch (err) {
    next(err);
  }
}
async function getById(req, res, next) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        quotations: { orderBy: { createdAt: "desc" }, take: 20 },
        invoices: { orderBy: { createdAt: "desc" }, take: 20, include: { payments: true } }
      }
    });
    if (!customer) throw AppError.notFound("Customer not found");
    const totalPurchases = customer.invoices.reduce((sum, i) => sum + Number(i.totalAmount), 0);
    const outstanding2 = customer.invoices.reduce((sum, i) => sum + Number(i.balanceAmount), 0);
    return ok(res, {
      ...customer,
      landArea: toNumber(customer.landArea),
      summary: { totalPurchases, outstanding: outstanding2 }
    });
  } catch (err) {
    next(err);
  }
}
async function create(req, res, next) {
  try {
    const data = customerSchema.parse(req.body);
    const customerCode = await generateCustomerCode();
    const customer = await prisma.customer.create({
      data: { ...data, customerCode, createdById: req.user?.id }
    });
    await audit(req, "customer_created", "customer", customer.id, { customerCode });
    return created(res, customer);
  } catch (err) {
    next(err);
  }
}
async function update(req, res, next) {
  try {
    const data = customerSchema.partial().parse(req.body);
    const existing = await prisma.customer.findUnique({ where: { id: req.params.id } });
    if (!existing) throw AppError.notFound("Customer not found");
    const customer = await prisma.customer.update({ where: { id: req.params.id }, data });
    await audit(req, "customer_updated", "customer", customer.id);
    return ok(res, customer);
  } catch (err) {
    next(err);
  }
}
async function remove(req, res, next) {
  try {
    const existing = await prisma.customer.findUnique({ where: { id: req.params.id } });
    if (!existing) throw AppError.notFound("Customer not found");
    const linked = await prisma.quotation.count({ where: { customerId: req.params.id } });
    if (linked > 0) {
      throw AppError.conflict("Cannot delete a customer with existing quotations/invoices", "CUSTOMER_HAS_RECORDS");
    }
    await prisma.customer.delete({ where: { id: req.params.id } });
    await audit(req, "customer_deleted", "customer", req.params.id);
    return ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}

// src/server/routes/customers.routes.ts
var router2 = Router2();
router2.use(requireAuth);
router2.get("/", requirePermission("customers:read"), list);
router2.get("/:id", requirePermission("customers:read"), getById);
router2.post("/", requirePermission("customers:write"), create);
router2.put("/:id", requirePermission("customers:write"), update);
router2.delete("/:id", requirePermission("customers:delete"), remove);
var customers_routes_default = router2;

// src/server/routes/products.routes.ts
import { Router as Router3 } from "express";

// src/server/controllers/products.controller.ts
async function list2(req, res, next) {
  try {
    const { page, limit, search } = paginationSchema.parse(req.query);
    const categoryId = typeof req.query.categoryId === "string" ? req.query.categoryId : void 0;
    const where = {
      ...categoryId ? { categoryId } : {},
      ...search ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { productCode: { contains: search, mode: "insensitive" } },
          { nameMarathi: { contains: search, mode: "insensitive" } }
        ]
      } : {}
    };
    const [rows, total] = await Promise.all([
      prisma.product.findMany({ where, skip: (page - 1) * limit, take: limit, include: { category: true }, orderBy: { name: "asc" } }),
      prisma.product.count({ where })
    ]);
    return ok(res, rows, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}
async function getById2(req, res, next) {
  try {
    const row = await prisma.product.findUnique({ where: { id: req.params.id }, include: { category: true } });
    if (!row) throw AppError.notFound("Product not found");
    return ok(res, row);
  } catch (err) {
    next(err);
  }
}
async function create2(req, res, next) {
  try {
    const data = productSchema.parse(req.body);
    const productCode = await generateProductCode();
    const row = await prisma.product.create({ data: { ...data, productCode } });
    await audit(req, "product_created", "product", row.id, { productCode });
    return created(res, row);
  } catch (err) {
    next(err);
  }
}
async function update2(req, res, next) {
  try {
    const data = productSchema.partial().parse(req.body);
    const row = await prisma.product.update({ where: { id: req.params.id }, data });
    await audit(req, "product_updated", "product", row.id);
    return ok(res, row);
  } catch (err) {
    next(err);
  }
}
async function remove2(req, res, next) {
  try {
    await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } });
    await audit(req, "product_deactivated", "product", req.params.id);
    return ok(res, { deactivated: true });
  } catch (err) {
    next(err);
  }
}

// src/server/routes/products.routes.ts
var router3 = Router3();
router3.use(requireAuth);
router3.get("/", requirePermission("products:read"), list2);
router3.get("/:id", requirePermission("products:read"), getById2);
router3.post("/", requirePermission("products:write"), create2);
router3.put("/:id", requirePermission("products:write"), update2);
router3.delete("/:id", requirePermission("products:delete"), remove2);
var products_routes_default = router3;

// src/server/routes/categories.routes.ts
import { Router as Router4 } from "express";

// src/server/controllers/categories.controller.ts
async function list3(_req, res, next) {
  try {
    const rows = await prisma.productCategory.findMany({ orderBy: { sortOrder: "asc" } });
    return ok(res, rows);
  } catch (err) {
    next(err);
  }
}
async function create3(req, res, next) {
  try {
    const data = productCategorySchema.parse(req.body);
    const row = await prisma.productCategory.create({ data });
    await audit(req, "category_created", "product_category", row.id);
    return created(res, row);
  } catch (err) {
    next(err);
  }
}
async function update3(req, res, next) {
  try {
    const data = productCategorySchema.partial().parse(req.body);
    const row = await prisma.productCategory.update({ where: { id: req.params.id }, data });
    await audit(req, "category_updated", "product_category", row.id);
    return ok(res, row);
  } catch (err) {
    next(err);
  }
}
async function remove3(req, res, next) {
  try {
    const inUse = await prisma.product.count({ where: { categoryId: req.params.id } });
    if (inUse > 0) {
      throw AppError.conflict("Cannot delete a category that is referenced by products", "CATEGORY_IN_USE");
    }
    await prisma.productCategory.delete({ where: { id: req.params.id } });
    await audit(req, "category_deleted", "product_category", req.params.id);
    return ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}

// src/server/routes/categories.routes.ts
var router4 = Router4();
router4.use(requireAuth);
router4.get("/", requirePermission("categories:read"), list3);
router4.post("/", requirePermission("categories:write"), create3);
router4.put("/:id", requirePermission("categories:write"), update3);
router4.delete("/:id", requirePermission("categories:delete"), remove3);
var categories_routes_default = router4;

// src/server/routes/governmentRates.routes.ts
import { Router as Router5 } from "express";

// src/server/controllers/governmentRates.controller.ts
async function listSchemes(_req, res, next) {
  try {
    const rows = await prisma.governmentScheme.findMany({ include: { rates: true }, orderBy: { financialYear: "desc" } });
    return ok(res, rows);
  } catch (err) {
    next(err);
  }
}
async function createScheme(req, res, next) {
  try {
    const data = governmentSchemeSchema.parse(req.body);
    const row = await prisma.governmentScheme.create({ data });
    await audit(req, "government_scheme_created", "government_scheme", row.id);
    return created(res, row);
  } catch (err) {
    next(err);
  }
}
async function updateScheme(req, res, next) {
  try {
    const data = governmentSchemeSchema.partial().parse(req.body);
    const row = await prisma.governmentScheme.update({ where: { id: req.params.id }, data });
    await audit(req, "government_scheme_updated", "government_scheme", row.id);
    return ok(res, row);
  } catch (err) {
    next(err);
  }
}
async function listRates(req, res, next) {
  try {
    const schemeId = typeof req.query.schemeId === "string" ? req.query.schemeId : void 0;
    const rows = await prisma.governmentRate.findMany({
      where: schemeId ? { schemeId } : {},
      include: { product: true, scheme: true },
      orderBy: { effectiveFrom: "desc" }
    });
    return ok(res, rows);
  } catch (err) {
    next(err);
  }
}
async function createRate(req, res, next) {
  try {
    const data = governmentRateSchema.parse(req.body);
    const row = await prisma.governmentRate.create({ data });
    await audit(req, "government_rate_created", "government_rate", row.id);
    return created(res, row);
  } catch (err) {
    next(err);
  }
}
async function updateRate(req, res, next) {
  try {
    const data = governmentRateSchema.partial().parse(req.body);
    const row = await prisma.governmentRate.update({ where: { id: req.params.id }, data });
    await audit(req, "government_rate_updated", "government_rate", row.id);
    return ok(res, row);
  } catch (err) {
    next(err);
  }
}
async function removeRate(req, res, next) {
  try {
    await prisma.governmentRate.update({ where: { id: req.params.id }, data: { isActive: false } });
    await audit(req, "government_rate_deactivated", "government_rate", req.params.id);
    return ok(res, { deactivated: true });
  } catch (err) {
    next(err);
  }
}

// src/server/routes/governmentRates.routes.ts
var router5 = Router5();
router5.use(requireAuth);
router5.get("/schemes", requirePermission("government-rates:read"), listSchemes);
router5.post("/schemes", requirePermission("government-rates:write"), createScheme);
router5.put("/schemes/:id", requirePermission("government-rates:write"), updateScheme);
router5.get("/", requirePermission("government-rates:read"), listRates);
router5.post("/", requirePermission("government-rates:write"), createRate);
router5.put("/:id", requirePermission("government-rates:write"), updateRate);
router5.delete("/:id", requirePermission("government-rates:delete"), removeRate);
var governmentRates_routes_default = router5;

// src/server/routes/quotations.routes.ts
import { Router as Router6 } from "express";

// src/server/services/subsidy.service.ts
function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
function calculateItemTotals(items) {
  const itemAmounts = items.map((i) => round2(i.quantity * i.sellingRate));
  const subtotal = round2(itemAmounts.reduce((sum, a) => sum + a, 0));
  return { subtotal, itemAmounts };
}
function calculateSubsidy(input) {
  const { items, subsidyPercentage, maximumEligibleQuantity, isSubsidyBased } = input;
  const subtotal = round2(items.reduce((sum, i) => sum + i.quantity * i.sellingRate, 0));
  if (!isSubsidyBased) {
    return {
      subtotal,
      eligibleAmount: 0,
      subsidyAmount: 0,
      farmerContribution: subtotal,
      nonEligibleAmount: subtotal
    };
  }
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
  const cap = maximumEligibleQuantity != null ? Math.min(maximumEligibleQuantity, totalQty) : totalQty;
  let remainingEligibleQty = cap;
  let eligibleAmount = 0;
  let nonEligibleAmount = 0;
  for (const item of items) {
    const rate = item.governmentRate ?? item.sellingRate;
    const eligibleQtyForItem = Math.max(0, Math.min(item.quantity, remainingEligibleQty));
    const ineligibleQtyForItem = item.quantity - eligibleQtyForItem;
    eligibleAmount += eligibleQtyForItem * rate;
    nonEligibleAmount += ineligibleQtyForItem * item.sellingRate;
    remainingEligibleQty -= eligibleQtyForItem;
  }
  eligibleAmount = round2(eligibleAmount);
  nonEligibleAmount = round2(subtotal - eligibleAmount);
  const subsidyAmount = round2(eligibleAmount * (subsidyPercentage / 100));
  const farmerContribution = round2(subtotal - subsidyAmount);
  return {
    subtotal,
    eligibleAmount,
    subsidyAmount,
    farmerContribution,
    nonEligibleAmount
  };
}
function calculateGst(taxableAmount, gstRate, isInterstate) {
  const gstAmount = round2(taxableAmount * (gstRate / 100));
  if (isInterstate) {
    return { cgst: 0, sgst: 0, igst: gstAmount, gstAmount };
  }
  const half = round2(gstAmount / 2);
  return { cgst: half, sgst: round2(gstAmount - half), igst: 0, gstAmount };
}

// src/server/controllers/quotations.controller.ts
async function getShopDefaults() {
  const settings = await prisma.shopSettings.findFirst();
  return {
    quotationPrefix: settings?.quotationPrefix ?? "QTN",
    invoicePrefix: settings?.invoicePrefix ?? "INV"
  };
}
async function recalculate(input) {
  const { itemAmounts, subtotal } = calculateItemTotals(input.items);
  let maximumEligibleQuantity = null;
  let subsidyPercentage = input.subsidyPercentage ?? 0;
  if (input.isSubsidyBased && input.schemeId) {
    const rates = await prisma.governmentRate.findMany({ where: { schemeId: input.schemeId, isActive: true } });
    if (rates.length) {
      maximumEligibleQuantity = rates.reduce(
        (sum, r) => sum + (r.maximumEligibleQuantity ? Number(r.maximumEligibleQuantity) : 0),
        0
      ) || null;
      if (input.subsidyPercentage == null) subsidyPercentage = Number(rates[0].subsidyPercentage);
    }
  }
  const subsidy = calculateSubsidy({
    items: input.items,
    subsidyPercentage,
    maximumEligibleQuantity,
    isSubsidyBased: input.isSubsidyBased
  });
  const taxableBase = subtotal + input.fileExpense + input.otherCharges;
  const { gstAmount } = calculateGst(taxableBase, input.gstRate, false);
  const totalAmount = Math.round((taxableBase + gstAmount + Number.EPSILON) * 100) / 100;
  return { itemAmounts, subtotal, subsidy, gstAmount, totalAmount, subsidyPercentageUsed: subsidyPercentage };
}
async function list4(req, res, next) {
  try {
    const { page, limit, search } = paginationSchema.parse(req.query);
    const status = typeof req.query.status === "string" ? req.query.status : void 0;
    const where = {
      ...status ? { status } : {},
      ...search ? {
        OR: [
          { quotationNumber: { contains: search, mode: "insensitive" } },
          { customer: { fullName: { contains: search, mode: "insensitive" } } }
        ]
      } : {}
    };
    const [rows, total] = await Promise.all([
      prisma.quotation.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { customer: true },
        orderBy: { createdAt: "desc" }
      }),
      prisma.quotation.count({ where })
    ]);
    return ok(res, rows, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}
async function getById3(req, res, next) {
  try {
    const row = await prisma.quotation.findUnique({
      where: { id: req.params.id },
      include: { customer: true, scheme: true, items: { include: { product: true }, orderBy: { sortOrder: "asc" } } }
    });
    if (!row) throw AppError.notFound("Quotation not found");
    return ok(res, row);
  } catch (err) {
    next(err);
  }
}
async function resolveCustomerId(input) {
  if (input.customerId) return input.customerId;
  if (!input.customer) throw AppError.badRequest("Customer details required");
  const existing = await prisma.customer.findFirst({ where: { mobile: input.customer.mobile } });
  if (existing) {
    return existing.id;
  }
  const customerCode = await generateCustomerCode();
  const aadhar = input.customer.aadhar?.replace(/\s+/g, "");
  const createdCust = await prisma.customer.create({
    data: {
      customerCode,
      fullName: input.customer.fullName,
      mobile: input.customer.mobile,
      village: input.customer.village ?? null,
      taluka: input.customer.taluka ?? null,
      district: input.customer.district ?? null,
      surveyNumber: input.customer.surveyNumber ?? null,
      gatNumber: input.customer.gatNumber ?? null,
      landArea: input.customer.landArea ? Number(input.customer.landArea) : null,
      crop: input.customer.crop ?? null,
      aadhaarLast4: aadhar && aadhar.length >= 4 ? aadhar.slice(-4) : null,
      notes: input.customer.aadhar ? `Aadhaar: ${input.customer.aadhar}` : null,
      createdById: input.userId
    }
  });
  return createdCust.id;
}
async function create4(req, res, next) {
  try {
    const data = quotationSchema.parse(req.body);
    const { quotationPrefix } = await getShopDefaults();
    const quotationNumber = await generateQuotationNumber(quotationPrefix);
    const customerId = await resolveCustomerId({
      customerId: data.customerId,
      customer: data.customer,
      userId: req.user?.id
    });
    const calc = await recalculate({
      items: data.items,
      isSubsidyBased: data.isSubsidyBased,
      subsidyPercentage: data.subsidyPercentage,
      fileExpense: data.fileExpense,
      otherCharges: data.otherCharges,
      gstRate: data.gstRate,
      schemeId: data.schemeId
    });
    let combinedNotes = data.notes ?? "";
    const metaParts = [];
    if (data.spacing) metaParts.push(`\u0932\u093E\u0917\u0935\u0921\u0940\u091A\u0947 \u0905\u0902\u0924\u0930 (Spacing): ${data.spacing}`);
    if (data.crop) metaParts.push(`\u092A\u093F\u0915 (Crop): ${data.crop}`);
    if (data.customer?.aadhar) metaParts.push(`Aadhaar: ${data.customer.aadhar}`);
    if (metaParts.length > 0) {
      combinedNotes = combinedNotes ? `${combinedNotes} | ${metaParts.join(" | ")}` : metaParts.join(" | ");
    }
    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        customerId,
        quotationDate: data.quotationDate ?? /* @__PURE__ */ new Date(),
        validUntil: data.validUntil,
        schemeId: data.schemeId,
        subsidyPercentage: calc.subsidyPercentageUsed,
        isSubsidyBased: data.isSubsidyBased,
        landArea: data.landArea,
        status: "DRAFT",
        subtotal: calc.subtotal,
        fileExpense: data.fileExpense,
        otherCharges: data.otherCharges,
        gstRate: data.gstRate,
        gstAmount: calc.gstAmount,
        totalAmount: calc.totalAmount,
        eligibleAmount: calc.subsidy.eligibleAmount,
        subsidyAmount: calc.subsidy.subsidyAmount,
        farmerContribution: calc.subsidy.farmerContribution,
        nonEligibleAmount: calc.subsidy.nonEligibleAmount,
        notes: combinedNotes || null,
        createdById: req.user?.id,
        items: {
          create: data.items.map((item, idx) => ({
            productId: item.productId,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            governmentRate: item.governmentRate,
            sellingRate: item.sellingRate,
            gstRate: item.gstRate,
            amount: calc.itemAmounts[idx],
            sortOrder: idx
          }))
        }
      },
      include: { items: true, customer: true }
    });
    await audit(req, "quotation_created", "quotation", quotation.id, { quotationNumber });
    return created(res, quotation);
  } catch (err) {
    next(err);
  }
}
async function update4(req, res, next) {
  try {
    const existing = await prisma.quotation.findUnique({ where: { id: req.params.id } });
    if (!existing) throw AppError.notFound("Quotation not found");
    if (existing.status === "CONVERTED") {
      throw AppError.conflict("Cannot edit a quotation that has been converted to an invoice", "QUOTATION_CONVERTED");
    }
    const data = quotationSchema.parse(req.body);
    const customerId = await resolveCustomerId({
      customerId: data.customerId,
      customer: data.customer,
      userId: req.user?.id
    });
    const calc = await recalculate({
      items: data.items,
      isSubsidyBased: data.isSubsidyBased,
      subsidyPercentage: data.subsidyPercentage,
      fileExpense: data.fileExpense,
      otherCharges: data.otherCharges,
      gstRate: data.gstRate,
      schemeId: data.schemeId
    });
    const quotation = await prisma.$transaction(async (tx) => {
      await tx.quotationItem.deleteMany({ where: { quotationId: req.params.id } });
      return tx.quotation.update({
        where: { id: req.params.id },
        data: {
          customerId,
          quotationDate: data.quotationDate,
          validUntil: data.validUntil,
          schemeId: data.schemeId,
          subsidyPercentage: calc.subsidyPercentageUsed,
          isSubsidyBased: data.isSubsidyBased,
          landArea: data.landArea,
          subtotal: calc.subtotal,
          fileExpense: data.fileExpense,
          otherCharges: data.otherCharges,
          gstRate: data.gstRate,
          gstAmount: calc.gstAmount,
          totalAmount: calc.totalAmount,
          eligibleAmount: calc.subsidy.eligibleAmount,
          subsidyAmount: calc.subsidy.subsidyAmount,
          farmerContribution: calc.subsidy.farmerContribution,
          nonEligibleAmount: calc.subsidy.nonEligibleAmount,
          notes: data.notes,
          items: {
            create: data.items.map((item, idx) => ({
              productId: item.productId,
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              governmentRate: item.governmentRate,
              sellingRate: item.sellingRate,
              gstRate: item.gstRate,
              amount: calc.itemAmounts[idx],
              sortOrder: idx
            }))
          }
        },
        include: { items: true, customer: true }
      });
    });
    await audit(req, "quotation_edited", "quotation", quotation.id);
    return ok(res, quotation);
  } catch (err) {
    next(err);
  }
}
async function updateStatus(req, res, next) {
  try {
    const { status } = quotationStatusSchema.parse(req.body);
    const row = await prisma.quotation.update({ where: { id: req.params.id }, data: { status } });
    await audit(req, "quotation_status_changed", "quotation", row.id, { status });
    return ok(res, row);
  } catch (err) {
    next(err);
  }
}
async function remove4(req, res, next) {
  try {
    const existing = await prisma.quotation.findUnique({ where: { id: req.params.id } });
    if (!existing) throw AppError.notFound("Quotation not found");
    if (existing.status === "CONVERTED") {
      throw AppError.conflict("Cannot delete a quotation already converted to an invoice", "QUOTATION_CONVERTED");
    }
    await prisma.quotation.delete({ where: { id: req.params.id } });
    await audit(req, "quotation_deleted", "quotation", req.params.id);
    return ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}
async function duplicate(req, res, next) {
  try {
    const original = await prisma.quotation.findUnique({ where: { id: req.params.id }, include: { items: true } });
    if (!original) throw AppError.notFound("Quotation not found");
    const { quotationPrefix } = await getShopDefaults();
    const quotationNumber = await generateQuotationNumber(quotationPrefix);
    const copy = await prisma.quotation.create({
      data: {
        quotationNumber,
        customerId: original.customerId,
        schemeId: original.schemeId,
        subsidyPercentage: original.subsidyPercentage,
        isSubsidyBased: original.isSubsidyBased,
        landArea: original.landArea,
        status: "DRAFT",
        subtotal: original.subtotal,
        fileExpense: original.fileExpense,
        otherCharges: original.otherCharges,
        gstRate: original.gstRate,
        gstAmount: original.gstAmount,
        totalAmount: original.totalAmount,
        eligibleAmount: original.eligibleAmount,
        subsidyAmount: original.subsidyAmount,
        farmerContribution: original.farmerContribution,
        nonEligibleAmount: original.nonEligibleAmount,
        notes: original.notes,
        createdById: req.user?.id,
        items: {
          create: original.items.map((item, idx) => ({
            productId: item.productId,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            governmentRate: item.governmentRate,
            sellingRate: item.sellingRate,
            gstRate: item.gstRate,
            amount: item.amount,
            sortOrder: idx
          }))
        }
      },
      include: { items: true, customer: true }
    });
    await audit(req, "quotation_duplicated", "quotation", copy.id, { fromQuotationId: original.id });
    return created(res, copy);
  } catch (err) {
    next(err);
  }
}
async function convertToInvoice(req, res, next) {
  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: req.params.id },
      include: { items: true, customer: true }
    });
    if (!quotation) throw AppError.notFound("Quotation not found");
    if (quotation.status === "CONVERTED") {
      throw AppError.conflict("Quotation already converted to an invoice", "ALREADY_CONVERTED");
    }
    const { invoicePrefix } = await getShopDefaults();
    const invoiceNumber = await generateInvoiceNumber(invoicePrefix);
    const isInterstate = req.body?.isInterstate === true;
    const taxableValue = Number(quotation.subtotal) + Number(quotation.fileExpense) + Number(quotation.otherCharges);
    const gst = calculateGst(taxableValue, Number(quotation.gstRate), isInterstate);
    const totalAmount = Math.round((taxableValue + gst.gstAmount + Number.EPSILON) * 100) / 100;
    const invoice = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.create({
        data: {
          invoiceNumber,
          customerId: quotation.customerId,
          quotationId: quotation.id,
          subtotal: quotation.subtotal,
          cgst: gst.cgst,
          sgst: gst.sgst,
          igst: gst.igst,
          gstRate: quotation.gstRate,
          gstAmount: gst.gstAmount,
          discount: 0,
          roundOff: 0,
          totalAmount,
          paidAmount: 0,
          balanceAmount: totalAmount,
          paymentStatus: "UNPAID",
          isInterstate,
          notes: quotation.notes,
          createdById: req.user?.id,
          items: {
            create: quotation.items.map((item, idx) => {
              const itemGst = calculateGst(Number(item.amount), Number(item.gstRate), isInterstate);
              return {
                productId: item.productId,
                description: item.description,
                quantity: item.quantity,
                unit: item.unit,
                rate: item.sellingRate,
                taxableValue: item.amount,
                gstRate: item.gstRate,
                cgstAmount: itemGst.cgst,
                sgstAmount: itemGst.sgst,
                igstAmount: itemGst.igst,
                totalAmount: Math.round((Number(item.amount) + itemGst.gstAmount + Number.EPSILON) * 100) / 100,
                sortOrder: idx
              };
            })
          }
        },
        include: { items: true, customer: true }
      });
      await tx.quotation.update({ where: { id: quotation.id }, data: { status: "CONVERTED" } });
      return inv;
    });
    await audit(req, "invoice_created", "invoice", invoice.id, { fromQuotationId: quotation.id, invoiceNumber });
    return created(res, invoice);
  } catch (err) {
    next(err);
  }
}

// src/server/routes/quotations.routes.ts
var router6 = Router6();
router6.use(requireAuth);
router6.get("/", requirePermission("quotations:read"), list4);
router6.get("/:id", requirePermission("quotations:read"), getById3);
router6.post("/", requirePermission("quotations:write"), create4);
router6.put("/:id", requirePermission("quotations:write"), update4);
router6.patch("/:id/status", requirePermission("quotations:write"), updateStatus);
router6.delete("/:id", requirePermission("quotations:delete"), remove4);
router6.post("/:id/duplicate", requirePermission("quotations:write"), duplicate);
router6.post("/:id/convert-to-invoice", requirePermission("invoices:write"), convertToInvoice);
var quotations_routes_default = router6;

// src/server/routes/invoices.routes.ts
import { Router as Router7 } from "express";

// src/server/controllers/invoices.controller.ts
async function getInvoicePrefix() {
  const settings = await prisma.shopSettings.findFirst();
  return settings?.invoicePrefix ?? "INV";
}
async function resolveCustomerId2(input) {
  if (input.customerId) return input.customerId;
  if (!input.customer) throw AppError.badRequest("Customer details required");
  const existing = await prisma.customer.findFirst({ where: { mobile: input.customer.mobile } });
  if (existing) return existing.id;
  const customerCode = await generateCustomerCode();
  const aadhar = input.customer.aadhar?.replace(/\s+/g, "");
  const createdCust = await prisma.customer.create({
    data: {
      customerCode,
      fullName: input.customer.fullName,
      mobile: input.customer.mobile,
      village: input.customer.village ?? null,
      taluka: input.customer.taluka ?? null,
      district: input.customer.district ?? null,
      surveyNumber: input.customer.surveyNumber ?? null,
      gatNumber: input.customer.gatNumber ?? null,
      landArea: input.customer.landArea ? Number(input.customer.landArea) : null,
      crop: input.customer.crop ?? null,
      aadhaarLast4: aadhar && aadhar.length >= 4 ? aadhar.slice(-4) : null,
      notes: input.customer.aadhar ? `Aadhaar: ${input.customer.aadhar}` : null,
      createdById: input.userId
    }
  });
  return createdCust.id;
}
async function create5(req, res, next) {
  try {
    const data = invoiceCreateSchema.parse(req.body);
    const prefix = await getInvoicePrefix();
    const invoiceNumber = await generateInvoiceNumber(prefix);
    const customerId = await resolveCustomerId2({
      customerId: data.customerId,
      customer: data.customer,
      userId: req.user?.id
    });
    const isInterstate = Boolean(data.isInterstate);
    let subtotal = 0;
    const computedItems = data.items.map((it, idx) => {
      const taxable = it.taxableValue ?? Math.round(Number(it.quantity) * Number(it.rate) * 100) / 100;
      subtotal += taxable;
      const itGst = calculateGst(taxable, Number(it.gstRate ?? data.gstRate), isInterstate);
      const itTotal = Math.round((taxable + itGst.gstAmount + Number.EPSILON) * 100) / 100;
      return {
        productId: it.productId ?? null,
        description: it.description,
        hsnCode: it.hsnCode || it.cmlNo || null,
        quantity: it.quantity,
        unit: it.unit || "Nos",
        rate: it.rate,
        taxableValue: taxable,
        gstRate: it.gstRate ?? data.gstRate,
        cgstAmount: itGst.cgst,
        sgstAmount: itGst.sgst,
        igstAmount: itGst.igst,
        totalAmount: itTotal,
        sortOrder: idx
      };
    });
    const discount = Number(data.discount ?? 0);
    const installation = Number(data.installation ?? 0);
    const taxableBase = Math.max(0, subtotal - discount + installation);
    const overallGst = calculateGst(taxableBase, Number(data.gstRate), isInterstate);
    const rawTotal = taxableBase + overallGst.gstAmount;
    const roundedTotal = Math.round(rawTotal);
    const roundOff = Math.round((roundedTotal - rawTotal + Number.EPSILON) * 100) / 100;
    const metaParts = [];
    if (data.setType) metaParts.push(`\u0938\u0902\u091A \u092A\u094D\u0930\u0915\u093E\u0930: ${data.setType}`);
    if (data.spacing) metaParts.push(`\u0932\u093E\u0917\u0935\u0921\u0940\u091A\u0947 \u0905\u0902\u0924\u0930: ${data.spacing}`);
    if (data.shiwar) metaParts.push(`\u0936\u093F\u0935\u093E\u0930: ${data.shiwar}`);
    if (installation > 0) metaParts.push(`\u0907\u0928\u094D\u0938\u094D\u091F\u0949\u0932\u0947\u0936\u0928: \u20B9${installation}`);
    if (data.notes) metaParts.push(data.notes);
    const finalNotes = metaParts.join(" | ");
    const invoice = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.create({
        data: {
          invoiceNumber,
          customerId,
          quotationId: data.quotationId ?? null,
          invoiceDate: data.invoiceDate ?? /* @__PURE__ */ new Date(),
          subtotal,
          cgst: overallGst.cgst,
          sgst: overallGst.sgst,
          igst: overallGst.igst,
          gstRate: data.gstRate,
          gstAmount: overallGst.gstAmount,
          discount,
          roundOff,
          totalAmount: roundedTotal,
          paidAmount: 0,
          balanceAmount: roundedTotal,
          paymentStatus: "UNPAID",
          isInterstate,
          notes: finalNotes || null,
          createdById: req.user?.id,
          items: {
            create: computedItems
          }
        },
        include: { items: true, customer: true }
      });
      if (data.quotationId) {
        await tx.quotation.update({
          where: { id: data.quotationId },
          data: { status: "CONVERTED" }
        });
      }
      return inv;
    });
    await audit(req, "invoice_created", "invoice", invoice.id, { invoiceNumber });
    return created(res, invoice);
  } catch (err) {
    next(err);
  }
}
async function list5(req, res, next) {
  try {
    const { page, limit, search } = paginationSchema.parse(req.query);
    const paymentStatus = typeof req.query.paymentStatus === "string" ? req.query.paymentStatus : void 0;
    const where = {
      ...paymentStatus ? { paymentStatus } : {},
      ...search ? {
        OR: [
          { invoiceNumber: { contains: search, mode: "insensitive" } },
          { customer: { fullName: { contains: search, mode: "insensitive" } } }
        ]
      } : {}
    };
    const [rows, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { customer: true },
        orderBy: { createdAt: "desc" }
      }),
      prisma.invoice.count({ where })
    ]);
    return ok(res, rows, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}
async function getById4(req, res, next) {
  try {
    const row = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        items: { include: { product: true }, orderBy: { sortOrder: "asc" } },
        payments: { orderBy: { paymentDate: "desc" } },
        quotation: true
      }
    });
    if (!row) throw AppError.notFound("Invoice not found");
    return ok(res, row);
  } catch (err) {
    next(err);
  }
}
async function update5(req, res, next) {
  try {
    const data = invoiceUpdateSchema.parse(req.body);
    const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id } });
    if (!invoice) throw AppError.notFound("Invoice not found");
    const isInterstate = data.isInterstate ?? invoice.isInterstate;
    const discount = data.discount ?? Number(invoice.discount);
    const taxableValue = Number(invoice.subtotal) - discount;
    const gst = calculateGst(taxableValue, Number(invoice.gstRate), isInterstate);
    const rawTotal = taxableValue + gst.gstAmount;
    const roundedTotal = Math.round(rawTotal);
    const roundOff = Math.round((roundedTotal - rawTotal + Number.EPSILON) * 100) / 100;
    const balanceAmount = Math.max(0, roundedTotal - Number(invoice.paidAmount));
    const updated = await prisma.invoice.update({
      where: { id: req.params.id },
      data: {
        discount,
        isInterstate,
        cgst: gst.cgst,
        sgst: gst.sgst,
        igst: gst.igst,
        gstAmount: gst.gstAmount,
        roundOff,
        totalAmount: roundedTotal,
        balanceAmount,
        notes: data.notes
      }
    });
    await audit(req, "invoice_updated", "invoice", updated.id);
    return ok(res, updated);
  } catch (err) {
    next(err);
  }
}

// src/server/controllers/payments.controller.ts
async function listForInvoice(req, res, next) {
  try {
    const rows = await prisma.payment.findMany({
      where: { invoiceId: req.params.invoiceId },
      orderBy: { paymentDate: "desc" }
    });
    return ok(res, rows);
  } catch (err) {
    next(err);
  }
}
async function create6(req, res, next) {
  try {
    const data = paymentSchema.parse(req.body);
    const invoice = await prisma.invoice.findUnique({ where: { id: req.params.invoiceId } });
    if (!invoice) throw AppError.notFound("Invoice not found");
    const alreadyPaid = Number(invoice.paidAmount);
    const total = Number(invoice.totalAmount);
    if (alreadyPaid + data.amount > total + 0.01) {
      throw AppError.badRequest(
        `Payment of ${data.amount} exceeds the outstanding balance of ${(total - alreadyPaid).toFixed(2)}`,
        "PAYMENT_EXCEEDS_BALANCE"
      );
    }
    const payment = await prisma.$transaction(async (tx) => {
      const p = await tx.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: data.amount,
          paymentDate: data.paymentDate ?? /* @__PURE__ */ new Date(),
          paymentMethod: data.paymentMethod,
          referenceNumber: data.referenceNumber,
          notes: data.notes,
          createdById: req.user?.id
        }
      });
      const newPaidAmount = Math.round((alreadyPaid + data.amount + Number.EPSILON) * 100) / 100;
      const newBalance = Math.max(0, Math.round((total - newPaidAmount + Number.EPSILON) * 100) / 100);
      const paymentStatus = newBalance <= 0.01 ? "PAID" : newPaidAmount > 0 ? "PARTIAL" : "UNPAID";
      await tx.invoice.update({
        where: { id: invoice.id },
        data: { paidAmount: newPaidAmount, balanceAmount: newBalance, paymentStatus }
      });
      return p;
    });
    await audit(req, "payment_created", "payment", payment.id, { invoiceId: invoice.id, amount: data.amount });
    return created(res, payment);
  } catch (err) {
    next(err);
  }
}

// src/server/routes/invoices.routes.ts
var router7 = Router7();
router7.use(requireAuth);
router7.get("/", requirePermission("invoices:read"), list5);
router7.post("/", requirePermission("invoices:write"), create5);
router7.get("/:id", requirePermission("invoices:read"), getById4);
router7.put("/:id", requirePermission("invoices:write"), update5);
router7.get("/:invoiceId/payments", requirePermission("payments:read"), listForInvoice);
router7.post("/:invoiceId/payments", requirePermission("payments:write"), create6);
var invoices_routes_default = router7;

// src/server/routes/reports.routes.ts
import { Router as Router8 } from "express";

// src/server/controllers/reports.controller.ts
function startOfDay(d = /* @__PURE__ */ new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfMonth(d = /* @__PURE__ */ new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
async function dashboard(_req, res, next) {
  try {
    const today = startOfDay();
    const monthStart = startOfMonth();
    const [
      totalCustomers,
      totalQuotations,
      totalInvoices,
      totalProducts,
      todaySalesAgg,
      monthSalesAgg,
      pendingAgg,
      recentQuotations,
      recentInvoices
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.quotation.count(),
      prisma.invoice.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.invoice.aggregate({ _sum: { totalAmount: true }, where: { invoiceDate: { gte: today } } }),
      prisma.invoice.aggregate({ _sum: { totalAmount: true }, where: { invoiceDate: { gte: monthStart } } }),
      prisma.invoice.aggregate({ _sum: { balanceAmount: true }, where: { paymentStatus: { not: "PAID" } } }),
      prisma.quotation.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { customer: true } }),
      prisma.invoice.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { customer: true } })
    ]);
    return ok(res, {
      totalCustomers,
      totalQuotations,
      totalInvoices,
      totalProducts,
      todaySales: Number(todaySalesAgg._sum.totalAmount ?? 0),
      monthSales: Number(monthSalesAgg._sum.totalAmount ?? 0),
      pendingPayments: Number(pendingAgg._sum.balanceAmount ?? 0),
      recentQuotations,
      recentInvoices
    });
  } catch (err) {
    next(err);
  }
}
async function sales(req, res, next) {
  try {
    const from = req.query.from ? new Date(String(req.query.from)) : startOfMonth();
    const to = req.query.to ? new Date(String(req.query.to)) : /* @__PURE__ */ new Date();
    const invoices = await prisma.invoice.findMany({
      where: { invoiceDate: { gte: from, lte: to } },
      select: { invoiceDate: true, totalAmount: true },
      orderBy: { invoiceDate: "asc" }
    });
    const byDay = /* @__PURE__ */ new Map();
    for (const inv of invoices) {
      const key = inv.invoiceDate.toISOString().slice(0, 10);
      byDay.set(key, (byDay.get(key) ?? 0) + Number(inv.totalAmount));
    }
    return ok(res, {
      from,
      to,
      total: invoices.reduce((s, i) => s + Number(i.totalAmount), 0),
      byDay: Array.from(byDay.entries()).map(([date, amount]) => ({ date, amount }))
    });
  } catch (err) {
    next(err);
  }
}
async function customerPurchases(req, res, next) {
  try {
    const rows = await prisma.invoice.groupBy({
      by: ["customerId"],
      _sum: { totalAmount: true, balanceAmount: true },
      _count: { id: true },
      orderBy: { _sum: { totalAmount: "desc" } },
      take: 50
    });
    const customers = await prisma.customer.findMany({
      where: { id: { in: rows.map((r) => r.customerId) } }
    });
    const byId = new Map(customers.map((c) => [c.id, c]));
    return ok(
      res,
      rows.map((r) => ({
        customer: byId.get(r.customerId),
        invoiceCount: r._count.id,
        totalPurchases: Number(r._sum.totalAmount ?? 0),
        outstanding: Number(r._sum.balanceAmount ?? 0)
      }))
    );
  } catch (err) {
    next(err);
  }
}
async function outstanding(_req, res, next) {
  try {
    const rows = await prisma.invoice.findMany({
      where: { paymentStatus: { not: "PAID" } },
      include: { customer: true },
      orderBy: { invoiceDate: "asc" }
    });
    return ok(res, rows);
  } catch (err) {
    next(err);
  }
}

// src/server/routes/reports.routes.ts
var router8 = Router8();
router8.use(requireAuth, requirePermission("reports:read"));
router8.get("/dashboard", dashboard);
router8.get("/sales", sales);
router8.get("/customers", customerPurchases);
router8.get("/outstanding", outstanding);
var reports_routes_default = router8;

// src/server/routes/settings.routes.ts
import { Router as Router9 } from "express";

// src/server/controllers/settings.controller.ts
async function get(_req, res, next) {
  try {
    const settings = await prisma.shopSettings.findFirst();
    return ok(res, settings ?? null);
  } catch (err) {
    next(err);
  }
}
async function update6(req, res, next) {
  try {
    const data = shopSettingsSchema.partial().parse(req.body);
    const existing = await prisma.shopSettings.findFirst();
    const row = existing ? await prisma.shopSettings.update({ where: { id: existing.id }, data }) : await prisma.shopSettings.create({ data: { shopName: data.shopName ?? "My Shop", ...data } });
    await audit(req, "settings_changed", "shop_settings", row.id);
    return ok(res, row);
  } catch (err) {
    next(err);
  }
}

// src/server/routes/settings.routes.ts
var router9 = Router9();
router9.use(requireAuth);
router9.get("/shop", get);
router9.put("/shop", requirePermission("settings:write"), update6);
var settings_routes_default = router9;

// src/server/routes/users.routes.ts
import { Router as Router10 } from "express";

// src/server/controllers/users.controller.ts
var SAFE_SELECT = {
  id: true,
  username: true,
  email: true,
  fullName: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true
};
async function list6(_req, res, next) {
  try {
    const rows = await prisma.user.findMany({ select: SAFE_SELECT, orderBy: { createdAt: "asc" } });
    return ok(res, rows);
  } catch (err) {
    next(err);
  }
}
async function create7(req, res, next) {
  try {
    const data = userCreateSchema.parse(req.body);
    if (data.role === "OWNER" && req.user?.role !== "OWNER") {
      throw AppError.forbidden("Only an owner can create another owner account");
    }
    const passwordHash = await hashPassword(data.password);
    const row = await prisma.user.create({
      data: { username: data.username, email: data.email, fullName: data.fullName, role: data.role, passwordHash },
      select: SAFE_SELECT
    });
    await audit(req, "user_created", "user", row.id, { role: data.role });
    return created(res, row);
  } catch (err) {
    next(err);
  }
}
async function deactivate(req, res, next) {
  try {
    const row = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false }, select: SAFE_SELECT });
    await audit(req, "user_deactivated", "user", row.id);
    return ok(res, row);
  } catch (err) {
    next(err);
  }
}

// src/server/routes/users.routes.ts
var router10 = Router10();
router10.use(requireAuth);
router10.get("/", requireRole("OWNER", "ADMIN"), list6);
router10.post("/", requireRole("OWNER", "ADMIN"), create7);
router10.patch("/:id/deactivate", requireRole("OWNER", "ADMIN"), deactivate);
var users_routes_default = router10;

// src/server/routes/pdf.routes.ts
import { Router as Router11 } from "express";

// src/server/controllers/pdf.controller.ts
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";

// src/server/pdf/quotationPdf.tsx
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { jsx, jsxs } from "react/jsx-runtime";
var S = StyleSheet.create({
  page: { padding: 30, fontSize: 9, fontFamily: "Helvetica", color: "#111", backgroundColor: "#fff" },
  mobileHeader: { textAlign: "right", fontSize: 8, color: "#555", marginBottom: 6 },
  infoBox: { border: "1 solid #ccc", marginBottom: 6 },
  infoRow: { flexDirection: "row", borderBottom: "0.5 solid #ccc", padding: "3 6" },
  infoLabel: { width: "18%", fontFamily: "Helvetica-Bold", fontSize: 8.5 },
  infoValue: { flex: 1, fontSize: 8.5 },
  infoSep: { width: "4%", textAlign: "center", color: "#999" },
  infoLabel2: { width: "14%", fontFamily: "Helvetica-Bold", fontSize: 8.5 },
  infoValue2: { width: "20%", fontSize: 8.5 },
  shopName: { fontSize: 15, fontFamily: "Helvetica-Bold", color: "#15803d", textAlign: "center", marginBottom: 2 },
  shopSub: { fontSize: 8, color: "#555", textAlign: "center", marginBottom: 4 },
  docTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    backgroundColor: "#15803d",
    color: "#fff",
    paddingVertical: 4,
    marginBottom: 0,
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  tHead: { flexDirection: "row", backgroundColor: "#333", color: "#fff", paddingVertical: 4, paddingHorizontal: 2 },
  tRow: { flexDirection: "row", borderBottom: "0.5 solid #eee", paddingVertical: 3, paddingHorizontal: 2 },
  tRowAlt: { flexDirection: "row", borderBottom: "0.5 solid #eee", paddingVertical: 3, paddingHorizontal: 2, backgroundColor: "#f9f9f9" },
  cSr: { width: "7%", textAlign: "center" },
  cDesc: { width: "43%", paddingHorizontal: 2 },
  cQty: { width: "14%", textAlign: "right", paddingRight: 4 },
  cRate: { width: "18%", textAlign: "right", paddingRight: 4 },
  cAmt: { width: "18%", textAlign: "right", paddingRight: 4 },
  totWrap: { marginTop: 4, alignSelf: "flex-end", width: "48%", border: "1 solid #ccc" },
  totRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3, paddingHorizontal: 6, borderBottom: "0.5 solid #eee" },
  totRowBold: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 6,
    backgroundColor: "#1a1a1a",
    color: "#fff",
    fontFamily: "Helvetica-Bold",
    fontSize: 10.5
  },
  subsidyWrap: { marginTop: 10, border: "1.5 solid #15803d", borderRadius: 3, backgroundColor: "#f0fdf4", padding: 8 },
  subsidyTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#15803d",
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  subsidyRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  subsidyLabel: { fontSize: 9, color: "#333" },
  subsidyValue: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#1a1a1a" },
  subsidyFarmer: { flexDirection: "row", justifyContent: "space-between", marginTop: 4, paddingTop: 4, borderTop: "1 solid #15803d" },
  subsidyFLabel: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#15803d" },
  subsidyFValue: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#15803d" },
  footer: { marginTop: 24, flexDirection: "row", justifyContent: "space-between" },
  termsTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#555", marginBottom: 2 },
  termsText: { fontSize: 7.5, color: "#666", lineHeight: 1.4 },
  sigBox: { alignItems: "flex-end" },
  sigLine: { marginTop: 36, width: 120, borderBottom: "1 solid #333" },
  sigLabel: { fontSize: 8, color: "#555", marginTop: 2, textAlign: "right" },
  footNote: { fontSize: 7, color: "#888", marginTop: 14, textAlign: "center" }
});
function inr(n) {
  const num = Number(n ?? 0);
  return "\u20B9 " + num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function QuotationPdfDocument({ shop, quotation, customer, items }) {
  const qDate = new Date(quotation.quotationDate).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
  const notesText = quotation.notes ?? "";
  const spacingMatch = notesText.match(/Spacing[^\d]*([0-9.]+\s*x\s*[0-9.]+)/i);
  const spacing = spacingMatch ? spacingMatch[1] : null;
  const aadharMatch = notesText.match(/Aadhaar[:\s]*([0-9\s]{12,14})/i);
  const aadhar = aadharMatch ? aadharMatch[1] : customer.aadharNumber ?? (customer.aadhaarLast4 ? `XXXX-XXXX-${customer.aadhaarLast4}` : "-");
  return /* @__PURE__ */ jsx(Document, { children: /* @__PURE__ */ jsxs(Page, { size: "A4", style: S.page, children: [
    /* @__PURE__ */ jsx(Text, { style: S.mobileHeader, children: shop.mobile ? `Mobile: ${shop.mobile}` : "Mobile: 8766420075, 8888309342, 9545595944" }),
    /* @__PURE__ */ jsxs(View, { style: S.infoBox, children: [
      /* @__PURE__ */ jsxs(View, { style: S.infoRow, children: [
        /* @__PURE__ */ jsx(Text, { style: S.infoLabel, children: "Name (Nav) :-" }),
        /* @__PURE__ */ jsx(Text, { style: S.infoValue, children: customer.fullName }),
        /* @__PURE__ */ jsx(Text, { style: S.infoSep }),
        /* @__PURE__ */ jsx(Text, { style: S.infoLabel2, children: "Gat / Sr :-" }),
        /* @__PURE__ */ jsx(Text, { style: S.infoValue2, children: customer.gatNumber ?? customer.surveyNumber ?? "-" })
      ] }),
      /* @__PURE__ */ jsxs(View, { style: S.infoRow, children: [
        /* @__PURE__ */ jsx(Text, { style: S.infoLabel, children: "Aadhar :-" }),
        /* @__PURE__ */ jsx(Text, { style: S.infoValue, children: aadhar }),
        /* @__PURE__ */ jsx(Text, { style: S.infoSep }),
        /* @__PURE__ */ jsx(Text, { style: S.infoLabel2, children: "Qtn No :-" }),
        /* @__PURE__ */ jsx(Text, { style: S.infoValue2, children: quotation.quotationNumber })
      ] }),
      /* @__PURE__ */ jsxs(View, { style: S.infoRow, children: [
        /* @__PURE__ */ jsx(Text, { style: S.infoLabel, children: "Address (Patta) :-" }),
        /* @__PURE__ */ jsx(Text, { style: S.infoValue, children: [customer.address, customer.village, customer.taluka, customer.district].filter(Boolean).join(", ") }),
        /* @__PURE__ */ jsx(Text, { style: S.infoSep }),
        /* @__PURE__ */ jsx(Text, { style: S.infoLabel2, children: "Date :-" }),
        /* @__PURE__ */ jsx(Text, { style: S.infoValue2, children: qDate })
      ] }),
      /* @__PURE__ */ jsxs(View, { style: S.infoRow, children: [
        /* @__PURE__ */ jsx(Text, { style: S.infoLabel, children: "Mobile :-" }),
        /* @__PURE__ */ jsx(Text, { style: S.infoValue, children: customer.mobile }),
        /* @__PURE__ */ jsx(Text, { style: S.infoSep }),
        /* @__PURE__ */ jsx(Text, { style: S.infoLabel2, children: spacing ? `Spacing: ${spacing}` : "Crop:" }),
        /* @__PURE__ */ jsx(Text, { style: S.infoValue2, children: quotation.landArea ? `${quotation.landArea} Ha/Acre` : customer.crop ?? "-" })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Text, { style: S.shopName, children: shop.shopName || "SHETKARI RAJA MORE HARDWARE" }),
    shop.address ? /* @__PURE__ */ jsxs(Text, { style: S.shopSub, children: [
      shop.address,
      shop.gstin ? `  |  GSTIN: ${shop.gstin}` : ""
    ] }) : null,
    /* @__PURE__ */ jsx(Text, { style: S.docTitle, children: "SONA DRIP QUOTATION" }),
    /* @__PURE__ */ jsxs(View, { style: S.tHead, children: [
      /* @__PURE__ */ jsx(Text, { style: S.cSr, children: "Sr. No." }),
      /* @__PURE__ */ jsx(Text, { style: S.cDesc, children: "Description" }),
      /* @__PURE__ */ jsx(Text, { style: S.cQty, children: "Qty" }),
      /* @__PURE__ */ jsx(Text, { style: S.cRate, children: "Rate" }),
      /* @__PURE__ */ jsx(Text, { style: S.cAmt, children: "Amount" })
    ] }),
    items.map((item, idx) => /* @__PURE__ */ jsxs(View, { style: idx % 2 === 0 ? S.tRow : S.tRowAlt, children: [
      /* @__PURE__ */ jsx(Text, { style: S.cSr, children: idx + 1 }),
      /* @__PURE__ */ jsx(Text, { style: S.cDesc, children: item.description }),
      /* @__PURE__ */ jsx(Text, { style: S.cQty, children: item.quantity }),
      /* @__PURE__ */ jsx(Text, { style: S.cRate, children: inr(item.sellingRate) }),
      /* @__PURE__ */ jsx(Text, { style: S.cAmt, children: inr(item.amount) })
    ] }, idx)),
    /* @__PURE__ */ jsxs(View, { style: S.totWrap, children: [
      /* @__PURE__ */ jsxs(View, { style: S.totRow, children: [
        /* @__PURE__ */ jsx(Text, { children: "Subtotal" }),
        /* @__PURE__ */ jsx(Text, { children: inr(quotation.subtotal) })
      ] }),
      quotation.fileExpense > 0 && /* @__PURE__ */ jsxs(View, { style: S.totRow, children: [
        /* @__PURE__ */ jsx(Text, { children: "File Exp" }),
        /* @__PURE__ */ jsx(Text, { children: inr(quotation.fileExpense) })
      ] }),
      quotation.otherCharges > 0 && /* @__PURE__ */ jsxs(View, { style: S.totRow, children: [
        /* @__PURE__ */ jsx(Text, { children: "Other Charges" }),
        /* @__PURE__ */ jsx(Text, { children: inr(quotation.otherCharges) })
      ] }),
      /* @__PURE__ */ jsxs(View, { style: S.totRow, children: [
        /* @__PURE__ */ jsxs(Text, { children: [
          "ADD GST @",
          Number(quotation.gstRate),
          "%"
        ] }),
        /* @__PURE__ */ jsx(Text, { children: inr(quotation.gstAmount) })
      ] }),
      /* @__PURE__ */ jsxs(View, { style: S.totRowBold, children: [
        /* @__PURE__ */ jsx(Text, { children: "Total Amt" }),
        /* @__PURE__ */ jsx(Text, { children: inr(quotation.totalAmount) })
      ] })
    ] }),
    quotation.isSubsidyBased && /* @__PURE__ */ jsxs(View, { style: S.subsidyWrap, children: [
      /* @__PURE__ */ jsx(Text, { style: S.subsidyTitle, children: "Government Subsidy (Anudan)" }),
      /* @__PURE__ */ jsxs(View, { style: S.subsidyRow, children: [
        /* @__PURE__ */ jsx(Text, { style: S.subsidyLabel, children: "Subsidy % (Anudan Takka)" }),
        /* @__PURE__ */ jsxs(Text, { style: S.subsidyValue, children: [
          Number(quotation.subsidyPercentage ?? 0),
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(View, { style: S.subsidyRow, children: [
        /* @__PURE__ */ jsx(Text, { style: S.subsidyLabel, children: "Eligible Amount (Patra Rakkam)" }),
        /* @__PURE__ */ jsx(Text, { style: S.subsidyValue, children: inr(quotation.eligibleAmount) })
      ] }),
      /* @__PURE__ */ jsxs(View, { style: S.subsidyRow, children: [
        /* @__PURE__ */ jsxs(Text, { style: S.subsidyLabel, children: [
          "Anudan Vaja ",
          Number(quotation.subsidyPercentage ?? 0),
          "% (Govt. Contribution)"
        ] }),
        /* @__PURE__ */ jsx(Text, { style: S.subsidyValue, children: inr(quotation.subsidyAmount) })
      ] }),
      /* @__PURE__ */ jsxs(View, { style: S.subsidyFarmer, children: [
        /* @__PURE__ */ jsx(Text, { style: S.subsidyFLabel, children: "Shetkari Bharna (Farmer Pays)" }),
        /* @__PURE__ */ jsx(Text, { style: S.subsidyFValue, children: inr(quotation.farmerContribution) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(View, { style: S.footer, children: [
      /* @__PURE__ */ jsxs(View, { style: { width: "58%" }, children: [
        /* @__PURE__ */ jsx(Text, { style: S.termsTitle, children: "Terms and Conditions" }),
        /* @__PURE__ */ jsx(Text, { style: S.termsText, children: shop.termsAndConditions ?? "Prices are subject to change without prior notice. Goods once sold will not be taken back. Subject to stock availability. Quotation valid for 30 days." })
      ] }),
      /* @__PURE__ */ jsxs(View, { style: S.sigBox, children: [
        /* @__PURE__ */ jsx(View, { style: S.sigLine }),
        /* @__PURE__ */ jsx(Text, { style: S.sigLabel, children: "Authorized Signature" }),
        /* @__PURE__ */ jsx(Text, { style: [S.sigLabel, { marginTop: 2 }], children: "(Shop Stamp and Seal)" })
      ] })
    ] }),
    shop.footerText ? /* @__PURE__ */ jsx(Text, { style: S.footNote, children: shop.footerText }) : null
  ] }) });
}

// src/server/pdf/invoicePdf.tsx
import { Document as Document2, Page as Page2, Text as Text2, View as View2, StyleSheet as StyleSheet2 } from "@react-pdf/renderer";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var S2 = StyleSheet2.create({
  page: { padding: 28, fontSize: 9, fontFamily: "Helvetica", color: "#111", backgroundColor: "#fff" },
  /* ── Shop Header ── */
  headerWrap: { marginBottom: 6, borderBottom: "2 solid #1d4ed8", paddingBottom: 6 },
  shopName: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#1d4ed8", textAlign: "center" },
  shopAddr: { fontSize: 8, color: "#444", textAlign: "center" },
  shopGstin: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#b91c1c", textAlign: "center", marginTop: 1 },
  /* ── Meta row: Reverse Charge / Place of Supply / Invoice No / Date ── */
  metaBox: { flexDirection: "row", border: "1 solid #ddd", marginBottom: 4 },
  metaLeft: { flex: 1, padding: "3 5", borderRight: "0.5 solid #ddd" },
  metaRight: { flex: 1, padding: "3 5" },
  metaLine: { fontSize: 8, marginBottom: 1 },
  metaBold: { fontSize: 8, fontFamily: "Helvetica-Bold" },
  /* ── Title ── */
  docTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#1d4ed8",
    marginVertical: 5
  },
  /* ── Customer info ── */
  custBox: { border: "1 solid #ddd", marginBottom: 5 },
  custRow: { flexDirection: "row", borderBottom: "0.5 solid #ddd", padding: "3 5" },
  custLabel: { width: "22%", fontFamily: "Helvetica-Bold", fontSize: 8.5 },
  custValue: { flex: 1, fontSize: 8.5 },
  custLabel2: { width: "14%", fontFamily: "Helvetica-Bold", fontSize: 8.5 },
  custValue2: { width: "24%", fontSize: 8.5 },
  /* ── Items table ── */
  tHead: { flexDirection: "row", backgroundColor: "#1d4ed8", color: "#fff", paddingVertical: 4, paddingHorizontal: 2 },
  tRow: { flexDirection: "row", borderBottom: "0.5 solid #eee", paddingVertical: 3, paddingHorizontal: 2 },
  tRowAlt: { flexDirection: "row", borderBottom: "0.5 solid #eee", paddingVertical: 3, paddingHorizontal: 2, backgroundColor: "#f8faff" },
  cSr: { width: "5%", textAlign: "center" },
  cDesc: { width: "28%", paddingHorizontal: 2 },
  cHsn: { width: "10%", textAlign: "center" },
  cSize: { width: "9%", textAlign: "center" },
  cQty: { width: "8%", textAlign: "right", paddingRight: 2 },
  cUnit: { width: "6%", textAlign: "center" },
  cGovRate: { width: "12%", textAlign: "right", paddingRight: 2 },
  cRate: { width: "10%", textAlign: "right", paddingRight: 2 },
  cAmt: { width: "12%", textAlign: "right", paddingRight: 2 },
  /* ── GST Summary table + Right totals side-by-side ── */
  summaryRow: { flexDirection: "row", marginTop: 6, gap: 8 },
  gstTable: { flex: 1, border: "1 solid #ddd" },
  gstHeadRow: { flexDirection: "row", backgroundColor: "#374151", color: "#fff", paddingVertical: 3 },
  gstRow: { flexDirection: "row", borderBottom: "0.5 solid #eee", paddingVertical: 2 },
  gCol: { flex: 1, textAlign: "center", fontSize: 8 },
  totBox: { width: "42%", border: "1 solid #ddd" },
  totRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2, paddingHorizontal: 5, borderBottom: "0.5 solid #eee" },
  totLabel: { fontSize: 8.5, color: "#333" },
  totValue: { fontSize: 8.5, fontFamily: "Helvetica-Bold" },
  totFinalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 5,
    backgroundColor: "#1d4ed8",
    color: "#fff",
    fontFamily: "Helvetica-Bold",
    fontSize: 11
  },
  /* ── Amount in words ── */
  wordsBox: { marginTop: 5, padding: "3 5", backgroundColor: "#f0f9ff", border: "1 solid #bfdbfe" },
  wordsText: { fontSize: 8.5, fontStyle: "italic" },
  /* ── Certification / footer ── */
  certBox: { marginTop: 8, border: "1 solid #ddd", padding: "5 6", backgroundColor: "#fafafa" },
  certText: { fontSize: 7.5, color: "#555", lineHeight: 1.4 },
  footer: { marginTop: 10, flexDirection: "row", justifyContent: "space-between" },
  payBox: { width: "55%" },
  payTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#1d4ed8", marginBottom: 2 },
  payLine: { fontSize: 8, color: "#444", marginBottom: 1 },
  sigBox: { width: "38%", alignItems: "flex-end" },
  sigLine: { marginTop: 30, width: 130, borderBottom: "1 solid #333" },
  sigLabel: { fontSize: 8, color: "#555", marginTop: 2, textAlign: "right" },
  footNote: { fontSize: 7, color: "#888", marginTop: 10, textAlign: "center" }
});
function inr2(n) {
  const num = Number(n ?? 0);
  return "\u20B9 " + num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function InvoicePdfDocument({ shop, invoice, customer, items }) {
  const iDate = new Date(invoice.invoiceDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const gstRate = invoice.gstRate ?? (items.length > 0 && items[0].taxableValue > 0 ? Math.round(items[0].cgstAmount / items[0].taxableValue * 100 * 2) : 5);
  const notesText = invoice.notes ?? "";
  const setTypeMatch = notesText.match(/संच प्रकार[:\s]*([^\s|]+)/i);
  const setType = setTypeMatch ? setTypeMatch[1] : "Drip / \u0920\u093F\u092C\u0915";
  const spacingMatch = notesText.match(/लागवडीचे अंतर[:\s]*([0-9.]+\s*x\s*[0-9.]+[^|]*)/i);
  const spacing = spacingMatch ? spacingMatch[1].trim() : "-";
  const shiwarMatch = notesText.match(/शिवार[:\s]*([^|]+)/i);
  const shiwar = shiwarMatch ? shiwarMatch[1].trim() : "-";
  return /* @__PURE__ */ jsx2(Document2, { children: /* @__PURE__ */ jsxs2(Page2, { size: "A4", style: S2.page, children: [
    /* @__PURE__ */ jsxs2(View2, { style: S2.headerWrap, children: [
      /* @__PURE__ */ jsx2(Text2, { style: S2.shopName, children: shop.shopName || "SONA IRRIGATION / SHETKARI RAJA MORE HARDWARE" }),
      /* @__PURE__ */ jsx2(Text2, { style: S2.shopAddr, children: "Authorized Dealer: Sona Poly Plast Pvt. Ltd." }),
      shop.address ? /* @__PURE__ */ jsx2(Text2, { style: S2.shopAddr, children: shop.address }) : null,
      /* @__PURE__ */ jsxs2(Text2, { style: S2.shopAddr, children: [
        "Mob: ",
        shop.mobile || "9420032642, 8766420075"
      ] }),
      /* @__PURE__ */ jsxs2(Text2, { style: S2.shopGstin, children: [
        "GSTIN: ",
        shop.gstin || "27ABVPT3736N1Z9"
      ] })
    ] }),
    /* @__PURE__ */ jsxs2(View2, { style: S2.metaBox, children: [
      /* @__PURE__ */ jsxs2(View2, { style: S2.metaLeft, children: [
        /* @__PURE__ */ jsx2(Text2, { style: S2.metaLine, children: "Under Jurisdiction of: Kopargaon" }),
        /* @__PURE__ */ jsx2(Text2, { style: S2.metaLine, children: "Reverse Charge: No  |  Place of Supply: 27 - Maharashtra" }),
        /* @__PURE__ */ jsxs2(Text2, { style: S2.metaBold, children: [
          "Set Type (Sanch Prakar): ",
          setType
        ] })
      ] }),
      /* @__PURE__ */ jsxs2(View2, { style: S2.metaRight, children: [
        /* @__PURE__ */ jsxs2(Text2, { style: S2.metaBold, children: [
          "Bill No.: ",
          /* @__PURE__ */ jsx2(Text2, { style: { color: "#b91c1c" }, children: invoice.invoiceNumber })
        ] }),
        /* @__PURE__ */ jsxs2(Text2, { style: S2.metaLine, children: [
          "Date: ",
          iDate
        ] }),
        /* @__PURE__ */ jsxs2(Text2, { style: S2.metaLine, children: [
          "State: ",
          shop.state ?? "27 - Maharashtra"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx2(Text2, { style: S2.docTitle, children: "TAX INVOICE" }),
    /* @__PURE__ */ jsxs2(View2, { style: S2.custBox, children: [
      /* @__PURE__ */ jsxs2(View2, { style: S2.custRow, children: [
        /* @__PURE__ */ jsx2(Text2, { style: S2.custLabel, children: "Farmer's Name:" }),
        /* @__PURE__ */ jsx2(Text2, { style: S2.custValue, children: customer.fullName }),
        /* @__PURE__ */ jsx2(Text2, { style: S2.custLabel2, children: "Village (Gao):" }),
        /* @__PURE__ */ jsx2(Text2, { style: S2.custValue2, children: customer.village ?? "-" })
      ] }),
      /* @__PURE__ */ jsxs2(View2, { style: S2.custRow, children: [
        /* @__PURE__ */ jsx2(Text2, { style: S2.custLabel, children: "Mobile No.:" }),
        /* @__PURE__ */ jsx2(Text2, { style: S2.custValue, children: customer.mobile }),
        /* @__PURE__ */ jsx2(Text2, { style: S2.custLabel2, children: "Shiwar:" }),
        /* @__PURE__ */ jsx2(Text2, { style: S2.custValue2, children: shiwar })
      ] }),
      /* @__PURE__ */ jsxs2(View2, { style: S2.custRow, children: [
        /* @__PURE__ */ jsx2(Text2, { style: S2.custLabel, children: "Taluka / District:" }),
        /* @__PURE__ */ jsxs2(Text2, { style: S2.custValue, children: [
          customer.taluka ?? "-",
          ", ",
          customer.district ?? "-"
        ] }),
        /* @__PURE__ */ jsx2(Text2, { style: S2.custLabel2, children: "Gat / Sr No.:" }),
        /* @__PURE__ */ jsx2(Text2, { style: S2.custValue2, children: customer.gatNumber ?? customer.surveyNumber ?? "-" })
      ] }),
      /* @__PURE__ */ jsxs2(View2, { style: S2.custRow, children: [
        /* @__PURE__ */ jsx2(Text2, { style: S2.custLabel, children: "Area & Crop:" }),
        /* @__PURE__ */ jsxs2(Text2, { style: S2.custValue, children: [
          customer.landArea ? `${customer.landArea} Ha/Acre` : "-",
          " | Crop: ",
          customer.crop ?? "-"
        ] }),
        /* @__PURE__ */ jsx2(Text2, { style: S2.custLabel2, children: "Spacing:" }),
        /* @__PURE__ */ jsx2(Text2, { style: S2.custValue2, children: spacing })
      ] })
    ] }),
    /* @__PURE__ */ jsxs2(View2, { style: S2.tHead, children: [
      /* @__PURE__ */ jsx2(Text2, { style: S2.cSr, children: "Sr" }),
      /* @__PURE__ */ jsx2(Text2, { style: S2.cDesc, children: "Product Description" }),
      /* @__PURE__ */ jsx2(Text2, { style: S2.cHsn, children: "HSN / BIS" }),
      /* @__PURE__ */ jsx2(Text2, { style: S2.cSize, children: "Size" }),
      /* @__PURE__ */ jsx2(Text2, { style: S2.cQty, children: "Qty" }),
      /* @__PURE__ */ jsx2(Text2, { style: S2.cUnit, children: "Unit" }),
      /* @__PURE__ */ jsx2(Text2, { style: S2.cGovRate, children: "Govt. Rate" }),
      /* @__PURE__ */ jsx2(Text2, { style: S2.cRate, children: "Rate" }),
      /* @__PURE__ */ jsx2(Text2, { style: S2.cAmt, children: "Amount" })
    ] }),
    items.map((item, idx) => /* @__PURE__ */ jsxs2(View2, { style: idx % 2 === 0 ? S2.tRow : S2.tRowAlt, children: [
      /* @__PURE__ */ jsx2(Text2, { style: S2.cSr, children: idx + 1 }),
      /* @__PURE__ */ jsx2(Text2, { style: S2.cDesc, children: item.description }),
      /* @__PURE__ */ jsx2(Text2, { style: S2.cHsn, children: item.hsnCode ?? "-" }),
      /* @__PURE__ */ jsx2(Text2, { style: S2.cSize, children: "-" }),
      /* @__PURE__ */ jsx2(Text2, { style: S2.cQty, children: item.quantity }),
      /* @__PURE__ */ jsx2(Text2, { style: S2.cUnit, children: item.unit }),
      /* @__PURE__ */ jsx2(Text2, { style: S2.cGovRate, children: inr2(item.rate) }),
      /* @__PURE__ */ jsx2(Text2, { style: S2.cRate, children: inr2(item.rate) }),
      /* @__PURE__ */ jsx2(Text2, { style: S2.cAmt, children: inr2(item.taxableValue) })
    ] }, idx)),
    /* @__PURE__ */ jsxs2(View2, { style: S2.summaryRow, children: [
      /* @__PURE__ */ jsxs2(View2, { style: S2.gstTable, children: [
        /* @__PURE__ */ jsxs2(View2, { style: S2.gstHeadRow, children: [
          /* @__PURE__ */ jsx2(Text2, { style: [S2.gCol, { fontFamily: "Helvetica-Bold" }], children: "GST" }),
          /* @__PURE__ */ jsx2(Text2, { style: [S2.gCol, { fontFamily: "Helvetica-Bold" }], children: "Gross Amt" }),
          /* @__PURE__ */ jsx2(Text2, { style: [S2.gCol, { fontFamily: "Helvetica-Bold" }], children: "CGST Rate" }),
          /* @__PURE__ */ jsx2(Text2, { style: [S2.gCol, { fontFamily: "Helvetica-Bold" }], children: "CGST Amt" }),
          /* @__PURE__ */ jsx2(Text2, { style: [S2.gCol, { fontFamily: "Helvetica-Bold" }], children: "SGST Rate" }),
          /* @__PURE__ */ jsx2(Text2, { style: [S2.gCol, { fontFamily: "Helvetica-Bold" }], children: "SGST Amt" }),
          /* @__PURE__ */ jsx2(Text2, { style: [S2.gCol, { fontFamily: "Helvetica-Bold" }], children: "Total GST" }),
          /* @__PURE__ */ jsx2(Text2, { style: [S2.gCol, { fontFamily: "Helvetica-Bold" }], children: "Bill Amt" })
        ] }),
        /* @__PURE__ */ jsxs2(View2, { style: S2.gstRow, children: [
          /* @__PURE__ */ jsxs2(Text2, { style: S2.gCol, children: [
            gstRate,
            "%"
          ] }),
          /* @__PURE__ */ jsx2(Text2, { style: S2.gCol, children: inr2(invoice.subtotal) }),
          /* @__PURE__ */ jsxs2(Text2, { style: S2.gCol, children: [
            Number(gstRate) / 2,
            "%"
          ] }),
          /* @__PURE__ */ jsx2(Text2, { style: S2.gCol, children: inr2(invoice.cgst) }),
          /* @__PURE__ */ jsxs2(Text2, { style: S2.gCol, children: [
            Number(gstRate) / 2,
            "%"
          ] }),
          /* @__PURE__ */ jsx2(Text2, { style: S2.gCol, children: inr2(invoice.sgst) }),
          /* @__PURE__ */ jsx2(Text2, { style: S2.gCol, children: inr2(invoice.gstAmount) }),
          /* @__PURE__ */ jsx2(Text2, { style: S2.gCol, children: inr2(invoice.totalAmount) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs2(View2, { style: S2.totBox, children: [
        /* @__PURE__ */ jsxs2(View2, { style: S2.totRow, children: [
          /* @__PURE__ */ jsx2(Text2, { style: S2.totLabel, children: "Gross Amount (Ekun Rakkam)" }),
          /* @__PURE__ */ jsx2(Text2, { style: S2.totValue, children: inr2(invoice.subtotal) })
        ] }),
        /* @__PURE__ */ jsxs2(View2, { style: S2.totRow, children: [
          /* @__PURE__ */ jsx2(Text2, { style: S2.totLabel, children: "Discount" }),
          /* @__PURE__ */ jsx2(Text2, { style: S2.totValue, children: inr2(invoice.discount) })
        ] }),
        /* @__PURE__ */ jsxs2(View2, { style: S2.totRow, children: [
          /* @__PURE__ */ jsx2(Text2, { style: S2.totLabel, children: "Installation" }),
          /* @__PURE__ */ jsx2(Text2, { style: S2.totValue, children: "0" })
        ] }),
        /* @__PURE__ */ jsxs2(View2, { style: S2.totRow, children: [
          /* @__PURE__ */ jsx2(Text2, { style: S2.totLabel, children: "Total GST (Ekun GST)" }),
          /* @__PURE__ */ jsx2(Text2, { style: S2.totValue, children: inr2(invoice.gstAmount) })
        ] }),
        /* @__PURE__ */ jsxs2(View2, { style: S2.totRow, children: [
          /* @__PURE__ */ jsx2(Text2, { style: S2.totLabel, children: "Round Off" }),
          /* @__PURE__ */ jsx2(Text2, { style: S2.totValue, children: inr2(invoice.roundOff) })
        ] }),
        /* @__PURE__ */ jsxs2(View2, { style: S2.totFinalRow, children: [
          /* @__PURE__ */ jsx2(Text2, { children: "Bill Amount" }),
          /* @__PURE__ */ jsx2(Text2, { children: inr2(invoice.totalAmount) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx2(View2, { style: S2.wordsBox, children: /* @__PURE__ */ jsxs2(Text2, { style: S2.wordsText, children: [
      "Amount in Words: ",
      amountInWords(invoice.totalAmount)
    ] }) }),
    /* @__PURE__ */ jsxs2(View2, { style: S2.footer, children: [
      /* @__PURE__ */ jsxs2(View2, { style: S2.payBox, children: [
        /* @__PURE__ */ jsx2(Text2, { style: S2.payTitle, children: "Payment Details" }),
        shop.bankName ? /* @__PURE__ */ jsxs2(Text2, { style: S2.payLine, children: [
          "Bank: ",
          shop.bankName
        ] }) : null,
        shop.bankAccountNumber ? /* @__PURE__ */ jsxs2(Text2, { style: S2.payLine, children: [
          "A/c No: ",
          shop.bankAccountNumber
        ] }) : null,
        shop.bankIfsc ? /* @__PURE__ */ jsxs2(Text2, { style: S2.payLine, children: [
          "IFSC: ",
          shop.bankIfsc
        ] }) : null,
        shop.upiId ? /* @__PURE__ */ jsxs2(Text2, { style: S2.payLine, children: [
          "UPI: ",
          shop.upiId
        ] }) : null,
        /* @__PURE__ */ jsx2(Text2, { style: [S2.payLine, { marginTop: 6, fontSize: 7.5, color: "#666", lineHeight: 1.4 }], children: "Certification: The financial transaction for this invoice has been done between the farmer and the distributor and the distributor is responsible for it. As per government norms, all the components/quantities of this invoice must be submitted for verification." })
      ] }),
      /* @__PURE__ */ jsxs2(View2, { style: S2.sigBox, children: [
        /* @__PURE__ */ jsx2(View2, { style: S2.sigLine }),
        /* @__PURE__ */ jsx2(Text2, { style: S2.sigLabel, children: "Authorized Signature" }),
        /* @__PURE__ */ jsx2(Text2, { style: [S2.sigLabel, { marginTop: 1 }], children: "(Stamp and Seal)" })
      ] })
    ] }),
    shop.footerText ? /* @__PURE__ */ jsx2(Text2, { style: S2.footNote, children: shop.footerText }) : null
  ] }) });
}

// src/server/pdf/miniSprinklerPdf.tsx
import { Document as Document3, Page as Page3, Text as Text3, View as View3, StyleSheet as StyleSheet3 } from "@react-pdf/renderer";
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
var S3 = StyleSheet3.create({
  page: {
    padding: 24,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#000",
    backgroundColor: "#fff"
  },
  headerWrap: {
    textAlign: "center",
    marginBottom: 8,
    alignItems: "center"
  },
  shopTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
    marginBottom: 3,
    textAlign: "center"
  },
  docSubTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
    marginBottom: 3,
    textAlign: "center"
  },
  headerContact: {
    fontSize: 8.5,
    color: "#222",
    textAlign: "center"
  },
  // 2-Column Metadata Box with grid borders
  metaTable: {
    border: "0.8 solid #555",
    marginBottom: 8
  },
  metaRow: {
    flexDirection: "row",
    borderBottom: "0.5 solid #777",
    minHeight: 18,
    alignItems: "center"
  },
  metaRowLast: {
    flexDirection: "row",
    minHeight: 18,
    alignItems: "center"
  },
  metaLabel1: {
    width: "18%",
    fontFamily: "Helvetica",
    fontSize: 8.5,
    paddingVertical: 2.5,
    paddingHorizontal: 5,
    borderRight: "0.5 solid #777"
  },
  metaValue1: {
    width: "32%",
    fontFamily: "Helvetica",
    fontSize: 8.5,
    paddingVertical: 2.5,
    paddingHorizontal: 5,
    borderRight: "0.8 solid #555",
    overflow: "hidden"
  },
  metaLabel2: {
    width: "18%",
    fontFamily: "Helvetica",
    fontSize: 8.5,
    paddingVertical: 2.5,
    paddingHorizontal: 5,
    borderRight: "0.5 solid #777"
  },
  metaValue2: {
    width: "32%",
    fontFamily: "Helvetica",
    fontSize: 8.5,
    paddingVertical: 2.5,
    paddingHorizontal: 5,
    overflow: "hidden"
  },
  // Section Banner
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica",
    letterSpacing: 1,
    textAlign: "center",
    marginVertical: 4,
    textTransform: "uppercase"
  },
  // Table
  tableWrap: {
    border: "0.8 solid #555",
    marginBottom: 6
  },
  tHead: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    borderBottom: "0.8 solid #555",
    minHeight: 20,
    alignItems: "center"
  },
  tHeadCell: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    paddingVertical: 3,
    paddingHorizontal: 3,
    color: "#000"
  },
  tRow: {
    flexDirection: "row",
    borderBottom: "0.5 solid #ccc",
    minHeight: 17,
    alignItems: "center"
  },
  tRowAlt: {
    flexDirection: "row",
    borderBottom: "0.5 solid #ccc",
    minHeight: 17,
    alignItems: "center",
    backgroundColor: "#fafafa"
  },
  tCell: {
    fontSize: 8,
    paddingVertical: 2.5,
    paddingHorizontal: 3
  },
  // Column Widths matching reference image
  cSr: { width: "7%", textAlign: "center", borderRight: "0.5 solid #ccc" },
  cDesc: { width: "47%", borderRight: "0.5 solid #ccc", paddingLeft: 4 },
  cQty: { width: "11%", textAlign: "right", paddingRight: 6, borderRight: "0.5 solid #ccc" },
  cUnit: { width: "9%", textAlign: "center", borderRight: "0.5 solid #ccc" },
  cRate: { width: "13%", textAlign: "right", paddingRight: 6, borderRight: "0.5 solid #ccc" },
  cAmt: { width: "13%", textAlign: "right", paddingRight: 6 },
  // Totals Box (Right Aligned)
  totalsSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 2,
    marginBottom: 10
  },
  totalsBox: {
    width: "40%",
    border: "0.8 solid #555"
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: "0.5 solid #777",
    paddingVertical: 3,
    paddingHorizontal: 6
  },
  totalRowBold: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: "0.5 solid #777",
    paddingVertical: 3.5,
    paddingHorizontal: 6,
    fontFamily: "Helvetica-Bold"
  },
  totalRowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3.5,
    paddingHorizontal: 6,
    fontFamily: "Helvetica-Bold"
  },
  totLabel: {
    fontSize: 8.5,
    fontFamily: "Helvetica"
  },
  totLabelBold: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold"
  },
  totVal: {
    fontSize: 8.5,
    fontFamily: "Helvetica",
    textAlign: "right"
  },
  totValBold: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    textAlign: "right"
  },
  // Footer / Signatures
  footerWrap: {
    marginTop: 8,
    borderTop: "0.5 solid #999",
    paddingTop: 6
  },
  signRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 4,
    marginBottom: 6
  },
  signLabel: {
    fontSize: 8.5,
    fontFamily: "Helvetica"
  },
  signOwner: {
    fontSize: 8.5,
    fontFamily: "Helvetica"
  },
  noteText: {
    fontSize: 7.5,
    color: "#333",
    marginTop: 4,
    fontStyle: "italic"
  }
});
function format2(val) {
  const num = Number(val ?? 0);
  return num.toFixed(2);
}
var MARATHI_TO_ENGLISH_DESCRIPTIONS = [
  [/पुरुष\s*थ्रेडेड.*पूर्ण\s*वर्तुळ/i, 'Male threaded Sprinkler 1/2" (full circle) 10 to 12 m radius throw, (350 to 1200 LPH)'],
  [/पुरुष\s*थ्रेडेड.*अंशतः\s*वर्तुळ/i, 'Male threaded Sprinkler 1/2" (part circle) 10 to 12 m radius throw, (350 to 1200 LPH)'],
  [/ट्यूब\s*असेंब्ली.*1\.2/i, "Tube Assembly 1.2 mtr (Tube + Adopter + Male & Female connector)"],
  [/ट्यूब\s*असेंब्ली.*1\.5/i, "Tube Assembly 1.5 mtr (Tube + Adopter + Male & Female connector)"],
  [/अॅडॉप्टर|अॅडाप्टर/i, "Adopter for mini Sprinkler"],
  [/पुरुष.*महिला\s*कनेक्टर/i, "Male Female Connector"],
  [/प्लग\s*9\/12/i, "Plug 9/12 mm"],
  [/एक्स्टेंशन\s*ट्यूब.*1\.2/i, "Extention Tube 12 mm (1.2 mtr long)"],
  [/एक्स्टेंशन\s*ट्यूब.*1\.5/i, "Extention Tube 12 mm (1.5 mtr long)"],
  [/इन्स्टॉलेशन\s*स्टेक.*त्रिशूळ/i, "Installation Stake (1.2 mtr long 8 mm dia.) Trishul Type"],
  [/इन्स्टॉलेशन\s*स्टेक.*साधा/i, "Installation Stake (1.2 mtr long 8 mm dia.) Plain Type"],
  [/सर्व्हिस\s*सॅडल.*63/i, 'Service Saddle 63 mm x 1"'],
  [/सर्व्हिस\s*सॅडल.*75/i, 'Service Saddle 75 mm x 1"'],
  [/सर्व्हिस\s*सॅडल.*90/i, 'Service Saddle 90 mm x 1"'],
  [/सर्व्हिस\s*सॅडल.*110/i, 'Service Saddle 110 mm x 1"'],
  [/बॉल\s*व्हॉल्व्ह.*32/i, "Ball Valve 32 mm PP"],
  [/मेल\s*थ्रेडेड\s*एल्बो/i, "Male Threaded Elbow Compression 32 mm"],
  [/मेल\s*थ्रेडेड\s*टी/i, "Male Threaded Tee Compression 32 mm"],
  [/मेल\s*थ्रेडेड\s*अॅडॉप्टर/i, "Male Threaded Adopter Compression 32 mm"],
  [/कपलिंग\s*कॉम्प्रेशन/i, "Coupling Compression 32 mm"],
  [/एंड\s*कॅप\s*कॉम्प्रेशन/i, "End Cap Compression 32 mm"],
  [/कपलिंग\s*एल्बो/i, "Coupling Elbow compression 32 mm"],
  [/कपलिंग\s*टी/i, "Coupling Tee compression 32 mm"]
];
var DEVA_CHAR_MAP = {
  "\u0905": "A",
  "\u0906": "Aa",
  "\u0907": "I",
  "\u0908": "Ee",
  "\u0909": "U",
  "\u090A": "Oo",
  "\u090B": "Ri",
  "\u090F": "E",
  "\u0910": "Ai",
  "\u0913": "O",
  "\u0914": "Au",
  "\u0915": "k",
  "\u0916": "kh",
  "\u0917": "g",
  "\u0918": "gh",
  "\u0919": "ng",
  "\u091A": "ch",
  "\u091B": "chh",
  "\u091C": "j",
  "\u091D": "jh",
  "\u091E": "ny",
  "\u091F": "t",
  "\u0920": "th",
  "\u0921": "d",
  "\u0922": "dh",
  "\u0923": "n",
  "\u0924": "t",
  "\u0925": "th",
  "\u0926": "d",
  "\u0927": "dh",
  "\u0928": "n",
  "\u092A": "p",
  "\u092B": "ph",
  "\u092C": "b",
  "\u092D": "bh",
  "\u092E": "m",
  "\u092F": "y",
  "\u0930": "r",
  "\u0932": "l",
  "\u0935": "v",
  "\u0936": "sh",
  "\u0937": "sh",
  "\u0938": "s",
  "\u0939": "h",
  "\u0933": "l",
  "\u0915\u094D\u0937": "ksh",
  "\u091C\u094D\u091E": "dny",
  "\u093E": "a",
  "\u093F": "i",
  "\u0940": "ee",
  "\u0941": "u",
  "\u0942": "oo",
  "\u0943": "ri",
  "\u0947": "e",
  "\u0948": "ai",
  "\u094B": "o",
  "\u094C": "au",
  "\u0902": "n",
  "\u0903": "h",
  "\u094D": "",
  "\u0945": "e",
  "\u0949": "o",
  "\u0966": "0",
  "\u0967": "1",
  "\u0968": "2",
  "\u0969": "3",
  "\u096A": "4",
  "\u096B": "5",
  "\u096C": "6",
  "\u096D": "7",
  "\u096E": "8",
  "\u096F": "9"
};
function cleanTextForPdf(str, fallback = "") {
  if (!str) return fallback;
  if (/[\u0900-\u097F]/.test(str)) {
    for (const [pattern, eng] of MARATHI_TO_ENGLISH_DESCRIPTIONS) {
      if (pattern.test(str)) return eng;
    }
    if (str.includes("\u0932\u093E\u0916") || str.includes("\u0916\u0902\u0921\u093E\u0933\u093E")) return "Lakh Khandala";
    if (str.includes("\u0935\u0948\u091C\u093E\u092A\u0942\u0930")) return "Vaijapur";
    if (str.includes("\u0938\u0902\u092D\u093E\u091C\u0940\u0928\u0917\u0930") || str.includes("\u0914\u0930\u0902\u0917\u093E\u092C\u093E\u0926")) return "Chh. Sambhajinagar";
    if (str.includes("\u092E\u0939\u093E\u0930\u093E\u0937\u094D\u091F\u094D\u0930")) return "Maharashtra";
    let res = "";
    for (const ch of str) {
      if (DEVA_CHAR_MAP[ch] !== void 0) {
        res += DEVA_CHAR_MAP[ch];
      } else if (ch.charCodeAt(0) < 128) {
        res += ch;
      }
    }
    return res.trim() || fallback;
  }
  return str.replace(/½/g, "1/2").replace(/¼/g, "1/4").replace(/¾/g, "3/4");
}
function MiniSprinklerPdfDocument({
  documentType,
  docNumber,
  docDate,
  shop,
  customer,
  items,
  totals,
  customNote
}) {
  const isInvoice = documentType === "INVOICE";
  const titleDoc = isInvoice ? "MINI SPRINKLER TAX INVOICE" : "MINI SPRINKLER QUOTATION";
  const numLabel = isInvoice ? "Invoice No." : "Quotation No.";
  const shopName = "SHETKARI RAJA HARDWARE AND ELECTRICALS";
  const shopOwner = "Vaibhav Santosh More";
  const shopAddress = "Lakh Khandala, Vaijapur, Maharashtra";
  const shopMobile = "8010741843";
  const shopTaluka = "Vaijapur";
  const shopState = "Maharashtra";
  const customerName = cleanTextForPdf(customer.fullName, "VISHAL DEEPAK KHAIRNAR").toUpperCase();
  const customerMobile = (customer.mobile || "8010741843").trim();
  const customerVillage = cleanTextForPdf(customer.village, "Lakh Khandala");
  const customerState = cleanTextForPdf(customer.state, "Maharashtra");
  const farmerShareVal = totals.farmerShare ?? 0;
  const balanceVal = totals.balance != null ? totals.balance : Math.max(0, totals.grandTotal - farmerShareVal);
  const defaultNote = cleanTextForPdf(customNote) || "Note: Quotation prepared using the product, quantity and rate details visible in the supplied reference sheet.";
  return /* @__PURE__ */ jsx3(Document3, { children: /* @__PURE__ */ jsxs3(Page3, { size: "A4", style: S3.page, children: [
    /* @__PURE__ */ jsxs3(View3, { style: S3.headerWrap, children: [
      /* @__PURE__ */ jsx3(Text3, { style: S3.shopTitle, children: shopName }),
      /* @__PURE__ */ jsx3(Text3, { style: S3.docSubTitle, children: titleDoc }),
      /* @__PURE__ */ jsxs3(Text3, { style: S3.headerContact, children: [
        shopAddress,
        " | Mobile: ",
        shopMobile
      ] })
    ] }),
    /* @__PURE__ */ jsxs3(View3, { style: S3.metaTable, children: [
      /* @__PURE__ */ jsxs3(View3, { style: S3.metaRow, children: [
        /* @__PURE__ */ jsx3(Text3, { style: S3.metaLabel1, children: "Shop Owner" }),
        /* @__PURE__ */ jsx3(Text3, { style: S3.metaValue1, children: shopOwner }),
        /* @__PURE__ */ jsx3(Text3, { style: S3.metaLabel2, children: numLabel }),
        /* @__PURE__ */ jsx3(Text3, { style: [S3.metaValue2, { fontFamily: "Helvetica-Bold" }], children: docNumber })
      ] }),
      /* @__PURE__ */ jsxs3(View3, { style: S3.metaRow, children: [
        /* @__PURE__ */ jsx3(Text3, { style: S3.metaLabel1, children: "Shop Mobile" }),
        /* @__PURE__ */ jsx3(Text3, { style: S3.metaValue1, children: shopMobile }),
        /* @__PURE__ */ jsx3(Text3, { style: S3.metaLabel2, children: "Date" }),
        /* @__PURE__ */ jsx3(Text3, { style: S3.metaValue2, children: docDate })
      ] }),
      /* @__PURE__ */ jsxs3(View3, { style: S3.metaRow, children: [
        /* @__PURE__ */ jsx3(Text3, { style: S3.metaLabel1, children: "Shop Address" }),
        /* @__PURE__ */ jsx3(Text3, { style: S3.metaValue1, children: shopAddress }),
        /* @__PURE__ */ jsx3(Text3, { style: S3.metaLabel2, children: "Customer" }),
        /* @__PURE__ */ jsx3(Text3, { style: [S3.metaValue2, { fontFamily: "Helvetica-Bold" }], children: customerName })
      ] }),
      /* @__PURE__ */ jsxs3(View3, { style: S3.metaRow, children: [
        /* @__PURE__ */ jsx3(Text3, { style: S3.metaLabel1, children: "Customer Mobile" }),
        /* @__PURE__ */ jsx3(Text3, { style: S3.metaValue1, children: customerMobile }),
        /* @__PURE__ */ jsx3(Text3, { style: S3.metaLabel2, children: "Village" }),
        /* @__PURE__ */ jsx3(Text3, { style: S3.metaValue2, children: customerVillage })
      ] }),
      /* @__PURE__ */ jsxs3(View3, { style: S3.metaRowLast, children: [
        /* @__PURE__ */ jsx3(Text3, { style: S3.metaLabel1, children: "Taluka" }),
        /* @__PURE__ */ jsx3(Text3, { style: S3.metaValue1, children: shopTaluka }),
        /* @__PURE__ */ jsx3(Text3, { style: S3.metaLabel2, children: "State" }),
        /* @__PURE__ */ jsx3(Text3, { style: S3.metaValue2, children: customerState })
      ] })
    ] }),
    /* @__PURE__ */ jsx3(Text3, { style: S3.sectionTitle, children: "PRODUCT DETAILS" }),
    /* @__PURE__ */ jsxs3(View3, { style: S3.tableWrap, children: [
      /* @__PURE__ */ jsxs3(View3, { style: S3.tHead, children: [
        /* @__PURE__ */ jsx3(Text3, { style: [S3.tHeadCell, S3.cSr], children: "Sr No" }),
        /* @__PURE__ */ jsx3(Text3, { style: [S3.tHeadCell, S3.cDesc], children: "Product Description" }),
        /* @__PURE__ */ jsx3(Text3, { style: [S3.tHeadCell, S3.cQty], children: "Quantity" }),
        /* @__PURE__ */ jsx3(Text3, { style: [S3.tHeadCell, S3.cUnit], children: "Unit" }),
        /* @__PURE__ */ jsx3(Text3, { style: [S3.tHeadCell, S3.cRate], children: "Rate (Rs.)" }),
        /* @__PURE__ */ jsx3(Text3, { style: [S3.tHeadCell, S3.cAmt], children: "Amount (Rs.)" })
      ] }),
      items.map((item, idx) => {
        const desc = cleanTextForPdf(item.description);
        return /* @__PURE__ */ jsxs3(View3, { style: idx % 2 === 0 ? S3.tRow : S3.tRowAlt, children: [
          /* @__PURE__ */ jsx3(Text3, { style: [S3.tCell, S3.cSr], children: idx + 1 }),
          /* @__PURE__ */ jsx3(Text3, { style: [S3.tCell, S3.cDesc], children: desc }),
          /* @__PURE__ */ jsx3(Text3, { style: [S3.tCell, S3.cQty], children: item.quantity }),
          /* @__PURE__ */ jsx3(Text3, { style: [S3.tCell, S3.cUnit], children: item.unit || "NOS" }),
          /* @__PURE__ */ jsx3(Text3, { style: [S3.tCell, S3.cRate], children: format2(item.rate) }),
          /* @__PURE__ */ jsx3(Text3, { style: [S3.tCell, S3.cAmt], children: format2(item.amount) })
        ] }, idx);
      })
    ] }),
    /* @__PURE__ */ jsx3(View3, { style: S3.totalsSection, children: /* @__PURE__ */ jsxs3(View3, { style: S3.totalsBox, children: [
      /* @__PURE__ */ jsxs3(View3, { style: S3.totalRow, children: [
        /* @__PURE__ */ jsx3(Text3, { style: S3.totLabelBold, children: "TOTAL" }),
        /* @__PURE__ */ jsx3(Text3, { style: S3.totValBold, children: format2(totals.subtotal) })
      ] }),
      /* @__PURE__ */ jsxs3(View3, { style: S3.totalRow, children: [
        /* @__PURE__ */ jsxs3(Text3, { style: S3.totLabel, children: [
          "GST ",
          totals.gstRate,
          "%"
        ] }),
        /* @__PURE__ */ jsx3(Text3, { style: S3.totVal, children: format2(totals.gstAmount) })
      ] }),
      /* @__PURE__ */ jsxs3(View3, { style: S3.totalRowBold, children: [
        /* @__PURE__ */ jsx3(Text3, { style: S3.totLabelBold, children: "GRAND TOTAL" }),
        /* @__PURE__ */ jsx3(Text3, { style: S3.totValBold, children: format2(totals.grandTotal) })
      ] }),
      /* @__PURE__ */ jsxs3(View3, { style: S3.totalRow, children: [
        /* @__PURE__ */ jsx3(Text3, { style: S3.totLabel, children: "FARMER SHARE" }),
        /* @__PURE__ */ jsx3(Text3, { style: S3.totVal, children: format2(farmerShareVal) })
      ] }),
      /* @__PURE__ */ jsxs3(View3, { style: S3.totalRowLast, children: [
        /* @__PURE__ */ jsx3(Text3, { style: S3.totLabelBold, children: "BALANCE" }),
        /* @__PURE__ */ jsx3(Text3, { style: S3.totValBold, children: format2(balanceVal) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs3(View3, { style: S3.footerWrap, children: [
      /* @__PURE__ */ jsxs3(View3, { style: S3.signRow, children: [
        /* @__PURE__ */ jsx3(Text3, { style: S3.signLabel, children: "Customer Signature: __________________" }),
        /* @__PURE__ */ jsxs3(Text3, { style: S3.signOwner, children: [
          "Authorized Shop Owner: ",
          shopOwner
        ] })
      ] }),
      /* @__PURE__ */ jsx3(Text3, { style: S3.noteText, children: defaultNote })
    ] })
  ] }) });
}

// src/server/controllers/pdf.controller.ts
async function getShop() {
  const shop = await prisma.shopSettings.findFirst();
  return {
    shopName: shop?.shopName || "SHETKARI RAJA HARDWARE AND ELECTRICALS",
    shopOwner: "Vaibhav Santosh More",
    address: shop?.address || "Lakh Khandala, Vaijapur, Maharashtra",
    mobile: shop?.mobile || "8010741843",
    taluka: "Vaijapur",
    state: shop?.state || "Maharashtra",
    gstin: shop?.gstin || null,
    footerText: shop?.footerText || null,
    termsAndConditions: shop?.termsAndConditions || null,
    bankName: shop?.bankName || null,
    bankAccountNumber: shop?.bankAccountNumber || null,
    bankIfsc: shop?.bankIfsc || null,
    upiId: shop?.upiId || null
  };
}
async function quotationPdf(req, res, next) {
  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: req.params.id },
      include: { customer: true, items: true }
    });
    if (!quotation) throw AppError.notFound("Quotation not found");
    const shop = await getShop();
    const isMiniSprinkler = req.query.format === "mini-sprinkler" || req.query.format === "clean" || quotation.notes?.includes("\u092E\u093F\u0928\u0940 \u0938\u094D\u092A\u094D\u0930\u093F\u0902\u0915\u0932\u0930") || quotation.notes?.includes("Mini Sprinkler");
    let buffer;
    if (isMiniSprinkler) {
      const qDate = new Date(quotation.quotationDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
      const farmerShare = quotation.farmerContribution ? Number(quotation.farmerContribution) : null;
      const subtotal = Number(quotation.subtotal);
      const gstRate = Number(quotation.gstRate);
      const gstAmount = Number(quotation.gstAmount);
      const grandTotal = Number(quotation.totalAmount);
      const balance = farmerShare != null ? Math.max(0, grandTotal - farmerShare) : grandTotal;
      buffer = await renderToBuffer(
        React.createElement(MiniSprinklerPdfDocument, {
          documentType: "QUOTATION",
          docNumber: quotation.quotationNumber,
          docDate: qDate,
          shop: {
            shopName: "SHETKARI RAJA HARDWARE AND ELECTRICALS",
            shopOwner: "Vaibhav Santosh More",
            address: "Lakh Khandala, Vaijapur, Maharashtra",
            mobile: "8010741843",
            taluka: "Vaijapur",
            state: "Maharashtra"
          },
          customer: {
            fullName: quotation.customer.fullName,
            mobile: quotation.customer.mobile,
            village: quotation.customer.village || "Lakh Khandala",
            taluka: quotation.customer.taluka || "Vaijapur",
            state: quotation.customer.state || "Maharashtra"
          },
          items: quotation.items.map((i) => ({
            description: i.description,
            quantity: Number(i.quantity),
            unit: i.unit,
            rate: Number(i.sellingRate),
            amount: Number(i.amount)
          })),
          totals: {
            subtotal,
            gstRate,
            gstAmount,
            grandTotal,
            farmerShare,
            balance
          },
          customNote: quotation.notes?.replace(/मिनी स्प्रिंकलर[^|]*\|?/g, "").trim() || null
        })
      );
    } else {
      buffer = await renderToBuffer(
        React.createElement(QuotationPdfDocument, {
          shop,
          quotation: {
            quotationNumber: quotation.quotationNumber,
            quotationDate: quotation.quotationDate.toISOString(),
            validUntil: quotation.validUntil?.toISOString() ?? null,
            subtotal: Number(quotation.subtotal),
            fileExpense: Number(quotation.fileExpense),
            otherCharges: Number(quotation.otherCharges),
            gstRate: Number(quotation.gstRate),
            gstAmount: Number(quotation.gstAmount),
            totalAmount: Number(quotation.totalAmount),
            isSubsidyBased: quotation.isSubsidyBased,
            subsidyPercentage: quotation.subsidyPercentage ? Number(quotation.subsidyPercentage) : null,
            eligibleAmount: quotation.eligibleAmount ? Number(quotation.eligibleAmount) : null,
            subsidyAmount: quotation.subsidyAmount ? Number(quotation.subsidyAmount) : null,
            farmerContribution: quotation.farmerContribution ? Number(quotation.farmerContribution) : null,
            landArea: quotation.landArea ? Number(quotation.landArea) : null,
            notes: quotation.notes
          },
          customer: {
            ...quotation.customer,
            landArea: quotation.customer.landArea ? Number(quotation.customer.landArea) : null
          },
          items: quotation.items.map((i) => ({
            description: i.description,
            quantity: Number(i.quantity),
            unit: i.unit,
            sellingRate: Number(i.sellingRate),
            amount: Number(i.amount)
          }))
        })
      );
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${quotation.quotationNumber}.pdf"`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}
async function invoicePdf(req, res, next) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: { customer: true, items: true }
    });
    if (!invoice) throw AppError.notFound("Invoice not found");
    const shop = await getShop();
    const isMiniSprinkler = req.query.format === "mini-sprinkler" || req.query.format === "clean" || invoice.notes?.includes("\u092E\u093F\u0928\u0940 \u0938\u094D\u092A\u094D\u0930\u093F\u0902\u0915\u0932\u0930") || invoice.notes?.includes("Mini Sprinkler");
    let buffer;
    if (isMiniSprinkler) {
      const iDate = new Date(invoice.invoiceDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
      const subtotal = Number(invoice.subtotal);
      const gstRate = Number(invoice.gstRate || 5);
      const gstAmount = Number(invoice.gstAmount);
      const grandTotal = Number(invoice.totalAmount);
      const farmerShareMatch = invoice.notes?.match(/शेतकरी हिस्सा[:\s]*([0-9.]+)/i);
      const farmerShare = farmerShareMatch ? Number(farmerShareMatch[1]) : null;
      const balance = farmerShare != null ? Math.max(0, grandTotal - farmerShare) : 0;
      buffer = await renderToBuffer(
        React.createElement(MiniSprinklerPdfDocument, {
          documentType: "INVOICE",
          docNumber: invoice.invoiceNumber,
          docDate: iDate,
          shop: {
            shopName: "SHETKARI RAJA HARDWARE AND ELECTRICALS",
            shopOwner: "Vaibhav Santosh More",
            address: "Lakh Khandala, Vaijapur, Maharashtra",
            mobile: "8010741843",
            taluka: "Vaijapur",
            state: "Maharashtra"
          },
          customer: {
            fullName: invoice.customer.fullName,
            mobile: invoice.customer.mobile,
            village: invoice.customer.village || "Lakh Khandala",
            taluka: invoice.customer.taluka || "Vaijapur",
            state: invoice.customer.state || "Maharashtra"
          },
          items: invoice.items.map((i) => ({
            description: i.description,
            quantity: Number(i.quantity),
            unit: i.unit,
            rate: Number(i.rate),
            amount: Number(i.totalAmount || i.taxableValue)
          })),
          totals: {
            subtotal,
            gstRate,
            gstAmount,
            grandTotal,
            farmerShare,
            balance
          },
          customNote: invoice.notes?.replace(/मिनी स्प्रिंकलर[^|]*\|?/g, "").trim() || null
        })
      );
    } else {
      buffer = await renderToBuffer(
        React.createElement(InvoicePdfDocument, {
          shop,
          invoice: {
            invoiceNumber: invoice.invoiceNumber,
            invoiceDate: invoice.invoiceDate.toISOString(),
            subtotal: Number(invoice.subtotal),
            cgst: Number(invoice.cgst),
            sgst: Number(invoice.sgst),
            igst: Number(invoice.igst),
            gstAmount: Number(invoice.gstAmount),
            discount: Number(invoice.discount),
            roundOff: Number(invoice.roundOff),
            totalAmount: Number(invoice.totalAmount),
            gstRate: Number(invoice.gstRate),
            notes: invoice.notes
          },
          customer: {
            ...invoice.customer,
            landArea: invoice.customer.landArea ? Number(invoice.customer.landArea) : null
          },
          items: invoice.items.map((i) => ({
            description: i.description,
            hsnCode: i.hsnCode,
            quantity: Number(i.quantity),
            unit: i.unit,
            rate: Number(i.rate),
            taxableValue: Number(i.taxableValue),
            cgstAmount: Number(i.cgstAmount),
            sgstAmount: Number(i.sgstAmount),
            totalAmount: Number(i.totalAmount)
          }))
        })
      );
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${invoice.invoiceNumber}.pdf"`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}

// src/server/routes/pdf.routes.ts
var router11 = Router11();
router11.use(requireAuth);
router11.get("/quotations/:id", requirePermission("quotations:read"), quotationPdf);
router11.get("/invoices/:id", requirePermission("invoices:read"), invoicePdf);
var pdf_routes_default = router11;

// src/server/routes/index.ts
var router12 = Router12();
router12.get("/health", (_req, res) => res.json({ success: true, data: { status: "ok", time: (/* @__PURE__ */ new Date()).toISOString() } }));
router12.use("/auth", auth_routes_default);
router12.use("/customers", customers_routes_default);
router12.use("/products", products_routes_default);
router12.use("/categories", categories_routes_default);
router12.use("/government-rates", governmentRates_routes_default);
router12.use("/quotations", quotations_routes_default);
router12.use("/invoices", invoices_routes_default);
router12.use("/reports", reports_routes_default);
router12.use("/settings", settings_routes_default);
router12.use("/users", users_routes_default);
router12.use("/pdf", pdf_routes_default);
var routes_default = router12;

// src/server/middleware/errorHandler.ts
import { ZodError } from "zod";
var SENSITIVE_KEYS = ["password", "passwordHash", "token", "refreshToken", "accessToken", "aadhaar"];
function redact(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const clone = { ...obj };
  for (const key of Object.keys(clone)) {
    if (SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s))) {
      clone[key] = "[redacted]";
    }
  }
  return clone;
}
function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: "Route not found", code: "ROUTE_NOT_FOUND" });
}
function errorHandler(err, req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      details: err.flatten()
    });
  }
  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
      code: err.code,
      ...err.details ? { details: err.details } : {}
    });
  }
  console.error("Unhandled error:", redact({ error: err?.message, stack: err?.stack }));
  res.status(500).json({
    success: false,
    message: "Internal server error",
    code: "INTERNAL_ERROR"
  });
}

// src/server/app.ts
function createApp() {
  const app2 = express();
  app2.set("trust proxy", 1);
  app2.use(helmet());
  app2.use(
    cors({
      origin: process.env.CORS_ORIGIN?.split(",") ?? true,
      credentials: true
    })
  );
  app2.use(express.json({ limit: "2mb" }));
  app2.use(cookieParser());
  const apiLimiter = rateLimit2({ windowMs: 60 * 1e3, limit: 300, standardHeaders: true, legacyHeaders: false });
  app2.use("/api", apiLimiter);
  app2.use("/api", routes_default);
  app2.use(routes_default);
  app2.use("/api", notFoundHandler);
  app2.use(notFoundHandler);
  app2.use(errorHandler);
  return app2;
}

// src/server/serverless.ts
var app;
function handler(req, res) {
  try {
    if (!app) {
      app = createApp();
    }
    return app(req, res);
  } catch (err) {
    console.error("Vercel Serverless Invocation Error:", err);
    return res.status(500).json({
      error: "SERVERLESS_ERROR",
      message: err?.message || String(err),
      stack: err?.stack
    });
  }
}
export {
  handler as default
};
