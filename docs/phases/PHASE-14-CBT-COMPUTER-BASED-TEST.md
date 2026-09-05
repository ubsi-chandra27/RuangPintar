# RUANG PINTAR — PHASE 14 COMPLETION REPORT

**Phase:** PHASE 14 — CBT: COMPUTER BASED TEST (M14)  
**Module:** M14 — Bank Soal, Blueprint Ujian, Immutable Snapshot, CBT Player, Anti-Cheat, Auto-Grading & Gradebook Transfer  
**Milestone:** MILESTONE E — DIGITAL ASSESSMENT READY  
**Status:** APPROVED BY HUMAN (5 September 2026)  
**Date:** 2026-09-05  

---

## 1. Executive Summary

Phase 14 merealisasikan modul **CBT (Computer Based Test)** Ruang Pintar sebagai mesin asesmen digital yang aman, andal, dan terintegrasi langsung dengan ekosistem akademik sekolah. Modul ini menjembatani aktivitas asesmen digital guru mulai dari perancangan bank soal terversifikasi, penyusunan blueprint ujian, penerbitan snapshot ujian yang immutable, pelaksanaan ujian berbasis timer server pada CBT Player dengan pengawasan integritas layar, hingga penilaian otomatis berbasis server (*server-side auto-grading*) dan transfer resmi nilai ke Buku Nilai (Phase 13 Gradebook).

Sistem CBT dirancang dengan mematuhi invariant domain yang ketat guna menjamin kejujuran ujian dan integritas data akademik:
1. **Pemisahan Entitas & Versioning Soal:**
   - Soal di Bank Soal memiliki riwayat versi (`VersiSoal`). Pengubahan teks soal di bank soal tidak merusak snapshot atau sesi ujian yang sedang atau telah berlangsung.
2. **Immutable Exam Snapshot:**
   - Saat ujian diterbitkan (*published*), sistem membuat snapshot permanen (`SnapshotUjian`) berisi salinan seluruh butir soal, opsi, dan bobot. Ujian siswa dieksekusi 100% mengacu pada snapshot ini.
3. **Zero Answer Key Leakage (Keamanan Kunci Jawaban):**
   - Manifest soal yang dikirimkan ke peramban siswa di CBT Player secara mutlak membersihkan atribut `kunci_jawaban` dan flag `is_correct`. Validasi dan skoring dilakukan sepenuhnya di server trusted boundary.
4. **Server-Authoritative Timer & Idempotent Autosave:**
   - Batas waktu ujian ditentukan secara absolut oleh server (`batas_waktu_server = waktu_mulai + durasi_menit`). Manipulasi jam lokal peramban atau reload halaman tidak me-reset waktu. Jawaban disimpan secara otomatis dan berkala dengan penanganan resume yang aman.
5. **Integritas Ujian (Anti-Cheat 2-Strike System):**
   - Sistem mendeteksi upaya keluar dari mode layar penuh (*fullscreen exit*) atau perpindahan tab/aplikasi (*window blur*). Peringatan visual dan audio edukatif diaktifkan pada percobaan pertama. Jika siswa melanggar 2 kali berturut-turut, sesi ujian terkunci otomatis (*LOCKED*) dan membutuhkan pembukaan (*unlock*) resmi oleh pengawas/guru melalui proctor panel.
6. **Kepemilikan Tunggal Buku Nilai (Gradebook Transfer Bridge):**
   - Modul CBT tidak membuat tabel gradebook paralel. Hasil akhir CBT ditransfer secara resmi dan idempoten ke entitas Phase 13 (`DefinisiAsesmen` dan `NilaiSiswa`), tetap mematuhi prinsip `Missing Grade ≠ Zero Grade`.

---

## 2. Invariant & Domain Integrity Proof

1. **Rantai Invariant Domain:**
   ```text
   Question ≠ Question Version ≠ Exam Blueprint ≠ Exam ≠ Exam Snapshot ≠ Attempt ≠ Answer ≠ Result ≠ Assessment ≠ Grade
   ```
   - `BankSoal`: Wadah butir soal per mata pelajaran dan guru pengampu.
   - `VersiSoal`: Entitas terversi yang menyimpan payload soal, opsi pilihan, dan kunci jawaban.
   - `UjianCbt`: Konfigurasi ujian pada penugasan mengajar rombel tertentu.
   - `SnapshotUjian`: Salinan butir soal yang dibekukan saat ujian dipublikasikan.
   - `SesiUjianSiswa`: Sesi attempt peserta ujian dengan batas waktu server absolut.
   - `JawabanSiswa`: Lembar rekam jawaban siswa per soal yang disimpan berkala (*autosave*).
   - `HasilUjianCbt`: Rekapitulasi perolehan skor, jumlah benar, salah, kosong, dan nilai akhir (0–100).
   - `DefinisiAsesmen` & `NilaiSiswa`: Entitas resmi Phase 13 penerima transfer nilai akhir.

2. **Aturan Satu Sesi Aktif (One Active Attempt):**
   - Satu siswa pada satu ujian hanya diizinkan memiliki maksimal 1 sesi berstatus `SEDANG_DIKERJAKAN`. Upaya memulai sesi kedua akan mengembalikan sesi yang sedang aktif (*resume*), mencegah kecurangan pengerjaan ganda.

3. **Integritas Acak Soal & Acak Opsi:**
   - Pengacakan urutan soal dan opsi jawaban dilakukan saat snapshot dikonsumsi per sesi peserta dengan benih acak yang konsisten, memastikan tampilan soal antar-peserta berbeda namun tetap teratur saat resume.

4. **Koreksi & Integritas Pengawas:**
   - Event perpindahan jendela dicatat sebagai `EventIntegritasUjian`. Pengawas dapat memantau status pengerjaan seluruh siswa, melihat riwayat insiden integritas, dan melakukan *unlock* apabila siswa memiliki alasan yang sah.

---

## 3. Database Schema & Migration (M14)

- **Migration File:** `prisma/migrations/20260904230000_add_cbt_engine/migration.sql`
- **Database Engine:** SQLite (`data/ruang-pintar.db`)
- **Tabel Baru (8 Model):**
  1. `bank_soal` (`BankSoal`): Master bank soal guru per mata pelajaran.
  2. `versi_soal` (`VersiSoal`): Versi butir soal dengan relasi ke Tujuan Pembelajaran (TP).
  3. `ujian_cbt` (`UjianCbt`): Konfigurasi pelaksanaan CBT pada rombel.
  4. `snapshot_ujian` (`SnapshotUjian`): Payload soal yang dibekukan (JSON).
  5. `sesi_ujian_siswa` (`SesiUjianSiswa`): Sesi attempt peserta ujian dengan batas waktu server.
  6. `jawaban_siswa` (`JawabanSiswa`): Jawaban tersimpan dengan status ragu-ragu dan skor.
  7. `hasil_ujian_cbt` (`HasilUjianCbt`): Rekapitulasi skor dan status transfer gradebook.
  8. `event_integritas_ujian` (`EventIntegritasUjian`): Log insiden integritas (blur, fullscreen exit, lock).

```prisma
model BankSoal {
  id         String      @id
  sekolah_id String
  guru_id    String
  mapel_id   String
  kode_bank  String
  nama_bank  String
  deskripsi  String?
  status     String      @default("AKTIF")
  versi_soal VersiSoal[]
  created_at DateTime    @default(now())
  updated_at DateTime    @updatedAt
  ...
}

model VersiSoal {
  id            String    @id
  sekolah_id    String
  bank_soal_id  String
  tp_id         String?
  nomor_versi   Int       @default(1)
  jenis_soal    String    @default("PILIHAN_GANDA")
  konten_soal   String
  opsi_jawaban  String?   // JSON
  kunci_jawaban String?   // Server-only!
  bobot_nilai   Float     @default(1.0)
  status        String    @default("AKTIF")
  created_at    DateTime  @default(now())
  ...
}

model UjianCbt {
  id                    String            @id
  sekolah_id            String
  penugasan_mengajar_id String
  asesmen_id           String?
  judul                 String
  deskripsi             String?
  durasi_menit          Int               @default(60)
  tanggal_mulai         DateTime          @default(now())
  tanggal_selesai       DateTime
  status                String            @default("DRAFT")
  acak_soal             Boolean           @default(false)
  acak_opsi             Boolean           @default(false)
  max_attempt           Int               @default(1)
  blueprint_soal        String?           // JSON
  snapshot_ujian        SnapshotUjian[]
  sesi_siswa            SesiUjianSiswa[]
  ...
}

model SnapshotUjian {
  id               String           @id
  sekolah_id       String
  ujian_id         String
  payload_snapshot String           // JSON
  total_soal       Int              @default(0)
  total_bobot      Float            @default(0.0)
  created_at       DateTime         @default(now())
  sesi_siswa       SesiUjianSiswa[]
  ...
}

model SesiUjianSiswa {
  id                 String                 @id
  sekolah_id         String
  ujian_id           String
  snapshot_id        String
  siswa_id           String
  waktu_mulai        DateTime               @default(now())
  batas_waktu_server DateTime
  waktu_selesai      DateTime?
  status             String                 @default("SEDANG_DIKERJAKAN")
  attempt_ke         Int                    @default(1)
  jawaban            JawabanSiswa[]
  hasil              HasilUjianCbt?
  event_integritas   EventIntegritasUjian[]
  ...
  @@unique([ujian_id, siswa_id, attempt_ke])
}

model JawabanSiswa {
  id              String         @id
  sekolah_id      String
  sesi_ujian_id   String
  soal_id         String
  jawaban_peserta String?
  ragu_ragu       Boolean        @default(false)
  skor_diperoleh  Float?
  status_koreksi  String         @default("BELUM_DIKOREKSI")
  waktu_simpan    DateTime       @default(now())
  ...
  @@unique([sesi_ujian_id, soal_id])
}

model HasilUjianCbt {
  id                     String         @id
  sekolah_id             String
  sesi_ujian_id          String         @unique
  total_soal             Int            @default(0)
  dijawab                Int            @default(0)
  benar                  Int            @default(0)
  salah                  Int            @default(0)
  kosong                 Int            @default(0)
  nilai_akhir            Float          @default(0.0)
  status                 String         @default("SELESAI")
  ditransfer_ke_gradebook Boolean        @default(false)
  waktu_transfer         DateTime?
  ...
}

model EventIntegritasUjian {
  id             String         @id
  sekolah_id     String
  sesi_ujian_id  String
  jenis_event    String
  deskripsi      String?
  payload        String?        // JSON
  waktu_kejadian DateTime       @default(now())
  ...
}
```

---

## 4. Architectural & Layered Components

1. **Domain Layer:**
   - [`src/modules/cbt/domain/cbt-types.ts`](file:///C:/laragon/www/Ruang-Pintar/src/modules/cbt/domain/cbt-types.ts): Tipe DTO, Enums jenis soal (PILIHAN_GANDA, PG_KOMPLEKS, BENAR_SALAH, ISIAN_SINGKAT, URAIAN), status sesi, payload snapshot publik (bebas kunci) vs privat.
   - [`src/modules/cbt/domain/cbt-errors.ts`](file:///C:/laragon/www/Ruang-Pintar/src/modules/cbt/domain/cbt-errors.ts): Custom domain errors (`CbtNotFoundError`, `CbtAttemptExpiredError`, `CbtSessionLockedError`, `CbtUnauthorizedError`).
   - [`src/modules/cbt/domain/cbt-validation.ts`](file:///C:/laragon/www/Ruang-Pintar/src/modules/cbt/domain/cbt-validation.ts): Validasi Zod untuk pembuatan soal, opsi, blueprint, autosave jawaban, dan grading.
2. **Infrastructure Layer:**
   - [`src/modules/cbt/infrastructure/cbt-repository.ts`](file:///C:/laragon/www/Ruang-Pintar/src/modules/cbt/infrastructure/cbt-repository.ts): Transaksi atomik Prisma untuk CRUD bank soal & versi, pembuatan snapshot ujian, inisiasi/resume attempt, atomic autosave jawaban, server-side auto-grading, pencatatan event integritas, proctor strike unlock, dan idempotent transfer ke `DefinisiAsesmen` & `NilaiSiswa`.
3. **Application Layer:**
   - [`src/modules/cbt/application/cbt-service.ts`](file:///C:/laragon/www/Ruang-Pintar/src/modules/cbt/application/cbt-service.ts): Logika bisnis terproteksi dengan verifikasi peran (Guru penugasan / Super Admin / Siswa terdaftar), sanitasi kunci jawaban pada client manifest, dan pencatatan audit log `recordAuditEvent`.
4. **Server Actions & Authorization:**
   - [`src/app/actions/cbt-actions.ts`](file:///C:/laragon/www/Ruang-Pintar/src/app/actions/cbt-actions.ts): Server Actions terproteksi `requireAuth()` dan pengecekan permission:
     - `createQuestionBankAction`, `createQuestionVersionAction`, `getQuestionBanksAction`
     - `createExamAction`, `publishExamAction`, `getClassExamsAction`
     - `startOrResumeAttemptAction`, `autosaveAnswerAction`, `submitAttemptAction`, `recordIntegrityEventAction`
     - `getExamResultsAction`, `unlockAttemptAction`, `transferResultsToGradebookAction`
   - Permissions terdaftar pada `types.ts` dan `role-permissions.ts`:
     - `cbt.question_bank.manage`
     - `cbt.exam.manage`
     - `cbt.attempt.start`
     - `cbt.attempt.submit`
     - `cbt.results.transfer`
5. **Presentation Layer (Academic Glass UI v1.2):**
    - [`src/modules/cbt/presentation/question-bank-modal.tsx`](file:///C:/laragon/www/Ruang-Pintar/src/modules/cbt/presentation/question-bank-modal.tsx): Pengelolaan bank soal terversifikasi dengan preview soal, pembuat butir satuan, tab Import Masal Spreadsheet (Excel/CSV), dan tab Asisten AI Gemini Kurikulum Merdeka.
    - [`src/modules/cbt/presentation/create-exam-modal.tsx`](file:///C:/laragon/www/Ruang-Pintar/src/modules/cbt/presentation/create-exam-modal.tsx): Composer penyusunan blueprint ujian, penetapan durasi waktu, pengacakan soal, sakelar Token Masuk Ujian (ANBK-Style), dan freezing snapshot.
    - [`src/modules/cbt/presentation/exam-results-modal.tsx`](file:///C:/laragon/www/Ruang-Pintar/src/modules/cbt/presentation/exam-results-modal.tsx): Monitoring proctor langsung, pembukaan kunci siswa terkena strike, visualisasi statistik nilai, dan tombol "Transfer ke Buku Nilai".
    - [`src/modules/cbt/presentation/class-cbt-tab-view.tsx`](file:///C:/laragon/www/Ruang-Pintar/src/modules/cbt/presentation/class-cbt-tab-view.tsx): Tampilan Tab 9 pada Workspace Kelas (`/kelas-saya/[id]`) dilengkapi badge token aktif dan tombol acak ulang token.
    - [`src/modules/cbt/presentation/cbt-token-entry-card.tsx`](file:///C:/laragon/www/Ruang-Pintar/src/modules/cbt/presentation/cbt-token-entry-card.tsx): Layar konfirmasi siswa sebelum pengerjaan untuk memasukkan token 6 karakter pengawas ruang kelas.
    - [`src/modules/cbt/presentation/cbt-player-view.tsx`](file:///C:/laragon/www/Ruang-Pintar/src/modules/cbt/presentation/cbt-player-view.tsx): CBT Player ramah sentuhan (touch-friendly) dengan mode layar penuh, stimulus gambar/diagram dengan modal perbesar (lightbox), antarmuka soal tipe Menjodohkan (Matching Pairs), grid nomor soal, ragu-ragu, server timer countdown, status autosave real-time, dialog peringatan integritas dengan audio chime, dan layar selesai.
    - [`src/app/cbt/[attemptId]/page.tsx`](file:///C:/laragon/www/Ruang-Pintar/src/app/cbt/[attemptId]/page.tsx): Route pengerjaan ujian aman siswa.
    - [`src/app/cbt/start/page.tsx`](file:///C:/laragon/www/Ruang-Pintar/src/app/cbt/start/page.tsx): Route peluncur (*launcher*) sesi ujian siswa dengan deteksi token.

---

## 4.1 Fitur Unggulan Tambahan (CBT Enhancements)

1. **Import Masal Spreadsheet (Excel / CSV) Sesuai Format Standar:**
   - Kolom terstandarisasi: `No | Soal | Pilihan A | Pilihan B | Pilihan C | Pilihan D | Pilihan E | Tingkat Kesulitan Soal (C1/C2/C3) | Jawaban Benar`.
   - Parser cerdas (`cbt-bulk-import-parser.ts`) otomatis mendeteksi pemisah tab (TSV dari Excel/Google Sheets copy-paste) maupun koma (CSV), memetakan taksonomi Bloom C1-C6 menjadi tingkat kesulitan LOTS/MOTS/HOTS, menyediakan validasi pratinjau data, dan tombol unduh template CSV.
2. **Dukungan Stimulus & Gambar Soal:**
   - Guru dapat menyertakan tautan/URL gambar ilustrasi, diagram ilmiah, atau rumus pada setiap butir soal (`gambar_url`).
   - Pada CBT Player siswa, stimulus gambar ditampilkan proporsional di atas teks pertanyaan dengan tombol interaktif untuk membuka modal perbesar gambar (*lightbox*) resolusi penuh.
3. **Tipe Soal Menjodohkan (Matching Pairs):**
   - Mendukung pemasangan butir premis (kolom kiri) dengan target (kolom kanan).
   - Penilaian parsial proporsional dihitung secara adil di server: `Skor = (Pasangan Benar / Total Pasangan) * Bobot`.
   - Desain UI touch-friendly berbasis dropdown selector menjamin kenyamanan pengisian baik di layar sentuh mobile maupun desktop (bebas bug drag-and-drop pada layar kecil).
   - Zero Answer Key Leakage dijamin dengan pengacakan (*shuffling*) urutan target pada manifest klien.
4. **Sistem Token Masuk Ujian (ANBK-Style):**
   - Guru dapat mewajibkan 6 digit token alphanumeric saat menerbitkan ujian. Token dapat diacak ulang sewaktu-waktu oleh guru/pengawas.
   - Siswa wajib memasukkan token yang valid pada layar konfirmasi sebelum sesi pengerjaan dapat dimulai, menjamin sinkronisasi pengerjaan serentak di ruang kelas.
5. **Asisten AI Guru (Google Gemini 2.0 / 1.5 Flash Integration):**
   - Fitur generator butir soal instan berbasis Capaian Pembelajaran Kurikulum Merdeka.
   - Mendukung kunci API Gemini kustom guru yang tersimpan aman di browser (*localStorage*) atau fallback cerdas internal berbasis model penalaran offline.
   - Mematuhi prinsip *Human-in-the-loop*: Soal yang digenerasi AI ditinjau dan divalidasi terlebih dahulu oleh guru sebelum diimpor ke Bank Soal resmi.

### 4.6 Human Review Enhancements & Corrections
1. **Multi-Type Bulk Spreadsheet Import (Single-Document Multi-Part):**
   - Mendukung berkas spreadsheet tunggal yang memuat beragam tipe soal secara simultan (misal: 25 Pilihan Ganda + 20 Menjodohkan + 5 Essay) dengan penanda section header (`[BAGIAN A: PILIHAN GANDA]`, `[BAGIAN B: MENJODOHKAN]`, `[BAGIAN C: ESSAY]`).
   - Parser cerdas dan toleran yang memetakan kolom baik format grid 9-kolom seragam maupun format ringkas.
   - Tersedia tombol instan "Unduh Template CSV" langsung di dalam modal Bank Soal.
2. **Naskah Cetak Soal Ujian Kertas A4 (Format Fisik SMK Otomindo / Yayasan Hosana):**
   - Engine cetak A4 terverifikasi (`/cbt/cetak/[ujianId]`) lengkap dengan Kop Surat resmi, grid metadata ujian, Petunjuk Umum (butir 1–7), Bagian A (PG 2-kolom opsional), Bagian B (Tabel 4 Kolom: `NO | PERTANYAAN | JAWABAN | KET`), Bagian C (Uraian/Esai bergaris), watermark sekolah, dan crop marks sudut.
   - Mode Naskah Siswa (tanpa kunci), Mode Lembar Jawab Siswa (LJM A4) untuk ujian susulan offline, dan Mode Kunci Jawaban & Rubrik Guru.
   - Styling cetak profesional dengan CSS `@media print` dan auto page-break.
3. **Menu Mandiri "Asisten AI Guru" di Sidebar (`/asisten-ai`):**
   - Ditingkatkan menjadi menu utama berikon `Sparkles` dengan badge `AI 2.0`.
   - Engine Google Gemini 2.0 Flash (terbaru, responsif, berkecepatan tinggi), Gemini 2.0 Flash Thinking, dan Gemini 1.5 Pro.
   - 4 Tab Workspace: Paket Soal Campuran (langsung simpan ke Bank Soal), Modul Ajar & RPP Kurikulum Merdeka (PBL/PjBL), Bahan Bacaan Siswa, serta Pengaturan Kunci API pribadi di browser.

---

## 5. Quality Gate Verification

| Quality Gate | Perintah / Alat | Status | Hasil & Bukti |
|---|---|---|---|
| **Format Check** | `npm run format:check` | **PASS** | 100% berkas sesuai standar Prettier repository. |
| **Lint Check** | `npm run lint` | **PASS** | ESLint keluar dengan kode 0 (0 error, 4 warning non-blocking). Bebas cascading render React 19. |
| **Typecheck** | `npm run typecheck` | **PASS** | TypeScript `tsc --noEmit` keluar dengan kode 0 (0 error). |
| **Unit & Integration Tests** | `npm test` | **PASS** | **69/69 test files PASS, 372/372 tests passing (100%)** di seluruh codebase tanpa regresi. |
| **Production Build** | `npm run build` | **PASS** | Next.js 16.3.3 Turbopack berhasil mengompilasi seluruh rute statis & dinamis tanpa error. |
| **Database Verification** | `npx prisma validate` | **PASS** | Skema Prisma 100% valid dan 2 migration Phase 14 (`20260904230000_add_cbt_engine`, `20260905060000_add_cbt_token_and_image`) terverifikasi. |
| **Visual QA Screenshots** | Playwright Chromium (2x DPI) | **PASS** | **25 tangkapan layar komprehensif** (16 walkthrough awal + 9 artefak hasil human review). |

### Daftar Tangkapan Layar Visual QA Hasil Human Review (9 Artefak Baru):
1. `01_cetak_a4_naskah_soal.png` — Naskah Cetak Soal A4 (Kop Surat SMK Otomindo, Petunjuk Umum, PG, Menjodohkan, Esai).
2. `02_cetak_a4_ljm_siswa.png` — Lembar Jawaban Siswa (LJM A4) dengan kotak silang A-E, isian menjodohkan, dan baris esai.
3. `03_cetak_a4_kunci_guru.png` — Kunci Jawaban Guru & Pedoman Penskoran / Rubrik A4.
4. `04_asisten_ai_paket_soal.png` — Studio Asisten AI Guru: Tab Paket Soal Campuran AI (Gemini 2.0 Flash).
5. `05_asisten_ai_paket_soal_hasil.png` — Pratinjau Paket Soal Campuran yang digenerasi oleh AI.
6. `06_asisten_ai_modul_rpp.png` — Studio Asisten AI Guru: Tab Modul Ajar & RPP Kurikulum Merdeka.
7. `07_asisten_ai_settings_gemini.png` — Studio Asisten AI Guru: Tab Pengaturan Model Gemini 2.0 & Kunci API.
8. `08_bank_soal_multi_type_import.png` — Input spreadsheet multi-tipe soal dengan tag bagian.
9. `09_bank_soal_multi_type_table.png` — Pratinjau tabel hasil parse multi-tipe dengan badge warna PG, Menjodohkan, dan Esai.

---

## 6. Known Limitations & Out-of-Scope Confirmation

- **Phase 15 (Assessment Compilation & Student Experience / e-Rapor):**
  Kompilasi rapor semester lintas mapel, pembobotan kurikulum terpusat, dan portal siswa menyeluruh berada di luar batasan Phase 14 dan akan diselesaikan pada Phase 15.
- **Native APK / PWA Standalone / SafeExamBrowser (SEB):**
  Proteksi integritas menggunakan deteksi peramban standar web (*Fullscreen API + Page Visibility & Blur Event + Server-Authoritative 2-Strike Lockout*). Integrasi native container direncanakan sebagai enhanced add-on di masa depan.

---

## 7. Status Akhir

```text
STATUS: APPROVED BY HUMAN (5 September 2026)
```

Seluruh implementasi Phase 14 — CBT (Computer Based Test) beserta seluruh penyempurnaan hasil Human Review (Import Spreadsheet Multi-Tipe, Cetak Kertas Naskah Soal & LJM A4, Menu Mandiri Studio Asisten AI Guru Gemini 2.0 Flash) telah diselesaikan, diuji, lulus seluruh quality gate 100%, dan secara resmi disetujui oleh Human Reviewer.
