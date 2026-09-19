import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { AnimatedCounter } from "@/shared/components/motion/animated-counter";
import { ConcentricRingGauge } from "@/shared/components/motion/concentric-ring-gauge";
import { StaggeredBarChart } from "@/shared/components/motion/staggered-bar-chart";
import { SlideOverDrawer } from "@/shared/components/motion/slide-over-drawer";
import { AttentionCenterDrilldown } from "@/shared/components/dashboard/cockpit/attention-center-drilldown";

describe("Motion Components Suite (Pathway LMS & DotKrafts Inspirations)", () => {
  it("AnimatedCounter merender angka target dengan prefix dan suffix di environment test", () => {
    render(<AnimatedCounter value={10590} prefix="Rp " suffix=",-" />);
    expect(screen.getByText(/10\.590/)).toBeDefined();
  });

  it("ConcentricRingGauge merender judul, center value, dan segmen cincin kehadiran", () => {
    render(
      <ConcentricRingGauge
        title="Distribusi Kehadiran"
        centerValue={96.5}
        centerLabel="Tingkat Hadir"
        segments={[
          {
            id: "hadir",
            label: "Siswa Hadir",
            count: 120,
            percentage: 96.5,
            color: "#2563EB",
            strokeColor: "#2563EB",
            bgColor: "bg-blue-500",
          },
          {
            id: "alpha",
            label: "Alpha Kritis",
            count: 2,
            percentage: 1.5,
            color: "#F43F5E",
            strokeColor: "#F43F5E",
            bgColor: "bg-rose-500",
          },
        ]}
      />
    );

    expect(screen.getByText("Distribusi Kehadiran")).toBeDefined();
    expect(screen.getAllByText(/96,5%|96\.5%/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Tingkat Hadir")).toBeDefined();
    expect(screen.getByText("Siswa Hadir")).toBeDefined();
    expect(screen.getByText("Alpha Kritis")).toBeDefined();
  });

  it("StaggeredBarChart merender batang mingguan dan legend kepatuhan KBM", () => {
    render(
      <StaggeredBarChart
        title="Kepatuhan KBM"
        legend1="Terlaksana"
        legend2="Target"
        data={[
          { label: "Senin", value1: 28, value2: 30 },
          { label: "Selasa", value1: 30, value2: 30 },
        ]}
      />
    );

    expect(screen.getByText("Kepatuhan KBM")).toBeDefined();
    expect(screen.getByText("Terlaksana")).toBeDefined();
    expect(screen.getByText("Target")).toBeDefined();
    expect(screen.getByText("Senin")).toBeDefined();
    expect(screen.getByText("Selasa")).toBeDefined();
  });

  it("SlideOverDrawer terbuka dan memicu onClose saat tombol close ditekan", () => {
    const handleClose = vi.fn();
    const { rerender } = render(
      <SlideOverDrawer isOpen={false} onClose={handleClose} title="Detail Siswa">
        <p>Konten rahasia</p>
      </SlideOverDrawer>
    );

    expect(screen.queryByText("Detail Siswa")).toBeNull();

    rerender(
      <SlideOverDrawer isOpen={true} onClose={handleClose} title="Detail Siswa">
        <p>Konten rahasia</p>
      </SlideOverDrawer>
    );

    expect(screen.getByText("Detail Siswa")).toBeDefined();
    expect(screen.getByText("Konten rahasia")).toBeDefined();

    // Klik tombol close (X)
    const closeBtn = screen.getByRole("button");
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("AttentionCenterDrilldown merender 3 kartu dan membuka drawer saat ditinjau", () => {
    render(
      <AttentionCenterDrilldown
        alphaCount={3}
        jurnalTertundaCount={1}
        remedialCount={2}
        alphaList={[
          {
            id: "1",
            nama: "Fajar Pratama",
            rombel: "X RPL 1",
            keterangan: "3 Hari Alpha berturut-turut",
            badge: "Kritis",
            badgeColor: "rose",
          },
        ]}
      />
    );

    expect(screen.getByText("Siswa Alpha Kritis")).toBeDefined();
    expect(screen.getByText("Jurnal KBM Tertunda")).toBeDefined();
    expect(screen.getByText("Capaian di Bawah KKTP")).toBeDefined();

    // Klik "Tinjau Kasus Siswa"
    const tinjauBtn = screen.getByText("Tinjau Kasus Siswa");
    fireEvent.click(tinjauBtn);

    // Drawer Siswa Alpha terbuka
    expect(screen.getByText("Daftar Siswa Alpha Kritis")).toBeDefined();
    expect(screen.getByText("Fajar Pratama")).toBeDefined();
    expect(screen.getByText("X RPL 1 • 3 Hari Alpha berturut-turut")).toBeDefined();
  });
});
