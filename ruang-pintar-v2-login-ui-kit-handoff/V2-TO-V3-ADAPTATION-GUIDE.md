# PANDUAN ADAPTASI V2 KE RUANG PINTAR V3 (*ADAPTATION GUIDE*)

Dokumen ini memandu tim rekayasa atau AI coding pada proyek **Ruang Pintar V3** dalam memanfaatkan artefak handoff dari Ruang Pintar V2 secara aman dan efisien.

---

## 1. Lingkungan & Stack Target Ruang Pintar V3
* **Backend:** Laravel 13 (PHP 8.4+)
* **Frontend:** React 19, Inertia.js 3, TypeScript
* **Styling:** Tailwind CSS v4 (menggunakan engine `@import 'tailwindcss';` dan directive `@theme`)
* **Build Tool:** Vite

---

## 2. Langkah-Langkah Adaptasi Bertahap

### Langkah 1: Konfigurasi Design Tokens & Global CSS
1. Buka file `resources/css/app.css` pada proyek V3.
2. Salin deklarasi `@theme` dan variabel `:root` dari `DESIGN-TOKENS.md` atau `resources/css/app.css` V2.
3. Pastikan font `Plus Jakarta Sans` dan `Andale Mono` terdaftar dan terpasang dengan benar pada proyek V3.

### Langkah 2: Salin Aset Visual ke Proyek V3
1. Salin `assets/brand/ruang-pintar-mark.png` ke folder `public/brand/ruang-pintar-mark.png` di V3.
2. Salin `assets/auth/login-hero-astronaut.png` ke folder aset gambar V3 (misal: `resources/images/auth/` atau `public/images/auth/`).

### Langkah 3: Porting Komponen Primitif UI Kit
1. Salin komponen UI dasar dari `resources/js/components/ui/` (seperti `button.tsx`, `input.tsx`, `label.tsx`, `checkbox.tsx`, `dialog.tsx`, `card.tsx`, `sonner.tsx`).
2. Pastikan dependensi Radix UI dan Lucide icons terpasang di V3:
   ```bash
   npm install @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-label @radix-ui/react-select lucide-react sonner class-variance-authority clsx tailwind-merge
   ```

### Langkah 4: Rekonstruksi Halaman Login
1. Pasang `AuthLoginLayout` di `resources/js/layouts/auth/auth-login-layout.tsx` di V3.
2. Pasang `Login` page di `resources/js/pages/auth/login.tsx` di V3.
3. Sesuaikan pemanggilan helper rute login (misal Wayfinder `store.form()` atau helper Inertia `route('login')` sesuai konvensi V3).

---

## 3. Matriks Klasifikasi Pemindahan Kode

| File / Komponen | Tindakan Adaptasi | Rincian |
|---|---|---|
| **Aset Visual & Logo** | `DIRECTLY REUSABLE` | Salin langsung file PNG logo dan artwork astronaut. |
| **CSS Tokens (`app.css`)** | `DIRECTLY REUSABLE` | Variabel `@theme`, `:root`, dan `.dark` langsung kompatibel dengan Tailwind v4. |
| **Komponen UI Primitif** | `DIRECTLY REUSABLE` | Button, Input, Checkbox, Dialog, Card kompatibel dengan React 19. |
| **Halaman Login & Layout** | `ADAPT` | Sesuaikan rute impor gambar dan helper action route. |
| **Komponen Domain Lama** | `REFERENCE ONLY` | Jangan menyalin controller atau model lama; buat ulang secara bersih mengikuti domain V3. |
| **Database & Migration V2** | `DO NOT TRANSFER` | V3 memulai skema bersih dari awal sesuai arsitektur barunya. |

---

## 4. Kriteria Keberhasilan Adaptasi (*Success Gates*)
Sebelum menganggap adaptasi login & UI Kit selesai pada V3, pastikan:
1. `npm run types:check` lolos tanpa error TypeScript.
2. `npm run build` sukses tanpa missing asset.
3. Tampilan login identik secara visual pada 4 viewport target: `390×844`, `768×1024`, `1024×768`, dan `1440×900`.
4. Form login dapat menerima input username/password, menampilkan validasi inline, dan merender loading state saat submit.
