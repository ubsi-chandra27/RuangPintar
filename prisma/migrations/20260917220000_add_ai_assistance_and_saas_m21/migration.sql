-- AlterTable: Penambahan field lisensi SaaS pada sekolah
ALTER TABLE "sekolah" ADD COLUMN "tipe_lisensi" TEXT NOT NULL DEFAULT 'FREEMIUM';
ALTER TABLE "sekolah" ADD COLUMN "trial_berakhir_pada" DATETIME;

-- AlterTable: Penambahan field no_telepon dan lisensi SaaS pada pengguna
ALTER TABLE "pengguna" ADD COLUMN "no_telepon" TEXT;
ALTER TABLE "pengguna" ADD COLUMN "tipe_lisensi" TEXT NOT NULL DEFAULT 'FREEMIUM';
ALTER TABLE "pengguna" ADD COLUMN "trial_berakhir_pada" DATETIME;

-- CreateTable: Permintaan setup kelas via pemindaian foto AI (Photo-to-Class Vision AI Agent)
CREATE TABLE "permintaan_setup_kelas_ai" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "pengguna_id" TEXT NOT NULL,
    "nama_kelas" TEXT NOT NULL,
    "mata_pelajaran" TEXT,
    "foto_url" TEXT NOT NULL,
    "hasil_ekstraksi_json" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "rombel_id_hasil" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "permintaan_setup_kelas_ai_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "permintaan_setup_kelas_ai_pengguna_id_fkey" FOREIGN KEY ("pengguna_id") REFERENCES "pengguna" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "permintaan_setup_kelas_ai_sekolah_id_status_idx" ON "permintaan_setup_kelas_ai"("sekolah_id", "status");
CREATE INDEX "permintaan_setup_kelas_ai_pengguna_id_idx" ON "permintaan_setup_kelas_ai"("pengguna_id");
