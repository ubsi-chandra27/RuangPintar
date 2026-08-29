/**
 * Ruang Pintar — Staff Capability Service (M02)
 *
 * Mengelola penugasan capability bundle untuk SCHOOL_STAFF pada database SQLite (tabel `kemampuan_staff`).
 */

import { prisma } from "../database/prisma";
import { generateUlid } from "@/shared/lib/ulid";
import { recordAuditEvent } from "../audit/audit-logger";
import { CapabilityBundle } from "./types";
import { isValidCapabilityBundle } from "./capability-bundles";

export class StaffCapabilityService {
  /**
   * Mengambil seluruh capability bundle yang aktif untuk seorang user.
   */
  public async getUserCapabilities(userId: string): Promise<CapabilityBundle[]> {
    const records = await prisma.kemampuanStaff.findMany({
      where: { pengguna_id: userId },
      select: { kode_kemampuan: true },
    });

    return records.map((r) => r.kode_kemampuan).filter(isValidCapabilityBundle);
  }

  /**
   * Menugaskan capability bundle ke SCHOOL_STAFF.
   */
  public async assignCapability(params: {
    staffId: string;
    bundle: CapabilityBundle;
    actorId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const { staffId, bundle, actorId, ipAddress, userAgent } = params;

    const staffUser = await prisma.pengguna.findUnique({
      where: { id: staffId },
    });

    if (!staffUser) {
      throw new Error(`Pengguna dengan ID ${staffId} tidak ditemukan.`);
    }

    if (staffUser.peran_dasar !== "SCHOOL_STAFF") {
      throw new Error(
        `Capability bundle hanya dapat ditugaskan kepada SCHOOL_STAFF (peran pengguna: ${staffUser.peran_dasar}).`
      );
    }

    const id = generateUlid();

    await prisma.kemampuanStaff.upsert({
      where: {
        pengguna_id_kode_kemampuan: {
          pengguna_id: staffId,
          kode_kemampuan: bundle,
        },
      },
      update: {},
      create: {
        id,
        pengguna_id: staffId,
        kode_kemampuan: bundle,
      },
    });

    // Audit log
    await recordAuditEvent({
      sekolah_id: staffUser.sekolah_id,
      aktor_id: actorId,
      aktor_role: "SUPER_ADMIN",
      tipe_sumber: "PENGGUNA_KEMAMPUAN",
      id_sumber: id,
      aksi: "AUTHZ_STAFF_CAPABILITY_ASSIGNED",
      payload_sesudah: {
        target_staff_id: staffId,
        capability: bundle,
      },
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  }

  /**
   * Mencabut capability bundle dari SCHOOL_STAFF.
   */
  public async revokeCapability(params: {
    staffId: string;
    bundle: CapabilityBundle;
    actorId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const { staffId, bundle, actorId, ipAddress, userAgent } = params;

    const staffUser = await prisma.pengguna.findUnique({
      where: { id: staffId },
    });

    if (!staffUser) {
      throw new Error(`Pengguna dengan ID ${staffId} tidak ditemukan.`);
    }

    await prisma.kemampuanStaff.deleteMany({
      where: {
        pengguna_id: staffId,
        kode_kemampuan: bundle,
      },
    });

    // Audit log
    await recordAuditEvent({
      sekolah_id: staffUser.sekolah_id,
      aktor_id: actorId,
      aktor_role: "SUPER_ADMIN",
      tipe_sumber: "PENGGUNA_KEMAMPUAN",
      id_sumber: staffId,
      aksi: "AUTHZ_STAFF_CAPABILITY_REVOKED",
      payload_sebelum: {
        target_staff_id: staffId,
        capability: bundle,
      },
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  }
}

export const staffCapabilityService = new StaffCapabilityService();
