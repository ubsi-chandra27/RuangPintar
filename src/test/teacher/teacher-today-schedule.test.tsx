import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { TeacherTodaySchedule } from "@/shared/components/dashboard/role-views/teacher-today-schedule";
import { MergedScheduleBlock } from "@/modules/schedule/domain/schedule-merger";
import { ClassSessionDTO, ScheduleEntryDTO } from "@/modules/schedule/domain/schedule-types";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("TeacherTodaySchedule — Daily Teacher Cockpit (Academic Glass UI v1.2)", () => {
  const mockEntry: ScheduleEntryDTO = {
    id: "entry_01",
    sekolah_id: "sch_01",
    versi_jadwal_id: "ver_01",
    tahun_ajaran_id: "ta_01",
    rombel_id: "rom_01",
    rombel_nama: "X RPL 1",
    penugasan_mengajar_id: "pen_01",
    guru_id: "guru_01",
    guru_nama: "Eri Chandra, S.Kom.",
    mata_pelajaran_id: "mapel_01",
    mata_pelajaran_nama: "Koding dan Kecerdasan Artifisial",
    mata_pelajaran_kode: "KKA",
    slot_waktu_id: "slot_01",
    slot_waktu_nama: "Jam ke-1",
    slot_waktu_jam_mulai: "07:00",
    slot_waktu_jam_selesai: "07:40",
    slot_waktu_urutan: 1,
    hari: "KAMIS",
    ruangan: "Lab Komputer 1",
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockMergedBlock: MergedScheduleBlock = {
    key: "block_01",
    hari: "KAMIS",
    mata_pelajaran_id: "mapel_01",
    mata_pelajaran_nama: "Koding dan Kecerdasan Artifisial",
    mata_pelajaran_kode: "KKA",
    rombel_id: "rom_01",
    rombel_nama: "X RPL 1",
    guru_id: "guru_01",
    guru_nama: "Eri Chandra, S.Kom.",
    ruangan: "Lab Komputer 1",
    tahun_ajaran_id: "ta_01",
    penugasan_mengajar_id: "pen_01",
    jam_mulai: "07:00",
    jam_selesai: "08:20",
    total_jp: 2,
    slot_range_label: "Jam ke-1 – 2",
    entries: [mockEntry],
    primary_entry: mockEntry,
  };

  it("renders friendly empty state when no schedule exists for today", () => {
    render(
      <TeacherTodaySchedule
        mergedBlocks={[]}
        actualSessions={[]}
        todayHari="MINGGU"
        totalJamHariIni={0}
        currentDateOverride="Minggu, 13 September 2026"
        currentTimeOverride="09:00"
      />
    );

    expect(screen.getAllByText(/Minggu, 13 September 2026/i)[0]).toBeInTheDocument();
    expect(screen.getByText("Tidak Ada Jadwal Mengajar Hari Ini (MINGGU)")).toBeInTheDocument();
  });

  it("renders slim card utama with rombel, mapel, time slot, and action menu", async () => {
    const { fireEvent } = await import("@testing-library/react");

    render(
      <TeacherTodaySchedule
        mergedBlocks={[mockMergedBlock]}
        actualSessions={[]}
        todayHari="KAMIS"
        totalJamHariIni={2}
        currentDateOverride="Kamis, 17 September 2026"
        currentTimeOverride="06:30"
      />
    );

    expect(screen.getAllByText(/Kamis, 17 September 2026/i)[0]).toBeInTheDocument();
    expect(screen.getByText("1 Sesi (2 JP)")).toBeInTheDocument();
    expect(screen.getByText("X RPL 1")).toBeInTheDocument();
    expect(screen.getByText(/Koding dan Kecerdasan Artifisial/)).toBeInTheDocument();
    expect(screen.getByText("07:00–07:40")).toBeInTheDocument();

    // Check action menu
    const menuBtn = screen.getByLabelText("Menu Aksi Sesi");
    expect(menuBtn).toBeInTheDocument();
    fireEvent.click(menuBtn);

    expect(screen.getByText("Buka Sesi (KBM)")).toBeInTheDocument();
    expect(screen.getByText("Presensi / Absensi")).toBeInTheDocument();
    expect(screen.getByText("Workspace Kelas")).toBeInTheDocument();
  });

  it("renders companion blocks when multiple blocks exist", () => {
    const secondBlock: MergedScheduleBlock = {
      ...mockMergedBlock,
      key: "block_02",
      rombel_nama: "XI RPL 2",
      mata_pelajaran_nama: "Basis Data",
      jam_mulai: "08:30",
      jam_selesai: "09:50",
      entries: [
        {
          ...mockEntry,
          id: "entry_02",
          rombel_nama: "XI RPL 2",
          mata_pelajaran_nama: "Basis Data",
          slot_waktu_jam_mulai: "08:30",
          slot_waktu_jam_selesai: "09:50",
        },
      ],
    };

    render(
      <TeacherTodaySchedule
        mergedBlocks={[mockMergedBlock, secondBlock]}
        actualSessions={[]}
        todayHari="KAMIS"
        totalJamHariIni={4}
        currentDateOverride="Kamis, 17 September 2026"
        currentTimeOverride="06:30"
      />
    );

    expect(screen.getByText("X RPL 1")).toBeInTheDocument();
    expect(screen.getByText("XI RPL 2")).toBeInTheDocument();
    expect(screen.getByText("Basis Data")).toBeInTheDocument();
  });
});
