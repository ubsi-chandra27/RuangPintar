# AGENTS.md
## Ruang Pintar — Operating Contract & Navigation Guide untuk AI Coding Agent

| Field | Nilai |
| --- | --- |
| **Project Identity** | Ruang Pintar — School Digital Operating Platform |
| **Product Type** | Application (Modular Monolith SaaS Multi-Tenant) |
| **Current Phase** | PHASE SAAS-04 — MULTI-TENANT FOUNDATION IMPLEMENTATION |
| **Phase Lifecycle Gate** | `TEST` (Stabilization, Regression & Verification Gate) |
| **Status** | `active` |
| **Version** | 2.0 (Fikran Engineering Aligned) |
| **Operating Contract** | `.gemini/config/skills/fikran-engineering/SKILL.md` |

---

# 1. Project Identity & Current Phase

Ruang Pintar adalah:
> **School Digital Operating Platform modular yang menyatukan proses akademik, pembelajaran, administrasi, komunikasi, monitoring, dan layanan sekolah dalam satu ekosistem digital terintegrasi.**

- **Target Pengguna & Peran:** `SUPER_ADMIN`, `SCHOOL_STAFF`, `TEACHER`, `STUDENT`, `GUARDIAN` (dengan posisi kontekstual `HEADMASTER` dan `HOMEROOM_TEACHER`).
- **Fase Aktif Saat Ini:** `PHASE SAAS-04 — MULTI-TENANT FOUNDATION IMPLEMENTATION` (Status: `READY FOR HUMAN REVIEW`).
- **Fokus Fase:** Stabilisasi fondasi SaaS multi-tenant (`KeanggotaanSekolah`, `sekolah_aktif_id`, `TenantEntitlementService`), kepatuhan quality gate, dan audit pencegahan kebocoran data antar-sekolah.

---

# 2. Documentation Map & Subject Responsibility

Repositori menggunakan prinsip **Single Source of Truth** per subjek. Detail lengkap dan resolusi alias dipetakan di [docs/README.md](file:///c:/laragon/www/Ruang-Pintar/docs/README.md):

| Subjek | Sumber Utama Canonical | Status | Tanggung Jawab Subjek |
| --- | --- | :---: | --- |
| **Peta Dokumen & Indeks** | `docs/README.md` | `active` | Indeks master, resolusi alias dokumen, dan aturan siklus dokumentasi. |
| **Visi & Konteks Bisnis** | `docs/BRD.md` | `active` | Alasan platform dibangun, proses operasional sekolah, stakeholder, dan sasaran bisnis. |
| **Kebutuhan & Scope Produk** | `docs/PRD.md` | `active` | Modul fungsional, prioritas, persona/role, journeys, dan batasan release. |
| **Perilaku & Acceptance** | `docs/FRD.md` | `active` | Detail flow, state antarmuka, validasi bisnis, dan kriteria penerimaan fungsional. |
| **Domain & Data Invariants** | `docs/02-DOMAIN-MODEL.md` | `active` | Entitas domain, integritas relasi, dan domain invariants akademik. |
| **Arsitektur Sistem & Modul** | `docs/05-SYSTEM-ARCHITECTURE.md` | `active` | Modular monolith Next.js, batas modul di `src/modules/`, dan runtime. |
| **Keamanan & Otorisasi** | `docs/SECURITY.md` | `active` | STRIDE threat model, klasifikasi data, isolasi tenant, dan matriks otorisasi server-side. |
| **UI/UX & Design System** | `docs/07-UI-UX-DESIGN-SYSTEM.md` | `active` | Academic Glass UI tokens, responsivitas, mobile teaching cockpit, anti-slop rules. |
| **Strategi & Bukti Test** | `docs/TEST_PLAN.md` | `active` | Public seams, test suite Vitest, risk-based TDD, dan evidence regression. |
| **Deployment & Operasional** | `docs/DEPLOY.md` | `active` | Kesiapan runtime, langkah rilis database, smoke checks, dan prosedur rollback. |
| **Spesifikasi Kompleks Aktif** | `docs/specs/active/<feature>.md` | `active` | Spesifikasi perilaku dan acceptance untuk pekerjaan multi-alur yang sedang berjalan. |
| **Rencana Kompleks Aktif** | `docs/plans/active/<feature>.md` | `active` | Urutan task, dependensi, perintah verifikasi, dan rollback pekerjaan aktif. |

---

# 3. Required Reading by Task Type

Sebelum memulai perubahan, baca dokumen sesuai bidang kerja:

1. **Perubahan Produk & Scope:** `AGENTS.md` → `TASKS.md` → `docs/BRD.md` → `docs/PRD.md` → `docs/FRD.md`
2. **Pekerjaan UI, Frontend & Komponen:** `AGENTS.md` → `docs/07-UI-UX-DESIGN-SYSTEM.md` → `.agents/rules/ui-taste-and-antislop.md` → Dokumen Experience Peran terkait
3. **Pekerjaan Backend, Data & Database:** `AGENTS.md` → `docs/02-DOMAIN-MODEL.md` → `prisma/schema.prisma` → `docs/05-SYSTEM-ARCHITECTURE.md`
4. **Keamanan, Auth & Tenant Isolation:** `AGENTS.md` → `docs/SECURITY.md` → `docs/04-ROLE-ACCESS.md` → `docs/adr/ADR-001` s/d `ADR-003`
5. **Testing, QA & Verifikasi:** `AGENTS.md` → `docs/TEST_PLAN.md` → `vitest.config.ts` → `src/test/`
6. **DevOps & Rilis:** `AGENTS.md` → `docs/DEPLOY.md` → `package.json` → `.env.example`

---

# 4. Non-Negotiables (Aturan Baku Tak Terlanggar)

### 4.1. Domain Invariants
Pertahankan invariant domain berikut dalam setiap perubahan:
```text
Student ≠ Enrollment ≠ Rombel Placement
Teacher ≠ Subject ≠ Teaching Assignment
Calendar ≠ Schedule ≠ Actual Class Session
School Attendance ≠ Class Session Attendance
Assessment ≠ Grade ≠ Grade Publication
Missing Grade ≠ Zero Grade
```

### 4.2. Database & Persistence Rules
```text
Bahasa: Bahasa Indonesia & snake_case untuk entitas first-party
Identifier: ULID 26 karakter
Engine: SQLite + Prisma ORM
Immutability: Migrasi yang telah diterapkan bersifat immutable (dilarang rewrite destructive)
```

### 4.3. UI & Experience Rules (Academic Glass UI)
```text
REFERENCE = CONTRACT
Style: Academic Glass UI (Glassmorphism akademik yang jernih, purposeful, anti-slop)
Role-Specific: Setiap peran memiliki cockpit dan dashboard yang unik sesuai konteks tugasnya
Dilarang: Generic dashboard, fake KPI, visual slop tanpa fungsi, redesign tanpa human approval
Craftsmanship: Patuhi Taste Skill (.agents/skills/taste-skill/SKILL.md) dan Anti-Slop Directive (.agents/skills/anti-slop/SKILL.md)
Active Rules: .agents/rules/ui-taste-and-antislop.md
Purpose Test: Setiap elemen visual wajib memiliki tujuan nyata (bukan sekadar hiasan klise AI)
```

### 4.4. Server-Side Authorization & Anti-Data-Leakage
```text
Model Hierarki: Identity → Base Role → Position/Assignment/Relationship → Permission → Resource Scope → Effective Access
Default Deny: Wajib di-resolve server-side di setiap Server Action dan route handler
Tenant Isolation: Seluruh mutasi dan query wajib terikat pada context sekolah_aktif_id actor
Client-Side Trust: Dilarang mempercayai role, tenant_id, timer CBT, atau status bayar dari client
```

### 4.5. Git & Workspace Hygiene
```text
Jangan: force push, git reset --hard, destructive clean, commit/push tanpa instruksi
Selalu: periksa git status dan git diff sebelum checkpoint
```

---

# 5. Lifecycle & Routing

Patuhi siklus gerbang:
```text
PLAN → ARCHITECTURE → BUILD → TEST → DEPLOY
```

### 5.1. Klasifikasi Pekerjaan (Simple vs Complex)
- **Simple Route (Pekerjaan Ringan):** Perubahan terisolasi (copywriting, styling minor, perbaikan bug lokal non-auth, tanpa alur/peran baru). Cukup dengan inline checklist & verifikasi terfokus tanpa memaksa pembuatan spec/plan terpisah.
- **Complex Route (Pekerjaan Kompleks):** Memenuhi salah satu kriteria:
  - Melibatkan 2+ alur atau peran pengguna;
  - Perubahan model data, skema Prisma, atau migrasi database;
  - Perubahan autentikasi, otorisasi, atau batas isolasi multi-tenant;
  - Integrasi eksternal atau memiliki risiko deployment.
  - **Wajib menggunakan pasangan folder:**
    - Buat `docs/specs/active/<feature-slug>.md` (memuat *apa* yang harus benar dan kriteria penerimaan).
    - Buat `docs/plans/active/<feature-slug>.md` (memuat *bagaimana* pekerjaan diurutkan, diverifikasi, dan di-rollback).
    - Jalankan siklus `SPEC → PLAN → IMPLEMENT → REVIEW → VERIFY`.
    - Setelah lolos verifikasi dan disetujui, pindahkan bersama ke `docs/specs/done/` dan `docs/plans/done/`.

### 5.2. Risk-Based TDD
Gunakan loop `RED → GREEN` vertikal saat ada perubahan *observable behavior* yang memiliki risiko regresi signifikan. Jangan memaksakan TDD pada copy atau styling statis.

### 5.3. Stop Gate & Human Approval
- AI boleh menyatakan: `READY FOR HUMAN REVIEW`.
- AI **DILARANG** menetapkan status `APPROVED`, `LOCKED`, atau mengeksekusi `DEPLOY` tanpa otorisasi eksplisit dari Human.
- Jika task aktif selesai: **STOP**. Jangan melompat ke fase/task berikutnya sebelum Human review.

---

# 6. Verification & Definition of Done

Setiap fase atau tugas yang dikerjakan wajib membuktikan kelulusan Quality Gate sebelum mengajukan review:

```bash
npm run typecheck    # Wajib 0 errors (TypeScript 5.8)
npm run lint         # Wajib 0 errors (ESLint 9)
npm run format:check # Wajib 100% clean (Prettier)
npm run test         # Wajib 100% PASS (Vitest suite)
npm run build        # Wajib 100% PASS (Next.js production build)
```

### Laporan Wajib (Setiap Deliverable Minimal Melaporkan):
```text
PHASE / TASK
STATUS
FILES CREATED
FILES MODIFIED
DEPENDENCIES
MIGRATIONS
DOMAIN INVARIANTS CHECK
AUTHORIZATION & TENANT ISOLATION CHECK
UI VISUAL QA
TESTS & EVIDENCE
BUILD VERIFICATION
KNOWN LIMITATIONS & RESIDUAL RISK
GIT STATUS
READY FOR HUMAN REVIEW
```

---

# 7. Conflict Precedence (Hierarki Sumber Kebenaran)

Jika terjadi pertentangan informasi:
```text
1. Instruksi Human terbaru
2. Dokumen Canonical APPROVED / LOCKED (docs/PRD.md, docs/BRD.md, docs/SECURITY.md, docs/02-DOMAIN-MODEL.md)
3. Active Feature Spec & Plan (docs/specs/active/, docs/plans/active/)
4. TASKS.md & MEMORY.md
5. Implementasi kode & test yang telah lulus verifikasi
6. Inferensi AI (AI tidak boleh berspekulasi atau menebak keputusan baru)
```

---

# 8. Canonical Commands

Daftar perintah resmi proyek yang terverifikasi pada runtime:

```bash
# Development Server
npm run dev                  # Menjalankan Next.js dev server pada 0.0.0.0:3000

# Quality Gates & Verification
npm run typecheck            # Pengecekan tipe TypeScript (tsc --noEmit)
npm run lint                 # Linter kode (eslint .)
npm run format:check         # Pengecekan kepatuhan Prettier
npm run format               # Memformat ulang kode dengan Prettier
npm run test                 # Menjalankan seluruh test suite Vitest
npm run test:watch           # Menjalankan test runner dalam mode interaktif watch
npm run build                # Kompilasi produksi Next.js

# Database (Prisma)
npx prisma migrate status    # Memeriksa status migrasi database
npx prisma migrate dev       # Membuat dan menerapkan migrasi lokal
npx prisma migrate deploy    # Menerapkan migrasi pada target produksi
npx prisma generate          # Mengenerate Prisma Client terbaru
npx prisma studio            # Membuka UI web inspector database

# Data Scripts
npm run data:jadwal:check    # Memeriksa data impor jadwal
npm run data:jadwal:import   # Mengimpor jadwal ke database
```

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
