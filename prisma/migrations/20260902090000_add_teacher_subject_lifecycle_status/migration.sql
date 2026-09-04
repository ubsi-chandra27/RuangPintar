-- Human Review Correction Phase 09-10
-- Menambahkan lifecycle ARSIP tanpa menghapus histori akademik.

ALTER TABLE "guru" ADD COLUMN "status_lifecycle" TEXT NOT NULL DEFAULT 'AKTIF';

UPDATE "guru"
SET "status_lifecycle" = CASE
  WHEN "status_aktif" = 1 THEN 'AKTIF'
  ELSE 'NONAKTIF'
END;

CREATE INDEX "guru_sekolah_id_status_lifecycle_idx" ON "guru"("sekolah_id", "status_lifecycle");

ALTER TABLE "mata_pelajaran" ADD COLUMN "status_lifecycle" TEXT NOT NULL DEFAULT 'AKTIF';

UPDATE "mata_pelajaran"
SET "status_lifecycle" = CASE
  WHEN "status_aktif" = 1 THEN 'AKTIF'
  ELSE 'NONAKTIF'
END;

CREATE INDEX "mata_pelajaran_sekolah_id_status_lifecycle_idx" ON "mata_pelajaran"("sekolah_id", "status_lifecycle");
