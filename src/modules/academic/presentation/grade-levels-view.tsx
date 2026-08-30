"use client";

/**
 * Ruang Pintar — Grade Levels & Phases Management Component (Academic Glass UI v1.2)
 */

import React, { useState, useMemo, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  Layers,
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  AlertTriangle,
  GraduationCap,
} from "lucide-react";
import { GradeLevelDTO, PhaseDTO } from "../domain/academic-types";
import {
  createGradeLevelAction,
  createPhaseAction,
  deleteGradeLevelAction,
  deletePhaseAction,
  updateGradeLevelAction,
  updatePhaseAction,
} from "@/app/actions/academic-actions";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { Toast } from "@/shared/components/ui/toast";

interface GradeLevelsViewProps {
  initialGradeLevels: GradeLevelDTO[];
  initialPhases: PhaseDTO[];
  canManage: boolean;
}

const emptySubscribe = () => () => {};

export function GradeLevelsView({
  initialGradeLevels,
  initialPhases,
  canManage,
}: GradeLevelsViewProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [gradeLevels, setGradeLevels] = useState<GradeLevelDTO[]>(initialGradeLevels);
  const [phases, setPhases] = useState<PhaseDTO[]>(initialPhases);
  const [activeSubTab, setActiveSubTab] = useState<"TINGKAT" | "FASE">("TINGKAT");

  // Grade Level Modals State
  const [gradeModalMode, setGradeModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<GradeLevelDTO | null>(null);
  const [deleteGradeTarget, setDeleteGradeTarget] = useState<GradeLevelDTO | null>(null);

  // Phase Modals State
  const [phaseModalMode, setPhaseModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<PhaseDTO | null>(null);
  const [deletePhaseTarget, setDeletePhaseTarget] = useState<PhaseDTO | null>(null);

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Toolbar State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Filtered Grade Levels
  const filteredGradeLevels = useMemo(() => {
    return gradeLevels.filter((g) => {
      if (searchQuery.trim() === "") return true;
      const q = searchQuery.toLowerCase();
      return (
        g.nama.toLowerCase().includes(q) ||
        g.kode.toLowerCase().includes(q) ||
        (g.fase_nama && g.fase_nama.toLowerCase().includes(q))
      );
    });
  }, [gradeLevels, searchQuery]);

  // Filtered Phases
  const filteredPhases = useMemo(() => {
    return phases.filter((p) => {
      if (searchQuery.trim() === "") return true;
      const q = searchQuery.toLowerCase();
      return (
        p.nama.toLowerCase().includes(q) ||
        p.kode.toLowerCase().includes(q) ||
        (p.deskripsi && p.deskripsi.toLowerCase().includes(q))
      );
    });
  }, [phases, searchQuery]);

  // Pagination for Active SubTab
  const currentList = activeSubTab === "TINGKAT" ? filteredGradeLevels : filteredPhases;
  const totalPages = Math.max(1, Math.ceil(currentList.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedGradeLevels = filteredGradeLevels.slice(startIndex, startIndex + pageSize);
  const paginatedPhases = filteredPhases.slice(startIndex, startIndex + pageSize);

  // Handlers Grade Level
  async function handleGradeSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canManage) return;

    setLoading(true);
    setToastMessage(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    let res;

    if (gradeModalMode === "create") {
      res = await createGradeLevelAction(formData);
    } else if (gradeModalMode === "edit" && selectedGrade) {
      res = await updateGradeLevelAction(selectedGrade.id, formData);
    }

    if (res?.success) {
      setToastMessage({ type: "success", text: res.message ?? "Operasi tingkat kelas berhasil." });
      setGradeModalMode(null);
      setSelectedGrade(null);
      if (gradeModalMode === "create" && res.data) {
        setGradeLevels((prev) => [...prev, res.data as GradeLevelDTO]);
      } else if (gradeModalMode === "edit" && res.data) {
        const updated = res.data as GradeLevelDTO;
        setGradeLevels((prev) => prev.map((g) => (g.id === updated.id ? { ...g, ...updated } : g)));
      }
    } else if (res && !res.success) {
      setToastMessage({ type: "error", text: res.error });
      if (res.details) {
        setFieldErrors(res.details);
      }
    }
    setLoading(false);
  }

  async function handleDeleteGradeConfirm() {
    if (!deleteGradeTarget || !canManage) return;
    setLoading(true);
    setToastMessage(null);

    const res = await deleteGradeLevelAction(deleteGradeTarget.id);
    if (res.success) {
      setToastMessage({ type: "success", text: res.message ?? "Tingkat kelas berhasil dihapus." });
      setGradeLevels((prev) => prev.filter((g) => g.id !== deleteGradeTarget.id));
      setDeleteGradeTarget(null);
    } else if (!res.success) {
      setToastMessage({ type: "error", text: res.error });
    }
    setLoading(false);
  }

  // Handlers Phase
  async function handlePhaseSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canManage) return;

    setLoading(true);
    setToastMessage(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    let res;

    if (phaseModalMode === "create") {
      res = await createPhaseAction(formData);
    } else if (phaseModalMode === "edit" && selectedPhase) {
      res = await updatePhaseAction(selectedPhase.id, formData);
    }

    if (res?.success) {
      setToastMessage({ type: "success", text: res.message ?? "Operasi fase berhasil." });
      setPhaseModalMode(null);
      setSelectedPhase(null);
      if (phaseModalMode === "create" && res.data) {
        setPhases((prev) => [...prev, res.data as PhaseDTO]);
      } else if (phaseModalMode === "edit" && res.data) {
        const updated = res.data as PhaseDTO;
        setPhases((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
      }
    } else if (res && !res.success) {
      setToastMessage({ type: "error", text: res.error });
      if (res.details) {
        setFieldErrors(res.details);
      }
    }
    setLoading(false);
  }

  async function handleDeletePhaseConfirm() {
    if (!deletePhaseTarget || !canManage) return;
    setLoading(true);
    setToastMessage(null);

    const res = await deletePhaseAction(deletePhaseTarget.id);
    if (res.success) {
      setToastMessage({ type: "success", text: res.message ?? "Fase berhasil dihapus." });
      setPhases((prev) => prev.filter((p) => p.id !== deletePhaseTarget.id));
      setDeletePhaseTarget(null);
    } else if (!res.success) {
      setToastMessage({ type: "error", text: res.error });
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <Toast
          type={toastMessage.type}
          message={toastMessage.text}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Main Glass Container */}
      <div className="rounded-3xl bg-white border border-slate-100/90 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100/80">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Tingkat Kelas & Fase Pendidikan</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              Atur hierarki tingkat kelas (Grade Level) dan fase kurikulum yang independen &
              fleksibel multi-jenjang.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {canManage && (
              <button
                type="button"
                onClick={() => {
                  setFieldErrors({});
                  if (activeSubTab === "TINGKAT") {
                    setSelectedGrade(null);
                    setGradeModalMode("create");
                  } else {
                    setSelectedPhase(null);
                    setPhaseModalMode("create");
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>{activeSubTab === "TINGKAT" ? "Tambah Tingkat" : "Tambah Fase"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub-Tabs: Tingkat Kelas vs Fase Pendidikan */}
        <div className="flex items-center rounded-2xl bg-slate-100/90 p-1 border border-slate-200/80 max-w-sm">
          <button
            type="button"
            onClick={() => {
              setActiveSubTab("TINGKAT");
              setCurrentPage(1);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              activeSubTab === "TINGKAT"
                ? "bg-white text-[#2563EB] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tingkat Kelas ({gradeLevels.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveSubTab("FASE");
              setCurrentPage(1);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              activeSubTab === "FASE"
                ? "bg-white text-[#2563EB] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Fase Kurikulum ({phases.length})
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/60">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={
                activeSubTab === "TINGKAT"
                  ? "Cari nama tingkat, kode, atau fase..."
                  : "Cari nama fase atau kode..."
              }
              className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-600 shadow-sm self-end md:self-auto">
            <span className="text-[11px] text-slate-400 font-medium">Baris:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-transparent border-none text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </div>
        </div>

        {/* 1. TINGKAT KELAS SUBTAB */}
        {activeSubTab === "TINGKAT" && (
          <>
            {filteredGradeLevels.length === 0 ? (
              <EmptyState
                title="Belum Ada Tingkat Kelas"
                description="Tambahkan tingkat kelas (seperti Kelas 10, 11, 12 atau Kelas 1-6) sesuai jenjang sekolah."
                action={
                  canManage ? (
                    <Button
                      variant="cobalt"
                      onClick={() => {
                        setSelectedGrade(null);
                        setFieldErrors({});
                        setGradeModalMode("create");
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1.5" />
                      Tambah Tingkat Pertama
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <>
                {/* Mobile Cards View (< 640px) */}
                <div className="block sm:hidden space-y-3">
                  {paginatedGradeLevels.map((grade) => (
                    <div
                      key={grade.id}
                      className="p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 rounded-lg bg-blue-50 text-[#2563EB] flex-shrink-0 mt-0.5">
                            <GraduationCap className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 leading-snug">
                              {grade.nama}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {grade.fase_nama ? (
                                <span>
                                  Fase:{" "}
                                  <strong className="text-blue-700 font-semibold">
                                    {grade.fase_nama}
                                  </strong>
                                </span>
                              ) : (
                                <span className="italic text-slate-400">Tanpa Fase Terhubung</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                          {grade.kode}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="text-slate-500 text-[11px]">
                          Urutan: <strong>{grade.urutan}</strong>
                        </span>
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md text-[11px]">
                          {grade.rombel_count ?? 0} Rombel
                        </span>
                      </div>

                      {canManage && (
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedGrade(grade);
                              setFieldErrors({});
                              setGradeModalMode("edit");
                            }}
                            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-100/90 hover:bg-blue-50 hover:text-[#2563EB] border border-slate-200/80 transition-all cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5 text-slate-500" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteGradeTarget(grade)}
                            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-rose-600 bg-rose-50/90 hover:bg-rose-100 hover:text-rose-700 border border-rose-200/80 transition-all cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Desktop Table View (>= 640px) */}
                <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
                  <table className="w-full text-left text-sm text-slate-700">
                    <thead className="bg-slate-50/90 text-[11px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200/80">
                      <tr>
                        <th className="py-3.5 px-4 font-bold">Nama Tingkat</th>
                        <th className="py-3.5 px-4 font-bold">Kode</th>
                        <th className="py-3.5 px-4 font-bold">Fase Kurikulum</th>
                        <th className="py-3.5 px-4 text-center font-bold">Urutan</th>
                        <th className="py-3.5 px-4 text-center font-bold">Jumlah Rombel</th>
                        {canManage && <th className="py-3.5 px-4 text-right font-bold">Aksi</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white font-medium">
                      {paginatedGradeLevels.map((grade) => (
                        <tr key={grade.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900">{grade.nama}</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-slate-700">
                            <Badge variant="neutral">{grade.kode}</Badge>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {grade.fase_nama ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                {grade.fase_nama}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs italic">Tanpa Fase</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-xs">
                            {grade.urutan}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                                grade.rombel_count
                                  ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {grade.rombel_count ?? 0} Rombel
                            </span>
                          </td>
                          {canManage && (
                            <td className="py-3.5 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedGrade(grade);
                                    setFieldErrors({});
                                    setGradeModalMode("edit");
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100/90 hover:bg-blue-50 hover:text-[#2563EB] border border-slate-200/80 transition-all cursor-pointer shadow-xs"
                                >
                                  <Pencil className="h-3.5 w-3.5 text-slate-500" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteGradeTarget(grade)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50/90 hover:bg-rose-100 hover:text-rose-700 border border-rose-200/80 transition-all cursor-pointer shadow-xs"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                  <span>Hapus</span>
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}

        {/* 2. FASE PENDIDIKAN SUBTAB */}
        {activeSubTab === "FASE" && (
          <>
            {filteredPhases.length === 0 ? (
              <EmptyState
                title="Belum Ada Fase Pendidikan"
                description="Tambahkan fase pendidikan (seperti Fase E, Fase F untuk SMA/SMK atau Fase A-D untuk SD/SMP)."
                action={
                  canManage ? (
                    <Button
                      variant="cobalt"
                      onClick={() => {
                        setSelectedPhase(null);
                        setFieldErrors({});
                        setPhaseModalMode("create");
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1.5" />
                      Tambah Fase Pertama
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <>
                {/* Mobile Cards View (< 640px) */}
                <div className="block sm:hidden space-y-3">
                  {paginatedPhases.map((phase) => (
                    <div
                      key={phase.id}
                      className="p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 flex-shrink-0 mt-0.5">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 leading-snug">
                              {phase.nama}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {phase.deskripsi ?? "Tanpa keterangan"}
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {phase.kode}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="text-slate-500 text-[11px]">
                          Tingkat Terhubung: <strong>{phase.tingkat_count ?? 0}</strong>
                        </span>
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md text-[11px]">
                          {phase.rombel_count ?? 0} Rombel
                        </span>
                      </div>

                      {canManage && (
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPhase(phase);
                              setFieldErrors({});
                              setPhaseModalMode("edit");
                            }}
                            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-100/90 hover:bg-blue-50 hover:text-[#2563EB] border border-slate-200/80 transition-all cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5 text-slate-500" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletePhaseTarget(phase)}
                            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-rose-600 bg-rose-50/90 hover:bg-rose-100 hover:text-rose-700 border border-rose-200/80 transition-all cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Desktop Table View (>= 640px) */}
                <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
                  <table className="w-full text-left text-sm text-slate-700">
                    <thead className="bg-slate-50/90 text-[11px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200/80">
                      <tr>
                        <th className="py-3.5 px-4 font-bold">Nama Fase</th>
                        <th className="py-3.5 px-4 font-bold">Kode</th>
                        <th className="py-3.5 px-4 font-bold">Deskripsi</th>
                        <th className="py-3.5 px-4 text-center font-bold">Urutan</th>
                        <th className="py-3.5 px-4 text-center font-bold">Tingkat Terhubung</th>
                        {canManage && <th className="py-3.5 px-4 text-right font-bold">Aksi</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white font-medium">
                      {paginatedPhases.map((phase) => (
                        <tr key={phase.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900">{phase.nama}</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs">
                            <Badge variant="cobalt">{phase.kode}</Badge>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate">
                            {phase.deskripsi ?? "-"}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-xs">
                            {phase.urutan}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {phase.tingkat_count ?? 0} Tingkat
                            </span>
                          </td>
                          {canManage && (
                            <td className="py-3.5 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedPhase(phase);
                                    setFieldErrors({});
                                    setPhaseModalMode("edit");
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100/90 hover:bg-blue-50 hover:text-[#2563EB] border border-slate-200/80 transition-all cursor-pointer shadow-xs"
                                >
                                  <Pencil className="h-3.5 w-3.5 text-slate-500" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletePhaseTarget(phase)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50/90 hover:bg-rose-100 hover:text-rose-700 border border-rose-200/80 transition-all cursor-pointer shadow-xs"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                  <span>Hapus</span>
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}

        {/* Pagination Controls */}
        {currentList.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Menampilkan{" "}
              <strong className="text-slate-800 font-bold">
                {startIndex + 1} - {Math.min(startIndex + pageSize, currentList.length)}
              </strong>{" "}
              dari <strong className="text-slate-800 font-bold">{currentList.length}</strong> data
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Sebelumnya</span>
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-8 w-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      safeCurrentPage === pageNum
                        ? "bg-[#2563EB] text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL CREATE / EDIT TINGKAT KELAS */}
      {isMounted &&
        gradeModalMode &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="grade-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
          >
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <h3 id="grade-modal-title" className="text-lg font-bold text-slate-900">
                    {gradeModalMode === "create" ? "Tambah Tingkat Kelas" : "Edit Tingkat Kelas"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setGradeModalMode(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Tutup modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleGradeSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="grade-nama"
                    className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                  >
                    Nama Tingkat Kelas <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="grade-nama"
                    name="nama"
                    type="text"
                    required
                    defaultValue={selectedGrade?.nama ?? ""}
                    placeholder="Contoh: Kelas 10 atau Kelas X"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all"
                  />
                  {fieldErrors.nama && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.nama[0]}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="grade-kode"
                      className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                    >
                      Kode Tingkat <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="grade-kode"
                      name="kode"
                      type="text"
                      required
                      defaultValue={selectedGrade?.kode ?? ""}
                      placeholder="Contoh: 10 atau X"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm font-mono uppercase focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all"
                    />
                    {fieldErrors.kode && (
                      <p className="text-xs text-rose-600 mt-1 font-medium">
                        {fieldErrors.kode[0]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="grade-urutan"
                      className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                    >
                      Urutan Tingkat
                    </label>
                    <input
                      id="grade-urutan"
                      name="urutan"
                      type="number"
                      min={1}
                      max={20}
                      defaultValue={selectedGrade?.urutan ?? 10}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="grade-fase"
                    className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                  >
                    Fase Kurikulum Terhubung (Opsional)
                  </label>
                  <select
                    id="grade-fase"
                    name="fase_id"
                    defaultValue={selectedGrade?.fase_id ?? ""}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all cursor-pointer"
                  >
                    <option value="">-- Tanpa Relasi Fase --</option>
                    {phases.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nama} ({p.kode})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setGradeModalMode(null)}
                    disabled={loading}
                    className="cursor-pointer"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="cobalt"
                    disabled={loading}
                    className="cursor-pointer"
                  >
                    {loading ? "Menyimpan..." : "Simpan Tingkat"}
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL CREATE / EDIT FASE */}
      {isMounted &&
        phaseModalMode &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="phase-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
          >
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h3 id="phase-modal-title" className="text-lg font-bold text-slate-900">
                    {phaseModalMode === "create" ? "Tambah Fase Kurikulum" : "Edit Fase Kurikulum"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPhaseModalMode(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Tutup modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handlePhaseSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="phase-nama"
                    className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                  >
                    Nama Fase <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="phase-nama"
                    name="nama"
                    type="text"
                    required
                    defaultValue={selectedPhase?.nama ?? ""}
                    placeholder="Contoh: Fase E"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all"
                  />
                  {fieldErrors.nama && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.nama[0]}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="phase-kode"
                      className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                    >
                      Kode Fase <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="phase-kode"
                      name="kode"
                      type="text"
                      required
                      defaultValue={selectedPhase?.kode ?? ""}
                      placeholder="Contoh: FASE_E"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm font-mono uppercase focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all"
                    />
                    {fieldErrors.kode && (
                      <p className="text-xs text-rose-600 mt-1 font-medium">
                        {fieldErrors.kode[0]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="phase-urutan"
                      className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                    >
                      Urutan Fase
                    </label>
                    <input
                      id="phase-urutan"
                      name="urutan"
                      type="number"
                      min={1}
                      max={10}
                      defaultValue={selectedPhase?.urutan ?? 5}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phase-desc"
                    className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                  >
                    Deskripsi / Cakupan (Opsional)
                  </label>
                  <input
                    id="phase-desc"
                    name="deskripsi"
                    type="text"
                    defaultValue={selectedPhase?.deskripsi ?? ""}
                    placeholder="Contoh: Jenjang SMA/SMK Kelas 10"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPhaseModalMode(null)}
                    disabled={loading}
                    className="cursor-pointer"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="cobalt"
                    disabled={loading}
                    className="cursor-pointer"
                  >
                    {loading ? "Menyimpan..." : "Simpan Fase"}
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* CONFIRMATION DELETE TINGKAT */}
      {isMounted &&
        deleteGradeTarget &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="del-grade-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
          >
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-100 p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center font-bold text-lg">
                  <AlertTriangle className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <h3 id="del-grade-title" className="text-lg font-bold text-slate-900">
                    Hapus Tingkat Kelas
                  </h3>
                  <p className="text-xs text-slate-500">Tindakan permanen di database</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus tingkat kelas{" "}
                <strong className="text-slate-900 font-semibold">{deleteGradeTarget.nama}</strong> (
                {deleteGradeTarget.kode})?
              </p>

              <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-xs text-amber-900 font-medium leading-relaxed">
                Tingkat kelas yang telah digunakan oleh rombel tidak dapat dihapus demi menjaga
                integritas data.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => setDeleteGradeTarget(null)}
                  disabled={loading}
                  className="cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteGradeConfirm}
                  disabled={loading}
                  className="cursor-pointer"
                >
                  {loading ? "Menghapus..." : "Ya, Hapus Tingkat"}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* CONFIRMATION DELETE FASE */}
      {isMounted &&
        deletePhaseTarget &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="del-phase-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
          >
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-100 p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center font-bold text-lg">
                  <AlertTriangle className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <h3 id="del-phase-title" className="text-lg font-bold text-slate-900">
                    Hapus Fase Pendidikan
                  </h3>
                  <p className="text-xs text-slate-500">Tindakan permanen di database</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus fase{" "}
                <strong className="text-slate-900 font-semibold">{deletePhaseTarget.nama}</strong> (
                {deletePhaseTarget.kode})?
              </p>

              <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-xs text-amber-900 font-medium leading-relaxed">
                Fase yang masih terhubung dengan tingkat kelas atau rombel tidak dapat dihapus.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => setDeletePhaseTarget(null)}
                  disabled={loading}
                  className="cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeletePhaseConfirm}
                  disabled={loading}
                  className="cursor-pointer"
                >
                  {loading ? "Menghapus..." : "Ya, Hapus Fase"}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
