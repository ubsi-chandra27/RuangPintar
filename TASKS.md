# TASKS.md
## Ruang Pintar — Active Implementation Tasks

**Versi:** 1.1
**Current Active Phase:** PHASE 01 — PRODUCT & REQUIREMENT LOCK
**Status:** APPROVED

---

# 1. ACTIVE TASK

```text
PHASE 01 — PRODUCT & REQUIREMENT LOCK
```

Tujuan:

> Mengonsolidasikan, menyinkronkan, dan mengunci seluruh definisi produk, personas/aktor, model otorisasi, lingkup modul M01–M21, aturan bisnis domain, keputusan penjadwalan, requirement fungsional, dan matriks ketertelusuran sebelum fase implementasi teknis berikutnya.

---

# 2. Phase 01 Checklist

## Analisis & Audit Dokumen

```text
[x] Audit BRD.md
[x] Audit PRD.md
[x] Audit FRD.md
[x] Audit docs/00 s/d 09
[x] Resolusi & sinkronisasi istilah antar dokumen
```

## Definisi Produk & Aktor

```text
[x] Product statement, value proposition, non-goals terkunci
[x] 5 Base Role resmi dikonfirmasi (SUPER_ADMIN, SCHOOL_STAFF, TEACHER, STUDENT, GUARDIAN)
[x] Position & Assignment dipisahkan secara tegas dari Base Role
[x] Staff capability bundle terdokumentasi
[x] Multi-level readiness (SD, SMP, SMA, SMK) dikonfirmasi
```

## Otorisasi & Lingkup Modul

```text
[x] Role & Access Matrix (Least Privilege, Default Deny, Scoped Access)
[x] Inventarisasi modul M01 s/d M21 (Tujuan, Aktor, Scope V1, Non-scope, Future)
[x] Domain invariants dan business rules terkunci
```

## Keputusan Penjadwalan & FRD

```text
[x] Keputusan Scheduling: Manual scheduling + intelligent conflict detection
[x] Non-scope scheduling: Automatic timetable generator = future enhancement
[x] Functional requirements diperbarui (FR-SCHD-006)
```

## Traceability & Acceptance Criteria

```text
[x] Matriks ketertelusuran: BRD -> PRD -> FRD -> AC
[x] Acceptance criteria testable untuk use case kritis
[x] Deliverable fase dibuat: docs/phases/PHASE-01-PRODUCT-REQUIREMENT-LOCK.md
```

## Quality Gates & Git Verification

```text
[x] format check PASS
[x] lint PASS
[x] typecheck PASS
[x] test PASS
[x] build PASS
[x] git diff --check PASS
```

---

# 3. Explicit Non-Scope Phase 01

Dilarang melakukan implementasi kode pada Phase 01:

```text
[x] TIDAK membuat halaman aplikasi / UI screens
[x] TIDAK membuat komponen React / UI kit components
[x] TIDAK membuat Authentication engine / session logic
[x] TIDAK membuat Authorization middleware / permission engine
[x] TIDAK membuat Prisma domain schema / migration
[x] TIDAK membuat API routes / controllers
[x] TIDAK membuat Automatic timetable generator
```

---

# 4. Phase 01 Exit Criteria

```text
[x] Seluruh requirement kanonikal tersinkronisasi
[x] Technical gates PASS
[x] Tidak ada code feature leakage
[x] Deliverable docs/phases/PHASE-01-PRODUCT-REQUIREMENT-LOCK.md tersedia
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
Approved Commit: docs: lock Ruang Pintar product requirements
Notes: Canonical product definition, 5 base roles, positions/assignments, M01-M21 module inventory, domain invariants, manual scheduling + intelligent conflict detection, BRD->PRD->FRD->AC traceability locked.
```

---

# 6. Next Planned Phase (Pending Human Activation)

```text
PHASE 02 — DATABASE, PERSISTENCE & PLATFORM FOUNDATION (or per roadmap)
```

Status:

```text
NOT ACTIVE
```
