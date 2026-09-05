/**
 * Ruang Pintar — CBT Validation Schemas (M14)
 */

import { z } from "zod";

export const CreateBankSoalSchema = z.object({
  mata_pelajaran_id: z.string().optional().nullable(),
  lingkup_materi_id: z.string().optional().nullable(),
  tujuan_pembelajaran_id: z.string().optional().nullable(),
  kode: z.string().optional().nullable(),
  jenis_soal: z.enum([
    "PILIHAN_GANDA",
    "PILIHAN_GANDA_KOMPLEKS",
    "BENAR_SALAH",
    "MENJODOHKAN",
    "ISIAN_SINGKAT",
    "URAIAN_ESAI",
    "ESAI",
  ]),
  tingkat_kesulitan: z.enum(["MUDAH", "SEDANG", "SULIT", "HOTS"]).default("SEDANG"),
  bobot_default: z.number().min(0.1).default(1.0),
  pertanyaan: z.string().min(1, "Pertanyaan wajib diisi"),
  gambar_url: z.string().optional().nullable(),
  opsi: z.any().optional().nullable(),
  kunci_jawaban: z.any(),
});

export const CreateVersiSoalSchema = z.object({
  pertanyaan: z.string().min(1, "Pertanyaan versi baru wajib diisi"),
  gambar_url: z.string().optional().nullable(),
  opsi: z.any().optional().nullable(),
  kunci_jawaban: z.any(),
  bobot: z.number().min(0.1).optional(),
  alasan_perubahan: z.string().optional().nullable(),
});

export const CreateUjianCbtSchema = z.object({
  penugasan_mengajar_id: z.string().min(1, "Penugasan mengajar wajib dipilih"),
  judul: z.string().min(1, "Judul ujian wajib diisi"),
  deskripsi: z.string().optional().nullable(),
  durasi_menit: z
    .number()
    .int()
    .min(5, "Durasi minimal 5 menit")
    .max(360, "Durasi maksimal 360 menit"),
  kktp: z.number().min(0).max(100).default(75),
  acak_soal: z.boolean().default(false),
  acak_opsi: z.boolean().default(false),
  gunakan_token: z.boolean().default(false),
  token_masuk: z.string().optional().nullable(),
  tampilkan_nilai: z.boolean().default(true),
  waktu_mulai: z.coerce.date().optional().nullable(),
  waktu_selesai: z.coerce.date().optional().nullable(),
  blueprint_soal: z
    .array(
      z.object({
        bank_soal_id: z.string().min(1),
        nomor_urut: z.number().int().min(1),
        bobot_kustom: z.number().min(0.1).optional(),
      })
    )
    .min(1, "Minimal pilih 1 butir soal untuk menyusun ujian"),
});

export const AutosaveJawabanSchema = z.object({
  sesi_ujian_siswa_id: z.string().min(1),
  nomor_urut: z.number().int().min(1),
  jawaban_pilihan: z.string().optional().nullable(),
  jawaban_teks: z.string().optional().nullable(),
  jawaban_kompleks: z.array(z.string()).optional().nullable(),
  jawaban_menjodohkan: z.record(z.string(), z.string()).optional().nullable(),
  ragu_ragu: z.boolean().optional(),
});

export const RecordIntegrityEventSchema = z.object({
  sesi_ujian_siswa_id: z.string().min(1),
  nomor_urut_soal: z.number().int().optional().nullable(),
  tipe_event: z.enum([
    "KELUAR_LAYAR_PENUH",
    "PINDAH_TAB_ATAU_WINDOW",
    "PERCOBAAN_DEVTOOLS",
    "KONEKSI_TERPUTUS",
    "LAINNYA",
  ]),
  deskripsi: z.string().min(1, "Deskripsi event integritas wajib diisi"),
  metadata: z.any().optional().nullable(),
});

export const TransferToGradebookSchema = z.object({
  ujian_cbt_id: z.string().min(1),
  nama_asesmen: z.string().min(1, "Nama asesmen di buku nilai wajib diisi"),
  kategori: z.enum(["FORMATIF", "SUMATIF"]),
  jenis_asesmen: z.string().min(1),
  bobot: z.number().min(0.1).default(1.0),
  lingkup_materi_id: z.string().optional().nullable(),
  tujuan_pembelajaran_id: z.string().optional().nullable(),
});

// Inferred Types
export type CreateBankSoalInput = z.infer<typeof CreateBankSoalSchema>;
export type CreateVersiSoalInput = z.infer<typeof CreateVersiSoalSchema>;
export type CreateUjianCbtInput = z.infer<typeof CreateUjianCbtSchema>;
export type AutosaveJawabanInput = z.infer<typeof AutosaveJawabanSchema>;
export type RecordIntegrityEventInput = z.infer<typeof RecordIntegrityEventSchema>;
export type TransferToGradebookInput = z.infer<typeof TransferToGradebookSchema>;

// Backward-compatible alias exports
export const createQuestionSchema = CreateBankSoalSchema;
export const createExamSchema = CreateUjianCbtSchema;
export const saveAnswerSchema = AutosaveJawabanSchema;
export const recordIntegrityEventSchema = RecordIntegrityEventSchema;
export const transferResultSchema = TransferToGradebookSchema;
