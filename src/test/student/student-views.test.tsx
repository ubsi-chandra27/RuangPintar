import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StudentDirectoryView } from "@/modules/student/presentation/student-directory-view";
import { StudentEnrollmentsView } from "@/modules/student/presentation/student-enrollments-view";
import { StudentPlacementsView } from "@/modules/student/presentation/student-placements-view";
import { StudentManagementTabs } from "@/modules/student/presentation/student-management-tabs";
import {
  RombelPlacementDTO,
  StudentEnrollmentDTO,
  StudentIdentityDTO,
} from "@/modules/student/domain/student-types";
import { StudentManagementDataset } from "@/modules/student/application/student-facade";

// Mock server actions
vi.mock("@/app/actions/student-actions", () => ({
  createStudentAction: vi.fn(),
  updateStudentAction: vi.fn(),
  deleteStudentAction: vi.fn(),
  createEnrollmentAction: vi.fn(),
  updateEnrollmentStatusAction: vi.fn(),
  deleteEnrollmentAction: vi.fn(),
  createPlacementAction: vi.fn(),
  movePlacementAction: vi.fn(),
  bulkPlacementAction: vi.fn(),
  deletePlacementAction: vi.fn(),
  promoteStudentAction: vi.fn(),
  graduateStudentAction: vi.fn(),
  transferOutStudentAction: vi.fn(),
  getStudentTimelineAction: vi.fn().mockResolvedValue({
    success: true,
    data: {
      siswa: {
        id: "SISWA_1",
        sekolah_id: "SCH_1",
        nis: "20261001",
        nama_lengkap: "Ahmad Fauzi",
        jenis_kelamin: "L",
        status_akademik: "AKTIF",
        tanggal_masuk: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
      enrollments: [],
    },
  }),
}));

const mockStudents: StudentIdentityDTO[] = [
  {
    id: "SISWA_1",
    sekolah_id: "SCH_1",
    pengguna_id: null,
    nis: "20261001",
    nisn: "0081234567",
    nama_lengkap: "Ahmad Fauzi",
    jenis_kelamin: "L",
    tempat_lahir: "Bandung",
    tanggal_lahir: new Date("2008-05-15"),
    agama: "ISLAM",
    nik: "3201011505080001",
    alamat: "Jl. Merdeka No. 45",
    nama_wali: "Budi Santoso",
    telepon_wali: "081234567890",
    email_wali: null,
    status_akademik: "AKTIF",
    tanggal_masuk: new Date("2026-07-01"),
    tanggal_keluar: null,
    catatan: null,
    created_at: new Date(),
    updated_at: new Date(),
    active_rombel_nama: "X RPL 1",
    active_tingkat_nama: "Kelas 10",
  },
];

const mockEnrollments: StudentEnrollmentDTO[] = [
  {
    id: "ENR_1",
    sekolah_id: "SCH_1",
    siswa_id: "SISWA_1",
    siswa_nama: "Ahmad Fauzi",
    siswa_nis: "20261001",
    tahun_ajaran_id: "YEAR_1",
    tahun_ajaran_nama: "2026/2027",
    tingkat_id: "GRADE_1",
    tingkat_nama: "Kelas 10",
    status: "AKTIF",
    tanggal_mulai: new Date("2026-07-01"),
    tanggal_selesai: null,
    catatan: null,
    created_at: new Date(),
    updated_at: new Date(),
    active_rombel_nama: "X RPL 1",
  },
];

const mockPlacements: RombelPlacementDTO[] = [
  {
    id: "PLC_1",
    sekolah_id: "SCH_1",
    keikutsertaan_id: "ENR_1",
    siswa_id: "SISWA_1",
    siswa_nama: "Ahmad Fauzi",
    siswa_nis: "20261001",
    siswa_jenis_kelamin: "L",
    tahun_ajaran_id: "YEAR_1",
    tahun_ajaran_nama: "2026/2027",
    rombel_id: "ROMBEL_1",
    rombel_nama: "X RPL 1",
    rombel_kapasitas: 36,
    tingkat_nama: "Kelas 10",
    program_nama: "Rekayasa Perangkat Lunak",
    tanggal_mulai: new Date("2026-07-01"),
    tanggal_selesai: null,
    status: "AKTIF",
    nomor_absen: 1,
    catatan: null,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

const mockDataset: StudentManagementDataset = {
  students: mockStudents,
  totalStudents: 1,
  enrollments: mockEnrollments,
  totalEnrollments: 1,
  placements: mockPlacements,
  totalPlacements: 1,
  academicYears: [{ id: "YEAR_1", nama: "2026/2027", status: "AKTIF" }],
  activeYear: { id: "YEAR_1", nama: "2026/2027" },
  gradeLevels: [{ id: "GRADE_1", nama: "Kelas 10", kode: "10" }],
  rombels: [
    {
      id: "ROMBEL_1",
      nama: "X RPL 1",
      kapasitas: 36,
      tingkat_nama: "Kelas 10",
      program_nama: "RPL",
      tahun_ajaran_id: "YEAR_1",
    },
  ],
  programs: [{ id: "PROG_1", nama: "Rekayasa Perangkat Lunak", kode: "RPL" }],
};

describe("M07 — Student Presentation Views Rendering", () => {
  it("merender StudentDirectoryView dengan data siswa yang valid", () => {
    render(
      <StudentDirectoryView
        initialStudents={mockStudents}
        academicYears={mockDataset.academicYears}
        gradeLevels={mockDataset.gradeLevels}
        rombels={mockDataset.rombels}
        canManage={true}
      />
    );

    expect(screen.getByText("Buku Induk & Direktori Siswa")).toBeInTheDocument();
    expect(screen.getAllByText("Ahmad Fauzi").length).toBeGreaterThan(0);
    expect(screen.getByText("Tambah Siswa")).toBeInTheDocument();
  });

  it("merender StudentEnrollmentsView dengan data keikutsertaan", () => {
    render(
      <StudentEnrollmentsView
        initialEnrollments={mockEnrollments}
        students={mockStudents}
        academicYears={mockDataset.academicYears}
        activeYear={mockDataset.activeYear}
        gradeLevels={mockDataset.gradeLevels}
        rombels={mockDataset.rombels}
        canManage={true}
      />
    );

    expect(screen.getByText("Keikutsertaan Akademik Siswa")).toBeInTheDocument();
    expect(screen.getByText("Daftarkan ke Periode")).toBeInTheDocument();
  });

  it("merender StudentPlacementsView dengan kontrol penempatan rombel", () => {
    render(
      <StudentPlacementsView
        initialPlacements={mockPlacements}
        enrollments={mockEnrollments}
        rombels={mockDataset.rombels}
        academicYears={mockDataset.academicYears}
        canManage={true}
      />
    );

    expect(screen.getByText("Penempatan Rombongan Belajar (Rombel)")).toBeInTheDocument();
    expect(screen.getByText("Penempatan Massal")).toBeInTheDocument();
    expect(screen.getByText("Tempatkan Siswa")).toBeInTheDocument();
  });

  it("merender StudentManagementTabs dengan switcher symmetrical 3 tabs", () => {
    render(<StudentManagementTabs dataset={mockDataset} canManage={true} />);

    expect(screen.getByText("Daftar Siswa")).toBeInTheDocument();
    expect(screen.getByText("Keikutsertaan Akademik")).toBeInTheDocument();
    expect(screen.getByText("Penempatan Rombel")).toBeInTheDocument();
  });
});
