/**
 * Ruang Pintar — Academic Period & Structure (M06) Domain Types & DTOs
 */

export type StatusPeriode = "DRAFT" | "AKTIF" | "SELESAI" | "DIARSIPKAN";
export type KodeSemester = "GANJIL" | "GENAP" | "PENDEK";
export type StatusRombel = "AKTIF" | "NONAKTIF" | "DIARSIPKAN";

export interface AcademicYearDTO {
  id: string;
  sekolah_id: string;
  nama: string; // e.g. "2026/2027"
  kode: string | null;
  tanggal_mulai: Date;
  tanggal_selesai: Date;
  status: StatusPeriode;
  semester_count?: number;
  rombel_count?: number;
  created_at: Date;
  updated_at: Date;
}

export interface SemesterDTO {
  id: string;
  sekolah_id: string;
  tahun_ajaran_id: string;
  tahun_ajaran_nama?: string;
  nama: string; // e.g. "Semester Ganjil"
  kode: string; // "GANJIL" | "GENAP" | "PENDEK"
  urutan: number;
  tanggal_mulai: Date;
  tanggal_selesai: Date;
  status: StatusPeriode;
  rombel_count?: number;
  created_at: Date;
  updated_at: Date;
}

export interface PhaseDTO {
  id: string;
  sekolah_id: string;
  nama: string; // e.g. "Fase E"
  kode: string; // e.g. "FASE_E"
  deskripsi: string | null;
  urutan: number;
  tingkat_count?: number;
  rombel_count?: number;
  created_at: Date;
  updated_at: Date;
}

export interface GradeLevelDTO {
  id: string;
  sekolah_id: string;
  fase_id: string | null;
  fase_nama?: string | null;
  kode: string; // e.g. "10", "11", "12" atau "X", "XI", "XII"
  nama: string; // e.g. "Kelas 10", "Kelas X"
  urutan: number;
  rombel_count?: number;
  created_at: Date;
  updated_at: Date;
}

export interface AcademicProgramDTO {
  id: string;
  sekolah_id: string;
  kode: string; // e.g. "RPL", "TKJ", "DKV", "IPA", "IPS"
  nama: string; // e.g. "Rekayasa Perangkat Lunak"
  jenjang: string | null; // e.g. "SMK", "SMA"
  status_aktif: boolean;
  deskripsi: string | null;
  rombel_count?: number;
  created_at: Date;
  updated_at: Date;
}

export interface RombelDTO {
  id: string;
  sekolah_id: string;
  tahun_ajaran_id: string;
  tahun_ajaran_nama?: string;
  semester_id: string | null;
  semester_nama?: string | null;
  tingkat_id: string;
  tingkat_nama?: string;
  tingkat_kode?: string;
  fase_id: string | null;
  fase_nama?: string | null;
  program_id: string | null;
  program_nama?: string | null;
  program_kode?: string | null;
  nama: string; // e.g. "X RPL 1"
  kode: string | null;
  kapasitas: number;
  status: StatusRombel;
  catatan: string | null;
  created_at: Date;
  updated_at: Date;
}

// Input Types for Use Cases
export interface CreateAcademicYearInput {
  nama: string;
  kode?: string | null;
  tanggal_mulai: Date | string;
  tanggal_selesai: Date | string;
  status?: StatusPeriode;
}

export interface UpdateAcademicYearInput {
  nama?: string;
  kode?: string | null;
  tanggal_mulai?: Date | string;
  tanggal_selesai?: Date | string;
  status?: StatusPeriode;
}

export interface CreateSemesterInput {
  tahun_ajaran_id: string;
  nama: string;
  kode: KodeSemester | string;
  urutan?: number;
  tanggal_mulai: Date | string;
  tanggal_selesai: Date | string;
  status?: StatusPeriode;
}

export interface UpdateSemesterInput {
  nama?: string;
  kode?: KodeSemester | string;
  urutan?: number;
  tanggal_mulai?: Date | string;
  tanggal_selesai?: Date | string;
  status?: StatusPeriode;
}

export interface CreatePhaseInput {
  nama: string;
  kode: string;
  deskripsi?: string | null;
  urutan?: number;
}

export interface UpdatePhaseInput {
  nama?: string;
  kode?: string;
  deskripsi?: string | null;
  urutan?: number;
}

export interface CreateGradeLevelInput {
  kode: string;
  nama: string;
  fase_id?: string | null;
  urutan?: number;
}

export interface UpdateGradeLevelInput {
  kode?: string;
  nama?: string;
  fase_id?: string | null;
  urutan?: number;
}

export interface CreateProgramInput {
  kode: string;
  nama: string;
  jenjang?: string | null;
  status_aktif?: boolean;
  deskripsi?: string | null;
}

export interface UpdateProgramInput {
  kode?: string;
  nama?: string;
  jenjang?: string | null;
  status_aktif?: boolean;
  deskripsi?: string | null;
}

export interface CreateRombelInput {
  tahun_ajaran_id: string;
  semester_id?: string | null;
  tingkat_id: string;
  fase_id?: string | null;
  program_id?: string | null;
  nama: string;
  kode?: string | null;
  kapasitas?: number;
  status?: StatusRombel;
  catatan?: string | null;
}

export interface UpdateRombelInput {
  tahun_ajaran_id?: string;
  semester_id?: string | null;
  tingkat_id?: string;
  fase_id?: string | null;
  program_id?: string | null;
  nama?: string;
  kode?: string | null;
  kapasitas?: number;
  status?: StatusRombel;
  catatan?: string | null;
}
