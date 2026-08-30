-- CreateTable
CREATE TABLE "tahun_ajaran" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kode" TEXT,
    "tanggal_mulai" DATETIME NOT NULL,
    "tanggal_selesai" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "tahun_ajaran_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "semester" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "tahun_ajaran_id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 1,
    "tanggal_mulai" DATETIME NOT NULL,
    "tanggal_selesai" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "semester_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "semester_tahun_ajaran_id_fkey" FOREIGN KEY ("tahun_ajaran_id") REFERENCES "tahun_ajaran" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "fase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "deskripsi" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 1,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "fase_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tingkat_kelas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "fase_id" TEXT,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 1,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "tingkat_kelas_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tingkat_kelas_fase_id_fkey" FOREIGN KEY ("fase_id") REFERENCES "fase" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "program_keahlian" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jenjang" TEXT,
    "status_aktif" BOOLEAN NOT NULL DEFAULT true,
    "deskripsi" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "program_keahlian_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rombel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "tahun_ajaran_id" TEXT NOT NULL,
    "semester_id" TEXT,
    "tingkat_id" TEXT NOT NULL,
    "fase_id" TEXT,
    "program_id" TEXT,
    "nama" TEXT NOT NULL,
    "kode" TEXT,
    "kapasitas" INTEGER NOT NULL DEFAULT 36,
    "status" TEXT NOT NULL DEFAULT 'AKTIF',
    "catatan" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "rombel_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "rombel_tahun_ajaran_id_fkey" FOREIGN KEY ("tahun_ajaran_id") REFERENCES "tahun_ajaran" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "rombel_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "semester" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "rombel_tingkat_id_fkey" FOREIGN KEY ("tingkat_id") REFERENCES "tingkat_kelas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "rombel_fase_id_fkey" FOREIGN KEY ("fase_id") REFERENCES "fase" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "rombel_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program_keahlian" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "tahun_ajaran_sekolah_id_status_idx" ON "tahun_ajaran"("sekolah_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "tahun_ajaran_sekolah_id_nama_key" ON "tahun_ajaran"("sekolah_id", "nama");

-- CreateIndex
CREATE INDEX "semester_sekolah_id_status_idx" ON "semester"("sekolah_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "semester_tahun_ajaran_id_kode_key" ON "semester"("tahun_ajaran_id", "kode");

-- CreateIndex
CREATE UNIQUE INDEX "fase_sekolah_id_kode_key" ON "fase"("sekolah_id", "kode");

-- CreateIndex
CREATE UNIQUE INDEX "tingkat_kelas_sekolah_id_kode_key" ON "tingkat_kelas"("sekolah_id", "kode");

-- CreateIndex
CREATE UNIQUE INDEX "program_keahlian_sekolah_id_kode_key" ON "program_keahlian"("sekolah_id", "kode");

-- CreateIndex
CREATE INDEX "rombel_sekolah_id_tahun_ajaran_id_status_idx" ON "rombel"("sekolah_id", "tahun_ajaran_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "rombel_sekolah_id_tahun_ajaran_id_nama_key" ON "rombel"("sekolah_id", "tahun_ajaran_id", "nama");
