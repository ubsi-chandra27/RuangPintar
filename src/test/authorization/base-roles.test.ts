import { describe, it, expect } from "vitest";
import { accessControlEngine } from "@/shared/infrastructure/authorization/access-control";
import { ActorContext } from "@/shared/infrastructure/authorization/types";

describe("Authorization Engine (M02) — Five Base Roles Semantics", () => {
  const schoolId = "SCH_MAIN";

  it("evaluates SUPER_ADMIN with global platform access and audit trail scope", () => {
    const superAdmin: ActorContext = {
      id: "SA_01",
      username: "superadmin",
      peran_dasar: "SUPER_ADMIN",
      status_akun: "AKTIF",
      sekolah_id: null,
    };

    const decision = accessControlEngine.evaluate({
      actor: superAdmin,
      permission: "system.config.manage",
      resource: { sekolah_id: "ANY_SCHOOL" },
    });

    expect(decision.allowed).toBe(true);
    expect(decision.matchedScope).toBe("GLOBAL");
  });

  it("restricts SCHOOL_STAFF without capability bundles from administrative operations", () => {
    const unprivilegedStaff: ActorContext = {
      id: "STAFF_01",
      username: "staff_tata_usaha",
      peran_dasar: "SCHOOL_STAFF",
      status_akun: "AKTIF",
      sekolah_id: schoolId,
      capabilities: [], // Belum memiliki capability bundle
    };

    // Base read view
    const viewDecision = accessControlEngine.evaluate({
      actor: unprivilegedStaff,
      permission: "academic.school.view",
      resource: { sekolah_id: schoolId },
    });
    expect(viewDecision.allowed).toBe(true);

    // Administrative manage attempts MUST be denied
    const manageDecision = accessControlEngine.evaluate({
      actor: unprivilegedStaff,
      permission: "academic.structure.manage",
      resource: { sekolah_id: schoolId },
    });
    expect(manageDecision.allowed).toBe(false);

    const configDecision = accessControlEngine.evaluate({
      actor: unprivilegedStaff,
      permission: "system.config.manage",
      resource: { sekolah_id: schoolId },
    });
    expect(configDecision.allowed).toBe(false);
  });

  it("enforces STUDENT self-scope, denying access to other students' resources (FR-AUTHZ-002)", () => {
    const student: ActorContext = {
      id: "STUDENT_AHMAD",
      username: "ahmad123",
      peran_dasar: "STUDENT",
      status_akun: "AKTIF",
      sekolah_id: schoolId,
    };

    // Akses data sendiri -> ALLOW
    const ownDecision = accessControlEngine.evaluate({
      actor: student,
      permission: "assessment.grades.view",
      resource: {
        sekolah_id: schoolId,
        student_id: "STUDENT_AHMAD",
        resource_owner_id: "STUDENT_AHMAD",
      },
    });
    expect(ownDecision.allowed).toBe(true);
    expect(ownDecision.matchedScope).toBe("STUDENT_SELF");

    // Mencoba akses data siswa lain -> DENY
    const otherStudentDecision = accessControlEngine.evaluate({
      actor: student,
      permission: "assessment.grades.view",
      resource: {
        sekolah_id: schoolId,
        student_id: "STUDENT_BUDI_LAIN",
        resource_owner_id: "STUDENT_BUDI_LAIN",
      },
    });
    expect(otherStudentDecision.allowed).toBe(false);
    expect(otherStudentDecision.reason).toContain("SELF scope");
  });

  it("denies GUARDIAN access without verified student relationship (FR-AUTHZ-006)", () => {
    const guardian: ActorContext = {
      id: "GUARDIAN_PAK_JOKO",
      username: "wali_joko",
      peran_dasar: "GUARDIAN",
      status_akun: "AKTIF",
      sekolah_id: schoolId,
    };

    // Request tanpa context relationship -> DENY
    const decision = accessControlEngine.evaluate({
      actor: guardian,
      permission: "assessment.grades.view",
      resource: {
        sekolah_id: schoolId,
        student_id: "STUDENT_AHMAD",
      },
      context: {
        guardianRelationships: [], // Tidak ada relasi terverifikasi
      },
    });

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain("verified");
  });
});
