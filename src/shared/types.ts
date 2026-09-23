// Shared types between client and server. Keep this free of server-only imports.

export type Role = "OWNER" | "ADMIN" | "STAFF";

export type QuotationStatus =
  | "DRAFT"
  | "SENT"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED"
  | "CONVERTED";

export type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID";

export type PaymentMethod = "CASH" | "UPI" | "BANK_TRANSFER" | "CARD" | "OTHER";

export type LandAreaUnit = "ACRE" | "HECTARE" | "GUNTHA";

export interface ApiSuccess<T> {
  success: true;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  code: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface QuotationItemInput {
  productId?: string | null;
  description: string;
  quantity: number;
  unit: string;
  governmentRate?: number | null;
  sellingRate: number;
  gstRate: number;
}

export interface SubsidyCalcInput {
  items: Array<{ quantity: number; sellingRate: number; governmentRate?: number | null }>;
  subsidyPercentage: number;
  maximumEligibleQuantity?: number | null;
  isSubsidyBased: boolean;
}

export interface SubsidyCalcResult {
  subtotal: number;
  eligibleAmount: number;
  subsidyAmount: number;
  farmerContribution: number;
  nonEligibleAmount: number;
}

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
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
    "users:read",
  ],
  STAFF: [
    "customers:*",
    "products:read",
    "categories:read",
    "government-rates:read",
    "quotations:*",
    "invoices:*",
    "payments:*",
    "reports:read",
  ],
};
