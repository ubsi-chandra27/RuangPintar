"use client";

import * as React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  Building2,
  Calendar,
  School,
  User,
  Plug,
  Smartphone,
  Laptop,
  Tablet,
  Activity,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  UserCheck,
  Shield,
  Layers,
  ChevronRight,
  X,
  Eye,
  FileSpreadsheet,
  Check,
  CreditCard,
  History,
  BookOpen,
  Filter,
} from "lucide-react";
import { SystemStatusIndicator } from "@/shared/components/dashboard/system-status-indicator";
import { ConcentricRingGauge } from "@/shared/components/motion/concentric-ring-gauge";
import { AnimatedCounter } from "@/shared/components/motion/animated-counter";

export interface SuperAdminDashboardViewProps {
  user: {
    nama_lengkap: string;
    peran_dasar: string;
    username: string;
  };
  stats: {
    totalSiswa: number;
    totalGuru: number;
    totalSekolah: number;
    totalSekolahFreemium: number;
    totalSekolahInstitusi: number;
    totalRombel: number;
    totalSesiAktual: number;
  };
  attendance: {
    totalPresensiRecorded: number;
    totalPresensiHadir: number;
    totalPresensiIzinSakit: number;
    totalPresensiAlpha: number;
    hadirPct: number;
    izinSakitPct: number;
    alphaPct: number;
  };
  rombelList: Array<{
    id: string;
    nama: string;
    siswaCount: number;
    mapelNama: string;
    guruNama: string;
    completion: number;
    sessionCount: number;
  }>;
  sekolahList: Array<{
    id: string;
    nama: string;
    jenjang: string;
    tipe_lisensi: string;
    rombelCount: number;
    guruKontak: string;
  }>;
  guruList: Array<{
    id: string;
    nama_lengkap: string;
    email: string | null;
    sekolahNama: string;
    penugasanCount: number;
  }>;
  auditLogs: Array<{
    id: string;
    aktor_role: string;
    aksi: string;
    tipe_sumber: string;
    id_sumber: string;
    dibuat_pada: string;
    timeAgo: string;
    payload_sebelum?: string | null;
    payload_sesudah?: string | null;
    ip_address?: string | null;
  }>;
  deviceStats: {
    mobilePct: number;
    desktopPct: number;
    sesiList: Array<{
      id: string;
      nama: string;
      sekolah: string;
      deviceType: "mobile" | "tablet" | "desktop";
      deviceBrand: string;
      presenceLabel: string;
      presenceBadgeClass: string;
      presenceDotClass: string;
    }>;
  };
}

export function SuperAdminDashboardView({
  user,
  stats,
  attendance,
  rombelList,
  sekolahList,
  guruList,
  auditLogs,
  deviceStats,
}: SuperAdminDashboardViewProps) {
  // Behance LMS Tab Navigation
  const [activeTab, setActiveTab] = React.useState<
    "overview" | "instructors" | "courses" | "financials" | "audit"
  >("overview");

  // Selected Log for Activity Detail Modal (Smooth Zoom In/Out)
  const [selectedLog, setSelectedLog] = React.useState<(typeof auditLogs)[0] | null>(null);
  const [isClosingModal, setIsClosingModal] = React.useState(false);

  const handleOpenLogModal = (log: (typeof auditLogs)[0]) => {
    setSelectedLog(log);
    setIsClosingModal(false);
  };

  const handleCloseLogModal = React.useCallback(() => {
    setIsClosingModal(true);
    setTimeout(() => {
      setSelectedLog(null);
      setIsClosingModal(false);
    }, 200);
  }, []);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedLog) {
        handleCloseLogModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedLog, handleCloseLogModal]);

  return (
    <div className="relative space-y-7 pb-16 font-century overflow-hidden">
      {/* ─────────────────────────────────────────────────────────────
          1. TOPBAR & DASHBOARD HEADER (Clean & Minimalist, No Radial Gradient Blob)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-1">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Dashboard Super Admin
            </h1>
            {/* Year Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 dark:bg-cyan-500/15 border border-blue-400/40 dark:border-cyan-400/50 text-[11px] font-bold text-blue-700 dark:text-cyan-300 shadow-xs">
              <Calendar className="size-3 text-blue-600 dark:text-cyan-400" />
              <span>Tahun Ajaran 2026/2027</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pusat pemantauan ekosistem SaaS: adopsi sekolah, guru mandiri, dan operasional akademik.
          </p>
        </div>

        {/* Right Controls: Period Selector Pill + Live System Status */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {/* Period Dropdown Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 dark:bg-blue-600 text-white text-xs font-bold font-century shadow-md shadow-slate-900/10 cursor-pointer transition-transform hover:scale-102 active:scale-95">
            <span>Semester Ganjil 2026/2027</span>
            <ChevronDown className="size-3.5 opacity-80" />
          </div>

          {/* Signal Indicator */}
          <div className="p-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 shadow-xs border border-slate-200/60 dark:border-slate-800">
            <SystemStatusIndicator initialStatus="normal" />
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. BEHANCE LMS NAVIGATION TABS (Overview, Instructors, Courses, Financials, Audit)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-slate-200/70 dark:border-slate-800/80">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "overview"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Layers className="size-3.5" />
          <span>Ringkasan Utama</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("instructors")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "instructors"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <GraduationCap className="size-3.5" />
          <span>Manajemen Pengajar ({stats.totalGuru})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("courses")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "courses"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Building2 className="size-3.5" />
          <span>Rombel & Kelas ({stats.totalRombel})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("financials")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "financials"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <CreditCard className="size-3.5" />
          <span>Keuangan & Lisensi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "audit"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <History className="size-3.5" />
          <span>Audit Log Sistem ({auditLogs.length})</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. KEY METRICS ROW (Academic Glass UI v1.2 & 100% Real Data)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Siswa Terdata */}
        <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/60 dark:border-slate-800/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div className="size-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="size-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">
              <span>Real Siswa</span>
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Siswa Terdata
            </span>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              <AnimatedCounter value={stats.totalSiswa} />
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              {stats.totalSiswa > 0
                ? `${stats.totalSiswa} siswa terdaftar di database`
                : "Belum ada siswa terdaftar"}
            </p>
          </div>
        </div>

        {/* Card 2: Guru Terdaftar (SaaS) */}
        <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/60 dark:border-slate-800/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div className="size-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <GraduationCap className="size-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              <span>{stats.totalGuru > 0 ? "Aktif" : "0 Guru"}</span>
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Guru Terdaftar (SaaS)
            </span>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              <AnimatedCounter value={stats.totalGuru} />
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              {stats.totalGuru > 0
                ? `${stats.totalGuru} pendidik siap mengajar & mengelola KBM`
                : "Belum ada guru yang mendaftar"}
            </p>
          </div>
        </div>

        {/* Card 3: Total Sekolah Pengguna */}
        <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/60 dark:border-slate-800/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div className="size-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <School className="size-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full">
              <span>{stats.totalSekolahInstitusi} Institusi</span>
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Sekolah Pengguna
            </span>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              <AnimatedCounter value={stats.totalSekolah} />
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              {stats.totalSekolahFreemium} Freemium • {stats.totalSekolahInstitusi} Lisensi Penuh
            </p>
          </div>
        </div>

        {/* Card 4: Total Rombel / Kelas */}
        <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/60 dark:border-slate-800/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div className="size-11 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Building2 className="size-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full">
              <span>{stats.totalRombel > 0 ? "Rombel Aktif" : "0 Rombel"}</span>
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Rombel / Kelas
            </span>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              <AnimatedCounter value={stats.totalRombel} />
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              {stats.totalRombel > 0
                ? `${stats.totalRombel} rombongan belajar terjadwal`
                : "Belum ada rombel terdaftar"}
            </p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. TAB CONTENT 1: RINGKASAN UTAMA (Overview)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-7 animate-in fade-in-0 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
            {/* Left 7 Columns: Performa Rombongan Belajar & KBM (100% Real Data) */}
            <div className="lg:col-span-7 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/60 dark:border-slate-800/80">
              <div className="flex items-center justify-between pb-5">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Performa Rombongan Belajar & KBM
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Data riil tingkat kehadiran & siswa terdaftar di setiap kelas
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold">
                  <span>Data Riil</span>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto no-scrollbar pt-1">
                {rombelList.length > 0 ? (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800">
                        <th className="pb-3 pr-4 font-semibold">Nama Kelas & Guru</th>
                        <th className="pb-3 pr-4 font-semibold">Siswa & Mapel</th>
                        <th className="pb-3 text-right font-semibold">Status KBM</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/80">
                      {rombelList.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
                        >
                          <td className="py-3.5 pr-4">
                            <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm group-hover:text-blue-600 transition-colors">
                              {item.nama}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {item.guruNama}
                            </div>
                          </td>
                          <td className="py-3.5 pr-4">
                            <div className="font-semibold text-slate-700 dark:text-slate-300">
                              {item.siswaCount} Siswa Terdaftar
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {item.mapelNama}
                            </div>
                          </td>
                          <td className="py-3.5 text-right">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {item.sessionCount > 0
                                ? `${item.completion}% Kehadiran`
                                : "0 Sesi KBM"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <Building2 className="size-8 mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="text-xs font-semibold">
                      Belum ada rombongan belajar aktif terdaftar di sistem.
                    </p>
                    <Link
                      href="/rombel"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
                    >
                      <span>+ Buat Rombel Sekarang</span>
                      <ArrowRight className="size-3" />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right 5 Columns: Learner Engagement Gauge + Real Audit Activity */}
            <div className="lg:col-span-5 space-y-7">
              {/* Card 1: Learner Engagement Ring Gauge */}
              <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/60 dark:border-slate-800/80">
                <div className="flex items-center justify-between pb-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Learner Engagement
                  </h2>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Keaktifan Siswa
                  </span>
                </div>

                <div className="pt-2">
                  <ConcentricRingGauge
                    title=""
                    subtitle=""
                    centerValue={attendance.hadirPct}
                    centerLabel={
                      attendance.totalPresensiRecorded > 0
                        ? "Rata-rata Kehadiran"
                        : "0 Sesi Masuk"
                    }
                    segments={[
                      {
                        id: "hadir",
                        label: "Siswa Hadir Tepat Waktu",
                        count: attendance.totalPresensiHadir,
                        percentage: attendance.hadirPct,
                        color: "#2563EB",
                        strokeColor: "#2563EB",
                        bgColor: "bg-blue-500",
                      },
                      {
                        id: "izinsakit",
                        label: "Izin & Sakit Terverifikasi",
                        count: attendance.totalPresensiIzinSakit,
                        percentage: attendance.izinSakitPct,
                        color: "#F59E0B",
                        strokeColor: "#F59E0B",
                        bgColor: "bg-amber-500",
                      },
                      {
                        id: "alpha",
                        label: "Alpha / Perlu Perhatian",
                        count: attendance.totalPresensiAlpha,
                        percentage: attendance.alphaPct,
                        color: "#F43F5E",
                        strokeColor: "#F43F5E",
                        bgColor: "bg-rose-500",
                      },
                    ]}
                  />
                </div>

                {attendance.totalPresensiRecorded === 0 && (
                  <p className="mt-3 text-center text-[11px] text-slate-400 dark:text-slate-500">
                    Belum ada presensi sesi KBM masuk pada semester ini (data 0 riil).
                  </p>
                )}
              </div>

              {/* Card 2: Recent Activity (Real from Prisma LogAudit) */}
              <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/60 dark:border-slate-800/80">
                <div className="flex items-center justify-between pb-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    Aktivitas Terkini
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab("audit")}
                    className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                  >
                    Lihat Semua
                  </button>
                </div>

                <div className="space-y-3">
                  {auditLogs.length > 0 ? (
                    auditLogs.slice(0, 4).map((log) => (
                      <div
                        key={log.id}
                        onClick={() => handleOpenLogModal(log)}
                        className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                      >
                        <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                          {log.aksi === "CREATE"
                            ? "+"
                            : log.aksi === "DELETE"
                            ? "×"
                            : "✎"}
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug truncate">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {log.aktor_role}
                            </span>{" "}
                            {log.aksi.toLowerCase()}{" "}
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                              {log.tipe_sumber}
                            </span>
                          </p>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {log.timeAgo}
                          </span>
                        </div>
                        <Eye className="size-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                    ))
                  ) : (
                    <p className="py-6 text-center text-xs text-slate-400">
                      Belum ada aktivitas tercatat hari ini.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              5. BOTTOM SECTION: Ringkasan Aktivitas Pembelajaran & Aksi Cepat
          ───────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch">
            {/* Left 6 Columns: Ringkasan Aktivitas Pembelajaran (Dual Wave or Empty Status) */}
            <div className="lg:col-span-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/60 dark:border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                      Ringkasan Aktivitas Pembelajaran
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Tren sesi KBM terlaksana per hari
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-bold">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-blue-600" />
                      <span className="text-slate-600 dark:text-slate-300">Periode Berjalan</span>
                    </div>
                  </div>
                </div>

                {/* Real SVG Chart or Clean State */}
                <div className="pt-6 relative">
                  <svg className="w-full h-36 overflow-visible" viewBox="0 0 500 120">
                    <defs>
                      <linearGradient id="realWaveGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal grid lines */}
                    <line x1="0" y1="25" x2="500" y2="25" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="3 3" />
                    <line x1="0" y1="65" x2="500" y2="65" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="3 3" />
                    <line x1="0" y1="105" x2="500" y2="105" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="3 3" />

                    {/* Area path */}
                    <path
                      d="M 20 100 Q 100 100, 180 100 T 340 100 T 480 100 L 480 110 L 20 110 Z"
                      fill="url(#realWaveGrad)"
                    />
                    <path
                      d="M 20 100 Q 100 100, 180 100 T 340 100 T 480 100"
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>

                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 pt-2 px-2">
                    <span>Senin</span>
                    <span>Selasa</span>
                    <span>Rabu</span>
                    <span>Kamis</span>
                    <span>Jumat</span>
                    <span>Sabtu</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Total {stats.totalSesiAktual} sesi KBM tercatat di sistem</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalSesiAktual > 0 ? "Sesi Aktif" : "Belum Ada Sesi Dimulai"}
                </span>
              </div>
            </div>

            {/* Right 6 Columns: Aksi Cepat Super Admin */}
            <div className="lg:col-span-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/60 dark:border-slate-800/80 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-4">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Aksi Cepat Super Admin
                </h3>
                <span className="text-xs text-slate-400 font-medium">Navigasi Langsung</span>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <Link
                  href="/sekolah"
                  className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 hover:bg-blue-50/80 dark:hover:bg-blue-950/40 transition-all flex flex-col items-center text-center gap-2 group cursor-pointer"
                >
                  <div className="size-10 rounded-xl bg-blue-100/60 dark:bg-blue-900/50 text-[#2563EB] dark:text-blue-400 group-hover:bg-[#2563EB] group-hover:text-white flex items-center justify-center transition-colors">
                    <School className="size-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Kelola Sekolah
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Profil & lisensi
                    </span>
                  </div>
                </Link>

                <Link
                  href="/guru-pengajaran"
                  className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 transition-all flex flex-col items-center text-center gap-2 group cursor-pointer"
                >
                  <div className="size-10 rounded-xl bg-emerald-100/60 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors">
                    <Users className="size-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Data Guru
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Pendidik & penugasan
                    </span>
                  </div>
                </Link>

                <Link
                  href="/data-siswa"
                  className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 hover:bg-purple-50/80 dark:hover:bg-purple-950/40 transition-all flex flex-col items-center text-center gap-2 group cursor-pointer"
                >
                  <div className="size-10 rounded-xl bg-purple-100/60 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition-colors">
                    <GraduationCap className="size-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Data Siswa
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Rombel & penempatan
                    </span>
                  </div>
                </Link>

                <Link
                  href="/integrasi"
                  className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 hover:bg-amber-50/80 dark:hover:bg-amber-950/40 transition-all flex flex-col items-center text-center gap-2 group cursor-pointer"
                >
                  <div className="size-10 rounded-xl bg-amber-100/60 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center transition-colors">
                    <Plug className="size-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Integrasi Gateway
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      WhatsApp & Webhook
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. TAB CONTENT 2: MANAJEMEN PENGAJAR (Instructors)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "instructors" && (
        <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/60 dark:border-slate-800/80 animate-in fade-in-0 duration-300">
          <div className="flex items-center justify-between pb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Daftar Pendidik Terdaftar (SaaS Instructors)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Total {stats.totalGuru} guru terdaftar aktif di platform Ruang Pintar
              </p>
            </div>
            <Link
              href="/guru-pengajaran"
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5"
            >
              <span>+ Kelola Penugasan Guru</span>
            </Link>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            {guruList.length > 0 ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800">
                    <th className="pb-3 pr-4">Nama Pendidik</th>
                    <th className="pb-3 pr-4">Sekolah Induk</th>
                    <th className="pb-3 pr-4">Penugasan KBM</th>
                    <th className="pb-3 text-right">Status Akun</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/80">
                  {guruList.map((g) => (
                    <tr
                      key={g.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 pr-4 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                        <div className="size-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {g.nama_lengkap.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span>{g.nama_lengkap}</span>
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {g.email || "Email belum diset"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 text-slate-600 dark:text-slate-300 font-medium">
                        {g.sekolahNama}
                      </td>
                      <td className="py-3.5 pr-4 text-slate-600 dark:text-slate-300">
                        {g.penugasanCount > 0 ? (
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {g.penugasanCount} Mapel Aktif
                          </span>
                        ) : (
                          <span className="text-slate-400">Belum Ditugaskan</span>
                        )}
                      </td>
                      <td className="py-3.5 text-right">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                          Aktif
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <GraduationCap className="size-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-semibold">Belum ada guru yang mendaftar di sistem.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. TAB CONTENT 3: KELAS & ROMBEL (Courses)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "courses" && (
        <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/60 dark:border-slate-800/80 animate-in fade-in-0 duration-300">
          <div className="flex items-center justify-between pb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Katalog Rombongan Belajar & Penilaian
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Total {stats.totalRombel} rombel terdaftar di Kurikulum Merdeka
              </p>
            </div>
            <Link
              href="/rombel"
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5"
            >
              <span>+ Tambah Rombel</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rombelList.length > 0 ? (
              rombelList.map((r) => (
                <div
                  key={r.id}
                  className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 hover:border-blue-500/50 transition-all flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {r.nama}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                        {r.siswaCount} Siswa
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {r.guruNama}
                    </p>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      Mapel: {r.mapelNama}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Sesi Terlaksana</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {r.sessionCount} Sesi
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-400">
                <p className="text-xs font-semibold">Belum ada rombel terdaftar di sistem.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          7. TAB CONTENT 4: KEUANGAN & LISENSI (Financials)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "financials" && (
        <div className="space-y-6 animate-in fade-in-0 duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 border border-white/60 dark:border-slate-800/80 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Paket Freemium (Trial)
              </span>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {stats.totalSekolahFreemium} Sekolah
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Akses uji coba penuh 30 hari</p>
            </div>

            <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 border border-white/60 dark:border-slate-800/80 shadow-sm">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                Lisensi Sekolah (Institusi)
              </span>
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {stats.totalSekolahInstitusi} Sekolah
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Berlangganan penuh multi-guru</p>
            </div>

            <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 border border-white/60 dark:border-slate-800/80 shadow-sm">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                Guru Pro Mandiri
              </span>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                Rp 15.000
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Per bulan via Midtrans QRIS</p>
            </div>
          </div>

          <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/60 dark:border-slate-800/80">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Daftar Sekolah & Status Lisensi Terkini
            </h3>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800">
                    <th className="pb-3 pr-4">Nama Sekolah</th>
                    <th className="pb-3 pr-4">Jenjang</th>
                    <th className="pb-3 pr-4">Paket Lisensi</th>
                    <th className="pb-3 text-right">Rombel Aktif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/80">
                  {sekolahList.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 pr-4 font-bold text-slate-900 dark:text-white">
                        {s.nama}
                      </td>
                      <td className="py-3.5 pr-4 text-slate-600 dark:text-slate-300">
                        {s.jenjang}
                      </td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            s.tipe_lisensi === "FREEMIUM"
                              ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600"
                              : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600"
                          }`}
                        >
                          {s.tipe_lisensi}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-semibold text-slate-700 dark:text-slate-200">
                        {s.rombelCount} Kelas
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          8. TAB CONTENT 5: AUDIT LOG SISTEM (System Control)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "audit" && (
        <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/60 dark:border-slate-800/80 animate-in fade-in-0 duration-300">
          <div className="flex items-center justify-between pb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Linimasa Audit Log Sistem (Security & Compliance)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Rekam jejak seluruh tindakan pengguna dan mutasi data (Append-only)
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-xs font-bold">
              ✓ Immutable Log
            </span>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            {auditLogs.length > 0 ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800">
                    <th className="pb-3 pr-4">Waktu</th>
                    <th className="pb-3 pr-4">Peran Pengguna</th>
                    <th className="pb-3 pr-4">Tindakan</th>
                    <th className="pb-3 pr-4">Modul / Entitas</th>
                    <th className="pb-3 text-right">Rincian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/80">
                  {auditLogs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => handleOpenLogModal(log)}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 pr-4 text-slate-500 font-mono text-[11px]">
                        {log.timeAgo}
                      </td>
                      <td className="py-3.5 pr-4 font-bold text-slate-800 dark:text-slate-100">
                        {log.aktor_role}
                      </td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                            log.aksi === "CREATE"
                              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                              : log.aksi === "UPDATE"
                              ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                              : log.aksi === "DELETE"
                              ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {log.aksi}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 font-semibold text-slate-700 dark:text-slate-300">
                        {log.tipe_sumber}
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          type="button"
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="size-3" />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <p className="text-xs font-semibold">Belum ada audit log tercatat.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          9. ACTIVITY DETAILS MODAL (Smooth Zoom-In on Open, Zoom-Out on Close)
      ───────────────────────────────────────────────────────────── */}
      {selectedLog && (
        <div
          role="dialog"
          aria-modal="true"
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity duration-200 ease-out ${
            isClosingModal ? "opacity-0" : "opacity-100 animate-in fade-in-0"
          }`}
          onClick={handleCloseLogModal}
        >
          <div
            className={`relative w-full max-w-lg rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl p-6 sm:p-7 shadow-2xl border border-white/60 dark:border-slate-800 text-left transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu ${
              isClosingModal
                ? "scale-90 opacity-0"
                : "scale-100 opacity-100 animate-in zoom-in-95 duration-200"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                  {selectedLog.aksi === "CREATE"
                    ? "+"
                    : selectedLog.aksi === "DELETE"
                    ? "×"
                    : "✎"}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Rincian Audit Log
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {selectedLog.id}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseLogModal}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Pelaku (Aktor)
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {selectedLog.aktor_role}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Tindakan
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 mt-0.5 block">
                    {selectedLog.aksi}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Modul Terkait
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5 block">
                    {selectedLog.tipe_sumber}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Waktu Transaksi
                  </span>
                  <span className="font-medium text-slate-600 dark:text-slate-400 mt-0.5 block font-mono text-[11px]">
                    {selectedLog.dibuat_pada}
                  </span>
                </div>
              </div>

              {selectedLog.payload_sesudah && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 block">
                    Snapshot Data (JSON):
                  </span>
                  <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 text-[10px] font-mono overflow-x-auto max-h-48 whitespace-pre-wrap leading-relaxed">
                    {selectedLog.payload_sesudah}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={handleCloseLogModal}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
