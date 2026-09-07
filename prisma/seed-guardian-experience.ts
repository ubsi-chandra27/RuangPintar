import { PrismaClient } from "@prisma/client";
import { generateUlid } from "../src/shared/lib/ulid";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Guardian Experience (Phase 16)...");
  const school = await prisma.sekolah.findFirst();
  if (!school) {
    throw new Error("Sekolah tidak ditemukan!");
  }

  const passwordHash = await bcrypt.hash("Password123#", 10);

  // 1. Akun Pengguna Wali 1: wali_santoso (Ayah)
  let userSantoso = await prisma.pengguna.findUnique({
    where: { username: "wali_santoso" },
  });

  if (!userSantoso) {
    userSantoso = await prisma.pengguna.create({
      data: {
        id: generateUlid(),
        sekolah_id: school.id,
        username: "wali_santoso",
        email: "santoso.pratama@example.com",
        nama_lengkap: "Santoso Pratama, S.T.",
        peran_dasar: "GUARDIAN",
        status_akun: "AKTIF",
        password_hash: passwordHash,
      },
    });
    console.log("Created user: wali_santoso");
  }

  // 2. Akun Pengguna Wali 2: wali_nurhayati (Ibu)
  let userNurhayati = await prisma.pengguna.findUnique({
    where: { username: "wali_nurhayati" },
  });

  if (!userNurhayati) {
    userNurhayati = await prisma.pengguna.create({
      data: {
        id: generateUlid(),
        sekolah_id: school.id,
        username: "wali_nurhayati",
        email: "nurhayati@example.com",
        nama_lengkap: "Dra. Nurhayati",
        peran_dasar: "GUARDIAN",
        status_akun: "AKTIF",
        password_hash: passwordHash,
      },
    });
    console.log("Created user: wali_nurhayati");
  }

  // 3. Entity WaliMurid
  let waliSantoso = await prisma.waliMurid.findFirst({
    where: { pengguna_id: userSantoso.id },
  });
  if (!waliSantoso) {
    waliSantoso = await prisma.waliMurid.create({
      data: {
        id: generateUlid(),
        sekolah_id: school.id,
        pengguna_id: userSantoso.id,
        nama_lengkap: "Santoso Pratama, S.T.",
        jenis_kelamin: "L",
        no_telepon: "081234567890",
        email: "santoso.pratama@example.com",
        pekerjaan: "Wiraswasta / Konsultan IT",
        penghasilan: "Rp 15.000.000 - Rp 25.000.000",
        alamat: "Jl. Terusan Buah Batu No. 45, Bandung",
      },
    });
    console.log("Created WaliMurid: Santoso Pratama");
  }

  let waliNurhayati = await prisma.waliMurid.findFirst({
    where: { pengguna_id: userNurhayati.id },
  });
  if (!waliNurhayati) {
    waliNurhayati = await prisma.waliMurid.create({
      data: {
        id: generateUlid(),
        sekolah_id: school.id,
        pengguna_id: userNurhayati.id,
        nama_lengkap: "Dra. Nurhayati",
        jenis_kelamin: "P",
        no_telepon: "081298765432",
        email: "nurhayati@example.com",
        pekerjaan: "Aparatur Sipil Negara (ASN)",
        penghasilan: "Rp 7.500.000 - Rp 15.000.000",
        alamat: "Jl. Terusan Buah Batu No. 45, Bandung",
      },
    });
    console.log("Created WaliMurid: Dra. Nurhayati");
  }

  // 4. Cari Siswa 1: Rian Pratama (Siswa utama di X RPL)
  const student1 = await prisma.siswa.findFirst({
    where: {
      OR: [{ pengguna: { username: "siswa" } }, { nama_lengkap: { contains: "Rian Pratama" } }],
    },
  });

  if (!student1) {
    throw new Error("Siswa Rian Pratama tidak ditemukan!");
  }

  // 5. Cari Siswa 2 untuk Multi-Child: misal siswa lain di X DKV 1 atau X RPL
  let student2 = await prisma.siswa.findFirst({
    where: {
      id: { not: student1.id },
      sekolah_id: school.id,
    },
  });

  if (!student2) {
    student2 = await prisma.siswa.create({
      data: {
        id: generateUlid(),
        sekolah_id: school.id,
        nis: "20261099",
        nisn: "0088776655",
        nama_lengkap: "Nadia Pratama",
        jenis_kelamin: "P",
        nama_wali: "Santoso Pratama, S.T.",
        telepon_wali: "081234567890",
        status_akademik: "AKTIF",
      },
    });
  }

  console.log("Child 1: " + student1.nama_lengkap + " (" + student1.id + ")");
  console.log("Child 2: " + student2.nama_lengkap + " (" + student2.id + ")");

  // 6. Hubungan Wali Santoso -> Student 1 (Rian)
  let rel1 = await prisma.hubunganWaliSiswa.findUnique({
    where: {
      wali_id_siswa_id: {
        wali_id: waliSantoso.id,
        siswa_id: student1.id,
      },
    },
  });
  if (!rel1) {
    rel1 = await prisma.hubunganWaliSiswa.create({
      data: {
        id: generateUlid(),
        sekolah_id: school.id,
        wali_id: waliSantoso.id,
        siswa_id: student1.id,
        jenis_hubungan: "AYAH",
        status_verifikasi: "TERVERIFIKASI",
        apakah_wali_utama: true,
        catatan: "Ayah kandung - terverifikasi dokumen KK",
      },
    });
    console.log("Created relationship: Santoso -> Child 1 (VERIFIED)");
  }

  // 7. Hubungan Wali Santoso -> Student 2 (Nadia / Child 2)
  let rel2 = await prisma.hubunganWaliSiswa.findUnique({
    where: {
      wali_id_siswa_id: {
        wali_id: waliSantoso.id,
        siswa_id: student2.id,
      },
    },
  });
  if (!rel2) {
    rel2 = await prisma.hubunganWaliSiswa.create({
      data: {
        id: generateUlid(),
        sekolah_id: school.id,
        wali_id: waliSantoso.id,
        siswa_id: student2.id,
        jenis_hubungan: "AYAH",
        status_verifikasi: "TERVERIFIKASI",
        apakah_wali_utama: true,
        catatan: "Ayah kandung - terverifikasi dokumen KK",
      },
    });
    console.log("Created relationship: Santoso -> Child 2 (VERIFIED)");
  }

  // 8. Hubungan Ibu Nurhayati -> Student 1 (Rian)
  let rel3 = await prisma.hubunganWaliSiswa.findUnique({
    where: {
      wali_id_siswa_id: {
        wali_id: waliNurhayati.id,
        siswa_id: student1.id,
      },
    },
  });
  if (!rel3) {
    rel3 = await prisma.hubunganWaliSiswa.create({
      data: {
        id: generateUlid(),
        sekolah_id: school.id,
        wali_id: waliNurhayati.id,
        siswa_id: student1.id,
        jenis_hubungan: "IBU",
        status_verifikasi: "TERVERIFIKASI",
        apakah_wali_utama: false,
        catatan: "Ibu kandung - terverifikasi",
      },
    });
    console.log("Created relationship: Nurhayati -> Child 1 (VERIFIED)");
  }

  // 9. Data Pengajuan Wali
  const existingPengajuan = await prisma.pengajuanWali.findFirst({
    where: { wali_id: waliSantoso.id, siswa_id: student1.id },
  });

  if (!existingPengajuan) {
    await prisma.pengajuanWali.create({
      data: {
        id: generateUlid(),
        sekolah_id: school.id,
        wali_id: waliSantoso.id,
        siswa_id: student1.id,
        tipe: "SAKIT",
        judul: "Permohonan Izin Sakit - Rian Pratama",
        deskripsi:
          "Ananda Rian mengalami gejala demam tinggi dan disarankan dokter beristirahat selama 2 hari.",
        tanggal_mulai: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        tanggal_selesai: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        status: "DISETUJUI",
        catatan_tanggapan: "Permohonan izin disetujui oleh wali kelas. Semoga ananda lekas sembuh.",
        ditanggapi_pada: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.pengajuanWali.create({
      data: {
        id: generateUlid(),
        sekolah_id: school.id,
        wali_id: waliSantoso.id,
        siswa_id: student1.id,
        tipe: "IZIN_KETIDAKHADIRAN",
        judul: "Permohonan Dispensasi Mengikuti Lomba Robotika Pelajar",
        deskripsi:
          "Mohon izin ananda Rian Pratama mewakili klub robotika pada kejuaraan tingkat kota selama 1 hari kerja.",
        tanggal_mulai: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        tanggal_selesai: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: "MENUNGGU",
      },
    });

    console.log("Created 2 sample PengajuanWali records");
  }

  console.log("Phase 16 Guardian Experience Seeding Completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
