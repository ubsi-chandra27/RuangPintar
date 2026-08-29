# 09 — AI CODING RULES
## Ruang Pintar

**Nama Dokumen:** AI Coding Rules  
**Nama Produk:** Ruang Pintar  
**Versi Dokumen:** 1.0  
**Status:** APPROVED / LOCKED  
**Bahasa Utama:** Bahasa Indonesia  

**Dokumen Induk Otoritatif:**
- `00-PROJECT-BRIEF.md`
- `01-PRODUCT-REQUIREMENTS.md`
- `02-DOMAIN-MODEL.md`
- `03-MODULE-MAP.md`
- `04-ROLE-ACCESS.md`
- `05-SYSTEM-ARCHITECTURE.md`
- `06-DATA-ARCHITECTURE.md`
- `07-UI-UX-DESIGN-SYSTEM.md`
- `08-IMPLEMENTATION-ROADMAP.md`

---

# 1. Tujuan Dokumen

Dokumen ini menetapkan aturan operasional permanen untuk seluruh AI coding agent yang bekerja pada Ruang Pintar.

Dokumen ini berlaku untuk:

- Antigravity;
- Codex;
- Claude Code;
- Kiro;
- AI coding agent lain;
- agent otomatis yang melakukan review;
- agent yang membuat migration;
- agent yang mengubah UI;
- agent yang menjalankan test;
- agent yang membuat commit.

Tujuannya adalah memastikan AI:

- tidak menentukan produk sendiri;
- tidak mengubah arsitektur diam-diam;
- tidak melompati phase;
- tidak memperluas scope;
- tidak membuat UI generik;
- tidak merusak domain invariant;
- tidak membuat migration prematur;
- tidak menganggap test PASS sebagai human approval;
- tidak melakukan redesign tanpa izin;
- tidak membuat keputusan lintas dokumen secara sepihak.

Prinsip utama:

> **AI mengimplementasikan keputusan. AI tidak menciptakan keputusan produk baru tanpa proses review.**

---

# 2. Hierarki Otoritas

Jika terdapat konflik, gunakan urutan:

```text
1. Instruksi eksplisit terbaru dari Human
2. Dokumen APPROVED / LOCKED
3. Dokumen phase aktif
4. Domain invariant
5. Module ownership
6. Access model
7. System Architecture
8. Data Architecture
9. UI/UX Design System
10. Implementation Roadmap
11. Existing implementation yang sudah APPROVED
12. AI inference
```

AI inference adalah prioritas terakhir.

---

# 3. Dokumen adalah Kontrak

AI wajib membaca dokumen yang relevan sebelum bekerja.

Dilarang hanya mengandalkan:

- prompt singkat;
- nama phase;
- folder yang sudah ada;
- asumsi framework;
- pola umum dari proyek lain.

Untuk setiap pekerjaan, AI harus mengidentifikasi:

```text
ACTIVE PHASE
AUTHORITATIVE DOCS
DOMAIN SCOPE
MODULE OWNER
AUTHORIZATION SCOPE
UI CONTRACT
DATA SCOPE
EXPLICIT NON-SCOPE
STOP CONDITION
```

---

# 4. Bahasa

Semua prompt kerja, laporan phase, dokumentasi `.md`, catatan audit, dan penjelasan implementasi menggunakan **Bahasa Indonesia**.

Istilah berikut boleh mempertahankan bahasa asli jika lebih tepat:

- framework;
- package;
- command;
- filename;
- code;
- API;
- protocol;
- library;
- database keyword;
- technical term.

Kode tetap mengikuti konvensi bahasa pemrograman.

Database first-party Ruang Pintar menggunakan Bahasa Indonesia sesuai `06-DATA-ARCHITECTURE.md`.

---

# 5. Rule — Satu Phase Aktif

AI hanya boleh mengerjakan satu phase aktif.

Contoh valid:

```text
ACTIVE PHASE:
PHASE 12 — Class Attendance
```

Dilarang:

```text
"sekalian saya buat Gradebook"
"sekalian saya buat CBT"
"sekalian saya tambahkan dashboard pimpinan"
```

Jika kebutuhan berada di phase berikutnya:

```text
CATAT SEBAGAI FUTURE WORK
JANGAN IMPLEMENTASIKAN
```

---

# 6. Rule — Explicit Non-Scope

Setiap prompt implementasi harus memiliki `EXPLICIT NON-SCOPE`.

AI wajib mengulang konfirmasi non-scope di laporan akhir.

Contoh:

```text
NON-SCOPE:
- Gradebook
- CBT
- Guardian
- Reporting
```

Jika file dari non-scope harus disentuh karena technical dependency, AI harus melaporkan sebelum atau pada review dan menjaga perubahan minimum.

---

# 7. Rule — Stop Condition

Setiap phase harus memiliki kondisi berhenti.

Contoh:

```text
STOP setelah:
- implementation selesai;
- test PASS;
- build PASS;
- visual QA selesai;
- laporan dibuat;
- status READY FOR HUMAN REVIEW.
```

AI tidak boleh lanjut ke phase berikutnya secara otomatis.

---

# 8. Rule — Human Approval

AI boleh mengatakan:

```text
READY FOR REVIEW
READY FOR HUMAN REVIEW
TECHNICAL GATES PASS
```

AI dilarang mengatakan:

```text
APPROVED
LOCKED
FINAL APPROVED
```

kecuali Human secara eksplisit sudah memberikan approval dan AI hanya mencatat keputusan tersebut.

---

# 9. Rule — No Product Invention

AI tidak boleh menambahkan fitur karena dianggap:

- modern;
- best practice;
- menarik;
- umum pada dashboard;
- biasa ada di LMS;
- biasa ada di ERP;
- berguna nanti.

Contoh yang dilarang:

```text
menambah chart revenue
menambah AI chatbot
menambah gamification
menambah ranking siswa
menambah dark dashboard khusus
menambah payment
```

tanpa requirement.

---

# 10. Rule — No Silent Redesign

AI tidak boleh mengubah:

- sidebar;
- application shell;
- spacing;
- primary palette;
- typography;
- card hierarchy;
- dashboard anatomy;
- modal behavior;
- responsive pattern;
- CRUD feedback pattern.

Jika AI menilai desain perlu berubah:

```text
STOP
→ laporkan alasan
→ minta Human Review
```

---

# 11. Rule — Reference is Contract

Jika ada:

- screenshot;
- reference image;
- page contract;
- UI specification;
- handoff visual;

maka:

```text
REFERENCE = CONTRACT
```

bukan inspirasi bebas.

AI harus mempertahankan:

- hierarchy;
- layout;
- spacing intent;
- information priority;
- visual density;
- component semantics;
- responsive behavior.

---

# 12. Rule — Academic Glass UI

AI wajib mengikuti `07-UI-UX-DESIGN-SYSTEM.md`.

Baseline:

```text
Academic Glass UI v1.2
Cobalt
Academic Navy
Plus Jakarta Sans
Measured Glass
160/200/250ms motion
WCAG AA
44px minimum touch target
```

Dilarang membuat visual language baru per modul.

---

# 13. Rule — shadcn/ui Bukan Desain

shadcn/ui dan Base UI adalah primitive implementation.

AI tidak boleh menggunakan default style shadcn/ui lalu menganggap UI sudah sesuai Ruang Pintar.

Setiap komponen harus mengikuti token Ruang Pintar.

---

# 14. Rule — No Random Tailwind

Dilarang menambahkan warna, radius, shadow, spacing, atau motion acak jika token resmi sudah tersedia.

Jika pattern berulang:

```text
buat component
atau
buat token
```

bukan copy utility arbitrary berulang.

---

# 15. Rule — CRUD UX

Pola resmi:

```text
Create
→ Dialog

Edit
→ Dialog

Delete
→ Destructive Confirmation Dialog

Success
→ Dialog ditutup
→ SATU Toast

Validation Error
→ Inline
```

Dedicated page digunakan jika form terlalu kompleks untuk modal.

---

# 16. Rule — Responsive QA

Setiap phase UI wajib diuji pada:

```text
390×844
768×1024
1024×768
1440×900
```

AI harus melaporkan hasil setiap viewport.

---

# 17. Rule — Responsive Behaviour

Responsive bukan scale-down.

AI harus menggunakan:

```text
reflow
reorder
transform
hide secondary chrome
preserve primary action
```

Contoh:

```text
Desktop Table
→ Mobile Stacked Card
```

---

# 18. Rule — Dashboard Contract

AI tidak boleh membuat dashboard generik.

Dashboard harus berasal dari role-specific outcome.

Contoh Teacher Dashboard baseline:

```text
1. Jadwal Hari Ini
2. Kelas Saya
3. Perlu Perhatian
4. Tugas / Penilaian
5. Pengumuman
6. Supporting Summary
```

AI dilarang mengganti dengan:

```text
Generic KPI
Generic Chart
Random Recent Activity
```

tanpa page contract.

---

# 19. Rule — Critical Page Contract

Sebelum membuat halaman kritis, AI harus memastikan ada kontrak minimal:

```text
ROLE
PURPOSE
INFORMATION PRIORITY
PAGE ANATOMY
DATA
ACTION
AUTHORIZATION
RESPONSIVE BEHAVIOR
STATE
ACCEPTANCE CRITERIA
```

Jika belum ada, AI tidak boleh menebak desain final.

---

# 20. Rule — Authentication

Authentication UI dan authentication logic dipisahkan secara jelas.

Login harus mengikuti:

```text
username-based
server-side authentication
rate limiting
session security
must-change-password
```

jika phase aktif mencakupnya.

Dilarang menggunakan client-only authentication sebagai security boundary.

---

# 21. Rule — Authorization

Authorization selalu server-side.

Model:

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

UI hiding bukan security.

---

# 22. Rule — Default Deny

Jika effective access tidak dapat dibuktikan:

```text
DENY
```

AI tidak boleh membuat fallback permisif.

---

# 23. Rule — Role ≠ Full Access

Contoh:

```text
TEACHER
≠
semua kelas

SCHOOL_STAFF
≠
full admin

HEADMASTER
≠
system admin

GUARDIAN
≠
student proxy
```

---

# 24. Rule — Resource Scope

Setiap query sensitif harus mempertimbangkan scope:

- school;
- program;
- rombel;
- teaching assignment;
- homeroom assignment;
- student self;
- guardian relationship;
- explicit resource.

---

# 25. Rule — Domain Invariant

AI wajib mempertahankan invariant dari `02-DOMAIN-MODEL.md`.

Contoh:

```text
Student
≠
Enrollment
≠
Rombel Placement

Teacher
≠
Subject
≠
Teaching Assignment

Calendar
≠
Schedule
≠
Actual Class Session

Material
≠
Material Publication

Assessment
≠
Grade
≠
Grade Publication
```

---

# 26. Rule — No Domain Shortcut

Dilarang menyederhanakan:

```text
students.current_class
```

sebagai satu-satunya class history.

Dilarang:

```text
teachers.subject_id
```

sebagai seluruh teaching assignment model.

---

# 27. Rule — Module Ownership

Setiap data/domain memiliki owner module.

AI dilarang direct write ke tabel modul lain.

Contoh:

```text
CBT
→ tidak boleh UPDATE nilai langsung

CBT
→ Assessment Contract
→ Assessment Module
```

---

# 28. Rule — Cross-Module Contract

Gunakan:

```text
Application Contract
Domain/Application Event
Outbox
Read Model
```

sesuai kebutuhan.

Dilarang membuat coupling internal sembarangan.

---

# 29. Rule — Database Language

Nama tabel dan kolom first-party:

```text
Bahasa Indonesia
snake_case
```

Contoh:

```text
siswa
penempatan_rombel
penugasan_mengajar
nilai
presensi_sesi
```

Istilah teknis standar boleh tetap asli.

---

# 30. Rule — ULID

Entity domain baru menggunakan ULID 26 karakter sesuai Data Architecture.

Dilarang mengganti ke auto-increment hanya karena lebih mudah.

---

# 31. Rule — Migration Scope

Migration hanya untuk phase aktif.

Dilarang membuat schema seluruh roadmap pada awal project.

---

# 32. Rule — Applied Migration Immutable

Setelah migration sudah applied dan dianggap baseline:

```text
IMMUTABLE
```

Jika ada perubahan:

```text
buat forward migration baru
```

Dilarang edit migration lama diam-diam.

---

# 33. Rule — Fresh Migration Gate

Setiap phase data wajib membuktikan:

```text
empty DB
↓
all migrations
↓
schema valid
↓
test PASS
```

---

# 34. Rule — SQLite

Database engine:

```text
SQLite
```

untuk:

```text
development
testing
production
```

AI tidak boleh mengganti database tanpa architecture review.

---

# 35. Rule — SQLite Integrity

Wajib menjaga:

```text
foreign_keys = ON
WAL production
persistent storage
backup safety
short transaction
```

---

# 36. Rule — Prisma

Baseline ORM:

```text
Prisma ORM 7.x stable
```

Prisma adalah data-access tool, bukan Domain Model.

---

# 37. Rule — Transaction

Gunakan transaction jika beberapa perubahan harus atomic.

Dilarang external network call di dalam long-running critical transaction.

---

# 38. Rule — Outbox

Untuk side effect penting:

```text
Domain Transaction
+
Outbox Event
↓
Commit
↓
Worker
```

Outbox bukan source of truth.

---

# 39. Rule — Queue

Architecture harus queue-ready.

Namun:

```text
Queue-ready
≠
Queue-everything
```

Gunakan queue untuk:

- email;
- external notification;
- export besar;
- import besar;
- integration;
- AI;
- long-running task.

---

# 40. Rule — Idempotency

Job yang retryable harus idempotent jika duplicate side effect berbahaya.

---

# 41. Rule — File Storage

Baseline:

```text
Private Local Storage
```

Domain menggunakan storage abstraction.

Future:

```text
S3-compatible
```

---

# 42. Rule — File Security

File privat harus melalui authorization.

Mengetahui URL atau storage key bukan permission.

---

# 43. Rule — Audit

Audit:

```text
append-oriented
actor-aware
resource-aware
time-aware
```

Audit bukan technical log.

---

# 44. Rule — Notification

Notification bukan source of truth.

Jika delivery gagal:

```text
domain transaction utama tetap valid
```

kecuali requirement menyatakan sebaliknya.

---

# 45. Rule — AI Feature

AI hanya boleh melihat data yang sudah lolos effective access.

Dilarang:

```text
AI
→ full database access
```

AI output bukan data resmi tanpa workflow valid.

---

# 46. Rule — Integration

External provider selalu melalui adapter.

Core Ruang Pintar harus tetap dapat berjalan ketika provider eksternal gagal, kecuali requirement tertentu menyatakan provider itu mandatory.

---

# 47. Rule — No Vendor Lock-In by Accident

AI tidak boleh menanam logic domain langsung ke:

- email provider;
- AI provider;
- S3 vendor;
- WhatsApp provider;
- notification provider.

Gunakan adapter boundary.

---

# 48. Rule — No Mock Data in Production Flow

Mock data hanya boleh untuk:

- test;
- isolated component showcase;
- visual prototype terkontrol.

Dilarang menyisakan angka atau aktivitas palsu pada production dashboard.

---

# 49. Rule — No Fake KPI

Jika belum ada source data:

```text
tampilkan empty state
```

bukan angka dummy.

---

# 50. Rule — Loading State

Setiap async user action harus memiliki loading feedback yang sesuai.

Dilarang duplicate submit.

---

# 51. Rule — Empty State

Empty state harus menjelaskan:

- apa yang kosong;
- mengapa;
- apa next action.

---

# 52. Rule — Error State

Bedakan:

- validation;
- authorization;
- not found;
- conflict;
- infrastructure;
- external provider;
- unexpected error.

---

# 53. Rule — Accessibility

Minimum:

```text
semantic HTML
keyboard navigation
focus visible
label
accessible dialog
contrast AA
44px touch target
reduced motion
```

---

# 54. Rule — Time

Gunakan format:

```text
24 jam
```

Timezone sekolah harus eksplisit.

Server menjadi authority untuk deadline/timer sensitif.

---

# 55. Rule — Testing Layer

Gunakan sesuai kebutuhan:

```text
Unit
Domain
Application
Integration
Authorization
Migration
E2E
Visual/Human Review
```

---

# 56. Rule — Authorization Tests

Capability sensitif harus memiliki:

```text
allowed
denied
out-of-scope
expired
historical
state-restricted
```

test.

---

# 57. Rule — UI Test ≠ Human Review

Automated screenshot atau browser test tidak menggantikan human visual approval.

---

# 58. Rule — Build PASS ≠ Phase PASS

Phase UI belum selesai hanya karena:

```text
typecheck PASS
lint PASS
build PASS
test PASS
```

Visual dan Human Gate tetap wajib.

---

# 59. Rule — Review Order

Saat review:

```text
1. Domain correctness
2. Authorization
3. Data integrity
4. UX correctness
5. Accessibility
6. Responsive behavior
7. Visual fidelity
8. Performance
9. Decorative polish
```

---

# 60. Rule — Git Discipline

Sebelum commit:

- inspect diff;
- pastikan scope phase;
- jangan commit file incidental;
- test gate selesai;
- working tree dipahami.

---

# 61. Rule — Commit Message

Commit harus jelas dan sesuai phase.

Contoh:

```text
feat: implement class attendance
fix: correct attendance authorization scope
docs: record phase 12 review findings
```

---

# 62. Rule — No Auto Push

AI tidak boleh push remote kecuali:

- diminta Human;
- project workflow secara eksplisit mengizinkan.

---

# 63. Rule — No Force Push

Dilarang force push tanpa instruksi eksplisit.

---

# 64. Rule — No Destructive Git

Dilarang:

- reset hard;
- clean destructive;
- delete branch;
- rewrite history;

tanpa approval eksplisit.

---

# 65. Rule — Existing Work Preservation

AI tidak boleh menghapus atau mengganti pekerjaan user lain hanya untuk membuat implementation lebih mudah.

Jika konflik:

```text
STOP
→ laporkan
```

---

# 66. Rule — No Opportunistic Refactor

Dilarang melakukan refactor besar di luar scope phase.

Refactor hanya jika:

- diperlukan;
- sempit;
- dijelaskan;
- tidak mengubah behavior tak terkait.

---

# 67. Rule — Dependency Addition

Package baru hanya boleh ditambah jika:

- diperlukan;
- tidak redundan;
- kompatibel;
- aktif dipelihara;
- tidak menduplikasi capability built-in.

AI wajib menjelaskan dependency baru.

---

# 68. Rule — Dependency Version

Gunakan stable secure version yang sesuai baseline project.

Dilarang:

- alpha;
- beta;
- RC;

untuk core production tanpa keputusan eksplisit.

---

# 69. Rule — Security

AI wajib memperhatikan:

- authentication;
- authorization;
- input validation;
- CSRF sesuai mechanism;
- XSS;
- injection;
- file access;
- rate limiting;
- secret handling;
- session security.

---

# 70. Rule — Secrets

Dilarang:

- hard-code secret;
- commit `.env`;
- log token;
- tampilkan password;
- expose provider key ke browser.

---

# 71. Rule — Logging

Log tidak boleh mengandung data sensitif tanpa kebutuhan.

Technical log dan audit dipisahkan.

---

# 72. Rule — Performance

Urutan optimasi:

```text
correct model
↓
correct query
↓
correct index
↓
pagination
↓
measure
↓
optimize
```

Dilarang premature optimization yang merusak domain.

---

# 73. Rule — Query Scope

Query list besar harus bounded/paginated.

Dilarang unbounded read tanpa alasan.

---

# 74. Rule — N+1

AI wajib memeriksa N+1 pada halaman data padat.

---

# 75. Rule — Cache

Cache bukan source of truth.

Jangan menambahkan cache sebelum ada kebutuhan terukur.

---

# 76. Rule — Search

Search harus mengikuti authorization scope.

Dilarang search global yang membuka resource di luar access.

---

# 77. Rule — Import

Import besar:

```text
upload
↓
parse
↓
validate
↓
preview
↓
commit
↓
report
```

Dilarang memasukkan data invalid langsung ke domain.

---

# 78. Rule — Export

Export hanya data yang sudah lolos effective access.

File export sensitif disimpan private.

---

# 79. Rule — Delete

Delete strategy mengikuti domain.

Dilarang menerapkan global soft-delete otomatis.

---

# 80. Rule — History

Jangan menimpa histori untuk:

- enrollment;
- placement;
- assignment;
- schedule;
- grade publication;
- guardian relationship.

Gunakan lifecycle/effective dating/versioning sesuai domain.

---

# 81. Rule — Missing Grade

```text
Missing Grade
≠
Zero Grade
```

AI wajib mempertahankan invariant ini di DB, UI, dan reporting.

---

# 82. Rule — TP Assessment

Dilarang membuat:

```text
nilai_tp1
nilai_tp2
nilai_tp3
```

sebagai schema statis.

Gunakan:

```text
Lingkup Materi
↓
Tujuan Pembelajaran
↓
Assessment
↓
Grade
```

---

# 83. Rule — Attendance

```text
School Attendance
≠
Class Session Attendance
```

Jangan dicampur.

---

# 84. Rule — CBT

CBT wajib mempertahankan:

- question version;
- snapshot;
- server timer;
- autosave;
- resume;
- one active attempt;
- no answer key exposure;
- integrity events sebagai indicator.

---

# 85. Rule — Guardian

Guardian access hanya melalui verified relationship.

Guardian tidak dapat bertindak sebagai siswa.

---

# 86. Rule — Leadership

Leadership access adalah monitoring/management scope, bukan automatic full-write access.

---

# 87. Rule — Teacher

Teacher authority berasal dari Teaching Assignment.

Guru tidak memiliki all-class access secara otomatis.

---

# 88. Rule — Homeroom

Homeroom adalah assignment.

Wali kelas tidak otomatis dapat mengubah nilai guru lain.

---

# 89. Rule — UI Menu

Menu hanya menampilkan capability yang relevan.

Tetapi route/action tetap dilindungi server-side.

---

# 90. Rule — Application Shell

Shell mengikuti baseline:

```text
Desktop:
240px sidebar
↔
56px compact rail

Tablet:
compact navigation / drawer

Mobile:
header + drawer/mobile navigation
```

---

# 91. Rule — Motion

Gunakan:

```text
160ms
200ms
250ms
```

sesuai token.

Dilarang over-animation.

---

# 92. Rule — Icons

Gunakan satu icon family yang konsisten.

Icon-only action wajib accessible name/tooltip bila relevan.

---

# 93. Rule — Dark Mode

Jika diimplementasikan, dark mode harus mempertahankan hierarchy dan accessibility.

Dilarang mengubah visual identity hanya karena dark mode.

---

# 94. Rule — Page Density

Baseline:

```text
medium density
```

Desktop data table dapat lebih padat.

Mobile mengutamakan readability.

---

# 95. Rule — Copywriting

UI menggunakan Bahasa Indonesia yang:

- singkat;
- jelas;
- actionable;
- konsisten.

Dilarang placeholder generik seperti:

```text
Lorem ipsum
Coming soon
Feature here
```

pada production flow kecuali memang state resmi.

---

# 96. Rule — Placeholder State

Jika phase belum mengimplementasikan capability:

gunakan state eksplisit seperti:

```text
"Fitur ini belum tersedia pada phase aktif."
```

bukan tombol palsu.

---

# 97. Rule — Documentation Update

Jika implementation mengubah keputusan yang sudah approved:

AI harus STOP dan meminta review.

Dokumen tidak boleh diubah diam-diam untuk menyesuaikan code.

---

# 98. Rule — Code Must Follow Docs

Urutan:

```text
Docs
↓
Implementation
```

Bukan:

```text
Implementation
↓
Docs dipaksa menyesuaikan
```

---

# 99. Rule — ADR

Perubahan arsitektur besar harus melalui ADR atau review resmi.

Contoh:

- SQLite → PostgreSQL;
- single-school → multi-tenant;
- local storage → mandatory S3;
- Modular Monolith → microservices.

---

# 100. Rule — AI Must Report Divergence

Jika implementation berbeda dari dokumen:

laporan wajib memiliki:

```text
DIVERGENCE
REASON
IMPACT
FILES
PROPOSED ACTION
```

AI tidak boleh menyembunyikannya.

---

# 101. Rule — AI Must Report Limitations

Jika sesuatu belum selesai:

```text
KNOWN LIMITATIONS
```

wajib disebutkan.

Dilarang mengatakan complete jika masih ada gap.

---

# 102. Rule — AI Report Format

Setiap phase wajib memberikan laporan dengan struktur:

```text
PHASE
STATUS
OBJECTIVE
FILES CREATED
FILES MODIFIED
DEPENDENCIES ADDED
MIGRATIONS
DOMAIN IMPLEMENTATION
AUTHORIZATION
UI IMPLEMENTATION
RESPONSIVE QA
ACCESSIBILITY QA
TESTS
TYPECHECK
LINT
FORMAT
BUILD
DATABASE GATE
SECURITY NOTES
KNOWN LIMITATIONS
OUT-OF-SCOPE CONFIRMATION
GIT STATUS
READY FOR HUMAN REVIEW
```

---

# 103. Rule — Status Vocabulary

Gunakan:

```text
IN PROGRESS
BLOCKED
TECHNICAL GATES PASS
READY FOR HUMAN REVIEW
REJECTED BY REVIEW
APPROVED BY HUMAN
```

AI tidak boleh membuat vocabulary ambigu.

---

# 104. Rule — Blocked Work

Jika benar-benar blocked oleh fakta yang tidak bisa disimpulkan:

AI harus:

1. jelaskan blocker;
2. jangan mengarang;
3. selesaikan bagian yang aman;
4. hentikan pada boundary.

---

# 105. Rule — Clarification

AI tidak perlu meminta klarifikasi untuk hal yang sudah dijelaskan dokumen.

Jika keputusan memang belum ada dan materially affects product:

```text
STOP
→ Human Decision Required
```

---

# 106. Rule — No Repeated Questions

AI wajib membaca context dan dokumen sebelum meminta user mengulang informasi.

---

# 107. Rule — Tooling

AI harus menggunakan tooling yang sesuai project.

Dilarang mengganti tooling hanya karena preference agent.

---

# 108. Rule — Generated Code

Generated code harus:

- readable;
- typed;
- minimal;
- maintainable;
- mengikuti module boundary;
- memiliki test sesuai risk.

---

# 109. Rule — Comments

Jangan membuat comment yang hanya mengulang code.

Comment digunakan untuk:

- invariant;
- non-obvious constraint;
- security rationale;
- compatibility concern.

---

# 110. Rule — Naming Code

Code naming mengikuti konvensi TypeScript/Next.js.

Domain terminology harus tetap selaras dengan dokumen Bahasa Indonesia walaupun identifier source menggunakan English technical naming bila diperlukan.

Mapping database fisik tetap mengikuti Data Architecture.

---

# 111. Rule — No God Service

Dilarang membuat service besar yang menangani banyak module sekaligus.

---

# 112. Rule — No Generic Repository Abuse

Generic repository tidak boleh menghapus domain semantics.

Gunakan data access yang mencerminkan use case/module.

---

# 113. Rule — No Generic CRUD API

Dilarang membuat endpoint:

```text
/api/crud?table=...
```

atau pola yang membypass domain/authorization.

---

# 114. Rule — Next.js Server Boundary

Gunakan server-side path yang sesuai:

- Server Components untuk read privat bila cocok;
- Server Actions/mutation boundary untuk domain mutation;
- Route Handlers untuk HTTP API/webhook yang memang diperlukan.

Jangan membuat REST endpoint untuk setiap CRUD tanpa kebutuhan.

---

# 115. Rule — Client Component

Gunakan Client Component hanya jika dibutuhkan untuk:

- browser API;
- interactive state;
- rich input;
- realtime interaction;
- UI behavior.

Server by default.

---

# 116. Rule — No Direct DB from Client

Dilarang.

---

# 117. Rule — API Adapter

External API selalu melalui adapter boundary.

---

# 118. Rule — API Failure

Provider failure tidak boleh membuat core domain gagal tanpa reason yang sah.

---

# 119. Rule — Production Data Safety

AI tidak boleh:

- truncate production;
- reset production DB;
- seed fake data ke production;
- run destructive migration;

tanpa explicit human approval.

---

# 120. Rule — Backup Before Risky Migration

Migration berisiko production harus memiliki backup/recovery plan.

---

# 121. Rule — Restore Test

Backup dianggap valid jika pernah diuji restore.

---

# 122. Rule — Security Review Before Release

Phase Final Hardening wajib melakukan security review menyeluruh.

---

# 123. Rule — Human Visual Review Before Baseline

UI yang belum human-approved tidak boleh dianggap baseline untuk phase berikutnya.

---

# 124. Rule — Login Fidelity

Login harus dibandingkan dengan visual contract V2 yang sudah dipilih.

Dilarang redesign login tanpa approval.

---

# 125. Rule — Teacher Academic MVP

Milestone wajib membuktikan workflow:

```text
Login
↓
Dashboard Guru
↓
Kelas Saya
↓
Lingkup Materi/BAB
↓
TP
↓
Pertemuan
↓
Administrasi Guru
↓
Presensi
↓
Pengambilan Nilai
↓
Gradebook
```

Jika flow ini belum usable, milestone belum selesai.

---

# 126. Rule — No Dashboard Before Data Ownership

Dashboard hanya boleh menampilkan data yang sudah memiliki domain source.

Jika belum:

```text
empty state
```

bukan mock.

---

# 127. Rule — Human is Final Arbiter

Dalam konflik antara AI reasoning dan keputusan Human:

```text
Human wins
```

selama tidak melanggar safety/security fundamental yang harus dijelaskan.

---

# 128. Rule — Review Findings Are Actionable

Jika human review menemukan mismatch:

AI harus:

- memperbaiki mismatch;
- tidak defensif;
- tidak mengubah requirement;
- tidak memperluas scope.

---

# 129. Rule — Phase Approval is Immutable Baseline

Phase yang sudah APPROVED dianggap baseline.

Perubahan berikutnya harus:

- explicit;
- scoped;
- documented;
- diuji regresi.

---

# 130. Rule — No Retroactive Rewrite

AI tidak boleh mengubah phase lama hanya karena phase baru sulit diimplementasikan.

Jika arsitektur perlu berubah:

```text
review
→ ADR
→ human approval
```

---

# 131. Rule — Critical Invariants Must Have Tests

Invariant yang penting harus memiliki test.

Contoh:

```text
Missing Grade != Zero
One Active CBT Attempt
Guardian Scope
Teacher Assignment Scope
Historical Placement
Published Grade Visibility
```

---

# 132. Rule — No Success Without Evidence

AI tidak boleh mengatakan PASS tanpa output/evidence yang benar-benar diperoleh.

---

# 133. Rule — Final Check

Sebelum melaporkan READY FOR HUMAN REVIEW, AI harus memeriksa:

```text
scope
docs
diff
tests
build
database
authorization
responsive
accessibility
known limitations
git status
```

---

# 134. Definition of Done AI Coding

AI dianggap bekerja sesuai standar jika:

- mengikuti phase;
- mengikuti docs;
- tidak improvisasi scope;
- menjaga domain invariant;
- menjaga module ownership;
- menjaga authorization;
- menjaga visual fidelity;
- menguji implementation;
- melaporkan secara transparan;
- berhenti pada human review.

---

# 135. Prompt Template Wajib

Setiap prompt phase idealnya menggunakan format:

```text
PROJECT:
Ruang Pintar

ACTIVE PHASE:
[PHASE]

OBJECTIVE:
[Tujuan]

AUTHORITATIVE DOCUMENTS:
[Daftar]

DOMAIN INVARIANTS:
[Daftar]

MODULE OWNERSHIP:
[Daftar]

UI CONTRACT:
[Page Contract / Reference]

DATA SCOPE:
[Scope]

AUTHORIZATION:
[Scope]

EXPLICIT NON-SCOPE:
[Daftar]

IMPLEMENTATION RULES:
[Aturan]

QUALITY GATES:
[Test / Build / Data / Visual]

STOP CONDITION:
Berhenti setelah READY FOR HUMAN REVIEW.

REPORT:
Gunakan format laporan phase resmi.
```

---

# 136. AI Pre-Flight Checklist

Sebelum coding:

```text
[ ] Saya tahu phase aktif.
[ ] Saya sudah membaca dokumen authoritative.
[ ] Saya tahu module owner.
[ ] Saya tahu domain invariant.
[ ] Saya tahu authorization scope.
[ ] Saya tahu UI contract.
[ ] Saya tahu data scope.
[ ] Saya tahu non-scope.
[ ] Saya tahu stop condition.
```

Jika salah satu belum jelas secara material:

```text
JANGAN MULAI IMPLEMENTASI FINAL
```

---

# 137. AI Post-Flight Checklist

Setelah coding:

```text
[ ] Scope sesuai.
[ ] Tidak ada feature leakage.
[ ] Domain invariant dijaga.
[ ] Authorization diuji.
[ ] Migration valid.
[ ] UI sesuai contract.
[ ] Responsive QA selesai.
[ ] Accessibility QA selesai.
[ ] Tests PASS.
[ ] Typecheck PASS.
[ ] Lint PASS.
[ ] Build PASS.
[ ] Known limitations disebutkan.
[ ] Git status dilaporkan.
[ ] Status READY FOR HUMAN REVIEW.
```

---

# 138. Final Principle

Aturan final:

```text
AI TIDAK MENENTUKAN PRODUK.
AI TIDAK MENENTUKAN DESAIN.
AI TIDAK MENENTUKAN DOMAIN.
AI TIDAK MENENTUKAN AKSES.
AI TIDAK MENENTUKAN ROADMAP.

AI MEMBACA.
AI MEMAHAMI.
AI MENGIMPLEMENTASIKAN.
AI MENGUJI.
AI MELAPORKAN.
AI BERHENTI.

HUMAN MENINJAU.
HUMAN MENYETUJUI.
HUMAN MENGUNCI.
```

---

# 139. Status Akhir

Dokumen ini merupakan aturan operasional resmi bagi AI coding Ruang Pintar.

```text
Version: 1.0
Status: APPROVED / LOCKED
```

Perubahan terhadap dokumen ini harus melalui human review dan tidak boleh dilakukan diam-diam oleh AI coding agent.
