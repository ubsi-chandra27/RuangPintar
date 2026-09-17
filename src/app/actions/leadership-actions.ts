"use server";

/**
 * Ruang Pintar — Module M19: Leadership Analytics Server Actions
 */

import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { leadershipAnalyticsService } from "@/modules/reporting/application/leadership-analytics-service";
import {
  LeadershipPositionType,
  ReportFilterInput,
  UserLeadershipContext,
  HeadmasterOverviewDTO,
  CurriculumOverviewDTO,
  StudentAffairsOverviewDTO,
  ProgramHeadOverviewDTO,
  RiwayatEksporItemDTO,
  ExecutiveReportData,
} from "@/modules/reporting/domain/reporting-types";

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getLeadershipContextAction(
  requestedRole?: LeadershipPositionType
): Promise<ActionResult<UserLeadershipContext>> {
  try {
    const user = await requireAuth();
    const context = await leadershipAnalyticsService.resolveLeadershipContext(user, requestedRole);
    return { success: true, data: context };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Gagal memverifikasi konteks kepemimpinan.",
    };
  }
}

export async function getHeadmasterOverviewAction(): Promise<
  ActionResult<{ context: UserLeadershipContext; data: HeadmasterOverviewDTO }>
> {
  try {
    const user = await requireAuth();
    const result = await leadershipAnalyticsService.getHeadmasterOverview(user);
    return { success: true, data: result };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Gagal mengambil data dashboard kepala sekolah.",
    };
  }
}

export async function getCurriculumOverviewAction(): Promise<
  ActionResult<{ context: UserLeadershipContext; data: CurriculumOverviewDTO }>
> {
  try {
    const user = await requireAuth();
    const result = await leadershipAnalyticsService.getCurriculumOverview(user);
    return { success: true, data: result };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Gagal mengambil data dashboard kurikulum.",
    };
  }
}

export async function getStudentAffairsOverviewAction(): Promise<
  ActionResult<{ context: UserLeadershipContext; data: StudentAffairsOverviewDTO }>
> {
  try {
    const user = await requireAuth();
    const result = await leadershipAnalyticsService.getStudentAffairsOverview(user);
    return { success: true, data: result };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Gagal mengambil data dashboard kesiswaan.",
    };
  }
}

export async function getProgramHeadOverviewAction(
  programId?: string
): Promise<ActionResult<{ context: UserLeadershipContext; data: ProgramHeadOverviewDTO }>> {
  try {
    const user = await requireAuth();
    const result = await leadershipAnalyticsService.getProgramHeadOverview(user, programId);
    return { success: true, data: result };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Gagal mengambil data dashboard kepala program.",
    };
  }
}

export async function getExportHistoryAction(): Promise<ActionResult<RiwayatEksporItemDTO[]>> {
  try {
    const user = await requireAuth();
    const history = await leadershipAnalyticsService.getExportHistory(user);
    return { success: true, data: history };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Gagal mengambil riwayat ekspor.",
    };
  }
}

export async function exportAttendanceCsvAction(
  filters?: ReportFilterInput
): Promise<ActionResult<{ filename: string; csvContent: string; totalRows: number }>> {
  try {
    const user = await requireAuth();
    const result = await leadershipAnalyticsService.exportAttendanceCsv(user, filters);
    return { success: true, data: result };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Gagal membuat ekspor presensi CSV.",
    };
  }
}

export async function exportAcademicCsvAction(
  filters?: ReportFilterInput
): Promise<ActionResult<{ filename: string; csvContent: string; totalRows: number }>> {
  try {
    const user = await requireAuth();
    const result = await leadershipAnalyticsService.exportAcademicCsv(user, filters);
    return { success: true, data: result };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Gagal membuat ekspor nilai akademik CSV.",
    };
  }
}

export async function getExecutivePrintDataAction(): Promise<ActionResult<ExecutiveReportData>> {
  try {
    const user = await requireAuth();
    const data = await leadershipAnalyticsService.getExecutiveReportData(user);
    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Gagal menyiapkan dokumen eksekutif.",
    };
  }
}
