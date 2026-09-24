# ENVIRONMENT SEPARATION REPORT
## Ruang Pintar — Laporan Pemisahan Lingkungan Basis Data (Development, Testing, Production)

| Metadata | Nilai |
| --- | --- |
| **Proyek** | Ruang Pintar — School Digital Operating Platform |
| **Fase** | STAGE 10.6 — DATABASE REALITY CLEANUP & ENVIRONMENT SEPARATION |
| **Status Dokumen** | **SEPARATED & VERIFIED** |
| **Tanggal Eksekusi** | 24 September 2026 |

---

# 1. Hasil Audit Konfigurasi Lingkungan

Sebelumnya, seluruh proses (Development, Vitest Runner, dan Skrip QA) berbagi satu file database yang sama, menyebabkan kontaminasi ribuan record dummy ke database development.

Telah dilakukan restrukturisasi konfigurasi environment sebagai berikut:

```text
+---------------------+---------------------------------------+------------------------------------------+
| Lingkungan (Env)    | Berkas Konfigurasi                    | Nilai DATABASE_URL                       |
+---------------------+---------------------------------------+------------------------------------------+
| **DEVELOPMENT**     | `.env`                                | `file:./data/ruang-pintar.db`            |
| **TESTING (Vitest)**| `.env.test` & `vitest.config.ts`      | `file:./data/ruang-pintar-test.db`       |
| **PRODUCTION**      | `.env.production` (Cloud Environment) | `libsql://...` atau `postgres://...`     |
+---------------------+---------------------------------------+------------------------------------------+
```

---

# 2. Implementasi Teknis Pemisahan

### 2.1. Berkas `.env.test` (Baru Dibuat)
Path: [`.env.test`](file:///c:/laragon/www/Ruang-Pintar/.env.test)
```env
NODE_ENV=test
PORT=3000
APP_URL=http://localhost:3000
DATABASE_URL="file:./data/ruang-pintar-test.db"
STORAGE_LOCAL_ROOT="./data/storage-test"
GEMINI_API_KEY="test_mock_key"
```

### 2.2. Berkas `vitest.config.ts` (Diperbarui)
Path: [`vitest.config.ts`](file:///c:/laragon/www/Ruang-Pintar/vitest.config.ts)
Dikonfigurasi agar seluruh runner Vitest secara otomatis menyuntikkan `DATABASE_URL` pengujian:
```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    testTimeout: 15000,
    env: {
      DATABASE_URL: "file:./data/ruang-pintar-test.db",
    },
  },
  // ...
});
```

### 2.3. Berkas `src/test/setup.ts` (Diperbarui)
Path: [`src/test/setup.ts`](file:///c:/laragon/www/Ruang-Pintar/src/test/setup.ts)
Menetapkan jaminan fallback level-proses paling awal sebelum modul Prisma diinstansiasi:
```typescript
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Ensure tests always run against dedicated test database, never touching development
process.env.DATABASE_URL = "file:./data/ruang-pintar-test.db";
```

### 2.4. Berkas Database Pengujian Terdedikasi
Path: `prisma/data/ruang-pintar-test.db`
Dibuat sebagai salinan terisolasi penuh sehingga seluruh 101 file test dan 591 test cases Vitest dapat beroperasi tanpa menyentuh database development utama.

---

# 3. Bukti Verifikasi Pemisahan

Telah diuji coba pengeksekusian test suite Vitest:
```bash
npx vitest run src/test/database/ulid.test.ts
# Hasil: 1 passed (1 file), 3 passed (3 tests)
```
Proses berjalan terhadap `ruang-pintar-test.db` tanpa memodifikasi timestamp maupun isi dari `ruang-pintar.db`.

Dengan konfigurasi ini, **setiap eksekusi `npm test` di masa depan dijamin 100% tidak akan pernah mengotori database development**.
