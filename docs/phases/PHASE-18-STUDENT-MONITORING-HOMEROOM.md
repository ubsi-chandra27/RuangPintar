# PHASE 18 — STUDENT MONITORING & HOMEROOM (M18 / MILESTONE G)
## Ruang Pintar — School Digital Operating Platform

**Versi:** 1.0  
**Status:** READY FOR HUMAN REVIEW  
**Tanggal:** 11 September 2026  
**Penyusun:** Antigravity AI Coding Agent  
**Modul Induk:** M18 — Student Monitoring & Homeroom  
**Dokumen Referensi:**
- `docs/08-IMPLEMENTATION-ROADMAP.md` (Bagian 27 — Phase 18 Student Monitoring & Homeroom)
- `docs/03-MODULE-MAP.md` (M18 Student Monitoring & Homeroom)
- `docs/04-ROLE-ACCESS.md` (Seksi 13 — Wali Kelas & Supervisi Rombel)
- `docs/FRD.md` (FR-MNT-001 s/d FR-MNT-004)
- `AGENTS.md` (Domain Invariants & UI Rule Reference = Contract)

---

# 1. Ringkasan Eksekutif

Phase 18 menghadirkan subsistem **Student Monitoring & Homeroom (M18)** yang mendedikasikan pengalaman portal Wali Kelas (`/wali-kelas`) untuk memantau perkembangan akademik dan non-akademik siswa secara holistik, mendeteksi siswa yang memerlukan intervensi dini melalui **Pusat Perhatian (Attention Center)**, serta mencatat pembinaan dan rencana tindak lanjut (*action plan*) secara terstruktur dan dapat diaudit.

Implementasi Phase 18 menjunjung tinggi **Domain Invariants** kanonikal:

1. **M18 Student Monitoring ≠ Source of Truth (Derived Read Model)**:
   - Data agregat monitoring siswa (persentase presensi sesi, ketuntasan pengumpulan tugas lintas mapel, rerata capaian asesmen terpublikasi terhadap KKTP) **bukanlah data master terpisah**, melainkan derived read model yang dihitung secara dinamis dari modul transaksional:
     - **M12 Presensi Sesi**: Dihitung dari presensi riil per kejadian kelas aktual (`PresensiSesiKelas`).
     - **M11 Tugas**: Dihitung dari publikasi tugas aktif (`PublikasiTugas`) dan pengumpulan tugas siswa (`PengumpulanTugas`).
     - **M13 Asesmen & Nilai**: Dihitung dari nilai asesmen yang telah dipublikasikan (`PublikasiNilaiAsesmen` & `NilaiSiswa`) dengan mematuhi invariant *Missing Grade ≠ Zero Grade*.
2. **Wali Kelas ≠ Pemilik Nilai / Presensi Guru Lain**:
   - Wali kelas bertindak sebagai pengawas holistik dan konselor pembinaan rombel.
   - Wali kelas **tidak dapat** mengubah atau menimpa presensi sesi mata pelajaran guru lain maupun mengubah nilai asesmen mata pelajaran guru lain secara sepihak.
   - Intervensi wali kelas dilakukan melalui entitas berdaulat M18: **`CatatanMonitoring` (Catatan Pembinaan)** dan **`TindakLanjutMonitoring` (Rencana Tindak Lanjut & Intervensi)**.
3. **Homeroom Scoping & Default Deny (Server-Side Authorization)**:
   - Akses `/wali-kelas` dibatasi secara ketat di tingkat server (`MonitoringService.assertHomeroomAccess`):
     - **Guru (TEACHER)**: Hanya memiliki akses ke rombel yang penugasan wali kelasnya aktif (`PenugasanWaliKelas.status = 'AKTIF'`). Upaya mengakses rombel lain ditolak dengan `UnauthorizedHomeroomAccessError`.
     - **Super Admin (SUPER_ADMIN)**: Memiliki hak supervisi lintas rombel dengan dropdown pemilih kelas binaan seluruh sekolah.
     - **Siswa & Wali Murid**: Ditolak (*default deny*) dan diarahkan kembali ke dashboard mereka.
4. **Attention Center Multi-Kriteria Otomatis**:
   - Sistem melakukan klasifikasi status perhatian secara dinamis:
     - **`KRITIS`**: Siswa dengan $\ge 3$ sesi Alpha, atau persentase kehadiran $< 75\%$, atau $\ge 3$ tugas belum terkumpul, atau $\ge 3$ asesmen di bawah KKTP.
     - **`PERHATIAN`**: Siswa dengan $\ge 1$ sesi Alpha, atau kehadiran $< 85\%$, atau $\ge 1$ tugas belum terkumpul, atau $\ge 1$ asesmen di bawah KKTP.
     - **`BERPRESTASI`**: Siswa dengan kehadiran $100\%$, tugas tuntas $100\%$, dan rerata nilai asesmen $\ge 85$.
     - **`NORMAL`**: Siswa dalam kondisi pembelajaran tertib dan kondusif.

---

# 2. Files Created & Modified

### Files Created:
1. `prisma/migrations/20260911220000_add_student_monitoring_and_homeroom/migration.sql`: DDL migrasi tabel `catatan_monitoring` dan `tindak_lanjut_monitoring` dengan indeks performa dan foreign keys.
2. `prisma/seed-student-monitoring.ts`: Script seed data pengaitan akun `guru_demo` ke profil `Marhanih` (Wali Kelas X TO 3, 36 siswa), sesi presensi realistik (Alpha/Terlambat), catatan pembinaan, dan rencana tindak lanjut.
3. `src/modules/monitoring/domain/monitoring-types.ts`: Kontrak tipe data, DTO derived indicators, enum kategori, urgensi, status catatan, dan tindak lanjut.
4. `src/modules/monitoring/domain/monitoring-errors.ts`: Definisi domain errors (`HomeroomNotFoundError`, `UnauthorizedHomeroomAccessError`, `MonitoringValidationError`, `MonitoringNoteNotFoundError`, `FollowUpNotFoundError`).
5. `src/modules/monitoring/domain/monitoring-validation.ts`: Skema validasi Zod untuk catatan monitoring dan tindak lanjut.
6. `src/modules/monitoring/infrastructure/monitoring-repository.ts`: Query engine Prisma untuk penghitungan derived read models lintas modul (M07, M11, M12, M13) serta persistensi catatan pembinaan.
7. `src/modules/monitoring/application/monitoring-service.ts`: Application service penjaga hak akses (*scoping guard*), orkestrasi bisnis, dan integrasi audit trail (`recordAuditEvent`).
8. `src/app/actions/monitoring-actions.ts`: Server actions Next.js untuk pengambilan overview, modal detail siswa, serta mutasi catatan dan status tindak lanjut.
9. `src/modules/monitoring/presentation/create-monitoring-note-modal.tsx`: Modal dialog pembuatan catatan pembinaan baru dengan formulir target siswa, kategori, urgensi, dan rencana tindak lanjut awal.
10. `src/modules/monitoring/presentation/create-follow-up-modal.tsx`: Modal dialog penambahan rencana tindak lanjut baru pada catatan yang ada.
11. `src/modules/monitoring/presentation/student-monitoring-detail-modal.tsx`: Modal investigasi holistik siswa dengan 4 sub-tab (Presensi Sesi, Tugas, Nilai Asesmen, Pembinaan & Tindak Lanjut).
12. `src/modules/monitoring/presentation/homeroom-dashboard-view.tsx`: Tampilan portal komprehensif wali kelas berstandar Academic Glass UI v1.2 (Hero Banner, 4 KPI Cards, Roster Table, Attention Center, Notes Tab, Distribution Tab).
13. `src/app/wali-kelas/page.tsx`: Route page kanonikal Next.js untuk Portal Wali Kelas.
14. `src/test/monitoring/monitoring-service.test.ts`: Unit test suite (13 pengujian) untuk otorisasi scoping, validasi, dan audit trail.
15. `src/test/monitoring/monitoring-views.test.tsx`: Presentation test suite (8 pengujian) untuk rendering antarmuka, switching tab, modal investigasi, dan formulir intervensi.
16. `scripts/qa-phase18-visual-walkthrough.mjs`: Script Playwright visual walkthrough otomatis untuk Phase 18.
17. `docs/phases/PHASE-18-STUDENT-MONITORING-HOMEROOM.md`: Dokumen deliverable resmi Phase 18.

### Files Modified:
1. `prisma/schema.prisma`: Penambahan model `CatatanMonitoring`, `TindakLanjutMonitoring`, serta reciprocal relations pada `Sekolah`, `Pengguna`, `Rombel`, dan `Siswa`.
2. `src/shared/components/shell/navigation-config.ts`: Penambahan entri navigasi resmi `/wali-kelas` dengan icon `ShieldAlert` yang berwenang bagi `SUPER_ADMIN` dan `TEACHER`.
3. `src/shared/components/dashboard/role-views/teacher-dashboard.tsx`: Penautan Metric 4 ("Wali Kelas") dan Quick Access Card C ("Portal Wali Kelas") ke rute `/wali-kelas`.

---

# 3. Database & Migrations

Dua model relasional first-party ditambahkan ke database SQLite via migrasi `20260911220000_add_student_monitoring_and_homeroom`:

```sql
-- Catatan Pembinaan & Monitoring Siswa oleh Wali Kelas / Guru BK
CREATE TABLE catatan_monitoring (
    id TEXT NOT NULL PRIMARY KEY,
    sekolah_id TEXT NOT NULL,
    rombel_id TEXT NOT NULL,
    siswa_id TEXT NOT NULL,
    penulis_id TEXT NOT NULL,
    judul TEXT NOT NULL,
    isi TEXT NOT NULL,
    kategori TEXT NOT NULL DEFAULT 'AKADEMIK', -- AKADEMIK | KEHADIRAN | PERILAKU | KESEHATAN | SOSIAL | LAINNYA
    tingkat_urgensi TEXT NOT NULL DEFAULT 'SEDANG', -- RENDAH | SEDANG | TINGGI | KRITIS
    status TEXT NOT NULL DEFAULT 'AKTIF', -- AKTIF | SELESAI | DIARSIPKAN
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL,
    CONSTRAINT catatan_monitoring_sekolah_id_fkey FOREIGN KEY (sekolah_id) REFERENCES sekolah (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT catatan_monitoring_rombel_id_fkey FOREIGN KEY (rombel_id) REFERENCES rombel (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT catatan_monitoring_siswa_id_fkey FOREIGN KEY (siswa_id) REFERENCES siswa (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT catatan_monitoring_penulis_id_fkey FOREIGN KEY (penulis_id) REFERENCES pengguna (id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Rencana Tindak Lanjut / Intervensi Terarah
CREATE TABLE tindak_lanjut_monitoring (
    id TEXT NOT NULL PRIMARY KEY,
    catatan_id TEXT NOT NULL,
    penanggung_jawab_id TEXT,
    tindakan TEXT NOT NULL,
    target_tanggal DATETIME,
    status TEXT NOT NULL DEFAULT 'DIRENCANAKAN', -- DIRENCANAKAN | PROSES | SELESAI | DIBATALKAN
    hasil TEXT,
    tanggal_penyelesaian DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL,
    CONSTRAINT tindak_lanjut_monitoring_catatan_id_fkey FOREIGN KEY (catatan_id) REFERENCES catatan_monitoring (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT tindak_lanjut_monitoring_penanggung_jawab_id_fkey FOREIGN KEY (penanggung_jawab_id) REFERENCES pengguna (id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Indeks Kinerja
CREATE INDEX catatan_monitoring_rombel_id_idx ON catatan_monitoring(rombel_id);
CREATE INDEX catatan_monitoring_siswa_id_idx ON catatan_monitoring(siswa_id);
CREATE INDEX catatan_monitoring_status_idx ON catatan_monitoring(status);
CREATE INDEX catatan_monitoring_tingkat_urgensi_idx ON catatan_monitoring(tingkat_urgensi);
CREATE INDEX tindak_lanjut_monitoring_catatan_id_idx ON tindak_lanjut_monitoring(catatan_id);
CREATE INDEX tindak_lanjut_monitoring_status_idx ON tindak_lanjut_monitoring(status);
```

---

# 4. Domain & Authorization Layer

### Matrix Hak Akses Server-Side (`MonitoringService`):

| Peran Pengguna | Akses Portal `/wali-kelas` | Rombel yang Diizinkan | Pembuatan Catatan | Penyesuaian Tindak Lanjut |
| :--- | :---: | :--- | :---: | :---: |
| **SUPER_ADMIN** | Diizinkan | Seluruh rombel di sekolah (Supervisi) | Diizinkan | Diizinkan |
| **TEACHER (Wali Kelas Aktif)** | Diizinkan | Hanya rombel yang tercantum pada `PenugasanWaliKelas` miliknya | Diizinkan | Diizinkan |
| **TEACHER (Bukan Wali Kelas)** | Ditolak | Tidak ada (dialihkan ke banner informatif) | Ditolak | Ditolak |
| **STUDENT** | Ditolak | Dialihkan ke `/dashboard` | Ditolak | Ditolak |
| **GUARDIAN** | Ditolak | Dialihkan ke `/dashboard` | Ditolak | Ditolak |

### Audit Trail Terintegrasi:
Setiap tindakan mutasi pada portal wali kelas dicatat secara persisten ke tabel `log_audit` melalui `recordAuditEvent`:
- `CREATE_MONITORING_NOTE`: Pencatatan pembinaan baru lengkap dengan siswa dan tingkat urgensi.
- `UPDATE_MONITORING_NOTE`: Perubahan status catatan (e.g. `AKTIF` ke `SELESAI`).
- `CREATE_FOLLOW_UP`: Penambahan rencana intervensi.
- `UPDATE_FOLLOW_UP`: Pembaruan progres intervensi dan tanggal penyelesaian.

---

# 5. Presentation Layer (Academic Glass UI v1.2)

Antarmuka dibangun dengan estetika kanonikal **Academic Glass UI**:

1. **Academic Glass Hero Banner**:
   - Gradient gelap berkelas (`from-slate-900 via-blue-950 to-indigo-950`).
   - Badge peran kontras: `PORTAL WALI KELAS`, informasi Tahun Ajaran dan Semester aktif.
   - Penegasan identitas guru pengampu dan kapasitas rombel aktual.
   - Tombol primer `+ Buat Catatan Pembinaan` dengan aksen biru Royal (`#2563EB`).
2. **4 Kartu KPI Rombel**:
   - **Total Siswa Binaan**: Total siswa aktif pada rombel.
   - **Rerata Presensi Rombel**: Persentase kehadiran seluruh sesi rombel dengan badge evaluasi kedisiplinan.
   - **Perlu Perhatian Khusus**: Jumlah siswa dengan status `KRITIS` dan `PERHATIAN`.
   - **Siswa Berprestasi**: Jumlah siswa dengan rekor kehadiran 100% dan capaian nilai tinggi.
3. **Tab Navigasi Terstruktur**:
   - **Roster Siswa & Indikator**: Tabel siswa interaktif dengan kolom presensi, ketuntasan tugas, rerata nilai asesmen, status perhatian dengan badge pulse warna, dan tombol aksi langsung.
   - **Pusat Perhatian (Attention)**: Kartu at-risk interaktif per siswa yang memerlukan tindakan segera dengan tag rekomendasi permasalahan (misal: "2 sesi Alpha", "3 tugas belum dikumpulkan").
   - **Catatan Pembinaan & Follow-Up**: Riwayat pembinaan rombel terperinci dengan rencana tindak lanjut, indikator status selesai, dan tombol toggle status.
   - **Distribusi & Capaian**: Ringkasan persentase distribusi kedisiplinan rombel.
4. **Modal Investigasi Holistik Siswa (`StudentMonitoringDetailModal`)**:
   - Dilengkapi 4 sub-tab:
     - **Presensi Sesi**: Rekap total sesi, hadir, alpha, sakit, izin, terlambat, serta riwayat 20 sesi KBM terakhir dengan guru pengampu.
     - **Tugas**: Rekap persentase ketuntasan tugas dan daftar tugas lintas mata pelajaran beserta status pengumpulan dan tenggat waktu.
     - **Nilai Asesmen**: Rekap rerata nilai dan perbandingan capaian per asesmen terhadap nilai KKTP.
     - **Pembinaan & Tindak Lanjut**: Daftar seluruh catatan historis siswa bersangkutan dengan opsi penambahan rencana tindak lanjut langsung.
5. **Mobile Responsiveness**:
   - Dukungan penuh viewport mobile (390x844) dengan kartu metrik bertumpuk, tabel horizontal scrollable, dan bottom navigation yang responsif.

---

# 6. Quality Gate Verification

Berdasarkan aturan `AGENTS.md` (Quality Gate), seluruh pemeriksaan otomatis telah dieksekusi dan lolos 100%:

```text
================================================================================
QUALITY GATE VERIFICATION RESULTS: PHASE 18
================================================================================

1. TYPECHECK:
   Command: npm run typecheck
   Result : PASS (0 errors, tsc --noEmit exit code 0)

2. ESLINT LINTER:
   Command: npm run lint
   Result : PASS (0 errors, 4 image warnings in unrelated components, exit code 0)

3. PRETTIER FORMATTING:
   Command: npm run format:check
   Result : PASS (All matched files use Prettier code style, exit code 0)

4. UNIT & INTEGRATION TESTS:
   Command: npm test
   Result : PASS (79 test files, 442 tests passed, 0 failures, 100% pass)
   - Monitoring Service Unit Tests: 13/13 passed (src/test/monitoring/monitoring-service.test.ts)
   - Monitoring Views Presentation Tests: 8/8 passed (src/test/monitoring/monitoring-views.test.tsx)

5. NEXT.JS PRODUCTION BUILD:
   Command: npm run build
   Result : PASS (Compiled successfully in 10.0s, 31 routes generated including /wali-kelas)
```

---

# 7. Playwright Visual Walkthrough Artifacts

Visual Walkthrough dieksekusi secara otomatis melalui script `scripts/qa-phase18-visual-walkthrough.mjs`, menghasilkan 10 artefak tangkapan layar beresolusi tinggi pada direktori `docs/phases/screenshots/phase-18-walkthrough/`:

| No | File Screenshot | Keterangan Antarmuka |
| :---: | :--- | :--- |
| 1 | `01-teacher-dashboard-homeroom-kpi.png` | Dashboard Guru dengan KPI Metric 4 ("Wali Kelas X TO 3") dan Quick Access Card C ("Portal Wali Kelas"). |
| 2 | `02-homeroom-portal-overview.png` | Portal Wali Kelas X TO 3: Banner Academic Glass, 4 KPI cards, dan tabel roster siswa dengan filter. |
| 3 | `03-roster-student-indicators.png` | Tabel Roster Siswa menampilkan indikator turunan (Presensi %, Tugas %, Nilai/KKTP, Status Perhatian). |
| 4 | `04-attention-center-tab.png` | Tab Pusat Perhatian (Attention Center) menampilkan siswa dengan status `KRITIS` dan `PERHATIAN` beserta tag masalah. |
| 5 | `05-student-detail-modal-attendance.png` | Modal Investigasi Holistik Siswa: Tab Presensi Sesi menampilkan breakdown kehadiran dan 20 sesi terakhir. |
| 6 | `06-student-detail-modal-assignments-and-grades.png` | Modal Investigasi Holistik Siswa: Tab Tugas lintas mata pelajaran dan perbandingan KKTP asesmen. |
| 7 | `07-create-monitoring-note-modal.png` | Modal pembuatan Catatan Pembinaan baru dengan kategori, tingkat urgensi, dan formulir tindak lanjut awal. |
| 8 | `08-notes-and-followup-tab.png` | Tab Catatan Pembinaan & Follow-Up menampilkan daftar pembinaan yang tersimpan dan aksi penyelesaian. |
| 9 | `09-superadmin-homeroom-supervision.png` | Antarmuka Super Admin dengan pemilih rombel (Multi-Rombel Selector) untuk supervisi seluruh kelas sekolah. |
| 10 | `10-mobile-homeroom-view.png` | Tampilan responsif mobile (viewport 390x844) dengan layout adaptif dan navigasi mobile. |

---

# 8. Known Limitations & Out-of-Scope Confirmation

### Sesuai Roadmap & Dokumen Desain (Phase 18 Scope Only):
- **E-Rapor & Cetak Rapor Formal**: Merupakan cakupan mandiri **Phase 19 (M15 Rapor & Dokumen Akademik)**. Phase 18 hanya menampilkan indikator capaian asesmen terpublikasi untuk kepentingan bimbingan dan intervensi wali kelas.
- **Konseling Lanjutan Guru BK (Bimbingan Konseling)**: Catatan yang dibuat wali kelas telah memiliki kategori `PERILAKU`, `SOSIAL`, dan `KESEHATAN` dengan urgensi `KRITIS` yang siap dikonsumsi modul konseling BK lanjutan di masa mendatang.
- **WhatsApp Gateway Otomatis ke Orang Tua**: Notifikasi eksternal telah difasilitasi melalui M17 Notification Outbox (Phase 17). Pada Phase 18, wali kelas mencatat tanggal pemanggilan dan nomor telepon wali murid yang tersedia di profil siswa.

---

# 9. Git Status Checkpoint

Pemeriksaan git status sebelum deklarasi review:

```text
On branch main
Changes to be committed:
  - modified: prisma/schema.prisma
  - modified: src/shared/components/dashboard/role-views/teacher-dashboard.tsx
  - modified: src/shared/components/shell/navigation-config.ts
  - new file: docs/phases/PHASE-18-STUDENT-MONITORING-HOMEROOM.md
  - new file: docs/phases/screenshots/phase-18-walkthrough/ (10 images)
  - new file: prisma/migrations/20260911220000_add_student_monitoring_and_homeroom/migration.sql
  - new file: prisma/seed-student-monitoring.ts
  - new file: scripts/qa-phase18-visual-walkthrough.mjs
  - new file: src/app/actions/monitoring-actions.ts
  - new file: src/app/wali-kelas/page.tsx
  - new file: src/modules/monitoring/
  - new file: src/test/monitoring/
```

---

# 10. Status Phase

```text
STATUS: READY FOR HUMAN REVIEW
```

*Sesuai aturan AGENTS.md Bagian 6, 7, dan 16, agen menghentikan seluruh aktivitas pengerjaan kode pada batas ini dan menunggu evaluasi serta keputusan persetujuan dari Human User.*
