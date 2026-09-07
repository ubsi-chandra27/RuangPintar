# TASKS.md
## Ruang Pintar — Active Implementation Tasks

**Versi:** 6.0  
**Current Active Phase:** PHASE 16 — GUARDIAN EXPERIENCE (M15)  
**Status:** READY FOR HUMAN REVIEW  

---

# 1. ACTIVE TASKS

```text
PHASE 16 — GUARDIAN EXPERIENCE (M15) [READY FOR HUMAN REVIEW]
```

Tujuan:
> Membangun portal dan subsistem Guardian Experience (M15 / Milestone F) yang terintegrasi penuh secara data-driven, aman dengan relationship-scope enforcement (`GUARDIAN_RELATIONSHIP`), dan responsif sesuai Academic Glass UI v1.2:
> 1. Identitas Wali & Relasi Sah Terverifikasi (`WaliMurid` & `HubunganWaliSiswa`): Akses hanya melalui relasi yang sah dan terverifikasi pihak sekolah.
> 2. Multi-Child Context Switcher: Satu akun wali dapat memiliki lebih dari satu anak dan dapat beralih konteks anak aktif secara mulus di seluruh portal (`ChildSwitcherDropdown`).
> 3. Dashboard Wali Murid live (`/dashboard`): Profil anak aktif, kontak wali kelas, 4 KPI kehadiran/tugas/ujian, agenda tugas kelas, jadwal CBT, nilai asesmen terpublikasi resmi, dan riwayat permohonan izin.
> 4. Presensi Anak (`/presensi-anak`): Rekapitulasi kehadiran semester (hadir, sakit, izin, alpa, persentase) dan log absensi sesi KBM terperinci.
> 5. Perkembangan Nilai & e-Rapor Anak (`/nilai-anak`): Transkrip asesmen terpublikasi resmi (zero draft leakage), buku e-Rapor Kurikulum Merdeka, KKTP, predikat, catatan wali kelas, serta Modal Pratinjau Cetak Lembar Rapor Resmi A4 (`window.print()`).
> 6. Layanan Pengajuan Izin / Sakit (`PengajuanIzinModal`): Formulir permohonan surat izin sakit atau dispensasi kegiatan oleh orang tua disertai upload berkas surat dokter.
> 7. Penegakan Domain Invariants wajib:
>    - `Guardian ≠ Student proxy`: Wali murid dilarang bertindak sebagai siswa (tidak mengumpulkan tugas atau mengambil tes CBT atas nama anak).
>    - `GUARDIAN_RELATIONSHIP`: Evaluasi izin berbasis relasi terverifikasi, bukan tebakan id siswa.
>    - `FR-SXP-004 (Strict Non-Leakage of Draft Grades)`: Hanya nilai asesmen berstatus `PUBLISHED` dengan target `WALI` atau `SEMUA` yang tampil.
>    - `Missing Grade != Zero Grade`: Nilai yang belum ada tampil sebagai `-`, bukan `0`.

---

# 2. Checklist Phase 16 — Guardian Experience (M15)

## Domain & Invariants
```text
[x] Relationship-Scoped Authorization (GUARDIAN_RELATIONSHIP) strictly enforced
[x] Invariant Guardian ≠ Student proxy: Tidak ada form pengumpulan tugas atau pengerjaan CBT di portal wali
[x] Multi-Child & Multi-Guardian: Relasi n-ke-n terverifikasi dan cookie-based context switcher
[x] FR-SXP-004: Zero draft grade leakage (hanya status PUBLISHED dengan target publikasi WALI/SEMUA)
[x] Missing Grade != Zero Grade: Nilai asesmen belum dinilai bernilai null dan tampil sebagai "-"
[x] Audit Logging terintegrasi untuk aksi SUBMIT_PENGAJUAN_IZIN_WALI (recordAuditEvent)
```

## Data Layer & Application Services
```text
[x] Prisma Migration: 20260907130000_add_guardian_and_family (wali_murid, hubungan_wali_siswa, pengajuan_wali)
[x] guardian-types.ts: Model domain profil wali, konteks anak aktif, KPI presensi, nilai, e-rapor, pengajuan izin
[x] guardian-errors.ts: Domain errors (GuardianNotFoundError, ChildNotLinkedError, UnverifiedRelationshipError)
[x] guardian-validation.ts: Skema validasi Zod SwitchChildSchema & PengajuanWaliSchema
[x] guardian-repository.ts: Repository query teroptimasi prisma untuk seluruh fitur wali murid
[x] guardian-service.ts: Application service terpadu orkestrasi bisnis & audit logger
[x] guardian-actions.ts: Server actions switchActiveChildAction & submitPengajuanWaliAction
[x] seed-guardian-experience.ts: Seed data realistis akun wali santoso & nurhayati (multi-child)
```

## Presentation Layer (Academic Glass UI v1.2)
```text
[x] GuardianDashboard (/dashboard): Async Server Component live data-driven, child profile, KBM stats, cbt, grades
[x] ChildSwitcherDropdown: Dropdown interaktif multi-anak terintegrasi di seluruh halaman pemantauan
[x] PengajuanIzinModal: Form pengajuan izin sakit / dispensasi dengan upload berkas lampiran
[x] GuardianAttendanceView (/presensi-anak): 6 KPI presensi, filter status, tabel log sesi KBM terperinci
[x] GuardianGradesView (/nilai-anak): Tab nilai asesmen terpublikasi resmi & Tab buku e-Rapor Kurikulum Merdeka
[x] GuardianReportPrintModal: Pratinjau cetak lembar rapor resmi A4 print-ready (window.print())
[x] Canonical Navigation: /presensi-anak dan /nilai-anak diaktifkan resmi (isPhaseDeferred: false)
```

## Quality Gates & Verification
```text
[x] Typecheck: TypeScript tsc --noEmit 0 errors (npm run typecheck)
[x] Lint check: ESLint 0 errors, 4 warnings non-blocking (npm run lint)
[x] Format check: Prettier 100% clean (npm run format:check)
[x] Tests: 73 test files, 400 tests passing (100% PASS)
[x] Regression: Seluruh test Phase 00–15 tetap PASS (100%)
[x] Build: Next.js production build PASS (18 static & dynamic pages)
[x] Playwright Visual Walkthrough: 9 screenshot lengkap tersimpan di docs/phases/screenshots/phase-16-walkthrough/
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

[x] Milestone E — Digital Assessment Ready (Phase 14–15) [APPROVED / READY]
    ├── [x] Phase 14 — CBT: Computer Based Test (M14) [APPROVED BY HUMAN (5 September 2026)]
    └── [x] Phase 15 — Assessment Compilation & Student Experience (M15) [APPROVED / READY]

[ ] Milestone F — Student & Guardian Experience Ready (Phase 15–17) [ACTIVE]
    ├── [x] Phase 15 — Student Experience (M15) [READY]
    ├── [x] Phase 16 — Guardian Experience (M15) [READY FOR HUMAN REVIEW]
    └── [ ] Phase 17 — Communication & Notification (M16/M17)
```

---

# 4. Milestone F Historical Quality Gates (Phase 16)

```text
[x] Domain Invariants: Guardian Relationship Scope, Multi-Child Support, Guardian != Student Proxy, FR-SXP-004, Missing Grade != 0
[x] Format check: Prettier 100% clean (npm run format:check)
[x] Lint check: 0 errors (npm run lint)
[x] Typecheck: TypeScript tsc --noEmit 0 errors (npm run typecheck)
[x] Tests: 73 test files, 400 tests passing (100% PASS)
[x] Build: Next.js production compilation 100% PASS (npm run build)
[x] End-to-End Walkthrough: Playwright automated test & 9 visual screenshots PASS (qa-phase16-visual-walkthrough.mjs)
```
