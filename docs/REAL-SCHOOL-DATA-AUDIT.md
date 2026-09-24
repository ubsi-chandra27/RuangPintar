# REAL SCHOOL DATA AUDIT — SMK OTOMINDO
## STAGE 10.7: Audit Kesiapan Struktur Data Akademik Riil

| Parameter | Nilai Faktual |
| --- | --- |
| **Sekolah Target** | SMK OTOMINDO |
| **ID Sekolah** | `01M2XXYD227F9S3H985FH53GMF` |
| **Tanggal Audit** | 24 September 2026 |
| **Kondisi Basis Data** | Development Database Bersih (`prisma/data/ruang-pintar.db`) |
| **Metode Audit** | Inspeksi Read-Only Skema Prisma & Query Basis Data Aktual |

---

## 1. Audit Master Data Eksisting SMK OTOMINDO

Berdasarkan query langsung ke basis data aktif, berikut adalah inventarisasi detail dari seluruh master data yang saat ini dimiliki SMK OTOMINDO:

### 1.1. Profil Sekolah
```json
{
  "id": "01M2XXYD227F9S3H985FH53GMF",
  "nama": "SMK OTOMINDO",
  "npsn": null,
  "jenjang": "SMA",
  "alamat": "Indonesia",
  "telepon": null,
  "email": "eri.chandra27@gmail.com",
  "zona_waktu": "Asia/Jakarta",
  "logo_url": null,
  "tipe_lisensi": "FREEMIUM",
  "trial_berakhir_pada": "2026-10-19T22:52:42.574Z",
  "status_aktif": true
}
```
*Catatan Temuan:* 
- Jenjang saat ini tertulis `"SMA"`, padahal entitas sekolah adalah Sekolah Menengah Kejuruan (`"SMK"`).
- Atribut identitas resmi seperti NPSN, nomor telepon, logo, dan alamat detail sekolah belum terisi.

### 1.2. Tahun Ajaran Aktif
- **ID:** `01M2XXYD2CYPCWZ0RM9TAN6BW0`
- **Nama:** `2026/2027`
- **Kode:** `TA-2026-2027`
- **Periode:** `01 Juli 2026` s/d `30 Juni 2027`
- **Status:** `AKTIF`

### 1.3. Semester Aktif
- **ID:** `01M2XXYD2F5JRXRTR4ECMRNG4J`
- **Tahun Ajaran:** `2026/2027`
- **Nama:** `Semester Ganjil`
- **Kode:** `GANJIL`
- **Urutan:** `1`
- **Periode:** `01 Juli 2026` s/d `31 Desember 2026`
- **Status:** `AKTIF`

### 1.4. Daftar Guru & Akun Pengguna
Hanya terdapat 1 orang guru terdaftar:
- **Nama Lengkap:** `Eri Chandra A, S.Kom`
- **Guru ID:** `01M2XXYD299G35BZDH2NKFCM3P`
- **Pengguna ID:** `01M2XXYD26H385F6RAW5PB6FBK`
- **Username:** `guru_chandra`
- **Email:** `eri.chandra27@gmail.com`
- **Peran Dasar:** `TEACHER`
- **Status Kepegawaian:** `TETAP`
- **Status Akun & Lifecycle:** `AKTIF`
- **Status Owner Tenant:** `is_owner: true` pada `keanggotaan_sekolah`
- **NIP / NUPTK:** `null`

### 1.5. Daftar Mata Pelajaran
Hanya terdapat 1 mata pelajaran terdaftar:
- **ID:** `01M2YJMPFDTHGDWXJZY0XY0B67`
- **Kode:** `KODING`
- **Nama Mata Pelajaran:** `Koding & Kecerdasan Artifisial`
- **Kelompok:** `UMUM`
- **Status:** `AKTIF`

### 1.6. Struktur Kurikulum, Tingkat, & Fase
- **Tingkat Kelas:** `Tingkat 10` (ID: `01M2YJMPSPH9XPA1ACW3S3FBNE`, Kode: `10`, Urutan: 10)
- **Fase Kurikulum:** `Fase E` (ID: `01M2YJMPQ45AHE6K3TPT9RTMTT`, Kode: `FASE_E`, Urutan: 1)
- **Kesesuaian Kurikulum:** Sesuai standar Kurikulum Merdeka Kemdikbudristek untuk jenjang SMK kelas X.

### 1.7. Program Keahlian & Konsentrasi Keahlian
- **Program Keahlian:** `[]` (**KOSONG** / 0 record di tabel `program_keahlian`).
- **Konsentrasi Keahlian:** Belum terdefinisi.
- *Catatan:* Nama rombel saat ini adalah `X TO 3`, yang mengindikasikan program keahlian *Teknik Otomotif* (TO). Namun entitas program keahlian belum dibuat di database.

### 1.8. Daftar Rombongan Belajar (Rombel)
Hanya terdapat 1 rombongan belajar:
- **ID:** `01M2YJMPE7D0XPTCTFQ2W8D8NJ`
- **Nama Rombel:** `X TO 3`
- **Kapasitas:** 43 Siswa
- **Tahun Ajaran:** `2026/2027`
- **Tingkat Kelas:** `Tingkat 10` (Fase E)
- **Status:** `AKTIF`
- **Penugasan Wali Kelas:** `[]` (**KOSONG** / Belum ada guru yang ditugaskan sebagai wali kelas).

### 1.9. Penugasan Mengajar (Teaching Assignment)
Terdapat 1 penugasan mengajar aktif:
- **ID Penugasan:** `01M2YJMPXZ4BSRYTX6Z7P90BKG`
- **Guru Pengampu:** `Eri Chandra A, S.Kom`
- **Mata Pelajaran:** `Koding & Kecerdasan Artifisial` (`KODING`)
- **Rombel:** `X TO 3`
- **Tahun Ajaran / Semester:** `2026/2027` / `Semester Ganjil`
- **Beban Mengajar:** `3 Jam / Minggu`
- **Status:** `AKTIF`

### 1.10. Jadwal Pelajaran, Slot Waktu, & Kalender Akademik
- **Jadwal Pelajaran (`jadwal_pelajaran`):** `0` record (**KOSONG** — Belum ada alokasi hari, jam mulai, dan jam selesai untuk KBM).
- **Versi Jadwal (`versi_jadwal`):** `0` record (**KOSONG**).
- **Slot Waktu (`slot_waktu`):** `0` record (**KOSONG** — Belum ada master jam pelajaran, misal Jam 1: 07.00 - 07.45).
- **Kalender Akademik (`kalender_akademik`):** `0` record (**KOSONG** — Belum ada agenda kegiatan semester, PTS, PAS, atau hari libur).

### 1.11. Daftar Lengkap 38 Siswa Riil
Seluruh 38 siswa telah terdaftar pada tabel `siswa`, memiliki data `keikutsertaan_siswa` pada Tahun Ajaran 2026/2027, serta penempatan aktif di rombel `X TO 3` beserta nomor absen:

| No | NIS | NISN | Nama Lengkap Siswa | JK | Status | Rombel | No. Absen | Akun Login | Wali |
| :-: | :-: | :-: | :--- | :-: | :-: | :-: | :-: | :-: | :-: |
| 1 | 1001 | - | Ahmad Fatoni | L | AKTIF | X TO 3 | 1 | Belum Ada | Belum Ada |
| 2 | 1002 | - | Alif Adhitya Dirgantara | L | AKTIF | X TO 3 | 2 | Belum Ada | Belum Ada |
| 3 | 1003 | - | Andika Rizky Ramadhan | L | AKTIF | X TO 3 | 3 | Belum Ada | Belum Ada |
| 4 | 1004 | - | Ayzicho Aulia Supriyanto | L | AKTIF | X TO 3 | 4 | Belum Ada | Belum Ada |
| 5 | 1005 | - | Bayu Adji Setiawan | L | AKTIF | X TO 3 | 5 | Belum Ada | Belum Ada |
| 6 | 1006 | - | David Rama Dhani | L | AKTIF | X TO 3 | 6 | Belum Ada | Belum Ada |
| 7 | 1007 | - | Dzakky Dwi Putra | L | AKTIF | X TO 3 | 7 | Belum Ada | Belum Ada |
| 8 | 1008 | - | Fachry Azka Fauzan | L | AKTIF | X TO 3 | 8 | Belum Ada | Belum Ada |
| 9 | 1009 | - | Farel Ardiyansyah | L | AKTIF | X TO 3 | 9 | Belum Ada | Belum Ada |
| 10 | 1010 | - | Faris Rafka Alkahfi | L | AKTIF | X TO 3 | 10 | Belum Ada | Belum Ada |
| 11 | 1011 | - | Fathir Faturrahman | L | AKTIF | X TO 3 | 11 | Belum Ada | Belum Ada |
| 12 | 1012 | - | Galih Linggar Ramadhan | L | AKTIF | X TO 3 | 12 | Belum Ada | Belum Ada |
| 13 | 1013 | - | Galuh Sadewo | L | AKTIF | X TO 3 | 13 | Belum Ada | Belum Ada |
| 14 | 1014 | - | Herdy Zuan Key | L | AKTIF | X TO 3 | 14 | Belum Ada | Belum Ada |
| 15 | 1015 | - | Ibrahim | L | AKTIF | X TO 3 | 15 | Belum Ada | Belum Ada |
| 16 | 1016 | - | M Firza Tulloh | L | AKTIF | X TO 3 | 16 | Belum Ada | Belum Ada |
| 17 | 1017 | - | Maritza Hamizan Mahkrus | L | AKTIF | X TO 3 | 17 | Belum Ada | Belum Ada |
| 18 | 1018 | - | Maulana Ibrahim | L | AKTIF | X TO 3 | 18 | Belum Ada | Belum Ada |
| 19 | 1019 | - | Maulana Malik Ibrahim | L | AKTIF | X TO 3 | 19 | Belum Ada | Belum Ada |
| 20 | 1020 | - | Mohamad Alfazani | L | AKTIF | X TO 3 | 20 | Belum Ada | Belum Ada |
| 21 | 1021 | - | Muhammad Arsya Wijaya | L | AKTIF | X TO 3 | 21 | Belum Ada | Belum Ada |
| 22 | 1022 | - | Muhammad Alfa Rizky Aditya | L | AKTIF | X TO 3 | 22 | Belum Ada | Belum Ada |
| 23 | 1023 | - | Muhammad Dimas Pranoto | L | AKTIF | X TO 3 | 23 | Belum Ada | Belum Ada |
| 24 | 1024 | - | Muhammad Fahri Amruhu Fathur | L | AKTIF | X TO 3 | 24 | Belum Ada | Belum Ada |
| 25 | 1025 | - | Muhammad Kahfi Fadlyansyah | L | AKTIF | X TO 3 | 25 | Belum Ada | Belum Ada |
| 26 | 1026 | - | Muhammad Rafa Al Farizi | L | AKTIF | X TO 3 | 26 | Belum Ada | Belum Ada |
| 27 | 1027 | - | Muhammad Razka Aryadi | L | AKTIF | X TO 3 | 27 | Belum Ada | Belum Ada |
| 28 | 1028 | - | Muhammad Safaat | L | AKTIF | X TO 3 | 28 | Belum Ada | Belum Ada |
| 29 | 1029 | - | Naufal Halil Pradipta | L | AKTIF | X TO 3 | 29 | Belum Ada | Belum Ada |
| 30 | 1030 | - | Putra Ramadhan | L | AKTIF | X TO 3 | 30 | Belum Ada | Belum Ada |
| 31 | 1031 | - | Raffi Aldiansyah | L | AKTIF | X TO 3 | 31 | Belum Ada | Belum Ada |
| 32 | 1032 | - | Ridho Pratama | L | AKTIF | X TO 3 | 32 | Belum Ada | Belum Ada |
| 33 | 1033 | - | Rizky Jaka jaladara | L | AKTIF | X TO 3 | 33 | Belum Ada | Belum Ada |
| 34 | 1034 | - | Satrio Wicaksono | L | AKTIF | X TO 3 | 34 | Belum Ada | Belum Ada |
| 35 | 1035 | - | Tedy Maulana | L | AKTIF | X TO 3 | 35 | Belum Ada | Belum Ada |
| 36 | 1036 | - | Yoghi Fauzan Azima | L | AKTIF | X TO 3 | 36 | Belum Ada | Belum Ada |
| 37 | 1037 | - | Yudha Rhafa Hidayat | L | AKTIF | X TO 3 | 37 | Belum Ada | Belum Ada |
| 38 | 1038 | - | Zulkifli Amin | L | AKTIF | X TO 3 | 38 | Belum Ada | Belum Ada |

---

## 2. Pengelompokan Kesiapan Data

### A. Data Sudah Ada (Baseline Fondasi)
1. **Identitas Tenant Sekolah:** SMK OTOMINDO (`01M2XXYD227F9S3H985FH53GMF`).
2. **Akademik Aktif:** Tahun Ajaran 2026/2027 dan Semester Ganjil.
3. **Struktur Kelas:** Tingkat 10 dan Fase E.
4. **Guru Inti:** 1 Akun Guru Aktif (`Eri Chandra A, S.Kom` / `guru_chandra`).
5. **Mata Pelajaran:** `Koding & Kecerdasan Artifisial` (`KODING`).
6. **Rombel:** Kelas `X TO 3`.
7. **Penugasan Mengajar:** Pak Eri Chandra mengajar Koding di X TO 3 (3 JP/minggu).
8. **Data Siswa:** 38 Siswa riil lengkap dengan NIS, status aktif, nomor absen, dan penempatan rombel.
9. **Super Administrator:** Akun platform `superadmin`.

### B. Data Wajib Dibuat (Prasyarat Operasional Minimum)
1. **Master Slot Waktu Sekolah (`slot_waktu`):**
   Definisi jam ke-1 hingga jam ke-8/10 pada hari belajar aktif sekolah (Senin - Jumat) beserta alokasi waktu istirahat.
2. **Jadwal Pelajaran Riil (`jadwal_pelajaran` & `versi_jadwal`):**
   Penetapan hari belajar (contoh: Senin jam 07.30 - 10.00 / Jam 1-3) untuk mata pelajaran KKA di rombel X TO 3.
3. **Penugasan Wali Kelas (`penugasan_wali_kelas`):**
   Penetapan wali kelas untuk Rombel X TO 3 (dapat ditugaskan ke Pak Eri Chandra atau guru lain) agar modul wali kelas dan rapor memiliki otoritas pengesahan.
4. **Program Keahlian SMK (`program_keahlian`):**
   Entitas *"Teknik Otomotif"* (Kode: `TO`) dan kaitkan foreign key `program_id` pada rombel `X TO 3`.
5. **Koreksi Profil Sekolah:**
   Pengubahan jenjang dari `"SMA"` menjadi `"SMK"`, penambahan NPSN resmi, dan alamat lengkap sekolah.
6. **Lingkup Materi & Tujuan Pembelajaran (`lingkup_materi`, `tujuan_pembelajaran`):**
   Struktur materi minimal untuk mata pelajaran KKA Fase E (misal: Logika Algoritma, Python Dasar, Konsep AI).

### C. Data Opsional (Pengayaan Fitur & Integrasi Lengkap)
1. **Kalender Akademik Sekolah (`kalender_akademik`):**
   Jadwal awal masuk semester, masa asesmen tengah/akhir semester, dan hari libur sekolah.
2. **Akun Login Siswa (`pengguna` dengan role `STUDENT`):**
   Pembuatan akun pengguna terikat pada `siswa.pengguna_id` untuk 38 siswa agar siswa dapat login mandiri mengerjakan CBT dan mengirim tugas.
3. **Detail Administrasi Siswa:**
   NISN 10 digit, NIK, tanggal lahir, dan alamat domisili untuk pelaporan data pokok.
4. **Data Profil Wali Murid (`wali_murid` & `hubungan_wali_siswa`):**
   Identitas orang tua/wali untuk menghubungkan siswa dengan portal monitoring Guardian.
5. **Guru Pengajar Tambahan & Mapel Lain:**
   Guru tambahan (misal: Matematika, Bahasa Indonesia, Kejuruan Otomotif) untuk mendemonstrasikan kompleksitas jadwal dan lintas penugasan.

### D. Data Tidak Dibutuhkan Saat Ini
1. Jenjang SD & SMP (SMK OTOMINDO merupakan SMK vokasi).
2. Fase A, B, C, D (Hanya Fase E dan Fase F yang berlaku untuk SMK).
3. Rombel dummy tingkat XI dan XII (fokus validasi saat ini adalah kelas X TO 3).
4. Transaksi payment gateway Midtrans berulang (karena kebutuhan saat ini adalah operasional akademik sekolah).

---

## 3. Analisis Dampak Kekurangan Data Terhadap Modul

Berikut analisis dampak fungsional jika data yang kurang belum dilengkapi:

| Modul Ruang Pintar | Kondisi Saat Ini | Dampak Kekurangan Data |
| :--- | :--- | :--- |
| **Dashboard (Admin & Teacher Cockpit)** | Master siswa (38), rombel (1), dan guru (1) terbaca dengan benar. | Widget *"Jadwal Hari Ini"* pada Teacher Cockpit akan selalu kosong menampilkan status "Tidak ada jadwal kelas hari ini" karena belum ada `jadwal_pelajaran` dan `slot_waktu`. |
| **KBM (Kegiatan Belajar Mengajar)** | Penugasan mengajar sudah ada (`01M2YJMPXZ4BSRYTX6Z7P90BKG`). | Guru tidak dapat memulai sesi kelas terjadwal secara otomatis (harus membuat sesi KBM manual/insidental). Guru juga belum memiliki daftar Capaian Pembelajaran / Tujuan Pembelajaran resmi saat mencatat jurnal mengajar. |
| **Presensi (Sesi Kelas & Kehadiran)** | Daftar 38 siswa di rombel X TO 3 sudah valid dan siap diabsen. | Alur absensi berbasis jadwal belum bisa dipicu otomatis. Namun jika guru membuka sesi kelas manual, daftar 38 siswa sudah dapat diabsen satu per satu dengan status HADIR, SAKIT, IZIN, atau ALPHA. |
| **Penilaian (Gradebook & Ledger)** | Tabel `nilai_siswa` bersih. | Guru belum dapat mengelompokkan nilai formatif/sumatif berdasarkan Tujuan Pembelajaran (TP) Kurikulum Merdeka karena tabel `tujuan_pembelajaran` masih kosong. Penilaian baru bisa dicatat secara ad-hoc tanpa pemetaan TP. |
| **CBT (Computer Based Test)** | Seluruh tabel CBT bersih (`ujian_cbt`, `bank_soal`). | Modul CBT belum memiliki paket ujian untuk diujikan ke siswa. Selain itu, ke-38 siswa belum memiliki kredensial akun pengguna (`pengguna_id = null`), sehingga siswa belum bisa login ke halaman `/cbt-ujian` untuk mengerjakan ujian. |
| **Rapor Siswa (Academic Ledger)** | Data siswa dan rombel lengkap. | Lembar rapor belum memiliki Wali Kelas sah (`penugasan_wali_kelas` kosong) yang berhak memberikan catatan perkembangan kepribadian/ekstrakurikuler dan menandatangani rapor semester. |
| **Guardian (Portal Orang Tua / Wali)** | Tabel `wali_murid` & `hubungan_wali_siswa` kosong (0 record). | Modul `/presensi-anak` dan `/nilai-anak` belum dapat difungsikan karena belum ada akun orang tua yang diverifikasi terhubung dengan ke-38 siswa. |

---

## 4. Rekomendasi Urutan Pembuatan Data (Action Plan)

Agar SMK OTOMINDO dapat segera digunakan secara operasional dan siap untuk demonstrasi fungsional menyeluruh, penambahan data di masa depan direkomendasikan dengan urutan berikut:

### PRIORITAS 1 — Wajib (Syarat Mutlak Operasional KBM & Mengajar)
1. **Koreksi Master Data Profil Sekolah:**
   - Ubah jenjang menjadi `"SMK"`.
   - Isi NPSN dan alamat operasional lengkap SMK OTOMINDO.
2. **Master Program Keahlian SMK:**
   - Buat Program Keahlian *"Teknik Otomotif"* (Kode: `TO`, Jenjang: `SMK`).
   - Hubungkan rombel `X TO 3` ke program keahlian tersebut.
3. **Master Slot Waktu Sekolah (`slot_waktu`):**
   - Buat slot jam pelajaran (Senin-Jumat, jam 1 s/d jam 8, durasi @45 menit + waktu istirahat).
4. **Jadwal Pelajaran Riil Pak Eri Chandra:**
   - Alokasikan 3 JP mata pelajaran Koding & Kecerdasan Artifisial di kelas X TO 3 (misal: Senin, Jam ke 1–3, Pukul 07.30 – 09.45).
5. **Penugasan Wali Kelas Rombel X TO 3:**
   - Tetapkan Pak Eri Chandra A, S.Kom sebagai wali kelas kelas X TO 3 (sebagai homeroom teacher).

### PRIORITAS 2 — Penting (Syarat Operasional Evaluasi, Penilaian, & CBT)
1. **Lingkup Materi & Tujuan Pembelajaran (TP) KKA Fase E:**
   - Definisikan 2-3 TP Kurikulum Merdeka untuk mata pelajaran Koding & Kecerdasan Artifisial.
2. **Paket Ujian CBT Pertama:**
   - Buat 1 Bank Soal Koding (10-15 butir soal pilihan ganda) beserta 1 Ujian CBT aktif untuk kelas X TO 3.
3. **Penyediaan Akun Portal Siswa (38 Siswa):**
   - Buatkan akun login (`pengguna` role `STUDENT`) untuk ke-38 siswa dengan format username NIS (misal: `siswa_1001` s/d `siswa_1038`) dan password default, agar siswa dapat menguji pengerjaan CBT dan pengumpulan tugas.
4. **Kalender Akademik Semester Ganjil 2026/2027:**
   - Jadwalkan agenda KBM efektif, tanggal Ujian Tengah Semester (PTS/STS), dan Ujian Akhir Semester (PAS/SAS).

### PRIORITAS 3 — Pelengkap (Layanan Tambahan & Ekosistem Lengkap)
1. **Data Wali Murid & Relasi Perwalian:**
   - Masukkan sample data orang tua/wali untuk mengaktifkan portal Guardian.
2. **Kelengkapan Dokumen Siswa:**
   - Lengkapi NISN resmi dan tanggal lahir siswa untuk keperluan format cetak rapor Dapodik.
3. **Profil Lembaga Lengkap:**
   - Unggah logo resmi SMK OTOMINDO dan kop surat untuk kelengkapan administrasi cetak rapor/transkrip.
4. **Guru & Mapel Pendamping:**
   - Tambahkan 1-2 guru pengajar lain dan mapel umum (Matematika/Bahasa) untuk validasi multi-guru pada modul jadwal dan penilaian.
