/**
 * Ruang Pintar — M17 Notification Validation Schemas (Zod)
 */

import { z } from "zod";

export const NotificationTypeEnum = z.enum([
  "PENGUMUMAN_BARU",
  "TUGAS_BARU",
  "NILAI_DITERBITKAN",
  "PENGAJUAN_IZIN",
  "JADWAL_BERUBAH",
  "SISTEM",
]);

export const MarkNotificationReadSchema = z.object({
  notification_id: z.string().trim().min(1, "ID notifikasi wajib diisi"),
});

export const UpdateNotificationPreferenceSchema = z.object({
  in_app_aktif: z.boolean().optional(),
  whatsapp_aktif: z.boolean().optional(),
  email_aktif: z.boolean().optional(),
  notif_pengumuman: z.boolean().optional(),
  notif_tugas: z.boolean().optional(),
  notif_nilai: z.boolean().optional(),
  notif_presensi: z.boolean().optional(),
});
