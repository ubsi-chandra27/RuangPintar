"use client";

/**
 * Ruang Pintar — Guardian Grades & Report Card View (Phase 16 / M15)
 * Tampilan nilai asesmen resmi terpublikasi dan buku e-Rapor Kurikulum Merdeka.
 */

import * as React from "react";
import {
  Award,
  BookOpen,
  Printer,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Search,
  School,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  ChildActiveContext,
  ChildPublishedGradeItem,
  ChildReportCardSummary,
  LinkedChildSummary,
} from "../domain/guardian-types";
import { ChildSwitcherDropdown } from "./child-switcher-dropdown";
import { GuardianReportPrintModal } from "./guardian-report-print-modal";

export interface GuardianGradesViewProps {
  activeChild: ChildActiveContext;
  linkedChildren: LinkedChildSummary[];
  publishedGrades: ChildPublishedGradeItem[];
  reportCard: ChildReportCardSummary;
}

export function GuardianGradesView({
  activeChild,
  linkedChildren,
  publishedGrades,
  reportCard,
}: GuardianGradesViewProps) {
  const [activeTab, setActiveTab] = React.useState<"grades" | "report">("grades");
  const [isPrintModalOpen, setIsPrintModalOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const child = activeChild.siswa;

  const filteredGrades = publishedGrades.filter(
    (g) =>
      g.judul_asesmen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.mata_pelajaran.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.guru_nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
              Perkembangan Nilai & Rapor
            </h1>
            <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#2563EB] text-xs font-bold border border-blue-200">
              Kurikulum Merdeka
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Transkrip capaian kompetensi dan publikasi nilai resmi untuk{" "}
            <strong className="text-slate-700">{child.nama_lengkap}</strong>.
          </p>
        </div>

        {/* Child Switcher & Print Button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <ChildSwitcherDropdown linkedChildren={linkedChildren} activeChildId={child.siswa_id} />
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            data-testid="btn-cetak-rapor"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak Lembar Rapor A4</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation (Academic Glass UI v1.2) */}
      <div className="flex border-b border-slate-200/80 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab("grades")}
          data-testid="tab-grades"
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer border-b-2 -mb-px ${
            activeTab === "grades"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Nilai Asesmen Terpublikasi ({publishedGrades.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("report")}
          data-testid="tab-report"
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer border-b-2 -mb-px ${
            activeTab === "report"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Buku e-Rapor Resmi</span>
        </button>
      </div>

      {/* TAB 1: Nilai Asesmen Terpublikasi Resmi */}
      {activeTab === "grades" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs">
            <div className="relative flex-1">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama asesmen / mata pelajaran..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span>*Hanya menampilkan asesmen yang telah dipublikasikan resmi</span>
            </div>
          </div>

          {filteredGrades.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-100 shadow-2xs">
              Belum ada nilai asesmen resmi yang sesuai dengan filter pencarian.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredGrades.map((g) => (
                <div
                  key={g.id}
                  className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 shadow-2xs transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] px-2 py-0.5 bg-blue-50 border border-blue-200/60 rounded-md">
                      {g.jenis_asesmen}
                    </span>
                    <span className="text-xl font-extrabold text-slate-900 font-mono">
                      {g.nilai !== null ? g.nilai : "-"}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                      {g.judul_asesmen}
                    </h4>
                    <p className="text-[11px] text-slate-500">{g.mata_pelajaran}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Pengampu: {g.guru_nama}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-emerald-700">{g.kategori_capaian}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(g.tanggal_publikasi).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Buku e-Rapor Resmi */}
      {activeTab === "report" && (
        <div className="space-y-6">
          {/* Rapor Overview Header */}
          <div className="rounded-2xl bg-white border border-slate-100 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">
                  Transkrip Capaian Akademik
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Laporan Hasil Belajar — {reportCard.semester_nama}
                </h3>
                <p className="text-xs text-slate-500">
                  Tahun Ajaran {reportCard.tahun_ajaran} • {reportCard.fase} •{" "}
                  {reportCard.rombel_nama}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>Pratinjau Cetak</span>
                </button>
              </div>
            </div>

            {/* Mata Pelajaran Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-3 w-8">No</th>
                    <th className="py-3 px-3">Mata Pelajaran & Guru</th>
                    <th className="py-3 px-3 text-center">KKTP</th>
                    <th className="py-3 px-3 text-center">Nilai Akhir</th>
                    <th className="py-3 px-3 text-center">Predikat</th>
                    <th className="py-3 px-3">Deskripsi Capaian Kompetensi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportCard.mata_pelajaran.map((sub, idx) => (
                    <tr key={sub.mata_pelajaran_id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-3 text-slate-400 font-medium">{idx + 1}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        <div>{sub.mata_pelajaran_nama}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {sub.guru_nama}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-600">{sub.kktp}</td>
                      <td className="py-3 px-3 text-center font-extrabold font-mono text-slate-900">
                        {sub.nilai_akhir !== null ? sub.nilai_akhir : "-"}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-md font-bold text-xs bg-slate-100 text-slate-800">
                          {sub.predikat}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-600 leading-relaxed max-w-xs">
                        {sub.capaian_tertinggi && (
                          <div>
                            <span className="font-bold text-emerald-700">Tuntas: </span>
                            {sub.capaian_tertinggi}
                          </div>
                        )}
                        {sub.capaian_terendah && (
                          <div className="mt-0.5 text-slate-500">
                            <span className="font-bold text-amber-700">Ditingkatkan: </span>
                            {sub.capaian_terendah}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Wali Kelas Note & Presence */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-xs space-y-3">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                Catatan Wali Kelas
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed italic bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                &ldquo;{reportCard.catatan_wali_kelas}&rdquo;
              </p>
              <div className="text-[11px] text-slate-500 pt-1">
                Wali Kelas: <strong>{reportCard.wali_kelas_nama}</strong>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-xs space-y-3">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                Rekap Kehadiran Semester Ini
              </h4>
              <div className="grid grid-cols-4 gap-2 text-center pt-1">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800">
                  <span className="text-base font-extrabold block">
                    {reportCard.rekap_presensi.hadir}
                  </span>
                  <span className="text-[10px] font-bold">Hadir</span>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-800">
                  <span className="text-base font-extrabold block">
                    {reportCard.rekap_presensi.sakit}
                  </span>
                  <span className="text-[10px] font-bold">Sakit</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800">
                  <span className="text-base font-extrabold block">
                    {reportCard.rekap_presensi.izin}
                  </span>
                  <span className="text-[10px] font-bold">Izin</span>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-800">
                  <span className="text-base font-extrabold block">
                    {reportCard.rekap_presensi.alpa}
                  </span>
                  <span className="text-[10px] font-bold">Alpa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cetak A4 */}
      <GuardianReportPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        reportCard={reportCard}
      />
    </div>
  );
}
