import { PrismaClient } from "@prisma/client";
import { ulid } from "ulidx";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugifyName(name) {
  // Ambil 2 kata pertama agar username ringkas dan rapi
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join("_");
  return `guru_${cleaned}`;
}

async function main() {
  await prisma.$queryRawUnsafe("PRAGMA busy_timeout = 10000;");
  console.log("Memulai pembuatan akun login untuk seluruh guru...");

  const school = await prisma.sekolah.findFirst();
  if (!school) {
    throw new Error("Sekolah tidak ditemukan!");
  }

  const teachers = await prisma.guru.findMany({
    where: {
      sekolah_id: school.id,
      pengguna_id: null,
    },
    include: {
      penugasan_mengajar: {
        include: {
          rombel: true,
          mata_pelajaran: true,
        },
      },
    },
    orderBy: {
      nama_lengkap: "asc",
    },
  });

  console.log(`Ditemukan ${teachers.length} guru yang belum memiliki akun login.`);

  // Hash password standar sekali saja
  const passwordHash = await bcrypt.hash("Password123#", 10);

  const results = [];
  const usedUsernames = new Set();

  // Load existing usernames to avoid collision
  const existingUsers = await prisma.pengguna.findMany({
    select: { username: true },
  });
  existingUsers.forEach((u) => {
    if (u.username) usedUsernames.add(u.username.toLowerCase());
  });

  for (const guru of teachers) {
    let baseUsername = slugifyName(guru.nama_lengkap);
    let username = baseUsername;
    let counter = 1;

    while (usedUsernames.has(username)) {
      counter++;
      username = `${baseUsername}${counter}`;
    }
    usedUsernames.add(username);

    const email = `${username}@otomindo.sch.id`;
    const userId = ulid();

    // 1. Buat akun Pengguna (M02)
    const user = await prisma.pengguna.create({
      data: {
        id: userId,
        sekolah_id: school.id,
        username: username,
        email: email,
        nama_lengkap: guru.nama_lengkap,
        password_hash: passwordHash,
        peran_dasar: "TEACHER",
        status_akun: "AKTIF",
        harus_ganti_password: false,
      },
    });

    // 2. Hubungkan ke Guru (M08)
    await prisma.guru.update({
      where: { id: guru.id },
      data: {
        pengguna_id: user.id,
        email: guru.email || email,
      },
    });

    const mapelList = guru.penugasan_mengajar
      .map((p) => `${p.mata_pelajaran.nama} (${p.rombel.nama})`)
      .slice(0, 2)
      .join(", ");

    results.push({
      nama: guru.nama_lengkap,
      username: username,
      email: email,
      penugasan: mapelList || "Belum ada jadwal",
    });

    console.log(`[+] Akun dibuat: ${guru.nama_lengkap} -> Username: ${username}`);
  }

  console.log(
    `\nBerhasil membuat ${results.length} akun guru baru! Password default: Password123#\n`
  );
  console.table(
    results.map((r) => ({
      Nama: r.nama,
      Username: r.username,
      Password: "Password123#",
      Tugas: r.penugasan,
    }))
  );
}

main()
  .catch((e) => {
    console.error("Gagal membuat akun guru:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
