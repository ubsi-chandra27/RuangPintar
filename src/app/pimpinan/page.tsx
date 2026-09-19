import { Metadata } from "next";
import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { resolveUserCapabilities } from "@/shared/infrastructure/authorization/staff-capability-service";
import { AcademicShell } from "@/shared/components/shell/academic-shell";
import { leadershipAnalyticsService } from "@/modules/reporting/application/leadership-analytics-service";
import { LeadershipPortalView } from "@/modules/reporting/presentation/leadership-portal-view";
import {
  UserLeadershipContext,
  HeadmasterOverviewDTO,
  CurriculumOverviewDTO,
  StudentAffairsOverviewDTO,
  ProgramHeadOverviewDTO,
  RiwayatEksporItemDTO,
} from "@/modules/reporting/domain/reporting-types";
import { ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Portal Kepemimpinan & Laporan — Ruang Pintar",
  description:
    "Dashboard pimpinan sekolah, evaluasi kurikulum, kesiswaan, dan pusat ekspor laporan.",
};

export default async function LeadershipPage() {
  const user = await requireAuth();

  const capabilities = await resolveUserCapabilities(user);

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Portal Kepemimpinan & Laporan", href: "/pimpinan", isCurrent: true },
  ];

  let leadershipContext: UserLeadershipContext | null = null;
  let initialHeadmasterData: HeadmasterOverviewDTO | null = null;
  let initialCurriculumData: CurriculumOverviewDTO | null = null;
  let initialStudentAffairsData: StudentAffairsOverviewDTO | null = null;
  let initialProgramHeadData: ProgramHeadOverviewDTO | null = null;
  let initialExportHistory: RiwayatEksporItemDTO[] = [];
  let authError: string | null = null;

  try {
    leadershipContext = await leadershipAnalyticsService.resolveLeadershipContext(user);

    // Prefetch data awal sesuai active_role
    if (leadershipContext.active_role === "HEADMASTER") {
      const res = await leadershipAnalyticsService.getHeadmasterOverview(user);
      initialHeadmasterData = res.data;
    } else if (leadershipContext.active_role === "VICE_PRINCIPAL_CURRICULUM") {
      const res = await leadershipAnalyticsService.getCurriculumOverview(user);
      initialCurriculumData = res.data;
    } else if (leadershipContext.active_role === "VICE_PRINCIPAL_STUDENT_AFFAIRS") {
      const res = await leadershipAnalyticsService.getStudentAffairsOverview(user);
      initialStudentAffairsData = res.data;
    } else if (leadershipContext.active_role === "PROGRAM_HEAD") {
      const res = await leadershipAnalyticsService.getProgramHeadOverview(user);
      initialProgramHeadData = res.data;
    }

    initialExportHistory = await leadershipAnalyticsService.getExportHistory(user);
  } catch (err: any) {
    authError =
      err.message ||
      "Akses ditolak. Anda tidak memiliki penugasan jabatan struktural aktif pada sistem.";
  }

  return (
    <AcademicShell user={user} userCapabilities={capabilities} breadcrumbItems={breadcrumbItems}>
      {authError || !leadershipContext ? (
        <div className="rounded-3xl bg-white dark:bg-slate-900/80 dark:backdrop-blur-xl border border-rose-200/80 dark:border-rose-500/20 p-8 text-center max-w-xl mx-auto my-12 shadow-sm">
          <div className="h-14 w-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-900/50">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Akses Kepemimpinan Ditolak (403 Forbidden)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            {authError ??
              "Halaman ini hanya dapat diakses oleh personil yang memegang Penugasan Jabatan struktural aktif (Kepala Sekolah, Wakasek, atau Kepala Program Keahlian) dan Super Admin."}
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            Kembali ke Dashboard Utama
          </a>
        </div>
      ) : (
        <LeadershipPortalView
          initialContext={leadershipContext}
          initialHeadmasterData={initialHeadmasterData}
          initialCurriculumData={initialCurriculumData}
          initialStudentAffairsData={initialStudentAffairsData}
          initialProgramHeadData={initialProgramHeadData}
          initialExportHistory={initialExportHistory}
        />
      )}
    </AcademicShell>
  );
}
