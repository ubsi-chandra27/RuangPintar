import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function run() {
  const models = Object.keys(prisma).filter((k) => !k.startsWith("_") && !k.startsWith("$"));
  console.log("Prisma models:", models);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
