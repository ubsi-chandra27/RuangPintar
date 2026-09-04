/**
 * Ruang Pintar — Phase 10 (Calendar, Schedule & Class Session) Presentation Component Tests
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { AcademicCalendarView } from "@/modules/calendar/presentation/academic-calendar-view";
import { MasterScheduleView } from "@/modules/schedule/presentation/master-schedule-view";
import { MyScheduleView } from "@/modules/schedule/presentation/my-schedule-view";
import { ClassSessionsView } from "@/modules/schedule/presentation/class-sessions-view";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("Phase 10 Presentation Views", () => {
  describe("AcademicCalendarView", () => {
    it("renders calendar events and summary cards correctly", () => {
      const mockEvents: any[] = [
        {
          id: "EVT_01",
          sekolah_id: "SCH_01",
          judul: "Masa Pengenalan Lingkungan Sekolah",
          tipe_event: "ORIENTASI",
          tahun_ajaran_id: "TA_01",
          tahun_ajaran_nama: "2026/2027",
          tanggal_mulai: new Date("2026-07-15"),
          tanggal_selesai: new Date("2026-07-18"),
          libur_kbm: false,
        },
      ];

      render(
        <AcademicCalendarView
          initialEvents={mockEvents}
          academicYears={[{ id: "TA_01", nama: "2026/2027", status: "AKTIF" }]}
          semesters={[]}
          canManage={true}
        />
      );

      expect(screen.getByText("Total Agenda")).toBeInTheDocument();
      expect(screen.getByText("Masa Pengenalan Lingkungan Sekolah")).toBeInTheDocument();
      expect(screen.getByText("Masa Orientasi / MPLS")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /tambah agenda/i })).toBeInTheDocument();
    });
  });

  describe("MasterScheduleView", () => {
    it("renders master schedule entries with conflict and version controls", () => {
      const mockVersions: any[] = [
        {
          id: "VER_01",
          nama: "Jadwal Semester Ganjil 2026/2027 v1",
          status: "PUBLISHED",
          nomor_versi: 1,
        },
      ];
      const mockEntries: any[] = [
        {
          id: "SCH_01",
          versi_jadwal_id: "VER_01",
          versi_jadwal_nama: "Jadwal Semester Ganjil 2026/2027 v1",
          rombel_id: "ROM_01",
          rombel_nama: "X RPL 1",
          mata_pelajaran_nama: "Pemrograman Web",
          mata_pelajaran_kode: "WEB-01",
          guru_nama: "Budi Santoso, S.Pd",
          slot_waktu_nama: "Jam Ke-1",
          slot_waktu_jam_mulai: "07:45",
          slot_waktu_jam_selesai: "08:30",
          slot_waktu_urutan: 1,
          hari: "SENIN",
        },
      ];

      render(
        <MasterScheduleView
          versions={mockVersions}
          initialEntries={mockEntries}
          timeSlots={[]}
          rombels={[{ id: "ROM_01", nama: "X RPL 1" }]}
          assignments={[]}
          academicYears={[{ id: "TA_01", nama: "2026/2027", status: "AKTIF" }]}
          canManage={true}
          canPublish={true}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: "Daftar" }));
      const table = within(screen.getByRole("table"));
      expect(table.getByText("Pemrograman Web")).toBeInTheDocument();
      expect(table.getByText("X RPL 1")).toBeInTheDocument();
      expect(table.getByText("Budi Santoso, S.Pd")).toBeInTheDocument();
      expect(table.getByText("Senin")).toBeInTheDocument();
    });
  });

  describe("MyScheduleView", () => {
    it("renders personal teacher schedule timeline with Buka Kelas CTA", () => {
      const mockEntries: any[] = [
        {
          id: "SCH_01",
          penugasan_mengajar_id: "TCH_01",
          rombel_id: "ROM_01",
          rombel_nama: "X RPL 1",
          mata_pelajaran_id: "MP_01",
          mata_pelajaran_nama: "Algoritma Pemrograman",
          guru_id: "GURU_01",
          guru_nama: "Siti Rahma",
          tahun_ajaran_id: "TA_01",
          slot_waktu_nama: "Jam Ke-2",
          slot_waktu_jam_mulai: "08:30",
          slot_waktu_jam_selesai: "09:15",
          slot_waktu_urutan: 2,
          hari: "SENIN",
        },
      ];

      render(
        <MyScheduleView entries={mockEntries} teacherName="Siti Rahma, M.Kom" isTeacher={true} />
      );

      expect(screen.getByText("Algoritma Pemrograman")).toBeInTheDocument();
      expect(screen.getByText("1 JP / Minggu")).toBeInTheDocument();
      expect(screen.getByText(/buka kelas/i)).toBeInTheDocument();
    });

    it("merges 2 consecutive periods of same subject and class into 1 unified schedule card", () => {
      const mockConsecutiveEntries: any[] = [
        {
          id: "SCH_01",
          penugasan_mengajar_id: "TCH_01",
          rombel_id: "ROM_01",
          rombel_nama: "X DKV 1",
          mata_pelajaran_id: "MP_01",
          mata_pelajaran_nama: "Koding dan Kecerdasan Artifisial",
          guru_id: "GURU_01",
          guru_nama: "Budi Santoso",
          tahun_ajaran_id: "TA_01",
          slot_waktu_nama: "Jam ke-1",
          slot_waktu_jam_mulai: "06:30",
          slot_waktu_jam_selesai: "07:10",
          slot_waktu_urutan: 1,
          hari: "JUMAT",
        },
        {
          id: "SCH_02",
          penugasan_mengajar_id: "TCH_01",
          rombel_id: "ROM_01",
          rombel_nama: "X DKV 1",
          mata_pelajaran_id: "MP_01",
          mata_pelajaran_nama: "Koding dan Kecerdasan Artifisial",
          guru_id: "GURU_01",
          guru_nama: "Budi Santoso",
          tahun_ajaran_id: "TA_01",
          slot_waktu_nama: "Jam ke-2",
          slot_waktu_jam_mulai: "07:10",
          slot_waktu_jam_selesai: "07:50",
          slot_waktu_urutan: 2,
          hari: "JUMAT",
        },
      ];

      render(
        <MyScheduleView
          entries={mockConsecutiveEntries}
          teacherName="Budi Santoso"
          isTeacher={true}
        />
      );

      // Verify only 1 card is rendered instead of 2 duplicate cards
      expect(screen.getAllByText("Koding dan Kecerdasan Artifisial")).toHaveLength(1);
      // Verify unified time range
      expect(screen.getByText("06:30 - 07:50")).toBeInTheDocument();
      // Verify badge JP label
      expect(screen.getByText(/2 JP \(Jam ke-1 – 2\)/i)).toBeInTheDocument();
      // Verify rombel
      expect(screen.getByText("X DKV 1")).toBeInTheDocument();
    });
  });

  describe("ClassSessionsView", () => {
    it("renders class session cards and status indicators", () => {
      const mockSessions: any[] = [
        {
          id: "SESI_01",
          sekolah_id: "SCH_01",
          rombel_nama: "XI TKJ 1",
          mata_pelajaran_nama: "Administrasi Server",
          guru_nama: "Ahmad Dahlan, S.T",
          status: "DIMULAI",
          tanggal: new Date(),
          jam_mulai_aktual: new Date(),
          topik_pembelajaran: "Konfigurasi DHCP Server",
        },
      ];

      render(
        <ClassSessionsView
          initialSessions={mockSessions}
          rombels={[{ id: "ROM_01", nama: "XI TKJ 1" }]}
          assignments={[]}
          teachers={[]}
          canManage={true}
        />
      );

      expect(screen.getByText("Administrasi Server")).toBeInTheDocument();
      expect(screen.getByText("XI TKJ 1")).toBeInTheDocument();
      expect(screen.getByText("Ahmad Dahlan, S.T")).toBeInTheDocument();
      expect(screen.getByText("Konfigurasi DHCP Server")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /tutup kelas/i })).toBeInTheDocument();
    });
  });
});
