import { describe, it, expect } from "vitest";
import { accessControlEngine } from "@/shared/infrastructure/authorization/access-control";
import {
  ActorContext,
  ITeachingAssignmentContext,
  IHomeroomAssignmentContext,
  IPositionAssignmentContext,
  IGuardianRelationshipContext,
} from "@/shared/infrastructure/authorization/types";

describe("Authorization Engine (M02) — Position, Assignment & Relationship Contracts", () => {
  const schoolId = "SCH_01";
  const now = new Date("2026-08-29T10:00:00Z");

  // ==========================================
  // 1. TEACHER TEACHING ASSIGNMENT (FR-AUTHZ-005)
  // ==========================================
  describe("Teacher Teaching Assignment Scopes", () => {
    const teacher: ActorContext = {
      id: "TEACHER_SITI",
      username: "siti_guru",
      peran_dasar: "TEACHER",
      status_akun: "AKTIF",
      sekolah_id: schoolId,
    };

    const validTeachingAssignment: ITeachingAssignmentContext = {
      id: "TA_01",
      teacher_id: "TEACHER_SITI",
      sekolah_id: schoolId,
      rombel_id: "ROMBEL_XII_RPL",
      subject_id: "MAPEL_PBO",
      valid_from: new Date("2026-07-01T00:00:00Z"),
      valid_until: new Date("2026-12-31T23:59:59Z"),
      status: "AKTIF",
    };

    it("ALLOWS grade and attendance management for assigned class and subject", () => {
      const decision = accessControlEngine.evaluate({
        actor: teacher,
        permission: "assessment.grades.manage",
        resource: {
          sekolah_id: schoolId,
          rombel_id: "ROMBEL_XII_RPL",
          subject_id: "MAPEL_PBO",
        },
        context: {
          teachingAssignments: [validTeachingAssignment],
          evaluationDate: now,
        },
      });

      expect(decision.allowed).toBe(true);
      expect(decision.matchedScope).toBe("TEACHING_ASSIGNMENT");
    });

    it("DENIES access when teacher attempts mutation on a class they are not assigned to (FR-AUTHZ-005)", () => {
      const decision = accessControlEngine.evaluate({
        actor: teacher,
        permission: "assessment.grades.manage",
        resource: {
          sekolah_id: schoolId,
          rombel_id: "ROMBEL_X_DKV", // Kelas berbeda
          subject_id: "MAPEL_PBO",
        },
        context: {
          teachingAssignments: [validTeachingAssignment],
          evaluationDate: now,
        },
      });

      expect(decision.allowed).toBe(false);
      expect(decision.reason).toContain("Teaching Assignment");
    });

    it("DENIES access when assignment has EXPIRED (Historical Check)", () => {
      const expiredAssignment: ITeachingAssignmentContext = {
        ...validTeachingAssignment,
        valid_until: new Date("2026-06-30T23:59:59Z"), // Sudah kadaluarsa
      };

      const decision = accessControlEngine.evaluate({
        actor: teacher,
        permission: "assessment.grades.manage",
        resource: {
          sekolah_id: schoolId,
          rombel_id: "ROMBEL_XII_RPL",
          subject_id: "MAPEL_PBO",
        },
        context: {
          teachingAssignments: [expiredAssignment],
          evaluationDate: now,
        },
      });

      expect(decision.allowed).toBe(false);
      expect(decision.reason).toContain("Teaching Assignment");
    });

    it("DENIES access when assignment is in the FUTURE (Not yet active)", () => {
      const futureAssignment: ITeachingAssignmentContext = {
        ...validTeachingAssignment,
        valid_from: new Date("2026-09-01T00:00:00Z"), // Baru aktif bulan depan
      };

      const decision = accessControlEngine.evaluate({
        actor: teacher,
        permission: "attendance.session.record",
        resource: {
          sekolah_id: schoolId,
          rombel_id: "ROMBEL_XII_RPL",
          subject_id: "MAPEL_PBO",
        },
        context: {
          teachingAssignments: [futureAssignment],
          evaluationDate: now,
        },
      });

      expect(decision.allowed).toBe(false);
    });
  });

  // ==========================================
  // 2. HOMEROOM ASSIGNMENT (WALI KELAS)
  // ==========================================
  describe("Homeroom Assignment Scopes", () => {
    const homeroomTeacher: ActorContext = {
      id: "TEACHER_BUDI",
      username: "budi_guru",
      peran_dasar: "TEACHER",
      status_akun: "AKTIF",
      sekolah_id: schoolId,
    };

    const validHomeroom: IHomeroomAssignmentContext = {
      id: "HA_01",
      teacher_id: "TEACHER_BUDI",
      sekolah_id: schoolId,
      rombel_id: "ROMBEL_XII_RPL",
      valid_from: new Date("2026-07-01T00:00:00Z"),
      valid_until: new Date("2027-06-30T23:59:59Z"),
      status: "AKTIF",
    };

    it("ALLOWS homeroom monitoring view for the assigned rombel", () => {
      const decision = accessControlEngine.evaluate({
        actor: homeroomTeacher,
        permission: "monitoring.homeroom.view",
        resource: {
          sekolah_id: schoolId,
          rombel_id: "ROMBEL_XII_RPL",
        },
        context: {
          homeroomAssignments: [validHomeroom],
          evaluationDate: now,
        },
      });

      expect(decision.allowed).toBe(true);
      expect(decision.matchedScope).toBe("HOMEROOM_ASSIGNMENT");
    });

    it("DENIES homeroom monitoring for a different rombel", () => {
      const decision = accessControlEngine.evaluate({
        actor: homeroomTeacher,
        permission: "monitoring.homeroom.view",
        resource: {
          sekolah_id: schoolId,
          rombel_id: "ROMBEL_XI_TJKT",
        },
        context: {
          homeroomAssignments: [validHomeroom],
          evaluationDate: now,
        },
      });

      expect(decision.allowed).toBe(false);
    });
  });

  // ==========================================
  // 3. LEADERSHIP POSITIONS (FR-AUTHZ-007)
  // ==========================================
  describe("Leadership Positions & Boundary", () => {
    const headmasterActor: ActorContext = {
      id: "PERSONIL_KEPSEK",
      username: "drs_hartono",
      peran_dasar: "SCHOOL_STAFF",
      status_akun: "AKTIF",
      sekolah_id: schoolId,
    };

    const headmasterPosition: IPositionAssignmentContext = {
      id: "POS_KEPSEK",
      personil_id: "PERSONIL_KEPSEK",
      sekolah_id: schoolId,
      position_code: "HEADMASTER",
      valid_from: new Date("2026-01-01T00:00:00Z"),
      valid_until: null,
      status: "AKTIF",
    };

    it("HEADMASTER has school-wide monitoring & report visibility (FR-AUTHZ-007)", () => {
      const decision = accessControlEngine.evaluate({
        actor: headmasterActor,
        permission: "report.school.view",
        resource: { sekolah_id: schoolId },
        context: {
          positionAssignments: [headmasterPosition],
          evaluationDate: now,
        },
      });

      expect(decision.allowed).toBe(true);
      expect(decision.matchedScope).toBe("SCHOOL");
    });

    it("HEADMASTER does NOT automatically imply system administrator (FR-AUTHZ-007)", () => {
      const decision = accessControlEngine.evaluate({
        actor: headmasterActor,
        permission: "system.config.manage",
        resource: { sekolah_id: schoolId },
        context: {
          positionAssignments: [headmasterPosition],
          evaluationDate: now,
        },
      });

      expect(decision.allowed).toBe(false);
      expect(decision.reason).toContain("lacks required permission");
    });

    it("PROGRAM_HEAD is restricted to program scope, denying other programs", () => {
      const programHeadActor: ActorContext = {
        id: "PERSONIL_KAPROG",
        username: "kaprog_rpl",
        peran_dasar: "TEACHER",
        status_akun: "AKTIF",
        sekolah_id: schoolId,
      };

      const kaprogPosition: IPositionAssignmentContext = {
        id: "POS_KAPROG_RPL",
        personil_id: "PERSONIL_KAPROG",
        sekolah_id: schoolId,
        position_code: "PROGRAM_HEAD",
        program_id: "PROGRAM_RPL",
        valid_from: new Date("2026-01-01T00:00:00Z"),
        valid_until: null,
        status: "AKTIF",
      };

      // Akses program RPL -> ALLOW
      const allowDecision = accessControlEngine.evaluate({
        actor: programHeadActor,
        permission: "report.academic.view",
        resource: {
          sekolah_id: schoolId,
          program_id: "PROGRAM_RPL",
        },
        context: {
          positionAssignments: [kaprogPosition],
          evaluationDate: now,
        },
      });
      expect(allowDecision.allowed).toBe(true);
      expect(allowDecision.matchedScope).toBe("PROGRAM");

      // Akses program DKV -> DENY
      const denyDecision = accessControlEngine.evaluate({
        actor: programHeadActor,
        permission: "report.academic.view",
        resource: {
          sekolah_id: schoolId,
          program_id: "PROGRAM_DKV",
        },
        context: {
          positionAssignments: [kaprogPosition],
          evaluationDate: now,
        },
      });
      expect(denyDecision.allowed).toBe(false);
    });
  });

  // ==========================================
  // 4. GUARDIAN RELATIONSHIP (FR-AUTHZ-006)
  // ==========================================
  describe("Guardian Verified Relationship Scopes", () => {
    const guardian: ActorContext = {
      id: "GUARDIAN_SUDARNO",
      username: "wali_sudarno",
      peran_dasar: "GUARDIAN",
      status_akun: "AKTIF",
      sekolah_id: schoolId,
    };

    const verifiedRel: IGuardianRelationshipContext = {
      id: "REL_01",
      guardian_id: "GUARDIAN_SUDARNO",
      student_id: "STUDENT_FARHAN",
      verified: true,
      valid_from: new Date("2026-01-01T00:00:00Z"),
      valid_until: null,
      status: "AKTIF",
    };

    it("ALLOWS guardian access to verified child's attendance and grades (FR-AUTHZ-006)", () => {
      const decision = accessControlEngine.evaluate({
        actor: guardian,
        permission: "assessment.grades.view",
        resource: {
          sekolah_id: schoolId,
          student_id: "STUDENT_FARHAN",
        },
        context: {
          guardianRelationships: [verifiedRel],
          evaluationDate: now,
        },
      });

      expect(decision.allowed).toBe(true);
      expect(decision.matchedScope).toBe("GUARDIAN_RELATIONSHIP");
    });

    it("DENIES guardian access when relationship is UNVERIFIED (FR-AUTHZ-006)", () => {
      const unverifiedRel: IGuardianRelationshipContext = {
        ...verifiedRel,
        verified: false,
      };

      const decision = accessControlEngine.evaluate({
        actor: guardian,
        permission: "assessment.grades.view",
        resource: {
          sekolah_id: schoolId,
          student_id: "STUDENT_FARHAN",
        },
        context: {
          guardianRelationships: [unverifiedRel],
          evaluationDate: now,
        },
      });

      expect(decision.allowed).toBe(false);
      expect(decision.reason).toContain("verified");
    });

    it("DENIES guardian access when requesting a DIFFERENT student's data (FR-AUTHZ-006)", () => {
      const decision = accessControlEngine.evaluate({
        actor: guardian,
        permission: "assessment.grades.view",
        resource: {
          sekolah_id: schoolId,
          student_id: "STUDENT_OTHER_CHILD",
        },
        context: {
          guardianRelationships: [verifiedRel],
          evaluationDate: now,
        },
      });

      expect(decision.allowed).toBe(false);
    });
  });
});
