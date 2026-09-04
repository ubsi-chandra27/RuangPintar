/**
 * Ruang Pintar — M08 Teacher & Teaching Assignment Domain Types & DTOs
 */

export type StatusKepegawaianGuru = "TETAP" | "HONORER" | "KONTRAK" | "PNS" | "PPPK" | "LAINNYA";

export type KelompokMataPelajaran = "UMUM" | "KEJURUAN" | "PILIHAN" | "MUATAN_LOKAL";

export type StatusLifecycle = "AKTIF" | "NONAKTIF" | "ARSIP";

export type StatusPenugasan = "AKTIF" | "NONAKTIF" | "DIBATALKAN" | "SELESAI" | "ARSIP";

export interface TeacherDependencySummary {
  penugasan_mengajar: number;
  penugasan_wali: number;
  jadwal_pelajaran: number;
  sesi_sebagai_pengampu: number;
  sesi_sebagai_pengganti: number;
  materi_pembelajaran: number;
  definisi_tugas: number;
  administrasi_pembelajaran: number;
  total: number;
}

export interface SubjectDependencySummary {
  penugasan_mengajar: number;
  jadwal_pelajaran: number;
  sesi_kelas_aktual: number;
  materi_pembelajaran: number;
  definisi_tugas: number;
  total: number;
}

export interface TeachingAssignmentDependencySummary {
  jadwal_pelajaran: number;
  sesi_kelas_aktual: number;
  lingkup_materi: number;
  publikasi_materi: number;
  publikasi_tugas: number;
  administrasi_pembelajaran: number;
  total: number;
}

export interface BulkLifecycleResult {
  requested: number;
  updated: number;
  deleted: number;
  archived: number;
  rejected: Array<{ id: string; reason: string }>;
}

export interface TeacherProfileDTO {
  id: string;
  sekolah_id: string;
  pengguna_id?: string | null;
  username?: string | null;
  nip?: string | null;
  nuptk?: string | null;
  nama_lengkap: string;
  gelar_depan?: string | null;
  gelar_belakang?: string | null;
  nama_dengan_gelar: string;
  jenis_kelamin: "L" | "P";
  tempat_lahir?: string | null;
  tanggal_lahir?: Date | null;
  email?: string | null;
  telepon?: string | null;
  alamat?: string | null;
  status_kepegawaian: StatusKepegawaianGuru;
  status_aktif: boolean;
  status_lifecycle: StatusLifecycle;
  foto_url?: string | null;
  catatan?: string | null;
  created_at: Date;
  updated_at: Date;

  // Derived Summary Context
  total_rombel_aktif?: number;
  total_jam_minggu?: number;
  is_wali_kelas_aktif?: boolean;
  rombel_wali_nama?: string | null;
  jumlah_histori_akademik?: number;
  bisa_hapus_permanen?: boolean;
}

export interface SubjectDTO {
  id: string;
  sekolah_id: string;
  kode: string;
  nama: string;
  kelompok?: KelompokMataPelajaran | string | null;
  status_aktif: boolean;
  status_lifecycle: StatusLifecycle;
  deskripsi?: string | null;
  created_at: Date;
  updated_at: Date;

  // Context counts
  total_guru_pengajar?: number;
  total_rombel_aktif?: number;
  jumlah_histori_akademik?: number;
  bisa_hapus_permanen?: boolean;
}

export interface TeachingAssignmentDTO {
  id: string;
  sekolah_id: string;
  guru_id: string;
  mata_pelajaran_id: string;
  tahun_ajaran_id: string;
  semester_id?: string | null;
  rombel_id: string;
  jumlah_jam_minggu: number;
  berlaku_mulai: Date;
  berlaku_sampai?: Date | null;
  status: StatusPenugasan;
  catatan?: string | null;
  created_at: Date;
  updated_at: Date;

  // Related Aggregated Fields
  guru_nama: string;
  guru_nip?: string | null;
  guru_foto_url?: string | null;
  mata_pelajaran_kode: string;
  mata_pelajaran_nama: string;
  tahun_ajaran_nama: string;
  semester_nama?: string | null;
  rombel_nama: string;
  tingkat_nama?: string | null;
  jumlah_histori_akademik?: number;
  bisa_hapus_permanen?: boolean;
}

export interface HomeroomAssignmentDTO {
  id: string;
  sekolah_id: string;
  guru_id: string;
  rombel_id: string;
  tahun_ajaran_id: string;
  berlaku_mulai: Date;
  berlaku_sampai?: Date | null;
  status: StatusPenugasan;
  catatan?: string | null;
  created_at: Date;
  updated_at: Date;

  // Related Aggregated Fields
  guru_nama: string;
  guru_nip?: string | null;
  guru_foto_url?: string | null;
  rombel_nama: string;
  tingkat_nama?: string | null;
  tahun_ajaran_nama: string;
  total_siswa_rombel?: number;
}

export interface TeacherWorkloadDTO {
  guru_id: string;
  nama_lengkap: string;
  nip?: string | null;
  total_jam_minggu: number;
  total_rombel: number;
  total_mapel: number;
  penugasan_aktif: TeachingAssignmentDTO[];
  wali_kelas_aktif?: HomeroomAssignmentDTO | null;
}

export interface CreateTeacherInput {
  sekolah_id: string;
  pengguna_id?: string | null;
  nip?: string | null;
  nuptk?: string | null;
  nama_lengkap: string;
  gelar_depan?: string | null;
  gelar_belakang?: string | null;
  jenis_kelamin: "L" | "P";
  tempat_lahir?: string | null;
  tanggal_lahir?: Date | string | null;
  email?: string | null;
  telepon?: string | null;
  alamat?: string | null;
  status_kepegawaian?: StatusKepegawaianGuru;
  status_aktif?: boolean;
  status_lifecycle?: StatusLifecycle;
  foto_url?: string | null;
  catatan?: string | null;
}

export interface UpdateTeacherInput {
  id: string;
  sekolah_id: string;
  pengguna_id?: string | null;
  nip?: string | null;
  nuptk?: string | null;
  nama_lengkap?: string;
  gelar_depan?: string | null;
  gelar_belakang?: string | null;
  jenis_kelamin?: "L" | "P";
  tempat_lahir?: string | null;
  tanggal_lahir?: Date | string | null;
  email?: string | null;
  telepon?: string | null;
  alamat?: string | null;
  status_kepegawaian?: StatusKepegawaianGuru;
  status_aktif?: boolean;
  status_lifecycle?: StatusLifecycle;
  foto_url?: string | null;
  catatan?: string | null;
}

export interface CreateSubjectInput {
  sekolah_id: string;
  kode: string;
  nama: string;
  kelompok?: KelompokMataPelajaran | string | null;
  status_aktif?: boolean;
  status_lifecycle?: StatusLifecycle;
  deskripsi?: string | null;
}

export interface UpdateSubjectInput {
  id: string;
  sekolah_id: string;
  kode?: string;
  nama?: string;
  kelompok?: KelompokMataPelajaran | string | null;
  status_aktif?: boolean;
  status_lifecycle?: StatusLifecycle;
  deskripsi?: string | null;
}

export interface CreateTeachingAssignmentInput {
  sekolah_id: string;
  guru_id: string;
  mata_pelajaran_id: string;
  tahun_ajaran_id: string;
  semester_id?: string | null;
  rombel_id: string;
  jumlah_jam_minggu: number;
  berlaku_mulai?: Date | string | null;
  berlaku_sampai?: Date | string | null;
  status?: StatusPenugasan;
  catatan?: string | null;
}

export interface UpdateTeachingAssignmentInput {
  id: string;
  sekolah_id: string;
  jumlah_jam_minggu?: number;
  status?: StatusPenugasan;
  berlaku_sampai?: Date | string | null;
  catatan?: string | null;
}

export interface AssignHomeroomInput {
  sekolah_id: string;
  guru_id: string;
  rombel_id: string;
  tahun_ajaran_id: string;
  berlaku_mulai?: Date | string | null;
  catatan?: string | null;
}

export interface CreateBulkTeachingAssignmentsInput {
  sekolah_id: string;
  guru_id: string;
  mata_pelajaran_id: string;
  tahun_ajaran_id: string;
  semester_id?: string | null;
  rombel_ids: string[];
  jumlah_jam_minggu: number;
  berlaku_mulai?: Date | string | null;
  status?: StatusPenugasan;
  catatan?: string | null;
}
