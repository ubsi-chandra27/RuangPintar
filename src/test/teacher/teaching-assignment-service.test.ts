import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { generateUlid } from "@/shared/lib/ulid";
import { TeacherProfileService } from "@/modules/teacher/application/teacher-profile-service";
import { SubjectService } from "@/modules/teacher/application/subject-service";
import { TeachingAssignmentService } from "@/modules/teacher/application/teaching-assignment-service";
import {
  CrossSchoolBoundaryError,
  DuplicateTeachingAssignmentError,
} from "@/modules/teacher/domain/teacher-errors";

describe("TeachingAssignmentService (M08)", () => {
  let sekolahId: string;
  let tahunAjaranId: string;
  let tingkatId: string;
  let rombelId: string;
  let guruId: string;
  let mapelId: string;

  beforeEach(async () => {
    sekolahId = generateUlid();
    await prisma.sekolah.create({
      data: {
        id: sekolahId,
        nama: `Test School Teaching ${sekolahId.slice(-4)}`,
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
      nama_lengkap: "Budi Pendidik",
      jenis_kelamin: "L",
      status_kepegawaian: "PNS",
    });
    guruId = teacher.id;

    const subject = await SubjectService.createSubject({
      sekolah_id: sekolahId,
      kode: "PROG",
      nama: "Dasar Pemrograman",
      kelompok: "KEJURUAN",
    });
    mapelId = subject.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should create a teaching assignment and derive workload correctly", async () => {
    const assignment = await TeachingAssignmentService.createTeachingAssignment({
      sekolah_id: sekolahId,
      guru_id: guruId,
      mata_pelajaran_id: mapelId,
      tahun_ajaran_id: tahunAjaranId,
      rombel_id: rombelId,
      jumlah_jam_minggu: 4,
      status: "AKTIF",
    });

    expect(assignment.id).toBeDefined();
    expect(assignment.guru_nama).toBe("Budi Pendidik");
    expect(assignment.mata_pelajaran_nama).toBe("Dasar Pemrograman");
    expect(assignment.rombel_nama).toBe("X RPL 1");
    expect(assignment.jumlah_jam_minggu).toBe(4);

    // Derived workload check
    const workload = await TeachingAssignmentService.getTeacherWorkload(guruId, sekolahId);
    expect(workload.total_jam_minggu).toBe(4);
    expect(workload.total_rombel).toBe(1);
    expect(workload.total_mapel).toBe(1);
    expect(workload.penugasan_aktif).toHaveLength(1);
  });

  it("should reject duplicate active teaching assignment for same subject in same rombel", async () => {
    await TeachingAssignmentService.createTeachingAssignment({
      sekolah_id: sekolahId,
      guru_id: guruId,
      mata_pelajaran_id: mapelId,
      tahun_ajaran_id: tahunAjaranId,
      rombel_id: rombelId,
      jumlah_jam_minggu: 4,
      status: "AKTIF",
    });

    // Create a second teacher in the same school
    const teacher2 = await TeacherProfileService.createTeacher({
      sekolah_id: sekolahId,
      nama_lengkap: "Guru Kedua",
      jenis_kelamin: "P",
    });

    // Should reject assigning the same subject in the same rombel while first is still active
    await expect(
      TeachingAssignmentService.createTeachingAssignment({
        sekolah_id: sekolahId,
        guru_id: teacher2.id,
        mata_pelajaran_id: mapelId,
        tahun_ajaran_id: tahunAjaranId,
        rombel_id: rombelId,
        jumlah_jam_minggu: 2,
        status: "AKTIF",
      })
    ).rejects.toThrow(DuplicateTeachingAssignmentError);
  });

  it("should enforce school boundary when assigning resources from another school", async () => {
    const foreignSekolahId = generateUlid();
    await prisma.sekolah.create({
      data: {
        id: foreignSekolahId,
        nama: "Foreign School",
        jenjang: "SMA",
      },
    });

    const foreignTeacher = await TeacherProfileService.createTeacher({
      sekolah_id: foreignSekolahId,
      nama_lengkap: "Guru Luar",
      jenis_kelamin: "L",
    });

    await expect(
      TeachingAssignmentService.createTeachingAssignment({
        sekolah_id: sekolahId, // School A
        guru_id: foreignTeacher.id, // Teacher from School B
        mata_pelajaran_id: mapelId,
        tahun_ajaran_id: tahunAjaranId,
        rombel_id: rombelId,
        jumlah_jam_minggu: 3,
      })
    ).rejects.toThrow(CrossSchoolBoundaryError);
  });

  it("should close active teaching assignment without deleting history", async () => {
    const assignment = await TeachingAssignmentService.createTeachingAssignment({
      sekolah_id: sekolahId,
      guru_id: guruId,
      mata_pelajaran_id: mapelId,
      tahun_ajaran_id: tahunAjaranId,
      rombel_id: rombelId,
      jumlah_jam_minggu: 4,
      status: "AKTIF",
    });

    const closed = await TeachingAssignmentService.closeTeachingAssignment(
      assignment.id,
      sekolahId,
      "SELESAI"
    );
    expect(closed).toBe(true);

    const check = await TeachingAssignmentService.getTeachingAssignmentById(
      assignment.id,
      sekolahId
    );
    expect(check?.status).toBe("SELESAI");
    expect(check?.berlaku_sampai).toBeDefined();

    // Derived workload should now be 0 active JP
    const workload = await TeachingAssignmentService.getTeacherWorkload(guruId, sekolahId);
    expect(workload.total_jam_minggu).toBe(0);
    expect(workload.penugasan_aktif).toHaveLength(0);
  });
});
