# TASKS.md
## Ruang Pintar — Active Implementation Tasks

**Versi:** 4.1  
**Current Active Phase:** PHASE 14 — CBT: COMPUTER BASED TEST (M14)  
**Status:** APPROVED BY HUMAN (5 September 2026)  

---

# 1. ACTIVE TASKS

```text
PHASE 14 — CBT: COMPUTER BASED TEST (M14) [APPROVED BY HUMAN]
```

Tujuan:
> Membangun CBT engine Ruang Pintar yang aman, konsisten, auditable, dan terintegrasi dengan domain akademik (Digital Assessment Ready):
> 1. Mendukung alur: Guru ➔ Kelas Saya ➔ Workspace Kelas ➔ CBT ➔ Bank Soal ➔ Susun Ujian ➔ Atur Blueprint ➔ Publish / Siapkan Ujian ➔ Immutable Exam Snapshot ➔ Peserta mengerjakan CBT ➔ Autosave ➔ Resume bila terputus ➔ Submit ➔ Penilaian sesuai aturan ➔ Hasil CBT ➔ Transfer resmi ke Assessment/Gradebook (Phase 13).
> 2. Menjaga domain invariants wajib:
>    - `Question ≠ Question Version ≠ Exam Blueprint ≠ Exam ≠ Exam Snapshot ≠ Attempt ≠ Answer ≠ Result ≠ Assessment ≠ Grade`
>    - `Question Bank ≠ Exam`
>    - `Immutable Exam Snapshot`: Soal di bank diedit TIDAK mengubah snapshot atau attempt yang sedang berjalan.
>    - `One Active Attempt`: Satu peserta + satu ujian = maksimal satu active attempt.
>    - `Server-Authoritative Timer`: Deadline waktu absolut ditentukan server (`started_at + duration`). Manipulasi jam lokal / refresh browser tidak me-reset waktu.
>    - `Answer Key Security`: Kunci jawaban DILARANG DIKIRIM ke client CBT Player dalam bentuk apa pun. Grading dilakukan di trusted server boundary.
>    - `Ownership Gradebook Tetap Phase 13`: CBT tidak membuat tabel gradebook kedua; hasil CBT ditransfer via official contract.
>    - `Integrity Event = Indikator`, BUKAN vonis kecurangan otomatis sepihak.

---

# 2. Checklist Phase 14 — CBT (Computer Based Test)

## Database & Persistence
```text
[x] Prisma model: BankSoal & VersiSoal (id, sekolah_id, guru_id, mapel_id, tp_id, jenis_soal, konten, opsi_jawaban, kunci_jawaban, bobot, status, versi, created_at, updated_at)
[x] Prisma model: BlueprintUjian & UjianCbt (id, sekolah_id, penugasan_mengajar_id, asesmen_id, judul, deskripsi, durasi_menit, tanggal_mulai, tanggal_selesai, status, acak_soal, acak_opsi, max_attempt, created_at, updated_at)
[x] Prisma model: SnapshotUjian (id, sekolah_id, ujian_id, payload_snapshot, total_soal, total_bobot, created_at)
[x] Prisma model: SesiUjianSiswa / Attempt (id, sekolah_id, ujian_id, snapshot_id, siswa_id, waktu_mulai, batas_waktu_server, waktu_selesai, status, attempt_ke, created_at, updated_at)
[x] Prisma model: JawabanSiswa (id, sekolah_id, sesi_ujian_id, soal_id, jawaban_peserta, ragu_ragu, skor_diperoleh, status_koreksi, waktu_simpan, updated_at)
[x] Prisma model: HasilUjianCbt (id, sekolah_id, sesi_ujian_id, total_soal, dijawab, benar, salah, kosong, nilai_akhir, status, ditransfer_ke_gradebook, waktu_transfer)
[x] Prisma model: EventIntegritasUjian (id, sekolah_id, sesi_ujian_id, jenis_event, deskripsi, payload, waktu_kejadian)
[x] Database constraints: @@unique([ujian_id, siswa_id, attempt_ke]), @@unique([sesi_ujian_id, soal_id]), indexes
[x] Forward migration: add_cbt_engine
```

## Infrastructure & Application Services
```text
[x] CbtRepository: CRUD Bank Soal & Versi, Blueprint & Snapshot Generation, Attempt Lifecycle, Atomic Autosave, Submission, Scoring, Gradebook Transfer
[x] CbtService: Teacher scope verification, Student eligibility check, Attempt resume & validation
[x] CbtTimerService: Server-authoritative countdown & expiration enforcement
[x] CbtGradingService: Server-side objective auto-grading without leaking answer keys to client
[x] CbtTransferService: Idempotent transfer of CBT results into Phase 13 DefinisiAsesmen & NilaiSiswa
```

## Server Actions & Authorization
```text
[x] cbt-actions.ts: Server actions aman dengan requireAuth(), requirePermission(), dan audit logging
[x] Permission checks: cbt.question_bank.manage, cbt.exam.manage, cbt.attempt.start, cbt.attempt.submit, cbt.results.transfer
[x] Teacher scope check: Guru hanya dapat mengelola CBT pada penugasan mengajar rombelnya
[x] Student scope check: Siswa hanya dapat membuka attempt miliknya sendiri pada rombel aktif
```

## Presentation Layer (Academic Glass UI v1.2)
```text
[x] Tab CBT pada Workspace Kelas (/kelas-saya/[id]): Daftar Ujian CBT rombel, status token, & aksi cepat
[x] Halaman Bank Soal: Manajemen soal terversi, pembuat butir satuan, dan pratinjau soal
[x] Import Masal Spreadsheet (Excel / CSV): Format No | Soal | Pilihan A-E | Tingkat Kesulitan C1-C6 | Jawaban Benar
[x] Asisten AI Guru (Google Gemini): Generator butir soal Kurikulum Merdeka otomatis dengan offline fallback
[x] Editor Ujian CBT: Modal/Workflow penyusunan blueprint, sakelar Token Masuk Ujian (ANBK-Style), dan snapshot freezing
[x] Layar Konfirmasi Token CBT (/cbt/start): Verifikasi token pengawas 6 digit sebelum masuk pengerjaan
[x] CBT Player (/cbt/[attemptId]): Interface pengerjaan ujian aman, responsif, timer server, autosave status, stimulus gambar + lightbox modal, tipe soal Menjodohkan (Matching Pairs) touch-friendly, tanpa bocor kunci jawaban
[x] Hasil CBT & Review: Tampilan rekapitulasi nilai peserta, audit log integritas, dan tombol "Transfer ke Buku Nilai"
```

## Quality Gates & Verification
```text
[x] Format check: Prettier 100% clean (npm run format:check)
[x] Lint check: ESLint 0 errors, 0 warnings (npm run lint)
[x] Typecheck: TypeScript tsc --noEmit 0 errors (npm run typecheck)
[x] Tests: Unit & Integration tests passing (src/test/cbt/)
[x] Regression: Seluruh test Phase 00–13 tetap PASS (100%)
[x] Build: Next.js production build PASS
[x] Automated Walkthrough: Praktik workflow nyata CBT end-to-end (Teacher build exam ➔ Student take exam ➔ Autosave ➔ Submit ➔ Result ➔ Transfer to Gradebook)
```

---

# 3. Previous Milestones & Completed Phases

```text
[x] Milestone A — Bootstrap & Platform Foundation (Phase 00–02) [APPROVED]
[x] Milestone B — School Organization & Identity (Phase 03–06) [APPROVED]
[x] Milestone C — Academic Foundation Ready (Phase 07–10) [APPROVED BY HUMAN]
    ├── [x] Phase 07 — Academic Structure (APPROVED)
    ├── [x] Phase 08 — Student Academic Lifecycle (APPROVED & CHECKPOINTED)
    ├── [x] Phase 09 — Teacher & Teaching Assignment (APPROVED BY HUMAN)
    └── [x] Phase 10 — Academic Calendar, Schedule & Class Session (APPROVED BY HUMAN)

[x] Milestone D — Teacher Academic MVP (Phase 11–13) [APPROVED BY HUMAN (4 September 2026)]
    ├── [x] Phase 11 — Teacher Workspace & Learning Administration [APPROVED BY HUMAN (3 September 2026)]
    ├── [x] Phase 12 — Class Session Attendance [APPROVED BY HUMAN (4 September 2026)]
    └── [x] Phase 13 — Assessment, TP & Gradebook [APPROVED BY HUMAN (4 September 2026)]

[ ] Milestone E — Digital Assessment Ready (Phase 14–15) [ACTIVE]
    ├── [x] Phase 14 — CBT: Computer Based Test (M14) [APPROVED BY HUMAN (5 September 2026)]
    └── [ ] Phase 15 — Assessment Compilation & Student Experience (M15)
```

---

# 4. Milestone D Historical Quality Gates (Phase 13)

```text
[x] Database: Migration forward assessment & gradebook verified (20260904101500_add_assessment_and_gradebook)
[x] Domain Invariants: Assessment != Grade != Grade Publication, Missing Grade != Zero Grade
[x] Format check: Prettier 100% clean (npm run format:check)
[x] Lint check: 0 errors, 0 warnings (npm run lint)
[x] Typecheck: TypeScript tsc --noEmit 0 errors (npm run typecheck)
[x] Tests: 65 test files, 347 tests passing (100% PASS)
[x] Build: Next.js production compilation 100% PASS (npm run build)
[x] End-to-End Walkthrough: Playwright automated test & visual screenshots PASS (qa-phase13-full-walkthrough.mjs)
[x] Official Human Approval: APPROVED BY HUMAN (4 September 2026) [LOCKED FOR REGRESSION]
```
