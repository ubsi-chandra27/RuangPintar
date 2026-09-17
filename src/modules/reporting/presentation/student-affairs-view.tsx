"use client";

import * as React from "react";
import {
  Users,
  TrendingUp,
  AlertOctagon,
  ClipboardList,
  ChevronRight,
  ShieldAlert,
  FileSpreadsheet,
} from "lucide-react";
import { StatCard } from "@/shared/components/dashboard/stat-card";
import { StudentAffairsOverviewDTO } from "../domain/reporting-types";

interface StudentAffairsViewProps {
  data: StudentAffairsOverviewDTO;
  onSwitchTab: (tabId: string) => void;
}

export function StudentAffairsView({ data, onSwitchTab }: StudentAffairsViewProps) {
  return (
    <div className="space-y-6">
      {/* 1. TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Siswa Terdaftar"
          value={`${data.kpi_kesiswaan.total_siswa} Siswa`}
          icon={<Users className="h-6 w-6" />}
          trend={{
            value: "100%",
            label: "Terdata di Database",
            isPositive: true,
          }}
          watermarkIcon={<Users className="h-28 w-28" />}
        />
        <StatCard
          label="Tingkat Presensi Global"
          value={`${data.kpi_kesiswaan.persentase_kehadiran_global}%`}
          icon={<TrendingUp className="h-6 w-6" />}
          trend={{
            value: "Target 90%",
            label: "Ambang Batas Sekolah",
            isPositive: data.kpi_kesiswaan.persentase_kehadiran_global >= 90,
          }}
          watermarkIcon={<TrendingUp className="h-28 w-28" />}
        />
        <StatCard
          label="Siswa Atensi Khusus (Alpha)"
          value={`${data.kpi_kesiswaan.total_siswa_kritis_alpha} Siswa`}
          icon={<AlertOctagon className="h-6 w-6" />}
          trend={{
            value: "Alpha Berulang",
            label: "Perlu Tindak Lanjut",
            isPositive: data.kpi_kesiswaan.total_siswa_kritis_alpha === 0,
          }}
          watermarkIcon={<AlertOctagon className="h-28 w-28" />}
        />
        <StatCard
          label="Catatan Pembinaan & BK"
          value={`${data.kpi_kesiswaan.total_catatan_pembinaan} Kasus`}
          icon={<ClipboardList className="h-6 w-6" />}
          trend={{
            value: `${data.kpi_kesiswaan.total_tindak_lanjut_aktif} Rencana`,
            label: "Follow-Up Aktif",
            isPositive: true,
          }}
          watermarkIcon={<ClipboardList className="h-28 w-28" />}
        />
      </div>

      {/* 2. REKAPITULASI PRESENSI PER ROMBEL */}
      <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 p-6 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Rekapitulasi Kehadiran Siswa Per Rombongan Belajar
            </h3>
            <p className="text-xs text-slate-500">
              Pemantauan persentase hadir, sakit, izin, dan alpa semester berjalan lintas kelas
            </p>
          </div>
          <button
            onClick={() => onSwitchTab("ekspor")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors self-start sm:self-auto"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-blue-600" />
            <span>Unduh CSV Presensi</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/70 border-b border-slate-200/80 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Rombel</th>
                <th className="py-3 px-4">Tingkat</th>
                <th className="py-3 px-4 text-center">Jumlah Siswa</th>
                <th className="py-3 px-4 text-center text-emerald-700">Hadir</th>
                <th className="py-3 px-4 text-center text-blue-700">Sakit</th>
                <th className="py-3 px-4 text-center text-amber-700">Izin</th>
                <th className="py-3 px-4 text-center text-rose-700">Alpha</th>
                <th className="py-3 px-4 text-center">Disiplin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.rekap_kehadiran_per_rombel.map((r) => (
                <tr key={r.rombel_id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{r.nama_rombel}</td>
                  <td className="py-3.5 px-4 text-slate-600">{r.tingkat}</td>
                  <td className="py-3.5 px-4 text-center font-medium text-slate-700">
                    {r.total_siswa} Siswa
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-emerald-600">
                    {r.hadir_pct}%
                  </td>
                  <td className="py-3.5 px-4 text-center text-blue-600">{r.sakit_pct}%</td>
                  <td className="py-3.5 px-4 text-center text-amber-600">{r.izin_pct}%</td>
                  <td className="py-3.5 px-4 text-center font-bold text-rose-600">
                    {r.alpha_pct}%
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        r.hadir_pct >= 90
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {r.hadir_pct >= 90 ? "Sangat Baik" : "Perlu Perhatian"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. ATENSI SISWA & DISTRIBUSI PEMBINAAN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Daftar Siswa Atensi Khusus */}
        <div className="lg:col-span-2 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Pusat Atensi Siswa & Chronic Absenteeism
              </h3>
            </div>
            <span className="text-xs text-slate-500">Siswa dengan akumulasi alpa tertinggi</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/70 border-b border-slate-200/80 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Nama Siswa</th>
                  <th className="py-2.5 px-3">Kelas</th>
                  <th className="py-2.5 px-3 text-center">Total Alpha</th>
                  <th className="py-2.5 px-3 text-center">Terlambat</th>
                  <th className="py-2.5 px-3 text-center">Urgensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.daftar_siswa_atensi.length > 0 ? (
                  data.daftar_siswa_atensi.map((s) => (
                    <tr key={s.siswa_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{s.nama_siswa}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          NISN: {s.nisn ?? "-"}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">{s.rombel_nama}</td>
                      <td className="py-3 px-3 text-center font-bold text-rose-600">
                        {s.jumlah_alpha} Kali
                      </td>
                      <td className="py-3 px-3 text-center text-amber-700">
                        {s.jumlah_terlambat} Kali
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            s.status_urgensi === "KRITIS"
                              ? "bg-rose-100 text-rose-700"
                              : s.status_urgensi === "TINGGI"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {s.status_urgensi}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      Tidak ada siswa dengan ketidakhadiran kritis.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Distribusi Kasus Pembinaan */}
        <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-2">
              Distribusi Kategori Pembinaan
            </h3>
            <p className="text-xs text-slate-500 mb-4">Klasifikasi masalah bimbingan siswa aktif</p>

            <div className="space-y-3">
              {data.distribusi_kasus_pembinaan.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100"
                >
                  <span className="text-xs font-semibold text-slate-700">{item.kategori}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                    {item.jumlah} Kasus
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400">
              Terkoneksi langsung dengan modul Wali Kelas (M18)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
