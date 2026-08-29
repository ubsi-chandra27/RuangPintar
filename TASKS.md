# TASKS.md
## Ruang Pintar — Active Implementation Tasks

**Versi:** 1.5
**Current Active Phase:** PHASE 05 — APPLICATION SHELL & DASHBOARD FRAMEWORK
**Status:** APPROVED

---

# 1. ACTIVE TASK

```text
PHASE 05 — APPLICATION SHELL & DASHBOARD FRAMEWORK
```

Tujuan:

> Membangun application shell resmi Ruang Pintar (desktop 240px expanded sidebar, 56px compact rail, 64px topbar, mobile drawer < 768px, breadcrumb, user menu, notification entry point) berbasis Academic Glass UI v1.2, serta dashboard framework role-aware dengan Page Contracts dan empty state yang jujur tanpa data KPI palsu.

---

# 2. Phase 05 Checklist

## UI Primitives & Academic Glass Atoms

```text
[x] Button variants (primary, cobalt, secondary, outline, ghost, destructive, glass) & touch target >= 44px (src/shared/components/ui/button.tsx)
[x] Card variants (solid, glassSoft, glassElevated, statCard) (src/shared/components/ui/card.tsx)
[x] Badge status variants (neutral, info, success, warning, danger, cobalt, academic) (src/shared/components/ui/badge.tsx)
[x] PageHeader primitive (title, description, badge, breadcrumb, actions slot) (src/shared/components/ui/page-header.tsx)
[x] EmptyState primitive jujur & informatif (src/shared/components/ui/empty-state.tsx)
[x] LoadingState & Skeleton primitives (src/shared/components/ui/loading-state.tsx)
```

## Application Shell Components

```text
[x] Role-aware navigation config & filtering function (src/shared/components/shell/navigation-config.ts)
[x] Desktop 240px Expanded Sidebar & 56px Compact Rail with tooltips (src/shared/components/shell/sidebar.tsx)
[x] 64px Topbar with breadcrumb & notification entry point (src/shared/components/shell/topbar.tsx)
[x] Mobile Drawer overlay with focus management & Esc close (src/shared/components/shell/mobile-drawer.tsx)
[x] Accessible Breadcrumb component (src/shared/components/shell/breadcrumb.tsx)
[x] UserMenu component with identity summary & official logout action (src/shared/components/shell/user-menu.tsx)
[x] NotificationEntry component with honest zero-unread state (src/shared/components/shell/notification-entry.tsx)
[x] AcademicShell responsive layout wrapper (src/shared/components/shell/academic-shell.tsx)
```

## Dashboard Primitives & Role Views

```text
[x] StatCard & DashboardGrid layout primitives (src/shared/components/dashboard/)
[x] TeacherDashboard (DASHBOARD-GURU contract) (src/shared/components/dashboard/role-views/teacher-dashboard.tsx)
[x] StudentDashboard (DASHBOARD-SISWA contract) (src/shared/components/dashboard/role-views/student-dashboard.tsx)
[x] GuardianDashboard (DASHBOARD-GUARDIAN contract) (src/shared/components/dashboard/role-views/guardian-dashboard.tsx)
[x] StaffDashboard (DASHBOARD-STAFF contract) with capability bundles (src/shared/components/dashboard/role-views/staff-dashboard.tsx)
[x] SuperAdminDashboard (DASHBOARD-PIMPINAN contract) (src/shared/components/dashboard/role-views/super-admin-dashboard.tsx)
[x] Main /dashboard server page resolving auth & role views (src/app/dashboard/page.tsx)
```

## Automated Tests & Verification

```text
[x] Test Role-Aware Navigation Filtering untuk 5 Base Roles & 4 Capability Bundles (navigation-config.test.ts - 7 tests)
[x] Test Role Dashboard Views & Page Contracts tanpa mock KPI palsu (dashboard-views.test.tsx - 5 tests)
[x] Test AcademicShell responsive layout, sidebar rail toggle, dan user menu (academic-shell.test.tsx - 3 tests)
[x] Regression test seluruh suite Phase 00–04 (23 test files, 98 tests passed 100%)
```

## Browser QA & Canonical Viewport Screenshots

```text
[x] 1440x900 Desktop (phase-05-teacher-1440x900.png, phase-05-compact-rail-1440x900.png)
[x] 1024x768 Laptop (phase-05-teacher-1024x768.png)
[x] 768x1024 Tablet (phase-05-teacher-768x1024.png)
[x] 390x844 Mobile (phase-05-teacher-390x844.png, phase-05-mobile-drawer-390x844.png)
[x] Role Dashboards QA (Staff, Student, Guardian, Super Admin)
```

## Quality Gates

```text
[x] format check PASS (Prettier)
[x] lint PASS (ESLint - 0 errors, 0 warnings)
[x] typecheck PASS (TypeScript - 0 errors)
[x] tests PASS (Vitest - 23 test files, 98 tests passed)
[x] build PASS (Next.js 16 Turbopack build)
[x] npm audit PASS (0 vulnerabilities)
[x] git diff --check PASS
```

---

# 3. Explicit Non-Scope Phase 05

Dilarang melakukan implementasi di luar scope Phase 05:

```text
[x] TIDAK membuat CRUD Organisasi Sekolah (Phase 06)
[x] TIDAK membuat CRUD Kalender/Tahun Ajaran/Semester (Phase 07)
[x] TIDAK membuat CRUD Siswa, Guru, Penugasan Mengajar, atau Jadwal (Phase 08-10)
[x] TIDAK membuat data KPI palsu (seluruh empty state jujur dan informatif)
```

---

# 4. Phase 05 Exit Criteria

```text
[x] Application Shell & Dashboard Framework selesai dan teruji
[x] 10 screenshot bukti visual pada 4 viewport kanonikal tersedia
[x] Deliverable docs/phases/PHASE-05-APPLICATION-SHELL-DASHBOARD-FRAMEWORK.md tersedia
[x] Quality gates PASS (100%)
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
Approved Commit: 5596da8 (feat: establish authorization and access control) / Final HEAD 1f2f61e
Notes: Effective access model (Identity -> Base Role -> Position/Assignment/Relationship -> Permission -> Resource Scope -> Effective Access), 5 base roles, 4 staff capability bundles, position/assignment/guardian contracts, staff capability database persistence (kemampuan_staff), and server-side authorization guards (requirePermission/checkPermission) established.

PHASE 05 — APPLICATION SHELL & DASHBOARD FRAMEWORK
Status: APPROVED
Approved Commit: feat: establish application shell and dashboard framework
Notes: Academic Glass UI v1.2 responsive application shell (240px expanded sidebar, 56px compact rail, 64px topbar, mobile drawer < 768px, breadcrumb, user menu, notification entry point), role-aware navigation filtering for 5 base roles & 4 staff capability bundles, and role-specific dashboard framework (Teacher, Student, Guardian, Staff, Super Admin) with honest empty states established.
```

---

# 6. Next Planned Phase (Pending Human Activation)

```text
PHASE 06 — SCHOOL & ORGANIZATION
```

Status:

```text
NOT ACTIVE
```
