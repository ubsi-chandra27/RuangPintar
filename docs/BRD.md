# BRD — BUSINESS REQUIREMENTS DOCUMENT
## Ruang Pintar

**Versi:** 1.0  
**Status:** BASELINE RESMI  
**Bahasa Utama:** Bahasa Indonesia  
**Produk:** Ruang Pintar  
**Kategori Produk:** School Digital Operating Platform  

---

# 1. Tujuan Dokumen

Dokumen ini menjelaskan **mengapa Ruang Pintar dibangun dari sudut pandang bisnis dan operasional sekolah**.

BRD tidak mendefinisikan detail implementasi teknis. Detail teknis mengacu pada dokumen arsitektur, data, UI, roadmap, dan AI coding rules.

---

# 2. Ringkasan Eksekutif

Ruang Pintar adalah:

> **School Digital Operating Platform modular yang menyatukan proses akademik, pembelajaran, administrasi, komunikasi, monitoring, dan layanan sekolah dalam satu ekosistem digital terintegrasi.**

Kalimat sederhana:

> **Satu platform untuk menjalankan aktivitas digital sekolah.**

Ruang Pintar dirancang agar dapat digunakan pada konteks sekolah SD, SMP, SMA, dan SMK tanpa mengunci domain hanya pada satu jenjang.

---

# 3. Latar Belakang Bisnis

Operasional sekolah umumnya tersebar pada banyak proses dan aplikasi terpisah, misalnya:

- data siswa;
- data guru;
- pembagian kelas;
- jadwal;
- presensi;
- administrasi pembelajaran;
- tugas;
- penilaian;
- CBT;
- komunikasi;
- monitoring siswa;
- laporan;
- hubungan wali siswa.

Fragmentasi tersebut dapat menimbulkan:

- data ganda;
- histori yang sulit ditelusuri;
- kewenangan yang tidak jelas;
- proses manual berulang;
- dashboard yang tidak sesuai kebutuhan tiap peran;
- sulitnya audit perubahan;
- ketergantungan pada spreadsheet terpisah;
- informasi siswa yang tidak konsisten antarbagian.

Ruang Pintar dibangun untuk menyediakan struktur sistem yang terintegrasi namun tetap modular.

---

# 4. Sasaran Bisnis

## BR-BIZ-001 — Integrasi Operasional Sekolah

Sekolah memiliki satu platform terintegrasi untuk aktivitas akademik dan operasional digital.

## BR-BIZ-002 — Kejelasan Kewenangan

Setiap pengguna memperoleh akses berdasarkan:

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

## BR-BIZ-003 — Sumber Data yang Konsisten

Setiap domain memiliki source of truth yang jelas dan tidak diduplikasi secara sembarangan.

## BR-BIZ-004 — Dukungan Operasional Guru

Guru harus dapat menggunakan Ruang Pintar untuk aktivitas nyata, termasuk:

- melihat kelas;
- melihat jadwal;
- membuka sesi pembelajaran;
- mengelola lingkup materi;
- mengelola tujuan pembelajaran;
- mengisi administrasi pembelajaran;
- melakukan presensi;
- membuat assessment;
- mengisi nilai;
- melanjutkan pembelajaran dari TP ke TP berikutnya.

## BR-BIZ-005 — Monitoring Siswa

Sekolah dapat memonitor perkembangan siswa berdasarkan data yang sah dari domain terkait.

## BR-BIZ-006 — Transparansi untuk Siswa dan Guardian

Siswa dan guardian memperoleh akses sesuai scope terhadap data yang memang telah dipublikasikan.

## BR-BIZ-007 — Auditability

Perubahan penting dapat ditelusuri secara layak melalui audit trail.

## BR-BIZ-008 — Modularitas

Sekolah dapat menggunakan core Ruang Pintar tanpa mewajibkan seluruh extension.

---

# 5. Stakeholder Utama

## 5.1 Pihak Internal

- Super Admin;
- Staff Sekolah;
- Kepala Sekolah;
- Wakasek Kurikulum;
- Wakasek Kesiswaan;
- Kepala Program;
- Guru;
- Wali Kelas;
- Siswa.

## 5.2 Pihak Eksternal Terverifikasi

- Guardian / Wali Siswa.

---

# 6. Base Role

Base role resmi:

```text
SUPER_ADMIN
SCHOOL_STAFF
TEACHER
STUDENT
GUARDIAN
```

Base role tidak otomatis berarti full access.

---

# 7. Position dan Assignment

Position penting:

```text
HEADMASTER
VICE_PRINCIPAL_CURRICULUM
VICE_PRINCIPAL_STUDENT_AFFAIRS
PROGRAM_HEAD
```

Assignment penting:

```text
TEACHING_ASSIGNMENT
HOMEROOM_ASSIGNMENT
POSITION_ASSIGNMENT
```

Guardian menggunakan verified relationship, bukan teaching/position assignment.

---

# 8. Staff Capability Bundle

Staff sekolah dapat memiliki capability bundle:

```text
SYSTEM_ADMIN
ACADEMIC_OPERATOR
STUDENT_DATA_OPERATOR
REPORT_OPERATOR
```

Capability bundle bukan base role baru.

---

# 9. Business Capability Utama

## Foundation

- School & Organization
- Identity & Access
- Platform Configuration
- File & Document
- Audit & Traceability

## Academic Foundation

- Academic Period & Structure
- Student Academic Lifecycle
- Teacher & Teaching Assignment
- Academic Calendar
- Scheduling & Class Session

## Academic Operation

- Learning
- Attendance
- Assessment & Gradebook
- CBT

## Advanced Operation

- Guardian & Family
- Communication
- Notification
- Student Monitoring
- Reporting & Analytics

## Extension

- Integration
- AI Assistance

---

# 10. Business Rule Utama

## BR-RULE-001

Student Identity, Student Enrollment, dan Rombel Placement adalah konsep berbeda.

## BR-RULE-002

Teacher, Subject, dan Teaching Assignment adalah konsep berbeda.

## BR-RULE-003

Academic Calendar, Master Schedule, dan Actual Class Session adalah konsep berbeda.

## BR-RULE-004

School Attendance dan Class Session Attendance tidak boleh digabung.

## BR-RULE-005

Material dan Material Publication adalah konsep berbeda.

## BR-RULE-006

Assessment, Grade, dan Grade Publication adalah konsep berbeda.

## BR-RULE-007

Nilai kosong tidak sama dengan nilai nol.

## BR-RULE-008

Announcement tidak sama dengan Notification.

## BR-RULE-009

Guardian tidak bertindak sebagai Student.

## BR-RULE-010

Pimpinan tidak otomatis memiliki full write access.

## BR-RULE-011

Teacher authority berasal dari Teaching Assignment aktif.

## BR-RULE-012

Historical data tidak boleh hilang hanya karena periode baru dimulai.

---

# 11. Deployment Baseline

Baseline resmi:

```text
Satu deployment
=
Satu sekolah
=
Satu database SQLite
```

Model SaaS/shared multi-school bukan baseline saat ini.

Jika kelak dibutuhkan, perubahan tersebut memerlukan architecture review.

---

# 12. Business Non-Goals / Extension di Luar Core

Berikut bukan core mandatory pada baseline awal:

- SPMB;
- finance/SPP/payroll;
- library;
- inventory/sarpras;
- BKK;
- tracer;
- alumni;
- e-office;
- helpdesk;
- public website;
- transport;
- canteen;
- clinic;
- dormitory;
- payment gateway;
- biometric integration;
- specific government integration.

Fitur tersebut dapat menjadi extension bila ada kebutuhan resmi.

---

# 13. AI dalam Konteks Bisnis

AI adalah optional assistance.

AI tidak boleh menjadi:

- source of truth;
- pengganti authorization;
- penentu nilai resmi;
- penentu akses;
- penentu keputusan berisiko tinggi tanpa human workflow.

---

# 14. Kriteria Keberhasilan Bisnis

Ruang Pintar dianggap berhasil jika:

1. pengguna dapat masuk sesuai identity;
2. akses sesuai role, assignment, relationship, dan scope;
3. struktur akademik dapat dikelola;
4. guru dapat menjalankan Teacher Academic MVP;
5. siswa hanya melihat data yang sah untuk dirinya;
6. guardian hanya melihat anak yang memiliki relationship valid;
7. pimpinan dapat memonitor tanpa mengambil alih ownership domain;
8. histori dan audit tetap terjaga;
9. core tetap dapat berjalan tanpa API eksternal;
10. UI sesuai Academic Glass UI dan kebutuhan tiap role.

---

# 15. Teacher Academic MVP sebagai Business Milestone

Salah satu milestone bisnis terpenting:

```text
Guru Login
↓
Dashboard Guru
↓
Kelas Saya
↓
Lingkup Materi / BAB
↓
Tujuan Pembelajaran
↓
Pertemuan
↓
Administrasi Pembelajaran
↓
Presensi
↓
Assessment TP
↓
Gradebook
```

Milestone ini harus dapat diuji langsung oleh pengguna manusia.

---

# 16. Hubungan dengan Dokumen Lain

BRD menjawab:

> Mengapa sistem dibangun?

Dokumen lanjutan:

```text
PRD.md
→ produk apa yang harus dibangun

FRD.md
→ sistem harus dapat melakukan apa

02-DOMAIN-MODEL.md
→ bagaimana konsep domain dipisahkan

03-MODULE-MAP.md
→ siapa pemilik capability/data

04-ROLE-ACCESS.md
→ siapa boleh melakukan apa

05-SYSTEM-ARCHITECTURE.md
→ bagaimana sistem disusun

06-DATA-ARCHITECTURE.md
→ bagaimana data dikelola

07-UI-UX-DESIGN-SYSTEM.md
→ bagaimana experience/visual diwujudkan

08-IMPLEMENTATION-ROADMAP.md
→ kapan capability dibangun

09-AI-CODING-RULES.md
→ bagaimana AI harus mengimplementasikan
```

---

# 17. Prinsip Final

> Ruang Pintar bukan sekadar kumpulan menu administrasi sekolah. Ruang Pintar harus menjadi sistem operasi digital sekolah yang terstruktur, modular, dapat diaudit, dan dapat digunakan secara nyata oleh setiap role sesuai kewenangannya.
