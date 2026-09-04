-- CreateTable: presensi_sesi_kelas
CREATE TABLE "presensi_sesi_kelas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "sesi_kelas_id" TEXT NOT NULL,
    "siswa_id" TEXT NOT NULL,
    "penempatan_rombel_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'HADIR',
    "catatan" TEXT,
    "waktu_presensi" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diinput_oleh" TEXT,
    "diubah_terakhir_oleh" TEXT,
    "alasan_koreksi" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "presensi_sesi_kelas_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "presensi_sesi_kelas_sesi_kelas_id_fkey" FOREIGN KEY ("sesi_kelas_id") REFERENCES "sesi_kelas_aktual" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "presensi_sesi_kelas_siswa_id_fkey" FOREIGN KEY ("siswa_id") REFERENCES "siswa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "presensi_sesi_kelas_penempatan_rombel_id_fkey" FOREIGN KEY ("penempatan_rombel_id") REFERENCES "penempatan_rombel" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "presensi_sesi_kelas_sesi_kelas_id_siswa_id_key" ON "presensi_sesi_kelas"("sesi_kelas_id", "siswa_id");

-- CreateIndex
CREATE INDEX "presensi_sesi_kelas_sesi_kelas_id_status_idx" ON "presensi_sesi_kelas"("sesi_kelas_id", "status");

-- CreateIndex
CREATE INDEX "presensi_sesi_kelas_siswa_id_status_idx" ON "presensi_sesi_kelas"("siswa_id", "status");

-- CreateIndex
CREATE INDEX "presensi_sesi_kelas_sekolah_id_status_idx" ON "presensi_sesi_kelas"("sekolah_id", "status");
