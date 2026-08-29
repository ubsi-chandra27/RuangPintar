-- CreateTable
CREATE TABLE "kemampuan_staff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pengguna_id" TEXT NOT NULL,
    "kode_kemampuan" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "kemampuan_staff_pengguna_id_fkey" FOREIGN KEY ("pengguna_id") REFERENCES "pengguna" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "kemampuan_staff_kode_kemampuan_idx" ON "kemampuan_staff"("kode_kemampuan");

-- CreateIndex
CREATE UNIQUE INDEX "kemampuan_staff_pengguna_id_kode_kemampuan_key" ON "kemampuan_staff"("pengguna_id", "kode_kemampuan");
