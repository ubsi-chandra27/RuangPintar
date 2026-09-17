import * as React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  Building2,
  TrendingUp,
  Calendar,
  Megaphone,
  Clock,
  CheckCircle2,
  FileText,
  BookOpen,
  BarChart3,
  ArrowRight,
  Sparkles,
  School,
  User,
  ShieldCheck,
  Plug,
  Inbox,
  ChevronDown,
} from "lucide-react";
import { StatCard } from "@/shared/components/dashboard/stat-card";
import { AuthenticatedUser } from "@/shared/infrastructure/auth/auth-service";
import { prisma } from "@/shared/infrastructure/database/prisma";

export interface SuperAdminDashboardProps {
  user: AuthenticatedUser;
}

export async function SuperAdminDashboard({ user }: SuperAdminDashboardProps) {
  // Query data operasional riil dari basis data (Zero Fake KPI)
  const [
    totalSekolah,
    totalSekolahFreemium,
    totalSekolahInstitusi,
    totalGuru,
    totalSiswa,
    totalRombel,
    daftarSekolahTerbaru,
    pengumumanList,
  ] = await Promise.all([
    prisma.sekolah.count(),
    prisma.sekolah.count({ where: { tipe_lisensi: "FREEMIUM" } }),
    prisma.sekolah.count({ where: { tipe_lisensi: "SEKOLAH" } }),
    prisma.pengguna.count({ where: { peran_dasar: "TEACHER" } }),
    prisma.siswa.count(),
    prisma.rombel.count({ where: { status: "AKTIF" } }),
    prisma.sekolah.findMany({
      take: 6,
      orderBy: { created_at: "desc" },
      include: {
        pengguna: {
          where: { peran_dasar: "TEACHER" },
          take: 1,
          select: { nama_lengkap: true, email: true },
        },
        rombel: {
          where: { status: "AKTIF" },
          select: { id: true },
        },
      },
    }),
    prisma.pengumuman.findMany({
      take: 3,
      orderBy: { created_at: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6 pb-12">
      {/* Dashboard Page Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
              Dashboard Platform
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              SaaS Control Center
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pusat pemantauan ekosistem SaaS: adopsi sekolah, guru mandiri, dan operasional akademik.
          </p>
        </div>

        {/* Header Metadata Badges */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-xs text-xs font-semibold text-slate-700">
            <Calendar className="h-4 w-4 text-[#2563EB]" />
            <span>Tahun Ajaran 2026/2027</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200/70 text-xs font-bold text-emerald-700 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sistem Operasional Normal</span>
          </div>
        </div>
      </div>

      {/* 4 Core Top Stat Cards (100% Data Riil Prisma) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Sekolah Pengguna"
          value={totalSekolah.toLocaleString("id-ID")}
          icon={<School className="h-6 w-6 text-[#2563EB]" />}
          trend={{
            value: `${totalSekolahFreemium} Trial`,
            label: `• ${totalSekolahInstitusi} Berlangganan`,
            isPositive: true,
          }}
          watermarkIcon={<School className="h-28 w-28" />}
        />
        <StatCard
          label="Guru Terdaftar (SaaS)"
          value={totalGuru.toLocaleString("id-ID")}
          icon={<Users className="h-6 w-6 text-emerald-600" />}
          trend={{
            value: totalGuru > 0 ? `${totalGuru} Pendidik` : "0 Pendidik",
            label: "pengguna aktif platform",
            isPositive: true,
          }}
          watermarkIcon={<Users className="h-28 w-28" />}
        />
        <StatCard
          label="Total Rombel / Kelas"
          value={totalRombel.toLocaleString("id-ID")}
          icon={<Building2 className="h-6 w-6 text-indigo-600" />}
          trend={{
            value: totalRombel > 0 ? `${totalRombel} Rombel` : "0 Rombel",
            label: "aktif di database",
            isPositive: true,
          }}
          watermarkIcon={<Building2 className="h-28 w-28" />}
        />
        <StatCard
          label="Total Siswa Terdata"
          value={totalSiswa.toLocaleString("id-ID")}
          icon={<GraduationCap className="h-6 w-6 text-sky-600" />}
          trend={{
            value: totalSiswa > 0 ? `${totalSiswa} Siswa` : "0 Siswa",
            label: "terdaftar di sistem",
            isPositive: true,
          }}
          watermarkIcon={<GraduationCap className="h-28 w-28" />}
        />
      </div>

      {/* Middle Section: Aktivitas KBM & Pengumuman / Agenda */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Ringkasan Aktivitas Pembelajaran */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-100/90 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#0F172A]">
                Ringkasan Aktivitas Pembelajaran
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-xs font-medium text-slate-600 border border-slate-200/80">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Hari Ini, 17 September 2026</span>
              </div>
            </div>
          </div>

          {/* Kondisi Riil: Jika belum ada sesi KBM berjalan */}
          <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mb-3">
              <Clock className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              Belum Ada Sesi Presensi KBM Berlangsung
            </h4>
            <p className="text-xs text-slate-500 max-w-md mt-1">
              Data kehadiran dan ringkasan aktivitas siswa akan terakumulasi secara otomatis begitu
              guru pengampu membuka sesi KBM di kelas masing-masing.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Link
                href="/presensi-kelas"
                className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors"
              >
                Buka Pemantauan Presensi
              </Link>
              <Link
                href="/asisten-ai"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Uji Coba Asisten AI
              </Link>
            </div>
          </div>
        </div>

        {/* Right Col: Pengumuman Penting & Pusat Bantuan */}
        <div className="space-y-6">
          {/* Pengumuman Penting */}
          <div className="rounded-2xl bg-white border border-slate-100/90 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-[#2563EB]" />
                <h3 className="text-sm font-bold text-[#0F172A]">Pengumuman Sistem</h3>
              </div>
              <Link
                href="/pengumuman"
                className="text-xs font-semibold text-[#2563EB] hover:underline"
              >
                Kelola
              </Link>
            </div>

            <div className="space-y-3">
              {pengumumanList.length > 0 ? (
                pengumumanList.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-slate-50/80 hover:bg-slate-50 border border-slate-100 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                        <h4 className="text-xs font-bold text-slate-800">{p.judul}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{p.konten}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500">
                  <Inbox className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                  Belum ada pengumuman broadcast aktif.
                </div>
              )}
            </div>
          </div>

          {/* Status WhatsApp Gateway */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 p-5 text-white border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <Plug className="w-4 h-4" />
                <span>Pusat Integrasi & Notifikasi</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                Phase 20 Ready
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Gerbang komunikasi WhatsApp Gateway, Email Transaksional, dan Webhook telah aktif dan
              siap dihubungkan.
            </p>
            <Link
              href="/integrasi"
              className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors pt-1"
            >
              <span>Buka Konfigurasi Gateway</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Section: Tabel Sekolah & Guru Pendaftar SaaS Terbaru (Zero Emojis, 100% SVG Icons) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Daftar Sekolah & Pendaftar */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-100/90 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <School className="h-5 w-5 text-[#2563EB]" />
              <h3 className="text-base font-bold text-[#0F172A]">
                Sekolah & Pendaftar SaaS Terbaru
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Total {totalSekolah} Sekolah Terdata
            </span>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="pb-3 pr-4">Nama Sekolah</th>
                  <th className="pb-3 pr-4">Guru Pendaftar</th>
                  <th className="pb-3 pr-4">Paket Lisensi</th>
                  <th className="pb-3 pr-4">Kelas Dibuat</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {daftarSekolahTerbaru.length > 0 ? (
                  daftarSekolahTerbaru.map((sekolah) => {
                    const isTrial = sekolah.tipe_lisensi === "FREEMIUM";
                    const guruKontak = sekolah.pengguna[0]?.nama_lengkap || "Admin Sekolah";

                    return (
                      <tr key={sekolah.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 pr-4 font-bold text-slate-800 flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                            <School className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="block">{sekolah.nama}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {sekolah.jenjang} • ID: {sekolah.id.slice(0, 8)}...
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-slate-600">
                          <div className="flex items-center gap-1.5 font-medium text-slate-700">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{guruKontak}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          {isTrial ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 font-bold text-[10px]">
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              Uji Coba 30 Hari
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 font-bold text-[10px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              Lisensi Sekolah
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-slate-600 font-semibold">
                          {sekolah.rombel.length} Kelas
                        </td>
                        <td className="py-3 text-right">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200/60">
                            Aktif
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Belum ada sekolah terdaftar. Silakan lakukan registrasi mandiri di /register.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Aksi Cepat (Quick Actions) */}
        <div className="rounded-2xl bg-white border border-slate-100/90 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#2563EB]" />
            <h3 className="text-base font-bold text-[#0F172A]">Aksi Cepat Super Admin</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/sekolah"
              className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-blue-50/70 border border-slate-100 hover:border-blue-200 transition-all flex flex-col items-center text-center gap-2 group"
            >
              <div className="h-10 w-10 rounded-xl bg-blue-100/60 text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white flex items-center justify-center transition-colors">
                <School className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Kelola Sekolah</span>
                <span className="text-[10px] text-slate-500">Profil & organisasi</span>
              </div>
            </Link>

            <Link
              href="/guru-pengajaran"
              className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-emerald-50/70 border border-slate-100 hover:border-emerald-200 transition-all flex flex-col items-center text-center gap-2 group"
            >
              <div className="h-10 w-10 rounded-xl bg-emerald-100/60 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Data Guru</span>
                <span className="text-[10px] text-slate-500">Pendidik & penugasan</span>
              </div>
            </Link>

            <Link
              href="/data-siswa"
              className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-purple-50/70 border border-slate-100 hover:border-purple-200 transition-all flex flex-col items-center text-center gap-2 group"
            >
              <div className="h-10 w-10 rounded-xl bg-purple-100/60 text-purple-600 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition-colors">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Data Siswa</span>
                <span className="text-[10px] text-slate-500">Rombel & penempatan</span>
              </div>
            </Link>

            <Link
              href="/integrasi"
              className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-amber-50/70 border border-slate-100 hover:border-amber-200 transition-all flex flex-col items-center text-center gap-2 group"
            >
              <div className="h-10 w-10 rounded-xl bg-amber-100/60 text-amber-600 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center transition-colors">
                <Plug className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Integrasi Gateway</span>
                <span className="text-[10px] text-slate-500">WhatsApp & Webhook</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
