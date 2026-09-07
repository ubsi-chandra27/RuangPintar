/**
 * Ruang Pintar — Student Experience Application Service (Phase 15 / M15)
 *
 * Orchestrator aplikasi untuk pengalaman siswa (Student Experience):
 * - Menjaga Invariant Self-Scope: Siswa hanya dapat mengakses dan mengumpulkan data miliknya sendiri.
 * - Zero Draft Grade Leakage: Siswa tidak dapat mengakses draft nilai asesmen.
 * - Audit Trail: Pencatatan pengumpulan tugas siswa ke LogAudit.
 */

import { studentExperienceRepository } from "../infrastructure/student-experience-repository";
import {
  StudentDashboardData,
  StudentProfileContext,
  StudentAssignmentItem,
  StudentMaterialItem,
  StudentAttendanceSummary,
  StudentPublishedGradeItem,
  StudentReportCardCompilation,
  StudentCbtExamItem,
} from "../domain/student-experience-types";
import {
  StudentNotFoundError,
  UnauthorizedStudentAccessError,
} from "../domain/student-experience-errors";
import {
  SubmitAssignmentInput,
  SubmitAssignmentSchema,
} from "../domain/student-experience-validation";
import { recordAuditEvent } from "@/shared/infrastructure/audit/audit-logger";

export class StudentExperienceService {
  /**
   * Mengambil konteks profil siswa terautentikasi.
   */
  async getStudentProfile(userId: string, schoolId: string): Promise<StudentProfileContext> {
    const profile = await studentExperienceRepository.getStudentProfileByUserId(userId, schoolId);
    if (!profile) {
      throw new StudentNotFoundError();
    }
    return profile;
  }

  /**
   * Mengambil seluruh data agregasi dashboard siswa.
   */
  async getDashboardData(userId: string, schoolId: string): Promise<StudentDashboardData> {
    return studentExperienceRepository.getStudentDashboardData(userId, schoolId);
  }

  /**
   * Mengambil materi dan tugas untuk rombel belajar siswa.
   */
  async getMaterialsAndAssignments(
    userId: string,
    schoolId: string
  ): Promise<{
    profile: StudentProfileContext;
    materials: StudentMaterialItem[];
    assignments: StudentAssignmentItem[];
    attendance: StudentAttendanceSummary;
  }> {
    const profile = await this.getStudentProfile(userId, schoolId);

    const [materials, assignments, attendance] = await Promise.all([
      studentExperienceRepository.getStudentMaterials(profile.rombelId, schoolId),
      studentExperienceRepository.getStudentAssignments(
        profile.siswaId,
        profile.rombelId,
        schoolId
      ),
      studentExperienceRepository.getStudentAttendanceSummary(profile.siswaId, schoolId),
    ]);

    return {
      profile,
      materials,
      assignments,
      attendance,
    };
  }

  /**
   * Mengambil riwayat dan ringkasan presensi pribadi siswa.
   */
  async getAttendanceSummary(userId: string, schoolId: string): Promise<StudentAttendanceSummary> {
    const profile = await this.getStudentProfile(userId, schoolId);
    return studentExperienceRepository.getStudentAttendanceSummary(profile.siswaId, schoolId);
  }

  /**
   * Mengambil daftar nilai terpublikasi milik siswa.
   */
  async getPublishedGrades(
    userId: string,
    schoolId: string
  ): Promise<{
    profile: StudentProfileContext;
    grades: StudentPublishedGradeItem[];
  }> {
    const profile = await this.getStudentProfile(userId, schoolId);
    const grades = await studentExperienceRepository.getStudentPublishedGrades(
      profile.siswaId,
      schoolId
    );
    return { profile, grades };
  }

  /**
   * Mengambil lembar kompilasi e-Rapor resmi Kurikulum Merdeka siswa.
   */
  async getReportCard(userId: string, schoolId: string): Promise<StudentReportCardCompilation> {
    const profile = await this.getStudentProfile(userId, schoolId);
    return studentExperienceRepository.getStudentReportCardCompilation(profile.siswaId, schoolId);
  }

  /**
   * Mengambil daftar ujian CBT yang relevan untuk siswa.
   */
  async getCbtExams(userId: string, schoolId: string): Promise<StudentCbtExamItem[]> {
    const profile = await this.getStudentProfile(userId, schoolId);
    return studentExperienceRepository.getStudentCbtExams(
      profile.siswaId,
      profile.rombelId,
      schoolId
    );
  }

  /**
   * Mengumpulkan jawaban tugas oleh siswa dengan audit log.
   */
  async submitAssignment(userId: string, schoolId: string, rawInput: SubmitAssignmentInput) {
    const profile = await this.getStudentProfile(userId, schoolId);
    const validatedInput = SubmitAssignmentSchema.parse(rawInput);

    const submission = await studentExperienceRepository.submitAssignment(
      profile.siswaId,
      schoolId,
      validatedInput
    );

    // Audit Logging
    await recordAuditEvent({
      sekolah_id: schoolId,
      aktor_id: userId,
      aktor_role: "STUDENT",
      aksi: "SUBMIT_ASSIGNMENT",
      tipe_sumber: "PENGUMPULAN_TUGAS",
      id_sumber: submission.id,
      payload_sesudah: {
        publikasi_tugas_id: submission.publikasi_tugas_id,
        siswa_id: submission.siswa_id,
        status: submission.status,
        berkas_id: submission.berkas_id,
      },
    });

    return submission;
  }
}

export const studentExperienceService = new StudentExperienceService();
