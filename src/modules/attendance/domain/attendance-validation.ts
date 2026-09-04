/**
 * Ruang Pintar — M12 Class Session Attendance Validation Schemas
 */

import { z } from "zod";
import { ATTENDANCE_STATUSES } from "./attendance-types";

export const AttendanceStatusSchema = z.enum(ATTENDANCE_STATUSES);

export const SaveAttendanceItemSchema = z.object({
  siswa_id: z.string().min(1, "ID siswa wajib diisi"),
  penempatan_rombel_id: z.string().nullable().optional(),
  status: AttendanceStatusSchema,
  catatan: z.string().max(500, "Catatan maksimal 500 karakter").nullable().optional(),
});

export const SaveSessionAttendanceSchema = z.object({
  sesi_kelas_id: z.string().min(1, "ID sesi kelas wajib diisi"),
  sekolah_id: z.string().min(1, "ID sekolah wajib diisi"),
  items: z.array(SaveAttendanceItemSchema).min(1, "Minimal 1 siswa dalam daftar presensi"),
  alasan_koreksi: z.string().max(255).nullable().optional(),
});
