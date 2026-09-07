# PHASE 16 — GUARDIAN EXPERIENCE (M15 / MILESTONE F)
## Ruang Pintar — School Digital Operating Platform

**Versi:** 1.0  
**Status:** READY FOR HUMAN REVIEW  
**Tanggal:** 7 September 2026  
**Penyusun:** Antigravity AI Coding Agent  
**Modul Induk:** M15 — Guardian & Family  
**Dokumen Referensi:**
- `docs/08-IMPLEMENTATION-ROADMAP.md` (Bagian 25 — Phase 16 Guardian & Family Experience)
- `docs/03-MODULE-MAP.md` (M15 Guardian & Family)
- `docs/04-ROLE-ACCESS.md` (Seksi 9, 18, 29, 43, 64)
- `docs/02-DOMAIN-MODEL.md` (Seksi 21, 30.3)

---

# 1. Ringkasan Eksekutif

Phase 16 mengimplementasikan portal **Guardian Experience (M15)** yang menghubungkan akun orang tua/wali murid dengan aktivitas belajar dan capaian akademik putra/putrinya di sekolah. Seluruh implementasi dibangun di atas prinsip arsitektural **Academic Glass UI v1.2**, penegakan batasan hak akses **Relationship-Scoped Authorization (`GUARDIAN_RELATIONSHIP`)**, serta kepatuhan penuh terhadap **Domain Invariants**:

1. **Guardian ≠ Student proxy**: Wali murid tidak bertindak sebagai siswa (tidak mengumpulkan tugas kelas, tidak mengikuti ujian CBT atas nama anak).
2. **Multi-Child & Multi-Guardian Support**:
   - Satu orang tua dapat memantau lebih dari satu anak (`Child Switcher` terintegrasi pada antarmuka).
   - Satu anak dapat terhubung dengan lebih dari satu wali (Ayah dan Ibu terverifikasi terpisah).
3. **Strict Non-Leakage of Draft Grades (FR-SXP-004)**: Hanya nilai asesmen yang telah berstatus `PUBLISHED` dengan target audiens mencakup `WALI` atau `SEMUA` yang dapat diakses orang tua.
4. **Missing Grade != Zero Grade**: Nilai asesmen yang belum diikuti atau belum dinilai guru ditampilkan sebagai tanda strip (`-`), bukan angka `0`.
5. **Limited Request / Correction**: Fitur pengajuan permohonan surat izin sakit, dispensasi kegiatan, atau koreksi catatan kesehatan anak oleh orang tua disertai unggahan dokumen lampiran.

---

# 2. Files Created & Modified

### Files Created:
1. `prisma/migrations/20260907130000_add_guardian_and_family/migration.sql`: Migrasi database tabel `wali_murid`, `hubungan_wali_siswa`, `pengajuan_wali`.
2. `prisma/seed-guardian-experience.ts`: Script seed data realistis akun wali (`wali_santoso`, `wali_nurhayati`), relasi multi-child, dan sampel pengajuan izin.
3. `scripts/set-wali-pwd.mjs`: Script helper penataan hash password akun wali.
4. `src/modules/guardian/domain/guardian-types.ts`: Definisi domain types, interface profil wali, konteks anak aktif, KPI presensi, nilai terpublikasi, dan rapor resmi.
5. `src/modules/guardian/domain/guardian-errors.ts`: Definisi domain errors (`GuardianNotFoundError`, `ChildNotLinkedError`, `UnverifiedRelationshipError`, `UnauthorizedGuardianActionError`).
6. `src/modules/guardian/domain/guardian-validation.ts`: Skema validasi Zod untuk child switcher dan form pengajuan izin wali.
7. `src/modules/guardian/infrastructure/guardian-repository.ts`: Repository Prisma SQLite teroptimasi untuk entitas wali, relasi terverifikasi, presensi, tugas, CBT, publikasi nilai resmi, dan rapor Kurikulum Merdeka.
8. `src/modules/guardian/application/guardian-service.ts`: Application service orkestrasi bisnis, penegakan peran `GUARDIAN`, evaluasi scope relasi sah, dan pencatatan log audit (`recordAuditEvent`).
9. `src/app/actions/guardian-actions.ts`: Server actions untuk pergantian konteks anak aktif (`switchActiveChildAction` via cookies) dan penyerahan permohonan izin (`submitPengajuanWaliAction`).
10. `src/modules/guardian/presentation/child-switcher-dropdown.tsx`: Dropdown selector anak interaktif untuk akun wali dengan multi-child.
11. `src/modules/guardian/presentation/pengajuan-izin-modal.tsx`: Modal formulir pengajuan izin/sakit anak dilengkapi dropzone unggah berkas surat dokter.
12. `src/modules/guardian/presentation/guardian-report-print-modal.tsx`: Modal pratinjau lembar rapor resmi A4 siap cetak (`window.print()`).
13. `src/modules/guardian/presentation/guardian-dashboard-client.tsx`: Client view interaktif dashboard wali murid.
14. `src/modules/guardian/presentation/guardian-attendance-view.tsx`: Komponen presentasi halaman rekapitulasi kehadiran dan log absensi sesi KBM anak.
15. `src/modules/guardian/presentation/guardian-grades-view.tsx`: Komponen presentasi tabulasi nilai asesmen terpublikasi dan buku e-Rapor resmi.
16. `src/app/presensi-anak/page.tsx`: Route page kanonikal Next.js untuk pemantauan presensi anak.
17. `src/app/nilai-anak/page.tsx`: Route page kanonikal Next.js untuk pemantauan nilai & e-rapor anak.
18. `src/test/guardian/guardian-service.test.ts`: Unit test domain logic, invariant enforcement, dan audit log.
19. `src/test/guardian/guardian-views.test.tsx`: Presentation tests untuk komponen-komponen UI portal wali murid.
20. `scripts/qa-phase16-visual-walkthrough.mjs`: Script Playwright visual walkthrough otomatis.
21. `docs/phases/PHASE-16-GUARDIAN-EXPERIENCE.md`: Dokumen laporan deliverable resmi Phase 16.

### Files Modified:
1. `prisma/schema.prisma`: Penambahan model `WaliMurid`, `HubunganWaliSiswa`, `PengajuanWali`, serta relasinya pada `Sekolah`, `Pengguna`, dan `Siswa`.
2. `src/shared/components/dashboard/role-views/guardian-dashboard.tsx`: Transformasi dari mock statis menjadi live data-driven async server component.
3. `src/shared/components/shell/navigation-config.ts`: Pengaktifan menu kanonikal `guardian-attendance` (`/presensi-anak`) dan `guardian-grades` (`/nilai-anak`) (`isPhaseDeferred: false`).
4. `src/test/shell/dashboard-views.test.tsx`: Penyesuaian pengujian snapshot/render `GuardianDashboard` berbasis async server component.

---

# 3. Database & Migrations

Tiga tabel relasional ditambahkan pada database SQLite Ruang Pintar:

```sql
-- Identitas Wali Murid
CREATE TABLE "wali_murid" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "pengguna_id" TEXT UNIQUE,
    "nama_lengkap" TEXT NOT NULL,
    "jenis_kelamin" TEXT,
    "no_telepon" TEXT,
    "email" TEXT,
    "pekerjaan" TEXT,
    "penghasilan" TEXT,
    "alamat" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id"),
    FOREIGN KEY ("pengguna_id") REFERENCES "pengguna" ("id") ON DELETE SET NULL
);

-- Relasi Wali - Siswa (Mendukung Multi-Child & Multi-Guardian)
CREATE TABLE "hubungan_wali_siswa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "wali_id" TEXT NOT NULL,
    "siswa_id" TEXT NOT NULL,
    "jenis_hubungan" TEXT NOT NULL, -- AYAH | IBU | WALI | LAINNYA
    "status_verifikasi" TEXT NOT NULL DEFAULT 'TERVERIFIKASI', -- TERVERIFIKASI | MENUNGGU | DITOLAK
    "apakah_wali_utama" BOOLEAN NOT NULL DEFAULT false,
    "catatan" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id"),
    FOREIGN KEY ("wali_id") REFERENCES "wali_murid" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("siswa_id") REFERENCES "siswa" ("id") ON DELETE CASCADE
);

-- Pengajuan Izin / Permohonan Koreksi oleh Wali
CREATE TABLE "pengajuan_wali" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "wali_id" TEXT NOT NULL,
    "siswa_id" TEXT NOT NULL,
    "tipe" TEXT NOT NULL, -- SAKIT | IZIN_KETIDAKHADIRAN | CATATAN_KESEHATAN | KOREKSI_DATA | LAINNYA
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "tanggal_mulai" DATETIME,
    "tanggal_selesai" DATETIME,
    "lampiran_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'MENUNGGU', -- MENUNGGU | DISETUJUI | DITOLAK
    "catatan_tanggapan" TEXT,
    "ditanggapi_oleh_id" TEXT,
    "ditanggapi_pada" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id"),
    FOREIGN KEY ("wali_id") REFERENCES "wali_murid" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("siswa_id") REFERENCES "siswa" ("id") ON DELETE CASCADE
);
```

---

# 4. Domain & Authorization Enforcement

| Aspek | Kebijakan & Penegakan | Status |
|---|---|---|
| **Base Role** | `GUARDIAN` | Terkunci & divalidasi server-side |
| **Relationship Scope** | `GUARDIAN_RELATIONSHIP` | Server menolak akses jika relasi belum `TERVERIFIKASI` atau tidak terdaftar |
| **Multi-Child Switcher** | Cookie `rp_active_child_id` | Tersimpan aman, otomatis berpindah context di `/dashboard`, `/presensi-anak`, `/nilai-anak` |
| **Student Proxy** | Guardian ≠ Student proxy | Area wali tidak menyediakan tombol submit tugas atau mengerjakan soal CBT |
| **Zero Draft Leakage** | `FR-SXP-004` | Hanya asesmen berstatus `PUBLISHED` dengan target `WALI` / `SEMUA` yang ditampilkan |
| **Missing Grade != Zero** | `null` dirender sebagai `-` | Tidak merendahkan nilai siswa yang belum dinilai menjadi angka 0 |
| **Audit Logging** | `recordAuditEvent` | Setiap permohonan izin/koreksi dicatat ke audit log platform |

---

# 5. Quality Gates & Verification Results

| Quality Gate | Perintah / Alat | Hasil | Keterangan |
|---|---|---|---|
| **Typecheck** | `npm run typecheck` | **PASS (0 errors)** | Seluruh tipe TypeScript valid 100% |
| **Lint** | `npm run lint` | **PASS (0 errors, 4 warnings non-blocking)** | Clean code standard ESLint |
| **Format** | `npm run format:check` | **PASS (100% clean)** | Prettier formatting rapi |
| **Unit & Integration Tests** | `npm test` | **PASS (73 test files, 400 tests)** | Seluruh pengujian Phase 00–16 lulus 100% tanpa regresi |
| **Production Build** | `npm run build` | **PASS (18 routes generated)** | Turbopack compilation 100% sukses |
| **Playwright Visual Walkthrough** | `scripts/qa-phase16-visual-walkthrough.mjs` | **PASS (9 screenshots)** | Seluruh alur kerja teruji dan terdokumentasi visual |

---

# 6. Visual QA & Walkthrough Evidence

Tersimpan pada direktori `docs/phases/screenshots/phase-16-walkthrough/`:

1. `01_guardian_dashboard_desktop.png`: Tampilan Desktop Dashboard Wali Murid, kartu metrik kehadiran, ketuntasan tugas, banner profil anak, kontak wali kelas, dan layanan orang tua.
2. `02_guardian_dashboard_mobile.png`: Tampilan Mobile (390x844) responsif dengan Academic Glass UI v1.2.
3. `03_guardian_child_switcher_dropdown.png`: Dropdown pemilih anak terbuka menampilkan 2 anak terdaftar (Rian Pratama Kusuma & Lubna).
4. `04_guardian_child_switched_view.png`: Dashboard setelah beralih konteks ke anak kedua.
5. `05_guardian_pengajuan_izin_modal.png`: Modal formulir pengajuan surat izin sakit lengkap dengan upload lampiran surat dokter.
6. `06_guardian_attendance_view.png`: Halaman `/presensi-anak` dengan KPI kehadiran 6 kartu dan tabel log absensi KBM.
7. `07_guardian_published_grades.png`: Halaman `/nilai-anak` (Tab Nilai Asesmen Terpublikasi, zero draft leakage).
8. `08_guardian_report_card_view.png`: Halaman `/nilai-anak` (Tab Buku e-Rapor Resmi Kurikulum Merdeka).
9. `09_guardian_report_print_preview_a4.png`: Modal Pratinjau Cetak Lembar Rapor Resmi A4 print-ready (`window.print()`).

---

# 7. Known Limitations & Out-of-Scope Confirmation

### Sesuai Cakupan Phase 16:
- Mengelola portal orang tua / wali murid dengan scope relasi sah (`GUARDIAN_RELATIONSHIP`).
- Switcher multi-anak, pemantauan presensi harian, pemantauan nilai asesmen terpublikasi resmi, pratinjau e-rapor, dan pengajuan surat izin/keterangan sakit.

### Konfirmasi Di Luar Cakupan (Explicit Non-Scope):
- Fitur broadcast notifikasi massal / pengumuman terpusat (dikelola pada **Phase 17 — Communication & Notification**).
- Monitoring khusus wali kelas terhadap seluruh murid satu rombel (dikelola pada **Phase 18 — Student Monitoring & Homeroom**).

---

# 8. Status Akhir

```text
STATUS: READY FOR HUMAN REVIEW
```
Semua kriteria penerimaan Phase 16 telah terpenuhi secara utuh, teruji, dan terdokumentasi. Tidak ada pekerjaan phase berikutnya yang dimulai sebelum review human.
