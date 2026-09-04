/**
 * Ruang Pintar — M10 Scheduling & Class Session Domain Types & Contracts
 */

export type HariBelajar = "SENIN" | "SELASA" | "RABU" | "KAMIS" | "JUMAT" | "SABTU" | "MINGGU";

export type StatusVersiJadwal = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type StatusSesiKelas = "TERJADWAL" | "DIMULAI" | "SELESAI" | "DIBATALKAN" | "DIGANTIKAN";

export interface TimeSlotDTO {
  id: string;
  sekolah_id: string;
  nama: string;
  kode: string;
  urutan: number;
  jam_mulai: string;
  jam_selesai: string;
  is_istirahat: boolean;
  is_upacara: boolean;
  hari_khusus?: string | null;
  status_aktif: boolean;
  created_at: Date;
  updated_at: Date;
  penggunaan?: TimeSlotUsage;
}

export interface TimeSlotUsage {
  total: number;
  draft: number;
  published: number;
  archived: number;
  sessions: number;
}

export interface TimeSlotMutationConfirmation {
  updated_at: string;
  total_penggunaan: number;
  konfirmasi_dampak?: boolean;
}

export interface ScheduleVersionDTO {
  id: string;
  sekolah_id: string;
  tahun_ajaran_id: string;
  tahun_ajaran_nama?: string;
  semester_id?: string | null;
  semester_nama?: string | null;
  nomor_versi: number;
  nama: string;
  status: StatusVersiJadwal;
  tanggal_publikasi?: Date | null;
  dipublikasikan_oleh?: string | null;
  catatan?: string | null;
  total_entri?: number;
  created_at: Date;
  updated_at: Date;
}

export interface ScheduleEntryDTO {
  id: string;
  sekolah_id: string;
  versi_jadwal_id: string;
  versi_jadwal_nama?: string;
  versi_jadwal_status?: StatusVersiJadwal;
  tahun_ajaran_id: string;
  tahun_ajaran_nama?: string;
  semester_id?: string | null;
  semester_nama?: string | null;
  rombel_id: string;
  rombel_nama: string;
  tingkat_nama?: string | null;
  penugasan_mengajar_id: string;
  guru_id: string;
  guru_nama: string;
  guru_nip?: string | null;
  guru_foto_url?: string | null;
  mata_pelajaran_id: string;
  mata_pelajaran_nama: string;
  mata_pelajaran_kode: string;
  slot_waktu_id: string;
  slot_waktu_nama: string;
  slot_waktu_jam_mulai: string;
  slot_waktu_jam_selesai: string;
  slot_waktu_urutan: number;
  hari: HariBelajar;
  ruangan?: string | null;
  catatan?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ClassSessionDTO {
  id: string;
  sekolah_id: string;
  jadwal_pelajaran_id?: string | null;
  penugasan_mengajar_id: string;
  rombel_id: string;
  rombel_nama: string;
  mata_pelajaran_id: string;
  mata_pelajaran_nama: string;
  mata_pelajaran_kode: string;
  guru_id: string;
  guru_nama: string;
  guru_nip?: string | null;
  guru_foto_url?: string | null;
  guru_pengganti_id?: string | null;
  guru_pengganti_nama?: string | null;
  tahun_ajaran_id: string;
  tahun_ajaran_nama?: string;
  semester_id?: string | null;
  tanggal: Date;
  jam_mulai_aktual?: Date | null;
  jam_selesai_aktual?: Date | null;
  status: StatusSesiKelas;
  ruangan_aktual?: string | null;
  topik_pembelajaran?: string | null;
  catatan?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTimeSlotInput {
  sekolah_id: string;
  nama: string;
  kode: string;
  urutan?: number;
  jam_mulai: string;
  jam_selesai: string;
  is_istirahat?: boolean;
  is_upacara?: boolean;
  hari_khusus?: string | null;
  status_aktif?: boolean;
}

export interface CreateScheduleVersionInput {
  sekolah_id: string;
  tahun_ajaran_id: string;
  semester_id?: string | null;
  nama: string;
  catatan?: string | null;
}

export interface CreateScheduleEntryInput {
  sekolah_id: string;
  versi_jadwal_id: string;
  rombel_id: string;
  penugasan_mengajar_id: string;
  slot_waktu_id: string;
  hari: HariBelajar;
  ruangan?: string | null;
  catatan?: string | null;
}

export interface OpenClassSessionInput {
  sekolah_id: string;
  jadwal_pelajaran_id?: string | null;
  penugasan_mengajar_id: string;
  rombel_id: string;
  mata_pelajaran_id: string;
  guru_id: string;
  guru_pengganti_id?: string | null;
  tahun_ajaran_id: string;
  semester_id?: string | null;
  tanggal?: string | Date;
  ruangan_aktual?: string | null;
  topik_pembelajaran?: string | null;
  catatan?: string | null;
}

export interface ScheduleConflictItem {
  type: "TEACHER_CONFLICT" | "ROMBEL_CONFLICT" | "SLOT_CONFLICT";
  message: string;
  conflicting_entry_id?: string;
}
