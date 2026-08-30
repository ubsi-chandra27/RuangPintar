"use client";

/**
 * Ruang Pintar — Master Positions Management Component (Academic Glass UI v1.2)
 */

import React, { useState, useMemo, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Award,
  AlertTriangle,
} from "lucide-react";
import { OrganizationUnitDTO, PositionDTO } from "../domain/school-types";
import {
  createPositionAction,
  deletePositionAction,
  updatePositionAction,
} from "@/app/actions/school-actions";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { Toast } from "@/shared/components/ui/toast";

interface PositionsViewProps {
  initialPositions: PositionDTO[];
  units: OrganizationUnitDTO[];
  canManage: boolean;
}

const emptySubscribe = () => () => {};

export function PositionsView({ initialPositions, units, canManage }: PositionsViewProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [positions, setPositions] = useState<PositionDTO[]>(initialPositions);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<PositionDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PositionDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Toolbar & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [unitFilter, setUnitFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Filtered positions calculation
  const filteredPositions = useMemo(() => {
    return positions.filter((pos) => {
      // Search filter
      const matchesSearch =
        searchQuery.trim() === "" ||
        pos.nama_jabatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pos.kode_jabatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pos.unit_nama && pos.unit_nama.toLowerCase().includes(searchQuery.toLowerCase()));

      // Unit filter
      const matchesUnit = unitFilter === "ALL" || pos.unit_id === unitFilter;

      return matchesSearch && matchesUnit;
    });
  }, [positions, searchQuery, unitFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredPositions.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedPositions = filteredPositions.slice(startIndex, startIndex + pageSize);

  function openCreateModal() {
    setSelectedPosition(null);
    setFieldErrors({});
    setModalMode("create");
  }

  function openEditModal(pos: PositionDTO) {
    setSelectedPosition(pos);
    setFieldErrors({});
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setSelectedPosition(null);
    setFieldErrors({});
  }

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canManage) return;

    setLoading(true);
    setToastMessage(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    let res;

    if (modalMode === "create") {
      res = await createPositionAction(formData);
    } else if (modalMode === "edit" && selectedPosition) {
      res = await updatePositionAction(selectedPosition.id, formData);
    }

    if (res?.success) {
      setToastMessage({ type: "success", text: res.message ?? "Operasi berhasil." });
      closeModal();
      if (modalMode === "create") {
        setPositions((prev) => [...prev, res.data as PositionDTO]);
      } else if (modalMode === "edit") {
        const updated = res.data as PositionDTO;
        setPositions((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
      }
    } else if (res && !res.success) {
      setToastMessage({ type: "error", text: res.error });
      if (res.details) {
        setFieldErrors(res.details);
      }
    }
    setLoading(false);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget || !canManage) return;

    setLoading(true);
    setToastMessage(null);

    const res = await deletePositionAction(deleteTarget.id);

    if (res.success) {
      setToastMessage({
        type: "success",
        text: res.message ?? "Jabatan struktural berhasil dihapus.",
      });
      setPositions((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
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
        {/* Header Master Jabatan */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100/80">
                <Award className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Master Jabatan Struktural</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              Katalog posisi jabatan organisasi sekolah (Kepala Sekolah, Wakasek, Kepala Program,
              Koordinator, dsb).
            </p>
          </div>

          {canManage && (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Jabatan</span>
            </button>
          )}
        </div>

        {positions.length === 0 ? (
          <EmptyState
            title="Belum Ada Jabatan Struktural"
            description="Daftarkan master jabatan struktural sekolah untuk mengalokasikan penugasan personil."
            action={
              canManage ? (
                <Button variant="cobalt" onClick={openCreateModal}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Tambah Jabatan Pertama
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-4">
            {/* Table Toolbar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/60">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari nama jabatan, kode, atau unit..."
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

              {/* Unit Filter & Rows-per-page */}
              <div className="flex items-center gap-2 self-end md:self-auto">
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-600 shadow-sm">
                  <Filter className="h-3.5 w-3.5 text-slate-400" />
                  <select
                    value={unitFilter}
                    onChange={(e) => {
                      setUnitFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent border-none text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer max-w-[150px] truncate"
                  >
                    <option value="ALL">Semua Unit</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-600 shadow-sm">
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
            </div>

            {/* Table or Empty Filtered Result */}
            {filteredPositions.length === 0 ? (
              <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-slate-200/60 space-y-2">
                <p className="text-sm font-bold text-slate-700">
                  Tidak ada jabatan yang sesuai dengan pencarian
                </p>
                <p className="text-xs text-slate-500">
                  Coba ubah kata kunci atau bersihkan filter unit organisasi.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setUnitFilter("ALL");
                  }}
                  className="mt-2 text-xs"
                >
                  Reset Filter
                </Button>
              </div>
            ) : (
              <>
                {/* 1. Mobile Cards View (Phones < 640px) */}
                <div className="block sm:hidden space-y-3">
                  {paginatedPositions.map((pos) => (
                    <div
                      key={pos.id}
                      className="p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3"
                    >
                      {/* Card Header: Position Name & Code */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 rounded-lg bg-blue-50 text-[#2563EB] flex-shrink-0 mt-0.5">
                            <Award className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 leading-snug">
                              {pos.nama_jabatan}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-1">
                              {pos.is_canonical && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                                  Kanonikal Inti
                                </span>
                              )}
                              <span className="text-[11px] text-slate-500">
                                {pos.unit_nama ? (
                                  <span>
                                    Unit:{" "}
                                    <strong className="text-slate-800 font-semibold">
                                      {pos.unit_nama}
                                    </strong>
                                  </span>
                                ) : (
                                  <span className="italic text-slate-400">
                                    Lintas Unit / Sekolah
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700 flex-shrink-0">
                          {pos.kode_jabatan}
                        </span>
                      </div>

                      {/* Card Details (Scope & Personil) */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80">
                          <span className="text-slate-500 text-[11px]">Akses Scope:</span>
                          <span className="font-mono font-bold text-slate-800 text-[10px]">
                            {pos.tingkat_akses ?? "SCHOOL_WIDE"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80">
                          <span className="text-slate-500 text-[11px]">Personil Aktif:</span>
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px] border border-emerald-100">
                            {pos.penugasan_count ?? 0} Personil
                          </span>
                        </div>
                      </div>

                      {/* Card Actions */}
                      {canManage && (
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => openEditModal(pos)}
                            title={`Edit ${pos.nama_jabatan}`}
                            aria-label={`Edit ${pos.nama_jabatan}`}
                            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-100/90 hover:bg-blue-50 hover:text-[#2563EB] border border-slate-200/80 transition-all cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5 text-slate-500" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(pos)}
                            title={`Hapus ${pos.nama_jabatan}`}
                            aria-label={`Hapus ${pos.nama_jabatan}`}
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

                {/* 2. Desktop Table View (Tablets & Desktops >= 640px) */}
                <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
                  <table className="w-full text-left text-sm text-slate-700">
                    <thead className="bg-slate-50/90 text-[11px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200/80">
                      <tr>
                        <th className="py-3.5 px-4 font-bold">Nama Jabatan</th>
                        <th className="py-3.5 px-4 font-bold">Kode Jabatan</th>
                        <th className="py-3.5 px-4 font-bold">Unit Terkait</th>
                        <th className="py-3.5 px-4 font-bold">Tingkat Akses Scope</th>
                        <th className="py-3.5 px-4 text-center font-bold">Rekam Penugasan</th>
                        {canManage && <th className="py-3.5 px-4 text-right font-bold">Aksi</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white font-medium">
                      {paginatedPositions.map((pos) => (
                        <tr key={pos.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{pos.nama_jabatan}</div>
                            {pos.is_canonical && (
                              <span className="text-[11px] text-blue-600 font-semibold">
                                Kanonikal Inti
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-slate-700">
                            <Badge variant={pos.is_canonical ? "cobalt" : "neutral"}>
                              {pos.kode_jabatan}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {pos.unit_nama ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                {pos.unit_nama}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs italic">
                                Lintas Unit / Sekolah
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-xs font-mono">
                            <Badge variant="info">{pos.tingkat_akses ?? "SCHOOL_WIDE"}</Badge>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold ${
                                pos.penugasan_count
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {pos.penugasan_count ?? 0} Personil
                            </span>
                          </td>
                          {canManage && (
                            <td className="py-3.5 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openEditModal(pos)}
                                  title={`Edit ${pos.nama_jabatan}`}
                                  aria-label={`Edit ${pos.nama_jabatan}`}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100/90 hover:bg-blue-50 hover:text-[#2563EB] border border-slate-200/80 transition-all cursor-pointer shadow-xs"
                                >
                                  <Pencil className="h-3.5 w-3.5 text-slate-500" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteTarget(pos)}
                                  title={`Hapus ${pos.nama_jabatan}`}
                                  aria-label={`Hapus ${pos.nama_jabatan}`}
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
            {filteredPositions.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Menampilkan{" "}
                  <strong className="text-slate-800 font-bold">
                    {startIndex + 1} - {Math.min(startIndex + pageSize, filteredPositions.length)}
                  </strong>{" "}
                  dari{" "}
                  <strong className="text-slate-800 font-bold">{filteredPositions.length}</strong>{" "}
                  jabatan
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

      {/* MODAL CREATE / EDIT */}
      {isMounted &&
        modalMode &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="position-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
          >
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100">
                    <Award className="h-4 w-4" />
                  </div>
                  <h3 id="position-modal-title" className="text-lg font-bold text-slate-900">
                    {modalMode === "create"
                      ? "Tambah Jabatan Struktural"
                      : "Edit Jabatan Struktural"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Tutup modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="pos-nama"
                    className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                  >
                    Nama Jabatan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="pos-nama"
                    name="nama_jabatan"
                    type="text"
                    required
                    defaultValue={selectedPosition?.nama_jabatan ?? ""}
                    placeholder="Contoh: Wakil Kepala Sekolah Bidang Sarpras"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all"
                  />
                  {fieldErrors.nama_jabatan && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">
                      {fieldErrors.nama_jabatan[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="pos-kode"
                    className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                  >
                    Kode Jabatan (Identifier Unik) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="pos-kode"
                    name="kode_jabatan"
                    type="text"
                    required
                    disabled={modalMode === "edit"}
                    defaultValue={selectedPosition?.kode_jabatan ?? ""}
                    placeholder="Contoh: WAKASEK_SARPRAS, KAPROGLI_RPL"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm font-mono uppercase focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all disabled:bg-slate-100 disabled:opacity-70"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Format uppercase snake_case unik per sekolah. Kode tidak dapat diubah setelah
                    dibuat demi stabilitas otorisasi.
                  </p>
                  {fieldErrors.kode_jabatan && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">
                      {fieldErrors.kode_jabatan[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="pos-unit"
                    className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                  >
                    Unit Organisasi Terkait
                  </label>
                  <select
                    id="pos-unit"
                    name="unit_id"
                    defaultValue={selectedPosition?.unit_id ?? ""}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all cursor-pointer"
                  >
                    <option value="">-- Lintas Unit / Sekolah --</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nama} {u.kode ? `(${u.kode})` : ""}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.unit_id && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">
                      {fieldErrors.unit_id[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="pos-tingkat"
                    className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                  >
                    Tingkat Akses Scope
                  </label>
                  <select
                    id="pos-tingkat"
                    name="tingkat_akses"
                    defaultValue={selectedPosition?.tingkat_akses ?? "SCHOOL_WIDE"}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all cursor-pointer"
                  >
                    <option value="SCHOOL_WIDE">SCHOOL_WIDE — Seluruh Lingkup Sekolah</option>
                    <option value="UNIT_WIDE">UNIT_WIDE — Terbatas pada Unit Organisasi</option>
                    <option value="PROGRAM_WIDE">
                      PROGRAM_WIDE — Terbatas pada Program Keahlian
                    </option>
                  </select>
                  {fieldErrors.tingkat_akses && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">
                      {fieldErrors.tingkat_akses[0]}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
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
                    {loading ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* DESTRUCTIVE CONFIRMATION MODAL */}
      {isMounted &&
        deleteTarget &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-pos-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
          >
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-100 p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center font-bold text-lg">
                  <AlertTriangle className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <h3 id="delete-pos-modal-title" className="text-lg font-bold text-slate-900">
                    Konfirmasi Hapus Jabatan
                  </h3>
                  <p className="text-xs text-slate-500">Tindakan ini permanen di database</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus master jabatan{" "}
                <strong className="text-slate-900 font-semibold">
                  {deleteTarget.nama_jabatan}
                </strong>{" "}
                ({deleteTarget.kode_jabatan})?
              </p>

              <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-xs text-amber-900 font-medium leading-relaxed">
                Sistem menerapkan aturan <em>History-Preserving</em>: jabatan tidak dapat dihapus
                jika pernah memiliki rekam penugasan personil (aktif maupun historis).
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => setDeleteTarget(null)}
                  disabled={loading}
                  className="cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  disabled={loading}
                  className="cursor-pointer"
                >
                  {loading ? "Menghapus..." : "Ya, Hapus Jabatan"}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
