import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  GraduationCap,
  Sparkles,
  ArrowRight,
  MonitorPlay,
} from "lucide-react";
import { StatCard } from "@/shared/components/dashboard/stat-card";
import { AuthenticatedUser } from "@/shared/infrastructure/auth/auth-service";

export interface StudentDashboardProps {
  user: AuthenticatedUser;
}

export function StudentDashboard({ user }: StudentDashboardProps) {
  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
              Halo, {user.nama_lengkap}! 👋
            </h1>
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              Siswa Aktif
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Portal pembelajaran siswa, jadwal pelajaran harian, dan tugas kelas Anda.
          </p>
        </div>

        {/* Header Metadata Badges */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-sm text-xs font-semibold text-slate-700">
            <Calendar className="h-4 w-4 text-[#2563EB]" />
            <span>Kelas X RPL 1 • Semester Genap</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200/70 text-xs font-bold text-emerald-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Presensi Hadir</span>
          </div>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Kelas Terdaftar"
          value="X RPL 1"
          icon={<GraduationCap className="h-6 w-6" />}
          trend={{ value: "Wali Kelas:", label: "Pak Andi Setiawan", isPositive: true }}
          watermarkIcon={<GraduationCap className="h-28 w-28" />}
        />
        <StatCard
          label="Kehadiran Saya"
          value="100%"
          icon={<CheckCircle2 className="h-6 w-6" />}
          trend={{ value: "28 Hadir", label: "• 0 Alpa", isPositive: true }}
          watermarkIcon={<CheckCircle2 className="h-28 w-28" />}
        />
        <StatCard
          label="Tugas Aktif"
          value="3 Tugas"
          icon={<BookOpen className="h-6 w-6" />}
          trend={{ value: "2 Mendekati", label: "deadline minggu ini", isPositive: false }}
          watermarkIcon={<BookOpen className="h-28 w-28" />}
        />
        <StatCard
          label="Nilai Rata-rata"
          value="88.5"
          icon={<Award className="h-6 w-6" />}
          trend={{ value: "↑ 4,2", label: "dari semester lalu", isPositive: true }}
          watermarkIcon={<Award className="h-28 w-28" />}
        />
      </div>

      {/* Middle Section: Jadwal Pelajaran Hari Ini & Tugas/CBT */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Jadwal Hari Ini */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-100/90 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#2563EB]" />
              <h3 className="text-base font-bold text-[#0F172A]">Jadwal Pelajaran Hari Ini</h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-[#2563EB]">
              Senin, 18 Mei 2026
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-slate-50/80 hover:bg-blue-50/50 border border-slate-100 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="px-3 py-2 rounded-xl bg-white shadow-sm border border-slate-200/80 text-center flex-shrink-0">
                  <span className="text-xs font-extrabold text-[#0F172A] block">07:30</span>
                  <span className="text-[10px] text-slate-400 font-medium">08:50</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Pemrograman Web & Mobile</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Pak Ahmad Dahlan • Lab RPL 1</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 px-3 py-1 rounded-lg bg-emerald-50 self-start sm:self-center">
                ✓ Selesai
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="px-3 py-2 rounded-xl bg-[#2563EB] text-white text-center flex-shrink-0 shadow-sm">
                  <span className="text-xs font-extrabold block">09:15</span>
                  <span className="text-[10px] text-blue-100 font-medium">10:45</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Matematika Diskrit</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Ibu Siti Nurhaliza • Ruang Teori 102</p>
                </div>
              </div>
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all self-start sm:self-center cursor-pointer"
              >
                Buka Kelas →
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 hover:bg-blue-50/50 border border-slate-100 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="px-3 py-2 rounded-xl bg-white shadow-sm border border-slate-200/80 text-center flex-shrink-0">
                  <span className="text-xs font-extrabold text-[#0F172A] block">13:00</span>
                  <span className="text-[10px] text-slate-400 font-medium">14:30</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Bahasa Inggris Kejuruan</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Pak Deden Kurnia • Ruang Bahasa</p>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-500 px-3 py-1 rounded-lg bg-white border border-slate-200 self-start sm:self-center">
                Mendatang
              </span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Tugas & Ujian CBT Mendatang */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white border border-slate-100/90 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MonitorPlay className="h-4 w-4 text-[#2563EB]" />
                <h3 className="text-sm font-bold text-[#0F172A]">CBT & Ujian Mendatang</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                Terjadwal
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/40 border border-blue-100 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900">UH Pemrograman Bab 1</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">X RPL • 40 Soal Pilihan Ganda</p>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-600 pt-2 border-t border-blue-200/50">
                <span>⏱ Durasi: 60 Menit</span>
                <span className="font-bold text-[#2563EB]">Besok • 08:00</span>
              </div>
              <button
                type="button"
                className="w-full py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all text-center cursor-pointer"
              >
                Mulai Ujian Online →
              </button>
            </div>
          </div>

          {/* Quick Actions Siswa */}
          <div className="rounded-2xl bg-white border border-slate-100/90 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#2563EB]" />
              <h3 className="text-sm font-bold text-[#0F172A]">Aksi Cepat Siswa</h3>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="#"
                className="p-3 rounded-xl bg-slate-50/80 hover:bg-blue-50 border border-slate-100 text-center transition-all group"
              >
                <BookOpen className="h-5 w-5 mx-auto text-[#2563EB] mb-1" />
                <span className="text-xs font-bold text-slate-800 block">Kirim Tugas</span>
              </Link>
              <Link
                href="#"
                className="p-3 rounded-xl bg-slate-50/80 hover:bg-emerald-50 border border-slate-100 text-center transition-all group"
              >
                <Award className="h-5 w-5 mx-auto text-emerald-600 mb-1" />
                <span className="text-xs font-bold text-slate-800 block">Cek Nilai</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

