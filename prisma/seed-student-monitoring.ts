/**
 * Ruang Pintar — Seed Data M18 Student Monitoring & Homeroom
 *
 * Mengaitkan akun guru_demo ke profil guru Marhanih (Wali Kelas X TO 3),
 * serta menyiapkan data realistis catatan monitoring dan rencana tindak lanjut pembinaan.
 */

import { PrismaClient } from "@prisma/client";
import { generateUlid } from "../src/shared/lib/ulid";

const prisma = new PrismaClient();

async function main() {
  console.log("Menyiapkan seed data M18 Student Monitoring & Homeroom...");

  // 1. Dapatkan akun guru_demo
  const guruUser = await prisma.pengguna.findUnique({
    where: { username: "guru_demo" },
  });

  if (!guruUser) {
    console.log("Akun guru_demo tidak ditemukan, lewati pengaitan.");
    return;
  }

  // 2. Dapatkan guru Marhanih (Wali Kelas X TO 3)
  const teacherMarhanih = await prisma.guru.findFirst({
    where: { nama_lengkap: { contains: "Marhanih" } },
    include: {
      penugasan_wali: {
        where: { status: "AKTIF" },
        include: { rombel: true },
      },
    },
  });

  if (teacherMarhanih) {
    // Tautkan guru_demo ke profil Marhanih jika belum tertaut
    await prisma.guru.update({
      where: { id: teacherMarhanih.id },
      data: {
        pengguna_id: guruUser.id,
      },
    });
    console.log(
      `✓ Akun guru_demo berhasil ditautkan ke Wali Kelas ${teacherMarhanih.nama_lengkap} (Rombel: ${teacherMarhanih.penugasan_wali[0]?.rombel.nama || "X TO 3"})`
    );
  }

  // 3. Dapatkan rombel X TO 3 dan siswa-siswanya
  const rombelXTO3 = await prisma.rombel.findFirst({
    where: { nama: "X TO 3" },
    include: {
      penempatan_rombel: {
        where: { status: "AKTIF" },
        include: {
          keikutsertaan: {
            include: {
              siswa: true,
            },
          },
        },
      },
    },
  });

  if (!rombelXTO3 || rombelXTO3.penempatan_rombel.length === 0) {
    console.log("Rombel X TO 3 atau data siswa tidak ditemukan.");
    return;
  }

  const students = rombelXTO3.penempatan_rombel.map((p) => p.keikutsertaan.siswa);
  console.log(`Ditemukan ${students.length} siswa aktif di rombel X TO 3.`);

  // 4. Bersihkan catatan monitoring sebelumnya di rombel ini agar idempoten
  await prisma.catatanMonitoring.deleteMany({
    where: { rombel_id: rombelXTO3.id },
  });

  // Ambil beberapa siswa untuk sampel monitoring
  const s1 = students[0]; // Siswa 1: Kasus Presensi & Keterlambatan
  const s2 = students[1] || students[0]; // Siswa 2: Penurunan Akademik
  const s3 = students[2] || students[0]; // Siswa 3: Prestasi & Kedisiplinan

  // Catatan 1: Kasus Kehadiran Kritis (Siswa 1)
  const note1Id = generateUlid();
  await prisma.catatanMonitoring.create({
    data: {
      id: note1Id,
      sekolah_id: rombelXTO3.sekolah_id,
      rombel_id: rombelXTO3.id,
      siswa_id: s1.id,
      penulis_id: guruUser.id,
      judul: "Keterlambatan Berulang dan 3 Sesi Alpha Tanpa Keterangan",
      isi: "Siswa tercatat tidak hadir pada sesi produktif otomotif selama 3 pertemuan berturut-turut tanpa surat izin resmi dari orang tua. Ditemukan juga pola terlambat masuk pada jam pertama pelajaran umum.",
      kategori: "KEHADIRAN",
      tingkat_urgensi: "KRITIS",
      status: "AKTIF",
      tindak_lanjut: {
        create: [
          {
            id: generateUlid(),
            penanggung_jawab_id: guruUser.id,
            tindakan: "Panggilan resmi orang tua/wali ke sekolah untuk konseling terpadu",
            target_tanggal: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 hari ke depan
            status: "PROSES",
            hasil:
              "Surat undangan panggilan orang tua telah diterbitkan dan dikirim ke wali murid.",
          },
          {
            id: generateUlid(),
            penanggung_jawab_id: guruUser.id,
            tindakan:
              "Rujukan bimbingan konseling dengan Guru BK sekolah mengenai motivasi belajar",
            target_tanggal: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
            status: "DIRENCANAKAN",
          },
        ],
      },
    },
  });

  // Catatan 2: Kasus Akademik & Tugas Belum Tuntas (Siswa 2)
  const note2Id = generateUlid();
  await prisma.catatanMonitoring.create({
    data: {
      id: note2Id,
      sekolah_id: rombelXTO3.sekolah_id,
      rombel_id: rombelXTO3.id,
      siswa_id: s2.id,
      penulis_id: guruUser.id,
      judul: "Ketuntasan Tugas Produktif dan Remedial Sumatif 1",
      isi: "Siswa belum mengumpulkan 2 tugas materi sistem transmisi dan capaian asesmen sumatif pertama berada di angka 62 (KKTP: 75). Perlu pendampingan belajar terfokus dan jadwal remedial.",
      kategori: "AKADEMIK",
      tingkat_urgensi: "TINGGI",
      status: "AKTIF",
      tindak_lanjut: {
        create: [
          {
            id: generateUlid(),
            penanggung_jawab_id: guruUser.id,
            tindakan: "Pemberian modul materi pengayaan dan penjadwalan remedial asesmen sumatif",
            target_tanggal: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            status: "PROSES",
            hasil: "Siswa telah menerima paket modul pengayaan dan bersedia mengikuti remedial.",
          },
        ],
      },
    },
  });

  // Catatan 3: Catatan Positif & Apresiasi Perilaku (Siswa 3)
  const note3Id = generateUlid();
  await prisma.catatanMonitoring.create({
    data: {
      id: note3Id,
      sekolah_id: rombelXTO3.sekolah_id,
      rombel_id: rombelXTO3.id,
      siswa_id: s3.id,
      penulis_id: guruUser.id,
      judul: "Apresiasi Kepemimpinan Kelas dan Kehadiran 100%",
      isi: "Siswa menunjukkan komitmen disiplin yang luar biasa dengan kehadiran sempurna 100% serta inisiatif memimpin kelompok belajar mandiri persiapan ujian praktik bengkel.",
      kategori: "PERILAKU",
      tingkat_urgensi: "RENDAH",
      status: "SELESAI",
      tindak_lanjut: {
        create: [
          {
            id: generateUlid(),
            penanggung_jawab_id: guruUser.id,
            tindakan: "Rekomendasi calon ketua angkatan dan apresiasi piagam bintang kelas",
            target_tanggal: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            status: "SELESAI",
            hasil: "Piagam apresiasi kedisiplinan telah diserahkan pada apel pagi kelas.",
            tanggal_penyelesaian: new Date(),
          },
        ],
      },
    },
  });

  // 5. Update data presensi sesi kelas nyata untuk membuktikan domain invariant:
  // Derived Indicators dihitung dinamis dari M12 Presensi, M11 Tugas, dan M13 Asesmen.
  const sessions = await prisma.sesiKelasAktual.findMany({
    where: { rombel_id: rombelXTO3.id },
    take: 5,
    orderBy: { tanggal: "desc" },
  });

  if (sessions.length > 0) {
    // Siswa 1 (s1): 3 Sesi Alpha + 1 Sesi Terlambat -> Status KRITIS
    for (let i = 0; i < Math.min(3, sessions.length); i++) {
      await prisma.presensiSesiKelas.upsert({
        where: {
          sesi_kelas_id_siswa_id: {
            sesi_kelas_id: sessions[i].id,
            siswa_id: s1.id,
          },
        },
        update: {
          status: "ALPHA",
          catatan: "Tidak hadir tanpa surat keterangan (Alpha)",
        },
        create: {
          id: generateUlid(),
          sekolah_id: rombelXTO3.sekolah_id,
          sesi_kelas_id: sessions[i].id,
          siswa_id: s1.id,
          status: "ALPHA",
          catatan: "Tidak hadir tanpa surat keterangan (Alpha)",
        },
      });
    }

    if (sessions.length > 3) {
      await prisma.presensiSesiKelas.upsert({
        where: {
          sesi_kelas_id_siswa_id: {
            sesi_kelas_id: sessions[3].id,
            siswa_id: s1.id,
          },
        },
        update: {
          status: "TERLAMBAT",
          catatan: "Terlambat 20 menit pada jam pertama",
        },
        create: {
          id: generateUlid(),
          sekolah_id: rombelXTO3.sekolah_id,
          sesi_kelas_id: sessions[3].id,
          siswa_id: s1.id,
          status: "TERLAMBAT",
          catatan: "Terlambat 20 menit pada jam pertama",
        },
      });
    }

    // Siswa 2 (s2): 1 Sesi Alpha -> Status PERHATIAN
    if (sessions.length > 0 && s2.id !== s1.id) {
      await prisma.presensiSesiKelas.upsert({
        where: {
          sesi_kelas_id_siswa_id: {
            sesi_kelas_id: sessions[0].id,
            siswa_id: s2.id,
          },
        },
        update: {
          status: "ALPHA",
          catatan: "Tidak hadir tanpa keterangan 1 sesi",
        },
        create: {
          id: generateUlid(),
          sekolah_id: rombelXTO3.sekolah_id,
          sesi_kelas_id: sessions[0].id,
          siswa_id: s2.id,
          status: "ALPHA",
          catatan: "Tidak hadir tanpa keterangan 1 sesi",
        },
      });
    }
  }

  console.log(
    "✓ Berhasil menyiapkan data monitoring realistis (Presensi, Catatan, Follow-Up) di rombel X TO 3."
  );
}

main()
  .catch((e) => {
    console.error("Gagal menjalankan seed monitoring:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
