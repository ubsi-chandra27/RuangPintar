-- CreateTable: definisi_asesmen
CREATE TABLE "definisi_asesmen" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "penugasan_mengajar_id" TEXT NOT NULL,
    "tp_id" TEXT,
    "lingkup_materi_id" TEXT,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "kategori" TEXT NOT NULL DEFAULT 'FORMATIF',
    "teknik_penilaian" TEXT NOT NULL DEFAULT 'TES_TERTULIS',
    "bobot" REAL NOT NULL DEFAULT 1.0,
    "skala_maksimal" REAL NOT NULL DEFAULT 100.0,
    "kkm_kktp" REAL NOT NULL DEFAULT 75.0,
    "tanggal_pelaksanaan" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "definisi_asesmen_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "definisi_asesmen_penugasan_mengajar_id_fkey" FOREIGN KEY ("penugasan_mengajar_id") REFERENCES "penugasan_mengajar" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "definisi_asesmen_tp_id_fkey" FOREIGN KEY ("tp_id") REFERENCES "tujuan_pembelajaran" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "definisi_asesmen_lingkup_materi_id_fkey" FOREIGN KEY ("lingkup_materi_id") REFERENCES "lingkup_materi" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "definisi_asesmen_penugasan_mengajar_id_tanggal_pelaksanaan_idx" ON "definisi_asesmen"("penugasan_mengajar_id", "tanggal_pelaksanaan");

-- CreateIndex
CREATE INDEX "definisi_asesmen_tp_id_idx" ON "definisi_asesmen"("tp_id");

-- CreateIndex
CREATE INDEX "definisi_asesmen_lingkup_materi_id_idx" ON "definisi_asesmen"("lingkup_materi_id");

-- CreateIndex
CREATE INDEX "definisi_asesmen_sekolah_id_status_idx" ON "definisi_asesmen"("sekolah_id", "status");

-- CreateTable: nilai_siswa
CREATE TABLE "nilai_siswa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "asesmen_id" TEXT NOT NULL,
    "siswa_id" TEXT NOT NULL,
    "penempatan_rombel_id" TEXT,
    "nilai_angka" REAL,
    "nilai_huruf" TEXT,
    "capaian_kompetensi" TEXT,
    "catatan" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "diinput_oleh" TEXT,
    "diubah_terakhir_oleh" TEXT,
    "alasan_koreksi" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "nilai_siswa_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "nilai_siswa_asesmen_id_fkey" FOREIGN KEY ("asesmen_id") REFERENCES "definisi_asesmen" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "nilai_siswa_siswa_id_fkey" FOREIGN KEY ("siswa_id") REFERENCES "siswa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "nilai_siswa_penempatan_rombel_id_fkey" FOREIGN KEY ("penempatan_rombel_id") REFERENCES "penempatan_rombel" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "nilai_siswa_asesmen_id_siswa_id_key" ON "nilai_siswa"("asesmen_id", "siswa_id");

-- CreateIndex
CREATE INDEX "nilai_siswa_asesmen_id_status_idx" ON "nilai_siswa"("asesmen_id", "status");

-- CreateIndex
CREATE INDEX "nilai_siswa_siswa_id_idx" ON "nilai_siswa"("siswa_id");

-- CreateIndex
CREATE INDEX "nilai_siswa_sekolah_id_status_idx" ON "nilai_siswa"("sekolah_id", "status");

-- CreateTable: publikasi_nilai_asesmen
CREATE TABLE "publikasi_nilai_asesmen" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "asesmen_id" TEXT NOT NULL,
    "target_audience" TEXT NOT NULL DEFAULT 'SEMUA',
    "tanggal_publikasi" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dipublikasikan_oleh" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "catatan" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "publikasi_nilai_asesmen_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "publikasi_nilai_asesmen_asesmen_id_fkey" FOREIGN KEY ("asesmen_id") REFERENCES "definisi_asesmen" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "publikasi_nilai_asesmen_asesmen_id_status_idx" ON "publikasi_nilai_asesmen"("asesmen_id", "status");

-- CreateIndex
CREATE INDEX "publikasi_nilai_asesmen_sekolah_id_status_idx" ON "publikasi_nilai_asesmen"("sekolah_id", "status");
