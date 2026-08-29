import { describe, it, expect } from "vitest";
import { accessControlEngine } from "@/shared/infrastructure/authorization/access-control";
import { ActorContext } from "@/shared/infrastructure/authorization/types";

describe("Authorization Engine (M02) — SCHOOL_STAFF Capability Bundles", () => {
  const schoolId = "SCH_01";

  it("SYSTEM_ADMIN bundle grants system configs and audit, but NOT academic structure", () => {
    const sysAdminStaff: ActorContext = {
      id: "STAFF_SYS",
      username: "admin_sistem",
      peran_dasar: "SCHOOL_STAFF",
      status_akun: "AKTIF",
      sekolah_id: schoolId,
      capabilities: ["SYSTEM_ADMIN"],
    };

    // System config -> ALLOW
    expect(
      accessControlEngine.evaluate({
        actor: sysAdminStaff,
        permission: "system.config.manage",
        resource: { sekolah_id: schoolId },
      }).allowed
    ).toBe(true);

    // Audit logs -> ALLOW
    expect(
      accessControlEngine.evaluate({
        actor: sysAdminStaff,
        permission: "system.audit.view",
        resource: { sekolah_id: schoolId },
      }).allowed
    ).toBe(true);

    // Academic structure manage -> DENY (Requires ACADEMIC_OPERATOR)
    expect(
      accessControlEngine.evaluate({
        actor: sysAdminStaff,
        permission: "academic.structure.manage",
        resource: { sekolah_id: schoolId },
      }).allowed
    ).toBe(false);
  });

  it("ACADEMIC_OPERATOR bundle grants curriculum & timetable, but NOT system configs", () => {
    const academicStaff: ActorContext = {
      id: "STAFF_ACAD",
      username: "operator_kurikulum",
      peran_dasar: "SCHOOL_STAFF",
      status_akun: "AKTIF",
      sekolah_id: schoolId,
      capabilities: ["ACADEMIC_OPERATOR"],
    };

    // Master schedule & timetable -> ALLOW
    expect(
      accessControlEngine.evaluate({
        actor: academicStaff,
        permission: "schedule.master.publish",
        resource: { sekolah_id: schoolId },
      }).allowed
    ).toBe(true);

    // System config manage -> DENY
    expect(
      accessControlEngine.evaluate({
        actor: academicStaff,
        permission: "system.config.manage",
        resource: { sekolah_id: schoolId },
      }).allowed
    ).toBe(false);
  });

  it("STUDENT_DATA_OPERATOR bundle grants student registry manage, but NOT grade publishing", () => {
    const studentDataStaff: ActorContext = {
      id: "STAFF_STUDENT",
      username: "operator_kesiswaan",
      peran_dasar: "SCHOOL_STAFF",
      status_akun: "AKTIF",
      sekolah_id: schoolId,
      capabilities: ["STUDENT_DATA_OPERATOR"],
    };

    // Student records manage -> ALLOW
    expect(
      accessControlEngine.evaluate({
        actor: studentDataStaff,
        permission: "academic.students.manage",
        resource: { sekolah_id: schoolId },
      }).allowed
    ).toBe(true);

    // Grade publishing -> DENY
    expect(
      accessControlEngine.evaluate({
        actor: studentDataStaff,
        permission: "assessment.grades.publish",
        resource: { sekolah_id: schoolId },
      }).allowed
    ).toBe(false);
  });

  it("combines multiple capability bundles additively without escalating to unassigned permissions", () => {
    const multiStaff: ActorContext = {
      id: "STAFF_MULTI",
      username: "operator_lengkap",
      peran_dasar: "SCHOOL_STAFF",
      status_akun: "AKTIF",
      sekolah_id: schoolId,
      capabilities: ["ACADEMIC_OPERATOR", "REPORT_OPERATOR"],
    };

    // From ACADEMIC_OPERATOR
    expect(
      accessControlEngine.evaluate({
        actor: multiStaff,
        permission: "academic.structure.manage",
        resource: { sekolah_id: schoolId },
      }).allowed
    ).toBe(true);

    // From REPORT_OPERATOR
    expect(
      accessControlEngine.evaluate({
        actor: multiStaff,
        permission: "report.export",
        resource: { sekolah_id: schoolId },
      }).allowed
    ).toBe(true);

    // Not assigned (SYSTEM_ADMIN permission) -> DENY
    expect(
      accessControlEngine.evaluate({
        actor: multiStaff,
        permission: "system.config.manage",
        resource: { sekolah_id: schoolId },
      }).allowed
    ).toBe(false);
  });
});
