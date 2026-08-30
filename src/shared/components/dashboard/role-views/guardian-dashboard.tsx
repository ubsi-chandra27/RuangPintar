import * as React from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  Award,
  Bell,
  HeartHandshake,
  Calendar,
  GraduationCap,
  Sparkles,
  PhoneCall,
  Download,
  FileCheck,
  ArrowRight,
} from "lucide-react";
import { StatCard } from "@/shared/components/dashboard/stat-card";
import { AuthenticatedUser } from "@/shared/infrastructure/auth/auth-service";

export interface GuardianDashboardProps {
  user: AuthenticatedUser;
}

export function GuardianDashboard({ user }: GuardianDashboardProps) {
  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
              Selamat Datang, Bapak/Ibu {user.nama_lengkap}
            </h1>
            <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
              Wali Murid
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Portal pemantauan aktivitas belajar, presensi harian, dan capaian nilai putra/putri Anda.
          </p>
        </div>

        {/* Header Metadata Badges */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-sm text-xs font-semibold text-slate-700">
            <Calendar className="h-4 w-4 text-[#2563EB]" />
            <span>Tahun Ajaran 2026/2027</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200/70 text-xs font-bold text-emerald-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Presensi Hadir di Kelas</span>
          </div>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Putra/Putri Terdaftar"
          value="1 Anak"
          icon={<GraduationCap className="h-6 w-6" />}
          trend={{ value: "Rian Pratama", label: "• Kelas X RPL 1", isPositive: true }}
          watermarkIcon={<GraduationCap className="h-28 w-28" />}
        />
        <StatCard
          label="Presensi Kehadiran"
          value="100%"
          icon={<CheckCircle2 className="h-6 w-6" />}
          trend={{ value: "Tertib", label: "• Tidak ada catatan bolos", isPositive: true }}
          watermarkIcon={<CheckCircle2 className="h-28 w-28" />}
        />
        <StatCard
          label="Ketuntasan Tugas"
          value="14 / 15"
          icon={<Award className="h-6 w-6" />}
          trend={{ value: "93,3%", label: "tugas selesai tepat waktu", isPositive: true }}
          watermarkIcon={<Award className="h-28 w-28" />}
        />
        <StatCard
          label="Administrasi SPP"
          value="Lunas"
          icon={<HeartHandshake className="h-6 w-6" />}
          trend={{ value: "Bulan Mei 2026", label: "terverifikasi", isPositive: true }}
          watermarkIcon={<HeartHandshake className="h-28 w-28" />}
        />
      </div>

      {/* Middle Section: Profil Siswa & Capaian Belajar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Pemantauan Belajar */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-100/90 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#2563EB]" />
              <h3 className="text-base font-bold text-[#0F172A]">Aktivitas Pembelajaran Putra/Putri</h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700">
              Status: Aktif Belajar
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-[#2563EB] text-white font-extrabold flex items-center justify-center text-base shadow-sm">
                RP
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Rian Pratama</h4>
                <p className="text-xs text-slate-500 mt-0.5">NIS: 20261001 • Kelas X RPL 1 (Rekayasa Perangkat Lunak)</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs font-semibold text-slate-400 block">Wali Kelas:</span>
              <span className="text-xs font-bold text-slate-800">Pak Andi Setiawan, S.Pd.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-slate-500">Nilai Harian Terakhir</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">Pemrograman</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs">
                  92 (A)
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-slate-500">Nilai Matematika</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">Matematika</span>
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-xs">
                  85 (B)
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-slate-500">Bahasa Inggris</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">B. Inggris</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs">
                  90 (A)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Aksi Cepat Wali */}
        <div className="rounded-2xl bg-white border border-slate-100/90 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#2563EB]" />
            <h3 className="text-base font-bold text-[#0F172A]">Layanan Orang Tua</h3>
          </div>

          <div className="space-y-2.5">
            <Link
              href="#"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 hover:bg-emerald-50/70 border border-slate-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-100/70 text-emerald-600 flex items-center justify-center">
                  <PhoneCall className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Hubungi Wali Kelas</span>
                  <span className="text-[10px] text-slate-500">Konsultasi perkembangan</span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </Link>

            <Link
              href="#"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 hover:bg-blue-50/70 border border-slate-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-blue-100/70 text-[#2563EB] flex items-center justify-center">
                  <Download className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Unduh Rapor Semester</span>
                  <span className="text-[10px] text-slate-500">Hasil belajar siswa (PDF)</span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#2563EB] transition-colors" />
            </Link>

            <Link
              href="#"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 hover:bg-purple-50/70 border border-slate-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-purple-100/70 text-purple-600 flex items-center justify-center">
                  <FileCheck className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Pengajuan Izin / Sakit</span>
                  <span className="text-[10px] text-slate-500">Surat keterangan dokter</span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

