# TASKS.md
## Ruang Pintar — Active Implementation Tasks

**Versi:** 13.0  
**Current Active Phase:** PHASE 21 — AI ASSISTANCE & SAAS ONBOARDING (M21)  
**Status:** READY FOR HUMAN REVIEW  

---

# 1. ACTIVE TASKS

```text
PHASE 21 — AI ASSISTANCE & SAAS ONBOARDING (M21) [READY FOR HUMAN REVIEW]
```

Tujuan:
> Membangun gerbang pendaftaran mandiri guru (*Self-Service SaaS Registration*), asisten AI pemindaian foto absensi kertas ke kelas otomatis (*Photo-to-Class Vision AI Agent*), dan sistem pembatasan masa coba gratis 30 hari (*Freemium Trial Workspace*) sesuai standar Academic Glass UI v1.2:
> 1. Invariant Domain Inti:
>    - `AI Assistance ≠ Unreviewed Mutation (Human-in-the-Loop Guard)`: Ekstraksi teks dari foto oleh Gemini Multimodal Vision selalu menghasilkan draft pratinjau tabular yang wajib dikonfirmasi oleh guru sebelum dicatat ke database.
>    - `Zero Friction Self-Registration (Progressive Disclosure)`: Pendaftaran mandiri (`/register`) hanya meminta 4 kolom ringkas (Nama Lengkap, Email/WhatsApp, Kata Sandi, Nama Sekolah). Data administratif (NPSN, NIP Kepsek, logo) tidak dipaksakan di awal melainkan menggunakan *smart defaults*.
>    - `Freemium Scoping (Teacher Workspace Limits)`: Akun guru mandiri gratis dibatasi maksimal 5 rombel mengajar dengan durasi masa percobaan 30 hari. Fitur level institusi (WhatsApp gateway massal, dashboard pengawas, CBT massal) ditandai dengan gembok *Upgrade Trigger* 🔒.
>    - `Single-Tenant Data Isolation & Security`: Data kelas, materi, dan siswa yang dibuat oleh guru mandiri terisolasi secara aman menggunakan relasi `sekolah_id` tanpa kebocoran antar instansi.
> 2. Database & Data Architecture:
>    - Kolom/Model pelacak masa uji coba pada `Pengguna` atau `Sekolah` (`tipe_lisensi: FREEMIUM | SEKOLAH`, `trial_berakhir_pada`, `total_rombel_aktif`).
>    - Tabel/Model `PermintaanSetupKelasAi` untuk pencatatan log pemrosesan foto, respon ekstraksi AI, dan status konfirmasi guru.
> 3. Application & Service Layer:
>    - `GeminiVisionService`: Adapter pengolah gambar multimodal (ekstraksi nama siswa, NIS/NISN, jenis kelamin L/P, nama rombel).
>    - `SmartOnboardingService`: Orkestrasi registrasi mandiri, pembuatan instansi sekolah awal secara instan, dan penerbitan kelas dari payload AI.
>    - Server Actions:
>      - `registerTeacherAction` (registrasi guru baru)
>      - `processClassPhotoAction` (upload foto lembar absensi & ekstraksi Vision AI)
>      - `confirmClassCreationAction` (konfirmasi draft dan simpan rombel + siswa)
>      - `getTeacherTrialStatusAction` (cek sisa hari masa percobaan 30 hari)
> 4. Presentation Layer (Academic Glass UI v1.2):
>    - Rute baru `/register` (Halaman pendaftaran publik yang bersih, responsif, dan elegan).
>    - Komponen Onboarding Ramah:
>      - `SmartPhotoOnboardingModal`: Area dropzone foto / tangkapan kamera HP untuk mengunggah lembar presensi kelas.
>      - `AiPreviewTableModal`: Tabel interaktif hasil pembacaan AI dengan opsi edit nama/gender sebelum konfirmasi.
>    - Banner Status Trial: Menampilkan sisa hari uji coba ("Tersisa 30 hari masa coba gratis") beserta tombol usulan ke Kepala Sekolah.
> 5. Quality Gates & Verification:
>    - TypeScript typecheck: 0 errors
>    - ESLint: 0 errors
>    - Prettier: 100% compliant
>    - Vitest unit & integration tests passing (88 files, 493 tests)
>    - Next.js production build passing (24 routes)
>    - Playwright automated visual walkthrough (7/7 screenshots captured)

---

# 2. Checklist Phase 21 — AI Assistance & SaaS Onboarding (M21)

## Domain & Invariants
```text
[x] Human-in-the-Loop AI Guard: Pratinjau hasil ekstraksi foto sebelum mutasi database
[x] Zero Friction Registration: Pendaftaran 4 kolom tanpa beban administratif di awal
[x] Freemium Trial Scoping: Kuota 5 rombel guru & pembatas durasi 30 hari
[x] Safe Multimodal Vision: Ekstraksi foto kertas/tabel absensi menggunakan Gemini AI Vision
```

## Data Layer & Application Services
```text
[x] Prisma Schema & Migration: Field lisensi uji coba & log ekstraksi AI
[x] AI Vision Service: Integrasi Gemini Vision multimodal OCR
[x] Smart Onboarding Service & Server Actions: /register & proses foto AI
[x] Role & Permissions Guard: Guru mandiri mendapatkan bundle peran TEACHER
```

## Presentation Layer (Academic Glass UI v1.2)
```text
[x] Halaman Pendaftaran Publik (/register)
[x] Modal Smart Onboarding (Upload Foto Lembar Absensi)
[x] Modal Pratinjau Ekstraksi AI & Editor Tabel Siswa
[x] Trial Badge & Banner Pengingat Sisa Hari Masa Percobaan
```

## Quality Gates & Verification
```text
[x] Typecheck: TypeScript tsc --noEmit 0 errors
[x] Lint check: ESLint 0 errors
[x] Format check: Prettier 100% clean
[x] Tests: Seluruh test passing (88 test files, 493 tests pass)
[x] Build: Next.js production build passing (24 routes)
[x] Playwright Visual Walkthrough: Bukti visual alur registrasi & pemrosesan foto AI (7 screenshots)
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

[ ] Milestone H — Extension Ready (Phase 20–21) [READY FOR REVIEW]
    ├── [x] Phase 20 — Integration Foundation (M20) [APPROVED BY HUMAN (17 September 2026)]
    └── [x] Phase 21 — AI Assistance & SaaS Onboarding (M21) [READY FOR HUMAN REVIEW]
```

---

# 4. Milestone H Historical Quality Gates

```text
[x] Phase 20 Quality Gates:
    - Domain Invariants: Decoupled Port & Adapter, Non-Blocking Resiliency, Zero Plaintext Secrets, HMAC-SHA256 Anti-Replay Webhooks, Idempotent Dispatch
    - Format check: Prettier 100% clean (npm run format:check)
    - Lint check: 0 errors (npm run lint)
    - Typecheck: TypeScript tsc --noEmit 0 errors (npm run typecheck)
    - Tests: 85 test files, 483 tests passing (100% PASS)
    - Build: Next.js production compilation 100% PASS (23 routes generated)
    - End-to-End Walkthrough: Playwright automated test & 7 visual screenshots PASS (qa-phase20-visual-walkthrough.mjs)
    - Human Approval: APPROVED BY HUMAN (17 September 2026)

[x] Phase 21 Quality Gates:
    - Domain Invariants: Strict Human-in-the-Loop AI Vision Guard, 4-Field Progressive Disclosure Sign-up, Freemium 30-Day Workspace Quota Isolation (Max 5 Classes)
    - Format check: Prettier 100% clean (npm run format:check)
    - Lint check: 0 errors (npm run lint)
    - Typecheck: TypeScript tsc --noEmit 0 errors (npm run typecheck)
    - Tests: 88 test files, 493 tests passing (100% PASS)
    - Build: Next.js production compilation 100% PASS (24 routes generated)
    - End-to-End Walkthrough: Playwright automated test & 7 visual screenshots PASS (qa-phase21-visual-walkthrough.mjs)
    - Human Approval: READY FOR HUMAN REVIEW
```
