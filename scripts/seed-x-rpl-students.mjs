import { PrismaClient } from "@prisma/client";
import { ulid } from "ulidx";

const prisma = new PrismaClient();

const studentsData = [
  { no: 1, nama: "Alan Zaini Akbar Wahyudin", jk: "L", agama: "ISLAM", catatan: "PB" },
  { no: 2, nama: "Arjuna", jk: "L", agama: "ISLAM", catatan: null },
  { no: 3, nama: "Fadhlan Hidayatullah", jk: "L", agama: "ISLAM", catatan: null },
  { no: 4, nama: "Faiz Ibrahim Alamsyah", jk: "L", agama: "ISLAM", catatan: null },
  { no: 5, nama: "Fakhira Nadhefa Althafunnisa", jk: "P", agama: "ISLAM", catatan: "PB" },
  { no: 6, nama: "Iqbal Maulana", jk: "L", agama: "ISLAM", catatan: "PB" },
  { no: 7, nama: "Joan Abner Matthewtua Tambunan", jk: "L", agama: "KRISTEN", catatan: "PB" },
  { no: 8, nama: "Leonel Putra Sitepu", jk: "L", agama: "KRISTEN", catatan: null },
  { no: 9, nama: "Kautsar Firdy Lukmana", jk: "L", agama: "ISLAM", catatan: "PB" },
  { no: 10, nama: "M. Charli Himami", jk: "L", agama: "ISLAM", catatan: "PB" },
  { no: 11, nama: "Mohamad Prasityo", jk: "L", agama: "ISLAM", catatan: null },
  { no: 12, nama: "Muhammad Ardi Efriyanto", jk: "L", agama: "ISLAM", catatan: null },
  { no: 13, nama: "Muhammad Bintang Ramadhan", jk: "L", agama: "ISLAM", catatan: null },
  { no: 14, nama: "Muhammad Rafi", jk: "L", agama: "ISLAM", catatan: null },
  { no: 15, nama: "Rafael Afandy Silaban", jk: "L", agama: "KRISTEN", catatan: null },
  { no: 16, nama: "Raka Ibnu Rivai", jk: "L", agama: "ISLAM", catatan: null },
  { no: 17, nama: "Ridho Wicaksono", jk: "L", agama: "ISLAM", catatan: "PB" },
  { no: 18, nama: "Rizki Amanda Putri", jk: "P", agama: "ISLAM", catatan: null },
  { no: 19, nama: "Rilly Ardian Suhendar", jk: "L", agama: "ISLAM", catatan: null },
  { no: 20, nama: "Satria Majid", jk: "L", agama: "ISLAM", catatan: null },
  { no: 21, nama: "Yeruel Jeshurun", jk: "L", agama: "KRISTEN", catatan: null },
];

async function main() {
  await prisma.$queryRawUnsafe("PRAGMA busy_timeout = 10000;");
  console.log("Memulai input data 21 siswa kelas X RPL...");

  // 1. Cari Rombel X RPL
  const rombel = await prisma.rombel.findFirst({
    where: {
      nama: "X RPL",
      status: "AKTIF",
    },
    include: {
      sekolah: true,
      tahun_ajaran: true,
      tingkat: true,
    },
  });

  if (!rombel) {
    throw new Error("Rombel X RPL aktif tidak ditemukan di database!");
  }

  console.log(`Ditemukan Rombel: ${rombel.nama} (ID: ${rombel.id})`);
  console.log(`Sekolah: ${rombel.sekolah.nama} (ID: ${rombel.sekolah_id})`);
  console.log(`Tahun Ajaran: ${rombel.tahun_ajaran.nama} (ID: ${rombel.tahun_ajaran_id})`);
  console.log(`Tingkat: ${rombel.tingkat?.nama || "Kelas 10"} (ID: ${rombel.tingkat_id})`);

  // Hapus penempatan dummy lama (Rian Pratama) di X RPL jika ada
  const dummyPlacement = await prisma.penempatanRombel.findFirst({
    where: {
      rombel_id: rombel.id,
      keikutsertaan: {
        siswa: {
          nis: "20261001",
        },
      },
    },
  });

  if (dummyPlacement) {
    console.log(`Menghapus penempatan dummy siswa 20261001 dari ${rombel.nama}...`);
    await prisma.penempatanRombel.delete({
      where: { id: dummyPlacement.id },
    });
  }

  // Cari NIS tertinggi di sekolah ini
  const existingStudents = await prisma.siswa.findMany({
    where: { sekolah_id: rombel.sekolah_id },
    select: { nis: true },
  });
  const numericNis = existingStudents
    .map((s) => Number(s.nis))
    .filter((n) => !isNaN(n) && n >= 20261000 && n < 20270000);
  let nextNisNum = numericNis.length > 0 ? Math.max(...numericNis) + 1 : 20261277;

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
          agama: item.agama,
          status_akademik: "AKTIF",
          catatan: item.catatan ? `Status asal: ${item.catatan}` : "Siswa Kelas X RPL",
          tanggal_masuk: new Date("2026-07-01"),
        },
      });
      console.log(
        `[+] Dibuat Siswa: ${siswa.nama_lengkap} (NIS: ${siswa.nis}, JK: ${siswa.jenis_kelamin}, Agama: ${siswa.agama})`
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
      agama: siswa.agama,
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
