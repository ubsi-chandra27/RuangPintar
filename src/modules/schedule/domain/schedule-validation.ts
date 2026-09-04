/**
 * Ruang Pintar — M10 Scheduling & Class Session Validation Schemas
 */

import { z } from "zod";

const timeFormatRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const CreateTimeSlotSchema = z
  .object({
    sekolah_id: z.string().min(1, "ID Sekolah wajib diisi"),
    nama: z
      .string()
      .trim()
      .min(2, "Nama slot minimal 2 karakter")
      .max(100, "Nama slot maksimal 100 karakter"),
    kode: z
      .string()
      .trim()
      .min(2, "Kode slot minimal 2 karakter")
      .max(50, "Kode slot maksimal 50 karakter"),
    urutan: z.number().int().min(1, "Urutan minimal 1").default(1),
    jam_mulai: z.string().regex(timeFormatRegex, "Format jam mulai harus HH:mm (24-jam)"),
    jam_selesai: z.string().regex(timeFormatRegex, "Format jam selesai harus HH:mm (24-jam)"),
    is_istirahat: z.boolean().default(false),
    is_upacara: z.boolean().default(false),
    hari_khusus: z.enum(["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU", "MINGGU"]).nullish(),
    status_aktif: z.boolean().default(true),
  })
  .refine((data) => !(data.is_istirahat && data.is_upacara), {
    message: "Pilih satu jenis slot: KBM, istirahat, atau upacara",
    path: ["is_upacara"],
  })
  .refine(
    (data) => {
      const [startH, startM] = data.jam_mulai.split(":").map(Number);
      const [endH, endM] = data.jam_selesai.split(":").map(Number);
      return endH * 60 + endM > startH * 60 + startM;
    },
    {
      message: "Jam selesai harus setelah jam mulai",
      path: ["jam_selesai"],
    }
  );

export const CreateScheduleVersionSchema = z.object({
  sekolah_id: z.string().min(1, "ID Sekolah wajib diisi"),
  tahun_ajaran_id: z.string().min(1, "Tahun Ajaran wajib dipilih"),
  semester_id: z.string().nullish(),
  nama: z
    .string()
    .min(2, "Nama versi jadwal minimal 2 karakter")
    .max(200, "Nama versi jadwal maksimal 200 karakter"),
  catatan: z.string().max(1000, "Catatan maksimal 1000 karakter").nullish(),
});

export const CreateScheduleEntrySchema = z.object({
  sekolah_id: z.string().min(1, "ID Sekolah wajib diisi"),
  versi_jadwal_id: z.string().min(1, "Versi Jadwal wajib dipilih"),
  rombel_id: z.string().min(1, "Rombel wajib dipilih"),
  penugasan_mengajar_id: z.string().min(1, "Penugasan mengajar guru wajib dipilih"),
  slot_waktu_id: z.string().min(1, "Slot waktu wajib dipilih"),
  hari: z.enum(["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU", "MINGGU"]),
  ruangan: z.string().max(100, "Nama ruangan maksimal 100 karakter").nullish(),
  catatan: z.string().max(1000, "Catatan maksimal 1000 karakter").nullish(),
});

export const OpenClassSessionSchema = z.object({
  sekolah_id: z.string().min(1, "ID Sekolah wajib diisi"),
  jadwal_pelajaran_id: z.string().nullish(),
  penugasan_mengajar_id: z.string().min(1, "Penugasan mengajar wajib diisi"),
  rombel_id: z.string().min(1, "Rombel wajib diisi"),
  mata_pelajaran_id: z.string().min(1, "Mata Pelajaran wajib diisi"),
  guru_id: z.string().min(1, "Guru pengampu wajib diisi"),
  guru_pengganti_id: z.string().nullish(),
  tahun_ajaran_id: z.string().min(1, "Tahun Ajaran wajib diisi"),
  semester_id: z.string().nullish(),
  tanggal: z.coerce.date().optional(),
  ruangan_aktual: z.string().max(100).nullish(),
  topik_pembelajaran: z.string().max(255).nullish(),
  catatan: z.string().max(1000).nullish(),
});
