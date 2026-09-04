# RUANG PINTAR — LAPORAN SINKRONISASI DATA JADWAL RIIL

**PHASE:** PHASE 09 & 10 — Teacher Assignment & Academic Scheduling  
**STATUS:** READY FOR HUMAN REVIEW  
**Tanggal verifikasi:** 2026-08-31  
**Sumber:** JADWAL PELAJARAN YES 2026.2027 (19 AGUSTUS 2026).pdf  

---

## Tujuan

Mengganti data demonstrasi aktif dengan data operasional SMK OTOMINDO Tahun Ajaran 2026/2027 tanpa menghapus riwayat akademik dan tanpa mengubah scope Phase 09–10.

## Hasil Data

| Entitas | Hasil aktif |
| :--- | ---: |
| Guru | 38 |
| Mata pelajaran | 41 |
| Rombel | 21 |
| Penugasan mengajar | 303 |
| Wali kelas | 21 |
| Slot waktu | 33 |
| Alokasi jadwal PUBLISHED | 1.008 |

Distribusi alokasi adalah Senin 210, Selasa 210, Rabu 231, Kamis 210, dan Jumat 147. Seluruh 21 rombel memiliki matriks penuh 48 JP per minggu dan tidak memiliki duplikasi slot pada rombel yang sama.

## Files Created

- `scripts/data/jadwal-otomindo-2026-2027.json`
- `scripts/import-otomindo-schedule.mjs`
- `scripts/capture-real-schedule-qa.mjs`
- `src/test/schedule/real-schedule-source.test.ts`
- `docs/phases/screenshots/phase-10-real-data/` (5 screenshot)
- `docs/phases/PHASE-10-REAL-SCHEDULE-DATA-IMPORT.md`

## Files Modified

- `package.json`
- `scripts/seed-teacher-data.mjs`
- `scripts/seed-schedule-data.mjs`
- `src/app/jadwal-sekolah/page.tsx`
- `src/app/guru-pengajaran/page.tsx`
- `src/modules/schedule/presentation/master-schedule-view.tsx`
- `src/modules/schedule/presentation/my-schedule-view.tsx`
- `src/modules/schedule/presentation/schedule-management-tabs.tsx`
- `src/modules/teacher/application/teacher-facade.ts`
- `src/modules/teacher/presentation/teacher-management-tabs.tsx`
- `src/shared/components/dashboard/role-views/teacher-dashboard.tsx`
- test dan dokumen governance Phase 09–10 yang relevan

## Dependencies

Tidak ada dependency aplikasi baru. `pypdf` dipakai hanya sebagai alat inspeksi lokal di luar dependency Node.js proyek.

## Migrations

Tidak ada migration baru. Delapan migration yang sudah ada tetap immutable dan `prisma migrate status` menyatakan database up to date.

## Domain

- `Teacher`, `Subject`, `TeachingAssignment`, `Schedule`, dan `ActualClassSession` tetap dipisahkan.
- Versi jadwal lama dipertahankan sebagai `ARSIP`; versi tanggal 19 Agustus 2026 menjadi satu-satunya versi `PUBLISHED`.
- Hanya sesi aktual dummy yang dikenali secara eksplisit yang dihapus. Riwayat lain tidak disentuh.
- Data dummy master lama dinonaktifkan agar tidak dihitung sebagai data aktif.

## Authorization

Tidak ada pelebaran hak akses. Route pengelolaan tetap memakai pemeriksaan izin server-side, sementara jadwal personal guru tetap tersaring berdasarkan profil guru dan sekolah pengguna.

## UI

- KPI jadwal menggunakan versi terpublikasi: 1.008 alokasi dan 33 slot aktif.
- KPI wali kelas menggunakan 21 rombel aktif: 21/21 terbina dan 0 belum memiliki wali.
- KPI guru menampilkan 41 mapel aktif dan 303 penugasan aktif.
- Beban Eri Chandra A ditampilkan 40 JP/minggu; 14 adalah jumlah penugasan, bukan jumlah mapel.
- Selector versi dan toolbar jadwal diperbaiki agar tidak overflow pada viewport mobile.

## Tests

```text
Targeted presentation/source tests: 17/17 PASS
Full test suite: 53 files, 250 tests PASS
Typecheck: PASS
Lint: PASS (0 error, 0 warning)
Build Next.js production: PASS
Importer dry-run: PASS
Importer apply kedua: PASS (idempotent)
```

## Format

Seluruh file yang dibuat atau disentuh untuk sinkronisasi data riil lolos targeted Prettier check. Global `npm run format:check` masih menemukan 30 file perubahan lama pada dirty worktree; file tersebut tidak diformat massal untuk menjaga perubahan Human yang sudah ada.

## Database Gate

```text
PRAGMA integrity_check: ok
PRAGMA foreign_key_check: clean
Published schedule entries: 1.008
Migration status: up to date
```

Backup sebelum mutasi tersedia di `prisma/data/backups/ruang-pintar-before-otomindo-20260830-2235.db` dan tidak dihapus.

## Visual QA

Lima screenshot diverifikasi pada desktop, mobile, tablet portrait, dan tablet landscape:

- `01-desktop-jadwal-riil.png`
- `02-mobile-jadwal-riil.png`
- `03-desktop-wali-kelas-riil.png`
- `04-tablet-dashboard-guru-riil.png`
- `05-tablet-landscape-jadwal-guru-riil.png`

KPI, tabel, kartu jadwal, toolbar, dan layout responsive tampil sesuai data aktif. Tidak ditemukan overflow horizontal pada hasil akhir mobile.

## Known Limitations

1. Dokumen sumber mengandung 41 konflik guru pada slot yang sama. Konflik ini dipertahankan secara faithful dan dicatat pada versi jadwal karena tampak merepresentasikan blok praktik gabungan lintas rombel, sedangkan schema saat ini belum memiliki satu sesi gabungan multi-rombel.
2. Kode guru agama `26/13` dan `29/13` menunjukkan co-teaching. Guru pertama disimpan sebagai pengampu utama dan guru kedua dicatat pada catatan alokasi; keduanya memiliki teaching assignment.
3. Jenis kelamin guru tidak tersedia pada PDF dan memerlukan verifikasi operator.
4. Data ruangan tidak tersedia pada PDF sehingga `ruangan` dibiarkan kosong.
5. Data kalender akademik tidak diubah karena tidak terdapat pada dokumen jadwal.
6. Alias login kompatibilitas `guru_budi` dipertahankan dan kini tertaut ke profil Eri Chandra A.

## Out-of-Scope Confirmation

Tidak ada implementasi Phase 11, presensi, penilaian, perubahan kalender, redesign UI, penghapusan massal data lain, commit, atau push.

## Git Status

Worktree sudah dirty sebelum sinkronisasi dan tetap memuat perubahan Phase 09–10 serta perubahan Human lain. Tidak ada reset, clean, commit, force push, atau push.

---

```text
READY FOR HUMAN REVIEW
STOP
```
