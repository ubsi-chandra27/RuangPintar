/**
 * Ruang Pintar — Module M19: Reporting & Analytics Validation Schemas
 */

import { z } from "zod";

export const reportFilterSchema = z.object({
  rombel_id: z.string().optional().nullable(),
  tingkat_kelas_id: z.string().optional().nullable(),
  mata_pelajaran_id: z.string().optional().nullable(),
  program_keahlian_id: z.string().optional().nullable(),
  tanggal_mulai: z.string().optional().nullable(),
  tanggal_selesai: z.string().optional().nullable(),
});

export const exportReportSchema = z.object({
  tipe_laporan: z.enum(["PRESENSI", "NILAI_AKADEMIK", "KURIKULUM", "KESISWAAN", "EKSEKUTIF"]),
  format: z.enum(["CSV", "PRINT_A4", "PDF"]).default("CSV"),
  judul: z.string().min(3, "Judul laporan minimal 3 karakter"),
  filters: reportFilterSchema.optional(),
});

export type ExportReportInput = z.infer<typeof exportReportSchema>;
export type ReportFilterInput = z.infer<typeof reportFilterSchema>;
