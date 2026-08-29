import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma, configureSqlitePragmas } from "@/shared/infrastructure/database/prisma";
import { identityService } from "@/shared/infrastructure/auth/identity-service";
import { staffCapabilityService } from "@/shared/infrastructure/authorization/staff-capability-service";
import { generateUlid } from "@/shared/lib/ulid";

describe("Staff Capability Service (M02) — Database Persistence & Audit", () => {
  const schoolId = generateUlid();
  let staffUserId: string;
  let studentUserId: string;

  beforeAll(async () => {
    await configureSqlitePragmas(prisma);
    await prisma.sekolah.create({
      data: {
        id: schoolId,
        nama: "SMK Negeri 1 Authz Testing",
        jenjang: "SMK",
      },
    });

    const staff = await identityService.createAccount({
      sekolah_id: schoolId,
      username: `staff_${Date.now()}`,
      password: "PasswordStaff123",
      nama_lengkap: "Budi Santoso, S.Kom.",
      peran_dasar: "SCHOOL_STAFF",
      status_akun: "AKTIF",
    });
    staffUserId = staff.id;

    const student = await identityService.createAccount({
      sekolah_id: schoolId,
      username: `siswa_${Date.now()}`,
      password: "PasswordSiswa123",
      nama_lengkap: "Doni Pratama",
      peran_dasar: "STUDENT",
      status_akun: "AKTIF",
    });
    studentUserId = student.id;
  });

  afterAll(async () => {
    await prisma.kemampuanStaff.deleteMany({ where: { pengguna_id: staffUserId } });
    await prisma.logAudit.deleteMany({ where: { sekolah_id: schoolId } });
    await prisma.pengguna.deleteMany({ where: { sekolah_id: schoolId } });
    await prisma.sekolah.deleteMany({ where: { id: schoolId } });
    await prisma.$disconnect();
  });

  it("assigns ACADEMIC_OPERATOR capability to staff and persists in database with audit trail", async () => {
    await staffCapabilityService.assignCapability({
      staffId: staffUserId,
      bundle: "ACADEMIC_OPERATOR",
      actorId: "SYSTEM_BOOTSTRAP",
      ipAddress: "127.0.0.1",
    });

    const capabilities = await staffCapabilityService.getUserCapabilities(staffUserId);
    expect(capabilities).toContain("ACADEMIC_OPERATOR");

    // Verify Audit Log
    const auditLogs = await prisma.logAudit.findMany({
      where: {
        sekolah_id: schoolId,
        aksi: "AUTHZ_STAFF_CAPABILITY_ASSIGNED",
      },
    });
    expect(auditLogs.length).toBeGreaterThanOrEqual(1);
    expect(auditLogs[0].payload_sesudah).toContain("ACADEMIC_OPERATOR");
  });

  it("assigns additional capability SYSTEM_ADMIN additively", async () => {
    await staffCapabilityService.assignCapability({
      staffId: staffUserId,
      bundle: "SYSTEM_ADMIN",
      actorId: "SYSTEM_BOOTSTRAP",
    });

    const capabilities = await staffCapabilityService.getUserCapabilities(staffUserId);
    expect(capabilities).toContain("ACADEMIC_OPERATOR");
    expect(capabilities).toContain("SYSTEM_ADMIN");
    expect(capabilities.length).toBe(2);
  });

  it("revokes capability cleanly and records audit log", async () => {
    await staffCapabilityService.revokeCapability({
      staffId: staffUserId,
      bundle: "SYSTEM_ADMIN",
      actorId: "SYSTEM_BOOTSTRAP",
    });

    const capabilities = await staffCapabilityService.getUserCapabilities(staffUserId);
    expect(capabilities).not.toContain("SYSTEM_ADMIN");
    expect(capabilities).toContain("ACADEMIC_OPERATOR");

    const auditLogs = await prisma.logAudit.findMany({
      where: {
        sekolah_id: schoolId,
        aksi: "AUTHZ_STAFF_CAPABILITY_REVOKED",
      },
    });
    expect(auditLogs.length).toBeGreaterThanOrEqual(1);
  });

  it("rejects assigning capability bundle to non-staff user (Negative Test)", async () => {
    await expect(
      staffCapabilityService.assignCapability({
        staffId: studentUserId,
        bundle: "ACADEMIC_OPERATOR",
        actorId: "SYSTEM_BOOTSTRAP",
      })
    ).rejects.toThrow("hanya dapat ditugaskan kepada SCHOOL_STAFF");
  });
});
