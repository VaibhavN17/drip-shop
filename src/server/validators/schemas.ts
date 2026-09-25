import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const customerSchema = z.object({
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
  notes: z.string().optional().nullable(),
});

export const productCategorySchema = z.object({
  name: z.string().min(1),
  nameMarathi: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
});

export const productSchema = z.object({
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
  isActive: z.boolean().default(true),
});

export const governmentSchemeSchema = z.object({
  schemeName: z.string().min(1),
  financialYear: z.string().min(1),
  component: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const governmentRateSchema = z.object({
  schemeId: z.string().uuid(),
  productId: z.string().uuid().optional().nullable(),
  unit: z.string().min(1),
  governmentRate: z.number().nonnegative(),
  maximumEligibleQuantity: z.number().nonnegative().optional().nullable(),
  subsidyPercentage: z.number().min(0).max(100),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const quotationItemSchema = z.object({
  productId: z.string().uuid().optional().nullable(),
  description: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  governmentRate: z.number().nonnegative().optional().nullable(),
  sellingRate: z.number().nonnegative(),
  gstRate: z.number().min(0).max(100).default(5),
});

export const inlineCustomerSchema = z.object({
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
  spacing: z.string().optional().nullable(),
});

export const quotationSchema = z.object({
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
  items: z.array(quotationItemSchema).min(1),
}).refine((data) => data.customerId || data.customer, {
  message: "Either customerId or customer details must be provided",
  path: ["customerId"],
});

export const quotationStatusSchema = z.object({
  status: z.enum(["DRAFT", "SENT", "APPROVED", "REJECTED", "EXPIRED", "CONVERTED"]),
});

export const invoiceItemSchema = z.object({
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
  gstRate: z.number().min(0).max(100).default(5),
});

export const invoiceCreateSchema = z.object({
  customerId: z.string().uuid().optional().nullable(),
  customer: inlineCustomerSchema.optional().nullable(),
  quotationId: z.string().uuid().optional().nullable(),
  invoiceDate: z.coerce.date().optional(),
  setType: z.string().optional().nullable(), // "तुषार" or "ठिबक"
  spacing: z.string().optional().nullable(),
  crop: z.string().optional().nullable(),
  shiwar: z.string().optional().nullable(),
  discount: z.number().nonnegative().default(0),
  installation: z.number().nonnegative().default(0),
  roundOff: z.number().default(0),
  gstRate: z.number().min(0).max(100).default(5),
  isInterstate: z.boolean().default(false),
  notes: z.string().optional().nullable(),
  items: z.array(invoiceItemSchema).min(1),
}).refine((data) => data.customerId || data.customer, {
  message: "Either customerId or customer details must be provided",
  path: ["customerId"],
});

export const invoiceUpdateSchema = z.object({
  discount: z.number().nonnegative().optional(),
  isInterstate: z.boolean().optional(),
  notes: z.string().optional().nullable(),
});

export const paymentSchema = z.object({
  amount: z.number().positive(),
  paymentDate: z.coerce.date().optional(),
  paymentMethod: z.enum(["CASH", "UPI", "BANK_TRANSFER", "CARD", "OTHER"]),
  referenceNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const shopSettingsSchema = z.object({
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
  termsAndConditions: z.string().optional().nullable(),
});

export const userCreateSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1),
  role: z.enum(["OWNER", "ADMIN", "STAFF"]).default("STAFF"),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});
