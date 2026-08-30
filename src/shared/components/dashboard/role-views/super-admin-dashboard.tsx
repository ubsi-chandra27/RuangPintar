import * as React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  Building2,
  TrendingUp,
  Calendar,
  ChevronDown,
  Megaphone,
  Clock,
  CheckCircle2,
  FileText,
  BookOpen,
  BarChart3,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { StatCard } from "@/shared/components/dashboard/stat-card";
import { AuthenticatedUser } from "@/shared/infrastructure/auth/auth-service";

export interface SuperAdminDashboardProps {
  user: AuthenticatedUser;
}

export function SuperAdminDashboard({ user }: SuperAdminDashboardProps) {
  // Chart data for daily attendance & assignments
  const days = [
    { name: "Sen", attendance: 92, taskProgress: 45 },
    { name: "Sel", attendance: 95, taskProgress: 60 },
    { name: "Rab", attendance: 90, taskProgress: 70 },
    { name: "Kam", attendance: 97, taskProgress: 85 },
    { name: "Jum", attendance: 96, taskProgress: 95 },
    { name: "Sab", attendance: 89, taskProgress: 65 },
    { name: "Min", attendance: 94, taskProgress: 88 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Dashboard Page Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ringkasan operasional dan aktivitas akademik sekolah.
          </p>
        </div>

        {/* Header Metadata Badges */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-sm text-xs font-semibold text-slate-700">
            <Calendar className="h-4 w-4 text-[#2563EB]" />
            <span>Tahun Ajaran 2026/2027</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200/70 text-xs font-bold text-emerald-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sistem Normal</span>
          </div>
        </div>
      </div>

      {/* 4 Core Top Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Siswa"
          value="1.245"
          icon={<GraduationCap className="h-6 w-6" />}
          trend={{ value: "4,8%", label: "dari bulan lalu", isPositive: true }}
          watermarkIcon={<GraduationCap className="h-28 w-28" />}
        />
        <StatCard
          label="Guru"
          value="82"
          icon={<Users className="h-6 w-6" />}
          trend={{ value: "2,5%", label: "dari bulan lalu", isPositive: true }}
          watermarkIcon={<Users className="h-28 w-28" />}
        />
        <StatCard
          label="Rombel"
          value="36"
          icon={<Building2 className="h-6 w-6" />}
          trend={{ value: "3", label: "dibanding tahun lalu", isPositive: true }}
          watermarkIcon={<Building2 className="h-28 w-28" />}
        />
        <StatCard
          label="Kehadiran Hari Ini"
          value="96%"
          icon={<TrendingUp className="h-6 w-6" />}
          trend={{ value: "2,1%", label: "dari kemarin", isPositive: true }}
          watermarkIcon={<TrendingUp className="h-28 w-28" />}
        />
      </div>

      {/* Middle Section: Activity Chart (Left 2 cols) & Announcements / Agenda (Right 1 col) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Ringkasan Aktivitas Akademik */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-100/90 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#0F172A]">Ringkasan Aktivitas Akademik</h3>
              <span className="text-slate-400 text-xs cursor-pointer hover:text-slate-600">ℹ️</span>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200/80 transition-colors"
              >
                <span>Mingguan</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
              </button>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-xs font-medium text-slate-600 border border-slate-200/80">
                <span>12 - 18 Mei 2026</span>
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 my-3 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#3B82F6]" />
              <span>Kehadiran (%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#93C5FD]" />
              <span>Tugas Selesai</span>
            </div>
          </div>

          {/* Bar & Line Chart Visualization */}
          <div className="relative pt-2 pb-2">
            <div className="flex items-stretch gap-2">
              {/* Left Y-Axis */}
              <div className="flex flex-col justify-between text-[10px] text-slate-400 font-medium pb-7 pr-1 text-right select-none">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>

              {/* Chart Canvas */}
              <div className="flex-1 relative">
                {/* Horizontal Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pb-7 pointer-events-none">
                  <div className="border-b border-slate-100 w-full" />
                  <div className="border-b border-slate-100 w-full" />
                  <div className="border-b border-slate-100 w-full" />
                  <div className="border-b border-slate-100 w-full" />
                  <div className="border-b border-slate-200/80 w-full" />
                </div>

                {/* Bars & Line */}
                <div className="h-56 w-full flex items-end justify-between gap-2 sm:gap-4 px-2 relative z-10">
                  {days.map((item, index) => (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group"
                    >
                      <span className="text-[10px] font-bold text-slate-700 bg-white/90 px-1.5 py-0.5 rounded shadow-xs border border-slate-100">
                        {item.attendance}%
                      </span>
                      <div className="w-full max-w-[40px] relative flex items-end justify-center rounded-t-xl overflow-hidden bg-slate-100/60 h-40">
                        <div
                          style={{ height: `${item.attendance}%` }}
                          className="w-full bg-gradient-to-t from-[#2563EB] via-[#3B82F6] to-[#93C5FD] rounded-t-xl transition-all duration-500 shadow-sm"
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-600 mt-1">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Y-Axis */}
              <div className="flex flex-col justify-between text-[10px] text-slate-400 font-medium pb-7 pl-1 text-left select-none">
                <span>200</span>
                <span>150</span>
                <span>100</span>
                <span>50</span>
                <span>0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Pengumuman Penting & Agenda Hari Ini */}
        <div className="space-y-6">
          {/* Pengumuman Penting */}
          <div className="rounded-2xl bg-white border border-slate-100/90 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-[#2563EB]" />
                <h3 className="text-sm font-bold text-[#0F172A]">Pengumuman Penting</h3>
              </div>
              <Link href="#" className="text-xs font-semibold text-[#2563EB] hover:underline">
                Lihat Semua
              </Link>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50/80 hover:bg-slate-50 border border-slate-100 transition-colors flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-500 flex-shrink-0" />
                    <h4 className="text-xs font-bold text-slate-800">
                      Ujian Akhir Semester Genap 2026
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    Ujian akan dilaksanakan 20-30 Mei 2026
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                  12 Mei 2026
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/80 hover:bg-slate-50 border border-slate-100 transition-colors flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500 flex-shrink-0" />
                    <h4 className="text-xs font-bold text-slate-800">Libur Kenaikan Kelas</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    Sekolah libur pada 1–3 Juni 2026
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                  10 Mei 2026
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/80 hover:bg-slate-50 border border-slate-100 transition-colors flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                    <h4 className="text-xs font-bold text-slate-800">Pengumpulan Laporan Akhir</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    Batas akhir pengumpulan 15 Juni 2026
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                  8 Mei 2026
                </span>
              </div>
            </div>
          </div>

          {/* Agenda Hari Ini */}
          <div className="rounded-2xl bg-white border border-slate-100/90 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#2563EB]" />
                <h3 className="text-sm font-bold text-[#0F172A]">Agenda Hari Ini</h3>
              </div>
              <Link href="#" className="text-xs font-semibold text-[#2563EB] hover:underline">
                Lihat Kalender
              </Link>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-700 bg-white px-2 py-1 rounded-md border border-slate-200/80 text-[11px]">
                    08:00
                  </span>
                  <span className="font-semibold text-slate-800">Rapat Koordinasi Guru</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span>Ruang Meeting</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-700 bg-white px-2 py-1 rounded-md border border-slate-200/80 text-[11px]">
                    10:00
                  </span>
                  <span className="font-semibold text-slate-800">Monitoring Pembelajaran</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span>Kelas X RPL 1</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-700 bg-white px-2 py-1 rounded-md border border-slate-200/80 text-[11px]">
                    13:00
                  </span>
                  <span className="font-semibold text-slate-800">Verifikasi Tugas Siswa</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span>Online</span>
                  <span className="h-2 w-2 rounded-full bg-purple-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Aktivitas Terbaru (Left 2 cols) & Aksi Cepat (Right 1 col) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Aktivitas Terbaru Table */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-100/90 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#2563EB]" />
              <h3 className="text-base font-bold text-[#0F172A]">Aktivitas Terbaru</h3>
            </div>
            <Link
              href="#"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline"
            >
              <span>Lihat Semua Aktivitas</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="pb-3 pr-4">Aktivitas</th>
                  <th className="pb-3 pr-4">Detail</th>
                  <th className="pb-3 pr-4">Oleh</th>
                  <th className="pb-3 pr-4">Waktu</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 pr-4 font-bold text-slate-800 flex items-center gap-2">
                    <span className="h-6 w-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-[10px]">
                      📋
                    </span>
                    <span>Absensi Siswa</span>
                  </td>
                  <td className="py-3 pr-4 text-slate-600">Kelas X RPL 1 - 32 siswa</td>
                  <td className="py-3 pr-4 font-medium text-slate-700">Ahmad Fikri</td>
                  <td className="py-3 pr-4 text-slate-500">18 Mei 2026, 08:15</td>
                  <td className="py-3 text-right">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                      Selesai
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 pr-4 font-bold text-slate-800 flex items-center gap-2">
                    <span className="h-6 w-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-[10px]">
                      📝
                    </span>
                    <span>Tugas Dibuat</span>
                  </td>
                  <td className="py-3 pr-4 text-slate-600">Tugas Pemrograman Dasar</td>
                  <td className="py-3 pr-4 font-medium text-slate-700">Nabila Putri</td>
                  <td className="py-3 pr-4 text-slate-500">18 Mei 2026, 07:45</td>
                  <td className="py-3 text-right">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                      Selesai
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 pr-4 font-bold text-slate-800 flex items-center gap-2">
                    <span className="h-6 w-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-[10px]">
                      📊
                    </span>
                    <span>Nilai Diinput</span>
                  </td>
                  <td className="py-3 pr-4 text-slate-600">Ulangan Harian Matematika</td>
                  <td className="py-3 pr-4 font-medium text-slate-700">Rizky Alfarizi</td>
                  <td className="py-3 pr-4 text-slate-500">17 Mei 2026, 15:30</td>
                  <td className="py-3 text-right">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                      Selesai
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 pr-4 font-bold text-slate-800 flex items-center gap-2">
                    <span className="h-6 w-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-[10px]">
                      📢
                    </span>
                    <span>Pengumuman</span>
                  </td>
                  <td className="py-3 pr-4 text-slate-600">Info Ujian Akhir Semester</td>
                  <td className="py-3 pr-4 font-medium text-slate-700">Administrator</td>
                  <td className="py-3 pr-4 text-slate-500">17 Mei 2026, 10:20</td>
                  <td className="py-3 text-right">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[11px]">
                      Dibaca
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 pr-4 font-bold text-slate-800 flex items-center gap-2">
                    <span className="h-6 w-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-[10px]">
                      🏫
                    </span>
                    <span>Rombel Dibuat</span>
                  </td>
                  <td className="py-3 pr-4 text-slate-600">X DKV 2 - T.A. 2026/2027</td>
                  <td className="py-3 pr-4 font-medium text-slate-700">Administrator</td>
                  <td className="py-3 pr-4 text-slate-500">16 Mei 2026, 14:05</td>
                  <td className="py-3 text-right">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                      Selesai
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Aksi Cepat (Quick Actions) */}
        <div className="rounded-2xl bg-white border border-slate-100/90 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#2563EB]" />
            <h3 className="text-base font-bold text-[#0F172A]">Aksi Cepat</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/sekolah"
              className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-blue-50/70 border border-slate-100 hover:border-blue-200 transition-all flex flex-col items-center text-center gap-2 group"
            >
              <div className="h-10 w-10 rounded-xl bg-blue-100/60 text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white flex items-center justify-center transition-colors">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Kelola Sekolah</span>
                <span className="text-[10px] text-slate-500">Pengaturan sekolah</span>
              </div>
            </Link>

            <Link
              href="#"
              className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-emerald-50/70 border border-slate-100 hover:border-emerald-200 transition-all flex flex-col items-center text-center gap-2 group"
            >
              <div className="h-10 w-10 rounded-xl bg-emerald-100/60 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Data Siswa</span>
                <span className="text-[10px] text-slate-500">Kelola data siswa</span>
              </div>
            </Link>

            <Link
              href="#"
              className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-purple-50/70 border border-slate-100 hover:border-purple-200 transition-all flex flex-col items-center text-center gap-2 group"
            >
              <div className="h-10 w-10 rounded-xl bg-purple-100/60 text-purple-600 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition-colors">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Jadwal</span>
                <span className="text-[10px] text-slate-500">Atur jadwal kelas</span>
              </div>
            </Link>

            <Link
              href="#"
              className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-amber-50/70 border border-slate-100 hover:border-amber-200 transition-all flex flex-col items-center text-center gap-2 group"
            >
              <div className="h-10 w-10 rounded-xl bg-amber-100/60 text-amber-600 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center transition-colors">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Laporan</span>
                <span className="text-[10px] text-slate-500">Lihat laporan</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
