"use server";

/**
 * Ruang Pintar — School & Organization (M01) Server Actions
 *
 * Seluruh aksi mutasi diverifikasi server-side melalui requireAuth() dan requirePermission(),
 * dieksekusi secara transaksional, dan merevalidasi cache halaman /sekolah.
 */

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import {
  AuthorizationError,
  requirePermission,
} from "@/shared/infrastructure/authorization/authz-guard";
import { SchoolDomainError } from "@/modules/school/domain/school-errors";
import { schoolProfileService } from "@/modules/school/application/school-profile-service";
import { organizationUnitService } from "@/modules/school/application/organization-unit-service";
import { positionService } from "@/modules/school/application/position-service";
import { positionAssignmentService } from "@/modules/school/application/position-assignment-service";
import { AuditContext } from "@/modules/school/infrastructure/school-repository";
import { ZodError } from "zod";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { generateUlid } from "@/shared/lib/ulid";
import { recordAuditEvent } from "@/shared/infrastructure/audit/audit-logger";

async function getAuditContext(actor: { id: string; peran_dasar: string }): Promise<AuditContext> {
  const h = await headers();
  return {
    aktor_id: actor.id,
    aktor_role: actor.peran_dasar,
    ip_address: h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "127.0.0.1",
    user_agent: h.get("user-agent") ?? "Internal-Server-Action",
  };
}

export type ActionResponse<T = unknown> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; code: string; details?: Record<string, string[]> };

function handleActionError(error: unknown): ActionResponse<never> {
  if (error instanceof AuthorizationError) {
    return {
      success: false,
      error: `Akses ditolak: ${error.message}`,
      code: "FORBIDDEN",
    };
  }

  if (error instanceof ZodError) {
    const zodError = error as ZodError;
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of zodError.issues) {
      const field = issue.path.join(".");
      if (!fieldErrors[field]) fieldErrors[field] = [];
      fieldErrors[field].push(issue.message);
    }
    return {
      success: false,
      error: zodError.issues[0]?.message ?? "Validasi formulir gagal.",
      code: "VALIDATION_ERROR",
      details: fieldErrors,
    };
  }

  if (error instanceof SchoolDomainError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }

  return {
    success: false,
    error: error instanceof Error ? error.message : "Terjadi kesalahan internal server.",
    code: "INTERNAL_ERROR",
  };
}

// -----------------------------------------------------------------------------
// 1. PROFIL SEKOLAH (academic.school.manage)
// -----------------------------------------------------------------------------

export async function updateSchoolProfileAction(formData: FormData): Promise<ActionResponse> {
  try {
    const actor = await requireAuth();
    if (!actor.sekolah_id) {
      return { success: false, error: "Sekolah konteks tidak valid.", code: "INVALID_CONTEXT" };
    }

    await requirePermission("academic.school.manage", {
      sekolah_id: actor.sekolah_id,
    });

    const auditContext = await getAuditContext(actor);

    const input = {
      nama: String(formData.get("nama") ?? ""),
      npsn: formData.get("npsn") ? String(formData.get("npsn")) : null,
      jenjang: String(formData.get("jenjang") ?? "SMA") as "SD" | "SMP" | "SMA" | "SMK" | "UMUM",
      alamat: formData.get("alamat") ? String(formData.get("alamat")) : null,
      telepon: formData.get("telepon") ? String(formData.get("telepon")) : null,
      email: formData.get("email") ? String(formData.get("email")) : null,
      zona_waktu: String(formData.get("zona_waktu") ?? "Asia/Jakarta"),
      logo_url: formData.get("logo_url") ? String(formData.get("logo_url")) : null,
    };

    const updated = await schoolProfileService.updateProfile(actor.sekolah_id, input, auditContext);

    revalidatePath("/sekolah");
    return { success: true, data: updated, message: "Profil sekolah berhasil diperbarui." };
  } catch (error) {
    return handleActionError(error);
  }
}

// -----------------------------------------------------------------------------
// 2. UNIT ORGANISASI (academic.structure.manage)
// -----------------------------------------------------------------------------

export async function createOrganizationUnitAction(formData: FormData): Promise<ActionResponse> {
  try {
    const actor = await requireAuth();
    if (!actor.sekolah_id) {
      return { success: false, error: "Sekolah konteks tidak valid.", code: "INVALID_CONTEXT" };
    }

    await requirePermission("academic.structure.manage", {
      sekolah_id: actor.sekolah_id,
    });

    const auditContext = await getAuditContext(actor);

    const input = {
      nama: String(formData.get("nama") ?? ""),
      kode: formData.get("kode") ? String(formData.get("kode")) : null,
      induk_unit_id: formData.get("induk_unit_id") ? String(formData.get("induk_unit_id")) : null,
    };

    const created = await organizationUnitService.createUnit(actor.sekolah_id, input, auditContext);

    revalidatePath("/sekolah");
    return { success: true, data: created, message: "Unit organisasi berhasil ditambahkan." };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateOrganizationUnitAction(
  id: string,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const actor = await requireAuth();
    if (!actor.sekolah_id) {
      return { success: false, error: "Sekolah konteks tidak valid.", code: "INVALID_CONTEXT" };
    }

    await requirePermission("academic.structure.manage", {
      sekolah_id: actor.sekolah_id,
    });

    const auditContext = await getAuditContext(actor);

    const input = {
      nama: String(formData.get("nama") ?? ""),
      kode: formData.get("kode") ? String(formData.get("kode")) : null,
      induk_unit_id: formData.get("induk_unit_id") ? String(formData.get("induk_unit_id")) : null,
    };

    const updated = await organizationUnitService.updateUnit(
      id,
      actor.sekolah_id,
      input,
      auditContext
    );

    revalidatePath("/sekolah");
    return { success: true, data: updated, message: "Unit organisasi berhasil diperbarui." };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteOrganizationUnitAction(id: string): Promise<ActionResponse> {
  try {
    const actor = await requireAuth();
    if (!actor.sekolah_id) {
      return { success: false, error: "Sekolah konteks tidak valid.", code: "INVALID_CONTEXT" };
    }

    await requirePermission("academic.structure.manage", {
      sekolah_id: actor.sekolah_id,
    });

    const auditContext = await getAuditContext(actor);

    await organizationUnitService.deleteUnit(id, actor.sekolah_id, auditContext);

    revalidatePath("/sekolah");
    return { success: true, data: null, message: "Unit organisasi berhasil dihapus." };
  } catch (error) {
    return handleActionError(error);
  }
}

// -----------------------------------------------------------------------------
// 3. MASTER JABATAN (academic.structure.manage)
// -----------------------------------------------------------------------------

export async function createPositionAction(formData: FormData): Promise<ActionResponse> {
  try {
    const actor = await requireAuth();
    if (!actor.sekolah_id) {
      return { success: false, error: "Sekolah konteks tidak valid.", code: "INVALID_CONTEXT" };
    }

    await requirePermission("academic.structure.manage", {
      sekolah_id: actor.sekolah_id,
    });

    const auditContext = await getAuditContext(actor);

    const input = {
      kode_jabatan: String(formData.get("kode_jabatan") ?? ""),
      nama_jabatan: String(formData.get("nama_jabatan") ?? ""),
      unit_id: formData.get("unit_id") ? String(formData.get("unit_id")) : null,
      tingkat_akses: (formData.get("tingkat_akses")
        ? String(formData.get("tingkat_akses"))
        : "SCHOOL_WIDE") as "SCHOOL_WIDE" | "UNIT_WIDE" | "PROGRAM_WIDE",
    };

    const created = await positionService.createPosition(actor.sekolah_id, input, auditContext);

    revalidatePath("/sekolah");
    return { success: true, data: created, message: "Jabatan struktural berhasil ditambahkan." };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updatePositionAction(
  id: string,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const actor = await requireAuth();
    if (!actor.sekolah_id) {
      return { success: false, error: "Sekolah konteks tidak valid.", code: "INVALID_CONTEXT" };
    }

    await requirePermission("academic.structure.manage", {
      sekolah_id: actor.sekolah_id,
    });

    const auditContext = await getAuditContext(actor);

    const input = {
      nama_jabatan: String(formData.get("nama_jabatan") ?? ""),
      unit_id: formData.get("unit_id") ? String(formData.get("unit_id")) : null,
      tingkat_akses: (formData.get("tingkat_akses")
        ? String(formData.get("tingkat_akses"))
        : "SCHOOL_WIDE") as "SCHOOL_WIDE" | "UNIT_WIDE" | "PROGRAM_WIDE",
    };

    const updated = await positionService.updatePosition(id, actor.sekolah_id, input, auditContext);

    revalidatePath("/sekolah");
    return { success: true, data: updated, message: "Jabatan struktural berhasil diperbarui." };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deletePositionAction(id: string): Promise<ActionResponse> {
  try {
    const actor = await requireAuth();
    if (!actor.sekolah_id) {
      return { success: false, error: "Sekolah konteks tidak valid.", code: "INVALID_CONTEXT" };
    }

    await requirePermission("academic.structure.manage", {
      sekolah_id: actor.sekolah_id,
    });

    const auditContext = await getAuditContext(actor);

    await positionService.deletePosition(id, actor.sekolah_id, auditContext);

    revalidatePath("/sekolah");
    return { success: true, data: null, message: "Jabatan struktural berhasil dihapus." };
  } catch (error) {
    return handleActionError(error);
  }
}

// -----------------------------------------------------------------------------
// 4. PENUGASAN JABATAN (academic.structure.manage)
// -----------------------------------------------------------------------------

export async function assignPositionAction(formData: FormData): Promise<ActionResponse> {
  try {
    const actor = await requireAuth();
    if (!actor.sekolah_id) {
      return { success: false, error: "Sekolah konteks tidak valid.", code: "INVALID_CONTEXT" };
    }

    await requirePermission("academic.structure.manage", {
      sekolah_id: actor.sekolah_id,
    });

    const auditContext = await getAuditContext(actor);

    const input = {
      personil_id: String(formData.get("personil_id") ?? ""),
      jabatan_id: String(formData.get("jabatan_id") ?? ""),
      berlaku_mulai: new Date(String(formData.get("berlaku_mulai"))),
      berlaku_sampai: formData.get("berlaku_sampai")
        ? new Date(String(formData.get("berlaku_sampai")))
        : null,
      catatan: formData.get("catatan") ? String(formData.get("catatan")) : null,
    };

    const created = await positionAssignmentService.assignPosition(
      actor.sekolah_id,
      input,
      auditContext
    );

    revalidatePath("/sekolah");
    return { success: true, data: created, message: "Penugasan personil berhasil dicatat." };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function endPositionAssignmentAction(
  id: string,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const actor = await requireAuth();
    if (!actor.sekolah_id) {
      return { success: false, error: "Sekolah konteks tidak valid.", code: "INVALID_CONTEXT" };
    }

    await requirePermission("academic.structure.manage", {
      sekolah_id: actor.sekolah_id,
    });

    const auditContext = await getAuditContext(actor);

    const berlakuSampaiRaw = formData.get("berlaku_sampai");
    const input = {
      berlaku_sampai: berlakuSampaiRaw ? new Date(String(berlakuSampaiRaw)) : new Date(),
      catatan: formData.get("catatan") ? String(formData.get("catatan")) : null,
    };

    const updated = await positionAssignmentService.endAssignment(
      id,
      actor.sekolah_id,
      input,
      auditContext
    );

    revalidatePath("/sekolah");
    return { success: true, data: updated, message: "Penugasan jabatan berhasil diakhiri." };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function cancelPositionAssignmentAction(
  id: string,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const actor = await requireAuth();
    if (!actor.sekolah_id) {
      return { success: false, error: "Sekolah konteks tidak valid.", code: "INVALID_CONTEXT" };
    }

    await requirePermission("academic.structure.manage", {
      sekolah_id: actor.sekolah_id,
    });

    const auditContext = await getAuditContext(actor);

    const input = {
      catatan: String(formData.get("catatan") ?? ""),
    };

    const updated = await positionAssignmentService.cancelAssignment(
      id,
      actor.sekolah_id,
      input,
      auditContext
    );

    revalidatePath("/sekolah");
    return { success: true, data: updated, message: "Penugasan jabatan berhasil dibatalkan." };
  } catch (error) {
    return handleActionError(error);
  }
}

// -----------------------------------------------------------------------------
// 5. REGISTRASI TENANT SEKOLAH MULTI-TENANT (SUPER_ADMIN ONLY)
// -----------------------------------------------------------------------------

export async function createSchoolTenantAction(formData: FormData): Promise<ActionResponse> {
  try {
    const actor = await requireAuth();
    if (actor.peran_dasar !== "SUPER_ADMIN") {
      return {
        success: false,
        error: "Akses ditolak: Hanya Super Admin SaaS yang dapat mendaftarkan institusi sekolah baru.",
        code: "FORBIDDEN",
      };
    }

    const auditContext = await getAuditContext(actor);

    const nama = String(formData.get("nama") ?? "").trim();
    const npsnRaw = formData.get("npsn") ? String(formData.get("npsn")).trim() : null;
    const npsn = npsnRaw && npsnRaw.length > 0 ? npsnRaw : null;
    const jenjang = String(formData.get("jenjang") ?? "SMA").trim();
    const tipeLisensi = String(formData.get("tipe_lisensi") ?? "FREEMIUM").trim();
    const alamatRaw = formData.get("alamat") ? String(formData.get("alamat")).trim() : null;
    const alamat = alamatRaw && alamatRaw.length > 0 ? alamatRaw : null;
    const teleponRaw = formData.get("telepon") ? String(formData.get("telepon")).trim() : null;
    const telepon = teleponRaw && teleponRaw.length > 0 ? teleponRaw : null;
    const emailRaw = formData.get("email") ? String(formData.get("email")).trim() : null;
    const email = emailRaw && emailRaw.length > 0 ? emailRaw : null;

    if (nama.length < 3) {
      return {
        success: false,
        error: "Nama institusi sekolah minimal 3 karakter.",
        code: "VALIDATION_ERROR",
      };
    }

    if (npsn) {
      const existing = await prisma.sekolah.findUnique({
        where: { npsn },
      });
      if (existing) {
        return {
          success: false,
          error: `Sekolah dengan NPSN ${npsn} sudah terdaftar (${existing.nama}).`,
          code: "DUPLICATE_NPSN",
        };
      }
    }

    const schoolId = generateUlid();
    const trialBerakhir =
      tipeLisensi === "FREEMIUM"
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : null;

    const createdSchool = await prisma.sekolah.create({
      data: {
        id: schoolId,
        nama,
        npsn,
        jenjang,
        tipe_lisensi: tipeLisensi,
        trial_berakhir_pada: trialBerakhir,
        alamat,
        telepon,
        email,
        zona_waktu: "Asia/Jakarta",
        status_aktif: true,
      },
    });

    await recordAuditEvent({
      sekolah_id: schoolId,
      aktor_id: actor.id,
      aktor_role: actor.peran_dasar,
      aksi: "CREATE",
      tipe_sumber: "SEKOLAH",
      id_sumber: schoolId,
      payload_sebelum: null,
      payload_sesudah: createdSchool as unknown as Record<string, unknown>,
      ip_address: auditContext.ip_address,
      user_agent: auditContext.user_agent,
    });

    revalidatePath("/sekolah");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: createdSchool,
      message: `Sekolah ${nama} berhasil didaftarkan ke platform SaaS.`,
    };
  } catch (error) {
    return handleActionError(error);
  }
}

