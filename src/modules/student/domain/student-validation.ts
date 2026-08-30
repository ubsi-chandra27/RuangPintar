/**
 * Ruang Pintar — M07 Student Academic Lifecycle: Validation Schemas
 */

import { z } from "zod";

export const CreateStudentSchema = z.object({
  nis: z
    .string()
    .min(1, "NIS wajib diisi")
    .max(30, "NIS maksimal 30 karakter")
    .regex(/^[a-zA-Z0-9\-_./]+$/, "NIS hanya boleh berisi huruf, angka, dan karakter -_./"),
  nisn: z
    .string()
    .regex(/^[0-9]{10}$/, "NISN harus berupa 10 digit angka")
    .optional()
    .nullable()
    .or(z.literal("")),
  nama_lengkap: z
    .string()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(150, "Nama lengkap maksimal 150 karakter"),
  jenis_kelamin: z.enum(["L", "P"], {
    message: "Jenis kelamin harus 'L' (Laki-laki) atau 'P' (Perempuan)",
  }),
  tempat_lahir: z.string().max(100).optional().nullable(),
  tanggal_lahir: z.string().optional().nullable(),
  agama: z
    .enum(["ISLAM", "KRISTEN", "KATOLIK", "HINDU", "BUDDHA", "KONGHUCU", "LAINNYA"])
    .optional()
    .nullable()
    .or(z.literal("")),
  nik: z
    .string()
    .regex(/^[0-9]{16}$/, "NIK harus berupa 16 digit angka")
    .optional()
    .nullable()
    .or(z.literal("")),
  alamat: z.string().max(300).optional().nullable(),
  nama_wali: z.string().max(150).optional().nullable(),
  telepon_wali: z.string().max(30).optional().nullable(),
  email_wali: z
    .string()
    .email("Format email wali tidak valid")
    .optional()
    .nullable()
    .or(z.literal("")),
  status_akademik: z
    .enum(["AKTIF", "NONAKTIF", "LULUS", "PINDAH", "KELUAR", "DROPOUT"])
    .default("AKTIF"),
  foto_url: z.string().optional().nullable().or(z.literal("")),
  tanggal_masuk: z.string().optional(),
  catatan: z.string().max(500).optional().nullable(),

  // Optional auto-enrollment
  initial_tahun_ajaran_id: z.string().optional(),
  initial_tingkat_id: z.string().optional(),
  initial_rombel_id: z.string().optional(),
});

export const UpdateStudentSchema = z.object({
  nis: z
    .string()
    .min(1, "NIS wajib diisi")
    .max(30, "NIS maksimal 30 karakter")
    .regex(/^[a-zA-Z0-9\-_./]+$/, "NIS hanya boleh berisi huruf, angka, dan karakter -_./")
    .optional(),
  nisn: z
    .string()
    .regex(/^[0-9]{10}$/, "NISN harus berupa 10 digit angka")
    .optional()
    .nullable()
    .or(z.literal("")),
  nama_lengkap: z
    .string()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(150, "Nama lengkap maksimal 150 karakter")
    .optional(),
  jenis_kelamin: z.enum(["L", "P"]).optional(),
  tempat_lahir: z.string().max(100).optional().nullable(),
  tanggal_lahir: z.string().optional().nullable(),
  agama: z
    .enum(["ISLAM", "KRISTEN", "KATOLIK", "HINDU", "BUDDHA", "KONGHUCU", "LAINNYA"])
    .optional()
    .nullable()
    .or(z.literal("")),
  nik: z
    .string()
    .regex(/^[0-9]{16}$/, "NIK harus berupa 16 digit angka")
    .optional()
    .nullable()
    .or(z.literal("")),
  alamat: z.string().max(300).optional().nullable(),
  nama_wali: z.string().max(150).optional().nullable(),
  telepon_wali: z.string().max(30).optional().nullable(),
  email_wali: z
    .string()
    .email("Format email wali tidak valid")
    .optional()
    .nullable()
    .or(z.literal("")),
  status_akademik: z.enum(["AKTIF", "NONAKTIF", "LULUS", "PINDAH", "KELUAR", "DROPOUT"]).optional(),
  foto_url: z.string().optional().nullable().or(z.literal("")),
  tanggal_keluar: z.string().optional().nullable(),
  catatan: z.string().max(500).optional().nullable(),
});

export const CreateEnrollmentSchema = z.object({
  siswa_id: z.string().min(1, "ID siswa wajib diisi"),
  tahun_ajaran_id: z.string().min(1, "Tahun ajaran wajib dipilih"),
  tingkat_id: z.string().optional().nullable(),
  status: z
    .enum(["AKTIF", "LULUS", "NAIK_KELAS", "TINGGAL_KELAS", "PINDAH", "NONAKTIF"])
    .default("AKTIF"),
  tanggal_mulai: z.string().optional(),
  catatan: z.string().max(300).optional().nullable(),
  initial_rombel_id: z.string().optional().nullable(),
});

export const UpdateEnrollmentStatusSchema = z.object({
  status: z.enum(["AKTIF", "LULUS", "NAIK_KELAS", "TINGGAL_KELAS", "PINDAH", "NONAKTIF"]),
  tanggal_selesai: z.string().optional().nullable(),
  catatan: z.string().max(300).optional().nullable(),
});

export const CreatePlacementSchema = z.object({
  keikutsertaan_id: z.string().min(1, "Keikutsertaan siswa wajib dipilih"),
  rombel_id: z.string().min(1, "Rombel tujuan wajib dipilih"),
  nomor_absen: z.coerce.number().int().min(1).max(999).optional().nullable(),
  tanggal_mulai: z.string().optional(),
  catatan: z.string().max(300).optional().nullable(),
});

export const MovePlacementSchema = z.object({
  keikutsertaan_id: z.string().min(1, "Keikutsertaan siswa wajib dipilih"),
  target_rombel_id: z.string().min(1, "Rombel tujuan wajib dipilih"),
  nomor_absen: z.coerce.number().int().min(1).max(999).optional().nullable(),
  alasan_pindah: z.string().max(300).optional(),
});

export const BulkPlacementSchema = z.object({
  keikutsertaan_ids: z
    .array(z.string().min(1))
    .min(1, "Pilih minimal 1 siswa untuk penempatan rombel"),
  target_rombel_id: z.string().min(1, "Rombel tujuan penempatan wajib dipilih"),
});

export const PromoteStudentSchema = z.object({
  siswa_id: z.string().min(1, "ID siswa wajib diisi"),
  source_enrollment_id: z.string().min(1, "Enrollment asal wajib diisi"),
  target_tahun_ajaran_id: z.string().min(1, "Tahun ajaran baru wajib dipilih"),
  target_tingkat_id: z.string().min(1, "Tingkat kelas baru wajib dipilih"),
  target_rombel_id: z.string().optional().nullable(),
  status_enrollment_lama: z.enum(["NAIK_KELAS", "TINGGAL_KELAS"]).default("NAIK_KELAS"),
  catatan: z.string().max(300).optional().nullable(),
});

export const GraduateStudentSchema = z.object({
  siswa_id: z.string().min(1, "ID siswa wajib diisi"),
  source_enrollment_id: z.string().min(1, "Enrollment siswa wajib diisi"),
  tanggal_lulus: z.string().optional(),
  catatan: z.string().max(300).optional().nullable(),
});

export const TransferOutStudentSchema = z.object({
  siswa_id: z.string().min(1, "ID siswa wajib diisi"),
  source_enrollment_id: z.string().min(1, "Enrollment siswa wajib diisi"),
  tanggal_keluar: z.string().optional(),
  alasan_keluar: z.string().min(1, "Alasan mutasi/keluar wajib diisi").max(300),
  sekolah_tujuan: z.string().max(150).optional().nullable(),
});
