# TEACHER NAVIGATION SYSTEM — SISTEM NAVIGASI GURU
## Ruang Pintar — Desain Navigasi Cepat, Fokus Mengajar, dan Bebas Kebingungan

**Dokumen:** Spesifikasi Sistem Navigasi Guru  
**Status:** PROPOSED — READY FOR HUMAN REVIEW  
**Tanggal:** 22 September 2026  
**Target:** Shell Desktop, Topbar, Sidebar, dan Ruang Kerja Kelas  
**Prinsip 5 Detik (*The 5-Second Rule*):**  
> *"Jika seorang guru login saat bel sekolah berbunyi dan hanya memiliki waktu 5 detik sebelum melangkah masuk kelas, layar harus langsung menjawab: 'Saya mengajar di mana, materi apa, dan tombol presensinya ada di mana'."*

---

# 1. Anatomi Shell Navigasi Guru (Desktop & Tablet)

```text
+----------------------------------------------------------------------------------------------------+
|  TOPBAR SHELL (SELALU TERSEDIA DI ATAS):                                                           |
|  [Logo Ruang Pintar]  |  [ SMK Otomindo (Guru) ▼ ]      [ 🔍 Cari Cepat (Ctrl+K) ]   (🔔 2) [ Avatar Bu Siti ] |
+----------------------------------------------------------------------------------------------------+
| SIDEBAR MINIMALIS    | MAIN CONTENT CANVAS (AREA KERJA UTAMA)                                      |
| (Lebar: 240px / 64px)|                                                                             |
|                      | +-------------------------------------------------------------------------+ |
| [=] Beranda Cockpit  | | HERO CARD: SESI BERIKUTNYA                               Sisa 6 Menit   | |
| [ ] Kelas Saya       | | 07:15 - 08:35 • Lab RPL 2 • XII RPL 1 (PBO)                             | |
| [ ] Jadwal Mengajar  | | Pertemuan 8: Konsep Interface & Polimorfisme                             | |
| [ ] Bank Soal & CBT  | | [ Buka Kelas Sekarang > ]   [ Presensi Kilat 15 Detik ]  [ Foto Absen ] | |
| -------------------  | +-------------------------------------------------------------------------+ |
| [ ] Panel Wali Kelas*|                                                                             |
|                      | +-----------------------------------+  +----------------------------------+ |
|                      | | KELAS HARI INI (AKSES CEPAT)      |  | ANTREAN PERIKSA TUGAS            | |
|                      | | • 07:15 - 08:35 : XII RPL 1 (PBO) |  | • Tugas 2: X PPLG 1 (32 Selesai) | |
| [?] Panduan & Bantuan| | • 08:35 - 09:55 : XI RPL 2 (PBO)  |  |   [ Buka Lembar Nilai > ]        | |
| [⚙] Profil Akun      | +-----------------------------------+  +----------------------------------+ |
+----------------------------------------------------------------------------------------------------+
```
*\*Catatan: Menu "Panel Wali Kelas" hanya muncul jika guru mendapatkan penugasan resmi sebagai wali kelas di semester aktif.*

---

# 2. Aturan Navigasi: Apa yang Terlihat, Disembunyikan, dan Selalu Tersedia

### 2.1 ATURAN 5 DETIK: APA YANG HARUS LANGSUNG TERLIHAT?
Saat guru login, sistem **tidak memuat landing page umum**, melainkan langsung mengunci pada **Hero Card Sesi Aktif**:
1. **Waktu Sesi & Ruangan Fisik:** Jam berapa mulai, di ruangan mana (misal: *Lab RPL 2*).
2. **Nama Rombel & Mata Pelajaran:** *XII RPL 1 — Pemrograman Berbasis Objek*.
3. **Materi Pertemuan Hari Ini:** Topik materi yang siap diajarkan.
4. **Dua Tombol Eksekusi Cepat:**  
   * Tombol Primer: **`[ Buka Kelas Sekarang > ]`**;
   * Tombol Taktis: **`[ Presensi Kilat 15 Detik ]`**.

### 2.2 APA YANG WAJIB DISEMBUNYIKAN?
* **Dilarang Menampilkan Menu Pengaturan Server / Dapodik:** Guru tidak perlu melihat tombol sinkronisasi server atau log teknis.
* **Dilarang Menampilkan Riwayat Kelas yang Sudah Lulus:** Kelas tahun ajaran lalu otomatis diarsipkan di sub-menu tersembunyi agar tidak mengotori daftar kelas aktif.
* **Dilarang Menampilkan Grafik Makro:** Hapus grafik donat atau grafik batang statistik yang tidak menghasilkan tindakan mengajar.

### 2.3 APA YANG SELALU TERSEDIA (*ALWAYS ACCESSIBLE*)?
* **Workspace Switcher di Pojok Kiri Atas:** Untuk berpindah antar sekolah atau ke ruang pribadi tanpa logout.
* **Universal Command Palette (`Ctrl+K` / `Cmd+K`):** Ketik nama kelas atau nama siswa untuk melompat langsung ke data yang dituju dalam 1 detik.
* **Lonceng Notifikasi Terkurasi:** Hanya menampilkan tugas baru yang dikumpulkan siswa dan pengumuman resmi sekolah.

---

# 3. Navigasi Internal Ruang Kelas (*Classroom Workspace Navigation*)

Saat guru menekan tombol `[ Buka Kelas Sekarang > ]`, layar berpindah ke **Ruang Kerja Kelas Terpadu** dengan bilah tab horizontal (*Academic Glass Pill Tabs*):

```text
+----------------------------------------------------------------------------------------------------+
|  < Kembali ke Beranda  |  XII RPL 1 — Pemrograman Berbasis Objek (PBO)       36 Siswa • Semester Ganjil|
+----------------------------------------------------------------------------------------------------+
|  [ RINGKASAN ]  [ PRESENSI ]  [ JURNAL KBM ]  [ MATERI ]  [ TUGAS ]  [ PENILAIAN ]  [ CBT ]  [ SISWA ] |
+----------------------------------------------------------------------------------------------------+
|  (Konten Tab Aktif Terbuka di Sini Tanpa Pindah Halaman / Zero Reload)                             |
+----------------------------------------------------------------------------------------------------+
```

### Karakteristik Navigasi Kelas:
1. **Zero Full-Page Reload:** Pergantian antar tab (misal dari Presensi ke Jurnal KBM) berlangsung instan berbasis client routing halus (*instant tab switching*).
2. **Breadcrumb yang Jernih:** Guru selalu tahu posisi dirinya: `Beranda > Kelas Saya > XII RPL 1 > Presensi`.
3. **Pintasan Aksi Kontekstual (*Floating Quick Action*):**
   Di dalam tab tugas atau materi, tombol `[ + Terbitkan Materi Baru ]` atau `[ + Buat Asesmen Baru ]` selalu mengambang di pojok kanan atas area kerja.
