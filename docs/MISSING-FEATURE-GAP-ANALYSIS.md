# MISSING FEATURE GAP ANALYSIS — SCHOOL OPERATIONAL READINESS
## STAGE 10.7: Analisis Kesenjangan Fitur untuk Kebutuhan Operasional Sekolah Riil

| Atribut | Nilai Faktual |
| --- | --- |
| **Produk** | Ruang Pintar — Evaluasi Kesiapan Operasional Sekolah |
| **Fokus Modul** | CBT Engine, Buku Nilai / Gradebook, dan Teacher Workspace |
| **Tanggal Analisis** | 24 September 2026 |
| **Kriteria Kesiapan** | Kesiapan Operasional Penuh Ujian Sekolah & Pembelajaran Berbasis Data |

---

## 1. Matriks Ringkasan Gap Fitur

Dari hasil audit terhadap implementasi saat ini, ditemukan **10 kesenjangan fitur operasional utama** yang harus dipenuhi agar modul dapat digunakan oleh sekolah nyata tanpa hambatan:

| No | Fitur yang Hilang | Status Saat Ini di Repository | Kebutuhan Riil Operasional Sekolah | Dampak Operasional Jika Belum Ada |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **Live Monitoring Peserta Realtime** | Belum Ada (Hanya query statis di database) | Dashboard proktor memantau seluruh siswa di ruangan secara realtime (posisi soal, timer, koneksi). | Pengawas tidak tahu siswa mana yang sedang mengerjakan dan siapa yang macet. |
| **2** | **Status Login & Multi-Device Control** | Belum Ada | Mencegah 1 akun siswa login di 2 HP/laptop bersamaan saat ujian berlangsung. | Potensi joki ujian atau berbagi akun di ruang terpisah. |
| **3** | **Dynamic Token Management** | Statis / Opsional | Generate token baru 6 digit acak per sesi, auto-refresh 15 menit, validasi server-side. | Token bocor ke kelas lain yang belum giliran ujian. |
| **4** | **Publish / Unpublish / Schedule State** | Status enum statis sederhana | Kontrol pembukaan gerbang ujian: Jadwal rilis, pause sementara saat gangguan, unpublish darurat. | Soal dapat diakses siswa sebelum jadwal resmi dimulai. |
| **5** | **State Machine Ujian Terpadu** | State terbatas di tabel `ujian_cbt` | Transisi status terstandarisasi: Draft $\rightarrow$ Terbit $\rightarrow$ Berlangsung $\rightarrow$ Selesai $\rightarrow$ Dinilai $\rightarrow$ Dibukukan. | Guru bingung tahapan ujian dan kapan nilai resmi bisa masuk rapor. |
| **6** | **Rekap Hasil Ujian Terpadu** | Tampilan ringkas nilai mentah | Matriks lengkap: Nama, NIS, Jumlah Benar, Jumlah Salah, Nilai PG, Nilai Esai, Nilai Akhir, Status Ketuntasan. | Guru harus menghitung manual satu per satu. |
| **7** | **Distribusi Nilai & Histogram** | Belum Ada | Grafik sebaran nilai (kurva lonceng), rata-rata, standar deviasi, persentase tuntas KKTP. | Sekolah tidak memiliki bukti visual capaian kompetensi rombel. |
| **8** | **Analisis Tingkat Kesukaran ($P$)** | Belum Ada | Pengelompokan butir soal otomatis: Kategori Mudah ($P > 0.70$), Sedang ($0.30 - 0.70$), Sukar ($P < 0.30$). | Guru tidak tahu soal mana yang terlalu mudah atau tidak wajar sulitnya. |
| **9** | **Analisis Daya Pembeda ($D$) & Distraktor** | Belum Ada | Mengidentifikasi soal bermasalah/rancu (indeks diskriminasi $D < 0.20$) dan sebaran opsi pengecoh. | Kualitas bank soal sekolah tidak pernah terkalibrasi secara ilmiah. |
| **10** | **Ekspor Hasil Resmi (Excel & PDF)** | Belum Ada | Ekspor format lembar nilai resmi sekolah ber-kop surat dan file Excel siap impor ke Dapodik/e-Rapor. | Guru membuang waktu menyalin nilai secara manual. |

---

## 2. Rincian Teknis Kesenjangan Fitur (Deep-Dive)

### 2.1. Live Monitoring Peserta Ujian (Proctoring Cockpit)
- **Kondisi Kode Saat Ini:**
  Tabel `event_integritas_ujian` sudah ada di skema Prisma untuk mencatat log `TAB_SWITCH`, `FULLSCREEN_EXIT`, dll. Namun belum ada antarmuka realtime bagi pengawas untuk melihat event tersebut saat ujian berlangsung.
- **Kebutuhan Teknis:**
  1. Endpoint server / SSE (Server-Sent Events) atau polling ringan (heartbeat 5 detik) untuk memperbarui status pengerjaan siswa.
  2. Komponen UI `LiveProctorGrid`: kartu mini per siswa dengan indikator warna (Hijau: Aktif, Merah: Terkunci, Kuning: Peringatan, Abu-abu: Belum Masuk).
  3. Action `unlockStudentSession(sesiUjianId)` untuk membuka kembali siswa yang terkunci.

---

### 2.2. Manajemen Token Dinamis (Dynamic Token Management)
- **Kondisi Kode Saat Ini:**
  Field `token_masuk` pada model `UjianCbt` bersifat statis.
- **Kebutuhan Teknis:**
  1. Tombol `[ Generate Token Baru ]` pada Proctor Cockpit yang mengupdate string token 6 karakter uppercase.
  2. Riwayat token per sesi ujian dengan waktu rilis.
  3. Validasi token wajib di-resolve server-side sebelum membuat record `SesiUjianSiswa`.

---

### 2.3. Analisis Butir Soal Ilmiah (Psychometric Item Analysis)
- **Kondisi Kode Saat Ini:**
  Tabel `jawaban_siswa` menyimpan pilihan jawaban siswa (`jawaban_pilihan`), namun tidak ada kalkulator statistik yang memprosesnya.
- **Kebutuhan Teknis:**
  Service domain baru: `ItemAnalysisService` yang menghitung:
  - **Tingkat Kesukaran ($P$):**
    $$P = \frac{\text{Jumlah Siswa Menjawab Benar}}{\text{Total Siswa yang Mengerjakan}}$$
  - **Daya Pembeda ($D$):**
    Membagi siswa menjadi 27% kelompok atas ($U$) dan 27% kelompok bawah ($L$):
    $$D = \frac{U_{\text{benar}} - L_{\text{benar}}}{n}$$
    Jika $D < 0.20$, berikan rekomendasi visual: *"Butir soal perlu direvisi atau dibuang karena membingungkan siswa"*.
  - **Efektivitas Distraktor:**
    Tampilkan persentase pemilihan opsi A, B, C, D, E. Jika ada opsi yang dipilih 0% siswa, beri peringatan: *"Pengecoh tidak berfungsi"*.

---

### 2.4. Integrasi Satu-Klik ke Buku Nilai (Gradebook Synchronization)
- **Kondisi Kode Saat Ini:**
  Tabel `nilai_siswa` (modul Penilaian) dan `hasil_ujian_cbt` (modul CBT) saat ini terpisah. Guru harus menginput manual nilai ujian ke buku nilai rombel.
- **Kebutuhan Teknis:**
  Server Action `syncCbtScoreToGradebookAction(ujianId, asesmenId)` yang membaca seluruh `hasil_ujian_cbt` dan membuat/mengupdate record `nilai_siswa` secara atomik dalam database transaction.

---

### 2.5. Ekspor Hasil Ujian (Format Excel & Cetak PDF)
- **Kondisi Kode Saat Ini:**
  Tersedia halaman cetak kartu ujian `/cbt/cetak/[ujianId]`, namun belum ada ekspor rekapitulasi nilai kelas.
- **Kebutuhan Teknis:**
  1. Generator berkas Excel (.xlsx / CSV) yang memuat rekapitulasi nilai dengan kolom: Nomor, NIS, Nama Lengkap, Benar, Salah, Skor Mentah, Nilai Akhir, dan Status Kelulusan KKTP.
  2. Tampilan cetak PDF ramah printer (*print-optimized stylesheet*) dengan Kop Surat resmi SMK OTOMINDO, tanda tangan guru pengampu, dan tanda tangan kepala sekolah.
