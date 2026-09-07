/**
 * Ruang Pintar — Student Experience Presentation Views Test Suite (Phase 15 / M15)
 *
 * Menguji rendering komponen tampilan Academic Glass UI v1.2:
 * - StudentDashboard (Dashboard Siswa Terpadu)
 * - StudentLearningView (Tugas & Materi)
 * - SubmitAssignmentModal (Modal Pengumpulan Tugas)
 * - StudentReportCardView (Buku Nilai & e-Rapor)
 * - ReportCardPrintModal (Lembar Cetak Rapor Resmi A4)
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StudentDashboard } from "@/shared/components/dashboard/role-views/student-dashboard";
import { StudentLearningView } from "@/modules/student/presentation/student-learning-view";
import { SubmitAssignmentModal } from "@/modules/student/presentation/submit-assignment-modal";
import { StudentReportCardView } from "@/modules/student/presentation/student-report-card-view";
import { ReportCardPrintModal } from "@/modules/student/presentation/report-card-print-modal";
import {
  StudentDashboardData,
  StudentProfileContext,
  StudentAssignmentItem,
  StudentMaterialItem,
  StudentAttendanceSummary,
  StudentReportCardCompilation,
  StudentPublishedGradeItem,
} from "@/modules/student/domain/student-experience-types";

// Mock user
const mockUser = {
  id: "01JASTUD0000000000000000001",
  username: "siswa",
  email: "rian@sekolah.id",
  nama_lengkap: "Rian Pratama",
  peran_dasar: "STUDENT" as const,
  status_akun: "AKTIF" as const,
  harus_ganti_password: false,
  sekolah_id: "01JA0000000000000000000001",
};

// Mock profile
const mockProfile: StudentProfileContext = {
  siswaId: "01M18QCSXR59TR1FXG03V6YT91",
  namaLengkap: "Rian Pratama",
  nis: "20261001",
  nisn: "0081234501",
  fotoUrl: null,
  statusAkademik: "AKTIF",
  tahunAjaranId: "01M18FWDEHE6QRXKWP4H2ASHXY",
  tahunAjaranNama: "2026/2027",
  semesterId: "01M18FWE8P5ZY5C3CMBR5C0YZF",
  semesterNama: "Semester Ganjil",
  rombelId: "01M19MV91XH1TVZE0RJVPKDJN2",
  rombelNama: "X RPL",
  tingkatNama: "Kelas 10",
  waliKelasNama: "Parlindungan Siadari, S.Kom",
  nomorAbsen: 1,
};

// Mock dashboard data
const mockDashboardData: StudentDashboardData = {
  profile: mockProfile,
  statCards: {
    rombelNama: "X RPL",
    waliKelasNama: "Parlindungan Siadari, S.Kom",
    persentaseKehadiran: 100,
    totalHadir: 10,
    totalAlpha: 0,
    tugasPerluDikerjakan: 2,
    totalTugasAktif: 2,
    nilaiRataRata: 88.5,
    cbtAktifCount: 1,
  },
  jadwalHariIni: [
    {
      id: "j1",
      mataPelajaranNama: "Dasar Rekayasa Perangkat Lunak",
      mataPelajaranKode: "RPL-01",
      guruNama: "Parlindungan Siadari, S.Kom",
      jamMulai: "07:00",
      jamSelesai: "08:30",
      urutan: 1,
      ruangan: "Lab RPL 1",
      status: "AKTIF",
      penugasanMengajarId: "p1",
    },
  ],
  tugasMendatang: [
    {
      id: "pub_tug_1",
      tugasId: "tug_1",
      judul: "Tugas 1: Analisis Kebutuhan Sistem",
      petunjuk: "Buatlah analisis ringkas kebutuhan pengguna sistem parkir.",
      tipePenyerahan: "TEKS",
      batasWaktu: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      batasWaktuFormatted: "10 Sep 2026, 23:59",
      izinkanTerlambat: true,
      statusPublikasi: "DITERBITKAN",
      mataPelajaranNama: "Dasar Rekayasa Perangkat Lunak",
      guruNama: "Parlindungan Siadari, S.Kom",
      penugasanMengajarId: "p1",
      lampiranBerkas: null,
      pengumpulan: null,
      isPastDeadline: false,
      statusPengerjaan: "BELUM_DIKUMPULKAN",
    },
  ],
  cbtMendatang: [
    {
      ujianId: "cbt_1",
      judul: "PTS Dasar Rekayasa Perangkat Lunak",
      deskripsi: "Ujian CBT materi BAB 1 s/d 3",
      mataPelajaranNama: "Dasar Rekayasa Perangkat Lunak",
      guruNama: "Parlindungan Siadari, S.Kom",
      durasiMenit: 60,
      waktuMulai: new Date(),
      waktuSelesai: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      gunakanToken: false,
      kkmKktp: 75,
      statusUjian: "DITERBITKAN",
      attempt: null,
      isAvailable: true,
      actionLabel: "Mulai Ujian Online",
    },
  ],
  nilaiTerbaru: [
    {
      asesmenId: "asesmen_1",
      judulAsesmen: "Formatif 1 — Dasar RPL",
      kategori: "FORMATIF",
      teknik: "TES_TERTULIS",
      mataPelajaranNama: "Dasar Rekayasa Perangkat Lunak",
      guruNama: "Parlindungan Siadari, S.Kom",
      tpKode: "TP 1.1",
      tpDeskripsi: "Memahami fase SDLC",
      babJudul: "BAB 1",
      kkmKktp: 75,
      nilaiAngka: 90,
      nilaiHuruf: "A",
      capaianKompetensi: "Tercapai optimal dalam memahami fase SDLC",
      isTuntas: true,
      tanggalPelaksanaan: new Date(),
      tanggalPelaksanaanFormatted: "5 Sep 2026",
    },
  ],
};

// Mock assignments & materials
const mockAssignments: StudentAssignmentItem[] = mockDashboardData.tugasMendatang;
const mockMaterials: StudentMaterialItem[] = [
  {
    id: "pub_mat_1",
    materiId: "mat_1",
    judul: "Modul 1: Siklus Hidup Perangkat Lunak",
    deskripsi: "Panduan tahapan SDLC waterfall dan agile.",
    tipeKonten: "TEKS",
    kontenTeks: "Isi teks materi pembelajaran SDLC.",
    tautanUrl: null,
    berkas: null,
    tanggalPublikasi: new Date(),
    tanggalPublikasiFormatted: "5 Sep 2026",
    mataPelajaranNama: "Dasar Rekayasa Perangkat Lunak",
    guruNama: "Parlindungan Siadari, S.Kom",
    babJudul: "BAB 1",
    penugasanMengajarId: "p1",
  },
];

const mockAttendance: StudentAttendanceSummary = {
  totalSesi: 10,
  hadir: 10,
  izin: 0,
  sakit: 0,
  alpha: 0,
  dispensasi: 0,
  terlambat: 0,
  persentaseKehadiran: 100,
  riwayatPresensi: [
    {
      id: "pres_1",
      tanggal: new Date(),
      tanggalFormatted: "7 Sep 2026",
      mataPelajaranNama: "Dasar Rekayasa Perangkat Lunak",
      guruNama: "Parlindungan Siadari, S.Kom",
      status: "HADIR",
      catatan: null,
      ruangan: "Lab RPL 1",
    },
  ],
};

// Mock report card compilation
const mockReportCard: StudentReportCardCompilation = {
  siswa: mockProfile,
  sekolahNama: "SMK OTOMINDO",
  sekolahAlamat: "Jl. Raya Otomindo No. 10, Jakarta",
  sekolahNpsn: "20101234",
  sekolahLogo: null,
  kepalaSekolahNama: "Drs. H. Mulyadi, M.Pd.",
  kepalaSekolahNip: "197204151998021001",
  tahunAjaran: "2026/2027",
  semester: "Semester Ganjil",
  mataPelajaranList: [
    {
      mataPelajaranId: "mapel_1",
      mataPelajaranNama: "Dasar Rekayasa Perangkat Lunak",
      guruNama: "Parlindungan Siadari, S.Kom",
      kkmKktp: 75,
      rerataFormatif: 90,
      rerataSumatif: 92,
      nilaiAkhir: 91,
      predikat: "A",
      isTuntas: true,
      deskripsiCapaianTertinggi: "Menunjukkan pemahaman sangat optimal dalam materi SDLC.",
      deskripsiPerluPeningkatan: "Perlu mempertahankan konsistensi belajar.",
      totalAsesmen: 2,
    },
  ],
  rerataKeseluruhan: 91,
  presensi: {
    sakit: 0,
    izin: 0,
    tanpaKeterangan: 0,
  },
  catatanWaliKelas: "Prestasi ananda sangat memuaskan, pertahankan!",
  tanggalCetak: "7 September 2026",
};

describe("Student Experience Presentation Views (Academic Glass UI v1.2)", () => {
  it("merender StudentDashboard dengan data live profil dan kartu KPI", async () => {
    const Component = await StudentDashboard({
      user: mockUser,
      initialData: mockDashboardData,
    });

    render(Component);

    expect(screen.getByText(/Halo, Rian Pratama!/i)).toBeDefined();
    expect(screen.getByText("Siswa Aktif")).toBeDefined();
    expect(screen.getByText("X RPL • Semester Ganjil")).toBeDefined();

    // Stat cards
    expect(screen.getByText("100%")).toBeDefined();
    expect(screen.getByText("88.5")).toBeDefined();

    // Jadwal hari ini
    expect(screen.getAllByText("Dasar Rekayasa Perangkat Lunak").length).toBeGreaterThan(0);
    expect(screen.getByText("07:00")).toBeDefined();

    // CBT section
    expect(screen.getByText("PTS Dasar Rekayasa Perangkat Lunak")).toBeDefined();
    expect(screen.getByText("Mulai Ujian Online →")).toBeDefined();
  });

  it("merender StudentLearningView dan beralih antar Tab Tugas, Materi, dan Presensi", () => {
    render(
      <StudentLearningView
        profile={mockProfile}
        materials={mockMaterials}
        assignments={mockAssignments}
        attendance={mockAttendance}
      />
    );

    // Tab default tugas
    expect(screen.getByText(/Tugas Kelas \(1\)/i)).toBeDefined();
    expect(screen.getByText("Tugas 1: Analisis Kebutuhan Sistem")).toBeDefined();

    // Switch to Materi
    const materiTab = screen.getByRole("tab", { name: /Materi Pelajaran/i });
    fireEvent.click(materiTab);
    expect(screen.getByText("Modul 1: Siklus Hidup Perangkat Lunak")).toBeDefined();

    // Switch to Presensi
    const presensiTab = screen.getByRole("tab", { name: /Presensi Kelas/i });
    fireEvent.click(presensiTab);
    expect(screen.getByText("Riwayat Presensi Sesi Kelas Pembelajaran")).toBeDefined();
  });

  it("merender SubmitAssignmentModal dengan form input jawaban dan tombol pengumpulan", () => {
    const handleClose = vi.fn();

    render(
      <SubmitAssignmentModal assignment={mockAssignments[0]} isOpen={true} onClose={handleClose} />
    );

    expect(screen.getByText("Tugas 1: Analisis Kebutuhan Sistem")).toBeDefined();
    expect(
      screen.getByPlaceholderText(/Tuliskan jawaban, penjelasan, atau ringkasan tugas/i)
    ).toBeDefined();
    expect(screen.getByText("Kumpulkan Tugas Sekarang")).toBeDefined();
  });

  it("merender StudentReportCardView dan membuka modal pratinjau cetak rapor", () => {
    render(
      <StudentReportCardView reportCard={mockReportCard} grades={mockDashboardData.nilaiTerbaru} />
    );

    expect(screen.getByText("Buku Nilai & e-Rapor Siswa")).toBeDefined();
    expect(screen.getByText("Kompilasi e-Rapor Semester")).toBeDefined();
    expect(screen.getByText("Tabel Hasil Pembelajaran Mata Pelajaran")).toBeDefined();

    // Buka modal cetak
    const printBtn = screen.getByRole("button", { name: /Cetak Lembar Rapor Resmi/i });
    fireEvent.click(printBtn);

    expect(screen.getByText("Pratinjau Lembar Rapor Resmi Siswa")).toBeDefined();
    expect(
      screen.getByText("LAPORAN HASIL BELAJAR PESERTA DIDIK (RAPOR KURIKULUM MERDEKA)")
    ).toBeDefined();
  });

  it("merender ReportCardPrintModal dengan format lengkap resmi Kurikulum Merdeka", () => {
    const handleClose = vi.fn();

    render(
      <ReportCardPrintModal reportCard={mockReportCard} isOpen={true} onClose={handleClose} />
    );

    expect(screen.getByText("SMK OTOMINDO")).toBeDefined();
    expect(screen.getByText(/Nama Peserta Didik/i)).toBeDefined();
    expect(screen.getByText(": Rian Pratama")).toBeDefined();
    expect(screen.getByText("Drs. H. Mulyadi, M.Pd.")).toBeDefined();
    expect(screen.getByText(/Prestasi ananda sangat memuaskan/i)).toBeDefined();
  });
});
