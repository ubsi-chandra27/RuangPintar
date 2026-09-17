/**
 * Ruang Pintar — Integration Service Integration Tests (M20)
 */

import { describe, it, expect, beforeAll } from "vitest";
import { integrationService } from "@/modules/integration/application/integration-service";
import { prisma } from "@/shared/infrastructure/database/prisma";

describe("IntegrationService (M20 Integration Foundation)", () => {
  let testSchoolId: string;
  let testUserId: string;

  beforeAll(async () => {
    const school = await prisma.sekolah.findFirst();
    if (!school) throw new Error("Sekolah test tidak ditemukan.");
    testSchoolId = school.id;

    const user = await prisma.pengguna.findFirst({
      where: { peran_dasar: "SUPER_ADMIN" },
    });
    if (!user) throw new Error("Super admin test tidak ditemukan.");
    testUserId = user.id;
  });

  it("berhasil mengambil gambaran overview katalog integrasi", async () => {
    const overview = await integrationService.getIntegrationOverview(testSchoolId);

    expect(overview).toBeDefined();
    expect(overview.adapters.length).toBe(5);
    expect(overview.adapters.some((a) => a.tipe_layanan === "WHATSAPP")).toBe(true);
    expect(overview.adapters.some((a) => a.tipe_layanan === "PUSH_NOTIFICATION")).toBe(true);
    expect(overview.adapters.some((a) => a.tipe_layanan === "EMAIL")).toBe(true);
    expect(overview.adapters.some((a) => a.tipe_layanan === "STORAGE")).toBe(true);
    expect(overview.adapters.some((a) => a.tipe_layanan === "WEBHOOK")).toBe(true);
    expect(overview.statistikGlobal).toBeDefined();
  });

  it("berhasil memperbarui konfigurasi adapter WhatsApp", async () => {
    const updated = await integrationService.updateConfig(testSchoolId, testUserId, {
      tipe_layanan: "WHATSAPP",
      nama_konfigurasi: "WhatsApp Gateway Fonnte Utama",
      provider: "WHATSAPP_FONNTE",
      status: "SIMULASI",
      kredensial: { api_key: "sim_test_key_123" },
      parameter: { sender: "081234567890" },
    });

    expect(updated).toBeDefined();
    expect(updated.tipe_layanan).toBe("WHATSAPP");
    expect(updated.provider).toBe("WHATSAPP_FONNTE");
    expect(updated.status).toBe("SIMULASI");
  });

  it("menguji konektivitas WhatsApp dan Push Notification secara sukses", async () => {
    const waRes = await integrationService.testServiceConnection(testSchoolId, "WHATSAPP");
    expect(waRes.success).toBe(true);
    expect(waRes.durationMs).toBeGreaterThanOrEqual(0);

    const fcmRes = await integrationService.testServiceConnection(
      testSchoolId,
      "PUSH_NOTIFICATION"
    );
    expect(fcmRes.success).toBe(true);
    expect(fcmRes.durationMs).toBeGreaterThanOrEqual(0);

    const emailRes = await integrationService.testServiceConnection(testSchoolId, "EMAIL");
    expect(emailRes.success).toBe(true);
  });

  it("mengirimkan pesan WhatsApp dengan pencatatan audit log & idempotency", async () => {
    const key = `idemp_wa_test_${Date.now()}`;
    const result = await integrationService.sendWhatsApp({
      sekolah_id: testSchoolId,
      nomor_tujuan: "081298765432",
      nama_penerima: "Bapak Budi",
      pesan: "Pemberitahuan presensi siswa.",
      event_name: "SISWA_TERCATAT_ALPHA",
      idempotency_key: key,
    });

    expect(result.success).toBe(true);

    // Pengiriman ulang dengan key yang sama harus idempotent (tidak duplikasi)
    const duplicate = await integrationService.sendWhatsApp({
      sekolah_id: testSchoolId,
      nomor_tujuan: "081298765432",
      pesan: "Pemberitahuan presensi siswa.",
      event_name: "SISWA_TERCATAT_ALPHA",
      idempotency_key: key,
    });

    expect(duplicate.success).toBe(true);
  });

  it("mengirimkan Push Notification ke HP murid / wali murid", async () => {
    const key = `idemp_fcm_test_${Date.now()}`;
    const result = await integrationService.sendPushNotification({
      sekolah_id: testSchoolId,
      user_id: testUserId,
      judul: "Tugas Baru Diterbitkan",
      isi: "Pak Guru menerbitkan tugas Pemrograman Web.",
      action_url: "/tugas-siswa",
      event_name: "TUGAS_BARU_DITERBITKAN",
      idempotency_key: key,
    });

    expect(result.success).toBe(true);
    expect(result.multicast_id).toBeDefined();
  });

  it("melakukan lifecycle lengkap endpoint webhook (create -> test -> delete)", async () => {
    // 1. Create
    const created = await integrationService.createWebhook(testSchoolId, testUserId, {
      nama: "Webhook Bot Dinas",
      url_target: "https://example.com/api/webhook",
      event_langganan: ["PRESENSI_SESI_SELESAI", "NILAI_DIPUBLIKASIKAN"],
      status: "AKTIF",
      retry_count_max: 3,
      timeout_detik: 10,
    });

    expect(created.id).toBeDefined();
    expect(created.nama).toBe("Webhook Bot Dinas");
    expect(created.event_langganan.length).toBe(2);

    // 2. Test Ping
    const testResult = await integrationService.testWebhookEndpoint(testSchoolId, created.id);
    expect(testResult.success).toBe(true);
    expect(testResult.statusCode).toBe(200);

    // 3. Delete
    const deleteRes = await integrationService.deleteWebhook(testSchoolId, created.id, testUserId);
    expect(deleteRes.success).toBe(true);
  });
});
