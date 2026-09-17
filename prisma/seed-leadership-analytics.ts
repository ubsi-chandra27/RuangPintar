/**
 * Ruang Pintar — Seed Data M19 Leadership Dashboard & Analytics
 *
 * Menyiapkan personil pimpinan (Kepala Sekolah, Wakasek Kurikulum,
 * Wakasek Kesiswaan, Kepala Program Keahlian) dan data riwayat ekspor.
 */

import { PrismaClient } from "@prisma/client";
import { generateUlid } from "../src/shared/lib/ulid";

const prisma = new PrismaClient();

async function main() {
  console.log("Menyiapkan seed data M19 Leadership Dashboard & Analytics...");

  const school = await prisma.sekolah.findFirst();
  if (!school) {
    console.error("Sekolah tidak ditemukan.");
    return;
  }
  const schoolId = school.id;

  // Dapatkan hash password dari guru_demo yang valid Password123#
  const demoTeacher = await prisma.pengguna.findFirst({
    where: { username: "guru_demo" },
  });
  const defaultPasswordHash = demoTeacher?.password_hash ?? "";

  // Pastikan admin_utama juga memakai password yang sama
  await prisma.pengguna.updateMany({
    where: { username: "admin_utama" },
    data: {
      password_hash: defaultPasswordHash,
      harus_ganti_password: false,
      status_akun: "AKTIF",
    },
  });

  // 1. Pastikan Jabatan Kanonikal Ada
  const canonicalPositions = [
    {
      id: "01JA0000000000000000POSHEAD1",
      kode_jabatan: "HEADMASTER",
      nama_jabatan: "Kepala Sekolah",
      tingkat_akses: "SCHOOL_WIDE",
    },
    {
      id: "01JA0000000000000000POSWAKUR",
      kode_jabatan: "VICE_PRINCIPAL_CURRICULUM",
      nama_jabatan: "Wakil Kepala Sekolah Bidang Kurikulum",
      tingkat_akses: "SCHOOL_WIDE",
    },
    {
      id: "01JA00000000000000POSWAKAS",
      kode_jabatan: "VICE_PRINCIPAL_STUDENT_AFFAIRS",
      nama_jabatan: "Wakil Kepala Sekolah Bidang Kesiswaan",
      tingkat_akses: "SCHOOL_WIDE",
    },
    {
      id: "01JA00000000000000POSKAPTO",
      kode_jabatan: "PROGRAM_HEAD",
      nama_jabatan: "Ketua Program Keahlian Teknik Otomotif",
      tingkat_akses: "PROGRAM_WIDE",
    },
  ];

  for (const pos of canonicalPositions) {
    await prisma.jabatan.upsert({
      where: {
        sekolah_id_kode_jabatan: {
          sekolah_id: schoolId,
          kode_jabatan: pos.kode_jabatan,
        },
      },
      update: {
        nama_jabatan: pos.nama_jabatan,
        tingkat_akses: pos.tingkat_akses,
      },
      create: {
        id: pos.id,
        sekolah_id: schoolId,
        kode_jabatan: pos.kode_jabatan,
        nama_jabatan: pos.nama_jabatan,
        tingkat_akses: pos.tingkat_akses,
      },
    });
  }

  // 2. Siapkan Akun Demo Pimpinan
  const leadershipUsers = [
    {
      username: "kepsek_demo",
      nama_lengkap: "Drs. H. Mulyono, M.Pd.",
      pos_code: "HEADMASTER",
    },
    {
      username: "wakakur_demo",
      nama_lengkap: "Drs. Ahmad Dahlan, M.Pd.",
      pos_code: "VICE_PRINCIPAL_CURRICULUM",
    },
    {
      username: "wakasis_demo",
      nama_lengkap: "Dra. Hj. Nurul Hidayati, M.M.",
      pos_code: "VICE_PRINCIPAL_STUDENT_AFFAIRS",
    },
    {
      username: "kaprog_demo",
      nama_lengkap: "Ir. Hendra Wijaya, S.T.",
      pos_code: "PROGRAM_HEAD",
    },
  ];

  for (const u of leadershipUsers) {
    let user = await prisma.pengguna.findUnique({
      where: { username: u.username },
    });

    if (!user) {
      user = await prisma.pengguna.create({
        data: {
          id: generateUlid(),
          username: u.username,
          password_hash: defaultPasswordHash,
          nama_lengkap: u.nama_lengkap,
          peran_dasar: "TEACHER",
          status_akun: "AKTIF",
          harus_ganti_password: false,
          sekolah_id: schoolId,
        },
      });
      console.log(`Akun ${u.username} berhasil dibuat.`);
    } else {
      user = await prisma.pengguna.update({
        where: { id: user.id },
        data: {
          password_hash: defaultPasswordHash,
          harus_ganti_password: false,
          status_akun: "AKTIF",
        },
      });
      console.log(`Akun ${u.username} berhasil diperbarui.`);
    }

    // Cari jabatan ID
    const jab = await prisma.jabatan.findUnique({
      where: {
        sekolah_id_kode_jabatan: {
          sekolah_id: schoolId,
          kode_jabatan: u.pos_code,
        },
      },
    });

    if (jab) {
      // Periksa apakah sudah ada penugasan aktif
      const existingAssignment = await prisma.penugasanJabatan.findFirst({
        where: {
          sekolah_id: schoolId,
          jabatan_id: jab.id,
          personil_id: user.id,
          status: "AKTIF",
        },
      });

      if (!existingAssignment) {
        await prisma.penugasanJabatan.create({
          data: {
            id: generateUlid(),
            sekolah_id: schoolId,
            jabatan_id: jab.id,
            personil_id: user.id,
            berlaku_mulai: new Date("2026-07-01"),
            berlaku_sampai: new Date("2027-06-30"),
            status: "AKTIF",
            catatan: `Penetapan Tugas Tambahan ${jab.nama_jabatan} T.A 2026/2027`,
          },
        });
        console.log(`Penugasan ${jab.nama_jabatan} untuk ${u.username} berhasil dicatat.`);
      }
    }
  }

  // 3. Tambahkan Sampel Riwayat Ekspor Laporan
  const adminUser = await prisma.pengguna.findFirst({
    where: { peran_dasar: "SUPER_ADMIN" },
  });

  if (adminUser) {
    const exportSampleCount = await prisma.riwayatEksporLaporan.count({
      where: { sekolah_id: schoolId },
    });

    if (exportSampleCount === 0) {
      await prisma.riwayatEksporLaporan.createMany({
        data: [
          {
            id: generateUlid(),
            sekolah_id: schoolId,
            tipe_laporan: "PRESENSI",
            judul: "Rekapitulasi Kehadiran Siswa Semester Ganjil 2026/2027",
            format: "CSV",
            total_baris: 36,
            dibuat_oleh_id: adminUser.id,
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
          {
            id: generateUlid(),
            sekolah_id: schoolId,
            tipe_laporan: "NILAI_AKADEMIK",
            judul: "Rekapitulasi Capaian Nilai Asesmen & KKTP Lintas Rombel",
            format: "CSV",
            total_baris: 18,
            dibuat_oleh_id: adminUser.id,
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
          {
            id: generateUlid(),
            sekolah_id: schoolId,
            tipe_laporan: "EKSEKUTIF",
            judul: "Ringkasan Eksekutif Rapat Dewan Guru & Komite Sekolah",
            format: "PRINT_A4",
            total_baris: 12,
            dibuat_oleh_id: adminUser.id,
            created_at: new Date(),
          },
        ],
      });
      console.log("Sampel riwayat ekspor laporan berhasil disemai.");
    }
  }

  console.log("Seed data M19 Leadership Dashboard & Analytics selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
