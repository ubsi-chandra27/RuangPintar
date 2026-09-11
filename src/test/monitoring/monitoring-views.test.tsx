import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { HomeroomDashboardView } from "@/modules/monitoring/presentation/homeroom-dashboard-view";
import { StudentMonitoringDetailModal } from "@/modules/monitoring/presentation/student-monitoring-detail-modal";
import { CreateMonitoringNoteModal } from "@/modules/monitoring/presentation/create-monitoring-note-modal";
import { CreateFollowUpModal } from "@/modules/monitoring/presentation/create-follow-up-modal";
import {
  HomeroomOverviewDTO,
  StudentMonitoringDetailDTO,
} from "@/modules/monitoring/domain/monitoring-types";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/wali-kelas",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Server Actions
vi.mock("@/app/actions/monitoring-actions", () => ({
  getStudentMonitoringDetailAction: vi.fn().mockResolvedValue({
    success: true,
    data: {
      siswa: {
        id: "SISWA_01",
        nis: "1001",
        nisn: "0012345678",
        nama_lengkap: "Aditya Pratama",
        jenis_kelamin: "L",
        foto_url: null,
        status_akademik: "AKTIF",
        nama_wali: "Bambang Pratama",
        telepon_wali: "081234567890",
      },
      rombel: {
        id: "ROM_01",
        nama: "X TO 3",
      },
      status_perhatian: "KRITIS",
      rekomendasi_perhatian: [
        "Alpha tinggi (4 sesi tanpa keterangan)",
        "3 tugas belum dikumpulkan",
      ],
      presensi: {
        total_sesi: 20,
        hadir: 14,
        izin: 1,
        sakit: 1,
        alpha: 4,
        dispensasi: 0,
        terlambat: 2,
        persentase_kehadiran: 70,
      },
      presensi_breakdown: [
        {
          sesi_id: "SESI_01",
          tanggal: new Date("2026-09-10"),
          mata_pelajaran: "Teknik Otomotif Dasar",
          guru_nama: "Marhanih, S.Pd",
          status: "ALPHA",
          catatan: "Tidak hadir tanpa surat",
        },
      ],
      tugas: {
        total_tugas: 5,
        dikumpulkan: 2,
        tepat_waktu: 2,
        terlambat: 0,
        belum_mengumpulkan: 3,
        persentase_tuntas: 40,
      },
      tugas_breakdown: [
        {
          tugas_id: "TUGAS_01",
          judul: "Laporan Perawatan Rem",
          mata_pelajaran: "Pemeliharaan Mesin Otomotif",
          batas_waktu: new Date("2026-09-08"),
          status_pengumpulan: "BELUM",
          dikumpulkan_pada: null,
          nilai: null,
        },
      ],
      nilai: {
        total_asesmen: 4,
        dinilai: 3,
        rerata_nilai: 68.5,
        jumlah_tuntas_kktp: 1,
        jumlah_belum_tuntas: 2,
        persentase_kktp: 33,
      },
      nilai_breakdown: [
        {
          asesmen_id: "ASES_01",
          judul: "Formatif TP 1.1: Prinsip Kelistrikan",
          mata_pelajaran: "Kelistrikan Otomotif",
          kategori: "FORMATIF",
          kktp: 75,
          nilai_angka: 60,
          apakah_tuntas: false,
          catatan: "Perlu remidial",
        },
      ],
      catatan_list: [
        {
          id: "NOTE_01",
          sekolah_id: "SCH_01",
          rombel_id: "ROM_01",
          siswa_id: "SISWA_01",
          siswa_nama: "Aditya Pratama",
          siswa_nis: "1001",
          penulis_id: "USER_01",
          penulis_nama: "Marhanih, S.Pd",
          penulis_peran: "TEACHER",
          judul: "Peringatan Alpha Berulang",
          isi: "Siswa sudah tidak masuk 4 kali.",
          kategori: "KEHADIRAN",
          tingkat_urgensi: "TINGGI",
          status: "AKTIF",
          created_at: new Date("2026-09-09"),
          updated_at: new Date("2026-09-09"),
          tindak_lanjut: [
            {
              id: "TL_01",
              catatan_id: "NOTE_01",
              penanggung_jawab_id: "USER_01",
              penanggung_jawab_nama: "Marhanih, S.Pd",
              tindakan: "Panggilan wali murid",
              target_tanggal: new Date("2026-09-12"),
              status: "DIRENCANAKAN",
              hasil: null,
              tanggal_penyelesaian: null,
              created_at: new Date("2026-09-09"),
              updated_at: new Date("2026-09-09"),
            },
          ],
        },
      ],
    },
  }),
  createMonitoringNoteAction: vi.fn().mockResolvedValue({
    success: true,
    message: "Catatan berhasil disimpan.",
  }),
  updateMonitoringNoteAction: vi.fn().mockResolvedValue({
    success: true,
    message: "Catatan berhasil diperbarui.",
  }),
  createFollowUpAction: vi.fn().mockResolvedValue({
    success: true,
    message: "Tindak lanjut berhasil ditambahkan.",
  }),
  updateFollowUpStatusAction: vi.fn().mockResolvedValue({
    success: true,
    message: "Status tindak lanjut berhasil diperbarui.",
  }),
}));

describe("M18 Student Monitoring — Presentation Views (Academic Glass UI)", () => {
  const mockOverviewData: HomeroomOverviewDTO = {
    rombel_id: "ROM_01",
    rombel_nama: "X TO 3",
    rombel_kapasitas: 36,
    wali_kelas_id: "GURU_01",
    wali_kelas_nama: "Marhanih, S.Pd",
    tahun_ajaran_id: "TA_01",
    tahun_ajaran_nama: "2026/2027",
    semester_id: "SEM_01",
    semester_nama: "Ganjil",
    total_siswa: 2,
    rerata_kehadiran_rombel: 85,
    jumlah_kritis: 1,
    jumlah_perhatian: 0,
    jumlah_normal: 1,
    jumlah_berprestasi: 0,
    daftar_perhatian_cepat: [
      {
        siswa_id: "SISWA_01",
        nis: "1001",
        nisn: "0012345678",
        nama_lengkap: "Aditya Pratama",
        jenis_kelamin: "L",
        foto_url: null,
        status_akademik: "AKTIF",
        status_perhatian: "KRITIS",
        rekomendasi_perhatian: ["Alpha tinggi (4 sesi)", "3 tugas belum terkumpul"],
        jumlah_catatan_aktif: 1,
        presensi: {
          total_sesi: 20,
          hadir: 14,
          izin: 1,
          sakit: 1,
          alpha: 4,
          dispensasi: 0,
          terlambat: 2,
          persentase_kehadiran: 70,
        },
        tugas: {
          total_tugas: 5,
          dikumpulkan: 2,
          tepat_waktu: 2,
          terlambat: 0,
          belum_mengumpulkan: 3,
          persentase_tuntas: 40,
        },
        nilai: {
          total_asesmen: 4,
          dinilai: 3,
          rerata_nilai: 68.5,
          jumlah_tuntas_kktp: 1,
          jumlah_belum_tuntas: 2,
          persentase_kktp: 33,
        },
        catatan_terbaru: null,
      },
    ],
    siswa_list: [
      {
        siswa_id: "SISWA_01",
        nis: "1001",
        nisn: "0012345678",
        nama_lengkap: "Aditya Pratama",
        jenis_kelamin: "L",
        foto_url: null,
        status_akademik: "AKTIF",
        status_perhatian: "KRITIS",
        rekomendasi_perhatian: ["Alpha tinggi (4 sesi)", "3 tugas belum terkumpul"],
        jumlah_catatan_aktif: 1,
        presensi: {
          total_sesi: 20,
          hadir: 14,
          izin: 1,
          sakit: 1,
          alpha: 4,
          dispensasi: 0,
          terlambat: 2,
          persentase_kehadiran: 70,
        },
        tugas: {
          total_tugas: 5,
          dikumpulkan: 2,
          tepat_waktu: 2,
          terlambat: 0,
          belum_mengumpulkan: 3,
          persentase_tuntas: 40,
        },
        nilai: {
          total_asesmen: 4,
          dinilai: 3,
          rerata_nilai: 68.5,
          jumlah_tuntas_kktp: 1,
          jumlah_belum_tuntas: 2,
          persentase_kktp: 33,
        },
        catatan_terbaru: null,
      },
      {
        siswa_id: "SISWA_02",
        nis: "1002",
        nisn: "0012345679",
        nama_lengkap: "Bagas Setiawan",
        jenis_kelamin: "L",
        foto_url: null,
        status_akademik: "AKTIF",
        status_perhatian: "NORMAL",
        rekomendasi_perhatian: [],
        jumlah_catatan_aktif: 0,
        presensi: {
          total_sesi: 20,
          hadir: 20,
          izin: 0,
          sakit: 0,
          alpha: 0,
          dispensasi: 0,
          terlambat: 0,
          persentase_kehadiran: 100,
        },
        tugas: {
          total_tugas: 5,
          dikumpulkan: 5,
          tepat_waktu: 5,
          terlambat: 0,
          belum_mengumpulkan: 0,
          persentase_tuntas: 100,
        },
        nilai: {
          total_asesmen: 4,
          dinilai: 4,
          rerata_nilai: 88,
          jumlah_tuntas_kktp: 4,
          jumlah_belum_tuntas: 0,
          persentase_kktp: 100,
        },
        catatan_terbaru: null,
      },
    ],
    catatan_list: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. HomeroomDashboardView — Academic Glass UI Header & KPI Cards", () => {
    it("menampilkan nama rombel, wali kelas, tahun ajaran, dan semester", () => {
      render(
        <HomeroomDashboardView
          initialData={mockOverviewData}
          activeRombelsList={[]}
          isSuperAdmin={false}
        />
      );

      expect(screen.getByText("Wali Kelas:")).toBeInTheDocument();
      expect(screen.getByText("X TO 3")).toBeInTheDocument();
      expect(screen.getByText("Marhanih, S.Pd")).toBeInTheDocument();
      expect(screen.getByText(/2026\/2027/i)).toBeInTheDocument();
    });

    it("merender 4 KPI stat cards dengan angka akurat", () => {
      render(
        <HomeroomDashboardView
          initialData={mockOverviewData}
          activeRombelsList={[]}
          isSuperAdmin={false}
        />
      );

      expect(screen.getByText("Total Siswa Binaan")).toBeInTheDocument();
      expect(screen.getByText("Rerata Presensi Rombel")).toBeInTheDocument();
      expect(screen.getByText("Perlu Perhatian Khusus")).toBeInTheDocument();
      expect(screen.getByText("Siswa Berprestasi")).toBeInTheDocument();
      expect(screen.getByText("85%")).toBeInTheDocument();
    });

    it("menampilkan tab Pusat Perhatian dengan badge jumlah siswa kritis", () => {
      render(
        <HomeroomDashboardView
          initialData={mockOverviewData}
          activeRombelsList={[]}
          isSuperAdmin={false}
        />
      );

      const attentionTab = screen.getByText(/Pusat Perhatian \(Attention\)/i);
      expect(attentionTab).toBeInTheDocument();

      // Beralih ke tab attention
      fireEvent.click(attentionTab);

      expect(screen.getByText(/Pusat Intervensi & Perhatian Khusus Rombel/i)).toBeInTheDocument();
      expect(screen.getAllByText("Aditya Pratama").length).toBeGreaterThan(0);
    });

    it("dapat melakukan pencarian nama siswa di tabel roster", () => {
      render(
        <HomeroomDashboardView
          initialData={mockOverviewData}
          activeRombelsList={[]}
          isSuperAdmin={false}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Cari nama siswa atau NIS.../i);
      fireEvent.change(searchInput, { target: { value: "Bagas" } });

      expect(screen.getByText("Bagas Setiawan")).toBeInTheDocument();
    });
  });

  describe("2. StudentMonitoringDetailModal — Investigasi Holistik", () => {
    it("merender tab detail presensi, tugas, nilai, dan pembinaan", async () => {
      render(
        <StudentMonitoringDetailModal
          isOpen={true}
          onClose={vi.fn()}
          rombelId="ROM_01"
          siswaId="SISWA_01"
          onOpenCreateNote={vi.fn()}
          onOpenCreateFollowUp={vi.fn()}
          onRefreshOverview={vi.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Aditya Pratama" })).toBeInTheDocument();
        expect(screen.getByText(/Presensi Sesi/i)).toBeInTheDocument();
        expect(screen.getByText(/Tugas \(/i)).toBeInTheDocument();
        expect(screen.getByText(/Nilai Asesmen \(/i)).toBeInTheDocument();
        expect(screen.getByText(/Pembinaan & Tindak Lanjut/i)).toBeInTheDocument();
      });
    });

    it("dapat berpindah tab ke Tugas dan Nilai", async () => {
      render(
        <StudentMonitoringDetailModal
          isOpen={true}
          onClose={vi.fn()}
          rombelId="ROM_01"
          siswaId="SISWA_01"
          onOpenCreateNote={vi.fn()}
          onOpenCreateFollowUp={vi.fn()}
          onRefreshOverview={vi.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Aditya Pratama" })).toBeInTheDocument();
      });

      // Pindah ke tab tugas
      const tugasTabBtn = screen.getByText(/Tugas \(/i);
      fireEvent.click(tugasTabBtn);

      await waitFor(() => {
        expect(screen.getByText("Ketuntasan Tugas")).toBeInTheDocument();
        expect(screen.getByText("Laporan Perawatan Rem")).toBeInTheDocument();
      });

      // Pindah ke tab nilai
      const nilaiTabBtn = screen.getByText(/Nilai Asesmen \(/i);
      fireEvent.click(nilaiTabBtn);

      await waitFor(() => {
        expect(screen.getByText("Rerata Nilai Asesmen")).toBeInTheDocument();
        expect(screen.getByText("Formatif TP 1.1: Prinsip Kelistrikan")).toBeInTheDocument();
      });
    });
  });

  describe("3. CreateMonitoringNoteModal — Modal Tambah Catatan", () => {
    it("merender form pembuatan catatan dengan validasi", () => {
      render(
        <CreateMonitoringNoteModal
          isOpen={true}
          onClose={vi.fn()}
          rombelId="ROM_01"
          students={[
            { id: "SISWA_01", nama: "Aditya Pratama", nis: "1001" },
            { id: "SISWA_02", nama: "Bagas Setiawan", nis: "1002" },
          ]}
          onSuccess={vi.fn()}
        />
      );

      expect(screen.getByText("Buat Catatan Pembinaan Siswa")).toBeInTheDocument();
      expect(screen.getByText(/Target Siswa Binaan \*/i)).toBeInTheDocument();
      expect(screen.getByText(/Judul Catatan Pembinaan \*/i)).toBeInTheDocument();
      expect(screen.getByText(/Deskripsi \/ Hasil Observasi \*/i)).toBeInTheDocument();
    });
  });

  describe("4. CreateFollowUpModal — Modal Tindak Lanjut", () => {
    it("merender form tindakan intervensi baru", () => {
      render(
        <CreateFollowUpModal
          isOpen={true}
          onClose={vi.fn()}
          catatanId="NOTE_01"
          catatanJudul="Konseling Keterlambatan"
          siswaNama="Aditya Pratama"
          onSuccess={vi.fn()}
        />
      );

      expect(screen.getByText("Tambah Rencana Tindak Lanjut")).toBeInTheDocument();
      expect(screen.getByText(/Konseling Keterlambatan/i)).toBeInTheDocument();
      expect(screen.getByText(/Rencana Tindakan Intervensi/i)).toBeInTheDocument();
      expect(screen.getByText(/Target Tanggal Selesai/i)).toBeInTheDocument();
    });
  });
});
