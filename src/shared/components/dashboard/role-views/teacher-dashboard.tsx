import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  GraduationCap,
  BookOpen,
  Clock,
  TrendingUp,
  CheckCircle2,
  FileSpreadsheet,
  Megaphone,
  ArrowRight,
  Sparkles,
  ClipboardList,
} from "lucide-react";
import { StatCard } from "@/shared/components/dashboard/stat-card";
import { AuthenticatedUser } from "@/shared/infrastructure/auth/auth-service";

export interface TeacherDashboardProps {
  user: AuthenticatedUser;
}

export function TeacherDashboard({ user }: TeacherDashboardProps) {
  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
              Selamat Datang, {user.nama_lengkap}
            </h1>
            <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#2563EB] text-xs font-bold border border-blue-100">
              Guru Pengajar
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pusat kerja akademik, agenda pengajaran kelas, dan manajemen nilai siswa.
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
            <span>Jadwal Aktif</span>
          </div>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Jadwal Hari Ini"
          value="3 Sesi"
          icon={<Calendar className="h-6 w-6" />}
          trend={{ value: "2 Selesai", label: "• 1 Sesi Menanti", isPositive: true }}
          watermarkIcon={<Calendar className="h-28 w-28" />}
        />
        <StatCard
          label="Kelas Binaan"
          value="5 Rombel"
          icon={<Users className="h-6 w-6" />}
          trend={{ value: "168 Siswa", label: "aktif terdaftar", isPositive: true }}
          watermarkIcon={<Users className="h-28 w-28" />}
        />
        <StatCard
          label="Tugas Masuk"
          value="12 Berkas"
          icon={<BookOpen className="h-6 w-6" />}
          trend={{ value: "4 Baru", label: "perlu dinilai", isPositive: false }}
          watermarkIcon={<BookOpen className="h-28 w-28" />}
        />
        <StatCard
          label="Ketuntasan Presensi"
          value="98%"
          icon={<TrendingUp className="h-6 w-6" />}
          trend={{ value: "↑ 1,2%", label: "dari minggu lalu", isPositive: true }}
          watermarkIcon={<TrendingUp className="h-28 w-28" />}
        />
      </div>

      {/* Middle Section: Jadwal Mengajar & Pengumuman */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Jadwal Mengajar Hari Ini */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-100/90 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#2563EB]" />
              <h3 className="text-base font-bold text-[#0F172A]">Jadwal Mengajar Hari Ini</h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-[#2563EB]">
              Senin, 18 Mei 2026
            </span>
          </div>

          <div className="space-y-3">
            {/* Session Card 1 */}
            <div className="p-4 rounded-2xl bg-slate-50/80 hover:bg-blue-50/50 border border-slate-100 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="px-3 py-2 rounded-xl bg-white shadow-sm border border-slate-200/80 text-center flex-shrink-0">
                  <span className="text-xs font-extrabold text-[#0F172A] block">07:30</span>
                  <span className="text-[10px] text-slate-400 font-medium">08:50</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">Pemrograman Web & Mobile</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      SELESAI
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kelas X RPL 1 • Lab Rekayasa Perangkat Lunak
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="px-3.5 py-2 rounded-xl bg-slate-200/70 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors self-start sm:self-center"
              >
                Lihat Presensi
              </button>
            </div>

            {/* Session Card 2 */}
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="px-3 py-2 rounded-xl bg-[#2563EB] text-white text-center flex-shrink-0 shadow-sm">
                  <span className="text-xs font-extrabold block">09:15</span>
                  <span className="text-[10px] text-blue-100 font-medium">10:45</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">Basis Data & Relasi</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white animate-pulse">
                      BERLANGSUNG
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">Kelas XI RPL 2 • Lab Basis Data</p>
                </div>
              </div>
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all self-start sm:self-center cursor-pointer"
              >
                Buka Sesi Presensi →
              </button>
            </div>

            {/* Session Card 3 */}
            <div className="p-4 rounded-2xl bg-slate-50/80 hover:bg-blue-50/50 border border-slate-100 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="px-3 py-2 rounded-xl bg-white shadow-sm border border-slate-200/80 text-center flex-shrink-0">
                  <span className="text-xs font-extrabold text-[#0F172A] block">13:00</span>
                  <span className="text-[10px] text-slate-400 font-medium">14:30</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">Algoritma & Struktur Data</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      MENDATANG
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Kelas X TKJ 1 • Ruang Teori 302</p>
                </div>
              </div>
              <button
                type="button"
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors self-start sm:self-center"
              >
                Persiapkan Materi
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Aksi Cepat Guru */}
        <div className="rounded-2xl bg-white border border-slate-100/90 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#2563EB]" />
            <h3 className="text-base font-bold text-[#0F172A]">Aksi Cepat Guru</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="#"
              className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-blue-50/70 border border-slate-100 hover:border-blue-200 transition-all flex flex-col items-center text-center gap-2 group"
            >
              <div className="h-10 w-10 rounded-xl bg-blue-100/60 text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white flex items-center justify-center transition-colors">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Absensi Kelas</span>
                <span className="text-[10px] text-slate-500">Isi presensi</span>
              </div>
            </Link>

            <Link
              href="#"
              className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-emerald-50/70 border border-slate-100 hover:border-emerald-200 transition-all flex flex-col items-center text-center gap-2 group"
            >
              <div className="h-10 w-10 rounded-xl bg-emerald-100/60 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Input Nilai</span>
                <span className="text-[10px] text-slate-500">Buku penilaian</span>
              </div>
            </Link>

            <Link
              href="#"
              className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-purple-50/70 border border-slate-100 hover:border-purple-200 transition-all flex flex-col items-center text-center gap-2 group"
            >
              <div className="h-10 w-10 rounded-xl bg-purple-100/60 text-purple-600 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition-colors">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Buat Tugas</span>
                <span className="text-[10px] text-slate-500">Tugas & modul</span>
              </div>
            </Link>

            <Link
              href="#"
              className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-amber-50/70 border border-slate-100 hover:border-amber-200 transition-all flex flex-col items-center text-center gap-2 group"
            >
              <div className="h-10 w-10 rounded-xl bg-amber-100/60 text-amber-600 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center transition-colors">
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Pengumuman</span>
                <span className="text-[10px] text-slate-500">Kirim info kelas</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
