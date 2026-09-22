import { prisma } from "@/shared/infrastructure/database/prisma";

export const ACTIVE_MEMBERSHIP_STATUS = "ACTIVE";

export interface TenantContext {
  membershipId: string;
  sekolahId: string;
  peranDasar: string;
  isOwner: boolean;
}

export class TenantContextError extends Error {
  constructor(message = "Konteks tenant aktif tidak valid.") {
    super(message);
    this.name = "TenantContextError";
  }
}

/**
 * Resolves the active tenant only from a server-authoritative session and an
 * ACTIVE membership. Client-provided school IDs are intentionally not accepted.
 */
export async function resolveTenantContext(
  penggunaId: string,
  sekolahAktifId: string | null
): Promise<TenantContext | null> {
  if (!sekolahAktifId) return null;

  const membership = await prisma.keanggotaanSekolah.findUnique({
    where: {
      pengguna_id_sekolah_id: {
        pengguna_id: penggunaId,
        sekolah_id: sekolahAktifId,
      },
    },
    select: {
      id: true,
      sekolah_id: true,
      peran_dasar_di_tenant: true,
      status_keanggotaan: true,
      is_owner: true,
    },
  });

  if (!membership || membership.status_keanggotaan !== ACTIVE_MEMBERSHIP_STATUS) {
    return null;
  }

  return {
    membershipId: membership.id,
    sekolahId: membership.sekolah_id,
    peranDasar: membership.peran_dasar_di_tenant,
    isOwner: membership.is_owner,
  };
}

export async function requireTenantContext(
  penggunaId: string,
  sekolahAktifId: string | null
): Promise<TenantContext> {
  const context = await resolveTenantContext(penggunaId, sekolahAktifId);
  if (!context) {
    throw new TenantContextError(
      "Pilih sekolah aktif yang memiliki keanggotaan aktif sebelum mengakses data sekolah."
    );
  }
  return context;
}
