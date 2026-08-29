# DESIGN TOKENS KANONIKAL — RUANG PINTAR V2

Dokumen ini memuat seluruh nilai token desain aktual yang diekstrak langsung dari `resources/css/app.css`, `docs/design/UI-KIT.md`, dan implementasi Tailwind CSS v4 Ruang Pintar V2.

---

## 1. Palet Warna (*Color Palette*)

### A. Brand & Primary Colors (Cobalt & Academic Navy)
* `--primary-900`: `#1D4ED8` (Cobalt Deep)
* `--primary-700`: `#2563EB` (Cobalt Strong / Primary Action)
* `--primary-500`: `#3B82F6` (Cobalt Base)
* `--primary-300`: `#60A5FA` (Cobalt Soft)
* `--primary-100`: `#DBEAFE` (Cobalt Tint)
* `--academic-navy`: `#1E293B` (Neutral 800 — Header/High Contrast Surface)
* `--academic-sky`: `#0EA5E9` (Accent Glow / Information)
* `--academic-bronze`: `#35260C` (Warm Emblematic Detail)

### B. Neutral Canvas Scale
* `--neutral-900`: `#0F172A` (Heading Text / Dark Surface)
* `--neutral-800`: `#1E293B` (Strong Surface / Dark Card)
* `--neutral-700`: `#334155` (Body Text Secondary)
* `--neutral-600`: `#475569` (Subtle Body Text)
* `--neutral-500`: `#64748B` (Muted Text / Icons)
* `--neutral-400`: `#94A3B8` (Placeholder Text)
* `--neutral-300`: `#CBD5E1` (Border Normal)
* `--neutral-200`: `#E2E8F0` (Border Subtle)
* `--neutral-100`: `#F1F5F9` (Surface Soft)
* `--neutral-50`: `#F8FAFC` (Page Background Light)
* `--neutral-0`: `#FFFFFF` (Card Pure White)

### C. Semantic Status Colors
* `--semantic-success`: `#22C55E` | Soft: `#DCFCE7` | Text: `#15803D`
* `--semantic-info`: `#0EA5E9` | Soft: `#E0F2FE` | Text: `#0369A1`
* `--semantic-warning`: `#F59E0B` | Soft: `#FEF3C7` | Text: `#B45309`
* `--semantic-danger`: `#EF4444` | Soft: `#FEE2E2` | Text: `#B91C1C`

### D. Glass & Glow Tokens (Light Mode)
* `--glass-surface`: `rgba(255, 255, 255, 0.72)` (Blur: 12px)
* `--glass-elevated`: `rgba(255, 255, 255, 0.86)` (Blur: 16px)
* `--glass-strong`: `rgba(255, 255, 255, 0.95)` (Blur: 20px)
* `--glass-border`: `rgba(255, 255, 255, 0.55)`
* `--primary-glow`: `rgba(59, 130, 246, 0.25)`
* `--cyan-glow`: `rgba(14, 165, 233, 0.20)`

---

## 2. Tipografi (*Typography*)

### A. Font Families
* **Interface Utama (Sans):** `'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif`
* **Numerik & Kode (Mono):** `'Andale Mono', 'Cascadia Mono', 'SFMono-Regular', Consolas, monospace`

### B. Type Scale Hierarchy
| Role | Font Size | Line Height | Weight | Tailwind Class |
|---|---|---|---|---|
| **Display / 48** | `48px` (`3rem`) | `120%` (`leading-[1.2]`) | 700 (Bold) | `text-5xl font-bold tracking-tight` |
| **H1 / 40** | `40px` (`2.5rem`) | `120%` | 700 | `text-4xl font-bold tracking-tight` |
| **H2 / 32** | `32px` (`2rem`) | `120%` | 700 | `text-3xl font-bold tracking-tight` |
| **H3 / 24** | `24px` (`1.5rem`) | `120%` | 600–700 | `text-2xl font-bold` |
| **H4 / 20** | `20px` (`1.25rem`) | `120%` | 600–700 | `text-xl font-semibold` |
| **H5 / 18** | `18px` (`1.125rem`) | `120%` | 600 | `text-lg font-semibold` |
| **Body L / 16** | `16px` (`1rem`) | `150%` (`leading-normal`)| 400–500 | `text-base` |
| **Body M / 14** | `14px` (`0.875rem`) | `150%` | 400–500 | `text-sm` |
| **Caption / 12**| `12px` (`0.75rem`) | `150%` | 450–500 | `text-xs` |
| **Mono UI / 14** | `14px` (`0.875rem`) | Compact | 500–700 | `font-mono text-sm tabular-nums` |

---

## 3. Spasi (*Spacing Scale*)
* `--space-tight` (`4px` / `0.25rem`): Padding mikro, gap chip.
* `--space-2` (`8px` / `0.5rem`): Spasi kompak, gap icon ke label.
* `--space-compact` (`12px` / `0.75rem`): Padding baris tabel, padding input kecil.
* `--space-4` (`16px` / `1rem`): Padding kartu standar, jarak antar form field.
* `--space-comfortable` (`20px` / `1.25rem`): Padding container sectional.
* `--space-section` (`24px` / `1.5rem`): Grid gap dashboard, jarak antar seksi form.
* `--space-8` (`32px` / `2rem`): Jarak area tombol aksi utama.
* `--space-hero` (`48px` / `3rem`): Spasi vertikal header hero.

---

## 4. Radius Sudut (*Corner Radius*)
* **Input Control:** `8px` s.d. `10px` (`rounded-[8px]` / `rounded-xl`)
* **Button Control:** `12px` (`rounded-[12px]`)
* **Card Container:** `14px` s.d. `16px` (`rounded-2xl`)
* **Modal / Dialog:** `16px` s.d. `20px` (`rounded-2xl`)
* **Drawer Panel:** `24px` (`rounded-[24px]`)
* **Badge / Tag:** `9999px` (`rounded-full`) atau `6px` (`rounded-md`)

---

## 5. Bayangan & Elevasi (*Shadow & Depth*)
* **Level 0 (Flat):** `none`
* **Level 1 (Surface):** `0 1px 8px rgba(15, 23, 42, 0.08)` (Card hover / Subtle item)
* **Level 2 (Card):** `0 4px 16px rgba(15, 23, 42, 0.12)` (Standard elevated card)
* **Level 3 (Floating):** `0 8px 24px rgba(15, 23, 42, 0.16)` (Modal dialog / Popover)
* **Level 4 (Focus):** `0 0 0 3px rgba(59, 130, 246, 0.35)` (Active Focus Ring Halo)

---

## 6. Animasi & Transisi (*Motion*)
* `--motion-fast`: `160ms` (Hover states, button clicks, icon transitions)
* `--motion-normal`: `200ms` (Dropdown expand, modal fade, tab switch)
* `--motion-shell`: `250ms` (Sidebar collapse, mobile drawer slide-in)
* `--ease-standard`: `cubic-bezier(0.2, 0, 0, 1)`
* `--ease-emphasized`: `cubic-bezier(0.16, 1, 0.3, 1)`

---

## 7. Titik Henti Responsif (*Responsive Breakpoints*)
* `sm`: `640px` (Ponsel besar / Tablet mini vertikal)
* `md`: `768px` (Tablet portrait)
* `lg`: `1024px` (Tablet landscape / Laptop kecil — Transisi Split Screen)
* `xl`: `1280px` (Desktop standar)
* `2xl`: `1536px` s.d. `1920px` (Monitor desktop lebar)
