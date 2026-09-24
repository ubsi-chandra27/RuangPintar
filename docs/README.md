# Peta Dokumentasi & Kontrak Sumber Kebenaran
## Ruang Pintar — School Digital Operating Platform

| Field | Nilai |
| --- | --- |
| **Title / Type** | Documentation README / Master Index |
| **Project / Scope** | Ruang Pintar — Seluruh Ekosistem Dokumentasi Platform |
| **Owner** | Core Engineering & Product Architecture Team |
| **Status** | `active` |
| **Last Updated / Version** | 2026-09-24 / v1.0 |
| **Source Responsibility** | Menjadi direktori tunggal, navigasi, resolusi alias, dan peta kepemilikan dokumen proyek |
| **Related Docs** | `AGENTS.md`, `MEMORY.md`, `TASKS.md`, `docs/BRD.md`, `docs/PRD.md`, `docs/FRD.md` |
| **Reviewer / Approver** | Human Project Owner |

---

## 1. Tujuan & Batas Direktori Dokumentasi

Direktori `docs/` ini adalah repositori dokumentasi resmi untuk proyek **Ruang Pintar**. Dokumen di sini membantu pengembang, pengambil keputusan manusia, dan AI coding agent menyepakati visi, arsitektur, domain invariants, kontrol keamanan, rencana pengujian, dan riwayat fase implementasi.

Sesuai standar **Fikran Engineering**:
1. Setiap subjek memiliki **satu sumber utama** (*Single Source of Truth*).
2. Alternatif nama file yang dipisahkan dengan alias diatur secara *mutually exclusive*; tidak boleh ada file baru yang menduplikasi isi subjek yang telah memiliki pemilik resmi.
3. Seluruh dokumen canonical diperbarui *in-place* dan berstatus `active` selama berlaku.
4. Pekerjaan berisiko/kompleks dikelola melalui pasangan `docs/specs/{active,done}/` dan `docs/plans/{active,done}/`.

---

## 2. Document Map & Kepemilikan Sumber Kebenaran

Tabel berikut memetakan seluruh dokumen utama, status operasionalnya, dan kepemilikan subjek:

| Subjek | Sumber Utama Canonical | File Terkait / Alias Pendukung | Status | Tanggung Jawab Subjek |
| --- | --- | --- | :---: | --- |
| **Visi & Konteks Bisnis** | `docs/BRD.md` | `docs/00-PROJECT-BRIEF.md`, `APPLICATION-BLUEPRINT.md` | `active` | Mengapa platform dibangun, model operasional sekolah, stakeholder, dan sasaran bisnis. |
| **Kebutuhan & Scope Produk** | `docs/PRD.md` | `docs/01-PRODUCT-REQUIREMENTS.md`, `docs/PRODUCT-PACKAGING-STRATEGY.md` | `active` | Fitur, prioritas, persona/role, use cases, batasan non-goals, dan modul fungsional. |
| **Perilaku Fungsional & Acceptance** | `docs/FRD.md` | `docs/USER-FLOW-MAP.md`, `docs/TEACHING-SESSION-WORKFLOW.md` | `active` | Alur kerja detail, validasi bisnis, state antarmuka, dan kriteria penerimaan fungsional. |
| **Model Domain & Entity Invariants** | `docs/02-DOMAIN-MODEL.md` | `docs/06-DATA-ARCHITECTURE.md`, `prisma/schema.prisma` | `active` | Entitas domain, relasi, batasan integritas, dan invariant akademik tak terlanggar. |
| **Arsitektur Sistem & Batas Modul** | `docs/05-SYSTEM-ARCHITECTURE.md` | `docs/03-MODULE-MAP.md`, `docs/WORKSPACE-ARCHITECTURE-RECOMMENDATION.md` | `active` | Struktur Modular Monolith Next.js, boundary `src/modules/`, inter-module contracts, dan runtime. |
| **Keamanan, Auth & Proteksi Tenant** | `docs/SECURITY.md` | `docs/04-ROLE-ACCESS.md`, `docs/adr/ADR-001-SAAS-MULTI-TENANT-FOUNDATION.md` | `active` | Model ancaman (STRIDE), klasifikasi data, isolasi multi-tenant, dan matriks otorisasi. |
| **UI/UX & Design System** | `docs/07-UI-UX-DESIGN-SYSTEM.md` | `docs/DESIGN-SYSTEM-MAPPING.md`, `docs/UX-BLUEPRINT.md`, `docs/SCREEN-INVENTORY.md` | `active` | Academic Glass UI tokens, responsivitas, hierarki visual, mobile-first teaching desk, dan anti-slop rules. |
| **Strategi & Rencana Pengujian** | `docs/TEST_PLAN.md` | `vitest.config.ts`, `src/test/`, `docs/phases/` test logs | `active` | Strategi test, public seams, verifikasi quality gate, dan kebijakan risk-based TDD. |
| **Operasi Pengiriman & Rilis** | `docs/DEPLOY.md` | `.env.example`, `scripts/` maintenance runbooks | `active` | Kesiapan runtime, langkah deploy database, smoke checks, dan prosedur rollback. |
| **Keputusan Arsitektur Formal (ADR)** | `docs/adr/` | `ADR-001`, `ADR-002`, `ADR-003` | `active` | Keputusan arsitektur strategis mengenai SaaS multi-tenant, membership, dan entitlement. |
| **Riwayat Implementasi & Phase** | `docs/phases/` | `PHASE-01` s/d `PHASE-23` | `done` | Arsip historis deliverable, migrasi, dan pembuktian quality gate tiap fase milestone. |
| **Pekerjaan Kompleks Aktif (Spec)** | `docs/specs/active/` | — | `active` | Spesifikasi perilaku dan acceptance untuk perubahan kompleks multi-alur yang sedang berjalan. |
| **Rencana Kerja Kompleks Aktif (Plan)** | `docs/plans/active/` | — | `active` | Rencana tugas terurut, perintah verifikasi, dan rollback untuk pekerjaan yang sedang berjalan. |

---

## 3. Resolusi Redundansi Alias

Untuk menghindari kerancuan akibat banyaknya file rujukan historis di repositori, tetapkan aturan resolusi alias berikut:

1. **Kebutuhan Bisnis:** `docs/BRD.md` adalah sumber utama. `00-PROJECT-BRIEF.md` dan `APPLICATION-BLUEPRINT.md` berlaku sebagai konteks historis pelengkap dan tidak boleh bertentangan dengan `BRD.md`.
2. **Kebutuhan Produk:** `docs/PRD.md` adalah sumber utama. `01-PRODUCT-REQUIREMENTS.md` adalah dokumen detail referensi internal awal. Bila terjadi perbedaan, `PRD.md` menjadi penentu.
3. **Data Model & Schema:** `docs/02-DOMAIN-MODEL.md` bersama `prisma/schema.prisma` adalah sumber kebenaran skema data dan relasi domain. `06-DATA-ARCHITECTURE.md` melengkapi aspek strategi persistensi dan migrasi.
4. **Desain Visual:** `docs/07-UI-UX-DESIGN-SYSTEM.md` adalah acuan canonical implementasi Academic Glass UI. Dokumen experience per peran (`TEACHER-...`, `GUARDIAN-EXPERIENCE.md`, dll.) mengatur komposisi antarmuka spesifik peran tersebut.
5. **Keamanan:** `docs/SECURITY.md` adalah acuan payung model ancaman dan matriks otorisasi. `04-ROLE-ACCESS.md` menyediakan rincian implementasi permission engine.

---

## 4. Urutan Baca menurut Tipe Tugas (*Required Reading by Task Type*)

Sebelum memulai pekerjaan teknis, baca dokumen sesuai bidang kerja:

| Tipe Pekerjaan | Dokumen Wajib Dibaca Terlebih Dahulu |
| --- | --- |
| **Fitur Produk / Scope Baru** | `AGENTS.md` → `TASKS.md` → `docs/BRD.md` → `docs/PRD.md` → `docs/FRD.md` |
| **UI, Komponen & Frontend** | `AGENTS.md` → `docs/07-UI-UX-DESIGN-SYSTEM.md` → `.agents/rules/ui-taste-and-antislop.md` → Dokumen Experience Peran terkait |
| **Backend, Data & Database** | `AGENTS.md` → `docs/02-DOMAIN-MODEL.md` → `prisma/schema.prisma` → `docs/05-SYSTEM-ARCHITECTURE.md` |
| **Keamanan, Auth & Tenant Isolation** | `AGENTS.md` → `docs/SECURITY.md` → `docs/04-ROLE-ACCESS.md` → `docs/adr/ADR-001` s/d `ADR-003` |
| **Testing, Verifikasi & QA** | `AGENTS.md` → `docs/TEST_PLAN.md` → `vitest.config.ts` → `src/test/` |
| **DevOps, Rilis & Deployment** | `AGENTS.md` → `docs/DEPLOY.md` → `package.json` → `.env.example` |

---

## 5. Aturan Siklus Dokumen & Pengarsipan

1. **Status Baku:** Dokumen menggunakan status `draft`, `proposed`, `active`, `blocked`, atau `done`. Status `done` mensyaratkan bukti verifikasi nyata (test PASS, build PASS, audit lulus).
2. **In-Place Updates:** Dokumen inti yang terus berlaku (`BRD.md`, `PRD.md`, `SECURITY.md`, `TEST_PLAN.md`, `DEPLOY.md`, `AGENTS.md`) diperbarui langsung di tempat dengan versi termutakhir dan catatan revisi.
3. **Pekerjaan Kompleks (Spesifikasi & Rencana):**
   - Buat `docs/specs/active/<feature-slug>.md` dan `docs/plans/active/<feature-slug>.md`.
   - Jalankan siklus `SPEC → PLAN → IMPLEMENT → REVIEW → VERIFY`.
   - Setelah verifikasi lulus dan bukti disetujui, pindahkan pasangan file secara bersamaan ke `docs/specs/done/<feature-slug>.md` dan `docs/plans/done/<feature-slug>.md`.
4. **Larangan Placeholder Kosong:** Dilarang membuat dokumen atau direktori kosong hanya untuk memenuhi checklist tanpa isi substansial.

---

## 6. Precedensi Konflik

Jika ditemukan pertentangan informasi antar sumber dokumen:
1. Instruksi eksplisit terbaru dari Human Project Owner.
2. Dokumen APPROVED / LOCKED canonical (`docs/PRD.md`, `docs/BRD.md`, `docs/SECURITY.md`, `docs/02-DOMAIN-MODEL.md`).
3. Spesifikasi dan rencana aktif pada `docs/specs/active/` dan `docs/plans/active/`.
4. `TASKS.md` dan `MEMORY.md`.
5. Kode implementasi yang telah lolos pengujian dan disetujui.
6. Inferensi AI (AI tidak boleh mengasumsikan keputusan baru tanpa eskalasi).
