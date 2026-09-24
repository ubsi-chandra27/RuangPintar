/**
 * Ruang Pintar — M12 Class Session Attendance Application Service
 *
 * Mengatur orkestrasi bisnis presensi sesi kelas, otorisasi pengampu,
 * dan perekaman jejak audit log.
 */

import { recordAuditEvent } from "@/shared/infrastructure/audit/audit-logger";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { AttendanceNotAllowedError, SessionNotFoundError } from "../domain/attendance-errors";
import {
  ClassAttendanceRecapDTO,
  ClassSessionAttendanceDTO,
  SaveSessionAttendanceInput,
  SessionAttendanceHistoryItemDTO,
  SessionAttendanceSummaryDTO,
} from "../domain/attendance-types";
import { SaveSessionAttendanceSchema } from "../domain/attendance-validation";
import {
  attendanceRepository,
  AttendanceRepository,
} from "../infrastructure/attendance-repository";

export class AttendanceService {
  constructor(private readonly repository: AttendanceRepository = attendanceRepository) {}

  /**
   * Mengambil data presensi sesi kelas beserta daftar siswa rombel.
   */
  async getSessionAttendance(
    sesiId: string,
    sekolahId: string
  ): Promise<ClassSessionAttendanceDTO> {
    const data = await this.repository.findSessionWithStudents(sesiId, sekolahId);
    if (!data) {
      throw new SessionNotFoundError(sesiId);
    }
    return data;
  }

  /**
   * Menyimpan / memperbarui presensi seluruh siswa pada sesi kelas.
   */
  async saveSessionAttendance(
    actorUserId: string,
    actorRole: string,
    actorSekolahIdOrInput: string | SaveSessionAttendanceInput,
    maybeInput?: SaveSessionAttendanceInput
  ): Promise<SessionAttendanceSummaryDTO> {
    const rawInput = (
      typeof actorSekolahIdOrInput === "string" ? maybeInput : actorSekolahIdOrInput
    )!;
    const actorSekolahId =
      typeof actorSekolahIdOrInput === "string" ? actorSekolahIdOrInput : rawInput.sekolah_id;

    const validated = SaveSessionAttendanceSchema.parse(rawInput);

    if (validated.sekolah_id !== actorSekolahId) {
      throw new AttendanceNotAllowedError("Konteks sekolah tidak cocok dengan sesi aktif.");
    }

    const session = await prisma.sesiKelasAktual.findFirst({
      where: { id: validated.sesi_kelas_id, sekolah_id: actorSekolahId },
    });

    if (!session) {
      throw new SessionNotFoundError(validated.sesi_kelas_id);
    }

    // Otorisasi Scope Guru: hanya pengampu atau pengganti resmi (atau SUPER_ADMIN)
    if (actorRole === "TEACHER") {
      const teacher = await prisma.guru.findFirst({
        where: {
          sekolah_id: actorSekolahId,
          OR: [{ pengguna_id: actorUserId }],
        },
      });

      if (!teacher) {
        throw new AttendanceNotAllowedError("Profil guru tidak ditemukan untuk akun ini.");
      }

      const isPengampu = session.guru_id === teacher.id;
      const isPengganti = session.guru_pengganti_id === teacher.id;

      if (!isPengampu && !isPengganti) {
        throw new AttendanceNotAllowedError(
          "Akses ditolak: Anda bukan guru pengampu atau guru pengganti pada sesi kelas ini."
        );
      }
    }

    // Cross-tenant student boundary validation: verify that all students in items belong to actorSekolahId
    // and are actively enrolled in this rombel
    const studentIds = validated.items.map((i) => i.siswa_id);
    if (studentIds.length > 0) {
      const validPlacements = await prisma.penempatanRombel.findMany({
        where: {
          sekolah_id: actorSekolahId,
          rombel_id: session.rombel_id,
          status: "AKTIF",
          keikutsertaan: {
            siswa_id: { in: studentIds },
          },
        },
        select: {
          keikutsertaan: {
            select: { siswa_id: true },
          },
        },
      });

      if (Array.isArray(validPlacements)) {
        const validStudentIds = new Set(
          validPlacements.map((p: any) => p?.keikutsertaan?.siswa_id).filter(Boolean)
        );
        const hasInvalidStudent = studentIds.some((sId) => !validStudentIds.has(sId));
        if (hasInvalidStudent) {
          throw new AttendanceNotAllowedError(
            "Akses ditolak: Terdapat siswa yang tidak terdaftar aktif pada rombel atau sekolah ini."
          );
        }
      }
    }

    // Eksekusi penyimpanan
    const summary = await this.repository.saveSessionAttendance(validated, actorUserId);

    // Rekam Jejak Audit
    await recordAuditEvent({
      sekolah_id: validated.sekolah_id,
      aktor_id: actorUserId,
      aktor_role: actorRole,
      tipe_sumber: "PRESENSI_SESI_KELAS",
      id_sumber: validated.sesi_kelas_id,
      aksi: "RECORD_CLASS_ATTENDANCE",
      payload_sesudah: {
        sesi_kelas_id: validated.sesi_kelas_id,
        total_siswa: summary.total_siswa,
        jumlah_hadir: summary.jumlah_hadir,
        jumlah_izin: summary.jumlah_izin,
        jumlah_sakit: summary.jumlah_sakit,
        jumlah_alpha: summary.jumlah_alpha,
        persentase_kehadiran: summary.persentase_kehadiran,
        alasan_koreksi: validated.alasan_koreksi || null,
      },
    });

    return summary;
  }

  /**
   * Mengambil riwayat sesi dan presensi untuk penugasan mengajar rombel tertentu.
   */
  async getAssignmentAttendanceHistory(
    penugasanId: string,
    sekolahId: string
  ): Promise<SessionAttendanceHistoryItemDTO[]> {
    return this.repository.getTeachingAssignmentAttendanceHistory(penugasanId, sekolahId);
  }

  /**
   * Mengambil agregat kehadiran kelas keseluruhan untuk Workspace Kelas Tab Presensi.
   */
  async getOverallAttendanceStats(
    penugasanId: string,
    sekolahId: string
  ): Promise<{
    total_sesi_terjadwal: number;
    total_sesi_selesai: number;
    total_presensi_diambil: number;
    rata_rata_kehadiran: number;
  }> {
    return this.repository.getOverallAttendanceStats(penugasanId, sekolahId);
  }

  /**
   * Mengambil rekapitulasi kehadiran per siswa untuk penugasan mengajar rombel tertentu.
   */
  async getClassAttendanceRecap(
    penugasanId: string,
    sekolahId: string,
    guruId?: string | null,
    isSuperAdmin: boolean = false
  ): Promise<ClassAttendanceRecapDTO> {
    if (!isSuperAdmin && guruId) {
      const assignment = await prisma.penugasanMengajar.findFirst({
        where: { id: penugasanId, sekolah_id: sekolahId },
      });
      if (assignment && assignment.guru_id !== guruId) {
        throw new AttendanceNotAllowedError(
          "Akses ditolak: Anda bukan guru pengampu pada penugasan ini."
        );
      }
    }

    return this.repository.getClassAttendanceRecap(penugasanId, sekolahId);
  }
}

export const attendanceService = new AttendanceService();
