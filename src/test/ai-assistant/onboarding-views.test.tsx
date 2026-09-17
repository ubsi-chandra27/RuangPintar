import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { RegisterView } from "@/modules/ai-assistant/presentation/register-view";
import { AiPreviewTableModal } from "@/modules/ai-assistant/presentation/ai-preview-table-modal";
import { SmartPhotoOnboardingModal } from "@/modules/ai-assistant/presentation/smart-photo-onboarding-modal";

// Mock Server Actions
vi.mock("@/app/actions/smart-onboarding-actions", () => ({
  registerTeacherAction: vi.fn().mockResolvedValue({
    success: true,
    data: { user: { id: "u1" }, sekolah: { id: "s1" }, redirectUrl: "/dashboard" },
  }),
  processClassPhotoAction: vi.fn().mockResolvedValue({
    success: true,
    data: {
      requestId: "req_test",
      nama_kelas: "X MIPA 1",
      mata_pelajaran: "Matematika",
      siswa: [{ nama_lengkap: "Budi Santoso", jenis_kelamin: "L", nis: "101" }],
      total_terdeteksi: 1,
      confidence_score: 0.95,
    },
  }),
  confirmClassCreationAction: vi.fn().mockResolvedValue({
    success: true,
    data: {
      rombelId: "rombel_1",
      namaRombel: "X MIPA 1",
      totalSiswa: 1,
      mataPelajaran: "Matematika",
    },
  }),
  getTeacherTrialStatusAction: vi.fn().mockResolvedValue({
    success: true,
    data: {
      is_trial: true,
      tipe_lisensi: "FREEMIUM",
      days_remaining: 30,
      max_rombel: 5,
      current_rombel_count: 1,
      can_create_rombel: true,
      is_expired: false,
    },
  }),
}));

describe("Phase 21: Presentation Views (AI Assistance & SaaS Onboarding)", () => {
  it("1. harus merender formulir registrasi mandiri guru dengan 4 kolom input", () => {
    render(<RegisterView />);

    expect(screen.getByText("Ruang")).toBeInTheDocument();
    expect(screen.getByText("Daftar Akun Guru Mandiri")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Contoh: Budi Santoso, S.Pd")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("nama@gmail.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Contoh: SMA 1 Coba atau SMP Harapan")).toBeInTheDocument();
    expect(screen.getByText("Mulai Coba Gratis 30 Hari")).toBeInTheDocument();
  });

  it("2. harus merender modal unggah foto lembar absensi kelas", () => {
    const handleClose = vi.fn();
    const handleComplete = vi.fn();

    render(
      <SmartPhotoOnboardingModal
        isOpen={true}
        onClose={handleClose}
        onExtractionComplete={handleComplete}
      />
    );

    expect(screen.getByText("Buat Kelas Otomatis via Foto AI")).toBeInTheDocument();
    expect(screen.getByText("Ambil Foto Kamera HP atau Unggah Berkas")).toBeInTheDocument();
  });

  it("3. harus merender modal pratinjau tabel siswa hasil ekstraksi AI dan tombol konfirmasi", () => {
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();

    const mockExtraction = {
      requestId: "req_123",
      nama_kelas: "X MIPA 1",
      mata_pelajaran: "Matematika",
      siswa: [
        { nama_lengkap: "Ahmad Rizky", jenis_kelamin: "L" as const, nis: "1001" },
        { nama_lengkap: "Citra Lestari", jenis_kelamin: "P" as const, nis: "1002" },
      ],
      total_terdeteksi: 2,
      confidence_score: 0.95,
    };

    render(
      <AiPreviewTableModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
        extractionData={mockExtraction}
      />
    );

    expect(
      screen.getByText("Pratinjau & Konfirmasi Kelas (2 Siswa Terdeteksi)")
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("Ahmad Rizky")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Citra Lestari")).toBeInTheDocument();
    expect(screen.getByText("Setujui & Terbitkan Kelas (2 Siswa)")).toBeInTheDocument();
  });
});
