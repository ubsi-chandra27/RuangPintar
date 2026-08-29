import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { organizationUnitService } from "@/modules/school/application/organization-unit-service";
import { generateUlid } from "@/shared/lib/ulid";

describe("Organization Unit Service (M01) — Hierarchy & History Preservation", () => {
  let testSchoolId: string;
  let actorId: string;
  let auditContext: { aktor_id: string; aktor_role: string };

  beforeEach(async () => {
    testSchoolId = generateUlid();
    actorId = generateUlid();
    auditContext = {
      aktor_id: actorId,
      aktor_role: "SUPER_ADMIN",
    };

    await prisma.sekolah.create({
      data: {
        id: testSchoolId,
        nama: "SMA Negeri 1 Nusantara",
        jenjang: "SMA",
      },
    });

    await prisma.pengguna.create({
      data: {
        id: actorId,
        username: `staff_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        password_hash: "hashed_pass",
        nama_lengkap: "Staf Tata Usaha",
        peran_dasar: "SCHOOL_STAFF",
        sekolah_id: testSchoolId,
      },
    });
  });

  it("creates parent unit and sub-unit with proper hierarchy and audit logs", async () => {
    // 1. Create Parent Unit
    const parent = await organizationUnitService.createUnit(
      testSchoolId,
      { nama: "Bidang Kurikulum", kode: "KUR" },
      auditContext
    );

    expect(parent.id).toBeDefined();
    expect(parent.nama).toBe("Bidang Kurikulum");
    expect(parent.kode).toBe("KUR");
    expect(parent.induk_unit_id).toBeNull();

    // 2. Create Child Unit
    const child = await organizationUnitService.createUnit(
      testSchoolId,
      { nama: "Sub-Bagian Evaluasi Pembelajaran", kode: "KUR-EVAL", induk_unit_id: parent.id },
      auditContext
    );

    expect(child.induk_unit_id).toBe(parent.id);

    // 3. Verify units list
    const units = await organizationUnitService.getUnits(testSchoolId);
    expect(units.length).toBe(2);

    const parentInList = units.find((u) => u.id === parent.id);
    expect(parentInList?.sub_unit_count).toBe(1);

    // 4. Verify audit log
    const auditLogs = await prisma.logAudit.findMany({
      where: {
        sekolah_id: testSchoolId,
        tipe_sumber: "UNIT_ORGANISASI",
      },
    });
    expect(auditLogs.length).toBeGreaterThanOrEqual(2);
  });

  it("rejects duplicate unit name in the same school (Negative Test)", async () => {
    await organizationUnitService.createUnit(
      testSchoolId,
      { nama: "Tata Usaha", kode: "TU" },
      auditContext
    );

    await expect(
      organizationUnitService.createUnit(
        testSchoolId,
        { nama: "Tata Usaha", kode: "TU-2" },
        auditContext
      )
    ).rejects.toThrow("sudah terdaftar pada sekolah ini");
  });

  it("rejects self-parent circular reference on update (Negative Test)", async () => {
    const unit = await organizationUnitService.createUnit(
      testSchoolId,
      { nama: "Kesiswaan", kode: "KSW" },
      auditContext
    );

    await expect(
      organizationUnitService.updateUnit(
        unit.id,
        testSchoolId,
        { nama: "Kesiswaan", induk_unit_id: unit.id },
        auditContext
      )
    ).rejects.toThrow("tidak dapat menjadi induk dari dirinya sendiri");
  });

  it("enforces History-Preserving rule: blocks delete when sub-units exist (Negative Test)", async () => {
    const parent = await organizationUnitService.createUnit(
      testSchoolId,
      { nama: "Sarana & Prasarana", kode: "SARPRAS" },
      auditContext
    );

    await organizationUnitService.createUnit(
      testSchoolId,
      { nama: "Unit Laboratorium IPA", induk_unit_id: parent.id },
      auditContext
    );

    await expect(
      organizationUnitService.deleteUnit(parent.id, testSchoolId, auditContext)
    ).rejects.toThrow("tidak dapat dihapus karena masih memiliki 1 sub-unit");
  });

  it("enforces History-Preserving rule: blocks delete when referenced by positions (Negative Test)", async () => {
    const unit = await organizationUnitService.createUnit(
      testSchoolId,
      { nama: "Bimbingan Konseling", kode: "BK" },
      auditContext
    );

    // Create a position referencing this unit
    await prisma.jabatan.create({
      data: {
        id: generateUlid(),
        sekolah_id: testSchoolId,
        unit_id: unit.id,
        kode_jabatan: "KOORDINATOR_BK",
        nama_jabatan: "Koordinator Bimbingan Konseling",
      },
    });

    await expect(
      organizationUnitService.deleteUnit(unit.id, testSchoolId, auditContext)
    ).rejects.toThrow("tidak dapat dihapus karena dirujuk oleh 1 jabatan struktural");
  });

  it("deletes leaf unreferenced unit cleanly", async () => {
    const unit = await organizationUnitService.createUnit(
      testSchoolId,
      { nama: "Unit Humas & Kemitraan", kode: "HUMAS" },
      auditContext
    );

    await organizationUnitService.deleteUnit(unit.id, testSchoolId, auditContext);

    const units = await organizationUnitService.getUnits(testSchoolId);
    expect(units.find((u) => u.id === unit.id)).toBeUndefined();
  });
});
