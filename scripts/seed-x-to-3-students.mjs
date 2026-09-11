import { PrismaClient } from "@prisma/client";
import { ulid } from "ulidx";

const prisma = new PrismaClient();

const STUDENTS = [
  { no: 1, nama: "Ahmad Fatoni", jk: "L", status: "AKTIF" },
  { no: 2, nama: "Alif Adhitya Dirgantara", jk: "L", status: "AKTIF" },
  { no: 3, nama: "Andika Rizky Ramadhan", jk: "L", status: "AKTIF" },
  { no: 4, nama: "Ayzicho Aulia Supriyanto", jk: "L", status: "AKTIF" },
  {
    no: 5,
    nama: "Bayu Adji Setiawan",
    jk: "L",
    status: "MUTASI",
    catatan: "Dicoret tinta merah pada fisik absen",
  },
  { no: 6, nama: "David Rama Dhani", jk: "L", status: "AKTIF" },
  { no: 7, nama: "Dzakky Dwi Putra", jk: "L", status: "AKTIF" },
  { no: 8, nama: "Fachry Azka Fauzan", jk: "L", status: "AKTIF" },
  { no: 9, nama: "Farel Ardiyansyah", jk: "L", status: "AKTIF" },
  { no: 10, nama: "Faris Rafka Alkahfi", jk: "L", status: "AKTIF" },
  { no: 11, nama: "Fathir Faturrahman", jk: "L", status: "AKTIF" },
  { no: 12, nama: "Galih Linggar Ramadhan", jk: "L", status: "AKTIF" },
  { no: 13, nama: "Galuh Sadewo", jk: "L", status: "AKTIF" },
  { no: 14, nama: "Herdy Zuan Key", jk: "L", status: "AKTIF" },
  { no: 15, nama: "Ibrahim", jk: "L", status: "AKTIF" },
  { no: 16, nama: "M Firza Tulloh", jk: "L", status: "AKTIF" },
  { no: 17, nama: "Maritza Hamizan Mahkrus", jk: "L", status: "AKTIF" },
  { no: 18, nama: "Maulana Ibrahim", jk: "L", status: "AKTIF" },
  { no: 19, nama: "Maulana Malik Ibrahim", jk: "L", status: "AKTIF" },
  { no: 20, nama: "Mohamad Alfazani", jk: "L", status: "AKTIF" },
  { no: 21, nama: "Muhammad Arsya Wijaya", jk: "L", status: "AKTIF" },
  { no: 22, nama: "Muhammad Alfa Rizky Aditya", jk: "L", status: "AKTIF" },
  {
    no: 23,
    nama: "Muhammad Dimas Pranoto",
    jk: "L",
    status: "MUTASI",
    catatan: "Dicoret tinta hitam pada fisik absen",
  },
  { no: 24, nama: "Muhammad Fahri Amruhu Fathur", jk: "L", status: "AKTIF" },
  { no: 25, nama: "Muhammad Kahfi Fadlyansyah", jk: "L", status: "AKTIF" },
  { no: 26, nama: "Muhammad Rafa Al Farizi", jk: "L", status: "AKTIF" },
  { no: 27, nama: "Muhammad Razka Aryadi", jk: "L", status: "AKTIF" },
  { no: 28, nama: "Muhammad Safaat", jk: "L", status: "AKTIF" },
  { no: 29, nama: "Naufal Halil Pradipta", jk: "L", status: "AKTIF" },
  { no: 30, nama: "Putra Ramadhan", jk: "L", status: "AKTIF" },
  { no: 31, nama: "Raffi Aldiansyah", jk: "L", status: "AKTIF" },
  { no: 32, nama: "Ridho Pratama", jk: "L", status: "AKTIF" },
  { no: 33, nama: "Rizky Jaka Jaladara", jk: "L", status: "AKTIF" },
  { no: 34, nama: "Satrio Wicaksono", jk: "L", status: "AKTIF" },
  { no: 35, nama: "Tedy Maulana", jk: "L", status: "AKTIF" },
  { no: 36, nama: "Yoghi Fauzan Azima", jk: "L", status: "AKTIF" },
  { no: 37, nama: "Yudha Rhafa Hidayat", jk: "L", status: "AKTIF" },
  { no: 38, nama: "Zulkifli Amin", jk: "L", status: "AKTIF" },
];

async function main() {
  console.log("Memulai sinkronisasi data siswa X TO 3...");

  const rombel = await prisma.rombel.findUnique({
    where: { id: "01M19MV91MYBM4KCWQREM0WJWM" },
    include: { sekolah: true, tahun_ajaran: true, tingkat: true },
  });

  if (!rombel) {
    throw new Error("Rombel X TO 3 tidak ditemukan di database!");
  }

  const sekolahId = rombel.sekolah_id;
  const tahunAjaranId = rombel.tahun_ajaran_id;
  const tingkatId = rombel.tingkat_id;

  console.log(`Target Rombel: ${rombel.nama} (${rombel.kode})`);
  console.log(`Sekolah: ${rombel.sekolah.nama}`);
  console.log(`Tahun Ajaran: ${rombel.tahun_ajaran.nama}`);

  // 2. Alokasi nomor NIS berurutan sesuai standar
  const existingStudents = await prisma.siswa.findMany({
    where: { sekolah_id: sekolahId },
    select: { nis: true },
  });
  const numericNis = existingStudents
    .map((s) => Number(s.nis))
    .filter((n) => !isNaN(n) && n >= 20261000 && n < 20270000);
  let nextNisNum = numericNis.length > 0 ? Math.max(...numericNis) + 1 : 20261217;
  console.log(`Alokasi NIS dimulai dari: ${nextNisNum}\n`);

  let activeAbsen = 1;

  for (const s of STUDENTS) {
    // 1. Cek atau buat Siswa
    let siswa = await prisma.siswa.findFirst({
      where: {
        sekolah_id: sekolahId,
        nama_lengkap: s.nama,
      },
    });

    if (!siswa) {
      const nis = String(nextNisNum++);
      const nisn = "008" + nis.slice(-7).padStart(7, "0");
      siswa = await prisma.siswa.create({
        data: {
          id: ulid(),
          sekolah_id: sekolahId,
          nama_lengkap: s.nama,
          nis,
          nisn,
          jenis_kelamin: s.jk,
          status_akademik: s.status === "AKTIF" ? "AKTIF" : "MUTASI",
          catatan: s.catatan || "Siswa Kelas X TO 3 (Teknik Otomotif)",
          tanggal_masuk: new Date("2026-07-01"),
        },
      });
      console.log(`[+] Dibuat data Siswa: ${s.nama} (${nis})`);
    } else {
      // Update nis jika belum berformat 20261xxx
      if (!siswa.nis || !siswa.nis.startsWith("20261")) {
        const nis = String(nextNisNum++);
        const nisn = "008" + nis.slice(-7).padStart(7, "0");
        siswa = await prisma.siswa.update({
          where: { id: siswa.id },
          data: { nis, nisn, catatan: s.catatan || "Siswa Kelas X TO 3 (Teknik Otomotif)" },
        });
        console.log(`[*] Diperbarui NIS Siswa: ${s.nama} -> ${nis}`);
      } else {
        console.log(`[=] Data Siswa sudah ada: ${s.nama} (${siswa.nis})`);
      }
    }

    // 2. Cek atau buat KeikutsertaanSiswa (Enrollment)
    let enrollment = await prisma.keikutsertaanSiswa.findFirst({
      where: {
        sekolah_id: sekolahId,
        siswa_id: siswa.id,
        tahun_ajaran_id: tahunAjaranId,
      },
    });

    if (!enrollment) {
      enrollment = await prisma.keikutsertaanSiswa.create({
        data: {
          id: ulid(),
          sekolah_id: sekolahId,
          siswa_id: siswa.id,
          tahun_ajaran_id: tahunAjaranId,
          tingkat_id: tingkatId,
          status: s.status === "AKTIF" ? "AKTIF" : "MUTASI",
          tanggal_mulai: new Date("2026-07-01"),
          catatan: s.catatan || null,
        },
      });
    }

    // 3. Cek atau buat PenempatanRombel
    let penempatan = await prisma.penempatanRombel.findFirst({
      where: {
        keikutsertaan_id: enrollment.id,
        rombel_id: rombel.id,
      },
    });

    if (!penempatan) {
      const nomorAbsen = s.status === "AKTIF" ? activeAbsen++ : s.no;
      penempatan = await prisma.penempatanRombel.create({
        data: {
          id: ulid(),
          sekolah_id: sekolahId,
          keikutsertaan_id: enrollment.id,
          rombel_id: rombel.id,
          nomor_absen: nomorAbsen,
          status: s.status === "AKTIF" ? "AKTIF" : "NONAKTIF",
          tanggal_mulai: new Date("2026-07-01"),
        },
      });
      console.log(
        `    -> Penempatan X TO 3: No. Absen ${nomorAbsen} (Status: ${penempatan.status})`
      );
    }
  }

  // Update kapasitas rombel jika diperlukan
  await prisma.rombel.update({
    where: { id: rombel.id },
    data: { kapasitas: 38 },
  });

  console.log("\nSinkronisasi selesai! Seluruh 38 siswa telah diproses untuk rombel X TO 3.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
