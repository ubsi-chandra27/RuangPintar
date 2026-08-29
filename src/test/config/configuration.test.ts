import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma, configureSqlitePragmas } from "@/shared/infrastructure/database/prisma";
import { configurationService } from "@/shared/infrastructure/config/configuration-service";
import { generateUlid } from "@/shared/lib/ulid";

describe("Configuration Service (M03) — System & School Overrides", () => {
  const schoolId = generateUlid();

  beforeAll(async () => {
    await configureSqlitePragmas(prisma);
    await prisma.sekolah.create({
      data: {
        id: schoolId,
        nama: "Sekolah Konfigurasi Test",
        jenjang: "SMA",
      },
    });
  });

  afterAll(async () => {
    await prisma.konfigurasiSistem.deleteMany({
      where: {
        OR: [
          { sekolah_id: schoolId },
          { kunci: { in: ["APP_THEME", "SCHOOL_TITLE", "GLOBAL_DUP_TEST"] } },
        ],
      },
    });
    await prisma.sekolah.deleteMany({ where: { id: schoolId } });
    await prisma.$disconnect();
  });

  it("sets and gets global configuration", async () => {
    await configurationService.setConfig("APP_THEME", "academic-glass", {
      kategori: "TAMPILAN",
      deskripsi: "Tema antarmuka default",
    });

    const val = await configurationService.getConfig("APP_THEME");
    expect(val).toBe("academic-glass");
  });

  it("returns default value when key does not exist", async () => {
    const val = await configurationService.getConfig("NON_EXISTENT_KEY", null, "default-fallback");
    expect(val).toBe("default-fallback");
  });

  it("maintains global configuration key uniqueness on setConfig (idempotent update)", async () => {
    // Set first time
    await configurationService.setConfig("GLOBAL_DUP_TEST", "v1");
    // Set second time with new value
    await configurationService.setConfig("GLOBAL_DUP_TEST", "v2");

    const count = await prisma.konfigurasiSistem.count({
      where: { sekolah_id: null, kunci: "GLOBAL_DUP_TEST" },
    });
    expect(count).toBe(1);

    const val = await configurationService.getConfig("GLOBAL_DUP_TEST");
    expect(val).toBe("v2");
  });

  it("enforces database-level uniqueness rejecting duplicate global key (Negative Test)", async () => {
    // Attempting direct raw insertion of duplicate global key bypassing service
    const duplicateKey = "GLOBAL_DB_UNIQUE_TEST";
    await prisma.konfigurasiSistem.create({
      data: {
        id: generateUlid(),
        sekolah_id: null,
        kunci: duplicateKey,
        nilai: "first_entry",
      },
    });

    // Attempting duplicate insert with same null sekolah_id and same kunci
    await expect(
      prisma.konfigurasiSistem.create({
        data: {
          id: generateUlid(),
          sekolah_id: null,
          kunci: duplicateKey,
          nilai: "duplicate_entry",
        },
      })
    ).rejects.toThrow();

    // Clean up
    await prisma.konfigurasiSistem.deleteMany({ where: { kunci: duplicateKey } });
  });

  it("prioritizes school-specific override over global configuration", async () => {
    // Set global default
    await configurationService.setConfig("SCHOOL_TITLE", "Ruang Pintar Global");

    // Set school override
    await configurationService.setConfig("SCHOOL_TITLE", "Ruang Pintar SMK 1", {
      sekolah_id: schoolId,
    });

    // Query global context
    const globalVal = await configurationService.getConfig("SCHOOL_TITLE");
    expect(globalVal).toBe("Ruang Pintar Global");

    // Query school context
    const schoolVal = await configurationService.getConfig("SCHOOL_TITLE", schoolId);
    expect(schoolVal).toBe("Ruang Pintar SMK 1");
  });

  it("merges global and school configs in getAllConfigs", async () => {
    const merged = await configurationService.getAllConfigs(schoolId);
    expect(merged["APP_THEME"]).toBe("academic-glass");
    expect(merged["SCHOOL_TITLE"]).toBe("Ruang Pintar SMK 1");
  });
});
