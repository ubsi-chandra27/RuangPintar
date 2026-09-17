# PHASE 19 — LEADERSHIP DASHBOARD, REPORTING & ANALYTICS (M19 / MILESTONE G)
## Ruang Pintar — School Digital Operating Platform

**Versi:** 1.0  
**Status:** READY FOR HUMAN REVIEW  
**Tanggal:** 12 September 2026  
**Penyusun:** Antigravity AI Coding Agent  
**Modul Induk:** M19 — Reporting & Analytics  
**Dokumen Referensi:**
- `docs/08-IMPLEMENTATION-ROADMAP.md` (Bagian 28 — Phase 19 Leadership Dashboard & Analytics)
- `docs/03-MODULE-MAP.md` (M19 Reporting & Analytics)
- `docs/04-ROLE-ACCESS.md` (Seksi 14 — Portal Kepemimpinan & Supervisi Struktural)
- `docs/FRD.md` (FR-REP-001 s/d FR-REP-005)
- `AGENTS.md` (Domain Invariants & UI Rule Reference = Contract)

---

# 1. Ringkasan Eksekutif

Phase 19 menuntaskan pembangunan **Leadership Dashboard, Reporting & Analytics (M19)** yang mendedikasikan portal evaluasi kepemimpinan sekolah (`/pimpinan`) bagi pejabat struktural sekolah (Kepala Sekolah, Wakasek Bidang Kurikulum, Wakasek Bidang Kesiswaan, dan Kepala Program Keahlian) serta Super Admin. Sistem ini menyajikan analitik lintas modul secara terpadu, proyeksi baca metrik mutu pendidikan, serta pusat pengunduhan laporan formal (ekspor CSV terstruktur dan lembar cetak eksekutif format A4 siap tanda tangan).

Implementasi Phase 19 menegakkan **Domain Invariants** kanonikal:

1. **`Report ≠ Source of Truth (Derived Read Models)`**:
   - Seluruh metrik KPI, distribusi ketuntasan KKTP, matriks kehadiran rombel, dan tren mingguan merupakan hasil agregasi (*derived projection*) dinamis dari modul transaksional:
     - **M01 & M06**: Profil sekolah, tahun ajaran aktif, semester, dan rombel binaan.
     - **M07 & M08**: Data induk siswa aktif dan personil guru pengampu.
     - **M10**: Jadwal resmi dan realisasi sesi kelas aktual (`SesiKelasAktual`).
     - **M11**: Administrasi KBM guru (materi terbit, modul ajar, dan tugas siswa).
     - **M12**: Catatan absensi sesi kelas riil (`PresensiSesiKelas`).
     - **M13**: Rekap nilai asesmen resmi berstatus `PUBLISHED` (`NilaiSiswa` & `DefinisiAsesmen`) dengan mempertahankan invariant *Missing Grade ≠ Zero Grade*.
     - **M18**: Kasus kesiswaan dan catatan pembinaan holistik (`CatatanMonitoring`).
2. **`Leadership Monitoring ≠ Full Administrative Write Access`**:
   - Pimpinan sekolah memegang hak supervisi evaluatif, bukan hak untuk memanipulasi, merevisi secara sepihak, ataupun menimpa (*grade override*) penilaian guru mata pelajaran maupun absensi kehadiran siswa di kelas.
3. **`Position-Scoped Access Control (Server-Side Default Deny)`**:
   - Akses `/pimpinan` dikunci secara ketat server-side berdasarkan `PenugasanJabatan` aktif:
     - **`HEADMASTER`**: Visibilitas manajemen strategis sekolah menyeluruh (*School-Wide Management View*).
     - **`VICE_PRINCIPAL_CURRICULUM`**: Visibilitas kurikulum, capaian TP, beban mengajar guru, dan ketuntasan penilaian (*Curriculum-Scoped View*).
     - **`VICE_PRINCIPAL_STUDENT_AFFAIRS`**: Visibilitas disiplin kesiswaan, absensi kronis (*chronic absenteeism*), dan pembinaan lintas rombel (*Student Affairs View*).
     - **`PROGRAM_HEAD`**: Visibilitas khusus rombel dan program keahlian kejuruan binaannya (*Program-Scoped View*).
     - **`SUPER_ADMIN`**: Supervisi komprehensif dengan fitur *Context Switcher* antar jabatan struktural.
     - Pengguna tanpa penugasan struktural aktif (guru umum, staf non-operator, siswa, wali) ditolak mutlak (*HTTP 403 Forbidden*).
4. **`Export & Audit Trail Integrity`**:
   - Setiap berkas laporan formal (CSV/A4) yang digenerate oleh pimpinan dicatat secara persisten ke tabel database `RiwayatEksporLaporan` beserta metadata filter dan identitas pembuat.

---

# 2. Files Created & Modified

### Files Created:
1. `prisma/migrations/20260911230000_add_reporting_and_analytics_m19/migration.sql`: DDL migrasi tabel `riwayat_ekspor_laporan` dengan indeks performa pencarian.
2. `prisma/seed-leadership-analytics.ts`: Script seed data akun pimpinan (`kepsek_demo`, `wakakur_demo`, `wakasis_demo`, `kaprog_demo`), penugasan jabatan kanonikal, dan sampel riwayat ekspor.
3. `src/modules/reporting/domain/reporting-types.ts`: Kontrak TypeScript antarmuka DTO pimpinan, ringkasan eksekutif, parameter filter ekspor, dan konteks jabatan struktural.
4. `src/modules/reporting/domain/reporting-errors.ts`: Definisi error domain (`UnauthorizedLeadershipAccessError`, `ExportGenerationError`, `LeadershipPositionNotFoundError`).
5. `src/modules/reporting/domain/reporting-validation.ts`: Skema validasi Zod untuk filter periode, tingkat, rombel, dan opsi ekspor data.
6. `src/modules/reporting/infrastructure/reporting-repository.ts`: Query engine Prisma untuk agregasi analitik lintas modul (M01-M18) dan pencatatan audit log `riwayat_ekspor_laporan`.
7. `src/modules/reporting/application/leadership-analytics-service.ts`: Application service penjaga otorisasi jabatan, orkestrasi analitik per jabatan, formatting CSV, dan kompilasi data cetak eksekutif A4.
8. `src/app/actions/leadership-actions.ts`: Server actions Next.js untuk data overview pimpinan, riwayat ekspor, generator CSV, dan pratinjau lembar cetak.
9. `src/modules/reporting/presentation/headmaster-view.tsx`: Tampilan dashboard Kepala Sekolah berstandar Academic Glass UI v1.2 (KPI strategis, sinyal peringatan pimpinan, distribusi tingkat kelas, dan tren kehadiran).
10. `src/modules/reporting/presentation/curriculum-analytics-view.tsx`: Tampilan analitik Wakasek Kurikulum (beban mengajar JP mingguan per guru, kepatuhan administrasi KBM, dan distribusi ketuntasan KKTP).
11. `src/modules/reporting/presentation/student-affairs-view.tsx`: Tampilan analitik Wakasek Kesiswaan (matriks kehadiran per rombel, daftar siswa alpha tinggi, dan agregasi kasus pembinaan).
12. `src/modules/reporting/presentation/program-head-view.tsx`: Tampilan analitik Kepala Program Keahlian (cohort jurusan, utilisasi jam praktik bengkel, performa kompetensi siswa).
13. `src/modules/reporting/presentation/report-export-center.tsx`: Pusat unduh laporan CSV dan tabel riwayat pembuatan laporan formal sekolah.
14. `src/modules/reporting/presentation/executive-print-modal.tsx`: Modal dialog pratinjau lembar ringkasan eksekutif A4 formal dengan kop surat sekolah dan area tanda tangan pimpinan (`window.print()`).
15. `src/modules/reporting/presentation/leadership-portal-view.tsx`: Komponen kontainer portal multi-tab dengan *Role Context Switcher* bagi Super Admin / pimpinan multi-jabatan.
16. `src/app/pimpinan/page.tsx`: Route page kanonikal Next.js untuk Portal Kepemimpinan & Laporan Sekolah.
17. `src/app/laporan-sekolah/page.tsx`: Rute pengarah (*redirect route*) dari `/laporan-sekolah` ke `/pimpinan`.
18. `src/test/reporting/reporting-service.test.ts`: Unit test suite (10 pengujian) untuk scoping jabatan, default deny, agregasi KPI, ekspor CSV, dan audit riwayat.
19. `src/test/reporting/reporting-views.test.tsx`: Presentation test suite (6 pengujian) untuk rendering view Kepala Sekolah, Kurikulum, Kesiswaan, Program Keahlian, Export Center, dan Print Modal.
20. `scripts/qa-phase19-visual-walkthrough.mjs`: Script otomatis Playwright walkthrough 8 skenario kepemimpinan lintas peran.
21. `docs/phases/PHASE-19-LEADERSHIP-REPORTING-ANALYTICS.md`: Dokumen deliverable resmi Phase 19.

### Files Modified:
1. `prisma/schema.prisma`: Penambahan model `RiwayatEksporLaporan` serta reciprocal relations pada `Sekolah` dan `Pengguna`.
2. `src/shared/components/shell/navigation-config.ts`: Penambahan entri navigasi resmi `/pimpinan` untuk guru dengan jabatan struktural dan pembaruan item navigasi staf.
3. `src/shared/components/dashboard/role-views/super-admin-dashboard.tsx`: Penautan tombol pintas *Laporan & Pimpinan* ke rute `/pimpinan`.
4. `src/shared/infrastructure/authorization/authz-guard.ts`: Integrasi evaluasi penugasan jabatan struktural (`positionAssignments`) pada konteks otorisasi server-side.
5. `src/shared/infrastructure/authorization/role-permissions.ts`: Pendaftaran permission `report.export` pada seluruh jabatan struktural pimpinan (`HEADMASTER`, `VICE_PRINCIPAL_CURRICULUM`, `VICE_PRINCIPAL_STUDENT_AFFAIRS`, `PROGRAM_HEAD`).

---

# 3. Database & Migrations

Satu model relasional first-party ditambahkan ke database SQLite via migrasi forward `20260911230000_add_reporting_and_analytics_m19`:

```sql
-- Riwayat dan Metadata Ekspor Laporan Resmi Sekolah
CREATE TABLE riwayat_ekspor_laporan (
    id TEXT NOT NULL PRIMARY KEY,
    sekolah_id TEXT NOT NULL,
    tipe_laporan TEXT NOT NULL, -- PRESENSI | NILAI_AKADEMIK | KURIKULUM | KESISWAAN | EKSEKUTIF
    judul TEXT NOT NULL,
    format TEXT NOT NULL, -- CSV | PRINT_A4 | PDF
    parameter_filter_json TEXT,
    total_baris INTEGER NOT NULL DEFAULT 0,
    dibuat_oleh_id TEXT NOT NULL,
    berkas_url TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT riwayat_ekspor_laporan_sekolah_id_fkey FOREIGN KEY (sekolah_id) REFERENCES sekolah (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT riwayat_ekspor_laporan_dibuat_oleh_id_fkey FOREIGN KEY (dibuat_oleh_id) REFERENCES pengguna (id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX riwayat_ekspor_laporan_sekolah_id_tipe_laporan_idx ON riwayat_ekspor_laporan (sekolah_id, tipe_laporan);
CREATE INDEX riwayat_ekspor_laporan_dibuat_oleh_id_idx ON riwayat_ekspor_laporan (dibuat_oleh_id);
```

---

# 4. Domain Invariants & Rules

1. **Proyeksi Baca Murni (No Transaction Mutation)**:
   - Modul pelaporan tidak mengubah state nilai siswa, tidak mengubah status sesi KBM, dan tidak memodifikasi presensi. Modul ini murni menghasilkan ringkasan analitik berbasis data transaksi terkonfirmasi.
2. **Kepatuhan Terhadap Missing Grade vs Zero Grade**:
   - Dalam penghitungan rata-rata nilai sekolah dan persentase ketuntasan KKTP lintas rombel, siswa yang belum memiliki nilai asesmen diabaikan dari pembagi perhitungan (*assessed count*), sehingga tidak menurunkan rerata secara artifisial menjadi 0.
3. **Pemisahan Peran Struktural Terhadap Hak Akses**:
   - Kepala Sekolah menerima ringkasan strategis sekolah secara menyeluruh (*School-Wide*).
   - Wakasek Kurikulum hanya difokuskan pada metrik akademik, distribusi jam mengajar, silabus, dan ketuntasan asesmen.
   - Wakasek Kesiswaan berfokus pada ketertiban siswa, absensi alpha, tingkat keterlambatan, dan riwayat pembinaan.
   - Kepala Program Keahlian dibatasi hanya melihat rombel dan konsentrasi program keahliannya.

---

# 5. Quality Gates & Verification Evidence

| Quality Gate | Standar / Target | Hasil Verifikasi | Status |
|---|---|---|---|
| **TypeScript Typecheck** | `npm run typecheck` (`tsc --noEmit`) | 0 errors | **PASS** |
| **ESLint** | `npm run lint` (`eslint .`) | 0 errors | **PASS** |
| **Code Formatting** | `npm run format:check` (`prettier --check .`) | 100% compliant | **PASS** |
| **Unit & Integration Tests** | `npm run test` (`vitest run --fileParallelism=false`) | **81 test files, 458 tests passing** (100% PASS) | **PASS** |
| **Next.js Production Build** | `npm run build` (`next build`) | 22 rute terkompilasi optimal (termasuk `/pimpinan`) | **PASS** |
| **Playwright Visual QA** | `scripts/qa-phase19-visual-walkthrough.mjs` | **8 skenario visual sukses 100%** | **PASS** |

### Bukti Visual Playwright Walkthrough (8 Screenshot):
1. `01-headmaster-overview-kpi.png`: Dashboard Strategis Kepala Sekolah (Hero Banner, 4 KPI Top Cards, Distribusi Tingkat, Tren Kehadiran Mingguan).
2. `02-headmaster-executive-print-modal.png`: Pratinjau Modal Cetak Lembar Eksekutif format resmi A4 lengkap dengan Kop Surat Sekolah dan Lembar Pengesahan Pimpinan.
3. `03-curriculum-analytics-view.png`: Dashboard Wakasek Kurikulum (Monitoring Kepatuhan Administrasi Guru, Beban Mengajar JP Mingguan, Capaian KKTP per Mapel).
4. `04-student-affairs-attendance-matrix.png`: Dashboard Wakasek Kesiswaan (Matriks Kehadiran per Rombel, Deteksi Siswa Alpha Tinggi / Kronis, Agregasi Kasus Pembinaan).
5. `05-program-head-cohort-view.png`: Dashboard Kepala Program Keahlian (Cohort Jurusan Otomotif, Utilisasi Jam Praktik Bengkel, Tingkat Ketuntasan Kejuruan).
6. `06-superadmin-leadership-switcher.png`: Perspektif Super Admin dengan Dropdown Context Switcher antar jabatan struktural.
7. `07-export-center-and-history.png`: Pusat Laporan & Ekspor (Ekspor Instan CSV Presensi & Nilai, serta Tabel Log Riwayat Ekspor).
8. `08-mobile-leadership-portal.png`: Tampilan responsif mobile (viewport 390×844) Portal Kepemimpinan.

Tangkapan layar tersimpan pada direktori:
`docs/phases/screenshots/phase-19-walkthrough/`

---

# 6. Known Limitations & Out-of-Scope Confirmation

1. **Format Ekspor Dokumen:**
   - Ekspor data mentah tabular saat ini mengimplementasikan format **CSV terstruktur** dan **Print-Ready A4 HTML/CSS (`window.print()`)**. Generasi file biner PDF server-side berbasis headless browser (Puppeteer/Chromium server) ditangguhkan ke module integrasi lanjutan jika dibutuhkan.
2. **Supervisi Akademik Berkas Silabus Guru:**
   - Dashboard kurikulum memantau kuantitas materi dan tugas yang diterbitkan guru per rombel. Penilaian mendalam terhadap mutu RPP/Modul Ajar ditangani di luar platform atau pada inisiatif lanjutan.

---

# 7. Ready for Human Review

Seluruh deliverable dan quality gates untuk **PHASE 19 — LEADERSHIP DASHBOARD, REPORTING & ANALYTICS (M19)** telah rampung diselesaikan dengan kepatuhan penuh terhadap arsitektur modular monolith, prinsip default deny, dan sistem desain Academic Glass UI v1.2.

Kode dan artifak siap untuk ditinjau oleh Human Reviewer.
