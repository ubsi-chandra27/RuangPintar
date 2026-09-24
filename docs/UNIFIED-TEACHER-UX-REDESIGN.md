# UNIFIED TEACHER UX REDESIGN SPECIFICATION
## STAGE 10.7: Standarisasi Pengalaman Visual & Desain Sistem Teacher Workspace

| Atribut | Nilai Faktual |
| --- | --- |
| **Produk** | Ruang Pintar — Teacher Workspace |
| **Baseline UX Acuan** | Teacher Cockpit Dashboard (`src/shared/components/dashboard/role-views/teacher-dashboard.tsx`) |
| **Gaya Desain** | Academic Glass UI v1.2 (Modern, Clean, Academic, Controlled Glass, Anti-Slop) |
| **Tanggal Terbit** | 24 September 2026 |
| **Status Dokumen** | **PROPOSED ARCHITECTURE & DESIGN CONTRACT** |

---

## 1. Analisis Benchmark: Mengapa Dashboard Guru Menjadi Standar Emas?

Dashboard Guru (`/dashboard`) yang diimplementasikan pada `teacher-dashboard.tsx` telah terbukti secara empiris memberikan pengalaman visual terbaik (*craftsmanship*) pada platform Ruang Pintar karena mematuhi kriteria kunci:

1. **Academic Glass UI Terukur (Dose Cap Compliance):**
   Efek glassmorphism (`backdrop-blur-xl`) digunakan secara presisi pada wadah kartu utama, bukan pada seluruh elemen secara sembarangan (mematuhi aturan R-10 anti-slop).
2. **First-Class Dark Mode Treatment:**
   Penggunaan warna `dark:bg-slate-900/75` dipadukan dengan border semitransparan `dark:border-blue-500/25` serta ambient shadow biru elektrik `dark:shadow-[0_0_35px_-5px_rgba(37,99,235,0.18)]`, memberikan kedalaman visual (*visual depth*) yang tenang dan elegan tanpa menyilaukan mata guru saat malam hari.
3. **Karakter Tipografi Akademik Modern:**
   Angka metrik, persentase, kode rombel, dan badge status konsisten menggunakan `font-mono` tebal (`font-black tracking-tight`), membedakan data kuantitatif dari teks narasi biasa (`font-sans`).
4. **Hero Banner Pop-Out 3D:**
   Header halaman memiliki kepribadian visual yang kuat dengan maskot astronot 3D pop-out (`/images/illustrations/astronaut-desk-hero.png`) yang melompat keluar dari garis pembatas kartu, menghilangkan kesan kaku aplikasi administrasi konvensional.
5. **Hierarki Grid 12 Kolom:**
   Pemisahan workspace kerja utama (8 kolom) dan timeline agenda mengajar (4 kolom) memberikan ritme visual yang seimbang pada layar desktop dan melipat rapi pada layar mobile.

---

## 2. Audit Komparatif: Ketimpangan Visual Antar Halaman

Audit menyeluruh terhadap 8 halaman pendukung Teacher Workspace menemukan **inkonsistensi desain yang masif** jika dibandingkan dengan Dashboard Guru:

| Komponen Desain | Standar Dashboard Guru (Gold Standard) | Halaman Lain (/jadwal-saya, /sesi-pembelajaran, /kalender-akademik, /penilaian, /cbt-ujian) | Status Deviasi & Masalah |
| :--- | :--- | :--- | :---: |
| **Dark Mode Treatment** | `dark:bg-slate-900/75 dark:border-blue-500/25 dark:shadow-[0_0_35px_-5px_...]` | Menggunakan kartu putih solid: `bg-white border-slate-100/90` tanpa token `dark:` | **KRITIS: Tampilan rusak/putih menyala di Dark Mode** |
| **Warna Teks Utama** | `text-slate-900 dark:text-white` | `text-[#0F172A]` statis tanpa alternatif dark mode | **KRITIS: Kontras teks hilang di mode gelap** |
| **Border Radius** | Wadah utama: `rounded-[28px]`, kartu anak: `rounded-2xl`, tombol: `rounded-xl` | Bervariasi tidak beraturan: `rounded-3xl`, `rounded-2xl`, `rounded-xl`, `rounded-lg` | **SEDANG: Tidak ada konsistensi radius** |
| **Tipografi Angka** | `font-mono font-black tracking-tight text-3xl` | Font sans standar `font-bold text-slate-800` | **SEDANG: Angka terasa seperti teks biasa** |
| **Bayangan (Shadow)** | Ambient glow halus: `shadow-xs dark:shadow-[0_0_30px_-5px_rgba(37,99,235,0.16)]` | Menggunakan shadow kaku: `shadow-[0_4px_24px_rgba(0,0,0,0.03)]` atau `shadow-xs` datar | **TINGGI: Hilangnya kedalaman visual** |
| **Hero Header** | Pop-out visual interaktif dengan sapaan nama gelar personal | Kotak putih datar dengan icon standar di pojok kanan | **TINGGI: Terasa seperti template terpisah** |
| **Empty State** | Informatif dengan ilustrasi dan tombol aksi langsung | Teks abu-abu pasif "Tidak ada data" atau tabel kosong | **TINGGI: Guru bingung harus melakukan apa** |
| **Tombol CTA** | `rounded-xl bg-[#2563EB] shadow-xs active:scale-95 transition-all` | Tombol bervariasi: ada yang `rounded-full`, `rounded-lg`, ada yang tanpa efek active | **SEDANG: Sensasi klik inkonsisten** |

---

## 3. Rincian Temuan per Halaman

### 3.1. Halaman Jadwal Saya (`/jadwal-saya`)
- **Masalah Utama:** Hero card menggunakan `bg-white border border-slate-100/90` dan teks `text-[#0F172A]` tanpa dukungan dark mode. Saat pengguna beralih ke mode gelap, header jadwal tetap berwarna putih terang.
- **Hierarki:** Stat badge `Total Sesi`, `Mata Pelajaran`, `Rombel` menggunakan badge lonjong kecil yang tidak sejajar dengan gaya kartu KPI dashboard.

### 3.2. Halaman Sesi KBM Pembelajaran (`/sesi-pembelajaran`)
- **Masalah Utama:** Menyalin pola kartu putih dari `/jadwal-saya` tanpa token dark mode. Kartu status sesi KBM menggunakan rounded-3xl dan grid tombol aksi yang berbeda dengan tombol di dashboard.
- **Ketiadaan Data:** Bila tidak ada sesi kelas, list hanya menampilkan kotak abu-abu tanpa panduan cara membuat sesi baru secara cepat.

### 3.3. Halaman Kalender Akademik (`/kalender-akademik`)
- **Masalah Utama:** Format kartu hero identik dengan `/jadwal-saya` (terkena bug dark mode yang sama).
- **Statistik:** Tiga badge metrik (`Total Agenda`, `Hari Libur`, `Periode Ujian`) diletakkan di dalam hero tanpa visual pemisah kartu KPI modern.

### 3.4. Halaman Presensi Kehadiran Kelas (`/presensi-kelas`)
- **Masalah Utama:** Hero card putih tanpa dark mode. Tabel rekap absensi menggunakan styling border konvensional yang tidak memiliki nuansa Academic Glass.
- **Button Styling:** Tombol aksi panggil modal presensi menggunakan warna dan padding yang berbeda dengan Teacher Cockpit.

### 3.5. Halaman Buku Nilai & Penilaian TP (`/penilaian`)
- **Masalah Utama:** Kartu penugasan kelas menggunakan `rounded-2xl bg-white border border-slate-200/80` yang datar. Tidak ada efek hover lift `-translate-y-0.5` dan tidak ada ambient shadow khas Ruang Pintar.
- **Visual Rata-rata:** Nilai rata-rata ditampilkan dengan font sans kecil di dalam kotak abu-abu tipis, bukan dengan visual badge KPI yang jelas.

### 3.6. Halaman CBT Ujian Online (`/cbt-ujian`)
- **Masalah Utama:** Header dan kartu KPI menggunakan `rounded-2xl bg-white border border-slate-200/80 p-4` tanpa adaptasi dark mode.
- **Tampilan Daftar Ujian:** Daftar ujian di bawah kelas ditampilkan sebagai list statis tanpa indikator status pelaksanaan yang jelas (apakah sedang berjalan, belum dimulai, atau telah selesai).

### 3.7. Halaman Studio Asisten AI Guru (`/asisten-ai`)
- **Masalah Utama:** Tab navigasi atas (Soal, RPP, Materi, Pengaturan) menggunakan warna abu-abu netral yang datar. Panel hasil generate AI belum menggunakan container Glass yang serasi dengan card hero dashboard.

---

## 4. Unified Teacher Workspace Design System

Untuk mengeliminasi seluruh inkonsistensi tersebut, seluruh halaman Teacher Workspace diwajibkan mengadopsi standarisasi komponen terpadu berikut:

### 4.1. Design Tokens & Palette
```css
/* Surface Tokens */
--surface-card-light: #FFFFFF;
--surface-card-dark: rgba(15, 23, 42, 0.75); /* slate-900/75 with backdrop-blur-xl */
--border-card-light: rgba(226, 232, 240, 0.8); /* slate-200/80 */
--border-card-dark: rgba(59, 130, 246, 0.22);  /* blue-500/22 */
--shadow-glow-dark: 0 0 30px -5px rgba(37, 99, 235, 0.16);

/* Radius Tokens */
--radius-parent-shell: 28px; /* rounded-[28px] untuk kartu wadah utama */
--radius-subcard: 20px;      /* rounded-[20px] untuk kartu item/grid */
--radius-control: 12px;      /* rounded-xl untuk input, button, select */
--radius-pill: 9999px;       /* rounded-full untuk badge status & chips */

/* Typography Tokens */
--font-brand-number: var(--font-mono); /* Seluruh angka, persentase, kode wajib font-mono */
--font-brand-body: var(--font-sans);
```

### 4.2. Standar Anatomi Halaman Teacher Workspace
Setiap halaman dalam Teacher Workspace wajib memiliki struktur layout 4 zona:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 1. UNIFIED HERO BANNER (Rounded-[28px], Dark-mode Glass, Pop-Out Visual) │
│    - Breadcrumb subtle                                                 │
│    - Badge Kategori (Pill Glass)                                       │
│    - H1 Judul Halaman (font-extrabold text-slate-900 dark:text-white)   │
│    - Narasi tujuan fungsional halaman                                  │
│    - Quick KPI Badges / Aksi Cepat Utama                               │
├────────────────────────────────────────────────────────────────────────┤
│ 2. METRIC STRIP / STATS CARDS (4 Kolom / 2x2 Responsive)               │
│    - Nilai metrik (font-mono font-black text-2xl/3xl)                  │
│    - Label metrik deskriptif & status pembanding                       │
├────────────────────────────────────────────────────────────────────────┤
│ 3. ACTION & FILTER TOOLBAR (Rounded-2xl Glass Container)               │
│    - Pencarian teks terintegrasi                                       │
│    - Filter Tingkat / Rombel / Mapel (Select/Chips)                    │
│    - Tombol Aksi Primer (+ Buat / Tambah)                              │
├────────────────────────────────────────────────────────────────────────┤
│ 4. MAIN CONTENT AREA (Grid Kartu Seragam / Tabel Ringkas)              │
│    - Hover lift effect (-translate-y-0.5, border highlight)            │
│    - Informative & Actionable Empty State jika 0 data                  │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.3. Aturan Dark Mode & Anti-Slop Baku
1. **Dilarang keras menggunakan `bg-white` polos tanpa padanan `dark:bg-slate-900/...`.**
2. **Dilarang menggunakan `text-[#0F172A]` tanpa padanan `dark:text-white`.**
3. **Glassmorphism hanya boleh diterapkan pada wadah level-1 (Hero & Main Container), elemen level-2 (input & child card) menggunakan solid matte background untuk menjaga kontras bacaan.**
4. **Semua tombol interaktif wajib memiliki feedback visual `active:scale-95` dan transisi `duration-200`.**
