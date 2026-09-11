import { PrismaClient } from "@prisma/client";
import { ulid } from "ulidx";

const prisma = new PrismaClient();

const studentsData = [
  { no: 1, nama: "Abdul Rohman Anggani", jk: "L" },
  { no: 2, nama: "Ajharu Geril Putra Ganansyah", jk: "L" },
  { no: 3, nama: "Andra Saputra", jk: "L" },
  { no: 4, nama: "Destia Maharani", jk: "P" },
  { no: 5, nama: "Dimas Kurniawan", jk: "L" },
  { no: 6, nama: "Fadil Al-Ghufron", jk: "L" },
  { no: 7, nama: "Fairuz Ghaissani", jk: "P" },
  { no: 8, nama: "Hilmia Hapsa Farah", jk: "P" },
  { no: 9, nama: "Ilham Angga Kusuma", jk: "L" },
  { no: 10, nama: "Inez Salsabila Putri", jk: "P" },
  { no: 11, nama: "Lenita Eleni Widiyarto", jk: "P" },
  { no: 12, nama: "Meisha Tigis Ayuningtyas", jk: "P" },
  { no: 13, nama: "Muhamad Raffly", jk: "L" },
  { no: 14, nama: "Muhammad Alfian Rifdi", jk: "L" },
  { no: 15, nama: "Muhammad Fadilah Pratama", jk: "L" },
  { no: 16, nama: "Muhammad Gandalf Khafi", jk: "L" },
  { no: 17, nama: "Musthofa Sahil", jk: "L" },
  { no: 18, nama: "Naufal Arka Alfayyed", jk: "L" },
  { no: 19, nama: "Noval Abdillah Wibowo", jk: "L" },
  { no: 20, nama: "Putra Triadyaska", jk: "L" },
  { no: 21, nama: "Raisya Alfita", jk: "P" },
  { no: 22, nama: "Shelly Septiyani", jk: "P" },
  { no: 23, nama: "Syifa Aulia Rahmah", jk: "P" },
  { no: 24, nama: "Vanessa Azzahra", jk: "P" },
  { no: 25, nama: "Wahyu Prasetyo", jk: "L" },
  { no: 26, nama: "Yusuf Ramadahan Saputra", jk: "L" },
  { no: 27, nama: "Zidan Alfariz", jk: "L" },
];

async function main() {
  await prisma.$queryRawUnsafe("PRAGMA busy_timeout = 10000;");
  console.log("=== Memulai Input Data Siswa Kelas X TKJ 2 (X TJKT 2) ===");

  // 1. Cari Rombel X TJKT 2 (atau X TKJ 2)
  let rombel = await prisma.rombel.findFirst({
    where: {
      nama: {
        in: ["X TJKT 2", "X TKJ 2"],
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
    throw new Error("Rombel X TJKT 2 / X TKJ 2 aktif tidak ditemukan di database!");
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
  let nextNisNum = numericNis.length > 0 ? Math.max(...numericNis) + 1 : 20261161;

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
          catatan: "Siswa Kelas X TJKT 2 (Teknik Jaringan Komputer dan Telekomunikasi)",
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
    console.error("Gagal menginput data siswa X TKJ 2:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
