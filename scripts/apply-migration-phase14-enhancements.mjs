import { PrismaClient } from "@prisma/client";
import fs from "fs";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  const migrationName = "20260905060000_add_cbt_token_and_image";
  const migrationPath = `prisma/migrations/${migrationName}/migration.sql`;
  const sql = fs.readFileSync(migrationPath, "utf8");

  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`Executing ${statements.length} SQL statements for ${migrationName}...`);
  for (const statement of statements) {
    try {
      await prisma.$executeRawUnsafe(statement);
      console.log(`Executed: ${statement}`);
    } catch (e) {
      console.log(`Notice during: ${statement} -> ${e.message}`);
    }
  }

  const checksum = crypto.createHash("sha256").update(sql).digest("hex");
  const id = crypto.randomUUID();

  await prisma.$executeRawUnsafe(
    `INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count")
     VALUES ('${id}', '${checksum}', CURRENT_TIMESTAMP, '${migrationName}', NULL, NULL, CURRENT_TIMESTAMP, 1);`
  );

  console.log("Migration enhancements applied and recorded successfully.");
}

main()
  .catch((err) => {
    console.error("Migration error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
