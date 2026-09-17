# TASKS.md
## Ruang Pintar — Active Implementation Tasks

**Versi:** 10.0  
**Current Active Phase:** PHASE 20 — INTEGRATION FOUNDATION (M20)  
**Status:** IN PROGRESS  

---

# 1. ACTIVE TASKS

```text
PHASE 20 — INTEGRATION FOUNDATION (M20) [IN PROGRESS]
```

Tujuan:
> Membangun sistem dashboard kepemimpinan sekolah (*Leadership Dashboard*), pelaporan operasional terpadu (*Operational Reporting*), analitik akademik lintas rombel (*Academic Analytics*), dan rekapitulasi data pimpinan (*Executive Export*) sesuai Academic Glass UI v1.2:
> 1. Invariant Domain Inti:
>    - `Report ≠ Source of Truth`: Data laporan dan analitik merupakan proyeksi baca (*read models/aggregations*) dari M01 (Organisasi), M07 (Akademik), M08 (Siswa), M09 (Guru), M10 (Jadwal & KBM), M11 (Tugas & Materi), M12 (Presensi), M13 (Asesmen & Nilai), dan M18 (Monitoring). Data sumber transaksi tetap menjadi acuan utama (*source of truth*).
>    - `Leadership Monitoring ≠ Full Administrative Write Access`: Pimpinan sekolah (Kepala Sekolah, Wakasek, Kaprog) memiliki visibilitas analitik dan supervisi evaluatif, bukan hak untuk memanipulasi atau membypass penilaian (*grade override*) maupun presensi guru mata pelajaran.
>    - `Position-Scoped Visibility Enforcement`: Akses dashboard kepemimpinan dikunci secara ketat server-side berdasarkan `PenugasanJabatan` aktif:
>      - `HEADMASTER`: Visibilitas manajemen strategis tingkat sekolah (*School-Wide Management View*).
>      - `VICE_PRINCIPAL_CURRICULUM`: Visibilitas manajemen akademik sekolah (*School-Wide Academic Management*).
>      - `VICE_PRINCIPAL_STUDENT_AFFAIRS`: Visibilitas manajemen kesiswaan & kehadiran sekolah (*School-Wide Student Affairs*).
>      - `PROGRAM_HEAD`: Visibilitas program keahlian perjurusan (*Program-Scoped View*).
>      - `SUPER_ADMIN`: Visibilitas supervisi komprehensif dengan kemampuan memilih konteks kepemimpinan.
>      - Role non-pimpinan tanpa penugasan struktural ditolak (*default deny*).
> 2. Database & Data Architecture:
>    - Model `RiwayatEksporLaporan` (id, sekolah_id, tipe_laporan [PRESENSI, NILAI, AKADEMIK, EKSEKUTIF], judul, format [CSV, PRINT_A4], parameter_filter_json, dibuat_oleh_id, total_baris, berkas_url, created_at)
>    - Prisma migration forward aman untuk tabel rekapitulasi / riwayat ekspor laporan
> 3. Application & Service Layer:
>    - `ReportingRepository` & `LeadershipAnalyticsService`
>    - Engine agregasi metrik pimpinan (kehadiran sekolah harian/semesteran, distribusi capaian KKTP lintas rombel, pemenuhan administrasi pembelajaran guru, rasio tugas & asesmen, tren kasus kesiswaan)
>    - Generator ekspor laporan (CSV formatter & Print-Ready data transformer)
>    - Server Actions:
>      - `getLeadershipDashboardOverviewAction` (overview metrik berdasarkan jabatan aktif pengguna)
>      - `getAcademicAnalyticsAction` (analitik capaian belajar per mapel/tingkat/rombel)
>      - `getAttendanceAnalyticsAction` (analitik tren kehadiran guru & siswa)
>      - `generateReportExportAction` (pembuatan berkas ekspor CSV/print log)
> 4. Presentation Layer (Academic Glass UI v1.2):
>    - Direktori Portal Kepemimpinan & Laporan (`/pimpinan` atau `/laporan`):
>      - Dashboard Kepala Sekolah (`HeadmasterDashboardView`): KPI strategis (rasio guru-siswa, rata-rata kehadiran, distribusi ketuntasan KKTP, daftar anomali perhatian, status KBM aktif).
>      - Dashboard Wakasek Kurikulum (`CurriculumDashboardView`): Monitoring silabus/TP, kepatuhan administrasi guru, status penilaian tugas/asesmen, beban mengajar per guru.
>      - Dashboard Wakasek Kesiswaan (`StudentAffairsDashboardView`): Matriks presensi siswa per rombel/tingkat, daftar siswa alpha tinggi (*chronic absenteeism*), statistik catatan pembinaan & tindak lanjut.
>      - Dashboard Kepala Program (`ProgramHeadDashboardView`): Cohort per program keahlian, performa mapel kejuruan, kehadiran siswa jurusan.
>      - Tab Pusat Rekap & Ekspor Laporan (`ReportingExportTab`): Filter periode, tingkat kelas, rombel, unduh CSV terstruktur dan lembar cetak eksekutif A4 (*window.print()* siap tanda tangan).
>    - Switcher Konteks Jabatan bagi Super Admin atau personil dengan multi-penugasan.
>    - Integrasi tautan navigasi kanonikal `/pimpinan` di `CANONICAL_NAVIGATION_CONFIG` dan `AcademicShell`.
> 5. Quality Gates & Verification:
>    - Unit/integration tests untuk M19 & Leadership authorization
>    - Quality gates (typecheck, lint, format, vitest, build)
>    - Playwright automated visual walkthrough

---

# 2. Checklist Phase 19 — Leadership Dashboard, Reporting & Analytics (M19)

## Domain & Invariants
```text
[x] Read Model Integrity: Laporan & analitik merupakan derived projection, tanpa memanipulasi transaksi sumber (M11, M12, M13)
[x] Position-Scoped Access Control: Otorisasi server-side terkunci pada PenugasanJabatan aktif (HEADMASTER, WAKASEK_KURIKULUM, WAKASEK_KESISWAAN, PROGRAM_HEAD, SUPER_ADMIN)
[x] Read-Only Evaluation Guard: Pimpinan memantau performa tanpa kemampuan manipulasi nilai atau absensi
[x] Export & Audit Trail: Pencatatan riwayat pembuatan dan pengunduhan laporan formal
```

## Data Layer & Application Services
```text
[x] Prisma Migration: Model riwayat_ekspor_laporan
[x] Reporting Domain & Validation: types, errors, zod schemas
[x] ReportingRepository & LeadershipAnalyticsService (agregasi KPI strategis, analitik akademik & presensi)
[x] Server Actions: leadership-actions.ts & report-export-actions.ts
[x] Seed Data: Pemastian personil pimpinan (Kepala Sekolah, Wakasek, Kaprog) terhubung dengan akun demo
```

## Presentation Layer (Academic Glass UI v1.2)
```text
[x] Leadership Portal (/pimpinan): Multi-role leadership view dengan sub-tab & KPI cards
[x] Headmaster View: Strategi sekolah, KPI kehadiran global, distribusi KKTP, perhatian pimpinan
[x] Curriculum View: Capaian TP, ketuntasan penilaian, beban mengajar guru
[x] Student Affairs View: Matriks kehadiran, tren ketidakhadiran, ringkasan kasus pembinaan
[x] Program Head View: Fokus jurusan/program keahlian, performa kompetensi kejuruan
[x] Report Export Center: Filter dinamis, ekspor CSV, modal print preview A4 formal
[x] Navigation Config: Registrasi menu /pimpinan dengan proteksi akses jabatan
```

## Quality Gates & Verification
```text
[x] Typecheck: TypeScript tsc --noEmit 0 errors
[x] Lint check: ESLint 0 errors
[x] Format check: Prettier 100% clean
[x] Tests: Seluruh test unit & integrasi passing (81 test files, 458 tests passing, 100% PASS)
[x] Build: Next.js production build passing (22 routes generated)
[x] Playwright Visual Walkthrough: Bukti tangkapan layar alur kerja Phase 19 (8 visual screenshots PASS)
```

---

# 3. Previous Milestones & Completed Phases

```text
[x] Milestone A — Bootstrap & Platform Foundation (Phase 00–02) [APPROVED]
[x] Milestone B — School Organization & Identity (Phase 03–06) [APPROVED]
[x] Milestone C — Academic Foundation Ready (Phase 07–10) [APPROVED BY HUMAN]
    ├── [x] Phase 07 — Academic Structure (APPROVED)
    ├── [x] Phase 08 — Student Academic Lifecycle (APPROVED & CHECKPOINTED)
    ├── [x] Phase 09 — Teacher & Teaching Assignment (APPROVED BY HUMAN)
    └── [x] Phase 10 — Academic Calendar, Schedule & Class Session (APPROVED BY HUMAN)

[x] Milestone D — Teacher Academic MVP (Phase 11–13) [APPROVED BY HUMAN (4 September 2026)]
    ├── [x] Phase 11 — Teacher Workspace & Learning Administration [APPROVED BY HUMAN (3 September 2026)]
    ├── [x] Phase 12 — Class Session Attendance [APPROVED BY HUMAN (4 September 2026)]
    └── [x] Phase 13 — Assessment, TP & Gradebook [APPROVED BY HUMAN (4 September 2026)]

[x] Milestone E — Digital Assessment Ready (Phase 14–15) [APPROVED]
    ├── [x] Phase 14 — CBT: Computer Based Test (M14) [APPROVED BY HUMAN (5 September 2026)]
    └── [x] Phase 15 — Assessment Compilation & Student Experience (M15) [APPROVED BY HUMAN (7 September 2026)]

[x] Milestone F — Student & Guardian Experience Ready (Phase 15–17) [APPROVED BY HUMAN (11 September 2026)]
    ├── [x] Phase 15 — Student Experience (M15) [APPROVED]
    ├── [x] Phase 16 — Guardian Experience (M15) [APPROVED BY HUMAN (10 September 2026)]
    └── [x] Phase 17 — Communication & Notification (M16/M17) [APPROVED BY HUMAN (11 September 2026)]

[x] Milestone G — Student Monitoring, Leadership & School Operations (Phase 18–19) [APPROVED BY HUMAN (17 September 2026)]
    ├── [x] Phase 18 — Student Monitoring & Homeroom (M18) [APPROVED BY HUMAN (11 September 2026)]
    └── [x] Phase 19 — Leadership Dashboard, Reporting & Analytics (M19) [APPROVED BY HUMAN (17 September 2026)]

[ ] Milestone H — Extension Ready (Phase 20–21) [ACTIVE]
    ├── [ ] Phase 20 — Integration Foundation (M20) [IN PROGRESS]
    └── [ ] Phase 21 — AI Assistance (M21) [DEFERRED]
```

---

# 4. Milestone G Historical Quality Gates (Phase 18 & 19)

```text
[x] Phase 18 Quality Gates:
    - Domain Invariants: M18 Derived Indicator Model, Homeroom Scoping (Default Deny), Read-Only Academic Guard, Persistent Guidance Notes & Follow-Up Plans
    - Format check: Prettier 100% clean (npm run format:check)
    - Lint check: 0 errors (npm run lint)
    - Typecheck: TypeScript tsc --noEmit 0 errors (npm run typecheck)
    - Tests: 79 test files, 442 tests passing (100% PASS)
    - Build: Next.js production compilation 100% PASS (31 routes generated)
    - End-to-End Walkthrough: Playwright automated test & 10 visual screenshots PASS (qa-phase18-visual-walkthrough.mjs)

[x] Phase 19 Quality Gates:
    - Domain Invariants: Derived Read Models, Position-Scoped Visibility (Default Deny), Read-Only Evaluation Guard, Export History Audit Log
    - Format check: Prettier 100% clean (npm run format:check)
    - Lint check: 0 errors (npm run lint)
    - Typecheck: TypeScript tsc --noEmit 0 errors (npm run typecheck)
    - Tests: 82 test files, 467 tests passing (100% PASS)
    - Build: Next.js production compilation 100% PASS (22 routes generated)
    - Enhancement: Unified Academic Ledger Table (Buku Nilai & Presensi Terpadu Kurikulum Merdeka) fully implemented & integrated.
```
