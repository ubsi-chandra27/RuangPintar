import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ModernLandingView } from "@/modules/marketing/presentation/modern-landing-view";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("ModernLandingView — Camply-Inspired Interactive Landing Page", () => {
  it("renders brand logo, sticky navbar, and auth links for guests", () => {
    render(<ModernLandingView user={null} />);

    expect(screen.getAllByText("Ruang Pintar")[0]).toBeInTheDocument();
    expect(screen.getAllByText(/School Digital Platform/i)[0]).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Masuk Akun" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /coba gratis 30 hari/i })[0]).toBeInTheDocument();
  });

  it("renders authenticated dashboard CTA when user is logged in", () => {
    render(
      <ModernLandingView
        user={{
          id: "user-1",
          nama: "Pak Guru Budi",
          username: "budiguru",
          role: "TEACHER",
        }}
      />
    );

    expect(screen.getByText("Dashboard Saya")).toBeInTheDocument();
    expect(screen.queryByText("Masuk Akun")).not.toBeInTheDocument();
  });

  it("renders smartphone mockup and stats ribbon with key metrics", () => {
    render(<ModernLandingView user={null} />);

    // Smartphone Mockup elements
    expect(screen.getByText("Photo-to-Class AI")).toBeInTheDocument();
    expect(screen.getByText("36 Siswa Terekstrak (5 Detik)")).toBeInTheDocument();
    expect(screen.getByText("Pak Eri Chandra")).toBeInTheDocument();
    expect(screen.getByText("Sesi Mengajar Hari Ini")).toBeInTheDocument();
    expect(screen.getByText("Presensi Kilat 15 Detik")).toBeInTheDocument();
    expect(screen.getByText("Leger Kurikulum Merdeka")).toBeInTheDocument();

    // Stats ribbon
    expect(screen.getByText(/Otomatisasi AI/i)).toBeInTheDocument();
    expect(screen.getByText(/Scan Absen Kertas/i)).toBeInTheDocument();
    expect(screen.getByText(/Coba Gratis Penuh/i)).toBeInTheDocument();
    expect(screen.getByText(/Kepuasan Guru & Siswa/i)).toBeInTheDocument();
  });

  it("allows switching roles in the interactive map quick finder widget", () => {
    render(<ModernLandingView user={null} />);

    const roleSelect = screen.getByLabelText(/Pilih Peran Anda/i) as HTMLSelectElement;
    expect(roleSelect).toBeInTheDocument();

    // Change to Kepala Sekolah
    fireEvent.change(roleSelect, { target: { value: "Kepala Sekolah" } });
    expect(screen.getByText("Dashboard Pimpinan & Manajemen Sekolah")).toBeInTheDocument();

    // Change to Wali Kelas
    fireEvent.change(roleSelect, { target: { value: "Wali Kelas" } });
    expect(screen.getByText("Pusat Perhatian & Monitoring Rombel")).toBeInTheDocument();
  });

  it("allows navigating testimonials using previous and next buttons", () => {
    render(<ModernLandingView user={null} />);

    expect(screen.getByText("Ibu Wardah Ulfah Fauzziyah, S.Pd.")).toBeInTheDocument();

    const nextBtn = screen.getByRole("button", { name: /testimoni berikutnya/i });
    fireEvent.click(nextBtn);

    // After next, active index shifts
    expect(screen.getByText("Pak Eri Chandra Apriyadi, S.Kom.")).toBeInTheDocument();
  });

  it("allows expanding and collapsing FAQ accordion questions", () => {
    render(<ModernLandingView user={null} />);

    // First question is open by default
    expect(
      screen.getByText(/Ya, 100% gratis dengan akses penuh ke fitur mengajar/i)
    ).toBeInTheDocument();

    // Click second question to expand it
    const secondFaq = screen.getByText(
      /Apa yang terjadi jika masa coba 30 hari selesai\? Apakah data saya hilang\?/i
    );
    fireEvent.click(secondFaq);

    expect(
      screen.getByText(/Data Anda dijamin 100% aman dan TIDAK AKAN PERNAH DIHAPUS/i)
    ).toBeInTheDocument();
  });

  it("handles consultation question submission with instant feedback", () => {
    render(<ModernLandingView user={null} />);

    const input = screen.getByPlaceholderText(/Masukkan Email \/ No. WhatsApp.../i);
    const submitBtn = screen.getByRole("button", { name: "Kirim" });

    fireEvent.change(input, { target: { value: "08123456789" } });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText(/Terima kasih! Tim Ruang Pintar akan segera menghubungi kontak Anda/i)
    ).toBeInTheDocument();
  });

  it("renders royal blue footer with brand and links", () => {
    render(<ModernLandingView user={null} />);

    expect(screen.getByText("Fitur Utama")).toBeInTheDocument();
    expect(screen.getByText("Sumber Daya")).toBeInTheDocument();
    expect(screen.getByText("Bantuan & Legal")).toBeInTheDocument();
    expect(screen.getByText("Kontak Resmi")).toBeInTheDocument();
    expect(
      screen.getByText(/Hak Cipta Dilindungi Undang-Undang|All rights reserved/i)
    ).toBeInTheDocument();
  });
});
