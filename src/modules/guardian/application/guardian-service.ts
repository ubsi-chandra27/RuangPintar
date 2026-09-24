/**
 * Ruang Pintar — M15 Guardian & Family Application Service
 * Layanan orkestrasi bisnis portal wali murid dengan penegakan batasan relasi sah.
 */

import { AuthenticatedUser } from "@/shared/infrastructure/auth/auth-service";
import { GuardianRepository } from "../infrastructure/guardian-repository";
import {
  GuardianDashboardData,
  ChildActiveContext,
  ChildAttendanceRecap,
  ChildAttendanceHistoryItem,
  ChildAssignmentSummaryItem,
  ChildCbtSummaryItem,
  ChildPublishedGradeItem,
  ChildReportCardSummary,
  PengajuanWaliItem,
  LinkedChildSummary,
} from "../domain/guardian-types";
import { PengajuanWaliFormInput, PengajuanWaliSchema } from "../domain/guardian-validation";
import {
  ChildNotLinkedError,
  GuardianNotFoundError,
  PengajuanWaliValidationError,
  UnauthorizedGuardianActionError,
} from "../domain/guardian-errors";
import { recordAuditEvent } from "@/shared/infrastructure/audit/audit-logger";

export class GuardianService {
  constructor(private readonly repo: GuardianRepository = new GuardianRepository()) {}

  /**
   * Mengambil data dashboard portal wali murid
   */
  async getDashboardData(
    actor: AuthenticatedUser,
    requestedStudentId?: string
  ): Promise<GuardianDashboardData> {
    this.assertGuardianRole(actor);

    const guardian = await this.repo.getGuardianProfileByUserId(actor.id);
    if (!guardian || guardian.sekolah_id !== actor.sekolah_id) {
      throw new GuardianNotFoundError(`User ${actor.id} (${actor.username})`);
    }

    const linkedChildren = await this.repo.getLinkedChildren(guardian.id);
    if (linkedChildren.length === 0) {
      throw new ChildNotLinkedError(guardian.id, requestedStudentId || "NONE");
    }

    // Tentukan anak aktif: jika requestedStudentId valid, gunakan itu; jika tidak, pilih anak pertama
    let activeStudent: LinkedChildSummary | undefined;
    if (requestedStudentId) {
      activeStudent = linkedChildren.find((c) => c.siswa_id === requestedStudentId);
    }
    if (!activeStudent) {
      activeStudent = linkedChildren[0];
    }

    const targetStudentId = activeStudent.siswa_id;

    // Ambil detail anak aktif
    const [
      activeChild,
      attendanceRecap,
      upcomingAssignments,
      upcomingCbt,
      recentPublishedGrades,
      recentPengajuan,
    ] = await Promise.all([
      this.repo.getActiveChildContext(guardian.id, targetStudentId),
      this.repo.getChildAttendanceRecap(targetStudentId),
      this.repo.getChildUpcomingAssignments(targetStudentId, 6),
      this.repo.getChildUpcomingCbt(targetStudentId, 4),
      this.repo.getChildPublishedGrades(targetStudentId, 6),
      this.repo.getPengajuanList(guardian.id, targetStudentId),
    ]);

    return {
      guardian,
      linkedChildren,
      activeChild,
      attendanceRecap,
      upcomingAssignments,
      upcomingCbt,
      recentPublishedGrades,
      recentPengajuan,
    };
  }

  /**
   * Mengambil seluruh data presensi anak terpilih
   */
  async getChildAttendance(
    actor: AuthenticatedUser,
    targetStudentId?: string
  ): Promise<{
    activeChild: ChildActiveContext;
    linkedChildren: LinkedChildSummary[];
    recap: ChildAttendanceRecap;
    history: ChildAttendanceHistoryItem[];
  }> {
    this.assertGuardianRole(actor);

    const guardian = await this.repo.getGuardianProfileByUserId(actor.id);
    if (!guardian || guardian.sekolah_id !== actor.sekolah_id) {
      throw new GuardianNotFoundError(actor.id);
    }

    const linkedChildren = await this.repo.getLinkedChildren(guardian.id);
    if (linkedChildren.length === 0) {
      throw new ChildNotLinkedError(guardian.id, targetStudentId || "NONE");
    }

    const selectedChild = targetStudentId
      ? linkedChildren.find((c) => c.siswa_id === targetStudentId) || linkedChildren[0]
      : linkedChildren[0];

    const studentId = selectedChild.siswa_id;
    await this.repo.assertVerifiedRelationship(guardian.id, studentId);

    const [activeChild, recap, history] = await Promise.all([
      this.repo.getActiveChildContext(guardian.id, studentId),
      this.repo.getChildAttendanceRecap(studentId),
      this.repo.getChildAttendanceHistory(studentId, 50),
    ]);

    return {
      activeChild,
      linkedChildren,
      recap,
      history,
    };
  }

  /**
   * Mengambil perkembangan nilai dan rapor anak terpilih
   */
  async getChildGradesAndReport(
    actor: AuthenticatedUser,
    targetStudentId?: string
  ): Promise<{
    activeChild: ChildActiveContext;
    linkedChildren: LinkedChildSummary[];
    publishedGrades: ChildPublishedGradeItem[];
    reportCard: ChildReportCardSummary;
  }> {
    this.assertGuardianRole(actor);

    const guardian = await this.repo.getGuardianProfileByUserId(actor.id);
    if (!guardian || guardian.sekolah_id !== actor.sekolah_id) {
      throw new GuardianNotFoundError(actor.id);
    }

    const linkedChildren = await this.repo.getLinkedChildren(guardian.id);
    if (linkedChildren.length === 0) {
      throw new ChildNotLinkedError(guardian.id, targetStudentId || "NONE");
    }

    const selectedChild = targetStudentId
      ? linkedChildren.find((c) => c.siswa_id === targetStudentId) || linkedChildren[0]
      : linkedChildren[0];

    const studentId = selectedChild.siswa_id;
    await this.repo.assertVerifiedRelationship(guardian.id, studentId);

    const [activeChild, publishedGrades, reportCard] = await Promise.all([
      this.repo.getActiveChildContext(guardian.id, studentId),
      this.repo.getChildPublishedGrades(studentId, 50),
      this.repo.getChildReportCard(studentId),
    ]);

    return {
      activeChild,
      linkedChildren,
      publishedGrades,
      reportCard,
    };
  }

  /**
   * Mengajukan permohonan izin sakit atau dispensasi kegiatan oleh orang tua
   */
  async submitPengajuanIzin(
    actor: AuthenticatedUser,
    rawInput: unknown
  ): Promise<PengajuanWaliItem> {
    this.assertGuardianRole(actor);

    const parseResult = PengajuanWaliSchema.safeParse(rawInput);
    if (!parseResult.success) {
      const errMsgs = parseResult.error.issues.map((i) => i.message).join(", ");
      throw new PengajuanWaliValidationError(errMsgs);
    }

    const guardian = await this.repo.getGuardianProfileByUserId(actor.id);
    if (!guardian || guardian.sekolah_id !== actor.sekolah_id) {
      throw new GuardianNotFoundError(actor.id);
    }

    const input = parseResult.data;
    await this.repo.assertVerifiedRelationship(guardian.id, input.siswa_id);

    const result = await this.repo.createPengajuan(guardian.id, input);

    // Rekam log audit
    await recordAuditEvent({
      sekolah_id: guardian.sekolah_id,
      aktor_id: actor.id,
      aktor_role: "GUARDIAN",
      aksi: "SUBMIT_PENGAJUAN_IZIN_WALI",
      tipe_sumber: "PengajuanWali",
      id_sumber: result.id,
      payload_sesudah: {
        siswa_id: result.siswa_id,
        tipe: result.tipe,
        judul: result.judul,
      },
    });

    return result;
  }

  /**
   * Memvalidasi bahwa aktor wali memiliki profil sah di sekolah aktif dan terhubung dengan siswa
   */
  async verifyGuardianChildAccess(actor: AuthenticatedUser, studentId: string): Promise<void> {
    this.assertGuardianRole(actor);
    const guardian = await this.repo.getGuardianProfileByUserId(actor.id);
    if (!guardian || guardian.sekolah_id !== actor.sekolah_id) {
      throw new GuardianNotFoundError(actor.id);
    }
    await this.repo.assertVerifiedRelationship(guardian.id, studentId);
  }

  /**
   * Memastikan pengguna memiliki peran dasar GUARDIAN
   */
  private assertGuardianRole(actor: AuthenticatedUser): void {
    if (actor.peran_dasar !== "GUARDIAN") {
      throw new UnauthorizedGuardianActionError(
        `Akses hanya diizinkan untuk peran GUARDIAN. Peran saat ini: ${actor.peran_dasar}`
      );
    }
  }
}
