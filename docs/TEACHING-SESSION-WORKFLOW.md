# TEACHING SESSION WORKFLOW — ANATOMI SATU SESI MENGAJAR
## Ruang Pintar — Alur Menit ke Menit Pembelajaran di Ruang Kelas Nyata

**Dokumen:** Pemetaan Alur Satu Sesi Pembelajaran Penuh  
**Status:** PROPOSED — READY FOR HUMAN REVIEW  
**Tanggal:** 22 September 2026  
**Studi Kasus:** Sesi Pagi 07:15 – 08:35 (2 Jam Pelajaran / 80 Menit)  
**Kelas & Mata Pelajaran:** XII RPL 1 — Pemrograman Berbasis Objek (PBO)  
**Fokus Utama:** Efisiensi waktu, minimasi jumlah klik, dan pemisahan langkah wajib vs opsional.

---

# 1. Linimasa Kronologis Satu Sesi Mengajar (80 Menit)

```mermaid
timeline
    title Linimasa Sesi Mengajar 80 Menit (07:15 - 08:35)
    07:05 - 07:15 : SEBELUM MASUK : Buka HP, cek ruang Lab RPL 2, lihat catatan materi pertemuan lalu
    07:15 - 07:20 : MEMBUKA & PRESENSI : Salam, doa, klik 'Tandai Semua Hadir', sentuh 2 siswa izin/sakit (15 Detik)
    07:20 - 07:30 : APERSEPSI & TP : Sampaikan Tujuan Pembelajaran, pancing diskusi dengan Pertanyaan Pemantik AI
    07:30 - 08:15 : INTI PEMBELAJARAN : Buka modul materi PBO 'Interface & Abstract Class', bimbing praktik lab
    08:15 - 08:25 : ASESMEN FORMATIF : Kuis kilat 2 soal / cek unjuk kerja kode, centang tuntas di HP
    08:25 - 08:35 : REFLEKSI & PENUTUP : Rangkuman 1 menit, simpan Jurnal KBM, klik [Selesai Sesi]
```

---

# 2. Rincian Aktivitas per Babak

---

## 2.1 Fase 1: Sebelum Masuk Kelas (07:05 – 07:15 | 10 Menit Sebelum Bel)
* **Kondisi:** Guru berada di ruang guru atau berjalan menuju ruang kelas/lab.
* **Aktivitas:**
  1. Guru melirik smartphone: Layar menampilkan *Cockpit Alert*:  
     `[ 07:15 • XII RPL 1 di Lab Komputer 2 • PBO Pertemuan ke-8 ]`.
  2. Guru mengecek ringkasan pertemuan sebelumnya: *"Pertemuan 7: Pewarisan (Inheritance) tuntas dipraktikkan"*.
* **Status:** Opsional (Bisa diakses sambil jalan).

---

## 2.2 Fase 2: Membuka Kelas & Presensi Kehadiran (07:15 – 07:20 | 5 Menit Pertama)
* **Kondisi:** Guru berdiri di depan kelas, siswa duduk rapi.
* **Aktivitas Nyata:**
  1. Mengucap salam, memimpin doa, dan menyapa kelas.
  2. Membuka ponsel/laptop di meja guru $\rightarrow$ Tombol hijau menyala: **[ Tandai Semua Hadir ]**.
  3. Siswa mengabarkan: *"Pak, Doni sakit ada suratnya, dan Fajar izin lomba silat"*.
  4. Guru mengetuk nama Doni $\rightarrow$ ubah ke `Sakit`. Mengetuk nama Fajar $\rightarrow$ ubah ke `Izin`.
  5. Klik `[ Simpan Presensi ]`.
* **Waktu Eksekusi:** **Hanya 15 detik!** Tidak ada lagi waktu KBM terbuang 15 menit untuk memanggil 36 nama siswa satu per satu.
* **Status:** **LANGKAH WAJIB (Mandatory).**

---

## 2.3 Fase 3: Apersepsi & Pengenalan Materi (07:20 – 07:30 | 10 Menit)
* **Aktivitas:**
  1. Guru menyampaikan Tujuan Pembelajaran (TP) hari ini: *Memahami konsep Interface dalam arsitektur OOP*.
  2. Guru membuka fitur asisten kelas: memunculkan analogi dunia nyata: *"Colokan listrik universal vs perangkat elektronik"*.
  3. Sistem otomatis mengisi judul topik di draf Jurnal KBM: `Pertemuan 8: Konsep Interface & Polimorfisme`.
* **Status:** Langkah Pedagogis.

---

## 2.4 Fase 4: Inti Pembelajaran & Praktik Mandiri (07:30 – 08:15 | 45 Menit)
* **Aktivitas:**
  1. Siswa membuka materi bacaan/kode yang telah dibagikan guru di modul kelas.
  2. Guru berkeliling di lab memantau pengerjaan kode siswa.
  3. Jika menemukan siswa yang sangat menonjol atau siswa yang kesulitan, guru dapat mengetuk profil siswa di HP untuk memberi catatan kecil (*Observasi Karakter/Keterampilan*).
* **Status:** Opsional digital (Fokus interaksi manusia di ruang kelas).

---

## 2.5 Fase 5: Asesmen Formatif Cepat (08:15 – 08:25 | 10 Menit)
* **Aktivitas:**
  1. Guru ingin memastikan pemahaman sebelum kelas bubar (*Exit Ticket*).
  2. Memberikan 1 studi kasus kode singkat.
  3. Di lembar penilaian formatif cepat di HP guru: Guru menandai siswa yang sudah tuntas (`Tuntas / Belum Tuntas`).
* **Status:** Opsional / Sesuai jadwal asesmen guru.

---

## 2.6 Fase 6: Catatan Kelas & Menutup Pertemuan (08:25 – 08:35 | 10 Menit Terakhir)
* **Aktivitas:**
  1. Guru memandu siswa merapikan lab komputer dan menyimpulkan materi bersama.
  2. Guru melengkapi 1 kalimat refleksi di Jurnal KBM:  
     *"32 siswa tuntas mengimplementasikan interface payment, 4 siswa akan dibimbing saat jam remedial praktikum"*.
  3. Guru menekan tombol: **[ Selesaikan Sesi Pembelajaran ]**.
* **Otomatisasi Seketika di Latar Belakang:**
  * Status sesi kelas di database berubah menjadi `SELESAI`.
  * Durasi sesi dan jam selesai riil tercatat dalam audit log.
  * Rekapitulasi absensi Doni (Sakit) dan Fajar (Izin) otomatis tersinkronisasi ke Dashboard Wali Kelas dan Orang Tua murid.
* **Status:** **LANGKAH WAJIB (Mandatory).**

---

# 3. Klasifikasi Langkah & Peluang Otomatisasi

```text
+----------------------------------------------------------------------------------------------------+
|                                    MATRIKS EFISIENSI SESI MENGAJAR                                 |
+--------------------------+---------------+-------------------------+-------------------------------+
| Aktivitas Sesi           | Klasifikasi   | Beban Tradisional       | Otomatisasi Ruang Pintar      |
+--------------------------+---------------+-------------------------+-------------------------------+
| 1. Penentuan Rombel & Ruang| Wajib       | Mencari jadwal kertas   | Otomatis terdeteksi jam riil  |
| 2. Presensi 36 Siswa     | Wajib         | 10–15 Menit panggil nama| 15 Detik (Tandai Semua Hadir) |
| 3. Topik & TP Jurnal     | Wajib         | Menulis tangan di buku  | Auto-prefilled dari urutan TP |
| 4. Catatan Refleksi KBM  | Wajib         | Mengarang bebas         | 1 Kalimat / Rekomendasi AI    |
| 5. Penilaian Formatif    | Opsional      | Menulis di buku nilai   | 1-Ketuk Tuntas/Belum Tuntas   |
| 6. Rekap ke Wali Kelas   | Wajib         | Menyalin manual akhir bl| Sinkronisasi instan real-time |
| 7. Tutup Sesi & Arsip    | Wajib         | Tanda tangan buku agenda| 1-Klik [ Selesai Sesi ]       |
+--------------------------+---------------+-------------------------+-------------------------------+
```

### Rekapitulasi Penghematan Waktu:
* **Tradisional:** Guru menghabiskan rata-rata **18–22 menit** per pertemuan hanya untuk urusan administrasi kertas (presensi manual, isi buku jurnal, cari buku nilai).
* **Dengan Ruang Pintar:** Seluruh administrasi wajib tuntas dalam waktu **kurang dari 2 menit total**. Guru memiliki sisa waktu ekstra 16–20 menit untuk fokus mendidik, membimbing, dan berdialog dengan siswa.
