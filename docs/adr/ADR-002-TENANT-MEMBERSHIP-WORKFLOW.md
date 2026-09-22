# ADR-002: Tenant Membership & Invitation Workflow

**Phase:** SAAS-01 — Tenant Membership & Invitation Design  
**Status:** PROPOSED — READY FOR HUMAN REVIEW  
**Tanggal:** 20 September 2026  
**Prasyarat:** ADR-001 SaaS Multi-Tenant Foundation telah disetujui oleh Human  
**Lingkup:** Keputusan produk dan spesifikasi workflow. Tidak mencakup implementasi database, migration, seed, route, controller, service, UI, atau perubahan kode.

## 1. Konteks dan tujuan

Tenant sekolah adalah batas data, akses, konfigurasi, dan entitlement Ruang Pintar. Identitas pengguna bersifat global; hubungan pengguna dengan sekolah dibentuk oleh school membership yang dapat berbeda untuk setiap tenant.

ADR ini menetapkan workflow yang aman dan dapat diaudit untuk:

- penetapan dan perpindahan School Owner;
- undangan anggota sekolah;
- join request mandiri;
- persetujuan membership;
- lifecycle membership;
- penggunaan banyak sekolah oleh satu akun;
- pergantian tenant aktif pada sesi.

## 2. Prinsip dan invarian

1. **Identity tidak sama dengan membership.** Satu akun dapat memiliki nol atau banyak membership tanpa menggandakan username, email, atau password.
2. **Tenant isolation secara default deny.** Membership di tenant A tidak memberi hak apa pun pada tenant B.
3. **Owner adalah otoritas tenancy, bukan base role global dan bukan `SUPER_ADMIN`.**
4. **Tidak ada access by invitation link.** Link hanya membuktikan undangan; akses tenant baru aktif setelah penerimaan dan validasi identitas/email selesai.
5. **Satu tenant selalu memiliki setidaknya satu owner aktif.** Owner terakhir tidak dapat mengundurkan diri, dicabut, atau dihapus tanpa transfer owner yang berhasil.
6. **Semua perubahan lifecycle membership dapat ditelusuri.** Tidak ada penghapusan riwayat membership yang bersifat destruktif.
7. **Tenant aktif berasal dari sesi tervalidasi.** Nilai dari URL, form, local storage, atau klien tidak boleh menjadi sumber otoritatif.

## 3. Tanggung jawab dan batas hak

| Aktor | Hak membership/tenancy | Batasan |
| --- | --- | --- |
| School Owner | Mengundang, menyetujui/menolak join request, menangguhkan/mencabut membership, menunjuk operator, mengangkat/mentransfer owner, melihat audit tenancy, dan mengelola konfigurasi tenant sesuai permission owner | Tidak memperoleh akses tenant lain; tidak dapat meninggalkan tenant sebagai owner terakhir |
| Operator Sekolah | Mengundang dan mengelola membership sesuai delegasi owner, memproses request, mengirim ulang/mencabut undangan yang dibuat atau diizinkan, serta mengelola profil domain setelah membership aktif | Tidak dapat mengangkat/mencabut owner, mentransfer ownership, atau mengubah kebijakan tenant tanpa permission eksplisit |
| Kepala Sekolah | Memantau daftar membership, status invitation/request, dan audit yang relevan; dapat memberi persetujuan organisasi bila owner mendelegasikan permission khusus | Jabatan Kepala Sekolah tidak otomatis memberi hak owner atau hak mutasi membership |
| Guru | Menerima undangan yang ditujukan kepadanya, mengajukan join request, melihat status request sendiri, memilih tenant aktif dari membership aktifnya, serta keluar dari tenant jika bukan owner terakhir | Tidak dapat melihat daftar anggota secara penuh, menyetujui orang lain, atau mengakses tenant sebelum membership aktif |

Catatan: hak rinci akan diterjemahkan menjadi permission pada fase implementasi authorization. Tabel ini menetapkan keputusan produk, bukan kode permission.

## 4. Status membership

| Status | Makna | Akses tenant | Transisi valid |
| --- | --- | --- | --- |
| `PENDING` | Permintaan join atau penerimaan undangan belum disetujui/diaktifkan | Tidak ada akses data tenant; hanya status onboarding terbatas | `ACTIVE`, `REJECTED`, `REMOVED` |
| `ACTIVE` | Hubungan pengguna–tenant aktif dan dapat dipilih sebagai tenant sesi | Sesuai role, assignment, permission, dan resource scope | `SUSPENDED`, `REMOVED` |
| `REJECTED` | Join request ditolak | Tidak ada akses; rekam jejak tetap ada | `PENDING` hanya melalui request baru, bukan reaktivasi diam-diam |
| `SUSPENDED` | Membership dihentikan sementara | Tidak ada akses tenant dan tidak dapat menjadi tenant aktif | `ACTIVE`, `REMOVED` |
| `REMOVED` | Hubungan anggota dicabut atau anggota keluar | Tidak ada akses; histori tetap untuk audit | Tidak dapat diaktifkan ulang; gunakan invitation/request baru |

Aturan tambahan:

- Owner yang aktif harus memiliki status `ACTIVE`.
- Status membership tidak boleh digunakan untuk menghapus atau mengubah profil domain dan histori akademik secara otomatis.
- Perubahan `ACTIVE → SUSPENDED` atau `ACTIVE → REMOVED` mencabut tenant tersebut dari semua sesi pengguna yang sedang menggunakannya.
- `PENDING` dan `REJECTED` tidak dapat dipakai untuk membentuk tenant context.

## 5. Invitation workflow

### 5.1 Tujuan

Invitation digunakan ketika owner/operator mengetahui calon anggota dan ingin mengundangnya ke tenant tertentu. Invitation tidak membuat akun global secara otomatis.

### 5.2 Alur utama

```text
Owner / Operator berwenang
→ buat undangan untuk email + role awal + tenant
→ sistem mengirim email/link undangan satu kali pakai
→ calon guru membuka link
→ login ke akun global ATAU registrasi akun global
→ sistem memverifikasi kecocokan email
→ calon guru menerima undangan
→ membership menjadi ACTIVE
→ sesi memilih tenant undangan sebagai tenant aktif
→ dashboard tenant
```

Jika calon pengguna sudah memiliki akun dengan email yang sama, ia cukup login lalu menerima undangan. Jika belum, ia menyelesaikan registrasi akun, memilih avatar, lalu menerima undangan. Tidak ada halaman login ulang setelah registrasi berhasil.

### 5.3 Data bisnis minimum invitation

Spesifikasi konseptual invitation memerlukan identitas invitation, tenant, email penerima yang dinormalisasi, role awal, pembuat, waktu dibuat, waktu kedaluwarsa, waktu diterima, waktu dicabut, dan alasan lifecycle. Nama model maupun struktur fisik belum diputuskan pada ADR ini.

Role awal dari invitation hanya mengatur membership awal. Ia tidak otomatis membuat profil guru, assignment mengajar, jabatan, capability operator, atau ownership kecuali workflow terpisah yang terotorisasi.

## 6. Join school request workflow

### 6.1 Tujuan

Join request digunakan ketika guru menemukan sekolahnya melalui pencarian publik dan belum menerima invitation.

### 6.2 Alur utama

```text
Guru mencari sekolah
→ memilih tenant yang tepat
→ klik Gabung Sekolah
→ login / registrasi akun global
→ sistem membuat membership PENDING
→ owner/operator menerima notifikasi
→ approve ATAU reject
→ jika approve: membership ACTIVE
→ pengguna memilih tenant aktif
→ dashboard tenant
```

### 6.3 Ketentuan approval

- Permintaan join hanya dapat dibuat untuk tenant yang dipilih dari hasil pencarian server-terverifikasi.
- Owner atau operator yang didelegasikan memeriksa identitas, alasan bergabung bila diwajibkan tenant, dan role awal.
- `Approve` mengaktifkan membership; pemberi keputusan, waktu, role awal, dan catatan keputusan dicatat.
- `Reject` tidak menghapus request. Pemohon melihat status penolakan yang aman tanpa membocorkan data internal tenant.
- Membership yang sudah `PENDING` untuk tenant sama tidak dapat dibuat lagi. Pengguna diarahkan ke status request yang ada.
- Tenant dapat memilih kebijakan tambahan pada fase berikutnya, tetapi default produk adalah approval manual untuk sekolah existing.

## 7. Multi-school user dan tenant switching

Satu pengguna boleh menjadi anggota banyak sekolah.

### 7.1 Perilaku akun

- Username, email, password, MFA bila ditambahkan, dan sesi identitas berlaku global per pengguna.
- Role, owner flag, capability, profil domain, assignment, data, dan entitlement selalu dinilai dalam tenant aktif.
- Penangguhan atau pencabutan di satu sekolah tidak berdampak pada membership aktif pengguna di sekolah lain.

### 7.2 Tenant switching

```text
Pengguna login
→ sistem memuat membership ACTIVE
→ bila satu tenant: otomatis menjadi tenant aktif
→ bila banyak tenant: gunakan tenant sesi terakhir yang masih valid;
  bila tidak ada, pengguna memilih tenant
→ server memvalidasi membership
→ server memperbarui tenant aktif sesi dan mencatat audit
→ pengguna diarahkan ke dashboard tenant terpilih
```

- Hanya membership `ACTIVE` yang muncul pada tenant switcher.
- Bila membership tenant aktif menjadi `SUSPENDED` atau `REMOVED`, tenant context sesi dicabut; pengguna harus memilih membership aktif lain atau melihat state tanpa tenant.
- Setiap browser session menyimpan tenant aktifnya sendiri. Perubahan tenant pada sesi/perangkat A tidak mengubah pilihan pada sesi/perangkat B.
- Cache, notifikasi, file privat, audit event, dan navigasi harus selalu memuat tenant context yang sama.

## 8. Keamanan invitation

| Kondisi | Keputusan |
| --- | --- |
| Link kedaluwarsa | Invitation tidak dapat diterima; pengguna melihat status aman dan dapat meminta pengirim membuat undangan baru. Masa berlaku default yang direkomendasikan: 7 hari, dapat ditetapkan lebih singkat oleh tenant. |
| Invitation dicabut | Token segera tidak valid, walau belum kedaluwarsa. Riwayat pencabutan dan pelaku disimpan. |
| Invitation duplikat | Hanya satu invitation aktif untuk kombinasi tenant + email penerima pada satu waktu. Undangan baru menggantikan/menutup invitation aktif lama secara eksplisit dan ter-audit. |
| Email mismatch | Invitation hanya dapat diterima oleh akun dengan email global yang sama persis setelah normalisasi. Akun dengan email berbeda tidak boleh menerima, mengubah email dari link, atau memperoleh detail tenant. |
| Token bocor | Token harus acak kriptografis, satu kali pakai, disimpan sebagai hash, memiliki kedaluwarsa, dan tidak memuat PII atau permission dalam bentuk dapat dibaca. Penerimaan selalu membutuhkan sesi akun global yang cocok. |
| Akun sudah menjadi anggota | Token tidak membuat membership kedua. Sistem menyatakan bahwa membership sudah ada dan tidak mengubah role/status tanpa workflow terpisah. |
| Email belum memiliki akun | Registrasi hanya diperbolehkan memakai email invitation yang sama. Setelah identitas dibuat, pengguna kembali ke acceptance flow tanpa login ulang. |
| Pengiriman email gagal | Invitation tetap memiliki status pengiriman yang dapat dipantau; resend menghasilkan token baru dan mencabut token lama. |
| Brute force / enumeration | Endpoint validasi token dan pencarian invitation diberi rate limit, respons generik, serta audit untuk kegagalan relevan. |

## 9. Owner transfer dan lifecycle owner

### 9.1 Owner resign atau keluar sekolah

Owner aktif yang hendak keluar wajib memulai transfer ownership terlebih dahulu:

```text
Owner lama memilih membership ACTIVE penerus
→ sistem meminta konfirmasi eksplisit
→ ownership penerus aktif dan diaudit
→ sistem memastikan tenant masih memiliki owner aktif
→ owner lama boleh menjadi anggota biasa, SUSPENDED, atau REMOVED
```

- Penerus harus memiliki membership `ACTIVE` pada tenant yang sama.
- Transfer tidak boleh dilakukan melalui invitation yang belum diterima atau membership pending.
- Owner terakhir tidak dapat meninggalkan, dihapus, ditangguhkan, ataupun kehilangan ownership tanpa owner pengganti aktif.
- Jika owner tidak dapat melakukan transfer (meninggal, akun terkunci, atau tidak dapat dihubungi), `SUPER_ADMIN` platform dapat menjalankan recovery workflow khusus dengan bukti administratif, dual confirmation, dan audit berprioritas tinggi. Ini bukan bypass rutin.

### 9.2 Owner menghapus akun

Hard delete identitas owner tidak didukung jika masih memiliki membership, profil domain, transaksi, atau audit. Permintaan penghapusan akun mengikuti lifecycle non-destruktif:

1. transfer seluruh ownership yang masih aktif;
2. cabut/arsipkan membership sesuai kebijakan;
3. revoke seluruh sesi;
4. anonimisasi atau penghapusan data personal hanya jika tidak melanggar retensi audit, hukum, dan histori akademik.

## 10. Audit trail

Setiap aktivitas membership menghasilkan event append-only dengan tenant context bila ada. Minimal event berikut wajib tercatat:

- invitation dibuat, dikirim, resend, diterima, kedaluwarsa, dicabut, dan gagal divalidasi;
- join request dibuat, diubah bila diizinkan, disetujui, ditolak, atau ditutup;
- membership dibuat, diaktifkan, ditangguhkan, diaktifkan kembali, dicabut, atau ditinggalkan;
- role membership dan owner flag berubah;
- ownership transfer dimulai, dikonfirmasi, selesai, atau gagal;
- tenant aktif sesi berubah atau dicabut;
- aksi recovery ownership oleh platform.

Setiap event minimum menyimpan: actor identity, tenant, target membership/invitation, aksi, timestamp, sumber tindakan, alasan/catatan bila relevan, serta snapshot sebelum/sesudah yang proporsional. Token undangan mentah, password, dan PII yang tidak perlu tidak boleh dicatat di audit payload.

## 11. UI flow konseptual

### 11.1 Owner mengundang guru

```text
Dashboard Tenant Owner
→ Anggota Sekolah
→ Undang Anggota
→ masukkan email + role awal
→ konfirmasi ringkasan tenant dan penerima
→ Undangan Terkirim
→ status: Menunggu Diterima
```

Prinsip UI: owner melihat status, masa berlaku, dan aksi resend/cabut. Ia tidak melihat token mentah setelah pengiriman.

### 11.2 Guru menerima undangan

```text
Email / link undangan
→ verifikasi undangan aman
→ login atau registrasi dengan email yang sesuai
→ pilih avatar bila akun baru
→ Terima Undangan
→ Membership Active
→ tenant ditetapkan aktif pada sesi
→ Dashboard Tenant
```

Jika email tidak cocok, link kedaluwarsa, atau dicabut, pengguna menerima error yang jelas dan aman serta tidak memperoleh informasi tenant yang tidak diperlukan.

### 11.3 Guru mengajukan join request

```text
Landing Page
→ Cari Sekolah
→ pilih sekolah
→ Gabung Sekolah
→ login atau registrasi
→ status Menunggu Persetujuan
→ owner/operator approve atau reject
→ jika approve: Membership Active
→ pilih tenant aktif
→ Dashboard Tenant
```

Dashboard membership pending hanya menunjukkan status request, instruksi aman, dan opsi membatalkan request bila kebijakan tenant mengizinkan. Ia tidak menampilkan data akademik sekolah.

## 12. Acceptance criteria desain

1. Tidak ada workflow yang memberi akses tenant sebelum membership `ACTIVE`.
2. Pendaftar sekolah baru menjadi owner aktif secara atomik; joiner sekolah existing berstatus `PENDING`.
3. Satu email penerima tidak dapat memiliki dua invitation aktif pada tenant yang sama.
4. Invitation hanya dapat diterima pada akun dengan email yang cocok, token valid, belum dipakai, belum dicabut, dan belum kedaluwarsa.
5. Owner terakhir tidak dapat keluar atau dicabut tanpa transfer ownership yang sukses.
6. Satu user dapat berpindah antar semua membership `ACTIVE` tanpa akses silang.
7. Seluruh lifecycle invitation, request, membership, owner, dan tenant switching memiliki audit event.

## 13. Open questions sebelum implementasi

1. Apakah operator dapat langsung mengaktifkan membership, atau approval akhir selalu memerlukan owner? Keputusan default ADR ini: operator berwenang dapat approve bila didelegasikan owner.
2. Apakah tenant dapat memilih kebijakan **auto-approve** untuk domain email tertentu di masa depan? Keputusan default: tidak dalam SAAS-01; semua join sekolah existing manual approval.
3. Role awal apa yang diizinkan pada invitation/join request: hanya `TEACHER`, atau seluruh base role tenant? Rekomendasi: invitation owner/operator dapat memilih role yang diizinkan kebijakan tenant; join mandiri default `TEACHER`.
4. Apakah invitation untuk siswa dan guardian masuk scope workflow yang sama atau ADR/fase tersendiri? Rekomendasi: fase tersendiri karena membutuhkan verifikasi enrollment/relationship.
5. Berapa masa berlaku final invitation dan apakah tenant dapat mengonfigurasinya? Rekomendasi: default 7 hari, rentang konfigurasi diputuskan pada fase konfigurasi tenant.
6. Apakah alasan rejection wajib, opsional internal, atau dapat dilihat pemohon? Rekomendasi: wajib internal, ringkasan aman opsional untuk pemohon.
7. Bukti administratif apa yang diterima untuk recovery owner oleh platform dan siapa yang memberi dual confirmation? Wajib dikunci sebelum recovery tool dibuat.
8. Apakah owner dapat menunjuk lebih dari satu owner dan apakah pemberian owner membutuhkan acceptance penerima? Rekomendasi: multi-owner diizinkan; penerima harus menyetujui kenaikan ownership.
9. Bagaimana kebijakan retensi/anonymization membership, invitation, dan audit untuk akun yang meminta penghapusan? Wajib diselaraskan dengan kebijakan legal/privasi.
10. Apakah email invitation harus diverifikasi ulang bila account sudah ada tetapi email belum terverifikasi? Rekomendasi: ya, sebelum acceptance.

## 14. Out of scope

- desain tabel, Prisma schema, migration, seed, dan backfill;
- endpoint, server action, service, controller, atau job email;
- tampilan visual final dan komponen UI;
- perubahan permission implementation atau authorization engine;
- workflow siswa, guardian, dan organisasi eksternal;
- implementasi billing, walaupun prinsip entitlement tenant tetap mengikuti ADR-001.

## Status

ADR-002 ini siap untuk Human Review. Setelah Human menyatakan `APPROVED`, keputusan workflow di atas menjadi kontrak desain untuk membuka fase implementasi **SaaS Multi-Tenant Foundation**.
