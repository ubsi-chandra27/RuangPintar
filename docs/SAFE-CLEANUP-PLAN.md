# SAFE CLEANUP PLAN
## Ruang Pintar — Rencana Pembersihan Aman Data Dummy & Mitigasi Integritas Relasional

| Metadata | Nilai |
| --- | --- |
| **Proyek** | Ruang Pintar — School Digital Operating Platform |
| **Fase** | STAGE 10.6 — DATABASE REALITY CLEANUP & ENVIRONMENT SEPARATION |
| **Status Dokumen** | `PROPOSED & SIMULATED — READY FOR EXECUTION` |
| **Tanggal Rencana** | 24 September 2026 |

---

# 1. Simulasi Hasil Pembersihan Basis Data

Berikut adalah proyeksi perbandingan angka metrik database development sebelum vs sesudah pembersihan terarah:

```text
+---------------------------------------------------------------------------------------------------+
|                               SIMULASI METRIK DATABASE DEVELOPMENT                                |
+-------------------------------+-----------------------+-----------------------+-------------------+
| Metrik Entitas                | Sebelum Pembersihan   | Sesudah Pembersihan   | Delta Perubahan   |
+-------------------------------+-----------------------+-----------------------+-------------------+
| **Total Sekolah Pengguna**    | 1.250 sekolah         | **1 sekolah**         | -1.249 dummy      |
| **Total Guru Terdaftar**      | 396 guru              | **1 guru**            | -395 dummy        |
| **Total Siswa Terdata**       | 330 siswa             | **38 siswa**          | -292 dummy        |
| **Total Rombel / Kelas**      | 322 rombel            | **1 rombel**          | -321 dummy        |
| **Akun Super Administrator**  | 1 akun (superadmin)   | **1 akun (superadmin)**| 0 (Tetap aman)    |
+-------------------------------+-----------------------+-----------------------+-------------------+
```

### Rincian Sisa Data Riil yang Hidup di Database Development:
* **Sekolah:** 1 (`SMK OTOMINDO` — ID `01M2XXYD227F9S3H985FH53GMF`)
* **Guru:** 1 (`Eri Chandra A, S.Kom` — User `guru_chandra`, ID `01M2XXYD26H385F6RAW5PB6FBK`)
* **Mata Pelajaran:** 1 (`Koding & Kecerdasan Artifisial` — Kode `KODING`)
* **Rombel:** 1 (`X TO 3`)
* **Siswa:** 38 siswa asli kelas X TO 3
* **Akun Admin:** 1 (`superadmin` — `Super Administrator`)

---

# 2. Identifikasi Risiko Integritas Relasional (Foreign Key Risk)

Basis data SQLite di Ruang Pintar menerapkan `PRAGMA foreign_keys = ON;` dengan aturan relasi `onDelete: Restrict` pada sebagian besar relasi domain akademik.

### Risiko Utama:
1. **Foreign Key Violation Error:**  
   Jika tabel `sekolah` dihapus secara langsung (`DELETE FROM sekolah WHERE id != '...'`), kueri akan langsung gagal (*crash*) dengan error: `Foreign key constraint failed` karena masih dirujuk oleh puluhan tabel anak.
2. **Orphan Records:**  
   Jika pembersihan dilakukan secara acak tanpa memperhatikan dependensi relasi, record presensi, sesi ujian CBT, atau penempatan rombel dapat tertinggal tanpa induk.

---

# 3. Urutan Eksekusi Pembersihan Berjenjang (*Cascade-Safe Deletion Order*)

Pembersihan wajib dilakukan dalam **17 langkah terstruktur (Bottom-Up Deletion)**, dimulai dari tabel turunan terdalam hingga tabel induk:

```text
[LANGKAH 01] Evaluasi Ujian & CBT (EventIntegritasUjian, JawabanSiswa, HasilUjianCbt, SesiUjianSiswa, SnapshotUjian, UjianCbt, VersiSoal, BankSoal)
       ↓
[LANGKAH 02] Presensi & Sesi Pembelajaran (PresensiSesiKelas, SesiKelasAktual)
       ↓
[LANGKAH 03] Tugas & Materi KBM (PengumpulanTugas, PublikasiTugas, DefinisiTugas, PublikasiMateri, MateriPembelajaran, TujuanPembelajaran, LingkupMateri)
       ↓
[LANGKAH 04] Penilaian Akademik (NilaiSiswa, PublikasiNilaiAsesmen, DefinisiAsesmen)
       ↓
[LANGKAH 05] Penjadwalan (JadwalPelajaran, VersiJadwal, SlotWaktu, KalenderAkademik)
       ↓
[LANGKAH 06] Penugasan Pendidik (PenugasanWaliKelas, PenugasanMengajar)
       ↓
[LANGKAH 07] Kesiswaan & Rombel (PenempatanRombel, KeikutsertaanSiswa, Rombel)
       ↓
[LANGKAH 08] Kurikulum & Mata Pelajaran (MataPelajaran)
       ↓
[LANGKAH 09] Perwalian & Siswa (HubunganWaliSiswa, PengajuanWali, WaliMurid, Siswa)
       ↓
[LANGKAH 10] Profil Guru (Guru)
       ↓
[LANGKAH 11] Struktur Akademik (TingkatKelas, Fase, ProgramKeahlian, Semester, TahunAjaran)
       ↓
[LANGKAH 12] Struktur Organisasi (PenugasanJabatan, Jabatan, UnitOrganisasi)
       ↓
[LANGKAH 13] Komunikasi & Integrasi (Pengumuman, NotifikasiPengguna, LogAudit dummy, EndpointWebhook, KonfigurasiIntegrasi)
       ↓
[LANGKAH 14] Keanggotaan & Lisensi (LanggananTenant, TransaksiLangganan, KeanggotaanSekolah, SesiPengguna)
       ↓
[LANGKAH 15] Akun Pengguna Dummy (Pengguna)
       ↓
[LANGKAH 16] Sekolah Dummy (Sekolah)
       ↓
[LANGKAH 17] SQLite VACUUM & Optimize (Merapikan ukuran file database)
```

### Klausa Perlindungan (Guard Condition):
Pada setiap langkah, klausa WHERE wajib menyertakan filter proteksi mutlak:
```sql
WHERE sekolah_id != '01M2XXYD227F9S3H985FH53GMF' -- ID SMK OTOMINDO
```
Dan pada tabel pengguna:
```sql
WHERE id NOT IN (
  '01M2XXYD26H385F6RAW5PB6FBK', -- guru_chandra
  '01M2X9VHY431VPRAMTFJRPNHQZ'  -- superadmin
)
```

Rencana pembersihan aman ini siap dieksekusi melalui skrip otomatis terkontrol.
