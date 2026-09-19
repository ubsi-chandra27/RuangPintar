-- M23: Add TransaksiLangganan model for Midtrans QRIS and Subscription Management

CREATE TABLE IF NOT EXISTS "transaksi_langganan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order_id" TEXT NOT NULL,
    "pengguna_id" TEXT NOT NULL,
    "sekolah_id" TEXT,
    "paket" TEXT NOT NULL DEFAULT 'GURU_PRO_BULANAN',
    "nominal" INTEGER NOT NULL,
    "biaya_admin" INTEGER NOT NULL DEFAULT 0,
    "total_bayar" INTEGER NOT NULL,
    "metode_pembayaran" TEXT NOT NULL DEFAULT 'QRIS',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "snap_token" TEXT,
    "snap_redirect_url" TEXT,
    "qris_url" TEXT,
    "waktu_transaksi" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dibayar_pada" DATETIME,
    "kadaluarsa_pada" DATETIME,
    "durasi_bulan" INTEGER NOT NULL DEFAULT 1,
    "payload_notifikasi_json" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "transaksi_langganan_pengguna_id_fkey" FOREIGN KEY ("pengguna_id") REFERENCES "pengguna" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transaksi_langganan_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "transaksi_langganan_order_id_key" ON "transaksi_langganan"("order_id");
CREATE INDEX IF NOT EXISTS "transaksi_langganan_pengguna_id_idx" ON "transaksi_langganan"("pengguna_id");
CREATE INDEX IF NOT EXISTS "transaksi_langganan_status_idx" ON "transaksi_langganan"("status");
CREATE INDEX IF NOT EXISTS "transaksi_langganan_order_id_idx" ON "transaksi_langganan"("order_id");
