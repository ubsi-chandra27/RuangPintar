import { PrismaClient } from "@prisma/client";
import { ulid } from "ulidx";

const prisma = new PrismaClient();

const studentsData = [
  { no: 1, nama: "Al Hadi Nur Ramadhan", jk: "L", catatan: null },
  { no: 2, nama: "Anggita Dewi Astuti", jk: "P", catatan: null },
  { no: 3, nama: "Azkia Syalila Salwa", jk: "P", catatan: null },
  { no: 4, nama: "Bayu Adiraya Ramadhan", jk: "L", catatan: null },
  { no: 5, nama: "Caessar Azka Satya Al Fatih", jk: "L", catatan: null },
  { no: 6, nama: "Denis Oktaviani", jk: "P", catatan: "PB" },
  { no: 7, nama: "Echa Khairunissa", jk: "P", catatan: null },
  { no: 8, nama: "Fani Nurul Sihni", jk: "P", catatan: null },
  { no: 9, nama: "Flantzaa Saqyah Rayfy Tameno", jk: "P", catatan: "Non-Muslim" },
  { no: 10, nama: "Friska Oktaviani Sihombing", jk: "P", catatan: "Non-Muslim" },
  { no: 11, nama: "Gendis Arum Ningtyas", jk: "P", catatan: "PB" },
  { no: 12, nama: "Haafidz Putra Agus", jk: "L", catatan: "PB" },
  { no: 13, nama: "Intan Febiyani", jk: "P", catatan: "PB" },
  { no: 14, nama: "Jeriko Fernandes Siahaan", jk: "L", catatan: "Non-Muslim" },
  { no: 15, nama: "Lutvie Sakhi Zaidane Pramutadi", jk: "L", catatan: null },
  { no: 16, nama: "Muhammad Chairul Azzam", jk: "L", catatan: null },
  { no: 17, nama: "Muhammad Fachri", jk: "L", catatan: null },
  { no: 18, nama: "Narendra Nawagraha Putra Andrian", jk: "L", catatan: null },
  { no: 19, nama: "Naufal Rifa'i", jk: "L", catatan: "PB" },
  { no: 20, nama: "Niken Marito Gultom", jk: "P", catatan: "Non-Muslim" },
  { no: 21, nama: "Raden Mochamad Alfino Arfa", jk: "L", catatan: null },
  { no: 22, nama: "Rafael", jk: "L", catatan: null },
  { no: 23, nama: "Rafi Ramdhani", jk: "L", catatan: null },
  { no: 24, nama: "Rizky Agung Rajabi", jk: "L", catatan: null },
  { no: 25, nama: "Syadad Rasyid", jk: "L", catatan: "PB" },
  { no: 26, nama: "Syahla Salsabila", jk: "P", catatan: "PB" },
  { no: 27, nama: "Syifa Eka Putri", jk: "P", catatan: null },
  { no: 28, nama: "Vanesya Meilani", jk: "P", catatan: null },
  { no: 29, nama: "Yosua Choiri Siahaan", jk: "L", catatan: "Non-Muslim" },
];

async function main() {
  await prisma.$queryRawUnsafe("PRAGMA busy_timeout = 10000;");
  console.log("=== Memulai Input Data Siswa Kelas X TKJ 1 (X TJKT 1) ===");

  // 1. Cari Rombel X TJKT 1
  let rombel = await prisma.rombel.findFirst({
    where: {
      nama: {
        in: ["X TJKT 1", "X TKJ 1"],
      },
      status: "AKTIF",
    },
    include: {
      sekolah: true,
      tahun_ajaran: true,
      tingkat: true,
      program: true,
    },
  });

  if (!rombel) {
    throw new Error("Rombel X TJKT 1 / X TKJ 1 aktif tidak ditemukan di database!");
  }

  console.log(`Ditemukan Rombel : ${rombel.nama} (ID: ${rombel.id})`);
  console.log(`Sekolah          : ${rombel.sekolah.nama} (ID: ${rombel.sekolah_id})`);
  console.log(
    `Program Keahlian : ${rombel.program?.nama || "Teknik Jaringan Komputer dan Telekomunikasi"}`
  );
  console.log(`Tahun Ajaran     : ${rombel.tahun_ajaran.nama} (ID: ${rombel.tahun_ajaran_id})`);
  console.log(
    `Tingkat          : ${rombel.tingkat?.nama || "Kelas 10"} (ID: ${rombel.tingkat_id})`
  );

  // 2. Tentukan nomor induk siswa (NIS) berurutan
  const existingStudents = await prisma.siswa.findMany({
    where: { sekolah_id: rombel.sekolah_id },
    select: { nis: true },
  });
  const numericNis = existingStudents
    .map((s) => Number(s.nis))
    .filter((n) => !isNaN(n) && n >= 20261000 && n < 20270000);
  let nextNisNum = numericNis.length > 0 ? Math.max(...numericNis) + 1 : 20261188;

  console.log(`Alokasi NIS dimulai dari: ${nextNisNum}\n`);

  const results = [];

  for (const item of studentsData) {
    // 3. Cek / Buat Siswa
    let siswa = await prisma.siswa.findFirst({
      where: {
        sekolah_id: rombel.sekolah_id,
        nama_lengkap: item.nama,
      },
    });

    if (!siswa) {
      const nis = String(nextNisNum++);
      const nisn = "008" + nis.slice(-7).padStart(7, "0");

      siswa = await prisma.siswa.create({
        data: {
          id: ulid(),
          sekolah_id: rombel.sekolah_id,
          nis: nis,
          nisn: nisn,
          nama_lengkap: item.nama,
          jenis_kelamin: item.jk,
          status_akademik: "AKTIF",
          catatan: item.catatan
            ? `Siswa Kelas X TJKT 1 (${item.catatan})`
            : "Siswa Kelas X TJKT 1 (Teknik Jaringan Komputer dan Telekomunikasi)",
          tanggal_masuk: new Date("2026-07-01"),
        },
      });
      console.log(
        `[+] Dibuat Siswa: No. ${String(item.no).padStart(2, "0")} | ${siswa.nama_lengkap.padEnd(32)} | NIS: ${siswa.nis} | JK: ${siswa.jenis_kelamin}`
      );
    } else {
      console.log(
        `[=] Siswa sudah ada: No. ${String(item.no).padStart(2, "0")} | ${siswa.nama_lengkap.padEnd(32)} | NIS: ${siswa.nis}`
      );
    }

    // 4. Cek / Buat Keikutsertaan Siswa pada Tahun Ajaran Berjalan
    let keikutsertaan = await prisma.keikutsertaanSiswa.findFirst({
      where: {
        siswa_id: siswa.id,
        tahun_ajaran_id: rombel.tahun_ajaran_id,
      },
    });

    if (!keikutsertaan) {
      keikutsertaan = await prisma.keikutsertaanSiswa.create({
        data: {
          id: ulid(),
          sekolah_id: rombel.sekolah_id,
          siswa_id: siswa.id,
          tahun_ajaran_id: rombel.tahun_ajaran_id,
          tingkat_id: rombel.tingkat_id,
          status: "AKTIF",
          tanggal_mulai: new Date("2026-07-01"),
        },
      });
    }

    // 5. Cek / Buat Penempatan Rombel (Rombel Placement)
    let penempatan = await prisma.penempatanRombel.findFirst({
      where: {
        keikutsertaan_id: keikutsertaan.id,
        rombel_id: rombel.id,
      },
    });

    if (!penempatan) {
      penempatan = await prisma.penempatanRombel.create({
        data: {
          id: ulid(),
          sekolah_id: rombel.sekolah_id,
          keikutsertaan_id: keikutsertaan.id,
          rombel_id: rombel.id,
          nomor_absen: item.no,
          status: "AKTIF",
          tanggal_mulai: new Date("2026-07-01"),
          catatan: item.catatan || null,
        },
      });
    } else {
      if (penempatan.nomor_absen !== item.no) {
        await prisma.penempatanRombel.update({
          where: { id: penempatan.id },
          data: { nomor_absen: item.no },
        });
      }
    }

    results.push({
      No: item.no,
      "Nama Lengkap": siswa.nama_lengkap,
      NIS: siswa.nis,
      NISN: siswa.nisn,
      JK: siswa.jenis_kelamin,
      Catatan: item.catatan || "-",
      Rombel: rombel.nama,
    });
  }

  console.log(
    `\nBerhasil menginput dan menempatkan ${results.length} siswa ke dalam rombel ${rombel.nama}!`
  );
  console.table(results);
}

main()
  .catch((e) => {
    console.error("Gagal menginput data siswa X TKJ 1:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
