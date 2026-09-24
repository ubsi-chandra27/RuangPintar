# REAL DATA INVENTORY
## Ruang Pintar — Inventarisasi Data Riil yang Wajib Dipertahankan Secara Permanen

| Metadata | Nilai |
| --- | --- |
| **Proyek** | Ruang Pintar — School Digital Operating Platform |
| **Fase** | STAGE 10.6 — DATABASE REALITY CLEANUP & ENVIRONMENT SEPARATION |
| **Status Dokumen** | `INVENTORIED — PROTECTED & IMMUTABLE` |
| **Tanggal Audit** | 24 September 2026 |

---

# 1. Daftar Entitas Riil Utama (Whitelist Protection)

Seluruh entitas berikut berstatus **LOCKED & PROTECTED**. Skrip pembersihan dilarang keras mengubah atau menghapus record dengan ID di bawah ini:

### 1.1. Institusi Sekolah Riil: SMK OTOMINDO
* **ID Sekolah:** `01M2XXYD227F9S3H985FH53GMF`
* **Nama Sekolah:** `SMK OTOMINDO`
* **Jenjang:** `SMA` (SMK)
* **Zona Waktu:** `Asia/Jakarta`
* **Tipe Lisensi:** `FREEMIUM` (Trial aktif)
* **Tanggal Pendaftaran:** `2026-09-19T22:52:42.592Z`

### 1.2. Akun Pengguna Pendidik: Eri Chandra A, S.Kom
* **ID Pengguna:** `01M2XXYD26H385F6RAW5PB6FBK`
* **Username:** `guru_chandra`
* **Nama Lengkap:** `Eri Chandra A S.Kom`
* **Email:** `eri.chandra27@gmail.com`
* **Peran Dasar:** `TEACHER`
* **Status Akun:** `AKTIF`
* **ID Profil Guru:** `01M2XXYD299G35BZDH2NKFCM3P`
* **Status Kepegawaian:** `TETAP`

### 1.3. Akun Pengguna Administrator Platform: Super Administrator
* **ID Pengguna:** `01M2X9VHY431VPRAMTFJRPNHQZ`
* **Username:** `superadmin`
* **Nama Lengkap:** `Super Administrator`
* **Email:** `superadmin@ruangpintar.id`
* **Peran Dasar:** `SUPER_ADMIN`
* **Status Akun:** `AKTIF`

### 1.4. Mata Pelajaran: Koding dan Kecerdasan Artifisial
* **ID Mapel:** `01M2YJMPFDTHGDWXJZY0XY0B67`
* **Kode Mapel:** `KODING`
* **Nama:** `Koding & Kecerdasan Artifisial`
* **Kelompok:** `UMUM`
* **Status:** `AKTIF`

### 1.5. Rombongan Belajar (Rombel): X TO 3
* **ID Rombel:** `01M2YJMPE7D0XPTCTFQ2W8D8NJ`
* **Nama Rombel:** `X TO 3`
* **Kapasitas:** `43` siswa
* **Status:** `AKTIF`
* **Tahun Ajaran Terkait:** `01M2XXYD2CYPCWZ0RM9TAN6BW0` (`2026/2027`)
* **Semester Terkait:** `01M2XXYD2F5JRXRTR4ECMRNG4J` (`Ganjil`)
* **Tingkat Kelas:** `01M2YJMPSPH9XPA1ACW3S3FBNE` (`Tingkat X`)
* **Fase Kurikulum:** `01M2YJMPQ45AHE6K3TPT9RTMTT` (`Fase E`)

### 1.6. Penugasan Mengajar Guru
* **ID Penugasan:** `01M2YJMPXZ4BSRYTX6Z7P90BKG`
* **Guru:** Pak Eri Chandra A, S.Kom
* **Mapel:** Koding & Kecerdasan Artifisial
* **Rombel:** X TO 3
* **Beban:** 3 Jam Pelajaran / minggu

---

# 2. Daftar 36 Siswa Riil Rombel X TO 3

Seluruh 36 siswa riil berikut tercatat di tabel `siswa`, `keikutsertaan_siswa`, dan `penempatan_rombel` pada SMK OTOMINDO:

| No | NIS | Nama Siswa Riil | Jenis Kelamin | Status |
| :---: | :---: | --- | :---: | :---: |
| 1 | `1001` | Abdul Fattah | L | AKTIF |
| 2 | `1002` | Ahmad Ramdhani | L | AKTIF |
| 3 | `1003` | Arya Dwi Saputra | L | AKTIF |
| 4 | `1004` | Arya Wijaya | L | AKTIF |
| 5 | `1005` | Bagas Ramadhan | L | AKTIF |
| 6 | `1006` | Dimas Maulana | L | AKTIF |
| 7 | `1007` | Dion Pradita | L | AKTIF |
| 8 | `1008` | Dwi Rian Ramadhan | L | AKTIF |
| 9 | `1009` | Erlangga Dwi Saputra | L | AKTIF |
| 10 | `1010` | Fadhil Al Farizi | L | AKTIF |
| 11 | `1011` | Fajar Pratama | L | AKTIF |
| 12 | `1012` | Faris Syahputra | L | AKTIF |
| 13 | `1013` | Galih Permana | L | AKTIF |
| 14 | `1014` | Gilang Ramadhan | L | AKTIF |
| 15 | `1015` | Hafizh Al Ghifari | L | AKTIF |
| 16 | `1016` | Haikal Fariz | L | AKTIF |
| 17 | `1017` | Ikhwan Nugraha | L | AKTIF |
| 18 | `1018` | Irfan Maulana | L | AKTIF |
| 19 | `1019` | Krisna Wahyu Pratama | L | AKTIF |
| 20 | `1020` | M. Rizki Aditya | L | AKTIF |
| 21 | `1021` | M. Wildan Alamsyah | L | AKTIF |
| 22 | `1022` | Maulana Akbar | L | AKTIF |
| 23 | `1023` | Moch. Revan Saputra | L | AKTIF |
| 24 | `1024` | Muhammad Fahri Amruhu Fathur | L | AKTIF |
| 25 | `1025` | Muhammad Kahfi Fadlyansyah | L | AKTIF |
| 26 | `1026` | Muhammad Rafa Al Farizi | L | AKTIF |
| 27 | `1027` | Muhammad Razka Aryadi | L | AKTIF |
| 28 | `1028` | Muhammad Safaat | L | AKTIF |
| 29 | `1029` | Naufal Halil Pradipta | L | AKTIF |
| 30 | `1030` | Putra Ramadhan | L | AKTIF |
| 31 | `1031` | Raffi Aldiansyah | L | AKTIF |
| 32 | `1032` | Ridho Pratama | L | AKTIF |
| 33 | `1033` | Rizky Jaka jaladara | L | AKTIF |
| 34 | `1034` | Satrio Wicaksono | L | AKTIF |
| 35 | `1035` | Tedy Maulana | L | AKTIF |
| 36 | `1036` | Yoghi Fauzan Azima | L | AKTIF |
| 37*| `1037` | Yudha Rhafa Hidayat | L | AKTIF |
| 38*| `1038` | Zulkifli Amin | L | AKTIF |

*(Catatan: Rombel X TO 3 memiliki 36–38 siswa riil terdaftar yang wajib dipertahankan utuh).*

---

# 3. Struktur Relasi Pendukung yang Dipertahankan
* **Tahun Ajaran:** `2026/2027` (ID: `01M2XXYD2CYPCWZ0RM9TAN6BW0`)
* **Semester:** `Ganjil` (ID: `01M2XXYD2F5JRXRTR4ECMRNG4J`)
* **Langganan Tenant SMK OTOMINDO:** `01M2XXYD227F9S3H985FH53GMF`
* **Keanggotaan Sekolah:** ID `01M2XXYD26H385F6RAW5PB6FBK` (Keterkaitan `guru_chandra` dengan `SMK OTOMINDO` sebagai `Owner`).

Seluruh relasi di atas adalah **jantung data operasional riil** yang tidak boleh disentuh selama proses pembersihan.
