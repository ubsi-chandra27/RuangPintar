# BUSINESS REALITY AUDIT — TEACHER WORKSPACE
## STAGE 10.7: Audit Angka, Asumsi, Hardcoded Fallback, & Kepatuhan Data Riil

| Atribut | Nilai Faktual |
| --- | --- |
| **Produk / Modul** | Ruang Pintar — Teacher Workspace |
| **Tanggal Audit** | 24 September 2026 |
| **Status Temuan** | **CRITICAL & MATERIAL FINDINGS IDENTIFIED** |
| **Prinsip Utama** | *Real Data or Honest Empty State — No Fake Metrics, No Fallback Slop* |
| **Referensi Aturan** | Anti-Slop Core (R-17, R-18, R-27, R-38), Fikran Engineering Guidelines |

---

## 1. Latar Belakang & Tujuan Audit

Dalam pengembangan aplikasi operasional sekolah, kredibilitas antarmuka di hadapan guru dan manajemen sekolah sangat bergantung pada **kejujuran data (business reality)**. Sebuah dashboard atau antarmuka modul yang menampilkan angka buatan, asumsi otomatis, atau fallback hardcoded (seperti tiba-tiba menampilkan nilai 85.0 atau kehadiran 100% saat belum ada KBM) akan langsung merusak kepercayaan pengguna terhadap sistem.

Audit ini dilakukan secara mendalam pada 9 halaman utama Teacher Workspace untuk mengidentifikasi setiap angka, statistik, badge, indikator, dan metrik yang muncul bukan dari data riil pengguna.

---

## 2. Temuan Kritis: Metrik Asumsi, Hardcoded Fallback, & Mock Data

### 2.1. Hardcoded Fallback Nilai Siswa (Teacher Dashboard Line 119)
- **Lokasi Kode:** `src/shared/components/dashboard/role-views/teacher-dashboard.tsx` (baris 118-121)
- **Kode Aktual:**
  ```typescript
  score: o.rata_rata_kelas ?? (o.total_published > 0 ? 88.0 : 85.0),
  ```
- **Masalah:**
  Jika guru belum menginput nilai siswa pada suatu rombel (`rata_rata_kelas` bernilai `null`), sistem secara sepihak memaksakan angka **88.0** (jika ada asesmen terbit) atau **85.0** (jika belum ada nilai sama sekali)!
- **Dampak Bisnis:**
  Guru yang baru membuat kelas dan belum mengadakan ujian langsung melihat grafik performa kelas bertuliskan nilai **85.0** seolah-olah kelas tersebut sudah tuntas dinilai dengan nilai tinggi. Ini adalah pelanggaran berat terhadap prinsip integritas akademik (*fake KPI*).
- **Rekomendasi Solusi:**
  Hapus fallback `88.0 : 85.0`. Jika `rata_rata_kelas` bernilai `null`, tampilkan `null` dan render status *"Belum Ada Nilai"* atau `0.0` dengan label informatif *"Belum ada asesmen dinilai"*.

---

### 2.2. Asumsi Kehadiran 100% & Jurnal 100% (Teacher Dashboard Line 283 & 300)
- **Lokasi Kode:** `src/shared/components/dashboard/role-views/teacher-dashboard.tsx` (baris 280-305)
- **Kode Aktual:**
  ```tsx
  <DonutGauge
    percentage={hasSessionsToday ? 100 : 0}
    label="Siswa Hadir"
    color="emerald"
    size={62}
  />
  ...
  <DonutGauge percentage={0} label="Sakit/Izin" color="amber" size={62} />
  <DonutGauge
    percentage={hasSessionsToday ? 100 : 0}
    label="Jurnal Diisi"
    color="indigo"
    size={62}
  />
  ```
- **Masalah:**
  1. Gauge *"Siswa Hadir"* otomatis disetel ke **100%** hanya karena ada sesi KBM hari ini (`hasSessionsToday`), tanpa menghitung record presensi siswa riil di tabel `presensi_sesi_kelas`!
  2. Gauge *"Jurnal Diisi"* otomatis disetel ke **100%** hanya karena ada sesi KBM, tanpa memeriksa apakah guru benar-benar telah mengisi materi dan refleksi pada `administrasi_pembelajaran`!
  3. Gauge *"Sakit/Izin"* di-hardcode mati ke **0%**.
- **Dampak Bisnis:**
  Guru melihat statistik kehadiran siswa sempurna 100% dan jurnal mengajar lengkap, padahal guru baru saja menekan tombol buka kelas dan belum mengabsen satu pun siswa.
- **Rekomendasi Solusi:**
  Hitung persentase kehadiran nyata:
  $$\text{Persentase Hadir} = \frac{\text{Jumlah Siswa Berstatus HADIR}}{\text{Total Siswa Terdaftar di Rombel}} \times 100\%$$
  Jika sesi kelas baru dibuka dan belum diabsen, tampilkan **0%** dengan keterangan *"Presensi belum diambil"*.

---

### 2.3. Label "Total Sesi: 0 Jam" pada Jadwal Saya
- **Lokasi Kode:** `src/app/jadwal-saya/page.tsx` (baris 155-157)
- **Kode Aktual:**
  ```tsx
  <span>Total Sesi: <strong>{entries.length} Jam</strong></span>
  ```
- **Masalah:**
  Satuan `entries.length` adalah jumlah entri jadwal per slot, bukan satuan Jam atau Jam Pelajaran (JP). Jika jadwal belum disusun oleh kurikulum sekolah (seperti kondisi SMK OTOMINDO saat ini), kartu menampilkan teks kaku: `Total Sesi: 0 Jam`, `Mata Pelajaran: 0`, `Rombel: 0`.
- **Rekomendasi Solusi:**
  Gunakan penanganan status bersyarat:
  - Jika `entries.length === 0`, tampilkan badge bernilai *"Belum Dijadwalkan"* dengan tombol aksi cepat atau tautan ke admin kurikulum.

---

### 2.4. Ringkasan BAB, Materi, Tugas, Jurnal pada Kartu Kelas
- **Lokasi Kode:** `src/modules/learning/presentation/teacher-classes-view.tsx` (baris 824-858)
- **Kondisi Faktual:**
  Saat ini menampilkan angka `0` untuk BAB, Materi, Tugas, dan Jurnal.
- **Evaluasi:**
  Penghitungan angka `0` ini **sah dan riil** (bukan hardcoded), karena bersumber langsung dari `a.lingkup_materi.length`, `a.publikasi_materi.length`, `a.publikasi_tugas.length`, dan `a.administrasi_pembelajaran.length`.
- **Penyempurnaan UX:**
  Angka `0` polos tanpa konteks sering membingungkan guru baru. Tampilkan micro-label interaktif: jika `total_bab === 0`, berikan status subtle *"Belum disusun"*, dan saat diklik langsung mengarahkan guru ke tab pembuatan Lingkup Materi (BAB) pertama.

---

### 2.5. CBT Hub: Statistik Ujian & Partisipasi Tanpa Data
- **Lokasi Kode:** `src/modules/cbt/presentation/cbt-hub-overview-view.tsx` (baris 175-212)
- **Kondisi Faktual:**
  Ketika sekolah belum membuat ujian CBT, 4 kartu KPI menampilkan:
  - Total Kelas Diampu: 1 Rombel
  - Total Ujian CBT: 0 Ujian
  - Ujian Terbit / Aktif: 0 Siap Dikerjakan
  - Total Partisipasi: 0 Sesi Peserta
- **Evaluasi:**
  Data bersumber riil dari query database, namun kartu KPI tetap menyala dengan border biru/hijau seolah-olah sistem sedang beroperasi aktif.
- **Penyempurnaan UX:**
  Terapkan empty state bertingkat: jika belum ada ujian sama sekali, redupkan kontras KPI dan berikan CTA utama: *"Buat Ujian CBT Pertama"* atau *"Susun Bank Soal dengan AI"*.

---

## 3. Matriks Audit 9 Halaman Teacher Workspace

Berikut hasil audit integritas data pada seluruh halaman Teacher Workspace:

| Halaman | Rute | Sumber Data Aktif | Temuan Asumsi / Hardcoded | Status Kepatuhan Data |
| :--- | :--- | :--- | :--- | :---: |
| **Dashboard Guru** | `/dashboard` | `TeacherFacade`, `scheduleService`, `classSessionService` | Fallback nilai 88.0/85.0; Asumsi kehadiran 100%; Asumsi jurnal 100%. | **TIDAK PATUH (Perlu Remediasi)** |
| **Kelas Saya** | `/kelas-saya` | `learningService.listTeacherClasses` | Data riil dari Prisma (`total_bab`, `total_siswa`, dll). | **PATUH (Perlu Micro-UX Empty State)** |
| **Workspace Kelas Detail** | `/kelas-saya/[id]` | `learningService.getClassWorkspace` | Data riil dari database penugasan, presensi, dan nilai. | **PATUH** |
| **Jadwal Mengajar** | `/jadwal-saya` | `scheduleService.listTeacherSchedule` | Data riil, namun teks "0 Jam" saat jadwal kosong kurang kontekstual. | **PATUH BERSYARAT** |
| **Sesi KBM Aktual** | `/sesi-pembelajaran` | `classSessionService.listSessions` | Data riil sesi kelas aktif. | **PATUH** |
| **Kalender Akademik** | `/kalender-akademik` | `calendarService.listEvents` | Data riil, menampilkan 0 agenda secara jujur. | **PATUH** |
| **Presensi Kehadiran** | `/presensi-kelas` | `attendanceService.getOverallAttendanceStats` | Data riil, rata-rata kehadiran 0% saat belum ada sesi. | **PATUH** |
| **Buku Nilai & Rapor** | `/penilaian` | `assessmentService.getTeacherOverview` | Data riil, rata-rata kelas menampilkan "-" jika kosong. | **PATUH** |
| **CBT Ujian Online** | `/cbt-ujian` | Query `ujian_cbt` & `sesi_ujian_siswa` | Data riil, menampilkan 0 ujian. | **PATUH** |
| **Asisten AI Guru** | `/asisten-ai` | Integrasi Google Gemini API | Model dinamis, opsi mapel diambil dari penugasan guru riil. | **PATUH** |

---

## 4. Standar Penyajian Data Bisnis (Business Reality Contract)

Mulai STAGE 10.7, seluruh modul diwajibkan mematuhi aturan baku berikut:

```text
1. DATA TIDAK ADA != ANGKA ESTIMASI / TEBAKAN
   Dilarang keras menyuntikkan angka asumsi (misal: 85, 100%, 75%) untuk mempercantik grafik.

2. LABEL STATUS KETIADAAN DATA HARUS KONTEKSTUAL:
   - Modul Kurikulum/BAB   -> "Belum Disusun" (bukan "0" mati)
   - Modul Jadwal         -> "Belum Dijadwalkan oleh Kurikulum"
   - Modul Presensi       -> "Belum Ada Sesi Kelas Berlangsung"
   - Modul Penilaian      -> "Belum Ada Nilai Masuk"
   - Modul CBT            -> "Belum Ada Paket Ujian Aktif"
   - Modul Wali Murid     -> "Belum Terhubung dengan Akun Wali"

3. EMPTY STATE SEBAGAI JALAN KELUAR (ACTIONABLE EMPTY STATE):
   Setiap kartu atau tabel yang kosong wajib menyediakan tombol aksi langsung 
   untuk menyelesaikan ketiadaan data tersebut.
```
