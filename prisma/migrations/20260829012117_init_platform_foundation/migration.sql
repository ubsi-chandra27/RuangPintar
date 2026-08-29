-- CreateTable
CREATE TABLE "sekolah" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "npsn" TEXT,
    "jenjang" TEXT NOT NULL,
    "alamat" TEXT,
    "telepon" TEXT,
    "email" TEXT,
    "zona_waktu" TEXT NOT NULL DEFAULT 'Asia/Jakarta',
    "logo_url" TEXT,
    "status_aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "unit_organisasi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kode" TEXT,
    "induk_unit_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "unit_organisasi_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "unit_organisasi_induk_unit_id_fkey" FOREIGN KEY ("induk_unit_id") REFERENCES "unit_organisasi" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "jabatan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "unit_id" TEXT,
    "kode_jabatan" TEXT NOT NULL,
    "nama_jabatan" TEXT NOT NULL,
    "tingkat_akses" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "jabatan_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "jabatan_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "unit_organisasi" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "penugasan_jabatan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "jabatan_id" TEXT NOT NULL,
    "personil_id" TEXT NOT NULL,
    "berlaku_mulai" DATETIME NOT NULL,
    "berlaku_sampai" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'AKTIF',
    "catatan" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "penugasan_jabatan_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "penugasan_jabatan_jabatan_id_fkey" FOREIGN KEY ("jabatan_id") REFERENCES "jabatan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "konfigurasi_sistem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT,
    "kunci" TEXT NOT NULL,
    "nilai" TEXT NOT NULL,
    "kategori" TEXT NOT NULL DEFAULT 'UMUM',
    "deskripsi" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "konfigurasi_sistem_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "metadata_berkas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT,
    "nama_file_asli" TEXT NOT NULL,
    "storage_provider" TEXT NOT NULL DEFAULT 'LOCAL',
    "storage_key" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "ukuran_byte" INTEGER NOT NULL,
    "checksum" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AKTIF',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "metadata_berkas_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "log_audit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT,
    "aktor_id" TEXT NOT NULL,
    "aktor_role" TEXT NOT NULL,
    "aksi" TEXT NOT NULL,
    "tipe_sumber" TEXT NOT NULL,
    "id_sumber" TEXT NOT NULL,
    "payload_sebelum" TEXT,
    "payload_sesudah" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "dibuat_pada" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "log_audit_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "outbox_pesan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipe_event" TEXT NOT NULL,
    "tipe_agregat" TEXT NOT NULL,
    "id_agregat" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "jumlah_percobaan" INTEGER NOT NULL DEFAULT 0,
    "maks_percobaan" INTEGER NOT NULL DEFAULT 5,
    "percobaan_berikutnya_pada" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diproses_pada" DATETIME,
    "pesan_error" TEXT,
    "dibuat_pada" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "sekolah_npsn_key" ON "sekolah"("npsn");

-- CreateIndex
CREATE UNIQUE INDEX "unit_organisasi_sekolah_id_nama_key" ON "unit_organisasi"("sekolah_id", "nama");

-- CreateIndex
CREATE UNIQUE INDEX "jabatan_sekolah_id_kode_jabatan_key" ON "jabatan"("sekolah_id", "kode_jabatan");

-- CreateIndex
CREATE INDEX "penugasan_jabatan_personil_id_status_idx" ON "penugasan_jabatan"("personil_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "konfigurasi_sistem_sekolah_id_kunci_key" ON "konfigurasi_sistem"("sekolah_id", "kunci");

-- CreateIndex
CREATE UNIQUE INDEX "konfigurasi_sistem_global_kunci_key" ON "konfigurasi_sistem"("kunci") WHERE "sekolah_id" IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "metadata_berkas_storage_key_key" ON "metadata_berkas"("storage_key");

-- CreateIndex
CREATE INDEX "metadata_berkas_storage_provider_status_idx" ON "metadata_berkas"("storage_provider", "status");

-- CreateIndex
CREATE INDEX "log_audit_sekolah_id_dibuat_pada_idx" ON "log_audit"("sekolah_id", "dibuat_pada");

-- CreateIndex
CREATE INDEX "log_audit_aktor_id_dibuat_pada_idx" ON "log_audit"("aktor_id", "dibuat_pada");

-- CreateIndex
CREATE INDEX "log_audit_tipe_sumber_id_sumber_idx" ON "log_audit"("tipe_sumber", "id_sumber");

-- CreateIndex
CREATE INDEX "outbox_pesan_status_percobaan_berikutnya_pada_idx" ON "outbox_pesan"("status", "percobaan_berikutnya_pada");
