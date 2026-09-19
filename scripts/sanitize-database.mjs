import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SCHOOL_ID = "01M2R5DJMBEDSC3Y9DRPK3WRCW";
const SUPER_ADMIN_ID = "01M2R5DJM8XHBG7X38FAF7ZF3Q";
const ERI_CHANDRA_USER_ID = "01M2R5DJNWZH47KK6A9A25Q6AQ";

async function main() {
  console.log("=== MEMULAI SANITASI BASIS DATA RUANG PINTAR ===");
  await prisma.$executeRawUnsafe("PRAGMA foreign_keys = OFF;");

  // 1. Pastikan Sekolah SMK OTOMINDO Ada & Valid
  let sekolah = await prisma.sekolah.findUnique({ where: { id: SCHOOL_ID } });
  if (!sekolah) {
    sekolah = await prisma.sekolah.create({
      data: {
        id: SCHOOL_ID,
        nama: "SMK OTOMINDO",
        npsn: "20108877",
        jenjang: "SMK",
        alamat: "Jl. Otomindo No. 1, Jakarta",
        telepon: "021-88997766",
        email: "info@otomindo.sch.id",
        zona_waktu: "Asia/Jakarta",
        tipe_lisensi: "FREEMIUM",
        trial_berakhir_pada: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status_aktif: true,
      },
    });
    console.log("Sekolah SMK OTOMINDO berhasil dibuat.");
  } else {
    await prisma.sekolah.update({
      where: { id: SCHOOL_ID },
      data: {
        nama: "SMK OTOMINDO",
        jenjang: "SMK",
        tipe_lisensi: "FREEMIUM",
        status_aktif: true,
      },
    });
    console.log("Sekolah SMK OTOMINDO diperbarui.");
  }

  // 2. Bersihkan Siswa (permintaan user: total siswa belum ada / 0)
  await prisma.keikutsertaanSiswa.deleteMany({});
  await prisma.penempatanRombel.deleteMany({});
  await prisma.jawabanSiswa.deleteMany({});
  await prisma.sesiUjianSiswa.deleteMany({});
  await prisma.hasilUjianCbt.deleteMany({});
  await prisma.pengumpulanTugas.deleteMany({});
  await prisma.presensiSesiKelas.deleteMany({});
  await prisma.nilaiSiswa.deleteMany({});
  await prisma.hubunganWaliSiswa.deleteMany({});
  await prisma.siswa.deleteMany({});
  console.log("Data siswa dibersihkan (Total Siswa = 0).");

  // 3. Bersihkan Sekolah-sekolah tiruan sisa test suite
  const testSchools = await prisma.sekolah.findMany({
    where: { id: { not: SCHOOL_ID } },
    select: { id: true, nama: true },
  });
  console.log(`Ditemukan ${testSchools.length} sekolah tiruan test. Menghapus...`);

  for (const ts of testSchools) {
    // Hapus relasi turunan
    await prisma.notifikasiPengguna.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.pengumuman.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.jadwalPelajaran.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.sesiKelasAktual.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.penugasanMengajar.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.penugasanWaliKelas.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.penugasanJabatan.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.jabatan.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.unitOrganisasi.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.publikasiTugas.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.definisiTugas.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.publikasiMateri.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.materiPembelajaran.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.tujuanPembelajaran.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.lingkupMateri.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.publikasiNilaiAsesmen.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.definisiAsesmen.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.snapshotUjian.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.ujianCbt.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.versiSoal.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.bankSoal.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.slotWaktu.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.versiJadwal.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.kalenderAkademik.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.rombel.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.programKeahlian.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.tingkatKelas.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.fase.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.semester.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.tahunAjaran.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.mataPelajaran.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.guru.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.waliMurid.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.logAudit.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.metadataBerkas.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.konfigurasiSistem.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.konfigurasiIntegrasi.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.endpointWebhook.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.permintaanSetupKelasAi.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.sesiPengguna.deleteMany({ where: { pengguna: { sekolah_id: ts.id } } });
    await prisma.pengguna.deleteMany({ where: { sekolah_id: ts.id } });
    await prisma.sekolah.delete({ where: { id: ts.id } });
  }
  console.log("Sekolah tiruan test berhasil dihapus.");

  // 4. Bersihkan Pengguna sisa test (selain superadmin & erichandra)
  const otherUsers = await prisma.pengguna.findMany({
    where: {
      id: { notIn: [SUPER_ADMIN_ID, ERI_CHANDRA_USER_ID] },
    },
    select: { id: true, username: true },
  });
  console.log(`Ditemukan ${otherUsers.length} akun test. Menghapus...`);
  for (const u of otherUsers) {
    await prisma.sesiPengguna.deleteMany({ where: { pengguna_id: u.id } });
    await prisma.guru.deleteMany({ where: { pengguna_id: u.id } });
    await prisma.pengguna.delete({ where: { id: u.id } });
  }

  // 5. Pastikan Akun Super Admin & Eri Chandra Terhubung ke SMK OTOMINDO
  await prisma.pengguna.update({
    where: { id: SUPER_ADMIN_ID },
    data: {
      sekolah_id: SCHOOL_ID,
      status_akun: "AKTIF",
    },
  });
  console.log("Akun superadmin dihubungkan ke SMK OTOMINDO.");

  await prisma.pengguna.update({
    where: { id: ERI_CHANDRA_USER_ID },
    data: {
      nama_lengkap: "Pak Eri Chandra Apriyadi, S.Kom.",
      sekolah_id: SCHOOL_ID,
      peran_dasar: "TEACHER",
      status_akun: "AKTIF",
    },
  });
  console.log("Akun Pak Eri Chandra diperbarui.");

  // 6. Pastikan Profil Guru Pak Eri Chandra
  let guruEri = await prisma.guru.findFirst({
    where: { pengguna_id: ERI_CHANDRA_USER_ID },
  });
  if (!guruEri) {
    guruEri = await prisma.guru.create({
      data: {
        id: "01M2R5GURU00000000000000001",
        sekolah_id: SCHOOL_ID,
        pengguna_id: ERI_CHANDRA_USER_ID,
        nama_lengkap: "Pak Eri Chandra Apriyadi",
        gelar_belakang: "S.Kom.",
        jenis_kelamin: "L",
        email: "eri.chandra@otomindo.sch.id",
        status_kepegawaian: "TETAP",
        status_aktif: true,
      },
    });
    console.log("Profil Guru Pak Eri Chandra dibuat.");
  } else {
    await prisma.guru.update({
      where: { id: guruEri.id },
      data: {
        sekolah_id: SCHOOL_ID,
        nama_lengkap: "Pak Eri Chandra Apriyadi",
        gelar_belakang: "S.Kom.",
        status_aktif: true,
      },
    });
    console.log("Profil Guru Pak Eri Chandra diperbarui.");
  }

  // 7. Hapus guru-guru lain di SMK OTOMINDO selain Pak Eri
  await prisma.guru.deleteMany({
    where: {
      sekolah_id: SCHOOL_ID,
      id: { not: guruEri.id },
    },
  });
  console.log("Guru lain dibersihkan. Total Guru = 1.");

  // 8. Pastikan Mata Pelajaran KKA (Koding dan Kecerdasan Artifisial)
  let mapelKKA = await prisma.mataPelajaran.findFirst({
    where: { sekolah_id: SCHOOL_ID, kode: "KKA" },
  });
  if (!mapelKKA) {
    mapelKKA = await prisma.mataPelajaran.create({
      data: {
        id: "01M2R5MAPEL0000000000000001",
        sekolah_id: SCHOOL_ID,
        kode: "KKA",
        nama: "Koding dan Kecerdasan Artifisial",
        kelompok: "UMUM",
        fase: "E",
        tingkat_kelas: "10",
        beban_jp_mingguan: 2,
        status_aktif: true,
      },
    });
    console.log("Mata Pelajaran KKA dibuat.");
  }

  // 9. Pastikan Tahun Ajaran & Semester
  let tahunAjaran = await prisma.tahunAjaran.findFirst({
    where: { sekolah_id: SCHOOL_ID, nama: "2026/2027" },
  });
  if (!tahunAjaran) {
    tahunAjaran = await prisma.tahunAjaran.create({
      data: {
        id: "01M2R5TA0000000000000000001",
        sekolah_id: SCHOOL_ID,
        nama: "2026/2027",
        tanggal_mulai: new Date("2026-07-15"),
        tanggal_selesai: new Date("2027-06-25"),
        status_aktif: true,
      },
    });
  }

  let semester = await prisma.semester.findFirst({
    where: { sekolah_id: SCHOOL_ID, tahun_ajaran_id: tahunAjaran.id },
  });
  if (!semester) {
    semester = await prisma.semester.create({
      data: {
        id: "01M2R5SEM000000000000000001",
        sekolah_id: SCHOOL_ID,
        tahun_ajaran_id: tahunAjaran.id,
        nama: "Ganjil",
        semester_ke: 1,
        tanggal_mulai: new Date("2026-07-15"),
        tanggal_selesai: new Date("2026-12-20"),
        status_aktif: true,
      },
    });
  }

  // 10. Siapkan tepat 10 Kelas X SMK OTOMINDO
  const KELAS_X_NAMES = [
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

  // Hapus rombel lama di SMK OTOMINDO agar tidak duplikat
  await prisma.penugasanMengajar.deleteMany({ where: { sekolah_id: SCHOOL_ID } });
  await prisma.rombel.deleteMany({ where: { sekolah_id: SCHOOL_ID } });

  for (let i = 0; i < KELAS_X_NAMES.length; i++) {
    const namaKelas = KELAS_X_NAMES[i];
    const rombelId = `01M2R5ROMBEL0000000000000${(i + 1).toString().padStart(2, "0")}`;

    const r = await prisma.rombel.create({
      data: {
        id: rombelId,
        sekolah_id: SCHOOL_ID,
        tahun_ajaran_id: tahunAjaran.id,
        nama: namaKelas,
        tingkat_kelas: "10",
        fase: "E",
        status: "AKTIF",
      },
    });

    // Buat Penugasan Mengajar untuk Pak Eri Chandra di kelas ini
    await prisma.penugasanMengajar.create({
      data: {
        id: `01M2R5PENUGASAN0000000000${(i + 1).toString().padStart(2, "0")}`,
        sekolah_id: SCHOOL_ID,
        tahun_ajaran_id: tahunAjaran.id,
        semester_id: semester.id,
        guru_id: guruEri.id,
        mata_pelajaran_id: mapelKKA.id,
        rombel_id: r.id,
        beban_jp_mingguan: 2,
        status_aktif: true,
      },
    });
  }
  console.log("Tepat 10 Rombel Kelas X berhasil disiapkan beserta penugasan mengajar KKA Pak Eri.");

  // 11. Verifikasi Data Akhir
  const finalSekolah = await prisma.sekolah.count();
  const finalGuru = await prisma.pengguna.count({ where: { peran_dasar: "TEACHER" } });
  const finalRombel = await prisma.rombel.count();
  const finalSiswa = await prisma.siswa.count();

  console.log("\n=== HASIL VERIFIKASI AKHIR ===");
  console.log(`Total Sekolah : ${finalSekolah} (Harus: 1 - SMK OTOMINDO)`);
  console.log(`Total Guru    : ${finalGuru} (Harus: 1 - Pak Eri Chandra Apriyadi, S.Kom.)`);
  console.log(`Total Kelas   : ${finalRombel} (Harus: 10 - Kelas X)`);
  console.log(`Total Siswa   : ${finalSiswa} (Harus: 0 - Belum ada siswa)`);
  console.log("=== SANITASI SELESAI DENGAN SUKSES ===");
  await prisma.$executeRawUnsafe("PRAGMA foreign_keys = ON;");
}

main()
  .catch((e) => {
    console.error("Error sanitasi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
