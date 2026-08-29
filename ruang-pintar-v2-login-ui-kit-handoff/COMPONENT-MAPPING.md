# COMPONENT MAPPING — RUANG PINTAR V2

Dokumen ini memetakan setiap elemen antarmuka, komponen visual, lokasi file sumber (*source path*), dependensi pustaka, token/style yang diterapkan, serta halaman penggunaannya.

---

## 1. Pemetaan Komponen Halaman Login (*Login Page Mapping*)

| Elemen Visual | File Sumber Aktual | Dependensi Utama | Token & Style Kunci | Halaman Pengguna |
|---|---|---|---|---|
| **Shell Auth Login** | `resources/js/layouts/auth/auth-login-layout.tsx` | `@inertiajs/react`, `astronautHero`, `/brand/ruang-pintar-mark.png` | `min-h-[100dvh] bg-[#F7F7F8] dark:bg-[#0B1120]`, grid 2 kolom `lg:grid-cols-[58%_42%]`, radial glow | `pages/auth/login.tsx` |
| **Brand Logo Block** | `resources/js/layouts/auth/auth-login-layout.tsx` | `Link`, `ruang-pintar-mark.png` | `size-12 drop-shadow-[0_6px_14px_rgba(15,23,42,0.1)]`, text `17px font-bold #1E293B` | Header Auth |
| **Artwork Astronaut**| `references/auth/login-hero-astronaut.png` | Native `<img>` dengan CSS mask | `mask-image: linear-gradient(to right, #000 0%, #000 78%, transparent 100%)` | Kolom Kiri Auth |
| **Form Container** | `resources/js/pages/auth/login.tsx` | `@inertiajs/react` (`Form`), `routes/login` | `flex flex-col gap-6 max-w-[470px]`, `noValidate`, `resetOnSuccess` | `pages/auth/login.tsx` |
| **Label Field** | `resources/js/components/ui/label.tsx` | `@radix-ui/react-label` | `text-sm font-medium text-foreground leading-none` | Seluruh Form |
| **Username Input** | `resources/js/components/ui/input.tsx` | Native `<input>` | `h-12 px-4 text-base rounded-[10px] border-[#CBD5E1] bg-white focus:border-blue-500` | Login, Register |
| **Password Input** | `resources/js/components/password-input.tsx` | `lucide-react` (`Eye`, `EyeOff`), `input.tsx` | `h-12 px-4 text-base`, toggle button `size-10`, eye icon `size-4 text-slate-400` | Login, Ganti Password |
| **Inline Error** | `resources/js/components/input-error.tsx` | Native `<div>` | `text-xs font-medium text-rose-600 dark:text-rose-400` | Seluruh Form |
| **Remember Checkbox**| `resources/js/components/ui/checkbox.tsx` | `@radix-ui/react-checkbox`, `lucide-react` (`Check`) | `size-[18px] rounded-[5px] border-slate-300 data-[state=checked]:bg-blue-600` | Login |
| **Lupa Password Link**| `resources/js/components/text-link.tsx` | `@inertiajs/react` (`Link`) | `text-sm font-semibold text-[#2563EB] hover:text-blue-700 focus-visible:ring-3` | Login |
| **Tombol Masuk** | `resources/js/components/ui/button.tsx` | `lucide-react` (`Loader2`), `class-variance-authority` | `size="lg" variant="secondary"`, `bg-[#1E293B] text-white rounded-[12px] shadow-md` | Login |
| **Status Banner** | `resources/js/pages/auth/login.tsx` | Native `<div>` | `rounded-[12px] border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm` | Login Feedback |

---

## 2. Pemetaan Komponen Utama Academic Glass UI Kit

| Komponen UI | File Sumber Aktual | Dependensi Utama | Varian & Kemampuan Utama |
|---|---|---|---|
| **Button** | `resources/js/components/ui/button.tsx` | `cva`, `radix-ui/react-slot`, `lucide-react` | 7 varian (`primary`, `secondary`, `outline`, `ghost`, `destructive`, `glass`, `glassPrimary`), 3 ukuran (`sm`, `default`, `lg`), loading spinner |
| **Input & Textarea**| `resources/js/components/ui/input.tsx`, `textarea.tsx` | Native form primitives | Support status error/success, variant sm/default/lg, focus glow halo |
| **Card & Surface** | `resources/js/components/ui/card.tsx`, `foundation/surface.tsx` | Native `<div>` | Level 0 Solid, Level 1 Soft, Level 2 Elevated, Level 3 Strong |
| **Badge & Chip** | `resources/js/components/ui/badge.tsx` | `cva` | Varian default, secondary, destructive, outline, success, warning, info |
| **Alert Box** | `resources/js/components/ui/alert.tsx` | `cva`, `lucide-react` | Alert heading, alert description, semantic icons |
| **Toast Notification**| `resources/js/components/ui/sonner.tsx` | `sonner` | Toast notifikasi sudut kanan atas dengan icon dan durasi auto-dismiss 4s |
| **Dialog Modal** | `resources/js/components/ui/dialog.tsx` | `@radix-ui/react-dialog`, `lucide-react` | Dialog content, header, title, description, footer, close X button |
| **Confirmation Modal**| `resources/js/components/foundation/confirmation-dialog.tsx` | `dialog.tsx`, `lucide-react` | Modal konfirmasi destruktif dengan contextual icon amber/rose |
| **Responsive Table**| `resources/js/components/foundation/responsive-data-table.tsx` | Native table + custom responsive container | Desktop tabular grid + Mobile stacked cards auto-transformation |
| **Pagination** | `resources/js/components/foundation/pagination.tsx` | `lucide-react` (`ChevronLeft`, `ChevronRight`) | Nomor halaman kotak 36px, previous/next buttons, active state |
| **Select Dropdown**| `resources/js/components/ui/select.tsx` | `@radix-ui/react-select`, `lucide-react` | Trigger, content popover, item, separator, label |
| **Sidebar Shell** | `resources/js/components/ui/sidebar.tsx`, `app-sidebar.tsx` | Radix primitive + Inertia `usePage` | Expanded 240px, collapsed 56px rail, role-aware nav items |
| **Academic Shell** | `resources/js/components/layout/academic-shell.tsx` | `sidebar.tsx`, `app-header.tsx`, `breadcrumbs.tsx` | Master shell layout dengan topbar, breadcrumbs, user menu, dan theme switcher |
