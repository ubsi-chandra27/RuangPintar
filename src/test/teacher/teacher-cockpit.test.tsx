import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DonutGauge } from "@/shared/components/dashboard/cockpit/donut-gauge";
import { PerformanceBarChart } from "@/shared/components/dashboard/cockpit/performance-bar-chart";
import { AttentionQueueCard } from "@/shared/components/dashboard/cockpit/attention-queue-card";
import { TeachingTimelineRail } from "@/shared/components/dashboard/cockpit/teaching-timeline-rail";
import { MergedScheduleBlock } from "@/modules/schedule/domain/schedule-merger";

describe("Teacher Teaching Cockpit Components (Academic Glass UI)", () => {
  it("DonutGauge harus merender persentase dan label dengan benar", () => {
    render(<DonutGauge percentage={94} label="Siswa Hadir" color="emerald" />);
    expect(screen.getByText("94%")).toBeInTheDocument();
    expect(screen.getByText("Siswa Hadir")).toBeInTheDocument();
  });

  it("PerformanceBarChart harus merender skor tertinggi dan daftar kelas", () => {
    const mockItems = [
      { id: "1", name: "10-RPL 1", score: 92.4, subject: "Pemrograman Dasar" },
      { id: "2", name: "10-RPL 2", score: 85.0, subject: "Pemrograman Web" },
    ];

    render(<PerformanceBarChart items={mockItems} />);
    expect(screen.getByText("Ketuntasan Penilaian")).toBeInTheDocument();
    expect(screen.getAllByText("10-RPL 1").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("10-RPL 2")).toBeInTheDocument();
    expect(screen.getAllByText("92.4").length).toBeGreaterThanOrEqual(1);
  });

  it("AttentionQueueCard harus merender daftar siswa yang perlu tindak lanjut", () => {
    render(
      <AttentionQueueCard
        items={[
          {
            id: "1",
            nama: "Budi Santoso",
            rombel: "10-A",
            kategori: "TUGAS",
            keterangan: "Tugas Aljabar belum dikumpulkan",
            nomorWaOrangTua: "628123456789",
          },
        ]}
      />
    );

    expect(screen.getByText("Siswa Perlu Perhatian")).toBeInTheDocument();
    expect(screen.getByText("Budi Santoso")).toBeInTheDocument();
    expect(screen.getByText("10-A")).toBeInTheDocument();
    expect(screen.getByText("Tugas Aljabar belum dikumpulkan")).toBeInTheDocument();
  });

  it("TeachingTimelineRail harus merender sesi mengajar dan pengumuman", () => {
    const mockBlock: MergedScheduleBlock = {
      key: "block-1",
      hari: "SENIN",
      mata_pelajaran_id: "mapel-1",
      mata_pelajaran_nama: "Matematika Diskrit",
      mata_pelajaran_kode: "MTK",
      rombel_id: "rombel-1",
      rombel_nama: "10-RPL 1",
      guru_id: "guru-1",
      guru_nama: "Pak Guru",
      ruangan: "Lab Komputer 1",
      tahun_ajaran_id: "ta-1",
      penugasan_mengajar_id: "pm-1",
      jam_mulai: "08:00",
      jam_selesai: "09:30",
      total_jp: 2,
      slot_range_label: "Jam 1-2",
      entries: [],
      primary_entry: {} as any,
    };

    render(
      <TeachingTimelineRail
        mergedBlocks={[mockBlock]}
        actualSessions={[]}
        announcements={[
          {
            id: "ann-1",
            sekolah_id: "sch-1",
            penulis_id: "user-1",
            penulis: { id: "user-1", nama_lengkap: "Admin", peran_dasar: "SUPER_ADMIN" },
            judul: "Pengumuman Upacara Bendera",
            konten: "Seluruh guru wajib hadir",
            kategori: "UMUM",
            status: "PUBLISHED",
            apakah_disematkan: true,
            lampiran_url: null,
            target_audiens: "SEMUA",
            target_rombel_id: null,
            dipublikasikan_pada: new Date("2026-09-18T00:00:00Z"),
            created_at: new Date("2026-09-18T00:00:00Z"),
            updated_at: new Date("2026-09-18T00:00:00Z"),
          },
        ]}
      />
    );

    expect(screen.getByText("Jadwal Mengajar")).toBeInTheDocument();
    expect(screen.getByText("Matematika Diskrit")).toBeInTheDocument();
    expect(screen.getByText("Kelas 10-RPL 1 • Lab Komputer 1")).toBeInTheDocument();
    expect(screen.getByText("Pengumuman Upacara Bendera")).toBeInTheDocument();
  });
});
