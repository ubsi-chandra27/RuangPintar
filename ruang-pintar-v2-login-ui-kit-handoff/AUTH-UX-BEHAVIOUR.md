# PERILAKU PENGALAMAN PENGGUNA AUTENTIKASI (*AUTH UX BEHAVIOUR*)

Dokumen ini mendokumentasikan perilaku interaksi dan alur antarmuka pengguna (*UI behavior*) saat proses autentikasi berlangsung pada Ruang Pintar V2.

> **Catatan Keamanan:** Dokumen ini HANYA mencatat perilaku antarmuka (*UI behaviour*) dan BUKAN credential, password, session token, atau data akun pengguna.

---

## 1. Alur Pengalaman Masuk Pengguna (*Login Flow*)

```text
[ Pengguna Mengakses /login ]
               │
               ▼
[ Input Username & Password ]
               │
               ▼
[ Klik Tombol "Masuk" ] ─── (processing=true, tombol disabled + spinner)
               │
       ┌───────┴───────┐
       ▼               ▼
[ Gagal Validasi ]  [ Berhasil Terautentikasi ]
  - Inline error      │
  - Focus field       ▼
                 [ Status Akun Aktif? ]
                      ├── TIDAK (Suspended/Disabled) ──► Pesan error: "Akun Anda dinonaktifkan."
                      │
                      └── YA
                           │
                           ▼
                 [ must_change_password == true? ]
                      ├── YA  ──► Dialihkan ke /password/required (Wajib Ganti Password Awal)
                      │
                      └── TIDAK
                           │
                           ▼
                 [ Redirect ke Dashboard Sesuai Peran ]
```

---

## 2. Rincian Perilaku Form & Validasi

1. **Format Kredensial:**
   * Ruang Pintar menggunakan **`username`** (bukan email tunggal) sebagai pengenal akun primer, memungkinkan kemudahan login bagi siswa dan staf sekolah.
2. **Penanganan Validasi Error Sisi Klien & Server:**
   * Jika field `username` atau `password` kosong saat dikirim, pesan kesalahan ditampilkan *inline* tepat di bawah input (`InputError`), bukan melalui alert popup yang mengganggu.
   * Nilai `username` dipertahankan dalam input setelah submit gagal, sedangkan nilai `password` otomatis di-reset untuk keamanan.
3. **Pemberitahuan Status Autentikasi Gagal:**
   * Jika kombinasi username/kata sandi salah, pesan validasi standar ditampilkan: *"Kredensial yang diberikan tidak cocok dengan data kami."*
4. **Proteksi Percobaan Berulang (*Rate Limiting*):**
   * Jika terjadi terlalu banyak percobaan login yang gagal dalam waktu singkat, sistem memberikan feedback: *"Terlalu banyak percobaan masuk. Silakan coba lagi dalam X detik."*
5. **Fitur "Ingat Saya" (*Remember Me*):**
   * Checkbox bernilai `1` memperpanjang durasi persistensi session login pada perangkat tepercaya pengguna.

---

## 3. Alur Wajib Ubah Kata Sandi Pertama Kali (*Must Change Password*)

Akun yang baru dibuat oleh operator sekolah memiliki flag `must_change_password: true`.
* **Perilaku Antarmuka:** Begitu kredensial sementara berhasil diverifikasi, pengguna tidak langsung masuk ke dashboard, melainkan dialihkan secara otomatis oleh middleware ke halaman `/password/required`.
* **Kebutuhan Form:** Pengguna wajib memasukkan kata sandi baru (minimal 10 karakter) dan konfirmasi kata sandi sebelum diizinkan mengakses menu sekolah atau dashboard platform.
