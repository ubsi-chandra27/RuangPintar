import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma, configureSqlitePragmas } from "@/shared/infrastructure/database/prisma";

describe("SQLite Pragmas & Integrity Verification (File-Based)", () => {
  beforeAll(async () => {
    await configureSqlitePragmas(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("verifies the database connection is file-based (not in-memory) to support WAL mode", async () => {
    // SQLite mandates journal_mode = "memory" for in-memory databases (:memory:),
    // which prevents WAL mode from ever being activated. File-based persistence is required.
    const dbUrl = process.env.DATABASE_URL || "file:./data/ruang-pintar.db";
    expect(dbUrl).not.toContain(":memory:");
    expect(dbUrl.startsWith("file:")).toBe(true);
  });

  it("enforces foreign key constraints via PRAGMA foreign_keys = ON", async () => {
    const result =
      await prisma.$queryRawUnsafe<Array<{ foreign_keys: number | bigint }>>(
        "PRAGMA foreign_keys;"
      );
    expect(Number(result[0]?.foreign_keys)).toBe(1);
  });

  it("verifies strict WAL journal mode without fallback options", async () => {
    const result =
      await prisma.$queryRawUnsafe<Array<{ journal_mode: string }>>("PRAGMA journal_mode;");
    // Strict assertion: must be exactly 'wal', rejecting any silent fallback to 'delete' or 'memory'
    expect(result[0]?.journal_mode?.toLowerCase()).toBe("wal");
  });

  it("verifies busy_timeout pragma is configured to 5000ms for concurrent lock resilience", async () => {
    const result =
      await prisma.$queryRawUnsafe<Array<{ timeout: number | bigint }>>("PRAGMA busy_timeout;");
    expect(Number(result[0]?.timeout)).toBe(5000);
  });

  it("verifies synchronous pragma is configured to NORMAL (1) for optimal WAL throughput", async () => {
    const result =
      await prisma.$queryRawUnsafe<Array<{ synchronous: number | bigint }>>("PRAGMA synchronous;");
    // In SQLite: 0 = OFF, 1 = NORMAL, 2 = FULL, 3 = EXTRA
    // In WAL mode, synchronous=NORMAL (1) is crash-safe against app crashes and avoids fsync bottlenecks
    expect(Number(result[0]?.synchronous)).toBe(1);
  });
});
