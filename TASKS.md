# TASKS.md
## Ruang Pintar — Active Implementation Tasks

**Versi:** 1.4
**Current Active Phase:** PHASE 04 — AUTHORIZATION & ACCESS CONTROL
**Status:** APPROVED

---

# 1. ACTIVE TASK

```text
PHASE 04 — AUTHORIZATION & ACCESS CONTROL
```

Tujuan:

> Menerapkan subsistem Effective Access Model (M02) formal:
> Identity -> Base Role -> Position/Assignment/Relationship -> Permission -> Resource Scope -> Effective Access
> dengan Default Deny, pemisahan permission dan scope, server-side enforcement, database capability bundle persistence, dan kontrak evaluasi multi-domain.

---

# 2. Phase 04 Checklist

## Authorization Architecture & Types

```text
[x] Definisi tipe kanonikal BaseRole, CapabilityBundle, PositionCode, ResourceScopeType (src/shared/infrastructure/authorization/types.ts)
[x] Kontrak interface evaluasi ITeachingAssignmentContext, IHomeroomAssignmentContext, IPositionAssignmentContext, IGuardianRelationshipContext
[x] Struktur AccessRequest, AccessDecision, ResourceContext, EvaluationContext
```

## Permission Catalog & Capability Bundles

```text
[x] Definisi katalog permission domain.resource.action (src/shared/infrastructure/authorization/permissions.ts)
[x] Pemetaan 4 Capability Bundles untuk SCHOOL_STAFF: SYSTEM_ADMIN, ACADEMIC_OPERATOR, STUDENT_DATA_OPERATOR, REPORT_OPERATOR (capability-bundles.ts)
[x] Pemetaan permission Base Role dan Position Assignment (role-permissions.ts)
```

## Contracts & Effective Access Engine

```text
[x] Kontrak evaluasi assignment, homeroom, jabatan, dan relasi wali (assignment-contracts.ts)
[x] Evaluasi status aktif dan rentang tanggal historis/masa depan
[x] AccessControlEngine dengan 7 tahapan resolusi dan Default Deny (access-control.ts)
```

## Database Persistence & Audit

```text
[x] Model KemampuanStaff pada prisma/schema.prisma
[x] Forward migration 20260829023500_add_staff_capabilities
[x] Layanan StaffCapabilityService dengan audit log keamanan (staff-capability-service.ts)
```

## Server-Side Authorization Guards

```text
[x] Server guard requirePermission() dengan HTTP 403 AuthorizationError dan audit log AUTHZ_ACCESS_DENIED (authz-guard.ts)
[x] Server guard checkPermission() untuk evaluasi kondisional di server
```

## Automated Tests & Verification

```text
[x] Test Default Deny & Isolasi Multi-Sekolah (default-deny.test.ts - 4 tests)
[x] Test Semantik 5 Base Roles & Siswa Self-Scope (base-roles.test.ts - 4 tests)
[x] Test Isolasi Permission Capability Bundles Staf (capability-bundles.test.ts - 4 tests)
[x] Test Kontrak Assignment Guru, Wali Kelas, Kepala Sekolah, dan Wali Siswa (assignment-contracts.test.ts - 12 tests)
[x] Test Database Persistence & Audit StaffCapabilityService (staff-capability-service.test.ts - 4 tests)
[x] Test Server-Side Authorization Guards (authz-guard.test.ts - 4 tests)
[x] Regression test seluruh test suite Phase 00–03 (20 files, 83 tests passed 100%)
```

## Quality Gates

```text
[x] format check PASS (Prettier)
[x] lint PASS (ESLint - 0 errors, 0 warnings)
[x] typecheck PASS (TypeScript - 0 errors)
[x] tests PASS (Vitest - 20 test files, 83 tests passed)
[x] build PASS (Next.js 16 Turbopack build)
[x] npm audit PASS (0 vulnerabilities)
[x] git diff --check PASS
```

---

# 3. Explicit Non-Scope Phase 04

Dilarang melakukan implementasi di luar scope Phase 04:

```text
[x] TIDAK membangun Application Shell, Sidebar Navigasi, atau Dashboard Berbasis Role (Phase 05)
[x] TIDAK membuat tabel domain bisnis M01, M08, M15 secara prematur (mematuhi ROADMAP-RULE-006 & MOD-RULE-009)
[x] TIDAK mengubah desain atau implementasi Login Phase 03
```

---

# 4. Phase 04 Exit Criteria

```text
[x] Subsistem Otorisasi M02 selesai dan teruji
[x] Seluruh kriteria penerimaan AC-AUTHZ-01 s/d AC-AUTHZ-15 terpenuhi
[x] Quality gates PASS (100%)
[x] Deliverable docs/phases/PHASE-04-AUTHORIZATION-ACCESS-CONTROL.md tersedia
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
Approved Commit: 1e88e47 (feat: implement authentication and identity) / Final HEAD c7a151b
Notes: M02 identity models, bcrypt password hashing, server-authoritative session store, HttpOnly cookie, rate limiting, must_change_password flow, audit integration, Academic Glass UI login screen, and Playwright browser QA established.

PHASE 04 — AUTHORIZATION & ACCESS CONTROL
Status: APPROVED
Approved Commit: 5596da8 (feat: establish authorization and access control)
Notes: Effective access model (Identity -> Base Role -> Position/Assignment/Relationship -> Permission -> Resource Scope -> Effective Access), 5 base roles, 4 staff capability bundles, position/assignment/guardian contracts, staff capability database persistence (kemampuan_staff), and server-side authorization guards (requirePermission/checkPermission) established.
```

---

# 6. Next Planned Phase (Pending Human Activation)

```text
PHASE 05 — APPLICATION SHELL & DASHBOARD FRAMEWORK
```

Status:

```text
NOT ACTIVE
```
