/**
 * Ruang Pintar — M15 Guardian Validation Schemas
 * Skema validasi Zod untuk operasi formulir dan interaksi wali murid.
 */

import { z } from "zod";

export const SwitchChildSchema = z.object({
  siswa_id: z.string().min(1, "ID siswa wajib diisi"),
});

export type SwitchChildInput = z.infer<typeof SwitchChildSchema>;

export const PengajuanWaliSchema = z.object({
  siswa_id: z.string().min(1, "Pilihan anak wajib diisi"),
  tipe: z.enum(["IZIN_KETIDAKHADIRAN", "SAKIT", "KOREKSI_DATA", "CATATAN_KESEHATAN", "LAINNYA"]),
  judul: z.string().min(3, "Judul permohonan minimal 3 karakter").max(120, "Judul terlalu panjang"),
  deskripsi: z
    .string()
    .min(10, "Deskripsi permohonan minimal 10 karakter")
    .max(1000, "Deskripsi maksimal 1000 karakter"),
  tanggal_mulai: z.string().optional().nullable(),
  tanggal_selesai: z.string().optional().nullable(),
  lampiran_url: z.string().optional().nullable(),
});

export type PengajuanWaliFormInput = z.infer<typeof PengajuanWaliSchema>;
