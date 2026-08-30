import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { studentIdentityService } from "@/modules/student/application/student-identity-service";
import {
  DuplicateNisError,
  DuplicateNisnError,
  HistoryProtectedError,
  StudentNotFoundError,
} from "@/modules/student/domain/student-errors";
import { ulid } from "ulidx";

describe("M07 — Student Identity Service", () => {
  let sekolahId: string;
  const actorId = "USR_" + ulid();
  const actorRole = "SUPER_ADMIN";

  beforeEach(async () => {
    sekolahId = ulid();
    await prisma.sekolah.create({
      data: {
        id: sekolahId,
        nama: `SMK Nusantara ${sekolahId.substring(0, 6)}`,
        npsn: String(Math.floor(10000000 + Math.random() * 89999999)),
        jenjang: "SMK",
        zona_waktu: "Asia/Jakarta",
      },
    });
  });

  it("berhasil mendaftarkan siswa baru dengan data identitas lengkap", async () => {
    const student = await studentIdentityService.createStudent(
      sekolahId,
      {
        nis: "20261001",
        nisn: "0081234567",
        nama_lengkap: "Ahmad Fauzi",
        jenis_kelamin: "L",
        tempat_lahir: "Bandung",
        tanggal_lahir: "2008-05-15",
        agama: "ISLAM",
        nik: "3201011505080001",
        alamat: "Jl. Merdeka No. 45",
        nama_wali: "Budi Santoso",
        telepon_wali: "081234567890",
      },
      actorId,
      actorRole
    );

    expect(student.id).toBeDefined();
    expect(student.nis).toBe("20261001");
    expect(student.nama_lengkap).toBe("Ahmad Fauzi");
    expect(student.status_akademik).toBe("AKTIF");

    const fetched = await studentIdentityService.getStudentById(student.id, sekolahId);
    expect(fetched.nama_lengkap).toBe("Ahmad Fauzi");
  });

  it("menolak pembuatan siswa dengan NIS duplikat di sekolah yang sama", async () => {
    await studentIdentityService.createStudent(
      sekolahId,
      {
        nis: "20261002",
        nama_lengkap: "Siti Rahma",
        jenis_kelamin: "P",
      },
      actorId,
      actorRole
    );

    await expect(
      studentIdentityService.createStudent(
        sekolahId,
        {
          nis: "20261002",
          nama_lengkap: "Siti Rahmawati",
          jenis_kelamin: "P",
        },
        actorId,
        actorRole
      )
    ).rejects.toThrow(DuplicateNisError);
  });

  it("menolak pembuatan siswa dengan NISN duplikat", async () => {
    await studentIdentityService.createStudent(
      sekolahId,
      {
        nis: "20261003",
        nisn: "0089999999",
        nama_lengkap: "Dewi Lestari",
        jenis_kelamin: "P",
      },
      actorId,
      actorRole
    );

    await expect(
      studentIdentityService.createStudent(
        sekolahId,
        {
          nis: "20261004",
          nisn: "0089999999",
          nama_lengkap: "Dewi Sartika",
          jenis_kelamin: "P",
        },
        actorId,
        actorRole
      )
    ).rejects.toThrow(DuplicateNisnError);
  });

  it("berhasil memperbarui data profil siswa", async () => {
    const created = await studentIdentityService.createStudent(
      sekolahId,
      {
        nis: "20261005",
        nama_lengkap: "Rian Pratama",
        jenis_kelamin: "L",
      },
      actorId,
      actorRole
    );

    const updated = await studentIdentityService.updateStudent(
      created.id,
      sekolahId,
      {
        nama_lengkap: "Rian Pratama Kusuma",
        alamat: "Jl. Diponegoro No. 12",
        telepon_wali: "08987654321",
      },
      actorId,
      actorRole
    );

    expect(updated.nama_lengkap).toBe("Rian Pratama Kusuma");
    expect(updated.alamat).toBe("Jl. Diponegoro No. 12");
    expect(updated.telepon_wali).toBe("08987654321");
  });

  it("mencegah penghapusan siswa jika memiliki riwayat keikutsertaan akademik terdaftar (History Protection)", async () => {
    const yearId = ulid();
    await prisma.tahunAjaran.create({
      data: {
        id: yearId,
        sekolah_id: sekolahId,
        nama: "2026/2027",
        tanggal_mulai: new Date("2026-07-01"),
        tanggal_selesai: new Date("2027-06-30"),
        status: "AKTIF",
      },
    });

    const student = await studentIdentityService.createStudent(
      sekolahId,
      {
        nis: "20261006",
        nama_lengkap: "Bambang Pamungkas",
        jenis_kelamin: "L",
        initial_tahun_ajaran_id: yearId,
      },
      actorId,
      actorRole
    );

    await expect(
      studentIdentityService.deleteStudent(student.id, sekolahId, actorId, actorRole)
    ).rejects.toThrow(HistoryProtectedError);
  });
});
