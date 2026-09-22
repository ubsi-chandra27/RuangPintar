# ROLE-BASED NAVIGATION ARCHITECTURE
## Ruang Pintar — Arsitektur Navigasi Terpersonalisasi Berbasis Peran

**Dokumen:** Spesifikasi Navigasi Berbasis Peran (*Role-Based Navigation*)  
**Status:** PROPOSED — READY FOR HUMAN REVIEW  
**Tanggal:** 22 September 2026  
**Target:** Seluruh 7 Peran Utama Ekosistem Sekolah  
**Prinsip Desain:**  
> *"Setiap peran hanya melihat alat yang relevan dengan tugasnya. Guru tidak boleh dibebani menu konfigurasi operator, dan orang tua tidak boleh dibingungkan oleh menu administrasi kurikulum."*

---

# 1. Matriks Navigasi untuk Seluruh 7 Peran

```text
+----+-------------------+-----------------------+-----------------------------+-------------------------------+-------------------------------+
| No | Peran Pengguna    | Dashboard Utama       | Menu Utama (Sidebar)        | Menu Sekunder (Sub-Nav / Tab) | Pintasan Cepat (Top Shortcut) |
+----+-------------------+-----------------------+-----------------------------+-------------------------------+-------------------------------+
| 1  | GURU MAPEL        | Teacher Cockpit       | • Cockpit Beranda           | • Tab Kelas (Presensi, Jurnal,| • [ Buka Sesi Hari Ini ]      |
|    |                   | (Jadwal & Sesi Aktif) | • Kelas Saya                |   Materi, Tugas, Nilai, CBT)  | • [ Presensi Kilat 15 Detik ] |
|    |                   |                       | • Jadwal Mengajar           | • Filter Status Rombel        | • [ Buat Soal AI ]            |
|    |                   |                       | • Bank Soal & Asesmen       |                               |                               |
+----+-------------------+-----------------------+-----------------------------+-------------------------------+-------------------------------+
| 2  | WALI KELAS        | Homeroom Radar        | • (Seluruh Menu Guru)       | • Tab Rombel (Radar Kesehatan,| • [ Kejar Nilai Guru Mapel ]  |
|    |                   | (Kondisi 36 Siswa)    | • + Panel Wali Kelas        |   Siswa At-Risk, Leger Rapor, | • [ Verifikasi Surat Izin ]   |
|    |                   |                       |                             |   Catatan Sikap, Cetak Rapor) | • [ Broadcast Paguyuban WA ]  |
+----+-------------------+-----------------------+-----------------------------+-------------------------------+-------------------------------+
| 3  | OPERATOR SEKOLAH  | Command Center        | • Master Data Akademik      | • Tab Master (Tahun Ajaran,   | • [ Tambah Siswa / Import ]   |
|    |                   | (Kesehatan Data Data) | • Struktur Rombel           |   Rombel, Penugasan SK,       | • [ Susun Jadwal Master ]     |
|    |                   |                       | • Guru & Staf               |   Mutasi Masuk/Keluar)        | • [ Reset Password Akun ]     |
|    |                   |                       | • Jadwal Pelajaran Master   | • Log Audit & Integrasi       |                               |
+----+-------------------+-----------------------+-----------------------------+-------------------------------+-------------------------------+
| 4  | WAKA KURIKULUM    | Academic Radar        | • Denyut KBM Hari Ini       | • Tab Kepatuhan (Jurnal KBM,  | • [ Tugaskan Guru Piket ]     |
|    |                   | (KBM & Leger Rapor)   | • Supervisi Perangkat Ajar  |   Modul Ajar, Progres Leger)  | • [ Cetak Rekap KBM Hari Ini ]|
|    |                   |                       | • Leger Sekolah Terpadu     | • Ekspor Kurikulum Merdeka    | • [ Review Jadwal Pelajaran ] |
|    |                   |                       | • Jadwal Pelajaran Master   |                               |                               |
+----+-------------------+-----------------------+-----------------------------+-------------------------------+-------------------------------+
| 5  | KEPALA SEKOLAH    | Executive Radar       | • Executive Radar KBM       | • Tab Pengawasan (Presensi    | • [ Setujui Pengajuan Izin ]  |
|    |                   | (Ringkasan 30 Detik)  | • Kepatuhan Akademik        |   Siswa/Guru, Status BOS,     | • [ BAST & Dokumen BOS ]      |
|    |                   |                       | • Persetujuan (Approval)    |   Laporan Akreditasi BAN-PDM) | • [ Hubungi Waka Kurikulum ]  |
|    |                   |                       | • Laporan Mutu Sekolah      |                               |                               |
+----+-------------------+-----------------------+-----------------------------+-------------------------------+-------------------------------+
| 6  | SISWA             | Student Cockpit       | • Beranda Belajar           | • Tab Tugas (Aktif, Selesai)  | • [ Kumpul Tugas Hari Ini ]   |
|    |                   | (Jadwal & Tugas)      | • Tugas & Materi            | • Tab Rapor (Capaian KKTP)    | • [ Mulai Ujian CBT ]         |
|    |                   |                       | • Ujian CBT                 | • Kalender Pelajaran          | • [ Cek Nilai Terakhir ]      |
|    |                   |                       | • e-Rapor & Capaian Nilai   |                               |                               |
+----+-------------------+-----------------------+-----------------------------+-------------------------------+-------------------------------+
| 7  | WALI MURID        | Guardian Portal       | • Pantau Anak (Live Absen)  | • Tab Transparansi (Catatan   | • [ Ajukan Izin Sakit via HP ]|
|    | (GUARDIAN)        | (Kehadiran & PR)      | • Tugas & Pembiasaan        |   Presensi Harian, Rekap PR,  | • [ Multi-Child Switcher ]    |
|    |                   |                       | • Buku Nilai & e-Rapor      |   e-Rapor Resmi)              | • [ Hubungi Wali Kelas ]      |
|    |                   |                       | • Izin Sakit / Dispensasi   |                               |                               |
+----+-------------------+-----------------------+-----------------------------+-------------------------------+-------------------------------+
```

---

# 2. Penanganan Pengguna Multi-Peran (*Multi-Role Handling*)

Di sekolah Indonesia, fenomena rangkap jabatan adalah hal yang sangat umum:
* **Kasus 1: Guru yang juga menjadi Wali Kelas.**
* **Kasus 2: Guru yang juga menjabat sebagai Wakil Kepala Sekolah (Waka).**

### Solusi Desain Ruang Pintar: *Unified Extension Navigation*
Sistem **tidak memaksa pengguna logout atau mengganti akun**. Navigasi menyatu secara elegan:
1. **Peran Utama Tetap Guru:** Guru tetap memiliki Cockpit Mengajar dan Kelas Saya sebagai beranda utama.
2. **Menu Tambahan Sesuai SK (*Dedicated Extension Block*):**
   * Jika ditugaskan sebagai Wali Kelas, di sidebar muncul blok menu khusus beraksen warna semantik:  
     `[⭐ Panel Wali Kelas: XII RPL 1]`.
   * Jika menjabat Waka Kurikulum, muncul blok menu:  
     `[🏛️ Panel Kurikulum & KBM Sekolah]`.
3. **Pemberitahuan Terfokus:** Guru dapat melihat notifikasi mengajar dan notifikasi tugas manajerial dalam satu lonceng terpadu dengan filter tab (*Tab Kelas Saya* vs *Tab Manajerial*).
