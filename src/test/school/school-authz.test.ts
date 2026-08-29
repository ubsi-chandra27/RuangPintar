import { describe, it, expect } from "vitest";
import { accessControlEngine } from "@/shared/infrastructure/authorization/access-control";
import {
  ActorContext,
  IPositionAssignmentContext,
} from "@/shared/infrastructure/authorization/types";

describe("School & Organization (M01) — Authorization & Access Control Matrix", () => {
  const schoolId = "sch_nusantara_01";
  const otherSchoolId = "sch_other_02";

  const superAdmin: ActorContext = {
    id: "usr_admin",
    username: "superadmin",
    peran_dasar: "SUPER_ADMIN",
    status_akun: "AKTIF",
    sekolah_id: schoolId,
  };

  const academicStaff: ActorContext = {
    id: "usr_staff_acad",
    username: "staff_akademik",
    peran_dasar: "SCHOOL_STAFF",
    status_akun: "AKTIF",
    sekolah_id: schoolId,
    capabilities: ["ACADEMIC_OPERATOR"],
  };

  const studentStaff: ActorContext = {
    id: "usr_staff_std",
    username: "staff_kesiswaan",
    peran_dasar: "SCHOOL_STAFF",
    status_akun: "AKTIF",
    sekolah_id: schoolId,
    capabilities: ["STUDENT_DATA_OPERATOR"],
  };

  const plainStaff: ActorContext = {
    id: "usr_staff_plain",
    username: "staff_biasa",
    peran_dasar: "SCHOOL_STAFF",
    status_akun: "AKTIF",
    sekolah_id: schoolId,
    capabilities: [],
  };

  const plainTeacher: ActorContext = {
    id: "usr_teacher_plain",
    username: "guru_math",
    peran_dasar: "TEACHER",
    status_akun: "AKTIF",
    sekolah_id: schoolId,
  };

  const teacherWakaKurikulum: ActorContext = {
    id: "usr_teacher_wakakur",
    username: "guru_wakakur",
    peran_dasar: "TEACHER",
    status_akun: "AKTIF",
    sekolah_id: schoolId,
  };

  const student: ActorContext = {
    id: "usr_student",
    username: "siswa_01",
    peran_dasar: "STUDENT",
    status_akun: "AKTIF",
    sekolah_id: schoolId,
  };

  const guardian: ActorContext = {
    id: "usr_guardian",
    username: "wali_01",
    peran_dasar: "GUARDIAN",
    status_akun: "AKTIF",
    sekolah_id: schoolId,
  };

  describe("1. School Profile Management (academic.school.manage)", () => {
    it("ALLOWS SUPER_ADMIN to manage school profile", () => {
      const decision = accessControlEngine.evaluate({
        actor: superAdmin,
        permission: "academic.school.manage",
        resource: { sekolah_id: schoolId },
      });
      expect(decision.allowed).toBe(true);
    });

    it("DENIES SCHOOL_STAFF (even with ACADEMIC_OPERATOR) from modifying school profile (Least Privilege)", () => {
      const decision = accessControlEngine.evaluate({
        actor: academicStaff,
        permission: "academic.school.manage",
        resource: { sekolah_id: schoolId },
      });
      expect(decision.allowed).toBe(false);
    });

    it("DENIES TEACHER, STUDENT, and GUARDIAN from modifying school profile", () => {
      expect(
        accessControlEngine.evaluate({
          actor: plainTeacher,
          permission: "academic.school.manage",
          resource: { sekolah_id: schoolId },
        }).allowed
      ).toBe(false);
      expect(
        accessControlEngine.evaluate({
          actor: student,
          permission: "academic.school.manage",
          resource: { sekolah_id: schoolId },
        }).allowed
      ).toBe(false);
      expect(
        accessControlEngine.evaluate({
          actor: guardian,
          permission: "academic.school.manage",
          resource: { sekolah_id: schoolId },
        }).allowed
      ).toBe(false);
    });
  });

  describe("2. Organization Structure & Position Management (academic.structure.manage)", () => {
    it("ALLOWS SUPER_ADMIN to manage organization structure", () => {
      expect(
        accessControlEngine.evaluate({
          actor: superAdmin,
          permission: "academic.structure.manage",
          resource: { sekolah_id: schoolId },
        }).allowed
      ).toBe(true);
    });

    it("ALLOWS SCHOOL_STAFF with ACADEMIC_OPERATOR bundle", () => {
      expect(
        accessControlEngine.evaluate({
          actor: academicStaff,
          permission: "academic.structure.manage",
          resource: { sekolah_id: schoolId },
        }).allowed
      ).toBe(true);
    });

    it("DENIES SCHOOL_STAFF with only STUDENT_DATA_OPERATOR bundle (Bundle Isolation)", () => {
      const decision = accessControlEngine.evaluate({
        actor: studentStaff,
        permission: "academic.structure.manage",
        resource: { sekolah_id: schoolId },
      });
      expect(decision.allowed).toBe(false);
    });

    it("DENIES SCHOOL_STAFF without capability bundles", () => {
      const decision = accessControlEngine.evaluate({
        actor: plainStaff,
        permission: "academic.structure.manage",
        resource: { sekolah_id: schoolId },
      });
      expect(decision.allowed).toBe(false);
    });

    it("DENIES ordinary TEACHER without position assignment from managing structure", () => {
      expect(
        accessControlEngine.evaluate({
          actor: plainTeacher,
          permission: "academic.structure.manage",
          resource: { sekolah_id: schoolId },
        }).allowed
      ).toBe(false);
    });

    it("DENIES STUDENT and GUARDIAN from managing organization units or positions", () => {
      expect(
        accessControlEngine.evaluate({
          actor: student,
          permission: "academic.structure.manage",
          resource: { sekolah_id: schoolId },
        }).allowed
      ).toBe(false);
      expect(
        accessControlEngine.evaluate({
          actor: guardian,
          permission: "academic.structure.manage",
          resource: { sekolah_id: schoolId },
        }).allowed
      ).toBe(false);
    });
  });

  describe("3. Effective Position-Based Access (VICE_PRINCIPAL_CURRICULUM Verification)", () => {
    const activeWakakurAssignment: IPositionAssignmentContext = {
      id: "asg_wakakur_01",
      personil_id: teacherWakaKurikulum.id,
      sekolah_id: schoolId,
      position_code: "VICE_PRINCIPAL_CURRICULUM",
      valid_from: new Date("2026-01-01"),
      valid_until: new Date("2026-12-31"),
      status: "AKTIF",
    };

    const evaluationDate = new Date("2026-06-15");

    it("ALLOWS user with active/effective VICE_PRINCIPAL_CURRICULUM assignment to view and manage structure", () => {
      // 1. Structure View
      const viewDecision = accessControlEngine.evaluate({
        actor: teacherWakaKurikulum,
        permission: "academic.structure.view",
        resource: { sekolah_id: schoolId },
        context: {
          positionAssignments: [activeWakakurAssignment],
          evaluationDate,
        },
      });
      expect(viewDecision.allowed).toBe(true);

      // 2. Structure Manage
      const manageDecision = accessControlEngine.evaluate({
        actor: teacherWakaKurikulum,
        permission: "academic.structure.manage",
        resource: { sekolah_id: schoolId },
        context: {
          positionAssignments: [activeWakakurAssignment],
          evaluationDate,
        },
      });
      expect(manageDecision.allowed).toBe(true);
    });

    it("DENIES structure access if VICE_PRINCIPAL_CURRICULUM assignment is expired (Temporal Boundary)", () => {
      const expiredAssignment: IPositionAssignmentContext = {
        ...activeWakakurAssignment,
        valid_from: new Date("2025-01-01"),
        valid_until: new Date("2025-12-31"), // Expired before evaluationDate
      };

      const decision = accessControlEngine.evaluate({
        actor: teacherWakaKurikulum,
        permission: "academic.structure.manage",
        resource: { sekolah_id: schoolId },
        context: {
          positionAssignments: [expiredAssignment],
          evaluationDate,
        },
      });
      expect(decision.allowed).toBe(false);
    });

    it("DENIES structure access if VICE_PRINCIPAL_CURRICULUM assignment is not yet effective (Future Boundary)", () => {
      const futureAssignment: IPositionAssignmentContext = {
        ...activeWakakurAssignment,
        valid_from: new Date("2026-08-01"), // Starts after evaluationDate
        valid_until: new Date("2027-07-31"),
      };

      const decision = accessControlEngine.evaluate({
        actor: teacherWakaKurikulum,
        permission: "academic.structure.manage",
        resource: { sekolah_id: schoolId },
        context: {
          positionAssignments: [futureAssignment],
          evaluationDate,
        },
      });
      expect(decision.allowed).toBe(false);
    });

    it("DENIES structure access if VICE_PRINCIPAL_CURRICULUM assignment status is SELESAI or DIBATALKAN", () => {
      // Status SELESAI
      const selesaiAssignment: IPositionAssignmentContext = {
        ...activeWakakurAssignment,
        status: "NONAKTIF", // Non-active lifecycle state
      };
      expect(
        accessControlEngine.evaluate({
          actor: teacherWakaKurikulum,
          permission: "academic.structure.manage",
          resource: { sekolah_id: schoolId },
          context: {
            positionAssignments: [selesaiAssignment],
            evaluationDate,
          },
        }).allowed
      ).toBe(false);

      // Status EXPIRED
      const cancelledAssignment: IPositionAssignmentContext = {
        ...activeWakakurAssignment,
        status: "EXPIRED",
      };
      expect(
        accessControlEngine.evaluate({
          actor: teacherWakaKurikulum,
          permission: "academic.structure.manage",
          resource: { sekolah_id: schoolId },
          context: {
            positionAssignments: [cancelledAssignment],
            evaluationDate,
          },
        }).allowed
      ).toBe(false);
    });

    it("DENIES position assignment granted from another school context (Cross-School Safety)", () => {
      const foreignAssignment: IPositionAssignmentContext = {
        ...activeWakakurAssignment,
        sekolah_id: otherSchoolId, // Assigned in other school
      };

      const decision = accessControlEngine.evaluate({
        actor: teacherWakaKurikulum,
        permission: "academic.structure.manage",
        resource: { sekolah_id: schoolId },
        context: {
          positionAssignments: [foreignAssignment],
          evaluationDate,
        },
      });
      expect(decision.allowed).toBe(false);
    });
  });

  describe("4. School Visibility (academic.school.view)", () => {
    it("ALLOWS all authenticated roles within the school to view basic school profile", () => {
      expect(
        accessControlEngine.evaluate({
          actor: superAdmin,
          permission: "academic.school.view",
          resource: { sekolah_id: schoolId },
        }).allowed
      ).toBe(true);
      expect(
        accessControlEngine.evaluate({
          actor: academicStaff,
          permission: "academic.school.view",
          resource: { sekolah_id: schoolId },
        }).allowed
      ).toBe(true);
      expect(
        accessControlEngine.evaluate({
          actor: plainTeacher,
          permission: "academic.school.view",
          resource: { sekolah_id: schoolId },
        }).allowed
      ).toBe(true);
      expect(
        accessControlEngine.evaluate({
          actor: student,
          permission: "academic.school.view",
          resource: { sekolah_id: schoolId },
        }).allowed
      ).toBe(true);
      expect(
        accessControlEngine.evaluate({
          actor: guardian,
          permission: "academic.school.view",
          resource: { sekolah_id: schoolId },
        }).allowed
      ).toBe(true);
    });
  });

  describe("5. Tenant Safety & Mismatch Isolation", () => {
    it("DENIES access when actor requests resource belonging to another school context (Defense-in-Depth)", () => {
      const decision = accessControlEngine.evaluate({
        actor: academicStaff,
        permission: "academic.structure.manage",
        resource: { sekolah_id: otherSchoolId }, // Mismatched school
      });
      expect(decision.allowed).toBe(false);
    });
  });
});
