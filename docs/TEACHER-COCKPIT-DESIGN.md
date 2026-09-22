# TEACHER COCKPIT DESIGN — DASHBOARD BERBASIS KONTEKS WAKTU
## Ruang Pintar — Antarmuka Guru yang Hidup, Bersih, dan Sadar Waktu

**Dokumen:** Spesifikasi Desain Teacher Cockpit  
**Status:** PROPOSED — READY FOR HUMAN REVIEW  
**Tanggal:** 22 September 2026  
**Target:** Shell Dashboard Guru (Desktop & Mobile Responsive)  
**Aturan Desain:**  
> *"DILARANG FAKE KPI. Dilarang grafik hiasan yang tidak bisa diklik. Cockpit guru harus sadar jam dinding sekolah dan memberikan apa yang dibutuhkan guru saat itu juga."*

---

# 1. Konsep Teacher Cockpit: Antarmuka yang Sadar Waktu (*Time-Aware Contextual Cockpit*)

Teacher Cockpit bukanlah halaman dashboard statis. Layar utama beradaptasi secara dinamis mengikuti **jam dinding sekolah**:

```text
+----------------------------------------------------------------------------------------------------+
|                                    ADAPTASI WAKTU TEACHER COCKPIT                                  |
+-----------------------------------+----------------------------------+-----------------------------+
|          PAGI (06:30 - 07:15)     |       SIANG (07:15 - 14:00)      |     SORE/MALAM (14:00 - 21:00)|
+-----------------------------------+----------------------------------+-----------------------------+
| Fokus: "Kesiapan Mengajar"        | Fokus: "Sesi Aktif di Kelas"     | Fokus: "Rekap & Persiapan"  |
|                                   |                                  |                             |
| • Kelas Jam ke-1 di mana?         | • Kartu Kelas Aktif Menyala      | • Tugas yang perlu diperiksa|
| • Materi apa yang disiapkan?      | • Tombol Presensi Kilat 15 Detik | • Rekapitulasi jam hari ini |
| • Siswa yang kemarin bermasalah   | • Catat 1 baris Jurnal KBM       | • Generator Soal AI         |
+-----------------------------------+----------------------------------+-----------------------------+
```

---

# 2. Anatomi Tampilan Cockpit (Layar Pagi Hari)

```text
+----------------------------------------------------------------------------------------------------+
|  RUANG PINTAR     [ SMK Otomindo (Guru) ▼ ]                      (🔔) [ Foto Avatar Bu Siti ]       |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  Selamat Pagi, Bu Siti Nurhaliza, S.Kom.!                               Senin, 22 September 2026   |
|  Hari ini Anda memiliki 3 Sesi Mengajar (6 JP) di Kampus Pusat.                                    |
|                                                                                                    |
|  +-----------------------------------------------------------------------------------------------+ |
|  | [HERO CARD: SESI BERIKUTNYA]                                          Sisa 12 Menit Menuju Bel | |
|  |                                                                                               | |
|  |   07:15 - 08:35 • Jam ke 1–2 (2 JP) • Lab Komputer RPL 2                                      | |
|  |   XII RPL 1 — Pemrograman Berbasis Objek (PBO)                                                | |
|  |   Pertemuan 8: Konsep Interface & Abstract Class                                              | |
|  |                                                                                               | |
|  |   [ Buka Kelas Sekarang > ]         [ Presensi Kilat 15 Detik ]         [ Foto Absen AI ]     | |
|  +-----------------------------------------------------------------------------------------------+ |
|                                                                                                    |
|  +---------------------------------------------+  +----------------------------------------------+ |
|  | JADWAL MENGAJAR HARI INI                    |  | PERLU PERHATIAN (ATTENTION QUEUE)            | |
|  +---------------------------------------------+  +----------------------------------------------+ |
|  | [x] 07:15 - 08:35 : XII RPL 1 (Lab RPL 2)   |  | [ ! ] Doni Pratama (XII RPL 1)               | |
|  | [ ] 08:35 - 09:55 : XI RPL 2 (Ruang 304)    |  |       3x Alpha berturut-turut di mapel PBO.  | |
|  | [ ] 10:15 - 11:35 : X PPLG 1 (Lab RPL 1)    |  |       [ Hubungi Wali Kelas ]                 | |
|  |                                             |  |                                              | |
|  |                                             |  | [ v ] Semua siswa lainnya terpantau aman.    | |
|  +---------------------------------------------+  +----------------------------------------------+ |
|                                                                                                    |
|  +-----------------------------------------------------------------------------------------------+ |
|  | KELAS SAYA (AKSES CEPAT)                                                                       | |
|  +-----------------------------------------------------------------------------------------------+ |
|  | [ Kartu XII RPL 1 ]          [ Kartu XI RPL 2 ]           [ Kartu X PPLG 1 ]                  | |
|  | 36 Siswa • 8 Pertemuan       34 Siswa • 7 Pertemuan       36 Siswa • 7 Pertemuan              | |
|  | Rerata: 82.4 • KKTP 88%      Rerata: 79.1 • KKTP 82%      Rerata: 85.0 • KKTP 92%             | |
|  +-----------------------------------------------------------------------------------------------+ |
+----------------------------------------------------------------------------------------------------+
```

---

# 3. Keputusan Kurasi: Apa yang Wajib Tampil vs Apa yang Disingkirkan

### 3.1 TIGA HAL YANG WAJIB LANGSUNG TERLIHAT (Tanpa Scroll):
1. **Kartu Sesi Terdekat (*Hero Active Session*):**
   Memuat jam, ruangan fisik, nama rombel, materi pertemuan, dan tombol aksi utama.
2. **Jadwal Hari Ini yang Ringkas:**
   Daftar alokasi jam mengajar hari ini dengan status centang (selesai / belum).
3. **Antrean Perhatian (*Attention Queue*):**
   Hanya menampilkan nama siswa yang benar-benar membutuhkan tindakan guru (misal: sering membolos, belum mengumpulkan 3 tugas berturut-turut). Jika tidak ada kasus, tampil pesan tenang: *"Semua Siswa Terpantau Optimal"*.

### 3.2 HAL-HAL YANG WAJIB DISINGKIRKAN (*PURGED FROM DASHBOARD*):
* **Dilarang Fake KPI:** Dilarang menampilkan kotak *"Total Jam Terbang Guru: 1.240 Jam"* atau *"Indeks Efektivitas Belajar: 87.6%"* yang tidak ada artinya bagi guru.
* **Dilarang Grafik Garis/Donat Kosong:** Guru tidak membutuhkan chart analitik makro di pagi hari saat hendak masuk kelas.
* **Dilarang Menu Operator/Birokrasi:** Pengaturan Dapodik, penomoran ijazah, dan sinkronisasi server disembunyikan di menu akun terpisah.
* **Dilarang Kotak Abu-abu Kusam:** Seluruh kartu antarmuka menggunakan **Academic Glass UI v1.2** dengan gradien *Deep Translucent Navy/Blue*, aksen border tipis, dan tipografi Plus Jakarta Sans yang jernih.

---

# 4. Fitur Zero-Friction: Tombol Aksi Cepat (*Cockpit Quick Actions*)

Di dalam Hero Card, tersedia 3 tombol sakti yang langsung mengeksekusi tugas tanpa navigasi berbelit:
1. **`[ Buka Kelas Sekarang > ]`:** Membuka ruang kerja kelas terpadu (*Classroom Workspace*).
2. **`[ Presensi Kilat 15 Detik ]`:** Membuka modal popup presensi dengan 1-klik *"Tandai Semua Hadir"*.
3. **`[ Foto Absen AI ]`:** Membuka kamera smartphone untuk memotret lembar daftar hadir kertas fisik jika kelas diadakan di bengkel/lapangan tanpa koneksi laptop.
