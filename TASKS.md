# TASKS.md
## Ruang Pintar — Active Implementation Tasks

**Versi:** 18.0  
**Current Active Phase:** PHASE 23 — SAAS MONETIZATION & GO-TO-MARKET: MIDTRANS QRIS CHECKOUT, SUBSCRIPTION WEBHOOK & MARKETING KIT  
**Status:** READY FOR HUMAN REVIEW  

---

# 1. ACTIVE TASKS

```text
PHASE 23 — SAAS MONETIZATION & GO-TO-MARKET: MIDTRANS QRIS CHECKOUT, SUBSCRIPTION WEBHOOK & MARKETING KIT [READY FOR HUMAN REVIEW]
```

Tujuan:
> Mengintegrasikan gerbang pembayaran digital otomatis dan perangkat pemasaran resmi untuk meluncurkan Ruang Pintar ke pasar:
> 1. Otomasi Pembayaran QRIS Berlangganan (Midtrans Snap & Resilient Simulator):
>    - Model database `TransaksiLangganan` untuk pencatatan order ID, nominal Rp 15.000/bln, status pembayaran (`PENDING` -> `PAID`), dan tanggal aktif lisensi.
>    - Adapter API Midtrans Snap dengan dual-mode: Real Production/Sandbox API & Interactive Simulator (memungkinkan pengujian instan tanpa API key).
>    - Webhook Publik (`/api/billing/midtrans-webhook`) dengan verifikasi keamanan SHA-512 Signature untuk aktivasi otomatis paket *Guru Pro* secara instan.
>    - Modal Checkout QRIS Interaktif (`SubscriptionCheckoutModal`) dengan barcode dinamis dan polling status pembayaran.
> 2. Go-To-Market Marketing Kit & Panduan Operasional Guru:
>    - Halaman & Dokumen `/panduan`: Panduan ringkas 1 halaman (*Quick Start User Guide*) cara onboarding 30 detik & foto absensi AI.
>    - Template Pesan Siaran WhatsApp (*1-Click Copy*): 3 sudut pandang persuasif (Guru Perorangan, Komunitas MGMP, dan Kepala Sekolah/Tim BOS).
> 3. Quality Gates:
>    - TypeScript, Linting, Prettier, Unit Tests, Build, dan Playwright Visual Walkthrough.

---

# 2. Checklist Phase 23 — SaaS Monetization & Marketing Kit (M23)

## Domain & Invariants
```text
[x] Idempotent Payment Webhook: Penanganan webhook anti-duplikasi dengan lock transaksi
[x] Resilient Dual-Mode Gateway: Simulasi interaktif saat sandbox API key belum dipasang
[x] Seamless Subscription Provisioning: Peningkatan otomatis status akun ke PRO setelah bayar
[x] 1-Click Copy Marketing Copywriting: Template broadcast siap pakai untuk penetrasi pasar
```

## Data Layer & Application Services
```text
[x] Model TransaksiLangganan pada schema.prisma & database migration
[x] Midtrans Snap Service Adapter (Real API + Simulator)
[x] Subscription Application Service & Webhook Handler
[x] Server Actions: initiateProCheckoutAction, checkOrderStatusAction, simulatePaymentSuccessAction
```

## Presentation Layer (Academic Glass UI v1.2)
```text
[x] SubscriptionCheckoutModal (Barcode QRIS dinamis, countdown, rincian biaya Rp 15.000)
[x] Integrasi Checkout pada Landing Page (/ & #biaya) dan Trial Banner Dashboard
[x] Halaman & Modal Panduan Pengguna & Marketing Kit (/panduan)
```

## Quality Gates & Verification
```text
[x] Typecheck: TypeScript tsc --noEmit 0 errors
[x] Lint check: ESLint 0 errors
[x] Format check: Prettier 100% clean
[x] Targeted Tests: Unit & component tests passing (12/12 PASS)
[x] Build: Next.js production build passing (28 routes generated)
[x] Playwright Visual Walkthrough: 5 visual screenshots captured (docs/phases/screenshots/phase-23-walkthrough/)
```

## Teacher Cockpit UI Refinements, Profile Overhaul & Manual Class Creation
```text
[x] Horizontal Baseline Alignment: Hero Card dan Kartu Jadwal Mengajar kini sejajar sempurna di garis horizontal atas
[x] Compact Elegant Buttons: Tombol Presensi Kilat 15 Detik, Foto Absen AI, dan Perangkat Ajar disesuaikan lebih sleek (rounded-xl, text-xs font-bold)
[x] Purge Fake KPI & 0 is 0: Ketuntasan Penilaian dan Rekap Presensi menampilkan data riil (0% bila belum ada KBM / nilai), bebas dari mock RPL 1
[x] Attention Queue Clean State: Siswa Perlu Perhatian menampilkan status riil "Semua Siswa Terpantau Optimal" tanpa data siswa dummy
[x] Glowing Dark Blue Glass: Menghilangkan seluruh kotak abu-abu kusam, diganti deep translucent navy/blue gradient sesuai tema sidebar
[x] Onboarding Card Guru Baru: Saat totalRombel === 0, panduan cepat 2 menit ditampilkan untuk membimbing guru baru
[x] Profile Page Overhaul (/profil): Avatar lingkaran besar di tengah (size-28), icon kamera di sudut, hapus badge Guru Pengampu, badge Aktif sejajar @username, styling Academic Glass dark mode
[x] Manual Class Creation (/kelas-saya & Modal): Form modal tambah kelas mandiri (nama rombel, tingkat, mapel, siswa per baris) tanpa bergantung AI
[x] Classes Page Toolbar (/kelas-saya): Search bar proporsional (w-80) dengan tombol aksi + Tambah Kelas Manual dan + Foto Absen AI
## Camply-Inspired Landing Page Overhaul & Visual Perfection (M23.1)
```text
[x] Hero Atmosphere & Soft Gradient Mesh: Mempertahankan background gradient mesh soft (bg-[#F8FAFD] / dark:bg-[#070B14]) tanpa batas kotak kaku
[x] Minimalist Mobile Header: Tombol masuk akun diganti icon login sleek ([->]) dengan tooltip hover saat jari mendekat
[x] Elimination of AI Slop Emojis: Seluruh emoji fitur (📚, 🛡️, 📊, dsb.) diganti total dengan ikon 3D claymorphic custom-crafted
[x] Features Trio Layout: Heading "Solusi Cerdas Sekolah Modern!" dengan aksen 3 sinar (\ | /) dan 3 pilar fitur (Administrasi & LMS, CBT Anti-Curang, Leger Rapor Merdeka)
[x] Open-Bleed Dotted World Map: Peta titik-titik (halftone SVG) terbuka tanpa border card, menyambung langsung dan mengalir ke section testimoni
[x] Interactive School Pins & Pulsing Radar Beacons: Pin sekolah melayang dengan foto kampus riil, ring aktif biru, dan radar suar oranye/amber berkedip
[x] Camply Testimonial Showcase: Ditempatkan langsung setelah peta, dilengkapi tombol slider panah bulat (<- / ->), kutipan biru pembuka ("“"), avatar gradien, peran & nama sekolah, serta rating 5 bintang amber
[x] Quality Gates: Typecheck clean (0 errors), Vitest suite 100% PASS (10/10 tests), responsif mobile & desktop terverifikasi visual
```


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

[ ] Milestone J — SaaS Monetization & Go-To-Market (Phase 23) [READY FOR HUMAN REVIEW]
    └── [ ] Phase 23 — SaaS Monetization & Go-To-Market: Midtrans QRIS Checkout, Subscription Webhook & Marketing Kit (M23) [READY FOR HUMAN REVIEW]
```

---

# 4. Milestone I & J Historical Quality Gates

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

[x] Phase 23 Quality Gates:
    - Domain Invariants: Pay-per-Transaction Zero-Cost Admin Guard, Dual-Mode Resilient Gateway (Production API & Interactive Simulator), Idempotent Signature-Protected Webhook, 1-Click Copy Multi-Persona Copywriting
    - Format check: Prettier 100% clean
    - Lint check: 0 errors (npm run lint)
    - Typecheck: TypeScript tsc --noEmit 0 errors (npm run typecheck)
    - Tests: 12 unit & component tests passing (src/test/billing/, src/test/marketing/, src/test/smoke.test.tsx)
    - Build: Next.js production compilation 100% PASS (28 routes generated)
    - End-to-End Walkthrough: Playwright automated test & 5 visual screenshots PASS (scripts/qa-phase23-visual-walkthrough.mjs)
    - Status: READY FOR HUMAN REVIEW
```

