import { PrismaClient } from "@prisma/client";
import { generateUlid } from "../src/shared/lib/ulid";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Phase 17 — Communication & Notification (M16 & M17)...");

  const school = await prisma.sekolah.findFirst();
  if (!school) {
    throw new Error("Sekolah tidak ditemukan!");
  }

  // Cari Super Admin atau Guru untuk menjadi penulis pengumuman
  const adminUser = await prisma.pengguna.findFirst({
    where: { peran_dasar: "SUPER_ADMIN" },
  });

  if (!adminUser) {
    throw new Error("Pengguna Super Admin tidak ditemukan!");
  }

  // 1. Seed Pengumuman Resmi (M16)
  const announcementsData = [
    {
      id: generateUlid(),
      sekolah_id: school.id,
      penulis_id: adminUser.id,
      judul: "Jadwal Pelaksanaan Asesmen Tengah Semester (ATS) Ganjil 2026/2027",
      konten: `Diberitahukan kepada seluruh dewan guru, siswa, dan orang tua/wali murid bahwa pelaksanaan Asesmen Tengah Semester (ATS) Ganjil Tahun Ajaran 2026/2027 akan diselenggarakan mulai tanggal 15 s.d. 22 September 2026.

Ujian akan dilaksanakan secara digital melalui platform CBT Ruang Pintar. Diharapkan seluruh siswa mempersiapkan perangkat dan memeriksa jadwal masing-masing rombel di portal CBT.

Tertanda,
Wakil Kepala Sekolah Bidang Kurikulum`,
      kategori: "AKADEMIK",
      status: "PUBLISHED",
      apakah_disematkan: true,
      target_audiens: "SEMUA",
      dipublikasikan_pada: new Date(),
    },
    {
      id: generateUlid(),
      sekolah_id: school.id,
      penulis_id: adminUser.id,
      judul: "Pemberitahuan Agenda Sosialisasi CBT & Pedoman Integritas Ujian Guru",
      konten: `Bapak/Ibu Dewan Guru yang kami hormati,
Sehubungan dengan migrasi penuh sistem penilaian berbasis CBT pada semester ini, mohon kehadirannya dalam workshop internal:
- Hari/Tanggal: Jumat, 12 September 2026
- Pukul: 13.30 WIB - Selesai
- Tempat: Ruang Multimedia & Daring via Google Meet
Materi mencakup penyusunan blueprint soal, tata tertib pengawas (proctoring), dan sinkronisasi ke buku nilai e-Rapor.`,
      kategori: "KEGIATAN",
      status: "PUBLISHED",
      apakah_disematkan: false,
      target_audiens: "GURU",
      dipublikasikan_pada: new Date(),
    },
    {
      id: generateUlid(),
      sekolah_id: school.id,
      penulis_id: adminUser.id,
      judul: "Edaran Pertemuan Orang Tua / Wali Murid Semester Ganjil",
      konten: `Kepada Yth. Bapak/Ibu Wali Murid,
Kami mengundang kehadiran Bapak/Ibu dalam Pertemuan Parenting & Sosialisasi Pemantauan Akademik Digital pada hari Sabtu, 20 September 2026.

Melalui portal Wali Murid Ruang Pintar, Bapak/Ibu kini dapat memantau presensi harian, nilai tugas resmi, dan mengajukan izin ketidakhadiran secara mandiri. Kehadiran Bapak/Ibu sangat berharga demi kemajuan belajar putra/putri kita.`,
      kategori: "PENTING",
      status: "PUBLISHED",
      apakah_disematkan: true,
      target_audiens: "WALI",
      dipublikasikan_pada: new Date(),
    },
    {
      id: generateUlid(),
      sekolah_id: school.id,
      penulis_id: adminUser.id,
      judul: "Peringatan Hari Pahlawan & Pekan Kreativitas Siswa",
      konten: `Halo Sahabat Ruang Pintar!
Dalam rangka memperingati Hari Pahlawan, OSIS akan menyelenggarakan Pekan Kreativitas Siswa dengan berbagai perlombaan inovasi teknologi, robotika, karya tulis ilmiah, dan seni budaya.
Pendaftaran dibuka mulai 1 Oktober 2026 melalui ketua rombel masing-masing. Ayo tunjukkan karyamu!`,
      kategori: "KEGIATAN",
      status: "PUBLISHED",
      apakah_disematkan: false,
      target_audiens: "SISWA",
      dipublikasikan_pada: new Date(),
    },
    {
      id: generateUlid(),
      sekolah_id: school.id,
      penulis_id: adminUser.id,
      judul: "Draf: Rencana Pemeliharaan Server Sistem & Kalender Libur Nasional",
      konten: `Pemberitahuan internal mengenai jadwal maintenance rutin server dan kalender libur operasional sekolah yang sedang dalam tahap pembahasan finalisasi bersama pimpinan.`,
      kategori: "UMUM",
      status: "DRAFT",
      apakah_disematkan: false,
      target_audiens: "SEMUA",
      dipublikasikan_pada: null,
    },
  ];

  for (const ann of announcementsData) {
    const existing = await prisma.pengumuman.findFirst({
      where: { judul: ann.judul, sekolah_id: school.id },
    });
    if (!existing) {
      await prisma.pengumuman.create({ data: ann });
      console.log(`Created announcement: "${ann.judul}" (${ann.status})`);
    }
  }

  // 2. Seed Notifikasi In-App Pengguna (M17)
  const usersToNotify = await prisma.pengguna.findMany({
    where: { sekolah_id: school.id },
    take: 15,
  });

  for (const user of usersToNotify) {
    // Buat preferensi default jika belum ada
    await prisma.preferensiNotifikasi.upsert({
      where: { pengguna_id: user.id },
      update: {},
      create: {
        id: generateUlid(),
        pengguna_id: user.id,
        in_app_aktif: true,
        whatsapp_aktif: true,
        email_aktif: false,
      },
    });

    // Buat notifikasi sampel jika belum ada
    const existingNotifs = await prisma.notifikasiPengguna.findMany({
      where: { pengguna_id: user.id },
    });

    if (existingNotifs.length === 0) {
      await prisma.notifikasiPengguna.createMany({
        data: [
          {
            id: generateUlid(),
            sekolah_id: school.id,
            pengguna_id: user.id,
            judul: "Pengumuman Resmi Sekolah",
            pesan:
              "Jadwal Pelaksanaan Asesmen Tengah Semester (ATS) Ganjil 2026/2027 telah diterbitkan.",
            tipe: "PENGUMUMAN_BARU",
            tautan_url: "/pengumuman",
            apakah_dibaca: false,
          },
          {
            id: generateUlid(),
            sekolah_id: school.id,
            pengguna_id: user.id,
            judul: "Selamat Datang di Ruang Pintar",
            pesan:
              "Akun Anda telah terintegrasi dengan modul pembelajaran dan komunikasi akademik.",
            tipe: "SISTEM",
            tautan_url: "/dashboard",
            apakah_dibaca: true,
            dibaca_pada: new Date(),
          },
        ],
      });
      console.log(`Created sample notifications for user: ${user.username}`);
    }
  }

  console.log("Seeding Phase 17 selesai sukses.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
