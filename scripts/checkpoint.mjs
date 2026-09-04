import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRawUnsafe("PRAGMA wal_checkpoint(TRUNCATE);");
  console.log("WAL checkpoint result:", result);
}

main()
  .catch((err) => {
    console.error("Checkpoint error:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
