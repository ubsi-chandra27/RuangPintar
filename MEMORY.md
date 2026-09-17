# MEMORY.md
## Ruang Pintar — Current Project Memory

**Versi:** 1.0  
**Fungsi:** State proyek terkini yang dibaca AI sebelum bekerja.  
**Catatan:** MEMORY bukan pengganti dokumen kanonikal.  

---

# 1. Project

```text
Nama:
Ruang Pintar

Positioning:
School Digital Operating Platform

Deployment:
Single-school-per-deployment

Architecture:
Modular Monolith
```

---

# 2. Current Project State

```text
Documentation Baseline:
SELESAI

Current Implementation Phase:
PHASE 20 — INTEGRATION FOUNDATION (M20)

Current Phase Status:
READY FOR HUMAN REVIEW

Last Human-Approved Implementation Phase:
PHASE 19 — LEADERSHIP DASHBOARD, REPORTING & ANALYTICS (M19)

Phase 19 Official Human Approval:
APPROVED BY HUMAN (17 September 2026)
```

---

# 3. Canonical Documents

```text
docs/BRD.md
docs/PRD.md
docs/FRD.md

docs/00-PROJECT-BRIEF.md
docs/01-PRODUCT-REQUIREMENTS.md
docs/02-DOMAIN-MODEL.md
docs/03-MODULE-MAP.md
docs/04-ROLE-ACCESS.md
docs/05-SYSTEM-ARCHITECTURE.md
docs/06-DATA-ARCHITECTURE.md
docs/07-UI-UX-DESIGN-SYSTEM.md
docs/08-IMPLEMENTATION-ROADMAP.md
docs/09-AI-CODING-RULES.md
```

---

# 4. Locked Product Decisions

## Product

```text
Ruang Pintar
=
School Digital Operating Platform modular
```

## Deployment

```text
Satu deployment = satu sekolah
```

Bukan shared-schema SaaS baseline.

## Architecture

```text
Modular Monolith
```

## Framework

```text
Next.js stable secure release
TypeScript
Node.js
```

## UI

```text
Tailwind CSS
shadcn/ui
Base UI
Academic Glass UI v1.2
```

## Database

```text
SQLite
Prisma ORM
ULID 26 karakter
```

## File

```text
Private Local Storage
S3-compatible ready
```

## Queue

```text
Queue-ready
incremental implementation
```

---

# 5. Database Naming

First-party physical database naming:

```text
Bahasa Indonesia
snake_case
```

Contoh:

```text
siswa
guru
mata_pelajaran
penugasan_mengajar
penempatan_rombel
presensi_sesi
nilai
```

Technical metadata dapat mempertahankan istilah umum seperti:

```text
id
url
json
hash
token
metadata
mime_type
created_at
updated_at
```

---

# 6. Base Roles

```text
SUPER_ADMIN
SCHOOL_STAFF
TEACHER
STUDENT
GUARDIAN
```

---

# 7. Position

```text
HEADMASTER
VICE_PRINCIPAL_CURRICULUM
VICE_PRINCIPAL_STUDENT_AFFAIRS
PROGRAM_HEAD
```

---

# 8. Assignments

```text
TEACHING_ASSIGNMENT
HOMEROOM_ASSIGNMENT
POSITION_ASSIGNMENT
```

---

# 9. Staff Capability Bundles

```text
SYSTEM_ADMIN
ACADEMIC_OPERATOR
STUDENT_DATA_OPERATOR
REPORT_OPERATOR
```

---

# 10. Authorization Model

```text
IDENTITY
↓
BASE ROLE
↓
POSITION / ASSIGNMENT / RELATIONSHIP
↓
PERMISSION
↓
RESOURCE SCOPE
↓
EFFECTIVE ACCESS
```

Default deny.

---

# 11. Important Domain Invariants

```text
Student Identity
≠
Student Enrollment
≠
Rombel Placement

Teacher
≠
Subject
≠
Teaching Assignment

Academic Calendar
≠
Master Schedule
≠
Actual Class Session

School Attendance
≠
Class Session Attendance

Material
≠
Material Publication

Assignment Definition
≠
Assignment Publication
≠
Submission

Assessment
≠
Grade
≠
Grade Publication

Missing Grade
≠
Zero Grade

Announcement
≠
Notification

Question Bank
≠
Question Version
≠
Exam Snapshot
≠
Exam Attempt
```

---

# 12. UI Baseline

Academic Glass UI v1.2.

Primary:

```text
Cobalt
Academic Navy
Plus Jakarta Sans
Andale Mono / technical fallback
```

Responsive viewports:

```text
390×844
768×1024
1024×768
1440×900
```

CRUD:

```text
Create/Edit → Dialog
Delete → Confirmation
Success → Close + one toast
Validation → Inline
```

---

# 13. Login Baseline

```text
Username login
Email login = NO
Public registration = DISABLED

Desktop:
58% Hero / 42% Form

Mobile:
Form First
```

---

# 14. Teacher Dashboard Baseline

Priority:

```text
1. Jadwal Hari Ini / Kelas Berikutnya
2. Kelas Saya
3. Perlu Perhatian
4. Tugas / Penilaian
5. Pengumuman
6. Supporting Summary
```

No generic KPI.

No fake chart.

---

# 15. Teacher Academic MVP

Milestone wajib:

```text
Login
↓
Dashboard Guru
↓
Kelas Saya
↓
Lingkup Materi / BAB
↓
TP
↓
Pertemuan
↓
Administrasi Guru
↓
Presensi
↓
Assessment
↓
Gradebook
```

---

# 16. Core Modules

```text
M01 School & Organization
M02 Identity & Access
M03 Platform Configuration
M04 File & Document
M05 Audit & Traceability
M06 Academic Period & Structure
M07 Student Academic Lifecycle
M08 Teacher & Teaching Assignment
M09 Academic Calendar
M10 Scheduling & Class Session
M11 Learning
M12 Attendance
M13 Assessment & Gradebook
M14 CBT
M15 Guardian & Family
M16 Communication
M17 Notification
M18 Student Monitoring
M19 Reporting & Analytics
M20 Integration
M21 AI Assistance
```

---

# 17. External Service Strategy

Core tidak bergantung pada provider eksternal.

Candidate future adapter:

```text
Email → Resend
Push → Firebase Cloud Messaging
WhatsApp → Meta WhatsApp Cloud API
Storage → S3-compatible
Calendar → Google Calendar API
AI → OpenAI Responses API
```

Implementasikan hanya pada phase yang membutuhkan.

---

# 18. Current Active Work

```text
PHASE 09 & 10
Teacher Assignment & Academic Scheduling (Milestone C)
```

Status:

```text
READY FOR FINAL APPROVAL
Jangan mulai Phase 11 sebelum keputusan Human.
```

---

# 19. Memory Update Rule

Setelah phase mendapat Human Approval:

perbarui minimal:

```text
Current Implementation Phase
Current Phase Status
Last Human-Approved Implementation Phase
Latest Git Checkpoint
Important implementation decisions
Known limitations
```

Jangan menghapus historical decision yang masih relevan.

---

# 20. Human Authority

AI tidak boleh menetapkan phase APPROVED.

Human menetapkan:

```text
APPROVED
LOCKED
```

---

# 21. Data Riil Jadwal 2026/2027

Sumber operasional terbaru:

```text
JADWAL PELAJARAN YES 2026.2027 (19 AGUSTUS 2026).pdf
Sekolah: SMK OTOMINDO
Tahun Ajaran: 2026/2027
```

Keadaan database utama setelah sinkronisasi:

```text
38 guru aktif
41 mata pelajaran aktif
21 rombel aktif
303 penugasan mengajar aktif
21 penugasan wali kelas aktif
33 slot waktu aktif
1.008 alokasi jadwal pada versi PUBLISHED
```

Keputusan implementasi:

```text
Versi lama dipertahankan sebagai ARSIP.
Data dummy aktif dinonaktifkan atau dipetakan ulang tanpa merusak relasi historis.
41 konflik guru yang memang terdapat pada dokumen sumber dicatat pada catatan versi.
Pasangan kode guru agama disimpan sebagai guru utama + co-teacher pada catatan alokasi.
Jenis kelamin guru wajib diverifikasi operator karena tidak tersedia pada PDF.
Ruangan tetap kosong karena dokumen sumber tidak memuat data ruangan.
```

# 22. Revisi Papan Jadwal dan Slot Waktu

Catatan revisi 31 Agustus 2026: Papan Jadwal mingguan, perspektif rombel/guru, mode Daftar, perbaikan UI Slot Waktu, dan fitur Quick Fill / Direct Slot Booking pada kartu slot kosong (baik perspektif Rombel maupun Guru dengan auto-prefill modal) telah diimplementasikan atas permintaan Human. Urutan internal 201/301 tidak lagi ditampilkan sebagai nomor JP. Pola hari dan konflik interval divalidasi server. Data riil tetap 33 slot aktif / 1.008 alokasi. Detail quality gate dan keterbatasan: `docs/phases/PHASE-10-SCHEDULE-BOARD-UI-REVIEW.md`. Status: READY FOR FINAL APPROVAL.

---

# 23. Hasil Human Review & Koreksi Interaktif Phase 09–10 (2 September 2026)

Koreksi menyeluruh yang diselesaikan atas instruksi Human Review:
1. **Root Cause P2003 & Proteksi Histori Akademik:** Mengeliminasi bug `PrismaClientKnownRequestError P2003` saat menghapus guru nonaktif. Menerapkan audit dependensi 8-titik (penugasan, wali kelas, jadwal, sesi kelas aktual, pengganti, materi, tugas, administrasi). Jika entitas memiliki histori, hard-delete ditolak di application/domain level dan tombol digantikan dengan *Arsipkan*. Pesan error ramah domain tanpa membocorkan stack trace.
2. **Migrasi Status Lifecycle Database:** Migrasi `20260902090000_add_teacher_subject_lifecycle_status` menambahkan kolom `status_lifecycle` (`AKTIF`, `NONAKTIF`, `ARSIP`) pada tabel `guru` dan `mata_pelajaran` dengan indeks pendukung.
3. **Checkbox Multi-Select & Bulk Action Toolbar:** Checkbox baris di posisi `[CHECKBOX] [FOTO] [IDENTITAS]` dengan dukungan header `checked`, `unchecked`, `indeterminate`. Floating toolbar (`X data dipilih`) dengan aksi Arsipkan, Nonaktifkan/Selesaikan, Hapus Permanen (smart fallback ke arsip jika ada item berhistori), dan Batal Pilih.
4. **Avatar Guru Standar:** 44px (`w-11 h-11`), proporsional, lingkaran sempurna (`rounded-full`), `object-cover shrink-0 aspect-square border border-slate-200/80 shadow-2xs`, tidak terdistorsi.
5. **Filter Status Default:** Default filter disetel ke `Aktif` di Data Guru, Mata Pelajaran, dan Penugasan Mengajar.
6. **Consecutive Slot Merging & Tampilan Mobile Jadwal Saya:**
   - Jam pelajaran berurutan (misal 2 JP, 3 JP, 4 JP) digabung otomatis menjadi 1 Card Sesi Terpadu (`06:30 - 07:50 • 2 JP (Jam ke-1 – 2)`).
   - Tombol "Buka Kelas" diperjelas: untuk hari ini aktif dengan highlight dan badge "Sesi Hari Ini (Aktif)", sedangkan untuk hari lain tampil sebagai info "Terjadwal hari [Hari]".
   - Filter hari dan tombol CSV disatukan menjadi 1 baris terpadu tanpa baris kedua kosong.
   - Metrik atas mobile diubah menjadi 1 baris 3 kolom ringkas (`grid-cols-3`).
7. **Suite Pengujian Wajib:** Penambahan `teacher-lifecycle-and-selection.test.tsx` (15 tests) dan test penggabungan slot di `schedule-views.test.tsx`. Total test suite meningkat menjadi 57 file, 294 tests (100% PASS).

---

# 24. Implementasi Phase 11 — Teacher Workspace & Learning Administration (M11)

Catatan implementasi Phase 11 (2 September 2026):
1. **Daftar Kelas Saya (`/kelas-saya`):** Menyajikan direktori kartu kelas rombel & mapel yang diampu guru, metrik jumlah JP mingguan, total siswa binaan, jumlah BAB, materi, tugas, dan jurnal KBM. Dilengkapi pencarian responsif dan status jadwal hari ini.
2. **Workspace Kelas Terpadu (`/kelas-saya/[id]`):** Implementasi penuh `WORKSPACE-KELAS` sesuai anatomi roadmap:
   - **Tab Ringkasan:** KPI kelas, alokasi jadwal KBM, dan tombol aksi cepat (*Quick Actions*).
   - **Tab Jadwal:** Daftar alokasi jadwal mingguan resmi rombel dan mata pelajaran ini.
   - **Tab Lingkup Materi (BAB) & TP:** Pengelolaan hierarki BAB materi pembelajaran dan Tujuan Pembelajaran (TP) per BAB dengan modal tambah, urutan otomatis, dan kontrol hapus aman.
   - **Tab Materi Pembelajaran:** Penerbitan modul format dokumen, teks bacaan langsung, atau tautan daring (web/video) yang langsung terpublikasi ke kelas.
   - **Tab Jurnal KBM (Administrasi Guru):** Pencatatan agenda KBM per pertemuan (nomor pertemuan, tanggal, materi yang disampaikan, kegiatan pembelajaran, catatan refleksi & kendala, status realisasi, serta keterkaitan multi-pilih ke Tujuan Pembelajaran).
   - **Tab Tugas Pembelajaran:** Penerbitan penugasan siswa dengan kriteria pengumpulan berkas/teks, batas waktu (*deadline*), dan opsi toleransi keterlambatan.
   - **Tab Presensi:** Tautan cepat terintegrasi ke Sesi Pembelajaran Aktual & Presensi KBM.
   - **Tab Penilaian & CBT:** State terkendali (*controlled placeholders*) yang secara transparan menginformasikan kesiapan fitur pada Phase 13 (Assessment & Gradebook) dan Phase 14 (CBT Engine).
3. **Otorisasi & Server Guard:** Dilindungi melalui `requirePermission("learning.material.view")` dan `requirePermission("learning.material.manage")`. Akses workspace kelas hanya dapat dibuka oleh guru pengampu penugasan tersebut atau Super Admin (default deny).
4. **Quality Gates:** Seluruh quality gates (format, lint, typecheck, tests, build) lulus 100% dengan total 59 file pengujian dan 311 test case passing.

---

# 25. Keputusan Resmi Human Approval Phase 11 (3 September 2026)

Human Reviewer secara resmi memberikan persetujuan (*approval*) pada 3 September 2026:
- Seluruh 8 langkah pengujian otomatis end-to-end terverifikasi lolos 100% (autentikasi guru, daftar kelas saya, tambah & edit BAB, tambah & edit TP, terbitkan materi & unggah berkas dokumen via dropzone, catat jurnal KBM, terbitkan tugas kelas, dan pembaruan profil mandiri).
- Fitur unduh dokumen materi terbukti melayani unduhan secara aman dan terproteksi dari `/api/berkas/[id]`.
- Phase 11 dinyatakan **APPROVED & LOCKED**.

---

# 26. Inisiasi PHASE 12 — CLASS SESSION ATTENDANCE (M12)

Tujuan: Membangun sistem presensi sesi kelas aktual terpadu untuk Teacher Academic MVP.

1. **Prinsip & Invariant Wajib:**
   ```text
   School Attendance ≠ Class Session Attendance
   ```
   Kehadiran siswa di gerbang sekolah tidak sama dengan kehadiran di sesi kelas tertentu. Keduanya adalah fakta terpisah.

2. **Domain Rules (FR-ATT-001 s/d FR-ATT-007):**
   - Presensi hanya dapat dibuka pada `SesiKelasAktual` yang sah.
   - Daftar siswa otomatis diambil dari `PenempatanRombel` berstatus `AKTIF` untuk rombel sesi tersebut.
   - Status baseline: `HADIR`, `IZIN`, `SAKIT`, `ALPHA`, `DISPENSASI`, `TERLAMBAT`.
   - Guru pengampu penugasan mengajar berhak mencatat dan menyimpan presensi. Guru tidak dapat memanipulasi presensi kelas di luar penugasannya.
   - Koreksi presensi harus diaudit dengan jelas (`AuditLogger`).
   - UI Presensi harus cepat (*one-click mark all present / tandai semua hadir*) dan tidak membutuhkan klik berlebihan.

---

# 27. Implementasi Phase 12 — Class Session Attendance (M12)

Catatan penyelesaian Phase 12 (3 September 2026):
1. **Model Data & Migrasi:** Menambahkan model `PresensiSesiKelas` dengan relasi ke `Sekolah`, `SesiKelasAktual`, `Siswa`, dan `PenempatanRombel`. Constraint unik `@@unique([sesi_kelas_id, siswa_id])` mencegah duplikasi data presensi per siswa per sesi. Migrasi `20260903180000_add_class_session_attendance` diterapkan forward secara aman.
2. **Domain & Application Layer:**
   - DTO & validasi skema Zod pada `src/modules/attendance/domain/`.
   - `AttendanceRepository` menangani pengambilan roster siswa aktif, transactional upsert data presensi rombel, agregasi statistik kehadiran, dan riwayat presensi penugasan mengajar.
   - `AttendanceService` menerapkan default-deny teacher scoping (hanya guru pengampu penugasan atau Super Admin yang dapat menyimpan presensi), otomatisasi transisi status sesi kelas menjadi `DIMULAI`, dan pencatatan audit log `recordAuditEvent`.
3. **Server Actions & Permissions:**
   - `getSessionAttendanceAction`, `saveSessionAttendanceAction`, `getAssignmentAttendanceHistoryAction` dilindungi `requireAuth()` dan pengecekan permission `attendance.session.view` serta `attendance.session.record`.
4. **Academic Glass UI v1.2 Presentation:**
   - `SessionAttendanceModal`: Modal dialog dan mobile sheet berkecepatan tinggi dengan fitur "Tandai Semua Hadir" (1-click), toggle status segmen berwarna semantik, input catatan otomatis untuk status non-hadir, kalkulasi persentase dan rincian KPI live, serta pencatatan audit alasan koreksi.
   - `ClassAttendanceTabView`: Terintegrasi pada Tab "Presensi" di `/kelas-saya/[id]` menyajikan 4 kartu metrik KPI kehadiran rombel, status sesi, badge breakdown kehadiran (Hadir, Izin, Sakit, Alpha), serta tombol aksi "Buka / Koreksi Presensi".
   - Integrasi tombol aksi "Presensi" langsung pada baris tabel `/sesi-pembelajaran`.
5. **Verifikasi Quality Gates:**
   - TypeScript `tsc --noEmit`: 0 errors.
   - ESLint: 0 errors, 0 warnings.
   - Prettier: 100% compliant.
   - Vitest: 61 test files, 323 tests passing (100% PASS).
   - Next.js Production Build: 100% PASS (15.6s).
   - Playwright End-to-End Walkthrough: 10 skenario visual berhasil 100% tersimpan di `docs/phases/screenshots/phase-12-walkthrough/`.
   - Status: **APPROVED BY HUMAN (4 September 2026)**.

---

# 28. Implementasi Phase 13 — Assessment, TP & Gradebook (M13)

Catatan implementasi Phase 13 (4 September 2026):
1. **Puncak Teacher Academic MVP (Milestone D):** Menuntaskan siklus pengajaran guru dengan sistem penilaian berbasis Kurikulum Merdeka (Tujuan Pembelajaran / TP & Lingkup Materi / BAB) serta Matriks Buku Nilai Terpadu (*Gradebook Matrix*).
2. **Penegakan Invariant Domain Fundamental:**
   - **$\text{Assessment Definition} \neq \text{Grade} \neq \text{Grade Publication}$**: Pemisahan tegas antara kontrak asesmen (judul, kategori formatif/sumatif, bobot, teknik, KKTP, TP), lembar penilaian autentik siswa (`NilaiSiswa`), dan pelepasan resmi ke audiens sasaran (`PublikasiNilaiAsesmen`: Siswa, Wali Murid, atau Semua).
   - **$\text{Missing Grade} \neq \text{Zero Grade}$**: Siswa yang belum dinilai bernilai `null` (tampil `-`) dan BUKAN `0`. Angka `0` adalah nilai absolut, sedangkan `null` menandakan proses asesmen belum terjadi. Perhitungan rerata kelas dan ketuntasan KKTP hanya membagi siswa yang telah dinilai (*assessed count*).
   - **Dilarang Kolom Permanen Statis**: Tidak ada kolom `nilai_tp1` atau `nilai_tp2`. Matriks nilai digabungkan secara dinamis dari entri first-class `DefinisiAsesmen`.
3. **Model Database & Migrasi (M13):**
   - Migrasi forward: `20260904101500_add_assessment_and_gradebook`.
   - Tabel: `definisi_asesmen` (`DefinisiAsesmen`), `nilai_siswa` (`NilaiSiswa` dengan `nilai_angka Float?`), dan `publikasi_nilai_asesmen` (`PublikasiNilaiAsesmen`).
   - Indeks dan constraint: `@@unique([asesmen_id, siswa_id])` dan `@@index([asesmen_id, status])`.
4. **Arsitektur & Server Actions:**
   - Domain Layer: `assessment-types.ts`, `assessment-errors.ts`, `assessment-validation.ts` (Zod schemas).
   - Infrastructure Layer: `assessment-repository.ts` (Atomic Prisma transactions, upsert nilai siswa, kalkulasi statistik kelas, matriks buku nilai).
   - Application Layer: `assessment-service.ts` (Teacher scope security guard, default-deny, audit logging via `recordAuditEvent`).
   - Server Actions: `createAssessmentAction`, `updateAssessmentAction`, `deleteAssessmentAction`, `getAssessmentGradesAction`, `saveAssessmentGradesAction`, `publishAssessmentAction`, `getClassGradebookAction` pada `src/app/actions/assessment-actions.ts`.
5. **Academic Glass UI v1.2 Presentation:**
   - `CreateAssessmentModal`: Modal pembuatan asesmen baru berbasis TP & Lingkup Materi.
   - `InputGradesModal`: Lembar input nilai interaktif cepat dengan auto-populasi rombel aktif, quick fill KKTP, validasi 0–100, dan draft vs publish.
   - `PublishAssessmentModal`: Dialog pelepasan publikasi resmi ke siswa dan orang tua/wali.
   - `ClassAssessmentTabView`: Tab 8 Workspace Kelas (`/kelas-saya/[id]`) yang menyajikan sub-tab Daftar Asesmen & Matriks Buku Nilai Dinamis dengan metrik rerata kelas dan persentase KKTP.
   - `TeacherGradebookOverviewView`: Halaman terpusat Buku Nilai Guru (`/penilaian`) yang merangkum seluruh kelas penugasan mengajar.
6. **Koreksi Human Review & Verifikasi Final:**
   - Resolusi lint error `react-hooks/set-state-in-effect` pada `input-grades-modal.tsx` dengan refaktor `handleClose` dan sinkronisasi dependensi.
   - Pengecekan Prettier di seluruh repository: 100% compliant.
   - Verifikasi Typecheck (`tsc --noEmit`): 0 errors.
   - Verifikasi ESLint: 0 errors, 0 warnings.
   - Verifikasi Unit & Integration Tests (`vitest`): 65 test files, 347 tests passing (100% PASS).
   - Verifikasi Production Build (`next build`): 100% PASS (13 rute terkompilasi optimal).
   - Verifikasi visual Playwright Walkthrough: 11 skenario di `docs/phases/screenshots/phase-13-walkthrough/`.
   - Status: **APPROVED BY HUMAN (4 September 2026)**.

---

# 29. Inisiasi PHASE 14 — CBT (COMPUTER BASED TEST) (M14)

Persetujuan resmi Phase 13 diberikan oleh Human Reviewer pada 4 September 2026. Milestone D (Teacher Academic MVP) dinyatakan **APPROVED & LOCKED**.

Inisiasi Phase 14 — CBT (Computer Based Test):
1. **Target:** Digital Assessment Ready.
2. **Arsitektur Pemisahan Entitas (Domain Invariants Wajib):**
   ```text
   Question ≠ Question Version ≠ Exam Blueprint ≠ Exam ≠ Exam Snapshot ≠ Attempt ≠ Answer ≠ Result ≠ Assessment ≠ Grade
   Question Bank ≠ Exam
   ```
3. **Prinsip Kunci:**
   - **Bank Soal & Versioning:** Soal reusable memiliki versioning (`QuestionVersion`). Modifikasi soal di kemudian hari tidak boleh merusak riwayat/attempt ujian lama.
   - **Immutable Exam Snapshot:** Sebelum peserta mengerjakan ujian, sistem membekukan snapshot ujian (konfigurasi, versi soal, opsi, bobot, durasi). Attempt selalu mengacu pada snapshot yang immutable.
   - **One Active Attempt:** Satu peserta + satu ujian = maksimal 1 active attempt.
   - **Server-Authoritative Timer:** Deadline waktu dihitung di server (`started_at + duration`). Browser client hanya menampilkan visual countdown. Refresh/interupsi koneksi tidak me-reset sisa waktu server.
   - **Autosave & Resume:** Penyimpanan jawaban otomatis berkala yang idempotent dan dapat dilanjutkan jika terjadi gangguan jaringan.
   - **Answer Key Security (Critical):** Kunci jawaban (`answer_key`, `is_correct`) DILARANG DIKIRIM ke client CBT Player. Penilaian objektif dilakukan di server boundary.
   - **Integrasi Phase 13 Resmi:** Hasil CBT ditransfer ke Assessment & Gradebook melalui contract resmi tanpa menduplikasi kepemilikan Gradebook.
   - **Integrity Indicator:** Deteksi perubahan fokus/tab sebagai indikator audit tanpa vonis kecurangan otomatis sepihak.

---

# 30. Implementasi Phase 14 — CBT: Computer Based Test (M14)

Catatan implementasi Phase 14 (4 September 2026):
1. **Pondasi Digital Assessment (Milestone E):** Menghadirkan mesin CBT terpadu sekolah dengan pemisahan entitas yang ketat (`BankSoal` -> `VersiSoal` -> `UjianCbt` -> `SnapshotUjian` -> `SesiUjianSiswa` -> `JawabanSiswa` -> `HasilUjianCbt`).
2. **Kepatuhan Invariant Domain & Keamanan Ujian:**
   - **Immutable Exam Snapshot:** Snapshot ujian dibekukan saat publikasi sehingga perubahan di bank soal tidak merusak attempt ujian berjalan atau historis.
   - **Zero Answer Key Leakage:** Manifest soal ke client siswa secara mutlak dibersihkan dari atribut `kunci_jawaban` dan flag `is_correct`. Auto-grading dieksekusi murni di trusted server boundary.
   - **Server-Authoritative Timer & Autosave:** Batas waktu dihitung absolut oleh server (`batas_waktu_server = waktu_mulai + durasi_menit`). Status autosave real-time dan mekanisme resume aman dari koneksi terputus.
   - **Anti-Cheat 2-Strike System:** Peringatan visual dan audio chime edukatif pada pelanggaran keluar layar penuh / ganti jendela pertama; penguncian sesi otomatis (*LOCKED*) pada pelanggaran kedua, dengan hak pembukaan (*unlock*) eksklusif oleh guru pengawas melalui panel proctor.
   - **Bridge Tunggal Buku Nilai:** Hasil CBT ditransfer secara idempoten ke `DefinisiAsesmen` dan `NilaiSiswa` Phase 13 tanpa menduplikasi data gradebook.
3. **Database Schema & Migrasi:**
   - Migrasi forward: `20260904230000_add_cbt_engine`.
   - 8 Model: `BankSoal`, `VersiSoal`, `UjianCbt`, `SnapshotUjian`, `SesiUjianSiswa`, `JawabanSiswa`, `HasilUjianCbt`, `EventIntegritasUjian`.
4. **Presentation Layer (Academic Glass UI v1.2):**
   - Central Hub CBT (`/cbt-ujian`): Direktori kelas & bank soal untuk Guru/Admin, dan portal ujian terjadwal untuk Siswa.
   - Tab 9 CBT pada Workspace Kelas (`/kelas-saya/[id]`).
   - Modal Bank Soal (`QuestionBankModal`), Modal Pembuatan Ujian & Blueprint (`CreateExamModal`), Modal Hasil Ujian & Proctor Monitor (`ExamResultsModal`).
   - CBT Player (`/cbt/[attemptId]`) dan Launcher (`/cbt/start`).
5. **Quality Gates & Bukti Visual:**
   - TypeScript `tsc --noEmit`: 0 errors.
   - ESLint: 0 errors, 0 warnings.
   - Prettier: 100% compliant.
   - Vitest: 100% PASS (17 CBT tests, 7 navigation tests, all pass).
   - Playwright Visual Walkthrough: 10 skenario screenshot tersimpan di `docs/phases/screenshots/phase-14-walkthrough/` (Portal Guru, Bank Soal, Workspace Tab CBT, Blueprint Modal, Monitor & Proctor, Portal Siswa, Desktop Player, Anti-Cheat Strike 1 Warning, Mobile 390px, dan Layar Selesai).
6. **Dokumentasi Inisiatif Masa Depan (RFC):**
   - File kanonikal `docs/future-initiatives/RFC-AI-ASSISTANT-WHATSAPP-GUARDIAN.md` mencatat arsitektur Guru AI Copilot (M20/M21), WhatsApp Notification Adapter (M16/M17), dan Multi-Child Single Guardian Login (M15 / PR-GUARDIAN-005).
7. **Status:**
   - **APPROVED BY HUMAN (5 September 2026)**.

---

# 31. Implementasi Phase 15 — Student Experience (M15)

Catatan implementasi Phase 15 (7 September 2026):
1. **Pondasi Student Experience (Milestone E):** Menghadirkan portal komprehensif bagi siswa untuk mengakses kegiatan akademik, materi pembelajaran, pengumpulan tugas mandiri, evaluasi presensi sesi kelas, peninjauan nilai terpublikasi resmi, dan transkrip e-Rapor Kurikulum Merdeka.
2. **Kepatuhan Invariant Domain & Keamanan Siswa:**
   - **Student Self-Scope (`STUDENT_SELF`):** Query repository dan service layer mengunci akses strictly pada ID siswa pemilik akun aktif (`user.id` -> `siswa.id`), mencegah akses cross-student.
   - **Zero Draft Grade Leakage (`FR-SXP-004`):** Nilai yang tampil di portal siswa disaring secara ketat hanya yang berstatus `PUBLISHED` dengan target `SISWA` atau `SEMUA`.
   - **Missing Grade != Zero Grade:** Mata pelajaran atau asesmen yang belum dinilai ditampilkan dengan simbol `-` (bukan angka 0).
   - **Toleransi Batas Waktu Tugas:** Pengumpulan tugas tervalidasi terhadap bendera `izinkan_terlambat` milik guru.
   - **Audit Trail:** Penyerahan tugas dicatat ke log audit sistem (`SUBMIT_ASSIGNMENT`).
3. **Presentation Layer (Academic Glass UI v1.2):**
   - Dashboard Siswa data-driven live (`/dashboard`).
   - Portal KBM Siswa (`/tugas-siswa`): Tab Tugas Kelas, Materi Pelajaran, dan Presensi Kelas.
   - Modal Pengumpulan Tugas (`SubmitAssignmentModal`) dengan textarea uraian dan dropzone berkas.
   - Modal Pembaca Materi (`MaterialDetailModal`) dengan teks, berkas lampiran unduh `/api/berkas/[id]`, dan tautan luar.
   - Buku Nilai & e-Rapor (`/rapor-siswa`): Ringkasan capaian KKTP, nilai akhir, predikat, dan rincian seluruh asesmen.
   - Modal Cetak Rapor Resmi A4 (`ReportCardPrintModal`): Layout cetak dokumen resmi A4 standar Kurikulum Merdeka (`window.print()`).
   - Canonical Navigation teraktivasi (`isPhaseDeferred: false`).
4. **Quality Gates & Bukti Visual:**
   - TypeScript `tsc --noEmit`: 0 errors.
   - ESLint: 0 errors.
   - Prettier: 100% compliant.
   - Vitest: 71 test files, 385 tests passed (100% PASS).
   - Next.js Build: 16 route pages compiled successfully.
   - Playwright Walkthrough: 10 screenshot tersimpan di `docs/phases/screenshots/phase-15-walkthrough/`.
5. **Status:**
   - `READY FOR HUMAN REVIEW`.

---

# 32. Implementasi Phase 16 — Guardian Experience (M15)

Catatan implementasi Phase 16 (7 September 2026):
1. **Pondasi Guardian Experience (Milestone F):** Menghadirkan portal orang tua / wali murid (`GUARDIAN`) yang terintegrasi secara data-driven dan aman untuk memantau kehadiran harian anak, ketuntasan tugas kelas, agenda ujian CBT, perkembangan capaian asesmen terpublikasi resmi, e-Rapor Kurikulum Merdeka, serta layanan pengajuan surat izin sakit / dispensasi.
2. **Kepatuhan Invariant Domain & Authorization:**
   - **Relationship-Scoped Authorization (`GUARDIAN_RELATIONSHIP`):** Akses data anak hanya melalui hubungan resmi yang sah dan terverifikasi sekolah (`WaliMurid` -> `HubunganWaliSiswa` -> `Siswa`). Server menolak tegas upaya akses data siswa yang tidak terhubung (`ChildNotLinkedError`, `UnverifiedRelationshipError`).
   - **Multi-Child & Multi-Guardian Support:** Satu wali dapat memiliki lebih dari satu anak (`ChildSwitcherDropdown` di antarmuka), dan satu anak dapat memiliki lebih dari satu wali (Ayah dan Ibu terverifikasi terpisah).
   - **Invariant Guardian ≠ Student proxy:** Portal wali tidak menyediakan fitur pengumpulan tugas atau pengerjaan soal CBT atas nama siswa.
   - **Zero Draft Grade Leakage (`FR-SXP-004`):** Nilai yang tampil di area wali murid strictly hanya yang berstatus `PUBLISHED` dengan target publikasi mencakup `WALI` atau `SEMUA`.
   - **Missing Grade != Zero Grade:** Nilai yang belum ada tampil sebagai tanda strip `-` (bukan angka 0).
   - **Audit Trail:** Pengajuan izin sakit/dispensasi dicatat secara terstruktur ke tabel audit log platform (`recordAuditEvent`).
3. **Database Schema & Migrasi:**
   - Migrasi forward: `20260907130000_add_guardian_and_family`.
   - 3 Model Relasional: `WaliMurid`, `HubunganWaliSiswa`, `PengajuanWali`.
4. **Presentation Layer (Academic Glass UI v1.2):**
   - Dashboard Wali Murid live data-driven (`/dashboard`).
   - Dropdown Pemilih Konteks Anak (`ChildSwitcherDropdown`) dengan dukungan multi-child cookie-based context.
   - Modal Pengajuan Izin/Sakit (`PengajuanIzinModal`) dengan dropzone unggah berkas surat dokter.
   - Presensi Anak (`/presensi-anak`): 6 kartu KPI kehadiran semester dan tabel log absensi per sesi KBM.
   - Perkembangan Nilai & Rapor Anak (`/nilai-anak`): Tabulasi nilai asesmen terpublikasi resmi & Tab buku e-Rapor Kurikulum Merdeka.
   - Modal Cetak Lembar Rapor Resmi A4 (`GuardianReportPrintModal`) format print-ready (`window.print()`).
   - Menu navigasi kanonikal `/presensi-anak` dan `/nilai-anak` diaktifkan resmi (`isPhaseDeferred: false`).
5. **Quality Gates & Bukti Visual:**
   - TypeScript `tsc --noEmit`: 0 errors.
   - ESLint: 0 errors, 4 warnings non-blocking.
   - Prettier: 100% compliant.
   - Vitest: 73 test files, 400 tests passing (100% PASS).
   - Next.js Production Build: 18 static & dynamic route pages compiled successfully.
   - Playwright Visual Walkthrough: 9 screenshot tersimpan di `docs/phases/screenshots/phase-16-walkthrough/`.
6. **Status:**
   - **APPROVED BY HUMAN (10 September 2026)**.

---

# 33. Implementasi Phase 17 — Communication & Notification (M16 & M17)

Catatan penyelesaian Phase 17 (11 September 2026):
1. **Pondasi Komunikasi & Notifikasi Resmi:** Menghadirkan portal pengumuman resmi (`/pengumuman`) dengan server-side audience filtering (`SEMUA`, `GURU`, `SISWA`, `WALI`, `ROMBEL`) dan notifikasi in-app live di Shell Topbar.
2. **Kepatuhan Invariant Domain & Otorisasi:**
   - `Announcement ≠ Notification ≠ Domain Source` diimplementasikan secara tegas.
   - Fail-safe delivery: kegagalan outbox eksternal tidak membatalkan transaksi domain sumber (`FR-NOT-003`).
   - Audit trail `recordAuditEvent` pada setiap mutasi pengumuman (buat, edit, arsip, hapus).
3. **Database Schema & Migrasi:**
   - Migrasi forward: `20260910190000_add_communication_and_notification`.
   - 4 Model: `Pengumuman`, `SasaranPengumuman`, `NotifikasiPengguna`, `PreferensiNotifikasi`.
4. **Presentation Layer (Academic Glass UI v1.2):**
   - Live `NotificationEntry` popover di Shell Topbar dengan badge counter real-time.
   - Halaman `/pengumuman` dengan filter kategori instan, kartu disematkan (*pinned*), dan dialog baca lengkap.
   - Modal pembuatan pengumuman `CreateAnnouncementModal` dengan upload berkas lampiran.
   - Rute kanonikal `/pengumuman` diaktifkan di `CANONICAL_NAVIGATION_CONFIG`.
5. **Quality Gates & Bukti Visual:**
   - Typecheck: 0 errors.
   - ESLint: 0 errors.
   - Prettier: 100% compliant.
   - Vitest: 77 test files, 421 tests passed (100% PASS).
   - Next.js Build: 19 route pages compiled successfully.
   - Playwright Walkthrough: 9 screenshot tersimpan di `docs/phases/screenshots/phase-17-walkthrough/`.
6. **Status:**
   - **APPROVED BY HUMAN (11 September 2026)**.

---

# 34. Implementasi Phase 18 — Student Monitoring & Homeroom (M18)

Catatan penyelesaian Phase 18 (11 September 2026):
1. **Pondasi Monitoring Wali Kelas & Pusat Perhatian:**
   - Portal dedikasi `/wali-kelas` untuk wali kelas dan super admin.
   - Ringkasan KPI rombel (total siswa, rerata kehadiran, siswa perlu perhatian, tugas tertunda).
   - Roster siswa interaktif dengan agregasi indikator holistik (presensi, ketuntasan tugas, capaian asesmen, status perhatian).
   - Pusat Perhatian (*Attention Center*) dengan deteksi otomatis anomali kehadiran (alpha/terlambat), tugas tertunda, dan nilai < KKTP.
2. **Kepatuhan Invariant Domain & Otorisasi:**
   - `M18 Student Monitoring ≠ Source of Truth`: Indikator merupakan derived/read model dari M11, M12, M13.
   - `Wali Kelas ≠ Pemilik Nilai / Presensi Guru Lain`: Wali kelas membaca dan membina lewat catatan/tindak lanjut, tidak mengubah data sesi guru mapel.
   - Otorisasi server-side terkunci ketat via `PenugasanWaliKelas` aktif (default deny untuk peran lain, supervisi penuh untuk Super Admin).
   - Audit trail tersimpan via `recordAuditEvent` pada setiap mutasi catatan dan follow-up.
3. **Database Schema & Migrasi:**
   - Migrasi forward: `20260911220000_add_student_monitoring_and_homeroom`.
   - Model `CatatanMonitoring` & `TindakLanjutMonitoring` terhubung dengan `Sekolah`, `Pengguna`, `Rombel`, dan `Siswa`.
4. **Presentation Layer (Academic Glass UI v1.2):**
   - Halaman portal `/wali-kelas` dengan 4 sub-tab utama (Ringkasan & KPI, Roster Siswa, Attention Center, Catatan Pembinaan & Follow-up).
   - Modal Pembinaan (`CreateMonitoringNoteModal`) dan Rencana Tindak Lanjut (`CreateFollowUpModal`).
   - Modal Investigasi Holistik Siswa (`StudentMonitoringDetailModal`) dengan tab Presensi, Tugas, Nilai Asesmen, dan Riwayat Pembinaan.
   - Shortcut KPI Wali Kelas pada Dashboard Guru (`/dashboard`) dan rute `/wali-kelas` di `CANONICAL_NAVIGATION_CONFIG`.
5. **Quality Gates & Bukti Visual:**
   - TypeScript `tsc --noEmit`: 0 errors.
   - ESLint: 0 errors.
   - Prettier: 100% compliant.
   - Vitest: 79 test files, 442 tests passing (100% PASS).
   - Next.js Production Build: 31 static & dynamic routes compiled successfully.
   - Playwright Visual Walkthrough: 10 screenshot tersimpan di `docs/phases/screenshots/phase-18-walkthrough/`.
6. **Status:**
   - **APPROVED BY HUMAN (11 September 2026)**.

---

# 35. Implementasi PHASE 19 — LEADERSHIP DASHBOARD, REPORTING & ANALYTICS (M19)

Catatan penyelesaian Phase 19 (12 September 2026):
1. **Pondasi Leadership Dashboard & Analytics (Milestone G):**
   - Menghadirkan portal kepemimpinan terpadu `/pimpinan` untuk pejabat struktural sekolah (Kepala Sekolah, Wakasek Kurikulum, Wakasek Kesiswaan, Kepala Program Keahlian) dan Super Admin.
   - Menyajikan derived read models lintas modul (M01, M06, M07, M08, M10, M11, M12, M13, M18).
2. **Kepatuhan Invariant Domain & Otorisasi:**
   - `Report ≠ Source of Truth`: Seluruh analitik dan laporan merupakan read projection dari transaksi sumber.
   - `Leadership Monitoring ≠ Full Administrative Write Access`: Pimpinan memantau performa evaluatif tanpa wewenang mengubah nilai asesmen maupun presensi KBM guru.
   - Otorisasi server-side berbasis `PenugasanJabatan` aktif (`HEADMASTER`, `VICE_PRINCIPAL_CURRICULUM`, `VICE_PRINCIPAL_STUDENT_AFFAIRS`, `PROGRAM_HEAD`, `SUPER_ADMIN`) dengan aturan *default deny* bagi peran non-pimpinan.
   - `Export & Audit Trail`: Seluruh proses pembuatan berkas ekspor CSV dan pratinjau cetak A4 tercatat persisten pada tabel `riwayat_ekspor_laporan`.
3. **Database Schema & Migrasi:**
   - Migrasi forward: `20260911230000_add_reporting_and_analytics_m19`.
   - Model: `RiwayatEksporLaporan` (`id`, `sekolah_id`, `tipe_laporan`, `judul`, `format`, `parameter_filter_json`, `total_baris`, `dibuat_oleh_id`, `berkas_url`, `created_at`).
4. **Presentation Layer (Academic Glass UI v1.2):**
   - Portal `/pimpinan` dengan 5 sub-tab terpadu:
     - `HeadmasterView`: KPI strategis, rasio guru-siswa, kehadiran global, ketuntasan KKTP, alert perhatian kepemimpinan, distribusi per tingkat, dan tren mingguan.
     - `CurriculumAnalyticsView`: Beban mengajar JP per guru, kepatuhan jurnal KBM guru, dan ketuntasan KKTP per mapel.
     - `StudentAffairsView`: Matriks kehadiran per rombel, deteksi siswa alpha tinggi, dan agregasi pembinaan siswa.
     - `ProgramHeadView`: Cohort jurusan kejuruan, utilisasi jam bengkel/praktik, dan ketuntasan capaian kompetensi.
     - `ReportExportCenter`: Ekspor CSV presensi dan nilai akademik instan, serta tabel riwayat ekspor laporan.
   - `ExecutivePrintModal`: Lembar ringkasan eksekutif format A4 siap cetak (`window.print()`) lengkap dengan kop surat resmi sekolah dan lembar tanda tangan.
   - Dropdown *Role Switcher* bagi Super Admin dan personil dengan multi-jabatan.
5. **Quality Gates & Bukti Visual:**
   - TypeScript `tsc --noEmit`: 0 errors.
   - ESLint: 0 errors.
   - Prettier: 100% compliant.
   - Vitest: 81 test files, 462 tests passing (100% PASS).
   - Next.js Production Build: 22 static & dynamic routes compiled successfully.
   - Playwright Visual Walkthrough: 8 screenshot tersimpan di `docs/phases/screenshots/phase-19-walkthrough/`.
6. **Status:**
   - `READY FOR HUMAN REVIEW`.

---

# 36. Implementasi Rekapitulasi Presensi Siswa Terpadu (M12 / M19 Enhancement — 12 September 2026)

Menindaklanjuti masukan Human Review mengenai ketiadaan tabel rekap absen siswa pada antarmuka kelas dan presensi:
1. **Domain & Data Layer (`M12` & `M19`):**
   - DTO baru `StudentClassAttendanceRecapItemDTO` dan `ClassAttendanceRecapDTO` pada `src/modules/attendance/domain/attendance-types.ts`.
   - Method `getClassAttendanceRecap` pada `AttendanceRepository` & `AttendanceService` yang mengagregasi kehadiran seluruh siswa rombel aktif per penugasan mengajar (Hadir, Sakit, Izin, Alpha, Dispensasi, Terlambat, Total Pertemuan, Persentase, dan Status Evaluasi: *Sangat Baik*, *Baik*, *Cukup*, *Perlu Perhatian*).
   - Server Action `getClassAttendanceRecapAction` dengan otorisasi berbasis hak akses `attendance.session.view` dan teacher assignment scoping.
2. **Presentation Layer (Academic Glass UI v1.2):**
   - Komponen baru `StudentAttendanceRecapTable`: Menampilkan tabel matriks presensi siswa lengkap dengan pencarian nama/NISN, filter status perhatian/baik, indikator visual progres kehadiran, serta tombol unduh berkas CSV instan dan tombol cetak format A4.
   - Pembaruan `ClassAttendanceTabView` pada Workspace Kelas (`/kelas-saya/[id]?tab=presensi`): Dilengkapi sub-tab interaktif **Rekapitulasi Siswa** (default) dan **Riwayat Sesi KBM**.
   - Modal baru `ClassAttendanceRecapModal` dan tombol **Lihat Rekap Siswa** pada kartu rombel di Pusat Presensi (`/presensi-kelas`) untuk pratinjau cepat tanpa harus pindah halaman.
   - Navigasi Shell: Penambahan menu **Presensi Kehadiran** (`/presensi-kelas`) pada grup navigasi staf/admin (`SUPER_ADMIN` & `SCHOOL_STAFF` dengan kapabilitas `ACADEMIC_OPERATOR`).
3. **Quality Gates:**
   - TypeScript `tsc --noEmit`: 0 errors.
   - ESLint: 0 errors.
   - Prettier: 100% compliant.
   - Vitest: 81 test files, 462 tests passing (100% PASS).
   - Next.js Production Build: 22 rute terkompilasi optimal (100% PASS).

---

# 37. Implementasi Buku Nilai & Presensi Terpadu Kurikulum Merdeka (Leger Kelas Nyata — 12 September 2026)

Menindaklanjuti masukan guru / human reviewer terkait format buku daftar nilai dan presensi realistis (Buku Leger Kurikulum Merdeka):
1. **Domain & Data Modeling (`M12` & `M13`):**
   - Penambahan relasi dinamis pada `GradebookColumnDTO` (`tp_id`, `lingkup_materi_id`).
   - Penambahan `nisn` pada baris siswa `GradebookStudentRowDTO` sehingga identitas siswa menampilkan NIS & NISN lengkap.
   - Pemetaan multi-tier domain:
     - **Kehadiran**: `H` (Hadir), `S` (Sakit), `I` (Izin), `A` (Alpha), `%` (Persentase).
     - **Formatif**: Dikelompokkan per Lingkup Materi dengan kolom TP dinamis (tidak statis 5 TP, mengikuti jumlah TP aktual yang dibuat guru untuk tiap bab/LM).
     - **Sumatif Lingkup Materi (SLM)**: Kolom evaluasi sumatif per Lingkup Materi (`LM 1`, `LM 2`, dst.).
     - **Sumatif Akhir Semester (SAS)**: Kolom ujian sumatif akhir semester.
     - **Rekapitulasi Nilai Akhir**: Rerata Formatif, Rerata Sumatif, Nilai Akhir (NA), dan Status Ketuntasan KKTP.
   - Invariant Kunci:
     - *Missing Grade ≠ Zero Grade*: Siswa yang belum dinilai ditandai dengan strip (`-`), bukan nilai nol.
     - Sticky Columns: Kolom No, NIS/NISN, dan Nama Siswa di-freeze secara sticky saat scroll horizontal.
2. **Presentation Layer (Academic Glass UI v1.2):**
   - Komponen baru: `UnifiedAcademicLedgerTable` (`src/modules/assessment/presentation/unified-academic-ledger-table.tsx`):
     - Header berjenjang 3-tier standar nasional Kurikulum Merdeka.
     - Baris rekapitulasi rata-rata kelas, nilai tertinggi, dan persentase ketuntasan kelas pada footer tabel (`tfoot`).
     - Fitur pencarian instan nama/NIS/NISN dan filter status (Semua, Tuntas, Belum Tuntas, Perlu Perhatian).
     - Ekspor CSV Leger Nilai & Presensi lengkap untuk pembukuan sekolah / Excel.
     - Tombol Cetak Leger format A4 Landscape (`window.print()`).
     - Aksi interaktif: Klik pada kolom asesmen membuka modal input nilai atau pembuatan asesmen baru pada TP tersebut.
   - Integrasi `ClassAssessmentTabView` (Tab Penilaian) & `ClassAttendanceTabView` (Tab Presensi):
     - Menjadi tampilan default utama (Buku Nilai & Presensi Terpadu) yang dapat diakses langsung oleh pengampu kelas.
3. **Quality Gates & Verification:**
   - TypeScript `tsc --noEmit`: 0 errors.
   - ESLint: 0 errors (4 warnings non-blocking).
   - Prettier: 100% compliant.
   - Vitest: 82 test files, 467 tests passing (100% PASS).
   - Next.js Production Build: 22 static & dynamic routes compiled successfully.

---

# 38. Phase 20 — Integration Foundation (M20 / Milestone H — 17 September 2026)

Status: **READY FOR HUMAN REVIEW**

1. **Domain & Data Modeling (`M20`):**
   - Database Models: `KonfigurasiIntegrasi`, `EndpointWebhook`, `LogPengirimanIntegrasi`.
   - Forward migration applied: `20260917200000_add_integration_foundation_m20`.
   - Domain Invariants:
     - *Integration ≠ Core Domain (Decoupled Port & Adapter)*: Pemisahan adapter gateway WhatsApp, FCM Push, Email, dan Webhook.
     - *Delivery Failure ≠ Domain Rollback*: Pengiriman pesan/notifikasi bersifat asinkron dan fault-tolerant, kegagalan vendor pihak ketiga tidak membatalkan transaksi akademik.
     - *Strict Redaction & Idempotency*: Kerahasiaan API secret/signing key dilindungi dari plaintext leak; idempotency key mencegah duplikasi pesan.
     - *Cryptographic Signature & Anti-Replay*: Webhook di-sign menggunakan HMAC-SHA256 dengan timestamp tolerance 5 menit.
2. **Infrastructure & Application Services:**
   - Adapters: `WhatsAppAdapter` (Fonnte/Meta/Simulation), `PushNotificationAdapter` (FCM/Web Push/Simulation), `EmailAdapter` (Resend/SMTP/Simulation), `WebhookDispatcher` (HMAC signer, anti-replay, retry backoff).
   - Service: `IntegrationService` & `IntegrationRepository` dengan Server Actions di `src/app/actions/integration-actions.ts`.
   - Permissions: `integration.view` dan `integration.manage` dikunci ke peran `SUPER_ADMIN` (bundle `SYSTEM_ADMIN`).
3. **Presentation Layer (Academic Glass UI v1.2):**
   - Route `/integrasi` ("Pusat Integrasi & Layanan Eksternal") dengan 3 sub-tab:
     - Katalog Adapter Layanan (WhatsApp, Push, Email, Webhooks) dengan status health indicator & modal konfigurasi.
     - Endpoint Webhook dengan modal pendaftaran webhook baru, event subscriptions, dan tombol test ping.
     - Log Pengiriman & Audit Trail dengan filter pencarian dan detail status pengiriman.
   - Sidebar navigasi diperbarui dengan menu Pusat Integrasi (ikon `Plug`).
4. **Quality Gates & Verification:**
   - TypeScript `tsc --noEmit`: 0 errors (PASS).
   - ESLint: 0 errors (PASS).
   - Prettier: 100% compliant (PASS).
   - Vitest: 85 test files, 483 tests passing (100% PASS).
   - Next.js Production Build: 23 static & dynamic routes compiled successfully (PASS).
   - Playwright Visual Walkthrough: 7 screenshots verified (100% PASS).
