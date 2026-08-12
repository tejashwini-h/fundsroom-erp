import "dotenv/config";

import { PrismaClient } from "../src/generated/prisma/client.js";

import {
  Role,
  CustomerStatus,
  CustomerType,
} from "../src/generated/prisma/enums.js";

import { PrismaPg } from "@prisma/adapter-pg";

import bcrypt from "bcrypt";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});
async function main() {
  const password = await bcrypt.hash("Password@123", 10);

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@fundsroom.com",
    },
    update: {
      password,
    },
    create: {
      name: "Admin User",
      email: "admin@fundsroom.com",
      password,
      role: Role.ADMIN,
    },
  });

  const sales = await prisma.user.upsert({
    where: {
      email: "sales@fundsroom.com",
    },
    update: {
      password,
    },
    create: {
      name: "Sales User",
      email: "sales@fundsroom.com",
      password,
      role: Role.SALES,
    },
  });

  const warehouse = await prisma.user.upsert({
    where: {
      email: "warehouse@fundsroom.com",
    },
    update: {
      password,
    },
    create: {
      name: "Warehouse User",
      email: "warehouse@fundsroom.com",
      password,
      role: Role.WAREHOUSE,
    },
  });

  const accounts = await prisma.user.upsert({
    where: {
      email: "accounts@fundsroom.com",
    },
    update: {
      password,
    },
    create: {
      name: "Accounts User",
      email: "accounts@fundsroom.com",
      password,
      role: Role.ACCOUNTS,
    },
  });

  await prisma.customer.createMany({
    data: [
      {
        name: "Rahul Traders",
        mobile: "9876543210",
        email: "rahul@example.com",
        businessName: "Rahul Traders",
        gstNumber: "29ABCDE1234F1Z5",
        customerType: CustomerType.WHOLESALE,
        address: "Bengaluru, Karnataka",
        status: CustomerStatus.ACTIVE,
        notes: "Regular wholesale customer",
      },
      {
        name: "Ananya Retail",
        mobile: "9876501234",
        email: "ananya@example.com",
        businessName: "Ananya Retail Store",
        customerType: CustomerType.RETAIL,
        address: "Mysuru, Karnataka",
        status: CustomerStatus.LEAD,
        notes: "Potential retail customer",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.product.createMany({
    data: [
      {
        name: "Laptop",
        sku: "LAP001",
        category: "Electronics",
        unitPrice: 50000,
        currentStock: 20,
        minimumStock: 5,
        warehouse: "Bengaluru Warehouse",
      },
      {
        name: "Wireless Mouse",
        sku: "MOU001",
        category: "Accessories",
        unitPrice: 800,
        currentStock: 50,
        minimumStock: 10,
        warehouse: "Bengaluru Warehouse",
      },
      {
        name: "Keyboard",
        sku: "KEY001",
        category: "Accessories",
        unitPrice: 1500,
        currentStock: 30,
        minimumStock: 5,
        warehouse: "Bengaluru Warehouse",
      },
    ],
    skipDuplicates: true,
  });

  console.log("Database seeded successfully.");

  console.log("Users created/updated:");
  console.log(admin.email);
  console.log(sales.email);
  console.log(warehouse.email);
  console.log(accounts.email);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });