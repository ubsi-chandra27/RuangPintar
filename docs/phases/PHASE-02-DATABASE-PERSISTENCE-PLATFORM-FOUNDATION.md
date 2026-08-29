# PHASE 02 — DATABASE, PERSISTENCE & PLATFORM FOUNDATION
## Ruang Pintar — Canonical Specification & Platform Foundation Deliverable

**Versi:** 1.0
**Status:** APPROVED
**Active Phase:** PHASE 02 — DATABASE, PERSISTENCE & PLATFORM FOUNDATION
**Approved Baseline:** `daa3ac7eb6b1be224612f9c5f81d9693a2d01437` (*docs: lock Ruang Pintar product requirements*)
**Dokumen Induk:**
- `docs/05-SYSTEM-ARCHITECTURE.md`
- `docs/06-DATA-ARCHITECTURE.md`
- `docs/08-IMPLEMENTATION-ROADMAP.md` (Section 11)
- `docs/phases/README.md`
- `docs/phases/PHASE-01-PRODUCT-REQUIREMENT-LOCK.md`

---

# 1. Tujuan & Ruang Lingkup Phase 02

Phase 02 bertujuan untuk **membangun dan mengaktifkan fondasi arsitektur data, persistensi database SQLite lokal dengan Prisma ORM, standardisasi identifier ULID 26 karakter, model data platform fondasi (M01–M05), transactional outbox, append-only audit logger, abstraksi penyimpanan berkas privat lokal, serta isolasi pengujian otomatis**.

---

# 2. Arsitektur & Keputusan Desain (Architectural Decisions)

1. **Database Engine & Deployment:**
   - Single-school deployment: 1 Sekolah = 1 File SQLite persisten (`data/ruang-pintar.db`).
   - SQLite dioptimalkan dengan konfigurasi PRAGMA:
     - `PRAGMA foreign_keys = ON;` (Penegakan relational integrity & constraint).
     - `PRAGMA journal_mode = WAL;` (Write-Ahead Logging untuk konkurensi produksi).
     - `PRAGMA synchronous = FULL;` (Durabilitas data reliabel).
     - `PRAGMA busy_timeout = 5000;` (Penanganan lock write singkat).

2. **Primary Identifier Baseline (ULID):**
   - Menggunakan string ULID 26-karakter (Crockford Base32, monotonic-ready) via pustaka `ulidx`.
   - Mengeliminasi ketergantungan pada integer auto-increment atau UUID v4 acak pada entitas first-party.

3. **Skema & Penamaan Bahasa Indonesia (snake_case):**
   - Entitas fisik database first-party dipetakan ke Bahasa Indonesia snake_case:
     - `sekolah` (M01)
     - `unit_organisasi` (M01)
     - `jabatan` (M01)
     - `penugasan_jabatan` (M01)
     - `konfigurasi_sistem` (M03)
     - `metadata_berkas` (M04)
     - `log_audit` (M05)
     - `outbox_pesan` (Data Architecture)

4. **Global & School Configuration Uniqueness (M03):**
   - Mendukung konfigurasi global (`sekolah_id = NULL`) dan school-specific override (`sekolah_id = <school_ulid>`).
   - Uniqueness dijamin pada dua lapisan:
     - *Application Level*: `ConfigurationService.setConfig` mencari record yang ada untuk update idempotent.
     - *Database Persistence Level*: SQLite Partial Unique Index (`CREATE UNIQUE INDEX "konfigurasi_sistem_global_kunci_key" ON "konfigurasi_sistem"("kunci") WHERE "sekolah_id" IS NULL;`) mencegah duplikasi data global pada level database.

5. **Transactional Outbox Pattern:**
   - Tabel `outbox_pesan` untuk menjamin publikasi event asinkron reliabel tanpa distributed transactions.
   - Mendukung exponential backoff retry dan status lifecycle (`PENDING`, `COMPLETED`, `FAILED`).

6. **Append-Only Audit Logging (M05):**
   - Penegakan **Application-Level Service Boundary**: Service interface `audit-logger.ts` hanya menyediakan operasi append (`recordAuditEvent`) dan read (`queryAuditLogs`), tanpa menyediakan metode update atau delete bagi modul aplikasi.

7. **Private File Storage Abstraction (M04):**
   - Interface `IStorageService` dengan implementasi `LocalStorageAdapter` yang menyimpan file privat ke direktori lokal terisolasi (`data/storage/`) dengan checksum SHA-256 dan metadata di database.

---

# 3. Model Skema Database Fondasi

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Sekolah {
  id              String   @id
  nama            String
  npsn            String?  @unique
  jenjang         String   // SD | SMP | SMA | SMK | UMUM
  alamat          String?
  telepon         String?
  email           String?
  zona_waktu      String   @default("Asia/Jakarta")
  logo_url        String?
  status_aktif    Boolean  @default(true)
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  unit_organisasi    UnitOrganisasi[]
  jabatan            Jabatan[]
  penugasan_jabatan  PenugasanJabatan[]
  konfigurasi_sistem KonfigurasiSistem[]
  metadata_berkas    MetadataBerkas[]
  log_audit          LogAudit[]

  @@map("sekolah")
}

model UnitOrganisasi {
  id              String   @id
  sekolah_id      String
  nama            String
  kode            String?
  induk_unit_id   String?
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  sekolah         Sekolah           @relation(fields: [sekolah_id], references: [id], onDelete: Restrict)
  induk_unit      UnitOrganisasi?   @relation("HierarkiUnit", fields: [induk_unit_id], references: [id], onDelete: SetNull)
  sub_unit        UnitOrganisasi[]  @relation("HierarkiUnit")
  jabatan         Jabatan[]

  @@unique([sekolah_id, nama])
  @@map("unit_organisasi")
}

model Jabatan {
  id              String   @id
  sekolah_id      String
  unit_id         String?
  kode_jabatan    String
  nama_jabatan    String
  tingkat_akses   String?
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  sekolah         Sekolah           @relation(fields: [sekolah_id], references: [id], onDelete: Restrict)
  unit            UnitOrganisasi?   @relation(fields: [unit_id], references: [id], onDelete: SetNull)
  penugasan       PenugasanJabatan[]

  @@unique([sekolah_id, kode_jabatan])
  @@map("jabatan")
}

model PenugasanJabatan {
  id              String    @id
  sekolah_id      String
  jabatan_id      String
  personil_id     String
  berlaku_mulai   DateTime
  berlaku_sampai  DateTime?
  status          String    @default("AKTIF")
  catatan         String?
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  sekolah         Sekolah   @relation(fields: [sekolah_id], references: [id], onDelete: Restrict)
  jabatan         Jabatan   @relation(fields: [jabatan_id], references: [id], onDelete: Restrict)

  @@index([personil_id, status])
  @@map("penugasan_jabatan")
}

model KonfigurasiSistem {
  id              String   @id
  sekolah_id      String?
  kunci           String
  nilai           String
  kategori        String   @default("UMUM")
  deskripsi       String?
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  sekolah         Sekolah? @relation(fields: [sekolah_id], references: [id], onDelete: SetNull)

  @@unique([sekolah_id, kunci])
  @@map("konfigurasi_sistem")
}

model MetadataBerkas {
  id                String   @id
  sekolah_id        String?
  nama_file_asli    String
  storage_provider  String   @default("LOCAL")
  storage_key       String   @unique
  mime_type         String
  ukuran_byte       Int
  checksum          String?
  status            String   @default("AKTIF")
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt

  sekolah           Sekolah? @relation(fields: [sekolah_id], references: [id], onDelete: SetNull)

  @@index([storage_provider, status])
  @@map("metadata_berkas")
}

model LogAudit {
  id                String   @id
  sekolah_id        String?
  aktor_id          String
  aktor_role        String
  aksi              String
  tipe_sumber       String
  id_sumber         String
  payload_sebelum   String?
  payload_sesudah   String?
  ip_address        String?
  user_agent        String?
  dibuat_pada       DateTime @default(now())

  sekolah           Sekolah? @relation(fields: [sekolah_id], references: [id], onDelete: SetNull)

  @@index([sekolah_id, dibuat_pada])
  @@index([aktor_id, dibuat_pada])
  @@index([tipe_sumber, id_sumber])
  @@map("log_audit")
}

model OutboxPesan {
  id                         String    @id
  tipe_event                 String
  tipe_agregat               String
  id_agregat                 String
  payload                    String
  status                     String    @default("PENDING")
  jumlah_percobaan           Int       @default(0)
  maks_percobaan             Int       @default(5)
  percobaan_berikutnya_pada  DateTime  @default(now())
  diproses_pada              DateTime?
  pesan_error                String?
  dibuat_pada                DateTime  @default(now())
  diperbarui_pada            DateTime  @updatedAt

  @@index([status, percobaan_berikutnya_pada])
  @@map("outbox_pesan")
}
```

---

# 4. Acceptance Criteria & Verifikasi

| Kode AC | Deskripsi Kriteria Penerimaan | Bukti Verifikasi | Status |
|---|---|---|---|
| **AC-01** | Prisma ORM terkonfigurasi dengan datasource SQLite lokal dan migrasi berhasil. | `prisma/schema.prisma` dan migrasi `20260829012117_init_platform_foundation` diaplikasikan. | **PASS** |
| **AC-02** | SQLite PRAGMAs (Foreign Keys ON, WAL, synchronous FULL, busy_timeout) berjalan dengan benar. | `src/test/database/sqlite-pragmas.test.ts` berhasil mengeksekusi dan memvalidasi foreign keys & WAL. | **PASS** |
| **AC-03** | ULID generator menghasilkan string 26-karakter valid dan monotonic sortable. | `src/test/database/ulid.test.ts` (3 tests) memvalidasi panjang 26, Crockford Base32, dan penolakan format salah. | **PASS** |
| **AC-04** | Model data platform fondasi (M01, M03, M04, M05) mematuhi batasan integritas, relasi, unique, dan penolakan invalid FK. | `src/test/database/prisma-foundation.test.ts` (6 tests) memvalidasi CRUD, unique NPSN, dan penolakan FK asing. | **PASS** |
| **AC-05** | Transaction helper `runInTransaction` mengeksekusi operasi secara atomik dan melakukan rollback saat terjadi error. | `src/test/database/transaction.test.ts` (2 tests) memvalidasi commit dan rollback atomik. | **PASS** |
| **AC-06** | Audit Logger, Outbox Service, Storage Adapter, dan Configuration Service berfungsi end-to-end dengan persistensi database. | `audit.test.ts`, `outbox.test.ts`, `local-storage.test.ts`, dan `configuration.test.ts` (15 tests) seluruhnya lulus. | **PASS** |

---

# 5. Hasil Pengujian Otomatis

Total Test Files: **9 passed**
Total Tests: **31 passed (100%)**

- `src/test/database/ulid.test.ts` (3 tests) — PASS
- `src/test/database/sqlite-pragmas.test.ts` (2 tests) — PASS
- `src/test/database/prisma-foundation.test.ts` (6 tests) — PASS
- `src/test/database/transaction.test.ts` (2 tests) — PASS
- `src/test/database/audit.test.ts` (4 tests) — PASS
- `src/test/database/outbox.test.ts` (4 tests) — PASS
- `src/test/storage/local-storage.test.ts` (3 tests) — PASS
- `src/test/config/configuration.test.ts` (6 tests) — PASS
- `src/test/smoke.test.tsx` (1 test) — PASS

---

# 6. Quality Gates

- **`npm run format:check`**: PASS (*All matched files use Prettier code style!*)
- **`npm run lint`**: PASS (*0 errors, 0 warnings*)
- **`npm run typecheck`**: PASS (*tsc --noEmit exit code 0*)
- **`npm run test`**: PASS (*31/31 tests passed*)
- **`npm run build`**: PASS (*Next.js 16 Turbopack production build static routes success*)
- **`npm audit`**: PASS (*found 0 vulnerabilities*)
- **`git diff --check`**: PASS (*Clean, no whitespace issues*)

---

# 7. Explicit Non-Scope & Batasan Fase

1. **TIDAK membuat skema domain bisnis M06–M21** (Siswa, Guru, Penugasan Mengajar, Rombel, Jadwal, Presensi, Nilai, CBT, dll) — ditunda ke fase masing-masing sesuai roadmap kanonikal.
2. **TIDAK membuat alur autentikasi UI/API atau session login** (Lingkup resmi Phase 03).
3. **TIDAK membuat authorization middleware / dynamic permission engine** (Lingkup resmi Phase 04).
4. **TIDAK membuat layar dashboard atau CRUD bisnis**.

---

# 8. Kesiapan Handoff menuju Phase 03

Fondasi data dan platform telah siap sepenuhnya untuk menerima implementasi **PHASE 03 — AUTHENTICATION & IDENTITY** (User Account, username, password hashing, session store, rate limiting, and login interface).

**Status Akhir:** `APPROVED`
