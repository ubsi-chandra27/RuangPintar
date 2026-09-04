import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.pengguna.findUnique({
    where: { username: "guru1" },
  });

  const logs = await prisma.logAudit.findMany({
    where: {
      OR: [{ aktor_id: user?.id }, { id_sumber: user?.id }],
    },
    orderBy: { dibuat_pada: "desc" },
    take: 5,
  });

  console.log("Audit logs for guru1:", logs);
}

main().finally(() => prisma.$disconnect());
