"use client";

import * as React from "react";
import {
  Wrench,
  Users,
  GraduationCap,
  Building2,
  TrendingUp,
  CheckCircle2,
  BookOpen,
  FileSpreadsheet,
} from "lucide-react";
import { StatCard } from "@/shared/components/dashboard/stat-card";
import { ProgramHeadOverviewDTO } from "../domain/reporting-types";

interface ProgramHeadViewProps {
  data: ProgramHeadOverviewDTO;
  onSwitchTab: (tabId: string) => void;
}

export function ProgramHeadView({ data, onSwitchTab }: ProgramHeadViewProps) {
  return (
    <div className="space-y-6">
      {/* 1. HERO PROGRAM BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold backdrop-blur-md">
              <Wrench className="h-3.5 w-3.5" />
              <span>Program-Scoped Leadership View</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Program Keahlian: {data.program_info.nama}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Evaluasi kinerja kompetensi kejuruan, rekapitulasi kehadiran rombel binaan, dan
              kesiapan uji kompetensi keahlian siswa jurusan.
            </p>
          </div>

          <button
            onClick={() => onSwitchTab("ekspor")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold shadow-md transition-all active:scale-95 self-start md:self-auto"
          >
            <FileSpreadsheet className="h-4 w-4 text-blue-600" />
            <span>Ekspor Capaian Jurusan</span>
          </button>
        </div>
      </div>

      {/* 2. 4 TOP STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Siswa Program Keahlian"
          value={`${data.kpi_program.total_siswa} Siswa`}
          icon={<Users className="h-6 w-6" />}
          trend={{
            value: data.program_info.kode ?? "TO",
            label: "Kode Konsentrasi",
            isPositive: true,
          }}
          watermarkIcon={<Users className="h-28 w-28" />}
        />
        <StatCard
          label="Rombel Kejuruan"
          value={`${data.kpi_program.total_rombel} Rombel`}
          icon={<Building2 className="h-6 w-6" />}
          trend={{
            value: "Kelas X – XII",
            label: "Sebaran Kohort",
            isPositive: true,
          }}
          watermarkIcon={<Building2 className="h-28 w-28" />}
        />
        <StatCard
          label="Rerata Kehadiran Jurusan"
          value={`${data.kpi_program.rerata_kehadiran}%`}
          icon={<TrendingUp className="h-6 w-6" />}
          trend={{
            value: "Disiplin Bengkel",
            label: "Presensi Praktik & Teori",
            isPositive: true,
          }}
          watermarkIcon={<TrendingUp className="h-28 w-28" />}
        />
        <StatCard
          label="Rerata Nilai Kejuruan"
          value={data.kpi_program.rerata_nilai_kejuruan.toFixed(1)}
          icon={<GraduationCap className="h-6 w-6" />}
          trend={{
            value: "KKTP 75",
            label: "Standar Industri",
            isPositive: true,
          }}
          watermarkIcon={<GraduationCap className="h-28 w-28" />}
        />
      </div>

      {/* 3. DAFTAR ROMBEL PROGRAM KEAHLIAN */}
      <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 p-6 shadow-sm overflow-hidden">
        <div className="mb-4">
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Rombongan Belajar Program Keahlian
          </h3>
          <p className="text-xs text-slate-500">
            Daftar kelas di bawah naungan program keahlian {data.program_info.nama}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/70 border-b border-slate-200/80 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Nama Rombel</th>
                <th className="py-3 px-4">Tingkat</th>
                <th className="py-3 px-4">Wali Kelas</th>
                <th className="py-3 px-4 text-center">Jumlah Siswa</th>
                <th className="py-3 px-4 text-center">Tingkat Presensi</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.rombel_list.map((r) => (
                <tr key={r.rombel_id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{r.nama_rombel}</td>
                  <td className="py-3.5 px-4 text-slate-600">{r.tingkat}</td>
                  <td className="py-3.5 px-4 text-slate-800 font-medium">{r.wali_kelas_nama}</td>
                  <td className="py-3.5 px-4 text-center text-slate-700 font-semibold">
                    {r.total_siswa} Siswa
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                      {r.rerata_kehadiran}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold">
                      Aktif
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. CAPAIAN MATA PELAJARAN KEJURUAN */}
      <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 p-6 shadow-sm overflow-hidden">
        <div className="mb-4">
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Capaian Mata Pelajaran Produktif & Kejuruan
          </h3>
          <p className="text-xs text-slate-500">
            Ketercapaian kompetensi keahlian dan nilai rata-rata asesmen kejuruan
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/70 border-b border-slate-200/80 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Mata Pelajaran Produktif</th>
                <th className="py-3 px-4">Kode</th>
                <th className="py-3 px-4">Guru Pengampu</th>
                <th className="py-3 px-4 text-center">Rerata Nilai</th>
                <th className="py-3 px-4 text-center">Ketuntasan KKTP</th>
                <th className="py-3 px-4 text-center">Evaluasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.mapel_kejuruan_list.map((m) => (
                <tr key={m.mapel_id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{m.nama_mapel}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px] font-semibold">
                    {m.kode_mapel}
                  </td>
                  <td className="py-3.5 px-4 text-slate-800 font-medium">{m.guru_pengampu}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                    {m.rerata_nilai}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                      {m.persentase_tuntas}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="text-emerald-600 font-semibold text-[11px]">
                      Sesuai Standar
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
