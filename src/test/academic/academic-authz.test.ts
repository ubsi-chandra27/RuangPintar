import { describe, it, expect } from "vitest";
import { accessControlEngine } from "@/shared/infrastructure/authorization/access-control";
import { ActorContext } from "@/shared/infrastructure/authorization/types";

describe("M06 — Academic Structure Authorization & Access Control Matrix", () => {
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

  describe("academic.structure.view", () => {
    it("SUPER_ADMIN diizinkan melihat struktur akademik di sekolahnya", () => {
      const res = accessControlEngine.evaluate({
        actor: superAdmin,
        permission: "academic.structure.view",
        resource: { sekolah_id: schoolId },
      });
      expect(res.allowed).toBe(true);
    });

    it("SCHOOL_STAFF dengan ACADEMIC_OPERATOR diizinkan melihat struktur akademik", () => {
      const res = accessControlEngine.evaluate({
        actor: academicStaff,
        permission: "academic.structure.view",
        resource: { sekolah_id: schoolId },
      });
      expect(res.allowed).toBe(true);
    });

    it("TEACHER dan STUDENT tidak diizinkan akses konfigurasi struktur akademik internal", () => {
      const resTeacher = accessControlEngine.evaluate({
        actor: teacher,
        permission: "academic.structure.view",
        resource: { sekolah_id: schoolId },
      });
      expect(resTeacher.allowed).toBe(false);

      const resStudent = accessControlEngine.evaluate({
        actor: student,
        permission: "academic.structure.view",
        resource: { sekolah_id: schoolId },
      });
      expect(resStudent.allowed).toBe(false);
    });

    it("menolak akses jika scope sekolah berbeda (cross-tenant rejection)", () => {
      const res = accessControlEngine.evaluate({
        actor: academicStaff,
        permission: "academic.structure.view",
        resource: { sekolah_id: otherSchoolId },
      });
      expect(res.allowed).toBe(false);
    });
  });

  describe("academic.structure.manage", () => {
    it("SUPER_ADMIN diizinkan mengelola (create/update/activate/delete) struktur akademik", () => {
      const res = accessControlEngine.evaluate({
        actor: superAdmin,
        permission: "academic.structure.manage",
        resource: { sekolah_id: schoolId },
      });
      expect(res.allowed).toBe(true);
    });

    it("SCHOOL_STAFF dengan ACADEMIC_OPERATOR diizinkan mengelola struktur akademik", () => {
      const res = accessControlEngine.evaluate({
        actor: academicStaff,
        permission: "academic.structure.manage",
        resource: { sekolah_id: schoolId },
      });
      expect(res.allowed).toBe(true);
    });

    it("SCHOOL_STAFF tanpa ACADEMIC_OPERATOR ditolak mengelola struktur akademik", () => {
      const res = accessControlEngine.evaluate({
        actor: plainStaff,
        permission: "academic.structure.manage",
        resource: { sekolah_id: schoolId },
      });
      expect(res.allowed).toBe(false);
    });

    it("TEACHER, STUDENT, GUARDIAN ditolak mengelola struktur akademik", () => {
      const resTeacher = accessControlEngine.evaluate({
        actor: teacher,
        permission: "academic.structure.manage",
        resource: { sekolah_id: schoolId },
      });
      expect(resTeacher.allowed).toBe(false);

      const resStudent = accessControlEngine.evaluate({
        actor: student,
        permission: "academic.structure.manage",
        resource: { sekolah_id: schoolId },
      });
      expect(resStudent.allowed).toBe(false);

      const resGuardian = accessControlEngine.evaluate({
        actor: guardian,
        permission: "academic.structure.manage",
        resource: { sekolah_id: schoolId },
      });
      expect(resGuardian.allowed).toBe(false);
    });
  });
});
