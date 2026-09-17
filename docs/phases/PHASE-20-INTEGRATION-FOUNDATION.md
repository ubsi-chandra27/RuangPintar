# PHASE 20 — INTEGRATION FOUNDATION (M20 / MILESTONE H)
## Ruang Pintar — School Digital Operating Platform

**Versi:** 1.0  
**Status:** READY FOR HUMAN REVIEW  
**Tanggal:** 17 September 2026  
**Penyusun:** Antigravity AI Coding Agent  
**Modul Induk:** M20 — Integration Foundation  
**Dokumen Referensi:**
- `docs/08-IMPLEMENTATION-ROADMAP.md` (Bagian 29 — Phase 20 Integration Foundation)
- `docs/03-MODULE-MAP.md` (M20 Integration Foundation)
- `docs/04-ROLE-ACCESS.md` (Seksi 15 — Portal Integrasi & Layanan Eksternal)
- `docs/05-SYSTEM-ARCHITECTURE.md` (Integration & Adapters Architecture)
- `docs/FRD.md` (FR-INT-001 s/d FR-INT-005)
- `AGENTS.md` (Domain Invariants & UI Rule Reference = Contract)

---

# 1. Ringkasan Eksekutif

Phase 20 menuntaskan pembangunan **Integration Foundation (M20)** yang merupakan fondasi gerbang komunikasi dan integrasi eksternal platform Ruang Pintar. Modul ini menyediakan portal administrasi integrasi terpusat (`/integrasi`) bagi Super Admin dan IT Administrator sekolah untuk mengonfigurasi, menguji, dan memonitor seluruh lalu lintas pengiriman pesan eksternal dan dispatch webhook secara andal dan aman.

Arsitektur Phase 20 menegakkan **Domain Invariants** kanonikal:

1. **`Integration ≠ Core Domain (Decoupled Port & Adapter)`**:
   - Seluruh modul transaksional sekolah (absensi M12, nilai M13, pengumuman M17, pemantauan M18) tidak pernah berkomunikasi langsung dengan vendor pihak ketiga (Fonnte, FCM, Resend, SMTP). Komunikasi dilakukan via kontrak abstraksi *Port & Adapter* (`WhatsAppGatewayPort`, `PushNotificationPort`, `EmailNotificationPort`, `WebhookDispatcherPort`).
2. **`Notification Delivery Failure ≠ Domain Transaction Rollback`**:
   - Kegagalan pengiriman pesan via vendor eksternal (misal: koneksi WhatsApp timeout atau kuota FCM habis) tidak boleh membatalkan (*rollback*) transaksi akademik inti (seperti absensi siswa atau publikasi nilai). Pengiriman pesan diisolasi, dicatat statusnya (`PENDING`, `DISPATCHED`, `DELIVERED`, `FAILED`, `RETRYING`), dan didukung mekanisme coba ulang otomatis (*exponential backoff*).
3. **`Zero Plaintext Secrets in Audit Trail (Strict Redaction)`**:
   - Token API, API Secret, dan webhook signing secret tidak pernah disimpan atau ditampilkan secara plaintext di audit trail maupun UI publik. UI menerapkan masking (`sk_live_••••••••`) dan audit logger secara otomatis menyensor field sensitif.
4. **`Cryptographic Webhook Signature & Anti-Replay Protection`**:
   - Seluruh dispatch webhook keluar dibubuhi tanda tangan kriptografis `X-RuangPintar-Signature: sha256=<hex_hmac>` yang dihitung menggunakan HMAC-SHA256 bersama secret webhook. Dispatcher juga menyertakan header `X-RuangPintar-Timestamp` dengan toleransi drift waktu maksimal 5 menit untuk mencegah serangan *replay attack*.
5. **`Idempotency Enforcement & Audit Logging`**:
   - Setiap transaksi pengiriman memiliki `idempotency_key` unik untuk mencegah duplikasi pengiriman pesan ke penerima yang sama (misal duplikasi tagihan SPP atau duplikasi notifikasi alpha).

---

# 2. Files Created & Modified

### Files Created:
1. `prisma/migrations/20260917200000_add_integration_foundation_m20/migration.sql`: DDL migrasi tabel `konfigurasi_integrasi`, `endpoint_webhook`, dan `log_pengiriman_integrasi`.
2. `prisma/seed-integration-foundation.ts`: Script seed data konfigurasi adapter (WhatsApp, FCM Push, Email Resend/SMTP) dan sampel endpoint webhook serta audit log.
3. `scripts/apply-m20-migration.mjs`: Script runner forward migration SQLite yang menjamin nol kehilangan data transaksional sebelumnya.
4. `scripts/qa-phase20-visual-walkthrough.mjs`: Script otomatis Playwright walkthrough 7 skenario pengujian visual katalog integrasi, modal konfigurasi, pendaftaran webhook, uji ping, dan audit log.
5. `src/modules/integration/domain/integration-types.ts`: Kontrak antarmuka TypeScript untuk adapter, status pengiriman, payload webhook, dan DTO statistik integrasi.
6. `src/modules/integration/domain/integration-errors.ts`: Definisi error domain (`IntegrationAdapterNotFoundError`, `IntegrationDeliveryError`, `WebhookSignatureVerificationError`, dll).
7. `src/modules/integration/domain/integration-validation.ts`: Skema validasi Zod untuk payload konfigurasi adapter, pendaftaran webhook, dan penembakan event webhook.
8. `src/modules/integration/infrastructure/whatsapp-adapter.ts`: Adapter gateway WhatsApp mendukung mode Fonnte API, Meta WhatsApp Cloud API, dan simulasi sandbox lokal.
9. `src/modules/integration/infrastructure/push-notification-adapter.ts`: Adapter push notification mendukung Firebase Cloud Messaging (FCM), Web Push standard, dan simulasi sandbox.
10. `src/modules/integration/infrastructure/email-adapter.ts`: Adapter email transaksional mendukung Resend API, SMTP standard, dan simulasi sandbox.
11. `src/modules/integration/infrastructure/webhook-dispatcher.ts`: Engine dispatcher webhook dengan HMAC-SHA256 signature generator, verifikasi anti-replay, dan payload serializer.
12. `src/modules/integration/infrastructure/integration-repository.ts`: Repository Prisma untuk persistensi konfigurasi, idempotency check, query audit log, dan agregasi metrik pengiriman.
13. `src/modules/integration/application/integration-service.ts`: Application service pengatur orkestrasi adapter, dispatch pesan multi-kanal, audit logging, dan manajemen webhook.
14. `src/app/actions/integration-actions.ts`: Server actions Next.js untuk pengambilan katalog, pembaharuan konfigurasi adapter, registrasi webhook, uji ping, dan filter audit log.
15. `src/modules/integration/presentation/integration-portal-view.tsx`: Tampilan portal integrasi utama dengan Academic Glass UI v1.2 (Tab Katalog, Webhook, dan Log Pengiriman).
16. `src/modules/integration/presentation/adapter-config-modal.tsx`: Modal dialog konfigurasi provider, API endpoint, credentials masking, dan toggle aktivasi adapter.
17. `src/modules/integration/presentation/create-webhook-modal.tsx`: Modal pendaftaran endpoint webhook baru dengan selektor event dan generator rahasia signing.
18. `src/app/integrasi/page.tsx`: Route page server Next.js untuk Portal Integrasi & Layanan Eksternal.
19. `src/test/integration/integration-service.test.ts`: Unit test suite (8 pengujian) untuk adapter WhatsApp, Push, Email, Webhook HMAC, idempotensi, dan otorisasi default deny.
20. `src/test/integration/integration-views.test.tsx`: Presentation test suite (4 pengujian) untuk rendering portal integrasi, modal konfigurasi, dan tabel log.
21. `docs/phases/PHASE-20-INTEGRATION-FOUNDATION.md`: Laporan resmi deliverable Phase 20.

### Files Modified:
1. `prisma/schema.prisma`: Penambahan model relasional `KonfigurasiIntegrasi`, `EndpointWebhook`, `LogPengirimanIntegrasi` dan relasi ke `Sekolah`.
2. `src/shared/infrastructure/authorization/types.ts`: Pendaftaran permission `integration.view` dan `integration.manage`.
3. `src/shared/infrastructure/authorization/role-permissions.ts`: Pemberian permission integrasi kepada peran `SUPER_ADMIN`.
4. `src/shared/infrastructure/authorization/capability-bundles.ts`: Penambahan permission integrasi ke dalam bundle `SYSTEM_ADMIN`.
5. `src/shared/components/shell/navigation-config.ts`: Penambahan menu "Pusat Integrasi" (`/integrasi`) dengan ikon `Plug` pada navigasi Super Admin.
6. `src/shared/components/shell/sidebar.tsx`: Pendaftaran ikon Lucide `Plug` pada resolver ikon navigasi sidebar.
7. `TASKS.md`: Pembaruan status checklist task Phase 20 menjadi READY FOR HUMAN REVIEW.
8. `MEMORY.md`: Pencatatan progres Phase 20 Milestone H.

---

# 3. Database & Migrations

Tiga tabel first-party ditambahkan ke database SQLite via migrasi forward `20260917200000_add_integration_foundation_m20`:

```sql
-- 1. Konfigurasi Adapter Integrasi Eksternal
CREATE TABLE konfigurasi_integrasi (
    id TEXT NOT NULL PRIMARY KEY,
    sekolah_id TEXT NOT NULL,
    tipe_adapter TEXT NOT NULL, -- WHATSAPP | PUSH_NOTIFICATION | EMAIL | SMS | CUSTOM_WEBHOOK
    provider TEXT NOT NULL,     -- FONNTE | META_WHATSAPP | FIREBASE_FCM | RESEND | SMTP | SIMULATION
    is_active BOOLEAN NOT NULL DEFAULT 1,
    is_simulasi BOOLEAN NOT NULL DEFAULT 1,
    konfigurasi_json TEXT NOT NULL,
    rate_limit_per_menit INTEGER NOT NULL DEFAULT 60,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT konfigurasi_integrasi_sekolah_id_fkey FOREIGN KEY (sekolah_id) REFERENCES sekolah (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX konfigurasi_integrasi_sekolah_id_tipe_adapter_key ON konfigurasi_integrasi (sekolah_id, tipe_adapter);

-- 2. Pendaftaran Endpoint Webhook Keluar
CREATE TABLE endpoint_webhook (
    id TEXT NOT NULL PRIMARY KEY,
    sekolah_id TEXT NOT NULL,
    nama_layanan TEXT NOT NULL,
    url_tujuan TEXT NOT NULL,
    secret_key TEXT NOT NULL,
    event_didukung_json TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    total_berhasil INTEGER NOT NULL DEFAULT 0,
    total_gagal INTEGER NOT NULL DEFAULT 0,
    terakhir_dipanggil DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT endpoint_webhook_sekolah_id_fkey FOREIGN KEY (sekolah_id) REFERENCES sekolah (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX endpoint_webhook_sekolah_id_is_active_idx ON endpoint_webhook (sekolah_id, is_active);

-- 3. Log Audit dan Pengiriman Pesan / Webhook
CREATE TABLE log_pengiriman_integrasi (
    id TEXT NOT NULL PRIMARY KEY,
    sekolah_id TEXT NOT NULL,
    tipe_adapter TEXT NOT NULL,
    provider TEXT NOT NULL,
    tujuan TEXT NOT NULL,
    subjek TEXT,
    payload_json TEXT NOT NULL,
    status TEXT NOT NULL, -- PENDING | DISPATCHED | DELIVERED | FAILED | RETRYING
    respon_eksternal_json TEXT,
    pesan_error TEXT,
    idempotency_key TEXT,
    durasi_ms INTEGER,
    attempt_count INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT log_pengiriman_integrasi_sekolah_id_fkey FOREIGN KEY (sekolah_id) REFERENCES sekolah (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX log_pengiriman_integrasi_idempotency_key_key ON log_pengiriman_integrasi (idempotency_key);
CREATE INDEX log_pengiriman_integrasi_sekolah_id_tipe_adapter_status_idx ON log_pengiriman_integrasi (sekolah_id, tipe_adapter, status);
CREATE INDEX log_pengiriman_integrasi_created_at_idx ON log_pengiriman_integrasi (created_at);
```

---

# 4. Domain Invariants & Rules

1. **Simulasi Sandbox Default**:
   - Ketika sekolah baru dibangun atau dalam lingkungan evaluasi, seluruh adapter beroperasi pada mode `is_simulasi: true`. Pesan disimulasikan berhasil dikirim tanpa membebani kuota vendor berbayar ataupun memerlukan kredensial asli saat instalasi perdana.
2. **Kerahasiaan Kredensial**:
   - Field `konfigurasi_json` dan `secret_key` tidak pernah disajikan mentah ke klien. Antarmuka hanya menampilkan status konektivitas, nama provider, dan partial masking key.
3. **Pemisahan Jalur Komunikasi**:
   - *Direct Messaging* (WhatsApp/Email/FCM) melayani pesan individual (notifikasi wali, absensi harian, password reset).
   - *Webhook Dispatching* melayani interoperabilitas sistem (event `student.attendance.marked`, `exam.published`, `grade.finalized` ke sistem eksternal dinas/mitra).

---

# 5. Quality Gates & Verification Evidence

| Quality Gate | Standar / Target | Hasil Verifikasi | Status |
|---|---|---|---|
| **TypeScript Typecheck** | `npm run typecheck` (`tsc --noEmit`) | 0 errors | **PASS** |
| **ESLint** | `npm run lint` (`eslint .`) | 0 errors | **PASS** |
| **Code Formatting** | `npm run format:check` (`prettier --check .`) | 100% compliant | **PASS** |
| **Unit & Integration Tests** | `npm run test` (`vitest run --fileParallelism=false`) | **85 test files, 483 tests passing** (100% PASS) | **PASS** |
| **Next.js Production Build** | `npm run build` (`next build`) | 23 rute terkompilasi optimal (termasuk `/integrasi`) | **PASS** |
| **Playwright Visual QA** | `scripts/qa-phase20-visual-walkthrough.mjs` | **7 skenario visual sukses 100%** | **PASS** |

### Bukti Visual Playwright Walkthrough (7 Tangkapan Layar):
1. `01-integration-catalog-desktop.png`: Katalog Adapter Layanan Eksternal (WhatsApp, Push Notification, Email Transaksional, Webhooks) dengan status health indicator.
2. `02-adapter-config-modal.png`: Modal Pengaturan Adapter WhatsApp (Pilihan Provider Fonnte/Meta/Simulation, Endpoint, Credentials Masking, Rate Limiter).
3. `03-webhooks-list.png`: Daftar Endpoint Webhook Terdaftar (URL Tujuan, Event Subscriptions, Metrik Keberhasilan/Kegagalan, Tombol Test Ping).
4. `04-create-webhook-modal.png`: Modal Pendaftaran Webhook Baru (Nama Layanan, URL Target HTTPS, Event Selector Checkbox, Generator Signing Secret).
5. `05-webhook-ping-tested.png`: Hasil Pengujian Uji Ping Webhook Terkonfirmasi Berhasil dengan Catatan Waktu Respons.
6. `06-delivery-audit-logs.png`: Tabel Log Pengiriman & Audit Trail Lengkap (Timestamp, Saluran, Tujuan, Status Pengiriman, Durasi Eksekusi).
7. `07-mobile-integration-view.png`: Tampilan Responsif Mobile Viewport 390px Portal Integrasi.

Tangkapan layar tersimpan pada direktori:
`docs/phases/screenshots/phase-20-walkthrough/`

---

# 6. Known Limitations & Out-of-Scope Confirmation

1. **Hardware Biometrics Integration (RFID / Mesin Absensi)**:
   - Sesuai roadmap, integrasi fisik mesin pembaca kartu RFID, mesin sidik jari, dan pengenal wajah berada di luar Phase 20 dan akan dibangun pada **PHASE 21 — HARDWARE & BIOMETRICS ATTENDANCE DEVICES (M21)**.
2. **Public Developer Platform & API Docs**:
   - Pintu masuk API publik bagi pengembang eksternal sekolah (Swagger/OpenAPI UI, Developer API Key Management) dijadwalkan pada **PHASE 22 — PUBLIC API & DEVELOPER PLATFORM (M22)**.

---

# 7. Ready for Human Review

Seluruh deliverable dan quality gates untuk **PHASE 20 — INTEGRATION FOUNDATION (M20 / MILESTONE H)** telah rampung diselesaikan dengan kepatuhan penuh terhadap prinsip modular monolith, keamanan default deny, dan Academic Glass UI v1.2.

Sesuai aturan operasional `AGENTS.md` (Bagian 6 & Bagian 16), pekerjaan dihentikan pada checkpoint ini:
**READY FOR HUMAN REVIEW**.
