-- CreateTable: kalender_akademik
CREATE TABLE "kalender_akademik" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "tahun_ajaran_id" TEXT NOT NULL,
    "semester_id" TEXT,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "tipe_event" TEXT NOT NULL,
    "tanggal_mulai" DATETIME NOT NULL,
    "tanggal_selesai" DATETIME NOT NULL,
    "libur_kbm" BOOLEAN NOT NULL DEFAULT false,
    "warna" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "kalender_akademik_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "kalender_akademik_tahun_ajaran_id_fkey" FOREIGN KEY ("tahun_ajaran_id") REFERENCES "tahun_ajaran" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "kalender_akademik_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "semester" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable: slot_waktu
CREATE TABLE "slot_waktu" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 1,
    "jam_mulai" TEXT NOT NULL,
    "jam_selesai" TEXT NOT NULL,
    "is_istirahat" BOOLEAN NOT NULL DEFAULT false,
    "is_upacara" BOOLEAN NOT NULL DEFAULT false,
    "hari_khusus" TEXT,
    "status_aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "slot_waktu_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable: versi_jadwal
CREATE TABLE "versi_jadwal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "tahun_ajaran_id" TEXT NOT NULL,
    "semester_id" TEXT,
    "nomor_versi" INTEGER NOT NULL DEFAULT 1,
    "nama" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "tanggal_publikasi" DATETIME,
    "dipublikasikan_oleh" TEXT,
    "catatan" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "versi_jadwal_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "versi_jadwal_tahun_ajaran_id_fkey" FOREIGN KEY ("tahun_ajaran_id") REFERENCES "tahun_ajaran" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "versi_jadwal_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "semester" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable: jadwal_pelajaran
CREATE TABLE "jadwal_pelajaran" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "versi_jadwal_id" TEXT NOT NULL,
    "tahun_ajaran_id" TEXT NOT NULL,
    "semester_id" TEXT,
    "rombel_id" TEXT NOT NULL,
    "penugasan_mengajar_id" TEXT NOT NULL,
    "guru_id" TEXT NOT NULL,
    "mata_pelajaran_id" TEXT NOT NULL,
    "slot_waktu_id" TEXT NOT NULL,
    "hari" TEXT NOT NULL,
    "ruangan" TEXT,
    "catatan" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "jadwal_pelajaran_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "jadwal_pelajaran_versi_jadwal_id_fkey" FOREIGN KEY ("versi_jadwal_id") REFERENCES "versi_jadwal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "jadwal_pelajaran_tahun_ajaran_id_fkey" FOREIGN KEY ("tahun_ajaran_id") REFERENCES "tahun_ajaran" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "jadwal_pelajaran_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "semester" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "jadwal_pelajaran_rombel_id_fkey" FOREIGN KEY ("rombel_id") REFERENCES "rombel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "jadwal_pelajaran_penugasan_mengajar_id_fkey" FOREIGN KEY ("penugasan_mengajar_id") REFERENCES "penugasan_mengajar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "jadwal_pelajaran_guru_id_fkey" FOREIGN KEY ("guru_id") REFERENCES "guru" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "jadwal_pelajaran_mata_pelajaran_id_fkey" FOREIGN KEY ("mata_pelajaran_id") REFERENCES "mata_pelajaran" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "jadwal_pelajaran_slot_waktu_id_fkey" FOREIGN KEY ("slot_waktu_id") REFERENCES "slot_waktu" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable: sesi_kelas_aktual
CREATE TABLE "sesi_kelas_aktual" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "jadwal_pelajaran_id" TEXT,
    "penugasan_mengajar_id" TEXT NOT NULL,
    "rombel_id" TEXT NOT NULL,
    "mata_pelajaran_id" TEXT NOT NULL,
    "guru_id" TEXT NOT NULL,
    "guru_pengganti_id" TEXT,
    "tahun_ajaran_id" TEXT NOT NULL,
    "semester_id" TEXT,
    "tanggal" DATETIME NOT NULL,
    "jam_mulai_aktual" DATETIME,
    "jam_selesai_aktual" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'TERJADWAL',
    "ruangan_aktual" TEXT,
    "topik_pembelajaran" TEXT,
    "catatan" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "sesi_kelas_aktual_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sesi_kelas_aktual_jadwal_pelajaran_id_fkey" FOREIGN KEY ("jadwal_pelajaran_id") REFERENCES "jadwal_pelajaran" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "sesi_kelas_aktual_penugasan_mengajar_id_fkey" FOREIGN KEY ("penugasan_mengajar_id") REFERENCES "penugasan_mengajar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sesi_kelas_aktual_rombel_id_fkey" FOREIGN KEY ("rombel_id") REFERENCES "rombel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sesi_kelas_aktual_mata_pelajaran_id_fkey" FOREIGN KEY ("mata_pelajaran_id") REFERENCES "mata_pelajaran" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sesi_kelas_aktual_guru_id_fkey" FOREIGN KEY ("guru_id") REFERENCES "guru" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sesi_kelas_aktual_guru_pengganti_id_fkey" FOREIGN KEY ("guru_pengganti_id") REFERENCES "guru" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "sesi_kelas_aktual_tahun_ajaran_id_fkey" FOREIGN KEY ("tahun_ajaran_id") REFERENCES "tahun_ajaran" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sesi_kelas_aktual_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "semester" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "kalender_akademik_sekolah_id_tahun_ajaran_id_tanggal_mulai_idx" ON "kalender_akademik"("sekolah_id", "tahun_ajaran_id", "tanggal_mulai");
CREATE INDEX "kalender_akademik_sekolah_id_tipe_event_idx" ON "kalender_akademik"("sekolah_id", "tipe_event");

-- CreateIndex
CREATE UNIQUE INDEX "slot_waktu_sekolah_id_kode_key" ON "slot_waktu"("sekolah_id", "kode");
CREATE INDEX "slot_waktu_sekolah_id_urutan_idx" ON "slot_waktu"("sekolah_id", "urutan");

-- CreateIndex
CREATE INDEX "versi_jadwal_sekolah_id_tahun_ajaran_id_status_idx" ON "versi_jadwal"("sekolah_id", "tahun_ajaran_id", "status");

-- CreateIndex
CREATE INDEX "jadwal_pelajaran_versi_jadwal_id_hari_slot_waktu_id_idx" ON "jadwal_pelajaran"("versi_jadwal_id", "hari", "slot_waktu_id");
CREATE INDEX "jadwal_pelajaran_guru_id_hari_slot_waktu_id_idx" ON "jadwal_pelajaran"("guru_id", "hari", "slot_waktu_id");
CREATE INDEX "jadwal_pelajaran_rombel_id_hari_slot_waktu_id_idx" ON "jadwal_pelajaran"("rombel_id", "hari", "slot_waktu_id");

-- CreateIndex
CREATE INDEX "sesi_kelas_aktual_guru_id_tanggal_status_idx" ON "sesi_kelas_aktual"("guru_id", "tanggal", "status");
CREATE INDEX "sesi_kelas_aktual_rombel_id_tanggal_status_idx" ON "sesi_kelas_aktual"("rombel_id", "tanggal", "status");
CREATE INDEX "sesi_kelas_aktual_jadwal_pelajaran_id_tanggal_idx" ON "sesi_kelas_aktual"("jadwal_pelajaran_id", "tanggal");
