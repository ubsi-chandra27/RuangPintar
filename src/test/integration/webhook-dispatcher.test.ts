/**
 * Ruang Pintar — Webhook Dispatcher Unit Tests (M20 Integration)
 */

import { describe, it, expect } from "vitest";
import { WebhookDispatcher } from "@/modules/integration/infrastructure/adapters/webhook-dispatcher";

describe("WebhookDispatcher — HMAC-SHA256 & Anti-Replay Verification (M20)", () => {
  const secret = "whsec_test_secret_key_123456789";
  const payload = JSON.stringify({ event: "PRESENSI_SESI_SELESAI", rombel: "X RPL" });

  it("berhasil menghasilkan signature berformat t={timestamp},v1={hash}", () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const sig = WebhookDispatcher.generateSignature(payload, secret, timestamp);

    expect(sig).toContain(`t=${timestamp}`);
    expect(sig).toContain("v1=");
    expect(sig.split(",").length).toBe(2);
  });

  it("memverifikasi signature valid secara sukses", () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const sig = WebhookDispatcher.generateSignature(payload, secret, timestamp);

    const isValid = WebhookDispatcher.verifySignature(payload, secret, sig);
    expect(isValid).toBe(true);
  });

  it("menolak signature yang dihasilkan dengan secret token yang salah", () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const sig = WebhookDispatcher.generateSignature(payload, "wrong_secret_token", timestamp);

    const isValid = WebhookDispatcher.verifySignature(payload, secret, sig);
    expect(isValid).toBe(false);
  });

  it("menolak signature jika payload telah dimanipulasi (tampered)", () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const sig = WebhookDispatcher.generateSignature(payload, secret, timestamp);

    const tamperedPayload = JSON.stringify({ event: "PRESENSI_SESI_SELESAI", rombel: "X TO 1" });
    const isValid = WebhookDispatcher.verifySignature(tamperedPayload, secret, sig);
    expect(isValid).toBe(false);
  });

  it("menolak signature replay attack jika timestamp melebihi batas toleransi", () => {
    const oldTimestamp = Math.floor(Date.now() / 1000) - 600; // 10 menit lalu (toleransi 5 menit)
    const sig = WebhookDispatcher.generateSignature(payload, secret, oldTimestamp);

    const isValid = WebhookDispatcher.verifySignature(payload, secret, sig, 300);
    expect(isValid).toBe(false);
  });

  it("mengirimkan webhook simulasi secara sukses", async () => {
    const dispatcher = new WebhookDispatcher();
    const result = await dispatcher.dispatch("https://example.com/webhook", secret, "TEST_EVENT", {
      message: "Halo",
    });

    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });
});
