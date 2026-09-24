# PRODUCT BILLING & ENTITLEMENT DECISION AUDIT
## Ruang Pintar — Evaluasi Strategis & Keputusan Arsitektur Model Monetisasi SaaS

| Metadata | Nilai |
| --- | --- |
| **Proyek** | Ruang Pintar — School Digital Operating Platform |
| **Tahap** | STAGE 10.5 — PRODUCT BILLING & ENTITLEMENT DECISION AUDIT |
| **Status Dokumen** | `ANALYSIS & DECISION PROPOSAL — READY FOR HUMAN REVIEW` |
| **Tanggal Audit** | 24 September 2026 |
| **Prinsip Dasar** | Zero Code Modification, Fact-First Engineering, Sound Unit Economics |

---

# 1. Latar Belakang & Dilema Strategis

Audit arsitektur pada Stage 09, 10.3, dan 10.4 membuktikan adanya konflik struktural (*architectural mismatch*) antara model penagihan berbasis pengguna individu (**Teacher Pro Individual — Rp 15.000/bln**) dengan model pondasi multi-tenant berbasis institusi sekolah (**LanggananTenant / School Workspace**).

Audit ini bertujuan memberikan analisis objektif dan rekomendasi final untuk menjawab pertanyaan strategis produk:

> **Apakah Ruang Pintar harus mempertahankan model 4-Tier:**
> `1. Freemium` $\rightarrow$ `2. Teacher Pro Individual` $\rightarrow$ `3. School Pro` $\rightarrow$ `4. Enterprise`  
> **ATAU menyederhanakannya menjadi model 3-Tier murni berbasis Tenant:**  
> `1. Freemium (School Free/Trial)` $\rightarrow$ `2. School Pro (Institusi BOS)` $\rightarrow$ `3. Enterprise (Yayasan/Dinas)`?

---

# 2. Perbandingan Dua Model Monetisasi

```text
====================================================================================================
OPSI A: MODEL 4-TIER (Hibrida B2C & B2B)             OPSI B: MODEL 3-TIER (Murni B2B Institutional)
====================================================================================================
Tier 1: Freemium (Guru/Sekolah Coba-coba)           Tier 1: Freemium / Free School Tier
Tier 2: Teacher Pro Individual (B2C Rp 15rb/bln)    Tier 2: School Pro (B2B Kontrak BOS Rp 3-7jt/thn)
Tier 3: School Pro (B2B Institusi BOS)              Tier 3: Enterprise (B2B Yayasan Multi-Unit)
Tier 4: Enterprise (B2B Yayasan Multi-Unit)
----------------------------------------------------------------------------------------------------
Karakter: Split-Brain Entitlement                   Karakter: Single-Tenant Entitlement Resolver
Batas Lisensi: Pengguna + Sekolah                   Batas Lisensi: 100% Terikat pada Tenant Sekolah
Pola Adopsi: Bottom-Up B2C                          Pola Adopsi: Product-Led Growth (PLG) Bottom-Up to B2B
====================================================================================================
```

---

# 3. Paket Produk yang Direkomendasikan: Opsi B (3-Tier Murni Institusi)

Berdasarkan realitas domain model akademik sekolah, efisiensi otorisasi, dan kondisi pasar pembiayaan pendidikan di Indonesia, **model yang paling solid, aman, dan menguntungkan secara bisnis adalah OPSI B (Model 3-Tier Institusi)** dengan pola adopsi *Product-Led Growth* (Guru sebagai inisiator gratis $\rightarrow$ Sekolah sebagai pembeli resmi).

### Mengapa Opsi B Lebih Unggul?
1. **Selaras dengan Regulasi BOS:** Sekolah di Indonesia memiliki pos anggaran resmi untuk digitalisasi pembelajaran dan e-Rapor melalui Dana BOS Reguler (Permendikbudristek). Membebankan biaya Rp 15.000/bln kepada guru honorer/pribadi sering menimbulkan penolakan moral dan churn rate yang sangat tinggi.
2. **Menghilangkan Split-Brain Arsitektur:** Entitlement mutasi hanya perlu mengevaluasi 1 entitas: `LanggananTenant`. Tidak ada dualitas logika yang rumit antara lisensi pengguna dan lisensi sekolah.
3. **Data Ownership yang Sah:** Di dunia pendidikan formal, data siswa, penempatan rombel, presensi, dan nilai rapor adalah **hak milik institusi sekolah**, bukan aset portabel milik guru perorangan.

---

# 4. Matriks Paket Produk, Hak Akses, Fitur, dan Batasan (Model Rekomendasi)

```text
+---------------------------------------------------------------------------------------------------+
|                                  MATRIKS PAKET RUANG PINTAR                                       |
+-------------------+-------------------------------+-----------------------+-----------------------+
| Parameter         | TIER 1: FREEMIUM              | TIER 2: SCHOOL PRO    | TIER 3: ENTERPRISE    |
|                   | (Free Starter Workspace)      | (Institusi Sekolah)   | (Yayasan / Konsorsium)|
+-------------------+-------------------------------+-----------------------+-----------------------+
| Target Pembeli    | Guru Inisiator / Sekolah Coba | Kepala Sekolah & BOS  | Pengurus Yayasan/Dinas|
| Model Pembayaran  | Gratis Selamanya / 30 Hari    | Kontrak Tahunan BOS   | Kontrak Custom Annual |
| Estimasi Harga    | Rp 0                          | Rp 2.5jt - Rp 7.5jt/th| Custom (Tiered)       |
| Unit Lisensi      | 1 Tenant Sekolah              | 1 Tenant Sekolah      | Multi-Tenant Konsorsium|
+-------------------+-------------------------------+-----------------------+-----------------------+
```

### 4.1. TIER 1: FREEMIUM (Starter School Workspace)
* **Sasaran:** Guru inisiator atau operator yang ingin mendigitalkan kelasnya sendiri tanpa birokrasi persetujuan kepala sekolah di awal.
* **Hak Akses:**
  * Role `TEACHER` di sekolah tersebut memiliki hak mutasi penuh pada kelas yang diampunya.
  * Role `SCHOOL_STAFF` dapat mengelola master data rombel dan siswa terbatas.
* **Fitur yang Terbuka:**
  * **Teacher Cockpit:** Jadwal mengajar harian, timeline sesi KBM, dan widget sesi terdekat.
  * **Classroom-First Hub:** 9 sub-tab KBM terpadu (Presensi Sesi Kelas, Jurnal Harian, Materi Ajar, Penugasan Siswa, Ledger Nilai Guru).
  * **CBT Dasar:** Pembuatan bank soal mandiri, pelaksanaan kuis online dengan timer dan auto-scoring.
  * **Surat Usulan Kepala Sekolah:** Generator cetak otomatis PDF proposal lisensi resmi untuk diajukan ke Kepala Sekolah/Bendahara BOS.
* **Batasan Paket (Quota & Feature Gates):**
  * Maksimal 3 Rombongan Belajar (Rombel).
  * Maksimal 120 Siswa terdaftar.
  * Fitur e-Rapor resmi Kurikulum Merdeka Kemdikbud **Terkunci** (hanya preview leger nilai guru).
  * Portal Wali Murid (*Guardian*) & Portal Siswa **Terkunci**.
  * Full AI Assessment Suite (koreksi LJK kamera HP) **Terkunci**.

### 4.2. TIER 2: SCHOOL PRO (Institusi Sekolah Penuh — BOS Ready)
* **Sasaran:** Institusi formal (SD/SMP/SMA/SMK Negeri maupun Swasta).
* **Hak Akses:**
  * Seluruh civitas akademika (Kepala Sekolah, Wakasek Kurikulum, Operator, Seluruh Guru, Siswa, dan Wali Murid) otomatis memperoleh hak akses penuh.
* **Fitur yang Terbuka (Seluruh Fitur Freemium ditambah):**
  * **Tanpa Batas Kuota:** Rombel dan siswa tanpa batas (*unlimited*).
  * **e-Rapor Kurikulum Merdeka Terpadu:**
    * Leger nilai otomatis gabungan seluruh guru pengampu mapel.
    * Cetak dokumen lembar rapor resmi format standar Kemdikbud A4 siap tanda tangan digital/fisik.
  * **Portal Wali Murid & Siswa:**
    * Transparansi presensi real-time (notifikasi kehadiran).
    * Pantauan capaian belajar dan rekap nilai anak dari rumah.
  * **FULL AI ASSESSMENT SUITE (Pusat Penilaian Cerdas):**
    * Assembling naskah ujian Paket A dan Paket B seimbang berbasis AI.
    * Lembar Jawab Komputer (LJK) dinamis di atas kertas HVS fotokopi biasa 70-80 gsm (meniadakan biaya scanner OMR ratusan juta).
    * Scan koreksi LJK menggunakan kamera smartphone guru (puluhan lembar dalam hitungan detik).
    * Analisis butir soal akreditasi (Daya Pembeda, Tingkat Kesukaran, Efektivitas Distraktor).
  * **Manajemen Master Rombel & Plotting Jadwal Otomatis.**
  * **Dukungan Pengadaan Resmi:** Dokumen Invoice resmi, Faktur Pajak, Kuitansi BOS, BAST, dan integrasi SIPLah.

### 4.3. TIER 3: ENTERPRISE (Yayasan Pendidikan & Cabang Dinas)
* **Sasaran:** Yayasan pengelola sekolah swasta (3 s.d. 50 unit sekolah) atau Cabang Dinas Pendidikan.
* **Hak Akses & Fitur:**
  * Seluruh fitur School Pro pada setiap unit sekolah di bawah naungan yayasan.
  * **Executive Dashboard Yayasan:** Agregat analitik mutu akademik, kehadiran guru/siswa lintas sekolah, dan perbandingan performa antar unit.
  * **Master Identity Single Sign-On (SSO):** Guru yang mengajar di beberapa sekolah dalam satu yayasan cukup menggunakan satu akun login.
  * **Dedicated Account Manager & Custom SLA 99.9%.**

---

# 5. Analisis Risiko Mendalam: Mengapa "Teacher Pro Individual" Sangat Berisiko?

Jika Ruang Pintar tetap memaksakan menjual paket **Teacher Pro Individual (Rp 15.000/bulan)** di samping paket sekolah, platform akan menghadapi 4 risiko kritis:

### 5.1. Risiko Arsitektural: Split-Brain & Dual Ownership
* **Skenario Kritis:** Sekolah A berstatus `READ_ONLY` karena masa trial habis. Di sekolah tersebut, Pak Guru Budi membayar Rp 15.000/bln untuk Teacher Pro.
* **Pertanyaan Hak Cipta & Kepemilikan Data:**
  - Jika Pak Budi menginput nilai dan presensi siswa kelas X TO 3, apakah data tersebut milik Pak Budi atau milik Sekolah A?
  - Ketika masa kontrak kerja Pak Budi habis atau beliau dimutasi, apakah data kelas X TO 3 dihapus bersama akun Budi atau ditinggalkan di sekolah?
  - Jika Kepala Sekolah A membuka dashboard dan status sekolahnya `READ_ONLY`, kepala sekolah tidak bisa mencetak rekap nilai kelas X TO 3 yang diinput Budi! Ini merusak keutuhan operasional sekolah.

### 5.2. Risiko Otorisasi: Kerentanan Celah Keamanan (*Security Attack Surface*)
* Server Action dan authorization guard harus membagi logika mutasi:
  - *Bolehkah Budi mengedit rombel?* (Tidak boleh, itu domain sekolah).
  - *Bolehkah Budi menambah murid baru?* (Abu-abu: jika murid belum ada di sekolah, apakah Budi boleh menambahkannya?).
  - *Bolehkah Budi mengubah jadwal?* (Tidak boleh, jadwal adalah wewenang kurikulum).
* Pengecekan izin bersyarat (*conditional permission*) berbasis lisensi personal di dalam konteks tenant multi-tenant yang terkunci membuka peluang celah bypass otorisasi (*privilege escalation* atau *cross-tenant data leakage*).

### 5.3. Risiko Unit Economics & Keberlanjutan Finansial (Negatif ROI)
* Harga Rp 15.000 / bulan ($0.95 USD):
  - Terpotong biaya payment gateway QRIS (0.7%) + PPN (11%) + biaya transfer bank penarikan saldo (Rp 3.000–5.000).
  - Net revenue per guru: hanya sekitar **Rp 9.000 – Rp 11.000 per transaksi**.
  - Beban Customer Service (CS), server compute Vision AI, dan keluhan pembayaran dari ribuan guru individu eceran akan menelan biaya operasional yang jauh lebih besar daripada pendapatan yang diterima (*Negative Unit Economics*).
* Bandingkan dengan School Pro:
  - 1 transaksi sekolah = Rp 4.500.000 / tahun.
  - Membayar langsung seluruh operasional 30 guru di sekolah tersebut dengan ARPU tinggi, kontrak tahunan yang pasti (*predictable ARR*), dan tingkat retensi institusional yang kokoh (*low churn*).

### 5.4. Resistensi Psikologis & Moral Pasar
* Di lapangan, guru honorer di Indonesia seringkali merasa terbebani jika aplikasi sekolah meminta mereka membayar dari kantong pribadi.
* Model B2B Institusi justru memposisikan Ruang Pintar sebagai pahlawan bagi guru: *"Aplikasi ini gratis untuk Anda gunakan, dan biaya lisensi dibayarkan oleh sekolah dari Dana BOS."*

---

# 6. Dampak Terhadap Arsitektur Otorisasi & SaaS Multi-Tenant

### 6.1. Jika Menggunakan Opsi B (Rekomendasi — 3-Tier Institusi):
```text
[User Request]
       │
       ▼
[requireAuth()] ───────────────► Identitas & Sesi Terverifikasi
       │
       ▼
[requirePermission()] ──────────► AccessControlEngine: Role, Assignment, Scope (Classroom/School)
       │
       ▼
[Tenant Mutation Gate] ────────► requireTenantMutationEntitlement(user.sekolah_id, permission)
                                  │
                                  ├──► LanggananTenant = "ACTIVE" / "TRIAL_ACTIVE" ──► ALLOW
                                  └──► LanggananTenant = "READ_ONLY" ───────────────► DENY (TenantReadOnly)
```
* **Keuntungan Arsitektural:**
  1. **100% Deterministik:** Pintu otorisasi mutasi hanya mengecek status langganan sekolah (`LanggananTenant`).
  2. **Tanpa Refaktor Kompleks:** Tidak perlu merombak `authz-guard.ts` untuk mendukung dual-check lisensi pengguna.
  3. **Zero Data Leakage:** Batas isolasi multi-tenant tetap kaku dan aman di level `sekolah_id`.
  4. **Prinsip Single Source of Truth:** `LanggananTenant` adalah satu-satunya otoritas penentu izin mutasi.

### 6.2. Jika Memaksakan Opsi A (4-Tier dengan Teacher Pro):
* Wajib membangun `UnifiedEntitlementResolver` yang kompleks.
* Wajib memperbarui ribuan baris kode guard dan Server Actions untuk memeriksa: *Apakah resource yang dimutasi adalah resource pribadi guru atau resource sekolah?*
* Wajib menangani anomali saat sekolah expired tetapi guru ingin mengekspor data yang melibatkan entitas sekolah lain.

---

# 7. Posisi Akun Demo (`guru_chandra` & Pak Eri Chandra) dalam Model Rekomendasi

Dalam model Opsi B (3-Tier Institusi), bagaimana kebutuhan demonstrasi dan pengujian untuk akun **Pak Eri Chandra A, S.Kom (`guru_chandra`)** diakomodasi?

Sangat elegan dan alami:
1. **SMK OTOMINDO** adalah institusi sekolah tempat Pak Eri Chandra bernaung sebagai Owner dan Guru KKA.
2. Entitas `LanggananTenant` pada SMK OTOMINDO disetel ke status **`ACTIVE`** dengan paket **`SCHOOL_PRO (Development Sandbox)`** atau **`TRIAL_ACTIVE`** dengan masa berlaku jangka panjang.
3. Dengan demikian:
   - Akun `guru_chandra` otomatis memperoleh akses **Guru Pro secara penuh dan sah** melalui lisensi institusi sekolahnya.
   - Tidak ada transaksi pembayaran Midtrans palsu yang dibuat.
   - Tidak ada modifikasi kotor pada authorization guard.
   - Pak Eri Chandra dapat mendemonstrasikan seluruh fitur KBM, Presensi, CBT, dan Penilaian secara realistis persis seperti kondisi guru di sekolah yang berlangganan penuh.

---

# 8. Rekomendasi Final & Keputusan Produk

| Dimensi Evaluasi | Pilihan Keputusan | Rekomendasi Resmi |
| --- | :---: | --- |
| **Model Packaging SaaS** | Opsi B (3-Tier) | **Adopsi Model 3-Tier: `Freemium` $\rightarrow$ `School Pro` $\rightarrow$ `Enterprise`** |
| **Status Teacher Pro Individual** | Disetop / Dilebur | **Hentikan penjualan retail Teacher Pro individu (Rp 15rb/bln). Alihkan seluruh kapabilitas Pro ke dalam paket `School Pro` (B2B Institusi BOS).** |
| **Jalur Adopsi Guru Mandiri** | Product-Led Growth | **Guru mandiri dapat memulai secara 100% GRATIS di tier Freemium, lalu menggunakan fitur "Cetak Proposal BOS" untuk mengusulkan upgrade institusi ke Kepala Sekolah.** |
| **Arsitektur Entitlement** | Tenant-Authoritative | **Pertahankan `LanggananTenant` sebagai satu-satunya penentu mutation entitlement. Hapus konsep split-brain lisensi di level pengguna.** |
| **Solusi Akun Demo `guru_chandra`** | School Pro Sandbox | **Aktifkan lisensi `School Pro (Sandbox)` pada tenant SMK OTOMINDO tanpa membuat transaksi palsu.** |

---

Dokumen audit ini siap diajukan untuk tinjauan dan persetujuan Human.

READY FOR HUMAN REVIEW

STOP.
