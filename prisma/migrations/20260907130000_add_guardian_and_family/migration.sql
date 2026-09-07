-- CreateTable
CREATE TABLE wali_murid (
    id TEXT NOT NULL PRIMARY KEY,
    sekolah_id TEXT NOT NULL,
    pengguna_id TEXT,
    nama_lengkap TEXT NOT NULL,
    jenis_kelamin TEXT,
    no_telepon TEXT,
    email TEXT,
    pekerjaan TEXT,
    penghasilan TEXT,
    alamat TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL,
    CONSTRAINT wali_murid_sekolah_id_fkey FOREIGN KEY (sekolah_id) REFERENCES sekolah (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT wali_murid_pengguna_id_fkey FOREIGN KEY (pengguna_id) REFERENCES pengguna (id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE hubungan_wali_siswa (
    id TEXT NOT NULL PRIMARY KEY,
    sekolah_id TEXT NOT NULL,
    wali_id TEXT NOT NULL,
    siswa_id TEXT NOT NULL,
    jenis_hubungan TEXT NOT NULL,
    status_verifikasi TEXT NOT NULL DEFAULT 'TERVERIFIKASI',
    apakah_wali_utama BOOLEAN NOT NULL DEFAULT false,
    catatan TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL,
    CONSTRAINT hubungan_wali_siswa_sekolah_id_fkey FOREIGN KEY (sekolah_id) REFERENCES sekolah (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT hubungan_wali_siswa_wali_id_fkey FOREIGN KEY (wali_id) REFERENCES wali_murid (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT hubungan_wali_siswa_siswa_id_fkey FOREIGN KEY (siswa_id) REFERENCES siswa (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE pengajuan_wali (
    id TEXT NOT NULL PRIMARY KEY,
    sekolah_id TEXT NOT NULL,
    wali_id TEXT NOT NULL,
    siswa_id TEXT NOT NULL,
    tipe TEXT NOT NULL,
    judul TEXT NOT NULL,
    deskripsi TEXT NOT NULL,
    tanggal_mulai DATETIME,
    tanggal_selesai DATETIME,
    lampiran_url TEXT,
    status TEXT NOT NULL DEFAULT 'MENUNGGU',
    catatan_tanggapan TEXT,
    ditanggapi_oleh_id TEXT,
    ditanggapi_pada DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL,
    CONSTRAINT pengajuan_wali_sekolah_id_fkey FOREIGN KEY (sekolah_id) REFERENCES sekolah (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT pengajuan_wali_wali_id_fkey FOREIGN KEY (wali_id) REFERENCES wali_murid (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT pengajuan_wali_siswa_id_fkey FOREIGN KEY (siswa_id) REFERENCES siswa (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX wali_murid_pengguna_id_key ON wali_murid(pengguna_id);

-- CreateIndex
CREATE INDEX wali_murid_sekolah_id_idx ON wali_murid(sekolah_id);

-- CreateIndex
CREATE INDEX hubungan_wali_siswa_sekolah_id_status_verifikasi_idx ON hubungan_wali_siswa(sekolah_id, status_verifikasi);

-- CreateIndex
CREATE INDEX hubungan_wali_siswa_siswa_id_idx ON hubungan_wali_siswa(siswa_id);

-- CreateIndex
CREATE UNIQUE INDEX hubungan_wali_siswa_wali_id_siswa_id_key ON hubungan_wali_siswa(wali_id, siswa_id);

-- CreateIndex
CREATE INDEX pengajuan_wali_sekolah_id_status_idx ON pengajuan_wali(sekolah_id, status);

-- CreateIndex
CREATE INDEX pengajuan_wali_siswa_id_idx ON pengajuan_wali(siswa_id);
