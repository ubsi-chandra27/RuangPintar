/**
 * Ruang Pintar — M12 Class Session Attendance Domain Types
 *
 * Invariant: School Attendance ≠ Class Session Attendance
 */

export const ATTENDANCE_STATUSES = [
  "HADIR",
  "IZIN",
  "SAKIT",
  "ALPHA",
  "DISPENSASI",
  "TERLAMBAT",
] as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export interface StudentAttendanceItemDTO {
  siswa_id: string;
  nama_lengkap: string;
  nis: string | null;
  nisn: string | null;
  nomor_absen: number | null;
  foto_url: string | null;
  penempatan_rombel_id: string | null;
  presensi_id: string | null;
  status: AttendanceStatus;
  catatan: string | null;
  waktu_presensi: Date | null;
}

export interface SessionAttendanceSummaryDTO {
  total_siswa: number;
  jumlah_hadir: number;
  jumlah_izin: number;
  jumlah_sakit: number;
  jumlah_alpha: number;
  jumlah_dispensasi: number;
  jumlah_terlambat: number;
  persentase_kehadiran: number;
  sudah_diabsen: boolean;
}

export interface ClassSessionAttendanceDTO extends SessionAttendanceSummaryDTO {
  sesi_id: string;
  sekolah_id: string;
  penugasan_mengajar_id: string;
  rombel_id: string;
  rombel_nama: string;
  mata_pelajaran_id: string;
  mata_pelajaran_nama: string;
  guru_id: string;
  guru_nama: string;
  tanggal: Date;
  status_sesi: string;
  ruangan?: string | null;
  topik_pembelajaran?: string | null;
  daftar_siswa: StudentAttendanceItemDTO[];
}

export interface SaveAttendanceItemInput {
  siswa_id: string;
  penempatan_rombel_id?: string | null;
  status: AttendanceStatus;
  catatan?: string | null;
}

export interface SaveSessionAttendanceInput {
  sesi_kelas_id: string;
  sekolah_id: string;
  items: SaveAttendanceItemInput[];
  alasan_koreksi?: string | null;
}

export interface SessionAttendanceHistoryItemDTO {
  sesi_id: string;
  tanggal: Date;
  status_sesi: string;
  topik_pembelajaran: string | null;
  ruangan: string | null;
  total_siswa: number;
  jumlah_hadir: number;
  jumlah_izin: number;
  jumlah_sakit: number;
  jumlah_alpha: number;
  jumlah_dispensasi: number;
  jumlah_terlambat: number;
  persentase_kehadiran: number;
  sudah_diabsen: boolean;
}
