# AGENTS.md
## Ruang Pintar — Entry Point untuk AI Coding Agent

**Versi:** 1.0  
**Status:** BASELINE OPERASIONAL  

---

# 1. Baca Ini Terlebih Dahulu

Anda sedang bekerja pada proyek:

```text
Ruang Pintar
```

Sebelum melakukan coding:

```text
1. Baca AGENTS.md
2. Baca MEMORY.md
3. Baca TASKS.md
4. Baca docs/BRD.md
5. Baca docs/PRD.md
6. Baca docs/FRD.md
7. Baca docs/00–09 yang relevan
8. Identifikasi ACTIVE PHASE
9. Kerjakan hanya ACTIVE PHASE
10. Berhenti pada READY FOR HUMAN REVIEW
```

---

# 2. Bahasa

Gunakan Bahasa Indonesia untuk:

- laporan;
- dokumentasi `.md`;
- catatan phase;
- penjelasan;
- prompt internal.

Pertahankan istilah teknis/framework bila lebih tepat.

---

# 3. Baseline Teknis

```text
Architecture:
Modular Monolith

Framework:
Next.js stable secure release

Language:
TypeScript

Runtime:
Node.js

Styling:
Tailwind CSS

UI:
shadcn/ui + Base UI
Academic Glass UI

Database:
SQLite

ORM:
Prisma ORM

Identifier:
ULID 26 karakter

Deployment:
Single-school-per-deployment
```

---

# 4. Baseline Produk

Produk:

> School Digital Operating Platform modular untuk aktivitas digital sekolah.

Base role:

```text
SUPER_ADMIN
SCHOOL_STAFF
TEACHER
STUDENT
GUARDIAN
```

---

# 5. Source of Truth

Urutan:

```text
1. Instruksi Human terbaru
2. Dokumen APPROVED / LOCKED
3. TASKS.md
4. MEMORY.md
5. Existing implementation yang APPROVED
6. AI inference
```

Jika ada konflik, jangan menebak.

---

# 6. Rule Paling Penting

```text
SATU PHASE AKTIF.
```

Dilarang mengerjakan phase berikutnya.

Dilarang scope creep.

Dilarang opportunistic feature.

---

# 7. Human Approval

AI boleh mengatakan:

```text
READY FOR HUMAN REVIEW
```

AI tidak boleh menetapkan:

```text
APPROVED
LOCKED
```

tanpa keputusan Human.

---

# 8. UI Rule

```text
REFERENCE = CONTRACT
```

Academic Glass UI wajib.

Dashboard role-specific.

Dilarang generic dashboard.

Dilarang fake KPI.

Dilarang redesign tanpa approval.

---

# 9. Domain Rule

Pertahankan invariant:

```text
Student ≠ Enrollment ≠ Rombel Placement

Teacher ≠ Subject ≠ Teaching Assignment

Calendar ≠ Schedule ≠ Actual Class Session

School Attendance ≠ Class Session Attendance

Assessment ≠ Grade ≠ Grade Publication

Missing Grade ≠ Zero Grade
```

---

# 10. Authorization Rule

Authorization harus server-side.

Model:

```text
Identity
↓
Base Role
↓
Position / Assignment / Relationship
↓
Permission
↓
Resource Scope
↓
Effective Access
```

Default deny.

---

# 11. Database Rule

Database first-party menggunakan:

```text
Bahasa Indonesia
snake_case
```

Baseline database:

```text
SQLite
Prisma
ULID
```

Applied migration dianggap immutable.

---

# 12. Git Rule

Jangan:

- force push;
- reset hard;
- destructive clean;
- rewrite history;
- push tanpa instruksi.

Selalu inspect:

```text
git status
git diff
```

sebelum checkpoint.

---

# 13. Quality Gate

Sesuai phase, buktikan:

```text
typecheck
lint
format
test
build
migration
authorization
responsive
accessibility
visual review
```

Build PASS tidak sama dengan phase approved.

---

# 14. Laporan Wajib

Setiap phase minimal melaporkan:

```text
PHASE
STATUS
FILES CREATED
FILES MODIFIED
DEPENDENCIES
MIGRATIONS
DOMAIN
AUTHORIZATION
UI
TESTS
BUILD
VISUAL QA
KNOWN LIMITATIONS
OUT-OF-SCOPE CONFIRMATION
GIT STATUS
READY FOR HUMAN REVIEW
```

---

# 15. Dokumen Lengkap Aturan AI

Baca:

```text
docs/09-AI-CODING-RULES.md
```

Dokumen ini hanya entry point.

---

# 16. Stop

Jika task aktif selesai:

```text
STOP
```

Jangan mulai task berikutnya sebelum Human review.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
