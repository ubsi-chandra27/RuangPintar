# UI Craftsmanship, Taste & Anti-Slop Directive
## Ruang Pintar — Design Standard

Dokumen ini mengintegrasikan standar dari:
1. **Taste Skill** (`https://github.com/leonxlnx/taste-skill`)
2. **Anti-Slop Guidelines** (`https://github.com/miqdadbadjuber/anti-slop`)

---

### 1. Prinsip Utama (Core Principles)
- **Tujuan Sebelum Hiasan (Purpose Test):** Setiap elemen visual harus memiliki fungsi hierarki, keterbacaan, atau identitas nyata. Dilarang menaruh dekorasi "hanya agar terlihat ramai atau modern".
- **Academic Glass UI Contract:** Glassmorphism dan blur diperlakukan sebagai aksen berbobot (maksimal 1-2 elemen utama), bukan disiramkan ke seluruh permukaan sehingga hierarki rata.
- **Warna & Palet:** 
  - Maksimal 1 warna aksen utama (Deep Academic Blue / Royal Blue `#2563EB` atau Emerald `#059669`).
  - Dilarang memakai gradien klise AI (ungu-ke-pink, cyan-ke-magenta, neon mesh glow).
  - Background light mode bersih dan bervolume: `#F8FAFD` / `#FFFFFF`.
- **Tipografi:**
  - Display headline: tight tracking, `leading-[1.12]`, tidak menabrak descender.
  - Body paragraph: maksimal 65 karakter per baris (`max-w-[65ch]`), nyaman dibaca guru dan orang tua.
  - Dilarang menyisipkan kata italic serif acak di dalam heading sans-serif hanya demi estetika artifisial.
- **Status Indicator & Dots:**
  - Lampu/dot berwarna HANYA untuk status riil (contoh: server sync, kehadiran siswa, ujian aktif).
  - Dilarang menaruh dot berkedip (pulsing dot) tanpa status riil sebagai hiasan judul/badge.
- **Ikonografi & Emotikon:**
  - Dilarang menggunakan emoji literal (🚀, 🔥, 💡) di dalam judul, subjudul, dan tombol.
  - Hindari ikon generic AI (seperti Sparkles/bintang berkilau) untuk fitur akademis serius. Gunakan ikon yang secara domain akurat (`GraduationCap`, `FileSpreadsheet`, `Shield`, `Camera`).
- **Tombol & Aksi (CTAs):**
  - Satu tujuan per halaman (tidak menduplikasi variasi label seperti "Mulai", "Coba Sekarang", "Daftar Akun" untuk aksi yang identik).
  - Feedback taktil yang responsif (`active:scale-[0.98]` atau `-translate-y-0.5`).
  - Kontras teks tombol memenuhi standar aksesibilitas WCAG AA (minimal 4.5:1).
  - Tombol tidak boleh wrap di layar desktop.
- **Variasi Ritme Layout (Anti-Template):**
  - Hindari repetisi monoton: layout bervariasi antara hero split, ribbon statistik padat, pilar fitur 3D, canvas interaktif (peta sekolah), dan testimoni berbasis kartu tanpa border putih yang bertumpuk.
- **Kejujuran Data & Metrik:**
  - Tidak menampilkan angka atau klaim palsu.
  - Seluruh tautan navigasi dan tombol interaktif harus fungsional atau memiliki fallback yang jelas.

---

### 2. Standar Responsif & Mobile-First (Mobile & Tablet Excellence)
- **Mobile-First Priority:** Pengguna aplikasi sekolah 70%+ menggunakan ponsel (guru mencatat presensi di kelas, kepala sekolah memantau via HP, wali murid melihat rapor anak). Prioritaskan pengujian pada layar HP (360px–430px) dan tablet (768px–1024px).
- **Badge & Pill Formatting:** Dilarang keras teks badge terpotong atau membungkus menjadi 2 baris (misal: "0 Sesi\nKBM" terpotong di oval pill). Wajib menggunakan `whitespace-nowrap`, padding proporsional (`px-2.5 py-0.5 text-[11px] font-semibold`), dan ukuran ringkas.
- **Tabel Responsif:** Jangan memaksa tabel HTML multi-kolom diperas ke layar 360px–430px hingga teks bertumpuk. Pada mobile (`sm:hidden`), tampilkan dalam format kartu daftar (card list) yang lapang, rapi, dan mudah dibaca; gunakan tabel hanya pada layar desktop (`hidden sm:table`).
- **SafeArea & Header Clearance:** Jarak atas pada mobile tidak boleh tertabrak oleh topbar atau dynamic island; berikan padding yang nyaman (`pt-3` s.d. `pt-4`).

