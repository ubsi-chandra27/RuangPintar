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
  it("renders TeacherDashboard with honest empty states and no fake KPIs", () => {
    render(<TeacherDashboard user={mockTeacher} />);

    expect(screen.getByText(/Selamat Datang, Ahmad Dahlan/i)).toBeInTheDocument();
    expect(screen.getByText("Guru Pengajar")).toBeInTheDocument();
    expect(screen.getByText("Jadwal Mengajar Terdekat")).toBeInTheDocument();
    expect(screen.getByText("Belum Ada Jadwal Mengajar")).toBeInTheDocument();
    expect(screen.getByText(/Jadwal master aktif pada Phase 10/i)).toBeInTheDocument();
  });

  it("renders StudentDashboard with student self-scope items", () => {
    render(<StudentDashboard user={mockStudent} />);

    expect(screen.getByText(/Halo, Budi Santoso!/i)).toBeInTheDocument();
    expect(screen.getByText("Siswa Aktif")).toBeInTheDocument();
    expect(screen.getByText("Jadwal Pelajaran Hari Ini")).toBeInTheDocument();
    expect(screen.getByText("Tugas & Materi Belajar")).toBeInTheDocument();
  });

  it("renders GuardianDashboard with verified child empty state", () => {
    render(<GuardianDashboard user={mockGuardian} />);

    expect(screen.getByText(/Selamat Datang, Bapak\/Ibu Santoso Wijaya/i)).toBeInTheDocument();
    expect(screen.getByText("Wali Siswa")).toBeInTheDocument();
    expect(screen.getByText("Putra / Putri Binaan")).toBeInTheDocument();
    expect(screen.getByText("Belum Ada Data Siswa Terhubung")).toBeInTheDocument();
  });

  it("renders StaffDashboard reflecting assigned capability bundles", () => {
    render(
      <StaffDashboard
        user={mockStaff}
        capabilities={["ACADEMIC_OPERATOR", "STUDENT_DATA_OPERATOR"]}
      />
    );

    expect(screen.getByText(/Dashboard Operasional — Siti Rahma/i)).toBeInTheDocument();
    expect(screen.getByText("Operator Kurikulum & Akademik")).toBeInTheDocument();
    expect(screen.getByText("Operator Kesiswaan")).toBeInTheDocument();
    expect(screen.getByText("Operasional Akademik")).toBeInTheDocument();
    expect(screen.getByText("Manajemen Kesiswaan")).toBeInTheDocument();
  });

  it("renders SuperAdminDashboard with platform and security audit stats", () => {
    render(<SuperAdminDashboard user={mockAdmin} />);

    expect(screen.getByText("Pusat Kendali Super Admin")).toBeInTheDocument();
    expect(screen.getByText("Super Admin")).toBeInTheDocument();
    expect(screen.getByText("SQLite WAL")).toBeInTheDocument();
    expect(screen.getByText("Default Deny")).toBeInTheDocument();
    expect(screen.getByText("Aktif (M05)")).toBeInTheDocument();
  });
});
