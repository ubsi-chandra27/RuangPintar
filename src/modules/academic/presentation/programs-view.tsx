"use client";

/**
 * Ruang Pintar — Academic Programs / Majors Management Component (Academic Glass UI v1.2)
 */

import React, { useState, useMemo, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  BookOpen,
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { AcademicProgramDTO } from "../domain/academic-types";
import {
  createProgramAction,
  deleteProgramAction,
  updateProgramAction,
} from "@/app/actions/academic-actions";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { Toast } from "@/shared/components/ui/toast";

interface ProgramsViewProps {
  initialPrograms: AcademicProgramDTO[];
  canManage: boolean;
}

const emptySubscribe = () => () => {};

export function ProgramsView({ initialPrograms, canManage }: ProgramsViewProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [programs, setPrograms] = useState<AcademicProgramDTO[]>(initialPrograms);

  // Modals state
  const [programModalMode, setProgramModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<AcademicProgramDTO | null>(null);
  const [deleteProgramTarget, setDeleteProgramTarget] = useState<AcademicProgramDTO | null>(null);

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Toolbar & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Filtered programs
  const filteredPrograms = useMemo(() => {
    return programs.filter((p) => {
      if (searchQuery.trim() === "") return true;
      const q = searchQuery.toLowerCase();
      return (
        p.nama.toLowerCase().includes(q) ||
        p.kode.toLowerCase().includes(q) ||
        (p.jenjang && p.jenjang.toLowerCase().includes(q)) ||
        (p.deskripsi && p.deskripsi.toLowerCase().includes(q))
      );
    });
  }, [programs, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredPrograms.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedPrograms = filteredPrograms.slice(startIndex, startIndex + pageSize);

  async function handleProgramSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canManage) return;

    setLoading(true);
    setToastMessage(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    let res;

    if (programModalMode === "create") {
      res = await createProgramAction(formData);
    } else if (programModalMode === "edit" && selectedProgram) {
      res = await updateProgramAction(selectedProgram.id, formData);
    }

    if (res?.success) {
      setToastMessage({
        type: "success",
        text: res.message ?? "Operasi program keahlian berhasil.",
      });
      setProgramModalMode(null);
      setSelectedProgram(null);
      if (programModalMode === "create" && res.data) {
        setPrograms((prev) => [...prev, res.data as AcademicProgramDTO]);
      } else if (programModalMode === "edit" && res.data) {
        const updated = res.data as AcademicProgramDTO;
        setPrograms((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
      }
    } else if (res && !res.success) {
      setToastMessage({ type: "error", text: res.error });
      if (res.details) {
        setFieldErrors(res.details);
      }
    }
    setLoading(false);
  }

  async function handleDeleteProgramConfirm() {
    if (!deleteProgramTarget || !canManage) return;
    setLoading(true);
    setToastMessage(null);

    const res = await deleteProgramAction(deleteProgramTarget.id);
    if (res.success) {
      setToastMessage({
        type: "success",
        text: res.message ?? "Program keahlian berhasil dihapus.",
      });
      setPrograms((prev) => prev.filter((p) => p.id !== deleteProgramTarget.id));
      setDeleteProgramTarget(null);
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
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Program Keahlian & Jurusan</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              Daftar program keahlian / konsentrasi keahlian / peminatan akademik sekolah.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {canManage && (
              <button
                type="button"
                onClick={() => {
                  setSelectedProgram(null);
                  setFieldErrors({});
                  setProgramModalMode("create");
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Program</span>
              </button>
            )}
          </div>
        </div>

        {programs.length === 0 ? (
          <EmptyState
            title="Belum Ada Program Keahlian / Jurusan"
            description="Tambahkan program atau konsentrasi keahlian seperti RPL, TKJ, IPA, IPS, atau UMUM."
            action={
              canManage ? (
                <Button
                  variant="cobalt"
                  onClick={() => {
                    setSelectedProgram(null);
                    setFieldErrors({});
                    setProgramModalMode("create");
                  }}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Tambah Program Pertama
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-4">
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
                  placeholder="Cari program keahlian, kode, atau jenjang..."
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

            {filteredPrograms.length === 0 ? (
              <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-slate-200/60 space-y-2">
                <p className="text-sm font-bold text-slate-700">
                  Tidak ada program keahlian yang cocok
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="mt-2 text-xs"
                >
                  Reset Pencarian
                </Button>
              </div>
            ) : (
              <>
                {/* Mobile Cards View (< 640px) */}
                <div className="block sm:hidden space-y-3">
                  {paginatedPrograms.map((program) => (
                    <div
                      key={program.id}
                      className="p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 rounded-lg bg-blue-50 text-[#2563EB] flex-shrink-0 mt-0.5">
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 leading-snug">
                              {program.nama}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {program.deskripsi ?? "Tanpa deskripsi"}
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                          {program.kode}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-1.5">
                          {program.status_aktif ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                              <CheckCircle2 className="h-3 w-3" />
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400">
                              <XCircle className="h-3 w-3" />
                              Nonaktif
                            </span>
                          )}
                          {program.jenjang && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {program.jenjang}
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md text-[11px]">
                          {program.rombel_count ?? 0} Rombel
                        </span>
                      </div>

                      {canManage && (
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProgram(program);
                              setFieldErrors({});
                              setProgramModalMode("edit");
                            }}
                            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-100/90 hover:bg-blue-50 hover:text-[#2563EB] border border-slate-200/80 transition-all cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5 text-slate-500" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteProgramTarget(program)}
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
                        <th className="py-3.5 px-4 font-bold">Nama Program / Jurusan</th>
                        <th className="py-3.5 px-4 font-bold">Kode</th>
                        <th className="py-3.5 px-4 font-bold">Jenjang</th>
                        <th className="py-3.5 px-4 font-bold">Status</th>
                        <th className="py-3.5 px-4 text-center font-bold">Jumlah Rombel</th>
                        {canManage && <th className="py-3.5 px-4 text-right font-bold">Aksi</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white font-medium">
                      {paginatedPrograms.map((program) => (
                        <tr key={program.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 block">{program.nama}</span>
                            {program.deskripsi && (
                              <span className="text-xs text-slate-400 block mt-0.5">
                                {program.deskripsi}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-slate-700">
                            <Badge variant="neutral">{program.kode}</Badge>
                          </td>
                          <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">
                            {program.jenjang ?? "-"}
                          </td>
                          <td className="py-3.5 px-4">
                            {program.status_aktif ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="h-3 w-3" />
                                Aktif
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-500">
                                <XCircle className="h-3 w-3" />
                                Nonaktif
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                                program.rombel_count
                                  ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {program.rombel_count ?? 0} Rombel
                            </span>
                          </td>
                          {canManage && (
                            <td className="py-3.5 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedProgram(program);
                                    setFieldErrors({});
                                    setProgramModalMode("edit");
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100/90 hover:bg-blue-50 hover:text-[#2563EB] border border-slate-200/80 transition-all cursor-pointer shadow-xs"
                                >
                                  <Pencil className="h-3.5 w-3.5 text-slate-500" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteProgramTarget(program)}
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

            {/* Pagination Controls */}
            {filteredPrograms.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Menampilkan{" "}
                  <strong className="text-slate-800 font-bold">
                    {startIndex + 1} - {Math.min(startIndex + pageSize, filteredPrograms.length)}
                  </strong>{" "}
                  dari{" "}
                  <strong className="text-slate-800 font-bold">{filteredPrograms.length}</strong>{" "}
                  program
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
        )}
      </div>

      {/* MODAL CREATE / EDIT PROGRAM */}
      {isMounted &&
        programModalMode &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="prog-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
          >
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <h3 id="prog-modal-title" className="text-lg font-bold text-slate-900">
                    {programModalMode === "create"
                      ? "Tambah Program Keahlian"
                      : "Edit Program Keahlian"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setProgramModalMode(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Tutup modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleProgramSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="prog-nama"
                    className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                  >
                    Nama Program / Jurusan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="prog-nama"
                    name="nama"
                    type="text"
                    required
                    defaultValue={selectedProgram?.nama ?? ""}
                    placeholder="Contoh: Rekayasa Perangkat Lunak"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all"
                  />
                  {fieldErrors.nama && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.nama[0]}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="prog-kode"
                      className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                    >
                      Kode Program <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="prog-kode"
                      name="kode"
                      type="text"
                      required
                      defaultValue={selectedProgram?.kode ?? ""}
                      placeholder="Contoh: RPL"
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
                      htmlFor="prog-jenjang"
                      className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                    >
                      Jenjang (Opsional)
                    </label>
                    <select
                      id="prog-jenjang"
                      name="jenjang"
                      defaultValue={selectedProgram?.jenjang ?? "SMK"}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all cursor-pointer"
                    >
                      <option value="SMK">SMK — Kejuruan</option>
                      <option value="SMA">SMA — Peminatan</option>
                      <option value="SMP">SMP</option>
                      <option value="SD">SD</option>
                      <option value="UMUM">UMUM / Lainnya</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="prog-desc"
                    className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                  >
                    Deskripsi Program (Opsional)
                  </label>
                  <input
                    id="prog-desc"
                    name="deskripsi"
                    type="text"
                    defaultValue={selectedProgram?.deskripsi ?? ""}
                    placeholder="Contoh: Bidang Keahlian Teknologi Informasi"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="prog-status"
                    name="status_aktif"
                    value="true"
                    defaultChecked={selectedProgram ? selectedProgram.status_aktif : true}
                    className="h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-blue-500 cursor-pointer"
                  />
                  <label
                    htmlFor="prog-status"
                    className="text-xs sm:text-sm font-bold text-slate-800 cursor-pointer"
                  >
                    Program aktif menerima rombongan belajar
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setProgramModalMode(null)}
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
                    {loading ? "Menyimpan..." : "Simpan Program"}
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* CONFIRMATION DELETE PROGRAM */}
      {isMounted &&
        deleteProgramTarget &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="del-prog-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
          >
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-100 p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center font-bold text-lg">
                  <AlertTriangle className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <h3 id="del-prog-title" className="text-lg font-bold text-slate-900">
                    Hapus Program Keahlian
                  </h3>
                  <p className="text-xs text-slate-500">Tindakan permanen di database</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus program keahlian{" "}
                <strong className="text-slate-900 font-semibold">{deleteProgramTarget.nama}</strong>{" "}
                ({deleteProgramTarget.kode})?
              </p>

              <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-xs text-amber-900 font-medium leading-relaxed">
                Program yang masih digunakan oleh rombel tidak dapat dihapus. Silakan nonaktifkan
                bila tidak menerima siswa baru.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => setDeleteProgramTarget(null)}
                  disabled={loading}
                  className="cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteProgramConfirm}
                  disabled={loading}
                  className="cursor-pointer"
                >
                  {loading ? "Menghapus..." : "Ya, Hapus Program"}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
