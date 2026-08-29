# PHASE 06 — SCHOOL & ORGANIZATION

**Status:** APPROVED & CHECKPOINTED
**Tipe:** IMPLEMENTATION & TESTING DELIVERABLE
**Branch Baseline:** `main`
**Starting HEAD:** `9ff3223e127529b88bff1489038054ea76b084d8`
**Phase 06 Official Checkpoint Commit:** `b91a23c052dcb6b09957d19fe69852fb4d8ee1b9`
**Starting Working Tree:** `CLEAN`
**Phase 05 Status:** `APPROVED & CHECKPOINTED` (Commit: `9125a26`, Final Governance HEAD: `9ff3223`)
**Migration Delta:** 0 Migration Baru (Menggunakan fondasi Prisma schema Phase 02)
**Test Suite:** 145 Tests PASS (98 Regresi Phase 00–05 + 47 Phase 06 Baru)
**Quality Gates:** Format PASS, Lint PASS, Typecheck PASS, Tests PASS, Build PASS, Audit PASS

---

## 1. Ringkasan Eksekutif

Phase 06 merealisasikan domain **School & Organization (M01)** sebagai modul tata kelola institusi pendidikan pada platform Ruang Pintar. Modul ini menyediakan kapabilitas pengelolaan identitas sekolah, unit & sub-unit hierarkis, master jabatan struktural, serta alokasi penugasan personil ke jabatan struktural dengan penegakan batasan keamanan, integritas riwayat (*history preservation*), transaksi atomik, dan pencatatan audit log terintegrasi.

---

## 2. Ruang Lingkup Domain yang Diimplementasikan

### 2.1. Profil & Identitas Sekolah (`Sekolah`)
- **Atribut:** Nama resmi sekolah, NPSN (8 digit unik), Jenjang pendidikan (`SD`, `SMP`, `SMA`, `SMK`, `UMUM`), Alamat lengkap institusi, Nomor telepon, Alamat email resmi, Zona waktu (`Asia/Jakarta`, `Asia/Makassar`, `Asia/Jayapura`), URL/Path logo sekolah, Status keaktifan.
- **Validasi:** Normalisasi string, validasi format NPSN, pencegahan protokol berbahaya (XSS injection pada logo URL seperti `javascript:`), dan validasi keunikan NPSN lintas institusi.

### 2.2. Unit & Bagian Organisasi (`UnitOrganisasi`)
- **Atribut:** Nama unit, Kode singkatan uppercase (opsional), Induk unit (`induk_unit_id` untuk hierarki relasional *self-referential*).
- **Integritas:** Pencegahan referensi circular (*unit cannot be its own parent*), pencegahan duplikasi nama unit dalam satu sekolah.
- **History-Preserving Deletion Rules:**
  - Penolakan penghapusan jika unit masih memiliki sub-unit (*child units exist*).
  - Penolakan penghapusan jika unit masih dirujuk oleh master jabatan struktural.

### 2.3. Master Jabatan Struktural (`Jabatan`)
- **Atribut:** Kode jabatan (`kode_jabatan`), Nama jabatan (`nama_jabatan`), Relasi unit organisasi (`unit_id`), Tingkat akses scope (`SCHOOL_WIDE`, `UNIT_WIDE`, `PROGRAM_WIDE`).
- **Katalog Kode Jabatan:**
  - Jabatan Kanonikal: `HEADMASTER`, `VICE_PRINCIPAL_CURRICULUM`, `VICE_PRINCIPAL_STUDENT_AFFAIRS`, `PROGRAM_HEAD`.
  - Jabatan Kustom: Format uppercase snake_case unik semantik per sekolah (contoh: `WAKASEK_SARPRAS`, `KAPROGLI_RPL`, `KOORDINATOR_BK`).
- **Integritas:** Keunikan komposit `[sekolah_id, kode_jabatan]`, imutabilitas kode jabatan setelah dibuat, pencegahan penghapusan jika memiliki riwayat penugasan personil (*history-preserving*).

### 2.4. Penugasan Jabatan Personil (`PenugasanJabatan`)
- **Atribut:** Relasi sekolah (`sekolah_id`), Jabatan (`jabatan_id`), Personil (`personil_id`), Tanggal mulai berlaku (`berlaku_mulai`), Tanggal selesai (`berlaku_sampai`), Status penugasan (`AKTIF`, `SELESAI`, `DIBATALKAN`), Catatan / Nomor SK.
- **Invariant Aplikasi:** Validasi personil aktif di sekolah yang sama melalui query `Pengguna`.
- **Siklus Hidup:** Penugasan baru berstatus `AKTIF`, pengakhiran masa tugas beralih ke `SELESAI`, dan pembatalan resmi beralih ke `DIBATALKAN` disertai alasan pembatalan wajib.

---

## 3. Matriks Otorisasi Aktual & Effective Position-Based Access

Otorisasi dievaluasi secara deterministik mengikuti alur kanonikal:
`Identity → Base Role → Position Assignment → Permission → Resource Scope → Actual Access`

| Aktor / Peran / Penugasan | `academic.school.view` | `academic.school.manage` | `academic.structure.view` | `academic.structure.manage` |
| :--- | :---: | :---: | :---: | :---: |
| **SUPER_ADMIN** | ✅ ALLOW | ✅ ALLOW | ✅ ALLOW | ✅ ALLOW |
| **SCHOOL_STAFF + ACADEMIC_OPERATOR** | ✅ ALLOW | ❌ DENY | ✅ ALLOW | ✅ ALLOW |
| **SCHOOL_STAFF (Capability Lain / Polos)** | ✅ ALLOW | ❌ DENY | ❌ DENY | ❌ DENY |
| **TEACHER (Biasa / Tanpa Jabatan)** | ✅ ALLOW | ❌ DENY | ❌ DENY | ❌ DENY |
| **TEACHER + Active `VICE_PRINCIPAL_CURRICULUM`** | ✅ ALLOW | ❌ DENY | ✅ ALLOW | ✅ ALLOW |
| **`VICE_PRINCIPAL_CURRICULUM` (Expired / Selesai / Batal / Future)** | ✅ ALLOW | ❌ DENY | ❌ DENY | ❌ DENY |
| **`VICE_PRINCIPAL_CURRICULUM` (Sekolah Lain / Cross-School)** | ❌ DENY | ❌ DENY | ❌ DENY | ❌ DENY |
| **STUDENT / GUARDIAN** | ✅ ALLOW | ❌ DENY | ❌ DENY | ❌ DENY |

- **Least Privilege:** Hanya `SUPER_ADMIN` yang dapat mengubah data identitas resmi sekolah.
- **Default Deny:** Seluruh mutasi divalidasi server-side via `requirePermission()`.
- **Isolasi Konteks:** Permintaan ke resource di luar `sekolah_id` ditolak otomatis (*cross-school context protection*).

---

## 4. Keamanan Route `/sekolah` & Isolasi Data Multi-Tab

Halaman Server `/sekolah` menerapkan pembatasan data ketat di server-side:
- **Hak Lihat Profil:** Pengguna dengan hanya `academic.school.view` (misal Guru biasa atau Siswa) hanya menerima data profil sekolah.
- **Isolasi Tab Struktur:** Pemanggilan `organizationUnitService.getUnits()`, `positionService.getPositions()`, dan `positionAssignmentService.getAssignments()` hanya dilakukan jika aktor memiliki hak `academic.structure.view`. Jika tidak berhak, array kosong dikirim ke client dan tab struktur tidak dirender di DOM.
- **Isolasi Aksi Manajemen:** Tombol mutasi (`+ Tambah Unit`, `+ Tambah Jabatan`, `+ Tugaskan Personil`, `Edit`, `Hapus`, `Akhiri`, `Batalkan`) hanya dirender jika aktor memiliki `academic.structure.manage`.
- **Server-Side Action Hardening:** Seluruh Server Action di `src/app/actions/school-actions.ts` memverifikasi izin `requirePermission()` independen dari UI.

---

## 5. Transaksi Atomik & Append-Oriented Audit Log

Setiap operasi mutasi domain dieksekusi di dalam `prisma.$transaction` dan mencatat rekam jejak ke tabel `log_audit` melalui `recordAuditEvent()`:
- `SCHOOL_PROFILE_UPDATED`: Menyimpan snapshot sebelum dan sesudah perubahan data sekolah.
- `ORG_UNIT_CREATED`, `ORG_UNIT_UPDATED`, `ORG_UNIT_DELETED`: Mencatat pembuatan, pembaruan, dan penghapusan unit.
- `POSITION_CREATED`, `POSITION_UPDATED`, `POSITION_DELETED`: Mencatat modifikasi katalog master jabatan.
- `POSITION_ASSIGNED`, `POSITION_ASSIGNMENT_ENDED`, `POSITION_ASSIGNMENT_CANCELLED`: Mencatat alokasi dan transisi status jabatan personil.

---

## 6. Bukti Pengujian & Quality Gates

### 6.1. Ringkasan Automated Test (Vitest)
```text
Test Files: 29 passed (29)
Tests:      145 passed (145)
Duration:   ~21s
```

Daftar suite test Phase 06:
- `src/test/school/school-profile.test.ts` (5 tests)
- `src/test/school/organization-unit.test.ts` (6 tests)
- `src/test/school/position.test.ts` (5 tests)
- `src/test/school/position-assignment.test.ts` (6 tests)
- `src/test/school/school-authz.test.ts` (16 tests — mencakup verifikasi `VICE_PRINCIPAL_CURRICULUM`, lifecycle states, dan cross-school isolation)
- `src/test/school/school-views.test.tsx` (9 tests — mencakup verifikasi tab isolation, read-only state, dan modal triggers)

### 6.2. Visual QA & Responsive Viewports
Tangkapan layar Playwright visual QA berhasil diambil pada 4 viewport kanonikal dan dialog modal di `docs/phases/screenshots/phase-06/`:
1. `01_desktop_large_1440x900_profile.png` — Profil Sekolah pada Desktop Lebar (1440×900).
2. `02_desktop_standard_1024x768_units.png` — Unit Organisasi pada Desktop Standar (1024×768).
3. `03_tablet_portrait_768x1024_positions.png` — Master Jabatan pada Tablet Portrait (768×1024).
4. `04_mobile_phone_390x844_assignments.png` — Penugasan Personil pada Ponsel Mobile (390×844).
5. `05_modal_create_unit.png` — Dialog Modal Tambah Unit Organisasi.
6. `06_modal_create_position.png` — Dialog Modal Tambah Jabatan Struktural.
7. `07_modal_assign_position.png` — Dialog Modal Penugasan Personil ke Jabatan.
8. `contact-sheet.html` — Lembar kontak visual interaktif untuk inspeksi komprehensif.

---

## 7. Out-of-Scope Confirmation

Phase 06 **TIDAK** menyertakan atau mendahului modul berikutnya:
- ❌ Tidak ada pembuatan Tahun Ajaran, Semester, atau Rombel (Ruang lingkup Phase 07).
- ❌ Tidak ada pengelolaan Biodata Siswa atau Enrollment (Ruang lingkup Phase 08).
- ❌ Tidak ada penugasan jam mengajar guru ke mata pelajaran (Ruang lingkup Phase 09).
- ❌ Tidak ada jadwal pelajaran, presensi, ataupun buku nilai (Phase 10+).
- ❌ Tidak ada migrasi database baru (0 new migrations).
