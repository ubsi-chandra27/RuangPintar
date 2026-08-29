import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { positionService } from "@/modules/school/application/position-service";
import { generateUlid } from "@/shared/lib/ulid";

describe("Master Position Service (M01) — Position Code & History Preservation", () => {
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
        nama: "SMK Negeri 2 Teknologi",
        jenjang: "SMK",
      },
    });

    await prisma.pengguna.create({
      data: {
        id: actorId,
        username: `admin_pos_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        password_hash: "hashed_pass",
        nama_lengkap: "Admin Struktur",
        peran_dasar: "SUPER_ADMIN",
        sekolah_id: testSchoolId,
      },
    });
  });

  it("creates canonical and custom positions with uppercase semantic identifiers", async () => {
    // 1. Canonical Headmaster
    const headmaster = await positionService.createPosition(
      testSchoolId,
      {
        kode_jabatan: "HEADMASTER",
        nama_jabatan: "Kepala Sekolah",
        tingkat_akses: "SCHOOL_WIDE",
      },
      auditContext
    );

    expect(headmaster.is_canonical).toBe(true);
    expect(headmaster.kode_jabatan).toBe("HEADMASTER");

    // 2. Custom Semantic Position: KAPROGLI_RPL
    const kaprogli = await positionService.createPosition(
      testSchoolId,
      {
        kode_jabatan: "KAPROGLI_RPL",
        nama_jabatan: "Kepala Program Rekayasa Perangkat Lunak",
        tingkat_akses: "PROGRAM_WIDE",
      },
      auditContext
    );

    expect(kaprogli.is_canonical).toBe(false);
    expect(kaprogli.kode_jabatan).toBe("KAPROGLI_RPL");
    expect(kaprogli.tingkat_akses).toBe("PROGRAM_WIDE");

    // 3. Custom Semantic Position: WAKASEK_HUMAS
    const wakasek = await positionService.createPosition(
      testSchoolId,
      {
        kode_jabatan: "WAKASEK_HUMAS",
        nama_jabatan: "Wakil Kepala Sekolah Bidang Hubungan Masyarakat",
        tingkat_akses: "SCHOOL_WIDE",
      },
      auditContext
    );

    expect(wakasek.kode_jabatan).toBe("WAKASEK_HUMAS");

    const list = await positionService.getPositions(testSchoolId);
    expect(list.length).toBe(3);
  });

  it("rejects duplicate position code in the same school (Negative Test)", async () => {
    await positionService.createPosition(
      testSchoolId,
      {
        kode_jabatan: "VICE_PRINCIPAL_CURRICULUM",
        nama_jabatan: "Wakil Kepala Sekolah Kurikulum",
      },
      auditContext
    );

    await expect(
      positionService.createPosition(
        testSchoolId,
        {
          kode_jabatan: "VICE_PRINCIPAL_CURRICULUM",
          nama_jabatan: "Waka Kurikulum Cadangan",
        },
        auditContext
      )
    ).rejects.toThrow("sudah terdaftar pada sekolah ini");
  });

  it("rejects invalid non-snake_case position code format (Negative Test)", async () => {
    await expect(
      positionService.createPosition(
        testSchoolId,
        {
          kode_jabatan: "wakasek sarpras", // Invalid: lowercase & space
          nama_jabatan: "Wakasek Sarpras",
        },
        auditContext
      )
    ).rejects.toThrow("Kode jabatan harus berupa huruf kapital, angka, dan garis bawah");
  });

  it("enforces History-Preserving rule: blocks delete when assignment history exists (Negative Test)", async () => {
    const position = await positionService.createPosition(
      testSchoolId,
      {
        kode_jabatan: "HEADMASTER",
        nama_jabatan: "Kepala Sekolah",
      },
      auditContext
    );

    // Create a historical assignment record for this position
    await prisma.penugasanJabatan.create({
      data: {
        id: generateUlid(),
        sekolah_id: testSchoolId,
        jabatan_id: position.id,
        personil_id: actorId,
        berlaku_mulai: new Date("2025-01-01"),
        status: "SELESAI",
      },
    });

    await expect(
      positionService.deletePosition(position.id, testSchoolId, auditContext)
    ).rejects.toThrow("memiliki 1 rekam penugasan personil historis/aktif");
  });

  it("deletes unassigned position cleanly", async () => {
    const position = await positionService.createPosition(
      testSchoolId,
      {
        kode_jabatan: "KOORDINATOR_ADYW",
        nama_jabatan: "Koordinator Adiwiyata",
      },
      auditContext
    );

    await positionService.deletePosition(position.id, testSchoolId, auditContext);

    const list = await positionService.getPositions(testSchoolId);
    expect(list.find((p) => p.id === position.id)).toBeUndefined();
  });
});
