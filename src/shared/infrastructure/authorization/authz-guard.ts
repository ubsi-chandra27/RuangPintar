/**
 * Ruang Pintar — Server-Side Authorization Guards (M02)
 *
 * Sesuai FR-AUTHZ-001 s/d FR-AUTHZ-004 & ROADMAP-RULE-008:
 * Seluruh aksi sensitif diperiksa server-side.
 * UI hiding bukan authorization; server guard wajib memeriksa hak nyata pengguna.
 */

import { requireAuth, getCurrentUser } from "../auth/auth-guard";
import { AuthenticatedUser } from "../auth/auth-service";
import { prisma } from "../database/prisma";
import { accessControlEngine } from "./access-control";
import { staffCapabilityService } from "./staff-capability-service";
import { recordAuditEvent } from "../audit/audit-logger";
import { ActorContext, EvaluationContext, PermissionString, ResourceContext } from "./types";

export class AuthorizationError extends Error {
  public readonly statusCode: number = 403;
  public readonly code: string = "FORBIDDEN";

  constructor(message: string = "Akses ditolak. Anda tidak memiliki izin untuk tindakan ini.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Server guard untuk mewajibkan permission tertentu.
 * Jika tidak berhak, melempar AuthorizationError (403) dan mencatat audit denial.
 */
export async function requirePermission(
  permission: PermissionString,
  resource?: ResourceContext,
  context?: EvaluationContext
): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  let capabilities = undefined;
  if (user.peran_dasar === "SCHOOL_STAFF") {
    capabilities = await staffCapabilityService.getUserCapabilities(user.id);
  }

  // Load teacher active teaching assignments from DB if actor is TEACHER and context not provided
  let evaluationContext: EvaluationContext = context ?? {};
  if (user.peran_dasar === "TEACHER" && !evaluationContext.teachingAssignments) {
    const guru = await prisma.guru.findFirst({
      where: { pengguna_id: user.id },
      select: { id: true },
    });

    if (guru) {
      const activeAssignments = await prisma.penugasanMengajar.findMany({
        where: {
          guru_id: guru.id,
          status: "AKTIF",
        },
        select: {
          id: true,
          sekolah_id: true,
          rombel_id: true,
          mata_pelajaran_id: true,
          created_at: true,
          status: true,
        },
      });

      evaluationContext = {
        ...evaluationContext,
        teachingAssignments: activeAssignments.map((ta) => ({
          id: ta.id,
          teacher_id: user.id, // mapped to actor.id (user.id)
          sekolah_id: ta.sekolah_id,
          rombel_id: ta.rombel_id,
          subject_id: ta.mata_pelajaran_id,
          valid_from: ta.created_at,
          status: ta.status as any,
        })),
      };
    }
  }

  const actor: ActorContext = {
    id: user.id,
    username: user.username,
    peran_dasar: user.peran_dasar as any,
    status_akun: user.status_akun,
    sekolah_id: user.sekolah_id,
    capabilities,
  };

  const decision = accessControlEngine.evaluate({
    actor,
    permission,
    resource,
    context: evaluationContext,
  });

  if (!decision.allowed) {
    // Log sensitive denial event
    await recordAuditEvent({
      sekolah_id: user.sekolah_id,
      aktor_id: user.id,
      aktor_role: user.peran_dasar,
      tipe_sumber: "AUTHORIZATION_GUARD",
      id_sumber: user.id,
      aksi: "AUTHZ_ACCESS_DENIED",
      payload_sebelum: {
        permission,
        resource: resource ?? {},
        reason: decision.reason,
      },
    });

    throw new AuthorizationError(`Akses ditolak: ${decision.reason || "Izin tidak mencukupi."}`);
  }

  return user;
}

/**
 * Non-throwing server guard check untuk evaluasi kondisional tampilan/fitur di server.
 */
export async function checkPermission(
  permission: PermissionString,
  resource?: ResourceContext,
  context?: EvaluationContext
): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) {
    return false;
  }

  let capabilities = undefined;
  if (user.peran_dasar === "SCHOOL_STAFF") {
    capabilities = await staffCapabilityService.getUserCapabilities(user.id);
  }

  const actor: ActorContext = {
    id: user.id,
    username: user.username,
    peran_dasar: user.peran_dasar as any,
    status_akun: user.status_akun,
    sekolah_id: user.sekolah_id,
    capabilities,
  };

  const decision = accessControlEngine.evaluate({
    actor,
    permission,
    resource,
    context,
  });

  return decision.allowed;
}
