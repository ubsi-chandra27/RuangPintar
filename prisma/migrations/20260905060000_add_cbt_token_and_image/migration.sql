-- AlterTable versi_soal
ALTER TABLE "versi_soal" ADD COLUMN "gambar_url" TEXT;

-- AlterTable ujian_cbt
ALTER TABLE "ujian_cbt" ADD COLUMN "gunakan_token" BOOLEAN NOT NULL DEFAULT 0;
ALTER TABLE "ujian_cbt" ADD COLUMN "token_masuk" TEXT;
