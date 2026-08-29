# MCP Handoff Pack — Ruang Pintar V2: Login & Academic Glass UI Kit

> **Paket ini merupakan *reference handoff* resmi dari Ruang Pintar V2.**
> Tujuannya adalah mempertahankan **fidelity visual, design tokens, responsive behavior, motion, dan UX behaviour** dari Halaman Login serta Academic Glass UI Kit saat diadaptasikan ke proyek **Ruang Pintar V3** pada komputer/lingkungan lain.

---

## 1. Aturan Adaptasi bagi AI Coding (V3 Target)
1. **Bukan Arsitektur Kloning:** Jangan memperlakukan *source code* V2 sebagai arsitektur mentah V3. Pertahankan desain, estetika, dan *behaviour* yang telah disetujui (*APPROVED*), namun adaptasikan implementasinya secara *native* terhadap *stack* V3 (Laravel 13, React 19, Inertia 3, TypeScript, Tailwind CSS v4, Vite).
2. **Sumber Kebenaran Tunggal:** Seluruh spesifikasi dalam paket ini diekstraksi langsung melalui *reverse-engineering* terhadap implementasi nyata dan dokumen kanonikal Ruang Pintar V2.
3. **Tanpa Data Rahasia (*Zero Secret Policy*):** Paket ini bersih dari kredensial, token, session, file database runtime, `.env`, dan PII pengguna.

---

## 2. Struktur Direktori Paket Handoff

```text
handoff/ruang-pintar-v2-login-ui-kit/
├── README.md                           <-- Dokumen utama & petunjuk umum handoff
├── LOGIN-SPECIFICATION.md              <-- Spesifikasi anatomi, layout, dan form login V2
├── UI-KIT-SPECIFICATION.md             <-- Spesifikasi lengkap Academic Glass UI Kit v1.2
├── DESIGN-TOKENS.md                    <-- Nilai token aktual (warna, typo, radius, shadow, glass)
├── COMPONENT-MAPPING.md                <-- Pemetaan komponen UI ke file source & dependency
├── RESPONSIVE-BEHAVIOUR.md             <-- Perilaku responsif (390×844, 768×1024, 1024×768, 1440×900)
├── MOTION-SPECIFICATION.md             <-- Durasi, easing, transisi, dan micro-interaction
├── AUTH-UX-BEHAVIOUR.md                <-- UX flow login, validasi, loading, error, first-login password
├── SOURCE-MANIFEST.md                  <-- Daftar inventaris file source V2 & klasifikasi adaptasi
├── ASSET-MANIFEST.md                   <-- Daftar inventaris aset visual & lisensi/lokasi
├── IMPLEMENTATION-NOTES.md             <-- Catatan teknis & perbedaan dokumen vs implementasi V2
├── V2-TO-V3-ADAPTATION-GUIDE.md        <-- Panduan praktis adaptasi ke stack Ruang Pintar V3
├── context/
│   ├── login-context.json              <-- Metadata login terstruktur (machine-readable)
│   └── ui-kit-context.json             <-- Metadata UI Kit terstruktur (machine-readable)
└── assets/
    ├── brand/                          <-- Logo mark Ruang Pintar
    ├── auth/                           <-- Ilustrasi astronaut hero & layout reference
    └── ui-kit/                         <-- 15 poster visual reference canonical (01–15)
```

---

## 3. Ringkasan Ekstraksi V2

* **Visual Character:** *Academic Glass UI v1.2* (Modern, Bersih, Akademik, Tenang, Berkontras Tinggi).
* **Primary Palette:** Academic Navy (`#1E293B` / `#0F172A`) & Cobalt/Ruang Pintar Blue (`#1D4ED8` s.d. `#2563EB`).
* **Typography:** `Plus Jakarta Sans` (UI utama) dan `Andale Mono` (kode, waktu, angka teknis).
* **Hero Artwork:** `login-hero-astronaut.png` dengan masking gradien transparan responsif.
* **Credential:** Username-based authentication (bukan email-only) dengan penanganan `must_change_password` dan rate limiting terintegrasi.
