"use server";

/**
 * Ruang Pintar — M12 Class Session Attendance Server Actions
 */

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { requirePermission } from "@/shared/infrastructure/authorization/authz-guard";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { attendanceService } from "@/modules/attendance/application/attendance-service";
import {
  ClassAttendanceRecapDTO,
  ClassSessionAttendanceDTO,
  SaveSessionAttendanceInput,
  SessionAttendanceHistoryItemDTO,
  SessionAttendanceSummaryDTO,
} from "@/modules/attendance/domain/attendance-types";

export interface AttendanceActionResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Mengambil data sesi kelas beserta roster presensi seluruh siswa rombel.
 */
export async function getSessionAttendanceAction(
  sesiId: string
): Promise<AttendanceActionResult<ClassSessionAttendanceDTO>> {
  try {
    const user = await requireAuth();
    if (!user.sekolah_id) {
      return { success: false, message: "Sekolah tidak teridentifikasi." };
    }

    await requirePermission("attendance.session.view", {
      sekolah_id: user.sekolah_id,
    });

    const data = await attendanceService.getSessionAttendance(sesiId, user.sekolah_id);
    return { success: true, message: "Data presensi berhasil dimuat.", data };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal memuat data presensi sesi.";
    return { success: false, message };
  }
}

/**
 * Menyimpan data presensi sesi kelas aktual.
 */
export async function saveSessionAttendanceAction(
  input: SaveSessionAttendanceInput
): Promise<AttendanceActionResult<SessionAttendanceSummaryDTO>> {
  try {
    const user = await requireAuth();
    if (!user.sekolah_id) {
      return { success: false, message: "Sekolah tidak teridentifikasi." };
    }

    if (input.sekolah_id && input.sekolah_id !== user.sekolah_id) {
      return { success: false, message: "Akses ditolak: Akses data lintas sekolah dilarang." };
    }

    await requirePermission("attendance.session.record", {
      sekolah_id: user.sekolah_id,
    });

    const secureInput: SaveSessionAttendanceInput = {
      ...input,
      sekolah_id: user.sekolah_id,
    };

    const summary = await attendanceService.saveSessionAttendance(
      user.id,
      user.peran_dasar,
      user.sekolah_id,
      secureInput
    );

    revalidatePath("/sesi-pembelajaran");
    revalidatePath("/kelas-saya");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Presensi berhasil disimpan (${summary.jumlah_hadir} Hadir dari ${summary.total_siswa} siswa).`,
      data: summary,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan presensi.";
    return { success: false, message };
  }
}

/**
 * Mengambil riwayat presensi seluruh sesi kelas untuk penugasan mengajar rombel tertentu.
 */
export async function getAssignmentAttendanceHistoryAction(
  penugasanId: string
): Promise<AttendanceActionResult<SessionAttendanceHistoryItemDTO[]>> {
  try {
    const user = await requireAuth();
    if (!user.sekolah_id) {
      return { success: false, message: "Sekolah tidak teridentifikasi." };
    }

    await requirePermission("attendance.session.view", {
      sekolah_id: user.sekolah_id,
    });

    const data = await attendanceService.getAssignmentAttendanceHistory(
      penugasanId,
      user.sekolah_id
    );

    return { success: true, message: "Riwayat presensi kelas berhasil dimuat.", data };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal memuat riwayat presensi kelas.";
    return { success: false, message };
  }
}

/**
 * Mengambil rekapitulasi kehadiran seluruh siswa pada satu penugasan mengajar rombel.
 */
export async function getClassAttendanceRecapAction(
  penugasanId: string
): Promise<AttendanceActionResult<ClassAttendanceRecapDTO>> {
  try {
    const user = await requireAuth();
    if (!user.sekolah_id) {
      return { success: false, message: "Sekolah tidak teridentifikasi." };
    }

    await requirePermission("attendance.session.view", {
      sekolah_id: user.sekolah_id,
    });

    const isSuperAdmin = user.peran_dasar === "SUPER_ADMIN";
    let teacherId: string | null = null;
    if (user.peran_dasar === "TEACHER") {
      const teacher = await prisma.guru.findFirst({
        where: {
          sekolah_id: user.sekolah_id,
          OR: [{ pengguna_id: user.id }, { email: user.email }],
        },
      });
      teacherId = teacher?.id ?? null;
    }

    const data = await attendanceService.getClassAttendanceRecap(
      penugasanId,
      user.sekolah_id,
      teacherId,
      isSuperAdmin
    );

    return { success: true, message: "Rekapitulasi presensi siswa berhasil dimuat.", data };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal memuat rekapitulasi presensi siswa.";
    return { success: false, message };
  }
}
