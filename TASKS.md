# TASKS.md
## Ruang Pintar — Active Implementation Tasks

**Versi:** 8.0  
**Current Active Phase:** PHASE 18 — STUDENT MONITORING & HOMEROOM (M18)  
**Status:** IN PROGRESS  

---

# 1. ACTIVE TASKS

```text
PHASE 18 — STUDENT MONITORING & HOMEROOM (M18) [IN PROGRESS]
```

Tujuan:
> Membangun sistem monitoring komprehensif bagi wali kelas terhadap seluruh siswa dalam rombel perwaliannya serta pusat perhatian dan tindak lanjut siswa (*Attention Center, Monitoring Notes & Follow-Up / M18*) sesuai Academic Glass UI v1.2:
> 1. Invariant Domain Inti:
>    - `M18 Student Monitoring ≠ Source of Truth`: Data transaksi utama (kehadiran, tugas, penilaian) tetap berada pada M11, M12, M13. Indikator siswa di M18 merupakan derived/read model yang dapat dihitung ulang kapan saja.
>    - `Monitoring Note & Follow-Up = Persistent M18 Entities`: Catatan pembinaan dan riwayat tindak lanjut wali kelas/BK disimpan persisten.
>    - `Wali Kelas ≠ Pemilik Nilai / Presensi Guru Lain`: Wali kelas memantau (*read/monitor*), bukan mengubah (*overwrite/bypass*) nilai atau presensi sesi milik guru mata pelajaran lain.
>    - `Homeroom Scoping Enforcement`: Wali kelas hanya dapat memantau rombel yang ditugaskan kepadanya secara aktif melalui `PenugasanWaliKelas`. Super Admin memiliki supervisi penuh.
> 2. Database & Data Architecture:
>    - Model `CatatanMonitoring` (id, sekolah_id, rombel_id, siswa_id, penulis_id, judul, isi, kategori [AKADEMIK, KEHADIRAN, PERILAKU, LAINNYA], tingkat_urgensi [RENDAH, SEDANG, TINGGI, KRITIS], status)
>    - Model `TindakLanjutMonitoring` (id, catatan_id, penanggung_jawab_id, tindakan, target_tanggal, status [DIRENCANAKAN, PROSES, SELESAI, DIBATALKAN], hasil)
>    - Prisma migration forward aman
> 3. Application & Service Layer:
>    - `MonitoringRepository` & `MonitoringService`
>    - Agregasi indikator holistik per siswa: persentase kehadiran (hadir, izin, sakit, alpha), tingkat ketuntasan tugas (dikumpulkan vs total tugas), capaian asesmen (rerata nilai, jumlah asesmen di bawah KKTP), status perhatian (*Normal*, *Perlu Perhatian*, *Kritis*)
>    - Server Actions: `getHomeroomMonitoringOverviewAction`, `getStudentMonitoringDetailAction`, `createMonitoringNoteAction`, `createFollowUpAction`, `updateFollowUpStatusAction`
> 4. Presentation Layer (Academic Glass UI v1.2):
>    - Direktori / Portal Wali Kelas (`/wali-kelas`):
>      - Tab Ringkasan Rombel & KPI (total siswa, rerata presensi rombel, siswa perlu perhatian, tugas tertunda)
>      - Tab Roster Siswa & Indikator Holistik: Tabel siswa dengan badge indikator kehadiran, tugas, nilai, dan tombol "Detail & Catatan"
>      - Tab Pusat Perhatian (*Attention Center*): Sorotan otomatis siswa bermasalah absensi (alpha/terlambat tinggi), tugas belum tuntas, atau nilai anjlok
>      - Tab Catatan Pembinaan & Tindak Lanjut: Feed catatan pembinaan wali kelas, status koordinasi BK/Orang Tua, riwayat follow-up
>    - Modal Tambah Catatan Pembinaan (`CreateMonitoringNoteModal`) & Modal Tambah Tindak Lanjut (`CreateFollowUpModal`)
>    - Modal Rincian Siswa Holistik (`StudentMonitoringDetailModal`)
>    - Tautan cepat di Dashboard Guru (`/dashboard`) untuk guru yang bertugas sebagai Wali Kelas
>    - Pengaktifan rute `/wali-kelas` di `CANONICAL_NAVIGATION_CONFIG` untuk guru wali kelas & admin
> 5. Quality Gates & Verification:
>    - Unit/integration tests untuk M18
>    - Quality gates (typecheck, lint, format, vitest, build)
>    - Playwright automated visual walkthrough

---

# 2. Checklist Phase 18 — Student Monitoring & Homeroom (M18)

## Domain & Invariants
```text
[ ] Derived Indicator Model: Indikator dihitung dinamis dari M07, M11, M12, M13 tanpa menduplikasi source of truth
[ ] Homeroom Scoping: Akses data rombel terkunci pada penugasan wali kelas aktif guru (default deny)
[ ] Read-Only Academic Guard: Wali kelas tidak dapat memanipulasi presensi sesi atau nilai guru lain
[ ] Persistent Notes & Follow-Up: Catatan monitoring dan tindak lanjut tersimpan aman dengan audit log
```

## Data Layer & Application Services
```text
[ ] Prisma Migration: Model catatan_monitoring & tindak_lanjut_monitoring
[ ] Monitoring Domain & Validation: types, errors, zod schemas
[ ] MonitoringRepository & MonitoringService (agregasi KPI, indikator holistik, CRUD catatan)
[ ] Server Actions: monitoring-actions.ts
[ ] Seed Data: Sampel catatan pembinaan & tindak lanjut untuk pengujian
```

## Presentation Layer (Academic Glass UI v1.2)
```text
[ ] Homeroom Portal (/wali-kelas): Ringkasan KPI rombel, tab roster, tab attention center, tab catatan
[ ] Attention Center Widget / View: Filter siswa berisiko (absensi rendah, tugas menumpuk, nilai < KKTP)
[ ] Create/Edit Monitoring Note Modal & Follow-Up Modal
[ ] Student Holistic Detail Modal: Profil siswa, breakdown presensi, tugas, nilai, dan timeline pembinaan
[ ] Teacher Dashboard Shortcut: Card status wali kelas dengan tautan langsung ke portal /wali-kelas
[ ] Navigation Config: Registrasi menu /wali-kelas dengan icon & role/permission guard
```

## Quality Gates & Verification
```text
[ ] Typecheck: TypeScript tsc --noEmit 0 errors
[ ] Lint check: ESLint 0 errors
[ ] Format check: Prettier 100% clean
[ ] Tests: Seluruh test unit & integrasi passing (100% PASS)
[ ] Build: Next.js production build passing
[ ] Playwright Visual Walkthrough: Bukti tangkapan layar alur kerja Phase 18
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

[ ] Milestone G — Student Monitoring, Leadership & School Operations (Phase 18–19) [ACTIVE]
    ├── [ ] Phase 18 — Student Monitoring & Homeroom (M18) [ACTIVE]
    └── [ ] Phase 19 — Leadership Dashboard, Reporting & Analytics (M19)
```

---

# 4. Milestone F Historical Quality Gates (Phase 17)

```text
[x] Domain Invariants: Announcement != Notification != Source Transaction, Server-Side Audience Filter, Fail-safe Outbox
[x] Format check: Prettier 100% clean (npm run format:check)
[x] Lint check: 0 errors (npm run lint)
[x] Typecheck: TypeScript tsc --noEmit 0 errors (npm run typecheck)
[x] Tests: 77 test files, 421 tests passing (100% PASS)
[x] Build: Next.js production compilation 100% PASS (19 routes generated)
[x] End-to-End Walkthrough: Playwright automated test & 9 visual screenshots PASS (qa-phase17-visual-walkthrough.mjs)
```
