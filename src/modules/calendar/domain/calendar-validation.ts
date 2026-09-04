/**
 * Ruang Pintar — M09 Academic Calendar Validation Schemas
 */

import { z } from "zod";

export const CreateCalendarEventSchema = z
  .object({
    sekolah_id: z.string().min(1, "ID Sekolah wajib diisi"),
    tahun_ajaran_id: z.string().min(1, "Tahun Ajaran wajib dipilih"),
    semester_id: z.string().nullish(),
    judul: z
      .string()
      .min(2, "Judul agenda minimal 2 karakter")
      .max(200, "Judul maksimal 200 karakter"),
    deskripsi: z.string().max(1000, "Deskripsi maksimal 1000 karakter").nullish(),
    tipe_event: z.enum([
      "HARI_EFEKTIF",
      "HARI_LIBUR",
      "KEGIATAN_SEKOLAH",
      "UJIAN",
      "ORIENTASI",
      "LAINNYA",
    ]),
    tanggal_mulai: z.coerce.date(),
    tanggal_selesai: z.coerce.date(),
    libur_kbm: z.boolean().default(false),
    warna: z.string().nullish(),
  })
  .refine((data) => data.tanggal_selesai >= data.tanggal_mulai, {
    message: "Tanggal selesai tidak boleh sebelum tanggal mulai",
    path: ["tanggal_selesai"],
  });

export const UpdateCalendarEventSchema = z
  .object({
    id: z.string().min(1, "ID Event wajib diisi"),
    sekolah_id: z.string().min(1, "ID Sekolah wajib diisi"),
    tahun_ajaran_id: z.string().min(1, "Tahun Ajaran wajib dipilih").optional(),
    semester_id: z.string().nullish(),
    judul: z
      .string()
      .min(2, "Judul agenda minimal 2 karakter")
      .max(200, "Judul maksimal 200 karakter")
      .optional(),
    deskripsi: z.string().max(1000, "Deskripsi maksimal 1000 karakter").nullish(),
    tipe_event: z
      .enum(["HARI_EFEKTIF", "HARI_LIBUR", "KEGIATAN_SEKOLAH", "UJIAN", "ORIENTASI", "LAINNYA"])
      .optional(),
    tanggal_mulai: z.coerce.date().optional(),
    tanggal_selesai: z.coerce.date().optional(),
    libur_kbm: z.boolean().optional(),
    warna: z.string().nullish(),
  })
  .refine(
    (data) => {
      if (data.tanggal_mulai && data.tanggal_selesai) {
        return data.tanggal_selesai >= data.tanggal_mulai;
      }
      return true;
    },
    {
      message: "Tanggal selesai tidak boleh sebelum tanggal mulai",
      path: ["tanggal_selesai"],
    }
  );
