# TASKS.md
## Ruang Pintar — Active Implementation Tasks

**Versi:** 1.2
**Current Active Phase:** PHASE 02 — DATABASE, PERSISTENCE & PLATFORM FOUNDATION
**Status:** APPROVED

---

# 1. ACTIVE TASK

```text
PHASE 02 — DATABASE, PERSISTENCE & PLATFORM FOUNDATION
```

Tujuan:

> Mengaktifkan baseline arsitektur data, database SQLite lokal persisten dengan Prisma ORM, standardisasi ULID 26 karakter, model data platform fondasi (M01–M05), transactional outbox, append-only audit logger, abstraksi penyimpanan berkas privat, serta isolasi pengujian otomatis.

---

# 2. Phase 02 Checklist

## Database & Persistence Setup

```text
[x] Prisma ORM terkonfigurasi untuk SQLite (prisma/schema.prisma)
[x] Konfigurasi PRAGMA SQLite (foreign_keys, journal_mode WAL, synchronous FULL, busy_timeout)
[x] Migrasi awal Prisma Migrate (20260829012117_init_platform_foundation)
[x] Singleton PrismaClient aman untuk Next.js runtime (src/shared/infrastructure/database/prisma.ts)
```

## Primary Identifier & Shared Utilities

```text
[x] ULID 26 karakter generator & validator (src/shared/lib/ulid.ts)
[x] Monotonic ULID generation support
[x] Transaction & Unit of Work helper (src/shared/infrastructure/database/transaction.ts)
```

## Platform & Foundation Services

```text
[x] Model data platform fondasi M01 (sekolah, unit_organisasi, jabatan, penugasan_jabatan)
[x] Model data konfigurasi sistem M03 (konfigurasi_sistem & ConfigurationService)
[x] Database partial unique index untuk konfigurasi global (sekolah_id IS NULL + kunci)
[x] Model data metadata berkas & storage M04 (metadata_berkas & LocalStorageAdapter)
[x] Model data log audit M05 (log_audit & Application-Level Append-Oriented AuditLogger)
[x] Model data transactional outbox (outbox_pesan & OutboxService)
```

## Automated Tests & Verification

```text
[x] Test ULID generator & format validation (ulid.test.ts)
[x] Test SQLite pragmas & foreign key enforcement (sqlite-pragmas.test.ts)
[x] Test Prisma foundation CRUD, constraints, relations, and negative tests (prisma-foundation.test.ts)
[x] Test Transaction commit & rollback (transaction.test.ts)
[x] Test Audit Logger append-only contract (audit.test.ts)
[x] Test Transactional Outbox lifecycle (outbox.test.ts)
[x] Test Local Storage Adapter save, read, checksum, delete (local-storage.test.ts)
[x] Test Configuration Service global/school overrides & DB partial unique index (configuration.test.ts)
[x] Regression smoke test (smoke.test.tsx)
```

## Quality Gates

```text
[x] format check PASS (Prettier)
[x] lint PASS (ESLint - 0 errors, 0 warnings)
[x] typecheck PASS (TypeScript - 0 errors)
[x] tests PASS (Vitest - 9 test files, 31 tests passed)
[x] build PASS (Next.js 16 Turbopack build static routes)
[x] npm audit PASS (0 vulnerabilities)
[x] git diff --check PASS
```

---

# 3. Explicit Non-Scope Phase 02

Dilarang melakukan implementasi di luar scope Phase 02:

```text
[x] TIDAK membuat skema domain bisnis M06–M21 (Siswa, Guru, Penugasan Mengajar, Jadwal, Nilai, dll)
[x] TIDAK membuat halaman autentikasi / session login UI (Phase 03)
[x] TIDAK membuat authorization engine / RBAC middleware (Phase 04)
[x] TIDAK membuat dashboard aplikasi / UI screens (Phase 05)
```

---

# 4. Phase 02 Exit Criteria

```text
[x] Fondasi data SQLite, Prisma ORM, ULID, Outbox, Audit, Storage selesai
[x] Seluruh acceptance criteria AC-01 s/d AC-06 terpenuhi
[x] Quality gates PASS (100%)
[x] Deliverable docs/phases/PHASE-02-DATABASE-PERSISTENCE-PLATFORM-FOUNDATION.md tersedia
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
Approved Commit: 3135db0 (feat: establish database persistence and platform foundation)
Notes: SQLite database, Prisma ORM, 26-char ULID, platform foundation models (M01-M05), global config uniqueness, append-oriented audit service boundary, outbox, and private storage adapter established.
```

---

# 6. Next Planned Phase (Pending Human Activation)

```text
PHASE 03 — AUTHENTICATION & IDENTITY
```

Status:

```text
NOT ACTIVE
```
