# RUANG PINTAR
# SAAS ONBOARDING SPECIFICATION
Version: 1.0
Status: APPROVED
Date: 20 September 2026

---

# 1. LATAR BELAKANG

Ruang Pintar dikembangkan sebagai platform SaaS Multi-Tenant untuk SD, SMP, SMA, dan SMK.

Tujuan utama onboarding adalah membuat guru dapat menggunakan sistem secepat mungkin tanpa konfigurasi yang rumit.

Prinsip utama:

> Guru tidak datang untuk mengisi profil.
> Guru datang untuk mulai mengajar.

Target onboarding:

- Maksimal 3 menit
- Minim form
- Fokus pada aktivitas mengajar
- Mencegah tenant sekolah ganda

---

# 2. FILOSOFI ONBOARDING

SaaS pendidikan berbeda dengan media sosial.

Bukan:

User → Sekolah

Tetapi:

Sekolah → User

Sekolah adalah entitas utama sistem.

Guru, Operator, Kepala Sekolah, dan Wali Kelas adalah pengguna yang bergabung ke dalam sekolah tersebut.

---

# 3. ZERO SETUP TEACHER ONBOARDING

Target User Journey:

Landing Page
↓
Cari Sekolah
↓
Sekolah Ditemukan?
├─ Ya → Gabung Sekolah
└─ Tidak → Daftarkan Sekolah
↓
Registrasi Akun
↓
Pilih Avatar
↓
Auto Login
↓
Dashboard
↓
First Login Wizard
↓
Mulai Mengajar

Target:

< 3 Menit

---

# 4. LANDING PAGE

CTA Utama:

[Coba Gratis 30 Hari]

Ketika tombol ditekan:

User diarahkan ke halaman pencarian sekolah.

---

# 5. LANGKAH 1 - CARI SEKOLAH

Tujuan:

Mencegah tenant sekolah ganda.

Field:

- Nama Sekolah

Placeholder:

Cari sekolah Anda...

Contoh:

- SMK Otomindo
- SMA Negeri 1 Bekasi
- SMK Teratai Putih Global 4

---

# 6. JIKA SEKOLAH DITEMUKAN

Tampilkan:

✓ Sekolah Ditemukan

Nama Sekolah
Kota/Kabupaten

Tombol:

[Gabung Sekolah]

User melanjutkan proses registrasi akun pribadi.

---

# 7. JIKA SEKOLAH TIDAK DITEMUKAN

Tampilkan:

Sekolah Anda belum terdaftar.

Tombol:

[Daftarkan Sekolah Saya]

Sistem membuat tenant sekolah baru.

Pendaftar pertama otomatis menjadi:

ADMIN_SEKOLAH

---

# 8. REGISTRASI AKUN

Field:

- Nama Lengkap
- Email
- Username
- Password
- Konfirmasi Password

Catatan:

Nama sekolah tidak ditampilkan kembali karena sudah dipilih pada langkah sebelumnya.

---

# 9. PILIH AVATAR

Tujuan:

Menciptakan ikatan emosional dengan akun.

Flow:

Registrasi
↓
Pilih Avatar
↓
Masuk Sistem

Avatar dapat diganti kapan saja setelah login.

---

# 10. AUTO LOGIN

Keputusan Produk:

Tidak ada halaman login ulang setelah registrasi.

Flow:

Registrasi Berhasil
↓
Avatar Dipilih
↓
Auto Login
↓
Dashboard

Alasan:

Mengurangi friction.

---

# 11. FIRST LOGIN EXPERIENCE

Saat login pertama:

Dashboard sudah terbuka.

Background dashboard dibuat blur.

Muncul Glass Modal Wizard di atas dashboard.

User merasa:

"Saya sudah berhasil masuk aplikasi."

Bukan:

"Saya masih registrasi."

---

# 12. FIRST LOGIN WIZARD

Tipe:

Glass Modal Wizard

Jumlah Step:

4 Step

---

## STEP 1
Pilih Peran Anda

Judul:

Selamat Datang, Pak/Ibu [Nama]

Subjudul:

Agar Ruang Pintar dapat menyesuaikan fitur yang Anda butuhkan,
silakan pilih peran Anda di sekolah.

---

Peran:

☐ Guru
☐ Wali Kelas
☐ Operator Sekolah
☐ Kepala Sekolah

---

IMPLEMENTASI UI

Menggunakan:

Glass Toggle Card

Bukan:

- Radio Button
- Checkbox Tradisional

---

Contoh:

[ ON ] Guru

[ ON ] Wali Kelas

[ OFF ] Operator Sekolah

[ OFF ] Kepala Sekolah

---

Rules:

Multi Select Allowed

Karena dalam sekolah Indonesia:

1 Orang
=
Banyak Peran

Contoh:

☑ Guru
☑ Wali Kelas

atau

☑ Guru
☑ Operator Sekolah

---

## STEP 2
Data Mengajar

Tampilkan sesuai role yang dipilih.

Jika Guru aktif:

Pertanyaan:

Mapel apa yang Anda ampu?

Contoh:

☑ Koding & Kecerdasan Artifisial
☑ PBO
☑ PPB
☑ Struktur Data
☑ Praktik

---

## STEP 3
Siapkan Aktivitas Mengajar

Judul:

Bagaimana Anda ingin memulai?

Pilihan:

[ Import Excel ]
[ Isi Manual ]
[ Foto Daftar Hadir AI ]
[ Lewati Dulu ]

Catatan:

Import Excel harus menjadi prioritas utama.

Karena mayoritas guru memiliki data siswa dalam bentuk Excel.

---

## STEP 4
Siap Mengajar

Pesan:

Selamat Datang di Ruang Pintar.

Sistem siap digunakan.

Tombol:

[ Masuk Dashboard ]

---

# 13. DASHBOARD PERTAMA

Jangan tampilkan:

0 Kelas
0 Siswa
0 Nilai
0 Absensi

Karena terasa kosong.

---

Tampilkan:

Mari siapkan aktivitas mengajar pertama Anda.

☐ Tambah Mata Pelajaran

☐ Tambah Kelas

☐ Tambah Siswa

☐ Buat Absensi Pertama

Progress:
0%

---

# 14. PRINSIP UX

Ruang Pintar harus fokus pada:

Mulai Mengajar

Bukan:

- Mengisi Profil
- Mengisi Biodata
- Upload Dokumen
- Setup Rumit

Semakin cepat guru mulai mengajar,
semakin besar peluang konversi trial menjadi pelanggan.

---

# 15. KEPUTUSAN PRODUK FINAL

APPROVED

Keputusan yang telah disepakati:

✓ Cari sekolah sebelum registrasi

✓ Cegah tenant sekolah ganda

✓ Sekolah adalah entitas utama sistem

✓ Avatar sebelum masuk sistem

✓ Auto login setelah registrasi

✓ Glass Modal Wizard pada login pertama

✓ Multi-role menggunakan Glass Toggle Card

✓ Dashboard tampil di belakang wizard

✓ Fokus onboarding pada aktivitas mengajar

✓ Zero Setup Teacher Onboarding

Target:

Guru dapat mulai menggunakan Ruang Pintar
dalam waktu kurang dari 3 menit.

END OF DOCUMENT
