/**
 * Ruang Pintar — Seed Data for M20 Integration Foundation
 */

import { PrismaClient } from "@prisma/client";
import { ulid } from "ulidx";

const prisma = new PrismaClient();

async function main() {
  await prisma.$queryRawUnsafe("PRAGMA busy_timeout = 10000;");
  console.log("Seeding Integration Foundation (M20)...");

  const sekolah = await prisma.sekolah.findFirst();
  if (!sekolah) {
    console.log("Tidak ada sekolah ditemukan.");
    return;
  }

  // 1. Seed Konfigurasi Integrasi Default
  const configs = [
    {
      tipe_layanan: "WHATSAPP",
      nama_konfigurasi: "WhatsApp Gateway Notifikasi (Fonnte)",
      provider: "WHATSAPP_FONNTE",
      status: "SIMULASI",
      kredensial_json: JSON.stringify({ api_key: "sim_fonnte_dev_key" }),
      parameter_json: JSON.stringify({ sender: "081234567890", quota: 1000 }),
    },
    {
      tipe_layanan: "PUSH_NOTIFICATION",
      nama_konfigurasi: "Firebase Cloud Messaging (FCM)",
      provider: "FCM",
      status: "SIMULASI",
      kredensial_json: JSON.stringify({ server_key: "sim_fcm_server_key" }),
      parameter_json: JSON.stringify({ sender_id: "1234567890" }),
    },
    {
      tipe_layanan: "EMAIL",
      nama_konfigurasi: "Resend Email Gateway",
      provider: "RESEND",
      status: "SIMULASI",
      kredensial_json: JSON.stringify({ api_key: "sim_resend_dev_key" }),
      parameter_json: JSON.stringify({ sender: "notifikasi@ruangpintar.sch.id" }),
    },
    {
      tipe_layanan: "STORAGE",
      nama_konfigurasi: "Penyimpanan Lokal Dokumen",
      provider: "LOCAL_DISK",
      status: "AKTIF",
      kredensial_json: null,
      parameter_json: JSON.stringify({ max_upload_mb: 25 }),
    },
    {
      tipe_layanan: "WEBHOOK",
      nama_konfigurasi: "Custom Webhook Dispatcher",
      provider: "CUSTOM_WEBHOOK",
      status: "AKTIF",
      kredensial_json: null,
      parameter_json: JSON.stringify({ timeout_seconds: 10 }),
    },
  ];

  for (const c of configs) {
    await prisma.konfigurasiIntegrasi.upsert({
      where: {
        sekolah_id_tipe_layanan_provider: {
          sekolah_id: sekolah.id,
          tipe_layanan: c.tipe_layanan,
          provider: c.provider,
        },
      },
      update: {
        nama_konfigurasi: c.nama_konfigurasi,
        status: c.status,
        kredensial_json: c.kredensial_json,
        parameter_json: c.parameter_json,
      },
      create: {
        id: ulid(),
        sekolah_id: sekolah.id,
        tipe_layanan: c.tipe_layanan,
        nama_konfigurasi: c.nama_konfigurasi,
        provider: c.provider,
        status: c.status,
        kredensial_json: c.kredensial_json,
        parameter_json: c.parameter_json,
      },
    });
  }

  // 2. Seed Webhook Endpoint
  const existingWebhook = await prisma.endpointWebhook.findFirst({
    where: { sekolah_id: sekolah.id, nama: "Bot WhatsApp Notifikasi Sekolah" },
  });

  if (!existingWebhook) {
    await prisma.endpointWebhook.create({
      data: {
        id: ulid(),
        sekolah_id: sekolah.id,
        nama: "Bot WhatsApp Notifikasi Sekolah",
        url_target: "https://api.sekolah-otomindo.sch.id/webhook/notifikasi",
        secret_token: `whsec_${ulid().toLowerCase()}`,
        event_langganan_json: JSON.stringify([
          "PRESENSI_SESI_SELESAI",
          "SISWA_TERCATAT_ALPHA",
          "TUGAS_BARU_DITERBITKAN",
        ]),
        status: "AKTIF",
        retry_count_max: 3,
        timeout_detik: 10,
        total_terkirim: 42,
        total_gagal: 0,
      },
    });
  }

  // 3. Seed Sample Delivery Logs
  const existingLog = await prisma.logPengirimanIntegrasi.findFirst({
    where: { sekolah_id: sekolah.id },
  });

  if (!existingLog) {
    await prisma.logPengirimanIntegrasi.createMany({
      data: [
        {
          id: ulid(),
          sekolah_id: sekolah.id,
          tipe_layanan: "WHATSAPP",
          arah: "OUTBOUND",
          event_name: "SISWA_TERCATAT_ALPHA",
          idempotency_key: `seed_wa_${Date.now()}_1`,
          penerima: "081287654301",
          judul: "Bapak Budi Fauzi (Wali Rian Pratama)",
          payload_json: JSON.stringify({
            pesan: "Pemberitahuan: Rian Pratama tercatat tidak hadir pada sesi jam ke-1.",
            waktu: new Date().toISOString(),
          }),
          respons_status_code: 200,
          respons_body: '{"status":true,"id":"wa_sim_msg_01"}',
          status: "SUKSES",
          jumlah_percobaan: 1,
          durasi_ms: 115,
        },
        {
          id: ulid(),
          sekolah_id: sekolah.id,
          tipe_layanan: "PUSH_NOTIFICATION",
          arah: "OUTBOUND",
          event_name: "TUGAS_BARU_DITERBITKAN",
          idempotency_key: `seed_fcm_${Date.now()}_2`,
          penerima: "Topic: X RPL",
          judul: "Tugas Baru: Pemrograman Web",
          payload_json: JSON.stringify({
            judul: "Tugas Baru: Pemrograman Web",
            deadline: "Besok 23:59",
          }),
          respons_status_code: 200,
          respons_body: '{"multicast_id":"fcm_sim_01"}',
          status: "SUKSES",
          jumlah_percobaan: 1,
          durasi_ms: 68,
        },
      ],
    });
  }

  console.log("Integration Foundation (M20) seeded successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  });
