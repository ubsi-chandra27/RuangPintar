import { PrismaClient } from "@prisma/client";
import fs from "fs";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  const migrationName = "20260904101500_add_assessment_and_gradebook";
  const migrationPath = `prisma/migrations/${migrationName}/migration.sql`;
  const sql = fs.readFileSync(migrationPath, "utf8");

  // Split sql statements
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`Executing ${statements.length} SQL statements for ${migrationName}...`);
  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }

  // Calculate checksum of migration.sql
  const checksum = crypto.createHash("sha256").update(sql).digest("hex");
  const id = crypto.randomUUID();

  // Record into _prisma_migrations
  await prisma.$executeRawUnsafe(
    `INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count")
     VALUES ('${id}', '${checksum}', CURRENT_TIMESTAMP, '${migrationName}', NULL, NULL, CURRENT_TIMESTAMP, 1);`
  );

  console.log("Migration Phase 13 applied and recorded successfully.");
}

main()
  .catch((err) => {
    console.error("Migration error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
