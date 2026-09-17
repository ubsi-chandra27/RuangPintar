-- CreateTable
CREATE TABLE "riwayat_ekspor_laporan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "tipe_laporan" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "parameter_filter_json" TEXT,
    "total_baris" INTEGER NOT NULL DEFAULT 0,
    "dibuat_oleh_id" TEXT NOT NULL,
    "berkas_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "riwayat_ekspor_laporan_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "riwayat_ekspor_laporan_dibuat_oleh_id_fkey" FOREIGN KEY ("dibuat_oleh_id") REFERENCES "pengguna" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "riwayat_ekspor_laporan_sekolah_id_tipe_laporan_idx" ON "riwayat_ekspor_laporan"("sekolah_id", "tipe_laporan");

-- CreateIndex
CREATE INDEX "riwayat_ekspor_laporan_dibuat_oleh_id_idx" ON "riwayat_ekspor_laporan"("dibuat_oleh_id");
