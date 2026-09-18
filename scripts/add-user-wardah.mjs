import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ulid } from "ulidx";

const prisma = new PrismaClient();

async function main() {
  console.log("=== MENDAFTARKAN GURU BARU: WARDAH ULFAH FAUZZIYAH, S.Pd. ===");

  // Hapus jika ada record parsial sebelumnya
  await prisma.guru.deleteMany({ where: { email: "wardah.ulfah@smapgri1kotabekasi.sch.id" } });
  await prisma.pengguna.deleteMany({ where: { username: "wardahulfa" } });
  await prisma.mataPelajaran.deleteMany({ where: { kode: "MTK-SMA-PGRI" } });
  await prisma.semester.deleteMany({ where: { kode: "GANJIL-SMA-PGRI" } });
  await prisma.tahunAjaran.deleteMany({ where: { kode: "TA-2026-SMA-PGRI" } });
  await prisma.sekolah.deleteMany({ where: { nama: "SMA PGRI 1 Kota Bekasi" } });

  const passwordHash = await bcrypt.hash("Password123#", 10);
  const sekolahId = ulid();
  const userId = ulid();
  const guruId = ulid();
  const mapelId = ulid();
  const tahunAjaranId = ulid();
  const semesterId = ulid();

  const trialBerakhir = new Date();
  trialBerakhir.setDate(trialBerakhir.getDate() + 30);

  // 1. Buat Sekolah Baru: SMA PGRI 1 Kota Bekasi
  const sekolah = await prisma.sekolah.create({
    data: {
      id: sekolahId,
      nama: "SMA PGRI 1 Kota Bekasi",
      npsn: "20223124",
      jenjang: "SMA",
      alamat: "Kota Bekasi, Jawa Barat",
      zona_waktu: "Asia/Jakarta",
      status_aktif: true,
      tipe_lisensi: "FREEMIUM",
      trial_berakhir_pada: trialBerakhir,
    },
  });
  console.log("1. Sekolah dibuat:", sekolah.nama, "(ID:", sekolah.id, ")");

  // 2. Buat Pengguna Guru: wardahulfa
  const pengguna = await prisma.pengguna.create({
    data: {
      id: userId,
      sekolah_id: sekolahId,
      username: "wardahulfa",
      email: "wardah.ulfah@smapgri1kotabekasi.sch.id",
      nama_lengkap: "Wardah Ulfah Fauzziyah, S.Pd.",
      password_hash: passwordHash,
      peran_dasar: "TEACHER",
      status_akun: "AKTIF",
      harus_ganti_password: false,
      tipe_lisensi: "FREEMIUM",
      trial_berakhir_pada: trialBerakhir,
    },
  });
  console.log("2. Pengguna dibuat: username:", pengguna.username, "| email:", pengguna.email);

  // 3. Buat Data Guru
  const guru = await prisma.guru.create({
    data: {
      id: guruId,
      sekolah_id: sekolahId,
      pengguna_id: userId,
      nama_lengkap: "Wardah Ulfah Fauzziyah",
      gelar_belakang: "S.Pd.",
      jenis_kelamin: "PEREMPUAN",
      email: "wardah.ulfah@smapgri1kotabekasi.sch.id",
      status_aktif: true,
      status_kepegawaian: "TETAP",
      status_lifecycle: "ACTIVE",
    },
  });
  console.log("3. Data Guru dibuat:", guru.nama_lengkap, guru.gelar_belakang);

  // 4. Buat Tahun Ajaran & Semester
  await prisma.tahunAjaran.create({
    data: {
      id: tahunAjaranId,
      sekolah_id: sekolahId,
      nama: "2026/2027",
      kode: "TA-2026-SMA-PGRI",
      tanggal_mulai: new Date("2026-07-01"),
      tanggal_selesai: new Date("2027-06-30"),
      status: "AKTIF",
    },
  });

  await prisma.semester.create({
    data: {
      id: semesterId,
      sekolah_id: sekolahId,
      tahun_ajaran_id: tahunAjaranId,
      nama: "Semester Ganjil",
      kode: "GANJIL-SMA-PGRI",
      urutan: 1,
      tanggal_mulai: new Date("2026-07-15"),
      tanggal_selesai: new Date("2026-12-20"),
      status: "AKTIF",
    },
  });
  console.log("4. Tahun Ajaran & Semester dibuat.");

  // 5. Buat Mata Pelajaran: Matematika
  const mapel = await prisma.mataPelajaran.create({
    data: {
      id: mapelId,
      sekolah_id: sekolahId,
      nama: "Matematika",
      kode: "MTK-SMA-PGRI",
      kelompok: "UMUM",
      status_aktif: true,
    },
  });
  console.log("5. Mata Pelajaran dibuat:", mapel.nama, "(", mapel.kode, ")");

  console.log("\n=== REGISTRASI WARDAH ULFAH FAUZZIYAH, S.Pd. BERHASIL ===");
  console.log("Username: wardahulfa");
  console.log("Email: wardah.ulfah@smapgri1kotabekasi.sch.id");
  console.log("Password: Password123#");
  console.log("Sekolah: SMA PGRI 1 Kota Bekasi");
  console.log("Mata Pelajaran: Matematika");
}

main()
  .catch((e) => {
    console.error("Gagal menambahkan guru:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
