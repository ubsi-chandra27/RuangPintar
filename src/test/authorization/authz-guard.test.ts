import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  requirePermission,
  checkPermission,
  AuthorizationError,
} from "@/shared/infrastructure/authorization/authz-guard";
import * as authGuardModule from "@/shared/infrastructure/auth/auth-guard";
import * as auditLoggerModule from "@/shared/infrastructure/audit/audit-logger";
import { staffCapabilityService } from "@/shared/infrastructure/authorization/staff-capability-service";

describe("Server-Side Authorization Guards (M02) — requirePermission & checkPermission", () => {
  const mockTeacher = {
    id: "TEACHER_01",
    sekolah_id: "SCH_01",
    username: "guru_ani",
    nama_lengkap: "Ani Wulandari, S.Pd.",
    peran_dasar: "TEACHER",
    status_akun: "AKTIF",
    harus_ganti_password: false,
    email: null,
    created_at: new Date(),
  };

  const mockStaff = {
    id: "STAFF_01",
    sekolah_id: "SCH_01",
    username: "staff_budi",
    nama_lengkap: "Budi Staff",
    peran_dasar: "SCHOOL_STAFF",
    status_akun: "AKTIF",
    harus_ganti_password: false,
    email: null,
    created_at: new Date(),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("requirePermission succeeds for authorized action (FR-AUTHZ-001)", async () => {
    vi.spyOn(authGuardModule, "requireAuth").mockResolvedValue(mockTeacher);

    const user = await requirePermission("academic.school.view", {
      sekolah_id: "SCH_01",
    });
    expect(user.id).toBe("TEACHER_01");
  });

  it("requirePermission throws AuthorizationError (403) and logs audit event on unauthorized attempt (FR-AUTHZ-001)", async () => {
    vi.spyOn(authGuardModule, "requireAuth").mockResolvedValue(mockTeacher);
    const auditSpy = vi.spyOn(auditLoggerModule, "recordAuditEvent").mockResolvedValue({} as any);

    await expect(
      requirePermission("system.config.manage", {
        sekolah_id: "SCH_01",
      })
    ).rejects.toThrow(AuthorizationError);

    expect(auditSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        aksi: "AUTHZ_ACCESS_DENIED",
        aktor_id: "TEACHER_01",
      })
    );
  });

  it("checkPermission returns true for allowed permission and false for disallowed", async () => {
    vi.spyOn(authGuardModule, "getCurrentUser").mockResolvedValue(mockStaff);
    vi.spyOn(staffCapabilityService, "getUserCapabilities").mockResolvedValue([
      "ACADEMIC_OPERATOR",
    ]);

    // Assigned bundle -> true
    const canManageStructure = await checkPermission("academic.structure.manage", {
      sekolah_id: "SCH_01",
    });
    expect(canManageStructure).toBe(true);

    // Unassigned bundle -> false
    const canManageSystem = await checkPermission("system.config.manage", {
      sekolah_id: "SCH_01",
    });
    expect(canManageSystem).toBe(false);
  });

  it("checkPermission returns false if user is unauthenticated", async () => {
    vi.spyOn(authGuardModule, "getCurrentUser").mockResolvedValue(null);

    const result = await checkPermission("academic.school.view");
    expect(result).toBe(false);
  });
});
