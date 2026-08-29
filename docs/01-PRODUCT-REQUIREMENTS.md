# 01 — PRODUCT REQUIREMENTS
## Ruang Pintar

**Nama Dokumen:** Product Requirements  
**Nama Produk:** Ruang Pintar  
**Versi Dokumen:** 1.0-RC  
**Status:** FINAL REVIEW  
**Dokumen Induk:** `00-PROJECT-BRIEF.md`  
**Jenis Dokumen:** Product Requirements Specification  
**Kategori Produk:** School Digital Operating Platform  

---

# 1. Tujuan Dokumen

Dokumen ini menerjemahkan arah produk yang telah dikunci pada `00-PROJECT-BRIEF.md` menjadi kebutuhan produk yang lebih konkret, terstruktur, dapat ditelusuri, dan dapat diverifikasi.

Dokumen ini menjawab pertanyaan:

> **Kemampuan apa yang wajib, sebaiknya, atau dapat dimiliki Ruang Pintar sebagai produk?**

Dokumen ini menjadi dasar bagi penyusunan:

- `02-DOMAIN-MODEL.md`;
- `03-MODULE-MAP.md`;
- `04-ROLE-ACCESS.md`;
- `05-SYSTEM-ARCHITECTURE.md`;
- `06-DATA-ARCHITECTURE.md`;
- `07-UI-UX-DESIGN-SYSTEM.md`;
- `08-IMPLEMENTATION-ROADMAP.md`;
- `09-AI-CODING-RULES.md`;
- implementation plan;
- acceptance testing;
- human review.

Dokumen ini tidak menentukan detail implementasi teknis.

---

# 2. Hubungan dengan Project Brief

`00-PROJECT-BRIEF.md` menjelaskan:

- apa itu Ruang Pintar;
- mengapa Ruang Pintar dibuat;
- siapa pengguna utamanya;
- masalah yang ingin diselesaikan;
- prinsip produk;
- positioning produk;
- visi jangka panjang.

`01-PRODUCT-REQUIREMENTS.md` menjelaskan:

- kemampuan yang dibutuhkan produk;
- perilaku produk yang harus dijaga;
- kebutuhan lintas area;
- prioritas requirement;
- kondisi yang harus dapat diverifikasi.

Semua requirement pada dokumen ini harus tetap konsisten dengan Project Brief.

Jika terdapat konflik antara dokumen ini dan Project Brief, maka Project Brief memiliki kedudukan lebih tinggi sampai perubahan resmi dilakukan.

---

# 3. Prinsip Penyusunan Requirement

Requirement pada dokumen ini harus:

1. berorientasi pada kebutuhan produk;
2. tidak terikat pada framework tertentu;
3. tidak menentukan struktur database;
4. tidak menentukan desain UI secara detail;
5. tidak menentukan nama route, controller, service, atau table;
6. tidak mengunci arsitektur deployment;
7. dapat ditelusuri ke domain, modul, akses, implementasi, dan test;
8. dapat diverifikasi melalui human review atau quality assurance.

---

# 4. Konvensi Requirement

Setiap requirement menggunakan format:

```text
ID
Priority
Requirement
Acceptance Intent
```

## 4.1 Priority

**MUST**  
Wajib tersedia agar produk dianggap memenuhi kebutuhan inti.

**SHOULD**  
Sangat disarankan dan bernilai tinggi, tetapi dapat ditunda apabila terdapat alasan implementasi yang sah.

**MAY**  
Kemampuan tambahan yang dapat dikembangkan kemudian.

## 4.2 Requirement ID

Format umum:

```text
PR-{AREA}-{NUMBER}
```

Contoh:

```text
PR-ACADEMIC-001
PR-ATTENDANCE-004
PR-AUDIT-002
```

ID requirement tidak boleh digunakan ulang untuk requirement berbeda.

---

# 5. Product-Level Constraints

## PR-CORE-001
**Priority:** MUST

Ruang Pintar harus berfungsi sebagai satu platform sekolah terintegrasi dan tidak sekadar menjadi kumpulan aplikasi atau halaman yang berdiri sendiri.

**Acceptance Intent:** Data dan proses utama dapat saling berhubungan melalui konteks yang konsisten.

## PR-CORE-002
**Priority:** MUST

Produk harus mendukung pengembangan kemampuan secara modular.

**Acceptance Intent:** Kemampuan baru dapat ditambahkan tanpa mengharuskan pembangunan ulang keseluruhan produk.

## PR-CORE-003
**Priority:** MUST

Produk harus tetap dapat beroperasi apabila kapabilitas AI tidak tersedia.

**Acceptance Intent:** Proses inti sekolah tidak memiliki dependensi wajib terhadap layanan AI.

## PR-CORE-004
**Priority:** MUST

Produk harus dapat diterapkan pada sekolah dengan struktur, jumlah pengguna, program pendidikan, dan kebutuhan operasional yang berbeda.

**Acceptance Intent:** Produk tidak mengasumsikan hanya satu bentuk struktur sekolah.

## PR-CORE-005
**Priority:** MUST

Perubahan data dan aktivitas penting tidak boleh menghilangkan konteks historis yang masih diperlukan untuk kepentingan akademik, operasional, audit, atau pelaporan.

**Acceptance Intent:** Informasi historis yang relevan tetap dapat ditelusuri.

## PR-CORE-006
**Priority:** MUST

Konsep domain yang memiliki arti berbeda tidak boleh digabungkan hanya karena terlihat serupa secara teknis.

**Acceptance Intent:** Identitas, hubungan, penempatan, assignment, periode, sesi, presensi, nilai, publikasi, dan konsep domain lain dapat dimodelkan sesuai makna bisnisnya.

## PR-CORE-007
**Priority:** MUST

Kemampuan produk harus mengikuti konteks sekolah, periode, hubungan pengguna, tanggung jawab, dan kewenangan yang berlaku.

**Acceptance Intent:** Sistem tidak menggunakan akses global tanpa mempertimbangkan konteks domain.

## PR-CORE-008
**Priority:** SHOULD

Produk harus memungkinkan sekolah mengaktifkan atau menonaktifkan capability tertentu sesuai kebutuhan, selama tidak melanggar dependensi inti.

**Acceptance Intent:** Sekolah tidak harus menggunakan seluruh capability untuk mendapatkan manfaat dari produk.

---

# 6. School & Organization Requirements

## PR-SCHOOL-001
**Priority:** MUST

Sistem harus memiliki identitas organisasi sekolah sebagai konteks utama operasional produk.

**Acceptance Intent:** Data dan aktivitas dapat dikaitkan dengan konteks sekolah yang sah.

## PR-SCHOOL-002
**Priority:** MUST

Sistem harus dapat menyimpan informasi profil dasar sekolah.

**Acceptance Intent:** Identitas sekolah dapat ditampilkan dan digunakan oleh capability lain.

## PR-SCHOOL-003
**Priority:** MUST

Sistem harus mendukung struktur organisasi sekolah yang dapat berbeda antar sekolah.

**Acceptance Intent:** Produk tidak mengunci satu struktur jabatan atau unit tertentu.

## PR-SCHOOL-004
**Priority:** MUST

Sistem harus memungkinkan definisi unit, program, atau struktur akademik sesuai kebutuhan sekolah.

**Acceptance Intent:** Sekolah dengan jurusan/program berbeda tetap dapat direpresentasikan.

## PR-SCHOOL-005
**Priority:** SHOULD

Sistem harus mendukung konfigurasi branding dasar sekolah.

**Acceptance Intent:** Identitas visual dan informasi sekolah dapat disesuaikan tanpa mengubah fondasi produk.

## PR-SCHOOL-006
**Priority:** MUST

Sistem harus memiliki zona waktu sekolah yang eksplisit untuk kebutuhan waktu operasional.

**Acceptance Intent:** Jadwal, sesi, deadline, log, dan informasi waktu menggunakan konteks waktu yang konsisten.

---

# 7. Identity & Account Requirements

## PR-IDENTITY-001
**Priority:** MUST

Sistem harus memiliki identitas pengguna yang dapat digunakan untuk autentikasi dan akses.

**Acceptance Intent:** Pengguna dapat dikenali secara unik oleh sistem.

## PR-IDENTITY-002
**Priority:** MUST

Sistem harus membedakan akun autentikasi dengan profil domain seperti guru, siswa, orang tua/wali, atau tenaga kependidikan.

**Acceptance Intent:** Satu akun tidak dianggap identik dengan satu jenis profil domain.

## PR-IDENTITY-003
**Priority:** MUST

Sistem harus mendukung pengguna yang memiliki lebih dari satu tanggung jawab atau konteks pada waktu yang sama.

**Acceptance Intent:** Pengguna tidak perlu memiliki akun terpisah hanya karena memiliki beberapa tanggung jawab yang sah.

## PR-IDENTITY-004
**Priority:** MUST

Status akun dan status profil domain harus dapat dibedakan.

**Acceptance Intent:** Menonaktifkan suatu peran atau hubungan tidak harus menghapus identitas pengguna secara keseluruhan.

## PR-IDENTITY-005
**Priority:** MUST

Sistem harus menyediakan mekanisme pengelolaan siklus hidup akun.

**Acceptance Intent:** Akun dapat dibuat, diaktifkan, dinonaktifkan, dipulihkan, atau dikelola sesuai kebijakan.

## PR-IDENTITY-006
**Priority:** MUST

Sistem tidak boleh menghapus riwayat domain penting hanya karena akun pengguna dinonaktifkan.

**Acceptance Intent:** Riwayat akademik atau operasional tetap tersedia.

## PR-IDENTITY-007
**Priority:** SHOULD

Sistem harus mendukung proses aktivasi atau onboarding akun pengguna secara terkontrol.

**Acceptance Intent:** Pembuatan akun massal atau individual dapat dilakukan tanpa membagikan kredensial secara tidak aman.

## PR-IDENTITY-008
**Priority:** SHOULD

Sistem harus mendukung pembaruan informasi profil oleh pengguna sesuai batas kewenangannya.

**Acceptance Intent:** Pengguna dapat memperbarui data yang memang boleh dikelolanya sendiri.

---

# 8. Authentication & Access Requirements

## PR-ACCESS-001
**Priority:** MUST

Sistem harus mengautentikasi pengguna sebelum memberikan akses ke capability yang dilindungi.

**Acceptance Intent:** Pengguna anonim tidak dapat mengakses area privat.

## PR-ACCESS-002
**Priority:** MUST

Akses harus ditentukan berdasarkan kombinasi identitas, peran, tanggung jawab, hubungan, periode, dan resource scope yang relevan.

**Acceptance Intent:** Akses tidak hanya bergantung pada nama role.

## PR-ACCESS-003
**Priority:** MUST

Memiliki akun aktif tidak otomatis memberikan akses terhadap seluruh data sekolah.

**Acceptance Intent:** Default access mengikuti prinsip least privilege.

## PR-ACCESS-004
**Priority:** MUST

Sistem harus dapat membatasi akses pengguna terhadap resource tertentu.

**Acceptance Intent:** Pengguna hanya dapat membaca atau memodifikasi resource yang berada dalam scope-nya.

## PR-ACCESS-005
**Priority:** MUST

Otorisasi harus ditegakkan pada sisi server untuk operasi yang dilindungi.

**Acceptance Intent:** Pembatasan UI bukan satu-satunya mekanisme keamanan.

## PR-ACCESS-006
**Priority:** MUST

Sistem harus mendukung perubahan tanggung jawab dan kewenangan berdasarkan periode.

**Acceptance Intent:** Akses masa lalu, saat ini, dan masa depan dapat dibedakan jika diperlukan.

## PR-ACCESS-007
**Priority:** MUST

Sistem harus dapat menangani pengguna dengan beberapa peran atau assignment tanpa menciptakan konflik akses yang tidak terkontrol.

**Acceptance Intent:** Effective access dapat dihitung secara deterministik.

## PR-ACCESS-008
**Priority:** MUST

Operasi sensitif harus dapat dibatasi lebih ketat daripada operasi baca biasa.

**Acceptance Intent:** Hak melihat data tidak otomatis berarti hak mengubah, menghapus, menyetujui, atau mempublikasikan.

## PR-ACCESS-009
**Priority:** SHOULD

Sistem harus menyediakan informasi yang cukup untuk menjelaskan mengapa pengguna memiliki atau tidak memiliki akses tertentu.

**Acceptance Intent:** Troubleshooting akses dapat dilakukan tanpa menebak.

---

# 9. Academic Period Requirements

## PR-ACADEMIC-001
**Priority:** MUST

Sistem harus mendukung tahun ajaran.

**Acceptance Intent:** Aktivitas akademik dapat dikelompokkan berdasarkan tahun ajaran.

## PR-ACADEMIC-002
**Priority:** MUST

Sistem harus mendukung semester atau periode akademik di dalam tahun ajaran.

**Acceptance Intent:** Aktivitas akademik dapat dibatasi pada periode yang jelas.

## PR-ACADEMIC-003
**Priority:** MUST

Sistem harus membedakan periode aktif, masa lalu, dan periode yang belum berjalan.

**Acceptance Intent:** Operasi yang bergantung periode tidak salah menggunakan konteks waktu.

## PR-ACADEMIC-004
**Priority:** MUST

Riwayat periode akademik tidak boleh hilang ketika periode baru diaktifkan.

**Acceptance Intent:** Laporan dan riwayat akademik periode sebelumnya tetap dapat diakses.

## PR-ACADEMIC-005
**Priority:** MUST

Sistem harus memiliki kalender akademik yang dapat merepresentasikan hari efektif, hari libur, kegiatan sekolah, dan pengecualian yang relevan.

**Acceptance Intent:** Jadwal operasional dapat mempertimbangkan kalender nyata sekolah.

## PR-ACADEMIC-006
**Priority:** SHOULD

Sistem harus mendukung proses pembukaan dan penutupan periode akademik secara terkontrol.

**Acceptance Intent:** Perubahan data setelah periode ditutup dapat dibatasi atau memerlukan proses koreksi resmi.

---

# 10. Academic Structure Requirements

## PR-STRUCTURE-001
**Priority:** MUST

Sistem harus dapat merepresentasikan jenjang, tingkat, fase, program, jurusan, atau struktur akademik lain sesuai kebutuhan sekolah.

**Acceptance Intent:** Struktur akademik tidak bergantung pada satu kurikulum atau satu bentuk sekolah.

## PR-STRUCTURE-002
**Priority:** MUST

Sistem harus mendukung rombongan belajar atau kelompok belajar dalam konteks periode akademik.

**Acceptance Intent:** Siswa dapat ditempatkan pada kelompok belajar yang sah pada periode tertentu.

## PR-STRUCTURE-003
**Priority:** MUST

Sistem harus mempertahankan riwayat perubahan struktur akademik antar periode.

**Acceptance Intent:** Perubahan nama, tingkat, program, atau kelompok tidak merusak data historis.

## PR-STRUCTURE-004
**Priority:** SHOULD

Sistem harus dapat mendukung kapasitas atau batas jumlah anggota pada kelompok belajar.

**Acceptance Intent:** Sekolah dapat menggunakan kapasitas sebagai kontrol operasional bila dibutuhkan.

---

# 11. Student Requirements

## PR-STUDENT-001
**Priority:** MUST

Sistem harus menyimpan identitas siswa secara terpisah dari status akademik siswa pada periode tertentu.

**Acceptance Intent:** Identitas siswa tidak berubah hanya karena siswa naik kelas atau berganti rombel.

## PR-STUDENT-002
**Priority:** MUST

Sistem harus mendukung keikutsertaan siswa dalam tahun ajaran atau periode akademik.

**Acceptance Intent:** Status akademik siswa dapat berubah antar periode tanpa menghapus identitasnya.

## PR-STUDENT-003
**Priority:** MUST

Sistem harus mendukung penempatan siswa ke rombongan belajar pada periode tertentu.

**Acceptance Intent:** Riwayat penempatan siswa dapat ditelusuri.

## PR-STUDENT-004
**Priority:** MUST

Sistem harus mempertahankan riwayat perpindahan, kenaikan tingkat, kelulusan, atau perubahan status akademik siswa.

**Acceptance Intent:** Riwayat lama tidak ditimpa oleh status terbaru.

## PR-STUDENT-005
**Priority:** MUST

Siswa harus dapat melihat informasi akademik yang relevan terhadap dirinya sendiri.

**Acceptance Intent:** Siswa tidak memperoleh data siswa lain tanpa kewenangan.

## PR-STUDENT-006
**Priority:** SHOULD

Sistem harus mendukung proses promosi atau perpindahan siswa secara massal dengan kontrol dan validasi.

**Acceptance Intent:** Operasi massal tidak menghilangkan riwayat akademik.

## PR-STUDENT-007
**Priority:** SHOULD

Sistem harus mendukung status siswa seperti aktif, pindah, lulus, atau status lain sesuai aturan sekolah.

**Acceptance Intent:** Status dapat digunakan tanpa menghapus identitas siswa.

---

# 12. Teacher & Staff Requirements

## PR-TEACHER-001
**Priority:** MUST

Sistem harus menyimpan profil guru secara terpisah dari akun autentikasi.

**Acceptance Intent:** Riwayat guru tidak bergantung pada lifecycle akun.

## PR-TEACHER-002
**Priority:** MUST

Sistem harus dapat merepresentasikan tugas mengajar guru berdasarkan periode, mata pelajaran, dan konteks kelas yang sah.

**Acceptance Intent:** Hak mengelola pembelajaran berasal dari assignment yang valid.

## PR-TEACHER-003
**Priority:** MUST

Sistem harus mendukung tanggung jawab tambahan guru atau tenaga kependidikan selain tugas mengajar.

**Acceptance Intent:** Satu pengguna dapat memiliki beberapa assignment.

## PR-TEACHER-004
**Priority:** MUST

Sistem harus mempertahankan riwayat tugas mengajar dan tanggung jawab periodik.

**Acceptance Intent:** Perubahan assignment baru tidak menimpa assignment lama.

## PR-TEACHER-005
**Priority:** MUST

Guru harus dapat melihat konteks kelas, jadwal, materi, tugas, presensi, asesmen, dan informasi lain yang menjadi tanggung jawabnya.

**Acceptance Intent:** Informasi yang tampil mengikuti effective access.

## PR-TEACHER-006
**Priority:** SHOULD

Sistem harus dapat menghasilkan informasi beban mengajar dari assignment yang berlaku.

**Acceptance Intent:** Beban tidak harus diinput ulang jika dapat diturunkan dari data resmi.

---

# 13. Subject & Teaching Assignment Requirements

## PR-SUBJECT-001
**Priority:** MUST

Sistem harus memiliki konsep mata pelajaran yang dapat digunakan lintas periode.

**Acceptance Intent:** Mata pelajaran tidak perlu dibuat ulang tanpa alasan setiap semester.

## PR-SUBJECT-002
**Priority:** MUST

Sistem harus membedakan definisi mata pelajaran dengan penugasan guru untuk mengajar mata pelajaran tersebut.

**Acceptance Intent:** Guru tidak dianggap melekat permanen pada satu mata pelajaran atau kelas.

## PR-SUBJECT-003
**Priority:** MUST

Teaching assignment harus memiliki konteks periode yang jelas.

**Acceptance Intent:** Assignment tidak berlaku tanpa batas waktu secara implisit.

## PR-SUBJECT-004
**Priority:** MUST

Teaching assignment harus dapat dikaitkan dengan satu atau lebih konteks kelas yang sah.

**Acceptance Intent:** Scope pengajaran dapat ditentukan secara eksplisit.

## PR-SUBJECT-005
**Priority:** SHOULD

Sistem harus mendukung assignment massal untuk kebutuhan operasional sekolah.

**Acceptance Intent:** Bulk operation tetap mengikuti validasi domain.

---

# 14. Scheduling Requirements

## PR-SCHEDULE-001
**Priority:** MUST

Sistem harus mendukung jadwal pelajaran resmi.

**Acceptance Intent:** Jadwal dapat merepresentasikan siapa mengajar apa, kepada siapa, kapan, dan dalam konteks apa.

## PR-SCHEDULE-002
**Priority:** MUST

Jadwal harus terikat pada periode akademik.

**Acceptance Intent:** Jadwal periode lalu tidak ditimpa oleh jadwal periode baru.

## PR-SCHEDULE-003
**Priority:** MUST

Sistem harus dapat merepresentasikan slot waktu atau rentang waktu pembelajaran.

**Acceptance Intent:** Jadwal dapat dibaca secara konsisten oleh capability lain.

## PR-SCHEDULE-004
**Priority:** MUST

Sistem harus dapat mendeteksi konflik jadwal yang dapat diverifikasi secara deterministik.

**Acceptance Intent:** Konflik guru, rombel, ruang, atau resource lain dapat diketahui sebelum publikasi bila data tersedia.

## PR-SCHEDULE-005
**Priority:** MUST

Sistem harus membedakan jadwal resmi dari kegiatan kelas yang benar-benar terjadi.

**Acceptance Intent:** Perubahan operasional pada hari pelaksanaan tidak harus mengubah histori master schedule.

## PR-SCHEDULE-006
**Priority:** MUST

Sistem harus mendukung pembentukan sesi kelas aktual berdasarkan jadwal atau konteks akademik yang sah.

**Acceptance Intent:** Presensi dan aktivitas kelas dapat dikaitkan dengan kejadian yang benar-benar terjadi.

## PR-SCHEDULE-007
**Priority:** SHOULD

Sistem harus mendukung perubahan jadwal terkontrol tanpa menghapus versi atau histori yang dibutuhkan.

**Acceptance Intent:** Perubahan dapat ditelusuri.

---

# 15. Learning Requirements

## PR-LEARNING-001
**Priority:** MUST

Sistem harus mendukung konteks pembelajaran yang menghubungkan guru, mata pelajaran, kelas, dan periode yang sah.

**Acceptance Intent:** Aktivitas pembelajaran tidak berdiri tanpa konteks akademik.

## PR-LEARNING-002
**Priority:** MUST

Guru berwenang harus dapat membuat dan mengelola materi pembelajaran.

**Acceptance Intent:** Materi dapat digunakan dalam konteks pembelajaran yang valid.

## PR-LEARNING-003
**Priority:** MUST

Sistem harus membedakan materi sebagai konten dengan publikasi materi kepada kelas tertentu.

**Acceptance Intent:** Satu materi dapat digunakan ulang tanpa harus diduplikasi seluruh isinya.

## PR-LEARNING-004
**Priority:** MUST

Materi yang belum dipublikasikan tidak boleh terlihat oleh siswa yang tidak berwenang.

**Acceptance Intent:** Draft dan published state dapat dibedakan.

## PR-LEARNING-005
**Priority:** MUST

Guru berwenang harus dapat membuat dan mengelola tugas.

**Acceptance Intent:** Tugas memiliki konteks kelas, instruksi, dan periode pengerjaan yang jelas.

## PR-LEARNING-006
**Priority:** MUST

Sistem harus membedakan definisi tugas dengan publikasi tugas kepada kelas.

**Acceptance Intent:** Tugas dapat digunakan ulang atau diberikan ke beberapa kelas secara terkontrol.

## PR-LEARNING-007
**Priority:** MUST

Sistem harus mendukung deadline tugas.

**Acceptance Intent:** Status ketepatan waktu submission dapat dihitung secara konsisten.

## PR-LEARNING-008
**Priority:** MUST

Siswa harus dapat melihat tugas yang diberikan kepadanya dan status pengerjaannya.

**Acceptance Intent:** Siswa hanya melihat assignment yang relevan terhadap dirinya.

## PR-LEARNING-009
**Priority:** MUST

Sistem harus mendukung pengumpulan tugas oleh siswa apabila jenis tugas memerlukannya.

**Acceptance Intent:** Submission dapat dikaitkan dengan siswa, tugas, waktu, dan status yang tepat.

## PR-LEARNING-010
**Priority:** SHOULD

Sistem harus mendukung feedback guru terhadap pekerjaan siswa.

**Acceptance Intent:** Siswa dapat memperoleh umpan balik terkait submission-nya.

## PR-LEARNING-011
**Priority:** SHOULD

Sistem harus mendukung penggunaan kembali konten pembelajaran antar kelas atau periode sesuai kewenangan.

**Acceptance Intent:** Reuse tidak merusak histori publikasi sebelumnya.

---

# 16. Attendance Requirements

## PR-ATTENDANCE-001
**Priority:** MUST

Sistem harus membedakan presensi sekolah dengan presensi sesi pembelajaran.

**Acceptance Intent:** Kehadiran siswa di sekolah tidak otomatis dianggap sama dengan kehadiran pada semua kelas.

## PR-ATTENDANCE-002
**Priority:** MUST

Presensi kelas harus terkait dengan sesi kelas aktual yang sah.

**Acceptance Intent:** Tidak ada presensi kelas tanpa konteks sesi.

## PR-ATTENDANCE-003
**Priority:** MUST

Sistem harus dapat mencatat status kehadiran siswa sesuai kebijakan sekolah.

**Acceptance Intent:** Status dapat direpresentasikan secara konsisten dan dapat dilaporkan.

## PR-ATTENDANCE-004
**Priority:** MUST

Guru hanya boleh mengelola presensi untuk sesi yang berada dalam scope kewenangannya.

**Acceptance Intent:** Teacher scope diterapkan pada operasi presensi.

## PR-ATTENDANCE-005
**Priority:** MUST

Sistem harus mencatat waktu dan aktor untuk perubahan presensi yang penting.

**Acceptance Intent:** Koreksi dapat ditelusuri.

## PR-ATTENDANCE-006
**Priority:** MUST

Sistem harus mendukung mekanisme koreksi presensi setelah pencatatan awal.

**Acceptance Intent:** Koreksi tidak harus dilakukan dengan menghapus histori sebelumnya secara diam-diam.

## PR-ATTENDANCE-007
**Priority:** SHOULD

Sistem harus mendukung kebijakan locking atau finalization presensi.

**Acceptance Intent:** Perubahan setelah batas tertentu dapat dikontrol.

## PR-ATTENDANCE-008
**Priority:** SHOULD

Sistem harus dapat menghasilkan rekap presensi berdasarkan siswa, kelas, periode, atau konteks lain yang relevan.

**Acceptance Intent:** Rekap dapat diturunkan dari data presensi resmi.

## PR-ATTENDANCE-009
**Priority:** MAY

Sistem dapat mendukung metode pencatatan kehadiran tambahan seperti QR, RFID, atau integrasi perangkat lain.

**Acceptance Intent:** Metode tambahan tidak mengubah makna domain presensi inti.

---

# 17. Assessment & Gradebook Requirements

## PR-ASSESSMENT-001
**Priority:** MUST

Sistem harus mendukung pencatatan asesmen dalam konteks pembelajaran yang sah.

**Acceptance Intent:** Nilai tidak berdiri tanpa konteks siswa, mata pelajaran, kelas, dan periode.

## PR-ASSESSMENT-002
**Priority:** MUST

Sistem harus membedakan definisi asesmen dengan hasil asesmen siswa.

**Acceptance Intent:** Struktur asesmen tidak dicampur dengan hasil individu.

## PR-ASSESSMENT-003
**Priority:** MUST

Sistem harus mendukung nilai yang belum tersedia tanpa memalsukan nilai numerik.

**Acceptance Intent:** Missing grade dapat dibedakan dari nilai nol.

## PR-ASSESSMENT-004
**Priority:** MUST

Guru hanya boleh mengelola nilai untuk assessment dan siswa yang berada dalam scope-nya.

**Acceptance Intent:** Grade editing mengikuti assignment dan permission.

## PR-ASSESSMENT-005
**Priority:** MUST

Sistem harus mendukung status draft dan published untuk hasil penilaian yang ditampilkan kepada siswa atau orang tua.

**Acceptance Intent:** Nilai internal belum tentu langsung terlihat oleh pihak lain.

## PR-ASSESSMENT-006
**Priority:** MUST

Perubahan nilai penting harus dapat ditelusuri.

**Acceptance Intent:** Sistem dapat menunjukkan aktor dan perubahan yang relevan.

## PR-ASSESSMENT-007
**Priority:** SHOULD

Sistem harus mendukung komponen atau kategori penilaian sesuai kebutuhan sekolah.

**Acceptance Intent:** Sekolah dapat membangun struktur penilaian tanpa hard-code satu skema tunggal.

## PR-ASSESSMENT-008
**Priority:** SHOULD

Sistem harus dapat menghitung ringkasan atau agregasi nilai berdasarkan aturan yang didefinisikan secara eksplisit.

**Acceptance Intent:** Formula penilaian dapat diverifikasi dan tidak tersembunyi.

## PR-ASSESSMENT-009
**Priority:** SHOULD

Sistem harus mendukung proses finalization atau locking nilai.

**Acceptance Intent:** Perubahan setelah finalization memerlukan kontrol yang lebih ketat.

---

# 18. CBT Requirements

## PR-CBT-001
**Priority:** MUST

Sistem harus mendukung asesmen berbasis komputer apabila capability CBT digunakan.

**Acceptance Intent:** Guru dapat membuat asesmen digital yang dapat dikerjakan siswa secara terkontrol.

## PR-CBT-002
**Priority:** MUST

Sistem harus mendukung bank soal yang dapat digunakan ulang.

**Acceptance Intent:** Soal tidak harus selalu dibuat ulang untuk setiap ujian.

## PR-CBT-003
**Priority:** MUST

Perubahan bank soal tidak boleh mengubah secara diam-diam ujian yang sudah diterbitkan atau sedang berlangsung.

**Acceptance Intent:** Ujian menggunakan snapshot atau representasi stabil.

## PR-CBT-004
**Priority:** MUST

Sistem harus mempertahankan manifest soal yang stabil selama attempt siswa.

**Acceptance Intent:** Siswa tidak menerima struktur ujian yang berubah di tengah attempt.

## PR-CBT-005
**Priority:** MUST

Timer ujian harus mengikuti sumber waktu yang dapat dipercaya oleh sistem.

**Acceptance Intent:** Siswa tidak dapat memperpanjang waktu hanya dengan memanipulasi waktu perangkat.

## PR-CBT-006
**Priority:** MUST

Sistem harus mendukung autosave jawaban.

**Acceptance Intent:** Gangguan sementara tidak langsung menghilangkan seluruh pekerjaan siswa.

## PR-CBT-007
**Priority:** MUST

Sistem harus mendukung resume attempt sesuai kebijakan ujian.

**Acceptance Intent:** Resume tidak menciptakan attempt baru secara tidak sah.

## PR-CBT-008
**Priority:** MUST

Sistem harus mencegah lebih dari satu active attempt untuk ujian yang sama apabila kebijakan hanya mengizinkan satu.

**Acceptance Intent:** Attempt state konsisten.

## PR-CBT-009
**Priority:** MUST

Kunci jawaban atau informasi sensitif penilaian tidak boleh dikirim ke client sebelum diperlukan secara sah.

**Acceptance Intent:** Client tidak menerima answer key yang dapat dieksploitasi.

## PR-CBT-010
**Priority:** MUST

Sistem harus dapat mencatat event integritas ujian yang relevan tanpa menganggap event tersebut otomatis sebagai bukti kecurangan.

**Acceptance Intent:** Event dapat digunakan sebagai indikator untuk human review.

## PR-CBT-011
**Priority:** MUST

Hasil CBT harus dapat diteruskan ke sistem penilaian apabila asesmen tersebut memang menjadi bagian gradebook.

**Acceptance Intent:** Integrasi hasil tidak memerlukan re-entry manual yang tidak perlu.

## PR-CBT-012
**Priority:** SHOULD

Sistem harus mendukung blueprint atau aturan komposisi soal.

**Acceptance Intent:** Paket soal dapat dibuat berdasarkan kriteria yang terdefinisi.

## PR-CBT-013
**Priority:** SHOULD

Sistem harus mendukung randomization yang tetap dapat direkonstruksi untuk kebutuhan review.

**Acceptance Intent:** Urutan berbeda tidak menghilangkan auditability.

---

# 19. Communication Requirements

## PR-COMM-001
**Priority:** MUST

Sistem harus mendukung pengumuman resmi.

**Acceptance Intent:** Informasi dapat disampaikan kepada target audience yang sah.

## PR-COMM-002
**Priority:** MUST

Pengumuman harus memiliki scope penerima yang jelas.

**Acceptance Intent:** Pengguna tidak menerima pengumuman yang tidak relevan atau tidak berhak dilihat.

## PR-COMM-003
**Priority:** MUST

Sistem harus mendukung status publikasi untuk komunikasi resmi.

**Acceptance Intent:** Draft tidak otomatis terkirim atau terlihat.

## PR-COMM-004
**Priority:** SHOULD

Sistem harus mendukung komunikasi kontekstual antara pihak sekolah dan pengguna sesuai hubungan yang sah.

**Acceptance Intent:** Komunikasi tidak menjadi kanal bebas tanpa kontrol akses.

## PR-COMM-005
**Priority:** SHOULD

Sistem harus dapat mempertahankan riwayat komunikasi penting yang memerlukan keterlacakan.

**Acceptance Intent:** Riwayat tidak hilang hanya karena status komunikasi berubah.

---

# 20. Notification Requirements

## PR-NOTIF-001
**Priority:** MUST

Sistem harus dapat menghasilkan notifikasi berdasarkan event penting yang relevan terhadap pengguna.

**Acceptance Intent:** Pengguna memperoleh pemberitahuan yang sesuai konteks.

## PR-NOTIF-002
**Priority:** MUST

Notifikasi tidak boleh menjadi sumber kebenaran utama untuk data domain.

**Acceptance Intent:** Kehilangan notifikasi tidak menghilangkan data asli.

## PR-NOTIF-003
**Priority:** MUST

Sistem harus dapat membedakan status read dan unread.

**Acceptance Intent:** Pengguna dapat mengetahui notifikasi yang belum dibaca.

## PR-NOTIF-004
**Priority:** SHOULD

Sistem harus mendukung preferensi notifikasi jika tidak melanggar kewajiban komunikasi resmi.

**Acceptance Intent:** Pengguna dapat mengurangi notifikasi non-kritis sesuai kebijakan.

## PR-NOTIF-005
**Priority:** SHOULD

Notifikasi eksternal harus dapat dikirim secara asynchronous apabila arsitektur mendukungnya.

**Acceptance Intent:** Kegagalan provider eksternal tidak harus menggagalkan transaksi domain utama.

---

# 21. Guardian Requirements

## PR-GUARDIAN-001
**Priority:** MUST

Sistem harus memiliki konsep hubungan antara orang tua/wali dan siswa.

**Acceptance Intent:** Akses orang tua tidak diberikan hanya berdasarkan klaim identitas.

## PR-GUARDIAN-002
**Priority:** MUST

Hubungan orang tua/wali dengan siswa harus dapat diverifikasi dan dikelola.

**Acceptance Intent:** Sistem dapat membedakan hubungan aktif, tidak aktif, atau belum terverifikasi.

## PR-GUARDIAN-003
**Priority:** MUST

Orang tua/wali hanya boleh melihat informasi siswa yang memiliki hubungan sah dengannya.

**Acceptance Intent:** Tidak ada akses lintas siswa tanpa hubungan atau kewenangan.

## PR-GUARDIAN-004
**Priority:** MUST

Orang tua/wali harus dapat melihat informasi yang telah ditetapkan dapat dipublikasikan kepadanya, seperti kehadiran, jadwal, tugas, pengumuman, atau nilai published.

**Acceptance Intent:** Informasi internal guru tidak otomatis terekspos.

## PR-GUARDIAN-005
**Priority:** SHOULD

Sistem harus mendukung satu orang tua/wali yang terhubung dengan lebih dari satu siswa.

**Acceptance Intent:** Pengguna dapat berpindah konteks anak secara jelas.

## PR-GUARDIAN-006
**Priority:** SHOULD

Sistem harus mendukung lebih dari satu orang tua/wali untuk satu siswa.

**Acceptance Intent:** Model hubungan tidak mengasumsikan hanya satu wali.

## PR-GUARDIAN-007
**Priority:** SHOULD

Sistem dapat mendukung pengajuan informasi, keterangan, atau koreksi terbatas dari orang tua/wali.

**Acceptance Intent:** Pengajuan tidak otomatis mengubah data resmi tanpa proses validasi.

---

# 22. Homeroom & Student Monitoring Requirements

## PR-MONITOR-001
**Priority:** MUST

Sistem harus dapat merepresentasikan tanggung jawab wali kelas terhadap rombongan belajar pada periode tertentu.

**Acceptance Intent:** Wali kelas tidak dianggap permanen tanpa konteks periode.

## PR-MONITOR-002
**Priority:** MUST

Wali kelas harus dapat memperoleh ringkasan siswa dalam rombongan belajar yang menjadi tanggung jawabnya.

**Acceptance Intent:** Scope monitoring mengikuti assignment.

## PR-MONITOR-003
**Priority:** MUST

Sistem harus dapat menyajikan indikator yang relevan untuk membantu monitoring siswa.

**Acceptance Intent:** Indikator dapat mencakup presensi, tugas, assessment, aktivitas, atau data lain yang sah.

## PR-MONITOR-004
**Priority:** MUST

Indikator monitoring tidak boleh menggantikan data sumbernya.

**Acceptance Intent:** Pengguna dapat menelusuri indikator kembali ke data dasar bila diperlukan.

## PR-MONITOR-005
**Priority:** SHOULD

Sistem harus mendukung pencatatan follow-up atau catatan monitoring sesuai kewenangan.

**Acceptance Intent:** Catatan sensitif hanya dapat diakses oleh pihak yang sah.

## PR-MONITOR-006
**Priority:** SHOULD

Sistem harus dapat membantu mengidentifikasi siswa yang memerlukan perhatian berdasarkan aturan atau indikator yang eksplisit.

**Acceptance Intent:** Sistem tidak membuat keputusan disipliner otomatis tanpa human review.

---

# 23. Leadership & Reporting Requirements

## PR-REPORT-001
**Priority:** MUST

Pimpinan atau pengguna berwenang harus dapat memperoleh informasi agregat sesuai scope tanggung jawabnya.

**Acceptance Intent:** Informasi lintas kelas atau unit hanya tersedia bagi pihak yang memiliki kewenangan.

## PR-REPORT-002
**Priority:** MUST

Laporan harus berasal dari data sumber yang konsisten.

**Acceptance Intent:** Angka laporan dapat ditelusuri ke data domain.

## PR-REPORT-003
**Priority:** MUST

Sistem harus mendukung filter periode yang jelas pada laporan yang bersifat periodik.

**Acceptance Intent:** Laporan tidak mencampur data lintas periode tanpa indikasi.

## PR-REPORT-004
**Priority:** SHOULD

Sistem harus mendukung ekspor laporan atau data tertentu sesuai kewenangan.

**Acceptance Intent:** Export mengikuti scope akses yang sama dengan data di aplikasi.

## PR-REPORT-005
**Priority:** SHOULD

Sistem harus mendukung dashboard ringkasan yang relevan terhadap peran dan tanggung jawab pengguna.

**Acceptance Intent:** Dashboard bukan sekadar halaman statistik generik.

## PR-REPORT-006
**Priority:** SHOULD

Metrik atau indikator penting harus memiliki definisi yang terdokumentasi.

**Acceptance Intent:** Dua bagian sistem tidak menghitung indikator yang sama dengan rumus berbeda tanpa alasan.

---

# 24. File & Document Requirements

## PR-FILE-001
**Priority:** MUST

Sistem harus mendukung penyimpanan metadata file yang terkait dengan resource domain.

**Acceptance Intent:** File dapat ditelusuri ke pemilik atau konteksnya.

## PR-FILE-002
**Priority:** MUST

Akses terhadap file harus mengikuti aturan akses resource induknya.

**Acceptance Intent:** Mengetahui lokasi file tidak otomatis memberikan akses.

## PR-FILE-003
**Priority:** MUST

File privat tidak boleh diperlakukan sebagai file publik secara default.

**Acceptance Intent:** Resource sensitif memerlukan authorization sebelum diakses.

## PR-FILE-004
**Priority:** MUST

Sistem harus memvalidasi karakteristik file yang dapat memengaruhi keamanan atau integritas sistem.

**Acceptance Intent:** Upload tidak diterima tanpa pemeriksaan dasar yang relevan.

## PR-FILE-005
**Priority:** SHOULD

Sistem harus dapat memindahkan backend penyimpanan file tanpa mengubah makna domain file.

**Acceptance Intent:** Metadata domain tidak bergantung pada satu provider storage tertentu.

## PR-FILE-006
**Priority:** SHOULD

Sistem harus mendukung lifecycle file yang jelas ketika resource induk berubah status atau dihapus secara sah.

**Acceptance Intent:** Tidak terjadi file orphan tanpa kontrol.

---

# 25. Audit & Traceability Requirements

## PR-AUDIT-001
**Priority:** MUST

Sistem harus mencatat aktivitas penting yang memerlukan audit.

**Acceptance Intent:** Perubahan sensitif dapat ditelusuri ke aktor dan waktu kejadian.

## PR-AUDIT-002
**Priority:** MUST

Audit log tidak boleh menjadi data yang mudah diubah oleh pengguna biasa.

**Acceptance Intent:** Riwayat audit memiliki perlindungan lebih kuat daripada data operasional biasa.

## PR-AUDIT-003
**Priority:** MUST

Audit harus mempertahankan konteks sekolah dan resource yang relevan.

**Acceptance Intent:** Aktivitas dapat ditelusuri secara tepat.

## PR-AUDIT-004
**Priority:** MUST

Sistem harus membedakan audit trail dari notifikasi atau activity feed biasa.

**Acceptance Intent:** Menghapus notifikasi tidak menghapus bukti audit.

## PR-AUDIT-005
**Priority:** SHOULD

Perubahan data bernilai tinggi harus dapat menunjukkan nilai sebelum dan sesudah apabila sesuai dan aman.

**Acceptance Intent:** Review perubahan tidak hanya mengetahui bahwa perubahan terjadi.

## PR-AUDIT-006
**Priority:** SHOULD

Sistem harus dapat menelusuri operasi massal ke aktor dan batch operasinya.

**Acceptance Intent:** Bulk operation tidak menghasilkan perubahan anonim.

---

# 26. Workflow & Approval Requirements

## PR-WORKFLOW-001
**Priority:** MUST

Capability yang membutuhkan proses persetujuan harus dapat membedakan draft, submitted, approved, rejected, published, closed, atau status relevan lainnya sesuai domain.

**Acceptance Intent:** Status proses tidak disederhanakan menjadi satu flag tanpa alasan.

## PR-WORKFLOW-002
**Priority:** MUST

Transisi status penting harus mengikuti aturan yang eksplisit.

**Acceptance Intent:** Resource tidak dapat berpindah ke status yang tidak sah.

## PR-WORKFLOW-003
**Priority:** MUST

Aktor yang dapat melakukan transisi status harus mengikuti otorisasi.

**Acceptance Intent:** Approval bukan sekadar tombol yang tersedia bagi semua pengguna.

## PR-WORKFLOW-004
**Priority:** SHOULD

Sistem harus dapat mencatat alasan pada rejection, correction, cancellation, atau perubahan status tertentu bila relevan.

**Acceptance Intent:** Tindakan penting dapat dipahami saat direview.

---

# 27. Search, Filter & Data Navigation Requirements

## PR-NAV-001
**Priority:** MUST

Pengguna harus dapat menemukan data yang relevan dengan konteks kerjanya tanpa harus membuka seluruh data satu per satu.

**Acceptance Intent:** Capability data utama memiliki pencarian, filter, atau navigasi yang memadai.

## PR-NAV-002
**Priority:** MUST

Search dan filter harus tetap mematuhi scope akses pengguna.

**Acceptance Intent:** Search tidak menjadi jalur bypass authorization.

## PR-NAV-003
**Priority:** SHOULD

Filter periode, kelas, status, atau konteks domain penting harus tersedia pada area yang memerlukannya.

**Acceptance Intent:** Pengguna dapat mempersempit data secara deterministik.

## PR-NAV-004
**Priority:** SHOULD

State filter penting dapat dipertahankan selama navigasi yang wajar apabila meningkatkan efisiensi kerja.

**Acceptance Intent:** Pengguna tidak perlu mengatur ulang filter berulang kali tanpa alasan.

---

# 28. Import, Export & Bulk Operation Requirements

## PR-BULK-001
**Priority:** SHOULD

Sistem harus mendukung import data pada area yang secara operasional memerlukan volume besar.

**Acceptance Intent:** Import memiliki validasi dan laporan hasil.

## PR-BULK-002
**Priority:** MUST

Import tidak boleh melewati aturan domain utama hanya karena dilakukan secara massal.

**Acceptance Intent:** Data invalid tetap ditolak atau dilaporkan.

## PR-BULK-003
**Priority:** SHOULD

Sistem harus menyediakan preview atau validation result sebelum commit untuk import berisiko tinggi.

**Acceptance Intent:** Pengguna dapat mengetahui masalah sebelum perubahan besar diterapkan.

## PR-BULK-004
**Priority:** SHOULD

Bulk operation harus memberikan hasil yang dapat direview.

**Acceptance Intent:** Pengguna mengetahui record berhasil, gagal, atau dilewati.

## PR-BULK-005
**Priority:** MUST

Export harus mengikuti authorization dan scope pengguna.

**Acceptance Intent:** Export tidak memberi data lebih luas daripada yang boleh dilihat pengguna.

---

# 29. Integration Requirements

## PR-INTEGRATION-001
**Priority:** SHOULD

Sistem harus dapat menyediakan mekanisme integrasi dengan sistem eksternal apabila kebutuhan resmi muncul.

**Acceptance Intent:** Produk tidak dirancang sebagai sistem tertutup tanpa jalur integrasi.

## PR-INTEGRATION-002
**Priority:** MUST

Integrasi eksternal tidak boleh menjadi sumber kebenaran ambigu tanpa aturan kepemilikan data yang jelas.

**Acceptance Intent:** Sistem dapat menentukan data mana yang authoritative.

## PR-INTEGRATION-003
**Priority:** MUST

Kegagalan integrasi tidak boleh merusak transaksi domain utama yang sudah sah.

**Acceptance Intent:** Failure dapat ditangani atau diretry secara aman.

## PR-INTEGRATION-004
**Priority:** MUST

Pertukaran data dengan sistem eksternal harus mengikuti authorization dan perlindungan data.

**Acceptance Intent:** Integrasi tidak menjadi jalur bypass keamanan.

## PR-INTEGRATION-005
**Priority:** SHOULD

Integrasi penting harus dapat dipantau status keberhasilan atau kegagalannya.

**Acceptance Intent:** Operator dapat mengetahui adanya masalah sinkronisasi.

---

# 30. AI Capability Requirements

## PR-AI-001
**Priority:** MAY

Sistem dapat menyediakan capability berbasis AI untuk membantu pekerjaan pengguna.

**Acceptance Intent:** AI menjadi augmentation, bukan pengganti seluruh workflow inti.

## PR-AI-002
**Priority:** MUST

Capability AI tidak boleh mendapatkan akses data di luar scope pengguna yang memintanya.

**Acceptance Intent:** AI mengikuti authorization yang sama dengan sistem utama.

## PR-AI-003
**Priority:** MUST

Output AI yang berpotensi memengaruhi keputusan akademik, disipliner, atau data penting harus tetap dapat direview manusia.

**Acceptance Intent:** Tidak ada keputusan high-impact yang sepenuhnya otomatis tanpa human oversight.

## PR-AI-004
**Priority:** MUST

Sistem harus memperlakukan output AI sebagai hasil yang dapat salah.

**Acceptance Intent:** Output tidak dianggap fakta resmi tanpa proses validasi bila digunakan pada data formal.

## PR-AI-005
**Priority:** SHOULD

Penggunaan AI pada area sensitif harus dapat ditelusuri pada tingkat yang memadai.

**Acceptance Intent:** Pengguna dapat mengetahui kapan AI digunakan dalam workflow penting.

---

# 31. Usability Requirements

## PR-UX-001
**Priority:** MUST

Produk harus dapat digunakan oleh pengguna sekolah dengan tingkat kemampuan teknologi yang berbeda-beda.

**Acceptance Intent:** Workflow utama dapat diselesaikan tanpa pemahaman teknis khusus.

## PR-UX-002
**Priority:** MUST

Istilah yang digunakan antarmuka harus konsisten dengan istilah domain yang telah disepakati.

**Acceptance Intent:** Konsep yang sama tidak memiliki istilah berbeda tanpa alasan.

## PR-UX-003
**Priority:** MUST

Sistem harus memberikan feedback yang jelas untuk operasi berhasil, gagal, tertunda, atau memerlukan tindakan pengguna.

**Acceptance Intent:** Pengguna tidak dibiarkan menebak status operasi.

## PR-UX-004
**Priority:** MUST

Kesalahan validasi harus ditampilkan secara spesifik dan dapat ditindaklanjuti.

**Acceptance Intent:** Pesan tidak hanya menyatakan "error" tanpa konteks.

## PR-UX-005
**Priority:** SHOULD

Workflow yang sering dilakukan harus dapat diselesaikan dengan jumlah langkah yang wajar.

**Acceptance Intent:** Tidak ada langkah administratif yang tidak memberikan nilai.

## PR-UX-006
**Priority:** MUST

Antarmuka harus dapat digunakan pada ukuran layar yang menjadi target resmi produk.

**Acceptance Intent:** Capability utama tidak hanya bekerja pada satu ukuran layar.

## PR-UX-007
**Priority:** SHOULD

Sistem harus mendukung accessibility dasar yang relevan untuk aplikasi web modern.

**Acceptance Intent:** Navigasi, label, kontras, dan interaksi tidak bergantung pada satu metode input saja.

---

# 32. Localization & Time Requirements

## PR-LOCALE-001
**Priority:** MUST

Bahasa utama produk harus dapat menggunakan Bahasa Indonesia secara konsisten.

**Acceptance Intent:** Istilah domain sekolah dapat dipahami pengguna Indonesia.

## PR-LOCALE-002
**Priority:** MUST

Format tanggal dan waktu harus konsisten dengan konteks penggunaan produk.

**Acceptance Intent:** Tidak terjadi interpretasi tanggal yang ambigu.

## PR-LOCALE-003
**Priority:** MUST

Sistem harus menggunakan format waktu 24 jam pada konteks jadwal operasional sekolah.

**Acceptance Intent:** Jadwal tidak ambigu terhadap AM/PM.

## PR-LOCALE-004
**Priority:** SHOULD

Fondasi produk sebaiknya tidak menghalangi dukungan bahasa lain di masa mendatang.

**Acceptance Intent:** Localization tambahan tidak membutuhkan perubahan domain inti.

---

# 33. Data Quality Requirements

## PR-DATA-001
**Priority:** MUST

Sistem harus menerapkan validasi terhadap data penting sebelum diterima sebagai data resmi.

**Acceptance Intent:** Data tidak valid tidak diam-diam menjadi sumber kebenaran.

## PR-DATA-002
**Priority:** MUST

Identifier dan atribut yang secara domain harus unik tidak boleh menghasilkan duplikasi yang tidak sah.

**Acceptance Intent:** Constraint bisnis penting dapat dijaga.

## PR-DATA-003
**Priority:** MUST

Operasi penghapusan tidak boleh digunakan untuk menyembunyikan histori yang secara bisnis harus dipertahankan.

**Acceptance Intent:** Lifecycle data mengikuti arti domain.

## PR-DATA-004
**Priority:** MUST

Sistem harus membedakan data kosong, belum tersedia, tidak berlaku, dan nilai numerik nol jika maknanya berbeda.

**Acceptance Intent:** Pelaporan tidak salah menginterpretasikan data.

## PR-DATA-005
**Priority:** SHOULD

Sistem harus menyediakan mekanisme deteksi atau pencegahan data duplikat pada area berisiko tinggi.

**Acceptance Intent:** Operator dapat menghindari entitas ganda yang tidak disengaja.

---

# 34. Reliability Requirements

## PR-RELIABILITY-001
**Priority:** MUST

Operasi penting harus menghasilkan keadaan data yang konsisten apabila berhasil.

**Acceptance Intent:** Tidak terjadi transaksi setengah selesai pada operasi yang harus atomic.

## PR-RELIABILITY-002
**Priority:** MUST

Kegagalan proses tambahan seperti notifikasi atau integrasi eksternal tidak boleh otomatis membatalkan transaksi domain utama yang sudah sah, kecuali proses tersebut memang bagian wajib transaksi.

**Acceptance Intent:** Failure boundary jelas.

## PR-RELIABILITY-003
**Priority:** MUST

Operasi yang dapat dijalankan ulang harus didesain agar tidak menghasilkan duplikasi atau efek ganda yang tidak sah.

**Acceptance Intent:** Retry dapat dilakukan dengan aman pada operasi yang relevan.

## PR-RELIABILITY-004
**Priority:** SHOULD

Sistem harus memiliki mekanisme recovery untuk proses background yang gagal.

**Acceptance Intent:** Kegagalan dapat diketahui dan ditangani.

---

# 35. Security & Privacy Requirements

## PR-SECURITY-001
**Priority:** MUST

Sistem harus mengikuti prinsip secure by design.

**Acceptance Intent:** Keamanan menjadi requirement sejak desain, bukan tambahan setelah implementasi.

## PR-SECURITY-002
**Priority:** MUST

Data pribadi dan data sensitif harus hanya dapat diakses oleh pengguna yang berwenang.

**Acceptance Intent:** Access control diterapkan pada operasi baca dan tulis.

## PR-SECURITY-003
**Priority:** MUST

Sistem harus melindungi credential dan secret dari exposure yang tidak sah.

**Acceptance Intent:** Secret tidak disimpan atau ditampilkan secara sembarangan.

## PR-SECURITY-004
**Priority:** MUST

Input dari pengguna atau sistem eksternal harus diperlakukan sebagai untrusted input sampai divalidasi.

**Acceptance Intent:** Input tidak langsung dipercaya oleh sistem.

## PR-SECURITY-005
**Priority:** MUST

Operasi sensitif harus memiliki proteksi terhadap request yang tidak sah sesuai karakter aplikasi web.

**Acceptance Intent:** Serangan umum tidak dibiarkan tanpa mitigasi.

## PR-SECURITY-006
**Priority:** MUST

Data lintas sekolah tidak boleh bocor apabila implementasi menggunakan satu platform bersama.

**Acceptance Intent:** School boundary ditegakkan pada seluruh jalur akses relevan.

## PR-SECURITY-007
**Priority:** SHOULD

Sistem harus mendukung mekanisme pembatasan percobaan autentikasi atau abuse pada endpoint sensitif.

**Acceptance Intent:** Brute force dan abuse dapat dikurangi.

## PR-SECURITY-008
**Priority:** SHOULD

Sistem harus memiliki kebijakan session yang sesuai dengan risiko aplikasi sekolah.

**Acceptance Intent:** Session tidak berlaku tanpa batas atau dikelola secara sembarangan.

---

# 36. Performance Requirements

## PR-PERF-001
**Priority:** MUST

Workflow utama harus memiliki waktu respons yang wajar untuk penggunaan sekolah sehari-hari.

**Acceptance Intent:** Operasi umum tidak terasa macet pada beban penggunaan normal.

## PR-PERF-002
**Priority:** MUST

List data besar harus mendukung strategi pembatasan hasil seperti pagination atau mekanisme ekuivalen.

**Acceptance Intent:** Sistem tidak memuat seluruh dataset besar sekaligus tanpa kebutuhan.

## PR-PERF-003
**Priority:** SHOULD

Operasi berat yang tidak perlu diselesaikan secara sinkron sebaiknya dapat diproses secara asynchronous.

**Acceptance Intent:** User request tidak tertahan oleh pekerjaan background yang panjang.

## PR-PERF-004
**Priority:** SHOULD

Laporan atau query agregat besar harus dirancang agar tidak merusak pengalaman pengguna lain.

**Acceptance Intent:** Reporting tidak menyebabkan degradasi keseluruhan sistem secara tidak terkendali.

---

# 37. Backup, Recovery & Continuity Requirements

## PR-CONTINUITY-001
**Priority:** MUST

Data penting Ruang Pintar harus dapat dibackup.

**Acceptance Intent:** Kehilangan sistem tidak otomatis berarti kehilangan seluruh data.

## PR-CONTINUITY-002
**Priority:** MUST

Backup harus dapat dipulihkan melalui prosedur yang dapat diuji.

**Acceptance Intent:** Backup tidak dianggap valid hanya karena file backup tersedia.

## PR-CONTINUITY-003
**Priority:** SHOULD

Sistem harus memiliki target recovery yang dapat ditentukan berdasarkan skala implementasi.

**Acceptance Intent:** Sekolah dapat memiliki ekspektasi pemulihan yang jelas.

## PR-CONTINUITY-004
**Priority:** SHOULD

Perubahan besar atau migration harus mempertimbangkan kemampuan recovery apabila terjadi kegagalan.

**Acceptance Intent:** Deployment tidak dilakukan tanpa strategi pemulihan yang memadai.

---

# 38. Observability & Operational Requirements

## PR-OPS-001
**Priority:** MUST

Sistem harus menyediakan logging operasional yang memadai untuk troubleshooting.

**Acceptance Intent:** Error tidak hanya terlihat oleh pengguna tanpa jejak teknis.

## PR-OPS-002
**Priority:** MUST

Logging tidak boleh membocorkan secret atau data sensitif secara tidak perlu.

**Acceptance Intent:** Observability tidak menjadi sumber kebocoran data.

## PR-OPS-003
**Priority:** SHOULD

Sistem harus dapat membedakan error aplikasi, failure integrasi, failure background job, dan event audit.

**Acceptance Intent:** Setiap kategori dapat ditangani dengan tepat.

## PR-OPS-004
**Priority:** SHOULD

Kesehatan komponen kritis harus dapat dipantau.

**Acceptance Intent:** Operator dapat mendeteksi gangguan sebelum menjadi kerusakan berkepanjangan.

---

# 39. Compatibility & Maintainability Requirements

## PR-MAINTAIN-001
**Priority:** MUST

Produk harus dapat dikembangkan dan diuji secara bertahap tanpa mengharuskan rebuild total.

**Acceptance Intent:** Struktur implementasi mendukung evolusi produk.

## PR-MAINTAIN-002
**Priority:** MUST

Perubahan requirement harus dapat ditelusuri ke implementasi yang terdampak.

**Acceptance Intent:** Traceability dapat digunakan saat perubahan produk terjadi.

## PR-MAINTAIN-003
**Priority:** MUST

Perilaku penting harus dapat diuji secara otomatis pada tingkat yang sesuai.

**Acceptance Intent:** Regressions inti dapat dideteksi sebelum release.

## PR-MAINTAIN-004
**Priority:** SHOULD

Konfigurasi environment tidak boleh membutuhkan perubahan kode aplikasi untuk setiap deployment normal.

**Acceptance Intent:** Environment-specific configuration dipisahkan dari source behavior.

## PR-MAINTAIN-005
**Priority:** SHOULD

Dependency eksternal harus dapat diperbarui tanpa mengubah domain produk secara tidak perlu.

**Acceptance Intent:** Produk tidak terlalu terikat pada detail vendor.

---

# 40. Product Configuration Requirements

## PR-CONFIG-001
**Priority:** MUST

Sistem harus membedakan konfigurasi produk dengan data transaksi sehari-hari.

**Acceptance Intent:** Setting tidak dicampur sebagai data operasional biasa tanpa struktur.

## PR-CONFIG-002
**Priority:** MUST

Konfigurasi yang berdampak besar harus dapat dibatasi kepada pengguna berwenang.

**Acceptance Intent:** Pengguna biasa tidak dapat mengubah kebijakan sistem.

## PR-CONFIG-003
**Priority:** SHOULD

Perubahan konfigurasi penting harus dapat ditelusuri.

**Acceptance Intent:** Operator dapat mengetahui siapa mengubah setting penting.

## PR-CONFIG-004
**Priority:** SHOULD

Sistem harus mendukung default yang aman apabila konfigurasi opsional belum ditentukan.

**Acceptance Intent:** Sistem tidak gagal hanya karena setting minor belum diisi.

---

# 41. Out of Scope pada Tahap Product Requirements

Dokumen ini tidak menetapkan sebagai kebutuhan inti otomatis:

- SPMB;
- sistem keuangan sekolah;
- pembayaran SPP;
- penggajian;
- inventory;
- procurement;
- sarana dan prasarana;
- perpustakaan;
- BKK;
- tracer study;
- alumni;
- e-office;
- helpdesk;
- website publik sekolah;
- transportasi sekolah;
- kantin;
- klinik;
- asrama;
- integrasi pemerintah tertentu;
- integrasi payment gateway tertentu;
- integrasi perangkat biometric tertentu.

Capability tersebut dapat menjadi bagian Ruang Pintar di masa mendatang apabila:

1. kebutuhan produk telah didefinisikan;
2. hubungan dengan domain inti telah dianalisis;
3. requirement baru telah disetujui;
4. module map diperbarui;
5. arsitektur dan access model mendukungnya.

Tidak tercantum sebagai requirement inti bukan berarti capability tersebut dilarang.

---

# 42. Requirement yang Sengaja Belum Dikunci di Dokumen Ini

Dokumen ini sengaja belum menentukan:

- nama role final;
- matriks permission final;
- daftar modul final;
- batas service atau package;
- arsitektur monolith atau distributed;
- single-tenant atau multi-tenant;
- deployment topology;
- vendor cloud;
- database engine;
- framework frontend/backend;
- storage provider;
- queue provider;
- autentikasi provider;
- format API final;
- struktur tabel;
- detail UI;
- desain visual;
- urutan phase implementasi.

Keputusan tersebut dibahas pada dokumen berikutnya.

---

# 43. Traceability Requirement

Setiap requirement `MUST` yang masuk implementasi harus dapat ditelusuri minimal ke:

```text
Product Requirement
        ↓
Domain Rule / Domain Model
        ↓
Module / Capability
        ↓
Access Rule
        ↓
Implementation
        ↓
Test / Human Verification
```

Requirement `SHOULD` dan `MAY` yang belum diimplementasikan harus memiliki status yang jelas pada roadmap.

---

# 44. Product Acceptance Principles

Ruang Pintar tidak dianggap memenuhi requirement hanya karena:

- menu tersedia;
- halaman dapat dibuka;
- tombol dapat diklik;
- data dapat disimpan;
- UI terlihat selesai.

Requirement dianggap terpenuhi apabila:

1. perilaku produk sesuai requirement;
2. aturan domain tidak dilanggar;
3. authorization sesuai;
4. data tetap konsisten;
5. failure path yang relevan ditangani;
6. requirement dapat diverifikasi;
7. tidak terdapat bypass yang jelas terhadap aturan inti.

---

# 45. Definition of Done untuk Product Requirement

Suatu requirement dapat diberi status `IMPLEMENTED` apabila:

- implementasi tersedia;
- requirement terkait telah diuji;
- authorization telah diverifikasi;
- validasi utama telah diuji;
- failure path utama telah diperiksa;
- dokumentasi terkait telah diperbarui bila diperlukan;
- human review dilakukan pada area yang memerlukan verifikasi manusia.

---

# 46. Requirement Status Model

Status requirement yang direkomendasikan:

```text
PROPOSED
APPROVED
PLANNED
IN_PROGRESS
IMPLEMENTED
VERIFIED
DEFERRED
REJECTED
```

Status dokumen berbeda dari status requirement individual.

---

# 47. Requirement Change Control

Setelah dokumen ini berstatus `APPROVED / LOCKED`, perubahan requirement harus:

1. menjelaskan requirement yang berubah;
2. menjelaskan alasan perubahan;
3. mengidentifikasi area terdampak;
4. memperbarui ID atau versi apabila arti requirement berubah secara fundamental;
5. memperbarui domain, module map, access, architecture, roadmap, dan test bila terdampak;
6. melalui human review.

Requirement yang dihapus tidak boleh diam-diam digunakan kembali ID-nya untuk kebutuhan lain.

---

# 48. Acceptance Checklist Dokumen

Sebelum `01-PRODUCT-REQUIREMENTS.md` dikunci, human review harus memastikan:

- [ ] seluruh requirement konsisten dengan `00-PROJECT-BRIEF.md`;
- [ ] tidak terdapat capability inti yang jelas terlewat;
- [ ] tidak terdapat requirement yang terlalu teknis;
- [ ] requirement utama dapat diverifikasi;
- [ ] prioritas MUST / SHOULD / MAY masuk akal;
- [ ] tidak terdapat modul tambahan yang diam-diam dianggap mandatory;
- [ ] batas antara identitas, assignment, periode, sesi, publikasi, dan histori tetap jelas;
- [ ] kebutuhan guru, siswa, wali kelas, orang tua, pimpinan, dan pengelola sistem telah tercakup;
- [ ] keamanan, audit, file, integration, reliability, dan data quality telah tercakup;
- [ ] bagian Out of Scope telah diperiksa;
- [ ] keputusan yang sengaja ditunda ke dokumen berikutnya sudah benar.

---

# 49. Status Dokumen

**Status Saat Ini:** FINAL REVIEW  
**Versi:** 1.0-RC

Dokumen ini telah disusun sebagai kandidat final, tetapi belum berstatus `APPROVED / LOCKED` sebelum human review selesai.

Apabila human review menyetujui tanpa perubahan fundamental:

```text
Version: 1.0
Status: APPROVED / LOCKED
```

---

# 50. Dokumen Berikutnya

Setelah `01-PRODUCT-REQUIREMENTS.md` berstatus `APPROVED / LOCKED`, pembahasan dilanjutkan ke:

```text
02-DOMAIN-MODEL.md
```

Dokumen tersebut akan menjawab pertanyaan:

> **Konsep apa saja yang hidup di dalam dunia Ruang Pintar, bagaimana hubungan antar konsep tersebut, dan aturan bisnis apa yang harus selalu benar?**

`02-DOMAIN-MODEL.md` tidak boleh mengubah requirement produk yang telah dikunci tanpa proses perubahan requirement resmi.
