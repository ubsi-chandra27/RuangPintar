-- SAAS-04: additive shared-schema multi-tenant foundation.
-- Existing domain records keep their sekolah_id. Legacy pengguna.sekolah_id remains intact
-- during the compatibility window and is backfilled into keanggotaan_sekolah.

ALTER TABLE "sesi_pengguna" ADD COLUMN "sekolah_aktif_id" TEXT REFERENCES "sekolah"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "keanggotaan_sekolah" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pengguna_id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "peran_dasar_di_tenant" TEXT NOT NULL,
    "status_keanggotaan" TEXT NOT NULL DEFAULT 'PENDING',
    "is_owner" BOOLEAN NOT NULL DEFAULT false,
    "berlaku_mulai" DATETIME,
    "berlaku_sampai" DATETIME,
    "sumber_pendaftaran" TEXT NOT NULL DEFAULT 'MIGRASI_LEGACY',
    "disetujui_oleh_id" TEXT,
    "disetujui_pada" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "keanggotaan_sekolah_pengguna_id_fkey" FOREIGN KEY ("pengguna_id") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "keanggotaan_sekolah_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "langganan_tenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "paket" TEXT NOT NULL DEFAULT 'TRIAL',
    "status" TEXT NOT NULL DEFAULT 'TRIAL_ACTIVE',
    "mulai_pada" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "berakhir_pada" DATETIME,
    "entitlement_json" TEXT,
    "sumber_aktivasi" TEXT NOT NULL DEFAULT 'MIGRASI_LEGACY',
    "transaksi_sumber_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "langganan_tenant_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "keanggotaan_sekolah_pengguna_id_sekolah_id_key" ON "keanggotaan_sekolah"("pengguna_id", "sekolah_id");
CREATE INDEX "keanggotaan_sekolah_sekolah_id_status_keanggotaan_idx" ON "keanggotaan_sekolah"("sekolah_id", "status_keanggotaan");
CREATE INDEX "keanggotaan_sekolah_pengguna_id_status_keanggotaan_idx" ON "keanggotaan_sekolah"("pengguna_id", "status_keanggotaan");
CREATE INDEX "keanggotaan_sekolah_sekolah_id_is_owner_status_keanggotaan_idx" ON "keanggotaan_sekolah"("sekolah_id", "is_owner", "status_keanggotaan");
CREATE INDEX "langganan_tenant_sekolah_id_status_berakhir_pada_idx" ON "langganan_tenant"("sekolah_id", "status", "berakhir_pada");
CREATE INDEX "langganan_tenant_transaksi_sumber_id_idx" ON "langganan_tenant"("transaksi_sumber_id");
CREATE INDEX "sesi_pengguna_sekolah_aktif_id_dicabut_berlaku_sampai_idx" ON "sesi_pengguna"("sekolah_aktif_id", "dicabut", "berlaku_sampai");

-- Backfill one active membership for every legacy user-school relationship.
-- The earliest legacy account in each school becomes a provisional owner; it must be
-- reconciled by an authorized human before ownership administration is enabled.
INSERT INTO "keanggotaan_sekolah" (
    "id", "pengguna_id", "sekolah_id", "peran_dasar_di_tenant", "status_keanggotaan",
    "is_owner", "berlaku_mulai", "sumber_pendaftaran", "disetujui_pada"
)
SELECT
    p."id",
    p."id",
    p."sekolah_id",
    p."peran_dasar",
    'ACTIVE',
    CASE WHEN NOT EXISTS (
        SELECT 1 FROM "pengguna" p2
        WHERE p2."sekolah_id" = p."sekolah_id"
          AND (p2."created_at" < p."created_at" OR (p2."created_at" = p."created_at" AND p2."id" < p."id"))
    ) THEN true ELSE false END,
    p."created_at",
    'MIGRASI_LEGACY',
    p."created_at"
FROM "pengguna" p
WHERE p."sekolah_id" IS NOT NULL;

-- Existing sessions retain their historic tenant context during the dual-read period.
UPDATE "sesi_pengguna"
SET "sekolah_aktif_id" = (
    SELECT p."sekolah_id" FROM "pengguna" p WHERE p."id" = "sesi_pengguna"."pengguna_id"
)
WHERE "sekolah_aktif_id" IS NULL;

-- Create a legacy trial/subscription record per school. Runtime entitlement evaluation
-- also verifies berakhir_pada, so expired historical trials become read-only safely.
INSERT INTO "langganan_tenant" (
    "id", "sekolah_id", "paket", "status", "mulai_pada", "berakhir_pada", "sumber_aktivasi"
)
SELECT
    s."id",
    s."id",
    CASE WHEN s."tipe_lisensi" = 'SEKOLAH' THEN 'BASIC' ELSE 'TRIAL' END,
    CASE WHEN s."tipe_lisensi" = 'SEKOLAH' THEN 'ACTIVE' ELSE 'TRIAL_ACTIVE' END,
    s."created_at",
    s."trial_berakhir_pada",
    'MIGRASI_LEGACY'
FROM "sekolah" s;
