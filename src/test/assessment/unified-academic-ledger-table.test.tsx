import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UnifiedAcademicLedgerTable } from "@/modules/assessment/presentation/unified-academic-ledger-table";
import {
  ClassGradebookDTO,
  DefinisiAsesmenDTO,
} from "@/modules/assessment/domain/assessment-types";
import { ClassAttendanceRecapDTO } from "@/modules/attendance/domain/attendance-types";

describe("UnifiedAcademicLedgerTable — Kurikulum Merdeka Academic Ledger View", () => {
  const mockGradebook: ClassGradebookDTO = {
    penugasan_id: "PENUGAS_1",
    sekolah_id: "SCH_1",
    rombel_id: "ROM_1",
    rombel_nama: "XII RPL 1",
    mata_pelajaran_id: "MAPEL_1",
    mata_pelajaran_nama: "Pemrograman Web dan Perangkat Bergerak",
    kkm_default: 75,
    columns: [
      {
        id: "ASM_F1",
        judul: "Formatif TP 1.1",
        kategori: "FORMATIF",
        tp_id: "TP_1_1",
        lingkup_materi_id: "LM_1",
        bobot: 1,
        kkm_kktp: 75,
        status: "PUBLISHED",
        is_published: true,
        tanggal_pelaksanaan: "2026-09-01T08:00:00.000Z",
      },
      {
        id: "ASM_S1",
        judul: "Sumatif LM 1",
        kategori: "SUMATIF",
        lingkup_materi_id: "LM_1",
        bobot: 2,
        kkm_kktp: 75,
        status: "PUBLISHED",
        is_published: true,
        tanggal_pelaksanaan: "2026-09-10T08:00:00.000Z",
      },
    ],
    rows: [
      {
        siswa_id: "SISWA_1",
        nis: "2024001",
        nisn: "0081234567",
        nama_lengkap: "Budi Pratama",
        nomor_absen: 1,
        grades: {
          ASM_F1: { nilai_angka: 88, status: "PUBLISHED" },
          ASM_S1: { nilai_angka: 82, status: "PUBLISHED" },
        },
        rata_rata_formatif: 88,
        rata_rata_sumatif: 82,
        nilai_akhir: 84,
        ketercapaian_kktp_persen: 100,
      },
      {
        siswa_id: "SISWA_2",
        nis: "2024002",
        nisn: "0081234568",
        nama_lengkap: "Citra Lestari",
        nomor_absen: 2,
        grades: {
          ASM_F1: { nilai_angka: null, status: "DRAFT" }, // Missing Grade
          ASM_S1: { nilai_angka: 70, status: "PUBLISHED" },
        },
        rata_rata_formatif: null,
        rata_rata_sumatif: 70,
        nilai_akhir: 70,
        ketercapaian_kktp_persen: 0,
      },
    ],
    statistics: {
      total_siswa: 2,
      total_asesmen: 2,
      total_formatif: 1,
      total_sumatif: 1,
      rata_rata_kelas: 77,
      persentase_tuntas_kktp: 50,
    },
  };

  const mockLingkupMateriList = [
    {
      id: "LM_1",
      judul: "Pengembangan Frontend",
      kode: "Lingkup Materi 1",
      urutan: 1,
      tujuan_pembelajaran: [
        { id: "TP_1_1", kode: "TP 1.1", deskripsi: "Merancang UI Next.js", urutan: 1 },
        { id: "TP_1_2", kode: "TP 1.2", deskripsi: "Menerapkan Tailwind", urutan: 2 },
        { id: "TP_1_3", kode: "TP 1.3", deskripsi: "Integrasi State", urutan: 3 },
      ],
    },
    {
      id: "LM_2",
      judul: "Pengembangan Backend",
      kode: "Lingkup Materi 2",
      urutan: 2,
      tujuan_pembelajaran: [
        { id: "TP_2_1", kode: "TP 2.1", deskripsi: "REST API Prisma", urutan: 1 },
        { id: "TP_2_2", kode: "TP 2.2", deskripsi: "Otentikasi & Keamanan", urutan: 2 },
      ],
    },
  ];

  const mockAssessments: DefinisiAsesmenDTO[] = [
    {
      id: "ASM_F1",
      sekolah_id: "SCH_1",
      penugasan_mengajar_id: "PENUGAS_1",
      judul: "Formatif TP 1.1",
      tp_id: "TP_1_1",
      lingkup_materi_id: "LM_1",
      kategori: "FORMATIF",
      teknik_penilaian: "TES_TERTULIS",
      bobot: 1,
      skala_maksimal: 100,
      kkm_kktp: 75,
      tanggal_pelaksanaan: "2026-09-01T08:00:00.000Z",
      status: "PUBLISHED",
      is_published: true,
      total_siswa_dinilai: 1,
      total_siswa_rombel: 2,
      rata_rata_nilai: 88,
      created_at: "2026-09-01T08:00:00.000Z",
      updated_at: "2026-09-01T08:00:00.000Z",
    },
    {
      id: "ASM_S1",
      sekolah_id: "SCH_1",
      penugasan_mengajar_id: "PENUGAS_1",
      judul: "Sumatif LM 1",
      lingkup_materi_id: "LM_1",
      kategori: "SUMATIF",
      teknik_penilaian: "TES_TERTULIS",
      bobot: 2,
      skala_maksimal: 100,
      kkm_kktp: 75,
      tanggal_pelaksanaan: "2026-09-10T08:00:00.000Z",
      status: "PUBLISHED",
      is_published: true,
      total_siswa_dinilai: 2,
      total_siswa_rombel: 2,
      rata_rata_nilai: 76,
      created_at: "2026-09-10T08:00:00.000Z",
      updated_at: "2026-09-10T08:00:00.000Z",
    },
  ];

  const mockAttendanceRecap: ClassAttendanceRecapDTO = {
    penugasan_id: "PENUGAS_1",
    rombel_id: "ROM_1",
    rombel_nama: "XII RPL 1",
    mata_pelajaran_id: "MAPEL_1",
    mata_pelajaran_nama: "Pemrograman Web dan Perangkat Bergerak",
    mata_pelajaran_kode: "PWPB",
    guru_id: "GURU_1",
    guru_nama: "Guru Pengampu",
    total_siswa: 2,
    total_sesi_terjadwal: 10,
    total_sesi_tercatat: 8,
    rerata_kehadiran_kelas: 95,
    jumlah_perlu_perhatian: 0,
    daftar_siswa: [
      {
        siswa_id: "SISWA_1",
        nomor_absen: 1,
        nisn: "0081234567",
        nis: "2024001",
        nama_lengkap: "Budi Pratama",
        foto_url: null,
        hadir: 8,
        sakit: 0,
        izin: 0,
        alpha: 0,
        dispensasi: 0,
        terlambat: 0,
        total_sesi_tercatat: 8,
        persentase_kehadiran: 100,
        status_evaluasi: "Sangat Baik",
      },
      {
        siswa_id: "SISWA_2",
        nomor_absen: 2,
        nisn: "0081234568",
        nis: "2024002",
        nama_lengkap: "Citra Lestari",
        foto_url: null,
        hadir: 7,
        sakit: 1,
        izin: 0,
        alpha: 0,
        dispensasi: 0,
        terlambat: 0,
        total_sesi_tercatat: 8,
        persentase_kehadiran: 88,
        status_evaluasi: "Baik",
      },
    ],
  };

  it("renders multi-tier headers matching Indonesian Kurikulum Merdeka structure with dynamic TPs", () => {
    render(
      <UnifiedAcademicLedgerTable
        penugasanId="PENUGAS_1"
        canManage={true}
        gradebook={mockGradebook}
        lingkupMateriList={mockLingkupMateriList}
        assessments={mockAssessments}
        attendanceRecap={mockAttendanceRecap}
      />
    );

    // Tier 1 major headers
    expect(screen.getByText("Kehadiran")).toBeInTheDocument();
    expect(screen.getByText("FORMATIF")).toBeInTheDocument();
    expect(screen.getByText("SUMATIF LINGKUP MATERI")).toBeInTheDocument();
    expect(screen.getByText("SUMATIF AKHIR")).toBeInTheDocument();
    expect(screen.getByText("NILAI AKHIR")).toBeInTheDocument();

    // Tier 2 Lingkup Materi headers (Dynamic count of TPs: LM1 has 3 TPs, LM2 has 2 TPs)
    expect(screen.getByText("Lingkup Materi 1")).toBeInTheDocument();
    expect(screen.getByText("Lingkup Materi 2")).toBeInTheDocument();

    // Tier 3 TP codes
    expect(screen.getByText("TP 1.1")).toBeInTheDocument();
    expect(screen.getByText("TP 1.2")).toBeInTheDocument();
    expect(screen.getByText("TP 1.3")).toBeInTheDocument();
    expect(screen.getByText("TP 2.1")).toBeInTheDocument();
    expect(screen.getByText("TP 2.2")).toBeInTheDocument();

    // Sumatif LM columns
    expect(screen.getByText("LM 1")).toBeInTheDocument();
    expect(screen.getByText("LM 2")).toBeInTheDocument();
    expect(screen.getAllByText("SAS").length).toBeGreaterThan(0);
  });

  it("renders integrated attendance counts (H, S, I, A, %) alongside student scores", () => {
    render(
      <UnifiedAcademicLedgerTable
        penugasanId="PENUGAS_1"
        canManage={true}
        gradebook={mockGradebook}
        lingkupMateriList={mockLingkupMateriList}
        assessments={mockAssessments}
        attendanceRecap={mockAttendanceRecap}
      />
    );

    // Student identity
    expect(screen.getByText("Budi Pratama")).toBeInTheDocument();
    expect(screen.getByText("2024001")).toBeInTheDocument();
    expect(screen.getByText("0081234567")).toBeInTheDocument();

    // Student Budi has 8 Hadir and 100%
    expect(screen.getAllByText("8").length).toBeGreaterThan(0);
    expect(screen.getByText("100%")).toBeInTheDocument();

    // Score verification
    expect(screen.getAllByText("88").length).toBeGreaterThan(0);
    expect(screen.getAllByText("84").length).toBeGreaterThan(0);
    expect(screen.getByText("TUNTAS")).toBeInTheDocument();
  });

  it("strictly enforces Missing Grade ≠ Zero Grade displaying '-' for unassessed entries", () => {
    render(
      <UnifiedAcademicLedgerTable
        penugasanId="PENUGAS_1"
        canManage={true}
        gradebook={mockGradebook}
        lingkupMateriList={mockLingkupMateriList}
        assessments={mockAssessments}
        attendanceRecap={mockAttendanceRecap}
      />
    );

    // Student Citra Lestari has no score on TP 1.1 -> should display '-' instead of '0'
    expect(screen.getByText("Citra Lestari")).toBeInTheDocument();
    const dashCells = screen.getAllByText("-");
    expect(dashCells.length).toBeGreaterThan(0);
  });

  it("triggers CSV export download with full multi-column academic data", () => {
    // Mock Blob and URL
    const createObjectURLMock = vi.fn().mockReturnValue("blob:mock-url");
    const revokeObjectURLMock = vi.fn();
    window.URL.createObjectURL = createObjectURLMock;
    window.URL.revokeObjectURL = revokeObjectURLMock;

    render(
      <UnifiedAcademicLedgerTable
        penugasanId="PENUGAS_1"
        canManage={true}
        gradebook={mockGradebook}
        lingkupMateriList={mockLingkupMateriList}
        assessments={mockAssessments}
        attendanceRecap={mockAttendanceRecap}
      />
    );

    const exportCsvBtn = screen.getByRole("button", { name: /Ekspor CSV/i });
    fireEvent.click(exportCsvBtn);

    expect(createObjectURLMock).toHaveBeenCalled();
  });

  it("triggers window.print when Cetak Leger is clicked", () => {
    const printMock = vi.fn();
    window.print = printMock;

    render(
      <UnifiedAcademicLedgerTable
        penugasanId="PENUGAS_1"
        canManage={true}
        gradebook={mockGradebook}
        lingkupMateriList={mockLingkupMateriList}
        assessments={mockAssessments}
        attendanceRecap={mockAttendanceRecap}
      />
    );

    const printBtn = screen.getByRole("button", { name: /Cetak Leger/i });
    fireEvent.click(printBtn);

    expect(printMock).toHaveBeenCalled();
  });
});
