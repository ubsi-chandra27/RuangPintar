# CLASSROOM WORKSPACE BLUEPRINT — CETAK BIRU RUANG KELAS AKTIF
## Ruang Pintar — Meja Kerja Operasional Terpadu Satu Kelas

**Dokumen:** Cetak Biru Ruang Kerja Kelas Terpadu (*Classroom Workspace*)  
**Status:** PROPOSED — READY FOR HUMAN REVIEW  
**Tanggal:** 22 September 2026  
**Studi Kasus:** `XII RPL 1 — Pemrograman Berbasis Objek (PBO)`  
**Tujuan:** Menetapkan tata letak komponen (*layout anatomy*), hierarki visual, dan interaksi operasional kelas aktif.

---

# 1. Peta Tata Letak Ruang Kelas (*Layout Wireframe Structure*)

```text
+----------------------------------------------------------------------------------------------------+
| TOPBAR KELAS                                                                                       |
| < Kembali ke Beranda  |  XII RPL 1 — Pemrograman Berbasis Objek (PBO)    36 Siswa • Lab RPL 2      |
+----------------------------------------------------------------------------------------------------+
| HERO AREA KELAS (STATUS SESI AKTIF)                                                                |
| +------------------------------------------------------------------------------------------------+ |
| | [ STATUS: SESI BERJALAN ] • Pertemuan 8 (07:15 - 08:35) • Hari Ini                             | |
| | Topik Aktif: Konsep Interface & Polimorfisme (BAB 2)                                           | |
| | Presensi: 34 Hadir, 1 Sakit, 1 Izin, 0 Alpha      [ Presensi Kilat ]   [ Selesaikan Sesi ]     | |
| +------------------------------------------------------------------------------------------------+ |
+----------------------------------------------------------------------------------------------------+
| BILAH TAB HORIZONTAL ACADEMIC GLASS:                                                               |
| [ 📌 Ringkasan ] [ 📋 Presensi ] [ 📖 Jurnal KBM ] [ 📚 Materi ] [ 📝 Tugas ] [ 📊 Penilaian ] [ 💻 CBT ] |
+----------------------------------------------------------------------------------------------------+
| KANVAS KONTEN TAB AKTIF:                                                                           |
|                                                                                                    |
| (Area kerja dinamis berubah seketika mengikuti tab yang dipilih tanpa full reload)                 |
|                                                                                                    |
|                                                                                                    |
|                                                                       +--------------------------+ |
|                                                                       | [ ✨ Asisten Kelas AI ]  | |
+-----------------------------------------------------------------------+--------------------------+-+
```

---

# 2. Rincian Anatomi 7 Tab Ruang Kelas

---

## 2.1 Tab 1: Ringkasan Kelas (*Overview & Health Check*)
* **Tujuan:** Mengetahui kondisi akademik dan kedisiplinan kelas dalam 1 layar cepat.
* **Komponen:**
  1. *4 Kartu Metrik Cepat:* Total Pertemuan Selesai (7/16), Rata-rata Nilai Kelas (82.4), Ketuntasan KKTP (88%), dan Rasio Kehadiran (96.2%);
  2. *Jadwal Mingguan Rombel Ini:* Alokasi hari dan jam pelajaran di rombel ini;
  3. *Antrean Tugas Aktif:* Menampilkan tugas yang sedang berjalan beserta jumlah siswa yang sudah mengumpulkan;
  4. *Siswa Perlu Bimbingan:* Daftar nama siswa yang nilai sumatifnya masih di bawah KKTP untuk remedial.

---

## 2.2 Tab 2: Presensi Sesi Kelas (*Class Attendance Hub*)
* **Tujuan:** Mengelola daftar kehadiran siswa per pertemuan dan riwayat kehadiran semester.
* **Komponen:**
  1. *Header Presensi Sesi Hari Ini:* Menampilkan nomor pertemuan dan jam sesi;
  2. *Daftar Siswa Responsif (Grid/Tabel):* Menampilkan foto avatar siswa, NISN, nama lengkap, dan 4 tombol status segmen (`HADIR`, `SAKIT`, `IZIN`, `ALPHA`);
  3. *Tombol Aksi Cepat:* `[ Tandai Semua Hadir (1-Klik) ]`;
  4. *Riwayat Presensi Pertemuan Lalu:* Tabel riwayat pertemuan 1 hingga pertemuan terakhir dengan statistik kehadiran lengkap.

---

## 2.3 Tab 3: Jurnal KBM & Administrasi Guru (*Curriculum Log*)
* **Tujuan:** Mencatat agenda materi dan refleksi mengajar harian sesuai standar Kurikulum Merdeka.
* **Komponen:**
  1. *Form Jurnal Pertemuan Aktif:*
     * Tanggal & jam sesi riil;
     * Pemilih Tujuan Pembelajaran (TP) yang dicapai hari ini;
     * Kolom uraian materi pokok & aktivitas KBM siswa;
     * Kolom catatan refleksi & kendala kelas;
  2. *Tabel Arsip Jurnal Semester:* Daftar kronologis pertemuan yang siap dicetak menjadi Dokumen Administrasi Guru berformat PDF resmi siap tanda tangan Kepala Sekolah.

---

## 2.4 Tab 4: Materi Pembelajaran (*Learning Resource Hub*)
* **Tujuan:** Mendistribusikan modul bacaan, lembar panduan praktikum, dan media belajar.
* **Komponen:**
  1. *Hierarki Lingkup Materi (BAB):* Pengelompokan modul ajar per BAB (BAB 1: Dasar OOP, BAB 2: Interface, BAB 3: GUI Java);
  2. *Kartu Berkas Materi:* Judul materi, format berkas (PDF, DOCX, Video Tautan), ukuran berkas, dan status (Terbit / Draf);
  3. *Dropzone Upload Berkas:* Guru cukup menarik berkas dari desktop ke dalam layar (*Drag & Drop*).

---

## 2.5 Tab 5: Tugas & Lembar Kerja Siswa (*Assignment Center*)
* **Tujuan:** Menerbitkan tugas, memantau batas waktu pengumpulan, dan memberikan nilai formatif.
* **Komponen:**
  1. *Daftar Tugas Kelas:* Menampilkan judul tugas, tenggat waktu (*countdown*), dan rasio penyelesaian;
  2. *Panel Evaluasi Tugas (Submission Drawer):*
     * Menampilkan daftar siswa yang sudah mengumpulkan dan belum mengumpulkan;
     * Penampil Berkas (*Document Viewer*): Membaca teks tugas atau unduh berkas siswa;
     * Kolom Input Nilai & Catatan Masukan (*Feedback Teacher*).

---

## 2.6 Tab 6: Penilaian & Gradebook (*Assessment Matrix*)
* **Tujuan:** Matriks penilaian dinamis kelas untuk asesmen formatif, sumatif per BAB, dan rapor.
* **Komponen:**
  1. *Tabel Matriks Cerdas:*
     * Baris: 36 Siswa XII RPL 1;
     * Kolom Dinamis: Asesmen Formatif (Tugas 1, Tugas 2), Sumatif Lingkup Materi (TP 1, TP 2), dan Sumatif Akhir;
  2. *Indikator Ambang Batas KKTP (75):* Nilai $< 75$ otomatis diberi penanda visual amber/rose lembut;
  3. *Otomatisasi Deskripsi Rapor AI:* Tombol untuk mengenerate narasi capaian tertinggi & terendah siswa Kurikulum Merdeka secara massal.

---

## 2.7 Tab 7: CBT & Kuis Online Kelas (*Class CBT Portal*)
* **Tujuan:** Melaksanakan ujian pilihan ganda/esai interaktif dan memantau siswa secara langsung.
* **Komponen:**
  1. *Daftar Ujian Terjadwal:* Jadwal Ujian Harian, Asesmen Tengah Semester, atau Try Out;
  2. *Proctoring Monitor:* Memantau siswa yang sedang mengerjakan ujian secara real-time;
  3. *Tombol 1-Klik Transfer Nilai:* Memindahkan hasil skor CBT siswa langsung menjadi kolom nilai di Tab Penilaian tanpa ekspor-impor manual.

---

# 3. Interaksi Asisten AI Kelas (*Classroom Copilot Drawer*)

* **Posisi & Pemicu:** Tombol mengambang di sudut kanan bawah: `[ ✨ Asisten Kelas AI ]`.
* **Karakteristik Laci Samping (*Slide-Over Drawer 380px*):**
  Saat dibuka, asisten AI langsung terkoneksi dengan data XII RPL 1:
  * Tombol 1-Klik: *"Buat 3 Pertanyaan Pemantik Materi Interface"* $\rightarrow$ teks muncul dalam 1.5 detik $\rightarrow$ tombol `[ Tampilkan di Layar Proyektor ]`.
  * Tombol 1-Klik: *"Buat 2 Soal Kuis Kilat Penutup"* $\rightarrow$ naskah kuis siap pakai.
  * Tombol 1-Klik: *"Draf Refleksi Jurnal Hari Ini"* $\rightarrow$ draf refleksi otomatis mengisi kolom Jurnal KBM.
