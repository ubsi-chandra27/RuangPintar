/**
 * Ruang Pintar — M12 Class Session Attendance Presentation Views Tests
 *
 * Menguji rendering komponen Tab Presensi dan Modal Presensi Sesi.
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ClassAttendanceTabView } from "@/modules/attendance/presentation/class-attendance-tab-view";
import { SessionAttendanceModal } from "@/modules/attendance/presentation/session-attendance-modal";
import { ClassAttendanceOverview } from "@/modules/attendance/presentation/class-attendance-overview";
import * as attendanceActions from "@/app/actions/attendance-actions";

vi.mock("@/app/actions/attendance-actions", () => ({
  getSessionAttendanceAction: vi.fn(),
  saveSessionAttendanceAction: vi.fn(),
}));

describe("ClassAttendanceTabView", () => {
  const sampleStats = {
    total_sesi_terjadwal: 5,
    total_sesi_selesai: 3,
    total_presensi_diambil: 4,
    rata_rata_kehadiran: 92,
  };

  const sampleHistory = [
    {
      sesi_id: "sesi-1",
      tanggal: new Date("2026-09-03T08:00:00Z"),
      status_sesi: "DIMULAI",
      topik_pembelajaran: "Aljabar Boolean",
      ruangan: "Lab Komputer 1",
      total_siswa: 30,
      jumlah_hadir: 28,
      jumlah_izin: 1,
      jumlah_sakit: 1,
      jumlah_alpha: 0,
      jumlah_dispensasi: 0,
      jumlah_terlambat: 0,
      persentase_kehadiran: 93,
      sudah_diabsen: true,
    },
    {
      sesi_id: "sesi-2",
      tanggal: new Date("2026-09-10T08:00:00Z"),
      status_sesi: "TERJADWAL",
      topik_pembelajaran: null,
      ruangan: "Lab Komputer 1",
      total_siswa: 30,
      jumlah_hadir: 0,
      jumlah_izin: 0,
      jumlah_sakit: 0,
      jumlah_alpha: 0,
      jumlah_dispensasi: 0,
      jumlah_terlambat: 0,
      persentase_kehadiran: 0,
      sudah_diabsen: false,
    },
  ];

  it("renders attendance KPI summary cards correctly", () => {
    render(
      <ClassAttendanceTabView
        canManage={true}
        history={sampleHistory}
        stats={sampleStats}
        onOpenAttendance={vi.fn()}
      />
    );

    expect(screen.getByText("Total Sesi")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Presensi Terekam")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("Sesi Selesai")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("92%")).toBeInTheDocument();
  });

  it("renders session list with attendance breakdown and triggers onOpenAttendance", () => {
    const handleOpen = vi.fn();

    render(
      <ClassAttendanceTabView
        canManage={true}
        history={sampleHistory}
        stats={sampleStats}
        onOpenAttendance={handleOpen}
      />
    );

    expect(screen.getByText("Aljabar Boolean")).toBeInTheDocument();
    expect(screen.getByText("28 Hadir (93%)")).toBeInTheDocument();
    expect(screen.getByText("Presensi belum dicatat untuk pertemuan ini")).toBeInTheDocument();

    const buttons = screen.getAllByRole("button", { name: /Presensi/i });
    expect(buttons.length).toBeGreaterThan(0);

    fireEvent.click(buttons[0]);
    expect(handleOpen).toHaveBeenCalledWith("sesi-1");
  });
});

describe("SessionAttendanceModal", () => {
  const mockSessionData: any = {
    sesi_id: "sesi-1",
    sekolah_id: "sekolah-1",
    penugasan_mengajar_id: "penugasan-1",
    rombel_id: "rombel-1",
    rombel_nama: "X RPL 1",
    mata_pelajaran_id: "mapel-1",
    mata_pelajaran_nama: "Pemrograman Web",
    guru_id: "guru-1",
    guru_nama: "Budi Santoso",
    tanggal: new Date("2026-09-03T08:00:00Z"),
    status_sesi: "DIMULAI",
    total_siswa: 2,
    jumlah_hadir: 2,
    jumlah_izin: 0,
    jumlah_sakit: 0,
    jumlah_alpha: 0,
    jumlah_dispensasi: 0,
    jumlah_terlambat: 0,
    persentase_kehadiran: 100,
    sudah_diabsen: false,
    daftar_siswa: [
      {
        siswa_id: "s-1",
        nama_lengkap: "Andi Saputra",
        nis: "1001",
        nisn: "0012345678",
        nomor_absen: 1,
        foto_url: null,
        penempatan_rombel_id: "pr-1",
        presensi_id: null,
        status: "HADIR",
        catatan: null,
        waktu_presensi: null,
      },
      {
        siswa_id: "s-2",
        nama_lengkap: "Citra Lestari",
        nis: "1002",
        nisn: "0012345679",
        nomor_absen: 2,
        foto_url: null,
        penempatan_rombel_id: "pr-2",
        presensi_id: null,
        status: "HADIR",
        catatan: null,
        waktu_presensi: null,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches session attendance data and renders student roster", async () => {
    (attendanceActions.getSessionAttendanceAction as any).mockResolvedValue({
      success: true,
      data: mockSessionData,
    });

    render(
      <SessionAttendanceModal
        sesiId="sesi-1"
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        onError={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Pemrograman Web")).toBeInTheDocument();
      expect(screen.getByText("Andi Saputra")).toBeInTheDocument();
      expect(screen.getByText("Citra Lestari")).toBeInTheDocument();
    });
  });

  it("changes individual student status when a status button is clicked", async () => {
    (attendanceActions.getSessionAttendanceAction as any).mockResolvedValue({
      success: true,
      data: mockSessionData,
    });

    render(
      <SessionAttendanceModal
        sesiId="sesi-1"
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        onError={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Andi Saputra")).toBeInTheDocument();
    });

    // Find all 'Izin' buttons
    const izinButtons = screen.getAllByRole("button", { name: "Izin" });
    fireEvent.click(izinButtons[0]);

    // An input for catatan/alasan should appear for Andi
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Alasan \/ no surat/i)).toBeInTheDocument();
    });
  });

  it("submits the form and calls saveSessionAttendanceAction", async () => {
    (attendanceActions.getSessionAttendanceAction as any).mockResolvedValue({
      success: true,
      data: mockSessionData,
    });

    (attendanceActions.saveSessionAttendanceAction as any).mockResolvedValue({
      success: true,
      message: "Presensi berhasil disimpan.",
      data: {
        total_siswa: 2,
        jumlah_hadir: 2,
        persentase_kehadiran: 100,
      },
    });

    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    render(
      <SessionAttendanceModal
        sesiId="sesi-1"
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
        onError={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Pemrograman Web")).toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", { name: /Simpan Presensi Kelas/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(attendanceActions.saveSessionAttendanceAction).toHaveBeenCalled();
      expect(handleSuccess).toHaveBeenCalledWith("Presensi berhasil disimpan.");
      expect(handleClose).toHaveBeenCalled();
    });
  });
});

describe("ClassAttendanceOverview (/presensi-kelas)", () => {
  const sampleSessions = [
    {
      id: "sesi-101",
      sekolah_id: "SCH-1",
      penugasan_mengajar_id: "penugasan-1",
      rombel_id: "rombel-1",
      rombel_nama: "X RPL 1",
      mata_pelajaran_id: "mapel-1",
      mata_pelajaran_nama: "Pemrograman Dasar",
      mata_pelajaran_kode: "PBO",
      guru_id: "guru-1",
      guru_nama: "Budi Santoso",
      tahun_ajaran_id: "ta-1",
      tanggal: new Date("2026-09-04T08:00:00Z"),
      jam_mulai_aktual: new Date("2026-09-04T08:00:00Z"),
      jam_selesai_aktual: null,
      status: "DIMULAI" as const,
      ruangan_aktual: "Lab Komputer 1",
      topik_pembelajaran: "Pengenalan Loop",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  const sampleClasses = [
    {
      penugasanId: "penugasan-1",
      rombelId: "rombel-1",
      rombelNama: "X RPL 1",
      tingkatNama: "Kelas 10",
      mapelId: "mapel-1",
      mapelNama: "Pemrograman Dasar",
      mapelKode: "PBO",
      guruNama: "Budi Santoso",
      stats: {
        total_sesi_terjadwal: 10,
        total_sesi_selesai: 5,
        total_presensi_diambil: 5,
        rata_rata_kehadiran: 95,
      },
    },
  ];

  it("merender halaman overview presensi dengan KPI dan sesi aktif", () => {
    render(
      <ClassAttendanceOverview
        sessions={sampleSessions}
        classes={sampleClasses}
        schoolName="SMK Negeri 1 Jakarta"
        canManage={true}
        isAdmin={false}
      />
    );

    expect(screen.getByText("Presensi Kehadiran Siswa")).toBeInTheDocument();
    expect(screen.getByText("SMK Negeri 1 Jakarta")).toBeInTheDocument();
    expect(screen.getByText("Pemrograman Dasar")).toBeInTheDocument();
    expect(screen.getByText("X RPL 1")).toBeInTheDocument();
    expect(screen.getByText("Pengenalan Loop")).toBeInTheDocument();
  });

  it("beralih tab ke rekapitulasi per rombel saat tombol tab ditekan", () => {
    render(
      <ClassAttendanceOverview
        sessions={sampleSessions}
        classes={sampleClasses}
        schoolName="SMK Negeri 1 Jakarta"
        canManage={true}
        isAdmin={false}
      />
    );

    const rekapTab = screen.getByRole("button", { name: /Rekapitulasi per Rombel/i });
    fireEvent.click(rekapTab);

    expect(screen.getByText("95% Kehadiran")).toBeInTheDocument();
    expect(screen.getByText("Buka Lembar Presensi Kelas")).toBeInTheDocument();
  });
});
