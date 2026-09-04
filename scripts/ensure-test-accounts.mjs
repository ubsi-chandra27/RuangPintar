import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ulid } from "ulidx";

const prisma = new PrismaClient();

async function main() {
  const school = await prisma.sekolah.findFirst();
  if (!school) return;

  const passwordHash = await bcrypt.hash("Password123#", 10);

  // 1. Super Admin
  const admin = await prisma.pengguna.upsert({
    where: { username: "superadmin" },
    update: {
      password_hash: passwordHash,
      status_akun: "AKTIF",
      nama_lengkap: "Super Administrator",
      sekolah: { connect: { id: school.id } },
    },
    create: {
      id: ulid(),
      username: "superadmin",
      email: "admin@ruangpintar.sch.id",
      nama_lengkap: "Super Administrator",
      password_hash: passwordHash,
      peran_dasar: "SUPER_ADMIN",
      status_akun: "AKTIF",
      sekolah: { connect: { id: school.id } },
    },
  });
  console.log("Admin account ready:", admin.username);

  // 2. Teacher Guru Budi
  const guru = await prisma.guru.findFirst({
    where: { sekolah_id: school.id, nama_lengkap: { contains: "Budi" } },
  });

  const teacher = await prisma.pengguna.upsert({
    where: { username: "guru_budi" },
    update: {
      password_hash: passwordHash,
      status_akun: "AKTIF",
      nama_lengkap: "Budi Santoso, S.Pd",
      sekolah: { connect: { id: school.id } },
    },
    create: {
      id: ulid(),
      username: "guru_budi",
      email: "budi@ruangpintar.sch.id",
      nama_lengkap: "Budi Santoso, S.Pd",
      password_hash: passwordHash,
      peran_dasar: "TEACHER",
      status_akun: "AKTIF",
      sekolah: { connect: { id: school.id } },
    },
  });

  if (guru) {
    await prisma.guru.update({
      where: { id: guru.id },
      data: { pengguna_id: teacher.id },
    });
  }

  console.log("Teacher account ready:", teacher.username);
}

main().finally(() => prisma.$disconnect());
