# TASKS.md
## Ruang Pintar — Active Implementation Tasks

**Versi:** 1.3
**Current Active Phase:** PHASE 03 — AUTHENTICATION & IDENTITY
**Status:** APPROVED

---

# 1. ACTIVE TASK

```text
PHASE 03 — AUTHENTICATION & IDENTITY
```

Tujuan:

> Mengaktifkan subsistem autentikasi & identitas (M02) meliputi User Account, enkripsi password bcrypt, server-authoritative session store, mitigasi brute-force rate limiting, alur wajib ganti password, audit log keamanan, serta antarmuka login web berbasis Academic Glass UI v1.2.

---

# 2. Phase 03 Checklist

## Identity & Data Model

```text
[x] Forward migration skema M02 (pengguna, sesi_pengguna, log_percobaan_login)
[x] Enkripsi password bcrypt & validasi kebijakan keamanan (src/shared/lib/password.ts)
[x] Generator token sesi kriptografis & SHA-256 hash (src/shared/lib/session.ts)
[x] Layanan IdentityService untuk provisi akun & perubahan kata sandi (src/shared/infrastructure/auth/identity-service.ts)
```

## Authentication & Session Management

```text
[x] Layanan AuthService untuk login kredensial & validasi sesi server-side (src/shared/infrastructure/auth/auth-service.ts)
[x] Mitigasi brute force rate limiting (src/shared/infrastructure/auth/rate-limiter.ts)
[x] Sesi server-authoritative dengan HttpOnly secure cookie
[x] Opsi sesi Remember Me (30 hari vs 24 jam)
[x] Server Actions untuk login, logout, dan ganti password (src/app/actions/auth-actions.ts)
[x] Server guard helper getCurrentUser & requireAuth (src/shared/infrastructure/auth/auth-guard.ts)
[x] Integrasi audit trail keamanan (AUTH_LOGIN_SUCCESS, AUTH_LOGIN_FAILED, AUTH_LOGOUT, AUTH_PASSWORD_CHANGED)
```

## User Interface & Academic Glass UI

```text
[x] Visual assets branding & astronaut hero diimpor ke public/images/
[x] Halaman /login dengan 58/42 desktop split hero & mobile form-first layout (src/app/login/page.tsx)
[x] Form login interaktif dengan toggle show/hide password, state loading, dan error banner (src/app/login/login-form.tsx)
[x] Halaman /ganti-password untuk mandatory password change (src/app/ganti-password/page.tsx)
[x] Halaman /forgot-password untuk panduan pemulihan institusional (src/app/forgot-password/page.tsx)
[x] Halaman utama / merefleksikan status autentikasi aktif dengan opsi logout (src/app/page.tsx)
[x] Playwright Browser QA & screenshot evidence (1440x900, 1024x768, 768x1024, 390x844)
```

## Automated Tests & Verification

```text
[x] Test keamanan password & kebijakan minimal 8 karakter (password.test.ts)
[x] Test token sesi & konfigurasi cookie (session.test.ts)
[x] Test siklus hidup akun pengguna, keunikan username, dan ganti password (identity.test.ts)
[x] Test login kredensial, validasi sesi, lockout, penolakan akun nonaktif, logout, dan remember me (auth-service.test.ts)
[x] Test mitigasi brute force rate limiting (rate-limiter.test.ts)
[x] Regression test seluruh suite database Phase 02 & smoke views (14 files, 51 tests passed)
```

## Quality Gates

```text
[x] format check PASS (Prettier)
[x] lint PASS (ESLint - 0 errors, 0 warnings)
[x] typecheck PASS (TypeScript - 0 errors)
[x] tests PASS (Vitest - 14 test files, 51 tests passed)
[x] build PASS (Next.js 16 Turbopack build)
[x] npm audit PASS (0 vulnerabilities)
[x] git diff --check PASS
```

---

# 3. Explicit Non-Scope Phase 03

Dilarang melakukan implementasi di luar scope Phase 03:

```text
[x] TIDAK membangun Dynamic Permission Engine & RBAC Middleware (Phase 04)
[x] TIDAK membangun Application Shell / Dashboard Navigation / Role-specific Dashboards (Phase 05)
[x] TIDAK membangun CRUD Domain Bisnis Akademik (M06–M21)
```

---

# 4. Phase 03 Exit Criteria

```text
[x] Subsistem Autentikasi & Identitas M02 selesai dan teruji
[x] Seluruh acceptance criteria AC-AUTH-01 s/d AC-AUTH-08 terpenuhi
[x] Quality gates PASS (100%)
[x] Deliverable docs/phases/PHASE-03-AUTHENTICATION-IDENTITY.md tersedia
[x] Human review APPROVED
```

Status akhir:

```text
APPROVED
```

---

# 5. Completed Phase History

```text
PHASE 00 — PROJECT BOOTSTRAP & ENVIRONMENT BASELINE
Status: APPROVED
Approved Commit: 0fe8151 (chore: establish Ruang Pintar project baseline)
Notes: Baseline Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + ESLint + Prettier + Vitest established.

PHASE 01 — PRODUCT & REQUIREMENT LOCK
Status: APPROVED
Approved Commit: daa3ac7 (docs: lock Ruang Pintar product requirements)
Notes: Canonical product definition, 5 base roles, positions/assignments, M01-M21 module inventory, domain invariants, manual scheduling + intelligent conflict detection, BRD->PRD->FRD->AC traceability locked.

PHASE 02 — DATABASE, PERSISTENCE & PLATFORM FOUNDATION
Status: APPROVED
Approved Commit: 3135db0 (feat: establish database persistence and platform foundation) / Final HEAD cc9249f
Notes: SQLite database, Prisma ORM, 26-char ULID, platform foundation models (M01-M05), global config uniqueness, append-oriented audit service boundary, outbox, and private storage adapter established.

PHASE 03 — AUTHENTICATION & IDENTITY
Status: APPROVED
Approved Commit: 1e88e47 (feat: implement authentication and identity)
Notes: M02 identity models, bcrypt password hashing, server-authoritative session store, HttpOnly cookie, rate limiting, must_change_password flow, audit integration, Academic Glass UI login screen, and Playwright browser QA established.
```

---

# 6. Next Planned Phase (Pending Human Activation)

```text
PHASE 04 — AUTHORIZATION & ACCESS CONTROL
```

Status:

```text
NOT ACTIVE
```
