import { PrismaClient } from "@prisma/client";
import { ulid } from "ulidx";

const prisma = new PrismaClient();

const studentsData = [
  { no: 1, nama: "Akbar Rizky Rameyza", jk: "L", catatan: null },
  { no: 2, nama: "Ananda Tiaraputri Sopyan", jk: "P", catatan: null },
  { no: 3, nama: "Anaya Putri Prasetya", jk: "P", catatan: null },
  { no: 4, nama: "Anjani Putri", jk: "P", catatan: null },
  { no: 5, nama: "Aula Suci Putri Dewi", jk: "P", catatan: null },
  { no: 6, nama: "Azura Khalycazni", jk: "P", catatan: null },
  { no: 7, nama: "Derys Fajar Ardyansyah", jk: "L", catatan: null },
  { no: 8, nama: "Dimas Radittiya", jk: "L", catatan: null },
  { no: 9, nama: "Gendis Andrianny", jk: "P", catatan: null },
  { no: 10, nama: "Jihan Fathinah Uzma", jk: "P", catatan: null },
  { no: 11, nama: "Keyla Aulia Putri", jk: "P", catatan: null },
  { no: 12, nama: "Muhamad Haikal Alzabbar", jk: "L", catatan: null },
  { no: 13, nama: "Muhamad Riski", jk: "L", catatan: null },
  { no: 14, nama: "Muhammad Fadli Wijaya", jk: "L", catatan: null },
  { no: 15, nama: "Nabilla Cahaya Aulia Ramadhan", jk: "P", catatan: null },
  { no: 16, nama: "Nurul A'ini Arasyid", jk: "P", catatan: null },
  { no: 17, nama: "Puspa Fitri Wulandaris", jk: "P", catatan: null },
  { no: 18, nama: "Rianti", jk: "P", catatan: null },
  { no: 19, nama: "Rizky Wijaya", jk: "L", catatan: null },
  { no: 20, nama: "Risma Agustin Maharani", jk: "P", catatan: null },
  { no: 21, nama: "Salmah Hasanah", jk: "P", catatan: null },
  { no: 22, nama: "Willy Damara", jk: "L", catatan: null },
];

async function main() {
  await prisma.$queryRawUnsafe("PRAGMA busy_timeout = 10000;");
  console.log("Memulai input data 22 siswa kelas X DKV 2...");

  // 1. Cari Rombel X DKV 2
  const rombel = await prisma.rombel.findFirst({
    where: {
      nama: "X DKV 2",
      status: "AKTIF",
    },
    include: {
      sekolah: true,
      tahun_ajaran: true,
      tingkat: true,
    },
  });

  if (!rombel) {
    throw new Error("Rombel X DKV 2 aktif tidak ditemukan di database!");
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
  let nextNisNum = numericNis.length > 0 ? Math.max(...numericNis) + 1 : 20261255;

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
          catatan: item.catatan ? `Status asal: ${item.catatan}` : "Siswa Kelas X DKV 2",
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
