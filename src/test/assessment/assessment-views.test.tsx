import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ClassAssessmentTabView } from "@/modules/assessment/presentation/class-assessment-tab-view";
import { TeacherGradebookOverviewView } from "@/modules/assessment/presentation/teacher-gradebook-overview-view";
import { CreateAssessmentModal } from "@/modules/assessment/presentation/create-assessment-modal";
import {
  DefinisiAsesmenDTO,
  ClassGradebookDTO,
} from "@/modules/assessment/domain/assessment-types";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/kelas-saya/01J000000000000000PENUGAS1",
}));

// Mock Server Actions
vi.mock("@/app/actions/assessment-actions", () => ({
  createAssessmentAction: vi
    .fn()
    .mockResolvedValue({ success: true, message: "Asesmen berhasil dibuat." }),
  deleteAssessmentAction: vi
    .fn()
    .mockResolvedValue({ success: true, message: "Asesmen berhasil dihapus." }),
  getAssessmentGradesAction: vi.fn().mockResolvedValue({
    success: true,
    data: {
      asesmen: { judul: "Formatif TP 1.1", kkm_kktp: 75, kategori: "FORMATIF" },
      grades: [],
    },
  }),
}));

describe("M13 Assessment & Gradebook — Presentation Views (Academic Glass UI)", () => {
  const mockAssessments: DefinisiAsesmenDTO[] = [
    {
      id: "ASESMEN_1",
      sekolah_id: "SCH_1",
      penugasan_mengajar_id: "PENUGAS_1",
      judul: "Formatif TP 1.1 Algoritma",
      kategori: "FORMATIF",
      teknik_penilaian: "TES_TERTULIS",
      bobot: 1,
      skala_maksimal: 100,
      kkm_kktp: 75,
      tanggal_pelaksanaan: "2026-09-04T08:00:00.000Z",
      status: "PUBLISHED",
      is_published: true,
      total_siswa_dinilai: 30,
      total_siswa_rombel: 32,
      rata_rata_nilai: 82.5,
      created_at: "2026-09-04T08:00:00.000Z",
      updated_at: "2026-09-04T08:00:00.000Z",
    },
  ];

  const mockGradebook: ClassGradebookDTO = {
    penugasan_id: "PENUGAS_1",
    sekolah_id: "SCH_1",
    rombel_id: "ROM_1",
    rombel_nama: "X RPL 1",
    mata_pelajaran_id: "MAPEL_1",
    mata_pelajaran_nama: "Dasar-Dasar Kejuruan RPL",
    kkm_default: 75,
    columns: [
      {
        id: "ASESMEN_1",
        judul: "Formatif TP 1.1",
        kategori: "FORMATIF",
        bobot: 1,
        kkm_kktp: 75,
        status: "PUBLISHED",
        is_published: true,
        tanggal_pelaksanaan: "2026-09-04T08:00:00.000Z",
      },
    ],
    rows: [
      {
        siswa_id: "SISWA_1",
        nis: "1001",
        nama_lengkap: "Ahmad Dahlan",
        nomor_absen: 1,
        grades: {
          ASESMEN_1: {
            nilai_angka: 85,
            status: "PUBLISHED",
          },
        },
        rata_rata_formatif: 85,
        rata_rata_sumatif: null,
        nilai_akhir: 85,
        ketercapaian_kktp_persen: 100,
      },
      {
        siswa_id: "SISWA_2",
        nis: "1002",
        nama_lengkap: "Siti Rahma",
        nomor_absen: 2,
        grades: {
          ASESMEN_1: {
            nilai_angka: null, // Missing grade!
            status: "DRAFT",
          },
        },
        rata_rata_formatif: null,
        rata_rata_sumatif: null,
        nilai_akhir: null,
        ketercapaian_kktp_persen: null,
      },
    ],
    statistics: {
      total_siswa: 2,
      total_asesmen: 1,
      total_formatif: 1,
      total_sumatif: 0,
      rata_rata_kelas: 85,
      persentase_tuntas_kktp: 50,
    },
  };

  it("renders ClassAssessmentTabView summary cards and list of assessments", () => {
    render(
      <ClassAssessmentTabView
        penugasanId="PENUGAS_1"
        canManage={true}
        assessments={mockAssessments}
        gradebook={mockGradebook}
        lingkupMateriList={[]}
        onRefresh={vi.fn()}
        onShowToast={vi.fn()}
      />
    );

    // KPI verification
    expect(screen.getByText("Total Asesmen")).toBeInTheDocument();
    expect(screen.getAllByText("Formatif (TP)").length).toBeGreaterThan(0);
    expect(screen.getByText("Formatif TP 1.1 Algoritma")).toBeInTheDocument();
    expect(screen.getByText("Dipublikasikan")).toBeInTheDocument();
    expect(screen.getByText("Input Nilai")).toBeInTheDocument();
  });

  it("switches to Gradebook Matrix tab and displays student rows with Missing Grade as -", () => {
    render(
      <ClassAssessmentTabView
        penugasanId="PENUGAS_1"
        canManage={true}
        assessments={mockAssessments}
        gradebook={mockGradebook}
        lingkupMateriList={[]}
        onRefresh={vi.fn()}
        onShowToast={vi.fn()}
      />
    );

    // Click Gradebook Tab
    const gradebookTabBtn = screen.getByRole("button", {
      name: /Buku Nilai \(Gradebook Matrix\)/i,
    });
    fireEvent.click(gradebookTabBtn);

    // Student Ahmad Dahlan has score 85
    expect(screen.getByText("Ahmad Dahlan")).toBeInTheDocument();
    expect(screen.getAllByText("85").length).toBeGreaterThan(0);

    // Student Siti Rahma has missing grade (-)
    expect(screen.getByText("Siti Rahma")).toBeInTheDocument();
    expect(screen.getByText("Tuntas")).toBeInTheDocument();
  });

  it("renders TeacherGradebookOverviewView for centralized /penilaian route", () => {
    const mockOverview = [
      {
        penugasan_id: "PENUGAS_1",
        rombel_id: "ROM_1",
        rombel_nama: "X RPL 1",
        tingkat_nama: "X",
        mata_pelajaran_id: "MAPEL_1",
        mata_pelajaran_nama: "Dasar-Dasar Kejuruan RPL",
        guru_id: "GURU_1",
        guru_nama: "Ahmad Dahlan",
        tahun_ajaran_nama: "2026/2027",
        total_siswa: 32,
        total_asesmen: 4,
        total_formatif: 3,
        total_sumatif: 1,
        total_published: 3,
        rata_rata_kelas: 84.2,
      },
    ];

    render(<TeacherGradebookOverviewView overviewList={mockOverview} isSuperAdmin={false} />);

    expect(screen.getByText("Buku Nilai & Penilaian TP")).toBeInTheDocument();
    expect(screen.getAllByText("X RPL 1").length).toBeGreaterThan(0);
    expect(screen.getByText("Dasar-Dasar Kejuruan RPL")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Buka Buku Nilai/i })).toHaveAttribute(
      "href",
      "/kelas-saya/PENUGAS_1?tab=PENILAIAN"
    );
  });
});
