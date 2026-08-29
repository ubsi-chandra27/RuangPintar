import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma, configureSqlitePragmas } from "@/shared/infrastructure/database/prisma";
import { checkLoginRateLimit, recordLoginAttempt } from "@/shared/infrastructure/auth/rate-limiter";

describe("Login Rate Limiter & Brute Force Mitigation", () => {
  const testIdentifier = `rate_test_${Date.now()}`;
  const testIp = "10.0.0.99";

  beforeAll(async () => {
    await configureSqlitePragmas(prisma);
  });

  afterAll(async () => {
    await prisma.logPercobaanLogin.deleteMany({
      where: {
        OR: [{ identifier: testIdentifier }, { ip_address: testIp }],
      },
    });
    await prisma.$disconnect();
  });

  it("allows initial login attempts and reports remaining quota", async () => {
    const result = await checkLoginRateLimit(testIdentifier, testIp);
    expect(result.allowed).toBe(true);
    expect(result.remainingAttempts).toBe(5);
  });

  it("blocks login when failed attempts reach threshold", async () => {
    // Simulate 5 failed attempts
    for (let i = 0; i < 5; i++) {
      await recordLoginAttempt(testIdentifier, testIp, false, "INVALID_PASSWORD");
    }

    const result = await checkLoginRateLimit(testIdentifier, testIp);
    expect(result.allowed).toBe(false);
    expect(result.remainingAttempts).toBe(0);
    expect(result.lockoutSeconds).toBe(15 * 60);
    expect(result.message).toContain("Terlalu banyak percobaan login");
  });
});
