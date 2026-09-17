# PHASE 21 — AI ASSISTANCE & SAAS ONBOARDING (M21 / FREEMIUM MODEL)
## Ruang Pintar — School Digital Operating Platform

**Versi:** 1.0  
**Status:** READY FOR HUMAN REVIEW  
**Tanggal:** 17 September 2026  
**Penyusun:** Antigravity AI Coding Agent  
**Modul Induk:** M21 — AI Assistance & SaaS Onboarding  
**Dokumen Referensi:**
- `AGENTS.md` (Domain Invariants & UI Reference = Contract)
- `docs/03-MODULE-MAP.md` (M21 AI Assistance & Smart Onboarding)
- `docs/04-ROLE-ACCESS.md` (Self-Service Registration & Freemium Role Scopes)
- `docs/05-SYSTEM-ARCHITECTURE.md` (Multimodal Vision AI & SaaS Tenant Isolation)
- `docs/BRD.md`, `docs/PRD.md`, `docs/FRD.md`

---

# 1. Ringkasan Eksekutif

Phase 21 mengantarkan platform **Ruang Pintar** bertransformasi menjadi **Software-as-a-Service (SaaS)** modern yang siap go-live dan onboarding publik secara instan. Fitur ini dirancang khusus untuk mengatasi *friction* terbesar saat guru baru mencoba aplikasi: **beban input manual daftar siswa dan kelas**.

Dengan menghadirkan **"Photo-to-Class Vision AI Agent"**, guru (misal guru baru Pak A dari SMA 1 Coba) cukup mendaftar dalam waktu **di bawah 30 detik** melalui formulir 4 kolom, memotret lembar kertas absensi kelas yang sudah ada menggunakan kamera ponsel/laptop, dan membiarkan kecerdasan multimodal AI mengekstrak nama rombel serta seluruh nama siswa dalam hitungan detik.

### Invariant Inti Phase 21:
1. **`Vision Draft ≠ Committed Rombel (Strict Human-in-the-Loop)`**:
   - Hasil pemindaian model Vision AI (Google Gemini 1.5/Flash) tidak pernah langsung ditulis secara liar ke tabel operasional database. Hasil ekstraksi disajikan terlebih dahulu ke layar pratinjau interaktif (`AiPreviewTableModal`) agar guru dapat memeriksa, memperbaiki typo nama, atau menyesuaikan jenis kelamin sebelum menyetujui penerbitan kelas.
2. **`Self-Service Freemium ≠ Multi-Tenant Pollution (Strict Workspace Isolation)`**:
   - Setiap registrasi mandiri guru menciptakan ruang kerja sekolah tersendiri bertipe lisensi `FREEMIUM` dengan masa uji coba 30 hari dan kuota maksimal 5 rombel aktif. Ruang kerja terisolasi penuh dan tidak dapat mengintip atau mengganggu data sekolah lain.
3. **`Zero-Friction Registration (Progressive Disclosure)`**:
   - Formulir pendaftaran hanya meminta 4 atribut penting: Nama Lengkap & Gelar, Email/WhatsApp, Password, dan Nama Asal Sekolah. Atribut formal institusi seperti NPSN, alamat resmi, dan nama kepala sekolah bersifat opsional dan dilengkapi secara progresif saat mencetak laporan resmi.
4. **`Resilient Multimodal Vision & Fallback Parsing`**:
   - Sistem dilengkapi adapter Vision cerdas berbasis Google Gemini Generative AI SDK, diperkuat dengan fallback parser heuristik cerdas yang mampu mengenali format lembar absensi sekolah Indonesia bahkan dalam kondisi jaringan offline atau tanpa API key.

---

# 2. Files Created & Modified

### Database & Migrations:
1. `prisma/schema.prisma`:
   - Penambahan kolom `tipe_lisensi` (`FREEMIUM` / `SEKOLAH`) dan `trial_berakhir_pada` pada model `Sekolah` dan `Pengguna`.
   - Penambahan model `PermintaanSetupKelasAi` (`id`, `sekolah_id`, `pengguna_id`, `nama_kelas`, `mata_pelajaran`, `foto_url`, `hasil_ekstraksi_json`, `status`, `rombel_id_hasil`, `created_at`, `updated_at`).
2. `prisma/migrations/20260917220000_add_ai_assistance_and_saas_m21/migration.sql`: Migrasi DDL forward untuk tabel permintaan setup AI dan kolom lisensi.
3. `scripts/apply-m21-migration.mjs`: Runner migrasi database SQLite tanpa downtime.
4. `scripts/wipe-otomindo-data.mjs`: Script pembersihan terstruktur seluruh data demo SMK Otomindo sesuai instruksi pengguna, dengan backup otomatis ke `prisma/data/backups/ruang-pintar-before-wipe-otomindo-20260917.db`.

### Domain & Application Layer:
5. `src/modules/ai-assistant/domain/ai-types.ts`: Definisi antarmuka `StudentDraftFromAi`, `ClassExtractionResult`, `SmartOnboardingRegistrationDTO`, `ConfirmClassCreationDTO`, dan `TeacherTrialStatusDTO`.
6. `src/modules/ai-assistant/domain/ai-errors.ts`: Definisi error domain (`AiExtractionError`, `TrialQuotaExceededError`, `TrialExpiredError`, `InvalidClassPhotoError`).
7. `src/modules/ai-assistant/domain/ai-validation.ts`: Skema validasi Zod untuk registrasi mandiri 4 kolom dan konfirmasi kelas.
8. `src/modules/ai-assistant/infrastructure/gemini-vision-service.ts`: Multimodal Vision Service menggunakan `@google/generative-ai` dengan heuristik OCR fallback parser cerdas.
9. `src/modules/ai-assistant/application/smart-onboarding-service.ts`: Core orchestrator untuk registrasi guru mandiri, pemrosesan foto lembar kelas, pembuatan transaksi kelas & siswa atomic, serta pelacak status uji coba 30 hari.
10. `src/app/actions/smart-onboarding-actions.ts`: Server actions Next.js (`registerTeacherAction`, `processClassPhotoAction`, `confirmClassCreationAction`, `getTeacherTrialStatusAction`).

### Presentation Layer:
11. `src/modules/ai-assistant/presentation/register-view.tsx`: Tampilan pendaftaran guru mandiri super cepat 4 kolom dengan Academic Glass UI.
12. `src/app/register/page.tsx`: Route halaman publik `/register`.
13. `src/modules/ai-assistant/presentation/smart-photo-onboarding-modal.tsx`: Modal dialog pengambilan foto kertas absensi via kamera HP/laptop atau upload file.
14. `src/modules/ai-assistant/presentation/ai-preview-table-modal.tsx`: Modal interaktif tabel pratinjau siswa hasil ekstraksi AI dengan fitur edit nama, toggle gender, tambah baris, dan tombol konfirmasi terbit.
15. `src/modules/ai-assistant/presentation/trial-banner.tsx`: Banner cockpit dashboard guru yang menampilkan sisa hari uji coba, kuota rombel aktif, tombol buat kelas AI, dan usulan cetak ke Kepala Sekolah.
16. `src/app/login/login-form.tsx`: Penambahan tautan ke halaman registrasi coba gratis.
17. `src/shared/components/dashboard/role-views/teacher-dashboard.tsx`: Pemasangan `<TrialBanner />` pada dashboard guru.

### Test Suites & Quality Assurance:
18. `src/test/ai-assistant/gemini-vision-service.test.ts`: Unit test untuk Vision Service dan parsing fallback cerdas (2 pengujian).
19. `src/test/ai-assistant/smart-onboarding-service.test.ts`: Integration test untuk alur registrasi guru, pencegahan duplikasi email, ekstraksi AI draft, konfirmasi kelas, dan kalkulasi kuota rombel (5 pengujian).
20. `src/test/ai-assistant/onboarding-views.test.tsx`: Presentation unit test untuk komponen registrasi, modal foto, dan tabel pratinjau (3 pengujian).
21. `scripts/qa-phase21-visual-walkthrough.mjs`: Script otomatis Playwright E2E visual walkthrough 7 skenario (desktop & mobile).

---

# 3. Visual QA Artifacts Walkthrough

Seluruh pengujian visual dijalankan otomatis via Playwright (`scripts/qa-phase21-visual-walkthrough.mjs`) dan menghasilkan 7 artifak visual di folder `docs/phases/screenshots/phase-21-walkthrough/`:

| No | Artifak Screenshot | Deskripsi Verifikasi |
|---|---|---|
| 01 | `01-register-page-clean.png` | Halaman `/register` mandiri guru dalam tema Academic Glass UI v1.2, menampilkan 4 kolom input yang bersih dan kartu keunggulan fitur di sisi kiri. |
| 02 | `02-register-page-filled.png` | Formulir pendaftaran terisi lengkap oleh calon pengguna (Pak Ahmad Fauzi, S.Pd dari SMA Negeri 1 Coba). |
| 03 | `03-teacher-dashboard-trial-active.png` | Otentikasi dan login instan ke Dashboard Guru tanpa input kode verifikasi rumit, menampilkan `<TrialBanner />` dengan status "30 hari tersisa" dan "Kuota 0 / 5 kelas". |
| 04 | `04-smart-photo-modal-ready.png` | Modal unggah lembar absensi kertas via kamera/berkas siap memindai, dilengkapi petunjuk opsional nama kelas dan mata pelajaran. |
| 05 | `05-ai-preview-table-modal.png` | Modal pratinjau hasil ekstraksi AI Vision (25 siswa terdeteksi), tabel interaktif untuk koreksi nama dan gender sebelum komit ke basis data. |
| 06 | `06-class-created-and-quota-updated.png` | Kelas berhasil diterbitkan secara instan, kuota rombel pada banner ter-update secara otomatis menjadi `(1 / 5 kelas)`. |
| 07 | `07-mobile-register-responsive.png` | Tampilan responsif pada perangkat mobile layar sempit (390 x 844 px), memastikan guru dapat mendaftar dengan lancar langsung dari smartphone. |

---

# 4. Hasil Quality Gates

Platform Ruang Pintar telah melewati seluruh quality gate operasional dengan hasil 100% sempurna:

```text
1. TypeScript Typecheck : PASS (tsc --noEmit: 0 error)
2. ESLint Rules        : PASS (eslint .: 0 error, 4 standard warnings)
3. Prettier Formatting : PASS (prettier --check .: 100% code style matched)
4. Vitest Test Suite   : PASS (88 test files, 493 tests passed, 0 failed)
   - Module AI Assistant: 3 files, 10 tests PASS
   - Full Regression   : 85 files, 483 tests PASS
5. Next.js Production  : PASS (next build: 24 routes compiled cleanly)
6. Visual QA Playwright : PASS (7/7 screenshot walkthrough verifikasi sukses)
```

---

# 5. Status Phase & Tindak Lanjut

Sesuai dengan ketentuan `AGENTS.md` (Aturan Satuan Phase & Kedaulatan Human):
- Status Phase 21: **READY FOR HUMAN REVIEW**
- Status Database: Bersih dari data demo SMK Otomindo, siap untuk uji coba langsung SaaS di lingkungan lokal maupun hosting produksi.
- AI berhenti pada checkpoint ini dan menantikan keputusan Human Reviewer sebelum melangkah ke phase berikutnya.
