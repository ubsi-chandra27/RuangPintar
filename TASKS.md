# TASKS.md
## Ruang Pintar — Active Implementation Tasks

**Versi:** 1.7  
**Current Active Phase:** PHASE 07 — ACADEMIC PERIOD & STRUCTURE  
**Status:** READY FOR HUMAN REVIEW  

---

# 1. ACTIVE TASK

```text
PHASE 07 — ACADEMIC PERIOD & STRUCTURE
```

Tujuan:

> Mengimplementasikan domain M06 Academic Period & Structure mencakup siklus hidup Tahun Ajaran, Semester operasional, Fase Kurikulum, Tingkat Kelas (Grade Level), Program Keahlian / Jurusan, serta pembentukan Rombongan Belajar (Rombel) dengan kapasitas terikat periode, proteksi histori data, otorisasi server-side capability bundle (`ACADEMIC_OPERATOR` & `SUPER_ADMIN`), dan antarmuka Academic Glass UI v1.2 berbasis 4 tab terintegrasi.

---

# 2. Phase 07 Checklist

## Database & Persistence (Forward Migration)

```text
[x] Prisma Schema models: TahunAjaran, Semester, Fase, TingkatKelas, ProgramKeahlian, Rombel
[x] Forward migration 20260830113500_add_academic_period_and_structure applied cleanly
[x] Database schema is up to date & immutable applied migrations respected
```

## Domain Layer & Invariants

```text
[x] Academic types, StatusPeriode, DTOs (src/modules/academic/domain/academic-types.ts)
[x] Domain custom errors with history protection (src/modules/academic/domain/academic-errors.ts)
[x] Zod validation schemas for all mutations (src/modules/academic/domain/academic-validation.ts)
[x] Strict domain invariants: Academic Year ≠ Semester ≠ Rombel; Grade Level ≠ Phase ≠ Program ≠ Rombel
[x] Rombel definition only (no student enrollment/placement in Phase 07)
```

## Infrastructure & Application Services

```text
[x] AcademicRepository with school scoping & relation joins (src/modules/academic/infrastructure/academic-repository.ts)
[x] AcademicYearService: Create, update, single active period activation, close period, history-preserving delete (src/modules/academic/application/academic-year-service.ts)
[x] SemesterService: Create, update, active semester switch, bound-to-year check, delete (src/modules/academic/application/semester-service.ts)
[x] PhaseGradeService: Phase & Grade Level CRUD, ordering, multi-jenjang flexibility (src/modules/academic/application/phase-grade-service.ts)
[x] ProgramService: Academic program CRUD & optionality (src/modules/academic/application/program-service.ts)
[x] RombelService: Period-aware Rombel CRUD with 1..100 capacity validation (src/modules/academic/application/rombel-service.ts)
[x] AcademicFacade: High performance aggregation for full structure UI (src/modules/academic/application/academic-facade.ts)
```

## Server Actions & Authorization

```text
[x] Server-side guards requireAuth() & requirePermission("academic.structure.manage") (src/app/actions/academic-actions.ts)
[x] Atomic mutation, single toast feedback payload, and revalidatePath("/struktur-akademik")
[x] Audit event logging integrated across all mutation operations
```

## Presentation Layer (Academic Glass UI v1.2)

```text
[x] Route /struktur-akademik with server-side auth & 3D hero card (src/app/struktur-akademik/page.tsx)
[x] AcademicManagementTabs with symmetrical mobile 2x2 grid & desktop flex (src/modules/academic/presentation/academic-management-tabs.tsx)
[x] AcademicYearsView with active context banner, semester cards, modals, pagination (src/modules/academic/presentation/academic-years-view.tsx)
[x] GradeLevelsView with Tingkat vs Fase subtabs, mobile cards, desktop table, modals (src/modules/academic/presentation/grade-levels-view.tsx)
[x] ProgramsView with toolbar, mobile cards, desktop table, modals (src/modules/academic/presentation/programs-view.tsx)
[x] RombelsView with year/grade/program filters, capacity badges, mobile cards, desktop table, modals (src/modules/academic/presentation/rombels-view.tsx)
[x] Activated navigation menu in sidebar (src/shared/components/shell/navigation-config.ts)
```

## Quality Gates & Verification

```text
[x] Format check: All matched files use Prettier code style (npm run format:check)
[x] Lint check: 0 errors, 0 warnings (npm run lint)
[x] Typecheck: TypeScript tsc --noEmit 0 errors (npm run typecheck)
[x] Tests: 36 test files, 180 tests (100% PASS)
[x] Build: Next.js production compilation 100% PASS (npm run build)
[x] Visual QA: 10 screenshots captured across desktop, tablet, and mobile viewports
```

---

# 3. Next Tasks (Blocked until Human Approval)

```text
[ ] Human Review & Approval of Phase 07 (Academic Period & Structure)
[ ] Git commit checkpoint for Phase 07
[ ] Phase 08 — Student Academic Lifecycle (Planned)
```
