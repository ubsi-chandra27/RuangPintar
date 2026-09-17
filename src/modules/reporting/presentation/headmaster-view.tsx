"use client";

import * as React from "react";
import {
  Users,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { StatCard } from "@/shared/components/dashboard/stat-card";
import { HeadmasterOverviewDTO } from "../domain/reporting-types";

interface HeadmasterViewProps {
  data: HeadmasterOverviewDTO;
  onOpenPrintModal: () => void;
  onSwitchTab: (tabId: string) => void;
}

export function HeadmasterView({ data, onOpenPrintModal, onSwitchTab }: HeadmasterViewProps) {
  return (
    <div className="space-y-6">
      {/* 1. HERO BANNER PIMPINAN SEKOLAH */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E1B4B] p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold backdrop-blur-md">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>School-Wide Strategic View</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Executive Overview & Analitik Mutu Sekolah
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Pemantauan terpadu performa operasional, disiplin presensi siswa, ketuntasan
              kurikulum, dan sinyal peringatan dini untuk evaluasi kebijakan pimpinan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenPrintModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <Printer className="h-4 w-4 text-blue-600" />
              <span>Cetak Ringkasan A4</span>
            </button>
            <button
              onClick={() => onSwitchTab("ekspor")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Pusat Unduh Laporan</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* 2. 4 TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Siswa Aktif"
          value={data.ringkasan_sekolah.total_siswa.toLocaleString("id-ID")}
          icon={<GraduationCap className="h-6 w-6" />}
          trend={{
            value: data.ringkasan_sekolah.rasio_guru_siswa,
            label: "Rasio Guru : Siswa",
            isPositive: true,
          }}
          watermarkIcon={<GraduationCap className="h-28 w-28" />}
        />
        <StatCard
          label="Kehadiran Global Sekolah"
          value={`${data.kpi_kehadiran.tingkat_hadir_persen}%`}
          icon={<TrendingUp className="h-6 w-6" />}
          trend={{
            value: `${data.kpi_kehadiran.tingkat_alpha_persen}%`,
            label: "Tingkat Alpha Total",
            isPositive: data.kpi_kehadiran.tingkat_alpha_persen <= 2,
          }}
          watermarkIcon={<TrendingUp className="h-28 w-28" />}
        />
        <StatCard
          label="Ketuntasan KKTP Sekolah"
          value={`${data.kpi_akademik.persentase_tuntas_kktp}%`}
          icon={<CheckCircle2 className="h-6 w-6" />}
          trend={{
            value: `Rerata ${data.kpi_akademik.rerata_nilai_sekolah}`,
            label: "Skor Rata-Rata",
            isPositive: data.kpi_akademik.rerata_nilai_sekolah >= 75,
          }}
          watermarkIcon={<CheckCircle2 className="h-28 w-28" />}
        />
        <StatCard
          label="Rombongan Belajar"
          value={`${data.ringkasan_sekolah.total_rombel} Rombel`}
          icon={<Building2 className="h-6 w-6" />}
          trend={{
            value: `${data.ringkasan_sekolah.total_guru} Guru`,
            label: "Tenaga Pengajar Aktif",
            isPositive: true,
          }}
          watermarkIcon={<Building2 className="h-28 w-28" />}
        />
      </div>

      {/* 3. MIDDLE SECTION: TREN KEHADIRAN & ISU PERHATIAN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Grafik Tren Kehadiran Mingguan */}
        <div className="lg:col-span-2 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Tren Tingkat Kehadiran Mingguan
                </h3>
                <p className="text-xs text-slate-500">
                  Fluktuasi kehadiran harian siswa di seluruh kelas pada minggu berjalan
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">
                Senin – Jumat
              </span>
            </div>

            {/* Bar Chart Visualization */}
            <div className="space-y-4 pt-3">
              {data.tren_kehadiran_mingguan.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 w-16">{item.hari}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-[11px]">
                        {item.total_hadir} Hadir • {item.total_alpha} Alpha
                      </span>
                      <span className="font-bold text-slate-900 w-12 text-right">
                        {item.persentase_hadir}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${item.persentase_hadir}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Standar Minimal Mutu Presensi: 90%</span>
            <button
              onClick={() => onSwitchTab("kesiswaan")}
              className="font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <span>Lihat Detail Kesiswaan</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Right 1 Col: Perhatian Pimpinan / Anomali */}
        <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Perhatian Pimpinan
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold">
                {data.perhatian_kepemimpinan.length} Isu
              </span>
            </div>

            <div className="space-y-3">
              {data.perhatian_kepemimpinan.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    alert.tingkat_urgensi === "KRITIS"
                      ? "bg-rose-50/50 border-rose-200/80"
                      : "bg-amber-50/50 border-amber-200/80"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        alert.tingkat_urgensi === "KRITIS"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {alert.tingkat_urgensi}
                    </span>
                    {alert.entitas_terkait && (
                      <span className="text-[10px] text-slate-500 font-medium">
                        {alert.entitas_terkait}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{alert.judul}</h4>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    {alert.deskripsi}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400">
              Diperbarui otomatis dari transaksi M12, M13 & M18
            </span>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM SECTION: DISTRIBUSI TINGKAT KELAS */}
      <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 p-6 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Distribusi Capaian Kohort Tingkat Kelas
            </h3>
            <p className="text-xs text-slate-500">
              Komparasi agregasi jumlah siswa, rombel, rata-rata kehadiran, dan nilai antartingkat
            </p>
          </div>
          <button
            onClick={() => onSwitchTab("kurikulum")}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            <span>Analisis Kurikulum Lengkap</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/70 border-b border-slate-200/80 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Tingkat Kelas</th>
                <th className="py-3 px-4 text-center">Total Siswa</th>
                <th className="py-3 px-4 text-center">Rombongan Belajar</th>
                <th className="py-3 px-4 text-center">Rerata Presensi</th>
                <th className="py-3 px-4 text-center">Rerata Nilai Asesmen</th>
                <th className="py-3 px-4 text-center">Evaluasi Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.distribusi_tingkat.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    <span>{item.tingkat}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                    {item.total_siswa} Siswa
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-600">
                    {item.total_rombel} Rombel
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                      {item.rerata_kehadiran}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                    {item.rerata_nilai}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold">
                      Stabil
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
