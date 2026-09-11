-- CreateTable
CREATE TABLE catatan_monitoring (
    id TEXT NOT NULL PRIMARY KEY,
    sekolah_id TEXT NOT NULL,
    rombel_id TEXT NOT NULL,
    siswa_id TEXT NOT NULL,
    penulis_id TEXT NOT NULL,
    judul TEXT NOT NULL,
    isi TEXT NOT NULL,
    kategori TEXT NOT NULL DEFAULT 'UMUM',
    tingkat_urgensi TEXT NOT NULL DEFAULT 'SEDANG',
    status TEXT NOT NULL DEFAULT 'AKTIF',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL,
    CONSTRAINT catatan_monitoring_sekolah_id_fkey FOREIGN KEY (sekolah_id) REFERENCES sekolah (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT catatan_monitoring_rombel_id_fkey FOREIGN KEY (rombel_id) REFERENCES rombel (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT catatan_monitoring_siswa_id_fkey FOREIGN KEY (siswa_id) REFERENCES siswa (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT catatan_monitoring_penulis_id_fkey FOREIGN KEY (penulis_id) REFERENCES pengguna (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE tindak_lanjut_monitoring (
    id TEXT NOT NULL PRIMARY KEY,
    catatan_id TEXT NOT NULL,
    penanggung_jawab_id TEXT,
    tindakan TEXT NOT NULL,
    target_tanggal DATETIME,
    status TEXT NOT NULL DEFAULT 'DIRENCANAKAN',
    hasil TEXT,
    tanggal_penyelesaian DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL,
    CONSTRAINT tindak_lanjut_monitoring_catatan_id_fkey FOREIGN KEY (catatan_id) REFERENCES catatan_monitoring (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT tindak_lanjut_monitoring_penanggung_jawab_id_fkey FOREIGN KEY (penanggung_jawab_id) REFERENCES pengguna (id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX catatan_monitoring_sekolah_id_rombel_id_idx ON catatan_monitoring(sekolah_id, rombel_id);

-- CreateIndex
CREATE INDEX catatan_monitoring_siswa_id_status_idx ON catatan_monitoring(siswa_id, status);

-- CreateIndex
CREATE INDEX catatan_monitoring_penulis_id_idx ON catatan_monitoring(penulis_id);

-- CreateIndex
CREATE INDEX tindak_lanjut_monitoring_catatan_id_status_idx ON tindak_lanjut_monitoring(catatan_id, status);
