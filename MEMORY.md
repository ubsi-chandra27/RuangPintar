# MEMORY.md
## Ruang Pintar — Current Project Memory

**Versi:** 1.0  
**Fungsi:** State proyek terkini yang dibaca AI sebelum bekerja.  
**Catatan:** MEMORY bukan pengganti dokumen kanonikal.  

---

# 1. Project

```text
Nama:
Ruang Pintar

Positioning:
School Digital Operating Platform

Deployment:
Single-school-per-deployment

Architecture:
Modular Monolith
```

---

# 2. Current Project State

```text
Documentation Baseline:
SELESAI

Current Implementation Phase:
PHASE 06 — SCHOOL & ORGANIZATION

Current Phase Status:
APPROVED & CHECKPOINTED

Last Human-Approved Implementation Phase:
PHASE 06 — SCHOOL & ORGANIZATION

Phase 06 Official Checkpoint Commit:
b91a23c (feat(phase-06): implement school and organization domain and presentation)

Login / UI Kit Polish Checkpoint:
2f99c0f (style(auth): align login screen visual fidelity with canonical ui kit specification)
```

---

# 3. Canonical Documents

```text
docs/BRD.md
docs/PRD.md
docs/FRD.md

docs/00-PROJECT-BRIEF.md
docs/01-PRODUCT-REQUIREMENTS.md
docs/02-DOMAIN-MODEL.md
docs/03-MODULE-MAP.md
docs/04-ROLE-ACCESS.md
docs/05-SYSTEM-ARCHITECTURE.md
docs/06-DATA-ARCHITECTURE.md
docs/07-UI-UX-DESIGN-SYSTEM.md
docs/08-IMPLEMENTATION-ROADMAP.md
docs/09-AI-CODING-RULES.md
```

---

# 4. Locked Product Decisions

## Product

```text
Ruang Pintar
=
School Digital Operating Platform modular
```

## Deployment

```text
Satu deployment = satu sekolah
```

Bukan shared-schema SaaS baseline.

## Architecture

```text
Modular Monolith
```

## Framework

```text
Next.js stable secure release
TypeScript
Node.js
```

## UI

```text
Tailwind CSS
shadcn/ui
Base UI
Academic Glass UI v1.2
```

## Database

```text
SQLite
Prisma ORM
ULID 26 karakter
```

## File

```text
Private Local Storage
S3-compatible ready
```

## Queue

```text
Queue-ready
incremental implementation
```

---

# 5. Database Naming

First-party physical database naming:

```text
Bahasa Indonesia
snake_case
```

Contoh:

```text
siswa
guru
mata_pelajaran
penugasan_mengajar
penempatan_rombel
presensi_sesi
nilai
```

Technical metadata dapat mempertahankan istilah umum seperti:

```text
id
url
json
hash
token
metadata
mime_type
created_at
updated_at
```

---

# 6. Base Roles

```text
SUPER_ADMIN
SCHOOL_STAFF
TEACHER
STUDENT
GUARDIAN
```

---

# 7. Position

```text
HEADMASTER
VICE_PRINCIPAL_CURRICULUM
VICE_PRINCIPAL_STUDENT_AFFAIRS
PROGRAM_HEAD
```

---

# 8. Assignments

```text
TEACHING_ASSIGNMENT
HOMEROOM_ASSIGNMENT
POSITION_ASSIGNMENT
```

---

# 9. Staff Capability Bundles

```text
SYSTEM_ADMIN
ACADEMIC_OPERATOR
STUDENT_DATA_OPERATOR
REPORT_OPERATOR
```

---

# 10. Authorization Model

```text
IDENTITY
↓
BASE ROLE
↓
POSITION / ASSIGNMENT / RELATIONSHIP
↓
PERMISSION
↓
RESOURCE SCOPE
↓
EFFECTIVE ACCESS
```

Default deny.

---

# 11. Important Domain Invariants

```text
Student Identity
≠
Student Enrollment
≠
Rombel Placement

Teacher
≠
Subject
≠
Teaching Assignment

Academic Calendar
≠
Master Schedule
≠
Actual Class Session

School Attendance
≠
Class Session Attendance

Material
≠
Material Publication

Assignment Definition
≠
Assignment Publication
≠
Submission

Assessment
≠
Grade
≠
Grade Publication

Missing Grade
≠
Zero Grade

Announcement
≠
Notification

Question Bank
≠
Question Version
≠
Exam Snapshot
≠
Exam Attempt
```

---

# 12. UI Baseline

Academic Glass UI v1.2.

Primary:

```text
Cobalt
Academic Navy
Plus Jakarta Sans
Andale Mono / technical fallback
```

Responsive viewports:

```text
390×844
768×1024
1024×768
1440×900
```

CRUD:

```text
Create/Edit → Dialog
Delete → Confirmation
Success → Close + one toast
Validation → Inline
```

---

# 13. Login Baseline

```text
Username login
Email login = NO
Public registration = DISABLED

Desktop:
58% Hero / 42% Form

Mobile:
Form First
```

---

# 14. Teacher Dashboard Baseline

Priority:

```text
1. Jadwal Hari Ini / Kelas Berikutnya
2. Kelas Saya
3. Perlu Perhatian
4. Tugas / Penilaian
5. Pengumuman
6. Supporting Summary
```

No generic KPI.

No fake chart.

---

# 15. Teacher Academic MVP

Milestone wajib:

```text
Login
↓
Dashboard Guru
↓
Kelas Saya
↓
Lingkup Materi / BAB
↓
TP
↓
Pertemuan
↓
Administrasi Guru
↓
Presensi
↓
Assessment
↓
Gradebook
```

---

# 16. Core Modules

```text
M01 School & Organization
M02 Identity & Access
M03 Platform Configuration
M04 File & Document
M05 Audit & Traceability
M06 Academic Period & Structure
M07 Student Academic Lifecycle
M08 Teacher & Teaching Assignment
M09 Academic Calendar
M10 Scheduling & Class Session
M11 Learning
M12 Attendance
M13 Assessment & Gradebook
M14 CBT
M15 Guardian & Family
M16 Communication
M17 Notification
M18 Student Monitoring
M19 Reporting & Analytics
M20 Integration
M21 AI Assistance
```

---

# 17. External Service Strategy

Core tidak bergantung pada provider eksternal.

Candidate future adapter:

```text
Email → Resend
Push → Firebase Cloud Messaging
WhatsApp → Meta WhatsApp Cloud API
Storage → S3-compatible
Calendar → Google Calendar API
AI → OpenAI Responses API
```

Implementasikan hanya pada phase yang membutuhkan.

---

# 18. Current Active Work

```text
PHASE 00
Project Bootstrap & Environment Baseline
```

Jangan implementasikan:

```text
Login final
Authentication
Authorization
Domain database
Dashboard
Student
Teacher
Attendance
Gradebook
CBT
```

pada Phase 00.

---

# 19. Memory Update Rule

Setelah phase mendapat Human Approval:

perbarui minimal:

```text
Current Implementation Phase
Current Phase Status
Last Human-Approved Implementation Phase
Latest Git Checkpoint
Important implementation decisions
Known limitations
```

Jangan menghapus historical decision yang masih relevan.

---

# 20. Human Authority

AI tidak boleh menetapkan phase APPROVED.

Human menetapkan:

```text
APPROVED
LOCKED
```
