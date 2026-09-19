# PHASE 23 — SAAS MONETIZATION & GO-TO-MARKET: MIDTRANS QRIS CHECKOUT, SUBSCRIPTION WEBHOOK & MARKETING KIT
## Ruang Pintar — School Digital Operating Platform

**Versi:** 1.0  
**Status:** READY FOR HUMAN REVIEW  
**Tanggal:** 18 September 2026  
**Penyusun:** Antigravity AI Coding Agent  
**Modul Induk:** SaaS Monetization, Payment Gateway & Marketing Kit (M23)  
**Dokumen Referensi:**
- `AGENTS.md` (Domain Invariants & UI Reference = Contract)
- `docs/03-MODULE-MAP.md` (M21 AI Assistance & Smart Onboarding)
- `docs/04-ROLE-ACCESS.md` (Self-Service Registration & Freemium Role Scopes)
- `docs/05-SYSTEM-ARCHITECTURE.md` (SaaS Multi-School Architecture & Session Telemetry)
- `docs/BRD.md`, `docs/PRD.md`, `docs/FRD.md`

---

# 1. Ringkasan Eksekutif

Phase 23 merealisasikan dua instrumen strategis utama untuk membawa **Ruang Pintar** ke pasar komersial nyata:
1. **Otomasi Pembayaran QRIS Berlangganan (Midtrans Payment Gateway)**: Memungkinkan monetisasi mandiri berulang (*recurring SaaS revenue*) dari guru aktif dengan biaya Rp 15.000/bulan via QRIS instan.
2. **Perangkat Pemasaran & Panduan Guru (Marketing Kit & User Guide)**: Menyediakan panduan operasional kilat 1 halaman siap cetak bagi guru baru, serta 3 variasi template pesan siaran WhatsApp persuasif (*1-Click Copy*) untuk memicu viralitas adopsi di komunitas guru.

### Invariant & Desain Kunci Phase 23:
1. **`Pay-per-Transaction Zero-Cost Admin Guard`**:
   - Skema Midtrans tidak membebankan biaya setup maupun sewa bulanan (Rp 0).
   - Transaksi menggunakan standar QRIS Bank Indonesia dengan potongan MDR hanya 0,7% (~Rp 105 untuk transaksi Rp 15.000), diserap oleh platform demi kenyamanan harga bulat pengguna.
2. **`Dual-Mode Resilient Gateway (Production API & Interactive Simulator)`**:
   - Sistem dilengkapi adapter Snap yang mendeteksi `MIDTRANS_SERVER_KEY`. Jika kunci resmi telah dipasang di `.env`, sistem langsung menghubungkan ke API Midtrans (Sandbox/Production).
   - Jika kunci belum dipasang (tahap demonstrasi/QA lokal), sistem mengaktifkan *Interactive Simulator* dengan barcode QRIS dinamis dan tombol pengujian langsung (`⚡ Simulasi Bayar QRIS Sukses`) tanpa perlu keluar biaya uji coba.
3. **`Idempotent Signature-Protected Webhook (`/api/billing/midtrans-webhook`)`**:
   - Setiap sinyal pembayaran diverifikasi menggunakan hashing kriptografi SHA-512 (`order_id + status_code + gross_amount + ServerKey`).
   - Transaksi diproses secara atomic: memperbarui status pesanan menjadi `PAID`, menaikkan tipe lisensi pengguna ke `PRO`, dan memperpanjang masa aktif 30 hari ke depan.
4. **`1-Click Copy Multi-Persona Copywriting`**:
   - Disiapkan 3 sudut pandang pesan siaran WhatsApp yang teruji psikologinya:
     - **Variasi 1 (Rekan Guru Pribadi)**: Solusi atas beban lelah rekap manual akhir semester.
     - **Variasi 2 (Komunitas MGMP / Forum Guru)**: Inovasi teknologi pendidikan Kurikulum Merdeka karya anak bangsa.
     - **Variasi 3 (Kepala Sekolah & Bendahara BOS)**: Legalitas Juknis BOS & efisiensi biaya satu sekolah.

---

# 2. Files Created & Modified

### New Components & Services:
1. `prisma/migrations/20260918200000_add_subscription_billing_m23/migration.sql`:
   - DDL database untuk tabel `transaksi_langganan`.
2. `scripts/apply-m23-migration.mjs`:
   - Script migrasi basis data SQLite tanpa downtime.
3. `src/modules/billing/domain/billing-types.ts`:
   - Definisi tipe data langganan, DTO pesanan, status pembayaran, dan payload notifikasi Midtrans.
4. `src/modules/billing/infrastructure/midtrans-service.ts`:
   - Adapter klien Midtrans Snap dengan dukungan dual-mode (API resmi & simulator QRIS).
5. `src/modules/billing/application/subscription-service.ts`:
   - Core application service untuk pembuatan pesanan, verifikasi signature webhook, dan perpanjangan lisensi Guru Pro.
6. `src/app/actions/billing-actions.ts`:
   - Server Actions Next.js (`initiateProCheckoutAction`, `checkOrderStatusAction`, `simulatePaymentSuccessAction`).
7. `src/app/api/billing/midtrans-webhook/route.ts`:
   - Endpoint HTTP POST publik untuk menerima webhook status pembayaran dari Midtrans.
8. `src/modules/billing/presentation/subscription-checkout-modal.tsx`:
   - Modal dialog checkout QRIS interaktif dengan barcode dinamis, polling status 3 detik, dan mode simulasi pengujian.
9. `src/modules/billing/presentation/pro-checkout-button.tsx`:
   - Komponen client button pemicu modal checkout atau pengarah registrasi.
10. `src/modules/marketing/presentation/marketing-kit-view.tsx`:
    - Komponen tampilan panduan kilat 1 halaman siap cetak dan template siaran WhatsApp dengan tombol 1-Click Copy.
11. `src/app/panduan/page.tsx`:
    - Halaman publik baru `/panduan` (Buku Panduan & Marketing Kit).
12. `scripts/qa-phase23-visual-walkthrough.mjs`:
    - Script Playwright otomatis untuk pengujian alur checkout QRIS dan pengambilan artefak visual.

### Unit Tests Created:
13. `src/test/billing/midtrans-service.test.ts`: Pengujian dual-mode dan validasi SHA-512 signature.
14. `src/test/billing/subscription-service.test.ts`: Pengujian pembuatan pesanan, mutasi status PAID, dan perpanjangan masa aktif pengguna.
15. `src/test/billing/subscription-checkout-modal.test.tsx`: Pengujian rendering modal QRIS dan tombol simulasi.
16. `src/test/marketing/marketing-kit-view.test.tsx`: Pengujian rendering panduan cepat dan tab template siaran.

### Modified Files:
17. `prisma/schema.prisma`: Penambahan relasi dan model `TransaksiLangganan`.
18. `src/app/page.tsx`: Integrasi `ProCheckoutButton` pada kartu Guru Pro dan penambahan link `/panduan` pada navigasi & footer.
19. `src/modules/ai-assistant/presentation/trial-banner.tsx`: Penambahan tombol "Upgrade Guru Pro" dan modal QRIS pada dashboard guru.
20. `TASKS.md` & `MEMORY.md`: Pembaruan status Phase 23.

---

# 3. Quality Gates Verification

| Quality Gate | Hasil | Catatan |
|---|---|---|
| **TypeScript Typecheck** (`npm run typecheck`) | **PASS (0 errors)** | Bebas error tipe di seluruh proyek. |
| **Linting** (`npm run lint`) | **PASS (0 errors, 0 warnings)** | Sesuai aturan ESLint proyek. |
| **Code Formatting** (`prettier`) | **PASS** | Seluruh file baru diformat sesuai standar proyek. |
| **Targeted Unit Tests** | **PASS (12/12)** | `midtrans-service.test.ts` (2/2), `subscription-service.test.ts` (2/2), `subscription-checkout-modal.test.tsx` (3/3), `marketing-kit-view.test.tsx` (2/2), `smoke.test.tsx` (3/3). |
| **Production Build** (`npm run build`) | **PASS** | Next.js 16.3.3 Turbopack berhasil mengompilasi 28 route (termasuk `/panduan` dan `/api/billing/midtrans-webhook`). |
| **Visual QA Walkthrough** | **PASS (5/5)** | 5 tangkapan layar tersimpan pada direktori `docs/phases/screenshots/phase-23-walkthrough/`. |

---

# 4. Bukti Visual QA (Screenshots)

1. **`01-landing-page-guru-pro-cta.png`**:
   - Kartu paket Guru Pro pada Landing Page dengan tombol interaktif "Mulai dengan Guru Pro" dan link baru "Panduan & Promosi" di navbar.
2. **`02-subscription-qris-checkout-modal.png`**:
   - Modal checkout menampilkan Barcode QRIS Standar Nasional, logo e-wallet/bank (BCA, Mandiri, BRI, BNI, GoPay, Dana, OVO, ShopeePay), Order ID unik, dan nominal Rp 15.000.
3. **`03-subscription-payment-success.png`**:
   - Transisi otomatis ke layar sukses hijau: "Pembayaran Berhasil Diterima! 🎉" dan status "✨ GURU PRO AKTIF".
4. **`04-panduan-quick-start-guide.png`**:
   - Halaman `/panduan` Tab 1: Format ringkas 1 halaman Panduan Operasional Kilat Guru 4 langkah siap cetak/simpan PDF.
5. **`05-panduan-whatsapp-broadcast-templates.png`**:
   - Halaman `/panduan` Tab 2: Tiga variasi template siaran WhatsApp dengan tombol "Salin Pesan (1-Click Copy)".

---

# 5. Status & Rekomendasi

Phase 23 telah tuntas secara menyeluruh dengan kapabilitas pembayaran QRIS otomatis dan perangkat pemasaran lengkap.

**STATUS: READY FOR HUMAN REVIEW**
