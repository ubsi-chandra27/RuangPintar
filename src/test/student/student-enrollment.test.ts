import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { studentIdentityService } from "@/modules/student/application/student-identity-service";
import { studentEnrollmentService } from "@/modules/student/application/student-enrollment-service";
import {
  DuplicateEnrollmentError,
  EnrollmentNotFoundError,
  StudentNotFoundError,
} from "@/modules/student/domain/student-errors";
import { ulid } from "ulidx";

describe("M07 — Student Enrollment Service", () => {
  let sekolahId: string;
  let yearId1: string;
  let yearId2: string;
  let gradeId: string;
  let studentId: string;
  const actorId = "USR_" + ulid();
  const actorRole = "SUPER_ADMIN";

  beforeEach(async () => {
    sekolahId = ulid();
    await prisma.sekolah.create({
      data: {
        id: sekolahId,
        nama: `SMK Karya ${sekolahId.substring(0, 6)}`,
        npsn: String(Math.floor(10000000 + Math.random() * 89999999)),
        jenjang: "SMK",
        zona_waktu: "Asia/Jakarta",
      },
    });

    yearId1 = ulid();
    await prisma.tahunAjaran.create({
      data: {
        id: yearId1,
        sekolah_id: sekolahId,
        nama: "2025/2026",
        tanggal_mulai: new Date("2025-07-01"),
        tanggal_selesai: new Date("2026-06-30"),
        status: "SELESAI",
      },
    });

    yearId2 = ulid();
    await prisma.tahunAjaran.create({
      data: {
        id: yearId2,
        sekolah_id: sekolahId,
        nama: "2026/2027",
        tanggal_mulai: new Date("2026-07-01"),
        tanggal_selesai: new Date("2027-06-30"),
        status: "AKTIF",
      },
    });

    gradeId = ulid();
    await prisma.tingkatKelas.create({
      data: {
        id: gradeId,
        sekolah_id: sekolahId,
        nama: "Kelas 10",
        kode: "10",
        urutan: 10,
      },
    });

    const student = await studentIdentityService.createStudent(
      sekolahId,
      {
        nis: "20262001",
        nama_lengkap: "Nadia Safitri",
        jenis_kelamin: "P",
      },
      actorId,
      actorRole
    );
    studentId = student.id;
  });

  it("berhasil mendaftarkan keikutsertaan siswa pada periode akademik", async () => {
    const enrollment = await studentEnrollmentService.createEnrollment(
      sekolahId,
      {
        siswa_id: studentId,
        tahun_ajaran_id: yearId2,
        tingkat_id: gradeId,
        status: "AKTIF",
      },
      actorId,
      actorRole
    );

    expect(enrollment.id).toBeDefined();
    expect(enrollment.siswa_id).toBe(studentId);
    expect(enrollment.tahun_ajaran_id).toBe(yearId2);
    expect(enrollment.status).toBe("AKTIF");
  });

  it("menolak keikutsertaan ganda pada tahun ajaran yang sama untuk siswa yang sama", async () => {
    await studentEnrollmentService.createEnrollment(
      sekolahId,
      {
        siswa_id: studentId,
        tahun_ajaran_id: yearId2,
        tingkat_id: gradeId,
        status: "AKTIF",
      },
      actorId,
      actorRole
    );

    await expect(
      studentEnrollmentService.createEnrollment(
        sekolahId,
        {
          siswa_id: studentId,
          tahun_ajaran_id: yearId2,
          tingkat_id: gradeId,
          status: "AKTIF",
        },
        actorId,
        actorRole
      )
    ).rejects.toThrow(DuplicateEnrollmentError);
  });

  it("memungkinkan siswa memiliki keikutsertaan berbeda pada tahun ajaran yang berurutan (Multi-period History)", async () => {
    const enr1 = await studentEnrollmentService.createEnrollment(
      sekolahId,
      {
        siswa_id: studentId,
        tahun_ajaran_id: yearId1,
        tingkat_id: gradeId,
        status: "NAIK_KELAS",
      },
      actorId,
      actorRole
    );

    const enr2 = await studentEnrollmentService.createEnrollment(
      sekolahId,
      {
        siswa_id: studentId,
        tahun_ajaran_id: yearId2,
        tingkat_id: gradeId,
        status: "AKTIF",
      },
      actorId,
      actorRole
    );

    expect(enr1.id).not.toBe(enr2.id);
    const history = await studentEnrollmentService.getEnrollments(sekolahId, {
      search: "Nadia",
    });
    expect(history.total).toBe(2);
  });
});
