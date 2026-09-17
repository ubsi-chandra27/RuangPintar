"use client";

import * as React from "react";
import {
  ShieldCheck,
  BookOpen,
  Users,
  Wrench,
  FileSpreadsheet,
  Building2,
  Calendar,
  ChevronDown,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  UserLeadershipContext,
  LeadershipPositionType,
  HeadmasterOverviewDTO,
  CurriculumOverviewDTO,
  StudentAffairsOverviewDTO,
  ProgramHeadOverviewDTO,
  RiwayatEksporItemDTO,
  ExecutiveReportData,
} from "../domain/reporting-types";
import { HeadmasterView } from "./headmaster-view";
import { CurriculumAnalyticsView } from "./curriculum-analytics-view";
import { StudentAffairsView } from "./student-affairs-view";
import { ProgramHeadView } from "./program-head-view";
import { ReportExportCenter } from "./report-export-center";
import { ExecutivePrintModal } from "./executive-print-modal";
import {
  getHeadmasterOverviewAction,
  getCurriculumOverviewAction,
  getStudentAffairsOverviewAction,
  getProgramHeadOverviewAction,
  getExportHistoryAction,
  getExecutivePrintDataAction,
} from "@/app/actions/leadership-actions";

export interface LeadershipPortalViewProps {
  initialContext: UserLeadershipContext;
  initialHeadmasterData?: HeadmasterOverviewDTO | null;
  initialCurriculumData?: CurriculumOverviewDTO | null;
  initialStudentAffairsData?: StudentAffairsOverviewDTO | null;
  initialProgramHeadData?: ProgramHeadOverviewDTO | null;
  initialExportHistory?: RiwayatEksporItemDTO[];
}

export function LeadershipPortalView({
  initialContext,
  initialHeadmasterData,
  initialCurriculumData,
  initialStudentAffairsData,
  initialProgramHeadData,
  initialExportHistory = [],
}: LeadershipPortalViewProps) {
  // Active Tab state
  const defaultTab =
    initialContext.active_role === "HEADMASTER"
      ? "ringkasan"
      : initialContext.active_role === "VICE_PRINCIPAL_CURRICULUM"
        ? "kurikulum"
        : initialContext.active_role === "VICE_PRINCIPAL_STUDENT_AFFAIRS"
          ? "kesiswaan"
          : initialContext.active_role === "PROGRAM_HEAD"
            ? "program"
            : "ringkasan";

  const [activeTab, setActiveTab] = React.useState<string>(defaultTab);
  const [activeRole, setActiveRole] = React.useState<LeadershipPositionType>(
    initialContext.active_role
  );

  // Data states
  const [headmasterData, setHeadmasterData] = React.useState<HeadmasterOverviewDTO | null>(
    initialHeadmasterData ?? null
  );
  const [curriculumData, setCurriculumData] = React.useState<CurriculumOverviewDTO | null>(
    initialCurriculumData ?? null
  );
  const [studentAffairsData, setStudentAffairsData] =
    React.useState<StudentAffairsOverviewDTO | null>(initialStudentAffairsData ?? null);
  const [programHeadData, setProgramHeadData] = React.useState<ProgramHeadOverviewDTO | null>(
    initialProgramHeadData ?? null
  );
  const [exportHistory, setExportHistory] =
    React.useState<RiwayatEksporItemDTO[]>(initialExportHistory);

  // Print Modal state
  const [isPrintModalOpen, setIsPrintModalOpen] = React.useState(false);
  const [printData, setPrintData] = React.useState<ExecutiveReportData | null>(null);

  // Loading state
  const [isLoading, setIsLoading] = React.useState(false);

  // Load data for active tab if missing
  React.useEffect(() => {
    let isCancelled = false;

    async function loadTabData() {
      if (activeTab === "ringkasan" && !headmasterData) {
        setIsLoading(true);
        const res = await getHeadmasterOverviewAction();
        if (!isCancelled && res.success && res.data) {
          setHeadmasterData(res.data.data);
        }
        if (!isCancelled) setIsLoading(false);
      } else if (activeTab === "kurikulum" && !curriculumData) {
        setIsLoading(true);
        const res = await getCurriculumOverviewAction();
        if (!isCancelled && res.success && res.data) {
          setCurriculumData(res.data.data);
        }
        if (!isCancelled) setIsLoading(false);
      } else if (activeTab === "kesiswaan" && !studentAffairsData) {
        setIsLoading(true);
        const res = await getStudentAffairsOverviewAction();
        if (!isCancelled && res.success && res.data) {
          setStudentAffairsData(res.data.data);
        }
        if (!isCancelled) setIsLoading(false);
      } else if (activeTab === "program" && !programHeadData) {
        setIsLoading(true);
        const res = await getProgramHeadOverviewAction();
        if (!isCancelled && res.success && res.data) {
          setProgramHeadData(res.data.data);
        }
        if (!isCancelled) setIsLoading(false);
      } else if (activeTab === "ekspor" && exportHistory.length === 0) {
        const res = await getExportHistoryAction();
        if (!isCancelled && res.success && res.data) {
          setExportHistory(res.data);
        }
      }
    }

    loadTabData();

    return () => {
      isCancelled = true;
    };
  }, [
    activeTab,
    headmasterData,
    curriculumData,
    studentAffairsData,
    programHeadData,
    exportHistory.length,
  ]);

  const handleOpenPrint = async () => {
    setIsPrintModalOpen(true);
    if (!printData) {
      const res = await getExecutivePrintDataAction();
      if (res.success && res.data) {
        setPrintData(res.data);
      }
    }
  };

  const handleRefreshHistory = async () => {
    const res = await getExportHistoryAction();
    if (res.success && res.data) {
      setExportHistory(res.data);
    }
  };

  const handleRoleSelect = (roleCode: LeadershipPositionType) => {
    setActiveRole(roleCode);
    if (roleCode === "HEADMASTER") setActiveTab("ringkasan");
    else if (roleCode === "VICE_PRINCIPAL_CURRICULUM") setActiveTab("kurikulum");
    else if (roleCode === "VICE_PRINCIPAL_STUDENT_AFFAIRS") setActiveTab("kesiswaan");
    else if (roleCode === "PROGRAM_HEAD") setActiveTab("program");
  };

  const tabs = [
    {
      id: "ringkasan",
      label: "Kepala Sekolah",
      icon: ShieldCheck,
      role: "HEADMASTER",
    },
    {
      id: "kurikulum",
      label: "Kurikulum",
      icon: BookOpen,
      role: "VICE_PRINCIPAL_CURRICULUM",
    },
    {
      id: "kesiswaan",
      label: "Kesiswaan",
      icon: Users,
      role: "VICE_PRINCIPAL_STUDENT_AFFAIRS",
    },
    {
      id: "program",
      label: "Program Keahlian",
      icon: Wrench,
      role: "PROGRAM_HEAD",
    },
    {
      id: "ekspor",
      label: "Pusat Laporan & Ekspor",
      icon: FileSpreadsheet,
      role: "ALL",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. PORTAL HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold">
              M19 — Reporting & Analytics
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500">
              {initialContext.sekolah_nama}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Portal Kepemimpinan & Laporan Sekolah
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Sistem evaluasi mutu, analitik lintas rombel, dan rekapitulasi pelaporan manajemen
            sekolah.
          </p>
        </div>

        {/* ROLE SWITCHER FOR MULTI-ROLE OR SUPER ADMIN */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {initialContext.can_switch_roles && (
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 pl-2">Jabatan:</span>
              <select
                value={activeRole}
                onChange={(e) => handleRoleSelect(e.target.value as LeadershipPositionType)}
                className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {initialContext.roles.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200/80 shadow-sm text-xs font-semibold text-slate-700">
            <Calendar className="h-4 w-4 text-[#2563EB]" />
            <span>T.A 2026/2027 Ganjil</span>
          </div>
        </div>
      </div>

      {/* 2. SUB-TAB BAR */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "border-[#2563EB] text-[#2563EB] bg-blue-50/50 rounded-t-xl"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. ACTIVE TAB CONTENT */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-xs text-slate-500 font-medium">
            Mengagregasi data analitik dan read model lintas modul...
          </p>
        </div>
      ) : (
        <div>
          {activeTab === "ringkasan" && headmasterData && (
            <HeadmasterView
              data={headmasterData}
              onOpenPrintModal={handleOpenPrint}
              onSwitchTab={setActiveTab}
            />
          )}

          {activeTab === "kurikulum" && curriculumData && (
            <CurriculumAnalyticsView data={curriculumData} onSwitchTab={setActiveTab} />
          )}

          {activeTab === "kesiswaan" && studentAffairsData && (
            <StudentAffairsView data={studentAffairsData} onSwitchTab={setActiveTab} />
          )}

          {activeTab === "program" && programHeadData && (
            <ProgramHeadView data={programHeadData} onSwitchTab={setActiveTab} />
          )}

          {activeTab === "ekspor" && (
            <ReportExportCenter
              history={exportHistory}
              onOpenPrintModal={handleOpenPrint}
              onRefreshHistory={handleRefreshHistory}
            />
          )}
        </div>
      )}

      {/* 4. PRINT PREVIEW MODAL */}
      <ExecutivePrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        reportData={printData}
      />
    </div>
  );
}
