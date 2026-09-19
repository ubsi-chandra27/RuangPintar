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
  X,
  Eye,
  Sparkles,
  CheckCircle2,
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
  user: _user,
  stats,
  attendance,
  rombelList,
  sekolahList,
  guruList: _guruList,
  auditLogs,
  deviceStats,
}: SuperAdminDashboardViewProps) {
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
    <div className="relative space-y-6 sm:space-y-7 pb-16 font-century overflow-hidden pt-2 sm:pt-1">
      {/* ─────────────────────────────────────────────────────────────
          1. TOPBAR & DASHBOARD HEADER (Behance LMS Top Nav Bar)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Dashboard Super Admin
            </h1>
            {/* Year Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 dark:bg-cyan-500/15 border border-blue-400/40 dark:border-cyan-400/50 text-[11px] font-bold text-blue-700 dark:text-cyan-300 shadow-xs whitespace-nowrap">
              <Calendar className="size-3 text-blue-600 dark:text-cyan-400 shrink-0" />
              <span>Tahun Ajaran 2026/2027</span>
            </div>
          </div>
          {/* Subtitle contract string */}
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pusat pemantauan ekosistem SaaS: adopsi sekolah, guru mandiri, dan operasional akademik.
          </p>
        </div>

        {/* Right Controls: Period Selector Pill + Live System Status */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {/* Period Dropdown Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full bg-slate-900 dark:bg-blue-600 text-white text-xs font-bold font-century shadow-md shadow-slate-900/10 cursor-pointer transition-transform hover:scale-102 active:scale-95 whitespace-nowrap">
            <span>Semester Ganjil 2026/2027</span>
            <ChevronDown className="size-3.5 opacity-80 shrink-0" />
          </div>

          {/* Signal Indicator */}
          <div className="p-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 shadow-xs border border-slate-200/60 dark:border-slate-800 shrink-0">
            <SystemStatusIndicator initialStatus="normal" />
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. KEY METRICS ROW (4-Column Stat Cards with Squircles & 100% Real Data)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Siswa Terdata (Learners) */}
        <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/60 dark:border-slate-800/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div className="size-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Users className="size-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-full whitespace-nowrap">
              <span>Real Siswa</span>
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Siswa Terdata
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              <AnimatedCounter value={stats.totalSiswa} />
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">
              {stats.totalSiswa > 0
                ? `${stats.totalSiswa} siswa terdaftar di database`
                : "Belum ada siswa terdaftar"}
            </p>
          </div>
        </div>

        {/* Card 2: Guru Terdaftar (SaaS) (Instructors) */}
        <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/60 dark:border-slate-800/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div className="size-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <GraduationCap className="size-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full whitespace-nowrap">
              <span>{stats.totalGuru > 0 ? "Aktif" : "0 Guru"}</span>
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Guru Terdaftar (SaaS)
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              <AnimatedCounter value={stats.totalGuru} />
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">
              {stats.totalGuru > 0
                ? `${stats.totalGuru} pendidik siap mengajar & mengelola KBM`
                : "Belum ada guru yang mendaftar"}
            </p>
          </div>
        </div>

        {/* Card 3: Total Sekolah Pengguna (Institutions) */}
        <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/60 dark:border-slate-800/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div className="size-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <School className="size-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full whitespace-nowrap">
              <span>{stats.totalSekolahInstitusi} Institusi</span>
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Sekolah Pengguna
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              <AnimatedCounter value={stats.totalSekolah} />
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">
              {stats.totalSekolahFreemium} Freemium • {stats.totalSekolahInstitusi} Lisensi Penuh
            </p>
          </div>
        </div>

        {/* Card 4: Total Rombel / Kelas (Courses/Classes) */}
        <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/60 dark:border-slate-800/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div className="size-11 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <Building2 className="size-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-full whitespace-nowrap">
              <span>{stats.totalRombel > 0 ? "Rombel Aktif" : "0 Rombel"}</span>
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Rombel / Kelas
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              <AnimatedCounter value={stats.totalRombel} />
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">
              {stats.totalRombel > 0
                ? `${stats.totalRombel} rombongan belajar terjadwal`
                : "Belum ada rombel terdaftar"}
            </p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. MIDDLE SECTION (Behance 7 Cols Left / 5 Cols Right Grid)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7 items-start">
        {/* Left 7 Columns: Performa Rombongan Belajar & KBM (Courses Performance) */}
        <div className="lg:col-span-7 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-7 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/60 dark:border-slate-800/80">
          {/* Card Header */}
          <div className="flex items-center justify-between pb-4 sm:pb-5">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Performa Rombongan Belajar & KBM
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Data riil tingkat kehadiran & siswa terdaftar di setiap kelas
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold shrink-0">
              <span>Data Riil</span>
            </div>
          </div>

          {/* ── MOBILE RESPONSIVE CARD LIST (sm:hidden) ── */}
          {/* Prevents cramped multi-column table and wrapped badges on phone screens */}
          <div className="block sm:hidden space-y-3 pt-1">
            {rombelList.length > 0 ? (
              rombelList.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 shadow-xs flex flex-col gap-3 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        {item.nama.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 dark:text-white text-sm block truncate">
                          {item.nama}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                          {item.guruNama}
                        </span>
                      </div>
                    </div>
                    {/* Fixed Non-Wrapping Badge */}
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 whitespace-nowrap shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                      {item.sessionCount > 0 ? `${item.completion}% Kehadiran` : "0 Sesi KBM"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/40 pt-2.5 mt-0.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {item.siswaCount} Siswa Terdaftar
                    </span>
                    <span className="text-slate-400 truncate max-w-[140px] font-medium">
                      {item.mapelNama}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
                <div className="size-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shadow-inner">
                  <Building2 className="size-6" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Belum Ada Rombel Terdaftar
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Rombongan belajar yang aktif terdaftar akan muncul di sini beserta ringkasan KBM
                    dan siswa.
                  </p>
                </div>
                <Link
                  href="/rombel"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors mt-1 active:scale-95"
                >
                  <span>+ Buat Rombel Sekarang</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* ── DESKTOP TABLE (hidden sm:block) ── */}
          <div className="hidden sm:block overflow-x-auto no-scrollbar pt-1">
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
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                            {item.nama.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm group-hover:text-blue-600 transition-colors">
                              {item.nama}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{item.guruNama}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="font-semibold text-slate-700 dark:text-slate-300">
                          {item.siswaCount} Siswa Terdaftar
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.mapelNama}</div>
                      </td>
                      <td className="py-3.5 text-right whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 whitespace-nowrap border border-slate-200/60 dark:border-slate-700/60">
                          {item.sessionCount > 0 ? `${item.completion}% Kehadiran` : "0 Sesi KBM"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
                <div className="size-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shadow-inner">
                  <Building2 className="size-6" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Belum Ada Rombel Terdaftar
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Rombongan belajar yang aktif terdaftar akan muncul di sini beserta ringkasan KBM
                    dan siswa.
                  </p>
                </div>
                <Link
                  href="/rombel"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors mt-1 active:scale-95"
                >
                  <span>+ Buat Rombel Sekarang</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Columns: Learner Engagement Gauge + Real Audit Activity */}
        <div className="lg:col-span-5 space-y-6 sm:space-y-7">
          {/* Card 1: Learner Engagement Ring Gauge */}
          <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-7 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/60 dark:border-slate-800/80">
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
                  attendance.totalPresensiRecorded > 0 ? "Rata-rata Kehadiran" : "0 Sesi Masuk"
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
          <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-7 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/60 dark:border-slate-800/80">
            <div className="flex items-center justify-between pb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Aktivitas Terkini
              </h3>
              <span className="text-xs text-slate-400 font-medium">Real-time Stream</span>
            </div>

            <div className="space-y-2.5">
              {auditLogs.length > 0 ? (
                auditLogs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    onClick={() => handleOpenLogModal(log)}
                    className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group border border-transparent hover:border-slate-200/50 dark:hover:border-slate-700/50"
                  >
                    <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                      {log.aksi === "CREATE" ? "+" : log.aksi === "DELETE" ? "×" : "✎"}
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
                      <span className="text-[10px] text-slate-400 block mt-0.5">{log.timeAgo}</span>
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
          4. BOTTOM SECTION: Ringkasan Aktivitas Pembelajaran & Perangkat
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7 items-stretch">
        {/* Left 6 Columns: Ringkasan Aktivitas Pembelajaran (Weekly Dual-Wave Chart) */}
        <div className="lg:col-span-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-7 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/60 dark:border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
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

            {/* Real SVG Chart */}
            <div className="pt-6 relative">
              <svg className="w-full h-36 overflow-visible" viewBox="0 0 500 120">
                <defs>
                  <linearGradient id="realWaveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal grid lines */}
                <line
                  x1="0"
                  y1="25"
                  x2="500"
                  y2="25"
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800"
                  strokeDasharray="3 3"
                />
                <line
                  x1="0"
                  y1="65"
                  x2="500"
                  y2="65"
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800"
                  strokeDasharray="3 3"
                />
                <line
                  x1="0"
                  y1="105"
                  x2="500"
                  y2="105"
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800"
                  strokeDasharray="3 3"
                />

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

        {/* Right 6 Columns: Distribusi Perangkat & Sesi Guru */}
        <div className="lg:col-span-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-7 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/60 dark:border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Perangkat & Sesi Aktif
              </h3>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
              🟢 Live Audit
            </span>
          </div>

          {/* Device Bar Ratio */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Smartphone className="size-3.5 text-blue-600" />
                <span>Ponsel (HP): {deviceStats.mobilePct}%</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Laptop className="size-3.5 text-slate-500" />
                <span>Komputer: {deviceStats.desktopPct}%</span>
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
              <div
                style={{ width: `${deviceStats.mobilePct}%` }}
                className="bg-blue-600 h-full rounded-l-full"
                title={`Mobile: ${deviceStats.mobilePct}%`}
              />
              <div
                style={{ width: `${deviceStats.desktopPct}%` }}
                className="bg-slate-400 dark:bg-slate-600 h-full rounded-r-full"
                title={`Desktop: ${deviceStats.desktopPct}%`}
              />
            </div>
          </div>

          {/* List of Recent Live Sessions */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Sesi Pendidik Terakhir
            </span>
            {deviceStats.sesiList.length > 0 ? (
              deviceStats.sesiList.slice(0, 3).map((s) => (
                <div
                  key={s.id}
                  className="p-2.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between gap-2 border border-slate-200/40 dark:border-slate-700/40"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-7 rounded-lg bg-blue-100/60 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                      {s.deviceType === "mobile" ? (
                        <Smartphone className="size-3.5" />
                      ) : s.deviceType === "tablet" ? (
                        <Tablet className="size-3.5" />
                      ) : (
                        <Laptop className="size-3.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                        {s.nama}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                        {s.deviceBrand} • {s.sekolah}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${s.presenceBadgeClass}`}
                  >
                    <span className={`size-1 rounded-full ${s.presenceDotClass}`} />
                    <span>{s.presenceLabel}</span>
                  </span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Belum ada sesi aktif tercatat saat ini.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. DAFTAR SEKOLAH & PENDAFTAR SAAS TERBARU (Recent Institutions List)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-7 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/60 dark:border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 sm:pb-5">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <School className="size-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Sekolah & Pendaftar SaaS Terbaru
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total {stats.totalSekolah} sekolah terdaftar di database Ruang Pintar
              </p>
            </div>
          </div>

          <Link
            href="/sekolah"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50 transition-colors w-fit"
          >
            <span>Lihat Semua Sekolah</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* ── MOBILE RESPONSIVE CARD LIST (sm:hidden) ── */}
        <div className="block sm:hidden space-y-3 pt-1">
          {sekolahList.length > 0 ? (
            sekolahList.map((sekolah) => {
              const isTrial = sekolah.tipe_lisensi === "FREEMIUM";
              return (
                <div
                  key={sekolah.id}
                  className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/60 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                      {sekolah.nama}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] whitespace-nowrap shrink-0 ${
                        isTrial
                          ? "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300"
                          : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300"
                      }`}
                    >
                      {isTrial ? (
                        <>
                          <Sparkles className="size-2.5 text-amber-500" />
                          <span>Trial 30 Hari</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="size-2.5 text-emerald-500" />
                          <span>Lisensi Penuh</span>
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>
                      {sekolah.jenjang} • {sekolah.rombelCount} Kelas
                    </span>
                    <span className="font-medium truncate max-w-[140px]">{sekolah.guruKontak}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              Belum ada sekolah terdaftar di sistem.
            </div>
          )}
        </div>

        {/* ── DESKTOP TABLE (hidden sm:block) ── */}
        <div className="hidden sm:block overflow-x-auto no-scrollbar pt-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800">
                <th className="pb-3 pr-4">Nama Sekolah</th>
                <th className="pb-3 pr-4">Guru Pendaftar</th>
                <th className="pb-3 pr-4">Paket Lisensi</th>
                <th className="pb-3 pr-4">Kelas</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/80">
              {sekolahList.length > 0 ? (
                sekolahList.map((sekolah) => {
                  const isTrial = sekolah.tipe_lisensi === "FREEMIUM";
                  return (
                    <tr
                      key={sekolah.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 pr-4 font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
                        <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shrink-0">
                          <School className="size-4" />
                        </div>
                        <div>
                          <span className="block truncate max-w-[180px] sm:max-w-none">
                            {sekolah.nama}
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {sekolah.jenjang} • ID: {sekolah.id.slice(0, 8)}...
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5 font-medium">
                          <User className="size-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[140px] sm:max-w-none">
                            {sekolah.guruKontak}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 whitespace-nowrap">
                        {isTrial ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                            <Sparkles className="size-3 text-amber-500" />
                            Uji Coba 30 Hari
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                            <CheckCircle2 className="size-3 text-emerald-500" />
                            Lisensi Penuh
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 pr-4 text-slate-600 dark:text-slate-300 font-semibold whitespace-nowrap">
                        {sekolah.rombelCount} Kelas
                      </td>
                      <td className="py-3.5 text-right whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                          Aktif
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Belum ada sekolah terdaftar di sistem.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          6. AKSI CEPAT SUPER ADMIN (Quick Navigation Cards)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-7 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/60 dark:border-slate-800/80">
        <div className="flex items-center justify-between pb-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Aksi Cepat Super Admin
          </h3>
          <span className="text-xs text-slate-400 font-medium">Navigasi Langsung</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
          <Link
            href="/sekolah"
            className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 hover:bg-blue-50/80 dark:hover:bg-blue-950/40 transition-all flex flex-col items-center text-center gap-2 group cursor-pointer border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
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
            className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 transition-all flex flex-col items-center text-center gap-2 group cursor-pointer border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800"
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
            className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 hover:bg-purple-50/80 dark:hover:bg-purple-950/40 transition-all flex flex-col items-center text-center gap-2 group cursor-pointer border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
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
            className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 hover:bg-amber-50/80 dark:hover:bg-amber-950/40 transition-all flex flex-col items-center text-center gap-2 group cursor-pointer border border-transparent hover:border-amber-200 dark:hover:border-amber-800"
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

      {/* ─────────────────────────────────────────────────────────────
          7. ACTIVITY DETAILS MODAL (Smooth Zoom-In on Open, Zoom-Out on Close)
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
            className={`relative w-full max-w-lg rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl p-5 sm:p-7 shadow-2xl border border-white/60 dark:border-slate-800 text-left transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu ${
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
                  {selectedLog.aksi === "CREATE" ? "+" : selectedLog.aksi === "DELETE" ? "×" : "✎"}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Rincian Audit Log
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">ID: {selectedLog.id}</span>
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
