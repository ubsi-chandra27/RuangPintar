# PHASE 05 — APPLICATION SHELL & DASHBOARD FRAMEWORK
## Ruang Pintar — Canonical Specification & Deliverable Report

**Versi:** 1.0
**Status:** APPROVED & CHECKPOINTED
**Active Phase:** PHASE 05 — APPLICATION SHELL & DASHBOARD FRAMEWORK  
**Starting Baseline:** `1f2f61e1aa0be7549c7f31c225c603d7e6673d11` (Phase 04 Checkpoint: `5596da8d77a12509e0da803945d0b3bacca9f502`)  
**Dokumen Induk:**
- `docs/04-ROLE-ACCESS.md`
- `docs/05-SYSTEM-ARCHITECTURE.md`
- `docs/06-DATA-ARCHITECTURE.md`
- `docs/07-UI-UX-DESIGN-SYSTEM.md`
- `docs/08-IMPLEMENTATION-ROADMAP.md` (Section 14)
- `docs/09-AI-CODING-RULES.md`
- `docs/FRD.md`

---

# 1. Tujuan & Ruang Lingkup Phase 05

Phase 05 menyelesaikan **Milestone B — Identity Entry Ready** dengan membangun:
1. **Application Shell Resmi:** Shell navigasi desktop, tablet, dan mobile yang terpadu berbasis **Academic Glass UI v1.2**.
2. **Desktop Sidebar (240px) & Compact Rail (56px):** Transisi mulus 250ms tanpa layout shift kasar, dilengkapi tooltip aksesibel pada mode compact rail.
3. **Topbar (64px):** Menyediakan breadcrumb navigasi dinamis, visual notification entry point (dengan 0 unread jujur), dan User Menu dengan ringkasan identitas dan aksi logout resmi.
4. **Mobile Navigation Drawer:** Drawer dialog untuk viewport < 768px dengan backdrop blur, penanganan tombol Escape, dan touch target >= 44px.
5. **Role-Aware Navigation:** Penyaringan menu navigasi berdasarkan 5 Base Role dan 4 Capability Bundles staf sekolah (`SYSTEM_ADMIN`, `ACADEMIC_OPERATOR`, `STUDENT_DATA_OPERATOR`, `REPORT_OPERATOR`).
6. **Dashboard Framework & Critical Page Contracts:** Kerangka dashboard role-specific dengan empty state yang jujur tanpa data KPI tiruan (fake data).

---

# 2. Arsitektur Application Shell

```text
[ Desktop / Laptop: Viewport >= 768px ]
┌──────────────────────────────────────────────────────────────────────────┐
│  SIDEBAR (240px) / COMPACT RAIL (56px) │ TOPBAR (64px)                   │
│  ├── Brand Logo & Title                │ ├── Breadcrumb Context          │
│  ├── Role-Aware Nav Items              │ ├── Notification Entry (0 unread)│
│  │   ├── Active: Soft Cobalt Tint      │ └── User Menu (Profile & Logout)│
│  │   └── Deferred: Phase Badge         │                                 │
│  └── Collapse / Expand Toggle Button   ├─────────────────────────────────┤
│                                        │ MAIN CONTENT AREA (Scrollable)  │
│                                        │ ├── PageHeader (Title, Badge)   │
│                                        │ ├── StatCard Grid (1/2/4 cols)  │
│                                        │ └── Role Dashboard Composition  │
└────────────────────────────────────────┴─────────────────────────────────┘

[ Mobile Viewport: 390×844 ]
┌──────────────────────────────────────────────────────────────────────────┐
│ TOPBAR (64px): [Menu Hamburger] [Brand Mark]   [Bell] [User Avatar]      │
├──────────────────────────────────────────────────────────────────────────┤
│ DRAWER OVERLAY (< 768px, slide-in 250ms on click):                       │
│ ├── Brand Header & Close Button (44px target)                           │
│ └── Filtered Role Navigation Links                                       │
├──────────────────────────────────────────────────────────────────────────┤
│ MAIN CONTENT AREA (Single Column, Safe Padding, No Horizontal Scroll)    │
└──────────────────────────────────────────────────────────────────────────┘
```

---

# 3. Kepatuhan Visual Contract & Token Academic Glass UI v1.2

| Token / Elemen | Nilai Kanonikal | Implementasi Solusi | Status |
|---|---|---|---|
| **Canvas Background** | `#F8FAFC` | Light neutral canvas pada seluruh viewport | **PASS** |
| **Academic Navy** | `#1E293B` | Header, badge peran pimpinan, dan primary buttons | **PASS** |
| **Cobalt Deep / Strong** | `#1D4ED8` / `#2563EB` | Active nav indicator (`bg-blue-50/90 text-blue-700`), links, accents | **PASS** |
| **Glass Elevated** | `bg-white/90 backdrop-blur-lg` | Surface card, container, dan sidebar chrome | **PASS** |
| **Glass Soft** | `bg-white/75 backdrop-blur-md` | Sub-panels, filter bars, dan supporting cards | **PASS** |
| **Sidebar Expanded** | `240px` (`w-60`) | Lebar sidebar standar desktop | **PASS** |
| **Compact Rail** | `56px` (`w-16` / `56px` base) | Mode compact rail dengan ikon terpusat | **PASS** |
| **Topbar Height** | `64px` (`h-16`) | Sticky header dengan backdrop-blur-xl | **PASS** |
| **Shell Motion** | `250ms` | Transisi sidebar expand/collapse & drawer slide-in | **PASS** |
| **Touch Target** | Minimum `44px` | Tombol navigasi, drawer close, user menu, dan icons | **PASS** |
| **Typography** | Plus Jakarta Sans & Mono | Font hierarki konsisten pada heading, body, dan badge | **PASS** |

---

# 4. Role-Aware Navigation Mapping

Navigasi difilter secara otomatis berdasarkan peran dan capability bundle yang sah:

1. **TEACHER:**
   - Dashboard (`/dashboard`)
   - Jadwal Mengajar (`/jadwal` — Badge Phase 10)
   - Kelas & Presensi (`/presensi-kelas` — Badge Phase 13)
   - Buku Nilai & Rapor (`/penilaian` — Badge Phase 14)
   - CBT Ujian Online (`/cbt-ujian` — Badge Phase 17)
2. **STUDENT:**
   - Dashboard (`/dashboard`)
   - Jadwal Pelajaran (`/jadwal-pelajaran` — Badge Phase 10)
   - Materi & Tugas (`/tugas-siswa` — Badge Phase 12)
   - Nilai & Rapor (`/rapor-siswa` — Badge Phase 14)
3. **GUARDIAN:**
   - Dashboard (`/dashboard`)
   - Presensi Anak (`/presensi-anak` — Badge Phase 16)
   - Perkembangan Nilai (`/nilai-anak` — Badge Phase 16)
4. **SCHOOL_STAFF (Dinamis sesuai capability):**
   - Dashboard (`/dashboard`)
   - *Dengan ACADEMIC_OPERATOR:* Struktur Kurikulum (`/struktur-akademik` — Badge Phase 07)
   - *Dengan STUDENT_DATA_OPERATOR:* Data Kesiswaan (`/data-siswa` — Badge Phase 08)
   - *Dengan REPORT_OPERATOR:* Laporan & Ekspor (`/laporan-sekolah` — Badge Phase 20)
   - *Dengan SYSTEM_ADMIN:* Konfigurasi Sistem (`/konfigurasi-sistem`), Log Audit (`/log-audit`)
5. **SUPER_ADMIN:**
   - Akses penuh menu administrasi sistem, audit trail, serta modul operasional platform.

---

# 5. Critical Page Contracts

### 5.1 DASHBOARD-GURU
- **PAGE ID:** `DASHBOARD-GURU`
- **ROLE:** `TEACHER`
- **PURPOSE:** Pusat kerja akademik pengajar harian.
- **ANATOMY:**
  - PageHeader: Welcome greeting nama guru & badge `Guru Pengajar`.
  - StatCards: Jadwal Hari Ini (0 Sesi), Kelas Binaan (0 Rombel), Tugas Masuk (0 Tugas), Presensi Selesai (0%).
  - Main Sections: Jadwal Mengajar Terdekat (Empty State jujur Phase 10), Kelas Saya & Buku Nilai (Empty State jujur Phase 09/14), Pengumuman Sekolah.
- **DATA DEFERRED NOTE:** Data kelas dan jadwal aktual ditangguhkan hingga Phase 09 & 10 tanpa mock KPI palsu.

### 5.2 DASHBOARD-SISWA
- **PAGE ID:** `DASHBOARD-SISWA`
- **ROLE:** `STUDENT`
- **PURPOSE:** Portal pembelajaran mandiri siswa.
- **ANATOMY:**
  - PageHeader: Greeting siswa & badge `Siswa Aktif`.
  - StatCards: Pelajaran Hari Ini, Tugas Mendatang, Presensi Saya, Nilai Rata-rata.
  - Main Sections: Jadwal Pelajaran Hari Ini, Tugas & Materi Belajar, Tips Belajar Aman.
- **DATA DEFERRED NOTE:** Jadwal dan tugas aktif ditangguhkan hingga Phase 10 & 12.

### 5.3 DASHBOARD-GUARDIAN
- **PAGE ID:** `DASHBOARD-GUARDIAN`
- **ROLE:** `GUARDIAN`
- **PURPOSE:** Portal monitoring perkembangan akademik dan kehadiran anak.
- **ANATOMY:**
  - PageHeader: Greeting nama wali murid & badge `Wali Siswa`.
  - StatCards: Siswa Terhubung, Kehadiran Hari Ini, Perkembangan Nilai, Pesan Guru.
  - Main Sections: Putra/Putri Binaan (Empty State verifikasi Phase 16), Pusat Informasi Sekolah.
- **DATA DEFERRED NOTE:** Relasi anak aktif ditangguhkan hingga Phase 16.

### 5.4 DASHBOARD-STAFF
- **PAGE ID:** `DASHBOARD-STAFF`
- **ROLE:** `SCHOOL_STAFF`
- **PURPOSE:** Pusat administrasi operasional sekolah sesuai capability.
- **ANATOMY:**
  - PageHeader: Nama staf, badge `Staf Sekolah`, dan daftar active capability bundles.
  - StatCards: Unit Sekolah, Total Siswa, Tahun Ajaran, Status Platform.
  - Main Sections: Modul Operasional Aktif (menampilkan kartu modul sesuai bundle), Informasi Prinsip Least Privilege.

### 5.5 DASHBOARD-PIMPINAN / SUPER ADMIN
- **PAGE ID:** `DASHBOARD-PIMPINAN` / `DASHBOARD-SUPER-ADMIN`
- **ROLE:** `SUPER_ADMIN` / Pimpinan
- **PURPOSE:** Monitoring kesehatan infrastruktur platform, database SQLite, konfigurasi sistem, dan log audit keamanan.
- **ANATOMY:**
  - StatCards: Database Engine (SQLite WAL), Sesi Server (Authoritative), Otorisasi Model (Default Deny), Audit Keamanan (M05 Aktif).
  - Main Sections: Infrastruktur Platform & Fondasi, Status Operasional Sistem.

---

# 6. Bukti Visual QA & Screenshot Viewport Kanonikal

Browser QA otomatis telah dijalankan menggunakan Chromium Playwright pada 4 viewport standar:

| File Screenshot | Viewport | Fokus Pengujian | Status |
|---|---|---|---|
| `docs/phases/screenshots/phase-05/phase-05-teacher-1440x900.png` | 1440×900 | Desktop Sidebar 240px, Topbar 64px, 4-col StatCards, Glass Cards | **PASS** |
| `docs/phases/screenshots/phase-05/phase-05-teacher-1024x768.png` | 1024×768 | Laptop/Tablet Landscape density, 4-col reflow | **PASS** |
| `docs/phases/screenshots/phase-05/phase-05-teacher-768x1024.png` | 768×1024 | Tablet Portrait layout, balanced whitespace | **PASS** |
| `docs/phases/screenshots/phase-05/phase-05-teacher-390x844.png` | 390×844 | Mobile single-column, safe horizontal padding, no horizontal overflow | **PASS** |
| `docs/phases/screenshots/phase-05/phase-05-compact-rail-1440x900.png` | 1440×900 | Compact Rail 56px mode, icon-only navigation, expanded content | **PASS** |
| `docs/phases/screenshots/phase-05/phase-05-mobile-drawer-390x844.png` | 390×844 | Mobile Drawer slide-in, backdrop blur, close button (44px target) | **PASS** |
| `docs/phases/screenshots/phase-05/phase-05-staff-dashboard-1440x900.png` | 1440×900 | Staff Dashboard dengan active capability bundles | **PASS** |
| `docs/phases/screenshots/phase-05/phase-05-student-dashboard-1440x900.png` | 1440×900 | Student Dashboard dengan self-scope layout | **PASS** |
| `docs/phases/screenshots/phase-05/phase-05-guardian-dashboard-1440x900.png` | 1440×900 | Guardian Dashboard dengan child monitoring empty state | **PASS** |
| `docs/phases/screenshots/phase-05/phase-05-superadmin-dashboard-1440x900.png` | 1440×900 | Super Admin Dashboard dengan platform metrics | **PASS** |

---

# 7. Matriks Pengujian Otomatis (Automated Test Suite)

Total Test Files: **23 passed (100%)**  
Total Tests: **98 passed (100%)**

### Suite Baru Phase 05 (15 Tests Baru):
1. `src/test/shell/navigation-config.test.ts` (7 tests) — PASS
   - Verifikasi isolasi navigasi TEACHER, STUDENT, GUARDIAN, SUPER_ADMIN.
   - Verifikasi restriksi SCHOOL_STAFF tanpa capability.
   - Verifikasi penambahan menu dinamis untuk ACADEMIC_OPERATOR dan SYSTEM_ADMIN.
2. `src/test/shell/dashboard-views.test.tsx` (5 tests) — PASS
   - Verifikasi rendering TeacherDashboard tanpa fake KPI.
   - Verifikasi rendering StudentDashboard (self-scope).
   - Verifikasi rendering GuardianDashboard (verified child empty state).
   - Verifikasi rendering StaffDashboard (capability bundles).
   - Verifikasi rendering SuperAdminDashboard (platform & audit metrics).
3. `src/test/shell/academic-shell.test.tsx` (3 tests) — PASS
   - Verifikasi layout AcademicShell (topbar, sidebar, main content).
   - Verifikasi toggle compact rail pada klik tombol collapse.
   - Verifikasi pembukaan UserMenu dropdown dan display identitas.

### Suite Regresi Phase 00–04 (83 Tests):
- 20 test files (Identity, Authentication, Rate Limiter, Password, Session, Prisma Models, Pragmas, Transactions, Audit, Outbox, Storage, Config, Smoke Views, Authorization Guards, Default Deny, Base Roles, Capability Bundles, Assignment Contracts, Staff Capability Service) — **83/83 passed (100%)**.

---

# 8. Kepatuhan Quality Gates

- **`npm run format:check`**: PASS (*All matched files use Prettier code style!*)
- **`npm run lint`**: PASS (*0 errors, 0 warnings*)
- **`npm run typecheck`**: PASS (*tsc --noEmit exit code 0*)
- **`npm run test`**: PASS (*98/98 tests passed across 23 test files*)
- **`npm run build`**: PASS (*Next.js 16 Turbopack production build success*)
- **`npm audit`**: PASS (*found 0 vulnerabilities*)
- **`git diff --check`**: PASS (*Clean, no whitespace issues*)

---

# 9. Verifikasi Aksesibilitas & Keamanan

### 9.1 Verifikasi Aksesibilitas Internal (Kepatuhan Terhadap Standar WCAG AA)
- Verifikasi internal dilakukan untuk memastikan antarmuka mematuhi standar desain WCAG AA (kontras teks >= 4.5:1, visual focus halo cobalt 3px, target sentuh minimum 44px, label semantik `aria-label`, penanganan dialog `Escape`, dan navigasi ramah keyboard).
- Catatan: Ini merupakan hasil verifikasi internal tim pengembang terhadap standar WCAG AA, bukan sertifikasi audit pihak ketiga formal.

### 9.2 Batasan Autentikasi & Otorisasi Server-Side
- Rute `/dashboard` mewajibkan sesi terautentikasi server-authoritative yang diperiksa secara ketat melalui `requireAuth()`.
- Pengguna yang belum login secara otomatis ditolak dan diarahkan ke `/login`.
- UI hiding pada navigasi hanya berfungsi untuk kenyamanan visual (UX); `requirePermission()` dan `AccessControlEngine` dari Phase 04 tetap menjadi batas otorisasi server-side mutlak saat mengeksekusi aksi atau mengakses data sensitif.

---

# 10. Data & Database Invariants

- **Prisma Schema:** TIDAK BERUBAH (0 new migrations).
- Mematuhi aturan `ROADMAP-RULE-006` (*No Cross-Phase Schema*) — tidak ada tabel bisnis prematur yang dibuat untuk domain Phase 06+.

---

# 11. Explicit Non-Scope

1. **TIDAK membuat CRUD Organisasi Sekolah** (Lingkup resmi Phase 06).
2. **TIDAK membuat CRUD Kalender/Tahun Ajaran/Semester** (Lingkup resmi Phase 07).
3. **TIDAK membuat CRUD Siswa, Guru, atau Penugasan Mengajar** (Phase 08 & 09).
4. **TIDAK membuat data KPI tiruan/palsu** (Seluruh empty state bersifat jujur dan informatif).

---

# 12. Kesiapan Handoff menuju Phase 06

Phase 05 menyediakan:
- `AcademicShell` sebagai wadah layout standar seluruh modul operasional sekolah.
- `PageHeader`, `Card`, `StatCard`, `EmptyState`, `Badge`, `Button` sebagai primitif UI konsisten.
- `Breadcrumb` yang siap menerima item dinamis untuk halaman CRUD Phase 06 (School & Organization).
- Navigasi role-aware yang siap menautkan modul organisasi sekolah saat diaktifkan.

**Status Akhir:** `APPROVED & CHECKPOINTED`
