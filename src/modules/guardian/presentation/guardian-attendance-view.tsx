"use client";

/**
 * Ruang Pintar — Guardian Attendance View (Phase 16 / M15)
 * Tampilan rekapitulasi kehadiran dan log absensi sesi KBM anak.
 */

import * as React from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Search,
  Filter,
} from "lucide-react";
import {
  ChildActiveContext,
  ChildAttendanceHistoryItem,
  ChildAttendanceRecap,
  LinkedChildSummary,
} from "../domain/guardian-types";
import { ChildSwitcherDropdown } from "./child-switcher-dropdown";
import { PengajuanIzinModal } from "./pengajuan-izin-modal";

export interface GuardianAttendanceViewProps {
  activeChild: ChildActiveContext;
  linkedChildren: LinkedChildSummary[];
  recap: ChildAttendanceRecap;
  history: ChildAttendanceHistoryItem[];
}

export function GuardianAttendanceView({
  activeChild,
  linkedChildren,
  recap,
  history,
}: GuardianAttendanceViewProps) {
  const [isIzinModalOpen, setIsIzinModalOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("SEMUA");

  const child = activeChild.siswa;

  const filteredHistory = history.filter((item) => {
    const matchSearch =
      item.mata_pelajaran.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.guru_pengampu.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === "SEMUA" || item.status === statusFilter;

    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
              Presensi & Kehadiran Anak
            </h1>
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              {recap.persentase_kehadiran}% Kehadiran
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rekapitulasi resmi kehadiran kelas dan pemantauan sesi belajar harian untuk{" "}
            <strong className="text-slate-700">{child.nama_lengkap}</strong>.
          </p>
        </div>

        {/* Child Switcher & Action Button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <ChildSwitcherDropdown linkedChildren={linkedChildren} activeChildId={child.siswa_id} />
          <button
            type="button"
            onClick={() => setIsIzinModalOpen(true)}
            data-testid="btn-ajukan-izin-presensi"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <FileCheck className="h-4 w-4" />
            <span>Ajukan Surat Izin / Sakit</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Presensi */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 block">Total Sesi KBM</span>
          <span className="text-xl font-extrabold text-slate-900 font-mono">
            {recap.total_sesi}
          </span>
          <span className="text-[10px] text-slate-400 block">Sesi Tercatat</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-emerald-700 block">Hadir</span>
          <span className="text-xl font-extrabold text-emerald-700 font-mono">{recap.hadir}</span>
          <span className="text-[10px] text-emerald-600/80 block">Tepat Waktu</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-blue-100 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-blue-700 block">Sakit</span>
          <span className="text-xl font-extrabold text-blue-700 font-mono">{recap.sakit}</span>
          <span className="text-[10px] text-blue-600/80 block">Dengan Surat</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-amber-100 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-amber-700 block">Izin</span>
          <span className="text-xl font-extrabold text-amber-700 font-mono">{recap.izin}</span>
          <span className="text-[10px] text-amber-600/80 block">Dispensasi</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-rose-700 block">Alpa</span>
          <span className="text-xl font-extrabold text-rose-700 font-mono">{recap.alpa}</span>
          <span className="text-[10px] text-rose-600/80 block">Tanpa Keterangan</span>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-emerald-800 block">Persentase</span>
          <span className="text-xl font-extrabold text-emerald-800 font-mono">
            {recap.persentase_kehadiran}%
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold block">
            {recap.kategori_kehadiran}
          </span>
        </div>
      </div>

      {/* Main Table: Log Presensi Sesi KBM */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-xs overflow-hidden space-y-4 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#2563EB]" />
            <h3 className="text-base font-bold text-slate-900">
              Riwayat Presensi Per Sesi Pembelajaran
            </h3>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari mata pelajaran / guru..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 w-48 sm:w-56"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              >
                <option value="SEMUA">Semua Status</option>
                <option value="HADIR">Hadir</option>
                <option value="SAKIT">Sakit</option>
                <option value="IZIN">Izin</option>
                <option value="ALPA">Alpa</option>
              </select>
            </div>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Tidak ada catatan presensi yang sesuai dengan filter pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Tanggal & Jam</th>
                  <th className="py-3 px-3">Mata Pelajaran</th>
                  <th className="py-3 px-3">Guru Pengampu</th>
                  <th className="py-3 px-3 text-center">Status Kehadiran</th>
                  <th className="py-3 px-3">Keterangan / Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((item) => {
                  const dateFormatted = new Date(item.tanggal).toLocaleDateString("id-ID", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-bold text-slate-800">{dateFormatted}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          <span>{item.jam}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {item.mata_pelajaran}
                      </td>
                      <td className="py-3 px-3 text-slate-600">{item.guru_pengampu}</td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                            item.status === "HADIR"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              : item.status === "SAKIT"
                                ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                                : item.status === "IZIN"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                                  : "bg-rose-50 text-rose-700 border border-rose-200/60"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px]">
                        {item.catatan || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Izin */}
      <PengajuanIzinModal
        isOpen={isIzinModalOpen}
        onClose={() => setIsIzinModalOpen(false)}
        linkedChildren={linkedChildren}
        activeChildId={child.siswa_id}
      />
    </div>
  );
}
