# TASKS.md
## Ruang Pintar — Active Implementation Tasks

**Versi:** 5.0  
**Current Active Phase:** PHASE 15 — STUDENT EXPERIENCE (M15)  
**Status:** READY FOR HUMAN REVIEW  

---

# 1. ACTIVE TASKS

```text
PHASE 15 — STUDENT EXPERIENCE (M15) [READY FOR HUMAN REVIEW]
```

Tujuan:
> Membangun portal dan subsistem Student Experience (M15) yang terintegrasi secara data-driven, aman dengan self-scope enforcement, dan responsif sesuai Academic Glass UI v1.2:
> 1. Dashboard Siswa live (`/dashboard`): Profil rombel aktif, kartu statistik kehadiran & nilai, timeline jadwal KBM hari ini, deadline tugas mendatang, ujian CBT aktif, dan nilai asesmen terpublikasi resmi.
> 2. Materi & Tugas Siswa (`/tugas-siswa`): Tab terpadu untuk Tugas Kelas (dengan deteksi keterlambatan & modal submit jawaban teks/berkas), Materi Pembelajaran (modal pembaca materi teks, unduhan berkas, tautan luar), dan Presensi Kehadiran Kelas.
> 3. Buku Nilai & e-Rapor Kurikulum Merdeka (`/rapor-siswa`): Kompilasi capaian kompetensi semester, predikat, KKTP, catatan wali kelas, rincian seluruh asesmen terpublikasi resmi (zero draft leakage), serta Lembar Cetak Rapor Resmi A4 (print-ready / save PDF).
> 4. Penegakan Domain Invariants wajib:
>    - `Student Self-Scope (STUDENT_SELF)`: Siswa hanya dapat mengakses dan mengumpulkan data miliknya sendiri.
>    - `FR-SXP-004 (Strict Non-Leakage of Draft Grades)`: Hanya nilai berstatus `PUBLISHED` dengan target `SISWA` atau `SEMUA` yang ditampilkan ke siswa.
>    - `Missing Grade != Zero Grade`: Nilai yang belum ada ditampilkan `-`, bukan angka `0`.
>    - `Toleransi Batas Waktu`: Keterlambatan divalidasi berdasarkan aturan `izinkan_terlambat` guru.

---

# 2. Checklist Phase 15 — Student Experience (M15)

## Domain & Invariants
```text
[x] Student Self-Scope (STUDENT_SELF) strictly enforced pada data repository & service layer
[x] FR-SXP-004: Zero draft grade leakage (hanya status PUBLISHED dengan target publikasi SISWA/SEMUA)
[x] Missing Grade != Zero Grade: Nilai asesmen belum dinilai bernilai null dan tampil sebagai "-"
[x] Rule keterlambatan pengumpulan tugas tervalidasi berdasarkan izinkan_terlambat
[x] Audit Logging terintegrasi untuk aksi SUBMIT_ASSIGNMENT
```

## Data Layer & Application Services
```text
[x] student-experience-types.ts: Model domain profil, jadwal, tugas, materi, presensi, nilai, e-rapor
[x] student-experience-errors.ts: Domain errors khusus pengalaman siswa
[x] student-experience-validation.ts: Skema validasi Zod SubmitAssignmentSchema
[x] student-experience-repository.ts: Repository query teroptimasi prisma untuk seluruh fitur siswa
[x] student-experience-service.ts: Application service terpadu orkestrasi bisnis & audit logger
[x] student-experience-actions.ts: Server actions submit tugas mandiri siswa & file upload storage
[x] seed-student-experience.ts: Seed data realistis X RPL (materi, tugas, CBT, nilai, presensi)
```

## Presentation Layer (Academic Glass UI v1.2)
```text
[x] StudentDashboard (/dashboard): Server component live data-driven, profil siswa, jadwal, tugas, CBT, nilai
[x] StudentLearningView (/tugas-siswa): Tab terpadu Tugas Kelas, Materi Pelajaran, dan Presensi Kehadiran
[x] SubmitAssignmentModal: Form uraian teks, upload berkas dropzone, toleransi keterlambatan
[x] MaterialDetailModal: Pembaca materi teks, unduh lampiran berkas guru, tautan eksternal
[x] StudentReportCardView (/rapor-siswa): Transkrip Kurikulum Merdeka, KKTP, predikat, catatan wali kelas, rincian asesmen
[x] ReportCardPrintModal: Pratinjau cetak resmi A4 print-ready (window.print() & save PDF)
[x] Canonical Navigation: /tugas-siswa dan /rapor-siswa diaktifkan di navigation-config.ts
```

## Quality Gates & Verification
```text
[x] Typecheck: TypeScript tsc --noEmit 0 errors (npm run typecheck)
[x] Lint check: ESLint 0 errors, 4 warnings non-blocking (npm run lint)
[x] Format check: Prettier 100% clean (npm run format:check)
[x] Tests: 71 test files, 385 tests passing (100% PASS)
[x] Regression: Seluruh test Phase 00–14 tetap PASS (100%)
[x] Build: Next.js production build PASS (16 static & dynamic pages)
[x] Playwright Visual Walkthrough: 10 screenshot lengkap tersimpan di docs/phases/screenshots/phase-15-walkthrough/
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

[ ] Milestone E — Digital Assessment Ready (Phase 14–15) [ACTIVE]
    ├── [x] Phase 14 — CBT: Computer Based Test (M14) [APPROVED BY HUMAN (5 September 2026)]
    └── [x] Phase 15 — Assessment Compilation & Student Experience (M15) [READY FOR HUMAN REVIEW]
```

---

# 4. Milestone E Historical Quality Gates (Phase 15)

```text
[x] Domain Invariants: Student Self-Scope, Zero Draft Grade Leakage, Missing Grade != Zero Grade
[x] Format check: Prettier 100% clean (npm run format:check)
[x] Lint check: 0 errors (npm run lint)
[x] Typecheck: TypeScript tsc --noEmit 0 errors (npm run typecheck)
[x] Tests: 71 test files, 385 tests passing (100% PASS)
[x] Build: Next.js production compilation 100% PASS (npm run build)
[x] End-to-End Walkthrough: Playwright automated test & 10 visual screenshots PASS (qa-phase15-visual-walkthrough.mjs)
```
