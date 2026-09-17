import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const schoolId = "01JA0000000000000000000001";
  console.log("================================================================================");
  console.log("PEMBERSIHAN DATA OPERASIONAL SMK OTOMINDO");
  console.log("================================================================================\n");

  const school = await prisma.sekolah.findUnique({ where: { id: schoolId } });
  if (!school) {
    console.log("Sekolah SMK OTOMINDO tidak ditemukan (mungkin sudah dibersihkan).");
    return;
  }

  console.log(`Ditemukan Sekolah: ${school.nama} (${school.id})`);
  console.log("Memulai proses pembersihan berurutan (cascade-safe)...\n");

  // 1. CBT & Ujian
  console.log("1. Menghapus data CBT & Ujian...");
  await prisma.eventIntegritasUjian.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.jawabanSiswa.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.hasilUjianCbt.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.sesiUjianSiswa.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.snapshotUjian.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.ujianCbt.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.versiSoal.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.bankSoal.deleteMany({ where: { sekolah_id: schoolId } });

  // 2. Monitoring & Pembinaan
  console.log("2. Menghapus Catatan Monitoring & Pembinaan Siswa...");
  await prisma.tindakLanjutMonitoring.deleteMany({});
  await prisma.catatanMonitoring.deleteMany({ where: { sekolah_id: schoolId } });

  // 3. Asesmen, Nilai & Pembelajaran
  console.log("3. Menghapus Nilai Asesmen, Tugas & Administrasi Pembelajaran...");
  await prisma.publikasiNilaiAsesmen.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.nilaiSiswa.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.definisiAsesmen.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.presensiSesiKelas.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.administrasiTujuanPembelajaran.deleteMany({});
  await prisma.administrasiPembelajaran.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.pengumpulanTugas.deleteMany({});
  await prisma.publikasiTugas.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.definisiTugas.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.publikasiMateri.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.materiPembelajaran.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.tujuanPembelajaran.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.lingkupMateri.deleteMany({ where: { sekolah_id: schoolId } });

  // 4. Jadwal & Sesi KBM
  console.log("4. Menghapus Sesi KBM Aktual & Jadwal Pelajaran...");
  await prisma.sesiKelasAktual.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.jadwalPelajaran.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.versiJadwal.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.slotWaktu.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.kalenderAkademik.deleteMany({ where: { sekolah_id: schoolId } });

  // 5. Penugasan & Hubungan Organisasi
  console.log("5. Menghapus Penugasan Guru, Wali Kelas & Jabatan...");
  await prisma.penugasanWaliKelas.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.penugasanMengajar.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.penugasanJabatan.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.jabatan.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.unitOrganisasi.deleteMany({ where: { sekolah_id: schoolId } });

  // 6. Wali Murid & Pengajuan Izin
  console.log("6. Menghapus Data Wali Murid & Pengajuan Izin...");
  await prisma.pengajuanWali.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.hubunganWaliSiswa.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.waliMurid.deleteMany({ where: { sekolah_id: schoolId } });

  // 7. Siswa, Rombel, Struktur Akademik
  console.log("7. Menghapus Data Siswa, Penempatan & Rombel...");
  await prisma.penempatanRombel.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.keikutsertaanSiswa.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.siswa.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.rombel.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.programKeahlian.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.tingkatKelas.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.fase.deleteMany({ where: { sekolah_id: schoolId } });

  // 8. Guru & Mata Pelajaran
  console.log("8. Menghapus Guru & Mata Pelajaran...");
  await prisma.mataPelajaran.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.guru.deleteMany({ where: { sekolah_id: schoolId } });

  // 9. Komunikasi, Notifikasi & Laporan
  console.log("9. Menghapus Riwayat Pengumuman, Notifikasi & Laporan...");
  await prisma.sasaranPengumuman.deleteMany({});
  await prisma.pengumuman.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.notifikasiPengguna.deleteMany({ where: { sekolah_id: schoolId } });
  await prisma.preferensiNotifikasi.deleteMany({});
  await prisma.riwayatEksporLaporan.deleteMany({ where: { sekolah_id: schoolId } });

  // 10. Pengguna (Hapus seluruh sesi dan akun demo selain 'superadmin')
  console.log("10. Membersihkan Akun Pengguna Demo...");
  const nonAdminUsers = await prisma.pengguna.findMany({
    where: {
      sekolah_id: schoolId,
      username: { not: "superadmin" },
    },
    select: { id: true },
  });
  const nonAdminIds = nonAdminUsers.map((u) => u.id);

  if (nonAdminIds.length > 0) {
    await prisma.sesiPengguna.deleteMany({ where: { pengguna_id: { in: nonAdminIds } } });
    await prisma.kemampuanStaff.deleteMany({ where: { pengguna_id: { in: nonAdminIds } } });
    await prisma.logPercobaanLogin.deleteMany({});
    const deletedUsers = await prisma.pengguna.deleteMany({
      where: { id: { in: nonAdminIds } },
    });
    console.log(`   ✓ ${deletedUsers.count} akun pengguna demo berhasil dihapus.`);
  }

  // 11. Perbarui Profil Sekolah menjadi Sekolah Utama Bersih
  console.log("11. Memperbarui Profil Sekolah Default...");
  await prisma.sekolah.update({
    where: { id: schoolId },
    data: {
      nama: "Sekolah Percontohan Ruang Pintar",
      npsn: null,
      jenjang: "SMA",
      alamat: "Jakarta",
      telepon: null,
      email: "admin@ruangpintar.id",
      logo_url: "/images/brand/logo.png",
      status_aktif: true,
    },
  });

  console.log("\n================================================================================");
  console.log("✓ PEMBERSIHAN SELESAI 100%!");
  console.log(
    "✓ Seluruh data guru, jadwal, siswa, rombel, dan akun SMK Otomindo telah dikosongkan."
  );
  console.log("✓ Akun 'superadmin' (Password123#) tetap aktif untuk login administratif.");
  console.log("✓ Database bersih dan siap untuk SaaS Onboarding & Phase 21.");
  console.log("================================================================================\n");
}

main()
  .catch((err) => {
    console.error("Gagal membersihkan data:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
