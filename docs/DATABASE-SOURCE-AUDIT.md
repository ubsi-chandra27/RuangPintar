# DATABASE SOURCE AUDIT
## Ruang Pintar — Audit Sumber Data & Kontaminasi Database Pengujian

| Metadata | Nilai |
| --- | --- |
| **Proyek** | Ruang Pintar — School Digital Operating Platform |
| **Fase** | STAGE 10.6 — DATABASE REALITY CLEANUP & ENVIRONMENT SEPARATION |
| **Status Dokumen** | `AUDITED — VERIFIED` |
| **Tanggal Audit** | 24 September 2026 |

---

# 1. Lokasi & Pemetaan Berkas Database

Hasil penelusuran struktur direktori dan konfigurasi database membuktikan pemetaan berikut:

| Peran Lingkungan | Path Berkas Database Fisik | Path Konfigurasi (`DATABASE_URL`) | Keterangan & Status |
| --- | --- | --- | --- |
| **Development (Aktif)** | `prisma/data/ruang-pintar.db` | `file:./data/ruang-pintar.db` | Basis data SQLite aktif yang dibaca oleh Next.js dev server (`npm run dev`) dan Dashboard Super Admin. Ukuran berkas: ~25 MB. |
| **Test (Pengujian)** | `prisma/data/ruang-pintar-test.db` | `file:./data/ruang-pintar-test.db` | Basis data SQLite terisolasi yang dialokasikan khusus untuk eksekusi runner Vitest (`npm test`). |
| **Production** | *(Remote Cloud Managed DB / Turso)* | `libsql://...` atau `postgres://...` | Dipersiapkan untuk lingkungan deployment cloud tanpa ketergantungan SQLite lokal. |
| **Cadangan Darurat (Backup)** | `prisma/data/backups/ruang-pintar-before-cleanup-stage10-6.db` | N/A | Salinan fisik utuh yang dibuat pada 24 September 2026 sebelum pembersihan dilakukan. |

> **Catatan Teknis Resolusi Path Prisma:**  
> Pada Prisma ORM dengan provider SQLite, path relatif `./data/ruang-pintar.db` di dalam `DATABASE_URL` di-resolve relatif terhadap lokasi file `prisma/schema.prisma` (yaitu folder `prisma/`). Oleh karena itu, berkas berada di `prisma/data/ruang-pintar.db`.

---

# 2. Siapa yang Membuat Data & Mengapa Terkontaminasi?

Berdasarkan analisis log audit, skrip pengujian, dan metadata record:

1. **Pengujian Integrasi Vitest (`npm test`):**
   * Di dalam repositori terdapat 27 file pengujian integrasi yang secara langsung memanggil mutasi Prisma (`prisma.sekolah.create()`, `prisma.guru.create()`, `prisma.rombel.create()`).
   * Karena sebelumnya tidak ada pemisahan environment di `vitest.config.ts`, setiap kali `npm test` dijalankan (terutama saat TDD dan regression check 101 file test), test-test tersebut menulis langsung ke database development.
2. **Skrip QA Visual Walkthrough:**
   * Skrip seperti `scripts/qa-phase21-visual-walkthrough.mjs`, `qa-phase22`, `qa-phase23`, dan `seed-academic-data.mjs` dijalankan untuk mengambil screenshot otomatis guna kebutuhan laporan visual fase-fase sebelumnya. Skrip-skrip ini meng-insert ribuan entitas sekolah dummy berulang-ulang tanpa melakukan cleanup setelahnya.

---

# 3. Rincian Test yang Mengotori Database

Berikut adalah pemetaan test suite utama yang menghasilkan ribuan data dummy:

| Berkas Pengujian / Skrip | Entitas yang Dibuat | Pola Nama Data Dummy | Jumlah Akumulasi |
| --- | --- | --- | :---: |
| `src/test/ai-assistant/smart-onboarding-service.test.ts`<br>`scripts/qa-phase21-visual-walkthrough.mjs` | Sekolah, Guru, Rombel, Siswa | `SMA Negeri 1 Nusantara`<br>`Ahmad Fauzi, S.Pd`<br>`X MIPA 1` | 130 Sekolah<br>15 Guru<br>15 Rombel |
| `src/test/academic/*.test.ts`<br>`scripts/seed-academic-data.mjs` | Sekolah, Rombel, Tingkat | `SMK Negeri 1 Uji Coba`<br>`X RPL 1`, `X RPL 2` | 130 Sekolah<br>267 Rombel |
| `src/test/assessment/*.test.ts`<br>`src/test/cbt/*.test.ts` | Sekolah, Bank Soal, Ujian | `SMA Negeri 3 Unggulan` | 78 Sekolah |
| `src/test/school/*.test.ts` | Sekolah, Unit Organisasi, Jabatan | `SMK Negeri 2 Teknologi` | 65 Sekolah |
| `src/test/billing/*.test.ts` | Sekolah, Langganan | `SMA Uji Coba Billing` | 26 Sekolah |
| `scripts/verify-*.mjs` & Benchmark Tests | Sekolah, Rombel dummy | `SMK Negeri 01M...`, `SMK Bina 01M...`, `Foreign School`, `Sekolah Lain` | ~800+ Sekolah |

---

# 4. Risiko Cleanup & Rencana Mitigasi

| Potensi Risiko | Tingkat Risiko | Dampak Jika Salah Eksekusi | Langkah Pencegahan / Mitigasi |
| --- | :---: | --- | --- |
| **Terhapusnya data riil SMK OTOMINDO** | **KRITIS** | Data guru_chandra dan 36 siswa kelas X TO 3 hilang. | **Whitelist Eksplisit:** ID SMK OTOMINDO (`01M2XXYD227F9S3H985FH53GMF`) dan ID Pengguna `guru_chandra` dimasukkan ke dalam daftar *IMMUTABLE EXCLUSION* di mana kueri delete dilarang menyentuh ID ini. |
| **Pelanggaran Foreign Key (FK Restrict)** | **TINGGI** | Kueri SQL gagal karena ada tabel anak (child records) yang masih merujuk ke sekolah dummy. | **Pembersihan Berjenjang (Cascade Order):** Hapus dari level paling bawah (Presensi, Nilai, Penempatan Rombel $\rightarrow$ Sesi, Tugas, Materi, CBT $\rightarrow$ Rombel, Mapel, Guru, Siswa $\rightarrow$ Keanggotaan, Langganan $\rightarrow$ Sekolah). |
| **Terhapusnya Akun Super Administrator** | **KRITIS** | Pengguna tidak bisa login lagi ke Dashboard Super Admin. | Akun `superadmin` (`01M2X9VHY431VPRAMTFJRPNHQZ`) di-protect secara permanen. |
| **Kerusakan Integritas Basis Data** | **MEDIUM** | SQLite database corrupt. | Telah dibuat **Cold Backup** fisik di `prisma/data/backups/ruang-pintar-before-cleanup-stage10-6.db`. |

---

Audit sumber data selesai. Seluruh sumber kontaminasi dan mitigasi risiko telah dipetakan secara akurat.
