import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { generateUlid } from "@/shared/lib/ulid";
import { TeacherProfileService } from "@/modules/teacher/application/teacher-profile-service";
import { HomeroomAssignmentService } from "@/modules/teacher/application/homeroom-assignment-service";
import {
  CrossSchoolBoundaryError,
  HomeroomAlreadyAssignedError,
} from "@/modules/teacher/domain/teacher-errors";

describe("HomeroomAssignmentService (M08)", () => {
  let sekolahId: string;
  let tahunAjaranId: string;
  let tingkatId: string;
  let rombelId: string;
  let guruId: string;

  beforeEach(async () => {
    sekolahId = generateUlid();
    await prisma.sekolah.create({
      data: {
        id: sekolahId,
        nama: `Test School Homeroom ${sekolahId.slice(-4)}`,
        jenjang: "SMK",
      },
    });

    tahunAjaranId = generateUlid();
    await prisma.tahunAjaran.create({
      data: {
        id: tahunAjaranId,
        sekolah_id: sekolahId,
        nama: "2026/2027",
        kode: "TA-2026",
        tanggal_mulai: new Date("2026-07-01"),
        tanggal_selesai: new Date("2027-06-30"),
        status: "AKTIF",
      },
    });

    tingkatId = generateUlid();
    await prisma.tingkatKelas.create({
      data: {
        id: tingkatId,
        sekolah_id: sekolahId,
        kode: "10",
        nama: "Kelas 10",
      },
    });

    rombelId = generateUlid();
    await prisma.rombel.create({
      data: {
        id: rombelId,
        sekolah_id: sekolahId,
        tahun_ajaran_id: tahunAjaranId,
        tingkat_id: tingkatId,
        nama: "X RPL 1",
        status: "AKTIF",
      },
    });

    const teacher = await TeacherProfileService.createTeacher({
      sekolah_id: sekolahId,
      nama_lengkap: "Budi Santoso",
      gelar_belakang: "M.Kom.",
      jenis_kelamin: "L",
      status_kepegawaian: "PNS",
    });
    guruId = teacher.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should assign homeroom teacher to a rombel successfully", async () => {
    const homeroom = await HomeroomAssignmentService.assignHomeroom({
      sekolah_id: sekolahId,
      guru_id: guruId,
      rombel_id: rombelId,
      tahun_ajaran_id: tahunAjaranId,
    });

    expect(homeroom.id).toBeDefined();
    expect(homeroom.guru_nama).toBe("Budi Santoso M.Kom.");
    expect(homeroom.rombel_nama).toBe("X RPL 1");
    expect(homeroom.status).toBe("AKTIF");
  });

  it("should reject assigning a second active homeroom teacher to the same rombel and year", async () => {
    await HomeroomAssignmentService.assignHomeroom({
      sekolah_id: sekolahId,
      guru_id: guruId,
      rombel_id: rombelId,
      tahun_ajaran_id: tahunAjaranId,
    });

    const teacher2 = await TeacherProfileService.createTeacher({
      sekolah_id: sekolahId,
      nama_lengkap: "Siti Rahmawati",
      jenis_kelamin: "P",
    });

    await expect(
      HomeroomAssignmentService.assignHomeroom({
        sekolah_id: sekolahId,
        guru_id: teacher2.id,
        rombel_id: rombelId,
        tahun_ajaran_id: tahunAjaranId,
      })
    ).rejects.toThrow(HomeroomAlreadyAssignedError);
  });

  it("should allow reassigning homeroom after previous assignment is closed", async () => {
    const firstAssignment = await HomeroomAssignmentService.assignHomeroom({
      sekolah_id: sekolahId,
      guru_id: guruId,
      rombel_id: rombelId,
      tahun_ajaran_id: tahunAjaranId,
    });

    // Close the first assignment
    await HomeroomAssignmentService.closeHomeroom(firstAssignment.id, sekolahId, "SELESAI");

    const teacher2 = await TeacherProfileService.createTeacher({
      sekolah_id: sekolahId,
      nama_lengkap: "Siti Rahmawati",
      jenis_kelamin: "P",
    });

    // Reassigning should now succeed
    const secondAssignment = await HomeroomAssignmentService.assignHomeroom({
      sekolah_id: sekolahId,
      guru_id: teacher2.id,
      rombel_id: rombelId,
      tahun_ajaran_id: tahunAjaranId,
    });

    expect(secondAssignment.id).toBeDefined();
    expect(secondAssignment.guru_nama).toBe("Siti Rahmawati");
    expect(secondAssignment.status).toBe("AKTIF");
  });
});
