# Strategi & Rencana Pengujian Sistem
## Ruang Pintar — School Digital Operating Platform

| Field | Nilai |
| --- | --- |
| **Title / Type** | Test Strategy & Verification Evidence Plan |
| **Project / Scope** | Ruang Pintar — Seluruh Lapisan Pengujian Otomatis dan Quality Gates |
| **Owner** | QA & Core Engineering Team |
| **Status** | `active` |
| **Last Updated / Version** | 2026-09-24 / v1.0 |
| **Source Responsibility** | Menetapkan strategi pengujian, public seams, level test, eksekusi test suite, dan bukti verifikasi kualitas platform |
| **Related Docs** | `vitest.config.ts`, `package.json`, `docs/SECURITY.md`, `TASKS.md`, `AGENTS.md` |
| **Reviewer / Approver** | Human Project Owner / QA Lead |

---

## 1. Scope, Risiko & Strategi Pengujian

Ruang Pintar menggunakan pendekatan **Risk-Based Testing** yang berfokus pada *observable behavior*, pencegahan regresi data, dan integritas multi-tenant. Pengujian difokuskan pada komponen-komponen berisiko tinggi:

1. **Integritas Domain Invariants:** Memastikan aturan domain (misalnya *Missing Grade ≠ Zero Grade*, *Teacher ≠ Subject ≠ Assignment*, *School Attendance ≠ Session Attendance*) tidak dapat dilanggar oleh antarmuka maupun API.
2. **Isolasi Tenant & Keamanan Otorisasi:** Memastikan query database tidak mengalami kebocoran data antar-sekolah (*cross-tenant leak*) dan pengguna non-otoritas ditolak secara *default deny*.
3. **Komputasi CBT & Nilai Akademik:** Memastikan timer server-authoritative, kalkulasi bobot penilaian, dan pembulatan nilai rapor akurat secara matematis.
4. **Resiliensi Alur Pengguna Multi-Peran:** Memastikan flow esensial untuk 5 peran (Super Admin, Staf Sekolah, Guru, Siswa, Wali) berfungsi tanpa hambatan.

---

## 2. Public Seams & Level Pengujian

Pengujian dibagi ke dalam 4 tingkatan (*Test Levels*) pada batas-batas publik (*Public Seams*) yang disepakati:

```text
[ Level 4: E2E & Flow Visual Walkthrough (Playwright / Puppeteer Scripts) ]
                          ▲
[ Level 3: React Component & Application Shell Tests (Testing Library + JSDOM) ]
                          ▲
[ Level 2: Server Actions & Application Service Integration Tests (Prisma Mock / SQLite Test DB) ]
                          ▲
[ Level 1: Domain Entities, Business Invariants & Pure Logic Unit Tests ]
```

### Definisi Seam Publik:
- **Domain Seam:** Fungsi murni dan validasi entitas di `src/modules/*/domain/`.
- **Application Service Seam:** Method-method publik pada service di `src/modules/*/application/` (misalnya `TenantMembershipService`, `TenantEntitlementService`, `PenilaianService`).
- **Server Action Seam:** Entry point Server Actions di `src/app/actions/` yang menerima FormData / DTO dan mengembalikan response terstruktur.
- **Tenant Context Seam:** Resolver sesi di `src/shared/infrastructure/tenant/` yang mengevaluasi `sekolah_aktif_id`.

---

## 3. Perintah Kanonikal Pengujian & Reproduksi

Seluruh pemeriksaan kualitas dijalankan melalui perintah standar pada terminal:

```bash
# 1. Jalankan Seluruh Test Suite Otomatis (99 files, 538 tests)
npm run test

# 2. Jalankan Mode Watch untuk TDD lokal
npm run test:watch

# 3. Pengecekan Integritas Tipe TypeScript (Wajib 0 errors)
npm run typecheck

# 4. Pengecekan Kualitas Kode & Linting (Wajib 0 errors)
npm run lint

# 5. Pengecekan Standar Format Prettier
npm run format:check

# 6. Kompilasi Produksi Next.js
npm run build
```

---

## 4. Baseline Bukti Kualitas Saat Ini (*Current Evidence Baseline*)

Sesuai dengan audit Phase SAAS-04, platform Ruang Pintar memiliki status bukti pengujian terverifikasi:

| Kategori Pemeriksaan | Metrik / Cakupan | Status Hasil |
| --- | --- | :---: |
| **Unit & Integration Suite** | 99 Test Files, 538 Tests Terstruktur | ✅ **100% PASS** |
| **Typecheck (TypeScript 5.8)** | Seluruh kode di `src/`, `prisma/`, `scripts/` (`tsc --noEmit`) | ✅ **0 Errors** |
| **ESLint 9** | Seluruh file kode sumber (`eslint .`) | ✅ **0 Errors** |
| **Format (Prettier)** | Kepatuhan styling dan konvensi layout | ✅ **100% Clean** |
| **Production Build** | 28 Rute Aplikasi Next.js terkompilasi optimal | ✅ **100% PASS** |
| **Database Migrations** | 23 Migrasi Prisma tervalidasi dan diterapkan sinkron | ✅ **Up-to-Date** |

---

## 5. Kebijakan Loop TDD (*Risk-Based TDD Policy*)

Sesuai aturan **Fikran Engineering**:
1. **Kapan TDD Digunakan:** TDD digunakan saat ada perubahan pada *observable behavior* dengan risiko regresi signifikan (misalnya: penambahan alur otorisasi baru, kalkulasi bobot rapor baru, atau perubahan aturan transaksional multi-tenant).
2. **Siklus Vertical-Slice:**
   - **RED:** Buat pengujian unit/integrasi pada seam publik yang mendeskripsikan perilaku yang diharapkan, buktikan test gagal (*failure expected*).
   - **GREEN:** Tulis implementasi minimal untuk membuat test lulus.
   - **REFACTOR:** Rapikan struktur kode tanpa mengubah kontrak perilaku yang sudah teruji.
3. **Pengecualian TDD:** TDD **tidak dipaksakan** untuk pekerjaan perubahan salinan teks (*copywriting*), *styling layout*, aset visual statis, atau perubahan presentasi non-logis.

---

## 6. Definition of Done (DoD) Pengujian

Suatu pekerjaan implementasi dinyatakan selesai secara teknis hanya jika:
- [x] Seluruh skenario pengujian baru dan regresi lama lulus 100% (`npm run test`).
- [x] `npm run typecheck` mengembalikan 0 error.
- [x] `npm run lint` mengembalikan 0 error.
- [x] Kompilasi `npm run build` sukses tanpa warning kritis.
- [x] Bukti hasil eksekusi dicatat secara transparan pada laporan deliverable sebelum meminta *Human Review*.
