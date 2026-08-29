# 03 — MODULE MAP
## Ruang Pintar

**Nama Dokumen:** Module Map  
**Nama Produk:** Ruang Pintar  
**Versi Dokumen:** 1.0-RC  
**Status:** FINAL REVIEW  
**Dokumen Induk:**  
- `00-PROJECT-BRIEF.md`
- `01-PRODUCT-REQUIREMENTS.md`
- `02-DOMAIN-MODEL.md`

**Jenis Dokumen:** Peta Modul Produk  
**Bahasa Utama:** Bahasa Indonesia

---

# 1. Tujuan Dokumen

Dokumen ini mendefinisikan bagaimana capability dan domain Ruang Pintar dikelompokkan menjadi modul produk yang memiliki tanggung jawab jelas.

Dokumen ini menjawab pertanyaan:

> **Ruang Pintar terdiri dari modul apa saja, tanggung jawab setiap modul apa, domain apa yang dimiliki setiap modul, dan bagaimana dependensi antarmodul diatur?**

Module Map bertujuan mencegah:

- menu dibangun tanpa boundary yang jelas;
- satu domain dikelola oleh banyak modul secara tumpang tindih;
- circular dependency yang tidak terkendali;
- modul mengakses data internal modul lain secara sembarangan;
- fitur baru ditempelkan tanpa mengetahui ownership;
- aplikasi berkembang menjadi monolith yang tidak terstruktur.

---

# 2. Posisi Module Map

Urutan dokumen:

```text
00-PROJECT-BRIEF.md
        ↓
Identitas dan arah produk

01-PRODUCT-REQUIREMENTS.md
        ↓
Kemampuan yang dibutuhkan produk

02-DOMAIN-MODEL.md
        ↓
Konsep dan aturan bisnis

03-MODULE-MAP.md
        ↓
Pengelompokan capability dan ownership domain

04-ROLE-ACCESS.md
        ↓
Siapa boleh melakukan apa

05-SYSTEM-ARCHITECTURE.md
        ↓
Bagaimana boundary diterapkan secara teknis

06-DATA-ARCHITECTURE.md
        ↓
Bagaimana data dimodelkan dan disimpan
```

Module Map bukan struktur menu dan bukan struktur folder final.

---

# 3. Prinsip Pembentukan Modul

## 3.1 Modul Dibentuk dari Tanggung Jawab Domain

Modul tidak dibuat hanya karena terdapat satu halaman atau satu tabel.

Contoh buruk:

```text
Module Dashboard
Module Form
Module Table
```

Contoh yang benar:

```text
Academic
Scheduling
Learning
Attendance
Assessment
```

## 3.2 Satu Konsep Harus Memiliki Owner Utama

Setiap domain concept memiliki satu modul yang bertanggung jawab sebagai owner utama.

Modul lain boleh menggunakan konsep tersebut melalui kontrak yang sah, tetapi tidak mengambil alih ownership.

## 3.3 Dependensi Harus Searah Jika Memungkinkan

Struktur ideal:

```text
Foundation
    ↓
Academic Context
    ↓
Operational Modules
    ↓
Experience / Reporting
```

Circular dependency harus dihindari.

## 3.4 Modul Tidak Sama dengan Deployment Unit

Module Map tidak menetapkan bahwa setiap modul harus menjadi:

- microservice;
- package terpisah;
- repository terpisah;
- database terpisah;
- deployment terpisah.

Keputusan tersebut milik System Architecture.

## 3.5 Modul Tidak Sama dengan Menu

Satu modul dapat memiliki banyak halaman.

Satu halaman dapat menyajikan data dari beberapa modul tanpa memindahkan ownership domain.

## 3.6 Shared Capability Harus Dibatasi

Kemampuan lintas modul seperti:

- File;
- Audit;
- Notification;
- Configuration;
- Integration;

harus memiliki boundary jelas agar tidak menjadi tempat menaruh semua logic.

---

# 4. Klasifikasi Modul

Ruang Pintar menggunakan empat klasifikasi modul.

## 4.1 Foundation Module

Modul yang menjadi fondasi sistem dan dibutuhkan oleh sebagian besar capability.

## 4.2 Core Academic Module

Modul inti yang membentuk operasi akademik sekolah.

## 4.3 Operational Module

Modul yang menjalankan workflow tertentu di atas fondasi akademik.

## 4.4 Extension Module

Modul tambahan yang dapat dikembangkan tanpa mengubah fondasi produk.

---

# 5. Peta Modul Tingkat Tinggi

```text
RUANG PINTAR
│
├── FOUNDATION
│   ├── M01 School & Organization
│   ├── M02 Identity & Access
│   ├── M03 Platform Configuration
│   ├── M04 File & Document
│   └── M05 Audit & Traceability
│
├── CORE ACADEMIC
│   ├── M06 Academic Period & Structure
│   ├── M07 Student Academic Lifecycle
│   ├── M08 Teacher & Teaching Assignment
│   ├── M09 Academic Calendar
│   └── M10 Scheduling & Class Session
│
├── OPERATIONAL
│   ├── M11 Learning
│   ├── M12 Attendance
│   ├── M13 Assessment & Gradebook
│   ├── M14 CBT
│   ├── M15 Guardian & Family
│   ├── M16 Communication
│   ├── M17 Notification
│   ├── M18 Student Monitoring
│   └── M19 Reporting & Analytics
│
└── EXTENSION / PLATFORM
    ├── M20 Integration
    └── M21 AI Assistance
```

---

# 6. M01 — School & Organization

**Klasifikasi:** Foundation  
**Status Produk:** CORE / WAJIB

## Tanggung Jawab

Modul ini mengelola konteks organisasi sekolah.

## Domain yang Dimiliki

- School;
- Organization Unit;
- Position;
- Position Assignment;
- struktur organisasi dasar.

## Capability Utama

- profil sekolah;
- unit organisasi;
- struktur jabatan;
- assignment jabatan periodik;
- identitas dasar organisasi;
- konteks school boundary.

## Bukan Tanggung Jawab

- akun pengguna;
- permission;
- struktur akademik;
- Teaching Assignment;
- Homeroom Assignment;
- jadwal.

## Dependensi

```text
Tidak bergantung pada modul domain operasional lain.
```

Digunakan oleh hampir seluruh modul.

---

# 7. M02 — Identity & Access

**Klasifikasi:** Foundation  
**Status Produk:** CORE / WAJIB

## Tanggung Jawab

Mengelola identitas autentikasi dan effective access.

## Domain yang Dimiliki

- User Account;
- authentication identity;
- role assignment;
- permission definition;
- access evaluation;
- session identity;
- effective access context.

## Capability Utama

- autentikasi;
- lifecycle account;
- aktivasi dan deaktivasi account;
- role;
- permission;
- access evaluation;
- multi-context user;
- least privilege;
- server-side authorization foundation.

## Menggunakan Domain dari Modul Lain

Access evaluation dapat menggunakan:

- Position Assignment dari M01;
- Teaching Assignment dari M08;
- Homeroom Assignment dari M07/M08 sesuai ownership final;
- Guardian–Student Relationship dari M15.

## Aturan

M02 tidak boleh mengambil ownership atas assignment domain tersebut.

Identity & Access hanya menggunakannya sebagai **sumber authorization context**.

---

# 8. M03 — Platform Configuration

**Klasifikasi:** Foundation  
**Status Produk:** CORE / WAJIB

## Tanggung Jawab

Mengelola konfigurasi platform dan konfigurasi sekolah yang tidak merupakan transaksi domain.

## Domain yang Dimiliki

- Configuration;
- feature/capability configuration;
- school-level settings;
- product defaults.

## Capability Utama

- konfigurasi sekolah;
- timezone;
- locale;
- preference produk;
- capability activation;
- kebijakan sistem yang dapat dikonfigurasi.

## Aturan

Configuration tidak boleh digunakan untuk menggantikan domain model.

Contoh:

```text
SALAH:
configuration.student_current_class

BENAR:
current class berasal dari Rombel Placement
```

---

# 9. M04 — File & Document

**Klasifikasi:** Foundation  
**Status Produk:** CORE / WAJIB

## Tanggung Jawab

Mengelola metadata, lifecycle, dan akses file.

## Domain yang Dimiliki

- File;
- File Metadata;
- file attachment relation;
- storage abstraction.

## Capability Utama

- upload;
- download;
- attachment;
- akses file privat;
- lifecycle file;
- validation file;
- storage metadata.

## Aturan

M04 tidak menentukan siapa berhak melihat resource induk.

Authorization utama berasal dari resource owner.

Contoh:

```text
Submission
    ↓
Attachment
    ↓
M04 File

Hak melihat file
    ↓
mengikuti hak melihat Submission
```

---

# 10. M05 — Audit & Traceability

**Klasifikasi:** Foundation  
**Status Produk:** CORE / WAJIB

## Tanggung Jawab

Mencatat aktivitas domain penting yang membutuhkan keterlacakan.

## Domain yang Dimiliki

- Audit Log;
- Audit Event;
- change context;
- actor context.

## Capability Utama

- audit create/update/delete;
- audit approval;
- audit correction;
- audit bulk operation;
- jejak perubahan nilai penting;
- traceability.

## Bukan Tanggung Jawab

- application logging;
- error logging;
- Notification;
- analytics.

---

# 11. M06 — Academic Period & Structure

**Klasifikasi:** Core Academic  
**Status Produk:** CORE / WAJIB

## Tanggung Jawab

Mengelola struktur dan konteks akademik sekolah.

## Domain yang Dimiliki

- Academic Year;
- Semester;
- Phase;
- Grade Level;
- Program;
- Rombel;
- struktur akademik periodik.

## Capability Utama

- tahun ajaran;
- semester;
- tingkat;
- fase;
- program/jurusan;
- rombongan belajar;
- lifecycle periode;
- kapasitas rombel;
- histori struktur.

## Dependensi

```text
M01 School & Organization
M03 Platform Configuration
```

## Digunakan oleh

- M07 Student Academic Lifecycle;
- M08 Teacher & Teaching Assignment;
- M09 Academic Calendar;
- M10 Scheduling;
- M11 Learning;
- M12 Attendance;
- M13 Assessment;
- M14 CBT;
- M18 Monitoring;
- M19 Reporting.

---

# 12. M07 — Student Academic Lifecycle

**Klasifikasi:** Core Academic  
**Status Produk:** CORE / WAJIB

## Tanggung Jawab

Mengelola identitas siswa dalam konteks sekolah serta lifecycle akademiknya.

## Domain yang Dimiliki

- Student Identity;
- Student Enrollment;
- Rombel Placement;
- status akademik siswa;
- histori perpindahan;
- histori kelulusan;
- Homeroom Assignment relationship terhadap rombel dapat direferensikan, tetapi ownership wali kelas ditentukan pada M08.

## Invariant

```text
Student Identity
≠
Student Enrollment
≠
Rombel Placement
```

## Capability Utama

- data siswa;
- enrollment;
- placement;
- promotion;
- transfer;
- graduation;
- status akademik;
- histori akademik dasar;
- bulk placement/promotion.

## Dependensi

```text
M01 School & Organization
M06 Academic Period & Structure
```

---

# 13. M08 — Teacher & Teaching Assignment

**Klasifikasi:** Core Academic  
**Status Produk:** CORE / WAJIB

## Tanggung Jawab

Mengelola profil guru dan assignment akademik guru.

## Domain yang Dimiliki

- Teacher Profile;
- Staff Profile yang relevan dengan konteks akademik;
- Subject;
- Teaching Assignment;
- Homeroom Assignment;
- workload derivation.

## Invariant

```text
Teacher
≠
Subject
≠
Teaching Assignment
```

## Capability Utama

- data guru;
- mata pelajaran;
- assignment guru;
- scope mengajar;
- wali kelas;
- assignment periodik;
- beban mengajar;
- histori assignment.

## Dependensi

```text
M01 School & Organization
M06 Academic Period & Structure
```

## Digunakan oleh

- M02 Identity & Access;
- M10 Scheduling;
- M11 Learning;
- M12 Attendance;
- M13 Assessment;
- M14 CBT;
- M18 Monitoring;
- M19 Reporting.

---

# 14. M09 — Academic Calendar

**Klasifikasi:** Core Academic  
**Status Produk:** CORE / WAJIB

## Tanggung Jawab

Mengelola kalender akademik dan pengecualian waktu sekolah.

## Domain yang Dimiliki

- Academic Calendar;
- calendar event;
- school day classification;
- holiday;
- academic event;
- schedule exception context.

## Capability Utama

- hari efektif;
- hari libur;
- periode ujian;
- kegiatan sekolah;
- pengecualian kegiatan;
- kalender per periode.

## Invariant

```text
Academic Calendar
≠
Master Schedule
```

## Dependensi

```text
M06 Academic Period & Structure
```

---

# 15. M10 — Scheduling & Class Session

**Klasifikasi:** Core Academic  
**Status Produk:** CORE / WAJIB

## Tanggung Jawab

Mengelola rencana jadwal dan kejadian kelas aktual.

## Domain yang Dimiliki

- time slot;
- Master Schedule;
- schedule version;
- schedule publication;
- Actual Class Session;
- session lifecycle;
- schedule conflict result.

## Invariant

```text
Academic Calendar
≠
Master Schedule
≠
Actual Class Session
```

## Capability Utama

- slot waktu;
- jadwal pelajaran;
- validasi konflik;
- publikasi jadwal;
- versioning;
- class session;
- perubahan operasional aktual;
- guru pengganti;
- perubahan ruang/waktu aktual jika diperlukan.

## Dependensi

```text
M06 Academic Period & Structure
M08 Teacher & Teaching Assignment
M09 Academic Calendar
```

## Digunakan oleh

- M11 Learning;
- M12 Attendance;
- M18 Monitoring;
- M19 Reporting.

---

# 16. M11 — Learning

**Klasifikasi:** Operational  
**Status Produk:** CORE ACADEMIC EXPERIENCE

## Tanggung Jawab

Mengelola aktivitas pembelajaran digital.

## Domain yang Dimiliki

- Learning Context;
- Material;
- Material Publication;
- Assignment Definition;
- Assignment Publication;
- Submission;
- feedback pembelajaran.

## Invariant

```text
Material
≠
Material Publication

Assignment Definition
≠
Assignment Publication
≠
Submission
```

## Capability Utama

- kelas pembelajaran;
- materi;
- publikasi materi;
- tugas;
- deadline;
- submission;
- feedback;
- reuse konten;
- cross-class publication.

## Dependensi

```text
M06 Academic Period & Structure
M07 Student Academic Lifecycle
M08 Teacher & Teaching Assignment
M10 Scheduling & Class Session (opsional untuk konteks sesi)
M04 File & Document
```

---

# 17. M12 — Attendance

**Klasifikasi:** Operational  
**Status Produk:** CORE ACADEMIC EXPERIENCE

## Tanggung Jawab

Mengelola presensi sekolah dan presensi sesi kelas.

## Domain yang Dimiliki

- School Attendance;
- Class Session Attendance;
- attendance status;
- attendance correction;
- attendance finalization.

## Invariant

```text
School Attendance
≠
Class Session Attendance
```

## Capability Utama

- presensi sekolah;
- presensi kelas;
- correction;
- locking/finalization;
- rekap;
- attendance history;
- input melalui metode tambahan.

## Dependensi

```text
M07 Student Academic Lifecycle
M08 Teacher & Teaching Assignment
M10 Scheduling & Class Session
M05 Audit & Traceability
```

## Extension Point

Metode:

- QR;
- RFID;
- biometric;
- device integration;

merupakan **input method**, bukan domain attendance baru.

---

# 18. M13 — Assessment & Gradebook

**Klasifikasi:** Operational  
**Status Produk:** CORE ACADEMIC EXPERIENCE

## Tanggung Jawab

Mengelola assessment dan nilai siswa.

## Domain yang Dimiliki

- Assessment Definition;
- assessment component;
- Grade;
- Grade Publication;
- Grade Finalization;
- formula/rule penilaian.

## Invariant

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

## Capability Utama

- assessment;
- input nilai;
- kategori penilaian;
- draft;
- publish;
- finalization;
- correction;
- aggregation;
- grade history.

## Dependensi

```text
M06 Academic Period & Structure
M07 Student Academic Lifecycle
M08 Teacher & Teaching Assignment
M11 Learning
M05 Audit & Traceability
```

## Digunakan oleh

- M14 CBT;
- M15 Guardian & Family;
- M18 Student Monitoring;
- M19 Reporting & Analytics.

---

# 19. M14 — CBT

**Klasifikasi:** Operational  
**Status Produk:** MODUL AKADEMIK LANJUTAN

## Tanggung Jawab

Mengelola asesmen berbasis komputer dengan integritas attempt.

## Domain yang Dimiliki

- Question Bank;
- Question Version;
- Exam Definition;
- Exam Blueprint;
- Exam Snapshot;
- Exam Manifest;
- Exam Attempt;
- Answer;
- Integrity Event.

## Invariant

```text
Question Bank
≠
Question Version
≠
Exam Definition
≠
Exam Snapshot
≠
Exam Attempt
```

## Capability Utama

- bank soal;
- versioning soal;
- blueprint;
- publikasi ujian;
- snapshot stabil;
- timer server-authoritative;
- autosave;
- resume;
- one active attempt;
- integrity events;
- scoring;
- result transfer.

## Dependensi

```text
M06 Academic Period & Structure
M07 Student Academic Lifecycle
M08 Teacher & Teaching Assignment
M13 Assessment & Gradebook
M05 Audit & Traceability
```

## Aturan Integrasi Nilai

CBT tidak memiliki gradebook terpisah.

Jika hasil CBT menjadi nilai resmi:

```text
CBT Result
    ↓
M13 Assessment & Gradebook
```

---

# 20. M15 — Guardian & Family

**Klasifikasi:** Operational  
**Status Produk:** CORE RELATIONSHIP

## Tanggung Jawab

Mengelola hubungan orang tua/wali dengan siswa dan akses berbasis hubungan tersebut.

## Domain yang Dimiliki

- Guardian Identity;
- Guardian–Student Relationship;
- relationship type;
- verification status;
- relationship lifecycle.

## Capability Utama

- data wali;
- relasi wali-siswa;
- verifikasi;
- multi-child;
- multi-guardian;
- guardian context;
- pengajuan informasi atau koreksi terbatas.

## Dependensi

```text
M07 Student Academic Lifecycle
M02 Identity & Access
```

## Menggunakan Data

Guardian dapat mengonsumsi informasi yang diizinkan dari:

- M10 Scheduling;
- M11 Learning;
- M12 Attendance;
- M13 Assessment;
- M16 Communication.

Tetapi M15 tidak mengambil ownership atas data tersebut.

---

# 21. M16 — Communication

**Klasifikasi:** Operational  
**Status Produk:** CORE EXPERIENCE

## Tanggung Jawab

Mengelola komunikasi dan pengumuman resmi.

## Domain yang Dimiliki

- Announcement;
- Audience;
- publication status;
- contextual communication;
- communication history yang relevan.

## Capability Utama

- pengumuman sekolah;
- pengumuman kelas;
- audience targeting;
- draft;
- publish;
- archive;
- komunikasi kontekstual.

## Dependensi

```text
M01 School & Organization
M06 Academic Period & Structure
M07 Student Academic Lifecycle
M08 Teacher & Teaching Assignment
M15 Guardian & Family
```

---

# 22. M17 — Notification

**Klasifikasi:** Operational / Platform Support  
**Status Produk:** CORE EXPERIENCE

## Tanggung Jawab

Mengirim dan menyimpan pemberitahuan berdasarkan event.

## Domain yang Dimiliki

- Notification;
- notification recipient;
- read/unread state;
- delivery state;
- delivery preference.

## Invariant

```text
Notification
≠
Announcement
≠
Domain Source
```

## Capability Utama

- in-app notification;
- unread count;
- notification preference;
- delivery orchestration;
- external delivery adapters jika tersedia.

## Dependensi

M17 dapat menerima event dari banyak modul, tetapi tidak boleh menjadi owner domain event sumber.

Contoh:

```text
M11 Assignment Published
        ↓
M17 Notification
```

Jika Notification gagal, Assignment tetap sah.

---

# 23. M18 — Student Monitoring

**Klasifikasi:** Operational  
**Status Produk:** CORE MANAGEMENT EXPERIENCE

## Tanggung Jawab

Menyediakan monitoring lintas domain terhadap kondisi siswa.

## Domain yang Dimiliki

- Student Indicator;
- Monitoring Note;
- Follow-Up;
- attention status;
- monitoring workflow.

## Capability Utama

- ringkasan siswa;
- indikator presensi;
- indikator tugas;
- indikator nilai;
- attention center;
- follow-up;
- catatan wali kelas atau pihak berwenang.

## Dependensi

```text
M07 Student Academic Lifecycle
M08 Teacher & Teaching Assignment
M11 Learning
M12 Attendance
M13 Assessment & Gradebook
```

## Aturan

M18 tidak boleh membuat salinan sumber kebenaran dari modul lain.

Contoh:

```text
M12 Attendance
        ↓
menghasilkan data sumber

M18 Monitoring
        ↓
menghasilkan indikator
```

Indicator dapat dihitung ulang.

---

# 24. M19 — Reporting & Analytics

**Klasifikasi:** Operational / Read Model  
**Status Produk:** CORE MANAGEMENT EXPERIENCE

## Tanggung Jawab

Menyediakan laporan, ringkasan, statistik, dan read model lintas domain.

## Domain yang Dimiliki

M19 tidak mengambil ownership atas transaksi utama.

M19 dapat memiliki:

- report definition;
- metric definition;
- generated report metadata;
- analytics projection;
- read model;
- export job metadata.

## Capability Utama

- laporan akademik;
- laporan presensi;
- laporan assessment;
- dashboard pimpinan;
- dashboard operasional;
- export;
- trend;
- agregasi.

## Dependensi

Mengonsumsi data dari banyak modul berdasarkan authorization.

## Aturan

```text
Report
≠
Source of Truth
```

Jika report berbeda dengan data sumber, data sumber yang sah harus menjadi rujukan utama.

---

# 25. M20 — Integration

**Klasifikasi:** Extension / Platform  
**Status Produk:** OPTIONAL FOUNDATION

## Tanggung Jawab

Mengelola pertukaran data dengan sistem eksternal.

## Domain yang Dimiliki

- Integration Definition;
- Integration Mapping;
- Sync Job;
- Integration Event;
- Delivery Attempt;
- external reference.

## Capability Utama

- import/export integration;
- API integration;
- synchronization;
- retry;
- error tracking;
- mapping;
- status integrasi.

## Dependensi

Bergantung pada modul domain yang datanya dipertukarkan.

## Aturan

M20 tidak boleh menjadi sumber kebenaran ambigu.

Setiap integrasi harus menentukan:

```text
Siapa pemilik data?
Siapa source of truth?
Arah sinkronisasi?
Bagaimana conflict ditangani?
```

---

# 26. M21 — AI Assistance

**Klasifikasi:** Extension  
**Status Produk:** OPTIONAL

## Tanggung Jawab

Memberikan capability AI sebagai bantuan pengguna.

## Capability yang Dapat Dikembangkan

- bantuan penyusunan materi;
- generator soal;
- ringkasan laporan;
- insight akademik;
- teaching assistant;
- bantuan analisis;
- summarization.

## Aturan

M21 tidak menjadi owner atas:

- nilai;
- keputusan disipliner;
- presensi;
- enrollment;
- assignment;
- data resmi lainnya.

## Dependensi

M21 hanya boleh mengakses modul lain melalui effective access pengguna.

```text
User
   ↓
Authorization
   ↓
Allowed Domain Data
   ↓
AI Assistance
```

---

# 27. Ownership Domain

Tabel berikut menetapkan owner utama domain.

| Domain Concept | Owner Module |
|---|---|
| School | M01 School & Organization |
| Organization Unit | M01 |
| Position | M01 |
| Position Assignment | M01 |
| User Account | M02 Identity & Access |
| Role / Permission | M02 |
| Configuration | M03 Platform Configuration |
| File | M04 File & Document |
| Audit Log | M05 Audit & Traceability |
| Academic Year | M06 Academic Period & Structure |
| Semester | M06 |
| Grade Level | M06 |
| Phase | M06 |
| Program | M06 |
| Rombel | M06 |
| Student Identity | M07 Student Academic Lifecycle |
| Student Enrollment | M07 |
| Rombel Placement | M07 |
| Teacher Profile | M08 Teacher & Teaching Assignment |
| Subject | M08 |
| Teaching Assignment | M08 |
| Homeroom Assignment | M08 |
| Academic Calendar | M09 Academic Calendar |
| Master Schedule | M10 Scheduling & Class Session |
| Actual Class Session | M10 |
| Material | M11 Learning |
| Material Publication | M11 |
| Assignment Definition | M11 |
| Assignment Publication | M11 |
| Submission | M11 |
| School Attendance | M12 Attendance |
| Class Session Attendance | M12 |
| Assessment Definition | M13 Assessment & Gradebook |
| Grade | M13 |
| Grade Publication | M13 |
| Question Bank | M14 CBT |
| Exam Snapshot | M14 |
| Exam Attempt | M14 |
| Guardian Identity | M15 Guardian & Family |
| Guardian–Student Relationship | M15 |
| Announcement | M16 Communication |
| Audience | M16 |
| Notification | M17 Notification |
| Student Indicator | M18 Student Monitoring |
| Monitoring Note | M18 |
| Follow-Up | M18 |
| Report / Metric Definition | M19 Reporting & Analytics |
| Integration Definition | M20 Integration |
| AI Assistance Context | M21 AI Assistance |

---

# 28. Dependency Layer

Dependensi modul secara konseptual:

```text
LAYER 0 — FOUNDATION
M01 School & Organization
M02 Identity & Access
M03 Platform Configuration
M04 File & Document
M05 Audit & Traceability

                ↓

LAYER 1 — ACADEMIC FOUNDATION
M06 Academic Period & Structure
M07 Student Academic Lifecycle
M08 Teacher & Teaching Assignment
M09 Academic Calendar

                ↓

LAYER 2 — ACADEMIC OPERATION
M10 Scheduling & Class Session
M11 Learning
M12 Attendance
M13 Assessment & Gradebook

                ↓

LAYER 3 — ADVANCED OPERATION
M14 CBT
M15 Guardian & Family
M16 Communication
M17 Notification
M18 Student Monitoring

                ↓

LAYER 4 — READ / EXTENSION
M19 Reporting & Analytics
M20 Integration
M21 AI Assistance
```

Layer tidak otomatis berarti urutan deployment.

---

# 29. Dependensi Utama Antarmodul

```text
M01 School
 ├──→ M06 Academic Structure
 ├──→ M02 Identity & Access
 └──→ seluruh school-aware modules

M06 Academic Structure
 ├──→ M07 Student Lifecycle
 ├──→ M08 Teaching Assignment
 ├──→ M09 Calendar
 └──→ M10 Scheduling

M07 Student Lifecycle
 ├──→ M11 Learning
 ├──→ M12 Attendance
 ├──→ M13 Assessment
 ├──→ M14 CBT
 ├──→ M15 Guardian
 └──→ M18 Monitoring

M08 Teaching Assignment
 ├──→ M10 Scheduling
 ├──→ M11 Learning
 ├──→ M12 Attendance
 ├──→ M13 Assessment
 ├──→ M14 CBT
 └──→ M18 Monitoring

M10 Scheduling
 └──→ M12 Attendance

M11 Learning
 └──→ M13 Assessment

M13 Assessment
 ├──← M14 CBT Results
 ├──→ M18 Monitoring
 └──→ M19 Reporting

Domain Events
 └──→ M17 Notification

Seluruh Domain Modules
 ├──→ M05 Audit
 ├──→ M19 Reporting
 ├──→ M20 Integration
 └──→ M21 AI Assistance
```

---

# 30. Aturan Dependensi

## MOD-RULE-001

Modul tidak boleh menulis langsung ke data yang dimiliki modul lain tanpa kontrak yang sah.

## MOD-RULE-002

Read access lintas modul tidak otomatis memberikan write ownership.

## MOD-RULE-003

Reporting tidak boleh mengubah transaksi sumber.

## MOD-RULE-004

Notification tidak boleh menjadi syarat keberhasilan transaksi domain kecuali requirement secara eksplisit menyatakan demikian.

## MOD-RULE-005

AI Assistance tidak boleh menjadi sumber kebenaran domain.

## MOD-RULE-006

Integration tidak boleh melewati validation dan authorization domain.

## MOD-RULE-007

Audit dapat menerima event dari seluruh modul, tetapi tidak mengambil alih business logic modul sumber.

## MOD-RULE-008

File module mengelola file, tetapi resource owner menentukan hak akses business-level.

## MOD-RULE-009

Identity & Access menghitung effective access menggunakan hubungan domain, tetapi tidak memiliki Teaching Assignment, Homeroom Assignment, Position Assignment, atau Guardian Relationship.

## MOD-RULE-010

Circular dependency antar core module harus dianggap design smell dan harus diselesaikan sebelum implementasi.

---

# 31. Core Minimum Product

Untuk Ruang Pintar dapat memiliki fondasi operasional yang valid, minimum core adalah:

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
```

Modul tersebut membentuk fondasi sebelum capability pembelajaran penuh digunakan.

---

# 32. Academic Experience Set

Capability akademik utama dibentuk oleh:

```text
M11 Learning
M12 Attendance
M13 Assessment & Gradebook
```

Ketiganya menggunakan foundation akademik yang sama.

CBT bukan sistem akademik paralel.

```text
M14 CBT
    ↓
menggunakan Academic Context
    ↓
hasil resmi menuju M13 Gradebook
```

---

# 33. User Experience Bukan Module Ownership

Dashboard per pengguna tidak dibuat sebagai domain module terpisah.

Contoh:

```text
Dashboard Guru
```

dapat menyajikan:

- M10 Jadwal;
- M11 Materi dan Tugas;
- M12 Presensi;
- M13 Nilai;
- M16 Pengumuman;
- M17 Notifikasi.

Tetapi dashboard tidak mengambil ownership atas data tersebut.

Hal serupa berlaku untuk:

- Dashboard Siswa;
- Dashboard Wali Kelas;
- Dashboard Orang Tua;
- Dashboard Pimpinan;
- Dashboard Operator.

---

# 34. Role Bukan Modul

Role seperti:

- Administrator;
- Guru;
- Siswa;
- Orang Tua;
- Kepala Sekolah;
- Wali Kelas;

bukan modul.

Role adalah actor yang memperoleh effective access terhadap capability dari berbagai modul.

Detail role dan permission akan dibahas pada:

```text
04-ROLE-ACCESS.md
```

---

# 35. Modul yang Sengaja Belum Masuk Core

Capability berikut belum menjadi modul resmi pada versi Module Map ini:

- SPMB;
- Keuangan;
- Pembayaran;
- Payroll;
- Perpustakaan;
- Inventaris;
- Sarana Prasarana;
- BKK;
- Tracer Study;
- Alumni;
- E-Office;
- Helpdesk;
- Website Publik;
- Klinik;
- Kantin;
- Asrama;
- Transportasi.

Capability tersebut dapat ditambahkan sebagai **Extension Module** setelah requirement dan domain-nya didefinisikan.

---

# 36. Pola Penambahan Extension Module

Extension baru harus melalui urutan:

```text
Kebutuhan Produk
        ↓
Product Requirement Baru
        ↓
Domain Analysis
        ↓
Domain Ownership
        ↓
Module Boundary
        ↓
Access Model
        ↓
Architecture
        ↓
Data Model
        ↓
Roadmap
        ↓
Implementation
```

Modul baru tidak boleh dibuat hanya karena terdapat permintaan:

> "Tambahkan menu X."

---

# 37. Contoh Extension di Masa Depan

Contoh:

```text
M30 — Library
```

tidak cukup hanya memiliki:

```text
Menu Buku
Menu Peminjaman
```

Sebelum menjadi modul resmi harus didefinisikan:

```text
Book
Book Copy
Member Eligibility
Loan
Return
Fine
Inventory Status
```

Dengan demikian pola modular Ruang Pintar tetap konsisten.

---

# 38. Boundary antara Modul dan Infrastruktur

Hal berikut bukan module domain:

- Database;
- Cache;
- Queue;
- Web Server;
- Object Storage;
- Email Provider;
- SMS Provider;
- CDN;
- Search Engine.

Semua itu merupakan infrastructure concern dan dibahas pada System Architecture.

---

# 39. Boundary antara Modul dan UI

Module Map tidak menentukan:

- sidebar;
- menu;
- tab;
- dashboard layout;
- modal;
- route;
- URL;
- mobile navigation.

UI dapat menyusun capability lintas modul sesuai kebutuhan pengguna, selama ownership domain tidak dilanggar.

---

# 40. Traceability

Setiap modul harus dapat ditelusuri:

```text
Project Brief
        ↓
Product Requirement
        ↓
Domain Concept
        ↓
Module Owner
        ↓
Access Rule
        ↓
Architecture
        ↓
Data Model
        ↓
Implementation
        ↓
Test
```

Contoh:

```text
PR-ATTENDANCE-002
        ↓
DM-ATTENDANCE-002
        ↓
M12 Attendance
        ↓
Teacher Session Scope
        ↓
Implementation
        ↓
Test
```

---

# 41. Anti-Pattern yang Dilarang

## 41.1 God Module

Contoh:

```text
M-Academic
```

yang mengelola:

- siswa;
- guru;
- jadwal;
- presensi;
- tugas;
- nilai;
- ujian;
- komunikasi;
- reporting;

tanpa boundary internal yang jelas.

## 41.2 Shared Database sebagai Alasan Cross-Write

Walaupun implementasi menggunakan database yang sama, satu modul tidak otomatis boleh memodifikasi data milik modul lain.

## 41.3 Dashboard sebagai Owner Data

Dashboard adalah composition layer, bukan domain owner.

## 41.4 Notification sebagai Workflow Engine

Notification tidak boleh mengendalikan state utama domain.

## 41.5 Reporting sebagai Database Bayangan

Reporting boleh memiliki projection/read model tetapi tidak boleh menjadi sumber transaksi utama.

## 41.6 Role Module

Role bukan domain capability.

## 41.7 Menu-Driven Architecture

Struktur modul tidak boleh ditentukan dari sidebar.

---

# 42. Ringkasan Modul

| ID | Modul | Klasifikasi | Status |
|---|---|---|---|
| M01 | School & Organization | Foundation | Core |
| M02 | Identity & Access | Foundation | Core |
| M03 | Platform Configuration | Foundation | Core |
| M04 | File & Document | Foundation | Core |
| M05 | Audit & Traceability | Foundation | Core |
| M06 | Academic Period & Structure | Core Academic | Core |
| M07 | Student Academic Lifecycle | Core Academic | Core |
| M08 | Teacher & Teaching Assignment | Core Academic | Core |
| M09 | Academic Calendar | Core Academic | Core |
| M10 | Scheduling & Class Session | Core Academic | Core |
| M11 | Learning | Operational | Core Academic Experience |
| M12 | Attendance | Operational | Core Academic Experience |
| M13 | Assessment & Gradebook | Operational | Core Academic Experience |
| M14 | CBT | Operational | Advanced Academic |
| M15 | Guardian & Family | Operational | Core Relationship |
| M16 | Communication | Operational | Core Experience |
| M17 | Notification | Platform Support | Core Experience |
| M18 | Student Monitoring | Operational | Core Management Experience |
| M19 | Reporting & Analytics | Read / Operational | Core Management Experience |
| M20 | Integration | Extension / Platform | Optional |
| M21 | AI Assistance | Extension | Optional |

---

# 43. Keputusan Penting yang Dikunci oleh Module Map

Jika dokumen ini disetujui, keputusan berikut menjadi baseline:

1. Ruang Pintar dibangun dengan boundary modul yang eksplisit.
2. Domain concept memiliki owner module.
3. Identity & Access bukan pemilik assignment domain.
4. Academic Structure dipisahkan dari Student Lifecycle.
5. Student Lifecycle dipisahkan dari Teaching Assignment.
6. Academic Calendar dipisahkan dari Scheduling.
7. Master Schedule dipisahkan dari Actual Class Session.
8. Learning dipisahkan dari Assessment.
9. CBT tidak memiliki gradebook sendiri.
10. Guardian relationship menjadi modul domain tersendiri.
11. Notification dipisahkan dari Communication.
12. Monitoring menggunakan data domain lain tanpa mengambil ownership.
13. Reporting adalah read/aggregation concern.
14. Integration dan AI adalah extension, bukan sumber kebenaran inti.
15. Dashboard dan role tidak dianggap modul domain.

---

# 44. Hal yang Belum Dikunci

Module Map ini belum menentukan:

- framework;
- struktur folder;
- package system;
- namespace;
- service layer;
- event bus;
- REST atau GraphQL;
- database;
- schema;
- table ownership teknis;
- deployment;
- microservice;
- modular monolith;
- queue;
- cache;
- UI navigation;
- permission matrix final.

Semua keputusan tersebut dibahas pada dokumen berikutnya.

---

# 45. Definition of Done Module Map

Module Map dianggap selesai jika:

- seluruh domain utama memiliki owner;
- boundary modul jelas;
- dependensi utama terdokumentasi;
- circular dependency konseptual dapat dihindari;
- extension boundary tersedia;
- role tidak diperlakukan sebagai modul;
- dashboard tidak diperlakukan sebagai modul;
- reporting tidak menjadi source of truth;
- integration tidak mengambil alih domain;
- AI tidak mengambil alih domain;
- tidak ada keputusan teknologi yang terlalu dini.

---

# 46. Checklist Human Review

Sebelum dokumen ini berstatus `APPROVED / LOCKED`, pastikan:

- [ ] jumlah dan pembagian modul masuk akal;
- [ ] M01–M10 benar-benar layak menjadi foundation/core;
- [ ] Student Academic Lifecycle terpisah dari Academic Structure;
- [ ] Teacher & Teaching Assignment memiliki ownership yang tepat;
- [ ] Homeroom Assignment berada pada modul yang tepat;
- [ ] Academic Calendar dan Scheduling tidak dicampur;
- [ ] Learning, Attendance, Assessment, dan CBT terpisah dengan jelas;
- [ ] CBT menggunakan Gradebook, bukan membuat gradebook paralel;
- [ ] Guardian memiliki boundary sendiri;
- [ ] Communication dan Notification dipisahkan;
- [ ] Monitoring hanya mengagregasi/menindaklanjuti data sumber;
- [ ] Reporting tidak menjadi owner transaksi;
- [ ] Integration dan AI benar sebagai extension;
- [ ] capability di luar core belum dimasukkan secara diam-diam;
- [ ] tidak terdapat modul yang dibentuk hanya karena kebutuhan menu UI.

---

# 47. Status Dokumen

**Status Saat Ini:** FINAL REVIEW  
**Versi:** 1.0-RC

Dokumen belum berstatus `APPROVED / LOCKED` sampai human review selesai.

Jika disetujui:

```text
Version: 1.0
Status: APPROVED / LOCKED
```

---

# 48. Dokumen Berikutnya

Setelah `03-MODULE-MAP.md` disetujui dan dikunci, pembahasan dilanjutkan ke:

```text
04-ROLE-ACCESS.md
```

Dokumen tersebut menjawab:

> **Siapa pengguna Ruang Pintar, kewenangan apa yang dimiliki setiap actor, dari mana kewenangan tersebut berasal, dan sampai batas resource mana akses tersebut berlaku?**

Role & Access tidak boleh mengubah ownership domain atau module boundary yang telah dikunci tanpa proses perubahan resmi.
