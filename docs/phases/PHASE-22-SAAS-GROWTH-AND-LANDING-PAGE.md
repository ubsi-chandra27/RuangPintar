# PHASE 22 — SAAS GROWTH ENGINE: LANDING PAGE, LIVE PRESENCE & DEVICE TRACKING, AND SCHOOL PROPOSAL GENERATOR
## Ruang Pintar — School Digital Operating Platform

**Versi:** 1.0  
**Status:** READY FOR HUMAN REVIEW  
**Tanggal:** 18 September 2026  
**Penyusun:** Antigravity AI Coding Agent  
**Modul Induk:** SaaS Growth, Device Intelligence & School Procurement  
**Dokumen Referensi:**
- `AGENTS.md` (Domain Invariants & UI Reference = Contract)
- `docs/03-MODULE-MAP.md` (M21 AI Assistance & Smart Onboarding)
- `docs/04-ROLE-ACCESS.md` (Self-Service Registration & Freemium Role Scopes)
- `docs/05-SYSTEM-ARCHITECTURE.md` (SaaS Multi-School Architecture & Session Telemetry)
- `docs/BRD.md`, `docs/PRD.md`, `docs/FRD.md`

---

# 1. Ringkasan Eksekutif

Phase 22 mengeksekusi strategi pertumbuhan SaaS (*Growth Engine*) terpadu untuk platform **Ruang Pintar**. Berangkat dari kesepakatan bisnis model SaaS dengan masa **Coba Gratis 30 Hari (30-Day Full-Access Free Trial)**, platform kini dilengkapi dengan tiga instrumen kunci:

1. **Conversion-Focused Landing Page Publik (`/`)**:
   - Etalase utama yang menjelaskan proposisi nilai unik: *Otomasi Absensi & Nilai Sekolah dalam 5 Detik* dengan teknologi **Photo-to-Class Vision AI**.
   - Menampilkan **Testimoni Otentik** dari guru dan pimpinan sekolah (Ibu Wardah Ulfah Fauzziyah, S.Pd., Pak Eri Chandra Apriyadi, S.Kom., dan Mitra Kepala Sekolah Drs. H. Suryadi, M.M.).
   - Menyajikan matriks biaya transparan: **Guru Starter (Coba Gratis 30 Hari, Rp 0)**, **Paket Guru Pro (Rp 15.000 / bulan)**, dan **Lisensi Sekolah Resmi (Rp 1,5 Juta – 3 Juta / tahun, Dana BOS Ready)**.
   - Dilengkapi FAQ, jaminan keamanan data (data tidak dihapus setelah masa coba habis), serta CTA cepat ke formulir pendaftaran mandiri (`/register`).

2. **User-Agent Telemetry & Live Presence Tracking**:
   - Mendeteksi jenis perangkat secara cerdas dari session `user_agent`: membedakan **HP/Smartphone** (Samsung Galaxy, iPhone, Xiaomi, Oppo, Vivo, dll.), **Komputer/PC** (Windows PC, Mac, Linux), serta versi browser.
   - Menghitung status kehadiran (*Presence State*): **Online Sekarang (🟢)** jika aktif < 5 menit yang lalu, **Aktif X Menit Lalu (🟡)** jika < 60 menit, atau tanggal offline terakhir.
   - Terintegrasi langsung pada **Dashboard Super Admin** (*Widget Perangkat & Sesi Aktif*) untuk memantau distribusi perangkat guru (Ponsel vs Komputer) secara real-time.
   - Terintegrasi pada **Daftar Pendidik & Penugasan (`/guru-pengajaran`)** sehingga pimpinan/admin sekolah dapat melihat langsung guru mana yang sedang aktif menggunakan HP di lab/bengkel vs laptop.

3. **Dokumen Usulan Pengadaan Lisensi Sekolah (Dana BOS B2B Proposal)**:
   - Instrumen konversi *bottom-up*: guru mandiri yang puas menggunakan Ruang Pintar dapat langsung mencetak dokumen usulan resmi ke Kepala Sekolah dan Bendahara BOS via tombol *“Cetak Usulan ke Kepsek”* di banner uji coba dashboard.
   - Dilengkapi KOP resmi institusi (*RUANG PINTAR EDUTECH INDONESIA*), nomor surat penawaran, justifikasi juknis Permendikbudristek pemanfaatan Dana BOS (Komponen Digitalisasi Pembelajaran & Administrasi), 4 pilar manfaat strategis, estimasi rincian biaya, serta kelengkapan SPJ resmi (Faktur Pajak/Invoice, Kuitansi Bermeterai, Berita Acara Serah Terima / BAST).

---

# 2. Files Created & Modified

### New Components & Utilities:
1. `src/shared/lib/device-detector.ts`:
   - Engine detektor user-agent dan kalkulator status presence (`parseUserAgent`, `calculatePresence`).
2. `src/modules/school/presentation/school-proposal-modal.tsx`:
   - Modal dokumen usulan pengadaan lisensi sekolah resmi siap cetak/unduh PDF dengan KOP surat institusional, justifikasi BOS, dan tombol direct WhatsApp konsultasi B2B.
3. `src/test/auth/device-detector.test.ts`:
   - Unit tests untuk parser perangkat Android/Samsung, iPhone/iOS, Windows PC Chrome, dan kalkulasi interval presence (4/4 PASS).
4. `src/test/school/school-proposal-modal.test.tsx`:
   - Component tests untuk verifikasi rendering KOP proposal, breakdown Dana BOS, kelengkapan SPJ, dan trigger aksi cetak (4/4 PASS).
5. `scripts/qa-phase22-visual-walkthrough.mjs`:
   - Script otomatis Playwright untuk memvalidasi visual dan mengambil 6 artefak tangkapan layar komprehensif.

### Modified Files:
6. `src/app/page.tsx`:
   - Merombak halaman depan menjadi Landing Page SaaS publik berbasis Academic Glass UI dengan hero section, demo Vision AI, testimoni guru, paket harga, FAQ, dan state aware authentication.
7. `src/modules/teacher/domain/teacher-types.ts`:
   - Menambahkan field telemetry pada `TeacherProfileDTO`: `perangkat_terakhir`, `kategori_perangkat`, `terakhir_aktif_pada`, `status_kehadiran`, dan `label_kehadiran`.
8. `src/modules/teacher/infrastructure/teacher-repository.ts`:
   - Mengambil session pengguna terbaru guru dan mengolah user-agent serta presence menggunakan `parseUserAgent` dan `calculatePresence`.
9. `src/modules/teacher/presentation/teachers-view.tsx`:
   - Menampilkan badge kehadiran hijau (*Online Sekarang*) dan label perangkat (*Komputer PC / HP Samsung Galaxy*) pada tabel desktop maupun card mobile.
10. `src/shared/components/dashboard/role-views/super-admin-dashboard.tsx`:
    - Menambahkan widget audit live: Distribusi Perangkat (Ponsel HP % vs Komputer %) dan daftar sesi guru terbaru dengan status online real-time.
11. `src/modules/ai-assistant/presentation/trial-banner.tsx`:
    - Menghubungkan tombol *“Cetak Usulan ke Kepsek”* ke `SchoolProposalModal`.
12. `src/test/smoke.test.tsx`:
    - Menyesuaikan smoke test landing page untuk memvalidasi judul hero, CTA Coba Gratis 30 Hari, dan opsi Masuk Akun.

---

# 3. Quality Gates Verification

| Quality Gate | Hasil | Keterangan |
|---|---|---|
| **Typecheck** (`npm run typecheck`) | **PASS** | 0 TypeScript errors pada seluruh proyek. |
| **Linting** (`npm run lint`) | **PASS** | 0 ESLint errors dan 0 warnings pada file yang dimodifikasi. |
| **Code Formatting** (`npm run format:check`) | **PASS** | Memenuhi format standar Prettier. |
| **Targeted Unit Tests** | **PASS (11/11)** | `device-detector.test.ts` (4/4), `school-proposal-modal.test.tsx` (4/4), `smoke.test.tsx` (3/3). |
| **Full Regression Test Suite** | **PASS (502/502)** | Seluruh 90 file pengujian dan 502 skenario unit test lulus 100%. |
| **Production Build** (`npm run build`) | **PASS** | Next.js 16.3.3 Turbopack build sukses mengompilasi 37 routes statis dan dinamis. |
| **Visual QA Walkthrough** | **PASS (6/6)** | Seluruh tangkapan layar tersimpan pada direktori `docs/phases/screenshots/phase-22-walkthrough/`. |

---

# 4. Bukti Visual QA (Screenshots)

Berikut 6 artefak tangkapan layar resmi yang dihasilkan Playwright:

1. **`01-landing-page-hero.png`**:
   - Tampilan hero landing page publik dengan judul "Otomasi Absensi & Nilai Sekolah dalam 5 Detik", CTA Coba Gratis 30 Hari, dan diagram alur Photo-to-Class Vision AI.
2. **`02-landing-page-features-and-testimonials.png`**:
   - Bagian testimoni otentik dengan foto profil/avatar dari Ibu Wardah Ulfah Fauzziyah, S.Pd. (SMA PGRI 1 Bekasi), Pak Eri Chandra Apriyadi, S.Kom. (SMK Otomindo), dan Drs. H. Suryadi, M.M. (Mitra Kepala Sekolah).
3. **`03-landing-page-pricing-and-faq.png`**:
   - Kartu harga transparan 3 tingkat: Coba Gratis 30 Hari (Rp 0), Guru Pro (Rp 15.000/bln), Lisensi Sekolah Resmi (Dana BOS Ready), serta FAQ jaminan data aman.
4. **`04-superadmin-dashboard-device-distribution.png`**:
   - Dashboard Super Administrator menampilkan widget "Perangkat & Sesi Aktif" dengan indikator Live Audit, persentase HP (14%) vs Komputer (86%), dan log sesi guru.
5. **`05-guru-pengajaran-device-and-presence.png`**:
   - Halaman `/guru-pengajaran` menampilkan profil Pak Eri Chandra Apriyadi, S.Kom. dengan badge `🟢 Online Sekarang` dan detail perangkat `💻 Komputer PC (Google Chrome)`.
6. **`06-school-proposal-modal.png`**:
   - Modal dokumen usulan pengadaan lisensi Dana BOS dengan format KOP resmi institusi, rincian dasar hukum pengadaan, 4 pilar digitalisasi, dan opsi aksi Cetak/Simpan PDF.

---

# 5. Status & Rekomendasi

Phase 22 telah selesai secara menyeluruh tanpa regresi fungsional maupun pelanggaran batasan lisensi multi-sekolah.

**STATUS: READY FOR HUMAN REVIEW**
