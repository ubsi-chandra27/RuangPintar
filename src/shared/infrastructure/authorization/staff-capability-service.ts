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

    const bundles: CapabilityBundle[] = records
      .map((r) => r.kode_kemampuan)
      .filter(isValidCapabilityBundle);

    // Resolusi dinamis penugasan wali kelas
    const guru = await prisma.guru.findFirst({
      where: { pengguna_id: userId },
      select: { id: true, sekolah_id: true },
    });

    if (guru) {
      const activeHomeroom = await prisma.penugasanWaliKelas.findFirst({
        where: { guru_id: guru.id, sekolah_id: guru.sekolah_id, status: "AKTIF" },
        select: { id: true },
      });
      if (activeHomeroom) {
        bundles.push("HOMEROOM_TEACHER");
      }
    }

    // Resolusi dinamis penugasan jabatan kepemimpinan (Kepsek, Wakasek, Kaprog)
    const positionConditions: Array<{ personil_id: string; status: string }> = [
      { personil_id: userId, status: "AKTIF" },
    ];
    if (guru) {
      positionConditions.push({ personil_id: guru.id, status: "AKTIF" });
    }

    const activePosition = await prisma.penugasanJabatan.findFirst({
      where: {
        OR: positionConditions,
      },
      select: { id: true },
    });
    if (activePosition) {
      bundles.push("LEADERSHIP_ROLE");
    }

    return Array.from(new Set(bundles));
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

/**
 * Resolves effective user capabilities for navigation and access control.
 * Supports TEACHER (Homeroom, Leadership) and SCHOOL_STAFF (Assigned capabilities).
 */
export async function resolveUserCapabilities(user: {
  id: string;
  peran_dasar: string;
}): Promise<CapabilityBundle[]> {
  if (user.peran_dasar === "TEACHER" || user.peran_dasar === "SCHOOL_STAFF") {
    return staffCapabilityService.getUserCapabilities(user.id);
  }
  return [];
}
