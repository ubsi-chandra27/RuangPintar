# SPESIFIKASI GERAK & MIKRO-INTERAKSI (*MOTION SPECIFICATION*)

Dokumen ini mendefinisikan standar durasi waktu, kurva perlambatan (*easing curves*), dan animasi mikro-interaksi yang diterapkan pada Ruang Pintar V2.

---

## 1. Token Gerak Kanonikal (*Motion Tokens*)

| Token | Durasi | Easing Function | Kasus Penggunaan Utama |
|---|---|---|---|
| `--motion-fast` | `160ms` | `cubic-bezier(0.2, 0, 0, 1)` | Hover state tombol, klik icon, transisi warna teks, toggle password |
| `--motion-normal` | `200ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Pembukaan dropdown menu, transisi tab, fade-in alert, fokus input |
| `--motion-shell` | `250ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Sidebar expand/collapse, slide-in mobile drawer, dialog modal overlay |

---

## 2. Mikro-Interaksi pada Halaman Login

### A. Interaksi Fokus Input (*Focus Glow Halo*):
* Saat input difokuskan (via mouse atau tombol `Tab`), border bertransisi dari `#CBD5E1` menjadi `#3B82F6` dengan munculnya *ring halo* `0 0 0 3px rgba(59, 130, 246, 0.25)`.
* Durasi transisi: `160ms ease-out`.

### B. Toggle Tampilkan/Sembunyikan Kata Sandi (*Password Visibility*):
* Mengklik ikon mata (*Eye / EyeOff*) mengganti tipe atribut input dari `password` ke `text` secara instan tanpa pergeseran layout (*layout shift*).
* Ikon memiliki transisi warna `text-slate-400 hover:text-slate-700` (`160ms`).

### C. State Loading Tombol Masuk (*Submit Loading State*):
* Saat form disubmit (`processing = true`), teks tombol "Masuk" tetap stabil dan memunculkan animasi spinner `Loader2` yang berputar (`animate-spin`).
* Tombol otomatis terdisable (`disabled={processing}`) untuk mencegah pengiriman ganda (*duplicate submission*).

### D. Penampakan Pesan Kesalahan Validasi (*Error Feedback*):
* Pesan kesalahan inline muncul tepat di bawah field terkait dengan warna `text-rose-600` (Dark: `text-rose-400`).
* Input yang bermasalah otomatis mendapatkan atribut `status="error"` dan border kemerahan.

---

## 3. Animasi Komponen UI Kit

* **Modal Dialog:** Muncul dari tengah layar dengan skala `scale(0.96) -> scale(1.0)` dan *fade-in opacity* (`200ms ease-out`). Backdrop overlay memudar dari `opacity 0` ke `opacity 1` dengan *backdrop-blur*.
* **Toast Notification (Sonner):** Meluncur dari tepi kanan atas layar dengan sedikit pantulan (*spring deceleration*) dan tetap tampil selama 4 detik sebelum menghilang halus.
* **Dropdown & Popover:** Membuka ke bawah dengan transisi skala `scale-95 -> scale-100` dan *opacity-0 -> opacity-100* dalam `160ms`.
