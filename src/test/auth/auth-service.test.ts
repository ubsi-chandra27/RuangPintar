import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { prisma, configureSqlitePragmas } from "@/shared/infrastructure/database/prisma";
import { identityService } from "@/shared/infrastructure/auth/identity-service";
import { authService } from "@/shared/infrastructure/auth/auth-service";
import { generateUlid } from "@/shared/lib/ulid";

describe("Auth Service (M02) — Authentication & Session Lifecycle", () => {
  const schoolId = generateUlid();
  const testUser = `guru_${Date.now()}`;
  const rawPassword = "PasswordGuru123";
  let createdUserId: string;

  beforeAll(async () => {
    await configureSqlitePragmas(prisma);
    await prisma.sekolah.create({
      data: {
        id: schoolId,
        nama: "SMA Negeri 1 Testing",
        jenjang: "SMA",
      },
    });

    const user = await identityService.createAccount({
      sekolah_id: schoolId,
      username: testUser,
      password: rawPassword,
      nama_lengkap: "Siti Aminah, S.Pd.",
      peran_dasar: "TEACHER",
      status_akun: "AKTIF",
    });
    createdUserId = user.id;
  });

  beforeEach(async () => {
    // Reset rate limiter & failed attempts for the test user between test cases
    await prisma.logPercobaanLogin.deleteMany();
    await prisma.pengguna.update({
      where: { id: createdUserId },
      data: { percobaan_login_gagal: 0, status_akun: "AKTIF" },
    });
  });

  afterAll(async () => {
    await prisma.logPercobaanLogin.deleteMany({ where: { identifier: testUser } });
    await prisma.sesiPengguna.deleteMany({ where: { pengguna_id: createdUserId } });
    await prisma.logAudit.deleteMany({ where: { sekolah_id: schoolId } });
    await prisma.pengguna.deleteMany({ where: { sekolah_id: schoolId } });
    await prisma.sekolah.deleteMany({ where: { id: schoolId } });
    await prisma.$disconnect();
  });

  it("authenticates valid credentials, creates session, and records audit log", async () => {
    const result = await authService.loginWithCredentials({
      username: testUser,
      password: rawPassword,
      rememberMe: true,
      ipAddress: "192.168.1.100",
      userAgent: "Vitest Agent",
    });

    expect(result.success).toBe(true);
    expect(result.sessionToken).toBeDefined();
    expect(result.user?.username).toBe(testUser);
    expect(result.user?.peran_dasar).toBe("TEACHER");

    // Verify session validation
    const validated = await authService.validateSession(result.sessionToken!);
    expect(validated).not.toBeNull();
    expect(validated!.user.id).toBe(createdUserId);
    expect(validated!.session.dicabut).toBe(false);

    // Verify audit log
    const auditLogs = await prisma.logAudit.findMany({
      where: { aktor_id: createdUserId, aksi: "AUTH_LOGIN_SUCCESS" },
    });
    expect(auditLogs.length).toBeGreaterThanOrEqual(1);
  });

  it("sets 30-day session lifetime when rememberMe is true", async () => {
    const result = await authService.loginWithCredentials({
      username: testUser,
      password: rawPassword,
      rememberMe: true,
    });

    expect(result.success).toBe(true);
    const validated = await authService.validateSession(result.sessionToken!);
    expect(validated).not.toBeNull();

    const expectedExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
    const actualExpiry = validated!.session.berlaku_sampai.getTime();
    expect(Math.abs(actualExpiry - expectedExpiry)).toBeLessThan(5000);
  });

  it("sets 24-hour standard session lifetime when rememberMe is false/omitted", async () => {
    const result = await authService.loginWithCredentials({
      username: testUser,
      password: rawPassword,
      rememberMe: false,
    });

    expect(result.success).toBe(true);
    const validated = await authService.validateSession(result.sessionToken!);
    expect(validated).not.toBeNull();

    const expectedExpiry = Date.now() + 24 * 60 * 60 * 1000;
    const actualExpiry = validated!.session.berlaku_sampai.getTime();
    expect(Math.abs(actualExpiry - expectedExpiry)).toBeLessThan(5000);
  });

  it("rejects invalid password and increments failed attempt count", async () => {
    const result = await authService.loginWithCredentials({
      username: testUser,
      password: "WrongPassword999",
      ipAddress: "192.168.1.101",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("tidak valid");

    const user = await prisma.pengguna.findUnique({ where: { id: createdUserId } });
    expect(user?.percobaan_login_gagal).toBeGreaterThanOrEqual(1);
  });

  it("rejects non-existent username with generic error", async () => {
    const result = await authService.loginWithCredentials({
      username: "user_non_existent_999",
      password: "Password123",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("tidak valid");
  });

  it("rejects login if account is non-active or suspended", async () => {
    await identityService.setUserAccountStatus(createdUserId, "NONAKTIF");

    const result = await authService.loginWithCredentials({
      username: testUser,
      password: rawPassword,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("nonaktif");

    // Restore to AKTIF
    await identityService.setUserAccountStatus(createdUserId, "AKTIF");
  });

  it("revokes active session on logout", async () => {
    const loginResult = await authService.loginWithCredentials({
      username: testUser,
      password: rawPassword,
    });

    expect(loginResult.success).toBe(true);
    const token = loginResult.sessionToken!;

    // Logout
    await authService.revokeSession(token, "TEST_LOGOUT");

    // Validating revoked session should return null
    const validated = await authService.validateSession(token);
    expect(validated).toBeNull();
  });
});
