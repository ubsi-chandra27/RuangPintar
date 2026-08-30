/**
 * Ruang Pintar — Academic Period & Structure (M06) Input Validation Schemas
 */

import { z } from "zod";

export const academicYearStatusSchema = z.enum(["DRAFT", "AKTIF", "SELESAI", "DIARSIPKAN"], {
  message: "Status tahun ajaran harus salah satu dari: DRAFT, AKTIF, SELESAI, atau DIARSIPKAN.",
});

export const semesterKodeSchema = z.enum(["GANJIL", "GENAP", "PENDEK"], {
  message: "Kode semester harus salah satu dari: GANJIL, GENAP, atau PENDEK.",
});

export const rombelStatusSchema = z.enum(["AKTIF", "NONAKTIF", "DIARSIPKAN"], {
  message: "Status rombel harus salah satu dari: AKTIF, NONAKTIF, atau DIARSIPKAN.",
});

// Academic Year Schemas
export const createAcademicYearSchema = z
  .object({
    nama: z
      .string()
      .trim()
      .min(4, "Nama tahun ajaran minimal 4 karakter (misal: 2026/2027).")
      .max(50, "Nama tahun ajaran maksimal 50 karakter."),
    kode: z
      .string()
      .trim()
      .max(30, "Kode tahun ajaran maksimal 30 karakter.")
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val?.toUpperCase())),
    tanggal_mulai: z.coerce.date({
      message: "Tanggal mulai tahun ajaran tidak valid.",
    }),
    tanggal_selesai: z.coerce.date({
      message: "Tanggal selesai tahun ajaran tidak valid.",
    }),
    status: academicYearStatusSchema.default("DRAFT"),
  })
  .refine((data) => data.tanggal_mulai < data.tanggal_selesai, {
    message: "Tanggal mulai tahun ajaran harus lebih awal daripada tanggal selesai.",
    path: ["tanggal_selesai"],
  });

export const updateAcademicYearSchema = z
  .object({
    nama: z
      .string()
      .trim()
      .min(4, "Nama tahun ajaran minimal 4 karakter.")
      .max(50, "Nama tahun ajaran maksimal 50 karakter.")
      .optional(),
    kode: z
      .string()
      .trim()
      .max(30, "Kode tahun ajaran maksimal 30 karakter.")
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val?.toUpperCase())),
    tanggal_mulai: z.coerce.date().optional(),
    tanggal_selesai: z.coerce.date().optional(),
    status: academicYearStatusSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.tanggal_mulai && data.tanggal_selesai) {
        return data.tanggal_mulai < data.tanggal_selesai;
      }
      return true;
    },
    {
      message: "Tanggal mulai tahun ajaran harus lebih awal daripada tanggal selesai.",
      path: ["tanggal_selesai"],
    }
  );

// Semester Schemas
export const createSemesterSchema = z
  .object({
    tahun_ajaran_id: z.string().trim().min(1, "Tahun ajaran wajib dipilih."),
    nama: z
      .string()
      .trim()
      .min(2, "Nama semester minimal 2 karakter.")
      .max(50, "Nama semester maksimal 50 karakter."),
    kode: semesterKodeSchema,
    urutan: z.coerce.number().int().min(1, "Urutan semester minimal 1.").default(1),
    tanggal_mulai: z.coerce.date({
      message: "Tanggal mulai semester tidak valid.",
    }),
    tanggal_selesai: z.coerce.date({
      message: "Tanggal selesai semester tidak valid.",
    }),
    status: academicYearStatusSchema.default("DRAFT"),
  })
  .refine((data) => data.tanggal_mulai < data.tanggal_selesai, {
    message: "Tanggal mulai semester harus lebih awal daripada tanggal selesai.",
    path: ["tanggal_selesai"],
  });

export const updateSemesterSchema = z
  .object({
    nama: z
      .string()
      .trim()
      .min(2, "Nama semester minimal 2 karakter.")
      .max(50, "Nama semester maksimal 50 karakter.")
      .optional(),
    kode: semesterKodeSchema.optional(),
    urutan: z.coerce.number().int().min(1).optional(),
    tanggal_mulai: z.coerce.date().optional(),
    tanggal_selesai: z.coerce.date().optional(),
    status: academicYearStatusSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.tanggal_mulai && data.tanggal_selesai) {
        return data.tanggal_mulai < data.tanggal_selesai;
      }
      return true;
    },
    {
      message: "Tanggal mulai semester harus lebih awal daripada tanggal selesai.",
      path: ["tanggal_selesai"],
    }
  );

// Phase Schemas
export const createPhaseSchema = z.object({
  nama: z
    .string()
    .trim()
    .min(2, "Nama fase minimal 2 karakter (misal: Fase E).")
    .max(50, "Nama fase maksimal 50 karakter."),
  kode: z
    .string()
    .trim()
    .min(2, "Kode fase minimal 2 karakter (misal: FASE_E).")
    .max(30, "Kode fase maksimal 30 karakter.")
    .transform((val) => val.toUpperCase()),
  deskripsi: z
    .string()
    .trim()
    .max(255, "Deskripsi fase maksimal 255 karakter.")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  urutan: z.coerce.number().int().min(1, "Urutan fase minimal 1.").default(1),
});

export const updatePhaseSchema = z.object({
  nama: z.string().trim().min(2).max(50).optional(),
  kode: z
    .string()
    .trim()
    .min(2)
    .max(30)
    .transform((val) => val.toUpperCase())
    .optional(),
  deskripsi: z
    .string()
    .trim()
    .max(255)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  urutan: z.coerce.number().int().min(1).optional(),
});

// Grade Level Schemas
export const createGradeLevelSchema = z.object({
  kode: z
    .string()
    .trim()
    .min(1, "Kode tingkat kelas minimal 1 karakter (misal: 10 atau X).")
    .max(20, "Kode tingkat kelas maksimal 20 karakter.")
    .transform((val) => val.toUpperCase()),
  nama: z
    .string()
    .trim()
    .min(1, "Nama tingkat kelas minimal 1 karakter (misal: Kelas 10).")
    .max(50, "Nama tingkat kelas maksimal 50 karakter."),
  fase_id: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  urutan: z.coerce.number().int().min(1, "Urutan tingkat minimal 1.").default(1),
});

export const updateGradeLevelSchema = z.object({
  kode: z
    .string()
    .trim()
    .min(1)
    .max(20)
    .transform((val) => val.toUpperCase())
    .optional(),
  nama: z.string().trim().min(1).max(50).optional(),
  fase_id: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  urutan: z.coerce.number().int().min(1).optional(),
});

// Academic Program Schemas
export const createProgramSchema = z.object({
  kode: z
    .string()
    .trim()
    .min(2, "Kode program/jurusan minimal 2 karakter (misal: RPL).")
    .max(30, "Kode program/jurusan maksimal 30 karakter.")
    .transform((val) => val.toUpperCase()),
  nama: z
    .string()
    .trim()
    .min(2, "Nama program/jurusan minimal 2 karakter.")
    .max(100, "Nama program/jurusan maksimal 100 karakter."),
  jenjang: z
    .string()
    .trim()
    .max(20)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val?.toUpperCase())),
  status_aktif: z.coerce.boolean().default(true),
  deskripsi: z
    .string()
    .trim()
    .max(255)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
});

export const updateProgramSchema = z.object({
  kode: z
    .string()
    .trim()
    .min(2)
    .max(30)
    .transform((val) => val.toUpperCase())
    .optional(),
  nama: z.string().trim().min(2).max(100).optional(),
  jenjang: z
    .string()
    .trim()
    .max(20)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val?.toUpperCase())),
  status_aktif: z.coerce.boolean().optional(),
  deskripsi: z
    .string()
    .trim()
    .max(255)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
});

// Rombel Schemas
export const createRombelSchema = z.object({
  tahun_ajaran_id: z.string().trim().min(1, "Tahun ajaran wajib dipilih."),
  semester_id: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  tingkat_id: z.string().trim().min(1, "Tingkat kelas wajib dipilih."),
  fase_id: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  program_id: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  nama: z
    .string()
    .trim()
    .min(2, "Nama rombel minimal 2 karakter (misal: X RPL 1).")
    .max(50, "Nama rombel maksimal 50 karakter."),
  kode: z
    .string()
    .trim()
    .max(30, "Kode rombel maksimal 30 karakter.")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val?.toUpperCase())),
  kapasitas: z.coerce
    .number()
    .int("Kapasitas harus berupa bilangan bulat.")
    .min(1, "Kapasitas minimal 1 siswa.")
    .max(100, "Kapasitas maksimal 100 siswa.")
    .default(36),
  status: rombelStatusSchema.default("AKTIF"),
  catatan: z
    .string()
    .trim()
    .max(255)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
});

export const updateRombelSchema = z.object({
  tahun_ajaran_id: z.string().trim().min(1).optional(),
  semester_id: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  tingkat_id: z.string().trim().min(1).optional(),
  fase_id: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  program_id: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  nama: z.string().trim().min(2).max(50).optional(),
  kode: z
    .string()
    .trim()
    .max(30)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val?.toUpperCase())),
  kapasitas: z.coerce.number().int().min(1).max(100).optional(),
  status: rombelStatusSchema.optional(),
  catatan: z
    .string()
    .trim()
    .max(255)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
});
