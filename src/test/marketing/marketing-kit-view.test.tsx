import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MarketingKitView } from "@/modules/marketing/presentation/marketing-kit-view";

describe("MarketingKitView (M23)", () => {
  it("harus merender Panduan Cepat Guru 4 langkah secara default", () => {
    render(<MarketingKitView />);

    expect(screen.getByText("Panduan Pengguna & Materi Promosi")).toBeDefined();
    expect(screen.getByText("Panduan Operasional Kilat Guru")).toBeDefined();
    expect(screen.getByText("Daftar Mandiri Tanpa Kartu Kredit")).toBeDefined();
    expect(screen.getByText("Foto Lembar Absensi Kertas (AI Scanner)")).toBeDefined();
    expect(screen.getByText("Pratinjau & Terbitkan Kelas Digital")).toBeDefined();
    expect(screen.getByText("Presensi di Kelas & Ekspor Buku Nilai")).toBeDefined();
  });

  it("harus dapat beralih ke tab Template Siaran WhatsApp dan menampilkan 3 variasi pesan", () => {
    render(<MarketingKitView />);

    const broadcastTabBtn = screen.getByText("Template Siaran WhatsApp (3 Variasi)");
    fireEvent.click(broadcastTabBtn);

    expect(screen.getByText("Variasi 1: Untuk Rekan Guru Perorangan")).toBeDefined();
    expect(screen.getByText("Variasi 2: Untuk Komunitas MGMP / KKG / Forum Guru")).toBeDefined();
    expect(screen.getByText("Variasi 3: Untuk Kepala Sekolah & Tim Dana BOS")).toBeDefined();
    expect(screen.getAllByText("Salin Pesan (1-Click)").length).toBe(3);
  });
});
