# USER FLOW MAP — PETA ALUR PENGGUNA UTAMA
## Ruang Pintar — Diagram Alur Perjalanan Pengguna Langkah demi Langkah

**Dokumen:** Peta Alur Pengguna (*User Flow Map*)  
**Status:** PROPOSED — READY FOR HUMAN REVIEW  
**Tanggal:** 22 September 2026  
**Target:** Seluruh Alur Kerja Kritis Lintas Peran  
**Tujuan:** Menjadi rujukan baku perancangan interaksi antarmuka dan navigasi halaman.

---

# 1. Tujuh Alur Pengguna Utama (*Core User Flows*)

---

## 1. Flow Guru: Sesi Pembelajaran Harian (Routine Class Session)

```mermaid
sequenceDiagram
    autonumber
    actor G as Guru Mata Pelajaran
    participant C as Teacher Cockpit (/dashboard)
    participant W as Classroom Workspace (/kelas-saya/[id])
    participant P as Presensi Modal (15 Detik)
    participant J as Jurnal KBM

    G->>C: Buka Aplikasi di Ponsel / Laptop
    Note over C: Hero Card Sesi Aktif: XII RPL 1 (PBO)
    G->>P: Klik [ Presensi Kilat 15 Detik ]
    P->>P: Klik [ Tandai Semua Hadir ] -> Ubah 1 Siswa Sakit -> Simpan
    P-->>C: Presensi Tersimpan (15 Detik Selesai)
    G->>W: Klik [ Buka Kelas Sekarang > ]
    Note over W: Masuk Ruang Kerja Kelas (Materi, Tugas, Kuis)
    G->>J: Buka Tab Jurnal KBM -> Masukkan Refleksi Sesi (1 Kalimat)
    G->>W: Klik [ Selesaikan Sesi ]
    Note over W: Status Sesi SELESAI, Data Tersinkronisasi Otomatis
```

---

## 2. Flow Guru: Pembuatan Ujian & Koreksi Cerdas (AI Exam & Paper Correction)

```mermaid
flowchart TD
    Start["Guru Buka Bank Soal & Asesmen"] --> AI_Gen["Pilih TP -> Klik [ Generate Paket Ujian AI ]"]
    AI_Gen --> ReviewSoal["Tinjau Naskah Ujian & Kunci Jawaban"]
    ReviewSoal --> PrintLJK["Cetak Naskah Soal & LJK Dinamis A4 (Kertas Fotokopi Biasa)"]
    PrintLJK --> ExamDay["Pelaksanaan Ujian di Ruang Kelas (Siswa Mengisi LJK Fisik)"]
    ExamDay --> ScanHP["Guru Buka [ Foto Absen / LJK AI ] di Kamera Smartphone"]
    ScanHP --> AutoGrade["Sistem Deteksi Bulatan Pensil/Pulpen (1 Detik/Lembar)"]
    AutoGrade --> Gradebook["Nilai Otomatis Masuk ke Buku Nilai Gradebook & Leger Rapor"]
```

---

## 3. Flow Wali Kelas: Monitoring Leger & Pembagian Rapor (Semester Wrap-Up)

```mermaid
flowchart TD
    Start["Wali Kelas Buka [ Panel Wali Kelas ]"] --> Radar["Cek Radar Kesiapan Leger Rapor (14 Guru Mapel)"]
    Radar --> Check{"Apakah Semua Guru Sudah Setor Nilai?"}
    
    Check -->|"Ada 2 Guru Belum"| AlertGuru["Klik [ Ingatkan Guru Mapel via WhatsApp ]"]
    AlertGuru --> Radar
    
    Check -->|"100% Guru Selesai"| AI_Remarks["Klik [ Generate Catatan Sikap & Motivasi AI ]"]
    AI_Remarks --> ReviewRemarks["Tinjau & Sesuaikan Catatan Karakter 36 Siswa"]
    ReviewRemarks --> PrintRapor["Klik [ Cetak Rapor Resmi Massal A4 ]"]
    PrintRapor --> Handover["Hari Pembagian Rapor ke Orang Tua Murid"]
```

---

## 4. Flow Siswa: Pembelajaran & Pengumpulan Tugas (Assignment Submission)

```mermaid
sequenceDiagram
    autonumber
    actor S as Siswa
    participant Dash as Student Cockpit (/siswa)
    participant Task as Halaman Tugas (/siswa/tugas/[id])
    participant Teacher as Notifikasi Guru

    S->>Dash: Buka Aplikasi di Smartphone
    Note over Dash: Cek Countdown Deadline: "Tugas PBO (Sisa 4 Jam)"
    S->>Task: Klik Kartu Tugas -> Buka Instruksi & Lembar Kerja
    S->>Task: Ketik Jawaban / Upload Berkas PDF / Foto Catatan
    S->>Task: Klik [ Kumpulkan Tugas ]
    Task-->>Dash: Status Tugas Berubah: [ SELESAI DIKUMPULKAN ]
    Task-->>Teacher: Masuk ke Antrean Periksa Guru
```

---

## 5. Flow Siswa: Ujian CBT Tenang & Adil (Calm CBT Attempt)

```mermaid
flowchart TD
    Start["Siswa Buka Menu CBT -> Pilih Ujian Terjadwal"] --> EnterCBT["Klik [ Mulai Ujian ] -> Layar Beralih ke Mode Bebas Gangguan"]
    EnterCBT --> InExam["Mengerjakan Soal (Timer Server Aktif & Jawaban Ter-Autosave)"]
    InExam --> BlurDetect{"Apakah Siswa Keluar Layar / Ganti Tab?"}
    
    BlurDetect -->|"Pelanggaran 1"| WarnAudio["Peringatan Santun: Harap Kembali ke Ujian"]
    BlurDetect -->|"Pelanggaran 2"| LockExam["Sesi Terkunci: Butuh Izin Pengawas Guru"]
    BlurDetect -->|"Tertib"| Finish["Menjawab Seluruh Soal -> Klik [ Selesai & Kirim ]"]
    
    LockExam --> Proctor["Guru Membuka Kunci di Panel Pengawas"] --> InExam
    Finish --> ScoreReady["Jawaban Tersimpan di Server Boundary"]
```

---

## 6. Flow Orang Tua (Guardian): Pengawasan Kehadiran & Pengajuan Izin

```mermaid
sequenceDiagram
    autonumber
    actor Ortu as Orang Tua Murid
    participant HP as Notifikasi WhatsApp / Push
    participant App as Portal Wali Murid (/orang-tua)
    participant Wali as Wali Kelas

    HP-->>Ortu: 07:15 WIB: Notifikasi Kehadiran ("Doni Hadir di Lab RPL 2")
    Note over Ortu: Hati Tenang, Anak Sudah Sampai Sekolah
    
    alt Skenario Anak Sakit di Rumah
        Ortu->>App: Buka Menu [ Ajukan Izin / Sakit ]
        Ortu->>App: Pilih Tanggal & Foto Surat Dokter dari Kamera HP
        Ortu->>App: Klik [ Kirim Pengajuan Izin ]
        App-->>Wali: Notifikasi Masuk ke Radar Wali Kelas
        Wali->>Wali: Tinjau Foto Surat Dokter -> Klik [ Setujui ]
        Wali-->>Ortu: Notifikasi Izin Disetujui, Presensi Anak Tercatat Resmi SAKIT
    end
```

---

## 7. Flow Operator: Konfigurasi Semester Baru & Jadwal Anti-Bentrok

```mermaid
flowchart TD
    Start["Buka Tahun Ajaran Baru di Operator Command Center"] --> Rombel["Buat Rombel Kelas & Plotting Roster Siswa"]
    Rombel --> SK["Input SK Penugasan Beban Jam Dewan Guru"]
    SK --> Jadwal["Buka Papan Alokasi Jadwal Pelajaran Mingguan"]
    
    Jadwal --> DragSlot["Tarik Jam Mengajar Guru ke Slot Waktu & Ruangan"]
    DragSlot --> ConflictCheck{"Apakah Terjadi Bentrok Guru / Ruangan?"}
    
    ConflictCheck -->|"Ya (Bentrok)"| Reject["Sistem Tolak Simpan & Tandai Merah: 'Pak Joko Sudah Mengajar di Jam Ini'"]
    Reject --> DragSlot
    
    ConflictCheck -->|"Tidak (Aman)"| PublishJadwal["Klik [ Terbitkan Jadwal Pelajaran Resmi ]"]
    PublishJadwal --> LiveSync["Jadwal Otomatis Muncul di Cockpit Guru & Siswa"]
```
