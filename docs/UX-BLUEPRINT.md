# UX BLUEPRINT — CETAK BIRU STATE ANTARMUKA PENGGUNA
## Ruang Pintar — Spesifikasi Komprehensif State Layar Utama

**Dokumen:** Cetak Biru State Antarmuka Pengguna (*UX State Blueprint*)  
**Status:** PROPOSED — READY FOR HUMAN REVIEW  
**Tanggal:** 22 September 2026  
**Target:** Seluruh Layar Utama Aplikasi (Frontend & UI Reference)  
**Tujuan:** Menetapkan kontrak rujukan perilaku antarmuka pada setiap kondisi operasional (Normal, Loading, Empty, dan Error State).

---

# 1. Matriks State Layar Utama

```text
+------------------------------------------------------------------------------------------------------------------------------------+
|                                                  MATRIKS STATE ANTARMUKA RUANG PINTAR                                              |
+----+-------------------+-----------------------+-----------------------+-----------------------+-----------------------------------+
| No | Layar Utama       | Informasi Utama       | Aksi Utama (CTA)      | Empty State           | Error State                       |
+----+-------------------+-----------------------+-----------------------+-----------------------+-----------------------------------+
| 1  | Teacher Cockpit   | Hero Sesi Berikutnya, | `[ Buka Kelas ]`      | Ilustrasi Santai:     | Banner Rose: "Gagal memuat jadwal.|
|    | (`SCR-TCH-01`)    | Waktu, Ruang, Rombel  | Cobalt Blue           | "Tidak ada KBM hari   | Tombol [ Coba Lagi ]"             |
|    |                   |                       |                       | ini. Selamat istirahat"|                                  |
+----+-------------------+-----------------------+-----------------------+-----------------------+-----------------------------------+
| 2  | Classroom Hub     | Tab Sesi, Presensi,   | `[ Presensi Kilat ]`  | "Belum ada materi/    | Banner: "Sesi kelas tidak valid.  |
|    | (`SCR-TCH-03`)    | Jurnal, Materi, Nilai | Hijau Emerald         | tugas di kelas ini.   | Kembali ke Beranda"               |
|    |                   |                       |                       | [ + Tambah Pertama ]" |                                   |
+----+-------------------+-----------------------+-----------------------+-----------------------+-----------------------------------+
| 3  | Presensi Modal    | Daftar 36 Siswa &     | `[ Simpan Presensi ]` | "Belum ada siswa      | "Gagal menyimpan presensi. Data   |
|    | (`SCR-TCH-04`)    | Status Hadir/Sakit    | Emerald (1-Ketuk)     | terdaftar di rombel ini| tersimpan di antrean offline"     |
+----+-------------------+-----------------------+-----------------------+-----------------------+-----------------------------------+
| 4  | Smart Gradebook   | Matriks Nilai Siswa & | `[ Terbitkan Nilai ]` | "Belum ada asesmen    | "Format nilai tidak valid (0-100).|
|    | (`SCR-TCH-08`)    | Ambang Batas KKTP     | Cobalt                | formatif/sumatif"     | Baris ditandai merah"             |
+----+-------------------+-----------------------+-----------------------+-----------------------+-----------------------------------+
| 5  | Homeroom Radar    | Kesehatan 36 Siswa &  | `[ Kejar Nilai WA ]`  | "Seluruh siswa hadir  | "Gagal memuat rekap kehadiran     |
|    | (`SCR-HMR-01`)    | Progres Leger Rapor   | Hijau Emerald         | & belum ada catatan"  | rombel. Refresh halaman"          |
+----+-------------------+-----------------------+-----------------------+-----------------------+-----------------------------------+
| 6  | Student Cockpit   | Jadwal Hari Ini &     | `[ Kumpul Tugas ]`    | "Hore! Semua tugas    | "Gagal memuat pengingat tugas.    |
|    | (`SCR-STU-01`)    | Countdown Deadline PR | Cobalt                | tuntas dikerjakan"    | Tarik layar untuk refresh"        |
+----+-------------------+-----------------------+-----------------------+-----------------------+-----------------------------------+
| 7  | CBT Player        | Naskah Soal & Countdown| `[ Kirim Ujian ]`    | "Ujian belum dimulai /| Dialog Tenang: "Koneksi terputus. |
|    | (`SCR-STU-03`)    | Server-Authoritative  | Hijau Aman            | naskah soal kosong"   | Jawaban aman di memori HP"        |
+----+-------------------+-----------------------+-----------------------+-----------------------+-----------------------------------+
| 8  | Guardian Portal   | Status Hadir 07:15 &  | `[ Ajukan Izin ]`     | "Belum ada riwayat    | "Gagal memverifikasi status anak. |
|    | (`SCR-GRD-01`)    | Pengawasan Tugas PR   | Amber Gold            | ketidakhadiran"       | Hubungi pihak tata usaha"         |
+----+-------------------+-----------------------+-----------------------+-----------------------+-----------------------------------+
```

---

# 2. Standar Tiga State Antarmuka (*Standard UI States*)

---

## 2.1 Loading State (*Academic Shimmer Skeleton*)
* **Aturan:** Dilarang menggunakan *spinner loading* memutar yang membosankan di tengah layar kosong.
* **Penerapan:** Menggunakan **Academic Shimmer Skeleton**:
  * Blok abu-abu transparan (`bg-slate-800/40 animate-pulse rounded-xl`) yang memiliki ukuran dan proporsi persis sama dengan kartu data yang sedang dimuat (Hero card, baris tabel siswa, kartu tugas).
  * Memberikan persepsi kecepatan render instan (*perceived performance*).

---

## 2.2 Empty State (*Actionable Guidance*)
* **Aturan:** Dilarang menampilkan layar kosong melompong dengan teks dingin: *"Data Tidak Ditemukan"*.
* **Penerapan:** Seluruh *Empty State* wajib ramah dan memandu tindakan berikutnya:
  * **Ilustrasi & Pesan Bersahabat:** Ikon lembut yang relevan dengan konteks.
  * **Contoh di Kelas Saya (Belum Ada Rombel):**  
    *"Anda belum menambahkan kelas mengajar semester ini. Mari siapkan kelas pertama Anda dalam 2 menit."*
  * **Tombol Aksi Pembuka:** Tombol besar yang langsung menyelesaikan masalah: `[ + Tambah Kelas Baru ]` atau `[ Import Excel ]`.

---

## 2.3 Error State (*Safe Recovery & Offline Resilience*)
* **Aturan:** Dilarang membocorkan *stack trace* teknis database (`PrismaError`, `500 Server Crash`) kepada pengguna.
* **Penerapan:**
  * **Pesan Ramah Domain:**  
    *"Koneksi internet sekolah sedang tidak stabil. Data presensi Anda telah diamankan di memori smartphone dan akan otomatis dikirim saat sinyal pulih."*
  * **Tombol Pemulihan:** Tombol `[ Coba Kirim Ulang ]` atau `[ Unduh File Cadangan Offline ]`.
  * **Integritas Visual:** Menggunakan aksen Rose Crimson lembut (`bg-rose-500/10 border-rose-500/30 text-rose-300`) yang tidak membuat guru panik.
