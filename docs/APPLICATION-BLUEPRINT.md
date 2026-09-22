# APPLICATION BLUEPRINT — CETAK BIRU APLIKASI FINAL
## Ruang Pintar — Struktur Aplikasi, Alur Navigasi, dan Titik Masuk Peran

**Dokumen:** Cetak Biru Arsitektur Aplikasi Tingkat Tinggi  
**Status:** PROPOSED — READY FOR HUMAN REVIEW  
**Tanggal:** 22 September 2026  
**Target:** Referensi Tunggal Sebelum Desain Antarmuka High-Fidelity  
**Tujuan:** Memvisualisasikan peta navigasi menyeluruh, interkoneksi antar-area, dan alur perjalanan pengguna dari login hingga eksekusi operasional.

---

# 1. Peta Struktur Aplikasi Global (*Global Application Map*)

```mermaid
flowchart TD
    subgraph PublicArea["1. AREA PUBLIK & ONBOARDING"]
        Landing["Landing Page (ruangpintar.id)"]
        SearchSchool["Cari / Daftarkan Sekolah"]
        AuthGlobal["Login / Registrasi Akun Global & Avatar"]
        Wizard["First-Login Glass Wizard (4 Langkah Cepat)"]
    end

    subgraph AuthSession["2. GERBANG SESI & WORKSPACE ROUTER"]
        SessionGuard{"Resolusi Sesi & Workspace Aktif"}
    end

    subgraph OperationalSpaces["3. RUANG KERJA OPERASIONAL BERBASIS PERAN"]
        GuruSpace["ROUTER GURU: Teacher Cockpit & Classroom Workspace"]
        WaliSpace["ROUTER WALI KELAS: Homeroom Cockpit & Leger Radar"]
        OperatorSpace["ROUTER OPERATOR: Command Center & Master Data"]
        PimpinanSpace["ROUTER PIMPINAN: Executive Radar KBM & Approval"]
        SiswaSpace["ROUTER SISWA: Student Cockpit & CBT Player"]
        GuardianSpace["ROUTER WALI MURID: Guardian Portal & Multi-Child"]
    end

    Landing --> SearchSchool --> AuthGlobal --> Wizard --> SessionGuard
    AuthGlobal --> SessionGuard
    
    SessionGuard -->|"Peran: Guru"| GuruSpace
    SessionGuard -->|"Peran: Wali Kelas"| WaliSpace
    SessionGuard -->|"Peran: Operator"| OperatorSpace
    SessionGuard -->|"Peran: Kepala Sekolah / Waka"| PimpinanSpace
    SessionGuard -->|"Peran: Siswa"| SiswaSpace
    SessionGuard -->|"Peran: Orang Tua"| GuardianSpace
```

---

# 2. Titik Masuk Setiap Peran (*Role Entry Points*)

```text
+----+-------------------+-----------------------+-----------------------------+-------------------------------+
| No | Peran Pengguna    | Rute Masuk Utama      | Titik Pendaratan Awal       | Misi Utama 30 Detik Pertama   |
+----+-------------------+-----------------------+-----------------------------+-------------------------------+
| 1  | GURU MAPEL        | `/dashboard`          | Teacher Cockpit             | Lihat kelas jam ke-1 &        |
|    |                   |                       | (Hero Card Sesi Aktif)      | tombol Presensi Kilat 15 Detik|
+----+-------------------+-----------------------+-----------------------------+-------------------------------+
| 2  | WALI KELAS        | `/wali-kelas`         | Homeroom Radar              | Cek absensi rombel hari ini & |
|    |                   |                       | (Kesehatan 36 Siswa)        | progres nilai guru mapel      |
+----+-------------------+-----------------------+-----------------------------+-------------------------------+
| 3  | OPERATOR SEKOLAH  | `/sekolah/master`     | Operator Command Center     | Cek validitas rombel, jadwal, |
|    |                   |                       | (Status Data Akademik)      | dan antrean perbaikan NISN    |
+----+-------------------+-----------------------+-----------------------------+-------------------------------+
| 4  | WAKA KURIKULUM    | `/kurikulum/radar`    | Academic Radar              | Pantau KBM berjalan & guru    |
|    |                   |                       | (Denyut KBM Hari Ini)       | yang belum isi jurnal hari ini|
+----+-------------------+-----------------------+-----------------------------+-------------------------------+
| 5  | KEPALA SEKOLAH    | `/eksekutif`          | Executive Leadership Radar  | Pastikan sekolah tertib &     |
|    |                   |                       | (Ringkasan 30 Detik)        | tanda tangan persetujuan SPK  |
+----+-------------------+-----------------------+-----------------------------+-------------------------------+
| 6  | SISWA             | `/siswa`              | Student Cockpit             | Cek jadwal pelajaran & hitung |
|    |                   |                       | (Jadwal & Tugas)            | mundur batas akhir tugas      |
+----+-------------------+-----------------------+-----------------------------+-------------------------------+
| 7  | WALI MURID        | `/orang-tua`          | Guardian Portal             | Dapatkan kepastian kehadiran  |
|    |                   |                       | (Live Kehadiran Anak)       | anak & pengawasan tugas rumah |
+----+-------------------+-----------------------+-----------------------------+-------------------------------+
```

---

# 3. Alur Navigasi Utama: Dari Cockpit Menuju Aksi

```mermaid
sequenceDiagram
    autonumber
    actor Guru as Guru Mata Pelajaran
    participant Cockpit as Teacher Cockpit (/dashboard)
    participant Class as Classroom Workspace (/kelas-saya/[id])
    participant Session as Sesi Kelas Aktual
    participant Ledger as Leger & Wali Kelas

    Guru->>Cockpit: Buka Aplikasi di Jam 07:15
    Note over Cockpit: Menampilkan Hero Card Sesi Aktif: XII RPL 1 (PBO)
    Guru->>Cockpit: Klik [ Presensi Kilat 15 Detik ]
    Cockpit->>Session: Simpan Presensi Rombel (1 Klik Hadir)
    Session-->>Ledger: Sinkronisasi Status Sakit/Alpha ke Wali Kelas Realtime
    
    Guru->>Cockpit: Klik [ Buka Kelas Sekarang > ]
    Cockpit->>Class: Masuk Ruang Kerja Kelas Terpadu
    Note over Class: Tab Presensi, Jurnal, Materi, Tugas, Nilai, CBT
    Guru->>Class: Buka Tab Jurnal KBM -> Simpan Refleksi Sesi
    Guru->>Class: Klik [ Selesaikan Sesi ]
    Class-->>Cockpit: Status Sesi Selesai, Cockpit Berganti ke Kelas Berikutnya
```

---

# 4. Standar Transisi Navigasi & Keamanan Konteks

1. **Prinsip Zero-Data-Leakage:**
   Setiap perpindahan antar-menu atau antar-workspace selalu diverifikasi server-side melalui `TenantContext` & `ActiveWorkspaceId`. Tidak ada URL yang dapat dimanipulasi klien untuk mengintip data sekolah atau kelas lain.
2. **Kesesuaian dengan Academic Glass UI v1.2:**
   Seluruh halaman menggunakan palet warna semantik yang konsisten (Cobalt untuk aksi utama, Emerald untuk kehadiran/tuntas, Amber untuk perhatian khusus, dan Rose untuk status kritis/alpha).
3. **Penyederhanaan Total:**
   Menghilangkan menu-menu birokrasi yang membebani guru, mengunci fokus aplikasi pada satu filosofi tunggal: **Membantu guru mengajar dengan cepat, tertib, dan menyenangkan.**
