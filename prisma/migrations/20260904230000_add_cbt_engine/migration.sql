-- CreateTable
CREATE TABLE "bank_soal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "guru_id" TEXT NOT NULL,
    "mata_pelajaran_id" TEXT NOT NULL,
    "lingkup_materi_id" TEXT,
    "tujuan_pembelajaran_id" TEXT,
    "kode" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "tipe_soal" TEXT NOT NULL DEFAULT 'PILIHAN_GANDA',
    "tingkat_kesulitan" TEXT NOT NULL DEFAULT 'SEDANG',
    "versi_aktif" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'AKTIF',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "bank_soal_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bank_soal_guru_id_fkey" FOREIGN KEY ("guru_id") REFERENCES "guru" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bank_soal_mata_pelajaran_id_fkey" FOREIGN KEY ("mata_pelajaran_id") REFERENCES "mata_pelajaran" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bank_soal_lingkup_materi_id_fkey" FOREIGN KEY ("lingkup_materi_id") REFERENCES "lingkup_materi" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "bank_soal_tujuan_pembelajaran_id_fkey" FOREIGN KEY ("tujuan_pembelajaran_id") REFERENCES "tujuan_pembelajaran" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "versi_soal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "bank_soal_id" TEXT NOT NULL,
    "nomor_versi" INTEGER NOT NULL DEFAULT 1,
    "pertanyaan" TEXT NOT NULL,
    "opsi_jawaban" TEXT,
    "kunci_jawaban" TEXT,
    "pembahasan" TEXT,
    "bobot_default" REAL NOT NULL DEFAULT 1.0,
    "dibuat_oleh" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "versi_soal_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "versi_soal_bank_soal_id_fkey" FOREIGN KEY ("bank_soal_id") REFERENCES "bank_soal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ujian_cbt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "penugasan_mengajar_id" TEXT NOT NULL,
    "asesmen_id" TEXT,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "durasi_menit" INTEGER NOT NULL DEFAULT 60,
    "waktu_mulai" DATETIME,
    "waktu_selesai" DATETIME,
    "kkm_kktp" REAL NOT NULL DEFAULT 75.0,
    "acak_soal" BOOLEAN NOT NULL DEFAULT false,
    "acak_opsi" BOOLEAN NOT NULL DEFAULT false,
    "tampilkan_nilai" BOOLEAN NOT NULL DEFAULT false,
    "tampilkan_pembahasan" BOOLEAN NOT NULL DEFAULT false,
    "maksimal_attempt" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "blueprint" TEXT,
    "snapshot_aktif_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "ujian_cbt_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ujian_cbt_penugasan_mengajar_id_fkey" FOREIGN KEY ("penugasan_mengajar_id") REFERENCES "penugasan_mengajar" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ujian_cbt_asesmen_id_fkey" FOREIGN KEY ("asesmen_id") REFERENCES "definisi_asesmen" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "snapshot_ujian" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "ujian_cbt_id" TEXT NOT NULL,
    "nomor_snapshot" INTEGER NOT NULL DEFAULT 1,
    "total_soal" INTEGER NOT NULL,
    "total_bobot" REAL NOT NULL,
    "durasi_menit" INTEGER NOT NULL,
    "konfigurasi" TEXT NOT NULL,
    "manifest_soal" TEXT NOT NULL,
    "kunci_penilaian" TEXT NOT NULL,
    "dibekukan_oleh" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "snapshot_ujian_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "snapshot_ujian_ujian_cbt_id_fkey" FOREIGN KEY ("ujian_cbt_id") REFERENCES "ujian_cbt" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sesi_ujian_siswa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "ujian_cbt_id" TEXT NOT NULL,
    "snapshot_id" TEXT NOT NULL,
    "siswa_id" TEXT NOT NULL,
    "penempatan_rombel_id" TEXT,
    "attempt_ke" INTEGER NOT NULL DEFAULT 1,
    "waktu_mulai" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "batas_waktu_server" DATETIME NOT NULL,
    "waktu_selesai" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'SEDANG_MENGERJAKAN',
    "urutan_soal_peserta" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "sesi_ujian_siswa_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sesi_ujian_siswa_ujian_cbt_id_fkey" FOREIGN KEY ("ujian_cbt_id") REFERENCES "ujian_cbt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "sesi_ujian_siswa_snapshot_id_fkey" FOREIGN KEY ("snapshot_id") REFERENCES "snapshot_ujian" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sesi_ujian_siswa_siswa_id_fkey" FOREIGN KEY ("siswa_id") REFERENCES "siswa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sesi_ujian_siswa_penempatan_rombel_id_fkey" FOREIGN KEY ("penempatan_rombel_id") REFERENCES "penempatan_rombel" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "jawaban_siswa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "sesi_ujian_id" TEXT NOT NULL,
    "soal_id" TEXT NOT NULL,
    "versi_soal_id" TEXT NOT NULL,
    "jawaban_peserta" TEXT,
    "ragu_ragu" BOOLEAN NOT NULL DEFAULT false,
    "apakah_benar" BOOLEAN,
    "skor_diperoleh" REAL NOT NULL DEFAULT 0.0,
    "catatan_koreksi" TEXT,
    "waktu_simpan" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "jawaban_siswa_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "jawaban_siswa_sesi_ujian_id_fkey" FOREIGN KEY ("sesi_ujian_id") REFERENCES "sesi_ujian_siswa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "hasil_ujian_cbt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "sesi_ujian_id" TEXT NOT NULL,
    "ujian_cbt_id" TEXT NOT NULL,
    "siswa_id" TEXT NOT NULL,
    "total_soal" INTEGER NOT NULL,
    "total_dijawab" INTEGER NOT NULL,
    "jumlah_benar" INTEGER NOT NULL DEFAULT 0,
    "jumlah_salah" INTEGER NOT NULL DEFAULT 0,
    "jumlah_kosong" INTEGER NOT NULL DEFAULT 0,
    "skor_mentah" REAL NOT NULL DEFAULT 0.0,
    "skor_maksimal" REAL NOT NULL DEFAULT 100.0,
    "nilai_akhir" REAL NOT NULL DEFAULT 0.0,
    "apakah_tuntas" BOOLEAN NOT NULL DEFAULT false,
    "status_penilaian" TEXT NOT NULL DEFAULT 'LENGKAP',
    "status_transfer" TEXT NOT NULL DEFAULT 'BELUM_DITRANSFER',
    "ditransfer_ke_nilai_siswa_id" TEXT,
    "waktu_transfer" DATETIME,
    "ditransfer_oleh" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "hasil_ujian_cbt_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "hasil_ujian_cbt_sesi_ujian_id_fkey" FOREIGN KEY ("sesi_ujian_id") REFERENCES "sesi_ujian_siswa" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "hasil_ujian_cbt_ujian_cbt_id_fkey" FOREIGN KEY ("ujian_cbt_id") REFERENCES "ujian_cbt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "hasil_ujian_cbt_siswa_id_fkey" FOREIGN KEY ("siswa_id") REFERENCES "siswa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "event_integritas_ujian" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sekolah_id" TEXT NOT NULL,
    "sesi_ujian_id" TEXT NOT NULL,
    "jenis_event" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "payload" TEXT,
    "waktu_kejadian" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_integritas_ujian_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "event_integritas_ujian_sesi_ujian_id_fkey" FOREIGN KEY ("sesi_ujian_id") REFERENCES "sesi_ujian_siswa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "bank_soal_sekolah_id_mata_pelajaran_id_status_idx" ON "bank_soal"("sekolah_id", "mata_pelajaran_id", "status");

-- CreateIndex
CREATE INDEX "bank_soal_guru_id_idx" ON "bank_soal"("guru_id");

-- CreateIndex
CREATE INDEX "bank_soal_lingkup_materi_id_idx" ON "bank_soal"("lingkup_materi_id");

-- CreateIndex
CREATE INDEX "bank_soal_tujuan_pembelajaran_id_idx" ON "bank_soal"("tujuan_pembelajaran_id");

-- CreateIndex
CREATE UNIQUE INDEX "bank_soal_sekolah_id_kode_key" ON "bank_soal"("sekolah_id", "kode");

-- CreateIndex
CREATE INDEX "versi_soal_sekolah_id_idx" ON "versi_soal"("sekolah_id");

-- CreateIndex
CREATE UNIQUE INDEX "versi_soal_bank_soal_id_nomor_versi_key" ON "versi_soal"("bank_soal_id", "nomor_versi");

-- CreateIndex
CREATE INDEX "ujian_cbt_sekolah_id_penugasan_mengajar_id_status_idx" ON "ujian_cbt"("sekolah_id", "penugasan_mengajar_id", "status");

-- CreateIndex
CREATE INDEX "ujian_cbt_penugasan_mengajar_id_idx" ON "ujian_cbt"("penugasan_mengajar_id");

-- CreateIndex
CREATE INDEX "ujian_cbt_asesmen_id_idx" ON "ujian_cbt"("asesmen_id");

-- CreateIndex
CREATE INDEX "snapshot_ujian_sekolah_id_idx" ON "snapshot_ujian"("sekolah_id");

-- CreateIndex
CREATE UNIQUE INDEX "snapshot_ujian_ujian_cbt_id_nomor_snapshot_key" ON "snapshot_ujian"("ujian_cbt_id", "nomor_snapshot");

-- CreateIndex
CREATE INDEX "sesi_ujian_siswa_siswa_id_status_idx" ON "sesi_ujian_siswa"("siswa_id", "status");

-- CreateIndex
CREATE INDEX "sesi_ujian_siswa_ujian_cbt_id_status_idx" ON "sesi_ujian_siswa"("ujian_cbt_id", "status");

-- CreateIndex
CREATE INDEX "sesi_ujian_siswa_snapshot_id_idx" ON "sesi_ujian_siswa"("snapshot_id");

-- CreateIndex
CREATE INDEX "sesi_ujian_siswa_sekolah_id_status_idx" ON "sesi_ujian_siswa"("sekolah_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "sesi_ujian_siswa_ujian_cbt_id_siswa_id_attempt_ke_key" ON "sesi_ujian_siswa"("ujian_cbt_id", "siswa_id", "attempt_ke");

-- CreateIndex
CREATE INDEX "jawaban_siswa_sesi_ujian_id_idx" ON "jawaban_siswa"("sesi_ujian_id");

-- CreateIndex
CREATE INDEX "jawaban_siswa_soal_id_idx" ON "jawaban_siswa"("soal_id");

-- CreateIndex
CREATE UNIQUE INDEX "jawaban_siswa_sesi_ujian_id_soal_id_key" ON "jawaban_siswa"("sesi_ujian_id", "soal_id");

-- CreateIndex
CREATE UNIQUE INDEX "hasil_ujian_cbt_sesi_ujian_id_key" ON "hasil_ujian_cbt"("sesi_ujian_id");

-- CreateIndex
CREATE INDEX "hasil_ujian_cbt_ujian_cbt_id_siswa_id_idx" ON "hasil_ujian_cbt"("ujian_cbt_id", "siswa_id");

-- CreateIndex
CREATE INDEX "hasil_ujian_cbt_sekolah_id_status_transfer_idx" ON "hasil_ujian_cbt"("sekolah_id", "status_transfer");

-- CreateIndex
CREATE INDEX "event_integritas_ujian_sesi_ujian_id_waktu_kejadian_idx" ON "event_integritas_ujian"("sesi_ujian_id", "waktu_kejadian");

-- CreateIndex
CREATE INDEX "event_integritas_ujian_sekolah_id_idx" ON "event_integritas_ujian"("sekolah_id");

