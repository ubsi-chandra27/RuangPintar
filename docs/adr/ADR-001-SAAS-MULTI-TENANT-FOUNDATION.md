# ADR-001: Fondasi SaaS Multi-Tenant Ruang Pintar

**Status:** PROPOSED — READY FOR HUMAN REVIEW  
**Tanggal:** 20 September 2026  
**Pengambil keputusan:** Human Product/Architecture Owner  
**Berlaku setelah disetujui:** Fase implementasi SaaS Multi-Tenant Foundation

## Konteks

Ruang Pintar beralih dari asumsi operasional satu deployment untuk satu sekolah menjadi SaaS multi-tenant dengan *shared database, shared schema*. Tenant sekolah menjadi batas utama data, akses, konfigurasi, dan entitlement.

Analisis dampak terdokumentasi dalam [SAAS-MULTI-TENANT-MIGRATION-IMPACT-ANALYSIS.md](../SAAS-MULTI-TENANT-MIGRATION-IMPACT-ANALYSIS.md). ADR ini memilih keputusan final yang diperlukan agar alur berikut aman dan konsisten:

```text
Landing Page → Cari Sekolah → Gabung / Daftarkan Sekolah
→ Registrasi Akun → Pilih Avatar → Akun Berhasil Dibuat
→ Auto Login → Dashboard
```

## Keputusan

### 1. Tenant ownership

`School Owner` adalah otoritas tenancy pada membership, bukan base role keenam dan bukan `SUPER_ADMIN`.

- Tenant baru dibuat bersama tepat satu membership owner aktif dalam satu transaksi atomik.
- Owner pertama adalah pendaftar sekolah baru yang lolos kebijakan deduplikasi.
- Owner memiliki kewenangan tata kelola tenant, termasuk menyetujui keanggotaan dan menunjuk owner tambahan sesuai permission khusus tenancy.
- Tenant wajib memiliki sedikitnya satu owner aktif. Pemindahan atau pencabutan owner terakhir ditolak server-side.
- `SUPER_ADMIN` tetap role platform dan tidak otomatis menjadi owner tenant mana pun.

**Invariant:** owner tenant tidak dapat mengakses data tenant lain tanpa membership dan konteks tenant yang sah.

### 2. School membership

Identitas global dipisahkan dari keanggotaan sekolah.

Model baru `KeanggotaanSekolah` menjadi sumber kebenaran hubungan pengguna–tenant, minimal dengan:

```text
id
pengguna_id
sekolah_id
peran_dasar_di_tenant
status_keanggotaan
is_owner
berlaku_mulai
berlaku_sampai
sumber_pendaftaran
disetujui_oleh_id
disetujui_pada
created_at
updated_at
```

- Constraint database: satu baris membership untuk satu pasangan `[pengguna_id, sekolah_id]`.
- Status lifecycle minimal: `MENUNGGU_PERSETUJUAN`, `AKTIF`, `DITOLAK`, `DINONAKTIFKAN`, `DICABUT`.
- Base role berlaku per membership, bukan secara global pada identitas. Satu pengguna dapat menjadi `TEACHER` di tenant A dan `SCHOOL_STAFF` di tenant B.
- Profil domain (`Guru`, `Siswa`, `WaliMurid`) tetap terpisah dari account dan tetap terikat tenant. Membership tidak otomatis membuat assignment mengajar, jabatan, capability staf, atau akses histori akademik.
- `Pengguna.sekolah_id` lama dipertahankan sementara hanya untuk kompatibilitas migrasi, kemudian dipensiunkan melalui fase kontraksi yang terpisah.

**Invariant:** identitas pengguna tidak sama dengan membership, profile domain, maupun assignment.

### 3. Active tenant dan session

Setiap sesi menyimpan tenant aktif sebagai state server-authoritative.

- `SesiPengguna` akan memiliki `sekolah_aktif_id` nullable dan, bila diperlukan implementasi, referensi membership aktif yang tervalidasi.
- Tenant aktif hanya boleh diatur ke membership berstatus `AKTIF` milik pengguna tersebut.
- Semua request tenant harus membangun `TenantContext` dari sesi tervalidasi: pengguna, membership aktif, tenant aktif, base role tenant, dan owner flag.
- Semua query dan authorization tenant wajib menggunakan `TenantContext`; `sekolah_id` dari form, URL, atau klien bukan sumber otoritatif.
- Pengguna dengan lebih dari satu membership dapat berpindah tenant melalui action server yang memvalidasi membership dan mengaudit perubahan konteks.
- `SUPER_ADMIN` bekerja dalam mode platform tanpa tenant aktif atau memilih tenant secara eksplisit melalui jalur platform yang diaudit. Fallback memilih sekolah pertama dilarang.

**Invariant:** satu sesi memiliki maksimal satu tenant aktif, dan resource tenant hanya dapat diakses pada tenant aktif yang sama.

### 4. Join school approval workflow

Permintaan bergabung ke sekolah existing memakai persetujuan owner/operator dan tidak langsung memberi akses operasional.

1. Calon pengguna mencari dan memilih sekolah melalui hasil pencarian server-terverifikasi.
2. Ia melakukan registrasi akun dengan username dan email unik global.
3. Sistem membuat membership berstatus `MENUNGGU_PERSETUJUAN`, menyimpan konteks sekolah yang dipilih, dan membuat sesi auto-login.
4. Pengguna diarahkan ke dashboard/status onboarding terbatas yang menjelaskan bahwa permintaan menunggu persetujuan; data sekolah dan fitur tenant tidak dapat diakses.
5. Owner atau operator yang memiliki permission tenancy menyetujui atau menolak permintaan. Keputusan dicatat audit dan memberi notifikasi.
6. Saat disetujui, membership menjadi `AKTIF`; pengguna memilih/ditetapkan tenant aktif dan dapat melanjutkan onboarding peran serta profil domain sesuai kebijakan tenant.

Pengecualian: pendaftar sekolah baru memperoleh membership owner `AKTIF` pada transaksi pembuatan tenant, sehingga dapat langsung melanjutkan onboarding dan dashboard tenant.

**Invariant:** registrasi akun bukan bukti hubungan kerja atau kewenangan akademik pada tenant yang sudah ada.

### 5. School deduplication policy

Sekolah wajib dicari dan melewati deduplikasi sebelum tenant baru dapat dibuat.

Urutan resolusi:

1. **NPSN tepat:** bila NPSN diberikan dan sudah ada, pembuatan tenant ditolak; pengguna diarahkan untuk mengajukan join pada tenant tersebut.
2. **Kandidat institusi:** sistem membandingkan `nama_normalisasi + jenjang + kota_kabupaten`. Normalisasi menurunkan huruf, merapikan spasi, dan menghapus tanda baca yang tidak bermakna; nama asli tetap disimpan tanpa perubahan.
3. **Kandidat ditemukan atau ambigu:** pembuatan tenant publik diblokir. Pengguna harus memilih tenant yang benar atau mengajukan klarifikasi/verifikasi ke platform.
4. **Tidak ada kandidat:** pengguna boleh membuat tenant baru dengan nama resmi, jenjang, dan kota/kabupaten wajib; NPSN wajib diisi apabila sekolah memilikinya.

Pencarian publik hanya mengungkap data minimum yang diperlukan untuk memilih sekolah: nama, jenjang, dan kota/kabupaten. Hasilnya diberi rate limit dan tidak mengungkap daftar pengguna, alamat lengkap, atau data akademik.

**Invariant:** nama mentah saja tidak cukup untuk membuktikan tidak adanya tenant; NPSN tetap unik global pada database.

### 6. Trial dan billing entitlement

Entitlement untuk capability operasional sekolah adalah milik tenant, bukan milik pengguna.

- Tenant baru memperoleh satu trial `FREEMIUM` selama 30 hari, dimulai pada pembuatan tenant oleh owner pertama.
- Membership baru pada tenant existing tidak membuat atau memperpanjang trial.
- Paket, status, periode aktif, dan entitlement tenant disimpan pada aggregate langganan tenant yang menjadi satu-satunya resolver akses berbayar tenant.
- `TransaksiLangganan` dipertahankan sebagai ledger pembayaran dan harus menunjuk tenant serta entitlement yang menjadi target transaksi secara immutable.
- Webhook pembayaran mengaktifkan entitlement tenant secara idempoten; tidak boleh mengubah tenant atau pengguna lain.
- Lisensi individu lama pada `Pengguna` hanya diperlakukan sebagai data legacy selama masa migrasi. Ia tidak menjadi sumber keputusan entitlement tenant baru.

**Invariant:** satu pembayaran tenant hanya memengaruhi entitlement tenant yang tercatat dalam transaksi itu.

### 7. Multi-school user support

Satu akun global secara resmi dapat memiliki membership aktif di banyak tenant.

- Pengguna memilih tenant aktif melalui menu account setelah login atau melalui tautan yang memerlukan validasi server.
- Password, username, email, keamanan login, dan sesi identitas adalah global per pengguna.
- Role, owner flag, profil domain, assignment, permission efektif, data akademik, dan entitlement ditentukan dalam konteks tenant aktif.
- Keluar, dicabut, atau dinonaktifkannya membership pada tenant A tidak mengubah identity atau membership pengguna pada tenant B.
- Dashboard, navigasi, cache, audit, notifikasi, dan file privat harus selalu diberi tenant context agar tidak bercampur antar tenant.

**Invariant:** pengguna multi-sekolah tidak boleh memerlukan akun atau kredensial ganda dan tidak boleh menerima akses lintas tenant secara implisit.

## Konsekuensi

### Positif

- Alur daftar sekolah dan join sekolah mencerminkan struktur operasional sekolah yang nyata.
- Pengguna dapat menjalankan lebih dari satu peran atau bekerja pada lebih dari satu sekolah dengan identitas tunggal.
- Isolasi tenant dapat dipaksakan konsisten pada authentication, authorization, billing, audit, dan data.
- Trial serta pembayaran dapat diaudit berdasarkan institusi yang menerima manfaatnya.

### Biaya dan risiko yang diterima

- Semua penggunaan `Pengguna.sekolah_id` harus dimigrasikan bertahap ke `TenantContext`.
- Dashboard menunggu approval perlu disediakan untuk membership pending.
- Billing M23 saat ini harus direkonsiliasi sebagai ledger legacy sebelum resolver entitlement baru menjadi aktif.
- Migrasi data memerlukan backfill, rekonsiliasi, backup, dan rollout bertahap; tidak boleh berupa perubahan schema destruktif.

## Ketentuan Implementasi

1. Gunakan pola **expand → backfill → dual-read → cutover → contract**; migration yang sudah diterapkan bersifat immutable.
2. Semua operasi persetujuan, switch tenant, provisioning tenant, dan entitlement dijalankan server-side serta dicatat di audit log.
3. Endpoint, server action, repository, cache key/tag, dan file access harus menerima tenant context yang tervalidasi.
4. Tidak ada UI atau payload klien yang dapat menetapkan owner, membership aktif, tenant aktif, atau entitlement tanpa validasi server.
5. Avatar dan completion onboarding harus dipersistenkan server-side sebelum dashboard tenant dibuka; `sessionStorage` tidak boleh menjadi sumber kebenaran.
6. Kode implementasi tidak boleh dimulai sebelum ADR ini memperoleh persetujuan Human.

## Acceptance Criteria Architecture

- Tenant A tidak dapat membaca atau memutasi resource tenant B, termasuk melalui ID langsung, file, cache, webhook, dan background processing.
- Pembuatan tenant dan owner membership bersifat atomik.
- Join tenant existing selalu menghasilkan membership pending dan tidak dapat memberi akses tenant sebelum disetujui.
- Pendaftar tenant baru auto-login tanpa halaman login ulang dan dapat membuka dashboard tenant setelah avatar tersimpan.
- Username dan email duplikat global ditolak oleh aplikasi serta database.
- Pengguna dengan beberapa membership hanya memperoleh scope tenant aktifnya.
- Trial tidak dibuat ulang oleh join user dan pembayaran hanya memperbarui entitlement tenant target.

## Status dan langkah berikutnya

ADR ini belum berstatus `APPROVED` atau `LOCKED`; hanya Human yang dapat menetapkannya. Setelah persetujuan diberikan, fase **SaaS Multi-Tenant Foundation** boleh dibuka dengan scope pertama: schema ekspansif, backfill membership, tenant context sesi, dan authorization isolation.
