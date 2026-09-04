# RUANG PINTAR — PHASE 13 COMPLETION REPORT

**Phase:** PHASE 13 — ASSESSMENT, TP & GRADEBOOK (M13)  
**Module:** M13 — Assessment Definition, Student Grades & Gradebook Matrix  
**Milestone:** MILESTONE D — LEARNING ACTIVITY, ATTENDANCE & TEACHER ACADEMIC MVP  
**Status:** APPROVED BY HUMAN (4 September 2026)  
**Date:** 2026-09-04  

---

## 1. Executive Summary

Phase 13 menuntaskan puncak siklus pengajaran guru (**Teacher Academic MVP**) dengan merealisasikan sistem manajemen penilaian akademik berbasis **Kurikulum Merdeka (Tujuan Pembelajaran / TP & Lingkup Materi / BAB)** serta **Buku Nilai Dinamis (Gradebook Matrix)**.

Modul ini mengimplementasikan dua invariant domain fundamental:
1. **$\text{Assessment Definition} \neq \text{Grade} \neq \text{Grade Publication}$**:
   - *Assessment Definition*: Blueprint/kontrak asesmen (Judul, Bobot, KKTP, Kategori Formatif/Sumatif, Teknik, TP terkait).
   - *Grade*: Lembar penilaian autentik siswa (angka, huruf, status ketercapaian, catatan capaian e-rapor).
   - *Grade Publication*: Pelepasan resmi nilai ke audiens sasaran (Siswa, Orang Tua/Wali, atau Semua). Guru dapat menyusun draf nilai tanpa langsung terlihat oleh wali murid sebelum diverifikasi tuntas.
2. **$\text{Missing Grade} \neq \text{Zero Grade}$**:
   - Siswa yang belum dinilai (sakit saat ujian, susulan, atau draf) **WAJIB** bernilai `null` (ditampilkan `-`), dan **BUKAN** `0`.
   - Angka `0` adalah nilai absolut yang sah (misal pelanggaran akademik/tidak mengerjakan sama sekali), sementara `null` berarti belum ada proses asesmen. Sistem memastikan kalkulasi rata-rata kelas dan ketuntasan KKTP hanya membagi atas siswa yang sudah dinilai (*assessed count*), mencegah distorsi statistik kelas.

---

## 2. Invariant & Domain Integrity Proof

1. **Struktur Matriks Dinamis (Bukan Kolom Statis)**:
   - Platform **tidak menggunakan** kolom statis seperti `nilai_tp1`, `nilai_tp2`, `nilai_uts` di database.
   - Setiap asesmen adalah entri first-class entity (`DefinisiAsesmen`) yang secara dinamis digabungkan ke dalam matriks buku nilai (*Gradebook Matrix View*) berdasarkan penugasan mengajar guru.
2. **Keterkaitan TP & Lingkup Materi**:
   - Asesmen dapat dikaitkan secara opsional atau langsung ke `TujuanPembelajaran` (TP) dan `LingkupMateri` (BAB), mendukung pencatatan e-Rapor dan deskripsi capaian kompetensi otomatis.
3. **Penyimpanan Draft vs Published**:
   - Guru dapat menyimpan nilai sebagai `DRAFT` berkali-kali menggunakan tombol *"Simpan Draf"*.
   - Saat siap, guru dapat menerbitkan nilai secara resmi melalui *"Publikasikan Sekarang"* dengan memilih target audiens (Siswa, Wali Murid, atau Semua).
4. **Audit Trail & Alasan Koreksi**:
   - Setiap kali nilai siswa yang sudah ada diubah, sistem mencatat `diubah_terakhir_oleh` dan mewajibkan `alasan_koreksi` pada audit log untuk integritas akademik.

---

## 3. Database Schema & Migration (M13)

- **Migration Applied:** `prisma/migrations/20260904101500_add_assessment_and_gradebook/migration.sql`
- **Tabel Baru:**
  1. `definisi_asesmen` (`DefinisiAsesmen`): Menyimpan definisi/kontrak kegiatan penilaian pembelajaran.
  2. `nilai_siswa` (`NilaiSiswa`): Menyimpan nilai angka/huruf per siswa per asesmen dengan `nilai_angka Float?` (nullable).
  3. `publikasi_nilai_asesmen` (`PublikasiNilaiAsesmen`): Mencatat riwayat pelepasan nilai ke siswa dan wali murid.

```prisma
model DefinisiAsesmen {
  id                    String    @id
  sekolah_id            String
  penugasan_mengajar_id String
  tp_id                 String?
  lingkup_materi_id     String?
  judul                 String
  deskripsi             String?
  kategori              String    @default("FORMATIF") // FORMATIF | SUMATIF | SUMATIF_AKHIR | TUGAS | PRAKTIK
  teknik_penilaian      String    @default("TES_TERTULIS") // TES_TERTULIS | TES_LISAN | PENUGASAN | KINERJA | PORTOFOLIO
  bobot                 Float     @default(1.0)
  skala_maksimal        Float     @default(100.0)
  kkm_kktp              Float     @default(75.0)
  tanggal_pelaksanaan   DateTime  @default(now())
  status                String    @default("DRAFT") // DRAFT | PUBLISHED | FINALIZED | ARSIP
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt
  ...
}

model NilaiSiswa {
  id                   String    @id
  sekolah_id           String
  asesmen_id           String
  siswa_id             String
  penempatan_rombel_id String?
  nilai_angka          Float?    // NULLABLE! Invariant: Missing Grade != Zero Grade
  nilai_huruf          String?   // A | B | C | D
  capaian_kompetensi   String?
  catatan              String?
  status               String    @default("DRAFT")
  diinput_oleh         String?
  diubah_terakhir_oleh String?
  alasan_koreksi       String?
  ...
  @@unique([asesmen_id, siswa_id])
}

model PublikasiNilaiAsesmen {
  id                  String    @id
  sekolah_id          String
  asesmen_id          String
  target_audience     String    @default("SEMUA") // SISWA | WALI | SEMUA
  tanggal_publikasi   DateTime  @default(now())
  dipublikasikan_oleh String
  status              String    @default("PUBLISHED")
  ...
}
```

---

## 4. Architectural & Layered Components

1. **Domain Layer:**
   - [`src/modules/assessment/domain/assessment-types.ts`](file:///C:/laragon/www/Ruang-Pintar/src/modules/assessment/domain/assessment-types.ts): Tipe data DTO, Enums kategori (FORMATIF, SUMATIF, SAS, TUGAS, PRAKTIK), teknik, dan matriks buku nilai.
   - [`src/modules/assessment/domain/assessment-errors.ts`](file:///C:/laragon/www/Ruang-Pintar/src/modules/assessment/domain/assessment-errors.ts): Error terdefinisi domain (`AssessmentNotFoundError`, `AssessmentValidationError`, `AssessmentFinalizedError`).
   - [`src/modules/assessment/domain/assessment-validation.ts`](file:///C:/laragon/www/Ruang-Pintar/src/modules/assessment/domain/assessment-validation.ts): Validasi skema Zod dengan dukungan `nilai_angka` nullable.
2. **Infrastructure Layer:**
   - [`src/modules/assessment/infrastructure/assessment-repository.ts`](file:///C:/laragon/www/Ruang-Pintar/src/modules/assessment/infrastructure/assessment-repository.ts): Transaksi atomik Prisma untuk CRUD asesmen, bulk-save nilai, kalkulasi statistik kelas, matriks buku nilai, dan publikasi nilai.
3. **Application Layer:**
   - [`src/modules/assessment/application/assessment-service.ts`](file:///C:/laragon/www/Ruang-Pintar/src/modules/assessment/application/assessment-service.ts): Service logika bisnis dengan verifikasi otorisasi pengampu mengajar (*teacher scope verification*) dan pencatatan audit log platform.
4. **Server Actions:**
   - [`src/app/actions/assessment-actions.ts`](file:///C:/laragon/www/Ruang-Pintar/src/app/actions/assessment-actions.ts): Server Actions Next.js (`createAssessmentAction`, `updateAssessmentAction`, `deleteAssessmentAction`, `getAssessmentGradesAction`, `saveAssessmentGradesAction`, `publishAssessmentAction`, `getClassGradebookAction`).
5. **Presentation Layer (Academic Glass UI):**
   - [`src/modules/assessment/presentation/create-assessment-modal.tsx`](file:///C:/laragon/www/Ruang-Pintar/src/modules/assessment/presentation/create-assessment-modal.tsx): Modal pembuatan asesmen baru berbasis TP & BAB.
   - [`src/modules/assessment/presentation/input-grades-modal.tsx`](file:///C:/laragon/www/Ruang-Pintar/src/modules/assessment/presentation/input-grades-modal.tsx): Lembar input nilai interaktif dengan quick-action *"Isi KKTP"* dan penanganan missing grade.
   - [`src/modules/assessment/presentation/publish-assessment-modal.tsx`](file:///C:/laragon/www/Ruang-Pintar/src/modules/assessment/presentation/publish-assessment-modal.tsx): Dialog konfirmasi publikasi ke siswa & wali murid.
   - [`src/modules/assessment/presentation/class-assessment-tab-view.tsx`](file:///C:/laragon/www/Ruang-Pintar/src/modules/assessment/presentation/class-assessment-tab-view.tsx): Tampilan terpadu Tab 8 pada Workspace Kelas dengan sub-tab Daftar Asesmen & Matriks Buku Nilai.
   - [`src/modules/assessment/presentation/teacher-gradebook-overview-view.tsx`](file:///C:/laragon/www/Ruang-Pintar/src/modules/assessment/presentation/teacher-gradebook-overview-view.tsx): Tampilan pusat buku nilai guru untuk seluruh kelas ampuannya.
   - [`src/app/penilaian/page.tsx`](file:///C:/laragon/www/Ruang-Pintar/src/app/penilaian/page.tsx): Route utama direktori buku nilai & rapor.

---

## 5. Quality Gate Verification

| Check | Tool / Command | Status | Bukti |
|---|---|---|---|
| **Typecheck** | `tsc --noEmit` | **PASS** | 0 error TypeScript pada seluruh codebase |
| **Linter** | `npm run lint` | **PASS** | ESLint keluar dengan kode 0 (0 error, 0 warning) |
| **Formatter** | `npm run format:check` | **PASS** | Seluruh berkas sesuai standar Prettier |
| **Unit Tests** | `npm test` | **PASS** | **65/65 test files lulus (347/347 total tests passing)** |
| **Production Build** | `npm run build` | **PASS** | Build Next.js 16.3.3 Turbopack lulus tanpa error |
| **End-to-End Walkthrough** | Playwright Automation | **PASS** | Skrip `qa-phase13-full-walkthrough.mjs` lulus 100% |

---

## 6. Visual Review & Walkthrough Screenshots

Seluruh tangkapan layar otomatis disimpan di direktori `docs/phases/screenshots/phase-13-walkthrough/`:
- `01_dashboard_guru.png`: Dashboard guru Budi setelah autentikasi.
- `02_kelas_saya_list.png`: Direktori Kelas Saya.
- `03_tab_penilaian_initial.png`: Tampilan awal Tab 8 "Penilaian & Buku Nilai" pada Workspace Kelas X TO 3.
- `04_modal_buat_asesmen.png`: Modal pembuatan Definisi Asesmen berbasis TP (Algoritma & Pemrograman Dasar).
- `05_daftar_asesmen_terupdate.png`: Kartu asesmen yang baru dibuat dengan indikator Formatif TP 1.1 dan KKTP 75.
- `06_modal_input_nilai_missing_grade_handled.png`: Lembar input nilai interaktif yang membuktikan invariant **Missing Grade $\neq$ Zero Grade** (siswa Lubna dikosongkan `-` tanpa menjadi 0).
- `07_modal_publikasikan_nilai.png`: Modal konfirmasi pelepasan publikasi nilai ke siswa dan wali murid.
- `08_buku_nilai_matrix_view.png`: Tampilan Matriks Buku Nilai (Gradebook Matrix) lengkap dengan rerata kelas (78.4), ketuntasan KKTP (83%), nilai akhir per siswa, dan tanda `-` untuk siswa belum dinilai.
- `09_penilaian_centralized_overview.png`: Halaman pusat Buku Nilai & Penilaian TP (`/penilaian`) yang merangkum seluruh kelas ampu.
- `10_mobile_penilaian_overview.png`: Tampilan mobile responsive halaman pusat buku nilai dengan Mobile Bottom Navigation.
- `11_mobile_kelas_tab_penilaian.png`: Tampilan mobile responsive Tab Penilaian Workspace Kelas.

---

## 7. Known Limitations & Out-of-Scope Confirmation

- **CBT Ujian Online (Phase 14)**: Penilaian berbasis tes pilihan ganda otomatis / bank soal CBT berada di luar lingkup Phase 13 dan akan diimplementasikan pada Phase 14 sesuai roadmap Milestone E.
- **e-Rapor & Cetak PDF Rapor (Phase 15)**: Kompilasi capaian akhir rapor semester, bobot kurikulum lintas mapel, dan cetak lembar rapor resmi siswa berada pada Phase 15.

---

## 8. Status Akhir

```text
STATUS: APPROVED BY HUMAN (4 September 2026)
LOCKED FOR REGRESSION
```
Semua target Milestone D (Teacher Academic MVP) pada Phase 13 telah secara resmi disetujui (*APPROVED*) oleh Human Reviewer pada tanggal 4 September 2026. Baseline dikunci untuk mencegah regresi.
