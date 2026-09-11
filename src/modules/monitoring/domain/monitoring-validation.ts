/**
 * Ruang Pintar — M18 Student Monitoring Validation Schemas
 */

import { z } from "zod";

export const createMonitoringNoteSchema = z.object({
  rombel_id: z.string().min(1, "ID Rombel wajib diisi"),
  siswa_id: z.string().min(1, "Siswa wajib dipilih"),
  judul: z
    .string()
    .min(3, "Judul catatan minimal 3 karakter")
    .max(200, "Judul catatan maksimal 200 karakter"),
  isi: z.string().min(5, "Isi catatan minimal 5 karakter"),
  kategori: z
    .enum(["AKADEMIK", "KEHADIRAN", "PERILAKU", "KESEHATAN", "SOSIAL", "LAINNYA"])
    .default("AKADEMIK"),
  tingkat_urgensi: z.enum(["RENDAH", "SEDANG", "TINGGI", "KRITIS"]).default("SEDANG"),
  tindak_lanjut_tindakan: z.string().optional().nullable(),
  tindak_lanjut_target_tanggal: z.string().optional().nullable(),
});

export const updateMonitoringNoteSchema = z.object({
  id: z.string().min(1, "ID Catatan wajib diisi"),
  judul: z.string().min(3).max(200).optional(),
  isi: z.string().min(5).optional(),
  kategori: z
    .enum(["AKADEMIK", "KEHADIRAN", "PERILAKU", "KESEHATAN", "SOSIAL", "LAINNYA"])
    .optional(),
  tingkat_urgensi: z.enum(["RENDAH", "SEDANG", "TINGGI", "KRITIS"]).optional(),
  status: z.enum(["AKTIF", "SELESAI", "DIARSIPKAN"]).optional(),
});

export const createFollowUpSchema = z.object({
  catatan_id: z.string().min(1, "ID Catatan wajib diisi"),
  tindakan: z.string().min(3, "Deskripsi tindakan minimal 3 karakter"),
  target_tanggal: z.string().optional().nullable(),
  penanggung_jawab_id: z.string().optional().nullable(),
});

export const updateFollowUpStatusSchema = z.object({
  id: z.string().min(1, "ID Tindak Lanjut wajib diisi"),
  status: z.enum(["DIRENCANAKAN", "PROSES", "SELESAI", "DIBATALKAN"]),
  hasil: z.string().optional().nullable(),
  tanggal_penyelesaian: z.string().optional().nullable(),
});

export type CreateMonitoringNoteSchemaInput = z.input<typeof createMonitoringNoteSchema>;
export type UpdateMonitoringNoteSchemaInput = z.input<typeof updateMonitoringNoteSchema>;
export type CreateFollowUpSchemaInput = z.input<typeof createFollowUpSchema>;
export type UpdateFollowUpStatusSchemaInput = z.input<typeof updateFollowUpStatusSchema>;
