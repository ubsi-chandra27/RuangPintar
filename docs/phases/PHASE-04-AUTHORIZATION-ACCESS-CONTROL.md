# PHASE 04 — AUTHORIZATION & ACCESS CONTROL
## Ruang Pintar — Canonical Specification & Deliverable Report

**Versi:** 1.0
**Status:** APPROVED
**Active Phase:** PHASE 04 — AUTHORIZATION & ACCESS CONTROL
**Starting Baseline:** `c7a151bbedc9d041f83d609b34fb41521f553c29` (Implementation Checkpoint: `1e88e47329f64b5cb31b3aa026f8847d52e91770`)
**Dokumen Induk:**
- `docs/04-ROLE-ACCESS.md`
- `docs/05-SYSTEM-ARCHITECTURE.md`
- `docs/06-DATA-ARCHITECTURE.md`
- `docs/08-IMPLEMENTATION-ROADMAP.md` (Section 13)
- `docs/09-AI-CODING-RULES.md`
- `docs/FRD.md` (FR-AUTHZ-001 s/d FR-AUTHZ-007)
- `docs/phases/PHASE-03-AUTHENTICATION-IDENTITY.md`

---

# 1. Tujuan & Ruang Lingkup Phase 04

Phase 04 mengimplementasikan subsistem **Authorization & Access Control (M02)** dengan menerapkan **Effective Access Model** formal:

```text
IDENTITY
   ↓
BASE ROLE
   ↓
POSITION / ASSIGNMENT / RELATIONSHIP
   ↓
PERMISSION
   ↓
RESOURCE SCOPE
   ↓
EFFECTIVE ACCESS
```

Prinsip fundamental:
1. **Default Deny:** Hak akses yang tidak dapat dibuktikan secara sah menghasilkan keputusan **DENY**.
2. **Server-Side Enforcement:** Seluruh pemeriksaan hak akses sensitif dievaluasi di sisi server (Server Guards, Server Actions, Services).
3. **Pemisahan Permission & Resource Scope:** Memiliki permission tidak otomatis memberikan akses ke seluruh resource sekolah.
4. **Least Privilege:** Setiap aktor hanya memperoleh kewenangan minimum yang diperlukan untuk perannya.
5. **No Cross-Phase Schema (ROADMAP-RULE-006):** M02 menghitung effective access menggunakan kontrak interface TypeScript (`ITeachingAssignmentContext`, `IHomeroomAssignmentContext`, `IPositionAssignmentContext`, `IGuardianRelationshipContext`) tanpa membuat tabel database bisnis prematur sebelum fase domain pemiliknya aktif (M01, M08, M15).

---

# 2. Traceability Requirement Fungsional (FR-AUTHZ-001 s/d FR-AUTHZ-007)

| Kode FR | Deskripsi Requirement Kanonikal | Implementasi Solusi | Bukti Pengujian | Status |
|---|---|---|---|---|
| **FR-AUTHZ-001** | Semua action sensitif diperiksa server-side. | `requirePermission()` & `checkPermission()` pada `src/shared/infrastructure/authorization/authz-guard.ts` mengeksekusi evaluasi server-side dan melempar `AuthorizationError` (403). | `src/test/authorization/authz-guard.test.ts` | **PASS** |
| **FR-AUTHZ-002** | Effective access mengikuti alur hierarkis 6 tingkat. | `AccessControlEngine.evaluate()` pada `src/shared/infrastructure/authorization/access-control.ts` mengevaluasi identitas, role, capability/position, permission, dan resource scope. | `src/test/authorization/base-roles.test.ts` & `assignment-contracts.test.ts` | **PASS** |
| **FR-AUTHZ-003** | Jika akses tidak dapat dibuktikan: DENY. | Default Deny diterapkan pada seluruh titik keputusan: unknown permission, inactive account, scope mismatch, missing context, expired period, cross-school mismatch. | `src/test/authorization/default-deny.test.ts` | **PASS** |
| **FR-AUTHZ-004** | UI hiding bukan authorization. | Server guard tidak mempercayai input klien dan memverifikasi token sesi terautentikasi serta database capability secara independen. | `src/test/authorization/authz-guard.test.ts` | **PASS** |
| **FR-AUTHZ-005** | Teacher tidak otomatis memiliki akses seluruh kelas. | Aksi kelas/mapel guru (`assessment.grades.manage`, `attendance.session.record`) wajib diverifikasi terhadap `ITeachingAssignmentContext` aktif. Akses ke kelas lain ditolak. | `src/test/authorization/assignment-contracts.test.ts` | **PASS** |
| **FR-AUTHZ-006** | Guardian tidak memperoleh akses siswa tanpa verified relationship. | Akses data siswa (`attendance.session.view`, `assessment.grades.view`) oleh GUARDIAN wajib melalui `IGuardianRelationshipContext` aktif dengan `verified: true`. | `src/test/authorization/assignment-contracts.test.ts` | **PASS** |
| **FR-AUTHZ-007** | Leadership role tidak otomatis menjadi system admin. | `HEADMASTER`, `VICE_PRINCIPAL`, dan `PROGRAM_HEAD` memperoleh permission monitoring/management sesuai jabatannya, tetapi dilarang mengakses konfigurasi sistem atau bypass penilaian guru. | `src/test/authorization/assignment-contracts.test.ts` | **PASS** |

---

# 3. Model Base Role (5 Base Roles)

Sesuai `docs/04-ROLE-ACCESS.md` Section 4:

1. **SUPER_ADMIN:** Aktor administrasi platform tingkat tertinggi. Digunakan untuk bootstrap sekolah, konfigurasi platform global, dan pemeliharaan teknis.
2. **SCHOOL_STAFF:** Tenaga kependidikan atau staf operasional sekolah. Memiliki baseline hak baca umum; hak administratif diperoleh secara modular melalui **Capability Bundles**.
3. **TEACHER:** Pendidik. Hak operasional mengajar, presensi, dan penilaian berasal dari Teaching Assignment aktif.
4. **STUDENT:** Peserta didik. Hak akses dibatasi ketat pada **STUDENT_SELF scope** (hanya data milik diri sendiri).
5. **GUARDIAN:** Orang tua/wali siswa. Hak akses dibatasi pada anak yang memiliki relasi resmi terverifikasi (**GUARDIAN_RELATIONSHIP scope**).

---

# 4. Model Capability Bundle untuk SCHOOL_STAFF

Sesuai `docs/04-ROLE-ACCESS.md` Section 6.2:

```text
SCHOOL_STAFF + CAPABILITY BUNDLE → PERMISSION SET
```

1. **`SYSTEM_ADMIN`:**
   - Permissions: `system.config.view`, `system.config.manage`, `system.audit.view`, `system.backup.manage`, `system.staff_capabilities.manage`, `report.school.view`, `report.export`.
   - Batasan: Tidak dapat memodifikasi struktur akademik kurikulum atau mengedit nilai siswa.
2. **`ACADEMIC_OPERATOR`:**
   - Permissions: `academic.structure.view/manage`, `academic.calendar.view/manage`, `academic.classes.view/manage`, `academic.teachers.view/manage`, `academic.teaching_assignments.view/manage`, `schedule.master.view/manage/publish`, `report.academic.view`.
   - Batasan: Tidak dapat mengelola konfigurasi sistem atau mengubah audit log.
3. **`STUDENT_DATA_OPERATOR`:**
   - Permissions: `academic.students.view/manage`, `academic.classes.view`, `attendance.school.view`, `monitoring.student.view`, `communication.announcement.view/manage`, `report.attendance.view`.
   - Batasan: Tidak dapat mempublikasikan nilai atau mengelola jadwal master.
4. **`REPORT_OPERATOR`:**
   - Permissions: `report.school.view`, `report.academic.view`, `report.attendance.view`, `report.export`, `attendance.school.view`.
   - Batasan: Hak baca dan ekspor analitik sekolah tanpa kewenangan mutasi data master.

---

# 5. Kontrak Assignment, Position & Relationship

M02 mendefinisikan kontrak evaluasi independen:

1. **`ITeachingAssignmentContext`:**
   - Memvalidasi kewenangan guru terhadap pasangan `rombel_id` dan `subject_id` tertentu pada rentang `valid_from` s/d `valid_until`.
2. **`IHomeroomAssignmentContext`:**
   - Memvalidasi kewenangan wali kelas terhadap `rombel_id` tertentu untuk monitoring kelas dan rekap absensi.
3. **`IPositionAssignmentContext`:**
   - Memvalidasi jabatan struktural (`HEADMASTER`, `VICE_PRINCIPAL_CURRICULUM`, `VICE_PRINCIPAL_STUDENT_AFFAIRS`, `PROGRAM_HEAD`) pada unit/program kerja tertentu.
4. **`IGuardianRelationshipContext`:**
   - Memvalidasi relasi orang tua/wali terhadap `student_id` dengan status verifikasi resmi (`verified: true`).

---

# 6. Perubahan Database & Migrasi Skema

Forward migration: `prisma/migrations/20260829023500_add_staff_capabilities/migration.sql`

```prisma
/// M02 — Identity & Access: Penugasan capability bundle untuk SCHOOL_STAFF
model KemampuanStaff {
  id              String    @id
  pengguna_id     String
  kode_kemampuan  String    // SYSTEM_ADMIN | ACADEMIC_OPERATOR | STUDENT_DATA_OPERATOR | REPORT_OPERATOR
  created_at      DateTime  @default(now())

  pengguna        Pengguna  @relation(fields: [pengguna_id], references: [id], onDelete: Cascade)

  @@unique([pengguna_id, kode_kemampuan])
  @@index([kode_kemampuan])
  @@map("kemampuan_staff")
}
```

- Migrasi Phase 02 (`20260829012117_init_platform_foundation`): **TIDAK BERUBAH / IMMUTABLE**
- Migrasi Phase 03 (`20260829020149_add_identity_and_authentication`): **TIDAK BERUBAH / IMMUTABLE**

---

# 7. Audit Log Keamanan Otorisasi (M05 Integration)

Aksi otorisasi sensitif dicatat ke tabel `log_audit` melalui `recordAuditEvent`:
1. `AUTHZ_STAFF_CAPABILITY_ASSIGNED` — Penugasan bundle staf baru.
2. `AUTHZ_STAFF_CAPABILITY_REVOKED` — Pencabutan bundle staf.
3. `AUTHZ_ACCESS_DENIED` — Penolakan akses oleh server guard pada aksi sensitif.

---

# 8. Matriks Hasil Pengujian Otomatis

Total Test Files: **20 passed (100%)**
Total Tests: **83 passed (100%)**

### Suite Otorisasi Phase 04 (New Tests):
1. `src/test/authorization/default-deny.test.ts` (4 tests) — PASS
   - Unknown permission rejection
   - Inactive account (NONAKTIF/TERKUNCI) rejection
   - Cross-school resource access rejection
   - Missing assignment rejection
2. `src/test/authorization/base-roles.test.ts` (4 tests) — PASS
   - SUPER_ADMIN platform global access
   - SCHOOL_STAFF without capabilities restricted from admin actions
   - STUDENT self-scope enforcement vs other students
   - GUARDIAN unverified relationship denial
3. `src/test/authorization/capability-bundles.test.ts` (4 tests) — PASS
   - SYSTEM_ADMIN permissions isolation
   - ACADEMIC_OPERATOR permissions isolation
   - STUDENT_DATA_OPERATOR permissions isolation
   - Additive multi-bundle combination without privilege escalation
4. `src/test/authorization/assignment-contracts.test.ts` (12 tests) — PASS
   - Teacher assigned class/subject: ALLOW
   - Teacher wrong class: DENY
   - Teacher expired assignment: DENY
   - Teacher future assignment: DENY
   - Homeroom assigned rombel: ALLOW
   - Homeroom wrong rombel: DENY
   - HEADMASTER school monitoring view: ALLOW
   - HEADMASTER system config bypass: DENY
   - PROGRAM_HEAD program-scoped: ALLOW vs other program: DENY
   - Guardian verified child: ALLOW
   - Guardian unverified relationship: DENY
   - Guardian different student: DENY
5. `src/test/authorization/staff-capability-service.test.ts` (4 tests) — PASS
   - Database persistence & audit logging for capability assignment
   - Additive multi-bundle assignment
   - Capability revocation & audit trail
   - Rejection when assigning capability to non-staff user
6. `src/test/authorization/authz-guard.test.ts` (4 tests) — PASS
   - `requirePermission` succeeds for authorized user
   - `requirePermission` throws `AuthorizationError` (403) and logs audit event
   - `checkPermission` returns boolean accurately for assigned/unassigned bundles
   - `checkPermission` returns false for unauthenticated requests

### Regression Suite Phase 00–03 (Existing Tests):
- 14 test files (Identity, Authentication, Rate Limiter, Password, Session, Prisma Models, Pragmas, Transactions, Audit, Outbox, Storage, Config, Smoke views) — **49/49 passed (100%)**.

---

# 9. Quality Gates Verification

- **`npm run format:check`**: PASS (*All matched files use Prettier code style!*)
- **`npm run lint`**: PASS (*0 errors, 0 warnings*)
- **`npm run typecheck`**: PASS (*tsc --noEmit exit code 0*)
- **`npm run test`**: PASS (*83/83 tests passed across 20 test files*)
- **`npm run build`**: PASS (*Next.js 16 Turbopack production build with static and dynamic routes*)
- **`npm audit`**: PASS (*found 0 vulnerabilities*)
- **`git diff --check`**: PASS (*Clean, no whitespace issues*)

---

# 10. Explicit Non-Scope & Phase Boundary

1. **TIDAK membangun Application Shell, Navigation Sidebar, atau Role-specific Dashboard** (Lingkup resmi Phase 05).
2. **TIDAK membuat tabel database domain bisnis M01 (School Organization), M08 (Teacher Assignments), atau M15 (Guardian Relations)** sebelum fasenya aktif (mematuhi `ROADMAP-RULE-006` & `MOD-RULE-009`).
3. **TIDAK mengubah desain tampilan atau halaman login Phase 03**.

---

# 11. Kesiapan Handoff menuju Phase 05

Phase 04 menyediakan:
- `requirePermission()` dan `checkPermission()` server helpers untuk server components dan server actions.
- `AccessControlEngine` untuk evaluasi deterministik hak akses aktor.
- Model `KemampuanStaff` dan service `StaffCapabilityService` untuk staf sekolah.
- Kontrak evaluasi untuk hak akses Guru, Wali Kelas, Kepala Sekolah, Siswa, dan Orang Tua.

**Status Akhir:** `APPROVED`
