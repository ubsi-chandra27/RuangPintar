# TASKS.md
## Ruang Pintar — Active Implementation Tasks

**Versi:** 1.6
**Current Active Phase:** NONE (Phase 06 Closed, Phase 07 Pending Human Activation)
**Status:** APPROVED & CHECKPOINTED

---

# 1. ACTIVE TASK

```text
PHASE 06 — SCHOOL & ORGANIZATION
```

Tujuan:

> Mengimplementasikan domain School & Organization (M01) mencakup profil sekolah generic (SD/SMP/SMA/SMK/UMUM), unit organisasi hierarkis self-referential dengan aturan History-Preserving, katalog master jabatan kanonikal & kustom snake_case semantik unik per sekolah, alokasi penugasan personil ke jabatan struktural dengan validasi personil aktif, transaksi atomik Prisma, pencatatan append-oriented audit log, antarmuka Academic Glass UI v1.2 berbasis 4 tab, dan otorisasi server-side requirePermission() tanpa penambahan skema/migration baru.

---

# 2. Phase 06 Checklist

## Domain Layer & Validation

```text
[x] Domain types & DTOs (src/modules/school/domain/school-types.ts)
[x] Domain custom error classes (src/modules/school/domain/school-errors.ts)
[x] Zod validation schemas with generic jenjang, safe logo URL, and unique uppercase snake_case position codes (src/modules/school/domain/school-validation.ts)
```

## Infrastructure Layer & Persistence

```text
[x] SchoolRepository with Prisma interactive transactions ($transaction) and recordAuditEvent (src/modules/school/infrastructure/school-repository.ts)
[x] Zero New Migrations (Menggunakan model eksisting Sekolah, UnitOrganisasi, Jabatan, PenugasanJabatan, LogAudit)
```

## Application Services Layer

```text
[x] SchoolProfileService: Get profile & atomic update with audit (src/modules/school/application/school-profile-service.ts)
[x] OrganizationUnitService: Get units, create, update, and history-preserving delete (src/modules/school/application/organization-unit-service.ts)
[x] PositionService: Get positions, create semantic code, update, and history-preserving delete (src/modules/school/application/position-service.ts)
[x] PositionAssignmentService: Get assignments, assign personnel (with active personil invariant check), end assignment (SELESAI), and cancel assignment (DIBATALKAN) (src/modules/school/application/position-assignment-service.ts)
```

## Server Actions & Authorization

```text
[x] Server-side guards requireAuth() & requirePermission("academic.school.manage" / "academic.structure.manage") (src/app/actions/school-actions.ts)
[x] Atomic mutation, single toast feedback payload, and revalidatePath("/sekolah")
```

## Presentation Layer (Academic Glass UI v1.2)

```text
[x] SchoolProfileForm with inline validation & responsive layout (src/modules/school/presentation/school-profile-form.tsx)
[x] OrganizationUnitsView with hierarchy badge, create/edit modal, & destructive confirmation modal (src/modules/school/presentation/organization-units-view.tsx)
[x] PositionsView with canonical badge, scope level, create/edit modal, & destructive delete modal (src/modules/school/presentation/positions-view.tsx)
[x] PositionAssignmentsView with status filter, assign modal, end modal, & cancel modal (src/modules/school/presentation/position-assignments-view.tsx)
[x] SchoolManagementTabs unifying all 4 management areas (src/modules/school/presentation/school-management-tabs.tsx)
[x] /sekolah server page integrated with AcademicShell, PageHeader, Breadcrumb, and Badge (src/app/sekolah/page.tsx)
[x] Role-aware navigation activated for authorized roles in navigation-config.ts (src/shared/components/shell/navigation-config.ts)
```

## Automated Tests & Verification

```text
[x] Test SchoolProfileService (5 tests)
[x] Test OrganizationUnitService with hierarchy & history preservation (6 tests)
[x] Test PositionService with semantic code & history preservation (5 tests)
[x] Test PositionAssignmentService with personil validation & lifecycle (6 tests)
[x] Test Authorization & Access Control Matrix for M01 (9 tests)
[x] Test School Presentation Views & Tabs (5 tests)
[x] Regression test seluruh suite Phase 00–05 (29 test files, 134 tests passed 100%)
```

## Browser QA & Canonical Viewport Screenshots

```text
[x] 1440x900 Desktop Large (01_desktop_large_1440x900_profile.png)
[x] 1024x768 Desktop Standard (02_desktop_standard_1024x768_units.png)
[x] 768x1024 Tablet Portrait (03_tablet_portrait_768x1024_positions.png)
[x] 390x844 Mobile Phone (04_mobile_phone_390x844_assignments.png)
[x] Modal Tambah Unit (05_modal_create_unit.png)
[x] Modal Tambah Jabatan (06_modal_create_position.png)
[x] Modal Tugaskan Personil (07_modal_assign_position.png)
```

## Quality Gates

```text
[x] format check PASS (Prettier)
[x] lint PASS (ESLint - 0 errors, 0 warnings)
[x] typecheck PASS (TypeScript - 0 errors)
[x] tests PASS (Vitest - 29 test files, 134 tests passed)
[x] build PASS (Next.js 16 Turbopack build)
[x] npm audit PASS (0 vulnerabilities)
[x] git diff --check PASS
```

---

# 3. Explicit Non-Scope Phase 06

Dilarang melakukan implementasi di luar scope Phase 06:

```text
[x] TIDAK membuat Tahun Ajaran, Semester, atau Rombel (Ruang lingkup Phase 07)
[x] TIDAK membuat Biodata Siswa atau Enrollment (Ruang lingkup Phase 08)
[x] TIDAK membuat Penugasan Mengajar Guru / Mapel (Ruang lingkup Phase 09)
[x] TIDAK membuat Jadwal Pelajaran (Ruang lingkup Phase 10)
[x] TIDAK membuat migrasi database baru (0 new migrations)
```

---

# 4. Phase 06 Exit Criteria

```text
[x] Domain School & Organization selesai dan teruji secara menyeluruh
[x] 7 screenshot bukti visual pada 4 viewport kanonikal dan modal tersedia
[x] Deliverable docs/phases/PHASE-06-SCHOOL-ORGANIZATION.md tersedia
[x] Quality gates PASS (100%)
[x] Human Review Decision (APPROVED)
```

Status saat ini:

```text
APPROVED — READY FOR CLOSURE & CHECKPOINT
```

---

# 5. Completed Phase History

```text
PHASE 00 — PROJECT BOOTSTRAP & ENVIRONMENT BASELINE
Status: APPROVED
Approved Commit: 0fe8151 (chore: establish Ruang Pintar project baseline)

PHASE 01 — PRODUCT & REQUIREMENT LOCK
Status: APPROVED
Approved Commit: daa3ac7 (docs: lock Ruang Pintar product requirements)

PHASE 02 — DATABASE, PERSISTENCE & PLATFORM FOUNDATION
Status: APPROVED
Approved Commit: 3135db0 (feat: establish database persistence and platform foundation) / Final HEAD cc9249f

PHASE 03 — AUTHENTICATION & IDENTITY
Status: APPROVED
Approved Commit: 1e88e47 (feat: implement authentication and identity) / Final HEAD c7a151b

PHASE 04 — AUTHORIZATION & ACCESS CONTROL
Status: APPROVED
Approved Commit: 5596da8 (feat: establish authorization and access control) / Final HEAD 1f2f61e

PHASE 05 — APPLICATION SHELL & DASHBOARD FRAMEWORK
Status: APPROVED
Approved Commit: 9125a26 (feat: establish application shell and dashboard framework) / Final HEAD 9ff3223

PHASE 06 — SCHOOL & ORGANIZATION
Status: APPROVED & CHECKPOINTED
Approved Commit: b91a23c (feat(phase-06): implement school and organization domain and presentation)
```

---

# 6. Next Planned Phase (Pending Human Review Decision)

```text
PHASE 07 — ACADEMIC PERIOD & STRUCTURE
```

Status:

```text
NOT STARTED
```
