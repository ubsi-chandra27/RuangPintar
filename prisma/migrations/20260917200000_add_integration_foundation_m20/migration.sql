-- CreateTable
CREATE TABLE "konfigurasi_integrasi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "tipe_layanan" TEXT NOT NULL,
    "nama_konfigurasi" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AKTIF',
    "kredensial_json" TEXT,
    "parameter_json" TEXT,
    "terakhir_diuji_pada" DATETIME,
    "status_uji_terakhir" TEXT,
    "catatan_uji" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "konfigurasi_integrasi_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "endpoint_webhook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "url_target" TEXT NOT NULL,
    "secret_token" TEXT NOT NULL,
    "event_langganan_json" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AKTIF',
    "retry_count_max" INTEGER NOT NULL DEFAULT 3,
    "timeout_detik" INTEGER NOT NULL DEFAULT 10,
    "terakhir_dipicu_pada" DATETIME,
    "total_terkirim" INTEGER NOT NULL DEFAULT 0,
    "total_gagal" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "endpoint_webhook_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "log_pengiriman_integrasi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "tipe_layanan" TEXT NOT NULL,
    "arah" TEXT NOT NULL DEFAULT 'OUTBOUND',
    "event_name" TEXT NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "penerima" TEXT,
    "judul" TEXT,
    "payload_json" TEXT NOT NULL,
    "respons_status_code" INTEGER,
    "respons_body" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "jumlah_percobaan" INTEGER NOT NULL DEFAULT 1,
    "error_message" TEXT,
    "durasi_ms" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "log_pengiriman_integrasi_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "konfigurasi_integrasi_sekolah_id_tipe_layanan_provider_key" ON "konfigurasi_integrasi"("sekolah_id", "tipe_layanan", "provider");

-- CreateIndex
CREATE INDEX "konfigurasi_integrasi_sekolah_id_status_idx" ON "konfigurasi_integrasi"("sekolah_id", "status");

-- CreateIndex
CREATE INDEX "endpoint_webhook_sekolah_id_status_idx" ON "endpoint_webhook"("sekolah_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "log_pengiriman_integrasi_idempotency_key_key" ON "log_pengiriman_integrasi"("idempotency_key");

-- CreateIndex
CREATE INDEX "log_pengiriman_integrasi_sekolah_id_tipe_layanan_status_idx" ON "log_pengiriman_integrasi"("sekolah_id", "tipe_layanan", "status");

-- CreateIndex
CREATE INDEX "log_pengiriman_integrasi_sekolah_id_created_at_idx" ON "log_pengiriman_integrasi"("sekolah_id", "created_at");
