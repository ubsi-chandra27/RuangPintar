import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.pengguna.findUnique({
    where: { username: "guru1" },
  });
  console.log("=== USER guru1 ===");
  console.log(user);

  if (user?.sekolah_id) {
    const gurusInSchool = await prisma.guru.findMany({
      where: { sekolah_id: user.sekolah_id },
      select: { id: true, nama_lengkap: true, email: true, pengguna_id: true, status_aktif: true },
    });
    console.log("=== GURUS IN THIS SCHOOL ===");
    console.log(gurusInSchool);
  }
}

main().finally(() => prisma.$disconnect());
