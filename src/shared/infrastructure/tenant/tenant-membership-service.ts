import { prisma } from "@/shared/infrastructure/database/prisma";
import { generateUlid } from "@/shared/lib/ulid";
import { recordAuditEvent } from "@/shared/infrastructure/audit/audit-logger";

export class TenantMembershipError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TenantMembershipError";
  }
}

/** Foundation service: lifecycle operations are server-only and append audited. */
export class TenantMembershipService {
  async setActiveTenant(params: {
    sessionId: string;
    penggunaId: string;
    sekolahId: string;
    actorRole: string;
  }): Promise<void> {
    const membership = await prisma.keanggotaanSekolah.findUnique({
      where: {
        pengguna_id_sekolah_id: {
          pengguna_id: params.penggunaId,
          sekolah_id: params.sekolahId,
        },
      },
      select: { id: true, status_keanggotaan: true },
    });

    if (!membership || membership.status_keanggotaan !== "ACTIVE") {
      throw new TenantMembershipError(
        "Anda tidak memiliki keanggotaan aktif pada sekolah tersebut."
      );
    }

    await prisma.$transaction(async (tx) => {
      const updatedSession = await tx.sesiPengguna.updateMany({
        where: {
          id: params.sessionId,
          pengguna_id: params.penggunaId,
          dicabut: false,
          berlaku_sampai: { gt: new Date() },
        },
        data: {
          sekolah_aktif_id: params.sekolahId,
          terakhir_aktif_pada: new Date(),
        },
      });
      if (updatedSession.count !== 1) {
        throw new TenantMembershipError("Sesi tidak valid atau telah berakhir.");
      }

      await recordAuditEvent(
        {
          sekolah_id: params.sekolahId,
          aktor_id: params.penggunaId,
          aktor_role: params.actorRole,
          aksi: "TENANT_SESSION_SWITCHED",
          tipe_sumber: "SESI_PENGGUNA",
          id_sumber: params.sessionId,
          payload_sesudah: { membership_id: membership.id, sekolah_id: params.sekolahId },
        },
        tx
      );
    });
  }

  async changeStatus(params: {
    membershipId: string;
    nextStatus: "ACTIVE" | "REJECTED" | "SUSPENDED" | "REMOVED";
    actorId: string;
    actorRole: string;
    reason?: string;
  }): Promise<void> {
    const membership = await prisma.keanggotaanSekolah.findUnique({
      where: { id: params.membershipId },
      select: { sekolah_id: true, status_keanggotaan: true, pengguna_id: true, is_owner: true },
    });
    if (!membership) throw new TenantMembershipError("Keanggotaan sekolah tidak ditemukan.");
    if (membership.status_keanggotaan === params.nextStatus) return;

    if (
      membership.is_owner &&
      membership.status_keanggotaan === "ACTIVE" &&
      params.nextStatus !== "ACTIVE"
    ) {
      const activeOwners = await prisma.keanggotaanSekolah.count({
        where: { sekolah_id: membership.sekolah_id, is_owner: true, status_keanggotaan: "ACTIVE" },
      });
      if (activeOwners <= 1) {
        throw new TenantMembershipError(
          "Owner aktif terakhir tidak dapat diubah tanpa transfer ownership."
        );
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.keanggotaanSekolah.update({
        where: { id: params.membershipId },
        data: {
          status_keanggotaan: params.nextStatus,
          berlaku_mulai: params.nextStatus === "ACTIVE" ? new Date() : undefined,
          berlaku_sampai: params.nextStatus === "ACTIVE" ? null : new Date(),
          disetujui_oleh_id: params.nextStatus === "ACTIVE" ? params.actorId : undefined,
          disetujui_pada: params.nextStatus === "ACTIVE" ? new Date() : undefined,
        },
      });
      if (params.nextStatus !== "ACTIVE") {
        await tx.sesiPengguna.updateMany({
          where: { pengguna_id: membership.pengguna_id, sekolah_aktif_id: membership.sekolah_id },
          data: { sekolah_aktif_id: null },
        });
      }
      await recordAuditEvent(
        {
          sekolah_id: membership.sekolah_id,
          aktor_id: params.actorId,
          aktor_role: params.actorRole,
          aksi: `TENANT_MEMBERSHIP_${params.nextStatus}`,
          tipe_sumber: "KEANGGOTAAN_SEKOLAH",
          id_sumber: params.membershipId,
          payload_sebelum: { status_keanggotaan: membership.status_keanggotaan },
          payload_sesudah: { status_keanggotaan: params.nextStatus, reason: params.reason ?? null },
        },
        tx
      );
    });
  }

  async createPendingMembership(params: {
    penggunaId: string;
    sekolahId: string;
    peranDasar: string;
    source: "INVITATION" | "JOIN_REQUEST";
  }): Promise<string> {
    const id = generateUlid();
    await prisma.$transaction(async (tx) => {
      await tx.keanggotaanSekolah.create({
        data: {
          id,
          pengguna_id: params.penggunaId,
          sekolah_id: params.sekolahId,
          peran_dasar_di_tenant: params.peranDasar,
          status_keanggotaan: "PENDING",
          sumber_pendaftaran: params.source,
        },
      });
      await recordAuditEvent(
        {
          sekolah_id: params.sekolahId,
          aktor_id: params.penggunaId,
          aktor_role: params.peranDasar,
          aksi: "TENANT_MEMBERSHIP_PENDING_CREATED",
          tipe_sumber: "KEANGGOTAAN_SEKOLAH",
          id_sumber: id,
          payload_sesudah: { source: params.source, status_keanggotaan: "PENDING" },
        },
        tx
      );
    });
    return id;
  }
}

export const tenantMembershipService = new TenantMembershipService();
