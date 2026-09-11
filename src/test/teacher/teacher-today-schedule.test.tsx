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
      />
    );

    expect(screen.getByText("Jadwal & Agenda Mengajar Hari Ini")).toBeInTheDocument();
    expect(screen.getByText("Tidak Ada Jadwal Mengajar Hari MINGGU")).toBeInTheDocument();
    expect(screen.getByText("Lihat Jadwal Mingguan Lengkap")).toBeInTheDocument();
  });

  it("renders merged consecutive schedule blocks with time, room, and action buttons", () => {
    render(
      <TeacherTodaySchedule
        mergedBlocks={[mockMergedBlock]}
        actualSessions={[]}
        todayHari="KAMIS"
        totalJamHariIni={2}
      />
    );

    expect(screen.getByText("Jadwal & Agenda Mengajar Hari Ini")).toBeInTheDocument();
    expect(screen.getByText("1 Sesi Terpadu (2 JP)")).toBeInTheDocument();
    expect(screen.getAllByText("Koding dan Kecerdasan Artifisial")[0]).toBeInTheDocument();
    expect(screen.getAllByText("X RPL 1")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Lab Komputer 1")[0]).toBeInTheDocument();
    expect(screen.getByText("Buka Kelas (KBM)")).toBeInTheDocument();
  });

  it("displays ongoing session badge when actual session is DIMULAI", () => {
    const mockActualSession: ClassSessionDTO = {
      id: "session_01",
      sekolah_id: "sch_01",
      penugasan_mengajar_id: "pen_01",
      rombel_id: "rom_01",
      rombel_nama: "X RPL 1",
      mata_pelajaran_id: "mapel_01",
      mata_pelajaran_nama: "Koding dan Kecerdasan Artifisial",
      mata_pelajaran_kode: "KKA",
      guru_id: "guru_01",
      guru_nama: "Eri Chandra, S.Kom.",
      tahun_ajaran_id: "ta_01",
      tanggal: new Date(),
      status: "DIMULAI",
      created_at: new Date(),
      updated_at: new Date(),
    };

    render(
      <TeacherTodaySchedule
        mergedBlocks={[mockMergedBlock]}
        actualSessions={[mockActualSession]}
        todayHari="KAMIS"
        totalJamHariIni={2}
      />
    );

    expect(screen.getByText("Sesi Berlangsung")).toBeInTheDocument();
    expect(screen.getByText("Presensi / KBM")).toBeInTheDocument();
  });

  it("displays completed session badge when actual session is SELESAI", () => {
    const mockActualSession: ClassSessionDTO = {
      id: "session_01",
      sekolah_id: "sch_01",
      penugasan_mengajar_id: "pen_01",
      rombel_id: "rom_01",
      rombel_nama: "X RPL 1",
      mata_pelajaran_id: "mapel_01",
      mata_pelajaran_nama: "Koding dan Kecerdasan Artifisial",
      mata_pelajaran_kode: "KKA",
      guru_id: "guru_01",
      guru_nama: "Eri Chandra, S.Kom.",
      tahun_ajaran_id: "ta_01",
      tanggal: new Date(),
      status: "SELESAI",
      created_at: new Date(),
      updated_at: new Date(),
    };

    render(
      <TeacherTodaySchedule
        mergedBlocks={[mockMergedBlock]}
        actualSessions={[mockActualSession]}
        todayHari="KAMIS"
        totalJamHariIni={2}
      />
    );

    expect(screen.getByText("Selesai")).toBeInTheDocument();
    expect(screen.getByText("Lihat Riwayat Sesi")).toBeInTheDocument();
  });
});
