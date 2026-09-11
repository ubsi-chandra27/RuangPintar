# PHASE 17 — COMMUNICATION & NOTIFICATION (M16/M17 / MILESTONE F)
## Ruang Pintar — School Digital Operating Platform

**Versi:** 1.0  
**Status:** READY FOR HUMAN REVIEW  
**Tanggal:** 10 September 2026  
**Penyusun:** Antigravity AI Coding Agent  
**Modul Induk:** M16 — Communication & M17 — Notification  
**Dokumen Referensi:**
- `docs/08-IMPLEMENTATION-ROADMAP.md` (Bagian 26 — Phase 17 Communication & Notification)
- `docs/03-MODULE-MAP.md` (M16 Communication & M17 Notification)
- `docs/04-ROLE-ACCESS.md` (Seksi 18 & 21, Permissions `communication.announcement.*`)
- `docs/FRD.md` (FR-COM-001 s/d FR-COM-004 & FR-NOT-001 s/d FR-NOT-003)

---

# 1. Ringkasan Eksekutif

Phase 17 menuntaskan subsistem komunikasi dan notifikasi resmi sekolah dengan menghubungkan modul **Communication (M16)** dan **Notification (M17)** ke seluruh pengalaman pengguna platform (Super Admin, Staf, Guru, Siswa, dan Wali Murid). Seluruh implementasi dibangun dengan kepatuhan penuh terhadap **Domain Invariants** kanonikal:

1. **Announcement ≠ Notification ≠ Domain Source**:
   - **Pengumuman (M16)** adalah dokumen informasi resmi berstruktur dengan sasaran audiens (*school-wide*, peran, atau rombel) yang dipublikasikan oleh pihak sekolah / guru berwenang.
   - **Notifikasi (M17)** adalah pemberitahuan personal in-app per pengguna dengan status keterbacaan (*read/unread*), unread count live, dan pencatatan outbox untuk adapter saluran eksternal.
   - Peristiwa pada domain sumber (seperti terbitnya pengumuman baru, tugas kelas, rilis nilai, atau respon izin) bertindak sebagai pemicu event, namun kegagalan notifikasi **tidak boleh** membatalkan keabsahan transaksi domain utama (*fail-safe isolation* / FR-NOT-003).
2. **Server-Side Audience Filtering (FR-COM-002 & FR-COM-003)**:
   - Target audiens pengumuman (`SEMUA`, `GURU`, `SISWA`, `WALI`, `ROMBEL`) divalidasi dan disaring secara ketat di server database. Pengguna hanya dapat melihat pengumuman yang sesuai dengan perannya atau rombel aktifnya.
3. **Live In-App Notification Center**:
   - Menggantikan placeholder statis `NotificationEntry` di Shell Topbar menjadi popover live data-driven dengan badge counter dinamis, timestamp relatif Bahasa Indonesia, dan aksi sekali klik untuk menandai terbaca.
4. **Transactional Outbox & Delivery Adapters**:
   - Arsitektur pengiriman eksternal (WhatsApp & Email mock adapters) terintegrasi dengan tabel `outbox_pesan` yang siap dihubungkan ke penyedia gateway produksi di masa mendatang.

---

# 2. Files Created & Modified

### Files Created:
1. `prisma/migrations/20260910190000_add_communication_and_notification/migration.sql`: Migrasi database tabel `pengumuman`, `sasaran_pengumuman`, `notifikasi_pengguna`, dan `preferensi_notifikasi`.
2. `prisma/seed-communication-and-notification.ts`: Script seed data realistis pengumuman sekolah, target audiens, dan notifikasi per pengguna.
3. `src/modules/communication/domain/communication-types.ts`: Definisi domain types, kategori, status, dan DTO pengumuman.
4. `src/modules/communication/domain/communication-errors.ts`: Definisi domain errors (`AnnouncementNotFoundError`, `UnauthorizedAnnouncementManageError`, `AnnouncementValidationError`).
5. `src/modules/communication/domain/communication-validation.ts`: Skema validasi Zod untuk pembuatan dan pembaruan pengumuman.
6. `src/modules/communication/infrastructure/communication-repository.ts`: Repository Prisma SQLite teroptimasi untuk query pengumuman dengan server-side audience scoping.
7. `src/modules/communication/application/communication-service.ts`: Application service pengumuman dengan audit logger (`recordAuditEvent`) dan event dispatcher ke M17.
8. `src/modules/notification/domain/notification-types.ts`: Definisi domain types, tipe notifikasi, preferensi saluran, dan DTO.
9. `src/modules/notification/domain/notification-errors.ts`: Definisi domain errors notifikasi.
10. `src/modules/notification/domain/notification-validation.ts`: Skema validasi Zod notifikasi dan preferensi.
11. `src/modules/notification/infrastructure/delivery-adapters.ts`: Kontrak antarmuka `INotificationDeliveryAdapter` serta adapter WhatsApp & Email.
12. `src/modules/notification/infrastructure/notification-repository.ts`: Repository Prisma SQLite untuk notifikasi in-app dan preferensi.
13. `src/modules/notification/application/notification-service.ts`: Application service notifikasi event-driven, unread counter, dan outbox logging.
14. `src/app/actions/communication-actions.ts`: Server actions mutasi pengumuman (`createAnnouncementAction`, `publishAnnouncementAction`, `archiveAnnouncementAction`, `deleteAnnouncementAction`).
15. `src/app/actions/notification-actions.ts`: Server actions notifikasi (`getNotificationSummaryAction`, `markNotificationReadAction`, `markAllNotificationsReadAction`).
16. `src/modules/communication/presentation/create-announcement-modal.tsx`: Modal dialog pembuatan pengumuman baru dengan target audiens & upload lampiran.
17. `src/modules/communication/presentation/announcement-detail-modal.tsx`: Modal dialog pembaca detail pengumuman dan kontrol aksi manajemen.
18. `src/modules/communication/presentation/announcement-directory-view.tsx`: Komponen presentasi direktori pengumuman dengan tab filter kategori & pencarian.
19. `src/modules/communication/presentation/announcement-widget.tsx`: Komponen feed pengumuman ringkas untuk dashboard.
20. `src/app/pengumuman/page.tsx`: Route page kanonikal Next.js untuk pusat pengumuman sekolah.
21. `src/test/communication/communication-service.test.ts`: Unit test domain logic pengumuman, validasi, dan audit log.
22. `src/test/communication/communication-views.test.tsx`: Presentation tests untuk komponen UI pengumuman & popover notifikasi.
23. `src/test/notification/notification-service.test.ts`: Unit test notifikasi in-app, unread counter, dan fail-safe outbox.
24. `scripts/qa-phase17-visual-walkthrough.mjs`: Script Playwright visual walkthrough otomatis Phase 17.
25. `docs/phases/PHASE-17-COMMUNICATION-NOTIFICATION.md`: Dokumen deliverable resmi Phase 17.

### Files Modified:
1. `prisma/schema.prisma`: Penambahan model `Pengumuman`, `SasaranPengumuman`, `NotifikasiPengguna`, `PreferensiNotifikasi`, dan relasinya pada `Sekolah`, `Pengguna`, dan `Rombel`.
2. `src/shared/components/shell/notification-entry.tsx`: Transformasi dari mock statis menjadi live data-driven async popover dengan badge counter real-time.
3. `src/shared/components/shell/navigation-config.ts`: Penambahan rute kanonikal `/pengumuman` pada menu utama (`CANONICAL_NAVIGATION_CONFIG`).
4. `src/shared/components/shell/sidebar.tsx` & `mobile-drawer.tsx`: Registrasi icon `Megaphone` ke dalam `ICON_MAP`.
5. `src/shared/components/dashboard/role-views/super-admin-dashboard.tsx`: Tautan "Lihat Semua" pengumuman diarahkan ke rute resmi `/pengumuman`.
6. `src/test/shell/academic-shell.test.tsx`: Penyesuaian mock `useRouter` untuk mendukung interaktivitas notifikasi.

---

# 3. Database & Migrations

Empat model relasional ditambahkan pada database SQLite Ruang Pintar via migrasi `20260910190000_add_communication_and_notification`:

```sql
-- Pengumuman Resmi Sekolah
CREATE TABLE pengumuman (
    id TEXT NOT NULL PRIMARY KEY,
    sekolah_id TEXT NOT NULL,
    penulis_id TEXT NOT NULL,
    judul TEXT NOT NULL,
    konten TEXT NOT NULL,
    kategori TEXT NOT NULL DEFAULT 'UMUM',
    status TEXT NOT NULL DEFAULT 'DRAFT',
    apakah_disematkan BOOLEAN NOT NULL DEFAULT false,
    lampiran_url TEXT,
    target_audiens TEXT NOT NULL DEFAULT 'SEMUA',
    target_rombel_id TEXT,
    dipublikasikan_pada DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL,
    CONSTRAINT pengumuman_sekolah_id_fkey FOREIGN KEY (sekolah_id) REFERENCES sekolah (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT pengumuman_penulis_id_fkey FOREIGN KEY (penulis_id) REFERENCES pengguna (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT pengumuman_target_rombel_id_fkey FOREIGN KEY (target_rombel_id) REFERENCES rombel (id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Target Sasaran Rinci
CREATE TABLE sasaran_pengumuman (
    id TEXT NOT NULL PRIMARY KEY,
    pengumuman_id TEXT NOT NULL,
    tipe_sasaran TEXT NOT NULL,
    nilai_sasaran TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT sasaran_pengumuman_pengumuman_id_fkey FOREIGN KEY (pengumuman_id) REFERENCES pengumuman (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Notifikasi In-App Pengguna
CREATE TABLE notifikasi_pengguna (
    id TEXT NOT NULL PRIMARY KEY,
    sekolah_id TEXT NOT NULL,
    pengguna_id TEXT NOT NULL,
    judul TEXT NOT NULL,
    pesan TEXT NOT NULL,
    tipe TEXT NOT NULL,
    tautan_url TEXT,
    apakah_dibaca BOOLEAN NOT NULL DEFAULT false,
    dibaca_pada DATETIME,
    data_tambahan TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL,
    CONSTRAINT notifikasi_pengguna_sekolah_id_fkey FOREIGN KEY (sekolah_id) REFERENCES sekolah (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT notifikasi_pengguna_pengguna_id_fkey FOREIGN KEY (pengguna_id) REFERENCES pengguna (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Preferensi Saluran Notifikasi
CREATE TABLE preferensi_notifikasi (
    id TEXT NOT NULL PRIMARY KEY,
    pengguna_id TEXT NOT NULL,
    in_app_aktif BOOLEAN NOT NULL DEFAULT true,
    whatsapp_aktif BOOLEAN NOT NULL DEFAULT true,
    email_aktif BOOLEAN NOT NULL DEFAULT false,
    notif_pengumuman BOOLEAN NOT NULL DEFAULT true,
    notif_tugas BOOLEAN NOT NULL DEFAULT true,
    notif_nilai BOOLEAN NOT NULL DEFAULT true,
    notif_presensi BOOLEAN NOT NULL DEFAULT true,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL,
    CONSTRAINT preferensi_notifikasi_pengguna_id_fkey FOREIGN KEY (pengguna_id) REFERENCES pengguna (id) ON DELETE CASCADE ON UPDATE CASCADE
);
```

---

# 4. Domain & Authorization Enforcement

| Aspek | Kebijakan & Penegakan | Status |
|---|---|---|
| **Pemisahan Domain** | `Announcement ≠ Notification ≠ Source Transaction` | Terpisah secara fisik dan logis |
| **Izin Pengumuman** | `communication.announcement.view` & `communication.announcement.manage` | Terverifikasi server-side (default deny) |
| **Audience Scope** | Server-Side Audience Filter (SEMUA, GURU, SISWA, WALI, ROMBEL) | Siswa/Wali hanya melihat pengumuman yang sah |
| **Notification Privacy** | Notifikasi in-app terkunci per `pengguna_id` | User tidak dapat melihat/mengubah notif orang lain |
| **Fail-Safe Outbox** | `FR-NOT-003`: External failure isolated | Gangguan external delivery tidak membatalkan transaksi |
| **Audit Logging** | `recordAuditEvent` | Aksi `CREATE`, `UPDATE`, `PUBLISH`, `DELETE` tercatat rapi |

---

# 5. Quality Gates & Verification Results

| Quality Gate | Perintah / Alat | Hasil | Keterangan |
|---|---|---|---|
| **Typecheck** | `npm run typecheck` | **PASS (0 errors)** | Seluruh tipe TypeScript valid 100% |
| **Lint** | `npm run lint` | **PASS (0 errors, 4 warnings non-blocking)** | Clean code standard ESLint |
| **Format** | `npm run format:check` | **PASS (100% clean)** | Prettier formatting rapi |
| **Unit & Integration Tests** | `npm test` | **PASS (77 test files, 421 tests)** | Seluruh pengujian Phase 00–17 lulus 100% tanpa regresi |
| **Production Build** | `npm run build` | **PASS (19 routes generated)** | Turbopack Next.js compilation 100% sukses |
| **Playwright Visual Walkthrough** | `scripts/qa-phase17-visual-walkthrough.mjs` | **PASS (9 screenshots)** | Seluruh skenario alur kerja teruji dan terdokumentasi visual |

---

# 6. Visual QA & Walkthrough Evidence

Tersimpan pada direktori `docs/phases/screenshots/phase-17-walkthrough/`:

1. `01_notification_popover_open.png`: Popover Notifikasi Topbar interaktif dengan badge counter unread, timestamp relatif, tautan aksi, dan tombol tandai semua.
2. `02_announcement_directory_admin.png`: Halaman `/pengumuman` perspektif Super Admin dengan banner Academic Glass UI, tombol "Buat Pengumuman", tab filter, kartu disematkan (*pinned*), dan daftar kartu reguler.
3. `03_create_announcement_modal.png`: Modal dialog pembuatan pengumuman lengkap dengan kategori, sasaran audiens, rombel target, isi, upload lampiran, dan opsi simpan draf / terbitkan.
4. `04_announcement_detail_modal.png`: Modal dialog detail pengumuman dengan informasi penulis, tanggal, isi lengkap, dan kontrol aksi (Arsipkan / Hapus).
5. `05_announcement_category_filter.png`: Filter kategori 'Penting' aktif yang menyaring kartu pengumuman secara instan.
6. `06_teacher_announcement_view.png`: Direktori pengumuman dari perspektif akun Guru (`guru_demo`), menampilkan edaran dewan guru dan pengumuman sekolah.
7. `07_student_announcement_view.png`: Direktori pengumuman dari perspektif akun Siswa (`siswa_budi`), membuktikan penegakan filter audiens siswa.
8. `08_guardian_announcement_view.png`: Direktori pengumuman dari perspektif akun Orang Tua / Wali (`wali_santoso`), menampilkan edaran wali murid dan pengumuman umum.
9. `09_mobile_announcement_view_390px.png`: Tampilan responsif mobile viewport (390x844) dengan Academic Glass UI v1.2.

---

# 7. Known Limitations & Out-of-Scope Confirmation

### Sesuai Cakupan Phase 17:
- Pengumuman resmi sekolah terstruktur dengan filter audiens server-side (`M16`).
- Notifikasi in-app real-time per-pengguna dengan unread counter dan popover topbar (`M17`).
- Transactional Outbox pattern dan antarmuka adapter delivery (WhatsApp & Email).

### Konfirmasi Di Luar Cakupan (Explicit Non-Scope):
- Fitur monitoring komprehensif wali kelas terhadap seluruh murid satu rombel (dikelola pada **Phase 18 — Student Monitoring & Homeroom**).
- Dashboard pimpinan dan analytics sekolah (dikelola pada **Phase 19 — Leadership Dashboard, Reporting & Analytics**).

---

# 8. Status Akhir

```text
STATUS: READY FOR HUMAN REVIEW
```
Semua kriteria penerimaan Phase 17 telah terpenuhi secara utuh, teruji 100%, dan terdokumentasi lengkap. Menunggu peninjauan dan persetujuan Human Reviewer sebelum melanjutkan ke fase berikutnya.
