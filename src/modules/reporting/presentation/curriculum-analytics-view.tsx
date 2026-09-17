"use client";

import * as React from "react";
import {
  BookOpen,
  Users,
  FileCheck2,
  GraduationCap,
  CheckCircle2,
  Clock,
  Layers,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import { StatCard } from "@/shared/components/dashboard/stat-card";
import { CurriculumOverviewDTO } from "../domain/reporting-types";

interface CurriculumAnalyticsViewProps {
  data: CurriculumOverviewDTO;
  onSwitchTab: (tabId: string) => void;
}

export function CurriculumAnalyticsView({ data, onSwitchTab }: CurriculumAnalyticsViewProps) {
  return (
    <div className="space-y-6">
      {/* 1. TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Mata Pelajaran Aktif"
          value={`${data.kpi_kurikulum.total_mata_pelajaran} Mapel`}
          icon={<BookOpen className="h-6 w-6" />}
          trend={{
            value: `${data.kpi_kurikulum.total_materi_publikasi} Modul`,
            label: "Materi Terpublikasi",
            isPositive: true,
          }}
          watermarkIcon={<BookOpen className="h-28 w-28" />}
        />
        <StatCard
          label="Guru Pengampu Aktif"
          value={`${data.kpi_kurikulum.total_guru_mengajar} Guru`}
          icon={<Users className="h-6 w-6" />}
          trend={{
            value: `${data.kpi_kurikulum.total_tugas_aktif} Tugas`,
            label: "Penugasan Dikelola",
            isPositive: true,
          }}
          watermarkIcon={<Users className="h-28 w-28" />}
        />
        <StatCard
          label="Kepatuhan Administrasi Guru"
          value={`${data.kepatuhan_administrasi.persentase_kepatuhan}%`}
          icon={<FileCheck2 className="h-6 w-6" />}
          trend={{
            value: `${data.kepatuhan_administrasi.guru_patuh_count}/${data.kepatuhan_administrasi.guru_total_count}`,
            label: "Guru Lengkap Dokumen",
            isPositive: data.kepatuhan_administrasi.persentase_kepatuhan >= 80,
          }}
          watermarkIcon={<FileCheck2 className="h-28 w-28" />}
        />
        <StatCard
          label="Ketuntasan Asesmen KKTP"
          value={`${data.kpi_kurikulum.persentase_kelulusan_kktp}%`}
          icon={<GraduationCap className="h-6 w-6" />}
          trend={{
            value: `${data.kpi_kurikulum.total_asesmen} Sesi`,
            label: "Asesmen Terpublikasi",
            isPositive: true,
          }}
          watermarkIcon={<GraduationCap className="h-28 w-28" />}
        />
      </div>

      {/* 2. TABEL CAPAIAN PER MATA PELAJARAN */}
      <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 p-6 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Capaian Nilai & Ketuntasan Per Mata Pelajaran
            </h3>
            <p className="text-xs text-slate-500">
              Evaluasi ketercapaian kriteria ketuntasan tujuan pembelajaran (KKTP) antarmapel
            </p>
          </div>
          <button
            onClick={() => onSwitchTab("ekspor")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors self-start sm:self-auto"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>Ekspor Rekap Nilai</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/70 border-b border-slate-200/80 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Mata Pelajaran</th>
                <th className="py-3 px-4">Kode / Kelompok</th>
                <th className="py-3 px-4 text-center">Pengampu</th>
                <th className="py-3 px-4 text-center">Rerata Nilai</th>
                <th className="py-3 px-4 text-center">Persentase Tuntas</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.capaian_per_mapel.map((m) => (
                <tr key={m.mapel_id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{m.nama_mapel}</td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-700 mr-1.5">
                      {m.kode_mapel}
                    </span>
                    <span className="text-[11px] text-slate-500">{m.kelompok}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-700 font-medium">
                    {m.guru_pengampu_count} Guru
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                    {m.rerata_nilai}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[11px] ${
                        m.persentase_tuntas >= 85
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {m.persentase_tuntas}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {m.persentase_tuntas >= 85 ? (
                      <span className="text-emerald-600 font-medium text-[11px]">Memuaskan</span>
                    ) : (
                      <span className="text-amber-600 font-medium text-[11px]">Perlu Remedial</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. TABEL BEBAN MENGAJAR GURU */}
      <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 p-6 shadow-sm overflow-hidden">
        <div className="mb-4">
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Distribusi Beban Mengajar Tenaga Pendidik
          </h3>
          <p className="text-xs text-slate-500">
            Monitoring ekuivalensi jam tatap muka per minggu (standar 24 JP) dan sebaran rombel
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/70 border-b border-slate-200/80 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Nama Guru</th>
                <th className="py-3 px-4">NIP</th>
                <th className="py-3 px-4 text-center">Beban Tatap Muka</th>
                <th className="py-3 px-4 text-center">Rombel Diampu</th>
                <th className="py-3 px-4 text-center">Mata Pelajaran</th>
                <th className="py-3 px-4 text-center">Status Pemenuhan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.beban_mengajar_guru.map((b) => (
                <tr key={b.guru_id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{b.nama_guru}</td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                    {b.nip ?? "-"}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                    {b.total_jam_minggu} JP / minggu
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-700">
                    {b.total_rombel} Rombel
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-700">{b.total_mapel} Mapel</td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        b.status_beban === "OPTIMAL"
                          ? "bg-emerald-50 text-emerald-700"
                          : b.status_beban === "LEBIH"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {b.status_beban === "OPTIMAL"
                        ? "Optimal (24 JP)"
                        : b.status_beban === "LEBIH"
                          ? "Beban Lebih"
                          : "Kurang dari 24 JP"}
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
