# SPESIFIKASI HALAMAN LOGIN — RUANG PINTAR V2

## 1. Ikhtisar & Tujuan Halaman
Halaman Login Ruang Pintar V2 dirancang sebagai pintu gerbang (*entry point*) autentikasi akademik yang modern, terpercaya, dan ramah pengguna. Halaman ini menggunakan tata letak *Split Hero-Artwork Layout* pada desktop dan *Stacked Ambient Layout* pada mobile, memadukan ilustrasi maskot astronaut belajar dengan form login yang berkontras tinggi dan aksesibel.

---

## 2. Struktur Halaman & Tata Letak (*Layout Anatomy*)

### A. Desktop (`>= 1024px`, Target `1440×900` s.d. `1920×1080`):
* **Latar Belakang Canvas:** Latar bersih netral `#F7F7F8` (Dark Mode: `#0B1120`) dengan aksen ambient `radial-gradient(circle at 88% 12%, rgba(14, 165, 233, 0.08), transparent 25%)`.
* **Top Header (Absolute Navigation):**
  * Posisi: `absolute inset-x-0 top-0 z-20`, tinggi `96px` (`h-24`), lebar maksimum container `1440px` (atau `1920px` pada 2XL).
  * Brand Identity: Logo Mark `ruang-pintar-mark.png` (`size-12`, `48×48px`) dengan drop shadow lembut `drop-shadow-[0_6px_14px_rgba(15,23,42,0.1)]`.
  * Brand Text: Teks utama "Ruang Pintar" (`text-[17px] font-bold text-[#1E293B] tracking-[-0.025em]`) dan subteks "Academic Learning Platform" (`text-[11px] font-semibold text-[#475569]`).
* **Main Grid (Split View):**
  * Grid 2 Kolom: Kolom kiri Artwork Hero (`58%` lebar) dan Kolom kanan Login Card Form (`42%` lebar, min-width `420px`).
* **Left Section (Artwork Hero):**
  * Gambar: `login-hero-astronaut.png` (Astronaut Ruang Pintar sedang memegang tablet belajar).
  * Dimensi & Posisi: `h-full w-[122%] object-cover object-[36%_center]`, dilengkapi efek blending `mask-image: linear-gradient(to right, #000 0%, #000 78%, transparent 100%)` agar visual menyatu halus ke arah form.
* **Right Section (Login Card & Form Container):**
  * Posisi: Vertikal tengah (dengan sedikit penyesuaian `-translate-y-6`), lebar form maksimal `470px` (2XL: `500px`).
  * Header Form:
    * Judul Halaman: "Masuk ke Ruang Pintar" (`text-[30px]` sm:`36px` 2xl:`40px`, `font-bold text-[#0F172A] leading-[1.2] tracking-[-0.035em]`).
    * Deskripsi: "Gunakan akun sekolah Anda untuk mengakses pembelajaran, aktivitas akademik, dan informasi sekolah." (`text-sm text-[#475569] leading-6 max-w-[44ch]`).

---

### B. Mobile (`< 768px`, Target `390×844`):
* **Layout Stacking:** Vertikal 2 baris (`grid-rows-[auto_minmax(212px,1fr)]` dengan padding atas `pt-24`).
* **Header:** Header logo tetap berada di atas dengan padding horizontal `px-5`.
* **Urutan Elemen (*Visual Order*):**
  * `order-1`: Form Login berada di bagian atas agar keyboard virtual tidak menutupi input.
  * `order-2`: Artwork Hero Astronaut berada di bagian bawah (`min-h-[212px]`) dengan masking vertikal `mask-image: linear-gradient(to bottom, transparent 0%, #000 22%, #000 100%)`.
* **Form Area:** Padding `px-5 pt-4 pb-3`, lebar 100% mengisi layar mobile secara nyaman tanpa *horizontal overflow*.

---

## 3. Komponen Form Login & Spesifikasi Input

```text
FORM CONTAINER (gap-6)
│
├── Field 1: Username
│   ├── Label: "Username" (htmlFor="username", text-sm font-medium)
│   ├── Input: type="text", size="lg" (h-12 / 48px), placeholder="Masukkan username"
│   └── Error Message: Inline <InputError /> (text-xs text-rose-600)
│
├── Field 2: Kata Sandi
│   ├── Label: "Kata sandi" (htmlFor="password")
│   ├── Input: <PasswordInput /> (h-12 / 48px, toggle show/hide eye icon)
│   └── Error Message: Inline <InputError /> (text-xs text-rose-600)
│
├── Baris Kontrol (Flex Between, min-h-11)
│   ├── Checkbox: "Ingat saya" (id="remember", touch target 44px)
│   └── TextLink: "Lupa kata sandi?" (href="/forgot-password", text-[#2563EB])
│
├── Tombol Masuk (Primary Action Button)
│   ├── Size: Large (h-12 / 48px, w-full, rounded-[12px])
│   ├── Background: Academic Navy #1E293B (Hover: #26364B)
│   ├── Text: "Masuk" (font-semibold text-white)
│   ├── Shadow: 0 8px 22px rgba(15,23,42,0.16)
│   └── Loading State: Spinner terintegrasi + disabled
│
└── Helper Footer: "Akun dikelola oleh sekolah." (text-xs text-[#64748B])
```

---

## 4. Klasifikasi Material & Design Tokens pada Login

| Elemen UI | Klasifikasi Material | Spesifikasi Token / Nilai Nyata |
|---|---|---|
| **Page Canvas** | `BASE SURFACE` | Background `#F7F7F8`, Dark: `#0B1120`, Ambient Sky Glow 8% |
| **Header Logo** | `GLASS SOFT` | Mark size `48px`, Drop shadow `0 6px 14px rgba(15,23,42,0.1)` |
| **Input Fields** | `SOLID CONTRAST` | Height `48px` (`h-12`), Radius `10px`, Border `#CBD5E1` (Dark: `#334155`), BG `#FFFFFF` |
| **Input Focus** | `ACCENT GLOW` | Border `#3B82F6`, Ring Halo `0 0 0 3px rgba(59,130,246,0.25)` |
| **Password Toggle**| `INTERACTIVE ICON` | Button icon eye/eye-off `size-10`, `text-slate-400 hover:text-slate-700` |
| **Checkbox** | `CONTROL SOLID` | Size `18×18px`, Radius `5px`, Checkmark indicator putih |
| **Link Text** | `TEXT ACCENT` | Color `#2563EB`, font-weight 600, focus-visible ring sky |
| **Tombol Masuk** | `PRIMARY SOLID` | Background `#1E293B`, Radius `12px`, Shadow `0 8px 22px rgba(15,23,42,0.16)` |
| **Status Banner** | `GLASS SOFT` | Border `emerald-200`, BG `emerald-50`, Text `emerald-700`, Radius `12px` |

---

## 5. Perilaku Responsif Eksplisit

1. **Desktop L / XL (`>= 1280px`):**
   * Form berada di sisi kanan dengan padding samping luas (`xl:px-16`, `2xl:px-12`).
   * Artwork astronaut tampil penuh dari pinggul ke atas di sisi kiri.
2. **Desktop M / Laptop (`1024px – 1279px`):**
   * Grid tetap 2 kolom (`58% / 42%`).
   * Artwork sedikit diskalakan (`object-[36%_center]`).
3. **Tablet (`768px – 1023px`):**
   * Layout berubah menjadi single column stacked.
   * Form centered dengan max-width 470px.
   * Artwork astronaut tampil di bawah dengan tinggi minimal 300px.
4. **Mobile (`320px – 767px`):**
   * Header brand mengecilkan padding (`px-5`).
   * Judul form berukuran `30px` dengan leading ketat (`1.2`).
   * Input dan tombol tetap mempertahankan target sentuh ramah jari (tinggi `48px` / min-height `44px`).
