# MANIFEST FILE SUMBER (*SOURCE MANIFEST*) — RUANG PINTAR V2

Dokumen ini memuat daftar inventaris seluruh file sumber Ruang Pintar V2 yang berkaitan langsung dengan Halaman Login dan Academic Glass UI Kit, beserta klasifikasi penggunaannya untuk proyek target Ruang Pintar V3.

---

## 1. Klasifikasi Penggunaan (*Adaptation Classification*)

* `DIRECTLY REUSABLE`: File dapat disalin atau digunakan hampir tanpa perubahan struktural.
* `ADAPT`: File perlu disesuaikan dengan struktur routing, arsitektur, atau konvensi baru di V3.
* `REFERENCE ONLY`: File berfungsi sebagai panduan visual, pola kode, atau spesifikasi.
* `DO NOT TRANSFER`: File spesifik V2 (seperti migration lama, mock database, build artifact) yang tidak boleh disalin mentah-mentah.

---

## 2. Inventaris File Sumber

| Path File Sumber (V2) | Fungsi & Tanggung Jawab | Klasifikasi | Catatan Kompatibilitas (V3) |
|---|---|---|---|
| `resources/js/pages/auth/login.tsx` | Komponen halaman form login utama | `ADAPT` | Sesuaikan helper route (`@/routes/login` vs Wayfinder V3) |
| `resources/js/layouts/auth/auth-login-layout.tsx` | Layout split-screen login dengan hero astronaut | `DIRECTLY REUSABLE` | Pastikan path import aset gambar astronaut valid |
| `resources/js/components/password-input.tsx` | Input kata sandi dengan toggle show/hide | `DIRECTLY REUSABLE` | Kompatibel penuh dengan React 19 & Tailwind v4 |
| `resources/js/components/input-error.tsx` | Tampilan inline error pesan validasi | `DIRECTLY REUSABLE` | Kompatibel penuh |
| `resources/js/components/text-link.tsx` | Komponen tautan teks bergaya Academic Glass | `DIRECTLY REUSABLE` | Menggunakan `@inertiajs/react` `Link` |
| `resources/js/components/ui/button.tsx` | 7 varian tombol kanonikal UI Kit | `DIRECTLY REUSABLE` | Bergantung pada `class-variance-authority` & `lucide-react` |
| `resources/js/components/ui/input.tsx` | Komponen text input standar UI Kit | `DIRECTLY REUSABLE` | Kompatibel penuh |
| `resources/js/components/ui/checkbox.tsx` | Komponen checkbox UI Kit | `DIRECTLY REUSABLE` | Membutuhkan `@radix-ui/react-checkbox` |
| `resources/js/components/ui/label.tsx` | Label form aksesibel | `DIRECTLY REUSABLE` | Membutuhkan `@radix-ui/react-label` |
| `resources/js/components/ui/card.tsx` | Primitive container kartu Academic Glass | `DIRECTLY REUSABLE` | Kompatibel penuh |
| `resources/js/components/ui/badge.tsx` | Badge status semantik | `DIRECTLY REUSABLE` | Membutuhkan `class-variance-authority` |
| `resources/js/components/ui/alert.tsx` | Box alert semantik | `DIRECTLY REUSABLE` | Membutuhkan `class-variance-authority` |
| `resources/js/components/ui/dialog.tsx` | Modal dialog primitive | `DIRECTLY REUSABLE` | Membutuhkan `@radix-ui/react-dialog` |
| `resources/js/components/ui/sonner.tsx` | Toast notification wrapper | `DIRECTLY REUSABLE` | Membutuhkan pustaka `sonner` |
| `resources/js/components/ui/select.tsx` | Custom select dropdown | `DIRECTLY REUSABLE` | Membutuhkan `@radix-ui/react-select` |
| `resources/js/components/foundation/responsive-data-table.tsx` | Data table dengan transformasi mobile | `ADAPT` | Gunakan pola transformer ke stacked cards |
| `resources/js/components/foundation/confirmation-dialog.tsx` | Dialog konfirmasi aksi destruktif | `DIRECTLY REUSABLE` | Kompatibel penuh |
| `resources/js/components/layout/academic-shell.tsx` | Master shell layout (topbar & responsive nav) | `ADAPT` | Sesuaikan dengan struktur auth session V3 |
| `resources/css/app.css` | Deklarasi token CSS, tema Tailwind v4 & Glass | `DIRECTLY REUSABLE` | Salin variabel `@theme` & `:root` tokens ke CSS V3 |
| `resources/js/pages/ui-kit.tsx` | Halaman pameran showcase seluruh UI Kit | `REFERENCE ONLY` | Gunakan untuk verifikasi visual fidelity di V3 |
| `docs/design/UI-KIT.md` | Kontrak desain visual otoritatif V2 | `REFERENCE ONLY` | Rujukan kanonikal prinsip desain |
