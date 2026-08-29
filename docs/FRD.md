# FRD — FUNCTIONAL REQUIREMENTS DOCUMENT
## Ruang Pintar

**Versi:** 1.0  
**Status:** BASELINE RESMI  
**Bahasa Utama:** Bahasa Indonesia  

---

# 1. Tujuan

FRD mendefinisikan **fungsi yang wajib dapat dilakukan Ruang Pintar**.

Requirement diberi identifier agar dapat dirujuk dalam:

- prompt phase;
- implementation;
- test;
- review;
- acceptance criteria.

---

# 2. Authentication & Identity

## FR-AUTH-001
Pengguna dapat login menggunakan username dan password yang valid.

## FR-AUTH-002
Email bukan identifier login utama.

## FR-AUTH-003
Public registration tidak tersedia pada baseline.

## FR-AUTH-004
Akun disabled/inactive tidak dapat membuat session baru.

## FR-AUTH-005
Login harus memiliki rate limiting.

## FR-AUTH-006
Jika `must_change_password` aktif, pengguna diarahkan ke flow penggantian password sebelum mengakses area normal.

## FR-AUTH-007
Pengguna dapat logout dan session menjadi tidak valid.

## FR-AUTH-008
Password tidak disimpan dalam plain text.

---

# 3. Authorization

## FR-AUTHZ-001
Semua action sensitif harus diperiksa server-side.

## FR-AUTHZ-002
Effective access mengikuti:

```text
Identity
→ Base Role
→ Position/Assignment/Relationship
→ Permission
→ Resource Scope
```

## FR-AUTHZ-003
Jika akses tidak dapat dibuktikan, sistem harus deny.

## FR-AUTHZ-004
UI hiding tidak menggantikan authorization.

## FR-AUTHZ-005
Teacher tidak memiliki akses otomatis ke seluruh kelas.

## FR-AUTHZ-006
Guardian tidak memiliki akses ke siswa tanpa verified relationship.

## FR-AUTHZ-007
Leadership role tidak otomatis menjadi system admin.

---

# 4. School & Organization

## FR-SCH-001
Sistem dapat menyimpan identitas sekolah.

## FR-SCH-002
Sistem dapat mengelola unit organisasi.

## FR-SCH-003
Sistem dapat mengelola position.

## FR-SCH-004
Position assignment harus memiliki konteks waktu/effective period bila relevan.

---

# 5. Academic Period & Structure

## FR-ACA-001
Sistem dapat mengelola Tahun Ajaran.

## FR-ACA-002
Tahun Ajaran dapat memiliki Semester.

## FR-ACA-003
Sistem dapat mengelola Phase.

## FR-ACA-004
Sistem dapat mengelola Grade Level.

## FR-ACA-005
Sistem dapat mengelola Program secara opsional.

## FR-ACA-006
Sistem dapat mengelola Rombel.

## FR-ACA-007
Struktur akademik tidak boleh mengunci sistem hanya untuk SMK.

---

# 6. Student Academic Lifecycle

## FR-STU-001
Sistem dapat menyimpan identitas siswa.

## FR-STU-002
Sistem dapat membuat keikutsertaan akademik siswa untuk periode tertentu.

## FR-STU-003
Sistem dapat menempatkan siswa ke rombel.

## FR-STU-004
Perubahan rombel/periode tidak menghapus histori penempatan sebelumnya.

## FR-STU-005
Student Identity tidak boleh disamakan dengan enrollment.

## FR-STU-006
Enrollment tidak boleh disamakan dengan rombel placement.

---

# 7. Teacher & Teaching Assignment

## FR-TCH-001
Sistem dapat menyimpan profil guru.

## FR-TCH-002
Sistem dapat mengelola mata pelajaran.

## FR-TCH-003
Sistem dapat membuat Teaching Assignment untuk guru, mata pelajaran, kelas, dan periode.

## FR-TCH-004
Teacher authority terhadap kelas berasal dari Teaching Assignment aktif.

## FR-TCH-005
Workload dapat diturunkan dari Teaching Assignment aktif.

## FR-TCH-006
Teaching Assignment historis tetap dapat ditelusuri.

---

# 8. Academic Calendar

## FR-CAL-001
Sistem dapat menyimpan kalender akademik.

## FR-CAL-002
Kalender dapat mencatat hari efektif/non-efektif dan event akademik relevan.

## FR-CAL-003
Academic Calendar tidak boleh dipakai sebagai pengganti Master Schedule.

---

# 9. Scheduling & Class Session

## FR-SCHD-001
Sistem dapat mengelola Master Schedule.

## FR-SCHD-002
Schedule dapat memiliki lifecycle/version/publish sesuai kebutuhan.

## FR-SCHD-003
Sistem dapat membentuk Actual Class Session berdasarkan jadwal/konteks yang sah.

## FR-SCHD-004
Actual Class Session menjadi konteks untuk presensi kelas dan administrasi pertemuan.

## FR-SCHD-005
Guru hanya dapat membuka sesi yang berada dalam Teaching Assignment/scope yang sah.

## FR-SCHD-006
Sistem menyediakan manual scheduling dengan intelligent conflict detection yang mendeteksi potensi bentrok guru, rombel/kelas, ruang, dan slot waktu sebelum publikasi jadwal.

---

# 10. Teacher Dashboard

## FR-TDB-001
Guru yang login melihat dashboard role-aware.

## FR-TDB-002
Dashboard guru memprioritaskan Jadwal Hari Ini.

## FR-TDB-003
Dashboard guru menampilkan Kelas Saya berdasarkan Teaching Assignment.

## FR-TDB-004
Dashboard guru dapat menampilkan Perlu Perhatian jika source data sudah tersedia.

## FR-TDB-005
Dashboard guru tidak boleh menampilkan fake KPI.

## FR-TDB-006
Jika source data belum ada, tampilkan empty state.

---

# 11. Teacher Workspace

## FR-TWS-001
Guru dapat membuka workspace untuk kombinasi Teaching Assignment yang sah.

## FR-TWS-002
Workspace menyediakan konteks minimal:

- Ringkasan
- Jadwal
- Lingkup Materi / BAB
- Materi
- Administrasi
- Tugas
- Presensi
- Penilaian
- CBT

## FR-TWS-003
Menu yang phase-nya belum aktif tidak boleh menjalankan fungsi palsu.

---

# 12. Learning — Lingkup Materi & TP

## FR-LRN-001
Guru dapat membuat/mengelola Lingkup Materi/BAB dalam konteks kelas/mapel yang sah.

## FR-LRN-002
Lingkup Materi dapat memiliki satu atau lebih Tujuan Pembelajaran.

## FR-LRN-003
TP adalah data domain dan tidak boleh di-hardcode sebagai kolom nilai.

## FR-LRN-004
Pertemuan dapat dikaitkan dengan TP yang relevan.

---

# 13. Material

## FR-MAT-001
Guru dapat membuat Material Definition.

## FR-MAT-002
Material dapat dipublikasikan ke konteks kelas yang sesuai.

## FR-MAT-003
Material Definition dan Material Publication harus dibedakan.

## FR-MAT-004
File material privat mengikuti authorization resource.

---

# 14. Teacher Administration

## FR-ADM-001
Guru dapat mencatat administrasi pembelajaran pada Actual Class Session.

## FR-ADM-002
Administrasi minimal dapat memuat materi/realisasi pembelajaran.

## FR-ADM-003
Administrasi dapat dikaitkan dengan TP.

## FR-ADM-004
Guru tidak dapat menulis administrasi untuk session di luar scope.

---

# 15. Assignment

## FR-ASG-001
Guru dapat membuat Assignment Definition.

## FR-ASG-002
Assignment dapat dipublikasikan ke kelas/context tertentu.

## FR-ASG-003
Deadline berlaku pada publication/context yang benar.

## FR-ASG-004
Siswa dapat mengirim Submission untuk assignment yang tersedia dalam scope-nya.

## FR-ASG-005
Assignment Definition, Assignment Publication, dan Submission harus dibedakan.

---

# 16. Class Session Attendance

## FR-ATT-001
Guru dapat membuka presensi pada Actual Class Session yang sah.

## FR-ATT-002
Daftar siswa berasal dari penempatan akademik yang valid untuk session tersebut.

## FR-ATT-003
Status baseline dapat mencakup:

```text
Hadir
Izin
Sakit
Alpha
```

## FR-ATT-004
Guru dapat menyimpan presensi.

## FR-ATT-005
Guru tidak dapat mengubah presensi session di luar Teaching Assignment-nya.

## FR-ATT-006
Koreksi presensi harus mengikuti authorization dan audit.

## FR-ATT-007
School Attendance dan Class Session Attendance tetap terpisah.

---

# 17. Assessment

## FR-ASM-001
Guru dapat membuat assessment dalam context kelas/mapel yang sah.

## FR-ASM-002
Assessment dapat dikaitkan dengan TP.

## FR-ASM-003
Assessment dapat memiliki tanggal/momen pengambilan nilai.

## FR-ASM-004
Guru dapat mengisi nilai siswa.

## FR-ASM-005
Missing Grade tidak boleh dikonversi otomatis menjadi zero.

## FR-ASM-006
Nilai draft tidak boleh terlihat sebagai published grade.

## FR-ASM-007
Grade Publication harus memiliki lifecycle yang jelas.

## FR-ASM-008
Teacher tidak dapat mengubah nilai milik teaching context guru lain tanpa permission khusus.

---

# 18. Gradebook

## FR-GRD-001
Gradebook menampilkan nilai berdasarkan assessment yang sah.

## FR-GRD-002
Gradebook dapat memfilter/menavigasi nilai berdasarkan kelas, mapel, dan konteks pembelajaran.

## FR-GRD-003
Gradebook harus membedakan draft, published, dan finalized state jika state tersebut diterapkan.

## FR-GRD-004
Siswa hanya dapat melihat nilai yang telah dipublikasikan.

## FR-GRD-005
Guardian hanya dapat melihat nilai published anak yang memiliki relationship sah.

---

# 19. CBT

## FR-CBT-001
Guru berwenang dapat mengelola Question Bank.

## FR-CBT-002
Question Bank harus mendukung Question Version.

## FR-CBT-003
Ujian menggunakan snapshot/manifes yang stabil.

## FR-CBT-004
Siswa dapat memulai attempt jika memenuhi authorization dan jadwal.

## FR-CBT-005
Timer authoritative berada di server.

## FR-CBT-006
Attempt mendukung autosave.

## FR-CBT-007
Attempt dapat resume sesuai policy.

## FR-CBT-008
Sistem mencegah lebih dari satu active attempt bila policy menyatakan satu attempt aktif.

## FR-CBT-009
Answer key tidak dikirim ke client tanpa kebutuhan.

## FR-CBT-010
Integrity event adalah indikator dan tidak otomatis menjadi vonis cheating.

## FR-CBT-011
Hasil CBT masuk ke Assessment melalui contract resmi, bukan direct write lintas ownership.

---

# 20. Student Experience

## FR-SXP-001
Siswa login menggunakan identity sendiri.

## FR-SXP-002
Siswa hanya melihat data self-scope.

## FR-SXP-003
Dashboard siswa dapat menampilkan:

- aktivitas hari ini;
- jadwal berikutnya;
- deadline tugas;
- CBT mendatang;
- presensi pribadi;
- nilai published;
- pengumuman;
- notifikasi.

## FR-SXP-004
Siswa tidak dapat melihat draft grade.

---

# 21. Guardian

## FR-GUA-001
Guardian dapat memiliki relationship terverifikasi dengan satu atau lebih siswa.

## FR-GUA-002
Guardian dapat memilih anak yang berada dalam verified relationship.

## FR-GUA-003
Guardian dapat melihat data yang diizinkan untuk anak tersebut.

## FR-GUA-004
Guardian tidak dapat bertindak sebagai siswa.

## FR-GUA-005
Request/correction hanya tersedia jika requirement/module terkait mengizinkan.

---

# 22. Communication

## FR-COM-001
Pengguna berwenang dapat membuat Announcement.

## FR-COM-002
Announcement memiliki audience.

## FR-COM-003
Audience harus diperiksa server-side.

## FR-COM-004
Announcement tidak disamakan dengan Notification.

---

# 23. Notification

## FR-NOT-001
Sistem dapat membuat in-app notification.

## FR-NOT-002
Notification dapat memiliki read/unread state.

## FR-NOT-003
External delivery failure tidak mengubah source transaction utama kecuali explicitly required.

---

# 24. Homeroom & Student Monitoring

## FR-HRM-001
Homeroom Teacher authority berasal dari Homeroom Assignment.

## FR-HRM-002
Wali kelas dapat melihat ringkasan rombel sesuai scope.

## FR-HRM-003
Monitoring dapat menggabungkan derived facts dari attendance, assignment, dan published grade.

## FR-HRM-004
Wali kelas tidak otomatis dapat mengedit nilai guru lain.

## FR-HRM-005
Wali kelas tidak otomatis dapat mengedit class attendance milik guru lain.

---

# 25. Leadership & Reporting

## FR-RPT-001
Pimpinan dapat melihat dashboard sesuai position dan scope.

## FR-RPT-002
Reporting menggunakan read model/read flow.

## FR-RPT-003
Reporting tidak menjadi owner source transaction.

## FR-RPT-004
Export hanya mencakup data yang berada dalam effective access pengguna.

---

# 26. File & Document

## FR-FIL-001
File privat tidak dapat diakses hanya karena seseorang mengetahui URL/storage key.

## FR-FIL-002
Authorization business resource harus diperiksa sebelum file dikirim.

## FR-FIL-003
Metadata file disimpan di database.

## FR-FIL-004
Binary file tidak disimpan di SQLite secara default.

---

# 27. Audit

## FR-AUD-001
Perubahan penting mencatat actor.

## FR-AUD-002
Audit mencatat resource yang terdampak.

## FR-AUD-003
Audit bersifat append-oriented.

## FR-AUD-004
Audit tidak disamakan dengan application log.

---

# 28. Integration

## FR-INT-001
External service menggunakan adapter.

## FR-INT-002
Integration tidak boleh bypass authorization.

## FR-INT-003
Retryable integration harus mempertimbangkan idempotency.

## FR-INT-004
Core Ruang Pintar tetap dapat beroperasi saat optional provider gagal.

---

# 29. AI Assistance

## FR-AI-001
AI hanya menerima data yang sudah lolos effective access.

## FR-AI-002
AI tidak memiliki direct unrestricted database access.

## FR-AI-003
AI output dianggap draft/recommendation kecuali melalui use case resmi.

## FR-AI-004
AI provider failure tidak boleh merusak core domain.

---

# 30. CRUD Interaction

## FR-UX-001
Create/Edit menggunakan Dialog jika complexity memungkinkan.

## FR-UX-002
Delete menggunakan destructive confirmation.

## FR-UX-003
Setelah create/update/delete sukses, modal ditutup.

## FR-UX-004
Tampilkan tepat satu success toast untuk operasi sukses.

## FR-UX-005
Validation error tampil inline.

---

# 31. Responsive & Accessibility

## FR-UX-006
Halaman kritis harus diuji pada empat viewport kanonikal.

## FR-UX-007
Touch target minimum 44px.

## FR-UX-008
Keyboard/focus harus usable.

## FR-UX-009
Normal text minimum mengikuti WCAG AA.

---

# 32. Functional Acceptance — Teacher Academic MVP

Workflow berikut wajib dapat dilakukan end-to-end setelah phase terkait selesai:

```text
Guru Login
↓
Dashboard Guru
↓
Kelas Saya
↓
Buka Kelas
↓
Lingkup Materi / BAB
↓
Pilih TP
↓
Pertemuan
↓
Administrasi Guru
↓
Presensi Siswa
↓
Buat Assessment
↓
Isi Nilai
↓
Simpan / Publish sesuai lifecycle
```

Jika salah satu bagian fundamental tidak dapat digunakan, Teacher Academic MVP belum diterima.

---

# 33. Traceability

Requirement di FRD harus dirujuk dalam:

- phase implementation prompt bila relevan;
- test;
- review;
- bug report;
- acceptance.

FRD tidak menggantikan Domain Model, Access Model, Data Architecture, atau UI Design System. Ia menjadi penghubung fungsional antara produk dan implementasi.
