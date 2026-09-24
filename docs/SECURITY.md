# Model Keamanan, Klasifikasi Data, dan Matriks Otorisasi
## Ruang Pintar — School Digital Operating Platform

| Field | Nilai |
| --- | --- |
| **Title / Type** | Security Threat Model & Authorization Matrix |
| **Project / Scope** | Ruang Pintar — Seluruh Lapisan Autentikasi, Otorisasi, dan Isolasi Multi-Tenant |
| **Owner** | Core Security & Platform Engineering Team |
| **Status** | `active` |
| **Last Updated / Version** | 2026-09-24 / v1.0 |
| **Source Responsibility** | Sumber utama model ancaman, klasifikasi sensitivitas data, proteksi isolasi data sekolah (multi-tenant), dan matriks otorisasi server-side |
| **Related Docs** | `docs/04-ROLE-ACCESS.md`, `docs/adr/ADR-001-SAAS-MULTI-TENANT-FOUNDATION.md`, `docs/02-DOMAIN-MODEL.md`, `AGENTS.md` |
| **Reviewer / Approver** | Human Project Owner / Security Lead |

---

## 1. Aset Sistem & Klasifikasi Data

Ruang Pintar mengelola data institusi pendidikan yang sensitif dan memiliki konsekuensi hukum serta privasi. Data diklasifikasikan ke dalam 4 tingkatan sensitivitas:

| Klasifikasi | Definisi & Contoh Data di Ruang Pintar | Kebijakan Proteksi |
| --- | --- | --- |
| **Publik (L1)** | Landing page, informasi umum sekolah, kalender libur nasional, silabus publik. | Read publik, write hanya staf/admin terverifikasi. |
| **Internal Operasional (L2)** | Jadwal pelajaran, daftar rombel, struktur kurikulum, penugasan mengajar, materi umum. | Terbatas pada pengguna terotentikasi dalam tenant sekolah terkait. |
| **Sensitif / PII (L3)** | Data pribadi siswa/guru (NIK, NISN, nomor telepon, alamat), presensi kelas, rekam pantauan wali kelas, catatan pelanggaran/pembinaan. | Enkripsi transit, otorisasi berbasis peran ketat (*need-to-know*), pembatasan akses hanya guru/wali/siswa terkait. |
| **Kritis / Rahasia (L4)** | Hash password pengguna (`bcrypt`), secret environment (`AUTH_SECRET`, `MIDTRANS_SERVER_KEY`), kunci enkripsi sesi, lembar ujian CBT aktif, dan kunci jawaban. | Dilarang tampil di client/log, evaluasi server-side penuh, tidak pernah di-commit ke repositori. |

---

## 2. Aktor, Peran & Batas Kepercayaan (*Trust Boundaries*)

Sistem menetapkan 4 batas kepercayaan (*Trust Boundaries*) yang tegas:

```text
[ Browser Client (Untrusted) ]
          │  HTTPS / Cookie Sesi (HTTP-Only)
          ▼
[ Boundary 1: Next.js Middleware & Route Handlers ]
          │  Tenant Context & Auth Token Verification
          ▼
[ Boundary 2: Application Services & Server Actions (Trusted Core) ]
          │  Permission Resolution & Active Tenant Membership Check
          ▼
[ Boundary 3: Multi-Tenant Data Layer & Prisma Engine ]
          │  Tenant-Scoped SQLite Queries (WHERE sekolah_id = active_tenant_id)
          ▼
[ Boundary 4: Persistent Database (SQLite Storage) ]
```

### Karakteristik Aktor:
- **SUPER_ADMIN:** Mengelola tenant sekolah, lisensi paket, dan administrasi global platform.
- **SCHOOL_STAFF:** Mengelola master data sekolah, akun guru/siswa, dan penugasan akademik sekolahnya sendiri.
- **TEACHER:** Mengajar sesi kelas, menginput absensi sesi, mengelola tugas, bank soal CBT, dan penilaian mata pelajarannya.
- **HOMEROOM_TEACHER (Wali Kelas):** Konteks tambahan guru untuk memantau kehadiran harian, rapor, dan monitoring pembinaan satu rombel.
- **STUDENT:** Mengikuti ujian CBT, menyerahkan tugas, melihat jadwal dan nilai diri sendiri.
- **GUARDIAN:** Memantau rekap absensi, pengumuman, dan rapor anak yang terhubung sah secara relasi.

---

## 3. Model Ancaman (*STRIDE Analysis*) & Mitigasi

| Kategori Ancaman | Deskripsi Skenario Risiko di Ruang Pintar | Mitigasi Konkret yang Diterapkan |
| --- | --- | --- |
| **Spoofing (Pemalsuan)** | Penyerang mencoba memalsukan token sesi atau berpura-pura menjadi guru/admin. | Cookie sesi `HTTP-only`, `SameSite=Lax`, token ditandatangani secara kriptografis, verifikasi keabsahan sesi langsung ke tabel `SesiPengguna` di database. |
| **Tampering (Manipulasi Data)** | Siswa memanipulasi nilai ujian CBT di client atau mengubah batas waktu ujian. | **Server-Authoritative:** Waktu mulai, durasi sisa, dan penilaian CBT dihitung murni di server. Jawaban disimpan dengan timestamp server. Client timer hanya cermin visual. |
| **Repudiation (Penyangkalan)** | Guru menyangkal telah mengubah nilai rapor atau staf menghapus data siswa. | Seluruh mutasi kritis (penilaian, presensi, keanggotaan) memiliki kolom audit trail: `dibuat_pada`, `diperbarui_pada`, dan pencatatan aktor pelaksana di log sistem. |
| **Information Disclosure (Kebocoran Lintas Tenant)** | Pengguna dari Sekolah A membaca atau memodifikasi data akademik Sekolah B (*Cross-Tenant Data Leak*). | **Tenant-Scoped Authorization:** Setiap query wajib memvalidasi `sekolah_aktif_id` pada session context. Repository layer memfilter data dengan `sekolah_id = active_tenant_id`. |
| **Denial of Service (DoS)** | Request masif pada endpoint ujian CBT atau flooding unggah file tugas. | Rate limiting request, batas ukuran payload input (maks 5MB untuk dokumen), dan penanganan query efisien berindeks ULID. |
| **Elevation of Privilege (Eskalasi Hak)** | Pengguna mengubah payload JSON untuk menyuntikkan peran `SUPER_ADMIN` atau mengganti `sekolah_id` secara ilegal. | **Default Deny:** Hak akses tidak dibaca dari payload kiriman client, melainkan di-resolve ulang di server melalui relasi `KeanggotaanSekolah` pengguna. |

---

## 4. Kontrol Autentikasi, Sesi & Isolasi Multi-Tenant

Sesuai dengan keputusan arsitektur **ADR-001, ADR-002, dan ADR-003**:

1. **Model Hubungan Pengguna-Tenant:**
   - Satu pengguna dapat memiliki akun di beberapa sekolah melalui entitas many-to-many `KeanggotaanSekolah`.
   - Peran (`peran`) melekat pada keanggotaan sekolah, bukan peran statis global pada akun pengguna (kecuali `SUPER_ADMIN`).
2. **Konteks Tenant Aktif (*Active Tenant Context*):**
   - Sesi menyimpan pointer `sekolah_aktif_id`.
   - Perpindahan tenant wajib melalui Server Action resmi `switchActiveTenantAction` yang memvalidasi bahwa membership pengguna pada tenant target berstatus `ACTIVE`.
3. **Penegakan Hak Akses Langganan (*Tenant Entitlement*):**
   - `TenantEntitlementService` mengevaluasi status paket lisensi sekolah secara runtime (`TRIAL_ACTIVE`, `ACTIVE`, `READ_ONLY`, `EXPIRED`).
   - Apabila lisensi berakhir atau dalam status `READ_ONLY`, seluruh mutasi data (CREATE, UPDATE, DELETE) pada modul akademik diblokir secara terpusat oleh server, namun data historis tetap aman dapat dibaca.

---

## 5. Matriks Otorisasi (*Authorization Matrix*)

| Resource / Modul | SUPER_ADMIN | SCHOOL_STAFF | TEACHER | HOMEROOM_TEACHER | STUDENT | GUARDIAN |
| --- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Pengaturan Tenant & Lisensi** | CRUD Penuh | Read Tenant Sendiri | Denied | Denied | Denied | Denied |
| **Master Sekolah (Rombel, Guru, Siswa)** | Read All | CRUD (Tenant Sendiri) | Read Rombel Sendiri | Read Rombel Sendiri | Read Profil Sendiri | Read Profil Anak |
| **Jadwal & Kalender Akademik** | Read All | CRUD (Tenant Sendiri) | Read Sekolah / Edit Modul Ajar | Read Sekolah | Read Kelas Sendiri | Read Kelas Anak |
| **Presensi Sesi Pembelajaran** | Read All | Audit / View | CRUD (Kelas yang Diajar) | Read Rombel Asuhan | Read Presensi Diri | Read Presensi Anak |
| **Bank Soal & Penjadwalan CBT** | Read All | Audit / View | CRUD (Mata Pelajaran Sendiri) | Read | Kerjakan Saat Jadwal Aktif | Denied |
| **Penilaian & Gradebook** | Read All | View / Cetak Rapor | CRUD (Nilai Mapel Sendiri) | Rekap Rapor Rombel | Read Nilai Diri | Read Nilai Anak |
| **Catatan Pembinaan & Monitoring** | Read All | Read / Rekap | Input Catatan Mapel | CRUD Pembinaan Rombel | Denied | Read Catatan Anak |
| **Pengumuman & Komunikasi** | Broadcast Global | Broadcast Sekolah | Broadcast Kelas | Broadcast Rombel | Read Penerima | Read Penerima |

*Catatan: Aturan akses dievaluasi melalui model hierarki: `Identity → Base Role → Position/Assignment → Permission → Resource Scope → Effective Access`.*

---

## 6. Validasi Input, Pengelolaan Secret & Audit

1. **Validasi Skema:** Setiap input pada Server Action dan API Route divalidasi ketat menggunakan skema validasi tipe untuk mencegah parameter tampering dan script injection.
2. **Zero Plaintext Credentials:** Password di-hash menggunakan algoritma `bcrypt` dengan cost factor terstandar.
3. **Penyimpanan Secret:** Kunci rahasia API, token pembayaran, dan secret authentication hanya dimuat melalui environment variable server (`.env`), tidak pernah bocor ke bundel JavaScript client.
4. **Audit Immutabilitas:** Data migrasi Prisma yang telah diterapkan pada produksi berstatus *immutable*. Skrip migrasi rollback tidak boleh menghapus data historis siswa secara destruktif tanpa backup snapshot.

---

## 7. Residual Risks & Pertanyaan Keamanan Terbuka

- [ ] **MFA / 2FA (TBD):** Autentikasi dua faktor untuk peran kepemimpinan sekolah dan Super Admin direncanakan untuk inisiatif enterprise mendatang.
- [ ] **Rate Limiting Engine:** Saat ini menggunakan rate limiter in-memory; perlu ditingkatkan ke Redis cluster apabila kapasitas multi-sekolah mencapai skala beban tinggi.
- [ ] **Session Invalidation on Password Reset:** Sesi aktif di perangkat lain wajib di-revoke saat ada mutasi perubahan kata sandi (diperiksa dalam regression test auth).
