-- CreateTable
CREATE TABLE "pengguna" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "password_hash" TEXT NOT NULL,
    "nama_lengkap" TEXT NOT NULL,
    "peran_dasar" TEXT NOT NULL,
    "status_akun" TEXT NOT NULL DEFAULT 'AKTIF',
    "harus_ganti_password" BOOLEAN NOT NULL DEFAULT false,
    "terakhir_login_pada" DATETIME,
    "percobaan_login_gagal" INTEGER NOT NULL DEFAULT 0,
    "dikunci_sampai" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "pengguna_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sesi_pengguna" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pengguna_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "berlaku_sampai" DATETIME NOT NULL,
    "terakhir_aktif_pada" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dicabut" BOOLEAN NOT NULL DEFAULT false,
    "alasan_cabut" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "sesi_pengguna_pengguna_id_fkey" FOREIGN KEY ("pengguna_id") REFERENCES "pengguna" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "log_percobaan_login" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "sukses" BOOLEAN NOT NULL,
    "alasan_gagal" TEXT,
    "dibuat_pada" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "pengguna_username_key" ON "pengguna"("username");

-- CreateIndex
CREATE UNIQUE INDEX "pengguna_email_key" ON "pengguna"("email");

-- CreateIndex
CREATE INDEX "pengguna_sekolah_id_peran_dasar_idx" ON "pengguna"("sekolah_id", "peran_dasar");

-- CreateIndex
CREATE INDEX "pengguna_status_akun_idx" ON "pengguna"("status_akun");

-- CreateIndex
CREATE UNIQUE INDEX "sesi_pengguna_token_hash_key" ON "sesi_pengguna"("token_hash");

-- CreateIndex
CREATE INDEX "sesi_pengguna_pengguna_id_dicabut_berlaku_sampai_idx" ON "sesi_pengguna"("pengguna_id", "dicabut", "berlaku_sampai");

-- CreateIndex
CREATE INDEX "log_percobaan_login_identifier_dibuat_pada_idx" ON "log_percobaan_login"("identifier", "dibuat_pada");

-- CreateIndex
CREATE INDEX "log_percobaan_login_ip_address_dibuat_pada_idx" ON "log_percobaan_login"("ip_address", "dibuat_pada");
