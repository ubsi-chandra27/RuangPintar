/**
 * Ruang Pintar — Student Experience Validation Schemas (Phase 15 / M15)
 */

import { z } from "zod";

export const SubmitAssignmentSchema = z
  .object({
    publikasi_tugas_id: z
      .string()
      .min(1, "ID publikasi tugas wajib diisi")
      .max(36, "ID publikasi tugas tidak valid"),
    teks_jawaban: z
      .string()
      .max(10000, "Teks jawaban tidak boleh melebihi 10.000 karakter")
      .optional()
      .nullable(),
    berkas_id: z.string().max(36, "ID berkas tidak valid").optional().nullable(),
    catatan_siswa: z
      .string()
      .max(500, "Catatan siswa tidak boleh melebihi 500 karakter")
      .optional()
      .nullable(),
  })
  .refine((data) => (data.teks_jawaban && data.teks_jawaban.trim().length > 0) || data.berkas_id, {
    message: "Harap sertakan teks jawaban atau unggah berkas jawaban tugas.",
    path: ["teks_jawaban"],
  });

export type SubmitAssignmentInput = z.infer<typeof SubmitAssignmentSchema>;
