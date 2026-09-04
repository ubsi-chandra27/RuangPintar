/**
 * Ruang Pintar — M13 Assessment & Gradebook Domain Validation
 */

import { z } from "zod";

export const ASSESSMENT_CATEGORIES = [
  "FORMATIF",
  "SUMATIF",
  "SUMATIF_AKHIR",
  "TUGAS",
  "PRAKTIK",
] as const;

export const ASSESSMENT_TECHNIQUES = [
  "TES_TERTULIS",
  "TES_LISAN",
  "PENUGASAN",
  "KINERJA",
  "PORTOFOLIO",
] as const;

export const ASSESSMENT_STATUSES = ["DRAFT", "PUBLISHED", "FINALIZED", "ARSIP"] as const;

export const GRADE_STATUSES = ["DRAFT", "PUBLISHED", "FINALIZED"] as const;

export const PUBLICATION_AUDIENCES = ["SISWA", "WALI", "SEMUA"] as const;

export const CreateAssessmentSchema = z.object({
  penugasan_mengajar_id: z.string().min(1, "Penugasan mengajar ID wajib diisi"),
  tp_id: z.string().nullish(),
  lingkup_materi_id: z.string().nullish(),
  judul: z
    .string()
    .min(3, "Judul asesmen minimal 3 karakter")
    .max(150, "Judul asesmen maksimal 150 karakter"),
  deskripsi: z.string().max(1000, "Deskripsi maksimal 1000 karakter").nullish(),
  kategori: z.enum(ASSESSMENT_CATEGORIES, {
    message: "Kategori asesmen tidak sah",
  }),
  teknik_penilaian: z.enum(ASSESSMENT_TECHNIQUES, {
    message: "Teknik penilaian tidak sah",
  }),
  bobot: z.coerce.number().min(0.1, "Bobot minimal 0.1").max(100, "Bobot maksimal 100").default(1),
  skala_maksimal: z.coerce
    .number()
    .min(10, "Skala maksimal minimal 10")
    .max(1000, "Skala maksimal maksimal 1000")
    .default(100),
  kkm_kktp: z.coerce.number().min(0, "KKTP minimal 0").max(100, "KKTP maksimal 100").default(75),
  tanggal_pelaksanaan: z.string().optional(),
});

export const UpdateAssessmentSchema = z.object({
  judul: z
    .string()
    .min(3, "Judul asesmen minimal 3 karakter")
    .max(150, "Judul asesmen maksimal 150 karakter")
    .optional(),
  deskripsi: z.string().max(1000, "Deskripsi maksimal 1000 karakter").nullish(),
  kategori: z.enum(ASSESSMENT_CATEGORIES).optional(),
  teknik_penilaian: z.enum(ASSESSMENT_TECHNIQUES).optional(),
  bobot: z.coerce.number().min(0.1).max(100).optional(),
  skala_maksimal: z.coerce.number().min(10).max(1000).optional(),
  kkm_kktp: z.coerce.number().min(0).max(100).optional(),
  tanggal_pelaksanaan: z.string().optional(),
  status: z.enum(ASSESSMENT_STATUSES).optional(),
});

export const GradeItemSchema = z.object({
  siswa_id: z.string().min(1, "Siswa ID wajib diisi"),
  penempatan_rombel_id: z.string().nullish(),
  // Nilai angka nullable (Missing Grade ≠ Zero Grade)
  nilai_angka: z
    .union([
      z.coerce.number().min(0, "Nilai minimal 0").max(100, "Nilai maksimal 100"),
      z.null(),
      z.literal("").transform(() => null),
    ])
    .nullable(),
  capaian_kompetensi: z.string().max(500).nullish(),
  catatan: z.string().max(500).nullish(),
  status: z.enum(GRADE_STATUSES).optional().default("DRAFT"),
  alasan_koreksi: z.string().max(300).nullish(),
});

export const BulkSaveGradesSchema = z.object({
  asesmen_id: z.string().min(1, "Asesmen ID wajib diisi"),
  grades: z.array(GradeItemSchema).min(1, "Minimal satu data nilai siswa"),
  alasan_koreksi: z.string().max(300).nullish(),
});

export const PublishAssessmentSchema = z.object({
  asesmen_id: z.string().min(1, "Asesmen ID wajib diisi"),
  target_audience: z.enum(PUBLICATION_AUDIENCES).default("SEMUA"),
  catatan: z.string().max(500).nullish(),
});
