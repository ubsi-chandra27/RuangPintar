/**
 * Ruang Pintar — School & Organization (M01) Domain Types & DTOs
 */

export type JenjangSekolah = "SD" | "SMP" | "SMA" | "SMK" | "UMUM";

export type StatusPenugasanJabatan = "AKTIF" | "SELESAI" | "DIBATALKAN";

export type TingkatAksesJabatan = "SCHOOL_WIDE" | "UNIT_WIDE" | "PROGRAM_WIDE";

export interface SchoolProfileDTO {
  id: string;
  nama: string;
  npsn: string | null;
  jenjang: string;
  alamat: string | null;
  telepon: string | null;
  email: string | null;
  zona_waktu: string;
  logo_url: string | null;
  status_aktif: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UpdateSchoolProfileInput {
  nama: string;
  npsn?: string | null;
  jenjang: JenjangSekolah;
  alamat?: string | null;
  telepon?: string | null;
  email?: string | null;
  zona_waktu?: string;
  logo_url?: string | null;
}

export interface OrganizationUnitDTO {
  id: string;
  sekolah_id: string;
  nama: string;
  kode: string | null;
  induk_unit_id: string | null;
  induk_unit_nama?: string | null;
  sub_unit_count?: number;
  jabatan_count?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateOrganizationUnitInput {
  nama: string;
  kode?: string | null;
  induk_unit_id?: string | null;
}

export interface UpdateOrganizationUnitInput {
  nama: string;
  kode?: string | null;
  induk_unit_id?: string | null;
}

export interface PositionDTO {
  id: string;
  sekolah_id: string;
  unit_id: string | null;
  unit_nama?: string | null;
  kode_jabatan: string;
  nama_jabatan: string;
  tingkat_akses: string | null;
  is_canonical: boolean;
  penugasan_count?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePositionInput {
  kode_jabatan: string;
  nama_jabatan: string;
  unit_id?: string | null;
  tingkat_akses?: TingkatAksesJabatan | null;
}

export interface UpdatePositionInput {
  nama_jabatan: string;
  unit_id?: string | null;
  tingkat_akses?: TingkatAksesJabatan | null;
}

export interface PositionAssignmentDTO {
  id: string;
  sekolah_id: string;
  jabatan_id: string;
  jabatan_nama?: string;
  jabatan_kode?: string;
  unit_nama?: string | null;
  personil_id: string;
  personil_nama?: string;
  personil_username?: string;
  berlaku_mulai: Date;
  berlaku_sampai: Date | null;
  status: string;
  catatan: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface AssignPositionInput {
  personil_id: string;
  jabatan_id: string;
  berlaku_mulai: Date;
  berlaku_sampai?: Date | null;
  catatan?: string | null;
}

export interface EndPositionAssignmentInput {
  berlaku_sampai: Date;
  catatan?: string | null;
}

export interface CancelPositionAssignmentInput {
  catatan: string;
}

export interface PersonilOptionDTO {
  id: string;
  username: string;
  nama_lengkap: string;
  peran_dasar: string;
  status_akun: string;
}
