# DESIGN SYSTEM MAPPING — ACADEMIC GLASS UI v1.2
## Ruang Pintar — Pemetaan Hasil Discovery ke Sistem Desain Visual

**Dokumen:** Spesifikasi Pemetaan Sistem Desain Visual  
**Status:** PROPOSED — READY FOR HUMAN REVIEW  
**Tanggal:** 22 September 2026  
**Target:** Standar Desain Komponen, Layout, dan Visual Grammar  
**Prinsip Desain:**  
> *"Academic Glass UI v1.2 wajib lulus Purpose Test: Setiap garis border, warna semantik, dan efek transparansi harus memiliki fungsi nyata untuk memudahkan tugas guru dan sekolah, bukan sekadar dekorasi visual artifisial."*

---

# 1. Tata Bahasa Visual (*Visual Grammar*)

```text
+----------------------------------------------------------------------------------------------------+
|                                  STANDAR VISUAL ACADEMIC GLASS UI v1.2                             |
+-------------------+---------------------------------------------+----------------------------------+
| Elemen Desain     | Spesifikasi Teknis Token Tailwind           | Makna & Kegunaan                 |
+-------------------+---------------------------------------------+----------------------------------+
| Permukaan Utama   | `bg-[#070B14]` / `dark:bg-[#070B14]`        | Deep Space Navy (Latar Belakang) |
| Kartu Kaca (Glass)| `bg-slate-900/60 backdrop-blur-xl border-white/10` | Kartu Transparan Bernilai Tinggi|
| Aksen Primer      | Cobalt Blue (`#3B82F6` / `text-blue-500`)   | Aksi Utama, Link Aktif, Fokus    |
| Indikator Sukses  | Emerald Green (`#10B981` / `text-emerald-500`) | Hadir, Tuntas KKTP, Selesai      |
| Peringatan Cepat  | Amber Gold (`#F59E0B` / `text-amber-500`)   | Izin, Perhatian Khusus, Deadline |
| Status Kritis     | Rose Crimson (`#F43F5E` / `text-rose-500`)  | Alpha, Bentrok Jadwal, Belum Nilai|
| Tipografi Teks    | `font-sans` (Plus Jakarta Sans)             | Keterbacaan Luar Biasa di Layar  |
| Tipografi Data    | `font-mono` (Andale Mono / JetBrains Mono)  | Jam Pelajaran, Kode Kelas, Skor  |
+-------------------+---------------------------------------------+----------------------------------+
```

---

# 2. Pemetaan Layout Komponen Inti

---

## 2.1 Hero Area: Kartu Sesi Aktif (*Live Active Session Card*)
* **Tampilan Visual:** Kartu utama di bagian atas dashboard dengan border menyala lembut (*subtle glowing blue border* `border-blue-500/40 shadow-lg shadow-blue-500/5`).
* **Informasi:** Waktu sesi (`07:15 - 08:35`), ruangan fisik (`Lab RPL 2`), nama rombel, materi pertemuan, dan waktu hitung mundur menuju bel.
* **Tombol Aksi Terintegrasi:** Tombol utama `[ Buka Kelas Sekarang > ]` dengan warna Cobalt menyala, didampingi tombol taktis `[ Presensi Kilat 15 Detik ]` (warna Emerald lembut) dan `[ Foto Absen AI ]`.

---

## 2.2 Workspace & Shell Layout
* **Topbar Shell:**
  * Kiri: Logo Ruang Pintar & Komponen *Active Workspace Switcher* dengan dropdown nama sekolah/personal.
  * Tengah: Universal Search Command Palette (`Ctrl+K`).
  * Kanan: Lonceng Notifikasi terkurasi & Avatar profil lingkaran sempurna 44px (`w-11 h-11 rounded-full border border-white/20`).
* **Sidebar Minimalis:**
  * Lebar 240px saat diperluas (*expanded*), 64px saat diciutkan (*icon-only collapsed*).
  * Efek visual: `bg-slate-950/80 backdrop-blur-2xl border-r border-white/10`.
  * Item navigasi aktif memiliki latar biru transparan halus (`bg-blue-600/15 text-blue-400 font-semibold border-l-2 border-blue-500`).

---

## 2.3 Classroom Layout (*Single-Pane Classroom Workspace*)
* **Pola Desain:** Tidak berpindah halaman penuh; navigasi internal berbasis horizontal glass pill tabs:
  `[ Ringkasan ]  [ Presensi ]  [ Jurnal KBM ]  [ Materi ]  [ Tugas ]  [ Penilaian ]  [ CBT ]`
* **Area Kerja Tengah:** Kanvas bersih dengan padding proporsional, menyajikan data spesifik tab yang aktif tanpa gangguan elemen luar.
* **Aksi Kontekstual Mengambang (*Floating Class Actions*):** Tombol tambah tugas atau buat materi selalu tersemat di pojok kanan atas area kerja.

---

## 2.4 Dashboard Layout Grid (Responsif 3-Kolom)
* **Desktop Grid (1440px+):**
  * Baris Atas: Hero Card Sesi Aktif Penuh (Full Width).
  * Baris Tengah: Kolom Kiri (Jadwal Mengajar Hari Ini - 50%) + Kolom Kanan (Antrean Perhatian & Siswa At-Risk - 50%).
  * Baris Bawah: Direktori Kelas Saya Cepat (Grid 3 Kolom Kartu Kelas).
* **Mobile Grid (390px):**
  * Tumpukan vertikal alami (*Single Column Flow*): Hero Card $\rightarrow$ Antrean Perhatian $\rightarrow$ Kelas Saya $\rightarrow$ Bottom Nav Bar.

---

## 2.5 AI Assistant Placement (*Non-Intrusive Drawer*)
* **Posisi Awal:** Mengambang lembut di pojok kanan bawah:  
  `[ ✨ Bantuan Mengajar AI ]` (Tombol Glass Pill kecil, tinggi 40px, tidak menutupi konten kerja).
* **Saat Dibuka:** Meluncur halus (*Slide-over Drawer* lebar 380px dari sisi kanan layar).
* **Interaksi:** Menampilkan saran cerdas (Pertanyaan Pemantik, Ringkasan Penutup, atau Generator Soal Kilat) lengkap dengan tombol **[ Terapkan ke Kelas (1-Klik) ]**.
