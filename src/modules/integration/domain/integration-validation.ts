/**
 * Ruang Pintar — M20 Integration Domain Validation Schemas (Zod)
 */

import { z } from "zod";

export const updateIntegrationConfigSchema = z.object({
  tipe_layanan: z.enum([
    "WHATSAPP",
    "PUSH_NOTIFICATION",
    "EMAIL",
    "STORAGE",
    "CALENDAR",
    "WEBHOOK",
  ]),
  nama_konfigurasi: z.string().min(3, "Nama konfigurasi minimal 3 karakter"),
  provider: z.enum([
    "WHATSAPP_FONNTE",
    "WHATSAPP_META",
    "FCM",
    "RESEND",
    "SMTP",
    "S3",
    "LOCAL_DISK",
    "CUSTOM_WEBHOOK",
  ]),
  status: z.enum(["AKTIF", "NONAKTIF", "SIMULASI"]).default("AKTIF"),
  kredensial: z.record(z.string(), z.string()).optional(),
  parameter: z.record(z.string(), z.any()).optional(),
});

export type UpdateIntegrationConfigInput = z.infer<typeof updateIntegrationConfigSchema>;

export const createWebhookEndpointSchema = z.object({
  nama: z.string().min(3, "Nama webhook minimal 3 karakter"),
  url_target: z.string().url("URL webhook harus berupa format URL valid (https/http)"),
  event_langganan: z.array(z.string()).min(1, "Minimal pilih 1 event langganan"),
  status: z.enum(["AKTIF", "NONAKTIF"]).default("AKTIF"),
  retry_count_max: z.number().int().min(1).max(5).default(3),
  timeout_detik: z.number().int().min(3).max(30).default(10),
});

export type CreateWebhookEndpointInput = z.infer<typeof createWebhookEndpointSchema>;

export const updateWebhookEndpointSchema = createWebhookEndpointSchema.partial();
export type UpdateWebhookEndpointInput = z.infer<typeof updateWebhookEndpointSchema>;

export const testWebhookEndpointSchema = z.object({
  endpoint_id: z.string().min(1, "Endpoint ID wajib diisi"),
});
