# PHASE 08 — STUDENT ACADEMIC LIFECYCLE
## MODULE M07 — STUDENT ACADEMIC LIFECYCLE

**Status Phase:** READY FOR HUMAN REVIEW  
**Modul:** M07 — Student Academic Lifecycle  
**Baseline Git HEAD:** `e237553cf82659d74834d610f8c5cb706349240c`  
**Prinsip Utama:** Single Active Phase Rule, Domain Invariant Separation (`Student Identity ≠ Student Enrollment ≠ Rombel Placement`), History Preservation, Academic Glass UI v1.2, Zero-Regression Integrity.

---

## 1. Ringkasan Eksekutif

Phase 08 mengimplementasikan seluruh domain, business logic, otorisasi server-side, integrasi UI, dan visual quality assurance untuk modul **M07 — Student Academic Lifecycle (Siklus Akademik Siswa)** pada platform Ruang Pintar.

### Domain Invariants & Rules:
1. **Student Identity ≠ Student Enrollment ≠ Rombel Placement**:
   - `Siswa` (Buku Induk): Identitas individual siswa yang independen terhadap tahun ajaran dan penempatan rombel.
   - `KeikutsertaanSiswa` (Enrollment): Partisipasi siswa pada periode/tahun ajaran tertentu yang terikat tingkat kelas. Siswa dapat memiliki banyak riwayat keikutsertaan antar-tahun ajaran tanpa mengubah entitas identitas dasar.
   - `PenempatanRombel` (Placement): Penugasan siswa ke rombongan belajar (rombel) fisik tertentu dengan nomor absen dan validasi kapasitas kelas.
2. **History Preservation & Protection**:
   - Pemindahan rombel, promosi kenaikan kelas, dan kelulusan tidak pernah menimpa (overwrite) data masa lalu.
   - Penempatan lama ditutup dengan status `PINDAH` / `SELESAI`, dan keikutsertaan lama ditutup dengan status `NAIK_KELAS` / `LULUS` / `PINDAH`.
   - Data siswa yang memiliki riwayat akademik aktif atau historis dilindungi dari penghapusan sembarangan (`HistoryProtectedError`).
3. **Capacity Enforcement**:
   - Penempatan siswa ke dalam rombel secara individu maupun massal (bulk placement) memvalidasi batas daya tampung rombel secara ketat (`RombelCapacityExceededError`).
4. **Server-Side Authorization & School-Boundary Enforcement**:
   - Izin `academic.students.view` dan `academic.students.manage` dibatasi pada `SUPER_ADMIN` dan `SCHOOL_STAFF` yang memiliki bundle `STUDENT_DATA_OPERATOR`.
   - Penegakan batasan institusi sekolah (*School-boundary enforcement*) dan otorisasi permission checking sesuai arsitektur kanonikal **1 Deployment = 1 School**.

---

## 2. Model & Migrasi Database (Forward-Only)

Migrasi database diterapkan pada SQLite dengan penamaan Bahasa Indonesia (`snake_case`) dan identifier ULID 26 karakter:

- **Migration Files:**
  1. `prisma/migrations/20260830140000_add_student_academic_lifecycle/migration.sql` (Tabel inti kesiswaan)
  2. `prisma/migrations/20260830150000_add_student_photo/migration.sql` (Kolom foto profil siswa)
- **Tabel & Kolom Baru:**
  1. `siswa`: Buku induk siswa (`id`, `sekolah_id`, `pengguna_id`, `nis`, `nisn`, `nama_lengkap`, `jenis_kelamin`, `tempat_lahir`, `tanggal_lahir`, `agama`, `nik`, `alamat`, `nama_wali`, `telepon_wali`, `email_wali`, `status_akademik`, `foto_url`, `tanggal_masuk`, `tanggal_keluar`, `catatan`).
  2. `keikutsertaan_siswa`: Pendaftaran per tahun ajaran (`id`, `sekolah_id`, `siswa_id`, `tahun_ajaran_id`, `tingkat_id`, `status`, `tanggal_mulai`, `tanggal_selesai`, `catatan`).
  3. `penempatan_rombel`: Penempatan kelas (`id`, `sekolah_id`, `keikutsertaan_id`, `rombel_id`, `tanggal_mulai`, `tanggal_selesai`, `status`, `nomor_absen`, `catatan`).

### Hasil Verifikasi Migrasi:
- **Upgrade Migration:** `PASS` (`npx prisma migrate status` -> 6 migrations applied, schema up to date).
- **Fresh Migration:** `PASS` (`npx prisma migrate deploy` on empty DB -> all 6 migrations applied cleanly).
- **FK & Constraint Integrity:** `PASS` (`PRAGMA foreign_key_check` -> `[]`, `PRAGMA integrity_check` -> `ok`).

---

## 3. Arsitektur Kode & File yang Dibuat

```
src/
├── app/
│   ├── actions/
│   │   └── student-actions.ts                   # Server actions dengan requireAuth, requirePermission, dan audit log
│   └── data-siswa/
│       └── page.tsx                             # Halaman kesiswaan berorientasi Academic Glass UI v1.2
├── modules/
│   └── student/
│       ├── domain/
│       │   ├── student-types.ts                 # DTOs, Enums, dan Input Types (termasuk foto_url)
│       │   ├── student-errors.ts                # Domain error hierarchy
│       │   └── student-validation.ts            # Zod validation schemas
│       ├── infrastructure/
│       │   └── student-repository.ts            # Prisma repository dengan multi-filter & school boundary
│       ├── application/
│       │   ├── student-identity-service.ts      # Layanan buku induk siswa
│       │   ├── student-enrollment-service.ts    # Layanan keikutsertaan per periode
│       │   ├── rombel-placement-service.ts      # Layanan penempatan rombel & penempatan massal
│       │   ├── student-lifecycle-service.ts     # Layanan transisi (promosi, mutasi, kelulusan, timeline)
│       │   └── student-facade.ts                # Aggregator dataset kesiswaan untuk UI
│       └── presentation/
│           ├── student-detail-modal.tsx         # Modal tabbed: Profil Siswa & Riwayat Timeline
│           ├── student-directory-view.tsx       # Tampilan Buku Induk Siswa (Search, filter, edit, status)
│           ├── student-enrollments-view.tsx     # Tampilan Keikutsertaan & Promosi Kenaikan Kelas
│           ├── student-placements-view.tsx      # Tampilan Penempatan Rombel & Bulk Placement
│           └── student-management-tabs.tsx      # Kontainer symmetrical 3-tab navigation
└── test/
    └── student/
        ├── student-identity.test.ts             # Unit test layanan identitas siswa
        ├── student-enrollment.test.ts           # Unit test keikutsertaan siswa
        ├── rombel-placement.test.ts             # Unit test penempatan & kapasitas rombel
        ├── student-lifecycle.test.ts            # Unit test promosi, kelulusan, mutasi, timeline
        ├── student-authz.test.ts                # Unit test RBAC & capability bundles
        └── student-views.test.tsx               # Unit test presentation layer rendering
```

---

## 4. Hasil Quality Gates

| Quality Gate | Perintah | Status | Catatan |
|---|---|---|---|
| **Format** | `npm run format:check` | **PASS** | 100% file lolos verifikasi Prettier tanpa anomali gaya |
| **Lint** | `npm run lint` | **PASS** | 0 errors, 0 warnings (ESLint v9 + React 19 rules) |
| **Typecheck** | `npm run typecheck` | **PASS** | 0 TypeScript errors pada seluruh file proyek |
| **Unit & Integration Tests** | `npm run test` | **PASS** | **42 test files, 208 tests passed (100%)** |
| **Production Build** | `npm run build` | **PASS** | Next.js 16 (Turbopack) berhasil mengompilasi rute `/data-siswa` |
| **Visual QA** | `node scripts/capture-phase-08-qa.mjs` | **PASS** | 10 tangkapan layar responsif lengkap di 4 viewport |

---

## 5. Bukti Visual QA (10 Tangkapan Layar)

Tangkapan layar tersimpan pada direktori `docs/phases/screenshots/phase-08/`:
1. `01-desktop-student-directory.png` (Desktop 1440x900 - Direktori & Buku Induk Siswa)
2. `02-desktop-student-detail-timeline-modal.png` (Desktop 1440x900 - Modal Detail & Timeline Riwayat Akademik)
3. `03-desktop-student-create-modal.png` (Desktop 1440x900 - Modal Tambah Siswa Baru & Auto-Enrollment)
4. `04-desktop-student-enrollments.png` (Desktop 1440x900 - Tab Keikutsertaan Akademik Siswa)
5. `05-desktop-student-placements.png` (Desktop 1440x900 - Tab Penempatan Rombongan Belajar)
6. `06-desktop-bulk-placement-modal.png` (Desktop 1440x900 - Modal Penempatan Rombel Massal / Bulk Placement)
7. `07-laptop-student-directory.png` (Laptop 1024x768 - Responsivitas Layar Sedang)
8. `08-tablet-student-directory.png` (Tablet 768x1024 - Responsivitas Tablet Portrait)
9. `09-mobile-student-directory.png` (Mobile 390x844 - Tampilan Kartu Sentuh Direktori Siswa)
10. `10-mobile-student-placements.png` (Mobile 390x844 - Tampilan Kartu Sentuh Penempatan Rombel)

---

## 6. Human Visual Review Confirmation

- **Halaman yang Ditinjau:** `/data-siswa` (Buku Induk Siswa, Penempatan Rombel, Keikutsertaan Akademik, Modal Detail & Riwayat Siswa, Form Tambah & Edit dengan Pas Foto, Table Toolbar Search/Filter/Sort/Export CSV).
- **Hasil Human Visual Review:** `PASS` (Dikonfirmasi langsung oleh Human Reviewer).

---

## 7. Konfirmasi Batasan Ruang Lingkup (Out-of-Scope Confirmation)

Sesuai instruksi tata kelola ketat:
- **TIDAK** membuat Teacher Profile, Teaching Assignment, atau Homeroom Assignment (dialokasikan untuk Phase 09 - Staff & Teacher Assignment).
- **TIDAK** membuat Academic Calendar / Jadwal Pelajaran (dialokasikan untuk Phase 10 - Academic Calendar & Timetable).
- **TIDAK** membuat Presensi Kehadiran Siswa (dialokasikan untuk Phase 12 - Attendance & Engagement).
- **TIDAK** membuat Gradebook / Buku Nilai (dialokasikan untuk Phase 13 - Assessment & Gradebook).
- **TIDAK** membuat CBT / Computer-Based Test (dialokasikan untuk Phase 14 - Computer-Based Testing).
- **TIDAK** melakukan Git Commit atau Push (menunggu keputusan Human Reviewer).

---

## 8. Status Akhir

**STATUS:** `APPROVED & CHECKPOINTED`  
**HUMAN REVIEW:** `APPROVED`  
Phase 08 — Student Academic Lifecycle telah diverifikasi penuh (Upgrade Migration, Fresh Migration, FK/Integrity Check, RBAC/Capabilities, Automated Tests, Next.js Build, dan Human Visual Review PASS) serta disetujui secara resmi oleh Human Reviewer.


