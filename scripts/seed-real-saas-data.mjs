import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ulid } from "ulidx";

const prisma = new PrismaClient();

async function main() {
  console.log("=== MENGATUR DATA RIIL SAAS RUANG PINTAR ===");

  const passwordHash = await bcrypt.hash("Password123#", 10);

  // 1. Bersihkan seluruh data dummy operasional
  console.log("1. Membersihkan data dummy lama...");
  await prisma.$executeRawUnsafe("PRAGMA foreign_keys = OFF;");

  await prisma.jawabanSiswa.deleteMany();
  await prisma.eventIntegritasUjian.deleteMany();
  await prisma.hasilUjianCbt.deleteMany();
  await prisma.sesiUjianSiswa.deleteMany();
  await prisma.snapshotUjian.deleteMany();
  await prisma.ujianCbt.deleteMany();
  await prisma.versiSoal.deleteMany();
  await prisma.bankSoal.deleteMany();

  await prisma.nilaiSiswa.deleteMany();
  await prisma.publikasiNilaiAsesmen.deleteMany();
  await prisma.definisiAsesmen.deleteMany();

  await prisma.presensiSesiKelas.deleteMany();
  await prisma.pengumpulanTugas.deleteMany();
  await prisma.publikasiTugas.deleteMany();
  await prisma.definisiTugas.deleteMany();
  await prisma.publikasiMateri.deleteMany();
  await prisma.materiPembelajaran.deleteMany();
  await prisma.tujuanPembelajaran.deleteMany();
  await prisma.lingkupMateri.deleteMany();
  await prisma.administrasiTujuanPembelajaran.deleteMany();
  await prisma.administrasiPembelajaran.deleteMany();

  await prisma.sesiKelasAktual.deleteMany();
  await prisma.jadwalPelajaran.deleteMany();
  await prisma.versiJadwal.deleteMany();
  await prisma.slotWaktu.deleteMany();
  await prisma.kalenderAkademik.deleteMany();

  await prisma.penugasanMengajar.deleteMany();
  await prisma.penugasanWaliKelas.deleteMany();
  await prisma.mataPelajaran.deleteMany();

  await prisma.pengajuanWali.deleteMany();
  await prisma.hubunganWaliSiswa.deleteMany();
  await prisma.waliMurid.deleteMany();

  await prisma.penempatanRombel.deleteMany();
  await prisma.keikutsertaanSiswa.deleteMany();
  await prisma.siswa.deleteMany();
  await prisma.rombel.deleteMany();
  await prisma.tingkatKelas.deleteMany();
  await prisma.programKeahlian.deleteMany();
  await prisma.fase.deleteMany();
  await prisma.semester.deleteMany();
  await prisma.tahunAjaran.deleteMany();

  await prisma.catatanMonitoring.deleteMany();
  await prisma.tindakLanjutMonitoring.deleteMany();
  await prisma.riwayatEksporLaporan.deleteMany();
  await prisma.sasaranPengumuman.deleteMany();
  await prisma.pengumuman.deleteMany();
  await prisma.notifikasiPengguna.deleteMany();
  await prisma.preferensiNotifikasi.deleteMany();
  await prisma.permintaanSetupKelasAi.deleteMany();
  await prisma.metadataBerkas.deleteMany();
  await prisma.logAudit.deleteMany();
  await prisma.logPengirimanIntegrasi.deleteMany();
  await prisma.endpointWebhook.deleteMany();
  await prisma.konfigurasiIntegrasi.deleteMany();

  await prisma.penugasanJabatan.deleteMany();
  await prisma.jabatan.deleteMany();
  await prisma.unitOrganisasi.deleteMany();
  await prisma.guru.deleteMany();
  await prisma.kemampuanStaff.deleteMany();
  await prisma.sesiPengguna.deleteMany();
  await prisma.logPercobaanLogin.deleteMany();

  // Hapus semua pengguna lama
  await prisma.pengguna.deleteMany();

  // Hapus semua sekolah lama
  await prisma.sekolah.deleteMany();

  await prisma.$executeRawUnsafe("PRAGMA foreign_keys = ON;");
  console.log("Pembersihan database selesai.");

  // 2. Buat Pengguna SUPER ADMIN untuk Login Platform
  const superAdminId = ulid();
  const superAdmin = await prisma.pengguna.create({
    data: {
      id: superAdminId,
      username: "superadmin",
      nama_lengkap: "Super Administrator",
      email: "superadmin@ruangpintar.id",
      password_hash: passwordHash,
      peran_dasar: "SUPER_ADMIN",
      status_akun: "AKTIF",
    },
  });
  console.log("2. Akun Super Admin dibuat:", superAdmin.username);

  // 3. Buat 1 Sekolah Riil: SMK OTOMINDO (Status: Trial 30 Hari / Freemium)
  const sekolahId = ulid();
  const trialBerakhir = new Date();
  trialBerakhir.setDate(trialBerakhir.getDate() + 30);

  const sekolah = await prisma.sekolah.create({
    data: {
      id: sekolahId,
      nama: "SMK OTOMINDO",
      npsn: "20108877",
      jenjang: "SMK",
      alamat: "Jl. Otomindo No. 1, Jakarta",
      telepon: "021-88997766",
      email: "info@otomindo.sch.id",
      tipe_lisensi: "FREEMIUM",
      trial_berakhir_pada: trialBerakhir,
      status_aktif: true,
    },
  });
  console.log("3. Sekolah Riil dibuat:", sekolah.nama, "(Tipe: FREEMIUM Trial 30 Hari)");

  // 4. Buat Tahun Ajaran 2026/2027 & Semester Ganjil
  const tahunAjaranId = ulid();
  await prisma.tahunAjaran.create({
    data: {
      id: tahunAjaranId,
      sekolah_id: sekolahId,
      nama: "2026/2027",
      kode: "TA-2026-2027",
      tanggal_mulai: new Date("2026-07-01"),
      tanggal_selesai: new Date("2027-06-30"),
      status: "AKTIF",
    },
  });

  const semesterId = ulid();
  await prisma.semester.create({
    data: {
      id: semesterId,
      sekolah_id: sekolahId,
      tahun_ajaran_id: tahunAjaranId,
      nama: "Semester Ganjil",
      kode: "GANJIL",
      urutan: 1,
      tanggal_mulai: new Date("2026-07-15"),
      tanggal_selesai: new Date("2026-12-20"),
      status: "AKTIF",
    },
  });

  // 5. Buat Tingkat Kelas 10 (Kelas X)
  const tingkatId = ulid();
  await prisma.tingkatKelas.create({
    data: {
      id: tingkatId,
      sekolah_id: sekolahId,
      kode: "X",
      nama: "Kelas 10",
      urutan: 10,
    },
  });

  // 6. Buat 10 Kelas X SMK OTOMINDO
  const namaKelasList = [
    "X RPL 1",
    "X RPL 2",
    "X TKJ 1",
    "X TKJ 2",
    "X DKV 1",
    "X DKV 2",
    "X TKR 1",
    "X TKR 2",
    "X TBSM 1",
    "X TBSM 2",
  ];

  const rombelRecords = [];
  for (const namaKelas of namaKelasList) {
    const rombelId = ulid();
    const r = await prisma.rombel.create({
      data: {
        id: rombelId,
        sekolah_id: sekolahId,
        tingkat_id: tingkatId,
        tahun_ajaran_id: tahunAjaranId,
        nama: namaKelas,
        kapasitas: 36,
        status: "AKTIF",
      },
    });
    rombelRecords.push(r);
  }
  console.log(`4. Dibuat 10 Kelas X Rombel: ${namaKelasList.join(", ")}`);

  // 7. Buat Mata Pelajaran KKA (Koding dan Kecerdasan Artifisial)
  const mapelId = ulid();
  const mapel = await prisma.mataPelajaran.create({
    data: {
      id: mapelId,
      sekolah_id: sekolahId,
      kode: "KKA",
      nama: "Koding dan Kecerdasan Artifisial (KKA)",
      kelompok: "KEJURUAN",
      status_aktif: true,
    },
  });
  console.log("5. Mata Pelajaran dibuat:", mapel.nama);

  // 8. Buat Akun Pengguna Guru Riil: Pak Eri Chandra Apriyadi, S.Kom.
  const guruUserId = ulid();
  const eriUser = await prisma.pengguna.create({
    data: {
      id: guruUserId,
      sekolah_id: sekolahId,
      username: "erichandra",
      nama_lengkap: "Pak Eri Chandra Apriyadi, S.Kom.",
      email: "eri.chandra@otomindo.sch.id",
      password_hash: passwordHash,
      peran_dasar: "TEACHER",
      status_akun: "AKTIF",
    },
  });
  console.log("6. Akun Guru dibuat:", eriUser.nama_lengkap, "(Username: erichandra)");

  // 9. Buat Profil Guru
  const guruProfilId = ulid();
  const guru = await prisma.guru.create({
    data: {
      id: guruProfilId,
      sekolah_id: sekolahId,
      pengguna_id: guruUserId,
      nip: "198505202010011005",
      nama_lengkap: "Pak Eri Chandra Apriyadi, S.Kom.",
      jenis_kelamin: "L",
      status_kepegawaian: "TETAP",
      status_aktif: true,
    },
  });

  // 10. Hubungkan Penugasan Mengajar Pak Eri Chandra ke 10 Kelas X untuk Mapel KKA
  for (const r of rombelRecords) {
    await prisma.penugasanMengajar.create({
      data: {
        id: ulid(),
        sekolah_id: sekolahId,
        guru_id: guruProfilId,
        mata_pelajaran_id: mapelId,
        tahun_ajaran_id: tahunAjaranId,
        semester_id: semesterId,
        rombel_id: r.id,
        status: "AKTIF",
      },
    });
  }
  console.log("7. Penugasan Mengajar Mapel KKA berhasil dihubungkan ke 10 Kelas X!");

  // Verifikasi Hitungan Akhir
  const totalSekolah = await prisma.sekolah.count();
  const totalGuru = await prisma.pengguna.count({ where: { peran_dasar: "TEACHER" } });
  const totalRombel = await prisma.rombel.count({ where: { status: "AKTIF" } });
  const totalSiswa = await prisma.siswa.count();

  console.log("\n==========================================");
  console.log("STATUS RIIL BASIS DATA RUANG PINTAR SAAS:");
  console.log("- Total Sekolah  : " + totalSekolah + " (SMK OTOMINDO - Trial)");
  console.log("- Total Guru     : " + totalGuru + " (Pak Eri Chandra Apriyadi, S.Kom.)");
  console.log("- Total Rombel   : " + totalRombel + " (10 Kelas X)");
  console.log("- Total Siswa    : " + totalSiswa + " (0 Siswa - belum ada siswa)");
  console.log("==========================================");
}

main()
  .catch((err) => {
    console.error("Error seeder:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
