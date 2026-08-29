# 08 — IMPLEMENTATION ROADMAP
## Ruang Pintar

**Nama Dokumen:** Implementation Roadmap  
**Nama Produk:** Ruang Pintar  
**Versi Dokumen:** 1.0  
**Status:** APPROVED / LOCKED  
**Bahasa Utama:** Bahasa Indonesia  

**Dokumen Induk:**
- `00-PROJECT-BRIEF.md`
- `01-PRODUCT-REQUIREMENTS.md`
- `02-DOMAIN-MODEL.md`
- `03-MODULE-MAP.md`
- `04-ROLE-ACCESS.md`
- `05-SYSTEM-ARCHITECTURE.md`
- `06-DATA-ARCHITECTURE.md`
- `07-UI-UX-DESIGN-SYSTEM.md`

---

# 1. Tujuan Dokumen

Dokumen ini menetapkan **urutan implementasi resmi Ruang Pintar** dari bootstrap teknis sampai production readiness.

Roadmap ini bukan daftar fitur biasa.

Roadmap ini berfungsi sebagai **kontrak kerja untuk AI coding dan human review**, sehingga:

- AI tidak membangun modul secara acak;
- AI tidak melompati dependency;
- AI tidak membuat dashboard berdasarkan interpretasi sendiri;
- UI tidak boleh menyimpang dari Academic Glass UI;
- domain invariant tetap terjaga;
- authorization tidak ditambahkan terlambat;
- migration tidak dibuat prematur;
- setiap phase memiliki stop condition;
- setiap phase memiliki human approval gate;
- milestone usability dapat dinilai secara nyata.

Prinsip utama:

> **Dokumentasi menentukan produk. Domain menentukan perilaku. UI Contract menentukan halaman. AI hanya mengimplementasikan. Human menentukan APPROVED.**

---

# 2. Filosofi Roadmap

Roadmap menggunakan dua lapisan:

```text
PHASE DEPENDENCY
+
EXPERIENCE MILESTONE
```

## 2.1 Phase Dependency

Menjawab:

> Apa yang harus dibangun lebih dulu agar phase berikutnya aman?

## 2.2 Experience Milestone

Menjawab:

> Setelah sekumpulan phase selesai, apa yang benar-benar sudah dapat dilakukan oleh pengguna?

Dengan demikian progress tidak hanya dinilai dari:

```text
build PASS
test PASS
```

tetapi juga dari:

```text
pengguna benar-benar dapat menyelesaikan workflow nyata
```

---

# 3. Aturan Keras Pelaksanaan

## ROADMAP-RULE-001 — Satu Phase Aktif

AI coding hanya boleh mengerjakan satu phase aktif.

Dilarang:

```text
"sekalian saya kerjakan phase berikutnya"
```

## ROADMAP-RULE-002 — Explicit Non-Scope

Setiap phase memiliki daftar hal yang **tidak boleh dikerjakan**.

## ROADMAP-RULE-003 — Human Approval

Phase yang memiliki UI tidak dianggap selesai sebelum human visual review.

## ROADMAP-RULE-004 — No Silent Redesign

AI tidak boleh mengubah layout, information architecture, token, component behavior, atau workflow tanpa instruksi eksplisit.

## ROADMAP-RULE-005 — Reference is Contract

Untuk halaman yang memiliki visual/page reference:

```text
REFERENCE
=
CONTRACT
```

bukan sekadar inspirasi.

## ROADMAP-RULE-006 — No Cross-Phase Schema

Migration hanya dibuat untuk kebutuhan phase aktif dan prerequisite langsung.

## ROADMAP-RULE-007 — No Cross-Module Direct Write

Module ownership mengikuti `03-MODULE-MAP.md`.

## ROADMAP-RULE-008 — Server-Side Authorization

UI hiding tidak dianggap security.

## ROADMAP-RULE-009 — Working Tree Accountability

Sebelum checkpoint:

- quality gate selesai;
- perubahan dipahami;
- working tree diperiksa;
- perubahan tak relevan tidak boleh ikut.

## ROADMAP-RULE-010 — Stop After Gate

Setelah phase memenuhi acceptance criteria, AI berhenti dan menyerahkan hasil untuk review.

---

# 4. Gate Standar Setiap Phase

Setiap phase menggunakan gate berikut sesuai relevansi.

## 4.1 Technical Gate

```text
✓ install/dependency sehat
✓ typecheck PASS
✓ lint PASS
✓ format PASS
✓ build PASS
✓ automated tests relevan PASS
```

## 4.2 Data Gate

```text
✓ fresh migration PASS
✓ upgrade migration PASS bila relevan
✓ FK/constraint PASS
✓ seed/reference data PASS bila ada
✓ database integrity tidak rusak
```

## 4.3 Authorization Gate

```text
✓ allowed actor PASS
✓ denied actor PASS
✓ out-of-scope resource DENIED
✓ expired/historical scope benar
```

## 4.4 Visual Gate

Untuk phase UI:

```text
✓ 390×844
✓ 768×1024
✓ 1024×768
✓ 1440×900
```

## 4.5 UX Gate

```text
✓ loading state
✓ empty state
✓ validation state
✓ error state
✓ success feedback
✓ destructive confirmation bila relevan
✓ keyboard/focus
```

## 4.6 Human Gate

```text
HUMAN REVIEW = APPROVED
```

Tanpa ini:

```text
PHASE ≠ DONE
```

untuk phase UI/UX utama.

## 4.7 Git Gate

Setelah approval:

```text
✓ checkpoint commit
✓ commit message jelas
✓ working tree clean
```

Push remote hanya dilakukan jika diminta atau workflow project sudah menetapkannya.

---

# 5. Critical Page Contract

Sebelum AI mengimplementasikan halaman kritis, phase harus memiliki kontrak halaman.

Kontrak minimal:

```text
PAGE ID
ROLE
PURPOSE
INFORMATION PRIORITY
PAGE ANATOMY
COMPONENTS
DATA SOURCE
ACTIONS
AUTHORIZATION
RESPONSIVE BEHAVIOR
LOADING
EMPTY
ERROR
SUCCESS
VISUAL REFERENCE
ACCEPTANCE CRITERIA
```

Halaman kritis antara lain:

```text
LOGIN
DASHBOARD-GURU
KELAS-SAYA
WORKSPACE-KELAS
SESI-PEMBELAJARAN
PRESENSI-KELAS
ADMINISTRASI-GURU
LINGKUP-MATERI
TUJUAN-PEMBELAJARAN
PENILAIAN-TP
GRADEBOOK
CBT
DASHBOARD-SISWA
DASHBOARD-GUARDIAN
DASHBOARD-PIMPINAN
```

---

# 6. Visual Drift Gate

Setiap phase UI mengikuti:

```text
IMPLEMENT
   ↓
RENDER
   ↓
SCREENSHOT / VISUAL INSPECTION
   ↓
COMPARE WITH CONTRACT
   ↓
UI REVIEW
   ↓
APPROVE / REJECT
```

Review memeriksa:

- hierarchy;
- spacing;
- color token;
- typography;
- glass level;
- density;
- component variant;
- sidebar;
- responsive transformation;
- unrequested element;
- missing state;
- visual drift.

Jika drift ditemukan:

```text
REJECT
→ FIX
→ REVIEW ULANG
```

Build PASS tidak membatalkan kebutuhan visual review.

---

# 7. Ringkasan Fase

```text
PHASE 00 — Project Bootstrap & Environment Baseline
PHASE 01 — Academic Glass UI Foundation
PHASE 02 — Database, Persistence & Platform Foundation
PHASE 03 — Authentication & Identity
PHASE 04 — Authorization & Access Control
PHASE 05 — Application Shell & Dashboard Framework
PHASE 06 — School & Organization
PHASE 07 — Academic Period & Structure
PHASE 08 — Student Academic Lifecycle
PHASE 09 — Teacher & Teaching Assignment
PHASE 10 — Academic Calendar, Schedule & Class Session
PHASE 11 — Teacher Workspace & Learning Administration
PHASE 12 — Class Attendance
PHASE 13 — Assessment, TP & Gradebook
PHASE 14 — CBT
PHASE 15 — Student Experience
PHASE 16 — Guardian & Family Experience
PHASE 17 — Communication & Notification
PHASE 18 — Student Monitoring & Homeroom
PHASE 19 — Leadership Dashboard, Reporting & Analytics
PHASE 20 — Integration Foundation
PHASE 21 — AI Assistance
PHASE 22 — Production Readiness & Final Hardening
```

---

# 8. Experience Milestones

## MILESTONE A — FOUNDATION READY

Setelah:

```text
PHASE 00–02
```

hasil nyata:

```text
Project hidup
UI Kit hidup
SQLite/Prisma hidup
Build/test baseline sehat
```

Belum ada login production-ready.

---

## MILESTONE B — IDENTITY ENTRY READY

Setelah:

```text
PHASE 03–05
```

hasil nyata:

```text
Login
↓
Identity
↓
Authorization
↓
Role-aware Application Shell
↓
Role-aware Dashboard Framework
```

Pengguna sudah dapat masuk sebagai akun yang sah.

---

## MILESTONE C — ACADEMIC FOUNDATION READY

Setelah:

```text
PHASE 06–10
```

hasil nyata:

```text
Sekolah
Tahun Ajaran
Semester
Jenjang/Grade
Program
Rombel
Siswa
Guru
Penugasan Mengajar
Kalender
Jadwal
Sesi Kelas
```

Sistem sudah memiliki struktur akademik yang dapat dipakai.

---

## MILESTONE D — TEACHER ACADEMIC MVP

Setelah:

```text
PHASE 11–13
```

guru sudah dapat:

```text
Login
↓
Dashboard Guru
↓
Kelas Saya
↓
Buka kelas
↓
Kelola Lingkup Materi / BAB
↓
Kelola TP
↓
Isi administrasi pembelajaran
↓
Buka sesi/pertemuan
↓
Presensi siswa
↓
Buat assessment
↓
Ambil nilai TP
↓
Isi Gradebook
```

Ini adalah **milestone usable pertama yang wajib dapat dipraktikkan end-to-end oleh guru**.

---

## MILESTONE E — DIGITAL ASSESSMENT READY

Setelah:

```text
PHASE 14
```

guru dapat menyelenggarakan CBT dan hasilnya dapat masuk ke Assessment/Gradebook melalui contract resmi.

---

## MILESTONE F — STUDENT & GUARDIAN EXPERIENCE READY

Setelah:

```text
PHASE 15–17
```

siswa dan guardian memperoleh experience yang relevan dan communication channel resmi tersedia.

---

## MILESTONE G — MANAGEMENT READY

Setelah:

```text
PHASE 18–19
```

wali kelas dan pimpinan memperoleh monitoring, attention center, reporting, dan analytics tanpa mengambil alih ownership operasional guru.

---

## MILESTONE H — EXTENSION READY

Setelah:

```text
PHASE 20–21
```

integration dan AI dapat ditambahkan melalui adapter tanpa mengubah source of truth.

---

## MILESTONE I — RELEASE READY

Setelah:

```text
PHASE 22
```

Ruang Pintar siap deployment sekolah dengan baseline operasional, backup, recovery, security, performance, dan regression verification.

---

# 9. PHASE 00 — PROJECT BOOTSTRAP & ENVIRONMENT BASELINE

## Objective

Membuat project Next.js yang bersih, reproducible, dan siap menjadi baseline seluruh implementasi.

## User Outcome

Belum ada fitur bisnis.

Hasil yang terlihat cukup:

```text
Ruang Pintar project dapat dijalankan
```

## Technical Scope

- Next.js stable secure release;
- TypeScript;
- Node.js runtime;
- Tailwind CSS;
- package manager;
- lint;
- formatting;
- typecheck;
- testing baseline;
- environment convention;
- import alias;
- Git baseline;
- folder/module convention awal;
- `.env.example`;
- health smoke check.

## Explicit Non-Scope

```text
✗ Authentication
✗ Database domain
✗ Dashboard final
✗ Student
✗ Teacher
✗ Attendance
✗ Gradebook
```

## Acceptance

```text
install PASS
dev server PASS
typecheck PASS
lint PASS
format PASS
test baseline PASS
build PASS
working tree clean
```

## Git Checkpoint

Contoh:

```text
chore: establish Ruang Pintar project baseline
```

---

# 10. PHASE 01 — ACADEMIC GLASS UI FOUNDATION

## Objective

Mengimplementasikan design system resmi dari `07-UI-UX-DESIGN-SYSTEM.md`.

## Scope

Implementasi token:

- Cobalt;
- Academic Navy;
- neutral scale;
- semantic colors;
- spacing;
- radius;
- shadow;
- motion;
- glass surfaces;
- typography.

Primitive baseline:

- Button;
- Input;
- Password Input;
- Label;
- Checkbox;
- Textarea;
- Select;
- Radio;
- Switch;
- Card;
- Badge;
- Alert;
- Toast;
- Dialog;
- Confirmation Dialog;
- Tabs;
- Accordion;
- Dropdown;
- Tooltip;
- Pagination;
- ResponsiveDataTable;
- PageHeader;
- EmptyState;
- LoadingState;
- ErrorState.

## Visual Contract

Harus mengikuti Academic Glass UI v1.2.

Dilarang membuat style baru tanpa review.

## Visual QA

Wajib pada empat viewport kanonikal.

## Explicit Non-Scope

```text
✗ Login functionality
✗ Prisma domain schema
✗ Role logic
✗ Dashboard domain
```

## Human Gate

UI Kit showcase wajib direview.

## Git Checkpoint

```text
feat: establish Academic Glass UI foundation
```

---

# 11. PHASE 02 — DATABASE, PERSISTENCE & PLATFORM FOUNDATION

## Objective

Mengaktifkan baseline data architecture.

## Scope

- Prisma ORM;
- SQLite;
- `better-sqlite3` adapter;
- ULID;
- migration workflow;
- FK enforcement;
- WAL production strategy;
- repository/data boundary;
- transaction helper;
- audit foundation;
- outbox foundation;
- file metadata foundation;
- private local storage adapter;
- test database isolation.

## Naming

Database first-party:

```text
Bahasa Indonesia
snake_case
```

## Explicit Non-Scope

Tidak membuat seluruh schema M01–M21.

Hanya platform/foundation tables yang dibutuhkan.

## Data Gate

Wajib:

```text
fresh migration PASS
test DB PASS
FK enforcement PASS
SQLite initialization PASS
```

## Git Checkpoint

```text
feat: establish data and platform foundation
```

---

# 12. PHASE 03 — AUTHENTICATION & IDENTITY

## Modules

M02 — Identity & Access, bagian authentication/identity.

## Objective

Membuat login Ruang Pintar benar-benar berfungsi.

## Critical Page Contract

```text
LOGIN
PASSWORD-REQUIRED
FORGOT-PASSWORD
```

## Login Visual Contract

Harus mempertahankan:

```text
Desktop 58% Hero / 42% Form
Mobile Form-First
Username login
Academic Navy submit
Astronaut Hero
470px form baseline
```

## Functional Scope

- User Account;
- username;
- password hash;
- account active/disabled;
- session;
- remember me bila dipilih;
- logout;
- login rate limiting;
- must-change-password;
- password recovery bila requirement tersedia.

## Experience Outcome

Pengguna dapat:

```text
/login
↓
masukkan username/password
↓
login berhasil/gagal
```

## Explicit Non-Scope

```text
✗ Permission engine lengkap
✗ Teacher dashboard final
✗ Student dashboard final
```

## Human Gate

Login harus dibandingkan terhadap reference V2.

## Git Checkpoint

```text
feat: implement authentication and identity
```

---

# 13. PHASE 04 — AUTHORIZATION & ACCESS CONTROL

## Module

M02 — Identity & Access.

## Objective

Menerapkan effective access model.

## Scope

Base Roles:

```text
SUPER_ADMIN
SCHOOL_STAFF
TEACHER
STUDENT
GUARDIAN
```

Capability bundles:

```text
SYSTEM_ADMIN
ACADEMIC_OPERATOR
STUDENT_DATA_OPERATOR
REPORT_OPERATOR
```

Position/Assignment concepts:

```text
HEADMASTER
VICE_PRINCIPAL_CURRICULUM
VICE_PRINCIPAL_STUDENT_AFFAIRS
PROGRAM_HEAD
TEACHING_ASSIGNMENT
HOMEROOM_ASSIGNMENT
POSITION_ASSIGNMENT
```

## Authorization Model

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

## Gate

Test:

- allow;
- deny;
- wrong role;
- wrong scope;
- expired assignment;
- historical context.

## Explicit Non-Scope

Belum membuat domain assignment sebenarnya jika domain owner belum tersedia; gunakan infrastructure contract/reference data minimum.

## Git Checkpoint

```text
feat: establish authorization and access control
```

---

# 14. PHASE 05 — APPLICATION SHELL & DASHBOARD FRAMEWORK

## Objective

Membuat application shell resmi dan framework dashboard role-aware.

## UI Scope

- Sidebar 240px;
- Compact rail 56px;
- Topbar 64px;
- mobile drawer/navigation;
- breadcrumbs;
- user menu;
- notification entry point;
- page layout;
- dashboard composition primitives.

## Important Rule

Phase ini **tidak membuat dashboard generik final untuk semua role**.

Yang dibuat:

```text
Dashboard Framework
+
Role Routing
+
Page Contracts
```

## Critical Page Contracts

Wajib mendefinisikan minimal:

```text
DASHBOARD-GURU
DASHBOARD-SISWA
DASHBOARD-GUARDIAN
DASHBOARD-STAFF
DASHBOARD-PIMPINAN
```

Content yang belum memiliki domain data dapat menggunakan empty/placeholder state yang jelas, bukan mock KPI palsu.

## Visual Drift Gate

Wajib.

## Human Gate

Shell tidak boleh lanjut tanpa approval.

## Git Checkpoint

```text
feat: establish responsive application shell
```

---

# 15. PHASE 06 — SCHOOL & ORGANIZATION

## Module

M01 — School & Organization.

## Objective

Menyediakan identitas dan struktur organisasi sekolah.

## Scope

- sekolah;
- unit organisasi;
- posisi;
- penugasan posisi;
- profile/configuration dasar sekolah.

## UI

Management page sesuai permission.

## Non-Scope

```text
✗ Student
✗ Teacher Assignment
✗ Schedule
```

## Experience Outcome

Admin berwenang dapat mengelola identitas organisasi sekolah.

---

# 16. PHASE 07 — ACADEMIC PERIOD & STRUCTURE

## Module

M06 — Academic Period & Structure.

## Scope

- tahun ajaran;
- semester;
- phase;
- grade level;
- program;
- rombel;
- effective periods.

## Invariant

```text
Academic Year
≠
Semester
≠
Rombel
```

## Experience Outcome

Sekolah dapat menyiapkan struktur akademik resmi untuk periode berjalan.

---

# 17. PHASE 08 — STUDENT ACADEMIC LIFECYCLE

## Module

M07 — Student Academic Lifecycle.

## Scope

- siswa;
- keikutsertaan akademik;
- penempatan rombel;
- status;
- histori;
- bulk operation terbatas bila aman.

## Invariant

```text
Student Identity
≠
Student Enrollment
≠
Rombel Placement
```

## Critical Pages

```text
DAFTAR-SISWA
DETAIL-SISWA
KEIKUTSERTAAN-AKADEMIK
PENEMPATAN-ROMBEL
```

## Experience Outcome

Operator dapat menempatkan siswa pada rombel tanpa menghapus histori periode sebelumnya.

---

# 18. PHASE 09 — TEACHER & TEACHING ASSIGNMENT

## Module

M08 — Teacher & Teaching Assignment.

## Scope

- profil guru;
- mata pelajaran;
- penugasan mengajar;
- workload derived;
- effective period.

## Invariant

```text
Teacher
≠
Subject
≠
Teaching Assignment
```

## Experience Outcome

Guru dapat memiliki assignment nyata pada mapel/kelas/periode tertentu.

## Dashboard Activation

Pada akhir phase ini, **DASHBOARD-GURU mulai diisi data nyata**:

```text
Kelas Saya
Penugasan Mengajar
```

bukan card generik.

---

# 19. PHASE 10 — ACADEMIC CALENDAR, SCHEDULE & CLASS SESSION

## Modules

M09 — Academic Calendar  
M10 — Scheduling & Class Session

## Scope

- kalender akademik;
- master schedule;
- schedule publication/version;
- actual class session;
- session lifecycle.

## Invariant

```text
Academic Calendar
≠
Master Schedule
≠
Actual Class Session
```

## Teacher Dashboard Activation

Dashboard Guru mulai menampilkan:

```text
Jadwal Hari Ini
Kelas Berikutnya
Buka Kelas
```

## Critical Pages

```text
JADWAL-SAYA
JADWAL-SEKOLAH
SESI-PEMBELAJARAN
```

---

# 20. PHASE 11 — TEACHER WORKSPACE & LEARNING ADMINISTRATION

## Module

M11 — Learning.

## Objective

Membuat ruang kerja guru yang benar-benar relevan untuk aktivitas mengajar.

## Critical Page

```text
WORKSPACE-KELAS
```

## Anatomy

```text
KELAS SAYA
└── [Rombel] — [Mata Pelajaran]
    ├── Ringkasan
    ├── Jadwal
    ├── Lingkup Materi / BAB
    ├── Tujuan Pembelajaran
    ├── Materi
    ├── Administrasi Pembelajaran
    ├── Tugas
    ├── Presensi
    ├── Penilaian
    └── CBT
```

Tab/section yang belum diimplementasikan penuh boleh menampilkan state "belum tersedia" secara terkendali; dilarang menambahkan fungsi palsu.

## Scope

- learning context;
- lingkup materi/BAB;
- tujuan pembelajaran;
- materi;
- publikasi materi;
- jurnal/administrasi pertemuan;
- tugas;
- publikasi tugas;
- submission foundation.

## Teacher Administration

Minimal dapat merekam:

- sesi/pertemuan;
- materi diberikan;
- TP terkait;
- catatan/jurnal;
- status/realisasi pembelajaran.

## Experience Outcome

Guru dapat:

```text
Login
↓
Dashboard Guru
↓
Kelas Saya
↓
X RPL — KKA
↓
BAB 1
↓
TP1
↓
Pertemuan
↓
Isi administrasi
```

## Human Gate

Workspace Guru wajib mendapat approval visual sebelum Attendance.

---

# 21. PHASE 12 — CLASS ATTENDANCE

## Module

M12 — Attendance.

## Scope

Dua domain tetap terpisah:

```text
School Attendance
≠
Class Session Attendance
```

Phase awal memprioritaskan Class Session Attendance untuk Teacher Academic MVP.

## Critical Page

```text
PRESENSI-KELAS
```

## Workflow

```text
Guru
↓
Jadwal Hari Ini
↓
Buka Kelas
↓
Actual Class Session
↓
Daftar Siswa
↓
Hadir / Izin / Sakit / Alpha
↓
Simpan
↓
Toast
```

## Correction

Koreksi harus:

- scoped;
- audited;
- memiliki alasan bila policy mewajibkan.

## UX Priority

Presensi harus cepat dan tidak membutuhkan klik berlebihan.

## Experience Outcome

Guru dapat mengabsen siswa pada sesi nyata.

---

# 22. PHASE 13 — ASSESSMENT, TP & GRADEBOOK

## Module

M13 — Assessment & Gradebook.

## Objective

Mendukung momen pengambilan nilai berdasarkan TP dalam Lingkup Materi/BAB.

## Domain Contract

```text
Lingkup Materi / BAB
↓
Tujuan Pembelajaran
↓
Assessment
↓
Grade
```

## Important Rule

Dilarang membuat schema:

```text
nilai_tp1
nilai_tp2
nilai_tp3
```

sebagai kolom permanen.

TP adalah data domain, bukan nama kolom.

## Critical Pages

```text
TUJUAN-PEMBELAJARAN
PENILAIAN-TP
GRADEBOOK
PUBLIKASI-NILAI
```

## Workflow

```text
BAB 1
↓
TP1
↓
Buat Assessment
↓
Tanggal Pengambilan Nilai
↓
Isi Nilai Siswa
↓
Simpan Draft
↓
Review
↓
Publish bila siap
```

## Invariants

```text
Assessment Definition
≠
Grade
≠
Grade Publication

Missing Grade
≠
Zero Grade
```

## State

Minimal:

```text
Draft
Published
Finalized
```

sesuai kebutuhan domain.

## Experience Outcome — TEACHER ACADEMIC MVP

Pada akhir phase ini guru wajib dapat melakukan end-to-end:

```text
Login
↓
Dashboard
↓
Kelas Saya
↓
BAB 1
↓
TP1
↓
Pertemuan
↓
Administrasi Guru
↓
Presensi
↓
Pengambilan Nilai TP1
↓
Isi Nilai
↓
Lanjut TP2
```

## Milestone Gate

**TEACHER ACADEMIC MVP tidak boleh dinyatakan selesai tanpa praktik manusia nyata terhadap workflow tersebut.**

---

# 23. PHASE 14 — CBT

## Module

M14 — CBT.

## Scope

- bank soal;
- versi soal;
- blueprint;
- ujian;
- immutable snapshot;
- attempt;
- autosave;
- resume;
- server-authoritative timer;
- one active attempt;
- answer submission;
- integrity events;
- result transfer to Assessment.

## Security Rule

Answer key tidak dikirim ke client secara tidak perlu.

## Integrity Rule

Integrity event:

```text
indikator
≠
vonis otomatis cheating
```

## Critical Pages

```text
BANK-SOAL
EDITOR-UJIAN
CBT-PLAYER
CBT-REVIEW
HASIL-CBT
```

---

# 24. PHASE 15 — STUDENT EXPERIENCE

## Objective

Mengaktifkan experience siswa berbasis enrollment dan scope.

## Dashboard Siswa Contract

Priority:

```text
Aktivitas Hari Ini
Jadwal Berikutnya
Deadline Tugas
CBT Mendatang
Presensi Pribadi
Nilai Published
Pengumuman
Notifikasi
```

## Scope

- student dashboard;
- learning material;
- assignment/submission;
- CBT access;
- attendance self;
- published grade;
- announcement;
- notification.

## Authorization

Student self-scope.

---

# 25. PHASE 16 — GUARDIAN & FAMILY EXPERIENCE

## Module

M15 — Guardian & Family.

## Scope

- guardian identity;
- verified relationship;
- child switcher;
- attendance;
- task;
- CBT;
- published grade;
- announcement;
- limited request/correction bila requirement mengizinkan.

## Rule

```text
Guardian
≠
Student proxy
```

Guardian tidak boleh bertindak sebagai siswa.

## Dashboard Guardian Contract

Harus child-centric dan relationship-scoped.

---

# 26. PHASE 17 — COMMUNICATION & NOTIFICATION

## Modules

M16 — Communication  
M17 — Notification

## Scope

- announcement;
- audience;
- in-app notification;
- read/unread;
- outbox delivery;
- delivery adapter interfaces.

## Rule

```text
Announcement
≠
Notification
```

## External Delivery

Architecture ready untuk:

- email;
- FCM;
- WhatsApp.

Namun provider hanya diaktifkan jika phase/task menyatakan perlu.

Core tidak boleh gagal hanya karena provider eksternal gagal.

---

# 27. PHASE 18 — STUDENT MONITORING & HOMEROOM

## Module

M18 — Student Monitoring.

## Scope

- Homeroom Assignment;
- rombel monitoring;
- attendance summary;
- assignment monitoring;
- published grade summary;
- attention center;
- note;
- follow-up.

## Rule

Wali kelas tidak otomatis dapat mengubah:

- nilai guru lain;
- presensi sesi guru lain.

## Critical Page

```text
DASHBOARD-WALI-KELAS
```

---

# 28. PHASE 19 — LEADERSHIP DASHBOARD, REPORTING & ANALYTICS

## Module

M19 — Reporting & Analytics.

## Scope

- leadership dashboard;
- operational summary;
- trend;
- exception;
- export;
- academic reporting;
- read models/projection bila diperlukan.

## Dashboard Contracts

```text
DASHBOARD-KEPALA-SEKOLAH
DASHBOARD-WAKASEK-KURIKULUM
DASHBOARD-WAKASEK-KESISWAAN
DASHBOARD-KEPALA-PROGRAM
```

## Rule

Dashboard pimpinan:

```text
monitoring
≠
full administrative write access
```

Reporting tidak memiliki ownership atas source transaction.

---

# 29. PHASE 20 — INTEGRATION FOUNDATION

## Module

M20 — Integration.

## Scope

Adapter framework untuk external service.

Prioritas candidate:

```text
Email Adapter
Push Notification Adapter
WhatsApp Adapter
S3-Compatible Storage Adapter
Google Calendar Adapter
Webhook In/Out
```

## Rule

Integrasi:

- tidak bypass authorization;
- tidak menjadi source of truth tanpa explicit requirement;
- retryable;
- auditable;
- idempotent.

## Provider

Vendor dikonfigurasi sesuai kebutuhan deployment.

---

# 30. PHASE 21 — AI ASSISTANCE

## Module

M21 — AI Assistance.

## Scope Candidate

Untuk guru:

- draft materi;
- draft soal;
- rubrik;
- summary kelas.

Untuk wali/pimpinan:

- summary;
- insight;
- narrative report draft.

## Security Flow

```text
User
↓
Authentication
↓
Effective Access
↓
Allowed Data
↓
AI Application Boundary
↓
Provider
```

Dilarang:

```text
AI
→ full database access
```

## Rule

AI output:

```text
recommendation/draft
≠
official data
```

tanpa validation/use case resmi.

---

# 31. PHASE 22 — PRODUCTION READINESS & FINAL HARDENING

## Objective

Membuktikan bahwa product baseline dapat digunakan secara aman pada deployment sekolah.

## Scope

### Security

- dependency audit;
- auth review;
- authorization regression;
- session security;
- rate limit;
- secrets;
- secure headers;
- file access;
- injection/XSS/CSRF review sesuai architecture.

### Database

- migration from empty DB;
- upgrade migration;
- FK check;
- integrity check;
- WAL;
- production SQLite settings;
- backup.

### Backup & Restore

Wajib:

```text
Backup
↓
Restore ke environment test
↓
Integrity Check
↓
Smoke Test
```

### Performance

- key dashboard;
- student list;
- gradebook;
- attendance;
- CBT;
- reporting;
- query plan/index review.

### UX Regression

Empat viewport kanonikal.

### Accessibility Regression

Critical workflows.

### End-to-End Regression

Minimal:

```text
Login
Academic Setup
Student Placement
Teaching Assignment
Schedule
Teacher Workspace
Attendance
Assessment TP
Grade Publication
CBT
Student Experience
Guardian Experience
Communication
Monitoring
Reporting
```

## Final Human Review

Product tidak dianggap release-ready hanya berdasarkan automated test.

---

# 32. Teacher Dashboard Contract — Roadmap Baseline

Agar AI tidak membuat dashboard generik, baseline information priority Guru adalah:

```text
1. Jadwal Hari Ini / Kelas Berikutnya
2. Kelas Saya
3. Aktivitas yang Membutuhkan Perhatian
4. Tugas / Penilaian yang Belum Selesai
5. Pengumuman
6. Supporting Summary
```

Contoh anatomy:

```text
┌─────────────────────────────────────────────┐
│ Salam / Context Hari Ini                   │
├─────────────────────────────────────────────┤
│ JADWAL HARI INI                            │
│ 07:00  X RPL — KKA       [Buka Kelas]      │
│ 10:00  X TO 1 — KKA                        │
├──────────────────────┬──────────────────────┤
│ KELAS SAYA           │ PERLU PERHATIAN      │
│ X RPL — KKA          │ Presensi belum final │
│ X TO 1 — KKA         │ Nilai belum lengkap  │
├──────────────────────┴──────────────────────┤
│ PENGUMUMAN / AKTIVITAS                    │
└─────────────────────────────────────────────┘
```

AI tidak boleh mengganti informasi ini menjadi:

```text
Revenue Chart
Generic KPI
Recent Activity acak
```

tanpa requirement.

---

# 33. Teacher Class Workspace Contract — Roadmap Baseline

```text
X RPL — KKA
Tahun Ajaran / Semester

Navigation:
- Ringkasan
- Jadwal
- Lingkup Materi
- Materi
- Administrasi
- Tugas
- Presensi
- Penilaian
- CBT
```

Primary experience:

```text
Guru masuk kelas
→ melihat konteks kelas
→ menemukan aktivitas yang harus dilakukan
```

---

# 34. TP Assessment Contract — Roadmap Baseline

Representasi:

```text
Lingkup Materi / BAB
├── TP1
│   ├── Pertemuan
│   ├── Materi
│   └── Assessment
├── TP2
├── TP3
└── ...
```

Momen pengambilan nilai merupakan domain event/use case nyata, bukan sekadar kolom spreadsheet.

---

# 35. AI Coding Prompt Contract per Phase

Setiap prompt implementasi wajib berisi:

```text
PROJECT CONTEXT
ACTIVE PHASE
OBJECTIVE
DEPENDENCIES
AUTHORITATIVE DOCUMENTS
DOMAIN INVARIANTS
MODULE OWNERSHIP
UI CONTRACT
DATA SCOPE
AUTHORIZATION SCOPE
EXPLICIT NON-SCOPE
IMPLEMENTATION RULES
TEST REQUIREMENTS
VISUAL TARGET
STOP CONDITION
REPORT FORMAT
```

Prompt yang hanya berbunyi:

```text
"buat modul presensi"
```

tidak boleh digunakan.

---

# 36. Required AI Report per Phase

AI harus mengembalikan laporan:

```text
PHASE
STATUS
FILES CREATED
FILES MODIFIED
MIGRATIONS
DOMAIN DECISIONS
AUTHORIZATION
TESTS
BUILD
VISUAL QA
KNOWN LIMITATIONS
OUT-OF-SCOPE CONFIRMATION
GIT STATUS
READY FOR HUMAN REVIEW
```

AI tidak boleh menyatakan:

```text
APPROVED
LOCKED
```

atas keputusan human.

---

# 37. Approval Vocabulary

AI boleh menggunakan:

```text
READY FOR REVIEW
READY FOR HUMAN REVIEW
TECHNICAL GATES PASS
```

Hanya human boleh menetapkan:

```text
APPROVED
LOCKED
```

---

# 38. Git Checkpoint Strategy

Satu phase sebaiknya memiliki checkpoint setelah approval.

Contoh:

```text
feat: establish authentication and identity
feat: establish authorization engine
feat: implement student academic lifecycle
feat: implement teacher class attendance
```

Fix setelah review dapat memiliki checkpoint terpisah bila material.

---

# 39. Phase Failure Policy

Jika phase gagal:

```text
STOP
↓
IDENTIFY ROOT CAUSE
↓
FIX ACTIVE PHASE
↓
RE-RUN GATES
```

Dilarang maju ke phase berikutnya untuk "nanti dibereskan".

---

# 40. Architecture Change Policy

Jika implementasi menemukan kebutuhan mengubah:

- Modular Monolith;
- SQLite;
- Prisma;
- ULID;
- single-school deployment;
- UI Kit baseline;
- role/access model;
- domain invariant;

maka:

```text
STOP
→ Architecture/Data/Product Review
→ update dokumen induk bila disetujui
→ baru implementasi
```

AI tidak boleh mengambil keputusan tersebut sendiri.

---

# 41. Dashboard Change Policy

AI dilarang:

- membuat KPI yang tidak memiliki data source;
- menampilkan mock angka seolah nyata;
- menambah chart hanya untuk estetika;
- mengubah information priority;
- mengganti sidebar;
- mengganti interaction pattern;
- membuat role dashboard identik dengan mengganti label.

Dashboard harus berasal dari user outcome tiap role.

---

# 42. Mock Data Policy

Mock data boleh digunakan hanya untuk:

- isolated component development;
- Storybook/showcase ekuivalen;
- test fixture;
- visual review terkontrol.

Mock data tidak boleh tersisa pada production page seolah merupakan data real.

---

# 43. Definition of Done Roadmap

Roadmap dianggap berhasil dijalankan jika pada akhirnya Ruang Pintar memiliki:

- clean project baseline;
- design system konsisten;
- secure authentication;
- scoped authorization;
- academic organization;
- student lifecycle;
- teaching assignment;
- academic calendar/schedule/session;
- teacher workspace;
- attendance;
- TP-based assessment;
- gradebook;
- CBT;
- student experience;
- guardian experience;
- communication;
- monitoring;
- leadership reporting;
- integration boundary;
- AI boundary;
- production hardening.

---

# 44. Product Success Scenario

Salah satu end-to-end scenario wajib:

```text
Guru login
↓
Dashboard Guru
↓
Melihat Jadwal Hari Ini
↓
Membuka X RPL — KKA
↓
Membuka BAB 1 / Lingkup Materi 1
↓
Memilih TP1
↓
Membuka Pertemuan
↓
Mengisi administrasi pembelajaran
↓
Mengabsen siswa
↓
Membuat assessment TP1
↓
Mengisi nilai siswa
↓
Menyimpan
↓
Mempublikasikan sesuai workflow
↓
Siswa melihat nilai published
↓
Guardian melihat nilai published sesuai relationship
```

Jika workflow ini tidak dapat dilakukan pada release baseline yang seharusnya mendukungnya, product belum dianggap selesai.

---

# 45. Roadmap Summary

```text
FOUNDATION
00 Bootstrap
01 UI Foundation
02 Database & Platform

IDENTITY
03 Authentication
04 Authorization
05 Shell & Dashboard Framework

ACADEMIC FOUNDATION
06 School & Organization
07 Academic Structure
08 Student Lifecycle
09 Teacher Assignment
10 Calendar / Schedule / Session

TEACHER ACADEMIC MVP
11 Teacher Workspace
12 Attendance
13 TP Assessment & Gradebook

DIGITAL LEARNING & USERS
14 CBT
15 Student Experience
16 Guardian Experience
17 Communication & Notification

MANAGEMENT
18 Monitoring & Homeroom
19 Reporting & Leadership

EXTENSION
20 Integration
21 AI

RELEASE
22 Production Readiness
```

---

# 46. Final Principle

Roadmap ini sengaja tidak mengoptimalkan kecepatan dengan cara membiarkan AI membangun banyak hal sekaligus.

Yang dioptimalkan adalah:

```text
Correctness
Consistency
Traceability
Visual Fidelity
Domain Integrity
Human Control
```

Targetnya bukan:

> "AI berhasil menghasilkan banyak file."

Targetnya:

> **Ruang Pintar tumbuh phase demi phase menjadi produk yang bentuk, fungsi, akses, data, dan workflow-nya sesuai keputusan yang sudah disepakati.**

---

# 47. Dokumen Berikutnya

Setelah roadmap ini, dokumen berikutnya adalah:

```text
09-AI-CODING-RULES.md
```

Dokumen tersebut akan menerjemahkan seluruh aturan proyek menjadi **aturan operasional permanen bagi AI coding**, termasuk:

- bagaimana membaca dokumen;
- bagaimana menentukan scope;
- kapan boleh membuat migration;
- kapan boleh mengubah UI;
- bagaimana menggunakan reference;
- bagaimana melaporkan hasil;
- bagaimana berhenti pada human review;
- larangan improvisasi lintas phase;
- aturan Git;
- aturan testing;
- aturan security;
- aturan visual fidelity;
- aturan checkpoint.
