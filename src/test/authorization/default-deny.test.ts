import { describe, it, expect } from "vitest";
import { accessControlEngine } from "@/shared/infrastructure/authorization/access-control";
import { ActorContext, AccessRequest } from "@/shared/infrastructure/authorization/types";

describe("Authorization Engine (M02) — Default Deny & Isolation", () => {
  const activeTeacher: ActorContext = {
    id: "01TEST00000000000000000001",
    username: "guru_budi",
    peran_dasar: "TEACHER",
    status_akun: "AKTIF",
    sekolah_id: "SCH_01",
  };

  it("denies access when permission is unknown or not granted (FR-AUTHZ-003)", () => {
    const request: AccessRequest = {
      actor: activeTeacher,
      permission: "system.config.manage" as any,
      resource: { sekolah_id: "SCH_01" },
    };

    const decision = accessControlEngine.evaluate(request);
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain("lacks required permission");
  });

  it("denies access if account status is not AKTIF (NONAKTIF / TERKUNCI)", () => {
    const inactiveActor: ActorContext = {
      ...activeTeacher,
      status_akun: "NONAKTIF",
    };

    const decision = accessControlEngine.evaluate({
      actor: inactiveActor,
      permission: "academic.school.view",
    });

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain("NONAKTIF");
  });

  it("denies cross-school access when resource sekolah_id does not match actor (FR-AUTHZ-003)", () => {
    const decision = accessControlEngine.evaluate({
      actor: activeTeacher,
      permission: "academic.school.view",
      resource: { sekolah_id: "SCH_FOREIGN_99" },
    });

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain("Cross-school");
  });

  it("denies access when no matching assignment exists for classroom write", () => {
    const decision = accessControlEngine.evaluate({
      actor: activeTeacher,
      permission: "assessment.grades.manage",
      resource: {
        sekolah_id: "SCH_01",
        rombel_id: "ROMBEL_X_RPL",
        subject_id: "MAPEL_MATEMATIKA",
      },
      context: {
        teachingAssignments: [], // Kosong
      },
    });

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain("Teaching Assignment");
  });
});
