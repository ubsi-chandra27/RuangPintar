# TASKS.md
## Ruang Pintar — Active Implementation Tasks

**Versi:** 1.0  
**Current Active Phase:** PHASE 00  
**Status:** APPROVED  

---

# 1. ACTIVE TASK

```text
PHASE 00 — PROJECT BOOTSTRAP & ENVIRONMENT BASELINE
```

Tujuan:

> Membuat baseline project Next.js yang bersih, reproducible, sehat, dan siap menerima phase berikutnya tanpa membangun fitur bisnis.

---

# 2. Prerequisite

Sebelum coding:

```text
[x] Baca AGENTS.md
[x] Baca MEMORY.md
[x] Baca TASKS.md
[x] Baca docs/BRD.md
[x] Baca docs/PRD.md
[x] Baca docs/FRD.md
[x] Baca docs/00–09
```

---

# 3. Phase 00 Checklist

## Environment

```text
[x] Audit OS
[x] Audit Node.js
[x] Audit npm/package manager
[x] Audit Git
[x] Audit workspace
[x] Audit existing repository
```

## Bootstrap

```text
[x] Next.js stable secure baseline
[x] TypeScript
[x] App Router
[x] Tailwind CSS
[x] import alias
[x] minimal modular project structure
```

## Tooling

```text
[x] ESLint
[x] Formatter
[x] Typecheck script
[x] Test foundation
[x] Build script
[x] .env.example bila diperlukan
[x] .gitignore
```

## Smoke

```text
[x] App dapat dijalankan
[x] Homepage minimum dapat dirender
[x] Tidak ada runtime error obvious
```

## Quality Gate

```text
[x] install PASS
[x] dev/smoke PASS
[x] typecheck PASS
[x] lint PASS
[x] format check PASS
[x] test PASS
[x] production build PASS
```

## Git

```text
[x] Inspect git status
[x] Inspect git diff
[x] Tidak ada incidental files
[x] Checkpoint mengikuti policy Human
```

---

# 4. Explicit Non-Scope Phase 00

Jangan membuat:

```text
[ ] Login final
[ ] Authentication
[ ] Authorization
[ ] Prisma domain schema
[ ] Student
[ ] Teacher
[ ] Academic structure
[ ] Dashboard final
[ ] Application Shell final
[ ] Attendance
[ ] Learning
[ ] Assessment
[ ] Gradebook
[ ] CBT
[ ] Guardian
[ ] Communication
[ ] Reporting
[ ] Integration
[ ] AI feature
```

Checklist di atas adalah **larangan**, bukan pekerjaan.

---

# 5. Phase 00 Exit Criteria

Phase dapat dikirim ke Human Review jika:

```text
[x] Scope sesuai
[x] Technical gates PASS
[x] Tidak ada domain feature leakage
[x] Working tree dipahami
[x] Laporan phase lengkap
```

Status akhir AI:

```text
READY FOR HUMAN REVIEW
```

---

# 6. Do Not Proceed

Setelah Phase 00:

```text
STOP.
```

Jangan mulai Phase 01 tanpa Human Approval.

---

# 7. Next Planned Phase

```text
PHASE 01 — ACADEMIC GLASS UI FOUNDATION
```

Status:

```text
NOT ACTIVE
```

---

# 8. Roadmap Reference

Roadmap lengkap:

```text
docs/08-IMPLEMENTATION-ROADMAP.md
```

---

# 9. AI Rules Reference

Aturan lengkap:

```text
docs/09-AI-CODING-RULES.md
```

---

# 10. Human Review Update Template

Setelah review, Human/agent dapat memperbarui bagian berikut:

```text
PHASE 00 STATUS:
APPROVED

APPROVED COMMIT:
chore: establish Ruang Pintar project baseline

NOTES:
Human Review Approved. Baseline Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + ESLint + Prettier + Vitest established. Quality gates PASS. Phase 01 remains NOT ACTIVE pending next explicit human instructions.
```
