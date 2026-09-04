import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const sessions = await prisma.sesiKelasAktual.findMany({
    include: {
      guru: true,
      rombel: true,
      mata_pelajaran: true,
    },
    take: 5,
  });

  console.log("=== SESSIONS ===");
  sessions.forEach((s) => {
    console.log({
      id: s.id,
      mapel: s.mata_pelajaran?.nama,
      rombel: s.rombel?.nama,
      guru: s.guru?.nama_lengkap,
      guru_id: s.guru_id,
      status: s.status,
    });
  });

  const admins = await prisma.pengguna.findMany({
    where: { peran_dasar: { in: ["SUPER_ADMIN", "SCHOOL_STAFF"] } },
    select: { username: true, peran_dasar: true },
  });
  console.log("=== ADMINS ===");
  console.log(admins);
}

main().finally(() => prisma.$disconnect());
