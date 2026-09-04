"use client";

/**
 * Ruang Pintar — M13 Class Assessment Tab View (Academic Glass UI v1.2)
 *
 * Mengintegrasikan:
 * 1. Manajemen Asesmen Berbasis TP / BAB (Formatif & Sumatif)
 * 2. Matriks Buku Nilai Terpadu (Gradebook Matrix View)
 * 3. Alur Pengambilan & Publikasi Nilai Siswa
 */

import React, { useState, useTransition } from "react";
import {
  GraduationCap,
  Plus,
  Target,
  Layers,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  Trash2,
  Edit3,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  Users,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import {
  DefinisiAsesmenDTO,
  ClassGradebookDTO,
  AssessmentCategory,
} from "../domain/assessment-types";
import { CreateAssessmentModal } from "./create-assessment-modal";
import { InputGradesModal } from "./input-grades-modal";
import { PublishAssessmentModal } from "./publish-assessment-modal";
import { deleteAssessmentAction } from "@/app/actions/assessment-actions";

interface ClassAssessmentTabViewProps {
  penugasanId: string;
  canManage: boolean;
  assessments: DefinisiAsesmenDTO[];
  gradebook: ClassGradebookDTO;
  lingkupMateriList: Array<{
    id: string;
    judul: string;
    tujuan_pembelajaran: Array<{
      id: string;
      kode?: string | null;
      deskripsi: string;
    }>;
  }>;
  onRefresh: () => void;
  onShowToast: (message: string, type: "success" | "error" | "info") => void;
}

export function ClassAssessmentTabView({
  penugasanId,
  canManage,
  assessments,
  gradebook,
  lingkupMateriList,
  onRefresh,
  onShowToast,
}: ClassAssessmentTabViewProps) {
  const [isPending, startTransition] = useTransition();
  const [activeSubTab, setActiveSubTab] = useState<"ASESMEN" | "GRADEBOOK">("ASESMEN");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [inputGradesTargetId, setInputGradesTargetId] = useState<string | null>(null);
  const [publishTarget, setPublishTarget] = useState<DefinisiAsesmenDTO | null>(null);

  // Filter asesmen
  const filteredAssessments = assessments.filter((a) => {
    const matchCat = filterCategory === "ALL" || a.kategori === filterCategory;
    const matchSearch =
      a.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.tp_kode && a.tp_kode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.tp_deskripsi && a.tp_deskripsi.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const handleDeleteAssessment = (asesmenId: string, judul: string) => {
    if (!confirm(`Hapus asesmen '${judul}' beserta seluruh nilai di dalamnya?`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteAssessmentAction(asesmenId, penugasanId);
      if (res.success) {
        onShowToast(res.message, "success");
        onRefresh();
      } else {
        onShowToast(res.message, "error");
      }
    });
  };

  // KPI Statistics
  const totalAsesmen = assessments.length;
  const totalFormatif = assessments.filter((a) => a.kategori === "FORMATIF").length;
  const totalSumatif = assessments.filter((a) => a.kategori !== "FORMATIF").length;
  const rataRataKelas = gradebook.statistics.rata_rata_kelas ?? "-";
  const tuntasKktpPersen = gradebook.statistics.persentase_tuntas_kktp ?? "-";

  return (
    <div className="space-y-6">
      {/* 1. KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center gap-2.5 text-slate-500 text-xs font-semibold">
            <Target className="h-4 w-4 text-[#2563EB]" />
            Total Asesmen
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{totalAsesmen}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Seluruh kegiatan nilai</p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center gap-2.5 text-slate-500 text-xs font-semibold">
            <GraduationCap className="h-4 w-4 text-blue-500" />
            Formatif (TP)
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{totalFormatif}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Penilaian tujuan belajar</p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center gap-2.5 text-slate-500 text-xs font-semibold">
            <Layers className="h-4 w-4 text-indigo-500" />
            Sumatif (BAB/SAS)
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{totalSumatif}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Evaluasi lingkup materi</p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center gap-2.5 text-slate-500 text-xs font-semibold">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Rata-rata Kelas
          </div>
          <div className="mt-2 text-2xl font-bold text-[#2563EB]">{rataRataKelas}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Rerata seluruh nilai</p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2.5 text-slate-500 text-xs font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Ketuntasan KKTP
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">
            {tuntasKktpPersen !== "-" ? `${tuntasKktpPersen}%` : "-"}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Ambang batas KKTP {gradebook.kkm_default}
          </p>
        </div>
      </div>

      {/* 2. Sub-tab switcher & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Toggle View Mode */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveSubTab("ASESMEN")}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "ASESMEN"
                ? "bg-white text-[#2563EB] shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Target className="h-3.5 w-3.5" />
            Daftar Asesmen
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("GRADEBOOK")}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "GRADEBOOK"
                ? "bg-white text-[#2563EB] shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Buku Nilai (Gradebook Matrix)
          </button>
        </div>

        {/* Right side Actions */}
        <div className="flex items-center gap-2">
          {canManage && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3.5 py-2 text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 active:scale-98 rounded-xl shadow-xs shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Buat Asesmen Baru
            </button>
          )}
        </div>
      </div>

      {/* ========================================== */}
      {/* SUB-TAB 1: DAFTAR ASESMEN                  */}
      {/* ========================================== */}
      {activeSubTab === "ASESMEN" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <div className="relative w-full">
                <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari judul asesmen atau TP..."
                  className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs">Kategori:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 outline-none cursor-pointer"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="FORMATIF">Formatif (TP)</option>
                <option value="SUMATIF">Sumatif (BAB)</option>
                <option value="SUMATIF_AKHIR">Sumatif Akhir (SAS)</option>
                <option value="TUGAS">Tugas</option>
                <option value="PRAKTIK">Praktik</option>
              </select>
            </div>
          </div>

          {/* Cards / Table List */}
          {filteredAssessments.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
              <Target className="h-10 w-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">Belum Ada Asesmen Pembelajaran</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Mulai buat asesmen formatif berdasarkan Tujuan Pembelajaran (TP) atau asesmen
                sumatif lingkup materi BAB untuk mengambil nilai siswa.
              </p>
              {canManage && (
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 transition-colors shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  Buat Asesmen Pertama
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredAssessments.map((a) => {
                const isComplete =
                  a.total_siswa_rombel > 0 && a.total_siswa_dinilai >= a.total_siswa_rombel;

                return (
                  <div
                    key={a.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              a.kategori === "FORMATIF"
                                ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                                : a.kategori === "SUMATIF"
                                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                                  : "bg-purple-50 text-purple-700 border border-purple-200/60"
                            }`}
                          >
                            {a.kategori}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Bobot: {a.bobot}x
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {a.is_published ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                              <CheckCircle2 className="h-3 w-3" />
                              Dipublikasikan
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                              <Clock className="h-3 w-3" />
                              Draf Internal
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Judul & TP Context */}
                      <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{a.judul}</h4>
                      {a.tp_kode ? (
                        <p className="text-[11px] text-blue-600 font-medium mt-0.5">
                          {a.tp_kode} • {a.tp_deskripsi || ""}
                        </p>
                      ) : a.lingkup_materi_judul ? (
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          BAB: {a.lingkup_materi_judul}
                        </p>
                      ) : null}

                      {/* Detail Metrics */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-1.5 rounded-xl bg-slate-50">
                          <span className="text-[10px] text-slate-400 block">Status Siswa</span>
                          <span
                            className={`font-bold ${
                              isComplete ? "text-emerald-700" : "text-amber-700"
                            }`}
                          >
                            {a.total_siswa_dinilai}/{a.total_siswa_rombel}
                          </span>
                        </div>

                        <div className="p-1.5 rounded-xl bg-slate-50">
                          <span className="text-[10px] text-slate-400 block">KKTP</span>
                          <span className="font-bold text-slate-700">{a.kkm_kktp}</span>
                        </div>

                        <div className="p-1.5 rounded-xl bg-slate-50">
                          <span className="text-[10px] text-slate-400 block">Rata-rata</span>
                          <span className="font-bold text-[#2563EB]">
                            {a.rata_rata_nilai !== null ? a.rata_rata_nilai : "-"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="text-[10px] text-slate-400">
                        {new Date(a.tanggal_pelaksanaan).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => handleDeleteAssessment(a.id, a.judul)}
                            title="Hapus Asesmen"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}

                        {canManage && !a.is_published && a.total_siswa_dinilai > 0 && (
                          <button
                            type="button"
                            onClick={() => setPublishTarget(a)}
                            title="Publikasikan ke Siswa/Wali"
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="h-3 w-3" />
                            Publikasi
                          </button>
                        )}

                        {canManage && (
                          <button
                            type="button"
                            onClick={() => setInputGradesTargetId(a.id)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Award className="h-3.5 w-3.5" />
                            Input Nilai
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* SUB-TAB 2: BUKU NILAI (GRADEBOOK MATRIX)   */}
      {/* ========================================== */}
      {activeSubTab === "GRADEBOOK" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div>
              Matriks Rekapitulasi Nilai Siswa Rombel{" "}
              <strong className="text-slate-800">{gradebook.rombel_nama}</strong> • Mapel{" "}
              <strong className="text-slate-800">{gradebook.mata_pelajaran_nama}</strong>
            </div>

            <div className="text-[11px]">
              * Nilai kosong (<span className="font-semibold">-</span>) = Belum Dinilai (
              <em>Missing Grade ≠ 0</em>)
            </div>
          </div>

          {gradebook.rows.length === 0 ? (
            <div className="p-10 text-center rounded-3xl bg-white border border-slate-200 text-slate-400 text-xs">
              Belum ada data siswa terdaftar pada rombel ini.
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    {/* Level 1: Category Header */}
                    <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold">
                      <th colSpan={3} className="py-2.5 px-4 text-center border-r border-slate-200">
                        Identitas Siswa
                      </th>
                      {gradebook.columns.map((col) => (
                        <th
                          key={col.id}
                          className="py-2 px-3 text-center border-r border-slate-200 min-w-[110px]"
                        >
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              col.kategori === "FORMATIF"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-indigo-100 text-indigo-800"
                            }`}
                          >
                            {col.kategori}
                          </span>
                        </th>
                      ))}
                      <th colSpan={4} className="py-2.5 px-4 text-center bg-slate-200/60">
                        Rekapitulasi Nilai Akhir
                      </th>
                    </tr>

                    {/* Level 2: Assessment Details */}
                    <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] text-slate-600 font-semibold">
                      <th className="py-2.5 px-3 w-12 text-center">Abs</th>
                      <th className="py-2.5 px-3 w-24">NIS</th>
                      <th className="py-2.5 px-4 border-r border-slate-200 min-w-[180px]">
                        Nama Lengkap
                      </th>
                      {gradebook.columns.map((col) => (
                        <th
                          key={col.id}
                          className="py-2 px-2.5 text-center border-r border-slate-200 font-medium"
                        >
                          <div
                            className="truncate max-w-[100px] mx-auto font-bold text-slate-800"
                            title={col.judul}
                          >
                            {col.judul}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            KKTP: {col.kkm_kktp} | {col.bobot}x
                          </div>
                        </th>
                      ))}
                      <th className="py-2 px-3 text-center w-20 bg-slate-50">Rerata Formatif</th>
                      <th className="py-2 px-3 text-center w-20 bg-slate-50">Rerata Sumatif</th>
                      <th className="py-2 px-3 text-center w-24 font-bold text-slate-900 bg-blue-50/60 border-x border-blue-200/50">
                        Nilai Akhir
                      </th>
                      <th className="py-2 px-3 text-center w-24 bg-slate-50">Ketuntasan</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 bg-white">
                    {gradebook.rows.map((row, idx) => {
                      const isLulus =
                        row.nilai_akhir !== null && row.nilai_akhir >= gradebook.kkm_default;

                      return (
                        <tr key={row.siswa_id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 px-3 text-center text-slate-400 font-medium">
                            {row.nomor_absen || idx + 1}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">
                            {row.nis}
                          </td>
                          <td className="py-2.5 px-4 font-bold text-slate-800 border-r border-slate-200">
                            {row.nama_lengkap}
                          </td>

                          {/* Dynamic Grades Columns */}
                          {gradebook.columns.map((col) => {
                            const gradeData = row.grades[col.id];
                            const score = gradeData?.nilai_angka;
                            const hasScore = score !== null && score !== undefined;
                            const isAboveKktp = hasScore && score >= col.kkm_kktp;

                            return (
                              <td
                                key={col.id}
                                className="py-2.5 px-2.5 text-center border-r border-slate-200 font-mono"
                              >
                                {hasScore ? (
                                  <span
                                    className={`inline-block px-1.5 py-0.5 rounded-md font-bold text-xs ${
                                      isAboveKktp
                                        ? "text-emerald-700 bg-emerald-50"
                                        : "text-rose-700 bg-rose-50"
                                    }`}
                                  >
                                    {score}
                                  </span>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>
                            );
                          })}

                          {/* Rekapitulasi Akhir */}
                          <td className="py-2.5 px-3 text-center font-mono text-slate-600 bg-slate-50/30">
                            {row.rata_rata_formatif !== null ? row.rata_rata_formatif : "-"}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-slate-600 bg-slate-50/30">
                            {row.rata_rata_sumatif !== null ? row.rata_rata_sumatif : "-"}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-sm bg-blue-50/40 border-x border-blue-200/50 text-[#2563EB]">
                            {row.nilai_akhir !== null ? row.nilai_akhir : "-"}
                          </td>
                          <td className="py-2.5 px-3 text-center bg-slate-50/30">
                            {row.nilai_akhir === null ? (
                              <span className="text-slate-300 text-[10px]">-</span>
                            ) : isLulus ? (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                Tuntas
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                                Remedial
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateAssessmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        penugasanId={penugasanId}
        lingkupMateriList={lingkupMateriList}
        onSuccess={(msg) => {
          onShowToast(msg, "success");
          onRefresh();
        }}
        onError={(msg) => onShowToast(msg, "error")}
      />

      {inputGradesTargetId && (
        <InputGradesModal
          asesmenId={inputGradesTargetId}
          penugasanId={penugasanId}
          isOpen={Boolean(inputGradesTargetId)}
          onClose={() => setInputGradesTargetId(null)}
          onSuccess={(msg) => {
            onShowToast(msg, "success");
            onRefresh();
          }}
          onError={(msg) => onShowToast(msg, "error")}
        />
      )}

      {publishTarget && (
        <PublishAssessmentModal
          asesmen={publishTarget}
          penugasanId={penugasanId}
          isOpen={Boolean(publishTarget)}
          onClose={() => setPublishTarget(null)}
          onSuccess={(msg) => {
            onShowToast(msg, "success");
            onRefresh();
          }}
          onError={(msg) => onShowToast(msg, "error")}
        />
      )}
    </div>
  );
}
