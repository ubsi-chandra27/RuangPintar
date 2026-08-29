# CATATAN TEKNIS & IMPLEMENTASI (*IMPLEMENTATION NOTES*) — RUANG PINTAR V2

Dokumen ini mendokumentasikan wawasan teknis, keputusan rekayasa, serta rekonsiliasi antara draf awal dokumentasi dengan implementasi nyata pada Ruang Pintar V2.

---

## 1. Rekonsiliasi Desain & Implementasi Nyata

### A. Autentikasi Berbasis Username (Bukan Email Tunggal)
* **Draf Awal:** Sebagian template awal Laravel menggunakan email sebagai pengenal utama.
* **Implementasi Nyata V2:** Ruang Pintar V2 secara resmi menggunakan `username` sebagai identifier akun. Hal ini dirancang agar siswa jenjang SD/SMP/SMA/SMK yang belum memiliki email pribadi tetap dapat memiliki akun sekolah yang mudah diakses (misal: NIS/NISN atau format nama terstandarisasi).

### B. Dominasi Warna: Cobalt & Academic Navy (Bukan Dominasi Teal)
* **Evolusi Desain:** Terjadi koreksi visual penting dari prototipe lama yang terlalu dominan warna teal/cyan gelap.
* **Standar Kanonikal V2:** Warna utama untuk *primary action*, link, fokus, dan elevasi aktif adalah **Cobalt/Blue (`#1D4ED8` s.d. `#2563EB`)**, sedangkan **Academic Navy (`#1E293B` / `#0F172A`)** digunakan untuk heading teks berbobot dan tombol aksi tegas. Latar belakang kanvas wajib bertema terang (`#F8FAFC` / `#F7F7F8`).

### C. Pola Interaksi CRUD Standar
* **Create & Edit:** Selalu menggunakan modal dialog interaktif (`Dialog`).
* **Hapus Data (*Delete*):** Menggunakan konfirmasi modal destruktif (`ConfirmationDialog`).
* **Feedback Sukses:** Menutup modal dan menampilkan **SATU toast notification** via Sonner (Dilarang membuat popup modal sukses yang mengharuskan klik "OK" tambahan).
* **Feedback Error:** Pesan validasi ditampilkan secara *inline* tepat di bawah field input yang bermasalah.

---

## 2. Invarian Teknis Penting
1. **Identitas Domain (ULID):** Setiap entitas baru menggunakan ULID 26 karakter, bukan auto-increment integer biasa.
2. **Format Waktu:** Format 24 jam dengan standardisasi timezone aplikasi `Asia/Jakarta`.
3. **Fail-Closed Authorization:** Frontend UI bukan pembatas keamanan utama. Backend selalu memvalidasi hak akses via Laravel Policies/Gates dan middleware `school.permission` / `platform.super-admin`.
