/**
 * Ruang Pintar — M11 Learning Zod Validation Schemas
 */

import { z } from "zod";

export const CreateLingkupMateriSchema = z.object({
  sekolah_id: z.string().min(1, "ID Sekolah wajib diisi"),
  penugasan_mengajar_id: z.string().min(1, "ID Penugasan Mengajar wajib diisi"),
  kode: z.string().trim().max(30).optional().nullable(),
  judul: z.string().trim().min(2, "Judul BAB / Lingkup Materi minimal 2 karakter").max(200),
  deskripsi: z.string().trim().max(1000).optional().nullable(),
  urutan: z.coerce.number().int().min(1).default(1),
});

export const UpdateLingkupMateriSchema = z.object({
  kode: z.string().trim().max(30).optional().nullable(),
  judul: z
    .string()
    .trim()
    .min(2, "Judul BAB / Lingkup Materi minimal 2 karakter")
    .max(200)
    .optional(),
  deskripsi: z.string().trim().max(1000).optional().nullable(),
  urutan: z.coerce.number().int().min(1).optional(),
  status: z.enum(["AKTIF", "NONAKTIF", "ARSIP"]).optional(),
});

export const CreateTujuanPembelajaranSchema = z.object({
  sekolah_id: z.string().min(1, "ID Sekolah wajib diisi"),
  lingkup_materi_id: z.string().min(1, "ID Lingkup Materi wajib diisi"),
  kode: z.string().trim().max(30).optional().nullable(),
  deskripsi: z.string().trim().min(5, "Deskripsi Tujuan Pembelajaran minimal 5 karakter").max(500),
  urutan: z.coerce.number().int().min(1).default(1),
});

export const UpdateTujuanPembelajaranSchema = z.object({
  kode: z.string().trim().max(30).optional().nullable(),
  deskripsi: z
    .string()
    .trim()
    .min(5, "Deskripsi Tujuan Pembelajaran minimal 5 karakter")
    .max(500)
    .optional(),
  urutan: z.coerce.number().int().min(1).optional(),
  status: z.enum(["AKTIF", "NONAKTIF"]).optional(),
});

export const CreateMateriSchema = z.object({
  sekolah_id: z.string().min(1, "ID Sekolah wajib diisi"),
  guru_id: z.string().min(1, "ID Guru wajib diisi"),
  penugasan_mengajar_id: z.string().min(1, "ID Penugasan Mengajar wajib diisi"),
  lingkup_materi_id: z.string().optional().nullable(),
  mata_pelajaran_id: z.string().optional().nullable(),
  judul: z.string().trim().min(2, "Judul materi minimal 2 karakter").max(200),
  deskripsi: z.string().trim().max(1000).optional().nullable(),
  tipe_konten: z.enum(["DOKUMEN", "TEKS", "TAUTAN", "VIDEO"]).default("DOKUMEN"),
  konten_teks: z.string().optional().nullable(),
  tautan_url: z.string().url("URL tidak valid").optional().nullable().or(z.literal("")),
  berkas_id: z.string().optional().nullable(),
  publish_langsung: z.boolean().default(true),
});

export const UpdateMateriSchema = z.object({
  lingkup_materi_id: z.string().optional().nullable(),
  judul: z.string().trim().min(2, "Judul materi minimal 2 karakter").max(200).optional(),
  deskripsi: z.string().trim().max(1000).optional().nullable(),
  tipe_konten: z.enum(["DOKUMEN", "TEKS", "TAUTAN", "VIDEO"]).optional(),
  konten_teks: z.string().optional().nullable(),
  tautan_url: z.string().url("URL tidak valid").optional().nullable().or(z.literal("")),
  berkas_id: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARSIP"]).optional(),
});

export const CreateTugasSchema = z.object({
  sekolah_id: z.string().min(1, "ID Sekolah wajib diisi"),
  guru_id: z.string().min(1, "ID Guru wajib diisi"),
  penugasan_mengajar_id: z.string().min(1, "ID Penugasan Mengajar wajib diisi"),
  lingkup_materi_id: z.string().optional().nullable(),
  mata_pelajaran_id: z.string().optional().nullable(),
  judul: z.string().trim().min(2, "Judul tugas minimal 2 karakter").max(200),
  petunjuk: z.string().trim().min(5, "Petunjuk tugas minimal 5 karakter"),
  tipe_penyerahan: z.enum(["FILE", "TEKS", "DARING"]).default("FILE"),
  berkas_id: z.string().optional().nullable(),
  tanggal_mulai: z.coerce.date().default(() => new Date()),
  batas_waktu: z.coerce.date().optional().nullable(),
  izinkan_terlambat: z.boolean().default(false),
});

export const CreateAdministrasiSchema = z.object({
  sekolah_id: z.string().min(1, "ID Sekolah wajib diisi"),
  penugasan_mengajar_id: z.string().min(1, "ID Penugasan Mengajar wajib diisi"),
  sesi_kelas_aktual_id: z.string().optional().nullable(),
  guru_id: z.string().min(1, "ID Guru wajib diisi"),
  tanggal: z.coerce.date().default(() => new Date()),
  pertemuan_ke: z.coerce.number().int().min(1, "Pertemuan ke- harus berupa angka positif"),
  materi_disampaikan: z.string().trim().min(3, "Materi yang disampaikan minimal 3 karakter"),
  kegiatan_pembelajaran: z.string().trim().max(1500).optional().nullable(),
  catatan_refleksi: z.string().trim().max(1000).optional().nullable(),
  status_realisasi: z.enum(["TERLAKSANA", "TERTUNDA", "DIGANTI"]).default("TERLAKSANA"),
  tp_ids: z.array(z.string()).default([]),
});

export const UpdateAdministrasiSchema = z.object({
  tanggal: z.coerce.date().optional(),
  pertemuan_ke: z.coerce.number().int().min(1).optional(),
  materi_disampaikan: z.string().trim().min(3).optional(),
  kegiatan_pembelajaran: z.string().trim().max(1500).optional().nullable(),
  catatan_refleksi: z.string().trim().max(1000).optional().nullable(),
  status_realisasi: z.enum(["TERLAKSANA", "TERTUNDA", "DIGANTI"]).optional(),
  tp_ids: z.array(z.string()).optional(),
});
