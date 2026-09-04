/**
 * Ruang Pintar — M08 Teacher & Teaching Assignment Zod Validation Schemas
 */

import { z } from "zod";

const optionalDateSchema = z.preprocess((val) => {
  if (val === undefined || val === null || val === "") return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (typeof val === "string") {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}, z.date().nullable().optional());

const defaultNowDateSchema = z.preprocess((val) => {
  if (val === undefined || val === null || val === "") return new Date();
  if (val instanceof Date) return isNaN(val.getTime()) ? new Date() : val;
  if (typeof val === "string") {
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date() : d;
  }
  return new Date();
}, z.date());

const lifecycleStatusSchema = z.enum(["AKTIF", "NONAKTIF", "ARSIP"]);
const teachingAssignmentStatusSchema = z.enum([
  "AKTIF",
  "NONAKTIF",
  "DIBATALKAN",
  "SELESAI",
  "ARSIP",
]);

export const CreateTeacherSchema = z.object({
  sekolah_id: z.string().min(1, "ID Sekolah wajib diisi"),
  pengguna_id: z.string().optional().nullable().or(z.literal("")),
  nip: z.string().max(30, "NIP maksimal 30 karakter").optional().nullable().or(z.literal("")),
  nuptk: z.string().max(30, "NUPTK maksimal 30 karakter").optional().nullable().or(z.literal("")),
  nama_lengkap: z
    .string()
    .min(2, "Nama lengkap guru minimal 2 karakter")
    .max(150, "Nama maksimal 150 karakter"),
  gelar_depan: z
    .string()
    .max(20, "Gelar depan maksimal 20 karakter")
    .optional()
    .nullable()
    .or(z.literal("")),
  gelar_belakang: z
    .string()
    .max(30, "Gelar belakang maksimal 30 karakter")
    .optional()
    .nullable()
    .or(z.literal("")),
  jenis_kelamin: z.enum(["L", "P"], {
    message: "Jenis kelamin harus L (Laki-laki) atau P (Perempuan)",
  }),
  tempat_lahir: z.string().max(100).optional().nullable().or(z.literal("")),
  tanggal_lahir: optionalDateSchema,
  email: z.string().email("Format email tidak valid").optional().nullable().or(z.literal("")),
  telepon: z
    .string()
    .max(20, "Nomor telepon maksimal 20 digit")
    .optional()
    .nullable()
    .or(z.literal("")),
  alamat: z
    .string()
    .max(255, "Alamat maksimal 255 karakter")
    .optional()
    .nullable()
    .or(z.literal("")),
  status_kepegawaian: z
    .enum(["TETAP", "HONORER", "KONTRAK", "PNS", "PPPK", "LAINNYA"])
    .default("TETAP"),
  status_aktif: z.boolean().default(true),
  status_lifecycle: lifecycleStatusSchema.default("AKTIF"),
  foto_url: z.string().optional().nullable().or(z.literal("")),
  catatan: z.string().max(500).optional().nullable().or(z.literal("")),
});

export const UpdateTeacherSchema = z.object({
  id: z.string().min(1, "ID Guru wajib diisi"),
  sekolah_id: z.string().min(1, "ID Sekolah wajib diisi"),
  pengguna_id: z.string().optional().nullable().or(z.literal("")),
  nip: z.string().max(30, "NIP maksimal 30 karakter").optional().nullable().or(z.literal("")),
  nuptk: z.string().max(30, "NUPTK maksimal 30 karakter").optional().nullable().or(z.literal("")),
  nama_lengkap: z
    .string()
    .min(2, "Nama lengkap guru minimal 2 karakter")
    .max(150, "Nama maksimal 150 karakter")
    .optional(),
  gelar_depan: z
    .string()
    .max(20, "Gelar depan maksimal 20 karakter")
    .optional()
    .nullable()
    .or(z.literal("")),
  gelar_belakang: z
    .string()
    .max(30, "Gelar belakang maksimal 30 karakter")
    .optional()
    .nullable()
    .or(z.literal("")),
  jenis_kelamin: z.enum(["L", "P"]).optional(),
  tempat_lahir: z.string().max(100).optional().nullable().or(z.literal("")),
  tanggal_lahir: optionalDateSchema,
  email: z.string().email("Format email tidak valid").optional().nullable().or(z.literal("")),
  telepon: z
    .string()
    .max(20, "Nomor telepon maksimal 20 digit")
    .optional()
    .nullable()
    .or(z.literal("")),
  alamat: z
    .string()
    .max(255, "Alamat maksimal 255 karakter")
    .optional()
    .nullable()
    .or(z.literal("")),
  status_kepegawaian: z.enum(["TETAP", "HONORER", "KONTRAK", "PNS", "PPPK", "LAINNYA"]).optional(),
  status_aktif: z.boolean().optional(),
  status_lifecycle: lifecycleStatusSchema.optional(),
  foto_url: z.string().optional().nullable().or(z.literal("")),
  catatan: z.string().max(500).optional().nullable().or(z.literal("")),
});

export const CreateSubjectSchema = z.object({
  sekolah_id: z.string().min(1, "ID Sekolah wajib diisi"),
  kode: z
    .string()
    .min(1, "Kode mata pelajaran wajib diisi")
    .max(20, "Kode maksimal 20 karakter")
    .transform((val) => val.toUpperCase().trim()),
  nama: z
    .string()
    .min(2, "Nama mata pelajaran minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter")
    .trim(),
  kelompok: z
    .enum(["UMUM", "KEJURUAN", "PILIHAN", "MUATAN_LOKAL"])
    .optional()
    .nullable()
    .or(z.literal("")),
  status_aktif: z.boolean().default(true),
  status_lifecycle: lifecycleStatusSchema.default("AKTIF"),
  deskripsi: z.string().max(500).optional().nullable().or(z.literal("")),
});

export const UpdateSubjectSchema = z.object({
  id: z.string().min(1, "ID Mata Pelajaran wajib diisi"),
  sekolah_id: z.string().min(1, "ID Sekolah wajib diisi"),
  kode: z
    .string()
    .min(1, "Kode mata pelajaran wajib diisi")
    .max(20, "Kode maksimal 20 karakter")
    .transform((val) => val.toUpperCase().trim())
    .optional(),
  nama: z
    .string()
    .min(2, "Nama mata pelajaran minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter")
    .trim()
    .optional(),
  kelompok: z
    .enum(["UMUM", "KEJURUAN", "PILIHAN", "MUATAN_LOKAL"])
    .optional()
    .nullable()
    .or(z.literal("")),
  status_aktif: z.boolean().optional(),
  status_lifecycle: lifecycleStatusSchema.optional(),
  deskripsi: z.string().max(500).optional().nullable().or(z.literal("")),
});

export const CreateTeachingAssignmentSchema = z.object({
  sekolah_id: z.string().min(1, "ID Sekolah wajib diisi"),
  guru_id: z.string().min(1, "Guru wajib dipilih"),
  mata_pelajaran_id: z.string().min(1, "Mata pelajaran wajib dipilih"),
  tahun_ajaran_id: z.string().min(1, "Tahun ajaran wajib dipilih"),
  semester_id: z.string().optional().nullable().or(z.literal("")),
  rombel_id: z.string().min(1, "Rombel / Kelas wajib dipilih"),
  jumlah_jam_minggu: z.coerce
    .number()
    .int()
    .min(1, "Jumlah jam per minggu minimal 1")
    .max(40, "Jumlah jam maksimal 40"),
  berlaku_mulai: defaultNowDateSchema,
  status: teachingAssignmentStatusSchema.default("AKTIF"),
  catatan: z.string().max(500).optional().nullable().or(z.literal("")),
});

export const UpdateTeachingAssignmentSchema = z.object({
  id: z.string().min(1, "ID Penugasan Mengajar wajib diisi"),
  sekolah_id: z.string().min(1, "ID Sekolah wajib diisi"),
  jumlah_jam_minggu: z.coerce.number().int().min(1).max(40).optional(),
  status: teachingAssignmentStatusSchema.optional(),
  berlaku_sampai: optionalDateSchema,
  catatan: z.string().max(500).optional().nullable().or(z.literal("")),
});

export const AssignHomeroomSchema = z.object({
  sekolah_id: z.string().min(1, "ID Sekolah wajib diisi"),
  guru_id: z.string().min(1, "Guru wajib dipilih"),
  rombel_id: z.string().min(1, "Rombel / Kelas wajib dipilih"),
  tahun_ajaran_id: z.string().min(1, "Tahun ajaran wajib dipilih"),
  berlaku_mulai: defaultNowDateSchema,
  catatan: z.string().max(500).optional().nullable().or(z.literal("")),
});

export const CreateBulkTeachingAssignmentsSchema = z.object({
  sekolah_id: z.string().min(1, "ID Sekolah wajib diisi"),
  guru_id: z.string().min(1, "Guru wajib dipilih"),
  mata_pelajaran_id: z.string().min(1, "Mata pelajaran wajib dipilih"),
  tahun_ajaran_id: z.string().min(1, "Tahun ajaran wajib dipilih"),
  semester_id: z.string().optional().nullable().or(z.literal("")),
  rombel_ids: z.array(z.string().min(1)).min(1, "Pilih minimal 1 rombongan belajar / kelas"),
  jumlah_jam_minggu: z.coerce
    .number()
    .int()
    .min(1, "Beban jam per rombel minimal 1 JP")
    .max(40, "Beban jam maksimal 40 JP"),
  berlaku_mulai: defaultNowDateSchema,
  status: teachingAssignmentStatusSchema.default("AKTIF"),
  catatan: z.string().max(500).optional().nullable().or(z.literal("")),
});
