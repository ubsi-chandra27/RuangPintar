# Panduan Deployment & Runbook Operasional
## Ruang Pintar — School Digital Operating Platform

| Field | Nilai |
| --- | --- |
| **Title / Type** | Deployment Guide & Operational Runbook |
| **Project / Scope** | Ruang Pintar — Prosedur Rilis Produksi, Migrasi Data, dan Kontingensi |
| **Owner** | DevOps & Platform Release Team |
| **Status** | `active` |
| **Last Updated / Version** | 2026-09-24 / v1.0 |
| **Source Responsibility** | Menetapkan prasyarat lingkungan, tahapan rilis produksi, gate otorisasi manusia, smoke check, dan prosedur rollback |
| **Related Docs** | `package.json`, `.env.example`, `docs/SECURITY.md`, `docs/TEST_PLAN.md`, `AGENTS.md` |
| **Reviewer / Approver** | Human Project Owner / System Administrator |

---

## 1. Target Lingkungan & Prasyarat Sistem

Ruang Pintar dioptimalkan untuk berjalan dengan arsitektur **Modular Monolith Next.js** dengan penyimpanan **SQLite** terkelola (atau turunan serverless/containerized mount):

- **Runtime:** Node.js v20.x atau v22.x LTS.
- **Package Manager:** `npm` v10+ (atau kompatibel).
- **Database Engine:** SQLite (lokasi file database diatur via variabel `DATABASE_URL`).
- **Prasyarat Konfigurasi `.env`:**
  - `DATABASE_URL`: URI path absolut/relatif ke file SQLite (contoh: `file:./data/ruang_pintar.db`).
  - `AUTH_SECRET`: Kunci rahasia enkripsi token sesi (minimal 32 karakter acak).
  - `NODE_ENV`: Diset ke `production` saat rilis.
  - `MIDTRANS_SERVER_KEY` / `MIDTRANS_CLIENT_KEY`: Kunci integrasi gateway pembayaran (opsional pada mode simulasi).

---

## 2. Deploy Gate & Aturan Otorisasi Eksplisit

> [!CRITICAL]
> **Aturan Fikran Engineering:** Status dokumentasi yang lengkap, passing test suite, atau pesan build sukses **BUKAN izin untuk melakukan deployment**. Deployment ke server produksi **MUTLAK membutuhkan persetujuan dan otorisasi manusia eksplisit** (*Human Explicit Authorization*).

Sebelum deployment diizinkan:
1. Seluruh Quality Gate di `docs/TEST_PLAN.md` wajib berstatus PASS.
2. Snapshot backup database saat ini telah diamankan ke storage terpisah.
3. Jendela waktu rilis (*maintenance window*) telah disepakati untuk meminimalkan dampak pada aktivitas belajar siswa.

---

## 3. Langkah Rilis & Prosedur Deployment Bertahap

Lakukan rilis dengan urutan langkah kanonikal berikut:

```bash
# Langkah 1: Persiapan Repository
git fetch origin
git status # Pastikan working tree bersih

# Langkah 2: Instalasi Dependensi Terkunci
npm ci --prefer-offline

# Langkah 3: Eksekusi Migrasi Database (Prisma Migrate Deploy)
# Perintah ini menerapkan migrasi baru tanpa merusak skema yang sudah ada
npx prisma migrate deploy

# Langkah 4: Validasi Integritas Tipe & Linting
npm run typecheck
npm run lint

# Langkah 5: Kompilasi Binary Produksi Next.js
npm run build

# Langkah 6: Restart Layanan Aplikasi (contoh menggunakan PM2 atau Node service)
# pm2 reload ruang-pintar --update-env
```

---

## 4. Smoke Checks & Monitoring Pasca-Deploy

Setelah layanan berhasil di-restart, lakukan verifikasi cepat (*smoke test*):

1. **Pemeriksaan Responsivitas HTTP:**
   - Akses URL utama `/` dan pastikan mengembalikan status `200 OK`.
2. **Pemeriksaan Autentikasi:**
   - Lakukan uji login pada endpoint `/login` menggunakan akun staf pengujian.
   - Verifikasi bahwa session cookie disematkan dengan flag `HttpOnly`.
3. **Pemeriksaan Isolasi Tenant:**
   - Masuk ke dashboard dan pastikan data sekolah yang ditampilkan sesuai dengan `sekolah_aktif_id` pengguna.
4. **Pemeriksaan Health Log:**
   - Periksa log aplikasi untuk memastikan tidak ada unhandled exception atau kegagalan koneksi SQLite.

---

## 5. Prosedur Rollback & Rencana Kontingensi

### Kondisi Pemicu Rollback (*Rollback Triggers*):
- Layanan aplikasi mengalami crash berulang (*crash loop*) pasca-start.
- Terjadi kegagalan query kritis atau database corruption pada SQLite.
- Ditemukan kebocoran data antar-tenant (*data leakage*) atau kegagalan otorisasi fatal.

### Langkah Eksekusi Rollback:
1. **Hentikan Layanan Sementara:**
   Aktifkan halaman pemeliharaan sementara (*maintenance page*).
2. **Kembalikan Database Snapshot:**
   Salin kembali snapshot file database SQLite yang telah di-backup sebelum rilis dimulai:
   ```bash
   cp /backup/ruang_pintar_pre_deploy.db ./data/ruang_pintar.db
   ```
3. **Kembalikan Versi Build Sebelumnya:**
   Checkout commit rilis stabil sebelumnya atau pulihkan build artifact `.next` sebelumnya.
4. **Restart Layanan & Verifikasi Ulang:**
   Nyalakan kembali aplikasi dan jalankan smoke check untuk memastikan platform kembali stabil.
5. **Dokumentasikan Insiden:**
   Catat penyebab kegagalan dan eskalasikan ke tim pengembang untuk remediasi sebelum jadwal rilis berikutnya.
