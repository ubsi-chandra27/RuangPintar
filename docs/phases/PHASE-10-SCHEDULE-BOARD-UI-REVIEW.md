# PHASE 10 — Papan Jadwal dan Perbaikan Slot Waktu

Tanggal: 31 Agustus 2026  
Status: READY FOR FINAL APPROVAL

## Otorisasi dan scope

Human meminta implementasi usulan Papan Jadwal dengan mode Daftar yang tetap tersedia, penjelasan/perbaikan urutan slot 10 → 201, dan penyelarasan tabel dengan UI kit. Pekerjaan merupakan revisi Phase 09 & 10 yang masih menunggu review, bukan pembukaan Phase 11.

Referensi: PRD bagian Scheduling, FR-SCHD-001–006, `docs/07-UI-UX-DESIGN-SYSTEM.md`, `ruang-pintar-v2-login-ui-kit-handoff/UI-KIT-SPECIFICATION.md`, serta referensi visual `assets/ui-kit/08-tables.png`.

## Penyebab dan keputusan

- Importer menyimpan urutan reguler mulai 1, Rabu mulai 201, dan Jumat mulai 301. Angka tersebut merupakan pengurutan internal, bukan nomor JP. UI lama mencetak nilai tersebut secara langsung.
- Istirahat memakai beberapa nilai urutan yang sama dengan KBM, sehingga pengurutan berdasarkan angka tidak selalu kronologis.
- UI baru memisahkan pola Reguler/Rabu/Jumat berdasarkan `hari_khusus`, mengurutkan jam mulai, dan menampilkan nomor baris. Nomor JP tetap mengikuti nama slot. Tidak ada penomoran ulang database atau perubahan ID.
- Pola khusus aktif menggantikan pola reguler pada hari tersebut. Aturan yang sama dipakai form, papan, dan validasi server.
- Metrik menggunakan satuan slot; durasi tiap slot ditampilkan dalam menit, bukan menyebut jumlah slot sebagai jumlah jam durasi.

## FILES CREATED

- `src/modules/schedule/domain/time-slot-policy.ts`
- `src/modules/schedule/domain/schedule-board.ts`
- `src/modules/schedule/presentation/schedule-board-view.tsx`
- `src/modules/schedule/presentation/schedule-ui.tsx`
- `src/test/schedule/schedule-board.test.tsx`
- `src/test/schedule/schedule-entry-guards.test.ts`
- Dokumen ini dan bukti visual di `docs/phases/screenshots/phase-10-schedule-board/`.

## FILES MODIFIED

- `src/modules/schedule/presentation/master-schedule-view.tsx`
- `src/modules/schedule/presentation/time-slots-view.tsx`
- `src/modules/schedule/presentation/schedule-entry-modal.tsx`
- `src/modules/schedule/presentation/schedule-management-tabs.tsx`
- `src/modules/schedule/domain/conflict-detector.ts`
- `src/modules/schedule/application/schedule-service.ts`
- `src/modules/schedule/infrastructure/schedule-repository.ts`
- `src/app/actions/schedule-actions.ts`
- `src/app/jadwal-sekolah/page.tsx`
- `src/test/schedule/schedule-views.test.tsx`
- `src/test/schedule/schedule-service.test.ts`
- `MEMORY.md` dan `TASKS.md` untuk catatan review ini.

## DEPENDENCIES / MIGRATIONS

Tidak ada dependency baru, perubahan schema, atau migration baru. Delapan migration yang sudah diterapkan tetap immutable. `prisma migrate status`: up to date.

Database utama tetap memiliki 33 slot aktif dan 1.008 alokasi pada versi terpublikasi. Pemeriksaan read-only: `integrity_check = ok`, `foreign_key_check = []`. Tidak menjalankan importer, menyimpan perubahan alokasi, atau memublikasikan versi selama browser QA. Login QA hanya menggunakan alur autentikasi lokal yang sudah ada.

## DOMAIN

- Papan mingguan memiliki perspektif rombel atau guru dan memakai waktu aktual setiap pola hari.
- Blok JP digabung secara visual hanya jika penugasan, rombel, ruangan, catatan, dan kesinambungan waktu cocok. Penggabungan berhenti pada istirahat atau konflik. ID alokasi tetap terpisah.
- Klik slot kosong mengisi konteks rombel/hari/slot pada dialog. Klik blok membuka detail semua alokasi; edit/hapus dilakukan per JP.
- Edit mempertahankan ID alokasi dan menulis audit sebelum/sesudah.
- Deteksi konflik membandingkan interval waktu, bukan hanya kesamaan ID slot. Guru, rombel, dan ruangan nonkosong diperiksa.
- Penyimpanan memeriksa sekolah/versi, kesesuaian periode penugasan, slot aktif, pola hari, dan larangan memakai slot istirahat/upacara. Publikasi menolak jadwal kosong atau bentrok.
- Calendar ≠ Schedule ≠ Actual Class Session dan Teacher ≠ Subject ≠ Teaching Assignment tetap dipertahankan.

## AUTHORIZATION

Server action tetap menggunakan `schedule.master.manage` dan `schedule.master.publish`. ID edit diverifikasi dalam sekolah dan versi yang sama; versi arsip hanya dapat dibaca. Pengguna baca saja tidak mendapatkan tindakan penambahan/edit/hapus. Pembuatan draft otomatis pada route sekarang juga memerlukan izin manage.

Pengelola yang memiliki izin tetap dapat memperbarui versi terpublikasi sesuai perilaku pengelolaan sebelumnya. UI memberi peringatan bahwa perubahan langsung berlaku dan diaudit; tidak ada publikasi otomatis dari tindakan edit.

## UI

- Papan Jadwal menjadi default; Daftar tetap mendukung pencarian, filter, pengurutan, ekspor CSV, dan pagination.
- Perspektif rombel/guru tidak memuat seluruh rombel sekaligus dalam satu papan.
- Tabel slot memiliki pola hari, nama/kode, waktu, durasi, jenis, status, toolbar, dan nomor halaman. Header tabel melekat saat area tabel digulir.
- Solid surface untuk tabel, divider halus, header netral, status badge, dan tombol Cobalt mengikuti UI kit. Tidak mengubah navigasi, identitas brand, atau shell.
- Mobile/tablet kecil menggunakan agenda satu hari dan kartu data, tanpa keharusan menggulir horizontal.
- Dialog native menyediakan focus containment, Escape, dan pengembalian fokus. Form diberi label; pesan kegagalan/bentrok inline; sukses satu toast.
- Ekspor mengikuti filter/perspektif dan mengamankan nilai berawalan formula spreadsheet.

## TESTS / BUILD

- Full suite: 55 file, 268 test PASS (100%).
- Scheduling suite: 7 file scheduling, 34 test PASS, termasuk Quick Fill perspektif rombel/guru dan Escape pada dialog.
- Typecheck PASS (0 errors); lint PASS (0 errors, 0 warnings).
- Production build Next.js PASS.
- Prettier format check PASS 100% clean.

Test baru membuktikan pemilihan hari khusus, urutan kronologis, pemisahan istirahat, penggabungan JP, klik slot kosong, baca-saja, nomor Rabu 1 bukan 201, prefill form, larangan submit bentrok, overlap lintas ID, pengecualian diri saat edit, scope sekolah/versi, periode penugasan, audit edit, dan penolakan publikasi bentrok.

## VISUAL QA

Browser lokal digunakan untuk verifikasi desktop 1440×900, mobile 390×844, tablet 768×1024, dan landscape 1024×768. Bukti screenshot serta pengukuran overflow disimpan pada direktori review ini. Detail/edit dan perpindahan hari diuji tanpa menyimpan ke jadwal riil.

## KNOWN LIMITATIONS

1. Dokumen sumber masih memuat 41 pasangan konflik guru yang melibatkan 82 alokasi. UI kini memperlihatkan konflik tersebut; tidak mengubah atau menganggapnya valid secara otomatis. Dugaan kelas praktik gabungan tetap memerlukan keputusan Human dan model domain terpisah.
2. Co-teacher masih dicatat dalam catatan alokasi sesuai baseline impor; pemeriksaan konflik memakai guru utama yang tersimpan.
3. Data ruangan sumber belum tersedia; konflik ruang hanya dapat dinilai bila ruangan diisi.
4. Papan menampilkan urutan slot per hari, bukan skala menit universal lintas hari. Waktu dicantumkan di setiap blok karena pola hari berbeda. Hari Sabtu/Minggu muncul jika ada alokasi/pola khusus; default minggu kerja Senin–Jumat.
5. Belum ada drag-and-drop, generator otomatis, edit massal blok, atau penyalinan isi versi. Versi Baru menghasilkan draft kosong seperti baseline.
6. Audit visual/manual keyboard dilakukan, tetapi belum merupakan sertifikasi aksesibilitas menyeluruh. Pengujian mutasi dilakukan dengan test terisolasi/mocks, bukan mengubah jadwal riil melalui browser.

## OUT-OF-SCOPE CONFIRMATION / GIT STATUS

Tidak mengerjakan Phase 11, modul learning/presensi/nilai, perubahan kalender, atau data sekolah lain. Worktree telah dirty sebelum pekerjaan; perubahan Human sebelumnya dipertahankan. Tidak ada reset, clean, commit, atau push. `git status` dan `git diff` diperiksa sebelum penyerahan review.

READY FOR FINAL APPROVAL. Keputusan APPROVED/LOCKED tetap milik Human.
