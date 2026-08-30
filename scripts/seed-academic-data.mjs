import { PrismaClient } from "@prisma/client";
import { ulid } from "ulidx";

const prisma = new PrismaClient();

async function main() {
  await prisma.$queryRawUnsafe("PRAGMA busy_timeout = 10000;");

  // Cari sekolah default
  let school = await prisma.sekolah.findFirst();
  if (!school) {
    school = await prisma.sekolah.create({
      data: {
        id: ulid(),
        nama: "SMK Negeri 1 Indonesia",
        npsn: "10293847",
        jenjang: "SMK",
        zona_waktu: "Asia/Jakarta",
      },
    });
  }

  console.log(`Using school: ${school.nama} (${school.id})`);

  // 1. Tahun Ajaran
  let taActive = await prisma.tahunAjaran.findFirst({
    where: { sekolah_id: school.id, nama: "2026/2027" },
  });

  if (!taActive) {
    taActive = await prisma.tahunAjaran.create({
      data: {
        id: ulid(),
        sekolah_id: school.id,
        nama: "2026/2027",
        kode: "TA-2026-2027",
        tanggal_mulai: new Date("2026-07-01"),
        tanggal_selesai: new Date("2027-06-30"),
        status: "AKTIF",
      },
    });
  }

  let taPast = await prisma.tahunAjaran.findFirst({
    where: { sekolah_id: school.id, nama: "2025/2026" },
  });

  if (!taPast) {
    taPast = await prisma.tahunAjaran.create({
      data: {
        id: ulid(),
        sekolah_id: school.id,
        nama: "2025/2026",
        kode: "TA-2025-2026",
        tanggal_mulai: new Date("2025-07-01"),
        tanggal_selesai: new Date("2026-06-30"),
        status: "SELESAI",
      },
    });
  }

  // 2. Semesters
  let semGanjil = await prisma.semester.findFirst({
    where: { tahun_ajaran_id: taActive.id, kode: "GANJIL" },
  });

  if (!semGanjil) {
    semGanjil = await prisma.semester.create({
      data: {
        id: ulid(),
        sekolah_id: school.id,
        tahun_ajaran_id: taActive.id,
        nama: "Semester Ganjil",
        kode: "GANJIL",
        urutan: 1,
        tanggal_mulai: new Date("2026-07-01"),
        tanggal_selesai: new Date("2026-12-31"),
        status: "AKTIF",
      },
    });
  }

  let semGenap = await prisma.semester.findFirst({
    where: { tahun_ajaran_id: taActive.id, kode: "GENAP" },
  });

  if (!semGenap) {
    semGenap = await prisma.semester.create({
      data: {
        id: ulid(),
        sekolah_id: school.id,
        tahun_ajaran_id: taActive.id,
        nama: "Semester Genap",
        kode: "GENAP",
        urutan: 2,
        tanggal_mulai: new Date("2027-01-01"),
        tanggal_selesai: new Date("2027-06-30"),
        status: "DRAFT",
      },
    });
  }

  // 3. Fase
  let faseE = await prisma.fase.findFirst({
    where: { sekolah_id: school.id, kode: "FASE_E" },
  });
  if (!faseE) {
    faseE = await prisma.fase.create({
      data: {
        id: ulid(),
        sekolah_id: school.id,
        nama: "Fase E",
        kode: "FASE_E",
        deskripsi: "Tingkat Kelas 10 SMK/SMA",
        urutan: 5,
      },
    });
  }

  let faseF = await prisma.fase.findFirst({
    where: { sekolah_id: school.id, kode: "FASE_F" },
  });
  if (!faseF) {
    faseF = await prisma.fase.create({
      data: {
        id: ulid(),
        sekolah_id: school.id,
        nama: "Fase F",
        kode: "FASE_F",
        deskripsi: "Tingkat Kelas 11 & 12 SMK/SMA",
        urutan: 6,
      },
    });
  }

  // 4. Tingkat Kelas
  let k10 = await prisma.tingkatKelas.findFirst({
    where: { sekolah_id: school.id, kode: "10" },
  });
  if (!k10) {
    k10 = await prisma.tingkatKelas.create({
      data: {
        id: ulid(),
        sekolah_id: school.id,
        fase_id: faseE.id,
        kode: "10",
        nama: "Kelas 10",
        urutan: 10,
      },
    });
  }

  let k11 = await prisma.tingkatKelas.findFirst({
    where: { sekolah_id: school.id, kode: "11" },
  });
  if (!k11) {
    k11 = await prisma.tingkatKelas.create({
      data: {
        id: ulid(),
        sekolah_id: school.id,
        fase_id: faseF.id,
        kode: "11",
        nama: "Kelas 11",
        urutan: 11,
      },
    });
  }

  let k12 = await prisma.tingkatKelas.findFirst({
    where: { sekolah_id: school.id, kode: "12" },
  });
  if (!k12) {
    k12 = await prisma.tingkatKelas.create({
      data: {
        id: ulid(),
        sekolah_id: school.id,
        fase_id: faseF.id,
        kode: "12",
        nama: "Kelas 12",
        urutan: 12,
      },
    });
  }

  // 5. Program Keahlian
  let progRPL = await prisma.programKeahlian.findFirst({
    where: { sekolah_id: school.id, kode: "RPL" },
  });
  if (!progRPL) {
    progRPL = await prisma.programKeahlian.create({
      data: {
        id: ulid(),
        sekolah_id: school.id,
        kode: "RPL",
        nama: "Rekayasa Perangkat Lunak",
        jenjang: "SMK",
        status_aktif: true,
        deskripsi: "Pengembangan Perangkat Lunak dan Gim",
      },
    });
  }

  let progTKJ = await prisma.programKeahlian.findFirst({
    where: { sekolah_id: school.id, kode: "TKJ" },
  });
  if (!progTKJ) {
    progTKJ = await prisma.programKeahlian.create({
      data: {
        id: ulid(),
        sekolah_id: school.id,
        kode: "TKJ",
        nama: "Teknik Komputer dan Jaringan",
        jenjang: "SMK",
        status_aktif: true,
        deskripsi: "Infrastruktur Jaringan dan Telekomunikasi",
      },
    });
  }

  let progDKV = await prisma.programKeahlian.findFirst({
    where: { sekolah_id: school.id, kode: "DKV" },
  });
  if (!progDKV) {
    progDKV = await prisma.programKeahlian.create({
      data: {
        id: ulid(),
        sekolah_id: school.id,
        kode: "DKV",
        nama: "Desain Komunikasi Visual",
        jenjang: "SMK",
        status_aktif: true,
        deskripsi: "Animasi dan Multimedia Grafis",
      },
    });
  }

  // 6. Rombel
  const sampleRombels = [
    {
      nama: "X RPL 1",
      kode: "RBL-X-RPL-1",
      tingkat_id: k10.id,
      fase_id: faseE.id,
      program_id: progRPL.id,
      kapasitas: 36,
    },
    {
      nama: "X RPL 2",
      kode: "RBL-X-RPL-2",
      tingkat_id: k10.id,
      fase_id: faseE.id,
      program_id: progRPL.id,
      kapasitas: 36,
    },
    {
      nama: "X TKJ 1",
      kode: "RBL-X-TKJ-1",
      tingkat_id: k10.id,
      fase_id: faseE.id,
      program_id: progTKJ.id,
      kapasitas: 36,
    },
    {
      nama: "XI RPL 1",
      kode: "RBL-XI-RPL-1",
      tingkat_id: k11.id,
      fase_id: faseF.id,
      program_id: progRPL.id,
      kapasitas: 34,
    },
    {
      nama: "XI DKV 1",
      kode: "RBL-XI-DKV-1",
      tingkat_id: k11.id,
      fase_id: faseF.id,
      program_id: progDKV.id,
      kapasitas: 32,
    },
    {
      nama: "XII TKJ 1",
      kode: "RBL-XII-TKJ-1",
      tingkat_id: k12.id,
      fase_id: faseF.id,
      program_id: progTKJ.id,
      kapasitas: 35,
    },
  ];

  for (const r of sampleRombels) {
    const exists = await prisma.rombel.findFirst({
      where: {
        sekolah_id: school.id,
        tahun_ajaran_id: taActive.id,
        nama: r.nama,
      },
    });

    if (!exists) {
      await prisma.rombel.create({
        data: {
          id: ulid(),
          sekolah_id: school.id,
          tahun_ajaran_id: taActive.id,
          semester_id: semGanjil.id,
          tingkat_id: r.tingkat_id,
          fase_id: r.fase_id,
          program_id: r.program_id,
          nama: r.nama,
          kode: r.kode,
          kapasitas: r.kapasitas,
          status: "AKTIF",
        },
      });
    }
  }

  console.log("Academic Structure Seed completed successfully!");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
