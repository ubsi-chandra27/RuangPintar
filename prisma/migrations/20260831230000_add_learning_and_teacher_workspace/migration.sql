-- CreateTable: lingkup_materi
CREATE TABLE "lingkup_materi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "penugasan_mengajar_id" TEXT NOT NULL,
    "kode" TEXT,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'AKTIF',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "lingkup_materi_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lingkup_materi_penugasan_mengajar_id_fkey" FOREIGN KEY ("penugasan_mengajar_id") REFERENCES "penugasan_mengajar" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: tujuan_pembelajaran
CREATE TABLE "tujuan_pembelajaran" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "lingkup_materi_id" TEXT NOT NULL,
    "kode" TEXT,
    "deskripsi" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'AKTIF',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "tujuan_pembelajaran_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tujuan_pembelajaran_lingkup_materi_id_fkey" FOREIGN KEY ("lingkup_materi_id") REFERENCES "lingkup_materi" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: materi_pembelajaran
CREATE TABLE "materi_pembelajaran" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "guru_id" TEXT NOT NULL,
    "lingkup_materi_id" TEXT,
    "mata_pelajaran_id" TEXT,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "tipe_konten" TEXT NOT NULL DEFAULT 'DOKUMEN',
    "konten_teks" TEXT,
    "tautan_url" TEXT,
    "berkas_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "materi_pembelajaran_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "materi_pembelajaran_guru_id_fkey" FOREIGN KEY ("guru_id") REFERENCES "guru" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "materi_pembelajaran_lingkup_materi_id_fkey" FOREIGN KEY ("lingkup_materi_id") REFERENCES "lingkup_materi" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "materi_pembelajaran_mata_pelajaran_id_fkey" FOREIGN KEY ("mata_pelajaran_id") REFERENCES "mata_pelajaran" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "materi_pembelajaran_berkas_id_fkey" FOREIGN KEY ("berkas_id") REFERENCES "metadata_berkas" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable: publikasi_materi
CREATE TABLE "publikasi_materi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "materi_id" TEXT NOT NULL,
    "penugasan_mengajar_id" TEXT NOT NULL,
    "tanggal_publikasi" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'DITERBITKAN',
    "catatan" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "publikasi_materi_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "publikasi_materi_materi_id_fkey" FOREIGN KEY ("materi_id") REFERENCES "materi_pembelajaran" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "publikasi_materi_penugasan_mengajar_id_fkey" FOREIGN KEY ("penugasan_mengajar_id") REFERENCES "penugasan_mengajar" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: definisi_tugas
CREATE TABLE "definisi_tugas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "guru_id" TEXT NOT NULL,
    "lingkup_materi_id" TEXT,
    "mata_pelajaran_id" TEXT,
    "judul" TEXT NOT NULL,
    "petunjuk" TEXT NOT NULL,
    "tipe_penyerahan" TEXT NOT NULL DEFAULT 'FILE',
    "berkas_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "definisi_tugas_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "definisi_tugas_guru_id_fkey" FOREIGN KEY ("guru_id") REFERENCES "guru" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "definisi_tugas_lingkup_materi_id_fkey" FOREIGN KEY ("lingkup_materi_id") REFERENCES "lingkup_materi" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "definisi_tugas_mata_pelajaran_id_fkey" FOREIGN KEY ("mata_pelajaran_id") REFERENCES "mata_pelajaran" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "definisi_tugas_berkas_id_fkey" FOREIGN KEY ("berkas_id") REFERENCES "metadata_berkas" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable: publikasi_tugas
CREATE TABLE "publikasi_tugas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "tugas_id" TEXT NOT NULL,
    "penugasan_mengajar_id" TEXT NOT NULL,
    "tanggal_mulai" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "batas_waktu" DATETIME,
    "izinkan_terlambat" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'DITERBITKAN',
    "catatan" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "publikasi_tugas_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "publikasi_tugas_tugas_id_fkey" FOREIGN KEY ("tugas_id") REFERENCES "definisi_tugas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "publikasi_tugas_penugasan_mengajar_id_fkey" FOREIGN KEY ("penugasan_mengajar_id") REFERENCES "penugasan_mengajar" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: pengumpulan_tugas
CREATE TABLE "pengumpulan_tugas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "publikasi_tugas_id" TEXT NOT NULL,
    "siswa_id" TEXT NOT NULL,
    "tanggal_kumpul" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'DIKUMPULKAN',
    "teks_jawaban" TEXT,
    "berkas_id" TEXT,
    "catatan_siswa" TEXT,
    "catatan_guru" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "pengumpulan_tugas_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "pengumpulan_tugas_publikasi_tugas_id_fkey" FOREIGN KEY ("publikasi_tugas_id") REFERENCES "publikasi_tugas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "pengumpulan_tugas_siswa_id_fkey" FOREIGN KEY ("siswa_id") REFERENCES "siswa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "pengumpulan_tugas_berkas_id_fkey" FOREIGN KEY ("berkas_id") REFERENCES "metadata_berkas" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable: administrasi_pembelajaran
CREATE TABLE "administrasi_pembelajaran" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "penugasan_mengajar_id" TEXT NOT NULL,
    "sesi_kelas_aktual_id" TEXT,
    "guru_id" TEXT NOT NULL,
    "tanggal" DATETIME NOT NULL,
    "pertemuan_ke" INTEGER NOT NULL DEFAULT 1,
    "materi_disampaikan" TEXT NOT NULL,
    "kegiatan_pembelajaran" TEXT,
    "catatan_refleksi" TEXT,
    "status_realisasi" TEXT NOT NULL DEFAULT 'TERLAKSANA',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "administrasi_pembelajaran_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "administrasi_pembelajaran_penugasan_mengajar_id_fkey" FOREIGN KEY ("penugasan_mengajar_id") REFERENCES "penugasan_mengajar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "administrasi_pembelajaran_sesi_kelas_aktual_id_fkey" FOREIGN KEY ("sesi_kelas_aktual_id") REFERENCES "sesi_kelas_aktual" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "administrasi_pembelajaran_guru_id_fkey" FOREIGN KEY ("guru_id") REFERENCES "guru" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable: administrasi_tujuan_pembelajaran
CREATE TABLE "administrasi_tujuan_pembelajaran" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "administrasi_id" TEXT NOT NULL,
    "tp_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "administrasi_tujuan_pembelajaran_administrasi_id_fkey" FOREIGN KEY ("administrasi_id") REFERENCES "administrasi_pembelajaran" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "administrasi_tujuan_pembelajaran_tp_id_fkey" FOREIGN KEY ("tp_id") REFERENCES "tujuan_pembelajaran" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "lingkup_materi_penugasan_mengajar_id_urutan_idx" ON "lingkup_materi"("penugasan_mengajar_id", "urutan");
CREATE INDEX "lingkup_materi_sekolah_id_status_idx" ON "lingkup_materi"("sekolah_id", "status");

-- CreateIndex
CREATE INDEX "tujuan_pembelajaran_lingkup_materi_id_urutan_idx" ON "tujuan_pembelajaran"("lingkup_materi_id", "urutan");
CREATE INDEX "tujuan_pembelajaran_sekolah_id_status_idx" ON "tujuan_pembelajaran"("sekolah_id", "status");

-- CreateIndex
CREATE INDEX "materi_pembelajaran_guru_id_status_idx" ON "materi_pembelajaran"("guru_id", "status");
CREATE INDEX "materi_pembelajaran_sekolah_id_status_idx" ON "materi_pembelajaran"("sekolah_id", "status");

-- CreateIndex
CREATE INDEX "publikasi_materi_penugasan_mengajar_id_status_idx" ON "publikasi_materi"("penugasan_mengajar_id", "status");
CREATE UNIQUE INDEX "publikasi_materi_materi_id_penugasan_mengajar_id_key" ON "publikasi_materi"("materi_id", "penugasan_mengajar_id");

-- CreateIndex
CREATE INDEX "definisi_tugas_guru_id_status_idx" ON "definisi_tugas"("guru_id", "status");
CREATE INDEX "definisi_tugas_sekolah_id_status_idx" ON "definisi_tugas"("sekolah_id", "status");

-- CreateIndex
CREATE INDEX "publikasi_tugas_penugasan_mengajar_id_status_idx" ON "publikasi_tugas"("penugasan_mengajar_id", "status");

-- CreateIndex
CREATE INDEX "pengumpulan_tugas_siswa_id_status_idx" ON "pengumpulan_tugas"("siswa_id", "status");
CREATE UNIQUE INDEX "pengumpulan_tugas_publikasi_tugas_id_siswa_id_key" ON "pengumpulan_tugas"("publikasi_tugas_id", "siswa_id");

-- CreateIndex
CREATE UNIQUE INDEX "administrasi_pembelajaran_sesi_kelas_aktual_id_key" ON "administrasi_pembelajaran"("sesi_kelas_aktual_id");
CREATE INDEX "administrasi_pembelajaran_penugasan_mengajar_id_tanggal_idx" ON "administrasi_pembelajaran"("penugasan_mengajar_id", "tanggal");
CREATE INDEX "administrasi_pembelajaran_guru_id_tanggal_idx" ON "administrasi_pembelajaran"("guru_id", "tanggal");

-- CreateIndex
CREATE UNIQUE INDEX "administrasi_tujuan_pembelajaran_administrasi_id_tp_id_key" ON "administrasi_tujuan_pembelajaran"("administrasi_id", "tp_id");
