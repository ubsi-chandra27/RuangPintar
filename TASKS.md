# TASKS.md
## Ruang Pintar — Active Implementation Tasks

**Versi:** 3.0  
**Current Active Phase:** PHASE 13 — ASSESSMENT, TP & GRADEBOOK (M13)  
**Status:** ACTIVE  

---

# 1. ACTIVE TASKS

```text
PHASE 13 — ASSESSMENT, TP & GRADEBOOK (M13)
```

Tujuan:
> Membangun sistem penilaian berbasis Tujuan Pembelajaran (TP) dan Buku Nilai Terpadu (Gradebook) untuk menyempurnakan Teacher Academic MVP:
> 1. Mendukung alur: Lingkup Materi/BAB ➔ Tujuan Pembelajaran (TP) ➔ Definisi Asesmen (`DefinisiAsesmen`) ➔ Nilai Siswa (`NilaiSiswa`).
> 2. Menjaga invariant kanonikal: `Assessment Definition ≠ Grade ≠ Grade Publication` dan `Missing Grade ≠ Zero Grade`.
> 3. Dilarang membuat kolom permanen `nilai_tp1`, `nilai_tp2` (TP adalah data domain dinamis).
> 4. Auto-populasi seluruh siswa rombel aktif (`PenempatanRombel`) saat proses input nilai.
> 5. Lembar penilaian cepat (Bulk Grade Entry & Keyboard-friendly) dengan validasi skala numerik (0–100), draft vs publish.
> 6. Matriks Buku Nilai (Gradebook Matrix) komprehensif pada Workspace Kelas (`/kelas-saya/[id]`) dengan rekapitulasi rata-rata & capaian KKTP.
> 7. Halaman terpusat Buku Nilai Guru (`/penilaian`) yang menghubungkan seluruh rombel penugasan.
> 8. Verifikasi workflow end-to-end Teacher Academic MVP (Login ➔ Dashboard ➔ Kelas Saya ➔ BAB/TP ➔ KBM ➔ Presensi ➔ Input Nilai TP ➔ Gradebook).

---

# 2. Checklist Phase 13 — Assessment, TP & Gradebook

## Database & Persistence
```text
[x] Prisma model: DefinisiAsesmen (id, sekolah_id, penugasan_mengajar_id, tp_id, lingkup_materi_id, judul, deskripsi, kategori, teknik_penilaian, bobot, skala_maksimal, kkm_kktp, tanggal_pelaksanaan, status, created_at, updated_at)
[x] Prisma model: NilaiSiswa (id, sekolah_id, asesmen_id, siswa_id, penempatan_rombel_id, nilai_angka, nilai_huruf, capaian_kompetensi, catatan, status, diinput_oleh, diubah_terakhir_oleh, alasan_koreksi, created_at, updated_at)
[x] Prisma model: PublikasiNilaiAsesmen (id, sekolah_id, asesmen_id, target_audience, tanggal_publikasi, dipublikasikan_oleh, status, catatan, created_at, updated_at)
[x] Unique constraints: @@unique([asesmen_id, siswa_id]), @@index([asesmen_id, status])
[x] Invariant Guard: Memastikan nilai_angka bersifat nullable (Missing Grade ≠ Zero Grade)
[x] Forward migration: add_assessment_and_gradebook
[x] Domain Types, Validation & Error Guards (src/modules/assessment/domain/)
```

## Infrastructure & Application Services
```text
[x] AssessmentRepository: CRUD Asesmen, CRUD Nilai Siswa, Batch Upsert Nilai, Query Gradebook Matrix, Query Publikasi (src/modules/assessment/infrastructure/)
[x] AssessmentService: Validasi hak mengajar guru (penugasan aktif), kalkulasi rekapitulasi gradebook, workflow draft-to-publish, audit koreksi nilai (src/modules/assessment/application/)
[x] Invariant Guard: Menegakkan pemisahan tegas antara Asesmen, Nilai, dan Publikasi Nilai
```

## Server Actions & Authorization
```text
[x] assessment-actions.ts: Server actions aman dengan requireAuth(), requirePermission() dan audit logging
[x] Permission checks: assessment.grades.view, assessment.grades.manage, assessment.grades.publish, assessment.grades.finalize
[x] Teacher scope check: Hanya guru pengampu penugasan (atau Super Admin) yang berhak menginput/mengubah nilai
```

## Presentation Layer (Academic Glass UI v1.2)
```text
[x] Tab Penilaian di Workspace Kelas (/kelas-saya/[id]): Daftar Asesmen & Matriks Buku Nilai (Gradebook)
[x] Modal Buat/Edit Asesmen: Hubungkan dengan TP/BAB, tentukan kategori (Formatif/Sumatif), bobot, dan KKTP
[x] Modal / Lembar Input Nilai Siswa: Form input tabel cepat dengan auto-populasi siswa rombel aktif, quick fill KKTP, validasi 0-100
[x] Modal Publikasi Nilai: Konfirmasi publikasi hasil asesmen ke siswa/wali dengan status badge jelas
[x] Halaman Terpusat Buku Nilai Guru (/penilaian): Mengaktifkan route menu utama guru dengan filter rombel dan mapel
```

## Quality Gates & Verification
```text
[x] Format check: Prettier 100% clean (npm run format:check)
[x] Lint check: ESLint 0 errors, 0 warnings (npm run lint)
[x] Typecheck: TypeScript tsc --noEmit 0 errors (npm run typecheck)
[x] Tests: Unit & Integration tests passing (src/test/assessment/)
[x] Build: Next.js production build PASS
[x] Automated Walkthrough: Praktik workflow nyata Teacher Academic MVP end-to-end
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

[ ] Milestone D — Teacher Academic MVP (Phase 11–13) [IN PROGRESS]
    ├── [x] Phase 11 — Teacher Workspace & Learning Administration [APPROVED BY HUMAN (3 September 2026)]
    ├── [x] Phase 12 — Class Session Attendance [APPROVED BY HUMAN (4 September 2026)]
    └── [x] Phase 13 — Assessment, TP & Gradebook [READY FOR HUMAN REVIEW]
```

---

# 4. Milestone D Historical Quality Gates (Phase 13)

```text
[x] Database: Migration forward assessment & gradebook verified (20260904101500_add_assessment_and_gradebook)
[x] Domain Invariants: Assessment != Grade != Grade Publication, Missing Grade != Zero Grade
[x] Format check: Prettier 100% clean (npm run format:check)
[x] Lint check: 0 errors, 0 warnings (npm run lint)
[x] Typecheck: TypeScript tsc --noEmit 0 errors (npm run typecheck)
[x] Tests: 65 test files, 340 tests passing (100% PASS)
[x] Build: Next.js production compilation 100% PASS (npm run build)
[x] End-to-End Walkthrough: Playwright automated test & visual screenshots PASS (qa-phase13-full-walkthrough.mjs)
[x] Status: READY FOR HUMAN REVIEW
```
