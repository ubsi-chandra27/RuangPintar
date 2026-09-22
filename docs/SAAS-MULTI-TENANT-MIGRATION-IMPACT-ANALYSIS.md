# Analisis Dampak dan Rencana Migrasi SaaS Multi-Tenant

**Status:** DRAFT — READY FOR HUMAN REVIEW  
**Tanggal:** 20 September 2026  
**Lingkup:** Analisis dan rencana migrasi saja. Tidak ada perubahan kode, skema, migrasi, atau konfigurasi pada fase ini.

## 1. Keputusan Human yang Menjadi Dasar

Human mengizinkan pembukaan fase revisi untuk mengubah Ruang Pintar dari model *single-school-per-deployment* menjadi SaaS multi-tenant. Alur registrasi target adalah:

```text
Landing Page
→ Cari Sekolah
→ Gabung Sekolah ATAU Daftarkan Sekolah Baru
→ Registrasi Akun
→ Pilih Avatar
→ Akun Berhasil Dibuat
→ Auto Login
→ Dashboard
```

Ketentuan yang wajib dipenuhi:

- sekolah selalu dicari sebelum dapat dibuat;
- sekolah yang ditemukan menerima guru sebagai anggota tenant;
- sekolah yang tidak ditemukan dibuat sebagai tenant baru dan pendaftar pertama menjadi pemilik sekolah;
- `username` dan email unik secara global;
- setelah registrasi berhasil pengguna otomatis terautentikasi;
- tidak ada halaman login ulang setelah registrasi.

Dokumen ini menggantikan asumsi teknis lama “satu deployment = satu sekolah” untuk fase migrasi yang akan datang. Dokumen lama tidak diedit pada fase analisis ini agar jejak keputusan tetap dapat diaudit.

## 2. Ringkasan Eksekutif

Basis data saat ini sudah memiliki isolasi data yang kuat pada tingkat record: mayoritas agregat akademik, pembelajaran, komunikasi, integrasi, dan AI menyimpan `sekolah_id`. Ini adalah fondasi yang baik untuk *shared database, shared schema multi-tenant*.

Namun, implementasi belum aman untuk model seorang pengguna dapat tergabung ke lebih dari satu sekolah. `Pengguna.sekolah_id` adalah satu-satunya konteks tenant pada identitas, sesi tidak menyimpan tenant aktif, dan banyak query maupun guard mempercayai nilai tunggal tersebut. Menerapkan alur gabung sekolah hanya dengan mengganti form registrasi akan menghasilkan kebocoran scope, peran yang ambigu, dan billing yang salah sasaran.

Migrasi harus memakai pemisahan berikut:

```text
Identitas global (Pengguna)
  └─ Keanggotaan sekolah (PenggunaSekolah / membership)
       └─ Peran dan status di tenant
            └─ Konteks tenant aktif pada sesi
                 └─ Permission dan resource scope
```

Rekomendasi utama: lakukan migrasi bertahap dan kompatibel mundur. Jangan menghapus `Pengguna.sekolah_id` maupun memodifikasi migrasi Prisma yang sudah diterapkan. Tambahkan model baru, backfill, aktifkan pembacaan ganda sementara, kemudian cutover setelah audit data dan regresi penuh lulus.

## 3. Kondisi Aktual yang Diaudit

### 3.1 Arsitektur dan tenancy

- Prisma menggunakan SQLite dalam satu database (`prisma/schema.prisma`).
- `Sekolah` sudah menjadi root untuk hampir seluruh data bisnis; relasi dibatasi terutama dengan `onDelete: Restrict`.
- Ditemukan referensi `sekolah_id` pada **199 file sumber** dan sedikitnya **521 pola query/guard** yang menggunakannya secara langsung.
- `SUPER_ADMIN` menerima fallback `findFirst()` ke sekolah apa pun saat tidak memiliki `sekolah_id` di `auth-service.ts`. Perilaku ini tidak deterministik dan tidak dapat dipertahankan pada multi-tenant.
- Ada action pendaftaran tenant, tetapi hanya untuk `SUPER_ADMIN` (`createSchoolTenantAction`). Ini tidak memenuhi pendaftar publik pertama sebagai owner.

### 3.2 Database dan identitas

Model `Pengguna` saat ini sudah memiliki:

- `username String @unique`;
- `email String? @unique`;
- `sekolah_id String?` tunggal;
- satu base role tunggal (`peran_dasar`);
- sesi melalui `SesiPengguna` yang hanya menyimpan `pengguna_id`.

Dengan demikian, keunikan global username sudah dipaksakan database. Email juga unik untuk email yang tidak `NULL`; alur registrasi baru harus tetap mewajibkan email sehingga tidak boleh ada jalur self-service yang mengirim `NULL`.

Model `Sekolah` memiliki NPSN global unik, lisensi/trial, dan status aktif. Namun pencarian nama belum memiliki kolom normalisasi, indeks pencarian, identitas lokasi terstruktur, atau mekanisme resolusi kandidat sekolah yang seragam. Nama saja tidak memadai untuk mencegah tenant duplikat.

### 3.3 Authentication

- Login membuat token sesi acak, menyimpan hash token, lalu menaruh token pada cookie `httpOnly`, `sameSite=lax`, dan `secure` di produksi.
- Registrasi mandiri sekarang telah membuat sesi server dan cookie sehingga auto-login teknis sudah ada.
- Form saat ini masih meminta `nama_sekolah` dan service selalu membuat `Sekolah`, tahun ajaran, semester, pengguna, dan guru baru dalam satu transaksi. Artinya setiap registrasi pasti menambah tenant.
- Cookie sesi tidak mengikat sekolah aktif. Seluruh aplikasi menurunkan konteks dari `Pengguna.sekolah_id`.
- Avatar saat ini hanya berada di `sessionStorage` dan tidak pernah disimpan ke profil server. Halaman selesai hanya mengarahkan pengguna ke `/dashboard`.

### 3.4 Authorization

- `requirePermission` dijalankan server-side dan *default deny* telah tersedia.
- Engine mengecek `resource.sekolah_id` terhadap `actor.sekolah_id`, tetapi hanya bila actor bukan `SUPER_ADMIN` dan memiliki `sekolah_id`.
- Assignment guru, wali kelas, dan jabatan memang membawa `sekolah_id`, sehingga dapat digunakan kembali setelah konteks actor berasal dari membership aktif.
- Base role yang tersedia hanya `SUPER_ADMIN`, `SCHOOL_STAFF`, `TEACHER`, `STUDENT`, dan `GUARDIAN`. `School Owner` tidak boleh ditambahkan diam-diam sebagai base role baru; status owner harus dimodelkan sebagai otoritas membership/tenant atau keputusan role baru yang disetujui Human.

### 3.5 Onboarding

- Spesifikasi SaaS yang disetujui sudah mendefinisikan “cari sekolah sebelum registrasi”, avatar, dan auto-login.
- Implementasi UI sekarang dimulai langsung di `/register`, tanpa pencarian dan pemilihan tenant yang tervalidasi server.
- Registrasi membuat profil `Guru` secara otomatis. Saat bergabung ke sekolah yang telah berjalan, pembuatan profil guru harus tunduk pada kebijakan sekolah, pencegahan duplikasi profil, dan status keanggotaan. Tidak boleh otomatis membuat teaching assignment.
- “Akun berhasil dibuat” saat ini berupa halaman presentasi dan bukan state transaksi yang otoritatif.

### 3.6 Billing dan trial

- `Sekolah` dan `Pengguna` keduanya menyimpan `tipe_lisensi` serta `trial_berakhir_pada`.
- `TransaksiLangganan` menyimpan `pengguna_id` dan `sekolah_id`, tetapi checkout “Guru Pro” memperpanjang lisensi pengguna, bukan tenant.
- Webhook mengaktifkan `Pengguna.tipe_lisensi = PRO`; hal ini tidak konsisten dengan produk sekolah sebagai tenant utama dan akan ambigu untuk pemilik sekolah atau pengguna multi-sekolah.
- Trial baru dibuka per registrasi guru sekaligus per sekolah baru. Pada alur gabung sekolah, trial tidak boleh dibuat ulang per orang tanpa keputusan produk eksplisit.

## 4. Risiko Utama

| Prioritas | Risiko | Dampak | Mitigasi wajib |
| --- | --- | --- | --- |
| Kritis | Menggunakan `Pengguna.sekolah_id` sebagai satu-satunya membership | Pengguna multi-sekolah kehilangan scope atau mengakses tenant salah | Model membership dan tenant aktif pada sesi |
| Kritis | Tenant dipilih dari input klien | Pemalsuan `sekolah_id` dan *cross-tenant join* | ID tenant opaque, diverifikasi server, token proses pendek bertanda tangan |
| Kritis | Owner dipetakan ke `SUPER_ADMIN` | Pendaftar mendapat akses lintas tenant | Owner adalah otoritas tenant, bukan superuser platform |
| Kritis | Query tidak memasukkan tenant scope | Kebocoran data antarsekolah | Repository policy, lint/test isolation, resource scope eksplisit |
| Tinggi | Langganan masih melekat pada pengguna | Pembayaran dan entitlement salah setelah anggota bergabung | Subscription tenant-level, entitlement resolver tunggal |
| Tinggi | Nama sekolah menjadi satu-satunya deduplikasi | Tenant ganda dan salah gabung | NPSN prioritas, normalisasi nama, lokasi, kandidat dan review |
| Tinggi | Avatar hanya di browser | Avatar hilang, manipulabel, tidak konsisten lintas perangkat | Persistensi server sebelum menyelesaikan onboarding |
| Tinggi | Fallback `findFirst()` untuk super admin | Tenant acak dapat aktif | Pemilihan tenant eksplisit atau console platform tanpa tenant |
| Sedang | Migrasi data langsung menghapus kolom lama | Kerusakan histori dan downtime | Expand–backfill–dual-read–cutover–contract |

## 5. Target Architecture yang Direkomendasikan

### 5.1 Model konseptual

```text
Pengguna (identitas global)
  1 ──< SesiPengguna (sesi, tenant aktif opsional)
  1 ──< KeanggotaanSekolah >── 1 Sekolah
                │
                ├─ peran_dasar_di_tenant
                ├─ status_keanggotaan
                ├─ is_owner
                ├─ berlaku_mulai / berlaku_sampai
                └─ metadata undangan/persetujuan

Sekolah
  1 ──< LanggananTenant / entitlement
  1 ──< seluruh agregat sekolah yang telah ada
```

Nama implementasi dan enum final perlu diputuskan saat desain data. Kandidat minimal:

- `KeanggotaanSekolah`: `id`, `pengguna_id`, `sekolah_id`, `peran_dasar`, `status`, `is_owner`, tanggal berlaku, sumber join, audit fields; unique `[pengguna_id, sekolah_id]`.
- `SesiPengguna.sekolah_aktif_id`: nullable untuk console platform, wajib untuk fitur tenant. Nilai harus merupakan membership aktif.
- `Sekolah.nama_normalisasi`, `kota_kabupaten`, dan identitas deduplikasi yang disetujui. `npsn` tetap identitas terkuat bila tersedia.
- `ProfilOnboarding`: atau field eksplisit pada `Pengguna` untuk avatar, status penyelesaian onboarding, dan waktu selesai. Jangan menyimpan keputusan bisnis pada `sessionStorage`.
- `LanggananTenant`: status, paket, masa berlaku, sumber pembayaran, dan tenant sebagai owner entitlement. `TransaksiLangganan` dapat menjadi ledger pembayaran yang menunjuk langganan tenant.

### 5.2 Invarian baru

1. Satu `Pengguna` dapat memiliki nol atau banyak membership aktif, tetapi hanya satu tenant aktif per sesi.
2. Semua operasi tenant harus mendapatkan `sekolah_id` dari konteks sesi/membership terverifikasi, bukan dari form atau URL saja.
3. Resource hanya dapat diakses bila `resource.sekolah_id` sama dengan tenant aktif actor, kecuali permission platform yang eksplisit.
4. Pendaftar tenant baru mendapat satu membership aktif berstatus owner; ia bukan `SUPER_ADMIN` platform.
5. Gabung sekolah tidak otomatis berarti profil `Guru`, assignment mengajar, capability staf, atau akses data historis tanpa kebijakan tenant.
6. Username dan email self-service wajib unik global secara database dan validasi aplikasi.
7. Trial dan entitlement harus dievaluasi berdasarkan tenant untuk kapabilitas sekolah. Produk individu, bila dipertahankan, harus merupakan entitlement terpisah dan eksplisit.
8. Avatar dan status onboarding menjadi data server-authoritative sebelum dashboard dibuka.

## 6. Rencana Migrasi Bertahap

### Tahap 0 — Keputusan yang perlu dikunci

Human perlu menyetujui keputusan pada bagian 7 sebelum desain skema dan implementasi. Tahap ini tidak mengubah data.

### Tahap 1 — Fondasi tenancy kompatibel mundur

1. Tambahkan migration baru yang immutable untuk membership, tenant aktif sesi, pencarian sekolah, dan state onboarding.
2. Tambahkan indeks tenant yang diperlukan dan constraint keanggotaan unik.
3. Backfill: setiap `Pengguna.sekolah_id` menghasilkan satu membership aktif dengan base role existing. Super admin tetap tanpa membership kecuali secara eksplisit ditugaskan.
4. Buat laporan rekonsiliasi: jumlah pengguna bersekolah, membership hasil backfill, pengguna yatim, sekolah tanpa owner, dan data yang gagal.
5. Pertahankan `Pengguna.sekolah_id` sebagai legacy read-only selama periode transisi.

**Exit gate:** migration dapat diulang aman pada salinan produksi, rekonsiliasi 100%, backup dan rencana rollback tervalidasi.

### Tahap 2 — Authentication dan authorization tenant-aware

1. Saat validasi sesi, resolusikan membership aktif dari `sekolah_aktif_id`; tolak atau minta pemilihan tenant bila tidak valid.
2. Hapus fallback super admin ke `findFirst()`; sediakan konteks console platform atau pemilih tenant eksplisit yang terotorisasi.
3. Ubah `AuthenticatedUser` menjadi membawa `tenantContext` tervalidasi, bukan sekadar `Pengguna.sekolah_id`.
4. Tambahkan guard `requireTenantContext()` dan gunakan pada seluruh route/action tenant.
5. Audit 199 file yang memakai `sekolah_id`; pindahkan query ke repository/service yang mensyaratkan tenant context.
6. Tambahkan suite uji matriks: tenant A tidak dapat membaca/menulis tenant B melalui route, action, API berkas, ID resource, assignment, webhook, dan cache.

**Exit gate:** tidak ada query bisnis tenant yang dapat dieksekusi tanpa scope; regression authorization dan isolation lulus.

### Tahap 3 — Provisioning tenant dan alur registrasi

1. Buat pencarian sekolah publik yang hanya mengekspos data minimum dan memakai rate limit.
2. Terapkan resolver deduplikasi: NPSN tepat, kemudian nama normalisasi + lokasi, lalu penanganan kandidat ambigu.
3. Simpan pilihan sekolah pada state server pendek yang bertanda tangan/bermasa berlaku, bukan parameter bebas di browser.
4. Pecah service registrasi menjadi dua transaksi atomik:
   - **join existing:** buat identitas global, membership pending/active sesuai kebijakan, sesi, dan profil domain hanya bila diizinkan;
   - **create tenant:** verifikasi pencarian terlebih dahulu, buat sekolah + owner membership + data bootstrap akademik yang minimal + sesi.
5. Persist avatar melalui action terautentikasi, tandai onboarding selesai, tampilkan konfirmasi sukses singkat, lalu arahkan ke dashboard tanpa login ulang.
6. Dashboard menentukan wizard pertama dari state server, bukan data browser.

**Exit gate:** semua skenario registrasi, duplikasi username/email, tenant ditemukan/tidak ditemukan, pemalsuan tenant ID, refresh browser, dan auto-login lulus E2E.

### Tahap 4 — Billing, trial, dan entitlement tenant

1. Putuskan katalog paket tenant dan, jika masih dibutuhkan, paket individu.
2. Tambahkan entitlement resolver yang dipakai dashboard dan capability gate.
3. Migrasikan trial lama dengan aturan yang disetujui ke langganan tenant tanpa menghapus ledger transaksi.
4. Ubah checkout, webhook Midtrans, simulator, audit event, dan UI status agar mengaktifkan entitlement target yang tepat.
5. Webhook harus mengikat `order_id` ke tenant dan entitlement immutable, serta idempoten pada transaksi dan entitlement.

**Exit gate:** pembayaran satu tenant tidak mengubah entitlement tenant lain atau user yang tidak berhak; simulasi dan webhook tervalidasi.

### Tahap 5 — Cutover dan kontraksi legacy

1. Aktifkan pembacaan eksklusif dari membership/tenant context setelah observasi stabil.
2. Jalankan audit data dan uji regresi penuh pada staging dengan salinan data teranonimkan.
3. Baru setelah periode stabil dan persetujuan Human, buat migration lanjutan untuk menghapus atau meniadakan penggunaan `Pengguna.sekolah_id` legacy.
4. Perbarui dokumen kanonikal, ADR, threat model, runbook incident, dan panduan operasional.

## 7. Keputusan Human yang Diperlukan Sebelum Implementasi

1. **Kebijakan bergabung:** apakah guru yang memilih sekolah existing langsung aktif, atau berstatus `MENUNGGU_PERSETUJUAN` sampai owner/operator menyetujui?
2. **Makna School Owner:** apakah owner adalah flag pada membership dengan permission tenant penuh, atau role tenancy baru yang ditambahkan secara resmi? Rekomendasi: flag/otoritas membership, bukan base role keenam.
3. **Multi-school user:** apakah satu akun boleh aktif pada banyak sekolah dan berpindah tenant dari menu akun? Rekomendasi: ya, karena itulah alasan pemisahan identity dan membership.
4. **Deduplikasi sekolah:** atribut minimum apa yang diwajibkan pada pembuatan tenant: NPSN saja bila ada, atau nama + kota/kabupaten + jenjang? Rekomendasi: nama, jenjang, kota/kabupaten; NPSN wajib bila sekolah memilikinya.
5. **Profil guru saat join:** apakah registran otomatis dibuat sebagai `Guru` aktif, atau hanya membership yang harus disetujui tenant dahulu? Rekomendasi: membership pending untuk sekolah existing; pembuatan profil guru mengikuti approval.
6. **Entitlement:** apakah trial dan paket adalah milik sekolah, pengguna, atau keduanya dengan katalog terpisah? Rekomendasi: kapabilitas operasional sekolah memakai langganan tenant; paket individu hanya dipertahankan bila produk mendefinisikannya secara eksplisit.
7. **Data produksi:** apakah database saat ini sudah mengandung pelanggan nyata? Jawaban menentukan prosedur backup, window migrasi, dan strategi rollback.

## 8. Strategi Pengujian dan Acceptance Criteria

### Wajib

- unit test untuk resolver tenant, membership, owner policy, deduplikasi sekolah, dan uniqueness;
- integration test transaksi join/create tenant dan backfill;
- authorization test tenant A vs tenant B untuk setiap module boundary;
- test session: tenant aktif berubah hanya ke membership valid, logout/revoke bekerja, dan super admin tidak mendapat tenant acak;
- test billing webhook idempoten dan tenant-scoped;
- E2E desktop serta mobile untuk seluruh alur target tanpa halaman login ulang;
- accessibility: input pencarian, hasil kandidat, error inline, dan pemilihan avatar dapat dioperasikan keyboard;
- visual QA pada 390×844, 768×1024, 1024×768, dan 1440×900;
- typecheck, lint, format, full test, Prisma migration test, dan production build.

### Acceptance Criteria migrasi

1. Tidak ada resource tenant A dapat dibaca atau diubah actor tenant B.
2. Username dan email duplikat global ditolak oleh validasi dan constraint database.
3. Pendaftar dari sekolah yang ditemukan tidak membuat `Sekolah` baru.
4. Pendaftar sekolah baru menciptakan tepat satu tenant dan satu owner membership secara atomik.
5. Refresh setelah registrasi/avatar tetap mempertahankan sesi dan state onboarding dari server.
6. Tidak ada redirect ke `/login` antara registrasi berhasil dan dashboard, kecuali sesi gagal dibuat.
7. Seluruh data legacy memiliki relasi membership yang dapat direkonsiliasi.
8. Semua migrasi baru dapat dijalankan maju pada staging dan tidak mengubah migration yang sudah diterapkan.

## 9. Batasan Fase Analisis

- Tidak ada source code, Prisma schema, SQL migration, konfigurasi deployment, atau data yang diubah.
- Tidak ada perubahan status APPROVED/LOCKED pada dokumen sebelumnya.
- Tidak ada desain UI final; implementasi UI baru baru boleh dimulai setelah keputusan pada bagian 7 dikunci.
- Dokumen ini tidak mengesahkan model data final. Ia menjadi dasar untuk desain fase implementasi dan human review berikutnya.

## 10. Inventaris Berkas yang Terdampak pada Fase Implementasi

Area utama yang harus diaudit ulang per perubahan:

- `prisma/schema.prisma` dan migration baru (existing migration tidak diubah);
- `src/shared/infrastructure/auth/auth-service.ts`, `auth-guard.ts`, dan `src/shared/lib/session.ts`;
- `src/shared/infrastructure/authorization/authz-guard.ts`, `access-control.ts`, serta contract assignment;
- seluruh action/page/repository yang memakai `user.sekolah_id` atau menerima `sekolah_id`;
- `src/modules/ai-assistant/application/smart-onboarding-service.ts` dan `src/app/actions/smart-onboarding-actions.ts`;
- `/register`, onboarding avatar/selesai, login, dashboard, dan landing page CTA;
- `src/modules/billing/application/subscription-service.ts`, action billing, webhook Midtrans, dan model transaksi;
- `src/app/actions/school-actions.ts` dan pencarian/provisioning sekolah;
- test auth, authorization, onboarding, billing, school, dan Playwright walkthrough.

## 11. Status

**READY FOR HUMAN REVIEW**

Implementasi tetap berhenti sampai Human mengunci keputusan pada bagian 7 dan memberikan instruksi untuk memulai fase desain/implementasi.
