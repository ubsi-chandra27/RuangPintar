/**
 * Ruang Pintar — Module M19: Reporting & Analytics
 * Domain Types, DTOs & Contracts
 *
 * Invariant Canonical:
 * 1. Report != Source of Truth (Data merupakan read model / proyeksi agregasi).
 * 2. Leadership Monitoring != Full Administrative Write Access.
 * 3. Position-Scoped Access (Disesuaikan dengan PenugasanJabatan aktif).
 */

export type { ReportFilterInput, ExportReportInput } from "./reporting-validation";

export type LeadershipPositionType =
  | "HEADMASTER"
  | "VICE_PRINCIPAL_CURRICULUM"
  | "VICE_PRINCIPAL_STUDENT_AFFAIRS"
  | "PROGRAM_HEAD"
  | "SUPER_ADMIN";

export type ReportFormat = "CSV" | "PRINT_A4" | "PDF";

export type ReportType = "PRESENSI" | "NILAI_AKADEMIK" | "KURIKULUM" | "KESISWAAN" | "EKSEKUTIF";

export interface LeadershipRoleInfo {
  code: LeadershipPositionType;
  label: string;
  unit_name?: string;
  program_id?: string | null;
  program_name?: string;
  is_active: boolean;
}

export interface UserLeadershipContext {
  user_id: string;
  nama_lengkap: string;
  peran_dasar: string;
  sekolah_id: string;
  sekolah_nama: string;
  roles: LeadershipRoleInfo[];
  active_role: LeadershipPositionType;
  can_switch_roles: boolean;
}

// =========================================================================
// 1. DTO DASHBOARD KEPALA SEKOLAH (HEADMASTER)
// =========================================================================
export interface HeadmasterOverviewDTO {
  ringkasan_sekolah: {
    total_siswa: number;
    total_guru: number;
    total_rombel: number;
    rasio_guru_siswa: string;
    status_kbm_aktif: number;
  };
  kpi_kehadiran: {
    tingkat_hadir_persen: number;
    tingkat_izin_persen: number;
    tingkat_sakit_persen: number;
    tingkat_alpha_persen: number;
    total_sesi_terekam: number;
  };
  kpi_akademik: {
    rerata_nilai_sekolah: number;
    persentase_tuntas_kktp: number;
    total_asesmen_terbit: number;
    total_tugas_terbit: number;
  };
  perhatian_kepemimpinan: Array<{
    id: string;
    tipe: "ABSENSI" | "NILAI" | "ADMINISTRASI";
    judul: string;
    deskripsi: string;
    tingkat_urgensi: "SEDANG" | "TINGGI" | "KRITIS";
    entitas_terkait?: string;
  }>;
  distribusi_tingkat: Array<{
    tingkat: string;
    total_siswa: number;
    total_rombel: number;
    rerata_kehadiran: number;
    rerata_nilai: number;
  }>;
  tren_kehadiran_mingguan: Array<{
    hari: string;
    persentase_hadir: number;
    total_hadir: number;
    total_alpha: number;
  }>;
}

// =========================================================================
// 2. DTO DASHBOARD WAKASEK KURIKULUM (VICE_PRINCIPAL_CURRICULUM)
// =========================================================================
export interface CurriculumOverviewDTO {
  kpi_kurikulum: {
    total_mata_pelajaran: number;
    total_guru_mengajar: number;
    total_materi_publikasi: number;
    total_tugas_aktif: number;
    total_asesmen: number;
    persentase_kelulusan_kktp: number;
  };
  kepatuhan_administrasi: {
    guru_patuh_count: number;
    guru_total_count: number;
    persentase_kepatuhan: number;
    dokumen_terunggah: number;
  };
  capaian_per_mapel: Array<{
    mapel_id: string;
    nama_mapel: string;
    kode_mapel: string;
    kelompok: string;
    guru_pengampu_count: number;
    rerata_nilai: number;
    persentase_tuntas: number;
  }>;
  beban_mengajar_guru: Array<{
    guru_id: string;
    nama_guru: string;
    nip: string | null;
    total_jam_minggu: number;
    total_rombel: number;
    total_mapel: number;
    status_beban: "OPTIMAL" | "LEBIH" | "KURANG";
  }>;
}

// =========================================================================
// 3. DTO DASHBOARD WAKASEK KESISWAAN (VICE_PRINCIPAL_STUDENT_AFFAIRS)
// =========================================================================
export interface StudentAffairsOverviewDTO {
  kpi_kesiswaan: {
    total_siswa: number;
    persentase_kehadiran_global: number;
    total_siswa_kritis_alpha: number;
    total_catatan_pembinaan: number;
    total_tindak_lanjut_aktif: number;
  };
  rekap_kehadiran_per_rombel: Array<{
    rombel_id: string;
    nama_rombel: string;
    tingkat: string;
    total_siswa: number;
    hadir_pct: number;
    sakit_pct: number;
    izin_pct: number;
    alpha_pct: number;
  }>;
  daftar_siswa_atensi: Array<{
    siswa_id: string;
    nama_siswa: string;
    nisn: string | null;
    rombel_nama: string;
    jumlah_alpha: number;
    jumlah_terlambat: number;
    status_urgensi: "SEDANG" | "TINGGI" | "KRITIS";
  }>;
  distribusi_kasus_pembinaan: Array<{
    kategori: string;
    jumlah: number;
  }>;
}

// =========================================================================
// 4. DTO DASHBOARD KEPALA PROGRAM KEAHLIAN (PROGRAM_HEAD)
// =========================================================================
export interface ProgramHeadOverviewDTO {
  program_info: {
    id: string;
    nama: string;
    kode: string | null;
  };
  kpi_program: {
    total_siswa: number;
    total_rombel: number;
    rerata_kehadiran: number;
    rerata_nilai_kejuruan: number;
  };
  rombel_list: Array<{
    rombel_id: string;
    nama_rombel: string;
    tingkat: string;
    wali_kelas_nama: string;
    total_siswa: number;
    rerata_kehadiran: number;
  }>;
  mapel_kejuruan_list: Array<{
    mapel_id: string;
    nama_mapel: string;
    kode_mapel: string;
    guru_pengampu: string;
    rerata_nilai: number;
    persentase_tuntas: number;
  }>;
}

// =========================================================================
// 5. DTO REKAPITULASI & EKSPOR LAPORAN
// =========================================================================
export interface RiwayatEksporItemDTO {
  id: string;
  tipe_laporan: ReportType;
  judul: string;
  format: ReportFormat;
  total_baris: number;
  dibuat_oleh_nama: string;
  berkas_url: string | null;
  created_at: string;
}

export interface AttendanceReportRow {
  no: number;
  nisn: string;
  nama_siswa: string;
  rombel: string;
  tingkat: string;
  hadir: number;
  sakit: number;
  izin: number;
  alpha: number;
  persentase_kehadiran: string;
}

export interface AcademicGradeReportRow {
  no: number;
  mata_pelajaran: string;
  guru_pengampu: string;
  rombel: string;
  jumlah_siswa: number;
  rerata_nilai: string;
  kkm_kktp: number;
  tuntas_count: number;
  belum_tuntas_count: number;
  persentase_tuntas: string;
}

export interface ExecutiveReportData {
  sekolah: {
    nama: string;
    npsn: string | null;
    alamat: string | null;
    telepon: string | null;
    email: string | null;
    kepala_sekolah_nama: string;
  };
  periode: {
    tahun_ajaran: string;
    semester: string;
    tanggal_cetak: string;
  };
  ringkasan: {
    total_siswa: number;
    total_guru: number;
    total_rombel: number;
    tingkat_kehadiran_global: number;
    persentase_tuntas_kktp: number;
    siswa_kritis_alpha: number;
  };
  distribusi_tingkat: Array<{
    tingkat: string;
    total_siswa: number;
    total_rombel: number;
    rerata_kehadiran: number;
    rerata_nilai: number;
  }>;
  perhatian_strategis: Array<{
    judul: string;
    deskripsi: string;
    tingkat_urgensi: string;
  }>;
}
