-- CreateTable
CREATE TABLE "siswa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "pengguna_id" TEXT,
    "nis" TEXT NOT NULL,
    "nisn" TEXT,
    "nama_lengkap" TEXT NOT NULL,
    "jenis_kelamin" TEXT NOT NULL,
    "tempat_lahir" TEXT,
    "tanggal_lahir" DATETIME,
    "agama" TEXT,
    "nik" TEXT,
    "alamat" TEXT,
    "nama_wali" TEXT,
    "telepon_wali" TEXT,
    "email_wali" TEXT,
    "status_akademik" TEXT NOT NULL DEFAULT 'AKTIF',
    "tanggal_masuk" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggal_keluar" DATETIME,
    "catatan" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "siswa_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "siswa_pengguna_id_fkey" FOREIGN KEY ("pengguna_id") REFERENCES "pengguna" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "keikutsertaan_siswa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "siswa_id" TEXT NOT NULL,
    "tahun_ajaran_id" TEXT NOT NULL,
    "tingkat_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AKTIF',
    "tanggal_mulai" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggal_selesai" DATETIME,
    "catatan" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "keikutsertaan_siswa_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "keikutsertaan_siswa_siswa_id_fkey" FOREIGN KEY ("siswa_id") REFERENCES "siswa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "keikutsertaan_siswa_tahun_ajaran_id_fkey" FOREIGN KEY ("tahun_ajaran_id") REFERENCES "tahun_ajaran" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "keikutsertaan_siswa_tingkat_id_fkey" FOREIGN KEY ("tingkat_id") REFERENCES "tingkat_kelas" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "penempatan_rombel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "keikutsertaan_id" TEXT NOT NULL,
    "rombel_id" TEXT NOT NULL,
    "tanggal_mulai" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggal_selesai" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'AKTIF',
    "nomor_absen" INTEGER,
    "catatan" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "penempatan_rombel_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "penempatan_rombel_keikutsertaan_id_fkey" FOREIGN KEY ("keikutsertaan_id") REFERENCES "keikutsertaan_siswa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "penempatan_rombel_rombel_id_fkey" FOREIGN KEY ("rombel_id") REFERENCES "rombel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "siswa_pengguna_id_key" ON "siswa"("pengguna_id");

-- CreateIndex
CREATE UNIQUE INDEX "siswa_sekolah_id_nis_key" ON "siswa"("sekolah_id", "nis");

-- CreateIndex
CREATE INDEX "siswa_sekolah_id_status_akademik_idx" ON "siswa"("sekolah_id", "status_akademik");

-- CreateIndex
CREATE INDEX "siswa_sekolah_id_nisn_idx" ON "siswa"("sekolah_id", "nisn");

-- CreateIndex
CREATE UNIQUE INDEX "keikutsertaan_siswa_siswa_id_tahun_ajaran_id_key" ON "keikutsertaan_siswa"("siswa_id", "tahun_ajaran_id");

-- CreateIndex
CREATE INDEX "keikutsertaan_siswa_sekolah_id_tahun_ajaran_id_status_idx" ON "keikutsertaan_siswa"("sekolah_id", "tahun_ajaran_id", "status");

-- CreateIndex
CREATE INDEX "penempatan_rombel_rombel_id_status_idx" ON "penempatan_rombel"("rombel_id", "status");

-- CreateIndex
CREATE INDEX "penempatan_rombel_keikutsertaan_id_status_idx" ON "penempatan_rombel"("keikutsertaan_id", "status");

-- CreateIndex
CREATE INDEX "penempatan_rombel_sekolah_id_status_idx" ON "penempatan_rombel"("sekolah_id", "status");
