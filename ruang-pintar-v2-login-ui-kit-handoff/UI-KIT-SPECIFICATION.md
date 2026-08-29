# SPESIFIKASI ACADEMIC GLASS UI KIT V1.2 — RUANG PINTAR V2

## 1. Filosofi & Karakter Desain
**Academic Glass UI v1.2** adalah bahasa desain antarmuka resmi Ruang Pintar V2. Karakter visual utamanya adalah:
* **Akademik, Bersih & Terstruktur:** Dirancang khusus untuk operasional sekolah Indonesia, mengedepankan keterbacaan data dan hirarki visual yang tenang.
* **Liquid Glass Terukur:** Efek *glassmorphism* (`backdrop-blur 12–20px`) digunakan sebagai pembeda elevasi dan pembungkus komponen sekunder, bukan membuat seluruh antarmuka menjadi gelap atau kabur.
* **Kontras Tinggi (*High Contrast*):** Seluruh elemen teks dan kontrol memenuhi standar aksesibilitas WCAG 2.1 AA (kontras minimal 4.5:1 untuk teks normal).

---

## 2. Komponen Antarmuka Lengkap (*Component Catalog*)

### 2.1 Tombol (*Buttons — `button.tsx`*)
* **7 Varian Kanonikal:**
  1. `primary`: Latar belakang biru solid (`#1D4ED8` → `#2563EB`), teks putih, shadow biru lembut (`0 8px 24px rgba(37,99,235,0.2)`).
  2. `secondary`: Latar belakang Academic Navy (`#1E293B`), teks putih, shadow natural.
  3. `outline`: Latar transparan dengan border biru/abu-abu halus, teks biru (`#2563EB`).
  4. `ghost`: Latar transparan dengan hover tint halus, teks biru/navy.
  5. `destructive`: Latar merah lembut (`#FEE2E2`), teks merah tegas (`#EF4444`).
  6. `glass`: Latar putih tembus pandang (`rgba(255,255,255,0.72)`) dengan backdrop blur 12px dan border tipis.
  7. `glassPrimary`: Latar biru glass tembus pandang (`rgba(219,234,254,0.7)`) dengan aksen glow biru.
* **3 Ukuran Standar:**
  * `sm`: Tinggi `32px` (`h-8 px-3 text-xs rounded-[8px]`)
  * `default` (md): Tinggi `40px` s.d. `44px` (`h-11 px-4 text-sm rounded-[12px]`)
  * `lg`: Tinggi `48px` s.d. `56px` (`h-12 px-6 text-base rounded-[12px]`)
* **State Interaktif:** Focus ring halo 3px (`0 0 0 3px rgba(59,130,246,0.35)`), Loading spinner inline, Disabled `opacity-50 cursor-not-allowed`.

---

### 2.2 Form & Input (*Inputs & Controls*)
* **Text Input (`input.tsx`):** Tinggi 40px (default) / 48px (large), border `#CBD5E1`, radius `8–10px`, fokus ring biru.
* **Password Input (`password-input.tsx`):** Dilengkapi tombol show/hide password interaktif dengan icon Lucide `Eye`/`EyeOff`.
* **Textarea (`textarea.tsx`):** Padding nyaman 12px, border halus, resize vertikal terkontrol.
* **Select Dropdown (`select.tsx`):** Trigger select bergaya glass/solid dengan popover menu ber-shadow floating.
* **Checkbox (`checkbox.tsx`):** Ukuran `18×18px`, centang tegas, radius `5px`.
* **Radio Group (`radio-group.tsx`):** Lingkaran 18px dengan dot indicator saat aktif.
* **Switch Toggle (`switch.tsx`):** Ukuran `44×24px` dengan transisi halus thumb pill.

---

### 2.3 Kartu (*Cards & Surfaces — `card.tsx`, `surface.tsx`*)
* **Level Elevasi Permukaan:**
  1. `Solid Card`: Latar putih murni (`#FFFFFF`), border `#E2E8F0`, shadow ringan `0 1px 3px rgba(0,0,0,0.05)`. Digunakan untuk tabel data padat dan form utama.
  2. `Glass Soft`: Latar `rgba(255,255,255,0.72)` dengan blur 12px dan border `rgba(255,255,255,0.55)`.
  3. `Glass Elevated`: Latar `rgba(255,255,255,0.86)` dengan blur 16px dan shadow `0 4px 16px rgba(15,23,42,0.08)`.
  4. `Glass Strong`: Latar `rgba(255,255,255,0.95)` dengan blur 20px, digunakan untuk dialog modal & floating popover.
* **Varian Kartu Khusus:**
  * `Stat Card`: Ikon berbingkai warna lembut (SD rose, SMP blue, SMA indigo, SMK amber) + Angka metrik besar + Label kategori.
  * `Class Card`: Header rombel-mapel + Info guru pengampu + Badge jam pertemuan.
  * `Schedule Card`: Garis waktu vertikal + Kode ruang kelas + Status kehadiran.

---

### 2.4 Status, Badge & Notifikasi (*Badges, Alerts, Toast*)
* **Badge (`badge.tsx`):** Ukuran compact, border 1px, sudut membulat `rounded-full` atau `rounded-md`:
  * `Success`: Hijau lembut `bg-emerald-50 text-emerald-700 border-emerald-200`
  * `Warning`: Kuning lembut `bg-amber-50 text-amber-700 border-amber-200`
  * `Danger`: Merah lembut `bg-rose-50 text-rose-700 border-rose-200`
  * `Info/Academic`: Biru lembut `bg-blue-50 text-blue-700 border-blue-200`
* **Alert (`alert.tsx`):** Box notifikasi inline dengan ikon semantik di sisi kiri dan deskripsi berbobot.
* **Toast (`sonner.tsx`):** Notifikasi mengambang di pojok kanan atas (mobile: top-center) yang muncul setelah aksi selesai dan otomatis hilang dalam 4 detik.

---

### 2.5 Tabel & Data Display (*Tables & Pagination*)
* **ResponsiveDataTable (`responsive-data-table.tsx`):**
  * **Desktop:** Baris tabel padat (tinggi baris `44–48px`), header abu-abu lembut `bg-slate-50`, teks berkontras tinggi, pemisah baris halus.
  * **Mobile:** Transformasi otomatis menjadi kartu-kartu vertikal (*stacked items*) agar tidak memecah layout layar kecil.
* **Pagination (`pagination.tsx`):** Nomor halaman berbentuk kotak `36×36px` dengan status aktif berlatar biru solid.

---

### 2.6 Modal, Dialog & Overlay (*Dialogs*)
* **Dialog (`dialog.tsx`):** Modal terpusat dengan backdrop overlay gelap lembut (`rgba(15,23,42,0.4)` + `backdrop-blur-sm`), radius `20px`, dan tombol tutup di pojok kanan atas.
* **ConfirmationDialog (`confirmation-dialog.tsx`):** Dialog konfirmasi destruktif dengan ikon peringatan amber/merah melingkar di bagian atas.

---

### 2.7 Navigasi & App Shell (`sidebar.tsx`, `academic-shell.tsx`)
* **Sidebar Navigasi:**
  * Lebar diperluas `240px`, lebar mode kompak/icon-only `56px`.
  * Brand Block di header dengan Logo Mark Ruang Pintar.
  * Active State: Indikator latar biru lembut dengan teks navy tebal dan ikon berwarna cerah.
* **Topbar / Header:** Tinggi `64px`, breadcrumbs hirarkis, tombol switch tema, dan profil pengguna.
* **Mobile Drawer:** Menu samping yang dapat digeser keluar (*slide-out drawer*) pada perangkat seluler.
