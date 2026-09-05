import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ClassCbtTabView } from "@/modules/cbt/presentation/class-cbt-tab-view";
import { CbtPlayerView } from "@/modules/cbt/presentation/cbt-player-view";
import { UjianCbtDTO, ManifestItemSoal } from "@/modules/cbt/domain/cbt-types";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock CBT Server Actions
vi.mock("@/app/actions/cbt-actions", () => ({
  getQuestionsAction: vi.fn().mockResolvedValue({ success: true, data: [] }),
  createExamAction: vi.fn().mockResolvedValue({ success: true, message: "Ujian dibuat." }),
  publishExamAction: vi.fn().mockResolvedValue({ success: true, message: "Ujian dipublikasikan." }),
  archiveExamAction: vi.fn().mockResolvedValue({ success: true, message: "Ujian diarsipkan." }),
  autosaveAnswerAction: vi.fn().mockResolvedValue({ success: true, message: "Tersimpan." }),
  recordIntegrityEventAction: vi
    .fn()
    .mockResolvedValue({ success: true, data: { isLocked: false } }),
  submitAttemptAction: vi.fn().mockResolvedValue({
    success: true,
    data: {
      id: "HASIL_1",
      nilai_akhir: 85,
      total_benar: 4,
      status_kelulusan: "TUNTAS",
    },
  }),
}));

describe("M14 CBT — Presentation Views (Academic Glass UI v1.2)", () => {
  const mockExams: UjianCbtDTO[] = [
    {
      id: "UJIAN_1",
      sekolah_id: "SCH_1",
      penugasan_mengajar_id: "PENUGAS_1",
      asesmen_id: null,
      guru_pembuat_id: "GURU_1",
      judul: "PTS Biologi Genap",
      deskripsi: "Ujian Tengah Semester",
      durasi_menit: 90,
      kkm_kktp: 75,
      kktp: 75,
      acak_soal: true,
      acak_opsi: true,
      tampilkan_nilai: true,
      tampilkan_pembahasan: false,
      maksimal_attempt: 1,
      blueprint: [],
      snapshot_aktif_id: "SNAP_1",
      status: "DIPUBLIKASI",
      blueprint_soal: [{ bank_soal_id: "Q1", nomor_urut: 1, bobot_kustom: 10 }],
      waktu_mulai: null,
      waktu_selesai: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: "UJIAN_2",
      sekolah_id: "SCH_1",
      penugasan_mengajar_id: "PENUGAS_1",
      asesmen_id: null,
      guru_pembuat_id: "GURU_1",
      judul: "Kuis Bab Sel",
      deskripsi: null,
      durasi_menit: 30,
      kkm_kktp: 75,
      kktp: 75,
      acak_soal: false,
      acak_opsi: false,
      tampilkan_nilai: true,
      tampilkan_pembahasan: false,
      maksimal_attempt: 1,
      blueprint: [],
      snapshot_aktif_id: null,
      status: "DRAFT",
      blueprint_soal: [],
      waktu_mulai: null,
      waktu_selesai: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  const mockManifest: ManifestItemSoal[] = [
    {
      nomor_urut: 1,
      soal_id: "S1",
      versi_soal_id: "V1",
      tipe_soal: "PILIHAN_GANDA",
      jenis_soal: "PILIHAN_GANDA",
      pertanyaan: "Organel sel yang berfungsi menghasilkan energi adalah...",
      bobot: 10,
      opsi_jawaban: null,
      opsi: [
        { label: "A", teks: "Ribosom", urutan: 1 },
        { label: "B", teks: "Mitokondria", urutan: 2 },
        { label: "C", teks: "Kloroplas", urutan: 3 },
      ],
    },
    {
      nomor_urut: 2,
      soal_id: "S2",
      versi_soal_id: "V2",
      tipe_soal: "ISIAN_SINGKAT",
      jenis_soal: "ISIAN_SINGKAT",
      pertanyaan: "Bahan fotosintesis yang diserap dari akar adalah...",
      bobot: 10,
      opsi_jawaban: null,
    },
  ];

  it("renders ClassCbtTabView correctly with exam statistics and exam cards", () => {
    const handleRefresh = vi.fn();
    const handleToast = vi.fn();

    render(
      <ClassCbtTabView
        penugasanId="PENUGAS_1"
        sekolahId="SCH_1"
        mapelId="MAPEL_1"
        canManage={true}
        exams={mockExams}
        onRefresh={handleRefresh}
        onShowToast={handleToast}
      />
    );

    expect(screen.getByText("Ujian Berbasis Komputer (CBT)")).toBeDefined();
    expect(screen.getByText("PTS Biologi Genap")).toBeDefined();
    expect(screen.getByText("Kuis Bab Sel")).toBeDefined();
    expect(screen.getByText("Susun Ujian Baru")).toBeDefined();
    expect(screen.getByText("Bank Soal")).toBeDefined();
  });

  it("renders CbtPlayerView correctly with question, options, timer, and navigator", () => {
    const mockSession: any = {
      id: "SESS_1",
      ujian_cbt_id: "UJIAN_1",
      siswa_id: "SISWA_1",
      status: "SEDANG_MENGERJAKAN",
      batas_waktu_server: new Date(Date.now() + 3600000),
    };

    render(
      <CbtPlayerView
        initialSession={mockSession}
        manifest={mockManifest}
        initialTimeRemainingSeconds={3600}
        initialSavedAnswers={{}}
        ujian={{
          judul: "PTS Biologi Genap",
          deskripsi: "Petunjuk",
          acak_soal: false,
        }}
      />
    );

    expect(screen.getByText("PTS Biologi Genap")).toBeDefined();
    expect(
      screen.getByText("Organel sel yang berfungsi menghasilkan energi adalah...")
    ).toBeDefined();
    expect(screen.getByText("Mitokondria")).toBeDefined();
    expect(screen.getAllByText("Ragu-ragu").length).toBeGreaterThan(0);
    expect(screen.getByText("Navigasi Soal")).toBeDefined();
  });

  it("allows selecting choice and navigating questions", () => {
    const mockSession: any = {
      id: "SESS_1",
      ujian_cbt_id: "UJIAN_1",
      siswa_id: "SISWA_1",
      status: "SEDANG_MENGERJAKAN",
      batas_waktu_server: new Date(Date.now() + 3600000),
    };

    render(
      <CbtPlayerView
        initialSession={mockSession}
        manifest={mockManifest}
        initialTimeRemainingSeconds={3600}
        initialSavedAnswers={{}}
        ujian={{
          judul: "PTS Biologi Genap",
          deskripsi: "Petunjuk",
          acak_soal: false,
        }}
      />
    );

    // Select option B
    const optionB = screen.getByText("Mitokondria");
    fireEvent.click(optionB);

    // Toggle Ragu-ragu (first one is the button)
    const raguBtn = screen.getAllByText("Ragu-ragu")[0];
    fireEvent.click(raguBtn);

    // Navigate to next question
    const nextBtn = screen.getByText("Berikutnya");
    fireEvent.click(nextBtn);

    expect(screen.getByText("Bahan fotosintesis yang diserap dari akar adalah...")).toBeDefined();
  });
});
