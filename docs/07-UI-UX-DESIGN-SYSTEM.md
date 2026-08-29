# 07 — UI/UX DESIGN SYSTEM
## Ruang Pintar

**Nama Dokumen:** UI/UX Design System  
**Nama Produk:** Ruang Pintar  
**Versi Dokumen:** 1.0  
**Status:** APPROVED / LOCKED  
**Bahasa Utama:** Bahasa Indonesia

**Sumber Visual Kanonikal:**
- Academic Glass UI v1.2 — Ruang Pintar V2
- `UI-KIT-SPECIFICATION.md`
- `DESIGN-TOKENS.md`
- `COMPONENT-MAPPING.md`
- `RESPONSIVE-BEHAVIOUR.md`
- `MOTION-SPECIFICATION.md`
- `AUTH-UX-BEHAVIOUR.md`
- `LOGIN-SPECIFICATION.md`
- `IMPLEMENTATION-NOTES.md`
- `context/ui-kit-context.json`
- `context/login-context.json`

**Dokumen Induk:**
- `00-PROJECT-BRIEF.md`
- `01-PRODUCT-REQUIREMENTS.md`
- `02-DOMAIN-MODEL.md`
- `03-MODULE-MAP.md`
- `04-ROLE-ACCESS.md`
- `05-SYSTEM-ARCHITECTURE.md`
- `06-DATA-ARCHITECTURE.md`

---

# 1. Tujuan Dokumen

Dokumen ini menetapkan bahasa visual, pola interaksi, responsive behavior, accessibility, dan experience composition resmi Ruang Pintar.

Dokumen ini menjawab:

> **Bagaimana seluruh capability Ruang Pintar diterjemahkan menjadi antarmuka yang konsisten, modern, akademik, aksesibel, responsif, dan mudah digunakan pada desktop, tablet, dan mobile?**

Dokumen ini menjadi sumber utama untuk:

- UI implementation;
- component development;
- design review;
- visual QA;
- responsive QA;
- UX consistency;
- authentication UI;
- application shell;
- CRUD behavior;
- dashboard composition;
- empty/loading/error state;
- accessibility;
- motion;
- AI coding prompt;
- visual regression review.

---

# 2. Status Visual Baseline

Ruang Pintar menggunakan:

```text
Academic Glass UI v1.2
```

sebagai **visual baseline resmi**.

Karakter utamanya:

```text
Modern
Bersih
Akademik
Terstruktur
Tenang
Berkontras tinggi
Liquid Glass terukur
```

UI Kit tidak di-reset dari nol.

Yang berubah hanyalah implementasi teknis agar native terhadap stack Ruang Pintar baru.

---

# 3. Adaptasi Stack

Implementasi target:

```text
Next.js
React
Tailwind CSS
shadcn/ui
Base UI
```

Aturan:

```text
PERTAHANKAN
- visual language;
- token;
- behavior;
- responsive rules;
- motion;
- component semantics;
- CRUD pattern;
- login fidelity;
- accessibility intent.

ADAPTASI
- routing;
- form handling;
- component primitive;
- server/client boundary;
- auth integration;
- navigation implementation.

TIDAK DITRANSFER
- Laravel-specific code;
- Inertia-specific code;
- Vite-specific implementation;
- Radix dependency sebagai requirement wajib;
- source architecture V2.
```

---

# 4. Prinsip Utama Design System

## 4.1 Academic First

UI harus terasa seperti sistem operasional sekolah yang profesional.

Bukan:

- dashboard gaming;
- crypto dashboard;
- social media app;
- glassmorphism dekoratif berlebihan.

## 4.2 Clarity Before Decoration

Kejelasan hierarchy, data, status, dan action lebih penting daripada visual effect.

## 4.3 Glass is Elevation, Not Decoration

Glass digunakan untuk:

- membedakan layer;
- secondary surface;
- floating surface;
- modal;
- filter bar;
- active elevated card.

Bukan untuk semua permukaan.

## 4.4 High Contrast

Teks dan kontrol harus mudah dibaca.

Target accessibility minimum:

```text
WCAG 2.1 AA
minimum contrast normal text 4.5:1
```

## 4.5 Responsive by Behavior

Responsive bukan sekadar mengecilkan ukuran.

Komponen dapat berubah bentuk:

```text
Desktop Table
→ Mobile Card List

Sidebar
→ Compact Rail
→ Drawer / Mobile Navigation
```

## 4.6 Predictable Interaction

Action yang sama harus menghasilkan pola UX yang sama.

---

# 5. Visual Character

Ruang Pintar menggunakan kombinasi:

```text
Academic Navy
+
Cobalt Blue
+
Neutral Light Canvas
+
Measured Glass
+
Soft Shadow
+
Subtle Motion
```

Tujuan visual:

- terpercaya;
- tenang;
- premium;
- modern;
- tidak melelahkan untuk penggunaan harian;
- cocok untuk data akademik padat.

---

# 6. Color System

## 6.1 Primary Colors

```text
Cobalt Deep   #1D4ED8
Cobalt Strong #2563EB
Cobalt Base   #3B82F6
Cobalt Soft   #60A5FA
Cobalt Tint   #DBEAFE
```

Penggunaan:

- primary action;
- active state;
- link;
- focus;
- selected navigation;
- academic accent.

---

# 7. Academic Navy

```text
Academic Navy #1E293B
Deep Navy     #0F172A
```

Penggunaan:

- heading;
- high-contrast action;
- dark strong surface;
- key navigation text;
- login submit button;
- strong visual anchor.

---

# 8. Neutral Scale

```text
#0F172A
#1E293B
#334155
#475569
#64748B
#94A3B8
#CBD5E1
#E2E8F0
#F1F5F9
#F8FAFC
#FFFFFF
```

Canvas light utama:

```text
#F8FAFC
atau
#F7F7F8
```

Card utama:

```text
#FFFFFF
```

---

# 9. Semantic Colors

## Success

```text
Base #22C55E
Soft #DCFCE7
Text #15803D
```

## Info

```text
Base #0EA5E9
Soft #E0F2FE
Text #0369A1
```

## Warning

```text
Base #F59E0B
Soft #FEF3C7
Text #B45309
```

## Danger

```text
Base #EF4444
Soft #FEE2E2
Text #B91C1C
```

Semantic color tidak boleh digunakan hanya sebagai dekorasi.

---

# 10. Glass Material System

## 10.1 SOLID

```text
Background: #FFFFFF
Border: #E2E8F0
Shadow: 0 1px 3px rgba(0,0,0,0.05)
```

Digunakan untuk:

- dense data table;
- form utama;
- primary content;
- surface yang membutuhkan readability tinggi.

## 10.2 GLASS SOFT

```text
Background: rgba(255,255,255,0.72)
Backdrop Blur: 12px
Border: rgba(255,255,255,0.55)
```

Digunakan untuk:

- supporting cards;
- filter bar;
- status banner;
- secondary control group.

## 10.3 GLASS ELEVATED

```text
Background: rgba(255,255,255,0.86)
Backdrop Blur: 16px
Shadow: 0 4px 16px rgba(15,23,42,0.08)
```

Digunakan untuk:

- elevated cards;
- sidebar chrome;
- active floating surface.

## 10.4 GLASS STRONG

```text
Background: rgba(255,255,255,0.95)
Backdrop Blur: 20px
Shadow: 0 8px 24px rgba(15,23,42,0.16)
```

Digunakan untuk:

- modal;
- dropdown;
- popover;
- floating panel.

---

# 11. Typography

## 11.1 Font Utama

```text
Plus Jakarta Sans
```

Fallback:

```text
Segoe UI
system-ui
sans-serif
```

## 11.2 Font Mono

```text
Andale Mono
```

Fallback:

```text
Cascadia Mono
SFMono-Regular
Consolas
monospace
```

Digunakan untuk waktu, kode, identifier teknis, angka tabular tertentu, dan data teknis.

---

# 12. Type Scale

| Role | Size | Line Height | Weight |
|---|---:|---:|---:|
| Display | 48px | 1.2 | 700 |
| H1 | 40px | 1.2 | 700 |
| H2 | 32px | 1.2 | 700 |
| H3 | 24px | 1.2 | 600–700 |
| H4 | 20px | 1.2 | 600–700 |
| H5 | 18px | 1.2 | 600 |
| Body L | 16px | 1.5 | 400–500 |
| Body M | 14px | 1.5 | 400–500 |
| Caption | 12px | 1.5 | 450–500 |
| Mono UI | 14px | compact | 500–700 |

---

# 13. Spacing Scale

Baseline:

```text
4px
8px
12px
16px
20px
24px
32px
48px
```

Token:

```text
tight       = 4px
space2      = 8px
compact     = 12px
space4      = 16px
comfortable = 20px
section     = 24px
space8      = 32px
hero        = 48px
```

---

# 14. Radius

```text
Input  : 8–10px
Button : 12px
Card   : 14–16px
Modal  : 16–20px
Drawer : 24px
Badge  : 9999px / pill
```

---

# 15. Shadow

```text
Level 0: none
Level 1: 0 1px 8px rgba(15,23,42,0.08)
Level 2: 0 4px 16px rgba(15,23,42,0.12)
Level 3: 0 8px 24px rgba(15,23,42,0.16)
Level 4 Focus: 0 0 0 3px rgba(59,130,246,0.35)
```

---

# 16. Motion Tokens

```text
--motion-fast   160ms
--motion-normal 200ms
--motion-shell  250ms
```

Easing:

```text
standard   cubic-bezier(0.2,0,0,1)
emphasized cubic-bezier(0.16,1,0.3,1)
```

---

# 17. Motion Usage

## FAST — 160ms

- hover;
- icon transition;
- color change;
- focus response;
- password visibility toggle.

## NORMAL — 200ms

- tabs;
- dropdown;
- alert appearance;
- modal content;
- small panel.

## SHELL — 250ms

- sidebar collapse/expand;
- drawer;
- major shell transition.

---

# 18. Reduced Motion

Jika sistem pengguna meminta reduced motion:

- non-essential animation harus dikurangi;
- transition tidak boleh menghambat penggunaan;
- information tidak boleh disampaikan hanya melalui motion.

---

# 19. Component Primitive Strategy

Primitive implementation menggunakan:

```text
shadcn/ui
+
Base UI
```

Tetapi:

```text
shadcn/ui
≠
Ruang Pintar Design System
```

shadcn/ui adalah implementation foundation.

Academic Glass UI adalah visual dan UX contract.

---

# 20. Button

Varian kanonikal:

```text
primary
secondary
outline
ghost
destructive
glass
glassPrimary
```

Ukuran:

```text
sm
default
lg
```

Semua button harus memiliki state default, hover, active, focus-visible, disabled, dan loading bila relevan.

---

# 21. Input & Form Controls

Input default:

```text
Height: 40px
Large: 48px
Border: #CBD5E1
Radius: 8–10px
Background: #FFFFFF
```

Focus:

```text
Border: #3B82F6
Ring: 0 0 0 3px rgba(59,130,246,0.25)
```

Komponen minimum:

- Input;
- Password Input;
- Textarea;
- Select;
- Checkbox;
- Radio Group;
- Switch.

---

# 22. Form Validation

Validation error:

- tampil inline;
- tepat di bawah field;
- menggunakan semantic danger;
- tidak hanya mengandalkan warna;
- fokus diarahkan ke field bermasalah bila sesuai.

Dilarang menggunakan browser alert untuk validation normal.

---

# 23. Touch Target

Target sentuh minimum:

```text
44px
```

Berlaku untuk:

- button;
- checkbox wrapper;
- password toggle;
- icon action;
- mobile navigation.

---

# 24. Cards & Surfaces

Jenis baseline:

```text
Basic Solid
Glass Soft
Glass Elevated
Stat Card
Class Card
Schedule Card
```

Card tidak boleh menjadi container universal tanpa hierarchy.

---

# 25. Status Components

Badge variants:

```text
success
warning
danger
info
neutral
```

Alert digunakan untuk informasi contextual yang perlu tetap terlihat.

Toast digunakan untuk feedback singkat setelah action.

Baseline toast:

```text
Desktop: top-right
Mobile: top-center
Auto dismiss: sekitar 4 detik
```

---

# 26. CRUD Interaction Pattern

Pola resmi:

```text
CREATE
→ Modal Dialog

EDIT
→ Modal Dialog

DELETE
→ Destructive Confirmation Dialog

SUCCESS
→ Modal ditutup
→ satu Toast

VALIDATION ERROR
→ Inline pada field
```

Dilarang:

```text
Submit
→ Success Modal
→ user harus klik OK
```

untuk flow CRUD normal.

---

# 27. When Not to Use Modal

Dedicated page digunakan jika:

- form sangat panjang;
- memiliki banyak section;
- membutuhkan deep link;
- membutuhkan autosave;
- membutuhkan complex review;
- memiliki workflow multi-step besar.

CRUD modal adalah default untuk sederhana-menengah, bukan aturan mutlak untuk semua form.

---

# 28. Modal Dialog

Desktop:

```text
centered
max-width sekitar 512px untuk modal standar
radius 16–20px
overlay blur ringan
```

Mobile:

```text
near-full modal
atau bottom-sheet pattern
safe padding
```

Modal harus memiliki title, description bila perlu, clear close action, focus management, dan action hierarchy jelas.

---

# 29. Destructive Confirmation

Harus:

- menjelaskan resource yang terkena;
- memiliki destructive button;
- tidak menggunakan wording ambigu;
- menjelaskan consequence.

Gunakan label action seperti:

```text
Hapus siswa
Batal
```

bukan:

```text
Ya
Tidak
```

---

# 30. Responsive Data Table

Desktop:

```text
Tabular
Row 44–48px
Header soft neutral
Subtle divider
```

Mobile:

```text
Table
→ Stacked Cards
```

Horizontal scrolling bukan solusi default untuk tabel operasional utama.

---

# 31. Pagination

Baseline:

```text
36×36px
```

Active state:

```text
Cobalt
White Text
```

---

# 32. Navigation Components

Baseline mencakup:

- Sidebar;
- Topbar;
- Drawer;
- Breadcrumb;
- Tabs;
- Dropdown;
- Tooltip;
- Popover.

Tooltip wajib untuk icon-only navigation pada compact rail.

---

# 33. Application Shell

Application Shell resmi:

```text
Desktop:
Sidebar + Topbar + Main Content

Tablet:
Compact Rail / Drawer sesuai ruang

Mobile:
Compact Header + Mobile Navigation / Drawer
```

---

# 34. Desktop Sidebar

Expanded:

```text
240px
```

Compact:

```text
56px
```

Sidebar menampilkan:

- brand;
- role-aware navigation;
- active state;
- collapse control;
- supporting account context bila diperlukan.

---

# 35. Sidebar Active State

Gunakan:

- soft blue background;
- strong navy/cobalt text;
- active icon accent;
- selected indication yang jelas.

Dilarang hanya menggunakan warna icon tanpa supporting state.

---

# 36. Sidebar Motion

Transition:

```text
250ms
```

Collapse/expand harus smooth dan tidak menyebabkan layout flicker.

---

# 37. Topbar

Baseline:

```text
Height: 64px
```

Dapat memuat:

- page context;
- breadcrumb;
- theme control;
- notification;
- user menu;
- contextual action.

---

# 38. Responsive Breakpoints

Canonical breakpoints:

```text
sm   640px
md   768px
lg   1024px
xl   1280px
2xl  1536px+
```

Canonical visual QA viewport:

```text
390×844
768×1024
1024×768
1440×900
```

---

# 39. Mobile — 390×844

Karakter:

```text
single column
touch-first
stacked data
safe horizontal padding
44px+ touch target
```

Tidak boleh ada horizontal overflow pada flow normal.

---

# 40. Tablet Portrait — 768×1024

Karakter:

```text
1–2 column reflow
mini navigation / drawer
balanced whitespace
```

---

# 41. Tablet Landscape — 1024×768

Karakter:

```text
2–3 column content
compact sidebar 56px
desktop-like information density
```

---

# 42. Desktop — 1440×900

Karakter:

```text
full sidebar 240px
3–4 column dashboard grid
dense but readable data
```

---

# 43. Responsive Content Principle

Pada layar kecil:

```text
Reflow
Reorder
Transform
Reduce secondary chrome
Preserve primary action
```

Bukan hanya:

```text
scale down everything
```

---

# 44. Page Layout Pattern

Baseline page:

```text
Page Header
├── Title
├── Description
└── Primary Action

Context / Filter Bar

Main Content

Supporting Content
```

Primary action maksimal satu yang paling dominan pada satu context.

---

# 45. Filter Bar

Gunakan GLASS SOFT atau SOLID ringan.

Filter harus:

- tidak mengambil terlalu banyak tinggi;
- mudah reset;
- menunjukkan active filters;
- responsive.

---

# 46. Empty State

Empty state harus menjelaskan:

```text
Apa yang belum ada
Mengapa kosong
Apa yang dapat dilakukan selanjutnya
```

Dilarang hanya menampilkan `No data`.

---

# 47. Loading State

Gunakan sesuai konteks:

- button spinner untuk submit;
- skeleton untuk page/data;
- subtle progress untuk long process.

Dilarang menggunakan blocking overlay untuk action ringan.

---

# 48. Error State

Bedakan:

```text
Validation
Authorization
Not Found
Conflict
System Error
External Provider Error
```

User-facing error harus actionable bila memungkinkan.

---

# 49. Accessibility Baseline

Minimum:

- semantic HTML;
- keyboard navigation;
- focus-visible;
- accessible label;
- dialog focus management;
- sufficient contrast;
- touch target minimal 44px;
- error tidak hanya warna;
- icon-only button memiliki accessible name;
- reduced motion respected.

---

# 50. Focus State

Focus-visible harus terlihat jelas.

Baseline:

```text
3px cobalt/blue halo
```

Dilarang menghapus outline tanpa replacement yang jelas.

---

# 51. Iconography

Gunakan satu keluarga icon konsisten.

Style:

- stroke konsisten;
- ukuran konsisten;
- tidak mencampur banyak gaya icon.

Icon tidak menggantikan label untuk action penting kecuali ruang sangat terbatas.

---

# 52. Dark Mode

Handoff V2 memiliki dasar dark canvas.

Jika dark mode diaktifkan:

- hierarchy material tetap;
- contrast tetap AA;
- semantic color tetap konsisten;
- glass tidak menjadi terlalu transparan;
- dense data tetap readable.

Dark mode tidak mengubah identity visual.

---

# 53. Login — Visual Baseline

Halaman Login menjadi salah satu visual identity resmi Ruang Pintar.

Desktop:

```text
58% Hero Artwork
42% Form
```

Mobile:

```text
Form lebih dahulu
Hero setelahnya
```

---

# 54. Login Canvas

Light:

```text
#F7F7F8
```

Dark baseline bila digunakan:

```text
#0B1120
```

Ambient glow:

```text
radial-gradient(
  circle at 88% 12%,
  rgba(14,165,233,0.08),
  transparent 25%
)
```

---

# 55. Login Brand Header

Menampilkan:

```text
Ruang Pintar
Academic Learning Platform
```

Logo baseline:

```text
48×48px
```

---

# 56. Login Desktop Layout

```text
Hero: 58%
Form: 42%
```

Form maximum width:

```text
470px
```

Large screen dapat meningkat sampai sekitar:

```text
500px
```

---

# 57. Login Hero

Hero artwork menggunakan:

```text
login-hero-astronaut.png
```

Desktop masking:

```text
horizontal fade ke sisi form
```

Mobile masking:

```text
vertical fade
```

---

# 58. Login Form

Field:

```text
Username
Kata Sandi
Ingat Saya
Lupa Kata Sandi
Masuk
```

Credential utama:

```text
username
```

bukan email-only.

---

# 59. Login Input

Height:

```text
48px
```

Radius:

```text
10px
```

Focus:

```text
Cobalt border
3px focus halo
```

---

# 60. Login Submit

Style:

```text
Academic Navy
#1E293B
White Text
48px height
12px radius
```

Loading state:

- spinner;
- disabled;
- duplicate submit dicegah.

---

# 61. Login Validation

Error:

- inline;
- field-specific;
- username dapat dipertahankan setelah submit gagal;
- password dapat dikosongkan kembali untuk keamanan sesuai implementasi auth.

---

# 62. First Login UX

Jika account memiliki requirement ubah password awal:

```text
Login berhasil
 ↓
Must Change Password?
 ↓
YA
→ halaman wajib ubah password
```

---

# 63. Login Responsive Rules

## Mobile

```text
Form: order-1
Hero: order-2
```

Tujuan:

- keyboard tidak menutupi form;
- primary task langsung terlihat;
- hero tetap hadir sebagai brand experience.

## Tablet

Single-column centered form dengan hero sebagai supporting visual.

## Desktop

Split view penuh.

---

# 64. Dashboard Composition

Dashboard harus menjawab:

```text
Apa yang perlu saya lihat sekarang?
Apa yang perlu saya lakukan?
Apa yang membutuhkan perhatian?
Apa yang akan terjadi berikutnya?
```

Dashboard bukan kumpulan card acak.

---

# 65. Dashboard Role-Aware

Dashboard berbeda menurut effective access.

Contoh:

```text
Teacher Dashboard
Student Dashboard
Guardian Dashboard
Staff Dashboard
Leadership Dashboard
```

Perbedaan berasal dari workflow, bukan hanya label.

---

# 66. Teacher Dashboard Pattern

Dapat menggabungkan:

- jadwal hari ini;
- kelas berikutnya;
- tugas yang perlu diperiksa;
- presensi sesi;
- assessment;
- CBT;
- announcement;
- notification.

---

# 67. Student Dashboard Pattern

Dapat menggabungkan:

- aktivitas hari ini;
- jadwal berikutnya;
- deadline tugas;
- CBT mendatang;
- attendance pribadi;
- published grade;
- announcement;
- notification.

---

# 68. Guardian Dashboard Pattern

Dapat menggabungkan:

- child switcher;
- attendance anak;
- tugas;
- schedule;
- published grade;
- announcement;
- follow-up yang memang boleh dilihat.

---

# 69. Leadership Dashboard Pattern

Fokus pada:

- summary;
- trend;
- exception;
- attention;
- reporting;
- monitoring.

Bukan mengambil alih operational form guru.

---

# 70. Information Density

Baseline:

```text
medium density
```

Desktop boleh padat untuk table dan management page.

Mobile harus memprioritaskan readability dan action.

---

# 71. Publish / Finalize UX

Publish dan Finalize berbeda dari Save.

Visual hierarchy harus membedakan:

```text
Save Draft
Publish
Finalize
```

Finalize dapat membutuhkan stronger confirmation.

---

# 72. Historical Data UX

Historical data harus memiliki visual indicator bila:

- read-only;
- closed;
- archived;
- expired;
- from previous academic period.

User tidak boleh mengira resource historis masih editable.

---

# 73. Permission-Aware UI

UI hanya menampilkan action yang relevan dengan effective access.

Namun:

```text
UI hiding
≠
security
```

Server tetap melakukan authorization.

---

# 74. Search UX

Search:

- memiliki placeholder kontekstual;
- dapat dikombinasikan dengan filter bila perlu;
- tidak menampilkan result di luar scope.

---

# 75. Bulk Action UX

Bulk action harus:

- jelas resource count;
- memperlihatkan scope;
- menggunakan confirmation untuk high-impact operation;
- menampilkan partial failure secara jelas bila terjadi.

---

# 76. Notification UX

Notification center harus membedakan:

- unread;
- read;
- priority bila ada;
- source/context.

Notification bukan pengganti Announcement page.

---

# 77. Announcement UX

Announcement harus memiliki:

- title;
- publisher;
- publish time;
- audience/context;
- content;
- attachment bila ada;
- lifecycle/status bila relevan.

---

# 78. CBT UX

CBT UI harus memprioritaskan:

- stability;
- timer clarity;
- save state;
- question navigation;
- submit confirmation;
- accessibility;
- integrity event tanpa membuat UI menuduh cheating otomatis.

---

# 79. Attendance UX

Attendance harus:

- cepat;
- jelas status;
- mudah untuk satu kelas;
- tidak memerlukan terlalu banyak klik;
- memperlihatkan perubahan/correction state.

---

# 80. Gradebook UX

Gradebook harus membedakan:

```text
Belum dinilai
Nilai 0
Draft
Published
Finalized
```

Tidak boleh mengandalkan warna saja.

---

# 81. Content Language

UI utama menggunakan Bahasa Indonesia.

Istilah teknis dapat dipertahankan jika lebih umum dan lebih jelas.

Microcopy harus:

- singkat;
- jelas;
- actionable;
- tidak teknis tanpa kebutuhan.

---

# 82. Date & Time

UI menggunakan:

```text
24-hour time
```

Contoh:

```text
07:30
13:15
```

---

# 83. Design Token Implementation

Token harus menjadi source of consistency.

Implementasi Tailwind CSS harus memetakan:

- colors;
- typography;
- spacing;
- radius;
- shadow;
- motion;
- glass;
- semantic status.

Dilarang hard-code warna berulang pada komponen tanpa alasan.

---

# 84. Component Ownership

Komponen generic:

```text
shared UI
```

Komponen domain:

```text
module-owned / domain-aware
```

Contoh:

```text
Button
→ shared

GradeStatusBadge
→ Assessment domain component

AttendanceStatus
→ Attendance domain component
```

---

# 85. Component API

Component API harus:

- semantic;
- typed;
- tidak terlalu banyak boolean flag;
- mendukung accessibility;
- konsisten antar modul.

---

# 86. No Random Tailwind

Tailwind utility tidak boleh digunakan sebagai alasan menghasilkan design token baru pada setiap halaman.

Jika pola berulang:

```text
jadikan token
atau
jadikan component
```

---

# 87. Visual QA

Setiap UI phase harus direview minimal pada:

```text
390×844
768×1024
1024×768
1440×900
```

Review mencakup:

- overflow;
- spacing;
- hierarchy;
- touch target;
- navigation;
- table transformation;
- modal behavior;
- typography;
- motion;
- focus;
- empty/loading/error state.

---

# 88. Accessibility QA

Minimal cek:

- keyboard only;
- focus order;
- focus visible;
- form labels;
- error message;
- dialog focus;
- contrast;
- icon labels;
- touch target;
- reduced motion.

---

# 89. Login Visual QA

Login dibandingkan terhadap baseline V2 pada:

```text
390×844
768×1024
1024×768
1440×900
```

Fidelity yang dinilai:

- split ratio;
- form position;
- logo scale;
- hero masking;
- canvas;
- title scale;
- input height;
- button;
- spacing;
- mobile order.

---

# 90. Design Review Priority

Urutan review:

```text
1. UX correctness
2. Accessibility
3. Responsive behavior
4. Visual hierarchy
5. Token consistency
6. Motion
7. Decorative polish
```

---

# 91. Anti-Pattern yang Dilarang

## Glass Everywhere
Dilarang.

## Different UI Pattern per Module
Dilarang tanpa alasan domain yang jelas.

## Random Color
Dilarang membuat status dengan warna baru tanpa semantic mapping.

## Horizontal Scroll sebagai Default Mobile Table
Dilarang untuk tabel operasional utama.

## Success Modal untuk CRUD
Dilarang.

## Validation Alert Popup
Dilarang untuk field validation normal.

## Tiny Touch Target
Dilarang.

## Icon-only Tanpa Accessible Name
Dilarang.

## UI sebagai Security Boundary
Dilarang.

## Over-animation
Dilarang.

---

# 92. Canonical Component Catalog

Komponen baseline yang harus tersedia:

```text
Button
Input
Password Input
Textarea
Select
Checkbox
Radio Group
Switch
Card
Surface
Stat Card
Class Card
Schedule Card
Badge
Alert
Toast
Dialog
Confirmation Dialog
Accordion
Tabs
Breadcrumb
Tooltip
Dropdown
Popover
Responsive Data Table
Pagination
Sidebar
Topbar
Drawer
Academic Shell
Empty State
Loading State
Error State
Page Header
Filter Bar
```

---

# 93. Academic Domain Components

Komponen domain dapat dikembangkan sesuai modul, antara lain:

```text
Academic Period Selector
Rombel Card
Teaching Assignment Card
Schedule Card
Attendance Status
Assessment Status
Grade Status
CBT Attempt Status
Guardian Child Switcher
Student Attention Indicator
Announcement Card
Notification Item
```

Komponen domain tetap mengikuti token dan accessibility baseline.

---

# 94. Application Shell Baseline

Baseline resmi:

```text
Desktop
→ Expanded Sidebar 240px
↔ Compact Rail 56px

Tablet
→ Compact navigation / drawer sesuai ruang

Mobile
→ Compact Header
→ Drawer / Mobile Navigation
```

---

# 95. Design System Governance

Perubahan token utama memerlukan review.

Contoh perubahan yang tidak boleh dilakukan diam-diam:

- ganti primary color;
- ganti font utama;
- ganti spacing scale;
- ganti radius baseline;
- ganti motion duration;
- ganti application shell;
- ganti CRUD feedback pattern.

---

# 96. Extension Rule

Komponen baru boleh dibuat jika:

- requirement nyata membutuhkan;
- komponen existing tidak tepat;
- semantic role jelas;
- mengikuti token;
- responsive;
- accessible;
- didokumentasikan.

---

# 97. Definition of Done UI/UX

Sebuah UI feature dianggap selesai jika:

- menggunakan component/token resmi;
- responsive pada viewport kanonikal;
- accessible;
- error/loading/empty state tersedia;
- authorization-aware;
- tidak memiliki overflow tidak disengaja;
- motion sesuai token;
- form validation konsisten;
- destructive action aman;
- visual review selesai.

---

# 98. Quality Gate UI

Minimal:

```text
Typecheck PASS
Lint PASS
Build PASS
Automated component/use-case test relevan PASS
Responsive Review PASS
Accessibility Review PASS
Human Visual Review PASS
```

---

# 99. Baseline yang Dikunci

Baseline berikut dinyatakan dikunci:

1. Academic Glass UI v1.2 sebagai design language.
2. Cobalt + Academic Navy sebagai primary palette.
3. Neutral light canvas sebagai default.
4. Plus Jakarta Sans sebagai font UI utama.
5. Andale Mono/fallback mono untuk angka/kode teknis.
6. Material hierarchy SOLID / GLASS SOFT / GLASS ELEVATED / GLASS STRONG.
7. Spacing scale berbasis 4–48px.
8. Radius 8–24px sesuai component role.
9. Motion 160 / 200 / 250ms.
10. WCAG AA sebagai accessibility baseline.
11. Touch target minimum 44px.
12. Desktop sidebar 240px dan compact rail 56px.
13. Responsive table menjadi stacked card pada mobile.
14. CRUD Create/Edit menggunakan dialog untuk flow sederhana-menengah.
15. Delete menggunakan destructive confirmation dialog.
16. Success CRUD menggunakan satu toast.
17. Validation menggunakan inline error.
18. Login split 58/42 pada desktop.
19. Login mobile form-first.
20. Username sebagai credential UI utama.
21. Visual implementation diadaptasi ke Next.js + Tailwind CSS + shadcn/ui + Base UI.
22. V2 source code tidak menjadi arsitektur implementation baru.

---

# 100. Dokumen Berikutnya

Setelah `07-UI-UX-DESIGN-SYSTEM.md`, urutan berikutnya:

```text
08-IMPLEMENTATION-ROADMAP.md
```

Dokumen tersebut menjawab:

> **Dalam urutan phase apa Ruang Pintar dibangun agar domain, arsitektur, data, access control, dan UI foundation berkembang secara aman tanpa membuat AI coding bekerja acak?**

Roadmap harus mengikuti seluruh keputusan yang telah dikunci pada dokumen `00` sampai `07`.
