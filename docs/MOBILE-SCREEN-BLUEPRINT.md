# MOBILE SCREEN BLUEPRINT — CETAK BIRU LAYAR SMARTPHONE
## Ruang Pintar — Cetak Biru Antarmuka Mobile untuk Guru, Siswa, dan Guardian

**Dokumen:** Cetak Biru Layar Ponsel Cerdas (*Smartphone Viewport 360px – 430px*)  
**Status:** PROPOSED — READY FOR HUMAN REVIEW  
**Tanggal:** 22 September 2026  
**Target:** Guru, Siswa, dan Orang Tua Murid  
**Tujuan:** Memetakan perilaku sentuh, tombol aksi melayang (FAB), laci bawah (*Bottom Sheet*), dan ketahanan offline untuk penggunaan di sekolah Indonesia.

---

# 1. Matriks Kebutuhan Layar Mobile

```text
+----+-------------------+-----------------------+---------------------+-------------------+-------------------------------+
| No | Peran Pengguna    | Layar Paling Sering   | Layar Wajib Offline | Layar Butuh FAB   | Layar Butuh Bottom Sheet      |
+----+-------------------+-----------------------+---------------------+-------------------+-------------------------------+
| 1  | GURU              | • Cockpit Sesi Aktif  | • Presensi Kelas    | • Tombol [ ⚡ ]   | • Bottom Sheet Presensi Kilat |
|    |                   | • Lembar Presensi     | • Jurnal KBM        |   di Cockpit      | • Filter Rombel Kelas         |
|    |                   | • Cek Jadwal Ruangan  | • Jadwal Mengajar   |   Beranda         | • Detail Cepat Siswa          |
+----+-------------------+-----------------------+---------------------+-------------------+-------------------------------+
| 2  | SISWA             | • Beranda Belajar     | • Jadwal Pelajaran  | • Tombol [ + ]    | • Lembar Pengumpulan Tugas    |
|    |                   | • Countdown Tugas     | • Rangkuman Materi  |   Kumpul Tugas    | • Rincian Skor & Feedback Guru|
|    |                   | • CBT Player Layar HP |   yang Tersimpan    |                   | • Daftar Nomor Soal CBT       |
+----+-------------------+-----------------------+---------------------+-------------------+-------------------------------+
| 3  | WALI MURID        | • Radar Hadir Pagi    | • Arsip Surat Izin  | • Tidak Ada       | • Lembar Unggah Surat Dokter  |
|    | (GUARDIAN)        | • Pengawasan Tugas PR |   yang Disetujui    |   (Desain Tenang) | • Multi-Child Switcher Drawer |
|    |                   | • Riwayat Absensi     |                     |                   | • Rincian Pengumuman Sekolah  |
+----+-------------------+-----------------------+---------------------+-------------------+-------------------------------+
```

---

# 2. Cetak Biru Layar Mobile Utama

---

## 2.1 Layar Mobile Guru: Cockpit Sesi & Presensi Cepat

```text
+-----------------------------------+
| RUANG PINTAR     [ SMK Otomindo ] |
| Halo, Bu Siti S.Kom.  (🔔 1) [ 👤]|
|-----------------------------------|
|                                   |
| [ HERO KELAS HARI INI ]           |
| +-------------------------------+ |
| | 07:15 - 08:35 • Lab RPL 2     | |
| | XII RPL 1 — PBO               | |
| | Pertemuan 8: Interface OOP    | |
| |                               | |
| | [ BUKA KELAS ] [ FOTO ABSEN ] | |
| +-------------------------------+ |
|                                   |
| JADWAL MENGAJAR HARI INI          |
| • 07:15 - 08:35 : XII RPL 1 (Lab) |
| • 08:35 - 09:55 : XI RPL 2 (R304) |
| • 10:15 - 11:35 : X PPLG 1 (Lab)  |
|                                   |
| ANTREAN PERIKSA TUGAS             |
| • Tugas 2 PBO (32/36 Siswa Kumpul)|
|                                   |
|                            [ ⚡ ] | <- FAB: Presensi Kilat 15 Detik
|-----------------------------------|
| [Beranda] [Kelas] [Jadwal] [Akun] | <- Bottom Navigation Bar (64px)
+-----------------------------------+
```

### Karakteristik Interaksi Guru:
* **Sentuhan Jempol pada FAB `[ ⚡ ]`:**
  Seketika meluncurkan **Bottom Sheet Drawer Presensi Kilat** dari bawah layar:
  * Tombol besar: **[ Tandai Semua Hadir (1-Ketuk) ]**;
  * Scroll daftar 36 siswa: Ketuk nama siswa untuk mengubah status ke *Sakit* atau *Alpha*;
  * Tombol simpan di dasar layar: **[ Simpan Presensi ]**;
  * Seluruh proses tuntas tanpa meninggalkan beranda!

---

## 2.2 Layar Mobile Siswa: Belajar & Ujian Tenang

```text
+-----------------------------------+
| RUANG PINTAR     (🔔 2) [ Foto ]  |
| Arya Pratama (XII RPL 1)          |
|-----------------------------------|
|                                   |
| SESI BERIKUTNYA                   |
| 07:15 - 08:35 • Lab Komputer 2    |
| Pemrograman Berbasis Objek        |
|                                   |
| TUGAS MENDESAK                    |
| +-------------------------------+ |
| | Tugas 2: Interface Payment    | |
| | Batas: Hari ini, 23:59 (6 Jam)| |
| | [ Buka Lembar Pengumpulan > ] | |
| +-------------------------------+ |
|                                   |
| RADAR CAPAIAN BELAJAR             |
| • PBO         : 88% Tuntas [====] |
| • Matematika  : 78% Tuntas [===.] |
|                                   |
|-----------------------------------|
| [Belajar] [Tugas] [CBT] [e-Rapor] | <- Bottom Nav Siswa
+-----------------------------------+
```

---

## 2.3 Layar Mobile Orang Tua (Guardian): Ketenangan Hati & Izin

```text
+-----------------------------------+
| RUANG PINTAR      [ Ganti Anak ▼ ]|
| Anak: Arya Pratama (XII RPL 1)    |
|-----------------------------------|
|                                   |
| STATUS KEHADIRAN HARI INI         |
| +-------------------------------+ |
| | ( v ) HADIR DI KELAS          | |
| | Jam Masuk: 07:12 WIB          | |
| | Pertemuan 1: PBO di Lab RPL 2 | |
| +-------------------------------+ |
|                                   |
| PENGAWASAN TUGAS RUMAH (PR)       |
| • 1 Tugas Belum Dikumpulkan:      |
|   Tugas 2 PBO (Tenggat Malam Ini) |
|                                   |
| PINTASAN ORANG TUA                |
| [ ✉️ Ajukan Izin/Sakit ]           |
| [ 📊 Lihat Buku Nilai & Rapor ]   |
|                                   |
|-----------------------------------|
| [Kehadiran]  [Tugas]  [Surat Izin]| <- Bottom Nav Ortu
+-----------------------------------+
```

---

# 3. Ketahanan Operasional Luar Jaringan (*Offline Capabilities*)

Agar aplikasi kebal terhadap pemadaman Wi-Fi sekolah atau sinyal seluler yang lemah di ruang bawah tanah/lab:

1. **Layar yang Wajib Beroperasi Offline:**
   * Presensi Sesi Kelas (Guru dapat menandai hadir/sakit tanpa internet);
   * Jurnal Mengajar Harian;
   * Jadwal Pelajaran & Ruangan;
   * Naskah Ujian CBT yang Sedang Berjalan (Snapshot soal telah terunduh di memori aman browser).
2. **Sinkronisasi Latar Belakang Otomatis (*Background Auto-Sync*):**
   * Begitu smartphone guru atau siswa kembali mendeteksi sinyal internet, sistem secara diam-diam mengirim antrean data lokal (*optimistic mutation*) ke database cloud tanpa memunculkan dialog error yang menakutkan.
