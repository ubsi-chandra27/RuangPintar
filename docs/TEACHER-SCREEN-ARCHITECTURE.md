# TEACHER SCREEN ARCHITECTURE — ARSITEKTUR LAYAR GURU
## Ruang Pintar — Spesifikasi Mendalam Setiap Layar Kerja Dewan Guru

**Dokumen:** Arsitektur Layar Guru  
**Status:** PROPOSED — READY FOR HUMAN REVIEW  
**Tanggal:** 22 September 2026  
**Target:** Seluruh Layar Kerja Guru (Desktop, Tablet, Mobile)  
**Tujuan:** Mendefinisikan tujuan utama, metrik keberhasilan (KPI), komponen penyusun, dan tombol aksi utama (*Call to Action*) untuk setiap layar guru.

---

# 1. Rincian Arsitektur 11 Layar Guru

---

## 1. Dashboard Guru (Teacher Cockpit) — `SCR-TCH-01`
* **Tujuan Utama:** Orientasi taktis dalam 30 detik pertama: jam berapa mengajar, di ruangan mana, materi apa yang siap, dan siapa siswa yang butuh perhatian.
* **KPI Keberhasilan:** Guru melangkah masuk ke ruang kelas yang benar tanpa salah jadwal dan mengeksekusi presensi dalam $< 30$ detik.
* **Komponen Utama:**
  1. *Hero Active Session Card* (Jam, Ruangan, Rombel, Pertemuan ke-X, Countdown Bel);
  2. *Quick Actions Trio* (`[ Buka Kelas ]`, `[ Presensi Kilat 15 Detik ]`, `[ Foto Absen AI ]`);
  3. *Jadwal Mengajar Hari Ini* (Status centang alokasi jam pelajaran);
  4. *Attention Queue* (Daftar siswa alpha beruntun / tugas kosong).
* **CTA Utama:** `[ Buka Kelas Sekarang > ]` (Cobalt Blue).

---

## 2. Direktori Kelas Saya — `SCR-TCH-02`
* **Tujuan Utama:** Menampilkan katalog seluruh rombel kelas yang diampu guru di semester aktif.
* **KPI Keberhasilan:** Guru menemukan kelas yang dituju dalam 1 ketukan tanpa tersesat antar-tingkat.
* **Komponen Utama:**
  1. Bar pencarian cepat kelas (*Quick Filter: Tingkat X, XI, XII / Nama Mapel*);
  2. Kartu Kelas (*Academic Glass Card*): Nama Rombel, Jumlah Siswa, Total JP Mingguan, Progres BAB Selesai, dan Rerata Nilai Rombel;
  3. Indikator Jadwal Hari Ini (Badge hijau pada kelas yang ada jadwal hari ini).
* **CTA Utama:** Klik pada Kartu Kelas untuk masuk ke Classroom Workspace.

---

## 3. Ruang Kerja Kelas (Classroom Workspace Hub) — `SCR-TCH-03`
* **Tujuan Utama:** Meja kerja operasional terpadu satu kelas tertentu (contoh: *XII RPL 1 - PBO*).
* **KPI Keberhasilan:** Seluruh administrasi 1 pertemuan tuntas tanpa berpindah halaman luar (*Zero Context Switching*).
* **Komponen Utama:**
  1. *Class Header Banner:* Rombel, Mapel, Ruang Reguler, Jumlah Siswa Aktif;
  2. *Horizontal Glass Pill Tabs:* Ringkasan, Presensi, Jurnal KBM, Materi, Tugas, Penilaian, CBT, Siswa;
  3. *Floating Action Button Contextual:* Tombol tambah item sesuai tab aktif;
  4. *Laci Asisten AI:* Tombol melayang di kanan bawah `[ ✨ Bantuan Mengajar ]`.
* **CTA Utama:** Navigasi antar-tab instan (*Client-side Tab Switching*).

---

## 4. Modal Presensi Kilat 15 Detik — `SCR-TCH-04`
* **Tujuan Utama:** Mengisi kehadiran 36 siswa secepat kilat di depan kelas tanpa memanggil satu per satu.
* **KPI Keberhasilan:** Presensi 1 rombel selesai dan tersimpan dalam waktu **kurang dari 15 detik**.
* **Komponen Utama:**
  1. Tombol sakti hijau menyala: **[ Tandai Semua Hadir ]**;
  2. Daftar siswa responsif dengan chip status warna semantik (Hadir: Hijau, Sakit: Biru, Izin: Kuning, Alpha: Merah);
  3. Kalkulator persentase kehadiran real-time;
  4. Input catatan dispensasi singkat.
* **CTA Utama:** `[ Simpan Presensi Sesi ]` (Emerald Green).

---

## 5. Lembar Jurnal KBM & Refleksi — `SCR-TCH-05`
* **Tujuan Utama:** Mencatat agenda mengajar riil, materi yang disampaikan, dan refleksi kendala kelas untuk bukti supervisi kurikulum.
* **KPI Keberhasilan:** Pengisian jurnal tuntas dalam waktu $< 60$ detik per pertemuan.
* **Komponen Utama:**
  1. Nomor pertemuan otomatis dan tanggal hari ini;
  2. Pemilih Tujuan Pembelajaran (TP) yang sedang diajarkan (*Checklist TP*);
  3. Input teks ringkas: Materi yang dibahas & Kegiatan belajar;
  4. Kolom Refleksi Pembelajaran (dengan tombol: *[ Gunakan Rekomendasi Refleksi AI ]*).
* **CTA Utama:** `[ Simpan Jurnal KBM ]`.

---

## 6. Modul Pembelajaran & Dokumen Materi — `SCR-TCH-06`
* **Tujuan Utama:** Menerbitkan modul bacaan, dokumen presentasi PDF, atau tautan video praktikum ke siswa di kelas tersebut.
* **KPI Keberhasilan:** Materi terunggah dan langsung dapat dibaca oleh siswa seketika.
* **Komponen Utama:**
  1. Daftar modul ajar berurutan per Lingkup Materi / BAB;
  2. Dropzone unggah berkas (PDF, DOCX, PPT, Link Video YouTube);
  3. Pengaturan visibilitas publikasi (Draf / Terbitkan ke Siswa).
* **CTA Utama:** `[ + Terbitkan Materi Baru ]`.

---

## 7. Manajemen Tugas & Lembar Kerja Siswa — `SCR-TCH-07`
* **Tujuan Utama:** Memberikan penugasan mandiri/kelompok, memantau batas waktu (*deadline*), dan memeriksa hasil pekerjaan siswa.
* **KPI Keberhasilan:** Guru mengetahui persis siswa mana yang belum mengumpulkan tugas dalam 1 kali pandang.
* **Komponen Utama:**
  1. Kartu Tugas: Judul, Batas Waktu Countdown, Rasio Pengumpulan (misal: *32/36 Siswa Sudah Mengumpulkan*);
  2. Lembar Pemeriksaan Tugas: Daftar nama siswa, berkas lampiran siswa, kolom masukan guru (*feedback*), dan input nilai formatif.
* **CTA Utama:** `[ Nilai Pengumpulan Siswa ]`.

---

## 8. Matriks Buku Nilai (Smart Gradebook Matrix) — `SCR-TCH-08`
* **Tujuan Utama:** Lembar kerja nilai terpadu per kelas untuk pengolahan nilai formatif, sumatif per BAB, dan nilai akhir rapor.
* **KPI Keberhasilan:** Pengisian nilai bebas dari salah ketik dan terhindar dari formula spreadsheet yang rusak.
* **Komponen Utama:**
  1. Tabel Matriks Dinamis (Baris = Nama Siswa, Kolom = Asesmen Formatif & Sumatif);
  2. Indikator Ketercapaian KKTP per sel nilai (Nilai di bawah KKTP otomatis berwarna merah lembut);
  3. Kolom Rata-Rata Terbobot Otomatis;
  4. Tombol 1-klik: `[ Generate Deskripsi Rapor Kurikulum Merdeka via AI ]`.
* **CTA Utama:** `[ Simpan & Terbitkan Nilai ]`.

---

## 9. Hub Ujian CBT & Proctor Monitor — `SCR-TCH-09`
* **Tujuan Utama:** Menjadwalkan ujian CBT online dan memantau siswa yang sedang mengerjakan ujian secara langsung (*Live Proctoring*).
* **KPI Keberhasilan:** Pengawasan ujian 36 siswa terpantau tanpa kebocoran kunci jawaban.
* **Komponen Utama:**
  1. Status Peserta Live (Sedang Mengerjakan, Selesai, Terkunci);
  2. Indikator Integritas Ujian (Deteksi jendela browser beralih / peringatan keluar layar penuh);
  3. Tombol Pembukaan Sesi Terkunci (*Unlock Student Attempt*);
  4. Tombol 1-klik transfer nilai CBT langsung ke Buku Nilai Gradebook.
* **CTA Utama:** `[ Buka Ujian CBT / Mulai Sesi ]`.

---

## 10. Bank Soal & Asesmen Guru — `SCR-TCH-10`
* **Tujuan Utama:** Repositori soal mandiri dan kolaboratif guru untuk menyusun naskah ujian dan instrumen asesmen akreditasi.
* **KPI Keberhasilan:** Penyusunan instrumen ujian resmi memangkas waktu dari berhari-hari menjadi hitungan menit.
* **Komponen Utama:**
  1. Katalog Soal per Mata Pelajaran & Fase/Tingkat;
  2. Generator Kisi-Kisi AI & Kartu Soal AI;
  3. Generator Paket Ujian A & B Seimbang;
  4. Ekspor Naskah Ujian (Format CBT Digital atau Cetak Word/PDF dua kolom).
* **CTA Utama:** `[ + Buat Soal Baru / Generate AI ]`.

---

## 11. Studio AI Scanner (Paper Correction) — `SCR-TCH-11`
* **Tujuan Utama:** Memindai lembar LJK kertas biasa siswa menggunakan kamera ponsel guru untuk koreksi otomatis.
* **KPI Keberhasilan:** Mengoreksi 36 lembar LJK siswa dalam waktu $< 2$ menit total tanpa mesin scanner khusus.
* **Komponen Utama:**
  1. *Camera Viewfinder* dengan panduan sudut kotak deteksi otomatis (*Auto-Alignment Markers*);
  2. Indikator deteksi bulatan pensil/pulpen real-time;
  3. Review skor instan per siswa sebelum disimpan ke buku nilai.
* **CTA Utama:** `[ Foto Lembar Jawaban (Capture) ]`.
