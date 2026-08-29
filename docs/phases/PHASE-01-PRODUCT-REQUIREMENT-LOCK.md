# PHASE 01 — PRODUCT & REQUIREMENT LOCK
## Ruang Pintar — Canonical Specification & Requirement Consolidation

**Versi:** 1.0  
**Status:** APPROVED  
**Active Phase:** PHASE 01  
**Dokumen Induk:**
- `docs/BRD.md`
- `docs/PRD.md`
- `docs/FRD.md`
- `docs/00-PROJECT-BRIEF.md`
- `docs/01-PRODUCT-REQUIREMENTS.md`
- `docs/02-DOMAIN-MODEL.md`
- `docs/03-MODULE-MAP.md`
- `docs/04-ROLE-ACCESS.md`
- `docs/05-SYSTEM-ARCHITECTURE.md`
- `docs/06-DATA-ARCHITECTURE.md`
- `docs/07-UI-UX-DESIGN-SYSTEM.md`
- `docs/08-IMPLEMENTATION-ROADMAP.md`
- `docs/09-AI-CODING-RULES.md`

---

# 1. Tujuan & Ruang Lingkup Phase 01

Phase 01 bertujuan untuk **mengunci seluruh definisi produk, personas/aktor, model otorisasi, lingkup modul M01–M21, aturan bisnis domain, keputusan penjadwalan, requirement fungsional, dan matriks ketertelusuran (traceability)** sebelum fase implementasi teknis berikutnya dimulai.

### Batasan Keras Phase 01:
- **TIDAK ADA implementasi kode aplikasi** (tanpa UI screen, komponen React, auth engine, API route, DB migration/Prisma schema, atau seeder).
- Seluruh fokus berada pada **konsolidasi, sinkronisasi, validasi silang, dan penguncian requirement kanonikal**.

---

# 2. Product Definition

### 2.1 Statement & Positioning
Ruang Pintar adalah **School Digital Operating Platform** modular yang menyatukan proses akademik, pembelajaran, administrasi, komunikasi, monitoring, dan layanan sekolah dalam satu ekosistem digital terintegrasi.
Bukan sekadar LMS, bukan sekadar SIS/SIAKAD, bukan sekadar aplikasi presensi/CBT, dan bukan portal informasi statis.

### 2.2 Masalah yang Diselesaikan
1. **Fragmentasi Sistem:** Menghilangkan ketergantungan pada puluhan aplikasi/spreadsheet terpisah.
2. **Data yang Terpisah & Inkonsisten:** Menyediakan Single Source of Truth untuk data siswa, guru, kelas, jadwal, presensi, pembelajaran, dan nilai.
3. **Pekerjaan Administratif Berulang:** Mengurangi input manual berulang oleh guru dan tenaga kependidikan.
4. **Monitoring yang Sulit:** Memberikan data operasional real-time sesuai wewenang pimpinan dan wali kelas.
5. **Keterbatasan Akses Orang Tua & Siswa:** Menyediakan pusat informasi akademik resmi yang transparan dan terverifikasi.

### 2.3 Kesiapan Multi-Jenjang (Multi-level Readiness)
Sistem dirancang fleksibel lintas jenjang (SD, SMP, SMA, SMK) dengan struktur akademik umum:
- Tahun Ajaran & Semester;
- Fase & Tingkat Kelas (Grade Level);
- Program Keahlian/Jurusan (bersifat opsional untuk SD/SMP/SMA umum);
- Rombongan Belajar (Rombel).

### 2.4 Model Deployment
- **Single-school-per-deployment:** 1 Deployment = 1 Sekolah = 1 Database SQLite persisten.
- Bukan shared-schema multi-tenant SaaS pada baseline V1.

---

# 3. Personas & Actors

Ruang Pintar memisahkan secara ketat antara **Base Role** (klasifikasi akses identitas) dan **Position/Assignment** (jabatan/penugasan periodik).

```text
IDENTITY
   ↓
BASE ROLE (5 Role Resmi)
   ↓
POSITION / ASSIGNMENT / RELATIONSHIP
   ↓
PERMISSION
   ↓
RESOURCE SCOPE
   ↓
EFFECTIVE ACCESS
```

### 3.1 Lima Base Role Resmi
1. **`SUPER_ADMIN`**: Administrator sistem level platform; bootstrap sekolah dan konfigurasi global.
2. **`SCHOOL_STAFF`**: Tenaga kependidikan/operator sekolah; kewenangan diatur via capability bundle.
3. **`TEACHER`**: Pendidik/guru; kewenangan operasional berbasis Teaching Assignment aktif.
4. **`STUDENT`**: Peserta didik; hak akses self-scope (data pribadi dan rombel aktifnya).
5. **`GUARDIAN`**: Orang tua/wali murid terverifikasi; hak akses sebatas anak kandung/asuh yang memiliki relasi sah.

### 3.2 Position (Jabatan Organisasi)
*Bukan Base Role baru*, melainkan jabatan yang diemban seorang pengguna via `Position Assignment`:
- **`HEADMASTER`** (Kepala Sekolah): Monitoring menyeluruh tingkat sekolah (school-wide view), approval kebijakan.
- **`VICE_PRINCIPAL_CURRICULUM`** (Wakasek Kurikulum): Pengelolaan kurikulum, master schedule, pemetaan penugasan mengajar guru, dan kalender akademik.
- **`VICE_PRINCIPAL_STUDENT_AFFAIRS`** (Wakasek Kesiswaan): Monitoring kedisiplinan, kesiswaan, presensi sekolah, dan kegiatan siswa.
- **`PROGRAM_HEAD`** (Kepala Program/Jurusan): Pengawasan akademik dalam lingkup program/keahlian tertentu.

### 3.3 Assignments (Penugasan Periodik)
- **`TEACHING_ASSIGNMENT`**: Menghubungkan Guru + Mata Pelajaran + Rombel + Periode Akademik. (Sumber hak kelola materi, presensi kelas, dan penilaian TP).
- **`HOMEROOM_ASSIGNMENT`**: Menghubungkan Guru + Rombel sebagai Wali Kelas. (Sumber hak monitoring rombel, catatan wali kelas).
- **`POSITION_ASSIGNMENT`**: Menghubungkan Personel + Jabatan Organisasi + Periode Aktif.

### 3.4 Staff Capability Bundles
- **`SYSTEM_ADMIN`**: Konfigurasi platform sekolah, manajemen akun, audit log.
- **`ACADEMIC_OPERATOR`**: Manajemen tahun ajaran, rombel, mapel, plotting data akademik.
- **`STUDENT_DATA_OPERATOR`**: Pengelolaan data induk siswa, mutasi, enrollment.
- **`REPORT_OPERATOR`**: Pengecekan rekapitulasi laporan dan ekspor data resmi.

---

# 4. Role & Access Matrix

Prinsip: **Least Privilege** dan **Default Deny** (server-side authoritative check).

| Capability / Resource | SUPER_ADMIN | SCHOOL_STAFF (Operator) | TEACHER (Guru Mapel) | TEACHER (Wali Kelas) | HEADMASTER / WAKASEK | STUDENT (Siswa) | GUARDIAN (Wali) |
|---|---|---|---|---|---|---|---|
| **School & Org Config** | Full Manage | View / Edit Profile (Admin) | View | View | View / Limited Edit | View Public Profile | View Public Profile |
| **User Account & Roles** | Full Manage | Manage (Admin Bundle) | Self Account Only | Self Account Only | View Summary | Self Account Only | Self Account Only |
| **Academic Period & Rombel** | Full Manage | Manage (Academic Op) | View Active | View Assigned Rombel | View All / Approve | View Own Enrollment | View Child Enrollment |
| **Teaching Assignment** | Full Manage | Manage (Academic Op) | View Own Assignment | View Own Assignment | View All / Assign | None | None |
| **Schedule (Master)** | Manage | Manage / Edit (Kurikulum) | View Schedule | View Rombel Schedule | View All / Publish | View Own Schedule | View Child Schedule |
| **Class Session & Attendance** | Audit View | Record (Backup Op) | Manage (Own Session) | View Rombel Attendance | View / Monitor All | View Own Attendance | View Child Attendance |
| **Learning Material & Tugas** | Audit View | None | Manage (Own Subject) | View Rombel Progress | View (Supervisi) | View & Submit (Own Class) | View (Child Class) |
| **Assessment & Nilai TP** | Audit View | None | Full Manage (Own Subject)| View Rombel Summary | View / Monitor All | View Published Only | View Published Only |
| **CBT (Exam Engine)** | Manage Engine| Manage Exam Window | Manage Bank/Attempt | View Rombel Status | View All Results | Take Exam (Scheduled) | View Child Result |
| **Student Monitoring** | Audit View | Student Operator | Input Note (Own Subject)| Manage Rombel Notes | Full School Monitor | View Own Feedback | View Child Notes |
| **Communication / Announce** | Global Announce| School Announce | Class Announce | Rombel Announce | School-wide Announce | View Targeted | View Targeted |

---

# 5. Inventory & Scope Modul (M01–M21)

| Kode | Nama Modul | Klasifikasi | Tanggung Jawab Utama | Scope V1 | Non-Scope / Future |
|---|---|---|---|---|---|
| **M01** | School & Organization | Foundation | Identitas sekolah, unit organisasi, jabatan | Profil sekolah, struktur jabatan, assignment jabatan | SPMB, multi-campus hierarki |
| **M02** | Identity & Access | Foundation | Autentikasi, akun pengguna, otorisasi server-side | Username auth, RBAC scoped, password policy | SSO SAML, OAuth eksternal |
| **M03** | Platform Configuration | Foundation | Parameter sistem, timezone, preferensi sekolah | Konfigurasi dasar, format penomoran, localization | Multi-currency, custom billing |
| **M04** | File & Document | Foundation | Metadata dan penyimpanan file privat | Local storage abstraction, file access authorization | Direct public CDN, cloud transcoding |
| **M05** | Audit & Traceability | Foundation | Pencatatan riwayat perubahan dan jejak audit | Append-only audit log, resource mutation tracking | Complex SIEM export |
| **M06** | Academic Period & Structure | Core Academic | Tahun ajaran, semester, fase, tingkat, rombel | Struktur akademik fleksibel (SD-SMK), rombel | Otomasi kurikulum internasional |
| **M07** | Student Academic Lifecycle | Core Academic | Identitas siswa, keikutsertaan akademik, penempatan | Student identity, enrollment per periode, mutasi | Tracer alumni, PPDB online |
| **M08** | Teacher & Teaching Assignment | Core Academic | Profil guru, mapel, pembagian tugas mengajar | Teaching assignment, homeroom assignment, workload | Payroll, sertifikasi guru |
| **M09** | Academic Calendar | Core Academic | Kalender akademik, hari efektif, libur, event | Hari efektif, event sekolah, schedule exception | Sinkronisasi 2-arah Google Calendar |
| **M10** | Scheduling & Class Session | Core Academic | Jadwal master, deteksi konflik, sesi kelas aktual | Manual scheduling + intelligent conflict detection | Automatic timetable AI generator |
| **M11** | Learning | Operational | Materi, bab, tujuan pembelajaran (TP), tugas | Materi, tugas, deadline, submission, feedback | Scorm player, video streaming |
| **M12** | Attendance | Operational | Presensi sekolah dan presensi sesi pertemuan | Presensi sesi kelas guru, status H/I/S/A, rekap | Face biometric device engine |
| **M13** | Assessment & Gradebook | Operational | Penilaian formatif/sumatif berbasis TP, gradebook | Penilaian TP, bobot, draft/publish, gradebook | Automatic AI grading essay |
| **M14** | CBT | Operational | Ujian komputer, bank soal, snapshot, attempt | Bank soal, versi soal, snapshot ujian, timer server | Lockdown browser OS native |
| **M15** | Guardian & Family | Operational | Relasi orang tua-siswa, portal wali terverifikasi | Hubungan wali-siswa terverifikasi, multi-child | Chat privat guru-ortu |
| **M16** | Communication | Operational | Pengumuman bertarget (sekolah, rombel, peran) | Pengumuman broadcast terstruktur, filter audiens | Group chat realtime messaging |
| **M17** | Notification | Operational | Notifikasi in-app untuk event penting sistem | In-app notification bell, read/unread status | SMS gateway berbayar |
| **M18** | Student Monitoring | Operational | Monitoring perkembangan siswa, catatan perilaku | Catatan perhatian wali kelas, indikator akademik | AI predictive student dropout |
| **M19** | Reporting & Analytics | Operational | Laporan akademik, rekap presensi, rekap nilai | Ekspor rekap nilai, rapor TP, ringkasan pimpinan | BI dashboard builder dinamis |
| **M20** | Integration | Extension | Adapter layanan eksternal (Storage, Email, WA) | Interface adapter terisolasi, mock providers | Direct hardcoded third-party lock |
| **M21** | AI Assistance | Extension | Bantuan pembuatan soal, draf materi, ringkasan | Scoped server-side draft assistance | Autonomous AI decision maker |

---

# 6. Aturan Bisnis & Domain Invariant

### 6.1 Invariant Kunci
1. `Student Identity` ≠ `Student Enrollment` ≠ `Rombel Placement` (Identitas siswa tidak boleh ditimpa oleh kenaikan kelas).
2. `Teacher` ≠ `Subject` ≠ `Teaching Assignment` (Guru tidak melekat permanen pada satu mapel/kelas).
3. `Academic Calendar` ≠ `Master Schedule` ≠ `Actual Class Session` (Kalender bukan jadwal, jadwal rencana bukan sesi aktual).
4. `School Attendance` ≠ `Class Session Attendance` (Kehadiran harian di gerbang tidak sama dengan presensi di tiap jam pelajaran).
5. `Material Definition` ≠ `Material Publication` & `Assignment Definition` ≠ `Assignment Publication` ≠ `Submission`.
6. `Assessment Definition` ≠ `Grade` ≠ `Grade Publication` (Nilai draft tidak boleh terlihat siswa sebelum dipublikasikan).
7. `Missing Grade` ≠ `Zero Grade` (Nilai yang belum dimasukkan bukan bernilai 0).
8. `Announcement` ≠ `Notification` (Pengumuman adalah konten publikasi bertarget; notifikasi adalah sinyal event).
9. `Question Bank` ≠ `Question Version` ≠ `Exam Snapshot` ≠ `Exam Attempt` (Perubahan soal di bank tidak merusak ujian yang sedang berlangsung).

---

# 7. Keputusan Khusus Penjadwalan (Scheduling Decision)

Sesuai arahan produk V1:
- **Metode Penjadwalan:** Menggunakan **Manual Scheduling + Intelligent Conflict Detection**.
- **Deteksi Konflik Otomatis:**
  1. *Guru Bentrok*: Guru mengajar di >1 rombel pada slot waktu yang sama.
  2. *Rombel Bentrok*: Rombel memiliki >1 jadwal pada slot waktu yang sama.
  3. *Ruang Bentrok*: Ruangan dipakai >1 rombel pada slot waktu yang sama.
  4. *Slot Waktu Bentrok*: Overlapping waktu pelajaran.
- **Non-Scope V1:** **Automatic Timetable Generator** (algoritma optimasi otomatis jadwal) tidak dimasukkan ke dalam core V1.

---

# 8. Matriks Ketertelusuran (Traceability Matrix)

| Business Goal (BRD) | Product Requirement (PRD) | Functional Requirement (FRD) | Acceptance Criteria (AC) |
|---|---|---|---|
| **BR-BIZ-001** (Integrasi Sekolah) | **PR-CORE-001** (Satu platform modular) | **FR-SCH-001**, **FR-ACA-001** | **AC-CORE-001**: Data akademik dan organisasi terintegrasi dalam 1 database sekolah. |
| **BR-BIZ-002** (Kejelasan Wewenang) | **PR-ACCESS-002** (Effective Access Model) | **FR-AUTHZ-001** s/d **007** | **AC-AUTHZ-001**: Akses selalu diverifikasi server-side berdasarkan role, assignment, dan scope. |
| **BR-BIZ-004** (Operasional Guru) | **PR-TEACHER-005** (Teacher Workspace) | **FR-TDB-001**, **FR-TWS-001** | **AC-TCH-001**: Guru dapat mengakses kelas berdasarkan Teaching Assignment aktif. |
| **BR-BIZ-004** (Penjadwalan & Konflik) | **PR-SCHEDULE-004** (Deteksi Konflik) | **FR-SCHD-001**, **FR-SCHD-006** | **AC-SCHD-001**: Sistem menolak/memberi peringatan saat jadwal guru/rombel bentrok. |
| **BR-BIZ-004** (Presensi Kelas) | **PR-ATTENDANCE-002** (Sesi Aktual) | **FR-ATT-001** s/d **007** | **AC-ATT-001**: Guru dapat mengisi presensi kelas pada sesi yang valid dan tersimpan di audit log. |
| **BR-BIZ-004** (Penilaian & TP) | **PR-ASSESSMENT-001** (TP-based Gradebook) | **FR-ASM-001** s/d **008**, **FR-GRD-001** | **AC-ASM-001**: Nilai dikaitkan dengan TP; nilai draft tidak terlihat oleh siswa. |
| **BR-BIZ-005** (Monitoring Siswa) | **PR-MONITORING-001** (Wali Kelas) | **FR-HRM-001** s/d **005** | **AC-MON-001**: Wali kelas dapat melihat ringkasan presensi dan capaian akademik rombelnya. |
| **BR-BIZ-006** (Transparansi Ortu) | **PR-GUARDIAN-001** (Verified Relation) | **FR-GUA-001** s/d **005** | **AC-GUA-001**: Orang tua hanya dapat melihat data anak yang terhubung sah dengannya. |
| **BR-BIZ-007** (Auditability) | **PR-AUDIT-001** (Jejak Rekam) | **FR-AUD-001** s/d **004** | **AC-AUD-001**: Setiap mutasi nilai, presensi, dan assignment mencatat aktor dan timestamp. |

---

# 9. Acceptance Criteria Terverifikasi (Sample Kritis)

- **`AC-AUTH-001`**: Login berhasil dengan username dan password yang benar; akun inactive ditolak dengan pesan yang tepat; rate limiting memblokir brute force setelah threshold gagal.
- **`AC-SCHD-001`**: Ketika admin/kurikulum menjadwalkan Guru A pada Hari Senin Jam 07.00 di Kelas X-A, sistem memunculkan indikator bentrok jika Guru A juga dijadwalkan di Kelas X-B pada jam yang sama.
- **`AC-ATT-001`**: Pada sesi kelas yang sedang berlangsung, guru dapat menandai siswa sebagai Hadir, Sakit, Izin, atau Alpha. Jumlah total siswa sesuai dengan penempatan rombel aktif.
- **`AC-ASM-001`**: Guru memasukkan nilai TP 1 untuk 30 siswa. Nilai berstatus DRAFT tidak dapat dilihat di portal siswa. Setelah guru menekan "Publish", nilai langsung terlihat di akun siswa terkait.
- **`AC-CBT-001`**: Siswa memulai ujian; timer server menghitung mundur secara authoritative; autosave menyimpan jawaban tiap perpindahan butir soal; siswa tidak dapat membuka attempt kedua secara paralel.

---

# 10. Explicit Non-Scope V1

Fitur berikut **TIDAK TERMASUK** dalam scope Ruang Pintar V1:
1. Automatic AI Timetable Generator.
2. SPMB / PPDB online pendaftaran mandiri publik.
3. Modul Finance, SPP, Payroll, dan Payment Gateway.
4. Modul Perpustakaan (Library) dan Inventaris/Sarpras.
5. Modul BKK, Bursa Kerja Khusus, dan Alumni Tracer.
6. Public Registration (akun dibuat oleh admin/sekolah).
7. Native Mobile Application (Android/iOS APK) — Web Responsive PWA-ready adalah baseline.
8. Realtime Video Conference internal (menggunakan link eksternal jika dibutuhkan).
9. Autonomous AI Decision Engine (AI tanpa kendali guru/admin).

---

# 11. Audit Konflik Dokumentasi

| Dokumen | Isu Potensial | Keputusan / Resolusi | Status |
|---|---|---|---|
| **Role Definition** | Wakasek Kurikulum / Kepala Sekolah berpotensi tertulis sebagai Base Role | Dipastikan bahwa mereka adalah **Position Assignment**, bukan base role terpisah. Base role tetap 5. | TERKUNCI |
| **Scheduling Model** | Potensi asumsi adanya auto timetable generator | Dipastikan V1 menggunakan **Manual Scheduling + Conflict Detection**. Generator otomatis = future. | TERKUNCI |
| **Academic Scope** | Potensi bias kurikulum SMK saja | Dipastikan mendukung SD, SMP, SMA, dan SMK secara modular. | TERKUNCI |
| **Identifier Strategy**| Penggunaan integer auto-increment vs ULID | Dipastikan first-party ID menggunakan **String ULID 26 karakter**. | TERKUNCI |

---

# 12. Validasi & Quality Gate

Seluruh dokumen requirement telah diverifikasi silang dengan:
- `npm run typecheck` : PASS
- `npm run lint`      : PASS
- `npm run format:check`: PASS
- `npm run test`      : PASS
- `npm run build`     : PASS

---

# 13. Kesimpulan & Status Akhir

Phase 01 telah menyelesaikan seluruh penguncian produk, personas, batasan akses, inventaris modul, aturan bisnis, dan traceability matrix secara komprehensif tanpa modifikasi kode aplikasi.

**Status:** `APPROVED`
