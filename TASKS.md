# TASKS.md
## Ruang Pintar — Active Implementation Tasks

**Versi:** 11.0  
**Current Active Phase:** PHASE 20 — INTEGRATION FOUNDATION (M20)  
**Status:** READY FOR HUMAN REVIEW  

---

# 1. ACTIVE TASKS

```text
PHASE 20 — INTEGRATION FOUNDATION (M20) [READY FOR HUMAN REVIEW]
```

Tujuan:
> Membangun fondasi integrasi multi-kanal (*Integration Foundation*) dan gerbang eksternal platform Ruang Pintar untuk menghubungkan operasional sekolah dengan layanan pihak ketiga (WhatsApp Gateway, Push Notification, Email Transaksional, dan Webhook Engine) sesuai Academic Glass UI v1.2:
> 1. Invariant Domain Inti:
>    - `Integration ≠ Core Domain (Decoupled Port & Adapter)`: Modul transaksional inti sekolah (absensi M12, nilai M13, pengumuman M17, monitoring M18) tidak bergantung langsung pada vendor pihak ketiga. Seluruh interaksi diisolasi melalui abstraksi *Port & Adapter*.
>    - `Delivery Failure ≠ Domain Transaction Rollback`: Kegagalan pengiriman ke vendor eksternal (misal: WhatsApp timeout atau kuota FCM habis) tidak membatalkan transaksi akademik siswa. Pengiriman dicatat dan diisolasi dengan status delivery yang jelas (`PENDING`, `DISPATCHED`, `DELIVERED`, `FAILED`, `RETRYING`).
>    - `Strict Redaction of Secrets`: API key, webhook secrets, dan kredensial sensitif tidak pernah disajikan mentah ke antarmuka atau audit log tanpa masking.
>    - `Cryptographic Signature & Anti-Replay`: Dispatch webhook keluar dilindungi dengan tanda tangan HMAC-SHA256 (`X-RuangPintar-Signature`) dan timestamp header toleransi 5 menit (`X-RuangPintar-Timestamp`).
>    - `Idempotency Enforcement`: Setiap pengiriman diproteksi oleh `idempotency_key` unik untuk mencegah pesan duplikat ke nomor/tujuan yang sama.
> 2. Database & Data Architecture:
>    - Model `KonfigurasiIntegrasi`: Penyimpanan konfigurasi provider per tipe adapter dengan toggle simulasi (`is_simulasi`) dan rate limiting.
>    - Model `EndpointWebhook`: Pendaftaran URL webhook tujuan, rahasia penandatanganan HMAC, filter event, dan metrik keberhasilan.
>    - Model `LogPengirimanIntegrasi`: Audit trail pengiriman pesan lengkap dengan subjek, durasi, jumlah percobaan, respon eksternal, dan status.
>    - Forward migration SQLite: `20260917200000_add_integration_foundation_m20`.
> 3. Application & Service Layer:
>    - Adapters: `WhatsAppAdapter` (Fonnte/Meta/Simulation), `PushNotificationAdapter` (FCM/Web Push/Simulation), `EmailAdapter` (Resend/SMTP/Simulation), `WebhookDispatcher` (HMAC signer, anti-replay, retry backoff).
>    - Service: `IntegrationService` & `IntegrationRepository`.
>    - Server Actions: `getIntegrationCatalogAction`, `updateAdapterConfigAction`, `registerWebhookAction`, `testWebhookPingAction`, `getDeliveryLogsAction`.
>    - Permissions: `integration.view` dan `integration.manage` di-assign ke peran `SUPER_ADMIN` (bundle `SYSTEM_ADMIN`).
> 4. Presentation Layer (Academic Glass UI v1.2):
>    - Portal Integrasi (`/integrasi`) dengan 3 sub-tab interaktif:
>      - Tab Katalog Adapter Layanan (WhatsApp, Push Notification, Email Transaksional, Webhooks) dengan status health indicator.
>      - Tab Endpoint Webhook dengan modal registrasi webhook, event picker, dan tombol test ping.
>      - Tab Log Pengiriman & Audit Trail dengan filter pencarian dan detail status pengiriman.
>    - Modal dialog `AdapterConfigModal` dan `CreateWebhookModal` berbasis portal DOM client-side.
>    - Sidebar navigasi: Penambahan menu "Pusat Integrasi" (`/integrasi`) dengan ikon `Plug`.
> 5. Quality Gates & Verification:
>    - TypeScript typecheck: 0 errors
>    - ESLint: 0 errors
>    - Prettier: 100% compliant
>    - Vitest: 85 test files, 483 tests passing (100% PASS)
>    - Next.js Production Build: 23 static & dynamic routes compiled successfully (PASS)
>    - Playwright automated visual walkthrough: 7 screenshots verified (100% PASS)

---

# 2. Checklist Phase 20 — Integration Foundation (M20)

## Domain & Invariants
```text
[x] Decoupled Port & Adapter: Isolasi vendor WhatsApp, FCM, Email, dan Webhook dari domain core
[x] Non-Blocking Delivery Resiliency: Kegagalan vendor eksternal tidak membatalkan transaksi akademik
[x] Security & Zero Plaintext Secrets: Masking kredensial API dan signing secret
[x] Cryptographic Webhook Security: Tanda tangan HMAC-SHA256 dan perlindungan replay attack 5-menit
[x] Idempotency & Delivery Audit Trail: Pencegahan duplikasi pengiriman dan logging riwayat pengiriman
```

## Data Layer & Application Services
```text
[x] Prisma Migration: Model konfigurasi_integrasi, endpoint_webhook, log_pengiriman_integrasi
[x] Integration Domain & Validation: types, errors, zod schemas
[x] Infrastructure Adapters: WhatsAppAdapter, PushNotificationAdapter, EmailAdapter, WebhookDispatcher
[x] IntegrationRepository & IntegrationService
[x] Server Actions: integration-actions.ts
[x] Seed Data: prisma/seed-integration-foundation.ts
[x] Role Permissions: integration.view & integration.manage untuk SUPER_ADMIN (SYSTEM_ADMIN bundle)
```

## Presentation Layer (Academic Glass UI v1.2)
```text
[x] Integration Portal (/integrasi): Multi-tab service catalog, webhook registry, delivery audit logs
[x] Adapter Configuration Modal: Toggle provider, endpoint, kredensial masking, simulasi mode
[x] Create Webhook Modal: Pendaftaran URL target HTTPS, selektor event, secret generator
[x] Webhook Test Ping: Uji coba koneksi endpoint webhook dengan umpan balik visual instan
[x] Delivery Audit Log Table: Filter pencarian, status badge, durasi pengiriman, respon vendor
[x] Navigation Config & Sidebar: Penambahan menu Pusat Integrasi dengan ikon Plug
```

## Quality Gates & Verification
```text
[x] Typecheck: TypeScript tsc --noEmit 0 errors
[x] Lint check: ESLint 0 errors
[x] Format check: Prettier 100% clean
[x] Tests: Seluruh test unit & integrasi passing (85 test files, 483 tests passing, 100% PASS)
[x] Build: Next.js production build passing (23 routes generated)
[x] Playwright Visual Walkthrough: Bukti 7 tangkapan layar alur kerja Phase 20 (100% PASS)
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
    ├── [x] Phase 20 — Integration Foundation (M20) [READY FOR HUMAN REVIEW]
    └── [ ] Phase 21 — AI Assistance (M21) [NEXT]
```

---

# 4. Milestone H Historical Quality Gates (Phase 20)

```text
[x] Phase 20 Quality Gates:
    - Domain Invariants: Decoupled Port & Adapter, Non-Blocking Resiliency, Zero Plaintext Secrets, HMAC-SHA256 Anti-Replay Webhooks, Idempotent Dispatch
    - Format check: Prettier 100% clean (npm run format:check)
    - Lint check: 0 errors (npm run lint)
    - Typecheck: TypeScript tsc --noEmit 0 errors (npm run typecheck)
    - Tests: 85 test files, 483 tests passing (100% PASS)
    - Build: Next.js production compilation 100% PASS (23 routes generated)
    - End-to-End Walkthrough: Playwright automated test & 7 visual screenshots PASS (qa-phase20-visual-walkthrough.mjs)
```
