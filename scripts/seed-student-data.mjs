import { PrismaClient } from "@prisma/client";
import { ulid } from "ulidx";

const prisma = new PrismaClient();

async function main() {
  await prisma.$queryRawUnsafe("PRAGMA busy_timeout = 10000;");
  console.log("Seeding student academic lifecycle data (Phase 08)...");

  // 1. Get or create school
  let school = await prisma.sekolah.findFirst();
  if (!school) {
    school = await prisma.sekolah.create({
      data: {
        id: ulid(),
        nama: "SMK Negeri 1 Jakarta",
        npsn: "20104567",
        jenjang: "SMK",
        alamat: "Jl. Budi Utomo No. 7, Sawah Besar, Jakarta Pusat",
        telepon: "(021) 3841234",
        email: "info@smkn1jakarta.sch.id",
        zona_waktu: "Asia/Jakarta",
        status_aktif: true,
      },
    });
  }
  const sekolahId = school.id;

  // 2. Ensure Academic Year & Grade Levels & Rombels exist
  let activeYear = await prisma.tahunAjaran.findFirst({
    where: { sekolah_id: sekolahId, status: "AKTIF" },
  });

  if (!activeYear) {
    activeYear = await prisma.tahunAjaran.create({
      data: {
        id: ulid(),
        sekolah_id: sekolahId,
        nama: "2026/2027",
        kode: "TA-2026-2027",
        tanggal_mulai: new Date("2026-07-01"),
        tanggal_selesai: new Date("2027-06-30"),
        status: "AKTIF",
      },
    });
  }

  // Previous year for history
  let prevYear = await prisma.tahunAjaran.findFirst({
    where: { sekolah_id: sekolahId, nama: "2025/2026" },
  });
  if (!prevYear) {
    prevYear = await prisma.tahunAjaran.create({
      data: {
        id: ulid(),
        sekolah_id: sekolahId,
        nama: "2025/2026",
        kode: "TA-2025-2026",
        tanggal_mulai: new Date("2025-07-01"),
        tanggal_selesai: new Date("2026-06-30"),
        status: "SELESAI",
      },
    });
  }

  // Grade 10
  let grade10 = await prisma.tingkatKelas.findFirst({
    where: { sekolah_id: sekolahId, kode: "10" },
  });
  if (!grade10) {
    grade10 = await prisma.tingkatKelas.create({
      data: {
        id: ulid(),
        sekolah_id: sekolahId,
        nama: "Kelas 10",
        kode: "10",
        urutan: 10,
      },
    });
  }

  // Grade 11
  let grade11 = await prisma.tingkatKelas.findFirst({
    where: { sekolah_id: sekolahId, kode: "11" },
  });
  if (!grade11) {
    grade11 = await prisma.tingkatKelas.create({
      data: {
        id: ulid(),
        sekolah_id: sekolahId,
        nama: "Kelas 11",
        kode: "11",
        urutan: 11,
      },
    });
  }

  // Rombel X RPL 1
  let rombel10 = await prisma.rombel.findFirst({
    where: { sekolah_id: sekolahId, tahun_ajaran_id: activeYear.id, nama: "X RPL 1" },
  });
  if (!rombel10) {
    rombel10 = await prisma.rombel.create({
      data: {
        id: ulid(),
        sekolah_id: sekolahId,
        tahun_ajaran_id: activeYear.id,
        tingkat_id: grade10.id,
        nama: "X RPL 1",
        kode: "RBL-X-RPL-1",
        kapasitas: 36,
        status: "AKTIF",
      },
    });
  }

  // Rombel XI RPL 1
  let rombel11 = await prisma.rombel.findFirst({
    where: { sekolah_id: sekolahId, tahun_ajaran_id: activeYear.id, nama: "XI RPL 1" },
  });
  if (!rombel11) {
    rombel11 = await prisma.rombel.create({
      data: {
        id: ulid(),
        sekolah_id: sekolahId,
        tahun_ajaran_id: activeYear.id,
        tingkat_id: grade11.id,
        nama: "XI RPL 1",
        kode: "RBL-XI-RPL-1",
        kapasitas: 36,
        status: "AKTIF",
      },
    });
  }

  // Past Rombel X RPL 1 (in 2025/2026)
  let pastRombel10 = await prisma.rombel.findFirst({
    where: { sekolah_id: sekolahId, tahun_ajaran_id: prevYear.id, nama: "X RPL 1" },
  });
  if (!pastRombel10) {
    pastRombel10 = await prisma.rombel.create({
      data: {
        id: ulid(),
        sekolah_id: sekolahId,
        tahun_ajaran_id: prevYear.id,
        tingkat_id: grade10.id,
        nama: "X RPL 1",
        kode: "RBL-X-RPL-1-2025",
        kapasitas: 36,
        status: "NONAKTIF",
      },
    });
  }

  // Sample Students
  const sampleStudents = [
    {
      nis: "20261001",
      nisn: "0081234501",
      nama_lengkap: "Ahmad Fauzi",
      jenis_kelamin: "L",
      tempat_lahir: "Jakarta",
      tanggal_lahir: new Date("2008-04-12"),
      agama: "ISLAM",
      nik: "3171011204080001",
      alamat: "Jl. Percetakan Negara No. 18, Jakarta Pusat",
      nama_wali: "Budi Fauzi",
      telepon_wali: "081287654301",
      email_wali: "budi.fauzi@gmail.com",
      status_akademik: "AKTIF",
      tingkat_id: grade10.id,
      rombel_id: rombel10.id,
      nomor_absen: 1,
    },
    {
      nis: "20261002",
      nisn: "0081234502",
      nama_lengkap: "Annisa Rahmawati",
      jenis_kelamin: "P",
      tempat_lahir: "Bandung",
      tanggal_lahir: new Date("2008-07-25"),
      agama: "ISLAM",
      nik: "3171012507080002",
      alamat: "Jl. Cempaka Putih Tengah No. 4, Jakarta Pusat",
      nama_wali: "Rahmat Hidayat",
      telepon_wali: "081287654302",
      email_wali: "rahmat.h@gmail.com",
      status_akademik: "AKTIF",
      tingkat_id: grade10.id,
      rombel_id: rombel10.id,
      nomor_absen: 2,
    },
    {
      nis: "20261003",
      nisn: "0081234503",
      nama_lengkap: "Bagas Pratama",
      jenis_kelamin: "L",
      tempat_lahir: "Surabaya",
      tanggal_lahir: new Date("2008-02-14"),
      agama: "ISLAM",
      nik: "3171011402080003",
      alamat: "Jl. Kramat Raya No. 33, Jakarta Pusat",
      nama_wali: "Pratama Sanjaya",
      telepon_wali: "081287654303",
      status_akademik: "AKTIF",
      tingkat_id: grade10.id,
      rombel_id: rombel10.id,
      nomor_absen: 3,
    },
    {
      nis: "20251010",
      nisn: "0071234510",
      nama_lengkap: "Dewi Lestari",
      jenis_kelamin: "P",
      tempat_lahir: "Yogyakarta",
      tanggal_lahir: new Date("2007-09-10"),
      agama: "KRISTEN",
      nik: "3171011009070010",
      alamat: "Jl. Salemba Tengah No. 50, Jakarta Pusat",
      nama_wali: "Lestari Wibowo",
      telepon_wali: "081287654310",
      status_akademik: "AKTIF",
      // Promoted student from previous year
      has_history: true,
      tingkat_id: grade11.id,
      rombel_id: rombel11.id,
      nomor_absen: 1,
    },
    {
      nis: "20261005",
      nisn: "0081234505",
      nama_lengkap: "Fajar Nugraha",
      jenis_kelamin: "L",
      tempat_lahir: "Semarang",
      tanggal_lahir: new Date("2008-11-03"),
      agama: "ISLAM",
      alamat: "Jl. Johar Baru No. 12, Jakarta Pusat",
      nama_wali: "Nugraha Kusuma",
      telepon_wali: "081287654305",
      status_akademik: "AKTIF",
      tingkat_id: grade10.id,
      // Unplaced student (ready for placement testing)
      rombel_id: null,
    },
    {
      nis: "20241099",
      nisn: "0061234599",
      nama_lengkap: "Gilang Ramadhan",
      jenis_kelamin: "L",
      tempat_lahir: "Jakarta",
      tanggal_lahir: new Date("2006-03-20"),
      agama: "ISLAM",
      nama_wali: "Ramadhan Hakim",
      status_akademik: "LULUS",
      tanggal_keluar: new Date("2026-06-20"),
      catatan: "Lulus Ujian Nasional & Sertifikasi Kompetensi Keahlian",
      tingkat_id: null,
      rombel_id: null,
    },
  ];

  for (const s of sampleStudents) {
    let student = await prisma.siswa.findUnique({
      where: {
        sekolah_id_nis: {
          sekolah_id: sekolahId,
          nis: s.nis,
        },
      },
    });

    if (!student) {
      student = await prisma.siswa.create({
        data: {
          id: ulid(),
          sekolah_id: sekolahId,
          nis: s.nis,
          nisn: s.nisn || null,
          nama_lengkap: s.nama_lengkap,
          jenis_kelamin: s.jenis_kelamin,
          tempat_lahir: s.tempat_lahir || null,
          tanggal_lahir: s.tanggal_lahir || null,
          agama: s.agama || null,
          nik: s.nik || null,
          alamat: s.alamat || null,
          nama_wali: s.nama_wali || null,
          telepon_wali: s.telepon_wali || null,
          email_wali: s.email_wali || null,
          status_akademik: s.status_akademik,
          tanggal_keluar: s.tanggal_keluar || null,
          catatan: s.catatan || null,
        },
      });
    }

    // If student has history (promoted student)
    if (s.has_history) {
      // 1. Past enrollment in 2025/2026
      let pastEnr = await prisma.keikutsertaanSiswa.findFirst({
        where: { siswa_id: student.id, tahun_ajaran_id: prevYear.id },
      });
      if (!pastEnr) {
        pastEnr = await prisma.keikutsertaanSiswa.create({
          data: {
            id: ulid(),
            sekolah_id: sekolahId,
            siswa_id: student.id,
            tahun_ajaran_id: prevYear.id,
            tingkat_id: grade10.id,
            status: "NAIK_KELAS",
            tanggal_mulai: new Date("2025-07-01"),
            tanggal_selesai: new Date("2026-06-30"),
            catatan: "Kenaikan kelas ke tingkat 11",
          },
        });

        await prisma.penempatanRombel.create({
          data: {
            id: ulid(),
            sekolah_id: sekolahId,
            keikutsertaan_id: pastEnr.id,
            rombel_id: pastRombel10.id,
            status: "SELESAI",
            nomor_absen: 5,
            tanggal_mulai: new Date("2025-07-01"),
            tanggal_selesai: new Date("2026-06-30"),
          },
        });
      }
    }

    // Active enrollment in 2026/2027
    if (s.status_akademik === "AKTIF" && s.tingkat_id) {
      let activeEnr = await prisma.keikutsertaanSiswa.findFirst({
        where: { siswa_id: student.id, tahun_ajaran_id: activeYear.id },
      });

      if (!activeEnr) {
        activeEnr = await prisma.keikutsertaanSiswa.create({
          data: {
            id: ulid(),
            sekolah_id: sekolahId,
            siswa_id: student.id,
            tahun_ajaran_id: activeYear.id,
            tingkat_id: s.tingkat_id,
            status: "AKTIF",
            tanggal_mulai: new Date("2026-07-01"),
          },
        });
      }

      // Active Placement
      if (s.rombel_id) {
        const activePlc = await prisma.penempatanRombel.findFirst({
          where: { keikutsertaan_id: activeEnr.id, status: "AKTIF" },
        });

        if (!activePlc) {
          await prisma.penempatanRombel.create({
            data: {
              id: ulid(),
              sekolah_id: sekolahId,
              keikutsertaan_id: activeEnr.id,
              rombel_id: s.rombel_id,
              nomor_absen: s.nomor_absen || null,
              status: "AKTIF",
              tanggal_mulai: new Date("2026-07-01"),
            },
          });
        }
      }
    }
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
