# PHASE 15 — STUDENT EXPERIENCE (M15)
## Deliverable Report & Verification Baseline

**Status:** READY FOR HUMAN REVIEW  
**Tanggal:** 7 September 2026  
**Aktor Utama:** `STUDENT` (dengan fallback supervisory `SUPER_ADMIN`)  
**Design System:** Academic Glass UI v1.2 (Responsive Desktop & Mobile)  

---

## 1. Ringkasan Eksekutif

Phase 15 berhasil mengimplementasikan seluruh subsistem **Student Experience (M15)** pada Ruang Pintar sesuai dengan arsitektur Modular Monolith, domain-driven invariants, dan prinsip keamanan server-side `STUDENT_SELF` scope. 

Modul ini memberikan pengalaman terpadu bagi siswa untuk:
1. **Live Data-Driven Dashboard (`/dashboard`)**: Menyajikan gambaran komprehensif aktivitas akademik harian, kartu ringkasan kehadiran & nilai riil, timeline jadwal KBM hari ini, deadline tugas terdekat, ujian CBT mendatang dengan deep-link langsung ke CBT player, serta rincian nilai asesmen terbaru yang telah dirilis secara resmi oleh guru.
2. **Materi & Tugas Siswa (`/tugas-siswa`)**: Mengintegrasikan 3 pilar KBM siswa dalam tabbed view responsif:
   - **Tugas Kelas**: Menampilkan daftar tugas terstruktur dengan indikator tenggat waktu, deteksi keterlambatan otomatis berdasarkan aturan toleransi guru (`izinkan_terlambat`), dan modal pengumpulan tugas mandiri (`SubmitAssignmentModal`) yang mendukung teks jawaban dan unggah dokumen berkas (Dropzone) ke storage terisolasi via `/api/berkas/[id]`.
   - **Materi Pembelajaran**: Katalog bahan ajar terpublikasi dengan modal pembaca materi (`MaterialDetailModal`) yang mendukung artikel teks terstruktur, berkas unduhan lampiran guru, dan tautan eksternal.
   - **Presensi Kelas**: Rekapitulasi kehadiran siswa di seluruh sesi KBM dengan persentase kehadiran dan riwayat status (Hadir, Sakit, Izin, Alpha, Terlambat).
3. **Buku Nilai & e-Rapor Kurikulum Merdeka (`/rapor-siswa`)**:
   - Menegakkan invariant **FR-SXP-004** (*Strict Non-Leakage of Draft Grades*): Hanya menampilkan asesmen berstatus `PUBLISHED` dengan sasaran distribusi publikasi `SISWA` atau `SEMUA`.
   - Menegakkan invariant domain **Missing Grade ≠ Zero Grade**: Mata pelajaran atau asesmen yang belum dinilai ditampilkan dengan simbol `-` dan bukan nilai `0`.
   - Menghitung Nilai Akhir (NA) kompilasi Kurikulum Merdeka (bobot Formatif 40% + Sumatif 60%), predikat kompetensi (A, B, C, D), serta perumusan otomatis narasi deskripsi Capaian Pembelajaran tertinggi dan kompetensi yang perlu ditingkatkan.
   - **Lembar Cetak Rapor Resmi A4 (`ReportCardPrintModal`)**: Modal pratinjau dokumen cetak resmi berskala A4 siap cetak (`window.print()`) lengkap dengan Kop Sekolah, NIS/NISN, tabel capaian kompetensi, rekapitulasi presensi semester, catatan wali kelas, dan kolom tanda tangan resmi.

---

## 2. Pemenuhan Domain Invariants & Aturan Keamanan

| Invariant / Aturan | Implementasi & Penegakan | Status |
|---|---|---|
| **Student Self-Scope (`STUDENT_SELF`)** | Query data dibatasi secara ketat di layer `studentExperienceRepository` dan `studentExperienceService` menggunakan ID siswa pemilik akun yang terautentikasi (`user.id` -> `siswa.id`). Siswa dilarang keras melihat atau mengumpulkan data milik siswa lain. | TERPENUHI |
| **FR-SXP-004 (Zero Draft Leakage)** | Query nilai asesmen memfilter secara ketat `status: "PUBLISHED"` dan `target_publikasi: { in: ["SISWA", "SEMUA"] }`. Nilai draft atau nilai yang belum dipublikasikan guru tidak dapat diakses oleh siswa. | TERPENUHI |
| **Missing Grade != Zero Grade** | Nilai asesmen yang belum diinput atau belum ada bernilai `null` dan ditampilkan sebagai `-` pada UI dan tabel cetak rapor, tidak pernah di-default ke angka 0. | TERPENUHI |
| **Toleransi Keterlambatan Tugas** | Tugas yang melewati batas waktu divalidasi berdasarkan bendera `izinkan_terlambat`. Jika guru melarang pengumpulan terlambat, sistem menolak pengumpulan dengan `AssignmentSubmissionDeadlinePassedError`. Jika diizinkan, tugas ditandai dengan status `TERLAMBAT`. | TERPENUHI |
| **Audit Logging** | Setiap aksi penyerahan atau pembaruan tugas siswa dicatat ke log audit (`recordAuditEvent`) dengan aksi `SUBMIT_ASSIGNMENT`. | TERPENUHI |
| **Canonical Navigation** | Rute `/tugas-siswa` dan `/rapor-siswa` telah diaktifkan secara resmi di `navigation-config.ts` (`isPhaseDeferred: false`). | TERPENUHI |

---

## 3. Berkas yang Dibuat & Dimodifikasi

### A. Berkas Baru Dibuat (11 Berkas)
1. `src/modules/student/domain/student-experience-types.ts`: Definisi antarmuka TypeScript untuk profil konteks siswa, jadwal, tugas, materi, presensi, asesmen terpublikasi, e-rapor, dan agregasi dashboard data.
2. `src/modules/student/domain/student-experience-errors.ts`: Definisi domain error khusus (`StudentNotFoundError`, `StudentInactiveError`, `StudentNotInActiveRombelError`, `AssignmentSubmissionDeadlinePassedError`).
3. `src/modules/student/domain/student-experience-validation.ts`: Skema validasi Zod `SubmitAssignmentSchema` untuk pengumpulan tugas siswa.
4. `src/modules/student/infrastructure/student-experience-repository.ts`: Data layer repository komprehensif dengan query prisma teroptimasi untuk dashboard, KBM, nilai terpublikasi, presensi, kompilasi rapor, dan upsert pengumpulan tugas.
5. `src/modules/student/application/student-experience-service.ts`: Application service orkestrator bisnis dengan self-scope check dan audit logging.
6. `src/app/actions/student-experience-actions.ts`: Server action `submitStudentAssignmentAction` dengan upload berkas via `LocalStorageAdapter` ke `/api/berkas`.
7. `src/app/tugas-siswa/page.tsx`: Route page terproteksi untuk `/tugas-siswa`.
8. `src/app/rapor-siswa/page.tsx`: Route page terproteksi untuk `/rapor-siswa`.
9. `src/modules/student/presentation/submit-assignment-modal.tsx`: Modal pengumpulan tugas siswa.
10. `src/modules/student/presentation/material-detail-modal.tsx`: Modal pembaca materi siswa.
11. `src/modules/student/presentation/report-card-print-modal.tsx`: Modal pratinjau cetak resmi A4 rapor Kurikulum Merdeka.
12. `src/modules/student/presentation/student-learning-view.tsx`: Tampilan tabbed view KBM siswa (Tugas, Materi, Presensi).
13. `src/modules/student/presentation/student-report-card-view.tsx`: Tampilan Buku Nilai & e-Rapor Kurikulum Merdeka.
14. `prisma/seed-student-experience.ts`: Script seed data realistis KBM, tugas, materi, CBT, dan nilai asesmen rombel aktif X RPL.
15. `src/test/student/student-experience.test.ts`: Suite test unit & integrasi service layer siswa.
16. `src/test/student/student-experience-views.test.tsx`: Suite test komponen presentasi UI siswa.
17. `scripts/qa-phase15-visual-walkthrough.mjs`: Skrip Playwright automated visual walkthrough.

### B. Berkas Dimodifikasi (4 Berkas)
1. `src/shared/components/dashboard/role-views/student-dashboard.tsx`: Upgrade dari mock statis menjadi async data-driven server component.
2. `src/shared/components/shell/navigation-config.ts`: Mengaktifkan menu `/tugas-siswa` dan `/rapor-siswa` (`isPhaseDeferred: false`).
3. `src/test/shell/dashboard-views.test.tsx`: Penyesuaian test dashboard siswa untuk mendukung asynchronous contract & live initial data.
4. `docs/phases/screenshots/phase-15-walkthrough/`: Penyimpanan 10 aset screenshot verifikasi visual.

---

## 4. Hasil Quality Gates

| Gate | Status | Hasil / Keterangan |
|---|---|---|
| **Typecheck (`tsc --noEmit`)** | **PASS** | 0 error di seluruh project TypeScript. |
| **Linter (`eslint .`)** | **PASS** | 0 error, 4 warning non-blocking (komponen CBT sebelumnya). |
| **Formatter (`prettier --check .`)** | **PASS** | Semua berkas terformat rapi sesuai konfigurasi Prettier. |
| **Unit & Integration Test (`vitest`)** | **PASS** | **71 test files passed (71/71)**, **385 tests passed (385/385)** tanpa kegagalan. |
| **Next.js Production Build (`next build`)** | **PASS** | Kompilasi Turbopack sukses, 16 static & dynamic pages ter-generate optimal. |
| **Visual Walkthrough (Playwright)** | **PASS** | 10 screenshot tersimpan pada resolusi desktop (1440x900) dan mobile (390x844). |

---

## 5. Galeri Verifikasi Visual (10 Screenshot)

Direktori: `docs/phases/screenshots/phase-15-walkthrough/`
1. `01_student_dashboard_desktop.png`: Dashboard Siswa Desktop (1440x900) — Profil X RPL, kartu KPI, Jadwal KBM Hari Ini, CBT Online, Tugas Mendatang.
2. `02_student_dashboard_mobile.png`: Dashboard Siswa Mobile (390x844) — Tampilan mobile-responsive Academic Glass UI.
3. `03_student_learning_assignments.png`: Halaman `/tugas-siswa` Tab Tugas Kelas — Filter status pengerjaan, batas waktu, dan badge indikator.
4. `04_student_submit_assignment_modal.png`: Modal Pengumpulan Tugas — Form uraian teks, dropzone berkas, dan status pengumpulan.
5. `05_student_learning_materials.png`: Halaman `/tugas-siswa` Tab Materi — Modul bahan ajar per mata pelajaran.
6. `06_student_material_detail_modal.png`: Modal Pembaca Materi — Preview teks terstruktur, unduhan berkas lampiran guru, tautan luar.
7. `07_student_learning_attendance.png`: Halaman `/tugas-siswa` Tab Presensi — Rekapitulasi persentase dan log kehadiran per sesi KBM.
8. `08_student_report_card_compilation.png`: Halaman `/rapor-siswa` Kompilasi e-Rapor — Transkrip Kurikulum Merdeka, KKTP, capaian kompetensi, catatan wali kelas.
9. `09_student_report_card_print_preview.png`: Modal Cetak Lembar Rapor Resmi A4 — Pratinjau dokumen cetak resmi berskala A4 siap print / save PDF.
10. `10_student_published_grades_detail.png`: Halaman `/rapor-siswa` Tab Rincian Asesmen — Daftar lengkap nilai formatif & sumatif terpublikasi resmi.

---

## 6. Batasan & Out-of-Scope Confirmation
- Fitur portal Wali Murid / Orang Tua berada di **Phase 16 (Guardian Experience)** dan tidak dikerjakan pada phase ini.
- Pelaksanaan CBT Ujian Siswa secara penuh tetap merujuk pada CBT Engine yang telah tervalidasi pada Phase 14 (tersedia link langsung dari dashboard siswa).
- Tidak ada modifikasi skema database Prisma yang bersifat merusak (*zero breaking database changes*).
