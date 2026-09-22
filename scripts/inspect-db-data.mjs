import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [sekolah, guru, siswa, rombel, mapel, sesi, presensiHadir, presensiIzin, presensiAlpha] =
    await Promise.all([
      prisma.sekolah.findMany({ select: { id: true, nama: true, tipe_lisensi: true } }),
      prisma.pengguna.findMany({
        where: { peran_dasar: "TEACHER" },
        select: { id: true, nama_lengkap: true, email: true },
      }),
      prisma.siswa.count(),
      prisma.rombel.findMany({
        where: { status: "AKTIF" },
        take: 8,
        include: {
          penempatan_rombel: {
            select: {
              id: true,
              keikutsertaan: { select: { siswa: { select: { nama_lengkap: true } } } },
            },
          },
          penugasan_mengajar: {
            include: { mata_pelajaran: true, guru: { select: { nama_lengkap: true } } },
          },
        },
      }),
      prisma.mataPelajaran.findMany({ take: 6, select: { nama: true, kode: true } }),
      prisma.sesiKelasAktual.count(),
      prisma.presensiSesiKelas.count({ where: { status: "HADIR" } }),
      prisma.presensiSesiKelas.count({
        where: { status: { in: ["IZIN", "SAKIT", "DISPENSASI"] } },
      }),
      prisma.presensiSesiKelas.count({ where: { status: "ALPHA" } }),
    ]);

  console.log("=== REAL DATABASE STATS ===");
  console.log("Sekolah:", sekolah);
  console.log("Guru count:", guru.length, "Sample guru:", guru.slice(0, 3));
  console.log("Siswa total:", siswa);
  console.log("Rombel count:", rombel.length);
  rombel.forEach((r) => {
    const mapelList = r.penugasan_mengajar
      .map((j) => `${j.mata_pelajaran?.nama} (${j.guru?.nama_lengkap})`)
      .filter(Boolean);
    console.log(
      `- ${r.nama} (Tingkat ${r.tingkat_kelas}): ${r.penempatan_rombel.length} siswa, Mapel: ${[...new Set(mapelList)].join(", ")}`
    );
  });
  console.log("Presensi:", {
    Hadir: presensiHadir,
    Izin: presensiIzin,
    Alpha: presensiAlpha,
    TotalSesi: sesi,
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
