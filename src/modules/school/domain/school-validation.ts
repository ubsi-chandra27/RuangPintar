/**
 * Ruang Pintar — School & Organization (M01) Input Validation Schemas
 *
 * Menggunakan Zod untuk parsing, normalization, dan validasi allowlist/enum/format.
 */

import { z } from "zod";

const safeUrlOrPathSchema = z
  .string()
  .max(1000)
  .refine(
    (val) => {
      if (!val || val.trim() === "") return true;
      const lower = val.toLowerCase().trim();
      if (
        lower.startsWith("javascript:") ||
        lower.startsWith("data:") ||
        lower.startsWith("vbscript:")
      ) {
        return false;
      }
      return true;
    },
    { message: "Format URL logo tidak diizinkan atau mengandung protokol berbahaya." }
  )
  .optional()
  .nullable();

export const updateSchoolProfileSchema = z.object({
  nama: z
    .string()
    .trim()
    .min(2, "Nama sekolah minimal 2 karakter.")
    .max(200, "Nama sekolah maksimal 200 karakter."),
  npsn: z
    .string()
    .trim()
    .refine((val) => val === "" || /^\d{8}$/.test(val), {
      message: "NPSN harus terdiri dari 8 digit angka.",
    })
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  jenjang: z.enum(["SD", "SMP", "SMA", "SMK", "UMUM"], {
    message: "Jenjang sekolah harus salah satu dari: SD, SMP, SMA, SMK, atau UMUM.",
  }),
  alamat: z
    .string()
    .trim()
    .max(500, "Alamat sekolah maksimal 500 karakter.")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  telepon: z
    .string()
    .trim()
    .max(30, "Nomor telepon maksimal 30 karakter.")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  email: z
    .string()
    .trim()
    .refine((val) => val === "" || z.string().email().safeParse(val).success, {
      message: "Format alamat email tidak valid.",
    })
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  zona_waktu: z
    .string()
    .trim()
    .min(2, "Zona waktu wajib diisi.")
    .max(50, "Zona waktu maksimal 50 karakter.")
    .default("Asia/Jakarta"),
  logo_url: safeUrlOrPathSchema.transform((val) => (val === "" ? null : val)),
});

export const createOrganizationUnitSchema = z.object({
  nama: z
    .string()
    .trim()
    .min(2, "Nama unit minimal 2 karakter.")
    .max(100, "Nama unit maksimal 100 karakter."),
  kode: z
    .string()
    .trim()
    .max(30, "Kode unit maksimal 30 karakter.")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val?.toUpperCase())),
  induk_unit_id: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
});

export const updateOrganizationUnitSchema = z.object({
  nama: z
    .string()
    .trim()
    .min(2, "Nama unit minimal 2 karakter.")
    .max(100, "Nama unit maksimal 100 karakter."),
  kode: z
    .string()
    .trim()
    .max(30, "Kode unit maksimal 30 karakter.")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val?.toUpperCase())),
  induk_unit_id: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
});

export const createPositionSchema = z.object({
  kode_jabatan: z
    .string()
    .trim()
    .min(2, "Kode jabatan minimal 2 karakter.")
    .max(50, "Kode jabatan maksimal 50 karakter.")
    .regex(
      /^[A-Z0-9_]{2,50}$/,
      "Kode jabatan harus berupa huruf kapital, angka, dan garis bawah (contoh: HEADMASTER, WAKASEK_SARPRAS)."
    ),
  nama_jabatan: z
    .string()
    .trim()
    .min(2, "Nama jabatan minimal 2 karakter.")
    .max(100, "Nama jabatan maksimal 100 karakter."),
  unit_id: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  tingkat_akses: z
    .enum(["SCHOOL_WIDE", "UNIT_WIDE", "PROGRAM_WIDE"])
    .optional()
    .nullable()
    .default("SCHOOL_WIDE"),
});

export const updatePositionSchema = z.object({
  nama_jabatan: z
    .string()
    .trim()
    .min(2, "Nama jabatan minimal 2 karakter.")
    .max(100, "Nama jabatan maksimal 100 karakter."),
  unit_id: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  tingkat_akses: z.enum(["SCHOOL_WIDE", "UNIT_WIDE", "PROGRAM_WIDE"]).optional().nullable(),
});

export const assignPositionSchema = z.object({
  personil_id: z.string().trim().min(20, "ID Personil tidak valid."),
  jabatan_id: z.string().trim().min(20, "ID Jabatan tidak valid."),
  berlaku_mulai: z.coerce.date({
    message: "Format tanggal mulai penugasan tidak valid.",
  }),
  berlaku_sampai: z.coerce
    .date()
    .optional()
    .nullable()
    .transform((val) => (val ? val : null)),
  catatan: z
    .string()
    .trim()
    .max(500, "Catatan penugasan maksimal 500 karakter.")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
});

export const endPositionAssignmentSchema = z.object({
  assignment_id: z.string().trim().min(20, "ID Penugasan tidak valid."),
  berlaku_sampai: z.coerce.date({
    message: "Format tanggal selesai tidak valid.",
  }),
  catatan: z
    .string()
    .trim()
    .max(500, "Catatan penutupan penugasan maksimal 500 karakter.")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
});

export const cancelPositionAssignmentSchema = z.object({
  assignment_id: z.string().trim().min(20, "ID Penugasan tidak valid."),
  catatan: z
    .string()
    .trim()
    .min(3, "Alasan pembatalan penugasan wajib diisi (minimal 3 karakter).")
    .max(500, "Catatan pembatalan penugasan maksimal 500 karakter."),
});
