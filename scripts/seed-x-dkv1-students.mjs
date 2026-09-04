import { PrismaClient } from "@prisma/client";
import { ulid } from "ulidx";

const prisma = new PrismaClient();

const studentsData = [
  { no: 1, nama: "Ailsa Citra Kirana", jk: "P", catatan: null },
  { no: 2, nama: "Alya Ervina Rasty", jk: "P", catatan: null },
  { no: 3, nama: "Deca Mila Rahma", jk: "P", catatan: null },
  { no: 4, nama: "Erlangga Nurrohman", jk: "L", catatan: null },
  { no: 5, nama: "Fayha Isna Afiyah", jk: "P", catatan: null },
  { no: 6, nama: "Gadis Naila Oktamaria Ruslan", jk: "P", catatan: null },
  { no: 7, nama: "Janeta Carrisa Aritonang", jk: "P", catatan: null },
  { no: 8, nama: "Ludmila Chritella Assa", jk: "P", catatan: null },
  { no: 9, nama: "Muhamad Furqon", jk: "L", catatan: "PB" },
  { no: 10, nama: "Muhammad Annur Fiyan", jk: "L", catatan: "PB" },
  { no: 11, nama: "Muhammad Aqil Al Farizy", jk: "L", catatan: "PB" },
  { no: 12, nama: "Muhammad Diky Jaya", jk: "L", catatan: null },
  { no: 13, nama: "Muhammad Fahrizal Alkafi", jk: "L", catatan: null },
  { no: 14, nama: "Muhamad Rifki Ramdani", jk: "L", catatan: null },
  { no: 15, nama: "Mutia Cinta Sijabat", jk: "P", catatan: null },
  { no: 16, nama: "Muhammad Jabbar Aswat M", jk: "L", catatan: null },
  { no: 17, nama: "Nazwa Adelia", jk: "P", catatan: null },
  { no: 18, nama: "Rafael Simon Benitez Marbun", jk: "L", catatan: null },
  { no: 19, nama: "Ramadhani Saputra", jk: "L", catatan: null },
  { no: 20, nama: "Rangga Alendra Ramadhan", jk: "L", catatan: null },
  { no: 21, nama: "Rianti Anjani Putri", jk: "P", catatan: null },
  { no: 22, nama: "Salsa Billa Nuraini", jk: "P", catatan: "PB" },
  { no: 23, nama: "Zetnad Alvriansa Kakiay", jk: "L", catatan: null },
];

async function main() {
  await prisma.$queryRawUnsafe("PRAGMA busy_timeout = 10000;");
  console.log("Memulai input data 23 siswa kelas X DKV 1...");

  // 1. Cari Rombel X DKV 1
  const rombel = await prisma.rombel.findFirst({
    where: {
      nama: "X DKV 1",
      status: "AKTIF",
    },
    include: {
      sekolah: true,
      tahun_ajaran: true,
      tingkat: true,
    },
  });

  if (!rombel) {
    throw new Error("Rombel X DKV 1 aktif tidak ditemukan di database!");
  }

  console.log(`Ditemukan Rombel: ${rombel.nama} (ID: ${rombel.id})`);
  console.log(`Sekolah: ${rombel.sekolah.nama} (ID: ${rombel.sekolah_id})`);
  console.log(`Tahun Ajaran: ${rombel.tahun_ajaran.nama} (ID: ${rombel.tahun_ajaran_id})`);
  console.log(`Tingkat: ${rombel.tingkat?.nama || "Kelas 10"} (ID: ${rombel.tingkat_id})`);

  // Cari NIS tertinggi di sekolah ini
  const existingStudents = await prisma.siswa.findMany({
    where: { sekolah_id: rombel.sekolah_id },
    select: { nis: true },
  });
  const numericNis = existingStudents
    .map((s) => Number(s.nis))
    .filter((n) => !isNaN(n) && n >= 20261000 && n < 20270000);
  let nextNisNum = numericNis.length > 0 ? Math.max(...numericNis) + 1 : 20261022;

  console.log(`Mulai alokasi NIS dari: ${nextNisNum}`);

  const created = [];

  for (const item of studentsData) {
    // Cek apakah siswa dengan nama ini sudah pernah dimasukkan
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
          catatan: item.catatan ? `Status asal: ${item.catatan}` : "Siswa Kelas X DKV 1",
          tanggal_masuk: new Date("2026-07-01"),
        },
      });
      console.log(
        `[+] Dibuat Siswa: ${siswa.nama_lengkap} (NIS: ${siswa.nis}, JK: ${siswa.jenis_kelamin})`
      );
    } else {
      console.log(`[=] Siswa sudah ada: ${siswa.nama_lengkap} (NIS: ${siswa.nis})`);
    }

    // Buat keikutsertaan tahun ajaran jika belum ada
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

    // Buat penempatan rombel jika belum ada
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
          catatan: item.catatan ? `Siswa ${item.catatan}` : null,
        },
      });
      console.log(`    -> Ditempatkan di ${rombel.nama} No. Absen: ${penempatan.nomor_absen}`);
    } else {
      // Pastikan nomor absen sesuai
      if (penempatan.nomor_absen !== item.no) {
        await prisma.penempatanRombel.update({
          where: { id: penempatan.id },
          data: { nomor_absen: item.no },
        });
      }
      console.log(`    -> Sudah terdaftar di ${rombel.nama} No. Absen: ${item.no}`);
    }

    created.push({
      no: item.no,
      nama: siswa.nama_lengkap,
      nis: siswa.nis,
      jk: siswa.jenis_kelamin,
      catatan: item.catatan || "-",
    });
  }

  console.log(`\nSelesai menginput ${created.length} siswa ke kelas ${rombel.nama}!`);
  console.table(created);
}

main()
  .catch((e) => {
    console.error("Gagal menginput data siswa:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
