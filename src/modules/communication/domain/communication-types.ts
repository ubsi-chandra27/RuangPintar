/**
 * Ruang Pintar — M16 Communication Domain Types
 * Definisi tipe data dan kontrak domain pengumuman resmi dan komunikasi sekolah.
 */

export type AnnouncementCategory = "UMUM" | "AKADEMIK" | "KEGIATAN" | "PENTING" | "DARURAT";
export type AnnouncementStatus = "DRAFT" | "PUBLISHED" | "ARSIP";
export type AudienceTarget = "SEMUA" | "GURU" | "SISWA" | "WALI" | "ROMBEL";

export interface AnnouncementAuthor {
  id: string;
  nama_lengkap: string;
  peran_dasar: string;
}

export interface AnnouncementRombelTarget {
  id: string;
  nama: string;
}

export interface AnnouncementItem {
  id: string;
  sekolah_id: string;
  penulis_id: string;
  penulis: AnnouncementAuthor;
  judul: string;
  konten: string;
  kategori: AnnouncementCategory;
  status: AnnouncementStatus;
  apakah_disematkan: boolean;
  lampiran_url: string | null;
  target_audiens: AudienceTarget;
  target_rombel_id: string | null;
  target_rombel?: AnnouncementRombelTarget | null;
  dipublikasikan_pada: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAnnouncementInput {
  judul: string;
  konten: string;
  kategori: AnnouncementCategory;
  target_audiens: AudienceTarget;
  target_rombel_id?: string | null;
  apakah_disematkan?: boolean;
  lampiran_url?: string | null;
  status?: AnnouncementStatus;
}

export interface UpdateAnnouncementInput {
  judul?: string;
  konten?: string;
  kategori?: AnnouncementCategory;
  target_audiens?: AudienceTarget;
  target_rombel_id?: string | null;
  apakah_disematkan?: boolean;
  lampiran_url?: string | null;
  status?: AnnouncementStatus;
}

export interface AnnouncementFilter {
  kategori?: AnnouncementCategory | "SEMUA";
  status?: AnnouncementStatus;
  pencarian?: string;
}
