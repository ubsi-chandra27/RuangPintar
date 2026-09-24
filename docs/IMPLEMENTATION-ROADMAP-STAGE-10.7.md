# IMPLEMENTATION ROADMAP — STAGE 10.7
## Rencana Aksi Eksekusi Perbaikan Integritas Data, Desain Sistem, & Engine CBT

| Atribut | Nilai Faktual |
| --- | --- |
| **Tahap** | STAGE 10.7 — Implementation Execution Blueprint |
| **Pendekatan** | Bertahap, Aman, Zero-Regression, Risk-Based Quality Gates |
| **Target Eksekusi** | Teacher Workspace, CBT Examination Engine, & Unified Design System |
| **Tanggal Terbit** | 24 September 2026 |
| **Status Dokumen** | **PROPOSED ROADMAP (Awaiting Human Approval)** |

---

## 1. Ikhtisar Tahapan Eksekusi

Pekerjaan implementasi dibagi menjadi **4 fase terukur** untuk memastikan setiap perbaikan dapat diverifikasi secara independen tanpa menimbulkan regresi pada fungsionalitas yang telah stabil:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ FASE 1: Business Reality Remediation (Integritas Data Murni)           │
│         - Hapus fallback nilai 88.0 / 85.0 pada Teacher Dashboard      │
│         - Hitung presensi dan jurnal nyata (hapus asumsi 100%)         │
│         - Terapkan status kontekstual "Belum Dijadwalkan / Disusun"    │
├────────────────────────────────────────────────────────────────────────┤
│ FASE 2: Unifikasi Visual Design System (Academic Glass UI v1.2)        │
│         - Perbaiki bug dark mode pada 5 halaman hero card              │
│         - Terapkan font-mono pada seluruh metrik dan kode              │
│         - Seragamkan border radius ([28px] wadah, 20px card, 12px btn) │
│         - Buat komponen Hero Pop-Out seragam untuk seluruh workspace   │
├────────────────────────────────────────────────────────────────────────┤
│ FASE 3: CBT Operational Engine Transformation                          │
│         - Bangun Proctor Cockpit (Live Monitoring peserta realtime)    │
│         - Implementasikan Dynamic Token Generator (6 digit acak)       │
│         - State Machine Ujian (Draft -> Terbit -> Live -> Selesai)     │
│         - Antarmuka Penilaian Esai Manual per Siswa                    │
├────────────────────────────────────────────────────────────────────────┤
│ FASE 4: Educational Psychometrics & Gradebook Integration              │
│         - Algoritma Analisis Butir Soal (Tingkat Kesukaran & Beda)     │
│         - Sinkronisasi Satu-Klik Nilai CBT ke Buku Nilai / Gradebook   │
│         - Generator Ekspor Rekap Nilai (Format Excel & Cetak PDF)      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Rincian Teknis per Fase

### FASE 1: Business Reality Remediation
* **Tujuan:** Menjamin seluruh angka dan teks yang tampil di layar 100% berbasis fakta database pengguna.
* **Tugas Spesifik:**
  1. `src/shared/components/dashboard/role-views/teacher-dashboard.tsx`:
     - Ganti fallback `88.0 : 85.0` menjadi `null`. Jika belum ada nilai, tampilkan `0%` dengan teks *"Belum Ada Nilai Masuk"*.
     - Hitung kehadiran siswa hari ini dari data riil tabel `presensi_sesi_kelas`.
     - Hitung status jurnal dari keterisian tabel `administrasi_pembelajaran`.
  2. `src/app/jadwal-saya/page.tsx`:
     - Ganti label *"Total Sesi: 0 Jam"* dengan badge status *"Belum Dijadwalkan"* jika entri jadwal masih kosong.
  3. `src/modules/learning/presentation/teacher-classes-view.tsx`:
     - Tambahkan status interaktif *"Belum disusun"* pada kelas yang memiliki `total_bab === 0`.
* **Kriteria Verifikasi (Quality Gate 1):**
  - Akun Pak Eri Chandra di SMK OTOMINDO menampilkan metrik 0 secara jujur dan kontekstual tanpa angka palsu.

---

### FASE 2: Unifikasi Visual Design System
* **Tujuan:** Menghilangkan disparitas visual antar halaman dan memperbaiki bug dark mode pada seluruh Teacher Workspace.
* **Tugas Spesifik:**
  1. **Remediasi Dark Mode pada 5 Halaman:**
     - `/jadwal-saya` (`src/app/jadwal-saya/page.tsx`)
     - `/sesi-pembelajaran` (`src/app/sesi-pembelajaran/page.tsx`)
     - `/kalender-akademik` (`src/app/kalender-akademik/page.tsx`)
     - `/presensi-kelas` (`src/modules/attendance/presentation/class-attendance-overview.tsx`)
     - `/penilaian` (`src/modules/assessment/presentation/teacher-gradebook-overview-view.tsx`)
     - Ubah `bg-white border-slate-100/90` menjadi `bg-white dark:bg-slate-900/75 dark:backdrop-blur-xl border border-slate-200/80 dark:border-blue-500/22 dark:shadow-[0_0_30px_-5px_rgba(37,99,235,0.16)]`.
  2. **Standarisasi Tipografi & Radius:**
     - Terapkan `font-mono` tebal pada seluruh badge angka dan kode rombel/mapel.
     - Terapkan radius `rounded-[28px]` pada container kartu utama dan `rounded-2xl` pada kartu anak.
* **Kriteria Verifikasi (Quality Gate 2):**
  - Lulus uji visual QA di mode terang (Light Mode) dan mode gelap (Dark Mode). Kontras teks $\ge 4.5:1$ (WCAG AA).

---

### FASE 3: CBT Operational Engine Transformation
* **Tujuan:** Menyediakan alur pengawasan ujian sekolah nyata (proctoring, token, dan kontrol peserta).
* **Tugas Spesifik:**
  1. **Proctor Cockpit View (`/cbt-ujian/proktor/[ujianId]`):**
     - Grid status realtime seluruh siswa di rombel (Sedang Mengerjakan, Selesai, Terkunci, Belum Masuk).
     - Tombol proktor: Buka Kunci Siswa, Reset Sesi Perangkat, Paksa Kumpul.
  2. **Dynamic Token Generator:**
     - Server action `generateNewExamTokenAction(ujianId)` yang membuat token 6 karakter huruf kapital.
  3. **Antarmuka Penilaian Esai Guru (`/cbt-ujian/penilaian/[ujianId]`):**
     - Halaman koreksi jawaban esai siswa per nomor soal dengan rubrik penilaian skor.
* **Kriteria Verifikasi (Quality Gate 3):**
  - Simulasi alur ujian: Guru merilis token $\rightarrow$ Siswa login $\rightarrow$ Terdeteksi di Proctor Cockpit $\rightarrow$ Kumpul $\rightarrow$ Nilai terkalkulasi.

---

### FASE 4: Educational Psychometrics & Gradebook Integration
* **Tujuan:** Menjadikan hasil CBT terhubung otomatis ke buku nilai dan menyediakan analisis butir soal ilmiah.
* **Tugas Spesifik:**
  1. **Modul Analisis Butir Soal:**
     - Algoritma penghitung Tingkat Kesukaran ($P$) dan Daya Pembeda ($D$).
     - Rekomendasi otomatis terhadap butir soal yang cacat/rancu.
  2. **Sinkronisasi Buku Nilai:**
     - Server action `syncCbtToGradebookAction` yang mentransfer skor CBT ke tabel `nilai_siswa`.
  3. **Ekspor Nilai Resmi:**
     - Tombol ekspor file Excel (.xlsx) dan tombol cetak format PDF resmi sekolah.
* **Kriteria Verifikasi (Quality Gate 4):**
  - Nilai ujian CBT otomatis masuk ke halaman `/penilaian` dan buku nilai kelas X TO 3 tanpa input manual.

---

## 3. Strategi Manajemen Risiko & Rollback

| Potensi Risiko | Mitigasi yang Diterapkan | Prosedur Rollback |
| :--- | :--- | :--- |
| Perubahan query metrik memperlambat loading dashboard | Gunakan aggregasi Prisma paralel (`Promise.all`) dan hindari join nested N+1. | Revert ke query data terhitung sebelumnya via git checkpoint. |
| Perubahan styling Tailwind merusak tampilan mobile | Uji responsivitas pada 3 breakpoint kunci: Mobile (375px), Tablet (768px), Desktop (1280px). | CSS tokens bersifat aditif tanpa menghapus utility class dasar. |
| Fitur CBT baru mengganggu tabel ujian yang sudah ada | Tidak ada perubahan skema destruktif. Seluruh relasi memanfaatkan model Prisma yang telah ada (`ujian_cbt`, `event_integritas_ujian`, `hasil_ujian_cbt`). | Rollback terisolasi pada modul `src/modules/cbt/`. |

---

## 4. Status Gerbang Persetujuan (Human Approval Gate)

Sesuai aturan baku operasional `AGENTS.md`:
> **AI TIDAK BOLEH MENULIS KODE SEBELUM HUMAN REVIEW & PERSETUJUAN RENCANA.**

Semua temuan audit, dokumen desain ulang, cetak biru CBT, analisis kesenjangan, dan roadmap implementasi telah lengkap didokumentasikan dan siap untuk ditinjau oleh Human.
