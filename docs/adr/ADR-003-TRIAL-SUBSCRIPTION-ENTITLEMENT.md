# ADR-003: Trial, Subscription & Entitlement Tenant

**Phase:** SAAS-02 — Trial, Subscription & Entitlement Design  
**Status:** PROPOSED — READY FOR HUMAN REVIEW  
**Tanggal:** 20 September 2026  
**Prasyarat:** ADR-001 dan ADR-002 telah selesai  
**Lingkup:** Desain produk dan arsitektur. Tidak mencakup database table, migration, service, controller, provider billing, UI, atau perubahan kode.

## 1. Konteks

Ruang Pintar adalah SaaS multi-tenant dengan sekolah sebagai unit operasional utama. Karena pengguna dapat menjadi anggota banyak sekolah, trial, subscription, pembayaran, dan entitlement tidak boleh melekat secara tunggal pada identitas pengguna.

ADR ini menetapkan tenant sebagai pemilik komersial produk. Provider pembayaran hanya mencatat dan mengonfirmasi transaksi; keputusan apakah sebuah fitur dapat dipakai selalu ditentukan oleh entitlement tenant yang tervalidasi server-side.

## 2. Keputusan ringkas

| Area | Keputusan |
| --- | --- |
| Pemilik trial | Tenant sekolah |
| Durasi trial default | 30 hari kalender |
| Awal trial | Saat tenant baru berhasil dibuat secara atomik dengan owner pertama aktif |
| Model komersial utama | Subscription flat per sekolah/tenant per periode, bertingkat melalui paket dan usage limits |
| Entitlement | Dihitung dari subscription tenant aktif, bukan dari user atau payment provider |
| Trial habis | Tenant masuk mode read-only, tanpa penghapusan data atau full lock |
| Pengelola billing | School Owner; operator hanya bila menerima delegasi eksplisit |
| Provider billing | Adapter provider-agnostic untuk Midtrans, Xendit, dan manual invoice |

## 3. Trial model

### 3.1 Durasi dan awal trial

- Trial default berlaku **30 hari kalender**.
- Trial dimulai tepat saat transaksi provisioning tenant berhasil: tenant tercipta, owner membership `ACTIVE`, dan status trial tercatat dalam satu fakta bisnis yang sama.
- Trial tidak dimulai saat invitation diterima, join request disetujui, user login, avatar dipilih, atau user pertama memakai fitur.
- Tenant hanya memperoleh satu trial default. Menambah anggota, mengganti owner, menghapus user, atau membuat sesi baru tidak dapat memperpanjang trial.
- Trial tidak berlaku per user. Satu user yang tergabung pada beberapa tenant akan melihat entitlement masing-masing tenant secara independen.

### 3.2 Cakupan trial

Trial memberikan akses penuh terhadap capability yang tersedia pada paket komersial standar, agar sekolah dapat mengevaluasi workflow nyata. Trial dapat diawasi dengan batas anti-abuse dan batas teknis yang tidak mengubah prinsip “full access”, misalnya rate limit AI dan ukuran unggahan yang aman.

**Invariant:** tidak boleh ada lebih dari satu trial aktif atau trial kedua untuk tenant yang sama tanpa proses komersial dan audit eksplisit.

## 4. Subscription model

### 4.1 Evaluasi pilihan

| Model | Keunggulan | Risiko | Keputusan |
| --- | --- | --- | --- |
| Per sekolah/tenant | Sesuai entitas pembeli, anggaran sekolah, akses multi-role, dan data tenant | Perlu tier/quota untuk membedakan skala | **Dipilih** |
| Per guru | Mudah dipahami pada produk guru individual | Membingungkan jika guru bergabung tenant; billing terpecah dan tidak mencerminkan data sekolah | Tidak menjadi model utama |
| Per siswa | Berkorelasi dengan skala sekolah | Membutuhkan sinkronisasi enrollment yang sensitif dan mudah diperdebatkan pada periode mutasi | Tidak menjadi model utama |
| Flat SaaS global tanpa tier | Sederhana di awal | Tidak adil bagi tenant skala besar dan tidak memberi mekanisme kontrol biaya | Dipakai hanya sebagai bentuk harga paket dasar per tenant, bukan satu-satunya model |

### 4.2 Keputusan paket

Subscription berlangganan per **tenant per periode** adalah model utama. Harga dapat berbentuk flat per periode untuk setiap paket, dengan batas pemakaian dan feature set sebagai pembeda paket.

Paket konseptual:

- `TRIAL`: entitlement penuh sementara selama 30 hari.
- `BASIC`: operasi inti sekolah dengan batas pemakaian paket dasar.
- `PRO`: feature set dan kuota lebih tinggi untuk operasi digital sekolah yang lebih luas.
- `ENTERPRISE`: kontrak khusus, kuota/kebijakan kustom, dan dukungan administratif.

Nama paket, harga, periode tagihan bulanan/tahunan, serta angka kuota adalah konfigurasi katalog komersial, bukan hard-code pada entitlement engine. Paket pengguna individual dapat ditambahkan kelak hanya sebagai produk terpisah dan tidak boleh menjadi sumber entitlement sekolah.

### 4.3 Hierarki sumber kebenaran

```text
Katalog Paket
→ Subscription Tenant
→ Entitlement Tenant Efektif
→ Authorization / Feature Gate / Usage Gate
```

Payment provider tidak boleh menjadi sumber kebenaran langsung untuk UI atau akses. Notifikasi pembayaran yang tervalidasi hanya mengubah subscription/entitlement tenant yang sudah terikat pada order secara immutable.

## 5. Entitlement model

### 5.1 Prinsip

Entitlement adalah kumpulan capability dan limits efektif milik tenant pada waktu tertentu. Entitlement menjawab dua pertanyaan berbeda:

1. Apakah tenant berhak memakai capability ini?
2. Apakah tenant masih berada di bawah batas pemakaian capability tersebut?

Permission pengguna tetap diperlukan. Entitlement tidak memberi permission kepada user; ia hanya membuka capability untuk tenant yang memang berlangganan.

```text
Tenant aktif
→ Subscription/Entitlement valid
→ Permission actor valid
→ Resource scope valid
→ Usage limit valid bila berlaku
→ Akses diizinkan
```

### 5.2 Feature family yang dikontrol

| Feature family | Contoh capability | Keputusan entitlement |
| --- | --- | --- |
| Core school operations | organisasi, struktur akademik, data guru/siswa, jadwal | Tersedia pada semua paket berbayar dan trial; tetap permission-scoped |
| LMS & learning | materi, tugas, jurnal, kelas digital | Dikontrol per paket |
| Presensi | presensi sekolah dan presensi sesi kelas | Dikontrol per paket |
| Assessment & gradebook | asesmen, nilai, publikasi nilai, rapor | Dikontrol per paket |
| CBT | bank soal, ujian CBT, monitoring, hasil | Dikontrol per paket dan quota bila diperlukan |
| AI Assistant | foto absensi AI, bantuan konten, ekstraksi | Dikontrol per paket, rate limit, serta usage credit/kuota |
| Guardian & communication | akses wali, pengumuman, notifikasi | Dikontrol per paket |
| Reporting & analytics | laporan, ekspor, dashboard leadership | Dikontrol per paket |
| Integration | webhook, API, provider eksternal | Dikontrol per paket dan kebijakan keamanan |
| Storage | berkas materi, tugas, lampiran | Dikontrol melalui storage quota tenant |

Feature family tidak menggantikan aturan domain: misalnya entitlement CBT tidak mengizinkan guru menjalankan ujian di kelas yang bukan assignment-nya.

### 5.3 Status entitlement

Status konseptual yang harus dapat dievaluasi:

- `TRIAL_ACTIVE`: trial belum lewat;
- `ACTIVE`: subscription berbayar aktif;
- `PAST_DUE`: ada kewajiban pembayaran yang belum terselesaikan namun masih di dalam grace policy;
- `READ_ONLY`: tidak dapat melakukan mutasi operasional;
- `SUSPENDED`: akses dibatasi karena kebijakan bisnis/keamanan;
- `CANCELLED`: tidak ada entitlement berbayar aktif setelah periode berakhir.

Pemetaan status payment provider ke status ini dilakukan oleh adapter/provider handler dan tidak boleh dipakai secara langsung oleh domain aplikasi.

## 6. Trial expiration dan subscription expiry

### 6.1 Opsi yang dievaluasi

| Opsi | Dampak | Keputusan |
| --- | --- | --- |
| Full lock | Sangat menekan konversi, tetapi menghalangi sekolah mengakses data sendiri | Ditolak |
| Limited access tanpa definisi jelas | Sulit diaudit; rentan feature leak dan pengalaman membingungkan | Ditolak |
| Read-only terstruktur | Memelihara akses data dan kepercayaan, sambil menghentikan mutasi bernilai komersial | **Dipilih** |

### 6.2 Perilaku yang dipilih

Saat trial atau subscription berakhir dan tidak ada entitlement aktif pengganti, tenant memasuki `READ_ONLY`.

- Data historis tetap tersedia untuk dibaca oleh actor yang memiliki permission baca dan tenant scope yang sah.
- Mutasi diblokir: create, update, delete, publish, finalisasi, pengiriman, sinkronisasi keluar, pembuatan ujian, dan tindakan yang mengubah data operasional.
- Owner tetap dapat membuka status billing, riwayat transaksi, penggunaan tenant, dan jalur berlangganan.
- Ekspor data yang menjadi hak tenant tetap diizinkan pada kebijakan read-only, dengan audit dan rate limit untuk mencegah exfiltration massal.
- Akses AI dan integrasi keluar dihentikan saat `READ_ONLY`, karena keduanya dapat menghasilkan biaya atau side effect eksternal.
- Saat subscription aktif kembali, entitlement dipulihkan tanpa menghapus atau memigrasikan data tenant.

`PAST_DUE` dan masa tenggang pembayaran bersifat kebijakan katalog. Default awal yang direkomendasikan: tidak ada grace tambahan setelah trial; subscription berbayar dapat memiliki grace yang diputuskan secara komersial sebelum `READ_ONLY`.

## 7. Owner responsibility dan visibility

| Aktivitas | School Owner | Operator terdelegasi | Kepala Sekolah | Guru |
| --- | --- | --- | --- | --- |
| Melihat status trial/subscription | Ya | Ya, bila diberi permission billing view | Ya, bila diberi permission view | Tidak, kecuali pemberitahuan status non-rinci |
| Memulai checkout atau memilih paket | Ya | Ya, bila diberi permission billing manage | Tidak secara default | Tidak |
| Mengelola metode/riwayat pembayaran | Ya | Ya, bila diberi permission billing manage | Lihat saja bila didelegasikan | Tidak |
| Melihat penggunaan tenant | Ya | Ya, sesuai scope | Ya, untuk ringkasan organisasi | Hanya penggunaan yang relevan pada tugasnya |
| Mengubah quota/paket | Ya melalui proses komersial | Tidak secara default | Tidak secara default | Tidak |

Owner bertanggung jawab untuk menjaga informasi penagihan, memilih paket, mengelola akses billing yang didelegasikan, dan menindaklanjuti warning trial/usage. Tanggung jawab ini tidak menghapus prinsip bahwa payment approval dapat mengikuti SOP sekolah di luar sistem.

## 8. Usage limits

### 8.1 Keputusan

Usage limits diperlukan untuk fairness paket, perlindungan biaya, dan kapasitas operasional, tetapi angka limit tidak dikunci dalam ADR. Semua limit harus didefinisikan melalui katalog paket dan dievaluasi tenant-level.

Metrik yang harus didukung desain entitlement:

| Metrik | Dasar hitung yang direkomendasikan | Catatan |
| --- | --- | --- |
| Guru aktif | Profil guru aktif pada tenant | Bukan jumlah account global |
| Siswa aktif | Enrollment/keikutsertaan aktif pada periode yang sah | Tidak memakai total histori siswa |
| Kelas/rombel aktif | Rombel aktif pada periode akademik | Tidak menghitung arsip/histori |
| Storage | Byte berkas aktif tenant | Perlu lifecycle berkas dan peringatan quota |
| AI usage | Unit konsumsi per capability AI | Menggunakan kuota/credit dan rate limit terpisah |
| CBT usage | Kandidat/attempt aktif atau kuota ujian sesuai katalog | Definisi final harus selaras dengan biaya operasional CBT |
| Integrasi | Endpoint aktif, volume event, atau keduanya | Harus mencegah abuse provider eksternal |

### 8.2 Perilaku saat quota tercapai

- Sistem menampilkan warning sebelum 80%, 95%, dan 100% limit jika metrik memungkinkan.
- Pada 100%, hanya capability yang menambah pemakaian metrik tersebut diblokir; capability lain yang masih entitled tetap berjalan.
- Data dan histori tidak dihapus karena quota tercapai.
- Owner/operator billing melihat metrik, limit, periode reset, dan opsi upgrade yang dapat ditindaklanjuti.
- Rate limit keamanan tetap berlaku walau quota belum tercapai.

## 9. Future billing readiness

### 9.1 Kontrak provider-agnostic

Arsitektur subscription memakai adapter dengan kontrak konseptual berikut:

```text
Billing Provider Adapter
  - create payment instruction
  - verify webhook/notification
  - query payment status bila diperlukan
  - cancel/expire instruction bila provider mendukung

Subscription Domain
  - create order untuk tenant dan paket yang telah dipilih
  - mengubah subscription setelah event payment tervalidasi
  - menghitung entitlement efektif
  - mencatat audit dan menjaga idempotensi
```

`Midtrans`, `Xendit`, dan `Manual Invoice` adalah adapter yang setara. Tidak ada UI, authorization, atau capability gate yang boleh bergantung langsung pada API/format status satu provider.

### 9.2 Manual invoice

Manual invoice diperlakukan sebagai metode pembayaran dengan lifecycle yang sama: order tenant dibuat, invoice diterbitkan, bukti/konfirmasi internal dicatat, lalu subscription diaktifkan oleh event otoritatif dan ter-audit. Aktivasi manual harus mengikuti dual-control atau permission khusus agar tidak menjadi bypass billing.

### 9.3 Idempotensi dan keamanan

- Setiap order mengikat satu tenant, paket, periode, mata uang, nominal, dan target entitlement yang immutable.
- Provider event wajib diverifikasi dengan mekanisme resmi provider dan diproses idempoten.
- Event duplikat tidak dapat memperpanjang periode dua kali.
- Payment event tidak boleh menentukan tenant dari payload klien; binding order server adalah sumber kebenaran.
- Semua perubahan subscription, entitlement, dan invoice dicatat audit.

## 10. UI flow konseptual

```text
Tenant Created
→ Trial Started (30 hari)
→ Owner melihat status dan penggunaan tenant
→ Trial Warning (H-14, H-7, H-3, H-1)
→ Owner memilih paket dan metode pembayaran
→ Payment confirmed
→ Subscription Active

Jika tidak berlangganan:
Trial Expired
→ Tenant Read-Only
→ Owner dapat berlangganan
→ Payment confirmed
→ Subscription Active
```

Ketentuan UX:

- Warning hanya ditampilkan kepada role yang memiliki relevansi operasional; detail billing hanya untuk owner/delegasi berwenang.
- Warning harus menyebut tanggal akhir, status akses setelah akhir, dan CTA yang sesuai permission.
- Guru, siswa, dan guardian tidak menerima informasi nominal/tagihan kecuali diberi hak eksplisit di masa depan.
- Pada `READ_ONLY`, setiap aksi mutasi menjelaskan bahwa tenant harus mengaktifkan subscription tanpa membocorkan informasi billing kepada actor tanpa hak.

## 11. Audit trail

Aktivitas berikut harus menjadi audit event tenant-scoped:

- trial dimulai, dipulihkan melalui prosedur otoritatif, dan berakhir;
- warning entitlement dikirim atau gagal dikirim;
- order dibuat, dibatalkan, kedaluwarsa, dibayar, gagal, atau direkonsiliasi;
- provider webhook diterima, diverifikasi, ditolak, atau dianggap duplikat;
- subscription berubah status, paket, periode, quota, atau entitlement;
- quota threshold tercapai dan capability diblokir/dibuka kembali;
- actor melihat atau mengelola billing pada aksi sensitif;
- manual invoice diterbitkan, diverifikasi, dan diaktifkan.

Payload audit tidak boleh menyimpan token provider mentah, data kartu, credential, atau informasi pembayaran sensitif yang tidak diperlukan.

## 12. Open questions sebelum implementasi

1. Harga final, periode billing (bulanan/tahunan), mata uang, dan detail katalog `BASIC`/`PRO`/`ENTERPRISE` belum dikunci.
2. Angka quota guru, siswa, rombel, storage, AI usage, CBT usage, dan integrasi per paket memerlukan keputusan komersial serta analisis biaya.
3. Apakah subscription berbayar memiliki grace period? Jika ya, berapa hari dan apakah berbeda per paket/metode pembayaran?
4. Apakah eksport pada status `READ_ONLY` tanpa batas, dibatasi volume, atau dibatasi frekuensi? Rekomendasi: diizinkan dengan rate limit dan audit.
5. Apakah trial dapat diperpanjang melalui approval platform sekali saja, dan bukti apa yang diperlukan? Rekomendasi: hanya exception ber-audit, bukan fitur self-service.
6. Apakah sekolah dapat membeli add-on terpisah (misalnya credit AI atau storage) sebelum paket multi-tier diterapkan?
7. Metode manual invoice mana yang memerlukan dual-control, siapa approver-nya, dan bagaimana rekonsiliasi dengan pembayaran bank dilakukan?
8. Apakah entitlement berlaku langsung sesudah webhook atau memerlukan periode aktivasi administratif tertentu untuk invoice institusi?
9. Kebijakan pajak, invoice legal, refund, pembatalan, dan pro-rata belum masuk scope ADR ini dan harus diputuskan sebelum billing produksi.
10. Apakah paket individual tetap menjadi produk roadmap? Jika ya, perlu ADR terpisah agar tidak bercampur dengan entitlement tenant.

## 13. Out of scope

- database schema/model, migration, seed, service, controller, route, webhook handler, atau UI;
- integrasi aktual Midtrans, Xendit, maupun sistem invoice;
- harga final dan materi pemasaran;
- perubahan authorization implementation;
- desain recovery payment, refund, pajak, dan compliance finansial secara detail.

## Status

ADR-003 siap untuk Human Review. Implementasi SaaS Multi-Tenant Foundation tidak dimulai oleh ADR ini; keputusan desain ini menjadi kontrak komersial dan entitlement setelah Human menyatakan `APPROVED`.
