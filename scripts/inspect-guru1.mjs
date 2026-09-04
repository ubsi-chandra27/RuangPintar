import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.pengguna.findMany({
    where: { peran_dasar: "TEACHER" },
    select: {
      id: true,
      username: true,
      nama_lengkap: true,
      email: true,
      sekolah_id: true,
      foto_url: true,
      guru: {
        select: {
          id: true,
          nama_lengkap: true,
          nip: true,
          nuptk: true,
          status_kepegawaian: true,
          telepon: true,
          alamat: true,
          foto_url: true,
        },
      },
    },
  });

  console.log("=== ALL TEACHER USERS ===");
  console.log(JSON.stringify(users, null, 2));
}

main().finally(() => prisma.$disconnect());
