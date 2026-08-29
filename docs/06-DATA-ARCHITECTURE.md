# 06 — DATA ARCHITECTURE
## Ruang Pintar

**Nama Dokumen:** Data Architecture  
**Nama Produk:** Ruang Pintar  
**Versi Dokumen:** 1.0-RC  
**Status:** FINAL REVIEW  
**Bahasa Utama:** Bahasa Indonesia  

**Dokumen Induk:**
- `00-PROJECT-BRIEF.md`
- `01-PRODUCT-REQUIREMENTS.md`
- `02-DOMAIN-MODEL.md`
- `03-MODULE-MAP.md`
- `04-ROLE-ACCESS.md`
- `05-SYSTEM-ARCHITECTURE.md`

---

# 1. Tujuan Dokumen

Dokumen ini mendefinisikan bagaimana domain Ruang Pintar diterjemahkan menjadi arsitektur data yang konsisten, aman, historis, dapat dimigrasikan, dan dapat diuji pada SQLite.

Dokumen ini menjawab pertanyaan:

> **Bagaimana data Ruang Pintar dimodelkan, diidentifikasi, dihubungkan, divalidasi, disimpan, diindeks, dimigrasikan, dibackup, dan dipertahankan historinya tanpa melanggar domain model?**

Dokumen ini menjadi dasar untuk:

- schema database;
- Prisma schema;
- migration;
- constraint;
- indexing;
- transaction;
- repository/data-access implementation;
- audit;
- outbox;
- backup;
- restore;
- seed;
- test database;
- data lifecycle;
- data migration;
- query optimization.

---

# 2. Keputusan Data Architecture Inti

| Area | Keputusan |
|---|---|
| Database engine | **SQLite** |
| Environment | **SQLite untuk development, test, production** |
| ORM | **Prisma ORM 7.x stable** |
| SQLite adapter | **`@prisma/adapter-better-sqlite3`** |
| Identifier | **ULID 26 karakter** |
| Domain entity ID | **String ULID first-party** |
| Referential integrity | **Foreign Key wajib aktif** |
| Journal mode production | **WAL** |
| Durability baseline production | **`synchronous=FULL`** |
| Delete strategy | **Tidak menggunakan global soft-delete** |
| Historical strategy | **Explicit lifecycle + effective dating + append-oriented history bila diperlukan** |
| Migration | **Versioned, forward-moving, immutable setelah applied** |
| Audit | **Append-oriented audit records** |
| Async reliability | **Transactional Outbox** |
| File binary | **Tidak disimpan di database secara default** |
| File metadata | **Disimpan di database** |
| JSON | **Digunakan terbatas, bukan pengganti relational model** |
| Schema ownership | **Mengikuti Module Map** |
| Production database | **Satu SQLite database utama per deployment sekolah** |

---

# 3. Mengapa Prisma ORM

Baseline menggunakan Prisma ORM karena:

- dukungan resmi SQLite;
- schema deklaratif;
- migration tooling;
- type-safe generated client;
- dukungan relation;
- dukungan transaction;
- dukungan ULID;
- ekosistem matang untuk TypeScript/Next.js;
- cocok untuk database yang sama di development, testing, dan production.

Prisma digunakan sebagai **data-access tool**, bukan sebagai Domain Model.

Prisma Model tidak boleh menentukan makna bisnis hanya karena mudah dimodelkan secara ORM.

---

# 4. Prisma Bukan Domain

Prinsip:

```text
Domain Model
    ↓
Data Architecture
    ↓
Prisma Schema
```

Bukan:

```text
Prisma Schema
    ↓
Domain dianggap mengikuti ORM
```

Contoh:

Domain menyatakan:

```text
Student Identity
≠
Student Enrollment
≠
Rombel Placement
```

Maka Prisma/data model harus mempertahankan pemisahan tersebut.

Dilarang menyederhanakan menjadi:

```text
Student
- currentClass
- currentSemester
```

jika menyebabkan histori hilang.

---

# 5. SQLite sebagai Database Resmi

Ruang Pintar menggunakan SQLite sebagai database utama pada seluruh environment.

```text
Development → SQLite
Testing     → SQLite
Production  → SQLite
```

Tujuan:

- environment parity;
- setup sederhana;
- deployment sederhana;
- portability;
- backup per sekolah;
- tidak memerlukan database server terpisah;
- cocok dengan single-school-per-deployment.

---

# 6. Satu Database per Deployment Sekolah

Baseline:

```text
1 Deployment
=
1 School
=
1 Primary SQLite Database
```

Database tidak menjadi shared multi-school database pada baseline.

Meskipun demikian, domain `School` tetap eksplisit dan resource yang membutuhkan konteks sekolah tetap dapat direlasikan secara benar.

---

# 7. Lokasi Database Production

File SQLite production harus berada pada persistent filesystem.

Contoh konseptual:

```text
/var/lib/ruang-pintar/
└── data/
    └── ruang-pintar.db
```

Path tersebut hanya ilustrasi dan bukan path wajib.

Database production tidak boleh:

- berada pada ephemeral storage;
- disimpan di Git;
- diletakkan di public web directory;
- dapat di-download langsung melalui URL;
- hilang saat aplikasi diredeploy.

---

# 8. SQLite Foreign Key

Foreign key enforcement wajib aktif pada setiap koneksi database.

Baseline:

```sql
PRAGMA foreign_keys = ON;
```

Aplikasi tidak boleh mengandalkan asumsi bahwa SQLite selalu mengaktifkan foreign key secara default.

Startup/database initialization harus dapat memverifikasi bahwa foreign key enforcement aktif.

---

# 9. SQLite WAL Mode

Production menggunakan:

```sql
PRAGMA journal_mode = WAL;
```

Tujuan:

- concurrency pembacaan lebih baik;
- writer tidak memblokir reader seperti rollback journal tradisional dalam banyak kasus;
- recovery behavior yang sesuai untuk aplikasi server;
- cocok untuk single-node persistent deployment.

WAL mode tidak mengubah prinsip bahwa write transaction harus singkat.

---

# 10. SQLite Durability

Baseline production:

```sql
PRAGMA synchronous = FULL;
```

Prioritas Ruang Pintar adalah menjaga durability data sekolah.

Optimization ke `NORMAL` hanya boleh dilakukan setelah:

- benchmark;
- analisis risiko;
- backup/recovery matang;
- Architecture Decision Record.

Development/testing dapat menggunakan configuration yang sesuai kebutuhan test, tetapi test integritas wajib mencerminkan production behavior yang relevan.

---

# 11. Busy Handling

SQLite memiliki single-writer characteristics.

Application harus memiliki strategi reasonable busy handling agar write contention singkat tidak langsung menghasilkan kegagalan user yang tidak perlu.

Contohnya:

- `busy_timeout`;
- retry terbatas pada operasi yang aman;
- transaction singkat.

Retry tidak boleh digunakan untuk menyembunyikan desain transaction yang buruk.

---

# 12. Identifier Strategy

First-party domain entity menggunakan:

```text
ULID
```

Contoh:

```text
01K4AB7QZ7NJKP9R3AGT2F6HVM
```

Karakteristik:

- 26 karakter;
- unique;
- lexicographically sortable;
- tidak sequential sederhana;
- dapat digunakan sebagai public identifier.

---

# 13. ULID sebagai Primary Identifier

Baseline Prisma concept:

```text
id String @id @default(ulid())
```

Untuk first-party domain entity baru.

Aturan:

**DATA-ID-001**  
ID tidak boleh memiliki business meaning.

**DATA-ID-002**  
NIS, NISN, kode mapel, nomor induk pegawai, username, email, atau nomor dokumen bukan pengganti primary identifier teknis.

**DATA-ID-003**  
Business identifier dapat memiliki unique constraint sendiri bila domain mengharuskannya.

**DATA-ID-004**  
ULID tidak boleh diganti hanya karena UI membutuhkan nomor urut.

---

# 14. Konvensi Penamaan Database

Database fisik Ruang Pintar menggunakan **Bahasa Indonesia untuk nama tabel, kolom, relasi domain, dan istilah first-party**, sejauh tetap jelas, konsisten, dan aman secara teknis.

Istilah teknis universal atau metadata framework dapat tetap menggunakan istilah aslinya apabila penerjemahan justru menurunkan kejelasan.

Baseline database naming:

```text
snake_case
```

Contoh tabel domain:

```text
siswa
keikutsertaan_akademik_siswa
penempatan_rombel
guru
mata_pelajaran
penugasan_mengajar
penugasan_wali_kelas
tahun_ajaran
kalender_akademik
jadwal_pelajaran
sesi_pembelajaran
materi
publikasi_materi
tugas
publikasi_tugas
pengumpulan_tugas
presensi_sekolah
presensi_sesi
asesmen
nilai
publikasi_nilai
bank_soal
versi_soal
ujian
snapshot_ujian
sesi_pengerjaan_ujian
hubungan_wali_siswa
pengumuman
notifikasi
log_audit
```

Contoh kolom domain:

```text
sekolah_id
siswa_id
guru_id
mata_pelajaran_id
tahun_ajaran_id
rombel_id
berlaku_mulai
berlaku_sampai
dipublikasikan_pada
difinalisasi_pada
```

Istilah teknis yang boleh tetap menggunakan bentuk konvensional antara lain:

```text
id
ulid
url
json
hash
token
payload
metadata
mime_type
checksum
created_at
updated_at
```

Prinsip resmi:

> **Domain milik Ruang Pintar menggunakan Bahasa Indonesia. Istilah framework, protocol, provider, dan metadata teknis standar boleh mempertahankan istilah aslinya.**

Prisma Model di source code boleh menggunakan nama TypeScript yang idiomatik jika dibutuhkan untuk interoperability dan maintainability, tetapi tabel/kolom fisik database tetap dipetakan ke konvensi Bahasa Indonesia melalui mekanisme mapping Prisma.

---

# 15. Table Ownership

Setiap tabel memiliki owner module sesuai `03-MODULE-MAP.md`.

Contoh:

```text
keikutsertaan_akademik_siswa
→ M07 Student Academic Lifecycle

penugasan_mengajar
→ M08 Teacher & Teaching Assignment

presensi_sesis
→ M12 Attendance

grades
→ M13 Assessment & Gradebook
```

Module lain tidak boleh melakukan direct write hanya karena mengetahui nama tabel.

---

# 16. Foreign Key Strategy

Relasi domain yang wajib ada harus menggunakan foreign key jika dapat direpresentasikan secara relational.

Contoh:

```text
Student Enrollment
→ Student

Rombel Placement
→ Student Enrollment
→ Rombel
```

Foreign key bukan sekadar dokumentasi; enforcement harus aktif.

---

# 17. ON DELETE Strategy

`ON DELETE` tidak boleh dipilih secara otomatis.

Pilihan harus mengikuti domain.

## 17.1 RESTRICT / NO ACTION

Default untuk data historis penting.

Contoh:

- Student dengan Enrollment;
- Academic Year dengan data akademik;
- Assessment dengan Grade;
- Exam dengan Attempt.

## 17.2 CASCADE

Hanya digunakan jika child benar-benar tidak memiliki makna mandiri dan deletion parent memang sah menghapusnya.

## 17.3 SET NULL

Digunakan jika hubungan boleh dilepas tanpa menghapus resource.

Setiap penggunaan `CASCADE` harus direview agar tidak menghapus histori secara tidak sengaja.

---

# 18. Tidak Ada Global Soft Delete

Ruang Pintar tidak menggunakan pola:

```text
deleted_at
```

pada semua tabel secara otomatis.

Alasannya:

- lifecycle domain berbeda-beda;
- soft delete sering menyembunyikan kompleksitas;
- unique constraint menjadi lebih rumit;
- data historis sebaiknya dimodelkan eksplisit.

---

# 19. Delete Strategy

Gunakan tiga kategori.

## 19.1 Hard Delete

Boleh untuk data yang:

- masih draft;
- belum memiliki downstream dependency penting;
- memang disposable;
- deletion tidak merusak histori.

## 19.2 Deactivate / Close

Untuk entity yang tetap memiliki histori.

Contoh:

- account;
- assignment;
- enrollment;
- relationship.

## 19.3 Archive

Untuk resource yang tidak lagi aktif tetapi masih perlu ditemukan atau direferensikan.

Pilihan lifecycle harus mengikuti domain, bukan satu pola global.

---

# 20. Historical Data Strategy

Histori dipertahankan menggunakan kombinasi:

- effective period;
- status lifecycle;
- version;
- immutable snapshot;
- audit;
- correction record;
- publication history.

Tidak semua histori harus dibuat sebagai tabel `*_history`.

---

# 21. Effective Dating

Konsep periodik menggunakan field konseptual seperti:

```text
effective_from
effective_until
```

atau context academic period bila sudah cukup.

Contoh:

- Position Assignment;
- Teaching Assignment;
- Homeroom Assignment;
- Student Enrollment;
- Rombel Placement.

`created_at` tidak boleh digunakan sebagai pengganti tanggal mulai berlaku.

---

# 22. Temporal Invariant

Jika domain melarang overlapping assignment, constraint harus ditegakkan melalui:

- application/domain validation;
- transaction;
- query validation;
- database constraint tambahan jika SQLite mampu merepresentasikannya dengan aman.

Tidak semua temporal invariant dapat diserahkan hanya kepada foreign key.

---

# 23. Timestamp Strategy

Technical timestamps:

```text
created_at
updated_at
```

digunakan bila relevan.

Business timestamps dibuat eksplisit:

```text
published_at
submitted_at
finalized_at
effective_from
effective_until
started_at
ended_at
```

Technical timestamp tidak boleh menggantikan business event time.

---

# 24. Timezone Strategy

Instant yang merepresentasikan kejadian nyata disimpan secara konsisten sebagai waktu absolut/UTC melalui representasi ORM yang tidak ambigu.

Timezone sekolah disimpan sebagai configuration/domain data.

Contoh:

```text
Asia/Jakarta
```

Jadwal lokal yang secara domain merupakan waktu sekolah harus tetap dapat direkonstruksi dalam timezone sekolah.

Format UI menggunakan 24 jam.

---

# 25. Nullable Strategy

`NULL` hanya digunakan jika nilai memang:

- belum diketahui;
- belum tersedia;
- tidak berlaku;
- optional secara domain.

Dilarang menggunakan sentinel seperti:

```text
0
""
"-"
1970-01-01
```

untuk menggantikan NULL tanpa alasan domain.

---

# 26. Missing Grade

Invariant:

```text
Belum dinilai
≠
Nilai 0
```

Grade yang belum tersedia tidak boleh dipaksa memiliki numeric score.

Data model harus dapat membedakan minimal:

- belum dinilai;
- nilai 0;
- tidak berlaku;
- nilai tersedia.

Representasi final ditentukan pada schema detail, tetapi invariant tidak boleh hilang.

---

# 27. Boolean Strategy

Boolean digunakan hanya untuk state dua nilai yang benar-benar binary.

Dilarang menggunakan banyak boolean yang saling bertentangan:

```text
is_draft
is_published
is_closed
is_archived
```

jika sebenarnya satu lifecycle state lebih tepat.

---

# 28. Status Strategy

Jika resource memiliki lifecycle:

```text
DRAFT
PUBLISHED
CLOSED
```

gunakan satu status yang memiliki vocabulary eksplisit.

Status disimpan sebagai nilai yang terkontrol dan divalidasi oleh domain.

---

# 29. Enum Strategy

Karena SQLite tidak memiliki native enum seperti beberapa database lain, enum application-level tetap harus:

- memiliki vocabulary eksplisit;
- tervalidasi;
- stabil;
- dapat dimigrasikan.

Jika diperlukan, migration dapat menggunakan `CHECK` constraint untuk nilai kritis.

---

# 30. JSON Strategy

JSON boleh digunakan untuk:

- metadata fleksibel;
- snapshot teknis tertentu;
- provider payload;
- audit metadata;
- configuration tambahan yang benar-benar schemaless.

JSON tidak boleh digunakan untuk menghindari relational modeling.

Contoh buruk:

```text
students.data_json
```

yang berisi seluruh:

- enrollment;
- kelas;
- wali;
- nilai;
- presensi.

---

# 31. Binary Data

File binary besar tidak disimpan di SQLite secara default.

Database menyimpan:

- file ID;
- storage key;
- metadata;
- owner relation;
- size;
- MIME type;
- checksum jika diperlukan.

Binary berada pada private file storage.

---

# 32. Unique Constraint Strategy

Unique constraint harus berasal dari domain rule.

Contoh potensial:

- satu business code tertentu unik dalam school context;
- satu active attempt tertentu;
- satu relation tertentu tidak boleh duplikat;
- satu publication target tertentu tidak boleh duplikat jika domain melarang.

Tidak semua field yang "terlihat unik" harus dipaksa global unique.

---

# 33. School-Scoped Uniqueness

Walaupun baseline satu deployment satu sekolah, uniqueness yang secara makna milik sekolah tetap harus dimodelkan dengan konteks yang tepat apabila diperlukan.

Contoh konseptual:

```text
sekolah_id + code
```

lebih kuat secara domain dibanding berasumsi code global selamanya.

Namun tidak semua tabel harus memiliki `sekolah_id` langsung jika school context dapat ditentukan secara aman melalui parent relationship.

Keputusan denormalisasi `sekolah_id` dilakukan per aggregate berdasarkan keamanan, query, audit, dan performance.

---

# 34. School Context Strategy

Gunakan dua pola.

## 34.1 Direct School Ownership

Resource fundamental atau lintas-domain dapat memiliki `sekolah_id` langsung.

Contoh potensial:

- organization unit;
- academic year;
- user-school membership;
- audit;
- configuration.

## 34.2 Derived School Ownership

Resource child dapat memperoleh school context melalui parent jika:

- relationship wajib;
- traversal tidak ambigu;
- tidak menimbulkan risiko authorization yang tidak perlu.

School context harus selalu dapat ditentukan secara deterministik.

---

# 35. Index Strategy

Index dibuat berdasarkan:

1. primary key;
2. unique constraint;
3. foreign key lookup;
4. frequent filter;
5. sorting;
6. authorization scope;
7. reporting/query evidence.

Dilarang membuat index pada setiap column tanpa alasan.

---

# 36. Foreign Key Index

Column child yang sering digunakan untuk foreign-key lookup harus dievaluasi untuk index.

Contoh:

```text
keikutsertaan_akademik_siswa.siswa_id
penempatan_rombel.enrollment_id
grades.siswa_id
grades.assessment_id
```

Index final ditentukan berdasarkan query nyata dan query plan.

---

# 37. Composite Index

Composite index digunakan bila query nyata sering menggunakan kombinasi tertentu.

Contoh konseptual:

```text
(periode_akademik_id, rombel_id)
```

atau:

```text
(teaching_assignment_id, status)
```

Urutan column index harus mengikuti pola query.

---

# 38. Authorization-Aware Indexing

Karena banyak query Ruang Pintar bersifat scoped, index perlu mempertimbangkan filter seperti:

- period;
- rombel;
- assignment;
- student;
- status;
- timestamp.

Optimization tetap harus berbasis pengukuran.

---

# 39. Query Rules

Query domain harus:

- memiliki owner module;
- authorization-aware;
- tidak mengambil data lebih luas daripada yang diperlukan;
- menggunakan pagination untuk list besar;
- menghindari N+1;
- menghindari unbounded query;
- menggunakan projection/select field bila seluruh record tidak diperlukan.

---

# 40. Pagination

List data besar wajib menggunakan pagination atau bounded retrieval.

Baseline dapat menggunakan:

- cursor/keyset pagination untuk list yang cocok;
- offset pagination untuk kebutuhan sederhana dengan ukuran terbatas.

Pilihan ditentukan per use case.

ULID dapat membantu cursor ordering pada beberapa use case, tetapi tidak boleh diasumsikan sebagai business chronological order tanpa field waktu resmi.

---

# 41. Transaction Strategy

Transaction digunakan jika beberapa perubahan harus berhasil atau gagal bersama.

Contoh:

```text
Create Student Enrollment
+
Create Initial Rombel Placement
+
Create Audit Record
+
Create Outbox Event
```

jika use case menetapkan semuanya atomic.

---

# 42. Transaction Duration

Transaction harus sesingkat mungkin.

Di dalam transaction dilarang melakukan:

- email network call;
- AI provider call;
- S3 upload besar;
- external integration call;
- report generation berat;
- waiting terhadap user.

External side effect dipindahkan setelah commit melalui outbox/worker jika sesuai.

---

# 43. Optimistic Concurrency

Untuk resource yang rawan lost update, application harus mempertimbangkan optimistic concurrency.

Pendekatan dapat menggunakan:

- `updated_at`;
- version number;
- state precondition.

Tidak seluruh tabel membutuhkan version column.

Resource seperti configuration, schedule publication, grade finalization, atau workflow sensitif harus dievaluasi.

---

# 44. Transactional Outbox

Outbox disimpan dalam database yang sama dengan domain transaction.

Konsep data:

```text
Outbox Event
- id
- event_type
- aggregate_type
- aggregate_id
- payload
- occurred_at
- status
- attempt_count
- available_at
- processed_at
```

Field final dapat berubah saat schema implementation.

Prinsip yang dikunci:

- ditulis dalam transaction yang sama;
- diproses setelah commit;
- idempotent;
- retryable;
- observable.

---

# 45. Outbox Payload

Outbox payload tidak boleh menjadi dump seluruh entity tanpa kebutuhan.

Payload hanya berisi data yang diperlukan untuk downstream processing.

Data sensitif harus diminimalkan.

---

# 46. Audit Data Model

Audit bersifat append-oriented.

Konsep minimum:

```text
Audit Event
- id
- school context
- actor
- action
- resource type
- resource id
- occurred_at
- request/correlation context
- metadata
```

Before/after snapshot hanya digunakan untuk operasi yang benar-benar membutuhkan dan aman menyimpannya.

---

# 47. Audit ≠ History Table

Audit menjawab:

> siapa melakukan apa dan kapan?

Domain history menjawab:

> state bisnis apa yang berlaku pada waktu tertentu?

Keduanya tidak boleh disamakan.

---

# 48. File Metadata Data Model

Konsep minimum:

```text
File
- id
- storage_provider
- storage_key
- original_name
- media_type
- size
- checksum optional
- lifecycle_status
- created_at
```

Relasi attachment terhadap parent harus eksplisit atau melalui attachment model yang terkontrol.

---

# 49. Polymorphic Relation

Polymorphic relation generik tidak digunakan secara sembarangan.

Contoh raw:

```text
attachment
- owner_type
- owner_id
```

memudahkan fleksibilitas tetapi dapat melemahkan foreign key integrity.

Pilihan polymorphic hanya digunakan setelah trade-off dipahami.

Untuk resource kritis, explicit relation lebih disukai.

---

# 50. Authentication Data

Data authentication dapat dikelola oleh library/provider yang dipilih kemudian.

Domain Ruang Pintar tetap memisahkan:

```text
Auth Account
≠
Teacher Profile
≠
Student Identity
≠
Guardian Identity
```

Jika provider menggunakan identifier internal berbeda, mapping first-party harus eksplisit.

---

# 51. User-School Relationship

Karena deployment satu sekolah, user tetap harus memiliki konteks hubungan dengan sekolah bila domain membutuhkannya.

Tidak boleh menganggap:

```text
User Account
= otomatis seluruh authority sekolah
```

Access berasal dari role, assignment, relationship, permission, dan scope.

---

# 52. Student Data Model

Conceptual relational model:

```text
students
    ↓
keikutsertaan_akademik_siswa
    ↓
penempatan_rombel
```

Invariant:

```text
Student Identity
≠
Student Enrollment
≠
Rombel Placement
```

Tidak ada `current_class` sebagai satu-satunya sumber kebenaran siswa.

---

# 53. Enrollment Data

Enrollment merepresentasikan participation siswa pada academic context.

Enrollment dapat memiliki:

- academic period;
- status;
- effective dates;
- admission/continuation context yang relevan.

Riwayat enrollment tidak ditimpa oleh enrollment baru.

---

# 54. Rombel Placement Data

Placement menghubungkan enrollment dengan rombel dalam effective period.

Perpindahan kelas menghasilkan perubahan placement, bukan perubahan identitas siswa.

Data model harus dapat menanyakan:

```text
Siswa X berada di rombel mana
pada tanggal/periode tertentu?
```

---

# 55. Teacher Data Model

Conceptual model:

```text
guru
mata_pelajaran
penugasan_mengajar
```

Invariant:

```text
Teacher
≠
Subject
≠
Teaching Assignment
```

Subject tidak menyimpan satu teacher permanen sebagai pemilik akademik.

---

# 56. Teaching Assignment Data

Teaching Assignment minimal menghubungkan:

- teacher;
- subject;
- academic period;
- learning/class scope;
- effective state.

Satu guru dapat memiliki banyak assignment.

Satu subject dapat memiliki banyak assignment.

---

# 57. Homeroom Assignment Data

Homeroom Assignment terpisah dari Teaching Assignment.

Konseptual:

```text
teacher
+
rombel
+
academic period
+
effective period
```

Wali kelas tidak disimpan sebagai field permanen pada teacher atau rombel tanpa histori assignment.

---

# 58. Academic Calendar Data

Academic Calendar harus dapat merepresentasikan:

- event;
- effective date/range;
- category;
- school day semantics;
- exception.

Calendar tidak dicampur dengan Master Schedule.

---

# 59. Master Schedule Data

Master Schedule menyimpan rencana resmi.

Schedule harus dapat versioned/published tanpa menimpa histori secara buta.

Detail versioning dapat menggunakan:

- schedule version;
- effective period;
- publication state;
- immutable published snapshot tertentu.

Model final ditentukan saat schema design per phase.

---

# 60. Actual Class Session Data

Actual Class Session merepresentasikan kejadian nyata.

Session tidak boleh disimpulkan hanya dari schedule row saat query.

Session dapat memiliki:

- planned schedule reference;
- actual start/end;
- actual teacher;
- actual room;
- lifecycle status.

---

# 61. Attendance Data

Presensi dibagi:

```text
presensi_sekolah
presensi_sesi
```

atau model ekuivalen yang mempertahankan invariant.

Class attendance wajib merujuk Actual Class Session.

Koreksi presensi harus dapat diaudit.

---

# 62. Learning Content Data

Pemisahan:

```text
materi
publikasi_materi
```

Material dapat reusable.

Publication memiliki context sendiri.

Update Material tidak boleh otomatis mengubah fakta publication historis jika domain membutuhkan snapshot/version.

---

# 63. Assignment Data

Pemisahan:

```text
tugas
publikasi_tugas
pengumpulan_tugas
```

Submission terkait publication yang diberikan kepada siswa.

Deadline berada pada publication/context pemberian tugas, bukan selalu pada reusable definition.

---

# 64. Assessment Data

Pemisahan:

```text
asesmen
grades
publikasi_nilai / publication state
```

Grade menyimpan hasil siswa.

Assessment Definition tidak menyimpan seluruh nilai siswa sebagai JSON.

---

# 65. Grade Data

Grade harus dapat merepresentasikan:

- score jika ada;
- missing state;
- status;
- grading context;
- updated/finalized metadata yang relevan.

Nilai `0` adalah nilai sah jika memang diberikan.

`NULL`/missing state memiliki makna berbeda.

---

# 66. Grade Publication

Published state harus dapat dibedakan dari internal draft.

Guardian dan Student hanya membaca grade yang memenuhi publication rule.

Unpublish tidak menghapus grade.

---

# 67. CBT Data

Pemisahan konseptual:

```text
bank_soal
questions
versi_soal
ujian
snapshot_ujian
sesi_pengerjaan_ujian
jawaban_ujian
kejadian_integritas
```

Nama table final dapat berubah, tetapi invariant tidak.

---

# 68. CBT Snapshot

Exam Snapshot harus stabil setelah digunakan untuk attempt.

Perubahan Question Bank tidak boleh mengubah attempt yang sudah ada.

Snapshot dapat menyimpan reference ke immutable version atau materialized snapshot sesuai kebutuhan.

---

# 69. CBT Attempt

Attempt memiliki lifecycle eksplisit.

Contoh:

```text
NOT_STARTED
IN_PROGRESS
SUBMITTED
EXPIRED
CANCELLED
```

Vocabulary final mengikuti domain implementation.

Constraint harus mencegah multiple active attempt jika policy melarang.

---

# 70. Guardian Data

Pemisahan:

```text
wali
hubungan_wali_siswa
```

Relationship minimal memiliki:

- guardian;
- student;
- type;
- verification status;
- lifecycle/effective status.

Akses tidak berasal dari pencocokan nama atau nomor telepon semata.

---

# 71. Communication Data

Announcement dan Notification terpisah.

```text
pengumuman
target_pengumuman
notifikasi
```

Audience selection harus dapat direkonstruksi sesuai kebutuhan audit/publikasi.

Notification bukan sumber Announcement.

---

# 72. Monitoring Data

Student Indicator dapat berupa derived/read model.

Source data tetap:

- Attendance;
- Assignment;
- Assessment;
- Student Lifecycle.

Monitoring Note dan Follow-Up adalah data domain M18 dan dapat persisten.

Derived indicator harus dapat diperbarui/rebuild bila desain mengizinkan.

---

# 73. Reporting Data

Reporting dapat memiliki:

- query langsung;
- projection;
- materialized read model application-level;
- generated export metadata.

Reporting tidak boleh menjadi transaksi utama.

Duplicated read data harus memiliki source yang jelas.

---

# 74. Import Data

Import dilakukan melalui staging/validation flow untuk data besar atau berisiko.

Pola:

```text
Upload
 ↓
Parse
 ↓
Validate
 ↓
Preview
 ↓
Commit
 ↓
Result Report
```

Import tidak boleh langsung memasukkan data invalid ke tabel domain resmi.

---

# 75. Import Idempotency

Jika import dapat diulang, sistem harus memiliki strategi mencegah duplicate data.

Dapat menggunakan:

- external reference;
- natural business unique constraint;
- batch ID;
- idempotency key.

---

# 76. Export Data

Export hanya mengambil data yang lolos effective access.

Export metadata dapat mencatat:

- actor;
- scope;
- generated_at;
- filter;
- file reference;
- status.

Export file sensitif disimpan private.

---

# 77. Seed Strategy

Seed dibagi:

## 77.1 Reference Seed

Data sistem yang dibutuhkan untuk aplikasi berjalan.

## 77.2 Development Seed

Data contoh untuk development.

## 77.3 Test Fixture

Data deterministik untuk automated test.

Production tidak boleh otomatis menerima fake development data.

---

# 78. Migration Strategy

Migration harus:

- versioned;
- disimpan di source control;
- reproducible;
- dapat membuat fresh database;
- dapat meng-upgrade database existing;
- memiliki urutan deterministik.

Baseline menggunakan Prisma Migrate sebagai migration workflow utama.

---

# 79. Applied Migration Immutability

Setelah migration dianggap applied pada environment yang dipertahankan:

```text
migration lama
→ immutable
```

Jika schema perlu diperbaiki:

```text
buat forward migration baru
```

Dilarang mengedit migration lama secara diam-diam untuk "membuat test lewat".

---

# 80. Fresh Database Verification

Quality gate database harus menjalankan:

```text
empty database
 ↓
apply all migrations
 ↓
schema valid
 ↓
seed/reference data jika diperlukan
 ↓
tests
```

Fresh path dan upgrade path keduanya penting.

---

# 81. Migration Review

Migration berisiko tinggi harus diperiksa untuk:

- data loss;
- table rebuild;
- constraint change;
- nullable → required;
- unique constraint;
- foreign key;
- bulk transformation;
- index cost.

SQLite memiliki keterbatasan ALTER tertentu sehingga migration tool dapat melakukan table reconstruction. Hal tersebut harus dipahami sebelum production migration.

---

# 82. Schema Drift

Database runtime dan migration history harus konsisten.

Schema drift tidak boleh diperbaiki dengan:

- manual edit production DB tanpa catatan;
- edit migration applied;
- mengabaikan mismatch.

Perbaikan menggunakan forward migration atau prosedur recovery resmi.

---

# 83. Backup Strategy

Backup wajib mencakup:

```text
SQLite Database
+
Private File Storage
+
Required Configuration
```

Database backup dan file backup harus memiliki correlation/version yang memadai agar restore tidak menghasilkan pasangan data-file yang tidak konsisten.

---

# 84. SQLite Backup

Backup database aktif harus menggunakan metode SQLite-aware yang aman.

Jangan mengandalkan copy file utama secara sembarangan saat database aktif, terutama saat WAL digunakan.

Backup procedure harus mempertimbangkan state:

```text
.db
-wal
-shm
```

atau menggunakan backup mechanism yang menghasilkan snapshot konsisten.

---

# 85. Restore Test

Backup belum dianggap berhasil sebelum restore diuji.

Minimal harus ada prosedur:

```text
Create Backup
 ↓
Restore ke lokasi test
 ↓
Open Database
 ↓
Run integrity check
 ↓
Run application smoke test
 ↓
Verify files
```

---

# 86. Integrity Check

Operational tooling harus dapat menjalankan pemeriksaan integritas SQLite secara berkala atau saat recovery.

Contoh mekanisme SQLite:

```sql
PRAGMA integrity_check;
```

Foreign key consistency juga harus dapat diverifikasi.

---

# 87. Retention

Retention policy harus mempertimbangkan:

- academic history;
- audit;
- personal data;
- file lifecycle;
- legal/organizational requirement;
- storage capacity.

Dokumen ini tidak menetapkan tahun retention spesifik karena perlu kebijakan organisasi dan regulasi yang berlaku.

---

# 88. Personal Data Minimization

Database hanya menyimpan data personal yang:

- diperlukan;
- memiliki tujuan jelas;
- memiliki access model;
- memiliki lifecycle.

Jangan menyimpan data sensitif hanya karena "mungkin berguna nanti".

---

# 89. Sensitive Data

Data sensitif harus:

- dibatasi authorization;
- tidak masuk log secara sembarangan;
- tidak masuk outbox payload tanpa kebutuhan;
- tidak diekspor tanpa permission;
- tidak dimasukkan ke AI tanpa effective access dan tujuan sah.

Encryption field-level dapat ditambahkan bila threat model dan requirement membutuhkannya.

---

# 90. Password dan Secret

Password hash/auth secret bukan domain profile data.

Secret tidak boleh disimpan sebagai plaintext domain field.

Detail authentication storage mengikuti authentication provider yang dipilih.

---

# 91. Data Access Module Boundary

Public application contract lebih disukai daripada cross-module direct Prisma query untuk operasi domain.

Read composition lintas module dapat menggunakan dedicated query/read layer yang tetap:

- read-only;
- authorization-aware;
- tidak mengubah ownership.

---

# 92. Prisma Client Boundary

Prisma Client tidak boleh diekspos langsung ke browser.

Prisma hanya digunakan pada server runtime.

Dilarang membuat generic client API yang memungkinkan caller menentukan table/model dan operasi arbitrer.

---

# 93. Raw SQL

Raw SQL boleh digunakan jika:

- ORM tidak mencukupi;
- performance membutuhkan;
- migration membutuhkan;
- SQLite feature membutuhkan.

Syarat:

- parameterized;
- berada pada ownership yang jelas;
- diuji;
- terdokumentasi bila kompleks;
- tidak menjadi bypass authorization.

---

# 94. Database Views

Database view bukan baseline wajib.

View dapat digunakan jika memberi nilai nyata untuk:

- reporting;
- read model;
- query complexity.

View tidak boleh menjadi alasan menyembunyikan ownership domain yang buruk.

---

# 95. Triggers

Database trigger digunakan secara terbatas.

Business workflow utama tidak boleh tersembunyi seluruhnya di trigger.

Trigger dapat dipertimbangkan untuk integrity concern tertentu yang benar-benar lebih aman di database.

Setiap trigger harus terdokumentasi dan diuji.

---

# 96. Generated / Derived Data

Derived data harus memiliki aturan:

```text
Source of Truth
+
Derivation Rule
+
Refresh Strategy
```

Jika data dapat dihitung ulang, jangan memperlakukannya sebagai source resmi.

---

# 97. Denormalization

Default adalah relational normalization yang wajar.

Denormalization hanya dilakukan jika:

- query bottleneck terukur;
- source tetap jelas;
- update consistency dapat dipertahankan.

Tidak dilakukan hanya untuk menghindari join.

---

# 98. Read Performance

Urutan optimasi:

```text
Correct Domain Model
 ↓
Correct Query
 ↓
Correct Index
 ↓
Pagination
 ↓
Projection
 ↓
Measure
 ↓
Denormalize / Cache jika perlu
```

---

# 99. Write Performance

Urutan:

```text
Short Transaction
 ↓
Correct Index
 ↓
Batch secara terkontrol
 ↓
Queue non-critical side effects
 ↓
Measure contention
```

Tidak menonaktifkan durability atau foreign key hanya demi benchmark.

---

# 100. Database Connection Lifecycle

Next.js server harus menggunakan database connection/client management yang sesuai Node.js deployment sehingga tidak menciptakan client baru secara tidak terkendali pada development hot reload atau request path.

Implementasi final mengikuti Prisma 7 + adapter configuration yang direkomendasikan pada saat bootstrap.

---

# 101. Data Environment

Path database berbeda antar environment.

Contoh konseptual:

```text
development.db
test.db
production.db
```

Production file tidak pernah digunakan langsung untuk automated test.

---

# 102. Test Database Isolation

Test harus dapat:

- membuat database bersih;
- apply migration;
- seed fixture;
- menjalankan test;
- dibuang setelah selesai.

Parallel test strategy harus memperhatikan SQLite file isolation.

---

# 103. Test terhadap Constraint

Automated test wajib mencakup constraint penting seperti:

- duplicate unique data;
- invalid FK;
- out-of-scope relation;
- lifecycle invalid;
- missing grade vs zero;
- duplicate active attempt;
- assignment period;
- guardian relationship.

---

# 104. Data Quality Checks

Quality tooling harus mampu mendeteksi:

- orphan relation;
- impossible status;
- invalid period;
- duplicate business identity;
- missing required relationship;
- corrupted file reference;
- stale outbox event;
- failed migration state.

Tidak semua check harus berjalan pada setiap request.

---

# 105. Data Repair

Data repair production harus:

- scripted;
- reviewed;
- backed up;
- auditable;
- idempotent bila memungkinkan.

Manual SQL ad-hoc pada production tidak menjadi workflow normal.

---

# 106. Domain Data vs Configuration

Contoh domain:

```text
Student Enrollment
Grade
Attendance
Teaching Assignment
```

Contoh configuration:

```text
school_timezone
feature_setting
notification_preference
```

Configuration tidak boleh dipakai sebagai storage generik untuk data domain.

---

# 107. Domain Data vs Audit

Audit tidak menggantikan state.

Contoh:

```text
Audit:
Guru mengubah Grade
```

tidak cukup untuk mengetahui current Grade jika tabel Grade hilang.

Audit adalah evidence, bukan domain state utama.

---

# 108. Domain Data vs Outbox

Outbox adalah transport/reliability mechanism.

Outbox bukan sumber data domain.

Setelah processed, retention outbox dapat berbeda dari audit.

---

# 109. Domain Data vs Notification

Notification adalah derived delivery record.

Menghapus notification tidak menghapus:

- Assignment;
- Announcement;
- Grade;
- Attendance;
- event domain sumber.

---

# 110. Domain Data vs Reporting

Report boleh memiliki projection, tetapi data sumber tetap authoritative.

Jika angka berbeda:

```text
source domain data
→ diperiksa terlebih dahulu
```

---

# 111. Domain Data vs AI

AI output tidak boleh ditulis langsung sebagai official data tanpa:

- explicit use case;
- validation;
- authorization;
- human review jika high impact.

---

# 112. Data Contract Evolution

Perubahan schema harus menjaga:

- backward compatibility selama deployment jika diperlukan;
- migration path;
- data history;
- API/use case contract yang relevan.

Breaking schema change harus dikelola melalui phase/ADR bila dampaknya besar.

---

# 113. Data Architecture Invariants

## DATA-INV-001

```text
Student
≠
Student Enrollment
≠
Rombel Placement
```

## DATA-INV-002

```text
Teacher
≠
Subject
≠
Teaching Assignment
```

## DATA-INV-003

```text
Academic Calendar
≠
Master Schedule
≠
Actual Class Session
```

## DATA-INV-004

```text
School Attendance
≠
Class Session Attendance
```

## DATA-INV-005

```text
Material
≠
Material Publication
```

## DATA-INV-006

```text
Assignment Definition
≠
Assignment Publication
≠
Submission
```

## DATA-INV-007

```text
Assessment Definition
≠
Grade
≠
Grade Publication
```

## DATA-INV-008

```text
Missing Grade
≠
Zero Grade
```

## DATA-INV-009

```text
Question Bank
≠
Question Version
≠
Exam Snapshot
≠
Exam Attempt
```

## DATA-INV-010

```text
Notification
≠
Source of Truth
```

## DATA-INV-011

```text
Audit
≠
Domain State
```

## DATA-INV-012

```text
Outbox
≠
Domain State
```

---

# 114. Anti-Pattern yang Dilarang

## 114.1 Current-Class Field sebagai Satu-satunya Model

```text
students.current_class
```

tanpa enrollment/placement history.

## 114.2 Teacher Subject Tunggal

```text
teachers.mata_pelajaran_id
```

sebagai seluruh model tugas mengajar.

## 114.3 JSON Database

Menyimpan seluruh domain kompleks dalam satu JSON document.

## 114.4 Global Soft Delete

Menambahkan `deleted_at` ke semua tabel tanpa analisis lifecycle.

## 114.5 Cascade Delete Berlebihan

Parent delete menghapus histori akademik dalam jumlah besar tanpa kontrol.

## 114.6 Foreign Key OFF

Dilarang.

## 114.7 SQLite di Ephemeral Filesystem

Dilarang untuk production baseline.

## 114.8 Copy Database Aktif Sembarangan

Bukan strategi backup resmi.

## 114.9 Direct Cross-Module Write

Dilarang.

## 114.10 ORM Model = Domain Model

Dilarang dianggap identik.

---

# 115. Baseline Schema Grouping

Grouping konseptual mengikuti module ownership:

```text
M01
school / organization tables

M02
auth mapping / role / permission / access tables

M03
configuration tables

M04
file metadata tables

M05
audit tables

M06
academic period / structure tables

M07
student / enrollment / placement tables

M08
teacher / subject / assignment tables

M09
calendar tables

M10
schedule / session tables

M11
learning / publication / submission tables

M12
attendance tables

M13
assessment / grade tables

M14
CBT tables

M15
guardian relationship tables

M16
communication tables

M17
notification tables

M18
monitoring tables

M19
report metadata / read-model tables jika diperlukan

M20
integration tables

M21
AI metadata hanya jika diperlukan

Platform
outbox / migration support
```

Grouping ini bukan perintah membuat semua tabel pada Phase 00.

---

# 116. Schema Dibangun Bertahap

Walaupun Data Architecture mendeskripsikan keseluruhan produk, migration dibuat sesuai implementation roadmap.

Dilarang membuat seluruh schema puluhan modul pada bootstrap hanya karena sudah tercantum di dokumen.

Pola:

```text
Phase membutuhkan domain
 ↓
Review domain
 ↓
Design schema
 ↓
Migration
 ↓
Test
 ↓
Human review
```

---

# 117. Prisma Migration Policy

Prisma Migrate digunakan untuk versioned schema evolution.

Aturan:

- generated migration harus direview;
- SQL migration dapat diedit sebelum pertama kali applied jika diperlukan;
- setelah applied dan menjadi baseline bersama, file migration immutable;
- perubahan lanjutan menggunakan migration baru;
- migration history disimpan di Git.

---

# 118. Prisma Schema Organization

Jika Prisma mendukung schema organization yang sesuai pada bootstrap, schema dapat dipisahkan per domain/module untuk maintainability.

Namun module boundary tidak boleh bergantung pada apakah schema berada dalam satu file atau beberapa file.

Ownership tetap berasal dari Module Map.

---

# 119. Prisma Generated Client

Generated Prisma Client:

- bukan source file untuk diedit manual;
- tidak menjadi tempat business logic;
- tidak di-commit jika project convention memutuskan regenerate secara deterministik, kecuali tooling resmi membutuhkan strategi lain;
- generation menjadi bagian setup/build sesuai kebutuhan.

Keputusan commit generated artifacts ditentukan saat bootstrap.

---

# 120. Database Documentation

Schema penting harus dapat dipahami melalui:

- Prisma schema;
- migration;
- domain docs;
- data architecture;
- optional ERD yang dihasilkan dari schema.

ERD bukan sumber kebenaran tunggal.

---

# 121. Data Traceability

Contoh:

```text
PR-STUDENT-004
      ↓
DM-STUDENT-005
      ↓
M07 Student Lifecycle
      ↓
Student Enrollment
      ↓
Rombel Placement
      ↓
Prisma Models
      ↓
SQLite FK / Constraint
      ↓
Migration
      ↓
Automated Test
```

---

# 122. Keputusan yang Dikunci Jika Dokumen Disetujui

1. Nama tabel, kolom, dan istilah domain first-party pada database fisik menggunakan Bahasa Indonesia dengan konvensi `snake_case`; istilah teknis standar boleh dipertahankan bila lebih tepat.
2. SQLite digunakan pada development, testing, production.
3. Prisma ORM 7.x stable menjadi ORM baseline.
4. `@prisma/adapter-better-sqlite3` menjadi SQLite adapter baseline.
5. First-party domain entity menggunakan ULID 26 karakter.
6. Foreign key enforcement wajib aktif.
7. Production menggunakan WAL.
8. Production menggunakan durability baseline `synchronous=FULL`.
9. Tidak ada global soft-delete.
10. Historical data menggunakan explicit lifecycle/effective dating/versioning.
11. Migration bersifat versioned dan immutable setelah applied.
12. Prisma Migrate menjadi migration workflow.
13. Transactional Outbox disimpan pada database yang sama.
14. File binary tidak disimpan di SQLite secara default.
15. File metadata disimpan di database.
16. JSON digunakan terbatas.
17. Module ownership tetap berlaku walaupun database shared.
18. Schema dibangun bertahap mengikuti roadmap.
19. Backup dan restore test wajib.

---

# 123. Hal yang Belum Dikunci

Dokumen ini belum menetapkan:

- seluruh nama tabel final;
- seluruh nama field final;
- seluruh index final;
- seluruh composite unique constraint;
- seluruh enum final;
- seluruh relation action final;
- authentication schema provider;
- exact backup tool;
- exact backup frequency;
- exact retention duration;
- exact database file path;
- exact production OS;
- exact VPS vendor.

Detail tersebut dikunci pada implementation phase saat use case terkait dibangun.

---

# 124. Definition of Done Data Architecture

Data Architecture dianggap selesai apabila:

- database engine jelas;
- ORM jelas;
- identifier jelas;
- foreign key policy jelas;
- SQLite production configuration jelas;
- transaction policy jelas;
- migration policy jelas;
- historical policy jelas;
- delete policy jelas;
- indexing principle jelas;
- module ownership jelas;
- outbox jelas;
- audit boundary jelas;
- file metadata jelas;
- backup/recovery principle jelas;
- domain invariant dapat diterjemahkan ke data model;
- schema tidak dibuat prematur untuk seluruh modul.

---

# 125. Checklist Human Review

Sebelum `APPROVED / LOCKED`, pastikan:

- [ ] SQLite tetap menjadi pilihan development/test/production;
- [ ] Prisma ORM 7.x + better-sqlite3 sesuai;
- [ ] ULID 26 karakter sesuai;
- [ ] foreign key wajib aktif;
- [ ] WAL production sesuai;
- [ ] `synchronous=FULL` sesuai prioritas durability;
- [ ] tidak ada global soft delete;
- [ ] effective dating digunakan untuk data periodik;
- [ ] migration applied tidak boleh diedit;
- [ ] fresh database migration path wajib diuji;
- [ ] direct cross-module write dilarang;
- [ ] file binary tidak dimasukkan ke SQLite secara default;
- [ ] Transactional Outbox sesuai;
- [ ] backup SQLite aktif dilakukan dengan metode aman;
- [ ] restore test wajib;
- [ ] schema dibangun per phase, bukan sekaligus;
- [ ] Domain Model tetap menjadi sumber desain data.

---

# 126. Status Dokumen

**Status Saat Ini:** FINAL REVIEW  
**Versi:** 1.0-RC

Dokumen belum berstatus `APPROVED / LOCKED` sampai human review selesai.

Jika disetujui:

```text
Version: 1.0
Status: APPROVED / LOCKED
```

---

# 127. Dokumen Berikutnya

Setelah `06-DATA-ARCHITECTURE.md` disetujui dan dikunci, pembahasan dilanjutkan ke:

```text
07-UI-UX-DESIGN-SYSTEM.md
```

Dokumen tersebut menjawab:

> **Bagaimana seluruh capability Ruang Pintar diterjemahkan menjadi pengalaman pengguna dan bahasa visual yang konsisten untuk desktop, tablet, dan mobile?**

UI/UX Design System tidak boleh mengubah domain, module ownership, authorization, atau data architecture hanya untuk mempermudah tampilan tanpa perubahan resmi pada dokumen induk.
