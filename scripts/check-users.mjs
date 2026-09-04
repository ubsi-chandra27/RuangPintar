import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.pengguna.findMany({
    select: {
      id: true,
      username: true,
      peran_dasar: true,
      status_akun: true,
      email: true,
    },
  });
  console.log("Users:", users);
}

main().finally(() => prisma.$disconnect());
