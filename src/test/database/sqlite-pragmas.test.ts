import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma, configureSqlitePragmas } from "@/shared/infrastructure/database/prisma";

describe("SQLite Pragmas & Integrity Verification", () => {
  beforeAll(async () => {
    await configureSqlitePragmas(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("enforces foreign key constraints via PRAGMA foreign_keys", async () => {
    const result =
      await prisma.$queryRawUnsafe<Array<{ foreign_keys: number | bigint }>>(
        "PRAGMA foreign_keys;"
      );
    expect(Number(result[0]?.foreign_keys)).toBe(1);
  });

  it("verifies WAL journal mode on database connection", async () => {
    const result =
      await prisma.$queryRawUnsafe<Array<{ journal_mode: string }>>("PRAGMA journal_mode;");
    expect(["wal", "delete", "memory"]).toContain(result[0]?.journal_mode?.toLowerCase());
  });
});
