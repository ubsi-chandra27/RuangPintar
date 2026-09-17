import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { HeadmasterView } from "@/modules/reporting/presentation/headmaster-view";
import { CurriculumAnalyticsView } from "@/modules/reporting/presentation/curriculum-analytics-view";
import { StudentAffairsView } from "@/modules/reporting/presentation/student-affairs-view";
import { ProgramHeadView } from "@/modules/reporting/presentation/program-head-view";
import { ReportExportCenter } from "@/modules/reporting/presentation/report-export-center";
import { ExecutivePrintModal } from "@/modules/reporting/presentation/executive-print-modal";
import {
  HeadmasterOverviewDTO,
  CurriculumOverviewDTO,
  StudentAffairsOverviewDTO,
  ProgramHeadOverviewDTO,
  RiwayatEksporItemDTO,
  ExecutiveReportData,
} from "@/modules/reporting/domain/reporting-types";

// Mock Server Actions
vi.mock("@/app/actions/leadership-actions", () => ({
  exportAttendanceCsvAction: vi.fn().mockResolvedValue({
    success: true,
    data: { filename: "test.csv", csvContent: "header\nrow", totalRows: 10 },
  }),
  exportAcademicCsvAction: vi.fn().mockResolvedValue({
    success: true,
    data: { filename: "test_academic.csv", csvContent: "header\nrow", totalRows: 5 },
  }),
}));

describe("Phase 19: Leadership Presentation Views (Academic Glass UI)", () => {
  const mockHeadmasterData: HeadmasterOverviewDTO = {
    ringkasan_sekolah: {
      total_siswa: 1245,
      total_guru: 82,
      total_rombel: 36,
      rasio_guru_siswa: "1 : 15",
      status_kbm_aktif: 12,
    },
    kpi_kehadiran: {
      tingkat_hadir_persen: 96,
      tingkat_izin_persen: 2,
      tingkat_sakit_persen: 1,
      tingkat_alpha_persen: 1,
      total_sesi_terekam: 450,
    },
    kpi_akademik: {
      rerata_nilai_sekolah: 83.4,
      persentase_tuntas_kktp: 91,
      total_asesmen_terbit: 48,
      total_tugas_terbit: 120,
    },
    perhatian_kepemimpinan: [
      {
        id: "alert-1",
        tipe: "ABSENSI",
        judul: "3 Siswa Mengalami Ketidakhadiran Berulang",
        deskripsi: "Perlu bimbingan wali kelas",
        tingkat_urgensi: "KRITIS",
      },
    ],
    distribusi_tingkat: [
      {
        tingkat: "Kelas X",
        total_siswa: 420,
        total_rombel: 12,
        rerata_kehadiran: 95,
        rerata_nilai: 82.5,
      },
    ],
    tren_kehadiran_mingguan: [
      { hari: "Senin", persentase_hadir: 97, total_hadir: 1200, total_alpha: 10 },
      { hari: "Selasa", persentase_hadir: 96, total_hadir: 1195, total_alpha: 12 },
    ],
  };

  it("renders HeadmasterView with strategic KPIs and triggers print modal callback", () => {
    const onOpenPrint = vi.fn();
    const onSwitchTab = vi.fn();

    render(
      <HeadmasterView
        data={mockHeadmasterData}
        onOpenPrintModal={onOpenPrint}
        onSwitchTab={onSwitchTab}
      />
    );

    expect(screen.getByText("Executive Overview & Analitik Mutu Sekolah")).toBeInTheDocument();
    expect(screen.getByText("Total Siswa Aktif")).toBeInTheDocument();
    expect(screen.getByText("Kehadiran Global Sekolah")).toBeInTheDocument();
    expect(screen.getByText("3 Siswa Mengalami Ketidakhadiran Berulang")).toBeInTheDocument();

    const printButton = screen.getByRole("button", { name: /Cetak Ringkasan A4/i });
    fireEvent.click(printButton);
    expect(onOpenPrint).toHaveBeenCalledTimes(1);
  });

  it("renders CurriculumAnalyticsView with subjects and teacher workload", () => {
    const mockCurriculumData: CurriculumOverviewDTO = {
      kpi_kurikulum: {
        total_mata_pelajaran: 16,
        total_guru_mengajar: 42,
        total_materi_publikasi: 64,
        total_tugas_aktif: 28,
        total_asesmen: 32,
        persentase_kelulusan_kktp: 88,
      },
      kepatuhan_administrasi: {
        guru_patuh_count: 38,
        guru_total_count: 42,
        persentase_kepatuhan: 90,
        dokumen_terunggah: 120,
      },
      capaian_per_mapel: [
        {
          mapel_id: "m-1",
          nama_mapel: "Matematika Kejuruan",
          kode_mapel: "MAT-01",
          kelompok: "Umum",
          guru_pengampu_count: 4,
          rerata_nilai: 81.2,
          persentase_tuntas: 89,
        },
      ],
      beban_mengajar_guru: [
        {
          guru_id: "g-1",
          nama_guru: "Ahmad Dahlan, S.Pd.",
          nip: "198001012005011001",
          total_jam_minggu: 24,
          total_rombel: 4,
          total_mapel: 1,
          status_beban: "OPTIMAL",
        },
      ],
    };

    render(<CurriculumAnalyticsView data={mockCurriculumData} onSwitchTab={vi.fn()} />);

    expect(screen.getByText("Mata Pelajaran Aktif")).toBeInTheDocument();
    expect(screen.getByText("Kepatuhan Administrasi Guru")).toBeInTheDocument();
    expect(screen.getByText("Matematika Kejuruan")).toBeInTheDocument();
    expect(screen.getByText("Ahmad Dahlan, S.Pd.")).toBeInTheDocument();
    expect(screen.getByText("Optimal (24 JP)")).toBeInTheDocument();
  });

  it("renders StudentAffairsView with attendance matrix and attention center", () => {
    const mockStudentAffairsData: StudentAffairsOverviewDTO = {
      kpi_kesiswaan: {
        total_siswa: 1245,
        persentase_kehadiran_global: 95,
        total_siswa_kritis_alpha: 2,
        total_catatan_pembinaan: 15,
        total_tindak_lanjut_aktif: 4,
      },
      rekap_kehadiran_per_rombel: [
        {
          rombel_id: "r-1",
          nama_rombel: "X TO 3",
          tingkat: "Kelas X",
          total_siswa: 36,
          hadir_pct: 94,
          sakit_pct: 3,
          izin_pct: 2,
          alpha_pct: 1,
        },
      ],
      daftar_siswa_atensi: [
        {
          siswa_id: "s-1",
          nama_siswa: "Budi Pratama",
          nisn: "0051234567",
          rombel_nama: "X TO 3",
          jumlah_alpha: 4,
          jumlah_terlambat: 3,
          status_urgensi: "KRITIS",
        },
      ],
      distribusi_kasus_pembinaan: [{ kategori: "KEHADIRAN", jumlah: 8 }],
    };

    render(<StudentAffairsView data={mockStudentAffairsData} onSwitchTab={vi.fn()} />);

    expect(screen.getByText("Tingkat Presensi Global")).toBeInTheDocument();
    expect(screen.getAllByText("X TO 3")[0]).toBeInTheDocument();
    expect(screen.getByText("Budi Pratama")).toBeInTheDocument();
    expect(screen.getByText("KRITIS")).toBeInTheDocument();
  });

  it("renders ProgramHeadView with department cohort and vocational subjects", () => {
    const mockProgramHeadData: ProgramHeadOverviewDTO = {
      program_info: {
        id: "p-1",
        nama: "Teknik Otomotif",
        kode: "TO",
      },
      kpi_program: {
        total_siswa: 216,
        total_rombel: 6,
        rerata_kehadiran: 94,
        rerata_nilai_kejuruan: 84.5,
      },
      rombel_list: [
        {
          rombel_id: "r-to1",
          nama_rombel: "X TO 1",
          tingkat: "Kelas X",
          wali_kelas_nama: "Marhanih",
          total_siswa: 36,
          rerata_kehadiran: 95,
        },
      ],
      mapel_kejuruan_list: [
        {
          mapel_id: "mk-1",
          nama_mapel: "Pemeliharaan Mesin Kendaraan Ringan",
          kode_mapel: "PMKR",
          guru_pengampu: "Ir. Hendra Wijaya, S.T.",
          rerata_nilai: 85.0,
          persentase_tuntas: 92,
        },
      ],
    };

    render(<ProgramHeadView data={mockProgramHeadData} onSwitchTab={vi.fn()} />);

    expect(screen.getByText("Program Keahlian: Teknik Otomotif")).toBeInTheDocument();
    expect(screen.getByText("X TO 1")).toBeInTheDocument();
    expect(screen.getByText("Pemeliharaan Mesin Kendaraan Ringan")).toBeInTheDocument();
  });

  it("renders ReportExportCenter and displays export history", () => {
    const mockHistory: RiwayatEksporItemDTO[] = [
      {
        id: "exp-1",
        tipe_laporan: "PRESENSI",
        judul: "Rekapitulasi Kehadiran Siswa",
        format: "CSV",
        total_baris: 36,
        dibuat_oleh_nama: "Super Admin Test",
        berkas_url: null,
        created_at: new Date().toISOString(),
      },
    ];

    render(
      <ReportExportCenter
        history={mockHistory}
        onOpenPrintModal={vi.fn()}
        onRefreshHistory={vi.fn()}
      />
    );

    expect(screen.getByText("Pusat Unduh Dokumen & Rekapitulasi Laporan")).toBeInTheDocument();
    expect(screen.getByText("Rekapitulasi Kehadiran Siswa")).toBeInTheDocument();
    expect(screen.getByText("Rekap Capaian Nilai & KKTP")).toBeInTheDocument();
    expect(screen.getByText("Lembar Ringkasan Eksekutif")).toBeInTheDocument();
    expect(screen.getByText("36 baris")).toBeInTheDocument();
  });

  it("renders ExecutivePrintModal with official school letterhead and print button", () => {
    const mockPrintData: ExecutiveReportData = {
      sekolah: {
        nama: "SMK OTOMINDO JAKARTA",
        npsn: "20109988",
        alamat: "Jl. Pendidikan Cerdas No. 128",
        telepon: "(021) 7890123",
        email: "info@smkotomindo.sch.id",
        kepala_sekolah_nama: "Drs. H. Mulyono, M.Pd.",
      },
      periode: {
        tahun_ajaran: "2026/2027",
        semester: "Semester Ganjil",
        tanggal_cetak: "Jumat, 11 September 2026",
      },
      ringkasan: {
        total_siswa: 1245,
        total_guru: 82,
        total_rombel: 36,
        tingkat_kehadiran_global: 96,
        persentase_tuntas_kktp: 91,
        siswa_kritis_alpha: 2,
      },
      distribusi_tingkat: [
        {
          tingkat: "Kelas X",
          total_siswa: 420,
          total_rombel: 12,
          rerata_kehadiran: 95,
          rerata_nilai: 82.5,
        },
      ],
      perhatian_strategis: [
        {
          judul: "Ketidakhadiran Berulang",
          deskripsi: "Perlu pemanggilan wali murid",
          tingkat_urgensi: "KRITIS",
        },
      ],
    };

    const onClose = vi.fn();
    render(<ExecutivePrintModal isOpen={true} onClose={onClose} reportData={mockPrintData} />);

    expect(screen.getByText("Pratinjau Lembar Ringkasan Eksekutif")).toBeInTheDocument();
    expect(screen.getByText("SMK OTOMINDO JAKARTA")).toBeInTheDocument();
    expect(screen.getByText("Drs. H. Mulyono, M.Pd.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cetak Sekarang/i })).toBeInTheDocument();
  });
});
