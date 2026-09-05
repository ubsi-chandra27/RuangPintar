# RFC: Inisiatif Fitur Masa Depan (AI Copilot Guru, Notifikasi WhatsApp, & Akun Multi-Anak Wali Murid)

**Dokumen:** `RFC-2026-09-RP-001`  
**Status:** PROPOSED / READY FOR HUMAN REVIEW  
**Konteks Proyek:** Ruang Pintar — Modular Monolith School Digital Operating Platform  
**Target Modul:** 
- `M15 — Guardian & Family` (Akun Multi-Anak Wali Murid)
- `M16 — Communication & M17 — Notification` (WhatsApp Notification Adapter)
- `M20 / M21 — AI Extension` (Guru AI Copilot / Asisten Pembuat Materi & Soal CBT)

---

## 1. Latar Belakang & Motivasi

Berdasarkan masukan dari praktisi lapangan dan pemangku kepentingan sekolah, terdapat 3 kebutuhan esensial yang sangat relevan untuk meningkatkan adopsi nyata di sekolah-sekolah Indonesia:

1. **Efisiensi Guru dalam Administrasi & Evaluasi Pembelajaran (AI Copilot)**:
   - Guru menghabiskan banyak waktu menyusun instrumen evaluasi (butir soal pilihan ganda, distractor, rubrik) dan materi ajar.
   - Pemanfaatan AI Generatif (LLM) dapat mempercepat pembuatan draft butir soal CBT dan bahan ajar yang terstruktur berdasarkan Capaian Pembelajaran (CP) dan Tujuan Pembelajaran (TP).

2. **Jalur Komunikasi Efektif via WhatsApp (Bukan Hanya In-App)**:
   - Wali murid di Indonesia memiliki kebiasaan membuka aplikasi perpesanan WhatsApp jauh lebih aktif dibandingkan login berkala ke web portal sekolah.
   - Notifikasi kritis seperti presensi (anak alpa/terlambat/bolos), penurunan nilai akademis, remedial, dan pengumuman kedaruratan harus langsung sampai ke WhatsApp wali murid.

3. **Satu Akun Wali Murid untuk Banyak Anak (Multi-Child Single Login)**:
   - Banyak wali murid menyekolahkan 2 atau 3 anak sekaligus di sekolah yang sama (misal kakak di kelas XII, adik di kelas X).
   - Memaksa wali murid memiliki akun terpisah untuk setiap anak merupakan antipattern UX yang memberatkan orang tua dan memicu kebingungan operasional.

---

## 2. Inisiatif 1: AI Agent / Copilot Guru (Materi & Bank Soal CBT)

### 2.1 Arsitektur & Prinsip Inti: Human-in-the-Loop
> **Prinsip Utama:** AI berfungsi sebagai *Draft Generator* (asisten perancang), **BUKAN** penentu kebijakan atau penerbit otomatis.

```text
[Input Guru] 
  - Mata Pelajaran
  - Topik / TP Kurikulum Merdeka
  - Taksonomi Bloom (C1 - C6)
  - Jumlah & Jenis Soal (PG / Kompleks / Esai)
         │
         ▼
[AI Copilot Engine (LLM Adapter)]
  - Prompt Engineering Terstruktur
  - Validasi Skema JSON (Zod Validation)
  - Penyusunan Distractor (Pengecoh Masuk Akal) & Kunci Jawaban
         │
         ▼
[Draft Workbench Guru (Review, Edit & Verifikasi)]
  - Guru dapat mengedit teks soal, opsi jawaban, atau bobot
  - Guru WAJIB menekan "Setujui & Simpan ke Bank Soal"
         │
         ▼
[M14 Bank Soal Ruang Pintar]
```

### 2.2 Spesifikasi Fungsional AI Bank Soal & Materi
1. **Generator Butir Soal CBT Terstruktur**:
   - Menghasilkan butir soal pilihan ganda lengkap dengan opsi A-E, kunci jawaban objektif, dan penjelasan/pembahasan.
   - Mendukung format Kurikulum Merdeka (soal berbasis stimulus narasi, studi kasus, atau data tabel).
2. **Pengecekan Kualitas Distractor (Pilihan Pengecoh)**:
   - AI mengidentifikasi miskonsepsi umum peserta didik untuk membuat pilihan pengecoh yang mendidik, bukan jebakan semantik kosong.
3. **Penyusunan Rencana & Modul Ajar (M11 Extension)**:
   - Pembuatan ringkasan materi bahan ajar per pertemuan berdasarkan Silabus/TP yang sudah diinput guru di Workspace Kelas.

### 2.3 Safeguards & Batasan Teknis
- **Token & Rate Limiting**: Batasan kuota inferensi AI per guru per hari agar biaya API terkendali.
- **Isolasi Data Siswa (Privacy & PII)**: AI prompt **TIDAK PERNAH** mengirim data pribadi siswa (nama, NISN, nilai individual). Hanya data kurikulum dan materi yang dikirim ke LLM API.
- **Provider Agnostic**: Arsitektur adapter (Interface `AiCompletionProvider`) mendukung OpenAI, Google Gemini, Anthropic, atau model lokal (Ollama / Local LLM) untuk instalasi on-premise sekolah.

---

## 3. Inisiatif 2: Notifikasi WhatsApp (M16 Communication & M17 Notification)

### 3.1 Justifikasi Lapangan
Portal sekolah in-app sangat baik untuk data mendalam, namun memiliki *open-rate* rendah untuk kabar mendesak. WhatsApp memastikan pesan terbaca dalam hitungan menit oleh wali murid.

### 3.2 Alur & Event Prioritas WhatsApp Dispatch

```text
[Domain Event di Ruang Pintar]
  ├─ Presensi Kelas (M12): Siswa Tercatat ALPA / BOLOS
  ├─ Asesmen & Nilai (M13): Rilis Nilai Sumatif / Undangan Remedial
  ├─ CBT Engine (M14): Hasil Ujian CBT Diumumkan
  └─ Kesiswaan / Pengumuman: Surat Edaran Sekolah
         │
         ▼
[M17 Notification Dispatcher Service]
  - Filter Preferensi Wali Murid (Opt-in WhatsApp)
  - Template Engine (Variabel Dinamis: {nama_siswa}, {tanggal}, {mata_pelajaran})
         │
         ▼
[Asynchronous Job Queue (BullMQ / Database Queue)]
  - Retry mechanism (maks. 3 kali dengan exponential backoff)
  - Rate limiting (mencegah banned nomor dari Meta WhatsApp)
         │
         ▼
[WhatsApp Gateway Adapter]
  ├─ Meta Official WhatsApp Cloud API (Produksi Skala Besar)
  └─ Local / Self-hosted WhatsApp Gateway (Fonnte / Wablas / Baileys Gateway)
         │
         ▼
[Ponsel WhatsApp Wali Murid]
```

### 3.3 Template Pesan Standar (Bahasa Indonesia yang Santun & Informatif)

#### Contoh 1: Notifikasi Presensi (Alpa/Tidak Hadir)
```text
Yth. Bapak/Ibu Wali dari *Ahmad Fauzan*,

Kami menginformasikan bahwa ananda hari ini (Kamis, 04 September 2026) tercatat *TIDAK HADIR (ALPA)* pada jam pelajaran Matematika di Rombel X TO 1.

Mohon konfirmasi atau kirimkan surat keterangan sakit/izin melalui tautan berikut:
🔗 https://sekolah.ruangpintar.sch.id/wali/presensi

Salam hangat,
*SMA Ruang Pintar*
```

#### Contoh 2: Notifikasi Rilis Nilai & Remedial
```text
Yth. Bapak/Ibu Wali dari *Siti Sarah*,

Nilai Penilaian Sumatif Akhir Bab Fisika telah diterbitkan oleh Guru Pengampu (Bpk. Budi Santoso):
- Nilai: *68 / 100* (KKTP: 75)
- Status: *Belum Mencapai KKTP (Perlu Pendampingan)*

Jadwal pembelajaran pengayaan/remedial akan diinfokan lebih lanjut di lembar tugas siswa.
Rincian perkembangan akademis ananda dapat dilihat di:
🔗 https://sekolah.ruangpintar.sch.id/wali/rapor

Salam,
*SMA Ruang Pintar*
```

### 3.4 Prinsip Keandalan & Keamanan WhatsApp Adapter
- **Idempotency Key**: Setiap event presensi/nilai memiliki hash ID unik agar wali murid tidak menerima pesan duplikat saat terjadi retry.
- **Fail-safe Graceful Degradation**: Jika WhatsApp gateway offline atau kuota habis, notifikasi otomatis beralih (*fallback*) ke in-app notification dan log peringatan dicatat di sistem admin.
- **Anti-Spam & Quiet Hours**: Jam pengiriman dibatasi (misal pukul 07.00 – 19.00 WIB) kecuali pesan darurat khusus.

---

## 4. Inisiatif 3: Satu Akun Wali untuk Multi-Anak (M15 Guardian Experience)

### 4.1 Identifikasi Masalah & Prinsip PR-GUARDIAN-005
Wali murid hanya memiliki **1 akun login** (`Pengguna` dengan `peran_dasar: "GUARDIAN"`). Hubungan antara 1 wali murid dengan banyak anak dimodelkan melalui entitas relasi n:m (`WaliMuridSiswa`).

```text
[Akun Pengguna: Bpk. Hendra Gunawan] (Role: GUARDIAN)
                 │
                 ▼
[Profil Wali Murid: Bpk. Hendra Gunawan]
   ├── Relasi 1 (Ayah Kandung) ──► Siswa 1: Aditia Gunawan (Kelas XII RPL 1)
   └── Relasi 2 (Ayah Kandung) ──► Siswa 2: Putri Gunawan (Kelas X TO 2)
```

### 4.2 Rancangan UI/UX: Child Switcher (Academic Glass UI)
- Di bagian atas header portal wali murid, selalu tersedia dropdown **Pilih Ananda**:
  ```text
  [ 👨‍🎓 Aditia Gunawan (XII RPL 1)  ▼ ]
  ├── 👨‍🎓 Aditia Gunawan (XII RPL 1) [Aktif]
  └── 👩‍🎓 Putri Gunawan (X TO 2)
  ```
- Saat wali murid berpindah pilihan anak, seluruh konteks halaman (jadwal pelajaran, presensi harian, buku nilai, dan catatan konseling) langsung beralih secara reaktif tanpa perlu *log out* dan *log in* ulang.

### 4.3 Scoping & Server-Side Security
- **Strict Relationship Validation**: Server-side guard memastikan bahwa setiap request wali murid untuk membaca data nilai/presensi memverifikasi:
  ```ts
  const relation = await prisma.waliMuridSiswa.findFirst({
    where: {
      wali_murid: { pengguna_id: user.id },
      siswa_id: targetSiswaId,
      status_verifikasi: "TERVERIFIKASI",
    }
  });
  if (!relation) throw new ForbiddenError("Akses terhadap siswa ini tidak diizinkan.");
  ```
- **Zero Cross-Leakage**: Wali murid sama sekali tidak dapat mengakses nilai atau presensi siswa lain yang bukan anak terverifikasi mereka.

---

## 5. Rencana & Urutan Roadmap yang Direkomendasikan

Agar integritas arsitektur modular monolith tetap terjaga sesuai aturan `AGENTS.md` ("SATU PHASE AKTIF", "NO SCOPE CREEP"):

| No | Inisiatif | Rekomendasi Phase | Kesiapan Fondasi |
|:---|:---|:---|:---|
| 1 | **Multi-Child Guardian Experience** | **Phase 15 (Guardian & Family)** | Sangat Siap (Tabel `wali_murid` & `wali_murid_siswa` sudah tersedia di skema basis data). Langsung dikerjakan pada Phase 15. |
| 2 | **WhatsApp Notification Adapter** | **Phase 16 (Communication) / Phase 17 (Notification)** | Menunggu Phase 15 tuntas. Memerlukan service queue dan integrasi webhook WhatsApp. |
| 3 | **Guru AI Copilot (Bank Soal & Materi)** | **Phase 20 / Special AI Milestone** | Berdiri di atas Bank Soal M14 dan Modul Ajar M11 yang telah matang dan stabil. |

---

## 6. Kesimpulan & Rekomendasi untuk Human Reviewer

1. Ketiga ide dari pengguna dan praktisi lapangan **sangat relevan, aplikatif, dan menyelesaikan titik sakit nyata** di sekolah Indonesia.
2. Seluruh ide telah dipetakan ke dalam arsitektur modul yang tepat tanpa merusak fase aktif CBT (Phase 14).
3. Tim pengembang siap melanjutkan ke Phase 15 (Guardian Experience & Multi-Child Portal) segera setelah Phase 14 mendapatkan persetujuan resmi (*Human Approval*).
