import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma, configureSqlitePragmas } from "@/shared/infrastructure/database/prisma";
import { generateUlid } from "@/shared/lib/ulid";

describe("Prisma Foundation Models — Data Layer Baseline", () => {
  const testSchoolId = generateUlid();
  const testUnitId = generateUlid();
  const testJabatanId = generateUlid();
  const testPenugasanId = generateUlid();
  const testNpsn = "10203040";

  beforeAll(async () => {
    await configureSqlitePragmas(prisma);
  });

  afterAll(async () => {
    // Cleanup test data in reverse relational order
    await prisma.penugasanJabatan.deleteMany({ where: { sekolah_id: testSchoolId } });
    await prisma.jabatan.deleteMany({ where: { sekolah_id: testSchoolId } });
    await prisma.unitOrganisasi.deleteMany({ where: { sekolah_id: testSchoolId } });
    await prisma.sekolah.deleteMany({ where: { id: testSchoolId } });
    await prisma.$disconnect();
  });

  it("creates and retrieves a Sekolah entity with ULID primary key", async () => {
    const sekolah = await prisma.sekolah.create({
      data: {
        id: testSchoolId,
        nama: "SMK Negeri 1 Ruang Pintar",
        npsn: testNpsn,
        jenjang: "SMK",
        alamat: "Jl. Pendidikan No. 1",
        zona_waktu: "Asia/Jakarta",
        status_aktif: true,
      },
    });

    expect(sekolah.id).toBe(testSchoolId);
    expect(sekolah.nama).toBe("SMK Negeri 1 Ruang Pintar");
    expect(sekolah.jenjang).toBe("SMK");
  });

  it("rejects duplicate NPSN violating unique constraint (Negative Test)", async () => {
    const duplicateId = generateUlid();
    await expect(
      prisma.sekolah.create({
        data: {
          id: duplicateId,
          nama: "Sekolah Duplikat",
          npsn: testNpsn, // Duplicate NPSN
          jenjang: "SMA",
        },
      })
    ).rejects.toThrow();
  });

  it("creates an UnitOrganisasi attached to Sekolah", async () => {
    const unit = await prisma.unitOrganisasi.create({
      data: {
        id: testUnitId,
        sekolah_id: testSchoolId,
        nama: "Kurikulum & Akademik",
        kode: "KUR",
      },
    });

    expect(unit.sekolah_id).toBe(testSchoolId);
    expect(unit.nama).toBe("Kurikulum & Akademik");
  });

  it("creates a Jabatan with relation to Sekolah and UnitOrganisasi", async () => {
    const jabatan = await prisma.jabatan.create({
      data: {
        id: testJabatanId,
        sekolah_id: testSchoolId,
        unit_id: testUnitId,
        kode_jabatan: "VICE_PRINCIPAL_CURRICULUM",
        nama_jabatan: "Wakil Kepala Sekolah Bidang Kurikulum",
        tingkat_akses: "SCHOOL_WIDE",
      },
    });

    expect(jabatan.id).toBe(testJabatanId);
    expect(jabatan.kode_jabatan).toBe("VICE_PRINCIPAL_CURRICULUM");
  });

  it("creates a PenugasanJabatan linking personil to Jabatan with effective dates", async () => {
    const personilId = generateUlid();
    const startDate = new Date("2026-07-01T00:00:00Z");

    const penugasan = await prisma.penugasanJabatan.create({
      data: {
        id: testPenugasanId,
        sekolah_id: testSchoolId,
        jabatan_id: testJabatanId,
        personil_id: personilId,
        berlaku_mulai: startDate,
        status: "AKTIF",
        catatan: "Penugasan tahun ajaran 2026/2027",
      },
    });

    expect(penugasan.id).toBe(testPenugasanId);
    expect(penugasan.status).toBe("AKTIF");
  });

  it("rejects PenugasanJabatan with non-existent foreign key (Negative Test)", async () => {
    const invalidId = generateUlid();
    const fakeJabatanId = generateUlid();

    await expect(
      prisma.penugasanJabatan.create({
        data: {
          id: invalidId,
          sekolah_id: testSchoolId,
          jabatan_id: fakeJabatanId, // Non-existent FK
          personil_id: generateUlid(),
          berlaku_mulai: new Date(),
        },
      })
    ).rejects.toThrow();
  });
});
