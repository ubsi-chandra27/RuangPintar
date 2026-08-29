# PHASE 03 — AUTHENTICATION & IDENTITY
## Ruang Pintar — Canonical Specification & Deliverable Report

**Versi:** 1.1
**Status:** APPROVED
**Active Phase:** PHASE 03 — AUTHENTICATION & IDENTITY
**Starting Baseline:** `cc9249f832f3a663b8c69b1b9893adf06e92ad80` (Implementation: `3135db0462c8886107162aaf8fa28221139e3508`)
**Dokumen Induk:**
- `docs/05-SYSTEM-ARCHITECTURE.md`
- `docs/06-DATA-ARCHITECTURE.md`
- `docs/07-UI-UX-DESIGN-SYSTEM.md`
- `docs/08-IMPLEMENTATION-ROADMAP.md` (Section 12)
- `docs/FRD.md` (FR-AUTH-001 s/d FR-AUTH-008)
- `docs/phases/README.md`
- `docs/phases/PHASE-02-DATABASE-PERSISTENCE-PLATFORM-FOUNDATION.md`
- `ruang-pintar-v2-login-ui-kit-handoff/LOGIN-SPECIFICATION.md`

---

# 1. Tujuan & Ruang Lingkup Phase 03

Phase 03 mengimplementasikan subsistem **Authentication & Identity (M02)** agar seluruh alur autentikasi, manajemen siklus hidup akun pengguna (*User Account*), enkripsi password (*bcrypt*), sesi *server-authoritative* berbasis database SQLite & *HttpOnly cookies*, mitigasi *brute-force rate limiting*, alur wajib ganti password (*must_change_password*), pencatatan audit log keamanan autentikasi (*AUTH_LOGIN_SUCCESS*, *AUTH_LOGIN_FAILED*, *AUTH_LOGOUT*, *AUTH_PASSWORD_CHANGED*), serta antarmuka login web berbasis *Academic Glass UI* (Desktop 58/42 Split Hero Layout & Mobile Form-First) berfungsi secara penuh dan aman.

---

# 2. Arsitektur Autentikasi & Identitas

1. **Identifier Login & Kebijakan Akun:**
   - **Login Identifier:** `username` (case-insensitive, 3-30 karakter alfanumerik / titik / strip / underscore).
   - **Email Policy:** Opsional, bukan identifier utama (`FR-AUTH-002`).
   - **Public Registration:** Tidak tersedia pada baseline (`FR-AUTH-003`), akun diprovisikan resmi oleh sekolah.
   - **Account Status:** `AKTIF`, `NONAKTIF`, `TERKUNCI`, `DITANGGUHKAN`, `MENUNGGU_VERIFIKASI`. Hanya status `AKTIF` yang dapat membuat sesi baru (`FR-AUTH-004`).
   - **Password Policy:** Minimal 8 karakter, wajib kombinasi huruf dan angka (`FR-AUTH-008`). Disimpan dalam bentuk hash bcrypt (salt rounds: 10).

2. **Session Architecture & Remember Me:**
   - Sesi disimpan secara persisten di tabel `sesi_pengguna` dengan token acak 64-karakter hex (disimpan dalam bentuk hash SHA-256 pada database).
   - Cookie browser: `ruang_pintar_session` (`httpOnly: true`, `sameSite: "lax"`, `secure: production`, `path: "/"`).
   - Durasi Sesi: 24 Jam (Standar tanpa remember me) atau 30 Hari (*Ingat saya / Remember Me*).
   - Logout: Mencabut sesi secara instan (`dicabut: true`) dan menghapus cookie klien (`FR-AUTH-007`).

3. **Mitigasi Brute Force & Rate Limiting:**
   - Dicatat pada tabel `log_percobaan_login` (`FR-AUTH-005`).
   - Ambang batas: Maksimal 5 percobaan gagal berturut-turut dalam jendela 15 menit per username atau per IP address.
   - Jika gagal melebihi batas, akun terkunci dan request diblokir selama 15 menit.

4. **Audit Log Keamanan (M05 Integration):**
   - Setiap event autentikasi dicatat ke `log_audit` melalui `recordAuditEvent`:
     - `AUTH_USER_CREATED`
     - `AUTH_LOGIN_SUCCESS`
     - `AUTH_LOGIN_FAILED`
     - `AUTH_LOGIN_BLOCKED_RATE_LIMIT`
     - `AUTH_LOGIN_REJECTED_STATUS`
     - `AUTH_ACCOUNT_LOCKED`
     - `AUTH_LOGOUT`
     - `AUTH_PASSWORD_CHANGED`
   - Password plaintext dan hash tidak pernah dicatat dalam log audit.

5. **Boundary Base Role (`peran_dasar`):**
   - `peran_dasar` (`SUPER_ADMIN`, `SCHOOL_STAFF`, `TEACHER`, `STUDENT`, `GUARDIAN`) disimpan pada model `Pengguna` murni sebagai atribut identitas domain.
   - Tidak ada evaluasi permission, capability bundles, position/assignment, atau role-aware routing di Phase 03. Seluruh authorization engine adalah kepemilikan resmi Phase 04.

6. **Password Recovery Baseline:**
   - Halaman `/forgot-password` menyediakan alur institusional resmi (menghubungi tata usaha/operator sekolah).
   - Reset elektronik tidak dimuat pada baseline FRD aktif (`FR-AUTH-001` s/d `FR-AUTH-008`). Model `token_reset_password` tidak dimuat untuk mematuhi aturan `ROADMAP-RULE-006 — No Cross-Phase Schema`.

7. **Antarmuka Web & UX (Academic Glass UI v1.2):**
   - `/login`: 58% Desktop Hero Artwork Astronaut (`login-hero-astronaut.png`) + 42% Right Form Container (max 470px form) dengan tombol Academic Navy `#1E293B` dan loading spinner; Mobile Form-First layout.
   - `/ganti-password`: Halaman wajib/sukarela perbarui kata sandi dengan validasi kata sandi lama dan konfirmasi (`FR-AUTH-006`).
   - `/forgot-password`: Halaman panduan pemulihan kata sandi institusional sekolah.

---

# 3. Model Data & Migrasi Skema (Forward Migration)

Migrasi baru: `20260829020149_add_identity_and_authentication/migration.sql`

```prisma
model Pengguna {
  id                     String    @id
  sekolah_id             String?
  username               String    @unique
  email                  String?   @unique
  password_hash          String
  nama_lengkap           String
  peran_dasar            String    // SUPER_ADMIN | SCHOOL_STAFF | TEACHER | STUDENT | GUARDIAN
  status_akun            String    @default("AKTIF")
  harus_ganti_password   Boolean   @default(false)
  terakhir_login_pada    DateTime?
  percobaan_login_gagal  Int       @default(0)
  dikunci_sampai         DateTime?
  created_at             DateTime  @default(now())
  updated_at             DateTime  @updatedAt

  sekolah                Sekolah?              @relation(fields: [sekolah_id], references: [id], onDelete: SetNull)
  sesi                   SesiPengguna[]

  @@index([sekolah_id, peran_dasar])
  @@index([status_akun])
  @@map("pengguna")
}

model SesiPengguna {
  id                  String    @id
  pengguna_id         String
  token_hash          String    @unique
  ip_address          String?
  user_agent          String?
  berlaku_sampai      DateTime
  terakhir_aktif_pada DateTime  @default(now())
  dicabut             Boolean   @default(false)
  alasan_cabut        String?
  created_at          DateTime  @default(now())
  updated_at          DateTime  @updatedAt

  pengguna            Pengguna  @relation(fields: [pengguna_id], references: [id], onDelete: Cascade)

  @@index([pengguna_id, dicabut, berlaku_sampai])
  @@map("sesi_pengguna")
}

model LogPercobaanLogin {
  id              String    @id
  identifier      String
  ip_address      String
  sukses          Boolean
  alasan_gagal    String?
  dibuat_pada     DateTime  @default(now())

  @@index([identifier, dibuat_pada])
  @@index([ip_address, dibuat_pada])
  @@map("log_percobaan_login")
}
```

---

# 4. Acceptance Criteria & Verifikasi

| Kode AC | Deskripsi Kriteria Penerimaan | Bukti Verifikasi | Status |
|---|---|---|---|
| **AC-AUTH-01** | Pengguna dapat login dengan username dan password valid menghasilkan session token server-side (`FR-AUTH-001`, `FR-AUTH-002`). | `src/test/auth/auth-service.test.ts` memvalidasi login, pembuatan sesi, dan validasi sesi. | **PASS** |
| **AC-AUTH-02** | Password dienkripsi dengan bcrypt dan divalidasi dengan kebijakan minimal 8 karakter (huruf & angka) (`FR-AUTH-008`). | `src/test/auth/password.test.ts` (2 tests) memvalidasi hashing, verifikasi, dan penolakan format lemah. | **PASS** |
| **AC-AUTH-03** | Username bersifat unik dan penolakan duplikasi dijamin di tingkat aplikasi dan database (`FR-AUTH-003`). | `src/test/auth/identity.test.ts` memvalidasi penolakan duplikasi username dan format salah. | **PASS** |
| **AC-AUTH-04** | Akun non-aktif / terkunci ditolak saat mencoba login dan menghasilkan pesan yang sesuai (`FR-AUTH-004`). | `src/test/auth/auth-service.test.ts` memvalidasi penolakan status non-aktif. | **PASS** |
| **AC-AUTH-05** | Rate limiting membatasi percobaan login berulang dan memblokir brute-force attack (`FR-AUTH-005`). | `src/test/auth/rate-limiter.test.ts` (2 tests) memvalidasi penghitungan percobaan dan pemblokiran setelah 5 kali gagal. | **PASS** |
| **AC-AUTH-06** | Logout mencabut sesi di database dan menghapus cookie browser (`FR-AUTH-007`). | `src/test/auth/auth-service.test.ts` memvalidasi pencabutan sesi instan. | **PASS** |
| **AC-AUTH-07** | Alur wajib ganti password mengarahkan pengguna ke form ganti password (`FR-AUTH-006`). | `src/test/auth/identity.test.ts` & Playwright Browser QA memverifikasi flow must-change-password. | **PASS** |
| **AC-AUTH-08** | Halaman `/login` merender Academic Glass UI sesuai visual contract 58/42 desktop split hero dan mobile form-first. | Playwright Browser QA + Screenshots (1440x900, 1024x768, 768x1024, 390x844). | **PASS** |

---

# 5. Hasil Pengujian Otomatis

Total Test Files: **14 passed**
Total Tests: **51 passed (100%)**

- `src/test/auth/password.test.ts` (2 tests) — PASS
- `src/test/auth/session.test.ts` (2 tests) — PASS
- `src/test/auth/identity.test.ts` (5 tests) — PASS
- `src/test/auth/auth-service.test.ts` (7 tests) — PASS
- `src/test/auth/rate-limiter.test.ts` (2 tests) — PASS
- `src/test/database/ulid.test.ts` (3 tests) — PASS
- `src/test/database/sqlite-pragmas.test.ts` (2 tests) — PASS
- `src/test/database/prisma-foundation.test.ts` (6 tests) — PASS
- `src/test/database/transaction.test.ts` (2 tests) — PASS
- `src/test/database/audit.test.ts` (4 tests) — PASS
- `src/test/database/outbox.test.ts` (4 tests) — PASS
- `src/test/storage/local-storage.test.ts` (3 tests) — PASS
- `src/test/config/configuration.test.ts` (6 tests) — PASS
- `src/test/smoke.test.tsx` (3 tests) — PASS

---

# 6. Bukti Visual & Screenshot Browser QA

Direktori: `docs/phases/screenshots/phase-03/`

- `phase-03-login-1440x900.png` — Desktop 58% Artwork Hero / 42% Form baseline
- `phase-03-login-1024x768.png` — Medium Desktop / Laptop view
- `phase-03-login-768x1024.png` — Tablet single-column view
- `phase-03-login-390x844.png` — Mobile Form-First layout
- `phase-03-login-validation.png` — State error banner validasi login gagal
- `phase-03-password-required.png` — Halaman `/ganti-password` (must change password)
- `phase-03-forgot-password.png` — Halaman `/forgot-password` (panduan institusional)

---

# 7. Quality Gates

- **`npm run format:check`**: PASS (*All matched files use Prettier code style!*)
- **`npm run lint`**: PASS (*0 errors, 0 warnings*)
- **`npm run typecheck`**: PASS (*tsc --noEmit exit code 0*)
- **`npm run test`**: PASS (*51/51 tests passed across 14 test files*)
- **`npm run build`**: PASS (*Next.js 16 Turbopack production build with static and dynamic routes*)
- **`npm audit`**: PASS (*found 0 vulnerabilities*)
- **`git diff --check`**: PASS (*Clean, no whitespace issues*)

---

# 8. Explicit Non-Scope & Phase Boundary

1. **TIDAK membangun Dynamic Permission Engine & RBAC Middleware** (Lingkup resmi Phase 04).
2. **TIDAK membangun Application Shell / Dashboard Navigation / Role-specific Dashboards** (Lingkup resmi Phase 05).
3. **TIDAK membangun CRUD Domain Bisnis Akademik (M06–M21)**.

---

# 9. Kesiapan Handoff menuju Phase 04

Phase 03 menyediakan:
- `getCurrentUser()` dan `requireAuth()` helper untuk server components dan server actions.
- Model data `Pengguna` dengan `peran_dasar` (`SUPER_ADMIN`, `SCHOOL_STAFF`, `TEACHER`, `STUDENT`, `GUARDIAN`).
- Session store yang valid dan terisolasi per sekolah.
- Audit trail untuk transaksi keamanan.

**Status Akhir:** `APPROVED`
