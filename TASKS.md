# TASKS.md
## Ruang Pintar — Active Implementation Tasks

**Versi:** 1.8
**Current Active Phase:** PHASE 08 — STUDENT ACADEMIC LIFECYCLE
**Status:** APPROVED & CHECKPOINTED

---

# 1. ACTIVE TASK

```text
PHASE 08 — STUDENT ACADEMIC LIFECYCLE
```

Tujuan:

> Mengimplementasikan domain M07 Student Academic Lifecycle mencakup Buku Induk Siswa (Identitas Individu), Keikutsertaan Siswa per Periode Akademik (Enrollment), Alokasi Penempatan Rombongan Belajar (Rombel Placement & Bulk Placement), Transisi Siklus Hidup Siswa (Kenaikan Kelas/Promosi, Mutasi Keluar, Kelulusan) dengan proteksi riwayat historis penuh, batas kapasitas rombel, otorisasi server-side capability bundle (`STUDENT_DATA_OPERATOR` & `SUPER_ADMIN`), dan antarmuka Academic Glass UI v1.2 berbasis 3 tab terintegrasi.

---

# 2. Phase 08 Checklist

## Database & Persistence (Forward Migration)

```text
[x] Prisma Schema models: Siswa, KeikutsertaanSiswa, PenempatanRombel
[x] Reverse relations on Sekolah, Pengguna, TahunAjaran, TingkatKelas, Rombel
[x] Forward migration 20260830140000_add_student_academic_lifecycle applied cleanly
[x] Database schema is up to date & immutable applied migrations respected
```

## Domain Layer & Invariants

```text
[x] Student types, StatusAkademikSiswa, StatusKeikutsertaan, StatusPenempatan, DTOs (src/modules/student/domain/student-types.ts)
[x] Domain custom errors with history protection (src/modules/student/domain/student-errors.ts)
[x] Zod validation schemas for all student mutations (src/modules/student/domain/student-validation.ts)
[x] Strict domain invariants: Student Identity ≠ Student Enrollment ≠ Rombel Placement
[x] History Preservation: All movements, promotions, and graduations preserve historical records
[x] Capacity check: Rombel capacity enforced strictly on single and bulk placements
```

## Infrastructure & Application Services

```text
[x] StudentRepository with multi-criteria filtering, joins, & school isolation (src/modules/student/infrastructure/student-repository.ts)
[x] StudentIdentityService: Buku induk CRUD, unique NIS/NISN, auto-enrollment support, history-preserving delete protection (src/modules/student/application/student-identity-service.ts)
[x] StudentEnrollmentService: Multi-period academic enrollment lifecycle (src/modules/student/application/student-enrollment-service.ts)
[x] RombelPlacementService: Placement CRUD, move rombel, bulk placement with capacity verification (src/modules/student/application/rombel-placement-service.ts)
[x] StudentLifecycleService: Atomic orchestration of promotions, graduations, transfers, and complete timeline loader (src/modules/student/application/student-lifecycle-service.ts)
[x] StudentFacade: High performance dataset aggregation for Kesiswaan UI (src/modules/student/application/student-facade.ts)
```

## Server Actions & Authorization

```text
[x] Server-side guards requireAuth() & requirePermission("academic.students.manage") (src/app/actions/student-actions.ts)
[x] Atomic mutations, standardized feedback payloads, and revalidatePath("/data-siswa")
[x] Append-only audit logging (LogAudit) across all student lifecycle transactions
```

## Presentation Layer (Academic Glass UI v1.2)

```text
[x] Route /data-siswa with server-side auth, permission check & 3D hero card (src/app/data-siswa/page.tsx)
[x] StudentManagementTabs with symmetrical 3-tab layout (src/modules/student/presentation/student-management-tabs.tsx)
[x] StudentDirectoryView with search toolbar, status filter, mobile cards, desktop table, modals (src/modules/student/presentation/student-directory-view.tsx)
[x] StudentDetailModal with tabbed views: Identitas Pribadi & Timeline Riwayat Akademik (src/modules/student/presentation/student-detail-modal.tsx)
[x] StudentEnrollmentsView with year selector, promotion modal, status change modal (src/modules/student/presentation/student-enrollments-view.tsx)
[x] StudentPlacementsView with rombel capacity pills, single placement modal, bulk placement modal (src/modules/student/presentation/student-placements-view.tsx)
[x] Activated navigation menu in sidebar (src/shared/components/shell/navigation-config.ts)
```

## Quality Gates & Verification

```text
[x] Format check: All matched files use Prettier code style (npm run format:check)
[x] Lint check: 0 errors, 0 warnings (npm run lint)
[x] Typecheck: TypeScript tsc --noEmit 0 errors (npm run typecheck)
[x] Tests: 42 test files, 208 tests (100% PASS)
[x] Build: Next.js production compilation 100% PASS (npm run build)
[x] Visual QA: 10 screenshots captured across 4 responsive viewports (1440x900, 1024x768, 768x1024, 390x844)
```

---

# 3. Next Tasks (Blocked until Human Activation)

```text
[x] Human Review & Approval of Phase 08 (Student Academic Lifecycle) — APPROVED
[x] Git commit checkpoint for Phase 08 — CHECKPOINTED
[ ] Phase 09 — Staff & Teacher Assignment (Planned / Not Active)
```
