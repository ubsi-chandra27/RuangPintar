import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { positionAssignmentService } from "@/modules/school/application/position-assignment-service";
import { generateUlid } from "@/shared/lib/ulid";

describe("Position Assignment Service (M01) — Personil Validation & Lifecycle", () => {
  let testSchoolId: string;
  let actorId: string;
  let teacherId: string;
  let positionId: string;
  let auditContext: { aktor_id: string; aktor_role: string };

  beforeEach(async () => {
    testSchoolId = generateUlid();
    actorId = generateUlid();
    teacherId = generateUlid();
    positionId = generateUlid();
    auditContext = {
      aktor_id: actorId,
      aktor_role: "SUPER_ADMIN",
    };

    // 1. Setup School
    await prisma.sekolah.create({
      data: {
        id: testSchoolId,
        nama: "SMA Negeri 3 Unggulan",
        jenjang: "SMA",
      },
    });

    // 2. Setup Actor (Admin)
    await prisma.pengguna.create({
      data: {
        id: actorId,
        username: `admin_asg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        password_hash: "hashed_pass",
        nama_lengkap: "Admin Penugasan",
        peran_dasar: "SUPER_ADMIN",
        sekolah_id: testSchoolId,
      },
    });

    // 3. Setup Teacher (Active Personil)
    await prisma.pengguna.create({
      data: {
        id: teacherId,
        username: `guru_asg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        password_hash: "hashed_pass",
        nama_lengkap: "Drs. Budi Santoso, M.Pd.",
        peran_dasar: "TEACHER",
        status_akun: "AKTIF",
        sekolah_id: testSchoolId,
      },
    });

    // 4. Setup Position
    await prisma.jabatan.create({
      data: {
        id: positionId,
        sekolah_id: testSchoolId,
        kode_jabatan: "HEADMASTER",
        nama_jabatan: "Kepala Sekolah",
      },
    });
  });

  it("creates a valid position assignment for active personnel with audit log", async () => {
    const assignment = await positionAssignmentService.assignPosition(
      testSchoolId,
      {
        personil_id: teacherId,
        jabatan_id: positionId,
        berlaku_mulai: new Date("2026-07-01"),
        berlaku_sampai: new Date("2027-06-30"),
        catatan: "SK Kepala Dinas No. 800/12/2026",
      },
      auditContext
    );

    expect(assignment.id).toBeDefined();
    expect(assignment.personil_id).toBe(teacherId);
    expect(assignment.personil_nama).toBe("Drs. Budi Santoso, M.Pd.");
    expect(assignment.jabatan_kode).toBe("HEADMASTER");
    expect(assignment.status).toBe("AKTIF");

    // Verify audit log
    const audit = await prisma.logAudit.findFirst({
      where: {
        sekolah_id: testSchoolId,
        id_sumber: assignment.id,
        aksi: "POSITION_ASSIGNED",
      },
    });
    expect(audit).not.toBeNull();
    expect(audit?.aktor_id).toBe(actorId);
  });

  it("rejects invalid non-existent personil_id (Negative Test)", async () => {
    const nonExistentPersonilId = generateUlid();

    await expect(
      positionAssignmentService.assignPosition(
        testSchoolId,
        {
          personil_id: nonExistentPersonilId,
          jabatan_id: positionId,
          berlaku_mulai: new Date(),
        },
        auditContext
      )
    ).rejects.toThrow("tidak ditemukan atau tidak aktif di sekolah ini");
  });

  it("rejects personil belonging to another school context (Cross-School Safety) (Negative Test)", async () => {
    const otherSchoolId = generateUlid();
    const foreignTeacherId = generateUlid();

    await prisma.sekolah.create({
      data: { id: otherSchoolId, nama: "Sekolah Lain", jenjang: "SMA" },
    });
    await prisma.pengguna.create({
      data: {
        id: foreignTeacherId,
        username: `foreign_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        password_hash: "hashed_pass",
        nama_lengkap: "Guru Sekolah Luar",
        peran_dasar: "TEACHER",
        status_akun: "AKTIF",
        sekolah_id: otherSchoolId,
      },
    });

    await expect(
      positionAssignmentService.assignPosition(
        testSchoolId,
        {
          personil_id: foreignTeacherId,
          jabatan_id: positionId,
          berlaku_mulai: new Date(),
        },
        auditContext
      )
    ).rejects.toThrow("tidak ditemukan atau tidak aktif di sekolah ini");
  });

  it("rejects invalid date range where berlaku_sampai precedes berlaku_mulai (Negative Test)", async () => {
    await expect(
      positionAssignmentService.assignPosition(
        testSchoolId,
        {
          personil_id: teacherId,
          jabatan_id: positionId,
          berlaku_mulai: new Date("2026-08-01"),
          berlaku_sampai: new Date("2026-01-01"), // Earlier than start
        },
        auditContext
      )
    ).rejects.toThrow("tidak boleh lebih awal dari tanggal mulai");
  });

  it("completes official lifecycle: ends active assignment with status SELESAI", async () => {
    const created = await positionAssignmentService.assignPosition(
      testSchoolId,
      {
        personil_id: teacherId,
        jabatan_id: positionId,
        berlaku_mulai: new Date("2025-01-01"),
      },
      auditContext
    );

    const ended = await positionAssignmentService.endAssignment(
      created.id,
      testSchoolId,
      {
        berlaku_sampai: new Date("2026-06-30"),
        catatan: "Selesai masa bakti jabatan",
      },
      auditContext
    );

    expect(ended.status).toBe("SELESAI");
    expect(ended.catatan).toBe("Selesai masa bakti jabatan");
  });

  it("cancels assignment with status DIBATALKAN and required reason note", async () => {
    const created = await positionAssignmentService.assignPosition(
      testSchoolId,
      {
        personil_id: teacherId,
        jabatan_id: positionId,
        berlaku_mulai: new Date("2026-07-01"),
      },
      auditContext
    );

    const cancelled = await positionAssignmentService.cancelAssignment(
      created.id,
      testSchoolId,
      {
        catatan: "Penugasan dibatalkan karena revisi struktur yayasan",
      },
      auditContext
    );

    expect(cancelled.status).toBe("DIBATALKAN");
    expect(cancelled.catatan).toBe("Penugasan dibatalkan karena revisi struktur yayasan");
  });
});
