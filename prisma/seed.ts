import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import bcrypt from "bcryptjs";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding...");

  // --- Shop settings ---
  const existingSettings = await prisma.shopSettings.findFirst();
  if (!existingSettings) {
    await prisma.shopSettings.create({
      data: {
        shopName: "Sample Drip Irrigation Shop",
        address: "Main Road, Taluka, District, Maharashtra",
        mobile: "9876543210",
        gstin: "27AAAAA0000A1Z5",
        state: "Maharashtra",
        invoicePrefix: "INV",
        quotationPrefix: "QTN",
        defaultGstRate: 18,
        defaultSubsidyPct: 80,
        footerText: "Thank you for your business.",
        termsAndConditions: "Prices are subject to change without prior notice. Goods once sold will not be taken back.",
      },
    });
  }

  // --- Owner user ---
  const ownerExists = await prisma.user.findUnique({ where: { username: "owner" } });
  if (!ownerExists) {
    const passwordHash = await bcrypt.hash("ChangeMe123!", 12);
    await prisma.user.create({
      data: {
        username: "themorevaibhav@gmail.com",
        email: "themorevaibhav@gmail.com",
        passwordHash,
        fullName: "Shop Owner",
        role: "OWNER",
      },
    });
    console.log("Created default OWNER login -> username: owner / password: ChangeMe123! (change this immediately)");
  }

  // --- Categories ---
  const categoryNames = ["Drip Pipe", "Main Pipe", "Filter", "Valve", "Connector", "Lateral", "Fittings", "Accessories", "Other"];
  const categories: Record<string, string> = {};
  for (const [idx, name] of categoryNames.entries()) {
    const existing = await prisma.productCategory.findFirst({ where: { name } });
    const row = existing ?? (await prisma.productCategory.create({ data: { name, sortOrder: idx } }));
    categories[name] = row.id;
  }

  // --- Products ---
  const products: Array<{ name: string; category: string; unit: string; rate: number; govRate?: number }> = [
    { name: "Inline 20 x 4 x 30", category: "Lateral", unit: "Mtr", rate: 13.5, govRate: 13.5 },
    { name: "Filter 75 mm", category: "Filter", unit: "Nos", rate: 3100 },
    { name: "Pipe 75 mm", category: "Main Pipe", unit: "Mtr", rate: 45 },
    { name: "GTO Set 20 mm", category: "Fittings", unit: "Nos", rate: 25 },
    { name: "Lateral End Stop 20 mm", category: "Fittings", unit: "Nos", rate: 3 },
    { name: "Control Valve 75 mm", category: "Valve", unit: "Nos", rate: 650 },
    { name: "Joiner", category: "Connector", unit: "Nos", rate: 8 },
    { name: "Plain Lateral 20 mm", category: "Lateral", unit: "Mtr", rate: 9 },
    { name: "Flush Valve 75 mm", category: "Valve", unit: "Nos", rate: 320 },
    { name: "Elbow 75 mm", category: "Connector", unit: "Nos", rate: 65 },
    { name: "Solvent", category: "Accessories", unit: "Nos", rate: 120 },
    { name: "Tee", category: "Connector", unit: "Nos", rate: 40 },
    { name: "FTA", category: "Fittings", unit: "Nos", rate: 15 },
    { name: "Cock 16 x 20", category: "Valve", unit: "Nos", rate: 22 },
  ];

  let productSeq = await prisma.product.count();
  for (const p of products) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) {
      productSeq += 1;
      await prisma.product.create({
        data: {
          productCode: `PRD-${String(productSeq).padStart(5, "0")}`,
          name: p.name,
          categoryId: categories[p.category],
          unit: p.unit,
          gstRate: 18,
          sellingRate: p.rate,
          governmentRate: p.govRate ?? null,
        },
      });
    }
  }

  // --- Government scheme ---
  const schemeExists = await prisma.governmentScheme.findFirst({ where: { schemeName: "Drip Irrigation Subsidy", financialYear: "2026-27" } });
  if (!schemeExists) {
    const scheme = await prisma.governmentScheme.create({
      data: { schemeName: "Drip Irrigation Subsidy", financialYear: "2026-27", component: "Micro Irrigation" },
    });
    await prisma.governmentRate.create({
      data: {
        schemeId: scheme.id,
        unit: "Mtr",
        governmentRate: 13.5,
        maximumEligibleQuantity: 4000,
        subsidyPercentage: 80,
        effectiveFrom: new Date("2026-04-01"),
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
