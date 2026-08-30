import { describe, it, expect } from "vitest";
import { accessControlEngine } from "@/shared/infrastructure/authorization/access-control";
import { ActorContext } from "@/shared/infrastructure/authorization/types";

describe("M07 — Student Academic Lifecycle Authorization & Access Control Matrix", () => {
  const schoolId = "sch_nusantara_01";
  const otherSchoolId = "sch_other_02";

  const superAdmin: ActorContext = {
    id: "usr_admin",
    username: "superadmin",
    peran_dasar: "SUPER_ADMIN",
    status_akun: "AKTIF",
    sekolah_id: schoolId,
  };

  const studentDataStaff: ActorContext = {
    id: "usr_staff_student",
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

  const teacher: ActorContext = {
    id: "usr_teacher",
    username: "guru_ahmad",
    peran_dasar: "TEACHER",
    status_akun: "AKTIF",
    sekolah_id: schoolId,
  };

  const student: ActorContext = {
    id: "usr_student",
    username: "siswa_budi",
    peran_dasar: "STUDENT",
    status_akun: "AKTIF",
    sekolah_id: schoolId,
  };

  const guardian: ActorContext = {
    id: "usr_guardian",
    username: "wali_budi",
    peran_dasar: "GUARDIAN",
    status_akun: "AKTIF",
    sekolah_id: schoolId,
  };

  describe("academic.students.view", () => {
    it("SUPER_ADMIN diizinkan melihat data siswa di sekolahnya", () => {
      const decision = accessControlEngine.evaluate({
        actor: superAdmin,
        permission: "academic.students.view",
        resource: { sekolah_id: schoolId },
      });
      expect(decision.allowed).toBe(true);
    });

    it("SCHOOL_STAFF dengan STUDENT_DATA_OPERATOR diizinkan melihat data siswa di sekolahnya", () => {
      const decision = accessControlEngine.evaluate({
        actor: studentDataStaff,
        permission: "academic.students.view",
        resource: { sekolah_id: schoolId },
      });
      expect(decision.allowed).toBe(true);
    });

    it("SCHOOL_STAFF tanpa bundle ditolak melihat data siswa", () => {
      const decision = accessControlEngine.evaluate({
        actor: plainStaff,
        permission: "academic.students.view",
        resource: { sekolah_id: schoolId },
      });
      expect(decision.allowed).toBe(false);
    });

    it("Ditolak jika mengakses sekolah lain (Cross-Tenant Isolation)", () => {
      const decision = accessControlEngine.evaluate({
        actor: studentDataStaff,
        permission: "academic.students.view",
        resource: { sekolah_id: otherSchoolId },
      });
      expect(decision.allowed).toBe(false);
    });
  });

  describe("academic.students.manage", () => {
    it("SUPER_ADMIN diizinkan mengelola data siswa di sekolahnya", () => {
      const decision = accessControlEngine.evaluate({
        actor: superAdmin,
        permission: "academic.students.manage",
        resource: { sekolah_id: schoolId },
      });
      expect(decision.allowed).toBe(true);
    });

    it("SCHOOL_STAFF dengan STUDENT_DATA_OPERATOR diizinkan mengelola data siswa di sekolahnya", () => {
      const decision = accessControlEngine.evaluate({
        actor: studentDataStaff,
        permission: "academic.students.manage",
        resource: { sekolah_id: schoolId },
      });
      expect(decision.allowed).toBe(true);
    });

    it("TEACHER ditolak mengelola data siswa", () => {
      const decision = accessControlEngine.evaluate({
        actor: teacher,
        permission: "academic.students.manage",
        resource: { sekolah_id: schoolId },
      });
      expect(decision.allowed).toBe(false);
    });

    it("STUDENT ditolak mengelola data siswa", () => {
      const decision = accessControlEngine.evaluate({
        actor: student,
        permission: "academic.students.manage",
        resource: { sekolah_id: schoolId },
      });
      expect(decision.allowed).toBe(false);
    });

    it("GUARDIAN ditolak mengelola data siswa", () => {
      const decision = accessControlEngine.evaluate({
        actor: guardian,
        permission: "academic.students.manage",
        resource: { sekolah_id: schoolId },
      });
      expect(decision.allowed).toBe(false);
    });
  });
});
