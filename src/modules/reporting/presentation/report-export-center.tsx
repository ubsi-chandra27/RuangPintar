"use client";

import * as React from "react";
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  History,
  CheckCircle2,
  Filter,
  FileText,
  Clock,
  Loader2,
} from "lucide-react";
import { RiwayatEksporItemDTO } from "../domain/reporting-types";
import {
  exportAttendanceCsvAction,
  exportAcademicCsvAction,
} from "@/app/actions/leadership-actions";

interface ReportExportCenterProps {
  history: RiwayatEksporItemDTO[];
  onOpenPrintModal: () => void;
  onRefreshHistory: () => void;
}

export function ReportExportCenter({
  history,
  onOpenPrintModal,
  onRefreshHistory,
}: ReportExportCenterProps) {
  const [downloadingAttendance, setDownloadingAttendance] = React.useState(false);
  const [downloadingAcademic, setDownloadingAcademic] = React.useState(false);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = React.useState<string | null>(null);

  const triggerDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportAttendance = async () => {
    try {
      setDownloadingAttendance(true);
      const res = await exportAttendanceCsvAction();
      if (res.success && res.data) {
        triggerDownload(res.data.filename, res.data.csvContent);
        setDownloadSuccessMessage(
          `Berhasil mengekspor ${res.data.totalRows} baris data presensi siswa (${res.data.filename}).`
        );
        onRefreshHistory();
      }
    } finally {
      setDownloadingAttendance(false);
    }
  };

  const handleExportAcademic = async () => {
    try {
      setDownloadingAcademic(true);
      const res = await exportAcademicCsvAction();
      if (res.success && res.data) {
        triggerDownload(res.data.filename, res.data.csvContent);
        setDownloadSuccessMessage(
          `Berhasil mengekspor ${res.data.totalRows} baris data nilai akademik (${res.data.filename}).`
        );
        onRefreshHistory();
      }
    } finally {
      setDownloadingAcademic(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SUCCESS NOTIFICATION */}
      {downloadSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{downloadSuccessMessage}</span>
          </div>
          <button
            onClick={() => setDownloadSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* 1. KARTU EKSPOR CEPAT */}
      <div>
        <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
          Pusat Unduh Dokumen & Rekapitulasi Laporan
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Pilih format dokumen laporan operasional resmi untuk kebutuhan administrasi sekolah atau
          akreditasi
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card A: Presensi CSV */}
          <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between hover:border-blue-300 transition-all">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Rekapitulasi Presensi Siswa</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Laporan rekap kehadiran (Hadir, Sakit, Izin, Alpha) seluruh siswa per rombel dalam
                  format CSV spreadsheet.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                Format CSV
              </span>
              <button
                onClick={handleExportAttendance}
                disabled={downloadingAttendance}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                {downloadingAttendance ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                <span>Unduh CSV</span>
              </button>
            </div>
          </div>

          {/* Card B: Nilai Akademik CSV */}
          <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition-all">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Rekap Capaian Nilai & KKTP</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Laporan rekapitulasi nilai asesmen antarmapel, persentase kelulusan KKTP, dan
                  beban guru pengampu per rombel.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                Format CSV
              </span>
              <button
                onClick={handleExportAcademic}
                disabled={downloadingAcademic}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                {downloadingAcademic ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                <span>Unduh CSV</span>
              </button>
            </div>
          </div>

          {/* Card C: Lembar Eksekutif Print A4 */}
          <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-all">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Printer className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Lembar Ringkasan Eksekutif</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Format cetak formal A4 berkop surat resmi sekolah, mencakup KPI utama, distribusi
                  tingkat, dan kolom tanda tangan kepala sekolah.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                Print-Ready A4
              </span>
              <button
                onClick={onOpenPrintModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Buka Lembar A4</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RIWAYAT EKSPOR LAPORAN */}
      <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 p-6 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-slate-600" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Riwayat Pembuatan Laporan Resmi
            </h3>
          </div>
          <span className="text-xs text-slate-500">Tercatat di Audit Log Sekolah (M02/M19)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/70 border-b border-slate-200/80 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Judul Dokumen Laporan</th>
                <th className="py-3 px-4">Tipe Laporan</th>
                <th className="py-3 px-4 text-center">Format</th>
                <th className="py-3 px-4 text-center">Total Baris</th>
                <th className="py-3 px-4">Dibuat Oleh</th>
                <th className="py-3 px-4">Waktu Pembuatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length > 0 ? (
                history.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{log.judul}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        {log.tipe_laporan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          log.format === "CSV"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-indigo-50 text-indigo-700"
                        }`}
                      >
                        {log.format}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-700 font-mono">
                      {log.total_baris > 0 ? `${log.total_baris} baris` : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium">
                      {log.dibuat_oleh_nama}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Intl.DateTimeFormat("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(log.created_at))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Belum ada riwayat pembuatan laporan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
