# 02 — DOMAIN MODEL
## Ruang Pintar

**Nama Dokumen:** Domain Model  
**Nama Produk:** Ruang Pintar  
**Versi Dokumen:** 1.0-RC  
**Status:** FINAL REVIEW  
**Dokumen Induk:**  
- `00-PROJECT-BRIEF.md`
- `01-PRODUCT-REQUIREMENTS.md`

**Jenis Dokumen:** Spesifikasi Model Domain  
**Bahasa Utama:** Bahasa Indonesia

---

# 1. Tujuan Dokumen

Dokumen ini mendefinisikan konsep-konsep utama yang hidup di dalam domain Ruang Pintar, hubungan antar konsep, batas makna, lifecycle, serta aturan bisnis yang harus selalu benar.

Dokumen ini menjawab pertanyaan:

> **Konsep apa saja yang hidup di dalam dunia Ruang Pintar, bagaimana hubungan antar konsep tersebut, dan aturan bisnis apa yang tidak boleh dilanggar?**

Dokumen ini menjadi fondasi untuk:

- `03-MODULE-MAP.md`;
- `04-ROLE-ACCESS.md`;
- `05-SYSTEM-ARCHITECTURE.md`;
- `06-DATA-ARCHITECTURE.md`;
- implementasi business logic;
- authorization;
- validation;
- testing;
- audit;
- reporting.

---

# 2. Posisi Domain Model

Urutan hubungan dokumen:

```text
00-PROJECT-BRIEF.md
        ↓
Mengapa dan apa yang dibangun?

01-PRODUCT-REQUIREMENTS.md
        ↓
Produk wajib mampu melakukan apa?

02-DOMAIN-MODEL.md
        ↓
Konsep dan aturan bisnisnya bagaimana?

03-MODULE-MAP.md
        ↓
Konsep tersebut dikelompokkan menjadi modul apa?

04-ROLE-ACCESS.md
        ↓
Siapa boleh melakukan apa?

05-SYSTEM-ARCHITECTURE.md
        ↓
Bagaimana sistem dibangun secara teknis?

06-DATA-ARCHITECTURE.md
        ↓
Bagaimana data disimpan dan dihubungkan?
```

Domain Model tidak boleh langsung diterjemahkan menjadi tabel database tanpa analisis lanjutan.

---

# 3. Prinsip Domain Modeling

## 3.1 Makna Bisnis Lebih Penting daripada Bentuk Teknis

Dua konsep yang terlihat mirip secara teknis belum tentu memiliki arti yang sama secara bisnis.

Contoh:

```text
Identitas Siswa
≠
Enrollment Siswa
≠
Penempatan Rombel
```

## 3.2 Riwayat Tidak Boleh Hilang

Perubahan kondisi saat ini tidak boleh menghapus fakta masa lalu yang masih relevan.

## 3.3 Periode Harus Eksplisit

Konsep yang berubah menurut waktu harus memiliki konteks waktu atau periode yang jelas.

## 3.4 Assignment Harus Dipisahkan dari Identity

Identitas seseorang tidak boleh bercampur dengan tugas atau tanggung jawab yang bersifat periodik.

## 3.5 Kejadian Aktual Harus Dipisahkan dari Rencana

Rencana tidak sama dengan kejadian nyata.

Contoh:

```text
Master Schedule
≠
Actual Class Session
```

## 3.6 Draft Tidak Sama dengan Published

Informasi internal belum tentu boleh langsung terlihat oleh pengguna lain.

## 3.7 Missing Value Tidak Sama dengan Zero

Nilai yang belum tersedia tidak boleh diwakili sebagai angka nol jika maknanya berbeda.

## 3.8 Aturan Domain Harus Dapat Diuji

Aturan domain utama harus dapat diterjemahkan menjadi validation, authorization, dan test.

---

# 4. Peta Domain Tingkat Tinggi

```text
SCHOOL
│
├── ORGANIZATION
│   ├── Unit
│   ├── Position
│   └── Assignment
│
├── IDENTITY
│   ├── User Account
│   ├── Staff Profile
│   ├── Teacher Profile
│   ├── Student Identity
│   └── Guardian Identity
│
├── ACADEMIC
│   ├── Academic Year
│   ├── Semester
│   ├── Grade Level
│   ├── Program
│   ├── Rombel
│   ├── Student Enrollment
│   ├── Rombel Placement
│   ├── Subject
│   └── Teaching Assignment
│
├── SCHEDULING
│   ├── Academic Calendar
│   ├── Master Schedule
│   └── Actual Class Session
│
├── LEARNING
│   ├── Learning Context
│   ├── Material
│   ├── Material Publication
│   ├── Assignment
│   ├── Assignment Publication
│   └── Submission
│
├── ATTENDANCE
│   ├── School Attendance
│   └── Class Session Attendance
│
├── ASSESSMENT
│   ├── Assessment Definition
│   ├── Grade
│   ├── Grade Publication
│   └── Grade Finalization
│
├── CBT
│   ├── Question Bank
│   ├── Question Version
│   ├── Exam Definition
│   ├── Exam Snapshot
│   ├── Exam Attempt
│   └── Integrity Event
│
├── GUARDIAN
│   └── Guardian–Student Relationship
│
├── COMMUNICATION
│   ├── Announcement
│   ├── Audience
│   └── Notification
│
├── MONITORING
│   ├── Student Indicator
│   ├── Follow-Up
│   └── Monitoring Note
│
└── PLATFORM SUPPORT
    ├── File
    ├── Audit Log
    ├── Integration Event
    └── Configuration
```

---

# 5. Domain Sekolah

## 5.1 School

School adalah konteks organisasi utama tempat seluruh aktivitas Ruang Pintar berlangsung.

School bukan sekadar profil visual, tetapi boundary operasional utama.

School memiliki hubungan dengan:

- pengguna;
- struktur organisasi;
- periode akademik;
- siswa;
- guru;
- jadwal;
- pembelajaran;
- presensi;
- penilaian;
- komunikasi;
- konfigurasi;
- audit.

### Aturan Domain

**DM-SCHOOL-001**  
Setiap data operasional sekolah harus memiliki konteks sekolah yang dapat ditentukan secara sah.

**DM-SCHOOL-002**  
Data satu sekolah tidak boleh secara implisit dianggap milik sekolah lain.

**DM-SCHOOL-003**  
Konfigurasi sekolah tidak boleh mengubah histori domain yang telah sah tanpa proses perubahan resmi.

---

# 6. Domain Struktur Organisasi

## 6.1 Organization Unit

Organization Unit adalah bagian organisasi sekolah.

Contoh:

- Wakil Kepala Sekolah;
- Program Keahlian;
- Tata Usaha;
- Unit Kesiswaan;
- Unit Kurikulum;
- unit lain sesuai kebutuhan sekolah.

Organization Unit bukan role.

## 6.2 Position

Position adalah jabatan atau posisi organisasi.

Contoh:

- Kepala Sekolah;
- Wakil Kepala Sekolah;
- Kepala Program;
- Wali Kelas.

Position berbeda dari account dan berbeda dari role teknis.

## 6.3 Position Assignment

Position Assignment menghubungkan seseorang dengan suatu position dalam periode tertentu.

```text
Person
   +
Position
   +
Effective Period
        ↓
Position Assignment
```

### Aturan Domain

**DM-ORG-001**  
Position tidak boleh dianggap melekat permanen pada seseorang.

**DM-ORG-002**  
Perubahan pejabat tidak boleh menghapus riwayat pejabat sebelumnya.

**DM-ORG-003**  
Kewenangan yang berasal dari jabatan harus mengikuti assignment yang aktif dan sah.

---

# 7. Domain Identity dan Account

## 7.1 User Account

User Account adalah identitas autentikasi yang digunakan untuk masuk ke sistem.

User Account bukan:

- Student;
- Teacher;
- Guardian;
- Position;
- Teaching Assignment.

## 7.2 Domain Profile

Satu account dapat terhubung dengan satu atau lebih profile domain.

Contoh:

```text
User Account
├── Teacher Profile
├── Staff Profile
└── Guardian Identity
```

### Aturan Domain

**DM-IDENTITY-001**  
User Account tidak boleh digunakan sebagai pengganti seluruh konsep domain pengguna.

**DM-IDENTITY-002**  
Satu pengguna dapat memiliki lebih dari satu konteks atau tanggung jawab yang sah.

**DM-IDENTITY-003**  
Menonaktifkan satu assignment tidak otomatis menghapus account.

**DM-IDENTITY-004**  
Menonaktifkan account tidak boleh menghapus histori domain.

---

# 8. Domain Siswa

## 8.1 Student Identity

Student Identity merepresentasikan identitas siswa sebagai individu.

Student Identity tidak menyimpan makna "kelas saat ini" sebagai identitas permanen.

## 8.2 Student Enrollment

Student Enrollment merepresentasikan keikutsertaan siswa dalam konteks akademik tertentu.

```text
Student Identity
        +
Academic Period
        ↓
Student Enrollment
```

Enrollment dapat memiliki status seperti:

- aktif;
- nonaktif;
- lulus;
- pindah;
- status lain sesuai kebijakan.

## 8.3 Rombel Placement

Rombel Placement merepresentasikan penempatan siswa dalam rombongan belajar.

```text
Student Enrollment
        +
Rombel
        +
Effective Period
        ↓
Rombel Placement
```

### Invariant Utama

```text
Student Identity
≠
Student Enrollment
≠
Rombel Placement
```

### Aturan Domain

**DM-STUDENT-001**  
Identitas siswa tidak boleh bergantung pada rombel tempat siswa saat ini berada.

**DM-STUDENT-002**  
Perubahan rombel tidak boleh mengubah identitas siswa.

**DM-STUDENT-003**  
Enrollment baru tidak boleh menghapus enrollment lama.

**DM-STUDENT-004**  
Rombel Placement harus memiliki konteks periode yang jelas.

**DM-STUDENT-005**  
Kenaikan kelas harus menghasilkan perubahan konteks akademik, bukan menimpa histori sebelumnya.

**DM-STUDENT-006**  
Status lulus atau pindah tidak berarti Student Identity harus dihapus.

---

# 9. Domain Periode Akademik

## 9.1 Academic Year

Academic Year adalah konteks tahun akademik sekolah.

Contoh:

```text
2026/2027
```

## 9.2 Semester

Semester merupakan bagian dari Academic Year.

Contoh:

```text
Academic Year 2026/2027
├── Semester Ganjil
└── Semester Genap
```

## 9.3 Effective Period

Effective Period digunakan pada konsep yang memiliki masa berlaku.

### Aturan Domain

**DM-PERIOD-001**  
Data periodik harus memiliki konteks periode yang eksplisit.

**DM-PERIOD-002**  
Aktivasi periode baru tidak boleh menghapus data periode lama.

**DM-PERIOD-003**  
Status aktif tidak boleh disimpulkan hanya dari keberadaan data.

**DM-PERIOD-004**  
Operasi yang bergantung periode harus mengetahui periode mana yang sedang digunakan.

---

# 10. Domain Struktur Akademik

## 10.1 Grade Level

Grade Level merepresentasikan tingkat akademik.

Contoh:

```text
X
XI
XII
```

## 10.2 Phase

Phase merepresentasikan fase pendidikan apabila diperlukan oleh kurikulum.

## 10.3 Program

Program dapat merepresentasikan:

- jurusan;
- program keahlian;
- konsentrasi;
- struktur akademik lain.

## 10.4 Rombel

Rombel adalah kelompok belajar siswa dalam konteks periode tertentu.

Contoh:

```text
X RPL 1
XI TO 2
X DKV 1
```

### Aturan Domain

**DM-STRUCTURE-001**  
Rombel bukan Student Identity.

**DM-STRUCTURE-002**  
Nama rombel bukan satu-satunya identitas historis rombel.

**DM-STRUCTURE-003**  
Perubahan struktur akademik tidak boleh menghilangkan konteks periode sebelumnya.

**DM-STRUCTURE-004**  
Program, Grade Level, Phase, dan Rombel harus dapat dibedakan walaupun pada sekolah tertentu sebagian konsep tampak serupa.

---

# 11. Domain Guru

## 11.1 Teacher Profile

Teacher Profile merepresentasikan guru sebagai individu profesional di sekolah.

## 11.2 Subject

Subject adalah definisi mata pelajaran.

Subject bukan guru.

## 11.3 Teaching Assignment

Teaching Assignment menghubungkan:

```text
Teacher
   +
Subject
   +
Academic Period
   +
Learning Scope
        ↓
Teaching Assignment
```

Teaching Assignment adalah sumber utama konteks "guru mengajar apa dan kepada siapa".

### Invariant Utama

```text
Teacher
≠
Subject
≠
Teaching Assignment
```

### Aturan Domain

**DM-TEACHER-001**  
Guru tidak boleh dianggap secara permanen melekat pada satu mata pelajaran.

**DM-TEACHER-002**  
Subject tidak boleh menyimpan guru sebagai bagian permanen dari identitasnya.

**DM-TEACHER-003**  
Teaching Assignment harus periodik.

**DM-TEACHER-004**  
Hak guru mengelola pembelajaran harus berasal dari assignment yang sah atau kewenangan eksplisit lain.

**DM-TEACHER-005**  
Perubahan Teaching Assignment tidak boleh menghapus histori assignment lama.

---

# 12. Domain Kalender Akademik

Academic Calendar merepresentasikan kalender operasional akademik sekolah.

Dapat mencakup:

- hari efektif;
- hari libur;
- kegiatan sekolah;
- ujian;
- masa orientasi;
- periode tertentu;
- pengecualian jadwal.

### Aturan Domain

**DM-CALENDAR-001**  
Academic Calendar berbeda dari Master Schedule.

**DM-CALENDAR-002**  
Hari libur atau kegiatan khusus dapat memengaruhi jadwal aktual tanpa harus menghapus Master Schedule.

**DM-CALENDAR-003**  
Perubahan kalender harus dapat mempertahankan histori yang relevan.

---

# 13. Domain Penjadwalan

## 13.1 Master Schedule

Master Schedule adalah rencana resmi kegiatan pembelajaran.

Contoh:

```text
Senin
08:00–09:30
X RPL
Pemrograman
Guru A
```

## 13.2 Actual Class Session

Actual Class Session adalah kejadian kelas yang benar-benar berlangsung.

Contoh:

```text
Master Schedule:
Senin 08:00

Actual:
Senin 08:15
Guru pengganti
Ruang berbeda
```

### Invariant Utama

```text
Master Schedule
≠
Academic Calendar
≠
Actual Class Session
```

### Aturan Domain

**DM-SCHEDULE-001**  
Master Schedule tidak boleh dianggap bukti bahwa suatu kelas benar-benar terjadi.

**DM-SCHEDULE-002**  
Presensi kelas harus terkait Actual Class Session.

**DM-SCHEDULE-003**  
Perubahan kejadian aktual tidak harus menulis ulang Master Schedule.

**DM-SCHEDULE-004**  
Actual Class Session harus mempertahankan konteks guru, kelas, Subject, dan periode yang relevan.

**DM-SCHEDULE-005**  
Konflik jadwal harus ditentukan menggunakan resource yang memang relevan.

---

# 14. Domain Learning Context

Learning Context menghubungkan konteks pembelajaran aktual.

Secara konseptual dapat melibatkan:

- Teaching Assignment;
- Subject;
- Rombel;
- Academic Period.

Learning Context menjadi boundary bagi:

- materi;
- tugas;
- assessment;
- aktivitas kelas.

### Aturan Domain

**DM-LEARNING-001**  
Aktivitas pembelajaran harus memiliki konteks akademik yang sah.

**DM-LEARNING-002**  
Hak guru mengelola Learning Context harus mengikuti Teaching Assignment atau kewenangan yang sah.

---

# 15. Domain Materi

## 15.1 Material

Material adalah konten pembelajaran yang dapat dibuat dan digunakan kembali.

## 15.2 Material Publication

Material Publication adalah tindakan menerbitkan Material ke Learning Context tertentu.

### Invariant Utama

```text
Material
≠
Material Publication
```

### Aturan Domain

**DM-MATERIAL-001**  
Satu Material dapat dipublikasikan ke lebih dari satu konteks.

**DM-MATERIAL-002**  
Mengubah publikasi tidak harus mengubah Material asli.

**DM-MATERIAL-003**  
Material draft tidak boleh otomatis terlihat siswa.

**DM-MATERIAL-004**  
Riwayat publikasi penting tidak boleh hilang hanya karena Material diperbarui.

---

# 16. Domain Tugas

## 16.1 Assignment Definition

Assignment Definition adalah definisi tugas.

## 16.2 Assignment Publication

Assignment Publication menghubungkan tugas ke Learning Context tertentu.

## 16.3 Submission

Submission adalah pekerjaan siswa terhadap Assignment Publication tertentu.

### Invariant Utama

```text
Assignment Definition
≠
Assignment Publication
≠
Submission
```

### Aturan Domain

**DM-ASSIGNMENT-001**  
Tugas dapat digunakan ulang tanpa harus menghapus histori publikasi sebelumnya.

**DM-ASSIGNMENT-002**  
Deadline harus terkait dengan Assignment Publication yang relevan.

**DM-ASSIGNMENT-003**  
Submission harus terkait siswa yang sah dan assignment yang benar.

**DM-ASSIGNMENT-004**  
Status terlambat tidak boleh ditentukan tanpa waktu Submission dan deadline yang valid.

**DM-ASSIGNMENT-005**  
Penghapusan draft tugas tidak boleh menghapus Submission sah yang sudah menjadi histori resmi.

---

# 17. Domain Presensi

## 17.1 School Attendance

School Attendance merepresentasikan kehadiran siswa pada konteks sekolah.

## 17.2 Class Session Attendance

Class Session Attendance merepresentasikan kehadiran siswa pada Actual Class Session tertentu.

### Invariant Utama

```text
School Attendance
≠
Class Session Attendance
```

Contoh:

```text
07:00
Siswa hadir di sekolah

09:00
Siswa tidak hadir pada kelas Matematika
```

Kedua fakta dapat benar secara bersamaan.

### Aturan Domain

**DM-ATTENDANCE-001**  
Kehadiran sekolah tidak otomatis menentukan kehadiran setiap sesi kelas.

**DM-ATTENDANCE-002**  
Class Session Attendance wajib memiliki Actual Class Session.

**DM-ATTENDANCE-003**  
Attendance correction tidak boleh menghilangkan histori koreksi penting.

**DM-ATTENDANCE-004**  
Status presensi harus mengikuti vocabulary yang didefinisikan sekolah.

**DM-ATTENDANCE-005**  
Presensi yang sudah difinalisasi tidak boleh diubah tanpa kontrol yang sesuai.

---

# 18. Domain Penilaian

## 18.1 Assessment Definition

Assessment Definition merepresentasikan bentuk penilaian.

Contoh:

- tugas;
- kuis;
- ujian;
- praktik;
- proyek;
- bentuk lain sesuai sekolah.

## 18.2 Grade

Grade adalah hasil penilaian siswa.

### Invariant Utama

```text
Assessment Definition
≠
Grade
```

### Missing Grade

```text
Belum dinilai
≠
Nilai 0
```

### Aturan Domain

**DM-GRADE-001**  
Nilai yang belum tersedia tidak boleh dipalsukan sebagai nilai nol.

**DM-GRADE-002**  
Grade harus terkait siswa dan Assessment Definition yang sah.

**DM-GRADE-003**  
Guru hanya boleh mengelola Grade dalam scope yang sah.

**DM-GRADE-004**  
Draft Grade dan Published Grade harus dapat dibedakan.

**DM-GRADE-005**  
Perubahan nilai penting harus dapat ditelusuri.

**DM-GRADE-006**  
Finalized Grade tidak boleh diubah tanpa mekanisme koreksi atau authorization yang sah.

---

# 19. Domain Publikasi Nilai

Grade Publication merepresentasikan keputusan bahwa hasil penilaian tertentu boleh terlihat oleh audience tertentu.

### Aturan Domain

**DM-GRADEPUB-001**  
Nilai internal guru tidak otomatis menjadi nilai yang terlihat siswa atau wali.

**DM-GRADEPUB-002**  
Publikasi nilai tidak mengubah nilai sumber secara otomatis.

**DM-GRADEPUB-003**  
Unpublish tidak boleh menghapus histori nilai.

---

# 20. Domain CBT

## 20.1 Question Bank

Question Bank adalah koleksi soal yang dapat digunakan ulang.

## 20.2 Question Version

Question Version adalah versi stabil dari suatu soal.

## 20.3 Exam Definition

Exam Definition mendefinisikan ujian.

## 20.4 Exam Snapshot

Exam Snapshot adalah representasi stabil dari ujian yang telah disiapkan untuk Attempt.

## 20.5 Exam Attempt

Exam Attempt adalah sesi pengerjaan ujian oleh satu siswa.

## 20.6 Integrity Event

Integrity Event adalah event yang dapat menunjukkan kondisi yang perlu direview.

Contoh:

- kehilangan fokus;
- reconnect;
- perubahan perangkat;
- event lain yang disetujui.

Integrity Event bukan bukti otomatis kecurangan.

### Invariant Utama

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

### Aturan Domain

**DM-CBT-001**  
Perubahan Question Bank tidak boleh mengubah Exam Snapshot yang sudah digunakan.

**DM-CBT-002**  
Attempt harus menggunakan struktur ujian yang stabil.

**DM-CBT-003**  
Satu active attempt tidak boleh diduplikasi jika kebijakan hanya mengizinkan satu.

**DM-CBT-004**  
Timer harus memiliki sumber waktu authoritative.

**DM-CBT-005**  
Resume harus melanjutkan attempt yang sah, bukan membuat attempt baru secara diam-diam.

**DM-CBT-006**  
Answer key tidak boleh tersedia kepada client sebelum ada alasan sah.

**DM-CBT-007**  
Integrity Event hanya menjadi indikator, bukan keputusan disipliner otomatis.

**DM-CBT-008**  
Hasil CBT dapat diteruskan ke Gradebook hanya apabila memang dikonfigurasi sebagai assessment resmi.

---

# 21. Domain Orang Tua / Wali

## 21.1 Guardian Identity

Guardian Identity merepresentasikan identitas orang tua atau wali.

## 21.2 Guardian–Student Relationship

Hubungan Guardian dengan Student harus eksplisit.

```text
Guardian
   +
Student
   +
Relationship Type
   +
Verification Status
        ↓
Guardian–Student Relationship
```

### Aturan Domain

**DM-GUARDIAN-001**  
Guardian tidak boleh memperoleh akses siswa hanya karena mengetahui identitas siswa.

**DM-GUARDIAN-002**  
Akses harus berasal dari hubungan yang sah.

**DM-GUARDIAN-003**  
Satu Guardian dapat memiliki lebih dari satu siswa.

**DM-GUARDIAN-004**  
Satu siswa dapat memiliki lebih dari satu Guardian.

**DM-GUARDIAN-005**  
Menonaktifkan hubungan tidak boleh menghapus histori hubungan yang perlu dipertahankan.

---

# 22. Domain Wali Kelas

## 22.1 Homeroom Assignment

Homeroom Assignment menghubungkan guru dengan rombel pada periode tertentu.

```text
Teacher
   +
Rombel
   +
Academic Period
        ↓
Homeroom Assignment
```

### Aturan Domain

**DM-HOMEROOM-001**  
Wali kelas bukan role permanen.

**DM-HOMEROOM-002**  
Kewenangan wali kelas berasal dari Homeroom Assignment yang sah.

**DM-HOMEROOM-003**  
Pergantian wali kelas tidak boleh menghapus histori wali kelas sebelumnya.

---

# 23. Domain Monitoring

## 23.1 Student Indicator

Student Indicator adalah sinyal atau ringkasan berdasarkan data domain.

Contoh:

- frekuensi tidak hadir;
- tugas belum selesai;
- nilai menurun;
- keterlambatan;
- indikator lain.

## 23.2 Follow-Up

Follow-Up adalah tindakan tindak lanjut terhadap kondisi tertentu.

## 23.3 Monitoring Note

Monitoring Note adalah catatan yang dibuat oleh pihak berwenang.

### Aturan Domain

**DM-MONITOR-001**  
Indicator bukan sumber data utama.

**DM-MONITOR-002**  
Indicator harus dapat ditelusuri ke data sumber.

**DM-MONITOR-003**  
Indicator tidak boleh otomatis menjadi keputusan disipliner.

**DM-MONITOR-004**  
Catatan sensitif harus memiliki access scope yang lebih ketat.

---

# 24. Domain Komunikasi

## 24.1 Announcement

Announcement adalah informasi resmi yang dibuat untuk audience tertentu.

## 24.2 Audience

Audience merepresentasikan target penerima.

Contoh:

- seluruh sekolah;
- guru;
- siswa;
- rombel;
- Guardian;
- unit tertentu.

## 24.3 Notification

Notification adalah pemberitahuan kepada pengguna mengenai event atau informasi tertentu.

### Invariant Utama

```text
Announcement
≠
Notification
```

Notification dapat menunjuk ke Announcement, tetapi bukan sumber kebenaran Announcement.

### Aturan Domain

**DM-COMM-001**  
Draft Announcement tidak boleh terlihat sebelum dipublikasikan.

**DM-COMM-002**  
Audience harus dapat ditentukan secara eksplisit.

**DM-COMM-003**  
Notification bukan data domain utama.

**DM-COMM-004**  
Menghapus Notification tidak boleh menghapus Announcement.

---

# 25. Domain File

File merepresentasikan objek penyimpanan yang terkait dengan suatu resource domain.

File memiliki dua dimensi:

```text
Physical Object
+
Domain Metadata
```

### Aturan Domain

**DM-FILE-001**  
Hak akses file harus mengikuti resource induknya.

**DM-FILE-002**  
File privat tidak boleh menjadi publik secara default.

**DM-FILE-003**  
Lokasi fisik file tidak boleh menjadi satu-satunya identitas domain file.

**DM-FILE-004**  
Perubahan storage provider tidak boleh mengubah makna domain file.

---

# 26. Domain Audit

Audit Log merepresentasikan catatan aktivitas penting yang perlu ditelusuri.

Audit Log berbeda dari:

- Notification;
- activity feed;
- application log;
- error log.

### Aturan Domain

**DM-AUDIT-001**  
Audit Log tidak boleh mudah dimodifikasi oleh pengguna biasa.

**DM-AUDIT-002**  
Audit harus memiliki aktor, waktu, konteks sekolah, dan resource yang relevan bila tersedia.

**DM-AUDIT-003**  
Menghapus Notification tidak boleh menghapus Audit Log.

**DM-AUDIT-004**  
Perubahan data bernilai tinggi harus memiliki jejak perubahan yang memadai.

---

# 27. Domain Configuration

Configuration merepresentasikan pengaturan produk atau sekolah.

Configuration bukan data transaksi.

### Aturan Domain

**DM-CONFIG-001**  
Konfigurasi penting hanya dapat diubah pihak berwenang.

**DM-CONFIG-002**  
Perubahan konfigurasi kritis harus dapat ditelusuri.

**DM-CONFIG-003**  
Konfigurasi baru tidak boleh secara diam-diam mengubah histori yang telah sah.

---

# 28. Domain Integration

Integration merepresentasikan hubungan dengan sistem eksternal.

Konsep penting:

- source system;
- target system;
- synchronization;
- ownership;
- status;
- retry;
- failure.

### Aturan Domain

**DM-INTEGRATION-001**  
Setiap integration harus memiliki definisi sumber kebenaran data.

**DM-INTEGRATION-002**  
Kegagalan integration tidak boleh mengubah transaksi domain yang sudah sah menjadi tidak konsisten.

**DM-INTEGRATION-003**  
Retry tidak boleh menghasilkan duplikasi yang tidak sah.

**DM-INTEGRATION-004**  
Integration tetap mengikuti authorization dan school boundary.

---

# 29. Domain AI

AI bukan domain inti Ruang Pintar.

AI merupakan capability pendukung yang dapat memproses data sesuai konteks dan kewenangan.

### Aturan Domain

**DM-AI-001**  
AI tidak boleh memperoleh akses data di luar scope pengguna.

**DM-AI-002**  
Output AI bukan fakta resmi sampai divalidasi ketika digunakan untuk keputusan formal.

**DM-AI-003**  
AI tidak boleh secara otomatis mengambil keputusan akademik atau disipliner berisiko tinggi tanpa human review.

**DM-AI-004**  
Sistem inti harus tetap dapat berfungsi tanpa AI.

---

# 30. Hubungan Domain Utama

## 30.1 Alur Siswa

```text
Student Identity
        ↓
Student Enrollment
        ↓
Rombel Placement
        ↓
Learning Context
        ↓
Actual Class Session
        ├── Attendance
        ├── Material
        ├── Assignment
        ├── CBT
        └── Assessment
                ↓
              Grade
```

## 30.2 Alur Guru

```text
Teacher Profile
        ↓
Teaching Assignment
        ↓
Learning Context
        ├── Schedule
        ├── Session
        ├── Material
        ├── Assignment
        ├── Attendance
        ├── Assessment
        └── CBT
```

## 30.3 Alur Orang Tua / Wali

```text
Guardian Identity
        ↓
Guardian–Student Relationship
        ↓
Student
        ├── Attendance
        ├── Assignment
        ├── Schedule
        ├── Published Grade
        └── Announcement
```

## 30.4 Alur Pimpinan

```text
Position Assignment
        ↓
Authorized Scope
        ↓
Aggregated Domain Data
        ↓
Monitoring / Reporting
```

---

# 31. Invariant Inti Ruang Pintar

Invariant berikut dianggap sangat penting dan tidak boleh dilanggar tanpa perubahan domain resmi.

## INV-001

```text
Student Identity
≠
Student Enrollment
≠
Rombel Placement
```

## INV-002

```text
Teacher
≠
Subject
≠
Teaching Assignment
```

## INV-003

```text
Academic Calendar
≠
Master Schedule
≠
Actual Class Session
```

## INV-004

```text
School Attendance
≠
Class Session Attendance
```

## INV-005

```text
Material
≠
Material Publication
```

## INV-006

```text
Assignment Definition
≠
Assignment Publication
≠
Submission
```

## INV-007

```text
Assessment Definition
≠
Grade
≠
Grade Publication
```

## INV-008

```text
Missing Grade
≠
Zero Grade
```

## INV-009

```text
User Account
≠
Domain Profile
≠
Role / Position / Assignment
```

## INV-010

```text
Announcement
≠
Notification
```

## INV-011

```text
Question Bank
≠
Question Version
≠
Exam Snapshot
≠
Exam Attempt
```

## INV-012

```text
Plan
≠
Actual Event
```

---

# 32. Aturan Historis

**DM-HISTORY-001**  
Data historis yang memiliki nilai akademik, audit, atau operasional tidak boleh dihapus hanya karena kondisi saat ini berubah.

**DM-HISTORY-002**  
Perubahan assignment harus menghasilkan histori baru atau perubahan Effective Period, bukan overwrite buta.

**DM-HISTORY-003**  
Publikasi baru tidak boleh mengubah secara retroaktif fakta publikasi sebelumnya tanpa tindakan koreksi yang eksplisit.

**DM-HISTORY-004**  
Perubahan struktur organisasi atau akademik tidak boleh menghilangkan makna data periode sebelumnya.

---

# 33. Aturan Effective Dating

Konsep berikut pada prinsipnya periodik:

- Student Enrollment;
- Rombel Placement;
- Position Assignment;
- Teaching Assignment;
- Homeroom Assignment;
- Academic Period;
- struktur tertentu jika berubah menurut periode.

### Aturan

**DM-EFFECTIVE-001**  
Konsep periodik harus memiliki cara menentukan kapan mulai berlaku.

**DM-EFFECTIVE-002**  
Jika diperlukan, konsep periodik harus dapat menentukan kapan berhenti berlaku.

**DM-EFFECTIVE-003**  
Dua assignment yang saling bertentangan tidak boleh aktif bersamaan jika domain melarangnya.

**DM-EFFECTIVE-004**  
Tanggal histori tidak boleh disimpulkan hanya dari waktu database record dibuat.

---

# 34. Aturan Status dan Lifecycle

Lifecycle tidak boleh direduksi menjadi satu `is_active` jika status memiliki makna bisnis yang lebih kaya.

Contoh pola:

```text
DRAFT
→ PUBLISHED
→ CLOSED
```

atau:

```text
ACTIVE
→ INACTIVE
→ ARCHIVED
```

atau:

```text
SUBMITTED
→ APPROVED / REJECTED
```

### Aturan Domain

**DM-LIFECYCLE-001**  
Status harus memiliki makna bisnis yang jelas.

**DM-LIFECYCLE-002**  
Transisi status harus mengikuti aturan yang eksplisit.

**DM-LIFECYCLE-003**  
Status historis tidak boleh dimanipulasi hanya untuk mempermudah UI.

---

# 35. Aturan Ownership dan Scope

Ownership tidak selalu berarti pemilik data secara hukum, tetapi siapa atau konteks apa yang mengendalikan resource.

Scope dapat berasal dari:

- School;
- Organization Unit;
- Position;
- Teaching Assignment;
- Homeroom Assignment;
- Guardian Relationship;
- Student Identity;
- resource ownership.

### Aturan Domain

**DM-SCOPE-001**  
Scope harus ditentukan dari hubungan domain yang sah.

**DM-SCOPE-002**  
Nama role saja tidak cukup untuk menentukan seluruh akses.

**DM-SCOPE-003**  
Scope baca dapat berbeda dari scope tulis.

**DM-SCOPE-004**  
Scope historis dapat berbeda dari scope operasional saat ini.

---

# 36. Batas Domain dan Data Architecture

Dokumen ini tidak menentukan:

- nama tabel;
- nama kolom;
- foreign key;
- index;
- jenis primary key;
- ORM model;
- migration;
- database engine;
- partitioning;
- caching;
- denormalization;
- event bus;
- queue;
- API endpoint.

Contoh:

Domain Model menyatakan:

```text
Student Identity
≠
Student Enrollment
```

Tetapi tidak langsung menentukan apakah implementasinya harus:

```text
students
student_enrollments
```

Keputusan tersebut dibuat pada `06-DATA-ARCHITECTURE.md`.

---

# 37. Batas Domain dan Module Map

Domain tidak sama dengan modul.

Satu domain concept dapat digunakan oleh beberapa modul.

Contoh:

```text
Student Identity
```

dapat digunakan oleh:

- Academic;
- Attendance;
- Learning;
- Assessment;
- Guardian;
- Reporting.

Pembagian modul akan ditentukan pada:

```text
03-MODULE-MAP.md
```

---

# 38. Batas Domain dan Role Access

Domain Model tidak menetapkan nama role final.

Domain hanya menentukan sumber kewenangan konseptual.

Contoh:

```text
Teaching Assignment
→ dapat menjadi sumber scope guru

Homeroom Assignment
→ dapat menjadi sumber scope wali kelas

Guardian–Student Relationship
→ dapat menjadi sumber scope orang tua/wali
```

Matriks akses final akan ditentukan pada:

```text
04-ROLE-ACCESS.md
```

---

# 39. Domain Rule Traceability

Setiap aturan domain penting harus dapat ditelusuri ke requirement produk.

Contoh:

```text
PR-STUDENT-001
        ↓
DM-STUDENT-001
        ↓
Data Model
        ↓
Authorization
        ↓
Implementation
        ↓
Test
```

Aturan domain yang tidak memiliki sumber requirement harus ditinjau apakah:

1. merupakan konsekuensi logis dari requirement;
2. merupakan invariant yang dibutuhkan untuk menjaga integritas domain;
3. merupakan scope baru yang harus ditambahkan ke Product Requirements.

---

# 40. Anti-Pattern yang Dilarang

## 40.1 Menyimpan Kelas Aktif Langsung sebagai Identitas Siswa

Contoh buruk:

```text
students
- nama
- kelas
```

tanpa histori Enrollment atau Placement.

## 40.2 Menempelkan Subject Permanen ke Teacher

Contoh buruk:

```text
teachers
- subject_id
```

sebagai satu-satunya model tugas mengajar.

## 40.3 Menganggap Jadwal = Sesi Aktual

Hal ini menyebabkan presensi salah ketika jadwal berubah pada hari pelaksanaan.

## 40.4 Menggunakan Nilai 0 untuk Belum Dinilai

Hal ini merusak arti akademik.

## 40.5 Menggunakan Role sebagai Seluruh Access Model

Contoh buruk:

```text
if role == "teacher":
    access all classes
```

## 40.6 Menggabungkan Konten dengan Publikasi

Mengubah konten reusable tidak boleh selalu mengubah histori publikasi.

## 40.7 Menghapus Histori karena Status Baru

Contoh:

```text
siswa naik kelas
→ kelas lama ditimpa
```

## 40.8 Menganggap Notification sebagai Sumber Data

Notification hanya sinyal, bukan sumber kebenaran.

---

# 41. Definition of Done Domain Model

Domain Model dianggap lengkap apabila:

- konsep utama terdefinisi;
- istilah yang berpotensi ambigu dipisahkan;
- hubungan utama terdokumentasi;
- lifecycle utama terdokumentasi;
- invariant utama ditetapkan;
- konsep historis memiliki aturan;
- sumber scope dan ownership dipahami;
- requirement utama memiliki representasi domain;
- tidak ada keputusan database yang terlalu dini;
- tidak ada module boundary yang dikunci secara tidak sengaja.

---

# 42. Checklist Human Review

Sebelum dokumen ini berstatus `APPROVED / LOCKED`, pastikan:

- [ ] Student Identity, Enrollment, dan Rombel Placement sudah dipisahkan dengan benar;
- [ ] Teacher, Subject, dan Teaching Assignment sudah dipisahkan;
- [ ] Calendar, Master Schedule, dan Actual Class Session sudah dipisahkan;
- [ ] School Attendance dan Class Attendance sudah dipisahkan;
- [ ] Material dan Publication sudah dipisahkan;
- [ ] Assignment, Publication, dan Submission sudah dipisahkan;
- [ ] Assessment, Grade, dan Grade Publication sudah dipisahkan;
- [ ] Missing Grade tidak dianggap nol;
- [ ] User Account tidak dianggap sebagai seluruh identity model;
- [ ] Guardian Relationship menjadi sumber akses;
- [ ] Homeroom Assignment bersifat periodik;
- [ ] CBT memiliki Snapshot dan Attempt yang stabil;
- [ ] histori tidak mudah tertimpa;
- [ ] Effective Period digunakan pada konsep periodik;
- [ ] Domain Model tidak terlalu masuk ke detail database;
- [ ] Domain Model tidak mengunci module boundary terlalu dini.

---

# 43. Status Dokumen

**Status Saat Ini:** FINAL REVIEW  
**Versi:** 1.0-RC

Dokumen ini belum berstatus `APPROVED / LOCKED` sampai human review selesai.

Jika disetujui:

```text
Version: 1.0
Status: APPROVED / LOCKED
```

---

# 44. Dokumen Berikutnya

Setelah `02-DOMAIN-MODEL.md` disetujui dan dikunci, pembahasan dilanjutkan ke:

```text
03-MODULE-MAP.md
```

Dokumen tersebut akan menjawab:

> **Domain dan capability Ruang Pintar akan dikelompokkan menjadi modul apa saja, apa tanggung jawab setiap modul, dan apa dependensi antarmodul?**

Module Map tidak boleh mengubah invariant domain yang telah dikunci tanpa perubahan resmi pada Domain Model.
