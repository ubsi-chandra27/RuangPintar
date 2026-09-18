# TASKS.md
## Ruang Pintar — Active Implementation Tasks

**Versi:** 16.0  
**Current Active Phase:** ALL PHASES (PHASE 01 - 22) COMPLETED & APPROVED  
**Status:** APPROVED BY HUMAN (18 September 2026)  

---

# 1. ACTIVE TASKS

```text
PHASE 22 — SAAS GROWTH ENGINE, LANDING PAGE & LIVE DEVICE TRACKING (M22) [APPROVED BY HUMAN (18 September 2026)]
```

Tujuan:
> Mentransformasikan antarmuka publik dan kapabilitas SaaS Ruang Pintar menjadi mesin akuisisi & retensi pengguna yang siap rilis:
> 1. Landing Page Publik Berbasis Academic Glass UI (`/`):
>    - Hero Section: Solusi "Otomasi Absensi & Nilai Sekolah dalam 5 Detik" dengan Photo-to-Class Vision AI.
>    - Testimoni Nyata Guru & Kepala Sekolah (Ibu Wardah Ulfah Fauzziyah, S.Pd., Pak Eri Chandra Apriyadi, S.Kom., dan Mitra Kepala Sekolah Drs. H. Suryadi, M.M.).
>    - Transparansi Biaya & Lisensi: Guru Starter (Coba Gratis 30 Hari, Rp 0), Paket Guru Pro (Rp 15.000 / bulan), dan Lisensi Sekolah Resmi (Rp 1,5 Juta - 3 Juta, Dana BOS Ready).
>    - FAQ seputar keamanan data dan juknis pengadaan resmi via Dana BOS.
> 2. Live Presence & Device Tracking:
>    - Parser User-Agent (`device-detector.ts`) untuk deteksi brand HP (Samsung Galaxy, iPhone, Xiaomi, Oppo), Komputer PC, OS, dan browser.
>    - Indikator Status Online (🟢 Online Sekarang / 🟡 Aktif X Menit Lalu / Offline) di daftar pendidik (`/guru-pengajaran`).
>    - Widget Distribusi Perangkat Pengguna di Dashboard Super Admin (Ponsel HP % vs Komputer % & Live Audit).
> 3. Dokumen Usulan Pengadaan Lisensi Sekolah (Dana BOS B2B Proposal Modal):
>    - Modal & dokumen cetak/simpan PDF dengan KOP resmi institusi (RUANG PINTAR EDUTECH INDONESIA), justifikasi hukum pemanfaatan BOS, rincian biaya, dan kelengkapan SPJ (Invoice, Kuitansi, BAST).
>    - Integrasi langsung pada tombol "Cetak Usulan ke Kepsek" di Trial Banner dashboard guru.
> 4. Quality Gates & Verification:
>    - TypeScript typecheck: 0 errors
>    - ESLint: 0 errors
>    - Prettier: 100% compliant
>    - Vitest targeted tests (11/11 tests pass) & full regression suite passing
>    - Next.js production build passing (26 dynamic + static routes)
>    - Playwright automated visual walkthrough (6/6 screenshots captured)

---

# 2. Checklist Phase 22 — SaaS Growth Engine & Live Device Tracking (M22)

## Domain & Invariants
```text
[x] Identity-First Telemetry: Pelacakan user-agent dan status presence berbasis sesi aktif
[x] 30-Day Full-Access Freemium Model: Transparansi pricing dan jaminan data tidak dihapus
[x] Bottom-Up School Procurement: Usulan formal lisensi sekolah Dana BOS siap cetak
[x] Academic Glass UI Continuity: Konsistensi visual pada landing page, widget audit, dan modal cetak
```

## Data Layer & Application Services
```text
[x] User-Agent & Presence Detector Engine (src/shared/lib/device-detector.ts)
[x] Teacher Repository Telemetry Enrichment (src/modules/teacher/infrastructure/teacher-repository.ts)
[x] Teacher Domain DTO Updates (src/modules/teacher/domain/teacher-types.ts)
```

## Presentation Layer (Academic Glass UI v1.2)
```text
[x] Conversion-Focused SaaS Landing Page (src/app/page.tsx)
[x] Live Audit & Device Distribution Widget (src/shared/components/dashboard/role-views/super-admin-dashboard.tsx)
[x] Presence & Device Badge on Teacher Directory (src/modules/teacher/presentation/teachers-view.tsx)
[x] Dokumen Usulan Pengadaan Sekolah Modal (src/modules/school/presentation/school-proposal-modal.tsx)
[x] Trial Banner Integration via "Cetak Usulan ke Kepsek" (src/modules/ai-assistant/presentation/trial-banner.tsx)
```

## Quality Gates & Verification
```text
[x] Typecheck: TypeScript tsc --noEmit 0 errors
[x] Lint check: ESLint 0 errors
[x] Format check: Prettier 100% clean
[x] Targeted Tests: 11 unit & component tests passing (100% PASS)
[x] Regression Suite: Seluruh pengujian passing
[x] Build: Next.js production build passing (26 routes generated)
[x] Playwright Visual Walkthrough: 6 visual screenshots captured (docs/phases/screenshots/phase-22-walkthrough/)
```

---

# 3. Previous Milestones & Completed Phases

```text
[x] Milestone A — Bootstrap & Platform Foundation (Phase 00–02) [APPROVED]
[x] Milestone B — School Organization & Identity (Phase 03–06) [APPROVED]
[x] Milestone C — Academic Foundation Ready (Phase 07–10) [APPROVED BY HUMAN]
[x] Milestone D — Teacher Academic MVP (Phase 11–13) [APPROVED BY HUMAN (4 September 2026)]
[x] Milestone E — Digital Assessment Ready (Phase 14–15) [APPROVED]
[x] Milestone F — Student & Guardian Experience Ready (Phase 15–17) [APPROVED BY HUMAN (11 September 2026)]
[x] Milestone G — Student Monitoring, Leadership & School Operations (Phase 18–19) [APPROVED BY HUMAN (17 September 2026)]
[x] Milestone H — Extension Ready (Phase 20–21) [APPROVED BY HUMAN (18 September 2026)]
    ├── [x] Phase 20 — Integration Foundation (M20) [APPROVED BY HUMAN (17 September 2026)]
    └── [x] Phase 21 — AI Assistance & SaaS Onboarding (M21) [APPROVED BY HUMAN (18 September 2026)]

[x] Milestone I — SaaS Growth & Market Readiness (Phase 22) [APPROVED BY HUMAN (18 September 2026)]
    └── [x] Phase 22 — SaaS Growth Engine, Landing Page & Live Device Tracking (M22) [APPROVED BY HUMAN (18 September 2026)]
```

---

# 4. Milestone I Historical Quality Gates

```text
[x] Phase 22 Quality Gates:
    - Domain Invariants: Identity-First Device Telemetry, 30-Day Free Trial SaaS Growth, Bottom-Up School Procurement Proposal
    - Format check: Prettier 100% clean (npm run format:check)
    - Lint check: 0 errors (npm run lint)
    - Typecheck: TypeScript tsc --noEmit 0 errors (npm run typecheck)
    - Tests: 11 unit & component tests passing (src/test/auth/device-detector.test.ts, src/test/school/school-proposal-modal.test.tsx, src/test/smoke.test.tsx)
    - Build: Next.js production compilation 100% PASS (26 routes generated)
    - End-to-End Walkthrough: Playwright automated test & 6 visual screenshots PASS (scripts/qa-phase22-visual-walkthrough.mjs)
    - Human Approval: APPROVED BY HUMAN (18 September 2026)
```

