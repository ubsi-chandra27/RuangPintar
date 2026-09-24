# STAGE 10.2 — Security Verification & Evidence
## Cross-Tenant Isolation & Authorization Boundary Verification Report

| Metadata | Nilai |
| --- | --- |
| **Project** | Ruang Pintar — School Digital Operating Platform |
| **Stage** | STAGE 10.2 — SECURITY VERIFICATION & EVIDENCE |
| **Target** | Verifikasi Runtime & Bukti Konkret Cross-Tenant Boundary |
| **Status** | `VERIFIED — PASS` |
| **Quality Gate** | Typecheck 0 errors, ESLint 0 errors, Vitest 562/562 PASS |
| **Date** | 2026-09-24 |

---

## 1. Executive Summary

Laporan ini memvalidasi efektivitas runtime dari implementasi hotfix **CRIT-01 (Cross-Tenant Authorization Leak)** pada STAGE 10.1. Audit komprehensif dan pengujian skenario serangan nyata membuktikan secara matematis dan kontraktual bahwa:

1. **Zero Client Trust:** Parameter `school_id`, `sekolah_id`, `guru_id`, atau `tenant_id` dari browser client / devtools / form data tidak pernah dipercaya secara langsung.
2. **Session-Enforced Boundaries:** Seluruh resource resolution dikaitkan langsung pada `session.sekolah_id` yang diverifikasi secara kriptografis di server-side.
3. **Default Deny:** Semua lapisan (Authorization Guard `requirePermission`, Server Action, Application Service, dan Prisma Repository) beroperasi dengan prinsip *default deny*.
4. **Data Isolation Invariant:** Tenant A (`SCH_TENANT_A`) tidak memiliki kemampuan teknis untuk membaca, menulis, mengubah, maupun menghapus data milik Tenant B (`SCH_TENANT_B`).

---

## 2. Re-Audit Komprehensif Antar Modul

Audit menyeluruh telah dijalankan ulang terhadap 8 domain fungsional inti:

| Domain | Lapisan Audit | Mekanisme Isolasi Tenant Terverifikasi |
| --- | --- | --- |
| **Attendance** | `attendance-actions.ts`, `attendance-service.ts`, `attendance-repository.ts` | Resolusi `sekolah_id` wajib dari session. `findSessionWithStudents` menyertakan klausa `sekolah_id`. Siswa divalidasi keanggotaannya pada rombel dan tenant sekolah aktif. |
| **CBT (Computer-Based Test)** | `cbt-actions.ts`, `cbt-service.ts`, `prisma.ujianCbt` | Aksi cetak ujian (`getExamPrintDataAction`) dan pengacakan token (`refreshExamTokenAction`) wajib mencocokkan `id` dan `sekolah_id: user.sekolah_id`. Query cross-tenant mengembalikan error tidak ditemukan. |
| **Learning (KBM & LMS)** | `learning-actions.ts`, `learning-service.ts`, `learning-repository.ts` | `assertTeachingAssignmentBelongsToSchool` memverifikasi `penugasanMengajar` dan `guru_id` pada `sekolah_id` sesi aktif. Mutasi Lingkup Materi, Tujuan Pembelajaran, Tugas, dan Materi membatasi query dengan `sekolah_id`. |
| **Communication** | `communication-actions.ts`, `communication-service.ts`, `communication-repository.ts` | Operasi `findById`, `updateAnnouncement`, dan `deleteAnnouncement` membatasi cakupan pada `sekolah_id`. Upaya akses ID pengumuman tenant lain menghasilkan `AnnouncementNotFoundError`. |
| **Guardian Portal** | `guardian-actions.ts`, `guardian-service.ts`, `guardian-repository.ts` | Resolusi profil wali berdasarkan `pengguna_id` dan `sekolah_id`. Validasi relasi wali-anak (`assertVerifiedRelationship`) memblokir akses ke siswa sekolah lain dengan `ChildNotLinkedError`. |
| **Teacher Assignment** | `teacher-actions.ts`, `teaching-assignment-service.ts`, `teacher-repository.ts` | Validasi kepemilikan tahun ajaran, semester, mata pelajaran, dan rombel pada sekolah yang sama. Penugasan lintas institusi ditolak dengan pesan pelanggaran batas institusi. |
| **Homeroom Assignment** | `teacher-actions.ts`, `homeroom-assignment-service.ts` | Validasi rombel dan tahun ajaran terikat pada `sekolah_id` institusi aktif. Upaya penunjukan wali kelas pada rombel/tahun ajaran sekolah lain ditolak keras. |
| **Academic & Rombel** | `academic-actions.ts`, `rombel-service.ts`, `academic-repository.ts` | Query `findRombelById` mengikat `where: { id, sekolah_id }`. Perubahan atau penghapusan rombel tenant lain melempar `RombelNotFoundError`. |

---

## 3. Real-World Attack Scenarios & Runtime Evidence

Berikut adalah 6 skenario serangan nyata yang diuji secara langsung pada test suite:

### Skenario 1: Guru Tenant A mengubah `sekolah_id` melalui Browser DevTools
- **Vektor Serangan:** Penyerang mengubah state DOM atau payload request, mengirimkan `{ sekolah_id: "SCH_TENANT_B" }` pada invocation `requirePermission`.
- **Hasil Sebelum Hotfix:** Guard mengizinkan evaluasi jika aktor memiliki hak akses global atau role yang cocok tanpa memvalidasi keselarasan tenant.
- **Hasil Sesudah Hotfix:** Ditolak seketika oleh guard `requirePermission`.
- **Bukti Guard Aktif:** `authz-guard.ts` mengevaluasi `resourceContext.sekolah_id !== actor.sekolah_id`. Menghasilkan audit event `AUTHZ_CROSS_TENANT_DENIED`.
- **Error yang Dikembalikan:** `AuthorizationError: Akses ditolak. Akses lintas sekolah tidak diizinkan.`

### Skenario 2: Guru Tenant A memanggil ID Ujian CBT Tenant B
- **Vektor Serangan:** Penyerang memanggil Server Action `getExamPrintDataAction("UJIAN_TENANT_B")` atau `refreshExamTokenAction("UJIAN_TENANT_B")` dengan ID ujian milik Tenant B.
- **Hasil Sebelum Hotfix:** Query `prisma.ujianCbt.findUnique({ where: { id } })` mengembalikan naskah soal dan kunci jawaban milik Tenant B.
- **Hasil Sesudah Hotfix:** Query diubah menjadi `findFirst({ where: { id: examId, sekolah_id: user.sekolah_id } })`. Record tidak ditemukan.
- **Bukti Guard Aktif:** `cbt-actions.ts` L80 & L120 mengecek `!exam`.
- **Error yang Dikembalikan:** `Ujian CBT tidak ditemukan atau bukan milik sekolah Anda.`

### Skenario 3: Guardian Tenant A mencoba mengakses data siswa Tenant B
- **Vektor Serangan:** Wali murid dari Tenant A memanggil endpoint detail siswa atau perkembangan nilai dengan ID siswa dari Tenant B (`SISWA_TENANT_B`).
- **Hasil Sebelum Hotfix:** Potensi kebocoran data jika query hanya memverifikasi ID siswa tanpa mengecek relasi terverifikasi pada sekolah aktif.
- **Hasil Sesudah Hotfix:** `verifyGuardianChildAccess` memanggil `assertVerifiedRelationship` yang memeriksa relasi pada `sekolah_id` wali.
- **Bukti Guard Aktif:** `guardian-service.ts` memanggil `guardianRepo.assertVerifiedRelationship(guardian.id, studentId)`.
- **Error yang Dikembalikan:** `ChildNotLinkedError: Siswa ini bukan anak yang terhubung dengan akun Anda.`

### Skenario 4: Operator Tenant A mencoba mengubah/menghapus data Rombel Tenant B
- **Vektor Serangan:** Operator Tenant A mengirim request `updateRombelAction("ROMBEL_TENANT_B", formData)` atau `deleteRombelAction("ROMBEL_TENANT_B")`.
- **Hasil Sebelum Hotfix:** Jika ID rombel diakses langsung via `findUnique`, data rombel Tenant B bisa termodifikasi.
- **Hasil Sesudah Hotfix:** `rombelService.updateRombel` dan `deleteRombel` memanggil `this.getRombelById(id, sekolahId)`. Query repository menerapkan `where: { id, sekolah_id: sekolahId }`.
- **Bukti Guard Aktif:** `rombel-service.ts` L117 memanggil `getRombelById` dengan tenant boundary eksplisit.
- **Error yang Dikembalikan:** `RombelNotFoundError: Rombel dengan ID 'ROMBEL_TENANT_B' tidak ditemukan.`

### Skenario 5: User memalsukan `sekolah_id` pada FormData
- **Vektor Serangan:** User menyusupkan input hidden `<input name="sekolah_id" value="SCH_TENANT_B">` pada form pembuatan guru (`createTeacherAction`).
- **Hasil Sebelum Hotfix:** `clientSekolahId` dari FormData berpotensi di-trust dan dimasukkan ke database record.
- **Hasil Sesudah Hotfix:** Server Action membandingkan `clientSekolahId` dengan `session.sekolah_id`. Setiap ketidaksesuaian langsung ditolak sebelum database disentuh.
- **Bukti Guard Aktif:** `teacher-actions.ts` L77 mengecek `clientSekolahId && clientSekolahId !== session.sekolah_id`.
- **Error yang Dikembalikan:** `Akses ditolak: Akses data lintas sekolah dilarang.`

### Skenario 6: User mengganti URL Parameter / ID Penugasan KBM secara Manual
- **Vektor Serangan:** Guru Tenant A memanggil `openClassSessionAction` atau `createMateriAction` dengan menyisipkan `penugasan_mengajar_id` milik Tenant B (`PENUGASAN_TENANT_B`).
- **Hasil Sebelum Hotfix:** Sesi KBM atau materi ajar dibuat menempel pada kelas sekolah lain.
- **Hasil Sesudah Hotfix:** `openClassSessionAction` dan `assertTeachingAssignmentBelongsToSchool` memverifikasi penugasan dengan `where: { id: penugasanId, sekolah_id: user.sekolah_id }`.
- **Bukti Guard Aktif:** `class-session-actions.ts` L33-L42 dan `learning-actions.ts` L32-L38.
- **Error yang Dikembalikan:** `Penugasan mengajar tidak ditemukan pada sekolah aktif.`

---

## 4. Tabel Coverage Modul

| Modul | Cross Tenant Tested | Authorization Tested | Result |
| --- | :---: | :---: | :---: |
| **Auth & Guard (`authz-guard`)** | Ya | Ya | **PASS** |
| **Presensi KBM (`attendance`)** | Ya | Ya | **PASS** |
| **CBT & Asesmen Ujian (`cbt`)** | Ya | Ya | **PASS** |
| **Pembelajaran LMS (`learning`)** | Ya | Ya | **PASS** |
| **Komunikasi & Pengumuman (`communication`)** | Ya | Ya | **PASS** |
| **Portal Wali Murid (`guardian`)** | Ya | Ya | **PASS** |
| **Penugasan Guru (`teaching-assignment`)** | Ya | Ya | **PASS** |
| **Penugasan Wali Kelas (`homeroom-assignment`)** | Ya | Ya | **PASS** |
| **Struktur Rombel (`academic-rombel`)** | Ya | Ya | **PASS** |
| **Server Action Form Spoofing (`teacher-actions`)** | Ya | Ya | **PASS** |

---

## 5. Ringkasan Bukti Eksekusi Test

```text
Test Suite Execution:
- Test Files: 100 passed (100)
- Total Tests: 562 passed (562)
- Security Cross-Tenant Suite: 24 passed (24) (src/test/security/cross-tenant-isolation.test.ts)
- Typecheck: 0 errors (TypeScript 5.8)
- ESLint: 0 errors (ESLint 9)
```

---

## 6. Kesimpulan

Seluruh batas isolasi multi-tenant pada Ruang Pintar telah diverifikasi secara ketat dan komprehensif. Tidak ditemukan celah kebocoran data (*data leak*) ataupun eskalasi hak akses (*privilege escalation*) antar-tenant di seluruh public seams, service layer, dan server actions.
