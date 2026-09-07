/**
 * Ruang Pintar — Seed Student Experience Data (Phase 15 / M15)
 *
 * Mengisi data pembelajaran realistik untuk rombel aktif X RPL:
 * - Materi Pembelajaran & Publikasi
 * - Tugas Kelas & Publikasi
 * - Ujian CBT
 * - Nilai Asesmen & Publikasi Resmi
 * - Presensi Kehadiran Siswa
 */

import { PrismaClient } from "@prisma/client";
import { generateUlid } from "../src/shared/lib/ulid";

const prisma = new PrismaClient();

async function main() {
  const schoolId = "01JA0000000000000000000001"; // SMK OTOMINDO
  const student = await prisma.siswa.findFirst({
    where: { pengguna: { username: "siswa" } },
  });

  if (!student) {
    console.error("Student 'siswa' not found");
    return;
  }

  // Active penugasan mengajar in X RPL
  const penugasanRpl = await prisma.penugasanMengajar.findMany({
    where: {
      rombel: { nama: "X RPL", sekolah_id: schoolId },
      status: "AKTIF",
    },
    include: {
      mata_pelajaran: true,
      guru: true,
    },
  });

  if (penugasanRpl.length === 0) {
    console.error("No active penugasan found for X RPL");
    return;
  }

  console.log(`Found ${penugasanRpl.length} active penugasan in X RPL`);

  const pDasarRpl =
    penugasanRpl.find((p) => p.mata_pelajaran.nama.includes("Rekayasa Perangkat Lunak")) ||
    penugasanRpl[0];

  const pKoding =
    penugasanRpl.find(
      (p) =>
        p.mata_pelajaran.nama.includes("Koding") || p.mata_pelajaran.nama.includes("Informatika")
    ) || penugasanRpl[1];

  const pMtk =
    penugasanRpl.find((p) => p.mata_pelajaran.nama.includes("Matematika")) || penugasanRpl[2];

  const pBindo =
    penugasanRpl.find((p) => p.mata_pelajaran.nama.includes("Indonesia")) || penugasanRpl[3];

  // 1. Buat BAB / Lingkup Materi
  let bab1 = await prisma.lingkupMateri.findFirst({
    where: {
      penugasan_mengajar_id: pDasarRpl.id,
      judul: "Pengantar Rekayasa Perangkat Lunak & SDLC",
    },
  });
  if (!bab1) {
    bab1 = await prisma.lingkupMateri.create({
      data: {
        id: generateUlid(),
        sekolah_id: schoolId,
        penugasan_mengajar_id: pDasarRpl.id,
        kode: "BAB 1",
        judul: "Pengantar Rekayasa Perangkat Lunak & SDLC",
        deskripsi:
          "Konsep dasar software engineering, fase SDLC, dan metodologi pengembangan perangkat lunak.",
        urutan: 1,
        status: "AKTIF",
      },
    });
  }

  let tp1 = await prisma.tujuanPembelajaran.findFirst({
    where: { lingkup_materi_id: bab1.id },
  });
  if (!tp1) {
    tp1 = await prisma.tujuanPembelajaran.create({
      data: {
        id: generateUlid(),
        sekolah_id: schoolId,
        lingkup_materi_id: bab1.id,
        kode: "TP 1.1",
        deskripsi: "Memahami fase-fase Software Development Life Cycle (SDLC) waterfall dan agile.",
        urutan: 1,
        status: "AKTIF",
      },
    });
  }

  // 2. Buat Materi Pembelajaran
  const materi1 = await prisma.materiPembelajaran.create({
    data: {
      id: generateUlid(),
      sekolah_id: schoolId,
      guru_id: pDasarRpl.guru_id,
      lingkup_materi_id: bab1.id,
      mata_pelajaran_id: pDasarRpl.mata_pelajaran_id,
      judul: "Modul 1: Siklus Hidup Pengembangan Perangkat Lunak (SDLC)",
      deskripsi:
        "Panduan komprehensif mengenai analisis kebutuhan, perancangan, implementasi, pengujian, dan pemeliharaan software.",
      tipe_konten: "TEKS",
      konten_teks: `### 🚀 Modul 1: Siklus Hidup Pengembangan Perangkat Lunak (SDLC)

Software Development Life Cycle (SDLC) adalah kerangka kerja terstruktur yang digunakan oleh tim pengembang untuk memproduksi perangkat lunak berkualitas tinggi dengan biaya dan waktu yang efisien.

#### Tahapan Utama SDLC:
1. **Planning & Requirement Analysis:** Mengidentifikasi kebutuhan pemangku kepentingan dan mendefinisikan ruang lingkup proyek.
2. **System Design:** Merancang arsitektur sistem, skema basis data, dan antarmuka pengguna (UI/UX).
3. **Implementation & Coding:** Menerjemahkan rancangan teknis ke dalam kode program yang bersih, modular, dan teruji.
4. **Testing & QA:** Menguji fungsionalitas, keamanan, dan kehandalan aplikasi sebelum rilis.
5. **Deployment & Maintenance:** Merilis aplikasi ke lingkungan produksi serta melakukan pemeliharaan berkala.`,
      status: "PUBLISHED",
    },
  });

  await prisma.publikasiMateri.create({
    data: {
      id: generateUlid(),
      sekolah_id: schoolId,
      materi_id: materi1.id,
      penugasan_mengajar_id: pDasarRpl.id,
      status: "DITERBITKAN",
      tanggal_publikasi: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
  });

  const materi2 = await prisma.materiPembelajaran.create({
    data: {
      id: generateUlid(),
      sekolah_id: schoolId,
      guru_id: pKoding.guru_id,
      mata_pelajaran_id: pKoding.mata_pelajaran_id,
      judul: "Pengenalan Ekosistem Python & Git Versi Modern",
      deskripsi:
        "Panduan setup environment Python, manajemen virtual environment, dan integrasi version control menggunakan Git.",
      tipe_konten: "TAUTAN",
      tautan_url: "https://docs.python.org/3/tutorial/",
      status: "PUBLISHED",
    },
  });

  await prisma.publikasiMateri.create({
    data: {
      id: generateUlid(),
      sekolah_id: schoolId,
      materi_id: materi2.id,
      penugasan_mengajar_id: pKoding.id,
      status: "DITERBITKAN",
      tanggal_publikasi: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  // 3. Buat Tugas & Publikasi
  const tugas1 = await prisma.definisiTugas.create({
    data: {
      id: generateUlid(),
      sekolah_id: schoolId,
      guru_id: pDasarRpl.guru_id,
      lingkup_materi_id: bab1.id,
      mata_pelajaran_id: pDasarRpl.mata_pelajaran_id,
      judul: "Tugas 1: Studi Kasus Perancangan Alur Sistem Tiket Bus",
      petunjuk:
        "Buatlah analisis ringkas kebutuhan pengguna dan gambarkan diagram alur (flowchart) untuk modul pemesanan tiket bus antarkota. Sertakan uraian teks atau lampirkan berkas dokumen Anda.",
      tipe_penyerahan: "TEKS",
      status: "PUBLISHED",
    },
  });

  const batasWaktu1 = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
  await prisma.publikasiTugas.create({
    data: {
      id: generateUlid(),
      sekolah_id: schoolId,
      tugas_id: tugas1.id,
      penugasan_mengajar_id: pDasarRpl.id,
      tanggal_mulai: new Date(),
      batas_waktu: batasWaktu1,
      izinkan_terlambat: true,
      status: "DITERBITKAN",
    },
  });

  const tugas2 = await prisma.definisiTugas.create({
    data: {
      id: generateUlid(),
      sekolah_id: schoolId,
      guru_id: pKoding.guru_id,
      mata_pelajaran_id: pKoding.mata_pelajaran_id,
      judul: "Tugas 2: Implementasi Fungsi Rekursif & Struktur Data List",
      petunjuk:
        "Tuliskan kode program Python sederhana untuk menghitung faktorial dan menyaring bilangan prima dari sebuah list angka acak. Unggah kode program atau tuliskan solusi Anda.",
      tipe_penyerahan: "FILE",
      status: "PUBLISHED",
    },
  });

  const batasWaktu2 = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days from now
  await prisma.publikasiTugas.create({
    data: {
      id: generateUlid(),
      sekolah_id: schoolId,
      tugas_id: tugas2.id,
      penugasan_mengajar_id: pKoding.id,
      tanggal_mulai: new Date(),
      batas_waktu: batasWaktu2,
      izinkan_terlambat: false,
      status: "DITERBITKAN",
    },
  });

  // 4. Buat Ujian CBT
  await prisma.ujianCbt.create({
    data: {
      id: generateUlid(),
      sekolah_id: schoolId,
      penugasan_mengajar_id: pDasarRpl.id,
      judul: "Penilaian Tengah Semester: Dasar Rekayasa Perangkat Lunak",
      deskripsi:
        "Ujian CBT materi BAB 1 s/d BAB 3 mencakup SDLC, metodologi agile, dan perancangan UML dasar.",
      durasi_menit: 60,
      waktu_mulai: new Date(),
      waktu_selesai: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      kkm_kktp: 75.0,
      acak_soal: true,
      acak_opsi: true,
      status: "DITERBITKAN",
    },
  });

  // 5. Buat Definisi Asesmen & Publikasi Nilai Resmi untuk Siswa
  const mapels = [pDasarRpl, pKoding, pMtk, pBindo];
  const sampleScores = [
    { mapel: pDasarRpl, f: 90, s: 92, tp: "Memahami fase SDLC dan metodologi Agile" },
    { mapel: pKoding, f: 88, s: 85, tp: "Membuat algoritma dan struktur data kontrol program" },
    { mapel: pMtk, f: 78, s: 82, tp: "Menganalisis sistem persamaan linier dan matriks" },
    { mapel: pBindo, f: 85, s: 88, tp: "Menulis teks eksposisi dan laporan observasi teknis" },
  ];

  for (const item of sampleScores) {
    // Asesmen Formatif
    const asesmenF = await prisma.definisiAsesmen.create({
      data: {
        id: generateUlid(),
        sekolah_id: schoolId,
        penugasan_mengajar_id: item.mapel.id,
        judul: `Formatif 1 — ${item.mapel.mata_pelajaran.nama}`,
        deskripsi: `Penilaian proses harian materi pokok: ${item.tp}`,
        kategori: "FORMATIF",
        teknik_penilaian: "TES_TERTULIS",
        bobot: 1.0,
        skala_maksimal: 100,
        kkm_kktp: 75,
        tanggal_pelaksanaan: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: "PUBLISHED",
      },
    });

    await prisma.nilaiSiswa.create({
      data: {
        id: generateUlid(),
        sekolah_id: schoolId,
        asesmen_id: asesmenF.id,
        siswa_id: student.id,
        nilai_angka: item.f,
        nilai_huruf: item.f >= 90 ? "A" : item.f >= 80 ? "B" : "C",
        capaian_kompetensi: `Tercapai optimal dalam ${item.tp}.`,
        status: "PUBLISHED",
      },
    });

    await prisma.publikasiNilaiAsesmen.create({
      data: {
        id: generateUlid(),
        sekolah_id: schoolId,
        asesmen_id: asesmenF.id,
        target_audience: "SEMUA",
        dipublikasikan_oleh: item.mapel.guru_id,
        status: "PUBLISHED",
        tanggal_publikasi: new Date(),
      },
    });

    // Asesmen Sumatif
    const asesmenS = await prisma.definisiAsesmen.create({
      data: {
        id: generateUlid(),
        sekolah_id: schoolId,
        penugasan_mengajar_id: item.mapel.id,
        judul: `Sumatif Lingkup Materi — ${item.mapel.mata_pelajaran.nama}`,
        deskripsi: `Uji kompetensi capaian pembelajaran: ${item.tp}`,
        kategori: "SUMATIF",
        teknik_penilaian: "TES_TERTULIS",
        bobot: 1.5,
        skala_maksimal: 100,
        kkm_kktp: 75,
        tanggal_pelaksanaan: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: "PUBLISHED",
      },
    });

    await prisma.nilaiSiswa.create({
      data: {
        id: generateUlid(),
        sekolah_id: schoolId,
        asesmen_id: asesmenS.id,
        siswa_id: student.id,
        nilai_angka: item.s,
        nilai_huruf: item.s >= 90 ? "A" : item.s >= 80 ? "B" : "C",
        capaian_kompetensi: `Sangat menguasai ${item.tp}.`,
        status: "PUBLISHED",
      },
    });

    await prisma.publikasiNilaiAsesmen.create({
      data: {
        id: generateUlid(),
        sekolah_id: schoolId,
        asesmen_id: asesmenS.id,
        target_audience: "SEMUA",
        dipublikasikan_oleh: item.mapel.guru_id,
        status: "PUBLISHED",
        tanggal_publikasi: new Date(),
      },
    });
  }

  // 6. Presensi Kehadiran Siswa
  const sessions = await prisma.sesiKelasAktual.findMany({
    where: { rombel: { nama: "X RPL", sekolah_id: schoolId } },
    take: 8,
  });

  for (let i = 0; i < sessions.length; i++) {
    const s = sessions[i];
    const existing = await prisma.presensiSesiKelas.findUnique({
      where: {
        sesi_kelas_id_siswa_id: {
          sesi_kelas_id: s.id,
          siswa_id: student.id,
        },
      },
    });

    if (!existing) {
      await prisma.presensiSesiKelas.create({
        data: {
          id: generateUlid(),
          sekolah_id: schoolId,
          sesi_kelas_id: s.id,
          siswa_id: student.id,
          status: i === 7 ? "IZIN" : "HADIR",
          catatan: i === 7 ? "Izin kegiatan lomba sekolah" : null,
          waktu_presensi: new Date(),
        },
      });
    }
  }

  console.log("Successfully seeded rich Student Experience data for X RPL!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
