# PERILAKU RESPONSIF (*RESPONSIVE BEHAVIOUR*) — RUANG PINTAR V2

Dokumen ini menjabarkan secara presisi perubahan tata letak dan perilaku interaksi antarmuka pada 4 target *viewport* kanonikal Ruang Pintar V2.

---

## 1. Matriks Viewport Kanonikal

| Viewport Target | Kategori Perangkat | Karakteristik Grid | Layout Login | Layout Dashboard & UI Kit |
|---|---|---|---|---|
| **`390×844`** | Smartphone Modern (Mobile) | 1 Kolom (Stacking) | Vertikal (`order-1` Form, `order-2` Hero) | Drawer Menu, Stacked Cards, Stacked Table |
| **`768×1024`** | Tablet Portrait | 1–2 Kolom Reflow | Vertikal centered (Form atas, Hero bawah) | Mini Sidebar / Drawer, Grid 2-kolom |
| **`1024×768`** | Tablet Landscape / Small Laptop | 2–3 Kolom | Split View (58% Hero Kiri, 42% Form Kanan) | Compact Sidebar 56px, Grid 2–3 kolom |
| **`1440×900`** | Desktop Standar / Monitor Lebar | 3–4 Kolom Optimal | Split View Penuh (58% Hero, 42% Form) | Full Sidebar 240px, Grid 4-kolom KPI |

---

## 2. Perilaku Responsif Khusus Halaman Login

### A. Transformasi Mobile (`390×844` s.d. `< 768px`):
1. **Urutan Tampilan (*Order Inversion*):**
   * Form login menggunakan class `order-1` sehingga tampil pertama di layar atas. Ini menjamin pengguna langsung dapat mengisi form tanpa harus menggulir melewati ilustrasi, dan mencegah input tertutup oleh keyboard virtual perangkat.
   * Ilustrasi astronaut menggunakan class `order-2` dan diposisikan di bawah form dengan tinggi minimal `212px`.
2. **Masking Gradien Ilustrasi (*Dynamic Mask Blending*):**
   * Pada mobile, masking gambar diarahkan dari atas ke bawah: `mask-image: linear-gradient(to bottom, transparent 0%, #000 22%, #000 100%)`.
3. **Penskalaan Tipografi:**
   * Judul "Masuk ke Ruang Pintar" mengecil dari `40px` (desktop) menjadi `30px` dengan leading ketat `leading-[1.2]`.
   * Padding horizontal container menjadi `px-5` (`20px`).
4. **Target Sentuh Ramah Jari (*Touch Targets*):**
   * Seluruh elemen interaktif (Input, Password Toggle, Checkbox, Tombol Masuk) mempertahankan tinggi minimal `44px` s.d. `48px` untuk mencegah kesalahan ketuk.

### B. Transformasi Desktop (`1024px` s.d. `1440×900`+):
1. **Tata Letak Split-Screen:**
   * Grid beralih menjadi 2 kolom proporsional: `lg:grid-cols-[minmax(0,58%)_minmax(420px,42%)]`.
   * Ilustrasi astronaut menempati kolom kiri secara penuh (`lg:h-full lg:w-[122%]`) dengan masking horizontal ke kanan: `mask-image: linear-gradient(to right, #000 0%, #000 78%, transparent 100%)`.
2. **Penataan Vertikal Form:**
   * Form login berada di kolom kanan dengan penyeimbang visual vertikal `lg:-translate-y-6 lg:items-center` dan batas lebar maksimal `470px` (2XL: `500px`).

---

## 3. Perilaku Responsif Komponen UI Kit Lainnya

### A. Tabel Data (`ResponsiveDataTable`):
* **Desktop (`>= 1024px`):** Menampilkan tabel penuh dengan kolom nama, status, relasi, aksi, dan pagination bernomor.
* **Mobile (`< 768px`):** Secara otomatis beralih dari format tabular menjadi tumpukan kartu vertikal (*card list*). Setiap baris tabel menjadi satu kartu mandiri dengan label dan nilai berpasangan, menghindari *horizontal scrolling* yang merusak tata letak.

### B. Navigasi Sidebar (`AcademicShell` / `AppSidebar`):
* **Desktop:** Sidebar tetap terlihat di sisi kiri dengan dua opsi: *Expanded* (lebar `240px`) atau *Compact Icon Rail* (lebar `56px`).
* **Mobile & Tablet:** Sidebar disembunyikan dan dapat dipanggil melalui tombol hamburger di topbar yang membuka *slide-over drawer* dengan transisi halus (`250ms`).

### C. Modal & Dialog:
* **Desktop:** Tampil mengambang di tengah layar dengan lebar `max-w-lg` (`512px`) dan sudut membulat `rounded-2xl` (`20px`).
* **Mobile:** Tampil sebagai *bottom sheet* atau modal hampir penuh dengan padding aman dari tepi layar (`p-4`).
