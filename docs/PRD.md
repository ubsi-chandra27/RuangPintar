# PRD — PRODUCT REQUIREMENTS DOCUMENT
## Ruang Pintar

**Versi:** 1.0  
**Status:** BASELINE RESMI  
**Bahasa Utama:** Bahasa Indonesia  

---

# 1. Product Vision

Ruang Pintar adalah:

> **School Digital Operating Platform modular yang menyatukan proses akademik, pembelajaran, administrasi, komunikasi, monitoring, dan layanan sekolah dalam satu ekosistem digital terintegrasi.**

---

# 2. Product Principles

## PRD-PRINCIPLE-001 — Modular

Capability dipisahkan menjadi module yang memiliki ownership jelas.

## PRD-PRINCIPLE-002 — Role-Aware

Experience berbeda berdasarkan role, position, assignment, relationship, dan resource scope.

## PRD-PRINCIPLE-003 — Historical

Perubahan periode tidak menghapus histori akademik.

## PRD-PRINCIPLE-004 — Audit-Oriented

Perubahan penting dapat ditelusuri.

## PRD-PRINCIPLE-005 — Server-Authoritative

Security, authorization, deadline sensitif, dan timer kritis tidak bergantung pada client.

## PRD-PRINCIPLE-006 — Visual Consistency

Seluruh UI mengikuti Academic Glass UI.

## PRD-PRINCIPLE-007 — Human-Controlled AI

AI hanya assistance.

---

# 3. Target Users

- SUPER_ADMIN
- SCHOOL_STAFF
- TEACHER
- STUDENT
- GUARDIAN

Contextual position:

- HEADMASTER
- VICE_PRINCIPAL_CURRICULUM
- VICE_PRINCIPAL_STUDENT_AFFAIRS
- PROGRAM_HEAD

Contextual assignment:

- TEACHING_ASSIGNMENT
- HOMEROOM_ASSIGNMENT
- POSITION_ASSIGNMENT

---

# 4. Product Scope

## P01 — Foundation

- School & Organization
- Identity & Access
- Platform Configuration
- File & Document
- Audit & Traceability

## P02 — Academic Foundation

- Academic Period & Structure
- Student Academic Lifecycle
- Teacher & Teaching Assignment
- Academic Calendar
- Scheduling & Class Session

## P03 — Teacher Academic Experience

- Teacher Dashboard
- Kelas Saya
- Lingkup Materi / BAB
- Tujuan Pembelajaran
- Materi
- Administrasi Pembelajaran
- Tugas
- Presensi
- Assessment
- Gradebook
- CBT

## P04 — Student Experience

- dashboard siswa;
- jadwal;
- materi;
- tugas;
- submission;
- CBT;
- presensi pribadi;
- nilai published;
- pengumuman;
- notifikasi.

## P05 — Guardian Experience

- child context;
- jadwal;
- tugas;
- CBT;
- presensi;
- nilai published;
- pengumuman;
- limited request/correction sesuai requirement.

## P06 — Staff & Leadership

- academic management;
- student data management;
- reporting;
- monitoring;
- leadership dashboard sesuai scope.

## P07 — Communication

- announcement;
- notification;
- optional external delivery.

## P08 — Extension

- integration;
- AI assistance.

---

# 5. Product Non-Scope Baseline

Tidak termasuk sebagai core mandatory:

- SPMB;
- finance;
- payroll;
- library;
- inventory;
- BKK;
- tracer;
- alumni;
- e-office;
- public website;
- transport;
- canteen;
- clinic;
- dormitory;
- payment gateway.

---

# 6. Product Architecture Constraints

Baseline:

```text
Architecture:
Modular Monolith

Framework:
Next.js stable secure release

Language:
TypeScript

Styling:
Tailwind CSS

UI:
shadcn/ui + Base UI
dengan Academic Glass UI

Database:
SQLite

ORM:
Prisma ORM

Identifier:
ULID 26 karakter

Deployment:
Single-school-per-deployment
```

---

# 7. UX Requirements

## PRD-UX-001

Dashboard tidak boleh generik.

## PRD-UX-002

Role dashboard harus menunjukkan aktivitas yang relevan terhadap pekerjaan role tersebut.

## PRD-UX-003

Responsive baseline:

```text
390×844
768×1024
1024×768
1440×900
```

## PRD-UX-004

CRUD:

```text
Create/Edit → Dialog
Delete → Destructive Confirmation
Success → close + satu toast
Validation → inline
```

## PRD-UX-005

Accessibility minimal WCAG 2.1 AA.

## PRD-UX-006

Touch target minimal 44px.

---

# 8. Login Product Requirement

Login baseline:

```text
username
password
remember me
forgot password bila tersedia
rate limiting
must-change-password
logout
```

Visual:

```text
Desktop:
58% hero
42% form

Mobile:
form first
hero setelah form
```

---

# 9. Teacher Dashboard Product Requirement

Information priority:

```text
1. Jadwal Hari Ini / Kelas Berikutnya
2. Kelas Saya
3. Aktivitas yang Membutuhkan Perhatian
4. Tugas / Penilaian
5. Pengumuman
6. Supporting Summary
```

Dilarang menggunakan generic chart/KPI tanpa source data dan requirement.

---

# 10. Teacher Workspace Product Requirement

Baseline:

```text
Kelas Saya
└── Rombel — Mata Pelajaran
    ├── Ringkasan
    ├── Jadwal
    ├── Lingkup Materi / BAB
    ├── Materi
    ├── Administrasi
    ├── Tugas
    ├── Presensi
    ├── Penilaian
    └── CBT
```

---

# 11. Academic Structure Product Requirement

Sistem harus mendukung struktur umum lintas jenjang tanpa mengunci implementasi ke SMK saja.

Baseline:

- Tahun Ajaran
- Semester
- Phase
- Grade Level
- Program opsional
- Rombel

---

# 12. Student Lifecycle Product Requirement

Student Identity tidak boleh menyimpan keseluruhan state akademik langsung.

Gunakan konsep:

```text
Siswa
↓
Keikutsertaan Akademik
↓
Penempatan Rombel
```

---

# 13. Teacher Assignment Product Requirement

Teacher authority terhadap kelas/mapel berasal dari Teaching Assignment aktif.

Workload diturunkan dari assignment aktif.

---

# 14. Scheduling Product Requirement

Pisahkan:

```text
Academic Calendar
Master Schedule
Actual Class Session
```

Guru melakukan aktivitas presensi/administrasi terhadap Actual Class Session.

Strategi Penjadwalan:
- Penjadwalan V1 menggunakan pendekatan **manual scheduling + intelligent conflict detection** (deteksi bentrok guru, rombel/kelas, ruang, dan slot waktu).
- Keputusan jadwal akhir ditentukan oleh manusia.
- Automatic timetable generator adalah **non-scope V1 (future enhancement)**.

---

# 15. Learning Product Requirement

Pisahkan:

```text
Material Definition
Material Publication

Assignment Definition
Assignment Publication
Submission
```

---

# 16. Attendance Product Requirement

Pisahkan:

```text
School Attendance
Class Session Attendance
```

Teacher Academic MVP memprioritaskan Class Session Attendance.

---

# 17. Assessment Product Requirement

Model:

```text
Lingkup Materi / BAB
↓
Tujuan Pembelajaran
↓
Assessment
↓
Grade
↓
Grade Publication
```

Dilarang membuat TP sebagai kolom statis seperti:

```text
nilai_tp1
nilai_tp2
```

---

# 18. CBT Product Requirement

CBT harus mendukung:

- bank soal;
- question version;
- blueprint;
- snapshot;
- attempt;
- server timer;
- autosave;
- resume;
- one active attempt;
- integrity indicator;
- result handoff ke Assessment.

Answer key tidak boleh diekspos ke client tanpa kebutuhan.

---

# 19. Student Experience Product Requirement

Siswa memperoleh self-scope.

Dashboard memprioritaskan:

- aktivitas hari ini;
- jadwal berikutnya;
- deadline tugas;
- CBT mendatang;
- presensi;
- nilai published;
- pengumuman;
- notifikasi.

---

# 20. Guardian Product Requirement

Guardian hanya memperoleh akses berdasarkan verified relationship.

Guardian tidak dapat bertindak sebagai siswa.

---

# 21. Leadership Product Requirement

Pimpinan memperoleh monitoring/analytics sesuai scope.

Leadership role tidak otomatis memiliki full system write access.

---

# 22. Communication Product Requirement

Pisahkan:

```text
Announcement
Notification
```

Notification tidak menjadi source of truth.

---

# 23. Integration Product Requirement

Core harus tetap bekerja tanpa external API.

External service menggunakan adapter.

Candidate:

- Resend;
- FCM;
- Meta WhatsApp Cloud API;
- S3-compatible storage;
- Google Calendar.

Provider diaktifkan sesuai kebutuhan.

---

# 24. AI Product Requirement

AI:

- server-side;
- scoped terhadap effective access;
- optional;
- bukan source of truth;
- tidak memiliki full database access langsung.

---

# 25. Product Quality Requirements

Setiap phase relevan harus memenuhi:

- typecheck;
- lint;
- format;
- test;
- build;
- data gate;
- authorization gate;
- responsive QA;
- accessibility QA;
- human visual review.

---

# 26. Product Milestones

## Milestone A
Foundation Ready

## Milestone B
Identity Entry Ready

## Milestone C
Academic Foundation Ready

## Milestone D
Teacher Academic MVP

## Milestone E
Digital Assessment Ready

## Milestone F
Student & Guardian Experience Ready

## Milestone G
Management Ready

## Milestone H
Extension Ready

## Milestone I
Release Ready

Detail urutan terdapat pada `08-IMPLEMENTATION-ROADMAP.md`.

---

# 27. Product Acceptance Principle

Sebuah fitur tidak dianggap selesai hanya karena halaman dapat dirender.

Acceptance harus membuktikan:

```text
UI sesuai
+
data benar
+
authorization benar
+
workflow dapat diselesaikan
+
state error/loading/empty jelas
+
test relevan PASS
+
human review bila UI kritis
```

---

# 28. Final Product Principle

> Ruang Pintar harus terasa sebagai satu produk yang kohesif, bukan kumpulan CRUD, dashboard generik, atau modul yang berdiri sendiri tanpa konteks akademik.
