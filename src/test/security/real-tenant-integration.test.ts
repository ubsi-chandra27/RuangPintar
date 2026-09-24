/**
 * Ruang Pintar — STAGE 10.2B: Real Database Integration Security Verification
 *
 * Menguji Cross-Tenant Isolation secara nyata (REAL DATABASE INTEGRATION)
 * langsung terhadap SQLite via Prisma Client nyata (TANPA mock prisma).
 *
 * Membuktikan secara nyata:
 * 1. Tenant A membaca data Tenant B → HARUS DITOLAK
 * 2. Tenant A mengubah data Tenant B → HARUS DITOLAK
 * 3. Tenant A menghapus data Tenant B → HARUS DITOLAK
 * 4. Tenant A memakai ID resource Tenant B → HARUS DITOLAK
 * 5. Tenant A memalsukan sekolah_id → HARUS DITOLAK
 * 6. Tenant A memalsukan guru_id → HARUS DITOLAK
 * 7. Tenant A memalsukan rombel_id → HARUS DITOLAK
 *
 * Serta HTTP / Server Action Smoke Tests pada 5 Critical Path:
 * - Attendance (Presensi Sesi)
 * - CBT (Ujian CBT & Bank Soal)
 * - Teacher Assignment (Penugasan Mengajar Guru & Rombel)
 * - Guardian (Portal Wali & Siswa)
 * - Learning (KBM, Lingkup Materi / BAB)
 */

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { prisma, configureSqlitePragmas } from "@/shared/infrastructure/database/prisma";
import { generateUlid } from "@/shared/lib/ulid";
import * as authGuardModule from "@/shared/infrastructure/auth/auth-guard";
import { AuthenticatedUser } from "@/shared/infrastructure/auth/auth-service";

// Server Actions
import {
  getSessionAttendanceAction,
  saveSessionAttendanceAction,
} from "@/app/actions/attendance-actions";
import {
  getExamPrintDataAction,
  refreshExamTokenAction,
  startOrResumeAttemptAction,
} from "@/app/actions/cbt-actions";
import { createTeacherAction, createTeachingAssignmentAction } from "@/app/actions/teacher-actions";
import { switchActiveChildAction, submitPengajuanWaliAction } from "@/app/actions/guardian-actions";
import {
  createLingkupMateriAction,
  updateLingkupMateriAction,
  deleteLingkupMateriAction,
} from "@/app/actions/learning-actions";

// Direct Services & Repositories for Data Layer verification
import { AttendanceService } from "@/modules/attendance/application/attendance-service";
import { AttendanceRepository } from "@/modules/attendance/infrastructure/attendance-repository";
import { cbtService } from "@/modules/cbt/application/cbt-service";
import { CbtRepository } from "@/modules/cbt/infrastructure/cbt-repository";
import { learningService } from "@/modules/learning/application/learning-service";
import { LearningRepository } from "@/modules/learning/infrastructure/learning-repository";
import { CommunicationService } from "@/modules/communication/application/communication-service";
import { CommunicationRepository } from "@/modules/communication/infrastructure/communication-repository";
import { GuardianService } from "@/modules/guardian/application/guardian-service";
import { GuardianRepository } from "@/modules/guardian/infrastructure/guardian-repository";
import { TeachingAssignmentService } from "@/modules/teacher/application/teaching-assignment-service";
import { HomeroomAssignmentService } from "@/modules/teacher/application/homeroom-assignment-service";

// Errors
import {
  SessionNotFoundError,
  AttendanceNotAllowedError,
} from "@/modules/attendance/domain/attendance-errors";
import { CbtNotFoundError, CbtAccessDeniedError } from "@/modules/cbt/domain/cbt-errors";
import { AnnouncementNotFoundError } from "@/modules/communication/domain/communication-errors";
import {
  ChildNotLinkedError,
  GuardianNotFoundError,
} from "@/modules/guardian/domain/guardian-errors";
import {
  CrossSchoolBoundaryError,
  DuplicateTeachingAssignmentError,
} from "@/modules/teacher/domain/teacher-errors";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("STAGE 10.2B — Real Database Tenant Isolation & Server Action Smoke Verification", () => {
  // Test IDs for Tenant A
  const schoolA = {
    id: `SCH_A_${generateUlid()}`,
    npsn: `NPSN_A_${generateUlid().slice(-8)}`,
    nama: "SMA Negeri 1 Integritas (Tenant A)",
  };
  const userStaffA = {
    id: `USR_STAFF_A_${generateUlid()}`,
    username: `staff_a_${generateUlid().slice(-6)}`,
  };
  const userGuruA = {
    id: `USR_GURU_A_${generateUlid()}`,
    username: `guru_a_${generateUlid().slice(-6)}`,
  };
  const userSiswaA = {
    id: `USR_SISWA_A_${generateUlid()}`,
    username: `siswa_a_${generateUlid().slice(-6)}`,
  };
  const userWaliA = {
    id: `USR_WALI_A_${generateUlid()}`,
    username: `wali_a_${generateUlid().slice(-6)}`,
  };

  const guruA = { id: `GURU_A_${generateUlid()}` };
  const siswaA = { id: `SISWA_A_${generateUlid()}` };
  const waliA = { id: `WALI_A_${generateUlid()}` };
  const relasiWaliA = { id: `REL_A_${generateUlid()}` };

  const taA = { id: `TA_A_${generateUlid()}` };
  const semA = { id: `SEM_A_${generateUlid()}` };
  const tktA = { id: `TKT_A_${generateUlid()}` };
  const rombelA = { id: `ROMBEL_A_${generateUlid()}` };
  const keikutsertaanA = { id: `KEIKUT_A_${generateUlid()}` };
  const penempatanA = { id: `PEN_A_${generateUlid()}` };
  const mapelA = { id: `MAPEL_A_${generateUlid()}` };
  const penugasanA = { id: `PENUGASAN_A_${generateUlid()}` };
  const sesiA = { id: `SESI_A_${generateUlid()}` };
  const lmA = { id: `LM_A_${generateUlid()}` };
  const ujianA = { id: `UJIAN_A_${generateUlid()}` };
  const pengumumanA = { id: `PENGUMUMAN_A_${generateUlid()}` };

  // Test IDs for Tenant B
  const schoolB = {
    id: `SCH_B_${generateUlid()}`,
    npsn: `NPSN_B_${generateUlid().slice(-8)}`,
    nama: "SMK Budi Utomo (Tenant B)",
  };
  const userStaffB = {
    id: `USR_STAFF_B_${generateUlid()}`,
    username: `staff_b_${generateUlid().slice(-6)}`,
  };
  const userGuruB = {
    id: `USR_GURU_B_${generateUlid()}`,
    username: `guru_b_${generateUlid().slice(-6)}`,
  };
  const userSiswaB = {
    id: `USR_SISWA_B_${generateUlid()}`,
    username: `siswa_b_${generateUlid().slice(-6)}`,
  };
  const userWaliB = {
    id: `USR_WALI_B_${generateUlid()}`,
    username: `wali_b_${generateUlid().slice(-6)}`,
  };

  const guruB = { id: `GURU_B_${generateUlid()}` };
  const siswaB = { id: `SISWA_B_${generateUlid()}` };
  const waliB = { id: `WALI_B_${generateUlid()}` };
  const relasiWaliB = { id: `REL_B_${generateUlid()}` };

  const taB = { id: `TA_B_${generateUlid()}` };
  const semB = { id: `SEM_B_${generateUlid()}` };
  const tktB = { id: `TKT_B_${generateUlid()}` };
  const rombelB = { id: `ROMBEL_B_${generateUlid()}` };
  const keikutsertaanB = { id: `KEIKUT_B_${generateUlid()}` };
  const penempatanB = { id: `PEN_B_${generateUlid()}` };
  const mapelB = { id: `MAPEL_B_${generateUlid()}` };
  const penugasanB = { id: `PENUGASAN_B_${generateUlid()}` };
  const sesiB = { id: `SESI_B_${generateUlid()}` };
  const lmB = { id: `LM_B_${generateUlid()}` };
  const ujianB = { id: `UJIAN_B_${generateUlid()}` };
  const pengumumanB = { id: `PENGUMUMAN_B_${generateUlid()}` };

  // Mock requireAuth spy
  let requireAuthSpy: any;

  function setAuthenticatedActor(
    actor: Partial<AuthenticatedUser> & {
      id: string;
      username: string;
      nama_lengkap: string;
      peran_dasar: string;
      sekolah_id: string;
    }
  ) {
    requireAuthSpy.mockResolvedValue({
      email: null,
      status_akun: "AKTIF",
      harus_ganti_password: false,
      ...actor,
    } as AuthenticatedUser);
  }

  beforeAll(async () => {
    await configureSqlitePragmas(prisma);
    requireAuthSpy = vi.spyOn(authGuardModule, "requireAuth");

    // =========================================================================
    // 1. SETUP TENANT A (REAL SQLITE DATABASE SEED)
    // =========================================================================
    await prisma.sekolah.create({
      data: {
        id: schoolA.id,
        nama: schoolA.nama,
        npsn: schoolA.npsn,
        jenjang: "SMA",
        status_aktif: true,
      },
    });

    await prisma.pengguna.createMany({
      data: [
        {
          id: userStaffA.id,
          sekolah_id: schoolA.id,
          username: userStaffA.username,
          password_hash: "hash_test",
          nama_lengkap: "Staf Tata Usaha A",
          peran_dasar: "SCHOOL_STAFF",
          status_akun: "AKTIF",
        },
        {
          id: userGuruA.id,
          sekolah_id: schoolA.id,
          username: userGuruA.username,
          password_hash: "hash_test",
          nama_lengkap: "Budi Santoso S.Pd",
          peran_dasar: "TEACHER",
          status_akun: "AKTIF",
        },
        {
          id: userSiswaA.id,
          sekolah_id: schoolA.id,
          username: userSiswaA.username,
          password_hash: "hash_test",
          nama_lengkap: "Ahmad Siswa A",
          peran_dasar: "STUDENT",
          status_akun: "AKTIF",
        },
        {
          id: userWaliA.id,
          sekolah_id: schoolA.id,
          username: userWaliA.username,
          password_hash: "hash_test",
          nama_lengkap: "Hendra Wali A",
          peran_dasar: "GUARDIAN",
          status_akun: "AKTIF",
        },
      ],
    });

    await prisma.keanggotaanSekolah.createMany({
      data: [
        {
          id: generateUlid(),
          pengguna_id: userStaffA.id,
          sekolah_id: schoolA.id,
          peran_dasar_di_tenant: "SCHOOL_STAFF",
          status_keanggotaan: "ACTIVE",
        },
        {
          id: generateUlid(),
          pengguna_id: userGuruA.id,
          sekolah_id: schoolA.id,
          peran_dasar_di_tenant: "TEACHER",
          status_keanggotaan: "ACTIVE",
        },
        {
          id: generateUlid(),
          pengguna_id: userSiswaA.id,
          sekolah_id: schoolA.id,
          peran_dasar_di_tenant: "STUDENT",
          status_keanggotaan: "ACTIVE",
        },
        {
          id: generateUlid(),
          pengguna_id: userWaliA.id,
          sekolah_id: schoolA.id,
          peran_dasar_di_tenant: "GUARDIAN",
          status_keanggotaan: "ACTIVE",
        },
      ],
    });

    await prisma.langgananTenant.create({
      data: {
        id: generateUlid(),
        sekolah_id: schoolA.id,
        paket: "ENTERPRISE",
        status: "ACTIVE",
      },
    });

    const jabatanKurikulumA = { id: `JAB_A_${generateUlid()}` };
    await prisma.jabatan.create({
      data: {
        id: jabatanKurikulumA.id,
        sekolah_id: schoolA.id,
        kode_jabatan: "VICE_PRINCIPAL_CURRICULUM",
        nama_jabatan: "Wakil Kepala Sekolah Bidang Kurikulum",
      },
    });

    await prisma.penugasanJabatan.create({
      data: {
        id: generateUlid(),
        sekolah_id: schoolA.id,
        jabatan_id: jabatanKurikulumA.id,
        personil_id: userStaffA.id,
        berlaku_mulai: new Date("2026-01-01"),
        status: "AKTIF",
      },
    });

    await prisma.guru.create({
      data: {
        id: guruA.id,
        sekolah_id: schoolA.id,
        pengguna_id: userGuruA.id,
        nama_lengkap: "Budi Santoso S.Pd",
        nip: "198001012010011001",
        jenis_kelamin: "L",
        status_kepegawaian: "TETAP",
        status_aktif: true,
      },
    });

    await prisma.siswa.create({
      data: {
        id: siswaA.id,
        sekolah_id: schoolA.id,
        pengguna_id: userSiswaA.id,
        nama_lengkap: "Ahmad Siswa A",
        nis: "1001",
        nisn: "0010010001",
        jenis_kelamin: "L",
        status_akademik: "AKTIF",
      },
    });

    await prisma.waliMurid.create({
      data: {
        id: waliA.id,
        sekolah_id: schoolA.id,
        pengguna_id: userWaliA.id,
        nama_lengkap: "Hendra Wali A",
        no_telepon: "081234567890",
      },
    });

    await prisma.hubunganWaliSiswa.create({
      data: {
        id: relasiWaliA.id,
        sekolah_id: schoolA.id,
        wali_id: waliA.id,
        siswa_id: siswaA.id,
        jenis_hubungan: "AYAH",
        status_verifikasi: "TERVERIFIKASI",
      },
    });

    await prisma.tahunAjaran.create({
      data: {
        id: taA.id,
        sekolah_id: schoolA.id,
        nama: "2026/2027",
        tanggal_mulai: new Date("2026-07-01"),
        tanggal_selesai: new Date("2027-06-30"),
        status: "AKTIF",
      },
    });

    await prisma.semester.create({
      data: {
        id: semA.id,
        sekolah_id: schoolA.id,
        tahun_ajaran_id: taA.id,
        kode: "GANJIL",
        urutan: 1,
        nama: "Ganjil 2026/2027",
        status: "AKTIF",
        tanggal_mulai: new Date("2026-07-15"),
        tanggal_selesai: new Date("2026-12-20"),
      },
    });

    await prisma.tingkatKelas.create({
      data: {
        id: tktA.id,
        sekolah_id: schoolA.id,
        kode: "X",
        nama: "Kelas 10 SMA",
        urutan: 10,
      },
    });

    await prisma.rombel.create({
      data: {
        id: rombelA.id,
        sekolah_id: schoolA.id,
        tahun_ajaran_id: taA.id,
        tingkat_id: tktA.id,
        nama: "X-MIPA-1",
        status: "AKTIF",
      },
    });

    await prisma.keikutsertaanSiswa.create({
      data: {
        id: keikutsertaanA.id,
        sekolah_id: schoolA.id,
        siswa_id: siswaA.id,
        tahun_ajaran_id: taA.id,
        tingkat_id: tktA.id,
        status: "AKTIF",
      },
    });

    await prisma.penempatanRombel.create({
      data: {
        id: penempatanA.id,
        sekolah_id: schoolA.id,
        keikutsertaan_id: keikutsertaanA.id,
        rombel_id: rombelA.id,
        nomor_absen: 1,
        status: "AKTIF",
      },
    });

    await prisma.mataPelajaran.create({
      data: {
        id: mapelA.id,
        sekolah_id: schoolA.id,
        kode: "MAT-10",
        nama: "Matematika Wajib",
        status_aktif: true,
      },
    });

    await prisma.penugasanMengajar.create({
      data: {
        id: penugasanA.id,
        sekolah_id: schoolA.id,
        guru_id: guruA.id,
        mata_pelajaran_id: mapelA.id,
        rombel_id: rombelA.id,
        tahun_ajaran_id: taA.id,
        semester_id: semA.id,
        jumlah_jam_minggu: 4,
        status: "AKTIF",
      },
    });

    await prisma.sesiKelasAktual.create({
      data: {
        id: sesiA.id,
        sekolah_id: schoolA.id,
        penugasan_mengajar_id: penugasanA.id,
        rombel_id: rombelA.id,
        mata_pelajaran_id: mapelA.id,
        guru_id: guruA.id,
        tahun_ajaran_id: taA.id,
        semester_id: semA.id,
        tanggal: new Date(),
        status: "DIMULAI",
      },
    });

    await prisma.lingkupMateri.create({
      data: {
        id: lmA.id,
        sekolah_id: schoolA.id,
        penugasan_mengajar_id: penugasanA.id,
        kode: "BAB 1",
        judul: "Eksponen dan Logaritma Tenant A",
        status: "AKTIF",
        urutan: 1,
      },
    });

    await prisma.ujianCbt.create({
      data: {
        id: ujianA.id,
        sekolah_id: schoolA.id,
        penugasan_mengajar_id: penugasanA.id,
        judul: "PTS Matematika Semester Ganjil Tenant A",
        status: "DITERBITKAN",
        token_masuk: "TKN_A1",
        durasi_menit: 90,
      },
    });

    await prisma.pengumuman.create({
      data: {
        id: pengumumanA.id,
        sekolah_id: schoolA.id,
        penulis_id: userStaffA.id,
        judul: "Pengumuman Internal Tenant A",
        konten: "Konten rahasia internal institusi sekolah A",
        kategori: "PENTING",
        status: "PUBLISHED",
        target_audiens: "SEMUA",
      },
    });

    // =========================================================================
    // 2. SETUP TENANT B (REAL SQLITE DATABASE SEED)
    // =========================================================================
    await prisma.sekolah.create({
      data: {
        id: schoolB.id,
        nama: schoolB.nama,
        npsn: schoolB.npsn,
        jenjang: "SMK",
        status_aktif: true,
      },
    });

    await prisma.pengguna.createMany({
      data: [
        {
          id: userStaffB.id,
          sekolah_id: schoolB.id,
          username: userStaffB.username,
          password_hash: "hash_test",
          nama_lengkap: "Staf Tata Usaha B",
          peran_dasar: "SCHOOL_STAFF",
          status_akun: "AKTIF",
        },
        {
          id: userGuruB.id,
          sekolah_id: schoolB.id,
          username: userGuruB.username,
          password_hash: "hash_test",
          nama_lengkap: "Siti Rahma M.Pd",
          peran_dasar: "TEACHER",
          status_akun: "AKTIF",
        },
        {
          id: userSiswaB.id,
          sekolah_id: schoolB.id,
          username: userSiswaB.username,
          password_hash: "hash_test",
          nama_lengkap: "Bayu Siswa B",
          peran_dasar: "STUDENT",
          status_akun: "AKTIF",
        },
        {
          id: userWaliB.id,
          sekolah_id: schoolB.id,
          username: userWaliB.username,
          password_hash: "hash_test",
          nama_lengkap: "Rudi Wali B",
          peran_dasar: "GUARDIAN",
          status_akun: "AKTIF",
        },
      ],
    });

    await prisma.keanggotaanSekolah.createMany({
      data: [
        {
          id: generateUlid(),
          pengguna_id: userStaffB.id,
          sekolah_id: schoolB.id,
          peran_dasar_di_tenant: "SCHOOL_STAFF",
          status_keanggotaan: "ACTIVE",
        },
        {
          id: generateUlid(),
          pengguna_id: userGuruB.id,
          sekolah_id: schoolB.id,
          peran_dasar_di_tenant: "TEACHER",
          status_keanggotaan: "ACTIVE",
        },
        {
          id: generateUlid(),
          pengguna_id: userSiswaB.id,
          sekolah_id: schoolB.id,
          peran_dasar_di_tenant: "STUDENT",
          status_keanggotaan: "ACTIVE",
        },
        {
          id: generateUlid(),
          pengguna_id: userWaliB.id,
          sekolah_id: schoolB.id,
          peran_dasar_di_tenant: "GUARDIAN",
          status_keanggotaan: "ACTIVE",
        },
      ],
    });

    await prisma.langgananTenant.create({
      data: {
        id: generateUlid(),
        sekolah_id: schoolB.id,
        paket: "ENTERPRISE",
        status: "ACTIVE",
      },
    });

    await prisma.guru.create({
      data: {
        id: guruB.id,
        sekolah_id: schoolB.id,
        pengguna_id: userGuruB.id,
        nama_lengkap: "Siti Rahma M.Pd",
        nip: "198505052012022002",
        jenis_kelamin: "P",
        status_kepegawaian: "TETAP",
        status_aktif: true,
      },
    });

    await prisma.siswa.create({
      data: {
        id: siswaB.id,
        sekolah_id: schoolB.id,
        pengguna_id: userSiswaB.id,
        nama_lengkap: "Bayu Siswa B",
        nis: "2001",
        nisn: "0020020002",
        jenis_kelamin: "L",
        status_akademik: "AKTIF",
      },
    });

    await prisma.waliMurid.create({
      data: {
        id: waliB.id,
        sekolah_id: schoolB.id,
        pengguna_id: userWaliB.id,
        nama_lengkap: "Rudi Wali B",
        no_telepon: "089876543210",
      },
    });

    await prisma.hubunganWaliSiswa.create({
      data: {
        id: relasiWaliB.id,
        sekolah_id: schoolB.id,
        wali_id: waliB.id,
        siswa_id: siswaB.id,
        jenis_hubungan: "AYAH",
        status_verifikasi: "TERVERIFIKASI",
      },
    });

    await prisma.tahunAjaran.create({
      data: {
        id: taB.id,
        sekolah_id: schoolB.id,
        nama: "2026/2027 SMK",
        tanggal_mulai: new Date("2026-07-01"),
        tanggal_selesai: new Date("2027-06-30"),
        status: "AKTIF",
      },
    });

    await prisma.semester.create({
      data: {
        id: semB.id,
        sekolah_id: schoolB.id,
        tahun_ajaran_id: taB.id,
        kode: "GANJIL",
        urutan: 1,
        nama: "Ganjil 2026/2027 SMK",
        status: "AKTIF",
        tanggal_mulai: new Date("2026-07-15"),
        tanggal_selesai: new Date("2026-12-20"),
      },
    });

    await prisma.tingkatKelas.create({
      data: {
        id: tktB.id,
        sekolah_id: schoolB.id,
        kode: "X-SMK",
        nama: "Kelas 10 SMK",
        urutan: 10,
      },
    });

    await prisma.rombel.create({
      data: {
        id: rombelB.id,
        sekolah_id: schoolB.id,
        tahun_ajaran_id: taB.id,
        tingkat_id: tktB.id,
        nama: "X-RPL-1",
        status: "AKTIF",
      },
    });

    await prisma.keikutsertaanSiswa.create({
      data: {
        id: keikutsertaanB.id,
        sekolah_id: schoolB.id,
        siswa_id: siswaB.id,
        tahun_ajaran_id: taB.id,
        tingkat_id: tktB.id,
        status: "AKTIF",
      },
    });

    await prisma.penempatanRombel.create({
      data: {
        id: penempatanB.id,
        sekolah_id: schoolB.id,
        keikutsertaan_id: keikutsertaanB.id,
        rombel_id: rombelB.id,
        nomor_absen: 1,
        status: "AKTIF",
      },
    });

    await prisma.mataPelajaran.create({
      data: {
        id: mapelB.id,
        sekolah_id: schoolB.id,
        kode: "PROG-10",
        nama: "Dasar Pemrograman Web",
        status_aktif: true,
      },
    });

    await prisma.penugasanMengajar.create({
      data: {
        id: penugasanB.id,
        sekolah_id: schoolB.id,
        guru_id: guruB.id,
        mata_pelajaran_id: mapelB.id,
        rombel_id: rombelB.id,
        tahun_ajaran_id: taB.id,
        semester_id: semB.id,
        jumlah_jam_minggu: 4,
        status: "AKTIF",
      },
    });

    await prisma.sesiKelasAktual.create({
      data: {
        id: sesiB.id,
        sekolah_id: schoolB.id,
        penugasan_mengajar_id: penugasanB.id,
        rombel_id: rombelB.id,
        mata_pelajaran_id: mapelB.id,
        guru_id: guruB.id,
        tahun_ajaran_id: taB.id,
        semester_id: semB.id,
        tanggal: new Date(),
        status: "DIMULAI",
      },
    });

    await prisma.lingkupMateri.create({
      data: {
        id: lmB.id,
        sekolah_id: schoolB.id,
        penugasan_mengajar_id: penugasanB.id,
        kode: "BAB 1",
        judul: "Algoritma Pemrograman Tenant B",
        status: "AKTIF",
        urutan: 1,
      },
    });

    await prisma.ujianCbt.create({
      data: {
        id: ujianB.id,
        sekolah_id: schoolB.id,
        penugasan_mengajar_id: penugasanB.id,
        judul: "Uji Kompetensi Kejuruan Tenant B",
        status: "DITERBITKAN",
        token_masuk: "TKN_B1",
        durasi_menit: 120,
      },
    });

    await prisma.pengumuman.create({
      data: {
        id: pengumumanB.id,
        sekolah_id: schoolB.id,
        penulis_id: userStaffB.id,
        judul: "Pengumuman Konfidensial Tenant B",
        konten: "Informasi internal konfidensial sekolah B",
        kategori: "PENTING",
        status: "PUBLISHED",
        target_audiens: "SEMUA",
      },
    });
  });

  afterAll(async () => {
    // Cleanup in reverse relational order for both schools
    const schoolIds = [schoolA.id, schoolB.id];

    await prisma.pengumuman.deleteMany({ where: { sekolah_id: { in: schoolIds } } });
    await prisma.ujianCbt.deleteMany({ where: { sekolah_id: { in: schoolIds } } });
    await prisma.lingkupMateri.deleteMany({ where: { sekolah_id: { in: schoolIds } } });
    await prisma.sesiKelasAktual.deleteMany({ where: { sekolah_id: { in: schoolIds } } });
    await prisma.penugasanMengajar.deleteMany({ where: { sekolah_id: { in: schoolIds } } });
    await prisma.mataPelajaran.deleteMany({ where: { sekolah_id: { in: schoolIds } } });
    await prisma.penempatanRombel.deleteMany({ where: { sekolah_id: { in: schoolIds } } });
    await prisma.keikutsertaanSiswa.deleteMany({ where: { sekolah_id: { in: schoolIds } } });
    await prisma.rombel.deleteMany({ where: { sekolah_id: { in: schoolIds } } });
    await prisma.tingkatKelas.deleteMany({ where: { sekolah_id: { in: schoolIds } } });
    await prisma.semester.deleteMany({ where: { sekolah_id: { in: schoolIds } } });
    await prisma.tahunAjaran.deleteMany({ where: { sekolah_id: { in: schoolIds } } });
    await prisma.hubunganWaliSiswa.deleteMany({
      where: { sekolah_id: { in: schoolIds } },
    });
    await prisma.waliMurid.deleteMany({ where: { sekolah_id: { in: schoolIds } } });
    await prisma.siswa.deleteMany({ where: { sekolah_id: { in: schoolIds } } });
    await prisma.guru.deleteMany({ where: { sekolah_id: { in: schoolIds } } });
    await prisma.keanggotaanSekolah.deleteMany({ where: { sekolah_id: { in: schoolIds } } });
    await prisma.penugasanJabatan.deleteMany({ where: { sekolah_id: { in: schoolIds } } });
    await prisma.jabatan.deleteMany({ where: { sekolah_id: { in: schoolIds } } });
    await prisma.langgananTenant.deleteMany({ where: { sekolah_id: { in: schoolIds } } });
    await prisma.pengguna.deleteMany({ where: { sekolah_id: { in: schoolIds } } });
    await prisma.sekolah.deleteMany({ where: { id: { in: schoolIds } } });

    await prisma.$disconnect();
  });

  // ===========================================================================
  // BAGIAN 2: REAL INTEGRATION TESTS (PRIORITAS 1 - 7)
  // ===========================================================================

  describe("Prioritas 1: Tenant A Membaca Data Tenant B → HARUS DITOLAK", () => {
    it("menolak pembacaan Presensi Sesi Kelas milik Tenant B oleh Guru Tenant A", async () => {
      const attendanceRepo = new AttendanceRepository();
      const attendanceService = new AttendanceService(attendanceRepo);

      // Guru Tenant A mencoba membaca sesi milik Tenant B
      await expect(
        attendanceService.getSessionAttendance(sesiB.id, schoolA.id)
      ).rejects.toThrowError(SessionNotFoundError);
    });

    it("menolak pembacaan Ujian CBT milik Tenant B oleh Guru Tenant A", async () => {
      // Guru Tenant A mencoba get detail ujian milik Tenant B
      await expect(cbtService.getExamDetail(ujianB.id, schoolA.id, guruA.id)).rejects.toThrowError(
        CbtNotFoundError
      );
    });

    it("menolak pembacaan Pengumuman Konfidensial milik Tenant B oleh Staf Tenant A", async () => {
      const commRepo = new CommunicationRepository();
      const commService = new CommunicationService(commRepo);

      await expect(
        commService.getAnnouncementById(pengumumanB.id, schoolA.id)
      ).rejects.toThrowError(AnnouncementNotFoundError);
    });

    it("menolak akses profil anak Tenant B oleh Wali Murid Tenant A", async () => {
      const guardianRepo = new GuardianRepository();
      const guardianService = new GuardianService(guardianRepo);

      const actorWaliA: AuthenticatedUser = {
        id: userWaliA.id,
        username: userWaliA.username,
        email: null,
        nama_lengkap: "Hendra Wali A",
        peran_dasar: "GUARDIAN",
        sekolah_id: schoolA.id,
        status_akun: "AKTIF",
        harus_ganti_password: false,
      };

      // Wali Tenant A mencoba mengakses profil anak Tenant B
      await expect(
        guardianService.verifyGuardianChildAccess(actorWaliA, siswaB.id)
      ).rejects.toThrowError(ChildNotLinkedError);
    });
  });

  describe("Prioritas 2: Tenant A Mengubah Data Tenant B → HARUS DITOLAK", () => {
    it("menolak perubahan Lingkup Materi (BAB) milik Tenant B dengan context Tenant A", async () => {
      const learningRepo = new LearningRepository();
      const learningServiceInstance = new (learningService.constructor as any)(learningRepo);

      await expect(
        learningServiceInstance.updateLingkupMateri(userGuruA.id, "TEACHER", lmB.id, schoolA.id, {
          judul: "BAB Dibajak Tenant A",
        })
      ).rejects.toThrow(/tidak ditemukan/i);

      // Verifikasi di DB nyata: record Tenant B tetap utuh
      const lmBRecord = await prisma.lingkupMateri.findUnique({ where: { id: lmB.id } });
      expect(lmBRecord?.judul).toBe("Algoritma Pemrograman Tenant B");
    });

    it("menolak perubahan status Ujian CBT Tenant B oleh Guru Tenant A", async () => {
      await expect(
        cbtService.archiveExam(ujianB.id, schoolA.id, guruA.id, false)
      ).rejects.toThrowError(CbtNotFoundError);

      // Verifikasi di DB nyata: status ujian B tetap DITERBITKAN
      const ujianBRecord = await prisma.ujianCbt.findUnique({ where: { id: ujianB.id } });
      expect(ujianBRecord?.status).toBe("DITERBITKAN");
    });

    it("menolak penyuntingan Pengumuman milik Tenant B oleh Staf Tenant A", async () => {
      const commRepo = new CommunicationRepository();
      const commService = new CommunicationService(commRepo);

      await expect(
        commService.updateAnnouncement(
          pengumumanB.id,
          schoolA.id,
          { id: userStaffA.id, nama: "Staf A", peran: "SCHOOL_STAFF" },
          { judul: "Pengumuman Dibajak Tenant A" }
        )
      ).rejects.toThrowError(AnnouncementNotFoundError);
    });
  });

  describe("Prioritas 3: Tenant A Menghapus Data Tenant B → HARUS DITOLAK", () => {
    it("menolak penghapusan Lingkup Materi Tenant B dengan context Tenant A", async () => {
      const learningRepo = new LearningRepository();
      const learningServiceInstance = new (learningService.constructor as any)(learningRepo);

      await expect(
        learningServiceInstance.deleteLingkupMateri(userGuruA.id, "TEACHER", lmB.id, schoolA.id)
      ).rejects.toThrow(/tidak ditemukan/i);

      // Verifikasi record masih ada di DB nyata
      const exists = await prisma.lingkupMateri.findUnique({ where: { id: lmB.id } });
      expect(exists).not.toBeNull();
    });

    it("menolak penghapusan Pengumuman Tenant B oleh Staf Tenant A", async () => {
      const commRepo = new CommunicationRepository();
      const commService = new CommunicationService(commRepo);

      await expect(
        commService.deleteAnnouncement(pengumumanB.id, schoolA.id, {
          id: userStaffA.id,
          nama: "Staf A",
          peran: "SCHOOL_STAFF",
        })
      ).rejects.toThrowError(AnnouncementNotFoundError);

      // Verifikasi record masih ada di DB nyata
      const exists = await prisma.pengumuman.findUnique({ where: { id: pengumumanB.id } });
      expect(exists).not.toBeNull();
    });
  });

  describe("Prioritas 4: Tenant A Memakai ID Resource Tenant B → HARUS DITOLAK", () => {
    it("menolak pencatatan presensi pada Sesi Kelas Aktual milik Tenant B", async () => {
      const attendanceRepo = new AttendanceRepository();
      const attendanceService = new AttendanceService(attendanceRepo);

      // Guru A mencoba menyimpan presensi menggunakan ID sesi Tenant B
      await expect(
        attendanceService.saveSessionAttendance(userGuruA.id, "TEACHER", schoolA.id, {
          sekolah_id: schoolA.id,
          sesi_kelas_id: sesiB.id, // ID resource milik Tenant B
          items: [
            {
              siswa_id: siswaA.id,
              status: "HADIR",
            },
          ],
        })
      ).rejects.toThrowError(SessionNotFoundError);
    });

    it("menolak pembuatan BAB Lingkup Materi baru yang menempel pada Penugasan Mengajar Tenant B", async () => {
      const learningRepo = new LearningRepository();
      const learningServiceInstance = new (learningService.constructor as any)(learningRepo);

      await expect(
        learningServiceInstance.createLingkupMateri(userGuruA.id, "TEACHER", {
          sekolah_id: schoolA.id,
          penugasan_mengajar_id: penugasanB.id, // Penugasan milik Tenant B
          judul: "BAB Disusupkan",
          urutan: 99,
        })
      ).rejects.toThrow(/tidak ditemukan atau bukan milik sekolah aktif/i);
    });
  });

  describe("Prioritas 5: Tenant A Memalsukan sekolah_id → HARUS DITOLAK", () => {
    it("menolak FormData pembuatan guru dengan sekolah_id dipalsukan ke Tenant B", async () => {
      setAuthenticatedActor({
        id: userStaffA.id,
        username: userStaffA.username,
        nama_lengkap: "Staf Tata Usaha A",
        peran_dasar: "SCHOOL_STAFF",
        sekolah_id: schoolA.id,
        status_akun: "AKTIF",
        harus_ganti_password: false,
      });

      const formData = new FormData();
      formData.set("sekolah_id", schoolB.id); // Spoof target school ID
      formData.set("nama_lengkap", "Guru Palsu Injeksi");
      formData.set("nip", "999999999999999999");
      formData.set("status_kepegawaian", "TETAP");

      const res = await createTeacherAction(null, formData);
      expect(res.success).toBe(false);
      expect(res.message).toMatch(/Akses ditolak.*lintas sekolah/i);
    });

    it("menolak payload presensi dengan input.sekolah_id dipalsukan ke Tenant B", async () => {
      setAuthenticatedActor({
        id: userGuruA.id,
        username: userGuruA.username,
        nama_lengkap: "Budi Santoso S.Pd",
        peran_dasar: "TEACHER",
        sekolah_id: schoolA.id,
        status_akun: "AKTIF",
        harus_ganti_password: false,
      });

      const res = await saveSessionAttendanceAction({
        sekolah_id: schoolB.id, // Spoofed sekolah_id
        sesi_kelas_id: sesiA.id,
        items: [{ siswa_id: siswaA.id, status: "HADIR" }],
      });

      expect(res.success).toBe(false);
      expect(res.message).toMatch(/Akses ditolak.*lintas sekolah/i);
    });
  });

  describe("Prioritas 6: Tenant A Memalsukan guru_id (Guru Tenant B) → HARUS DITOLAK", () => {
    it("menolak penetapan Penugasan Mengajar dengan guru_id dari Tenant B", async () => {
      await expect(
        TeachingAssignmentService.createTeachingAssignment({
          sekolah_id: schoolA.id,
          guru_id: guruB.id, // Guru milik Tenant B
          mata_pelajaran_id: mapelA.id,
          rombel_id: rombelA.id,
          tahun_ajaran_id: taA.id,
          semester_id: semA.id,
          jumlah_jam_minggu: 2,
          status: "AKTIF",
        })
      ).rejects.toThrowError(CrossSchoolBoundaryError);
    });

    it("menolak penugasan Wali Kelas dengan guru_id dari Tenant B", async () => {
      await expect(
        HomeroomAssignmentService.assignHomeroom({
          sekolah_id: schoolA.id,
          guru_id: guruB.id, // Guru milik Tenant B
          rombel_id: rombelA.id,
          tahun_ajaran_id: taA.id,
        })
      ).rejects.toThrowError(CrossSchoolBoundaryError);
    });
  });

  describe("Prioritas 7: Tenant A Memalsukan rombel_id (Rombel Tenant B) → HARUS DITOLAK", () => {
    it("menolak penetapan Penugasan Mengajar dengan rombel_id dari Tenant B", async () => {
      await expect(
        TeachingAssignmentService.createTeachingAssignment({
          sekolah_id: schoolA.id,
          guru_id: guruA.id,
          mata_pelajaran_id: mapelA.id,
          rombel_id: rombelB.id, // Rombel milik Tenant B
          tahun_ajaran_id: taA.id,
          semester_id: semA.id,
          jumlah_jam_minggu: 2,
          status: "AKTIF",
        })
      ).rejects.toThrowError(CrossSchoolBoundaryError);
    });

    it("menolak penugasan Wali Kelas dengan rombel_id dari Tenant B", async () => {
      await expect(
        HomeroomAssignmentService.assignHomeroom({
          sekolah_id: schoolA.id,
          guru_id: guruA.id,
          rombel_id: rombelB.id, // Rombel milik Tenant B
          tahun_ajaran_id: taA.id,
        })
      ).rejects.toThrowError(CrossSchoolBoundaryError);
    });
  });

  // ===========================================================================
  // BAGIAN 3: HTTP / SERVER ACTION SMOKE TESTS (5 CRITICAL PATHS)
  // ===========================================================================

  describe("Critical Path 1: Attendance Server Actions Smoke Test", () => {
    it("getSessionAttendanceAction: menolak Guru A membaca sesi kelas Tenant B", async () => {
      setAuthenticatedActor({
        id: userGuruA.id,
        username: userGuruA.username,
        nama_lengkap: "Budi Santoso S.Pd",
        peran_dasar: "TEACHER",
        sekolah_id: schoolA.id,
        status_akun: "AKTIF",
        harus_ganti_password: false,
      });

      const res = await getSessionAttendanceAction(sesiB.id);
      expect(res.success).toBe(false);
      expect(res.message).toMatch(/tidak ditemukan/i);
    });

    it("saveSessionAttendanceAction: menolak Guru A menyimpan presensi sesi kelas Tenant B", async () => {
      setAuthenticatedActor({
        id: userGuruA.id,
        username: userGuruA.username,
        nama_lengkap: "Budi Santoso S.Pd",
        peran_dasar: "TEACHER",
        sekolah_id: schoolA.id,
        status_akun: "AKTIF",
        harus_ganti_password: false,
      });

      const res = await saveSessionAttendanceAction({
        sekolah_id: schoolA.id,
        sesi_kelas_id: sesiB.id,
        items: [{ siswa_id: siswaA.id, status: "HADIR" }],
      });
      expect(res.success).toBe(false);
      expect(res.message).toMatch(/tidak ditemukan/i);
    });
  });

  describe("Critical Path 2: CBT Server Actions Smoke Test", () => {
    it("getExamPrintDataAction: menolak Guru A mencetak naskah ujian Tenant B", async () => {
      setAuthenticatedActor({
        id: userGuruA.id,
        username: userGuruA.username,
        nama_lengkap: "Budi Santoso S.Pd",
        peran_dasar: "TEACHER",
        sekolah_id: schoolA.id,
        status_akun: "AKTIF",
        harus_ganti_password: false,
      });

      const res = await getExamPrintDataAction(ujianB.id);
      expect(res.success).toBe(false);
      expect(res.message).toMatch(/tidak ditemukan atau bukan milik sekolah Anda/i);
    });

    it("refreshExamTokenAction: menolak Guru A mengacak token ujian Tenant B", async () => {
      setAuthenticatedActor({
        id: userGuruA.id,
        username: userGuruA.username,
        nama_lengkap: "Budi Santoso S.Pd",
        peran_dasar: "TEACHER",
        sekolah_id: schoolA.id,
        status_akun: "AKTIF",
        harus_ganti_password: false,
      });

      const res = await refreshExamTokenAction(ujianB.id);
      expect(res.success).toBe(false);
      expect(res.message).toMatch(/tidak ditemukan atau bukan milik sekolah Anda/i);
    });

    it("startOrResumeAttemptAction: menolak Siswa A mengerjakan ujian Tenant B", async () => {
      setAuthenticatedActor({
        id: userSiswaA.id,
        username: userSiswaA.username,
        nama_lengkap: "Ahmad Siswa A",
        peran_dasar: "STUDENT",
        sekolah_id: schoolA.id,
        status_akun: "AKTIF",
        harus_ganti_password: false,
      });

      const res = await startOrResumeAttemptAction(ujianB.id);
      expect(res.success).toBe(false);
      expect(res.message).toMatch(/tidak ditemukan/i);
    });
  });

  describe("Critical Path 3: Teacher Assignment Server Actions Smoke Test", () => {
    it("createTeachingAssignmentAction: menolak penugasan dengan guru_id Tenant B via FormData", async () => {
      setAuthenticatedActor({
        id: userStaffA.id,
        username: userStaffA.username,
        nama_lengkap: "Staf Tata Usaha A",
        peran_dasar: "SCHOOL_STAFF",
        sekolah_id: schoolA.id,
        status_akun: "AKTIF",
        harus_ganti_password: false,
      });

      const formData = new FormData();
      formData.set("guru_id", guruB.id); // Guru Tenant B
      formData.set("mata_pelajaran_id", mapelA.id);
      formData.set("rombel_id", rombelA.id);
      formData.set("tahun_ajaran_id", taA.id);
      formData.set("semester_id", semA.id);
      formData.set("jumlah_jam_minggu", "4");

      const res = await createTeachingAssignmentAction(null, formData);
      expect(res.success).toBe(false);
      expect(res.message).toMatch(/(?:pelanggaran|melanggar) batas institusi/i);
    });

    it("createTeachingAssignmentAction: menolak penugasan dengan rombel_id Tenant B via FormData", async () => {
      setAuthenticatedActor({
        id: userStaffA.id,
        username: userStaffA.username,
        nama_lengkap: "Staf Tata Usaha A",
        peran_dasar: "SCHOOL_STAFF",
        sekolah_id: schoolA.id,
        status_akun: "AKTIF",
        harus_ganti_password: false,
      });

      const formData = new FormData();
      formData.set("guru_id", guruA.id);
      formData.set("mata_pelajaran_id", mapelA.id);
      formData.set("rombel_id", rombelB.id); // Rombel Tenant B
      formData.set("tahun_ajaran_id", taA.id);
      formData.set("semester_id", semA.id);
      formData.set("jumlah_jam_minggu", "4");

      const res = await createTeachingAssignmentAction(null, formData);
      expect(res.success).toBe(false);
      expect(res.message).toMatch(/(?:pelanggaran|melanggar) batas institusi/i);
    });
  });

  describe("Critical Path 4: Guardian Server Actions Smoke Test", () => {
    it("switchActiveChildAction: menolak Wali A memilih anak milik Tenant B", async () => {
      setAuthenticatedActor({
        id: userWaliA.id,
        username: userWaliA.username,
        nama_lengkap: "Hendra Wali A",
        peran_dasar: "GUARDIAN",
        sekolah_id: schoolA.id,
        status_akun: "AKTIF",
        harus_ganti_password: false,
      });

      const res = await switchActiveChildAction(siswaB.id);
      expect(res.success).toBe(false);
      expect(res.message).toMatch(/tidak terhubung dengan wali|bukan anak yang terhubung/i);
    });

    it("submitPengajuanWaliAction: menolak pengajuan izin oleh Wali A untuk siswa Tenant B via FormData", async () => {
      setAuthenticatedActor({
        id: userWaliA.id,
        username: userWaliA.username,
        nama_lengkap: "Hendra Wali A",
        peran_dasar: "GUARDIAN",
        sekolah_id: schoolA.id,
        status_akun: "AKTIF",
        harus_ganti_password: false,
      });

      const formData = new FormData();
      formData.set("siswa_id", siswaB.id); // Siswa Tenant B
      formData.set("tipe", "SAKIT");
      formData.set("judul", "Izin Sakit Siswa B");
      formData.set("deskripsi", "Anak demam tinggi");

      const res = await submitPengajuanWaliAction(null, formData);
      expect(res.success).toBe(false);
      expect(res.message).toMatch(/tidak terhubung dengan wali|bukan anak yang terhubung/i);
    });
  });

  describe("Critical Path 5: Learning Server Actions Smoke Test", () => {
    it("createLingkupMateriAction: menolak pembuatan BAB dengan penugasan_id Tenant B via FormData", async () => {
      setAuthenticatedActor({
        id: userGuruA.id,
        username: userGuruA.username,
        nama_lengkap: "Budi Santoso S.Pd",
        peran_dasar: "TEACHER",
        sekolah_id: schoolA.id,
        status_akun: "AKTIF",
        harus_ganti_password: false,
      });

      const formData = new FormData();
      formData.set("penugasan_mengajar_id", penugasanB.id); // Penugasan Tenant B
      formData.set("judul", "BAB Eksperimen Injeksi");
      formData.set("kode", "BAB-X");
      formData.set("urutan", "1");

      const res = await createLingkupMateriAction(null, formData);
      expect(res.success).toBe(false);
      expect(res.message).toMatch(/tidak ditemukan atau bukan milik sekolah aktif/i);
    });

    it("updateLingkupMateriAction: menolak pembaruan BAB Tenant B dengan URL/form parameter manipulation", async () => {
      setAuthenticatedActor({
        id: userGuruA.id,
        username: userGuruA.username,
        nama_lengkap: "Budi Santoso S.Pd",
        peran_dasar: "TEACHER",
        sekolah_id: schoolA.id,
        status_akun: "AKTIF",
        harus_ganti_password: false,
      });

      const formData = new FormData();
      formData.set("id", lmB.id); // ID BAB Tenant B
      formData.set("penugasan_mengajar_id", penugasanA.id);
      formData.set("judul", "Judul Dirusak Guru A");

      const res = await updateLingkupMateriAction(null, formData);
      expect(res.success).toBe(false);
      expect(res.message).toMatch(/tidak ditemukan/i);
    });

    it("deleteLingkupMateriAction: menolak penghapusan BAB Tenant B oleh Guru A", async () => {
      setAuthenticatedActor({
        id: userGuruA.id,
        username: userGuruA.username,
        nama_lengkap: "Budi Santoso S.Pd",
        peran_dasar: "TEACHER",
        sekolah_id: schoolA.id,
        status_akun: "AKTIF",
        harus_ganti_password: false,
      });

      const res = await deleteLingkupMateriAction(lmB.id, penugasanA.id);
      expect(res.success).toBe(false);
      expect(res.message).toMatch(/tidak ditemukan/i);
    });
  });
});
