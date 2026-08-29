# 05 — SYSTEM ARCHITECTURE
## Ruang Pintar

**Nama Dokumen:** System Architecture  
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

---

# 1. Tujuan Dokumen

Dokumen ini mendefinisikan arsitektur teknis tingkat sistem untuk Ruang Pintar.

Dokumen ini menjawab pertanyaan:

> **Bagaimana requirement produk, domain model, module boundary, dan access model Ruang Pintar diwujudkan menjadi sistem perangkat lunak yang nyata, aman, modular, dapat diuji, dan dapat dikembangkan dalam jangka panjang?**

Dokumen ini menjadi dasar untuk:

- bootstrap project;
- struktur aplikasi;
- boundary modul;
- strategi request dan data flow;
- authentication dan authorization boundary;
- persistence;
- transaction;
- queue dan background processing;
- file storage;
- audit;
- integration;
- observability;
- backup dan recovery;
- deployment;
- testing;
- quality gate;
- `06-DATA-ARCHITECTURE.md`;
- `07-UI-UX-DESIGN-SYSTEM.md`;
- `08-IMPLEMENTATION-ROADMAP.md`;
- `09-AI-CODING-RULES.md`.

---

# 2. Keputusan Arsitektur Inti

Keputusan berikut menjadi baseline Ruang Pintar.

| Area | Keputusan |
|---|---|
| Gaya arsitektur | **Modular Monolith** |
| Framework aplikasi | **Next.js 16.x stable dan secure release terbaru saat bootstrap** |
| Runtime server | **Node.js Runtime** |
| UI framework | **React melalui Next.js** |
| Styling | **Tailwind CSS 4.x** |
| UI primitives | **shadcn/ui dengan Base UI sebagai baseline project baru** |
| Database | **SQLite** |
| Database development | **SQLite** |
| Database testing | **SQLite** |
| Database production | **SQLite** |
| Deployment tenancy | **Single-school-per-deployment** |
| Identifier domain | **ULID 26 karakter** |
| Queue | **Queue-ready sejak arsitektur awal; implementasi bertahap** |
| File storage awal | **Private local storage** |
| File storage evolusi | **S3-compatible ready melalui abstraction** |
| Deployment baseline | **Single application deployment** |
| Serverless/Edge baseline | **Tidak digunakan untuk deployment utama berbasis local SQLite** |
| Source of truth | **Database/domain resmi, bukan cache/report/notification/AI** |

---

# 3. Prinsip Arsitektur

## 3.1 Domain First

Business rule berasal dari domain dan requirement, bukan dari UI, route, atau bentuk tabel.

## 3.2 Modular Monolith

Seluruh capability utama berada dalam satu aplikasi deployable, tetapi dipisahkan menjadi module boundary yang eksplisit.

## 3.3 Single Source of Truth

Setiap domain concept memiliki owner yang jelas.

Modul lain tidak boleh membuat sumber kebenaran paralel.

## 3.4 Server-Side Authority

Operasi sensitif, authorization, validation, dan perubahan data resmi diputuskan di sisi server.

## 3.5 Default Deny

Jika effective access tidak dapat dibuktikan, request ditolak.

## 3.6 History Preserving

Perubahan state saat ini tidak boleh merusak histori yang secara domain harus dipertahankan.

## 3.7 Explicit Boundaries

Database bersama tidak berarti seluruh modul boleh membaca dan menulis seluruh data tanpa batas.

## 3.8 Queue-Ready, Tidak Queue-Everything

Background processing tersedia sebagai pola arsitektur, tetapi hanya digunakan ketika memberi manfaat nyata.

## 3.9 Local First, Portable Later

SQLite dan private local storage menjadi baseline sederhana, tetapi boundary persistence dan storage tidak boleh membuat domain terikat permanen pada satu provider.

## 3.10 Secure by Design

Security dan privacy merupakan bagian arsitektur sejak awal.

---

# 4. Gambaran Arsitektur Tingkat Tinggi

```text
┌────────────────────────────────────────────────────────────┐
│                        WEB CLIENT                          │
│              Browser Desktop / Tablet / Mobile            │
└──────────────────────────────┬─────────────────────────────┘
                               │ HTTPS
                               ▼
┌────────────────────────────────────────────────────────────┐
│                    NEXT.JS APPLICATION                     │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Presentation / App Router / Server Components        │  │
│  └─────────────────────────────┬────────────────────────┘  │
│                                │                           │
│  ┌─────────────────────────────▼────────────────────────┐  │
│  │ Application / Use Cases / Authorization             │  │
│  └─────────────────────────────┬────────────────────────┘  │
│                                │                           │
│  ┌─────────────────────────────▼────────────────────────┐  │
│  │ Domain Modules M01–M21                              │  │
│  └─────────────────────────────┬────────────────────────┘  │
│                                │                           │
│  ┌─────────────────────────────▼────────────────────────┐  │
│  │ Infrastructure Adapters                             │  │
│  │ DB • Storage • Queue • Email • Integration • AI     │  │
│  └──────────────┬──────────────┬──────────────┬─────────┘  │
└─────────────────┼──────────────┼──────────────┼────────────┘
                  │              │              │
                  ▼              ▼              ▼
              SQLite       Private Storage   Worker /
                                          External Services
```

---

# 5. Mengapa Modular Monolith

Ruang Pintar memiliki banyak domain, tetapi belum membutuhkan operational complexity microservices.

Baseline:

```text
SATU CODEBASE
+
SATU APLIKASI
+
SATU DATABASE
+
SATU DEPLOYMENT UTAMA
+
MODUL TERPISAH SECARA LOGIS
```

Keuntungan:

- development lebih sederhana;
- transaction lintas capability inti tetap dapat dikendalikan;
- debugging lebih mudah;
- deployment lebih mudah;
- cocok untuk AI-assisted coding;
- cocok untuk tim kecil;
- tidak membutuhkan network call antar domain internal;
- tetap memiliki boundary yang dapat dipertahankan.

---

# 6. Modular Monolith Bukan God Monolith

Dilarang membuat pola:

```text
src/
└── services/
    └── everything-service.ts
```

atau:

```text
semua module
→ boleh menulis semua table
```

Setiap modul mengikuti ownership dari `03-MODULE-MAP.md`.

Contoh:

```text
M12 Attendance
→ owner Attendance

M13 Assessment
→ owner Grade

M12 tidak boleh mengubah Grade secara langsung.
M13 tidak boleh mengubah Attendance secara langsung.
```

---

# 7. Module Boundary

Baseline modul mengikuti `03-MODULE-MAP.md`.

```text
Foundation
├── M01 School & Organization
├── M02 Identity & Access
├── M03 Platform Configuration
├── M04 File & Document
└── M05 Audit & Traceability

Core Academic
├── M06 Academic Period & Structure
├── M07 Student Academic Lifecycle
├── M08 Teacher & Teaching Assignment
├── M09 Academic Calendar
└── M10 Scheduling & Class Session

Operational
├── M11 Learning
├── M12 Attendance
├── M13 Assessment & Gradebook
├── M14 CBT
├── M15 Guardian & Family
├── M16 Communication
├── M17 Notification
├── M18 Student Monitoring
└── M19 Reporting & Analytics

Extension
├── M20 Integration
└── M21 AI Assistance
```

---

# 8. Struktur Logis per Modul

Setiap modul secara konseptual memiliki lapisan:

```text
Module
│
├── Domain
│   ├── Entity / Value Object
│   ├── Domain Rules
│   └── Domain Services bila diperlukan
│
├── Application
│   ├── Commands / Use Cases
│   ├── Queries
│   ├── Authorization Orchestration
│   └── DTO / Contracts
│
├── Infrastructure
│   ├── Persistence
│   ├── External Adapter
│   └── Technical Implementation
│
└── Presentation
    └── module-facing UI composition bila diperlukan
```

Struktur folder final ditentukan saat bootstrap dan tidak harus menyalin bentuk ini secara literal.

---

# 9. Dependency Direction

Arah dependensi utama:

```text
Presentation
      ↓
Application
      ↓
Domain
      ↑
Infrastructure implements required contracts
```

Business rule tidak boleh bergantung pada UI.

Domain juga tidak boleh bergantung secara langsung pada:

- shadcn/ui;
- React component;
- Tailwind class;
- HTTP request;
- browser API;
- email provider;
- S3 provider.

---

# 10. Next.js sebagai Full-Stack Application

Ruang Pintar menggunakan Next.js sebagai aplikasi web full-stack.

Baseline:

- App Router;
- React Server Components sebagai default rendering model;
- Client Components hanya untuk interaksi browser yang memang membutuhkan client state atau browser API;
- server-side data access untuk data privat;
- server-side mutation untuk operasi domain;
- Route Handlers untuk endpoint HTTP yang memang diperlukan;
- Node.js runtime untuk operasi yang membutuhkan local SQLite dan filesystem persisten.

---

# 11. Prinsip Server Components

Server Components menjadi pilihan default untuk:

- membaca data privat;
- dashboard server-rendered;
- list data;
- detail resource;
- composition data lintas read model;
- initial page rendering.

Client Component digunakan hanya jika diperlukan untuk:

- modal interaktif;
- local interaction state;
- drag/drop;
- rich editor;
- realtime interaction;
- browser-only API;
- form behavior yang memang membutuhkan client state.

Prinsip:

```text
Server by default
Client by necessity
```

---

# 12. Mutation Boundary

Perubahan data resmi harus melalui server-side application use case.

Contoh:

```text
UI
 ↓
Server Mutation Boundary
 ↓
Authentication
 ↓
Authorization
 ↓
Validation
 ↓
Application Use Case
 ↓
Domain Rules
 ↓
Transaction
 ↓
Persistence
 ↓
Audit / Outbox
```

UI tidak boleh mengubah database secara langsung.

---

# 13. Request Flow

Request privat mengikuti alur:

```text
REQUEST
  ↓
Resolve Session
  ↓
Resolve Identity
  ↓
Resolve School Context
  ↓
Resolve Effective Access
  ↓
Validate Input
  ↓
Execute Use Case
  ↓
Domain Rules
  ↓
Transaction
  ↓
Persist
  ↓
Audit / Outbox
  ↓
Response
```

---

# 14. Authentication Boundary

Authentication provider/library final belum dikunci dalam dokumen ini.

Namun arsitektur wajib menyediakan boundary:

```text
Authentication Provider
        ↓
Auth Adapter
        ↓
Ruang Pintar Identity
```

Domain tidak boleh bergantung langsung pada detail provider.

Requirement minimum:

- secure session;
- account lifecycle;
- logout;
- protected server-side operations;
- safe credential handling;
- rate limiting pada endpoint sensitif bila relevan.

---

# 15. Authorization Boundary

Authorization mengikuti `04-ROLE-ACCESS.md`.

Model:

```text
Identity
 ↓
Base Role
 ↓
Position / Assignment / Relationship
 ↓
Permission
 ↓
Resource Scope
 ↓
Resource State
 ↓
Effective Access
```

Authorization harus dijalankan pada sisi server.

Menu visibility hanya UX convenience, bukan security boundary.

---

# 16. Policy Evaluation

Untuk operasi sensitif, evaluation harus dapat menjawab:

```text
Siapa actor?
Apa permission-nya?
Dari mana permission berasal?
Apa scope-nya?
Resource apa yang diminta?
Apakah resource berada dalam scope?
Apakah state resource mengizinkan?
Apakah periodenya sah?
```

Hasil:

```text
ALLOW
atau
DENY
```

---

# 17. Single-School-per-Deployment

Baseline deployment:

```text
1 Deployment
=
1 School
=
1 Primary SQLite Database
```

Contoh:

```text
SMK A
├── Ruang Pintar App
├── ruang-pintar.db
└── private-storage/

SMK B
├── Ruang Pintar App
├── ruang-pintar.db
└── private-storage/
```

---

# 18. Mengapa School Tetap Domain Penting

Walaupun satu deployment hanya untuk satu sekolah, data tetap **school-aware**.

Alasannya:

- domain tetap eksplisit;
- audit memiliki konteks sekolah;
- export memiliki identitas sekolah;
- konfigurasi terikat sekolah;
- arsitektur lebih mudah berevolusi;
- tidak mengandalkan asumsi global tersembunyi.

Namun baseline tidak menjalankan shared-schema multi-school tenancy.

---

# 19. Tidak Ada Shared-Schema Multi-Tenant pada Baseline

Baseline tidak menggunakan:

```text
1 database
├── School A
├── School B
└── School C
```

sebagai deployment produksi normal.

Konsekuensi positif:

- isolation lebih kuat;
- backup per sekolah lebih sederhana;
- custom deployment lebih mudah;
- risiko tenant data leak lebih rendah;
- cocok dengan SQLite.

Jika di masa depan diperlukan SaaS multi-school, keputusan tersebut membutuhkan Architecture Decision baru.

---

# 20. Database Baseline

Database resmi:

```text
SQLite
```

Digunakan pada:

```text
Development
Testing
Production
```

Tujuan:

- parity environment;
- setup sederhana;
- portability;
- backup mudah;
- cocok dengan single-school deployment;
- mengurangi perbedaan perilaku database antarenvironment.

---

# 21. SQLite Production Rules

Production SQLite harus berada pada filesystem persisten.

Dilarang mengandalkan:

- ephemeral filesystem;
- stateless serverless instance;
- local file yang hilang saat redeploy.

Production harus memastikan:

- file database persisten;
- permission filesystem aman;
- backup berjalan;
- restore diuji;
- kapasitas disk dipantau;
- concurrency pattern sesuai kemampuan SQLite.

---

# 22. SQLite Concurrency

SQLite cocok untuk banyak pembacaan dan workload sekolah yang wajar, tetapi memiliki karakteristik write concurrency yang harus dihormati.

Arsitektur harus:

- menjaga transaction singkat;
- menghindari long-running write transaction;
- menghindari pekerjaan eksternal di dalam transaction;
- menggunakan mode/journal configuration yang sesuai untuk production;
- mengukur contention sebelum melakukan optimasi kompleks.

Scale issue tidak boleh diselesaikan dengan tebakan.

---

# 23. Identifier Strategy

First-party domain entities menggunakan:

```text
ULID
```

Format:

```text
26 karakter
```

Contoh:

```text
01K4AB7QZ7NJKP9R3AGT2F6HVM
```

Keuntungan:

- unique;
- sortable secara temporal;
- tidak mudah ditebak seperti auto-increment;
- baik untuk public identifier;
- portable.

---

# 24. Identifier Rules

## ARCH-ID-001

ULID tidak boleh membawa business meaning.

## ARCH-ID-002

Business code seperti NIS, NISN, kode mapel, atau nomor dokumen tidak boleh dipakai sebagai primary identity teknis jika lifecycle-nya berbeda.

## ARCH-ID-003

Public URL sebaiknya tidak bergantung pada sequential integer yang mudah ditebak untuk resource domain sensitif.

## ARCH-ID-004

Library authentication pihak ketiga dapat memiliki identifier internal sendiri, tetapi domain Ruang Pintar tetap memiliki identifier first-party yang stabil bila diperlukan.

---

# 25. Data Access Boundary

Pilihan ORM/query builder final ditentukan pada `06-DATA-ARCHITECTURE.md`.

System Architecture hanya mengunci prinsip:

- data access dimiliki module;
- query lintas module mengikuti contract;
- raw SQL tidak tersebar tanpa ownership;
- transaction boundary eksplisit;
- migration terkontrol;
- schema tidak dibentuk langsung dari UI need.

---

# 26. Transaction Boundary

Perubahan domain yang harus atomic dilakukan dalam satu transaction.

Contoh:

```text
Create Student Enrollment
+
Create Placement
+
Create Audit Event
+
Create Outbox Event bila diperlukan
```

jika satu use case menuntut seluruhnya berhasil atau seluruhnya gagal.

---

# 27. Jangan Memanggil External Service di Dalam Critical Transaction

Dilarang:

```text
BEGIN TRANSACTION
  save assignment
  call email provider
  wait network
  save audit
COMMIT
```

Pola yang benar:

```text
BEGIN TRANSACTION
  save assignment
  save audit
  save outbox event
COMMIT

worker
  ↓
send notification/email
```

---

# 28. Queue-Ready Architecture

Ruang Pintar harus siap memiliki background queue sejak awal.

Namun:

```text
Queue-ready
≠
semua proses menggunakan queue
```

Queue digunakan untuk pekerjaan yang:

- lambat;
- dapat diretry;
- tidak harus selesai sebelum response;
- melibatkan external provider;
- melakukan batch besar;
- membuat export;
- melakukan sinkronisasi;
- menggunakan AI.

---

# 29. Kandidat Background Job

Contoh:

- email;
- external notification;
- large import;
- large export;
- report generation berat;
- integration synchronization;
- file processing;
- AI request;
- maintenance job;
- retry external delivery.

Operasi seperti:

- simpan siswa;
- input nilai biasa;
- catat presensi satu sesi;

tetap synchronous kecuali ada alasan terukur.

---

# 30. Transactional Outbox

Untuk event penting yang harus memicu proses asynchronous, baseline arsitektur menggunakan konsep:

```text
Domain Transaction
     │
     ├── Update Domain Data
     └── Write Outbox Event
             ↓
           COMMIT
             ↓
          Worker
             ↓
      External Side Effect
```

Tujuan:

- domain transaction tetap konsisten;
- event tidak hilang antara commit dan background processing;
- retry lebih aman.

Implementasi detail outbox dibahas bersama Data Architecture.

---

# 31. Idempotency

Job atau operasi yang dapat diretry harus didesain idempotent.

Contoh:

```text
send notification job
retry 3x
```

tidak boleh menghasilkan tiga notification resmi yang identik tanpa alasan.

Idempotency key atau mekanisme ekuivalen digunakan bila diperlukan.

---

# 32. Scheduler

Arsitektur harus siap untuk scheduled task seperti:

- deadline processing;
- reminder;
- cleanup;
- queue retry;
- integration schedule;
- backup orchestration;
- notification schedule.

Scheduler tidak boleh menjadi sumber business truth.

---

# 33. File Storage Baseline

File awal disimpan pada:

```text
PRIVATE LOCAL STORAGE
```

Contoh struktur fisik bersifat implementation detail.

Yang dikunci:

```text
file tidak berada di public directory secara default
```

Akses file privat harus melalui authorization.

---

# 34. File Metadata

Database menyimpan metadata domain seperti:

- file identifier;
- storage disk/provider;
- storage key;
- original filename;
- content type;
- size;
- owner/resource context;
- lifecycle status;
- timestamps;
- security metadata yang relevan.

Domain tidak menyimpan absolute OS path sebagai contract utama.

---

# 35. S3-Ready Storage Abstraction

Domain berinteraksi dengan abstraction:

```text
File Storage Contract
      ↓
Local Adapter
```

Di masa depan:

```text
File Storage Contract
      ↓
S3-Compatible Adapter
```

Perubahan storage tidak boleh memerlukan perubahan pada makna:

- Material;
- Submission;
- Student Document;
- Announcement Attachment;
- resource domain lain.

---

# 36. File Access Flow

```text
User
 ↓
Request File
 ↓
Authenticate
 ↓
Authorize Parent Resource
 ↓
Resolve File Metadata
 ↓
Read Private Storage
 ↓
Stream / Signed Delivery
```

Mengetahui `storage_key` bukan authorization.

---

# 37. Audit Architecture

Audit dan application log dipisahkan.

```text
Audit
→ siapa melakukan perubahan bisnis apa

Application Log
→ apa yang terjadi secara teknis
```

Audit event dibuat untuk operasi bernilai tinggi.

---

# 38. Audit Characteristics

Audit harus:

- append-oriented;
- actor-aware;
- school-aware;
- resource-aware;
- timestamped;
- sulit dimodifikasi pengguna biasa;
- tidak berisi secret;
- menyimpan before/after value hanya bila relevan dan aman.

---

# 39. Notification Architecture

Notification bukan domain source of truth.

Pola:

```text
Domain Event
 ↓
Notification Application Logic
 ↓
Notification Record
 ↓
Optional Delivery Job
```

Jika notification gagal:

```text
domain transaction utama tetap sah
```

kecuali requirement menyatakan sebaliknya.

---

# 40. Communication vs Notification

```text
Announcement
= informasi resmi

Notification
= pemberitahuan bahwa sesuatu terjadi / tersedia
```

Announcement dimiliki M16.

Notification dimiliki M17.

---

# 41. Reporting Architecture

Reporting menggunakan read model atau query composition.

Reporting tidak boleh:

- mengubah source transaction;
- menjadi satu-satunya source of truth;
- menyimpan angka tanpa definisi metric yang jelas.

Jika projection digunakan, projection harus dapat dibangun ulang dari source data bila desain memungkinkan.

---

# 42. Monitoring Architecture

Student Monitoring mengonsumsi fakta dari:

- Attendance;
- Learning;
- Assessment;
- Student Lifecycle.

M18 boleh menghasilkan indicator dan follow-up, tetapi tidak membuat salinan independen yang menggantikan data sumber.

---

# 43. Integration Architecture

M20 Integration menggunakan adapter boundary.

```text
Ruang Pintar Domain
       ↓
Integration Contract
       ↓
Provider Adapter
       ↓
External System
```

Setiap integration harus menentukan:

- source of truth;
- direction;
- mapping;
- failure policy;
- retry;
- idempotency;
- authorization;
- audit.

---

# 44. AI Architecture

AI berada di extension boundary.

Pola wajib:

```text
User
 ↓
Effective Access
 ↓
Allowed Data
 ↓
AI Application Boundary
 ↓
AI Provider
```

Dilarang:

```text
AI Provider
 ↓
Full Database Access
```

Output AI tidak langsung menjadi data resmi tanpa use case dan validation yang sah.

---

# 45. Cache Strategy

Cache bukan requirement awal untuk seluruh sistem.

Prinsip:

```text
measure first
cache second
```

Cache hanya ditambahkan ketika:

- bottleneck terukur;
- invalidation dapat didefinisikan;
- cache tidak menjadi source of truth.

Authorization-sensitive cache harus sangat berhati-hati terhadap scope pengguna.

---

# 46. Search Strategy

Baseline tidak membutuhkan external search engine.

Pencarian awal menggunakan kemampuan database yang memadai untuk workload.

External search hanya ditambahkan jika kebutuhan terukur membenarkan kompleksitasnya.

Search wajib mengikuti effective access.

---

# 47. Time Architecture

Sekolah memiliki timezone eksplisit.

Baseline:

```text
School Timezone
= konfigurasi sekolah
```

Timestamp teknis disimpan dalam bentuk yang konsisten dan tidak ambigu.

Saat ditampilkan atau digunakan untuk jadwal operasional, waktu harus dikonversi ke timezone sekolah.

Format operasional sekolah menggunakan format 24 jam.

---

# 48. Clock Authority

Untuk workflow sensitif seperti:

- CBT timer;
- deadline;
- session;
- finalization window;

server menjadi clock authority.

Jam perangkat pengguna tidak boleh menjadi satu-satunya sumber waktu resmi.

---

# 49. Error Architecture

Error dibedakan minimal menjadi:

```text
Validation Error
Authorization Error
Authentication Error
Not Found
Conflict / Domain Rule Error
Infrastructure Error
External Provider Error
Unexpected Error
```

User-facing error tidak boleh membocorkan internal stack trace atau secret.

---

# 50. Validation Layers

Validation dilakukan pada beberapa level.

```text
Input Validation
        ↓
Application Validation
        ↓
Domain Invariant
        ↓
Database Constraint
```

Database constraint bukan pengganti seluruh domain validation.

Client-side validation hanya UX enhancement.

---

# 51. Security Baseline

Arsitektur wajib mendukung:

- HTTPS production;
- secure session cookie;
- HttpOnly untuk credential-bearing cookie bila digunakan;
- SameSite sesuai kebutuhan;
- CSRF protection sesuai mutation mechanism;
- input validation;
- authorization server-side;
- secure headers;
- secret melalui environment/secret management;
- rate limiting pada endpoint sensitif;
- protected private files;
- audit untuk operasi kritis;
- dependency security updates.

---

# 52. Secret Management

Secret tidak boleh:

- hard-coded;
- committed ke Git;
- ditampilkan dalam log;
- dikirim ke browser tanpa kebutuhan.

Configuration non-secret dan secret harus dibedakan.

---

# 53. Dependency Management

Gunakan stable release yang didukung dan aman.

Aturan:

- patch security diprioritaskan;
- major upgrade melalui review;
- lockfile disimpan;
- dependency tidak ditambah tanpa fungsi jelas;
- library tidak boleh menggantikan domain decision.

Untuk bootstrap Next.js 16.x, gunakan secure patch release terbaru yang tersedia saat bootstrap.

---

# 54. shadcn/ui dan Base UI

shadcn/ui digunakan sebagai source-based component foundation.

Base UI menjadi primitive baseline untuk project baru.

Prinsip:

```text
shadcn/ui
≠
visual identity Ruang Pintar
```

Academic Glass Design System Ruang Pintar dibangun di atas komponen tersebut.

Komponen yang masuk project menjadi bagian source yang dapat dimodifikasi dan harus mengikuti design system resmi.

---

# 55. Tailwind CSS

Tailwind CSS digunakan untuk styling system.

Design token harus menjadi sumber konsistensi untuk:

- color;
- spacing;
- radius;
- shadow;
- typography;
- motion;
- responsive behavior.

Tailwind utility tidak boleh digunakan secara acak sehingga menghasilkan visual yang tidak konsisten.

Detail dibahas pada `07-UI-UX-DESIGN-SYSTEM.md`.

---

# 56. Deployment Baseline

Deployment resmi tahap awal:

```text
┌──────────────────────────────────┐
│       VPS / SERVER / VM          │
│                                  │
│  Reverse Proxy / TLS             │
│          ↓                       │
│  Next.js Node Application        │
│          ↓                       │
│  SQLite Persistent Database      │
│                                  │
│  Private Persistent Storage      │
│                                  │
│  Optional Background Worker      │
│                                  │
│  Backup                          │
└──────────────────────────────────┘
```

---

# 57. Mengapa Bukan Stateless Serverless Baseline

Karena baseline menggunakan:

- local SQLite;
- local private file storage.

Keduanya membutuhkan persistent filesystem.

Serverless atau edge architecture dapat dievaluasi di masa depan jika persistence strategy berubah.

---

# 58. Single Application Deployment

Satu deployment menjalankan satu aplikasi utama Ruang Pintar.

Background worker dapat berjalan sebagai process tambahan pada server yang sama ketika queue mulai digunakan.

Ini tetap dianggap satu deployment sekolah.

---

# 59. Tidak Menggunakan Microservices pada Baseline

Microservices tidak digunakan karena menambah:

- network complexity;
- distributed transaction problem;
- deployment complexity;
- observability complexity;
- infrastructure cost;
- operational burden.

Jika suatu hari ada kebutuhan scale atau isolation yang tidak dapat diselesaikan modular monolith, keputusan baru harus melalui Architecture Review.

---

# 60. Scale-Up Sebelum Scale-Out

Baseline strategy:

```text
OPTIMIZE
 ↓
SCALE UP
 ↓
MEASURE
 ↓
BARU PERTIMBANGKAN SCALE OUT
```

Tidak membuat distributed architecture untuk masalah yang belum ada.

---

# 61. Backup Architecture

Database dan file penting wajib dibackup.

Backup mencakup:

- SQLite database;
- private file storage;
- configuration yang diperlukan;
- metadata deployment yang penting.

Backup tanpa restore test tidak dianggap cukup.

---

# 62. SQLite Backup Safety

Backup database harus menggunakan metode yang aman terhadap database aktif.

Dilarang menganggap copy file database secara sembarangan selalu menghasilkan backup konsisten ketika database sedang digunakan.

Implementasi backup harus diuji dengan restore nyata.

---

# 63. Recovery

Recovery plan harus dapat menjawab:

```text
Database hilang → bagaimana restore?
File storage rusak → bagaimana restore?
Deployment gagal → bagaimana rollback?
Migration gagal → bagaimana recover?
```

Target RPO/RTO spesifik dapat ditentukan sesuai skala sekolah pada tahap operasional.

---

# 64. Migration Architecture

Migration harus:

- versioned;
- deterministic;
- dapat dijalankan pada fresh database;
- diuji terhadap upgrade path;
- tidak mengubah migration lama yang sudah dianggap applied tanpa prosedur resmi;
- memiliki backup/recovery consideration untuk perubahan berisiko.

Detail schema masuk `06-DATA-ARCHITECTURE.md`.

---

# 65. Environment Strategy

Environment minimum:

```text
DEVELOPMENT
TEST
PRODUCTION
```

Database engine tetap SQLite untuk ketiganya.

Perbedaan environment berada pada:

- credentials;
- debug behavior;
- external provider;
- storage path;
- logging;
- security settings;
- deployment configuration.

---

# 66. Configuration Strategy

Configuration environment tidak boleh memerlukan perubahan source code.

Gunakan environment variables atau configuration mechanism yang sesuai untuk environment-specific setting.

Domain configuration sekolah tetap disimpan melalui M03 jika merupakan business/product configuration.

---

# 67. Observability

Observability minimum:

- structured application logs;
- error logs;
- request/context correlation bila diperlukan;
- job failure visibility;
- integration failure visibility;
- health checks;
- disk/storage awareness;
- database backup status.

Audit tidak boleh digabung ke technical logs.

---

# 68. Health Checks

Health check dapat memverifikasi secara aman:

- process hidup;
- database dapat diakses;
- storage tersedia;
- worker tersedia jika critical;
- dependency critical sesuai kebutuhan.

Health endpoint tidak boleh membocorkan secret.

---

# 69. Testing Architecture

Testing dibagi menjadi beberapa lapisan.

```text
Unit Test
↓
Domain / Application Test
↓
Integration Test
↓
Authorization Test
↓
Database / Migration Test
↓
E2E Critical Flow
↓
Human Visual Review
```

---

# 70. Unit dan Domain Test

Digunakan untuk:

- invariant;
- lifecycle;
- calculation;
- scope logic;
- state transition;
- utility domain penting.

---

# 71. Integration Test

Integration test menggunakan SQLite seperti environment lain.

Digunakan untuk:

- persistence;
- transaction;
- query;
- authorization integration;
- module integration;
- file metadata;
- outbox;
- migration behavior.

---

# 72. Authorization Test

Setiap capability sensitif harus memiliki test untuk:

```text
allowed actor
denied actor
out-of-scope resource
expired assignment
historical resource
resource state restriction
```

---

# 73. E2E Test

E2E diprioritaskan untuk critical user journey seperti:

- login;
- academic setup;
- student lifecycle;
- teaching assignment;
- publish schedule;
- attendance;
- assignment submission;
- grade publication;
- CBT attempt;
- guardian access.

Tidak seluruh variasi business rule harus dipaksa menjadi E2E.

---

# 74. Human Review

Area berikut tetap membutuhkan human review:

- visual consistency;
- responsive behavior;
- accessibility experience;
- workflow clarity;
- dangerous action UX;
- domain behavior yang memerlukan konteks sekolah;
- final acceptance per phase.

---

# 75. Quality Gate

Sebelum phase implementation dianggap selesai, minimal harus dipastikan:

- build berhasil;
- typecheck berhasil;
- lint berhasil;
- formatting sesuai;
- automated test relevan berhasil;
- database migration path berhasil;
- authorization test berhasil;
- critical E2E bila phase membutuhkan;
- human review bila memiliki UI;
- working tree dalam state yang dapat dipertanggungjawabkan.

Command final ditentukan saat bootstrap sesuai tooling nyata.

---

# 76. Cross-Module Communication

Komunikasi lintas modul menggunakan dua pola.

## 76.1 Synchronous

Digunakan ketika response use case membutuhkan hasil langsung.

```text
Module A Application
      ↓
Public Contract Module B
```

## 76.2 Asynchronous

Digunakan untuk side effect atau proses lanjutan.

```text
Module A
  ↓
Outbox / Domain Event
  ↓
Worker
  ↓
Module / Adapter lain
```

---

# 77. Public Module Contract

Modul tidak boleh mengimpor implementation internal modul lain secara sembarangan.

Yang diekspos adalah contract yang memang dibutuhkan.

Contoh konseptual:

```text
M13 Assessment

PUBLIC:
- query published grade
- create grade through authorized use case

PRIVATE:
- internal persistence helpers
- calculation internals
- schema implementation
```

---

# 78. No Cross-Module Direct Write

Dilarang:

```text
M14 CBT
→ langsung UPDATE grade table
```

Yang benar:

```text
M14 CBT
→ Assessment Contract
→ M13 Assessment Use Case
→ Grade
```

Hal yang sama berlaku untuk modul lain.

---

# 79. Read Model Composition

Dashboard dan reporting dapat menggabungkan data lintas modul.

Namun composition layer:

- read-only terhadap source;
- tidak mengambil ownership;
- tetap authorization-aware.

---

# 80. Dashboard Architecture

Dashboard bukan module domain.

Contoh dashboard guru:

```text
Dashboard Guru
├── M10 Jadwal
├── M11 Learning
├── M12 Attendance
├── M13 Assessment
├── M16 Communication
└── M17 Notification
```

Dashboard adalah experience composition.

---

# 81. Mobile dan Responsive Architecture

Ruang Pintar tetap satu web application responsive.

Baseline tidak membutuhkan mobile native application.

Responsive behavior dan application shell dibahas pada UI/UX document.

Jika mobile native dibutuhkan di masa depan, backend contract harus dievaluasi tanpa merusak domain.

---

# 82. Offline Mode

Offline-first bukan requirement baseline.

Capability tertentu dapat mempertimbangkan resilience terhadap koneksi terputus, tetapi sistem tidak mengklaim full offline operation.

CBT autosave/resume tidak sama dengan full offline exam.

---

# 83. Realtime

Realtime tidak digunakan sebagai default untuk seluruh aplikasi.

Realtime hanya ditambahkan jika requirement nyata membutuhkan.

Alternatif lebih sederhana seperti server refresh, polling terkontrol, atau revalidation diprioritaskan sebelum menambah infrastructure realtime.

---

# 84. External Provider Principle

Provider eksternal selalu berada di belakang adapter.

Contoh:

```text
Email Contract
├── Provider A
└── Provider B

Storage Contract
├── Local
└── S3-Compatible

AI Contract
├── Provider A
└── Provider B
```

Domain tidak boleh bergantung pada nama vendor.

---

# 85. Vendor Lock-In Principle

Vendor-specific capability boleh digunakan jika bernilai, tetapi:

- tidak boleh mengubah domain meaning;
- migration path harus dipahami;
- data resmi tetap dapat diekspor/dipindahkan jika memungkinkan;
- secret tidak tersebar.

---

# 86. Architecture Decision Record

Keputusan arsitektur besar setelah dokumen ini dikunci harus dicatat.

Contoh:

```text
ADR-001 — Ganti SQLite ke PostgreSQL
ADR-002 — Multi-school SaaS Architecture
ADR-003 — Pindah Local Storage ke S3
```

ADR tidak boleh diam-diam mengubah baseline.

---

# 87. Trigger untuk Review SQLite

SQLite harus dievaluasi ulang jika terdapat bukti seperti:

- write contention berulang;
- kebutuhan horizontal scale;
- multi-region requirement;
- high write concurrency yang tidak dapat ditangani;
- operational requirement yang tidak cocok;
- SaaS multi-school architecture berubah secara fundamental.

Perubahan database tidak dilakukan hanya karena database lain dianggap lebih enterprise.

---

# 88. Trigger untuk Review Deployment

Single-app deployment ditinjau ulang jika:

- satu server tidak lagi memenuhi capacity;
- availability requirement meningkat;
- worker membutuhkan isolation;
- persistence strategy berubah;
- multi-school SaaS menjadi requirement resmi.

---

# 89. Trigger untuk Review Modular Monolith

Modular Monolith ditinjau ulang hanya jika terdapat kebutuhan terukur seperti:

- independent scaling yang nyata;
- organizational team boundary besar;
- deployment independence yang wajib;
- isolation requirement yang tidak dapat dicapai secara wajar;
- bottleneck teknis yang terbukti.

Banyak modul bukan alasan otomatis menggunakan microservices.

---

# 90. Architecture Invariants

## ARCH-INV-001

```text
Domain Rule
tidak bergantung pada UI
```

## ARCH-INV-002

```text
UI Visibility
≠
Authorization
```

## ARCH-INV-003

```text
Shared Database
≠
Shared Ownership
```

## ARCH-INV-004

```text
Notification
≠
Source of Truth
```

## ARCH-INV-005

```text
Report
≠
Source of Truth
```

## ARCH-INV-006

```text
Cache
≠
Source of Truth
```

## ARCH-INV-007

```text
AI Output
≠
Official Data
```

## ARCH-INV-008

```text
Queue Failure
≠
Domain Transaction Failure
```

kecuali requirement secara eksplisit menjadikannya bagian atomic transaction.

## ARCH-INV-009

```text
1 Deployment
=
1 School
```

untuk baseline arsitektur ini.

## ARCH-INV-010

```text
Domain Entity ID
=
ULID first-party identifier
```

untuk entity domain baru yang berada dalam kendali Ruang Pintar.

---

# 91. Anti-Pattern yang Dilarang

## 91.1 Business Logic di React Component

React component tidak boleh menjadi tempat utama domain rule.

## 91.2 Authorization Hanya di UI

Menyembunyikan tombol bukan security.

## 91.3 Direct Database Access dari Client

Dilarang.

## 91.4 Cross-Module Write Bebas

Database sama tidak berarti module bebas memodifikasi table module lain.

## 91.5 External Call dalam Long Transaction

Dilarang.

## 91.6 File Publik untuk Data Privat

Dilarang sebagai default.

## 91.7 AI Full Database Access

Dilarang.

## 91.8 Queue untuk Semua Hal

Dilarang tanpa alasan.

## 91.9 Premature Microservices

Dilarang tanpa kebutuhan nyata.

## 91.10 Ephemeral SQLite Production

Dilarang.

---

# 92. Hal yang Sengaja Belum Dikunci

Dokumen ini belum mengunci:

- ORM atau query builder;
- authentication library/provider;
- email provider;
- S3 provider;
- queue library;
- job runner;
- reverse proxy vendor;
- VPS/cloud vendor;
- monitoring vendor;
- testing library final;
- package manager final;
- exact folder structure;
- exact API style;
- exact database schema;
- exact table name;
- exact indexes;
- exact migration files.

Keputusan yang menyentuh data akan diperdalam pada `06-DATA-ARCHITECTURE.md`.

Keputusan tooling bootstrap dapat dikunci pada roadmap/bootstrap setelah kebutuhan teknisnya jelas.

---

# 93. Traceability Arsitektur

Contoh:

```text
PR-ATTENDANCE-002
       ↓
DM-ATTENDANCE-002
       ↓
M12 Attendance
       ↓
04 Role & Access
       ↓
Server Authorization
       ↓
Attendance Application Use Case
       ↓
SQLite Transaction
       ↓
Audit
       ↓
Test
```

Contoh queue:

```text
PR-NOTIF-005
       ↓
M17 Notification
       ↓
Outbox
       ↓
Background Worker
       ↓
External Delivery Adapter
```

---

# 94. Definition of Done System Architecture

Dokumen arsitektur dianggap selesai apabila:

- architecture style jelas;
- module boundary tetap dihormati;
- framework baseline jelas;
- database baseline jelas;
- tenancy/deployment boundary jelas;
- identifier strategy jelas;
- authentication boundary jelas;
- authorization model dapat diterapkan;
- transaction rule jelas;
- queue strategy jelas;
- storage strategy jelas;
- audit architecture jelas;
- integration boundary jelas;
- AI boundary jelas;
- backup/recovery prinsip jelas;
- testing architecture jelas;
- deployment baseline jelas;
- scale trigger jelas;
- keputusan yang sengaja ditunda disebutkan secara eksplisit.

---

# 95. Checklist Human Review

Sebelum `APPROVED / LOCKED`, pastikan:

- [ ] Modular Monolith sesuai;
- [ ] Next.js digunakan sebagai full-stack application;
- [ ] Node.js runtime menjadi baseline server;
- [ ] Tailwind CSS + shadcn/ui + Base UI sesuai;
- [ ] SQLite digunakan di development, test, dan production;
- [ ] single-school-per-deployment sesuai;
- [ ] ULID menjadi identifier domain;
- [ ] queue-ready tetapi implementasi bertahap;
- [ ] Transactional Outbox diterima sebagai pola event penting;
- [ ] private local storage menjadi baseline;
- [ ] S3-ready abstraction disiapkan;
- [ ] single-app deployment sesuai;
- [ ] serverless stateless bukan baseline;
- [ ] backup dan restore wajib;
- [ ] authentication provider belum perlu dikunci;
- [ ] ORM belum perlu dikunci;
- [ ] cross-module write dibatasi;
- [ ] AI dan integration berada di adapter/extension boundary;
- [ ] testing dan quality gate memadai;
- [ ] arsitektur belum terlalu masuk ke schema database atau UI detail.

---

# 96. Status Dokumen

**Status Saat Ini:** FINAL REVIEW  
**Versi:** 1.0-RC

Keputusan arsitektur yang telah disetujui dalam diskusi sudah dimasukkan sebagai baseline.

Dokumen belum berstatus `APPROVED / LOCKED` sampai human review terhadap keseluruhan isi selesai.

Jika disetujui:

```text
Version: 1.0
Status: APPROVED / LOCKED
```

---

# 97. Dokumen Berikutnya

Setelah `05-SYSTEM-ARCHITECTURE.md` disetujui dan dikunci, pembahasan dilanjutkan ke:

```text
06-DATA-ARCHITECTURE.md
```

Dokumen tersebut menjawab:

> **Bagaimana domain Ruang Pintar diterjemahkan menjadi model data, identifier, relasi, constraint, histori, indexing, migration, transaction, dan lifecycle data di SQLite tanpa merusak invariant domain?**

`06-DATA-ARCHITECTURE.md` tidak boleh mengubah keputusan produk, domain, module ownership, access model, atau architecture baseline tanpa proses perubahan resmi.
