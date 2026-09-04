-- CreateTable
CREATE TABLE "guru" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "pengguna_id" TEXT,
    "nip" TEXT,
    "nuptk" TEXT,
    "nama_lengkap" TEXT NOT NULL,
    "gelar_depan" TEXT,
    "gelar_belakang" TEXT,
    "jenis_kelamin" TEXT NOT NULL,
    "tempat_lahir" TEXT,
    "tanggal_lahir" DATETIME,
    "email" TEXT,
    "telepon" TEXT,
    "alamat" TEXT,
    "status_kepegawaian" TEXT NOT NULL DEFAULT 'TETAP',
    "status_aktif" BOOLEAN NOT NULL DEFAULT true,
    "foto_url" TEXT,
    "catatan" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "guru_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "guru_pengguna_id_fkey" FOREIGN KEY ("pengguna_id") REFERENCES "pengguna" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mata_pelajaran" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kelompok" TEXT,
    "status_aktif" BOOLEAN NOT NULL DEFAULT true,
    "deskripsi" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "mata_pelajaran_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "penugasan_mengajar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "guru_id" TEXT NOT NULL,
    "mata_pelajaran_id" TEXT NOT NULL,
    "tahun_ajaran_id" TEXT NOT NULL,
    "semester_id" TEXT,
    "rombel_id" TEXT NOT NULL,
    "jumlah_jam_minggu" INTEGER NOT NULL DEFAULT 2,
    "berlaku_mulai" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "berlaku_sampai" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'AKTIF',
    "catatan" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "penugasan_mengajar_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "penugasan_mengajar_guru_id_fkey" FOREIGN KEY ("guru_id") REFERENCES "guru" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "penugasan_mengajar_mata_pelajaran_id_fkey" FOREIGN KEY ("mata_pelajaran_id") REFERENCES "mata_pelajaran" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "penugasan_mengajar_tahun_ajaran_id_fkey" FOREIGN KEY ("tahun_ajaran_id") REFERENCES "tahun_ajaran" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "penugasan_mengajar_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "semester" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "penugasan_mengajar_rombel_id_fkey" FOREIGN KEY ("rombel_id") REFERENCES "rombel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "penugasan_wali_kelas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "guru_id" TEXT NOT NULL,
    "rombel_id" TEXT NOT NULL,
    "tahun_ajaran_id" TEXT NOT NULL,
    "berlaku_mulai" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "berlaku_sampai" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'AKTIF',
    "catatan" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "penugasan_wali_kelas_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "penugasan_wali_kelas_guru_id_fkey" FOREIGN KEY ("guru_id") REFERENCES "guru" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "penugasan_wali_kelas_rombel_id_fkey" FOREIGN KEY ("rombel_id") REFERENCES "rombel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "penugasan_wali_kelas_tahun_ajaran_id_fkey" FOREIGN KEY ("tahun_ajaran_id") REFERENCES "tahun_ajaran" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "guru_pengguna_id_key" ON "guru"("pengguna_id");

-- CreateIndex
CREATE INDEX "guru_sekolah_id_status_aktif_idx" ON "guru"("sekolah_id", "status_aktif");

-- CreateIndex
CREATE INDEX "guru_sekolah_id_nip_idx" ON "guru"("sekolah_id", "nip");

-- CreateIndex
CREATE INDEX "guru_sekolah_id_nuptk_idx" ON "guru"("sekolah_id", "nuptk");

-- CreateIndex
CREATE UNIQUE INDEX "mata_pelajaran_sekolah_id_kode_key" ON "mata_pelajaran"("sekolah_id", "kode");

-- CreateIndex
CREATE INDEX "mata_pelajaran_sekolah_id_status_aktif_idx" ON "mata_pelajaran"("sekolah_id", "status_aktif");

-- CreateIndex
CREATE INDEX "penugasan_mengajar_guru_id_status_idx" ON "penugasan_mengajar"("guru_id", "status");

-- CreateIndex
CREATE INDEX "penugasan_mengajar_rombel_id_status_idx" ON "penugasan_mengajar"("rombel_id", "status");

-- CreateIndex
CREATE INDEX "penugasan_mengajar_sekolah_id_tahun_ajaran_id_status_idx" ON "penugasan_mengajar"("sekolah_id", "tahun_ajaran_id", "status");

-- CreateIndex
CREATE INDEX "penugasan_wali_kelas_guru_id_status_idx" ON "penugasan_wali_kelas"("guru_id", "status");

-- CreateIndex
CREATE INDEX "penugasan_wali_kelas_rombel_id_status_idx" ON "penugasan_wali_kelas"("rombel_id", "status");

-- CreateIndex
CREATE INDEX "penugasan_wali_kelas_sekolah_id_tahun_ajaran_id_status_idx" ON "penugasan_wali_kelas"("sekolah_id", "tahun_ajaran_id", "status");
