/**
 * Ruang Pintar — Integration Views Presentation Tests (M20)
 * Academic Glass UI v1.2
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { IntegrationPortalView } from "@/modules/integration/presentation/integration-portal-view";
import { IntegrationOverviewDTO } from "@/modules/integration/domain/integration-types";

// Mock server actions
vi.mock("@/app/actions/integration-actions", () => ({
  testServiceConnectionAction: vi.fn().mockResolvedValue({
    success: true,
    message: "Koneksi WhatsApp Gateway Siap!",
    durationMs: 45,
  }),
  testWebhookEndpointAction: vi.fn().mockResolvedValue({
    success: true,
    statusCode: 200,
    durationMs: 30,
    message: "Ping berhasil",
  }),
  deleteWebhookEndpointAction: vi.fn().mockResolvedValue({ success: true }),
  updateIntegrationConfigAction: vi.fn().mockResolvedValue({ success: true }),
  createWebhookEndpointAction: vi.fn().mockResolvedValue({ success: true }),
  retryFailedDeliveryAction: vi.fn().mockResolvedValue({
    success: true,
    statusCode: 200,
    durationMs: 15,
  }),
}));

const mockData: IntegrationOverviewDTO = {
  adapters: [
    {
      tipe_layanan: "WHATSAPP",
      nama_layanan: "WhatsApp Gateway Notifikasi",
      deskripsi: "Pengiriman otomatis pesan WhatsApp ke nomor wali murid.",
      provider: "WHATSAPP_FONNTE",
      status: "AKTIF",
      terakhir_diuji_pada: "2026-09-17T10:00:00.000Z",
      status_uji_terakhir: "BERHASIL",
      total_kirim_24jam: 25,
      tingkat_keberhasilan_persen: 100,
    },
    {
      tipe_layanan: "PUSH_NOTIFICATION",
      nama_layanan: "Push Notification HP (FCM)",
      deskripsi: "Pengiriman notifikasi instan ke layar smartphone murid.",
      provider: "FCM",
      status: "SIMULASI",
      terakhir_diuji_pada: null,
      status_uji_terakhir: null,
      total_kirim_24jam: 12,
      tingkat_keberhasilan_persen: 100,
    },
  ],
  webhooks: [
    {
      id: "WH_01",
      sekolah_id: "SCH_01",
      nama: "Server Bot Sekolah",
      url_target: "https://bot.sekolah.sch.id/webhook",
      secret_token_masked: "whse...1234",
      event_langganan: ["PRESENSI_SESI_SELESAI", "NILAI_DIPUBLIKASIKAN"],
      status: "AKTIF",
      retry_count_max: 3,
      timeout_detik: 10,
      terakhir_dipicu_pada: "2026-09-17T11:00:00.000Z",
      total_terkirim: 18,
      total_gagal: 0,
      created_at: "2026-09-17T09:00:00.000Z",
      updated_at: "2026-09-17T09:00:00.000Z",
    },
  ],
  recentLogs: [
    {
      id: "LOG_01",
      sekolah_id: "SCH_01",
      tipe_layanan: "WHATSAPP",
      arah: "OUTBOUND",
      event_name: "SISWA_TERCATAT_ALPHA",
      idempotency_key: "idemp_01",
      penerima: "081234567890",
      judul: "Bapak Budi",
      payload_json: JSON.stringify({ pesan: "Ananda tercatat alpha" }),
      respons_status_code: 200,
      respons_body: "fonnte_123",
      status: "SUKSES",
      jumlah_percobaan: 1,
      error_message: null,
      durasi_ms: 120,
      created_at: "2026-09-17T10:15:00.000Z",
      updated_at: "2026-09-17T10:15:00.000Z",
    },
  ],
  statistikGlobal: {
    total_adapter_aktif: 1,
    total_webhook_terdaftar: 1,
    total_pengiriman_hari_ini: 37,
    total_gagal_hari_ini: 0,
  },
};

describe("IntegrationPortalView (Academic Glass UI v1.2)", () => {
  it("merender banner header dan kartu statistik global", () => {
    render(<IntegrationPortalView initialData={mockData} />);

    expect(screen.getByText("Pusat Integrasi & Layanan Eksternal")).toBeInTheDocument();
    expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(1); // Adapter aktif & Webhook terdaftar
    expect(screen.getByText("37")).toBeInTheDocument(); // Total pengiriman
  });

  it("merender daftar kartu adapter katalog pada tab default", () => {
    render(<IntegrationPortalView initialData={mockData} />);

    expect(screen.getByText("WhatsApp Gateway Notifikasi")).toBeInTheDocument();
    expect(screen.getByText("Push Notification HP (FCM)")).toBeInTheDocument();
    expect(screen.getByText("WHATSAPP_FONNTE")).toBeInTheDocument();
  });

  it("berpindah ke tab Endpoint Webhook dan menampilkan daftar webhook", () => {
    render(<IntegrationPortalView initialData={mockData} />);

    const webhookTabBtn = screen.getByRole("button", { name: /Endpoint Webhook/i });
    fireEvent.click(webhookTabBtn);

    expect(screen.getByText("Server Bot Sekolah")).toBeInTheDocument();
    expect(screen.getByText("https://bot.sekolah.sch.id/webhook")).toBeInTheDocument();
    expect(screen.getByText("PRESENSI_SESI_SELESAI")).toBeInTheDocument();
  });

  it("berpindah ke tab Log Pengiriman & Audit Trail", () => {
    render(<IntegrationPortalView initialData={mockData} />);

    const logsTabBtn = screen.getByRole("button", { name: /Log Pengiriman/i });
    fireEvent.click(logsTabBtn);

    expect(screen.getByText("Log Pengiriman & Riwayat Transaksi Integrasi")).toBeInTheDocument();
    expect(screen.getByText("SISWA_TERCATAT_ALPHA")).toBeInTheDocument();
    expect(screen.getByText("081234567890")).toBeInTheDocument();
  });
});
