/**
 * Ruang Pintar — M09 Academic Calendar Domain Types & Contracts
 */

export type TipeEventKalender =
  "HARI_EFEKTIF" | "HARI_LIBUR" | "KEGIATAN_SEKOLAH" | "UJIAN" | "ORIENTASI" | "LAINNYA";

export interface CalendarEventDTO {
  id: string;
  sekolah_id: string;
  tahun_ajaran_id: string;
  tahun_ajaran_nama?: string;
  semester_id?: string | null;
  semester_nama?: string | null;
  judul: string;
  deskripsi?: string | null;
  tipe_event: TipeEventKalender;
  tanggal_mulai: Date;
  tanggal_selesai: Date;
  libur_kbm: boolean;
  warna?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCalendarEventInput {
  sekolah_id: string;
  tahun_ajaran_id: string;
  semester_id?: string | null;
  judul: string;
  deskripsi?: string | null;
  tipe_event: TipeEventKalender;
  tanggal_mulai: string | Date;
  tanggal_selesai: string | Date;
  libur_kbm?: boolean;
  warna?: string | null;
}

export interface UpdateCalendarEventInput {
  id: string;
  sekolah_id: string;
  tahun_ajaran_id?: string;
  semester_id?: string | null;
  judul?: string;
  deskripsi?: string | null;
  tipe_event?: TipeEventKalender;
  tanggal_mulai?: string | Date;
  tanggal_selesai?: string | Date;
  libur_kbm?: boolean;
  warna?: string | null;
}
