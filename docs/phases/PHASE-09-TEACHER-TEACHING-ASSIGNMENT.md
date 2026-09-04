# RUANG PINTAR — PHASE 09 REPORT
## TEACHER & TEACHING ASSIGNMENT (MODULE M08)

**Phase:** PHASE 09 — TEACHER & TEACHING ASSIGNMENT  
**Module:** M08 — Teacher & Teaching Assignment  
**Status:** READY FOR HUMAN REVIEW  
**Baseline Git Checkpoint:** `f702c4288b0a99d5e025c3cf828fc51277c6e508` (Phase 08 Checkpoint)  

---

# 1. RINGKASAN EKSEKUSI

Pada Phase 09 ini, telah berhasil dibangun fondasi data akademik guru, master mata pelajaran, penugasan mengajar periodik (*teaching assignment*), penetapan wali kelas (*homeroom assignment*), kalkulasi beban mengajar terderivasi (*derived workload calculation*), penegakan batas institusi (*school-boundary enforcement*), dan aktivasi data nyata pada **Dashboard Guru** (*Teacher Dashboard*).

Arsitektur domain menerapkan pemisahan ketat (Domain Invariants):
```text
Teacher Profile ≠ User Account
Teacher Profile ≠ Subject
Subject ≠ Teaching Assignment
Teaching Assignment ≠ Homeroom Assignment
Teaching Assignment ≠ Schedule
Homeroom Assignment ≠ Base Role
TEACHER Base Role ≠ Akses Semua Rombel
```

---

# 2. FILES CREATED

### Data & Migration:
- `prisma/migrations/20260830160000_add_teacher_and_teaching_assignment/migration.sql`

### Domain Layer (`src/modules/teacher/domain/`):
- `src/modules/teacher/domain/teacher-types.ts`
- `src/modules/teacher/domain/teacher-errors.ts`
- `src/modules/teacher/domain/teacher-validation.ts`

### Infrastructure Layer (`src/modules/teacher/infrastructure/`):
- `src/modules/teacher/infrastructure/teacher-repository.ts`

### Application Layer (`src/modules/teacher/application/`):
- `src/modules/teacher/application/teacher-profile-service.ts`
- `src/modules/teacher/application/subject-service.ts`
- `src/modules/teacher/application/teaching-assignment-service.ts`
- `src/modules/teacher/application/homeroom-assignment-service.ts`
- `src/modules/teacher/application/teacher-facade.ts`

### Presentation Layer (`src/modules/teacher/presentation/`):
- `src/modules/teacher/presentation/teacher-management-tabs.tsx`
- `src/modules/teacher/presentation/teachers-view.tsx`
- `src/modules/teacher/presentation/teacher-detail-modal.tsx`
- `src/modules/teacher/presentation/subjects-view.tsx`
- `src/modules/teacher/presentation/teaching-assignments-view.tsx`
- `src/modules/teacher/presentation/homeroom-assignments-view.tsx`

### Server Actions & Routes:
- `src/app/actions/teacher-actions.ts`
- `src/app/guru-pengajaran/page.tsx`

### Scripts & Automated Tests:
- `scripts/seed-teacher-data.mjs`
- `scripts/capture-phase-09-qa.mjs`
- `src/test/teacher/teacher-profile-service.test.ts`
- `src/test/teacher/subject-service.test.ts`
- `src/test/teacher/teaching-assignment-service.test.ts`
- `src/test/teacher/homeroom-assignment-service.test.ts`
- `src/test/teacher/teacher-views.test.tsx`

---

# 3. FILES MODIFIED

- `prisma/schema.prisma` (Menambahkan model `Guru`, `MataPelajaran`, `PenugasanMengajar`, `PenugasanWaliKelas` dan relasi balik pada `Sekolah`, `Pengguna`, `TahunAjaran`, `Semester`, dan `Rombel`)
- `src/shared/components/dashboard/role-views/teacher-dashboard.tsx` (Mengganti mock generik dengan data riil penugasan mengajar, rombel yang diampu, status wali kelas, dan derived workload)
- `src/shared/components/shell/navigation-config.ts` (Menambahkan item menu "Guru & Penugasan" untuk SUPER_ADMIN dan SCHOOL_STAFF dengan bundle ACADEMIC_OPERATOR)
- `src/test/shell/dashboard-views.test.tsx` (Memperbarui unit test TeacherDashboard untuk mendukung model async data riil)

---

# 4. DATABASE & MIGRATION PROOF

- **Forward Migration Applied:** `20260830160000_add_teacher_and_teaching_assignment`
- **Tabel Baru:**
  1. `guru` (Profil profesional pendidik dengan NIP, NUPTK, pas foto, status kepegawaian, dan relasi opsional ke `pengguna`)
  2. `mata_pelajaran` (Master mapel mandiri dengan kode unik per sekolah dan kelompok kurikulum)
  3. `penugasan_mengajar` (Relasi Guru + Mapel + Rombel + Tahun Ajaran + Semester + Jam Pelajaran per minggu + Periode Efektif + Status)
  4. `penugasan_wali_kelas` (Relasi Guru + Rombel + Tahun Ajaran + Periode Efektif + Status)
- **Status Prisma Migrate:**
  ```text
  7 migrations found in prisma/migrations
  Database schema is up to date!
  ```

---

# 5. DOMAIN & INVARIANT ENFORCEMENT

1. **Teacher Profile ≠ User Account**:
   Guru dapat dicatat sebagai profil profesional sekolah tanpa harus memiliki akun login sistem, atau ditautkan ke akun pengguna secara eksplisit (`pengguna_id`).
2. **Subject ≠ Teacher**:
   Mata pelajaran berdiri sendiri sebagai master kurikulum sekolah tanpa kolom guru permanen.
3. **Teaching Assignment Invariant**:
   Penugasan mengajar bersifat periodik (terikat Tahun Ajaran dan Semester). Sistem menolak penugasan duplikat untuk mata pelajaran dan rombel yang sama pada periode aktif.
4. **Homeroom Assignment Invariant**:
   Satu rombel hanya boleh memiliki 1 wali kelas aktif dalam tahun ajaran tertentu. Pergantian wali kelas menutup penugasan sebelumnya tanpa menghapus rekam jejak.
5. **Derived Workload Calculation**:
   Beban mengajar (total JP/minggu, total rombel, total mapel) dihitung secara riil dari query penugasan aktif, bukan free text statis.
6. **School-Boundary Enforcement**:
   Semua mutasi memverifikasi kepemilikan data guru, mapel, dan rombel berada dalam batas institusi sekolah yang sama.

---

# 6. AUTHORIZATION MODEL

- `academic.teachers.view` & `academic.teachers.manage`: SUPER_ADMIN & SCHOOL_STAFF (Bundle: `ACADEMIC_OPERATOR`).
- `academic.structure.manage`: Mengelola master Mata Pelajaran.
- `academic.teaching_assignments.manage`: Menetapkan dan menutup penugasan mengajar.
- `academic.homeroom_assignments.manage`: Menetapkan dan menyelesaikan penugasan wali kelas.
- `TEACHER`: Base Role guru dibatasi server-side hanya dapat melihat kelas dan penugasan yang secara sah ditugaskan kepadanya melalui tabel `penugasan_mengajar` dan `penugasan_wali_kelas`.

---

# 7. PRESENTATION LAYER (ACADEMIC GLASS UI v1.2)

Halaman `/guru-pengajaran` menyajikan 4 tab terintegrasi:
1. **Data Guru**: Tabel & Mobile Cards, Avatar Pas Foto, NIP/NUPTK, Status Kepegawaian, Beban JP terderivasi, Modal Tambah Guru Baru (dengan preview pas foto), Modal Edit Guru, Modal Detail Guru (tab Biodata, Penugasan Mengajar, Riwayat Wali Kelas), dan Ekspor CSV (titik koma `;` UTF-8 BOM).
2. **Mata Pelajaran**: Master mapel dengan kode, nama, kelompok (Umum, Kejuruan, Pilihan, Muatan Lokal), jumlah guru pengajar aktif, jumlah rombel aktif, modal create/edit/delete, dan ekspor CSV.
3. **Penugasan Mengajar**: Ringkasan KPI (Penugasan Aktif, Total Beban Jam JP, Guru Bertugas, Rombel Terlayani), filter Tahun Ajaran, filter Rombel, filter Status, Modal penetapan penugasan (pilih Guru, Mapel, Rombel, TA, Semester, Jampel), Modal Edit, dan Modal Selesaikan Penugasan.
4. **Wali Kelas**: Status banner keterisian wali kelas per rombel, filter Tahun Ajaran, Modal penetapan wali kelas baru, dan Modal selesaikan tugas wali kelas.

**Teacher Dashboard Activation:**
- Kartu "Penugasan Mengajar & Kelas Saya" menampilkan daftar rombel dan mata pelajaran riil dari database.
- Ringkasan beban mengajar (JP/minggu, rombel diampu, siswa binaan) dihitung otomatis secara realtime.
- Kartu "Tanggung Jawab Wali Kelas" menampilkan rombel binaan aktif guru yang bersangkutan.
- Placeholder jadwal harian dan pembukaan sesi kelas diberi label jujur (*Phase 10 — Timetable & Session*).

---

# 8. QUALITY GATES & VERIFICATION

1. **TypeScript Typecheck:**
   `npm run typecheck` → **0 errors** (PASS).
2. **ESLint:**
   `npm run lint` → **0 errors, 0 warnings** (PASS).
3. **Code Formatting:**
   `npm run format` → **Cleanly formatted via Prettier** (PASS).
4. **Automated Unit & Integration Tests:**
   `npx vitest run` → **47 test files, 230 tests passed 100%** (PASS).
5. **Next.js Production Build:**
   `npm run build` → **Compiled successfully (11 static/dynamic routes generated)** (PASS).
6. **Visual QA Screenshots:**
   Tersimpan di `docs/phases/screenshots/phase-09/`:
   - `01-guru-tab-desktop.png` (Direktori guru desktop)
   - `02-guru-detail-modal.png` (Modal detail guru & beban mengajar)
   - `03-guru-create-modal.png` (Modal tambah guru baru)
   - `04-mapel-tab-desktop.png` (Master mata pelajaran)
   - `05-penugasan-tab-desktop.png` (Penugasan mengajar & metrik KPI)
   - `06-wali-kelas-tab-desktop.png` (Penetapan wali kelas)
   - `07-guru-tab-mobile.png` (Tampilan mobile kartu guru)
   - `08-teacher-dashboard-real-data.png` (Dashboard Guru dengan data riil)

---

# 9. OUT-OF-SCOPE CONFIRMATION

- Tidak mengimplementasikan kalender akademik dan master timetable mingguan (Scope Phase 10).
- Tidak mengimplementasikan absensi sesi kelas realtime (Scope Phase 13).
- Tidak mengimplementasikan buku penilaian rapor (Scope Phase 14).
- Tidak mengimplementasikan CBT engine (Scope Phase 17).

---

# 10. GIT STATUS

```text
Branch: main
HEAD: f702c4288b0a99d5e025c3cf828fc51277c6e508 (Phase 08 Checkpoint)
Status: Uncommitted Phase 09 implementation (NO commit, NO push before human review).
```

---

# 11. STATUS AKHIR

```text
READY FOR HUMAN REVIEW
```
