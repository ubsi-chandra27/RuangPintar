import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma, configureSqlitePragmas } from "@/shared/infrastructure/database/prisma";
import { runInTransaction } from "@/shared/infrastructure/database/transaction";
import { generateUlid } from "@/shared/lib/ulid";

describe("Transaction Helper — Atomic Unit of Work", () => {
  const schoolId = generateUlid();

  beforeAll(async () => {
    await configureSqlitePragmas(prisma);
    await prisma.sekolah.create({
      data: {
        id: schoolId,
        nama: "SMA Transaksi Uji",
        jenjang: "SMA",
      },
    });
  });

  afterAll(async () => {
    await prisma.unitOrganisasi.deleteMany({ where: { sekolah_id: schoolId } });
    await prisma.sekolah.deleteMany({ where: { id: schoolId } });
    await prisma.$disconnect();
  });

  it("commits all operations when transaction succeeds", async () => {
    const unit1Id = generateUlid();
    const unit2Id = generateUlid();

    await runInTransaction(async (tx) => {
      await tx.unitOrganisasi.create({
        data: {
          id: unit1Id,
          sekolah_id: schoolId,
          nama: "Unit Sukses A",
        },
      });

      await tx.unitOrganisasi.create({
        data: {
          id: unit2Id,
          sekolah_id: schoolId,
          nama: "Unit Sukses B",
        },
      });
    });

    const unit1 = await prisma.unitOrganisasi.findUnique({ where: { id: unit1Id } });
    const unit2 = await prisma.unitOrganisasi.findUnique({ where: { id: unit2Id } });

    expect(unit1).not.toBeNull();
    expect(unit2).not.toBeNull();
  });

  it("rolls back all operations when an error occurs inside transaction", async () => {
    const unitId = generateUlid();

    await expect(
      runInTransaction(async (tx) => {
        await tx.unitOrganisasi.create({
          data: {
            id: unitId,
            sekolah_id: schoolId,
            nama: "Unit Batal Rollback",
          },
        });

        // Intentional error to trigger rollback
        throw new Error("Simulated failure inside transaction");
      })
    ).rejects.toThrow("Simulated failure inside transaction");

    // Verify entity was NOT committed
    const found = await prisma.unitOrganisasi.findUnique({ where: { id: unitId } });
    expect(found).toBeNull();
  });
});
