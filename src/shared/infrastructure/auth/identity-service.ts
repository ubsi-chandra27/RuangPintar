import { Pengguna } from "@prisma/client";
import { prisma } from "../database/prisma";
import { generateUlid } from "../../lib/ulid";
import { hashPassword, verifyPassword, validatePasswordPolicy } from "../../lib/password";
import { recordAuditEvent } from "../audit/audit-logger";
import type { TransactionClient } from "../database/transaction";

export interface CreateAccountInput {
  sekolah_id?: string | null;
  username: string;
  email?: string | null;
  password: string;
  nama_lengkap: string;
  peran_dasar: "SUPER_ADMIN" | "SCHOOL_STAFF" | "TEACHER" | "STUDENT" | "GUARDIAN";
  status_akun?: "AKTIF" | "NONAKTIF" | "TERKUNCI" | "DITANGGUHKAN" | "MENUNGGU_VERIFIKASI";
  harus_ganti_password?: boolean;
}

export class IdentityService {
  /**
   * Provision a new user account with secure password hashing and unique username validation.
   */
  async createAccount(
    input: CreateAccountInput,
    actorId: string = "SYSTEM",
    actorRole: string = "SYSTEM",
    db: TransactionClient | typeof prisma = prisma
  ): Promise<Pengguna> {
    const sanitizedUsername = input.username.toLowerCase().trim();

    if (!/^[a-z0-9_.-]{3,30}$/.test(sanitizedUsername)) {
      throw new Error(
        "Format username tidak valid. Gunakan 3-30 karakter alfanumerik, titik, garis bawah, atau strip."
      );
    }

    const passwordValidation = validatePasswordPolicy(input.password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }

    const passwordHash = await hashPassword(input.password);
    const userId = generateUlid();

    const user = await db.pengguna.create({
      data: {
        id: userId,
        sekolah_id: input.sekolah_id ?? null,
        username: sanitizedUsername,
        email: input.email?.toLowerCase().trim() ?? null,
        password_hash: passwordHash,
        nama_lengkap: input.nama_lengkap.trim(),
        peran_dasar: input.peran_dasar,
        status_akun: input.status_akun ?? "AKTIF",
        harus_ganti_password: input.harus_ganti_password ?? false,
      },
    });

    await recordAuditEvent(
      {
        sekolah_id: input.sekolah_id ?? null,
        aktor_id: actorId,
        aktor_role: actorRole,
        aksi: "AUTH_USER_CREATED",
        tipe_sumber: "PENGGUNA",
        id_sumber: userId,
        payload_sesudah: {
          username: user.username,
          peran_dasar: user.peran_dasar,
          status_akun: user.status_akun,
        },
      },
      db
    );

    return user;
  }

  /**
   * Find user account by username (case-insensitive).
   */
  async findUserByUsername(username: string): Promise<Pengguna | null> {
    return await prisma.pengguna.findUnique({
      where: { username: username.toLowerCase().trim() },
    });
  }

  /**
   * Find user account by ULID.
   */
  async findUserById(id: string): Promise<Pengguna | null> {
    return await prisma.pengguna.findUnique({
      where: { id },
    });
  }

  /**
   * Change user password with old password verification and password policy enforcement.
   */
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ success: boolean; error?: string }> {
    const user = await prisma.pengguna.findUnique({ where: { id: userId } });
    if (!user) {
      return { success: false, error: "Akun pengguna tidak ditemukan." };
    }

    const isOldPasswordValid = await verifyPassword(oldPassword, user.password_hash);
    if (!isOldPasswordValid) {
      return { success: false, error: "Kata sandi saat ini tidak cocok." };
    }

    const policy = validatePasswordPolicy(newPassword);
    if (!policy.valid) {
      return { success: false, error: policy.message };
    }

    const newHash = await hashPassword(newPassword);

    await prisma.pengguna.update({
      where: { id: userId },
      data: {
        password_hash: newHash,
        harus_ganti_password: false,
      },
    });

    await recordAuditEvent({
      sekolah_id: user.sekolah_id,
      aktor_id: user.id,
      aktor_role: user.peran_dasar,
      aksi: "AUTH_PASSWORD_CHANGED",
      tipe_sumber: "PENGGUNA",
      id_sumber: user.id,
      ip_address: ipAddress ?? null,
      user_agent: userAgent ?? null,
    });

    return { success: true };
  }

  /**
   * Update account status (e.g. AKTIF, NONAKTIF, TERKUNCI).
   */
  async setUserAccountStatus(
    userId: string,
    status: "AKTIF" | "NONAKTIF" | "TERKUNCI" | "DITANGGUHKAN" | "MENUNGGU_VERIFIKASI",
    actorId: string = "SYSTEM",
    actorRole: string = "SYSTEM"
  ): Promise<Pengguna> {
    const user = await prisma.pengguna.update({
      where: { id: userId },
      data: { status_akun: status },
    });

    await recordAuditEvent({
      sekolah_id: user.sekolah_id,
      aktor_id: actorId,
      aktor_role: actorRole,
      aksi: "AUTH_STATUS_CHANGED",
      tipe_sumber: "PENGGUNA",
      id_sumber: userId,
      payload_sesudah: { status_akun: status },
    });

    return user;
  }

  /**
   * Reset user password by Admin/Authorized Staff.
   * Clears locked status, sets must_change_password flag, resets failed attempts,
   * and records an audit event.
   */
  async adminResetPassword(
    userId: string,
    newPassword?: string,
    actorId: string = "SYSTEM",
    actorRole: string = "SYSTEM",
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ success: boolean; error?: string; temporaryPassword?: string }> {
    const user = await prisma.pengguna.findUnique({ where: { id: userId } });
    if (!user) {
      return { success: false, error: "Akun pengguna tidak ditemukan." };
    }

    const effectivePassword = newPassword?.trim() || "Password123#";
    const policy = validatePasswordPolicy(effectivePassword);
    if (!policy.valid) {
      return { success: false, error: policy.message };
    }

    const newHash = await hashPassword(effectivePassword);

    await prisma.pengguna.update({
      where: { id: userId },
      data: {
        password_hash: newHash,
        harus_ganti_password: true,
        percobaan_login_gagal: 0,
        dikunci_sampai: null,
        status_akun: user.status_akun === "TERKUNCI" ? "AKTIF" : user.status_akun,
      },
    });

    await recordAuditEvent({
      sekolah_id: user.sekolah_id,
      aktor_id: actorId,
      aktor_role: actorRole,
      aksi: "AUTH_PASSWORD_CHANGED",
      tipe_sumber: "PENGGUNA",
      id_sumber: user.id,
      payload_sesudah: {
        reset_by_admin: true,
        harus_ganti_password: true,
      },
      ip_address: ipAddress ?? null,
      user_agent: userAgent ?? null,
    });

    return { success: true, temporaryPassword: effectivePassword };
  }
}

export const identityService = new IdentityService();
