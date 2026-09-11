-- CreateTable
CREATE TABLE pengumuman (
    id TEXT NOT NULL PRIMARY KEY,
    sekolah_id TEXT NOT NULL,
    penulis_id TEXT NOT NULL,
    judul TEXT NOT NULL,
    konten TEXT NOT NULL,
    kategori TEXT NOT NULL DEFAULT 'UMUM',
    status TEXT NOT NULL DEFAULT 'DRAFT',
    apakah_disematkan BOOLEAN NOT NULL DEFAULT false,
    lampiran_url TEXT,
    target_audiens TEXT NOT NULL DEFAULT 'SEMUA',
    target_rombel_id TEXT,
    dipublikasikan_pada DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL,
    CONSTRAINT pengumuman_sekolah_id_fkey FOREIGN KEY (sekolah_id) REFERENCES sekolah (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT pengumuman_penulis_id_fkey FOREIGN KEY (penulis_id) REFERENCES pengguna (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT pengumuman_target_rombel_id_fkey FOREIGN KEY (target_rombel_id) REFERENCES rombel (id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE sasaran_pengumuman (
    id TEXT NOT NULL PRIMARY KEY,
    pengumuman_id TEXT NOT NULL,
    tipe_sasaran TEXT NOT NULL,
    nilai_sasaran TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT sasaran_pengumuman_pengumuman_id_fkey FOREIGN KEY (pengumuman_id) REFERENCES pengumuman (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE notifikasi_pengguna (
    id TEXT NOT NULL PRIMARY KEY,
    sekolah_id TEXT NOT NULL,
    pengguna_id TEXT NOT NULL,
    judul TEXT NOT NULL,
    pesan TEXT NOT NULL,
    tipe TEXT NOT NULL,
    tautan_url TEXT,
    apakah_dibaca BOOLEAN NOT NULL DEFAULT false,
    dibaca_pada DATETIME,
    data_tambahan TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL,
    CONSTRAINT notifikasi_pengguna_sekolah_id_fkey FOREIGN KEY (sekolah_id) REFERENCES sekolah (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT notifikasi_pengguna_pengguna_id_fkey FOREIGN KEY (pengguna_id) REFERENCES pengguna (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE preferensi_notifikasi (
    id TEXT NOT NULL PRIMARY KEY,
    pengguna_id TEXT NOT NULL,
    in_app_aktif BOOLEAN NOT NULL DEFAULT true,
    whatsapp_aktif BOOLEAN NOT NULL DEFAULT true,
    email_aktif BOOLEAN NOT NULL DEFAULT false,
    notif_pengumuman BOOLEAN NOT NULL DEFAULT true,
    notif_tugas BOOLEAN NOT NULL DEFAULT true,
    notif_nilai BOOLEAN NOT NULL DEFAULT true,
    notif_presensi BOOLEAN NOT NULL DEFAULT true,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL,
    CONSTRAINT preferensi_notifikasi_pengguna_id_fkey FOREIGN KEY (pengguna_id) REFERENCES pengguna (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX pengumuman_sekolah_id_status_idx ON pengumuman(sekolah_id, status);

-- CreateIndex
CREATE INDEX pengumuman_sekolah_id_target_audiens_idx ON pengumuman(sekolah_id, target_audiens);

-- CreateIndex
CREATE INDEX pengumuman_penulis_id_idx ON pengumuman(penulis_id);

-- CreateIndex
CREATE INDEX pengumuman_target_rombel_id_idx ON pengumuman(target_rombel_id);

-- CreateIndex
CREATE INDEX sasaran_pengumuman_pengumuman_id_idx ON sasaran_pengumuman(pengumuman_id);

-- CreateIndex
CREATE INDEX sasaran_pengumuman_tipe_sasaran_nilai_sasaran_idx ON sasaran_pengumuman(tipe_sasaran, nilai_sasaran);

-- CreateIndex
CREATE INDEX notifikasi_pengguna_pengguna_id_apakah_dibaca_idx ON notifikasi_pengguna(pengguna_id, apakah_dibaca);

-- CreateIndex
CREATE INDEX notifikasi_pengguna_sekolah_id_created_at_idx ON notifikasi_pengguna(sekolah_id, created_at);

-- CreateIndex
CREATE UNIQUE INDEX preferensi_notifikasi_pengguna_id_key ON preferensi_notifikasi(pengguna_id);
