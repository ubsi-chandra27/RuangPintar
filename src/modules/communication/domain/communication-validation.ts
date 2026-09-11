/**
 * Ruang Pintar — M16 Communication Validation Schemas (Zod)
 */

import { z } from "zod";

export const AnnouncementCategoryEnum = z.enum([
  "UMUM",
  "AKADEMIK",
  "KEGIATAN",
  "PENTING",
  "DARURAT",
]);
export const AnnouncementStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARSIP"]);
export const AudienceTargetEnum = z.enum(["SEMUA", "GURU", "SISWA", "WALI", "ROMBEL"]);

export const CreateAnnouncementSchema = z
  .object({
    judul: z
      .string()
      .trim()
      .min(3, "Judul pengumuman minimal 3 karakter")
      .max(200, "Judul pengumuman maksimal 200 karakter"),
    konten: z.string().trim().min(10, "Isi pengumuman minimal 10 karakter"),
    kategori: AnnouncementCategoryEnum.default("UMUM"),
    target_audiens: AudienceTargetEnum.default("SEMUA"),
    target_rombel_id: z.string().trim().nullable().optional(),
    apakah_disematkan: z.boolean().default(false),
    lampiran_url: z.string().trim().nullable().optional(),
    status: AnnouncementStatusEnum.default("DRAFT"),
  })
  .refine(
    (data) => {
      if (data.target_audiens === "ROMBEL" && !data.target_rombel_id) {
        return false;
      }
      return true;
    },
    {
      message: "Target rombel spesifik wajib dipilih jika target audiens adalah Rombel",
      path: ["target_rombel_id"],
    }
  );

export const UpdateAnnouncementSchema = z
  .object({
    judul: z
      .string()
      .trim()
      .min(3, "Judul pengumuman minimal 3 karakter")
      .max(200, "Judul pengumuman maksimal 200 karakter")
      .optional(),
    konten: z.string().trim().min(10, "Isi pengumuman minimal 10 karakter").optional(),
    kategori: AnnouncementCategoryEnum.optional(),
    target_audiens: AudienceTargetEnum.optional(),
    target_rombel_id: z.string().trim().nullable().optional(),
    apakah_disematkan: z.boolean().optional(),
    lampiran_url: z.string().trim().nullable().optional(),
    status: AnnouncementStatusEnum.optional(),
  })
  .refine(
    (data) => {
      if (data.target_audiens === "ROMBEL" && !data.target_rombel_id) {
        return false;
      }
      return true;
    },
    {
      message: "Target rombel spesifik wajib dipilih jika target audiens adalah Rombel",
      path: ["target_rombel_id"],
    }
  );

export type CreateAnnouncementSchemaType = z.infer<typeof CreateAnnouncementSchema>;
export type UpdateAnnouncementSchemaType = z.infer<typeof UpdateAnnouncementSchema>;
