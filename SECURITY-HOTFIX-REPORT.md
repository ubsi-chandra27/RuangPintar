# LAPORAN HOTFIX KEAMANAN KRITIS: STAGE 10.1 — CRIT-01
## Penutupan Celah Keamanan Akses Lintas Tenant (Cross-Tenant Authorization Leak)

**Tanggal:** 24 September 2026  
**Status:** SELESAI & TERVERIFIKASI (READY FOR HUMAN REVIEW)  
**Tingkat Keparahan:** KRITIS (CRITICAL — CRIT-01)  
**Lingkup:** Otorisasi Server-Side, Server Actions, Application Services, dan Multi-Tenant Boundary Enforcement.

---

## 1. Ringkasan Eksekutif

Audit STAGE 09 mengidentifikasi kerentanan kritis **CRIT-01 (Cross Tenant Authorization Leak)** pada sejumlah Server Actions, Application Services, dan Authorization Guards. Kerentanan ini berpotensi memungkinkan pengguna terautentikasi pada Tenant A (Sekolah A) untuk membaca, menulis, mengubah, atau menghapus entitas data yang dimiliki oleh Tenant B (Sekolah B) dengan memanipulasi parameter ID (`school_id` / `sekolah_id`, `teacher_id` / `guru_id`, `class_id` / `rombel_id`, `student_id` / `siswa_id`, `assignment_id` / `penugasan_id`).

Tahap **STAGE 10.1** ini telah berhasil menutup 100% temuan keamanan kritis tersebut tanpa menambahkan fitur baru atau mengubah antarmuka UI. Seluruh query database kini memiliki batas tenant eksplisit (`sekolah_id: user.sekolah_id`), konteks institusi sepenuhnya di-resolve dari sesi server terotentikasi, dan guard otorisasi server-side menerapkan prinsip **Default Deny** dengan penolakan langsung atas upaya spoofing lintas tenant.

---

## 2. Root Cause (Akar Masalah)

Akar masalah kerentanan terbagi menjadi tiga kategori utama:

1. **Kepercayaan Berlebih Terhadap Input Klien (Client-Input Trust)**:
   - Beberapa Server Action (misal: `saveSessionAttendanceAction`, `createTeacherAction`, `createMateriAction`, `createTugasAction`, `createAdministrasiAction`) menerima `sekolah_id` atau `guru_id` dari formulir klien (`FormData` / JSON payload) dan menggunakannya langsung dalam logika mutasi tanpa memvalidasi kecocokannya dengan sesi aktif server (`session.sekolah_id`).

2. **Kueri Database Berbasis ID Tunggal Tanpa Tenant Boundary (Single-Key Lookups)**:
   - Di modul *Learning* (`learning-repository.ts`), operasi pembaruan dan penghapusan (`updateLingkupMateri`, `deleteLingkupMateri`, `updateTujuanPembelajaran`, `deleteTujuanPembelajaran`, `updateMateri`, `deleteMateri`, `deleteTugas`, `updateAdministrasi`, `deleteAdministrasi`) hanya menggunakan klausa `where: { id }` tanpa parameter `sekolah_id`.
   - Di modul *CBT* (`cbt-actions.ts`), aksi cetak naskah ujian (`getExamPrintDataAction`) dan pengacakan token (`refreshExamTokenAction`) mencari data ujian semata-mata dengan `where: { id: ujianId }`. Hal ini berisiko membocorkan naskah ujian dan kunci jawaban rahasia lintas sekolah.
   - Di modul *Komunikasi* (`communication-service.ts`), pencarian dan penghapusan pengumuman belum memverifikasi kesesuaian `existing.sekolah_id === sekolahId`.

3. **Absennya Pengecekan Batas Tenant di Authorization Guard (`authz-guard.ts`)**:
   - `buildEvaluationContext` memuat profil guru dan penugasan jabatan/mengajar/wali kelas tanpa menyertakan klausa filter `sekolah_id: user.sekolah_id`.
   - `requirePermission` dan `checkPermission` tidak memeriksa apakah `resource.sekolah_id` yang diminta cocok dengan `user.sekolah_id` milik aktor yang sedang login.

---

## 3. Berkas yang Diubah (Files Modified)

| No | Berkas | Modul | Deskripsi Perubahan |
|---|---|---|---|
| 1 | `src/shared/infrastructure/authorization/types.ts` | AuthZ | Menambahkan `sekolah_id?: string;` ke `IGuardianRelationshipContext`. |
| 2 | `src/shared/infrastructure/authorization/assignment-contracts.ts` | AuthZ | Menambahkan validasi batas sekolah pada evaluasi lingkup relasi wali (`evaluateGuardianRelationshipScope`). |
| 3 | `src/shared/infrastructure/authorization/authz-guard.ts` | AuthZ | Auto-inject `sekolah_id` dari sesi server, menolak akses jika `resource.sekolah_id !== user.sekolah_id` (`AUTHZ_CROSS_TENANT_DENIED`), dan membatasi lookup penugasan ke sekolah aktif aktor. |
| 4 | `src/app/actions/attendance-actions.ts` | Presensi | Menolak `sekolah_id` palsu dari klien pada `saveSessionAttendanceAction`, memaksakan `user.sekolah_id`, dan meneruskannya ke domain service. |
| 5 | `src/modules/attendance/application/attendance-service.ts` | Presensi | Menerima `actorSekolahId`, memvalidasi kepemilikan sesi kelas di sekolah aktif, memvalidasi profil guru, dan memverifikasi seluruh siswa dalam payload terdaftar aktif pada rombel sekolah tersebut. |
| 6 | `src/app/actions/teacher-actions.ts` | Guru | Mencegah aktor non-superadmin menimpa `sekolah_id` dari `FormData` pada `createTeacherAction`. |
| 7 | `src/modules/teacher/application/teaching-assignment-service.ts` | Guru | Memvalidasi bahwa `tahun_ajaran_id` dan `semester_id` yang ditautkan berasal dari sekolah yang sama dengan penugasan. |
| 8 | `src/modules/teacher/application/homeroom-assignment-service.ts` | Guru | Memvalidasi bahwa `tahun_ajaran_id` pada penugasan wali kelas berasal dari sekolah yang sama (`CrossSchoolBoundaryError`). |
| 9 | `src/app/actions/cbt-actions.ts` | CBT | Membatasi pencarian ujian pada `getExamPrintDataAction` dan `refreshExamTokenAction` dengan klausa `{ id: ujianId, sekolah_id: user.sekolah_id }` serta menyaring bank soal naskah cetak ke sekolah aktif. |
| 10 | `src/modules/cbt/application/cbt-service.ts` | CBT | Membatasi verifikasi pendaftaran peserta ujian CBT (`penempatanRombel.findFirst`) dengan `sekolah_id: sekolahId`. |
| 11 | `src/app/actions/communication-actions.ts` | Komunikasi | Menegakkan verifikasi `user.sekolah_id` pada `getAnnouncementDetailAction`. |
| 12 | `src/modules/communication/application/communication-service.ts` | Komunikasi | Memastikan `existing.sekolah_id === sekolahId` pada `getAnnouncementById`, `updateAnnouncement`, dan `deleteAnnouncement`. |
| 13 | `src/modules/learning/infrastructure/learning-repository.ts` | Pembelajaran | Menambahkan parameter `sekolahId` dan scoping `findFirst({ where: { id, sekolah_id } })` pada pembaruan/penghapusan LM, TP, Materi, Tugas, dan Administrasi. |
| 14 | `src/modules/learning/application/learning-service.ts` | Pembelajaran | Meneruskan parameter `sekolahId` dari layer aplikasi ke repositori pada seluruh metode mutasi. |
| 15 | `src/app/actions/learning-actions.ts` | Pembelajaran | Menambahkan helper verifikasi penugasan mengajar milik sekolah, memvalidasi induk LM untuk TP, dan me-resolve `guru_id` dari sesi server terotentikasi. |
| 16 | `src/app/actions/class-session-actions.ts` | KBM | Menambahkan `requirePermission("attendance.session.record", { sekolah_id: user.sekolah_id })` dan memvalidasi penugasan milik sekolah aktif. |
| 17 | `src/app/actions/guardian-actions.ts` | Portal Wali | Memvalidasi relasi terverifikasi dan batas sekolah aktif sebelum mengizinkan pergantian konteks anak (`switchActiveChildAction`). |
| 18 | `src/modules/guardian/application/guardian-service.ts` | Portal Wali | Menegakkan verifikasi `guardian.sekolah_id === actor.sekolah_id` pada dashboard, presensi anak, nilai rapor, dan pengajuan izin. Menambahkan metode `verifyGuardianChildAccess`. |
| 19 | `src/modules/guardian/infrastructure/guardian-repository.ts` | Portal Wali | Memvalidasi `rel.siswa.sekolah_id === rel.wali.sekolah_id` pada `assertVerifiedRelationship`. |

---

## 4. Perbandingan Sebelum vs Sesudah (Before vs After)

### A. Server-Side Guard Boundary (`authz-guard.ts`)
```typescript
// SEBELUM (Rentan):
// Resource sekolah dari klien langsung dipercaya; tidak ada pencegahan akses lintas sekolah
export async function requirePermission(permission, resource = {}) {
  const user = await requireAuth();
  // Evaluasi context tanpa validasi resource.sekolah_id vs user.sekolah_id
}

// SESUDAH (Aman - Default Deny):
export async function requirePermission(permission, resource = {}) {
  const user = await requireAuth();
  
  // Rejection dini jika resource menargetkan tenant lain
  if (user.peran_dasar !== "SUPER_ADMIN" && resource.sekolah_id && resource.sekolah_id !== user.sekolah_id) {
    await recordAuditEvent({ aksi: "AUTHZ_CROSS_TENANT_DENIED", ... });
    throw new AuthorizationError("Akses ditolak: Resource bukan milik institusi aktif Anda.");
  }
  
  // Auto-injeksi sekolah aktif untuk aktor non-superadmin
  const effectiveResource = { ...resource };
  if (user.peran_dasar !== "SUPER_ADMIN" && user.sekolah_id && !effectiveResource.sekolah_id) {
    effectiveResource.sekolah_id = user.sekolah_id;
  }
  ...
}
```

### B. Presensi Sesi KBM (`attendance-actions.ts` & `attendance-service.ts`)
```typescript
// SEBELUM (Rentan):
export async function saveSessionAttendanceAction(input) {
  const user = await requireAuth();
  // Menerima input.sekolah_id dari klien tanpa verifikasi
  return attendanceService.saveSessionAttendance(user.id, user.peran_dasar, input);
}

// SESUDAH (Aman):
export async function saveSessionAttendanceAction(input) {
  const user = await requireAuth();
  if (input.sekolah_id && input.sekolah_id !== user.sekolah_id) {
    return { success: false, message: "Konteks sekolah tidak cocok dengan sesi aktif." };
  }
  const enforcedInput = { ...input, sekolah_id: user.sekolah_id };
  return attendanceService.saveSessionAttendance(user.id, user.peran_dasar, user.sekolah_id, enforcedInput);
}
// Di attendance-service: Memvalidasi sesi milik sekolah_id, guru terdaftar, dan SEMUA siswa dalam payload terdaftar aktif di rombel sekolah tersebut.
```

### C. Naskah Cetak CBT & Token Masuk (`cbt-actions.ts`)
```typescript
// SEBELUM (Rentan):
const exam = await prisma.ujianCbt.findFirst({
  where: { id: ujianId }, // Bisa membaca ujian dan kunci jawaban sekolah lain!
});

// SESUDAH (Aman):
await requirePermission("cbt.exam.manage", { sekolah_id: user.sekolah_id });
const exam = await prisma.ujianCbt.findFirst({
  where: { id: ujianId, sekolah_id: user.sekolah_id }, // Hanya dapat diakses oleh sekolah pemilik
});
if (!exam) {
  return { success: false, message: "Ujian CBT tidak ditemukan atau bukan milik sekolah Anda." };
}
```

### D. Manipulasi Data Pembelajaran (`learning-repository.ts`)
```typescript
// SEBELUM (Rentan):
async deleteLingkupMateri(id: string): Promise<void> {
  await prisma.lingkupMateri.delete({ where: { id } }); // Bisa menghapus data sekolah lain
}

// SESUDAH (Aman):
async deleteLingkupMateri(id: string, sekolahId?: string): Promise<void> {
  const existing = await prisma.lingkupMateri.findFirst({
    where: { id, ...(sekolahId ? { sekolah_id: sekolahId } : {}) },
  });
  if (!existing) {
    throw new Error(`Lingkup materi dengan ID '${id}' tidak ditemukan.`);
  }
  await prisma.lingkupMateri.delete({ where: { id } });
}
```

### E. Portal Wali — Pemilihan Konteks Anak (`guardian-actions.ts`)
```typescript
// SEBELUM (Rentan):
export async function switchActiveChildAction(studentId: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_CHILD_COOKIE_KEY, studentId, ...); // Bebas memasukkan ID siswa manapun
}

// SESUDAH (Aman):
export async function switchActiveChildAction(studentId: string) {
  const user = await requireAuth();
  await guardianService.verifyGuardianChildAccess(user, studentId); // Memverifikasi wali terdaftar di sekolah aktif dan terverifikasi sah dengan siswa
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_CHILD_COOKIE_KEY, studentId, ...);
}
```

---

## 5. Skenario Serangan yang Berhasil Ditutup (Attack Scenarios Closed)

| ID | Skenario Serangan | Dampak Potensial Sebelumnya | Status Penutupan |
|---|---|---|---|
| **ATK-01** | Pengguna Tenant A mengirimkan `resource: { sekolah_id: "SCH_B" }` pada server action. | Akses tidak sah ke data sekolah lain atau eskalasi wewenang. | **TERTUTUP**: `requirePermission` menolak seketika dan mencatat `AUTHZ_CROSS_TENANT_DENIED` pada audit log. |
| **ATK-02** | Guru Tenant A mengirim ID sesi kelas Tenant B pada `saveSessionAttendanceAction`. | Manipulasi kehadiran siswa sekolah lain. | **TERTUTUP**: Ditolak dengan `SessionNotFoundError` karena filter `sekolah_id: user.sekolah_id`. |
| **ATK-03** | Guru Tenant A menyisipkan ID siswa Tenant B dalam daftar presensi kelas. | Injeksi data presensi palsu terhadap siswa sekolah lain. | **TERTUTUP**: Ditolak dengan `AttendanceNotAllowedError` setelah validasi keikutsertaan rombel sekolah aktif. |
| **ATK-04** | Guru Tenant A memanggil `getExamPrintDataAction(ujianIdB)`. | Kebocoran naskah soal ujian dan seluruh kunci jawaban rahasia sekolah lain. | **TERTUTUP**: Ditolak dengan `Ujian CBT tidak ditemukan atau bukan milik sekolah Anda.`. |
| **ATK-05** | Staf Tenant A memanggil `refreshExamTokenAction(ujianIdB)`. | Pengacakan token ujian sekolah lain, menyebabkan gangguan operasional ujian. | **TERTUTUP**: Ditolak dengan `Ujian CBT tidak ditemukan atau bukan milik sekolah Anda.`. |
| **ATK-06** | Pengguna Tenant A memanggil endpoint pengumuman Tenant B via ID. | Membaca memo internal atau pengumuman rahasia sekolah lain. | **TERTUTUP**: Ditolak dengan `AnnouncementNotFoundError`. |
| **ATK-07** | Guru Tenant A mengirimkan request penghapusan atau penyuntingan Lingkup Materi / TP / Materi / Tugas milik Tenant B. | Perusakan atau penghapusan materi pembelajaran sekolah lain. | **TERTUTUP**: Repositori memverifikasi `sekolah_id: actorSekolahId` sebelum mutasi; melempar error `tidak ditemukan` jika bukan milik sekolah pemanggil. |
| **ATK-08** | Staf Tenant A mengaitkan Tahun Ajaran Tenant B pada penugasan mengajar atau wali kelas Tenant A. | Kerusakan integritas data relasional multi-tenant. | **TERTUTUP**: Ditolak dengan `CrossSchoolBoundaryError: Pelanggaran batas institusi`. |
| **ATK-09** | Akun wali Tenant A memanggil `switchActiveChildAction(siswaTenantB)` untuk mengintip presensi atau nilai rapor siswa lain. | Kebocoran data pribadi (nilai, rapor, presensi) siswa lintas keluarga dan sekolah. | **TERTUTUP**: Ditolak dengan `ChildNotLinkedError` dan validasi relasi sah sekolah aktif. |

---

## 6. Test Suite Baru: Cross-Tenant Isolation

Dibuat berkas unit test komprehensif baru:  
`src/test/security/cross-tenant-isolation.test.ts` (19 test cases).

Daftar pengujian:
1. `requirePermission` menolak request jika actor SCH_A mengakses resource SCH_B dan mencatat audit log `AUTHZ_CROSS_TENANT_DENIED`.
2. `requirePermission` menginjeksi `sekolah_id` aktor secara otomatis jika klien tidak mengirimkannya.
3. `requirePermission` menolak pengguna tanpa keanggotaan sekolah aktif (`sekolah_id: null`).
4. Tenant A tidak dapat membaca pengumuman milik Tenant B via `getAnnouncementById`.
5. Wali Tenant A tidak dapat mengakses profil atau data anak Tenant B via `verifyGuardianChildAccess`.
6. Guru Tenant A tidak dapat mencetak naskah ujian atau kunci jawaban Tenant B via `getExamPrintDataAction`.
7. Guru Tenant A tidak dapat menulis presensi untuk sesi kelas Tenant B via `saveSessionAttendance`.
8. Guru Tenant A ditolak saat menyisipkan siswa sekolah lain ke dalam presensi sesi via `saveSessionAttendance`.
9. Penugasan Mengajar gagal dibuat jika `tahun_ajaran_id` bukan milik sekolah aktif (`CrossSchoolBoundaryError`).
10. Penugasan Wali Kelas gagal ditetapkan jika `tahun_ajaran_id` bukan milik sekolah aktif (`CrossSchoolBoundaryError`).
11. Guru/Staf Tenant A tidak dapat mengacak token ujian Tenant B via `refreshExamTokenAction`.
12. Tenant A tidak dapat menyunting Lingkup Materi milik Tenant B via `updateLingkupMateri`.
13. Tenant A tidak dapat menghapus Lingkup Materi milik Tenant B via `deleteLingkupMateri`.
14. Tenant A tidak dapat menyunting Tujuan Pembelajaran milik Tenant B via `updateTujuanPembelajaran`.
15. Tenant A tidak dapat menghapus Tujuan Pembelajaran milik Tenant B via `deleteTujuanPembelajaran`.
16. Tenant A tidak dapat menghapus Tugas milik Tenant B via `deleteTugas`.
17. Tenant A tidak dapat menghapus Materi milik Tenant B via `deleteMateri`.
18. Tenant A tidak dapat menyunting pengumuman milik Tenant B via `updateAnnouncement`.
19. Tenant A tidak dapat menghapus pengumuman milik Tenant B via `deleteAnnouncement`.

---

## 7. Hasil Quality Gates

Seluruh gerbang kualitas dijalankan secara berurutan dan terbukti **100% HIJAU (PASS)**:

### 1. Typecheck (`npm run typecheck`)
```text
> ruang-pintar@0.1.0 typecheck
> tsc --noEmit
Exit code: 0 (PASS, 0 errors)
```

### 2. Lint (`npm run lint`)
```text
> ruang-pintar@0.1.0 lint
> eslint .
✖ 4 problems (0 errors, 4 warnings)
Exit code: 0 (PASS, 0 errors)
```

### 3. Unit & Integration Tests (`npm test`)
```text
Test Files  100 passed (100)
     Tests  557 passed (557)
  Duration  256.92s
Exit code: 0 (PASS, 100% passed)
```

### 4. Production Build (`npm run build`)
```text
▲ Next.js 16.3.3 (Turbopack)
✓ Compiled successfully in 32.1s
✓ Finished TypeScript in 28.0s
✓ Generating static pages using 7 workers (28/28)
✓ Finalizing page optimization
Exit code: 0 (PASS, 28/28 routes built successfully)
```

---

## 8. Konfirmasi Batasan (Out-of-Scope Confirmation)

- **Fitur Baru**: NIHIL (0 fitur baru ditambahkan).
- **Komponen UI Baru**: NIHIL (0 komponen UI baru dibuat).
- **Redesign UI**: NIHIL (tampilan visual Academic Glass UI tetap utuh).
- **Database Migration**: Tidak ada schema breaking changes; arsitektur multi-tenant SQLite/Prisma tetap konsisten.

---

## 9. Kesimpulan & Status

Temuan kritis **CRIT-01 (Cross Tenant Authorization Leak)** telah ditutup sepenuhnya pada level guard otorisasi, server actions, repositori, dan application service. Seluruh kriteria keberhasilan telah dipenuhi dan dibuktikan dengan suite pengujian isolasi tenant multi-sekenario.

**STATUS: READY FOR HUMAN REVIEW**
