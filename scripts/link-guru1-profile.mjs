import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.pengguna.findUnique({
    where: { username: "guru1" },
  });

  if (!user || !user.sekolah_id) {
    console.log("User guru1 not found or has no sekolah_id");
    return;
  }

  // Check if Guru record already exists for guru1
  let guru = await prisma.guru.findFirst({
    where: {
      sekolah_id: user.sekolah_id,
      OR: [{ pengguna_id: user.id }, { email: user.email || "" }],
    },
  });

  if (!guru) {
    // Generate 26-char ULID
    const chars = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
    let randomPart = "";
    for (let i = 0; i < 16; i++) {
      randomPart += chars[Math.floor(Math.random() * chars.length)];
    }
    const id = "01M1GURU" + randomPart.slice(0, 18);

    guru = await prisma.guru.create({
      data: {
        id,
        sekolah_id: user.sekolah_id,
        pengguna_id: user.id,
        nama_lengkap: "Budi Santoso",
        gelar_depan: "Drs.",
        gelar_belakang: "M.Pd.",
        nip: "197508152000031001",
        nuptk: "9876543210123456",
        status_kepegawaian: "TETAP",
        jenis_kelamin: "L",
        email: user.email || "guru@sekolah.sch.id",
        telepon: "081234567890",
        alamat: "Jl. Pendidikan Mandiri No. 42, Jakarta",
        status_aktif: true,
        status_lifecycle: "AKTIF",
        foto_url: user.foto_url || null,
      },
    });
    console.log("Created official Guru record for guru1:", guru.id);
  } else {
    guru = await prisma.guru.update({
      where: { id: guru.id },
      data: {
        pengguna_id: user.id,
        nip: guru.nip || "197508152000031001",
        nuptk: guru.nuptk || "9876543210123456",
        gelar_depan: guru.gelar_depan || "Drs.",
        gelar_belakang: guru.gelar_belakang || "M.Pd.",
        telepon: guru.telepon || "081234567890",
      },
    });
    console.log("Updated official Guru record for guru1:", guru.id);
  }
}

main().finally(() => prisma.$disconnect());
