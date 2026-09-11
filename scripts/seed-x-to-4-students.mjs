import { PrismaClient } from "@prisma/client";
import { ulid } from "ulidx";

const prisma = new PrismaClient();

const studentsData = [
  { no: 1, nama: "Abieza Praya Kurniawan", jk: "L" },
  { no: 2, nama: "Akhdan Ibnu Mahya", jk: "L" },
  { no: 3, nama: "Aliza Dwinovita", jk: "P" },
  { no: 4, nama: "Alvino Dian Pratama", jk: "L" },
  { no: 5, nama: "Agus Khalifah Akbar", jk: "L" },
  { no: 6, nama: "Andhika Rizky Hermanda", jk: "L" },
  { no: 7, nama: "Arya Paramudya Eliyanto", jk: "L" },
  { no: 8, nama: "As Qalani Khalifah Akbar Harahap", jk: "L" },
  { no: 9, nama: "Briliyan Rahman Saputra", jk: "L" },
  // Catatan: Baris ke-10 pada lembar fisik adalah "Dewa Saputra" yang telah dicoret/dibatalkan.
  // Digantikan oleh siswa tambahan bertuliskan tangan di bagian bawah lembar: "M. Rifat Firdaus".
  { no: 10, nama: "Dhevan Definza Ramadhan", jk: "L" },
  { no: 11, nama: "Dicky Nur Hidayat", jk: "L" },
  { no: 12, nama: "Dyas Mandala Febri Yulitama", jk: "L" },
  { no: 13, nama: "Fahmi Oktabi Putra", jk: "L" },
  { no: 14, nama: "Faris Nashwan Khayri", jk: "L" },
  { no: 15, nama: "Firman Noviansyah", jk: "L" },
  { no: 16, nama: "Galih Febrian", jk: "L" },
  { no: 17, nama: "Gofur Alfayet Nugroho", jk: "L" },
  { no: 18, nama: "Haris Hendrawan", jk: "L" },
  { no: 19, nama: "Maulana Algifahri", jk: "L" },
  { no: 20, nama: "Muhamad Ghazi Fawwas Rizqullah", jk: "L" },
  { no: 21, nama: "Muhammad Arif Agustian", jk: "L" },
  { no: 22, nama: "Muhammad Dani Fairus", jk: "L" },
  { no: 23, nama: "Muhammad Heri Putra Pratama", jk: "L" },
  { no: 24, nama: "Muhammad Ken Alfard", jk: "L" },
  { no: 25, nama: "Rangga Putra Ernanto", jk: "L" },
  { no: 26, nama: "Revandi Putra Ramadan", jk: "L" },
  { no: 27, nama: "Rifantri", jk: "L" },
  { no: 28, nama: "Riyan Syahputra", jk: "L" },
  { no: 29, nama: "Rizkiyansah Putra", jk: "L" },
  { no: 30, nama: "Rizky Darmawan", jk: "L" },
  { no: 31, nama: "Rizky Rahmansyah", jk: "L" },
  { no: 32, nama: "Rizqi Alamsyah", jk: "L" },
  { no: 33, nama: "Sabrawi Jaya", jk: "L" },
  { no: 34, nama: "Tri Fatria Duta Wangsa", jk: "L" },
  { no: 35, nama: "Quais Alqorni", jk: "L" },
  {
    no: 36,
    nama: "M. Rifat Firdaus",
    jk: "L",
    catatan: "Siswa susulan (tertulis tangan pada lembar presensi)",
  },
];

async function main() {
  await prisma.$queryRawUnsafe("PRAGMA busy_timeout = 10000;");
  console.log("=== Memulai Input Data Siswa Kelas X TO 4 ===");

  // 1. Cari Rombel X TO 4
  const rombel = await prisma.rombel.findFirst({
    where: {
      nama: "X TO 4",
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
    throw new Error("Rombel X TO 4 aktif tidak ditemukan di database!");
  }

  console.log(`Ditemukan Rombel : ${rombel.nama} (ID: ${rombel.id})`);
  console.log(`Sekolah          : ${rombel.sekolah.nama} (ID: ${rombel.sekolah_id})`);
  console.log(`Program Keahlian : ${rombel.program?.nama || "Teknik Otomotif"}`);
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
  let nextNisNum = numericNis.length > 0 ? Math.max(...numericNis) + 1 : 20261125;

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
          catatan: item.catatan || "Siswa Kelas X TO 4 (Teknik Otomotif)",
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
    console.error("Gagal menginput data siswa X TO 4:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
