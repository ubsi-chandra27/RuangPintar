import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TeacherDashboard } from "@/shared/components/dashboard/role-views/teacher-dashboard";
import { StudentDashboard } from "@/shared/components/dashboard/role-views/student-dashboard";
import { GuardianDashboard } from "@/shared/components/dashboard/role-views/guardian-dashboard";
import { StaffDashboard } from "@/shared/components/dashboard/role-views/staff-dashboard";
import { SuperAdminDashboard } from "@/shared/components/dashboard/role-views/super-admin-dashboard";
import { AuthenticatedUser } from "@/shared/infrastructure/auth/auth-service";

const mockTeacher: AuthenticatedUser = {
  id: "01J000000000000000000TEACH1",
  username: "guru_ahmad",
  nama_lengkap: "Ahmad Dahlan, S.Pd.",
  email: null,
  peran_dasar: "TEACHER",
  status_akun: "AKTIF",
  harus_ganti_password: false,
  sekolah_id: "01J00000000000000000000001",
};

const mockStudent: AuthenticatedUser = {
  id: "01J000000000000000000STUD01",
  username: "siswa_budi",
  nama_lengkap: "Budi Santoso",
  email: null,
  peran_dasar: "STUDENT",
  status_akun: "AKTIF",
  harus_ganti_password: false,
  sekolah_id: "01J00000000000000000000001",
};

const mockGuardian: AuthenticatedUser = {
  id: "01J000000000000000000GUAR01",
  username: "wali_santoso",
  nama_lengkap: "Santoso Wijaya",
  email: null,
  peran_dasar: "GUARDIAN",
  status_akun: "AKTIF",
  harus_ganti_password: false,
  sekolah_id: "01J00000000000000000000001",
};

const mockStaff: AuthenticatedUser = {
  id: "01J000000000000000000STAF01",
  username: "staf_tatausaha",
  nama_lengkap: "Siti Rahma",
  email: null,
  peran_dasar: "SCHOOL_STAFF",
  status_akun: "AKTIF",
  harus_ganti_password: false,
  sekolah_id: "01J00000000000000000000001",
};

const mockAdmin: AuthenticatedUser = {
  id: "01J000000000000000000ADMN01",
  username: "superadmin",
  nama_lengkap: "Administrator Utama",
  email: null,
  peran_dasar: "SUPER_ADMIN",
  status_akun: "AKTIF",
  harus_ganti_password: false,
  sekolah_id: "01J00000000000000000000001",
};

describe("Role Dashboard Views & Page Contracts (Phase 05)", () => {
  it("renders TeacherDashboard with schedule and academic quick actions", async () => {
    const jsx = await TeacherDashboard({
      user: mockTeacher,
      initialData: {
        hasProfile: true,
        teacher: {
          id: "01J00000000000000000000001",
          sekolah_id: "01J00000000000000000000001",
          nama_lengkap: "Ahmad Dahlan",
          gelar_belakang: "S.Pd.",
          nama_dengan_gelar: "Ahmad Dahlan, S.Pd.",
          jenis_kelamin: "L",
          status_kepegawaian: "PNS",
          status_aktif: true,
          status_lifecycle: "AKTIF",
          created_at: new Date(),
          updated_at: new Date(),
        },
        activeAssignments: [
          {
            id: "01J00000000000000000000002",
            sekolah_id: "01J00000000000000000000001",
            guru_id: "01J00000000000000000000001",
            mata_pelajaran_id: "01J00000000000000000000003",
            tahun_ajaran_id: "01J00000000000000000000004",
            rombel_id: "01J00000000000000000000005",
            jumlah_jam_minggu: 4,
            berlaku_mulai: new Date(),
            status: "AKTIF",
            created_at: new Date(),
            updated_at: new Date(),
            guru_nama: "Ahmad Dahlan, S.Pd.",
            mata_pelajaran_kode: "PWPB",
            mata_pelajaran_nama: "Pemrograman Web & Mobile",
            tahun_ajaran_nama: "2026/2027",
            rombel_nama: "X RPL 1",
          },
        ],
        activeHomeroom: {
          id: "01J00000000000000000000006",
          sekolah_id: "01J00000000000000000000001",
          guru_id: "01J00000000000000000000001",
          rombel_id: "01J00000000000000000000005",
          tahun_ajaran_id: "01J00000000000000000000004",
          berlaku_mulai: new Date(),
          status: "AKTIF",
          created_at: new Date(),
          updated_at: new Date(),
          guru_nama: "Ahmad Dahlan, S.Pd.",
          rombel_nama: "X RPL 1",
          tahun_ajaran_nama: "2026/2027",
          total_siswa_rombel: 36,
        },
        totalJamMinggu: 4,
        totalRombel: 1,
        totalSiswaBinaan: 36,
      },
    });
    render(jsx);

    expect(screen.getByText(/Selamat Datang, Ahmad Dahlan, S.Pd./i)).toBeInTheDocument();
    expect(screen.getByText("Guru Pengajar")).toBeInTheDocument();
    expect(screen.getByText("Penugasan Mengajar & Kelas Saya")).toBeInTheDocument();
    expect(screen.getByText("1 Penugasan")).toBeInTheDocument();
    expect(screen.getByText("Pemrograman Web & Mobile")).toBeInTheDocument();
    expect(screen.getByText("Aksi Cepat Guru")).toBeInTheDocument();
  });

  it("renders StudentDashboard with student self-scope items and CBT cards", () => {
    render(<StudentDashboard user={mockStudent} />);

    expect(screen.getByText(/Halo, Budi Santoso!/i)).toBeInTheDocument();
    expect(screen.getByText("Siswa Aktif")).toBeInTheDocument();
    expect(screen.getByText("Jadwal Pelajaran Hari Ini")).toBeInTheDocument();
    expect(screen.getByText("CBT & Ujian Mendatang")).toBeInTheDocument();
    expect(screen.getByText("Aksi Cepat Siswa")).toBeInTheDocument();
  });

  it("renders GuardianDashboard with child learning progress and quick actions", () => {
    render(<GuardianDashboard user={mockGuardian} />);

    expect(screen.getByText(/Selamat Datang, Bapak\/Ibu Santoso Wijaya/i)).toBeInTheDocument();
    expect(screen.getByText("Wali Murid")).toBeInTheDocument();
    expect(screen.getByText("Aktivitas Pembelajaran Putra/Putri")).toBeInTheDocument();
    expect(screen.getByText("Layanan Orang Tua")).toBeInTheDocument();
  });

  it("renders StaffDashboard reflecting assigned capability bundles", () => {
    render(
      <StaffDashboard
        user={mockStaff}
        capabilities={["ACADEMIC_OPERATOR", "STUDENT_DATA_OPERATOR"]}
      />
    );

    expect(screen.getByText("Dashboard Operasional")).toBeInTheDocument();
    expect(screen.getByText("Staf Tata Usaha")).toBeInTheDocument();
    expect(screen.getByText("Operator Akademik")).toBeInTheDocument();
    expect(screen.getByText("Operator Kesiswaan")).toBeInTheDocument();
    expect(screen.getByText("Modul Operasional & Wewenang")).toBeInTheDocument();
  });

  it("renders SuperAdminDashboard with core stat cards, activity chart, and quick actions", () => {
    render(<SuperAdminDashboard user={mockAdmin} />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(
      screen.getByText("Ringkasan operasional dan aktivitas akademik sekolah.")
    ).toBeInTheDocument();
    expect(screen.getByText("Total Siswa")).toBeInTheDocument();
    expect(screen.getByText("Kehadiran Hari Ini")).toBeInTheDocument();
    expect(screen.getByText("Aktivitas Terbaru")).toBeInTheDocument();
    expect(screen.getByText("Aksi Cepat")).toBeInTheDocument();
  });
});
