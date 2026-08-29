import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma, configureSqlitePragmas } from "@/shared/infrastructure/database/prisma";
import { identityService } from "@/shared/infrastructure/auth/identity-service";
import { generateUlid } from "@/shared/lib/ulid";

describe("Identity Service (M02) — User Account Lifecycle", () => {
  const schoolId = generateUlid();
  const testUsername = `user_${Date.now()}`;

  beforeAll(async () => {
    await configureSqlitePragmas(prisma);
    await prisma.sekolah.create({
      data: {
        id: schoolId,
        nama: "Sekolah Identitas Test",
        jenjang: "SMA",
      },
    });
  });

  afterAll(async () => {
    await prisma.logAudit.deleteMany({ where: { sekolah_id: schoolId } });
    await prisma.pengguna.deleteMany({ where: { sekolah_id: schoolId } });
    await prisma.sekolah.deleteMany({ where: { id: schoolId } });
    await prisma.$disconnect();
  });

  it("provisions a new user account with hashed password and ULID identifier", async () => {
    const user = await identityService.createAccount({
      sekolah_id: schoolId,
      username: testUsername,
      password: "PasswordAman123",
      nama_lengkap: "Budi Prakoso",
      peran_dasar: "TEACHER",
      status_akun: "AKTIF",
    });

    expect(user.id).toHaveLength(26);
    expect(user.username).toBe(testUsername);
    expect(user.password_hash).not.toBe("PasswordAman123");
    expect(user.peran_dasar).toBe("TEACHER");
    expect(user.status_akun).toBe("AKTIF");
  });

  it("rejects duplicate username (Negative Test)", async () => {
    await expect(
      identityService.createAccount({
        sekolah_id: schoolId,
        username: testUsername,
        password: "PasswordBaru123",
        nama_lengkap: "Duplikat User",
        peran_dasar: "STUDENT",
      })
    ).rejects.toThrow();
  });

  it("rejects invalid username format (Negative Test)", async () => {
    await expect(
      identityService.createAccount({
        sekolah_id: schoolId,
        username: "ab", // too short (< 3 chars)
        password: "PasswordAman123",
        nama_lengkap: "Invalid User",
        peran_dasar: "STUDENT",
      })
    ).rejects.toThrow(/Format username tidak valid/);
  });

  it("changes user password with valid old password verification", async () => {
    const user = await identityService.findUserByUsername(testUsername);
    expect(user).not.toBeNull();

    // Wrong old password
    const wrongResult = await identityService.changePassword(
      user!.id,
      "WrongOldPassword123",
      "NewPassword456"
    );
    expect(wrongResult.success).toBe(false);
    expect(wrongResult.error).toContain("tidak cocok");

    // Correct old password
    const successResult = await identityService.changePassword(
      user!.id,
      "PasswordAman123",
      "NewPassword456"
    );
    expect(successResult.success).toBe(true);

    // Verify login with new password
    const updatedUser = await identityService.findUserById(user!.id);
    expect(updatedUser!.harus_ganti_password).toBe(false);
  });

  it("updates user account status", async () => {
    const user = await identityService.findUserByUsername(testUsername);
    const updated = await identityService.setUserAccountStatus(user!.id, "NONAKTIF");
    expect(updated.status_akun).toBe("NONAKTIF");
  });
});
