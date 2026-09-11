import { PrismaClient } from "@prisma/client";
import { ulid } from "ulidx";

const prisma = new PrismaClient();

const studentsData = [
  { no: 1, nis: "24001", nama: "A.Rizki Fadilah", jk: "L", catatan: null },
  { no: 2, nis: "24003", nama: "Abdillah Darma Bhakti", jk: "L", catatan: "PB" },
  { no: 3, nis: "24176", nama: "Ardiansyah", jk: "L", catatan: null },
  { no: 4, nis: "24028", nama: "Arya Fayyaz Reyhan Wikanto", jk: "L", catatan: null },
  { no: 5, nis: "24040", nama: "Dhefa Hartono", jk: "L", catatan: "PB" },
  { no: 6, nis: "24042", nama: "Dian Alit Hana Lena", jk: "P", catatan: "PB" },
  { no: 7, nis: "24044", nama: "Dzaki Hafidhi Ridho", jk: "L", catatan: null },
  { no: 8, nis: "24055", nama: "Fazri Pratama", jk: "L", catatan: "PB" },
  { no: 9, nis: "24071", nama: "Kevin Putra Pratama", jk: "L", catatan: "PB" },
  { no: 10, nis: "24072", nama: "Listiyana Nirmala", jk: "P", catatan: null },
  { no: 11, nis: "24079", nama: "Misael Eduard Parera", jk: "L", catatan: "Non-Muslim" },
  { no: 12, nis: "24080", nama: "Mohammad Ilham", jk: "L", catatan: "PB" },
  { no: 13, nis: "24124", nama: "Putri Cinta Maulidha", jk: "P", catatan: null },
  { no: 14, nis: "24134", nama: "Rehan Bintang Tama", jk: "L", catatan: null },
  { no: 15, nis: "24157", nama: "Suciko Riyadi Zaky", jk: "L", catatan: null },
];

async function main() {
  await prisma.$queryRawUnsafe("PRAGMA busy_timeout = 10000;");
  console.log("=== Memulai Input Data Siswa Kelas XII RPL ===");

  // 1. Cari Rombel XII RPL
  let rombel = await prisma.rombel.findFirst({
    where: {
      nama: "XII RPL",
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
    throw new Error("Rombel XII RPL aktif tidak ditemukan di database!");
  }

  console.log(`Ditemukan Rombel : ${rombel.nama} (ID: ${rombel.id})`);
  console.log(`Sekolah          : ${rombel.sekolah.nama} (ID: ${rombel.sekolah_id})`);
  console.log(`Program Keahlian : ${rombel.program?.nama || "Rekayasa Perangkat Lunak"}`);
  console.log(`Tahun Ajaran     : ${rombel.tahun_ajaran.nama} (ID: ${rombel.tahun_ajaran_id})`);
  console.log(
    `Tingkat          : ${rombel.tingkat?.nama || "Kelas 12"} (ID: ${rombel.tingkat_id})\n`
  );

  const results = [];

  for (const item of studentsData) {
    // 2. Cek / Buat Siswa dengan NIS resmi
    let siswa = await prisma.siswa.findFirst({
      where: {
        sekolah_id: rombel.sekolah_id,
        nis: item.nis,
      },
    });

    const nisn = "006" + item.nis.padStart(7, "0");

    if (!siswa) {
      siswa = await prisma.siswa.create({
        data: {
          id: ulid(),
          sekolah_id: rombel.sekolah_id,
          nis: item.nis,
          nisn: nisn,
          nama_lengkap: item.nama,
          jenis_kelamin: item.jk,
          status_akademik: "AKTIF",
          catatan: item.catatan
            ? `Siswa Kelas XII RPL (${item.catatan})`
            : "Siswa Kelas XII RPL (Rekayasa Perangkat Lunak)",
          tanggal_masuk: new Date("2024-07-01"),
        },
      });
      console.log(
        `[+] Dibuat Siswa: No. ${String(item.no).padStart(2, "0")} | ${siswa.nama_lengkap.padEnd(28)} | NIS: ${siswa.nis} | JK: ${siswa.jenis_kelamin}`
      );
    } else {
      console.log(
        `[=] Siswa sudah ada: No. ${String(item.no).padStart(2, "0")} | ${siswa.nama_lengkap.padEnd(28)} | NIS: ${siswa.nis}`
      );
    }

    // 3. Cek / Buat Keikutsertaan Siswa pada Tahun Ajaran Berjalan
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

    // 4. Cek / Buat Penempatan Rombel (Rombel Placement)
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
      NIS: siswa.nis,
      NISN: siswa.nisn,
      "Nama Lengkap": siswa.nama_lengkap,
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
    console.error("Gagal menginput data siswa XII RPL:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
