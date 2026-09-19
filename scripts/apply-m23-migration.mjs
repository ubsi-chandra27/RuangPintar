import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

async function main() {
  await prisma.$queryRawUnsafe("PRAGMA busy_timeout = 10000;");
  const sql = fs.readFileSync(
    "prisma/migrations/20260918200000_add_subscription_billing_m23/migration.sql",
    "utf8"
  );
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  for (const statement of statements) {
    console.log("Executing SQL statement...");
    await prisma.$executeRawUnsafe(statement);
  }
  console.log("M23 Migration Applied Successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration error:", err);
    process.exit(1);
  });
