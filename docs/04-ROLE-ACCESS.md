# 04 — ROLE & ACCESS
## Ruang Pintar

**Nama Dokumen:** Role & Access  
**Nama Produk:** Ruang Pintar  
**Versi Dokumen:** 1.0-RC  
**Status:** FINAL REVIEW  
**Dokumen Induk:**  
- `00-PROJECT-BRIEF.md`
- `01-PRODUCT-REQUIREMENTS.md`
- `02-DOMAIN-MODEL.md`
- `03-MODULE-MAP.md`

**Jenis Dokumen:** Model Peran, Kewenangan, dan Resource Scope  
**Bahasa Utama:** Bahasa Indonesia

---

# 1. Tujuan Dokumen

Dokumen ini mendefinisikan model akses Ruang Pintar.

Dokumen ini menjawab:

> **Siapa pengguna Ruang Pintar, kewenangan apa yang dimiliki, dari mana kewenangan tersebut berasal, dan sampai batas resource mana akses berlaku?**

Dokumen ini menjadi fondasi untuk:

- authorization;
- permission engine;
- middleware;
- policy;
- query scope;
- menu visibility;
- dashboard composition;
- audit;
- testing;
- access review.

---

# 2. Prinsip Utama Access Model

Ruang Pintar tidak menggunakan pola:

```text
ROLE
→ SEMUA AKSES
```

Model akses resmi adalah:

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

Effective Access adalah hasil akhir dari seluruh konteks tersebut.

---

# 3. Istilah Utama

## 3.1 Identity

Identity adalah siapa pengguna sebenarnya.

Contoh:

- akun pengguna;
- profil guru;
- profil siswa;
- profil wali;
- profil staff.

## 3.2 Base Role

Base Role adalah klasifikasi akses paling dasar.

Base Role bukan jabatan dan bukan assignment.

## 3.3 Position

Position adalah jabatan organisasi.

Contoh:

- Kepala Sekolah;
- Wakil Kepala Sekolah;
- Kepala Program.

## 3.4 Assignment

Assignment adalah tanggung jawab periodik yang memiliki scope tertentu.

Contoh:

- Teaching Assignment;
- Homeroom Assignment.

## 3.5 Relationship

Relationship adalah hubungan domain yang dapat menjadi sumber akses.

Contoh:

```text
Guardian–Student Relationship
```

## 3.6 Permission

Permission adalah kemampuan melakukan tindakan tertentu.

Contoh:

```text
academic.students.view
academic.students.manage
attendance.session.record
assessment.grades.publish
```

## 3.7 Resource Scope

Resource Scope menentukan **resource mana** yang dapat diakses.

Contoh:

- school-wide;
- organization unit;
- program;
- rombel;
- teaching assignment;
- student-self;
- guardian-linked students.

## 3.8 Effective Access

Effective Access adalah hak nyata pengguna setelah seluruh faktor dihitung.

---

# 4. Base Role Resmi

Ruang Pintar menggunakan lima Base Role.

```text
SUPER_ADMIN
SCHOOL_STAFF
TEACHER
STUDENT
GUARDIAN
```

Base Role ini sengaja sedikit.

Jabatan dan assignment tidak dibuat menjadi Base Role tambahan apabila maknanya lebih tepat sebagai position atau assignment.

---

# 5. SUPER_ADMIN

## 5.1 Definisi

SUPER_ADMIN adalah actor platform dengan kewenangan administrasi tertinggi terhadap Ruang Pintar.

SUPER_ADMIN bukan otomatis bagian struktur organisasi sekolah.

## 5.2 Tanggung Jawab

Dapat mencakup:

- pengelolaan platform;
- bootstrap sekolah;
- konfigurasi sistem tingkat tinggi;
- troubleshooting terbatas;
- lifecycle sekolah;
- fungsi platform lain yang memang membutuhkan kewenangan global.

## 5.3 Batas Penting

SUPER_ADMIN tidak boleh secara default dipakai sebagai akun operasional sehari-hari sekolah.

Akses terhadap data sekolah tetap harus mengikuti prinsip audit dan kebutuhan yang sah.

---

# 6. SCHOOL_STAFF

## 6.1 Definisi

SCHOOL_STAFF adalah base role untuk tenaga kependidikan atau pengelola operasional sekolah.

SCHOOL_STAFF **bukan akses penuh**.

Akses staff ditentukan lebih lanjut melalui capability bundle, position, permission, dan scope.

## 6.2 Capability Bundle

Capability bundle yang direkomendasikan:

```text
SYSTEM_ADMIN
ACADEMIC_OPERATOR
STUDENT_DATA_OPERATOR
REPORT_OPERATOR
```

Bundle tersebut bukan base role baru.

Bundle hanya mengelompokkan permission yang relevan.

## 6.3 Prinsip

SCHOOL_STAFF tidak boleh diasumsikan:

```text
boleh mengelola seluruh akademik
boleh mengubah seluruh nilai
boleh mengubah presensi guru
boleh membaca seluruh data sensitif
```

tanpa permission dan scope eksplisit.

---

# 7. TEACHER

## 7.1 Definisi

TEACHER adalah base role untuk pengguna dengan Teacher Profile yang sah.

## 7.2 Sumber Kewenangan Utama

Hak operasional guru terutama berasal dari:

```text
Teaching Assignment
Homeroom Assignment
Position Assignment
```

bukan hanya karena memiliki base role TEACHER.

## 7.3 Prinsip

```text
TEACHER
≠
akses seluruh kelas
```

Guru hanya memperoleh akses terhadap resource yang sesuai assignment dan permission-nya.

---

# 8. STUDENT

## 8.1 Definisi

STUDENT adalah base role untuk siswa.

## 8.2 Sumber Scope

Scope siswa berasal dari:

```text
Student Identity
+
Student Enrollment
+
Rombel Placement
+
Academic Period
```

## 8.3 Prinsip

Siswa terutama memiliki:

```text
SELF SCOPE
```

Siswa tidak boleh memperoleh akses ke data siswa lain hanya karena berada pada rombel yang sama.

---

# 9. GUARDIAN

## 9.1 Definisi

GUARDIAN adalah base role untuk orang tua atau wali.

## 9.2 Sumber Scope

Scope GUARDIAN berasal dari:

```text
Guardian–Student Relationship
```

yang sah dan aktif.

## 9.3 Prinsip

```text
GUARDIAN
≠
akses seluruh siswa
```

Guardian hanya memperoleh data anak yang memang memiliki hubungan resmi dengannya.

---

# 10. Position Resmi

Position digunakan untuk tanggung jawab organisasi.

Position inti yang direkomendasikan:

```text
HEADMASTER
VICE_PRINCIPAL_CURRICULUM
VICE_PRINCIPAL_STUDENT_AFFAIRS
PROGRAM_HEAD
```

Position dapat berkembang sesuai kebutuhan sekolah.

Position tidak otomatis menciptakan akses sebelum:

- assignment aktif;
- permission tersedia;
- resource scope dapat ditentukan.

---

# 11. HEADMASTER

## 11.1 Kategori

Position Assignment.

## 11.2 Scope Umum

Secara umum:

```text
SCHOOL-WIDE MANAGEMENT VIEW
```

## 11.3 Capability

Dapat mencakup:

- dashboard sekolah;
- laporan akademik;
- monitoring presensi;
- monitoring assessment;
- monitoring student attention;
- ringkasan aktivitas;
- approval tertentu jika requirement menetapkan.

## 11.4 Batas

HEADMASTER tidak otomatis berarti:

- system administrator;
- database administrator;
- boleh mengubah nilai guru;
- boleh mencatat presensi kelas sebagai guru;
- boleh memodifikasi seluruh data operasional.

Akses write harus eksplisit.

---

# 12. VICE_PRINCIPAL_CURRICULUM

## 12.1 Kategori

Position Assignment.

## 12.2 Scope

Umumnya:

```text
SCHOOL-WIDE ACADEMIC MANAGEMENT
```

## 12.3 Capability Utama

Dapat meliputi:

- tahun ajaran;
- semester;
- kalender akademik;
- struktur akademik;
- mata pelajaran;
- Teaching Assignment;
- beban mengajar;
- time slot;
- master schedule;
- publikasi jadwal;
- monitoring akademik.

## 12.4 Batas

Tidak otomatis boleh:

- menjadi system admin;
- mengubah nilai siswa;
- mencatat presensi atas nama guru;
- membaca catatan sensitif yang tidak relevan.

---

# 13. VICE_PRINCIPAL_STUDENT_AFFAIRS

## 13.1 Kategori

Position Assignment.

## 13.2 Scope

Umumnya:

```text
SCHOOL-WIDE STUDENT MONITORING
```

## 13.3 Capability Utama

Dapat mencakup:

- monitoring kehadiran;
- monitoring siswa;
- tindak lanjut;
- student attention;
- komunikasi tertentu;
- laporan kesiswaan.

## 13.4 Batas

Tidak otomatis boleh:

- mengubah grade;
- mengubah presensi kelas yang menjadi tanggung jawab guru;
- mengubah Teaching Assignment;
- mengelola sistem secara global.

---

# 14. PROGRAM_HEAD

## 14.1 Kategori

Position Assignment.

## 14.2 Scope

Umumnya:

```text
PROGRAM-SCOPED
```

Contoh:

```text
Program RPL
Program DKV
Program TJKT
```

## 14.3 Capability

Dapat mencakup:

- monitoring guru dalam program;
- monitoring kelas program;
- jadwal program;
- academic reporting;
- student monitoring;
- capability lain sesuai kebijakan.

---

# 15. Homeroom Assignment

## 15.1 Definisi

Wali kelas bukan Base Role permanen.

Wali kelas direpresentasikan melalui:

```text
Homeroom Assignment
```

## 15.2 Scope

```text
ROMBEL-SCOPED
```

dan periodik.

## 15.3 Capability Utama

Dapat mencakup:

- ringkasan kelas;
- daftar siswa;
- rekap kehadiran;
- monitoring tugas;
- ringkasan nilai yang memang boleh dilihat;
- Student Attention Center;
- catatan monitoring;
- follow-up;
- komunikasi kepada siswa/wali dalam rombel.

## 15.4 Batas

Homeroom Assignment tidak otomatis memberikan hak:

- mengubah seluruh nilai;
- mencatat semua presensi guru lain;
- mengubah Teaching Assignment;
- mengelola struktur akademik.

---

# 16. Teaching Assignment

## 16.1 Definisi

Teaching Assignment adalah sumber utama scope pengajaran.

Secara konseptual:

```text
Teacher
+
Subject
+
Academic Period
+
Learning Scope
```

## 16.2 Capability

Dapat menghasilkan akses terhadap:

- kelas yang diajar;
- materi;
- tugas;
- submission;
- presensi sesi;
- assessment;
- grade;
- CBT;
- announcement kelas tertentu.

## 16.3 Batas

Teaching Assignment tidak memberikan school-wide access.

---

# 17. Student Self Scope

STUDENT menggunakan self scope.

Contoh akses:

- profil sendiri;
- jadwal sendiri;
- kelas sendiri;
- materi yang dipublikasikan kepadanya;
- tugas yang ditugaskan kepadanya;
- submission sendiri;
- CBT miliknya;
- presensi pribadi;
- published grade pribadi;
- announcement yang menargetkannya;
- notification sendiri.

---

# 18. Guardian Relationship Scope

GUARDIAN memperoleh scope melalui relationship.

Contoh:

```text
Guardian A
├── Student X
└── Student Y
```

Guardian dapat berpindah context antar anak yang sah.

Akses hanya terhadap data yang memang dipublikasikan untuk guardian.

---

# 19. Permission Model

Permission menggunakan pola:

```text
DOMAIN.RESOURCE.ACTION
```

Contoh:

```text
academic.students.view
academic.students.manage

academic.structure.view
academic.structure.manage

schedule.master.view
schedule.master.manage
schedule.master.publish

attendance.session.view
attendance.session.record
attendance.session.correct
attendance.session.finalize

learning.material.view
learning.material.manage
learning.assignment.manage

assessment.grades.view
assessment.grades.manage
assessment.grades.publish
assessment.grades.finalize

cbt.exam.manage
cbt.attempt.monitor

communication.announcement.manage
report.school.view
```

Nama final permission dapat disesuaikan pada implementasi, tetapi makna capability harus konsisten.

---

# 20. Action Vocabulary

Action dasar yang direkomendasikan:

```text
view
create
update
delete
manage
publish
approve
reject
record
correct
finalize
export
import
assign
monitor
```

`manage` digunakan hanya jika grouping memang diperlukan.

Permission sensitif sebaiknya tidak digabung berlebihan.

Contoh:

```text
assessment.grades.manage
```

tidak otomatis berarti:

```text
assessment.grades.publish
assessment.grades.finalize
```

---

# 21. Resource Scope Model

Scope resmi dapat berupa:

```text
GLOBAL
SCHOOL
ORGANIZATION_UNIT
PROGRAM
GRADE_LEVEL
ROMBEL
TEACHING_ASSIGNMENT
HOMEROOM_ASSIGNMENT
STUDENT_SELF
GUARDIAN_RELATIONSHIP
RESOURCE_OWNER
EXPLICIT_RESOURCE
```

Tidak semua permission mendukung semua scope.

---

# 22. Global Scope

GLOBAL hanya digunakan untuk capability platform yang memang bersifat global.

Contoh actor:

```text
SUPER_ADMIN
```

GLOBAL scope harus sangat dibatasi.

---

# 23. School Scope

SCHOOL scope berarti resource pada satu sekolah.

Contoh:

- Headmaster reporting;
- Wakasek tertentu;
- staff dengan capability tertentu.

School scope tidak berarti full permission.

---

# 24. Organization Unit Scope

Digunakan jika jabatan atau tanggung jawab terbatas pada unit tertentu.

---

# 25. Program Scope

Digunakan untuk actor seperti PROGRAM_HEAD atau staff tertentu.

---

# 26. Rombel Scope

Digunakan untuk:

- Homeroom Assignment;
- beberapa workflow kelas tertentu.

---

# 27. Teaching Assignment Scope

Scope ini merupakan salah satu scope paling penting bagi TEACHER.

Contoh:

```text
Guru A
Teaching Assignment:
- PBO
- XII RPL
- Semester Ganjil

Effective scope:
hanya resource pembelajaran yang terkait assignment tersebut
```

---

# 28. Student Self Scope

Siswa hanya memperoleh resource yang mengacu kepada dirinya sendiri.

---

# 29. Guardian Relationship Scope

Guardian memperoleh resource melalui hubungan yang sah dengan siswa.

---

# 30. Resource Owner Scope

Digunakan untuk resource yang memang memiliki creator/owner.

Tetapi ownership creator tidak boleh menggantikan aturan domain.

Contoh:

Guru yang membuat materi dapat menjadi owner Material, tetapi publikasi ke kelas tetap memerlukan Teaching Assignment yang sah.

---

# 31. Effective Access Evaluation

Urutan evaluasi:

```text
1. Apakah identity valid?
2. Apakah account aktif?
3. Apa Base Role pengguna?
4. Position apa yang aktif?
5. Assignment apa yang aktif?
6. Relationship apa yang aktif?
7. Permission apa yang dimiliki?
8. Scope resource apa yang dihasilkan?
9. Apakah resource berada dalam scope?
10. Apakah resource state mengizinkan tindakan?
11. Apakah periode masih berlaku?
12. Apakah terdapat restriction tambahan?
        ↓
ALLOW / DENY
```

---

# 32. Default Deny

Prinsip resmi:

```text
Jika hak tidak dapat dibuktikan
→ DENY
```

Bukan:

```text
Jika tidak ada aturan khusus
→ ALLOW
```

---

# 33. Read ≠ Write

Hak baca dan hak ubah selalu dipisahkan secara konseptual.

Contoh:

```text
Headmaster:
view grade summary
```

tidak otomatis:

```text
update grade
```

---

# 34. View ≠ Publish

Contoh:

Guru dapat:

```text
manage draft grade
```

tetapi publikasi nilai dapat memiliki permission tersendiri.

---

# 35. Manage ≠ Finalize

Finalization adalah tindakan bernilai tinggi dan harus dapat dibedakan.

---

# 36. Current Scope ≠ Historical Scope

Akses saat ini tidak selalu sama dengan akses histori.

Contoh:

Guru yang pernah mengajar kelas tahun lalu mungkin memiliki read-only historical access jika kebijakan mengizinkan, tetapi tidak boleh mengubah data periode tersebut.

---

# 37. Role Composition

Satu identity dapat memiliki beberapa konteks.

Contoh:

```text
User A

Base Role:
TEACHER

Position:
PROGRAM_HEAD

Assignment:
Teaching Assignment
Homeroom Assignment
```

Effective Access merupakan gabungan sah dari seluruh konteks tersebut.

---

# 38. Conflict Resolution

Jika pengguna memiliki beberapa sumber akses:

```text
ALLOW dari assignment A
ALLOW dari position B
```

effective access adalah union dari grant yang sah, kecuali terdapat explicit restriction.

Namun sistem harus menghindari model deny/allow yang ambigu.

Prinsip default:

```text
grant harus eksplisit
scope harus eksplisit
restriction harus dapat dijelaskan
```

---

# 39. SCHOOL_STAFF Capability Bundles

## 39.1 SYSTEM_ADMIN

Dapat mencakup:

- account administration;
- configuration tertentu;
- role/permission assignment terbatas;
- operasional sistem sekolah.

Tidak otomatis memiliki akses akademik sensitif.

## 39.2 ACADEMIC_OPERATOR

Dapat mencakup:

- periode akademik;
- struktur akademik;
- rombel;
- Teaching Assignment;
- jadwal;
- capability akademik administratif.

Tidak otomatis memiliki akses edit nilai.

## 39.3 STUDENT_DATA_OPERATOR

Dapat mencakup:

- identitas siswa;
- enrollment;
- placement;
- status akademik;
- import siswa.

Tidak otomatis mengelola assessment guru.

## 39.4 REPORT_OPERATOR

Dapat mencakup:

- laporan;
- export;
- rekap administratif.

Akses data tetap mengikuti scope.

---

# 40. Matriks Akses Tingkat Tinggi

Legenda:

```text
V = View
M = Manage
P = Publish / Finalize tertentu
S = Scoped
— = Tidak diberikan secara default
```

| Area | Super Admin | Staff | Teacher | Student | Guardian |
|---|---|---|---|---|---|
| Platform | M | S | — | — | — |
| School Profile | M | S | V | V | V |
| Academic Structure | V/M | S | V | V | V |
| Student Data | V/M | S | S | Self | Linked |
| Teacher Data | V/M | S | Self/S | V terbatas | — |
| Schedule | V/M | S | S | Self | Linked |
| Learning | V terbatas | S | S/M | Self | Linked terbatas |
| Attendance | V | S | S/M | Self | Linked |
| Assessment | V terbatas | S | S/M/P | Self Published | Linked Published |
| CBT | V terbatas | S | S/M | Self | Linked summary jika diizinkan |
| Communication | V/M | S | S | Self | Linked |
| Monitoring | V | S | S | Self terbatas | Linked terbatas |
| Reporting | V/M | S | S | Self | Linked |

Matriks ini hanya tingkat tinggi.

Effective access tetap bergantung pada permission dan scope.

---

# 41. Akses Guru

Secara default guru dapat memperoleh:

```text
Kelas Saya
Jadwal Saya
Materi
Tugas
Submission
Presensi Sesi
Assessment
Nilai
CBT
Pengumuman Kelas
Riwayat aktivitas relevan
```

hanya untuk Teaching Assignment yang sah.

Jadwal resmi pada umumnya:

```text
READ-ONLY
```

kecuali guru memiliki capability administratif tambahan.

---

# 42. Akses Siswa

Siswa dapat memperoleh:

```text
Dashboard pribadi
Aktivitas hari ini
Jadwal
Materi
Tugas
Submission
CBT
Presensi pribadi
Published Grade
Pengumuman
Notification
Profil sendiri
```

Siswa tidak boleh:

- mengubah nilai;
- mengubah presensi resmi;
- melihat submission siswa lain;
- melihat grade siswa lain;
- membaca data wali siswa lain.

---

# 43. Akses Guardian

Guardian dapat memperoleh:

```text
anak yang terhubung
jadwal anak
tugas anak
kehadiran anak
published grade
pengumuman relevan
notifikasi
ringkasan monitoring yang memang diizinkan
profil anak terbatas
```

Guardian tidak boleh memperoleh:

- draft grade;
- catatan guru internal;
- data siswa lain;
- assessment answer key;
- permission administratif.

---

# 44. Akses Wali Kelas

Wali kelas memperoleh rombel scope.

Capability dapat mencakup:

```text
Ringkasan rombel
Daftar siswa
Attendance recap
Assignment monitoring
Published grade summary
Student Attention Center
Monitoring Notes
Follow-Up
Guardian communication
```

Wali kelas tidak otomatis boleh mengubah grade milik guru mata pelajaran.

---

# 45. Akses Pimpinan

Pimpinan memperoleh management scope berdasarkan Position Assignment.

Fokus utama:

```text
VIEW
MONITOR
REPORT
APPROVE tertentu
```

bukan mengambil alih operasi guru.

---

# 46. Access State dan Resource Lifecycle

Authorization juga harus mempertimbangkan state resource.

Contoh:

```text
Grade Draft
→ guru dapat edit

Grade Finalized
→ tidak dapat edit tanpa correction flow
```

atau:

```text
Exam Closed
→ attempt baru tidak boleh dibuat
```

Jadi permission saja tidak cukup.

---

# 47. Access dan Academic Period

Assignment atau scope yang periodik hanya berlaku pada Effective Period yang sah.

Contoh:

```text
Homeroom Assignment 2026/2027
```

tidak otomatis berlaku pada:

```text
2027/2028
```

---

# 48. Access terhadap Historical Data

Historical access dapat memiliki mode:

```text
NONE
READ_ONLY
MANAGE_WITH_CORRECTION
```

Tidak boleh menganggap histori sama dengan current operations.

---

# 49. Access terhadap File

Hak file mengikuti resource domain.

Contoh:

```text
Guardian dapat melihat Assignment Publication anak
```

belum tentu berarti semua attachment internal guru dapat dilihat.

Attachment harus mengikuti access rule resource spesifik.

---

# 50. Access terhadap Reporting

Reporting hanya boleh menyajikan data yang memang dapat diakses actor.

Export harus mengikuti effective access yang sama.

Tidak boleh:

```text
UI hanya menampilkan 1 rombel
tetapi CSV export berisi seluruh sekolah
```

---

# 51. Access terhadap Search

Search harus mengikuti scope.

Pengguna tidak boleh menemukan resource yang sebenarnya tidak boleh dilihat hanya melalui fitur pencarian.

---

# 52. Access terhadap Bulk Operation

Bulk operation memerlukan:

- permission;
- resource scope;
- domain validation;
- audit.

Bulk tidak boleh menjadi bypass authorization.

---

# 53. Access terhadap Integration

Integration identity harus memiliki permission dan scope eksplisit.

System-to-system access tidak boleh dianggap unlimited.

---

# 54. Access terhadap AI

AI hanya boleh menerima data yang sudah lolos effective access pengguna.

Model:

```text
USER
 ↓
AUTHORIZATION
 ↓
ALLOWED DATA
 ↓
AI
```

Bukan:

```text
AI
 ↓
DATABASE ALL ACCESS
```

---

# 55. Sensitive Capability

Capability berikut diperlakukan sensitif:

- mengubah role/permission;
- mengubah assignment;
- mengubah enrollment;
- mengubah placement;
- mengubah jadwal published;
- correction attendance;
- mengubah grade;
- publish/finalize grade;
- membuka atau mengubah CBT yang aktif;
- melihat data sensitif monitoring;
- export data massal;
- impersonation jika suatu saat tersedia.

Capability sensitif memerlukan audit yang lebih kuat.

---

# 56. Impersonation

Jika di masa depan Ruang Pintar mendukung impersonation untuk support:

- harus eksplisit;
- harus dibatasi;
- harus diaudit;
- harus terlihat bahwa aksi dilakukan melalui impersonation;
- tidak boleh menjadi fitur default.

Saat ini impersonation bukan requirement inti.

---

# 57. Anti-Pattern yang Dilarang

## 57.1 Role = Full Access

```text
if teacher:
    allow all classes
```

Dilarang.

## 57.2 Hanya Menyembunyikan Menu

UI visibility bukan authorization.

## 57.3 Staff = Admin

SCHOOL_STAFF tidak boleh dianggap full admin.

## 57.4 Position sebagai Role Permanen

Kepala Sekolah dan Wali Kelas bersifat assignment, bukan identity permanen.

## 57.5 Guardian Berdasarkan Data Personal Saja

Mengetahui nama/NIS siswa bukan bukti hubungan.

## 57.6 Access tanpa Period

Teaching Assignment periodik tidak boleh berlaku selamanya.

## 57.7 Export Bypass

Export tidak boleh memiliki scope lebih luas daripada UI/data access.

## 57.8 AI Bypass

AI tidak boleh mendapatkan super-access.

---

# 58. Access Decision Trace

Untuk operation penting, sistem idealnya dapat menjelaskan:

```text
Actor:
User A

Base Role:
TEACHER

Source:
Teaching Assignment TA-001

Permission:
assessment.grades.manage

Scope:
Rombel XII RPL
Subject PBO
Semester Ganjil

Resource:
Grade Student X

Decision:
ALLOW
```

atau:

```text
Decision:
DENY

Reason:
Resource berada di luar Teaching Assignment
```

---

# 59. Permission Assignment Principles

Permission dapat diberikan melalui:

- Base Role;
- capability bundle;
- Position;
- Assignment type;
- explicit administrative grant jika benar-benar diperlukan.

Explicit individual permission sebaiknya digunakan secara terbatas agar sistem tidak sulit diaudit.

---

# 60. Least Privilege

Setiap actor hanya memperoleh permission minimum yang diperlukan.

Contoh:

Wakasek Kesiswaan membutuhkan:

```text
attendance.view.school
monitoring.view.school
monitoring.followup.manage
```

bukan:

```text
assessment.grades.manage.school
```

---

# 61. Separation of Duties

Untuk proses sensitif, Ruang Pintar dapat menerapkan separation of duties.

Contoh:

```text
Operator menyiapkan
Pihak berwenang mempublikasikan
```

atau:

```text
Guru menginput nilai
Pihak tertentu memfinalisasi
```

Implementasi detail mengikuti requirement per domain.

---

# 62. Traceability

Setiap access rule harus dapat ditelusuri:

```text
Product Requirement
        ↓
Domain Rule
        ↓
Module
        ↓
Actor
        ↓
Permission
        ↓
Scope
        ↓
Policy / Authorization
        ↓
Test
```

---

# 63. Contoh Traceability Guru

```text
PR-ATTENDANCE-004
        ↓
DM-ATTENDANCE-002
        ↓
M12 Attendance
        ↓
TEACHER
        ↓
attendance.session.record
        ↓
Teaching Assignment Scope
        ↓
ALLOW hanya sesi terkait
```

---

# 64. Contoh Traceability Guardian

```text
PR-GUARDIAN-003
        ↓
DM-GUARDIAN-002
        ↓
M15 Guardian & Family
        ↓
GUARDIAN
        ↓
student.linked.view
        ↓
Guardian–Student Relationship
```

---

# 65. Baseline Base Roles yang Dikunci jika Disetujui

```text
SUPER_ADMIN
SCHOOL_STAFF
TEACHER
STUDENT
GUARDIAN
```

Base role tambahan tidak boleh dibuat hanya untuk mewakili jabatan.

---

# 66. Baseline Position yang Dikunci jika Disetujui

```text
HEADMASTER
VICE_PRINCIPAL_CURRICULUM
VICE_PRINCIPAL_STUDENT_AFFAIRS
PROGRAM_HEAD
```

Position lain dapat ditambahkan sesuai kebutuhan sekolah.

---

# 67. Baseline Assignment

```text
TEACHING_ASSIGNMENT
HOMEROOM_ASSIGNMENT
POSITION_ASSIGNMENT
```

Guardian menggunakan relationship, bukan assignment.

---

# 68. Baseline Staff Capability Bundle

```text
SYSTEM_ADMIN
ACADEMIC_OPERATOR
STUDENT_DATA_OPERATOR
REPORT_OPERATOR
```

Bundle dapat ditambah kemudian bila requirement baru membutuhkan.

---

# 69. Hal yang Belum Dikunci

Dokumen ini belum menentukan:

- struktur tabel role/permission;
- library authorization;
- framework authentication;
- session implementation;
- token format;
- policy class;
- middleware;
- cache permission;
- database schema;
- UI menu;
- sidebar visibility;
- route naming;
- API authorization format.

Keputusan tersebut masuk System Architecture dan Data Architecture.

---

# 70. Definition of Done Role & Access

Dokumen dianggap selesai apabila:

- Base Role jelas;
- Position dipisahkan dari role;
- Assignment dipisahkan dari role;
- Relationship menjadi sumber scope bila relevan;
- permission vocabulary jelas;
- resource scope jelas;
- default deny ditetapkan;
- read/write/finalize dipisahkan;
- current/historical access dibedakan;
- student self scope jelas;
- guardian relationship scope jelas;
- Teaching Assignment menjadi sumber utama teacher scope;
- Homeroom Assignment menjadi sumber wali kelas;
- staff bukan full admin;
- effective access dapat dijelaskan.

---

# 71. Checklist Human Review

Sebelum `APPROVED / LOCKED`, pastikan:

- [ ] lima Base Role sudah tepat;
- [ ] SCHOOL_STAFF tidak terlalu kuat;
- [ ] position bukan base role;
- [ ] Wali Kelas dimodelkan sebagai Homeroom Assignment;
- [ ] Guru mendapat scope dari Teaching Assignment;
- [ ] Guardian mendapat scope dari relationship;
- [ ] Siswa menggunakan self scope;
- [ ] Headmaster fokus monitoring/management, bukan full write;
- [ ] Wakasek Kurikulum memiliki scope akademik yang benar;
- [ ] Wakasek Kesiswaan tidak dapat mengubah nilai/presensi guru secara default;
- [ ] Program Head terbatas pada program;
- [ ] permission dan scope dipisahkan;
- [ ] default deny diterapkan;
- [ ] UI hiding bukan security;
- [ ] historical access dibedakan;
- [ ] export/search/bulk tetap mengikuti scope;
- [ ] AI tidak memperoleh bypass authorization.

---

# 72. Status Dokumen

**Status Saat Ini:** FINAL REVIEW  
**Versi:** 1.0-RC

Dokumen belum berstatus `APPROVED / LOCKED` sampai human review selesai.

Jika disetujui:

```text
Version: 1.0
Status: APPROVED / LOCKED
```

---

# 73. Dokumen Berikutnya

Setelah `04-ROLE-ACCESS.md` disetujui dan dikunci, pembahasan dilanjutkan ke:

```text
05-SYSTEM-ARCHITECTURE.md
```

Dokumen tersebut menjawab:

> **Bagaimana seluruh requirement, domain, module boundary, dan access model Ruang Pintar diterapkan menjadi sistem perangkat lunak yang nyata?**

System Architecture tidak boleh mengubah keputusan produk, invariant domain, ownership modul, atau model akses yang telah dikunci tanpa proses perubahan resmi.
