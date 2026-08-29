import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { schoolProfileService } from "@/modules/school/application/school-profile-service";
import { generateUlid } from "@/shared/lib/ulid";

describe("School Profile Service (M01) — School Identity Lifecycle", () => {
  let testSchoolId: string;
  let actorId: string;
  let baseNpsn: string;

  beforeEach(async () => {
    testSchoolId = generateUlid();
    actorId = generateUlid();
    // Random 8-digit NPSN to avoid collision across tests
    baseNpsn = String(Math.floor(10000000 + Math.random() * 90000000));

    // Setup test school
    await prisma.sekolah.create({
      data: {
        id: testSchoolId,
        nama: "SMA Negeri 1 Nusantara",
        npsn: baseNpsn,
        jenjang: "SMA",
        alamat: "Jl. Pendidikan No. 45",
        telepon: "021-5551234",
        email: "info@sman1nusantara.sch.id",
        zona_waktu: "Asia/Jakarta",
        logo_url: "/images/brand/logo.png",
        status_aktif: true,
      },
    });

    // Setup actor user
    await prisma.pengguna.create({
      data: {
        id: actorId,
        username: `admin_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        password_hash: "hashed_pass",
        nama_lengkap: "Administrator Sekolah",
        peran_dasar: "SUPER_ADMIN",
        sekolah_id: testSchoolId,
      },
    });
  });

  it("retrieves school profile correctly", async () => {
    const profile = await schoolProfileService.getProfile(testSchoolId);

    expect(profile.id).toBe(testSchoolId);
    expect(profile.nama).toBe("SMA Negeri 1 Nusantara");
    expect(profile.npsn).toBe(baseNpsn);
    expect(profile.jenjang).toBe("SMA");
    expect(profile.zona_waktu).toBe("Asia/Jakarta");
  });

  it("updates school profile with all generic jenjang options and records audit log", async () => {
    const auditContext = {
      aktor_id: actorId,
      aktor_role: "SUPER_ADMIN",
      ip_address: "127.0.0.1",
      user_agent: "Vitest-Runner",
    };

    // 1. Update to SMK
    const updatedSmk = await schoolProfileService.updateProfile(
      testSchoolId,
      {
        nama: "SMK Negeri 1 Nusantara",
        npsn: baseNpsn,
        jenjang: "SMK",
        alamat: "Jl. Kejuruan No. 10",
        telepon: "021-5559999",
        email: "admin@smkn1nusantara.sch.id",
        zona_waktu: "Asia/Makassar",
        logo_url: "/brand/smk-logo.png",
      },
      auditContext
    );

    expect(updatedSmk.nama).toBe("SMK Negeri 1 Nusantara");
    expect(updatedSmk.jenjang).toBe("SMK");
    expect(updatedSmk.zona_waktu).toBe("Asia/Makassar");

    // 2. Verify Audit Log entry
    const auditLogs = await prisma.logAudit.findMany({
      where: {
        sekolah_id: testSchoolId,
        id_sumber: testSchoolId,
        aksi: "SCHOOL_PROFILE_UPDATED",
      },
    });

    expect(auditLogs.length).toBeGreaterThanOrEqual(1);
    const lastLog = auditLogs[auditLogs.length - 1];
    expect(lastLog.aktor_id).toBe(actorId);
    expect(lastLog.tipe_sumber).toBe("SEKOLAH");
    expect(lastLog.payload_sesudah).toContain("SMK Negeri 1 Nusantara");
  });

  it("rejects invalid NPSN format (Negative Test)", async () => {
    const auditContext = {
      aktor_id: actorId,
      aktor_role: "SUPER_ADMIN",
    };

    await expect(
      schoolProfileService.updateProfile(
        testSchoolId,
        {
          nama: "SMA Negeri 1 Nusantara",
          npsn: "12345", // Invalid: must be 8 digits
          jenjang: "SMA",
        },
        auditContext
      )
    ).rejects.toThrow("NPSN harus terdiri dari 8 digit angka.");
  });

  it("rejects dangerous javascript: protocol in logo URL (Negative Test)", async () => {
    const auditContext = {
      aktor_id: actorId,
      aktor_role: "SUPER_ADMIN",
    };

    await expect(
      schoolProfileService.updateProfile(
        testSchoolId,
        {
          nama: "SMA Negeri 1 Nusantara",
          jenjang: "SMA",
          logo_url: "javascript:alert('XSS')",
        },
        auditContext
      )
    ).rejects.toThrow("Format URL logo tidak diizinkan atau mengandung protokol berbahaya.");
  });

  it("rejects duplicate NPSN when claimed by another school (Negative Test)", async () => {
    const otherSchoolId = generateUlid();
    const otherNpsn = String(Math.floor(10000000 + Math.random() * 90000000));
    await prisma.sekolah.create({
      data: {
        id: otherSchoolId,
        nama: "SMA Swasta Lain",
        npsn: otherNpsn,
        jenjang: "SMA",
      },
    });

    const auditContext = {
      aktor_id: actorId,
      aktor_role: "SUPER_ADMIN",
    };

    await expect(
      schoolProfileService.updateProfile(
        testSchoolId,
        {
          nama: "SMA Negeri 1 Nusantara",
          npsn: otherNpsn, // Already used by otherSchoolId
          jenjang: "SMA",
        },
        auditContext
      )
    ).rejects.toThrow("sudah digunakan oleh instansi sekolah lain");
  });
});
