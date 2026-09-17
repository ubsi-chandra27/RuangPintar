import { PrismaClient } from "@prisma/client";
import { ulid } from "ulidx";

const prisma = new PrismaClient();

const studentsData = [
  { no: 1, nama: "Agasta Anggara Putra", jk: "L", nis: null },
  { no: 2, nama: "Ahzianur Anugrah Sanjaya", jk: "L", nis: null },
  { no: 3, nama: "Arbian Islami Warda", jk: "L", nis: null },
  { no: 4, nama: "Arya Ramadhan", jk: "L", nis: null },
  { no: 5, nama: "Badar Dwi Putra Rosadi", jk: "L", nis: null },
  { no: 6, nama: "Bima Saputra", jk: "L", nis: null },
  { no: 7, nama: "Bintang Asif Akmal Supriyatna", jk: "L", nis: null },
  { no: 8, nama: "Daffa Adryan Faqih", jk: "L", nis: null },
  { no: 9, nama: "Desta Ardianto", jk: "L", nis: null },
  // Row 10: Davit Raditya Candra dicoret merah pada dokumen fisik
  { no: 11, nama: "Devin Rajendra Alfarand", jk: "L", nis: null },
  { no: 12, nama: "Dicky Fauza Ramadhan", jk: "L", nis: null },
  { no: 13, nama: "Dida Putra Yulyani", jk: "L", nis: null },
  { no: 14, nama: "Fadhlan Ma'ruf", jk: "L", nis: null },
  { no: 15, nama: "Fadil Ahmad Nasution", jk: "L", nis: null },
  { no: 16, nama: "Fais Yudistira", jk: "L", nis: null },
  { no: 17, nama: "Ferdi Kurniawan", jk: "L", nis: null },
  { no: 18, nama: "Hafizd Maulana", jk: "L", nis: null },
  { no: 19, nama: "Hanafiz Adri Pratama Januarizky", jk: "L", nis: null },
  { no: 20, nama: "Imam Safii", jk: "L", nis: null },
  { no: 21, nama: "M. Ridwan", jk: "L", nis: null },
  { no: 22, nama: "Muhamad Dzakwan Akbar", jk: "L", nis: null },
  { no: 23, nama: "Muhamad Ilham", jk: "L", nis: null },
  { no: 24, nama: "Muhamad Reza Fahlefi", jk: "L", nis: null },
  { no: 25, nama: "Muhammad Fahrel Rizky", jk: "L", nis: "25144" },
  { no: 26, nama: "Muhammad Fais Ramdani", jk: "L", nis: null },
  { no: 27, nama: "Muhammad Rayhan", jk: "L", nis: null },
  { no: 28, nama: "Muhammad Rifki Hud Alham", jk: "L", nis: null },
  { no: 29, nama: "Muhammad Wildhan", jk: "L", nis: null },
  { no: 30, nama: "Parel", jk: "L", nis: null },
  { no: 31, nama: "Raga Riezky Ariawan", jk: "L", nis: null },
  { no: 32, nama: "Ragil Aryasatya", jk: "L", nis: null },
  { no: 33, nama: "Raju Fitriya Al Hasby", jk: "L", nis: null },
  { no: 34, nama: "Rava Rabbani Marento", jk: "L", nis: null },
  { no: 35, nama: "Refaldi Aditya", jk: "L", nis: null },
  { no: 36, nama: "Rifqi Rafif", jk: "L", nis: null },
  { no: 37, nama: "Rio Januar Pradana", jk: "L", nis: null },
  { no: 38, nama: "Rizki Aditia Putra", jk: "L", nis: null },
  { no: 39, nama: "Rizky Putra Kirana", jk: "L", nis: null },
];

async function main() {
  await prisma.$queryRawUnsafe("PRAGMA busy_timeout = 10000;");
  console.log("Memulai input data 38 siswa kelas X TO 5...");

  // 1. Cari Rombel X TO 5
  const rombel = await prisma.rombel.findFirst({
    where: {
      nama: "X TO 5",
      status: "AKTIF",
    },
    include: {
      sekolah: true,
      tahun_ajaran: true,
      tingkat: true,
    },
  });

  if (!rombel) {
    throw new Error("Rombel X TO 5 aktif tidak ditemukan di database!");
  }

  console.log(`Ditemukan Rombel: ${rombel.nama} (ID: ${rombel.id})`);
  console.log(`Sekolah: ${rombel.sekolah.nama} (ID: ${rombel.sekolah_id})`);
  console.log(`Tahun Ajaran: ${rombel.tahun_ajaran.nama} (ID: ${rombel.tahun_ajaran_id})`);
  console.log(`Tingkat: ${rombel.tingkat?.nama || "Kelas 10"} (ID: ${rombel.tingkat_id})`);

  // Cari NIS tertinggi di sekolah ini (angka >= 20261000)
  const existingStudents = await prisma.siswa.findMany({
    where: { sekolah_id: rombel.sekolah_id },
    select: { nis: true },
  });
  const numericNis = existingStudents
    .map((s) => Number(s.nis))
    .filter((n) => !isNaN(n) && n >= 20261000 && n < 20270000);
  let nextNisNum = numericNis.length > 0 ? Math.max(...numericNis) + 1 : 20261298;

  console.log(`Mulai alokasi NIS dari: ${nextNisNum}`);

  const created = [];

  for (const item of studentsData) {
    // Cek apakah siswa dengan nama ini sudah pernah dimasukkan di sekolah ini
    let siswa = await prisma.siswa.findFirst({
      where: {
        sekolah_id: rombel.sekolah_id,
        nama_lengkap: item.nama,
      },
    });

    if (!siswa) {
      const nis = item.nis || String(nextNisNum++);
      const nisn = "008" + nis.padStart(7, "0").slice(-7);

      siswa = await prisma.siswa.create({
        data: {
          id: ulid(),
          sekolah_id: rombel.sekolah_id,
          nis: nis,
          nisn: nisn,
          nama_lengkap: item.nama,
          jenis_kelamin: item.jk,
          status_akademik: "AKTIF",
          catatan: "Siswa Kelas X TO 5",
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
