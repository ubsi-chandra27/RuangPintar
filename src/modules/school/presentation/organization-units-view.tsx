"use client";

/**
 * Ruang Pintar — Organization Units Management Component (Academic Glass UI v1.2)
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
  Network,
  AlertTriangle,
} from "lucide-react";
import { OrganizationUnitDTO } from "../domain/school-types";
import {
  createOrganizationUnitAction,
  deleteOrganizationUnitAction,
  updateOrganizationUnitAction,
} from "@/app/actions/school-actions";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { Toast } from "@/shared/components/ui/toast";

interface OrganizationUnitsViewProps {
  initialUnits: OrganizationUnitDTO[];
  canManage: boolean;
}

const emptySubscribe = () => () => {};

export function OrganizationUnitsView({ initialUnits, canManage }: OrganizationUnitsViewProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [units, setUnits] = useState<OrganizationUnitDTO[]>(initialUnits);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<OrganizationUnitDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OrganizationUnitDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Toolbar & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<"ALL" | "PARENT" | "SUB">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Filtered data calculation
  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      // Search filter
      const matchesSearch =
        searchQuery.trim() === "" ||
        unit.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (unit.kode && unit.kode.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (unit.induk_unit_nama &&
          unit.induk_unit_nama.toLowerCase().includes(searchQuery.toLowerCase()));

      // Level filter
      let matchesLevel = true;
      if (levelFilter === "PARENT") {
        matchesLevel = !unit.induk_unit_id;
      } else if (levelFilter === "SUB") {
        matchesLevel = Boolean(unit.induk_unit_id);
      }

      return matchesSearch && matchesLevel;
    });
  }, [units, searchQuery, levelFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredUnits.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedUnits = filteredUnits.slice(startIndex, startIndex + pageSize);

  function openCreateModal() {
    setSelectedUnit(null);
    setFieldErrors({});
    setModalMode("create");
  }

  function openEditModal(unit: OrganizationUnitDTO) {
    setSelectedUnit(unit);
    setFieldErrors({});
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setSelectedUnit(null);
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
      res = await createOrganizationUnitAction(formData);
    } else if (modalMode === "edit" && selectedUnit) {
      res = await updateOrganizationUnitAction(selectedUnit.id, formData);
    }

    if (res?.success) {
      setToastMessage({ type: "success", text: res.message ?? "Operasi berhasil." });
      closeModal();
      if (modalMode === "create") {
        setUnits((prev) => [...prev, res.data as OrganizationUnitDTO]);
      } else if (modalMode === "edit") {
        const updated = res.data as OrganizationUnitDTO;
        setUnits((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
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

    const res = await deleteOrganizationUnitAction(deleteTarget.id);

    if (res.success) {
      setToastMessage({
        type: "success",
        text: res.message ?? "Unit organisasi berhasil dihapus.",
      });
      setUnits((prev) => prev.filter((u) => u.id !== deleteTarget.id));
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
        {/* Header Unit Organisasi */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100/80">
                <Network className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Unit & Bagian Organisasi</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              Kelola bagian struktural sekolah seperti Kurikulum, Kesiswaan, Tata Usaha, dan Program
              Keahlian.
            </p>
          </div>

          {canManage && (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Unit</span>
            </button>
          )}
        </div>

        {units.length === 0 ? (
          <EmptyState
            title="Belum Ada Unit Organisasi"
            description="Tambahkan unit atau bagian organisasi sekolah untuk menstrukturkan hierarki tata kelola."
            action={
              canManage ? (
                <Button variant="cobalt" onClick={openCreateModal}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Tambah Unit
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
                  placeholder="Cari nama unit, kode, atau induk..."
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

              {/* Filters & Rows-per-page */}
              <div className="flex items-center gap-2 self-end md:self-auto">
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-600 shadow-sm">
                  <Filter className="h-3.5 w-3.5 text-slate-400" />
                  <select
                    value={levelFilter}
                    onChange={(e) => {
                      setLevelFilter(e.target.value as "ALL" | "PARENT" | "SUB");
                      setCurrentPage(1);
                    }}
                    className="bg-transparent border-none text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">Semua Tingkat</option>
                    <option value="PARENT">Unit Utama Saja</option>
                    <option value="SUB">Sub-Unit Saja</option>
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
            {filteredUnits.length === 0 ? (
              <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-slate-200/60 space-y-2">
                <p className="text-sm font-bold text-slate-700">
                  Tidak ada unit yang sesuai dengan pencarian
                </p>
                <p className="text-xs text-slate-500">
                  Coba ubah kata kunci atau bersihkan filter tingkat unit.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setLevelFilter("ALL");
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
                  {paginatedUnits.map((unit) => (
                    <div
                      key={unit.id}
                      className="p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3"
                    >
                      {/* Card Header: Unit Name & Code */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 rounded-lg bg-blue-50 text-[#2563EB] flex-shrink-0 mt-0.5">
                            <Network className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 leading-snug">
                              {unit.nama}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {unit.induk_unit_nama ? (
                                <span>
                                  Induk:{" "}
                                  <strong className="text-blue-700 font-semibold">
                                    {unit.induk_unit_nama}
                                  </strong>
                                </span>
                              ) : (
                                <span className="italic text-slate-400">
                                  Unit Utama (Tingkat Teratas)
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        {unit.kode && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700 flex-shrink-0">
                            {unit.kode}
                          </span>
                        )}
                      </div>

                      {/* Card Stats (Sub-Unit & Jabatan) */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80">
                          <span className="text-slate-500 text-[11px]">Sub-Unit:</span>
                          <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md text-[11px] border border-indigo-100">
                            {unit.sub_unit_count ?? 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80">
                          <span className="text-slate-500 text-[11px]">Jabatan:</span>
                          <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md text-[11px] border border-blue-100">
                            {unit.jabatan_count ?? 0}
                          </span>
                        </div>
                      </div>

                      {/* Card Actions */}
                      {canManage && (
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => openEditModal(unit)}
                            title={`Edit ${unit.nama}`}
                            aria-label={`Edit ${unit.nama}`}
                            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-100/90 hover:bg-blue-50 hover:text-[#2563EB] border border-slate-200/80 transition-all cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5 text-slate-500" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(unit)}
                            title={`Hapus ${unit.nama}`}
                            aria-label={`Hapus ${unit.nama}`}
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
                        <th className="py-3.5 px-4 font-bold">Nama Unit</th>
                        <th className="py-3.5 px-4 font-bold">Kode</th>
                        <th className="py-3.5 px-4 font-bold">Induk Unit</th>
                        <th className="py-3.5 px-4 text-center font-bold">Sub-Unit</th>
                        <th className="py-3.5 px-4 text-center font-bold">Jabatan</th>
                        {canManage && <th className="py-3.5 px-4 text-right font-bold">Aksi</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white font-medium">
                      {paginatedUnits.map((unit) => (
                        <tr key={unit.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900">{unit.nama}</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                            {unit.kode ? (
                              <Badge variant="neutral">{unit.kode}</Badge>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {unit.induk_unit_nama ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                {unit.induk_unit_nama}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs italic">Unit Utama</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                                unit.sub_unit_count
                                  ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {unit.sub_unit_count ?? 0}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                                unit.jabatan_count
                                  ? "bg-blue-50 text-blue-700 border border-blue-100"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {unit.jabatan_count ?? 0}
                            </span>
                          </td>
                          {canManage && (
                            <td className="py-3.5 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openEditModal(unit)}
                                  title={`Edit ${unit.nama}`}
                                  aria-label={`Edit ${unit.nama}`}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100/90 hover:bg-blue-50 hover:text-[#2563EB] border border-slate-200/80 transition-all cursor-pointer shadow-xs"
                                >
                                  <Pencil className="h-3.5 w-3.5 text-slate-500" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteTarget(unit)}
                                  title={`Hapus ${unit.nama}`}
                                  aria-label={`Hapus ${unit.nama}`}
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
            {filteredUnits.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Menampilkan{" "}
                  <strong className="text-slate-800 font-bold">
                    {startIndex + 1} - {Math.min(startIndex + pageSize, filteredUnits.length)}
                  </strong>{" "}
                  dari <strong className="text-slate-800 font-bold">{filteredUnits.length}</strong>{" "}
                  unit
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
            aria-labelledby="unit-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
          >
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100">
                    <Network className="h-4 w-4" />
                  </div>
                  <h3 id="unit-modal-title" className="text-lg font-bold text-slate-900">
                    {modalMode === "create" ? "Tambah Unit Organisasi" : "Edit Unit Organisasi"}
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
                    htmlFor="unit-nama"
                    className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                  >
                    Nama Unit <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="unit-nama"
                    name="nama"
                    type="text"
                    required
                    defaultValue={selectedUnit?.nama ?? ""}
                    placeholder="Contoh: Bidang Kurikulum & Akademik"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all"
                  />
                  {fieldErrors.nama && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.nama[0]}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="unit-kode"
                    className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                  >
                    Kode Singkatan (Opsional)
                  </label>
                  <input
                    id="unit-kode"
                    name="kode"
                    type="text"
                    defaultValue={selectedUnit?.kode ?? ""}
                    placeholder="Contoh: KUR, KSW, TU"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm uppercase font-mono focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all"
                  />
                  {fieldErrors.kode && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.kode[0]}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="unit-induk"
                    className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                  >
                    Induk Unit (Hierarki)
                  </label>
                  <select
                    id="unit-induk"
                    name="induk_unit_id"
                    defaultValue={selectedUnit?.induk_unit_id ?? ""}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all cursor-pointer"
                  >
                    <option value="">-- Unit Utama (Tanpa Induk) --</option>
                    {units
                      .filter((u) => u.id !== selectedUnit?.id)
                      .map((parent) => (
                        <option key={parent.id} value={parent.id}>
                          {parent.nama} {parent.kode ? `(${parent.kode})` : ""}
                        </option>
                      ))}
                  </select>
                  {fieldErrors.induk_unit_id && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">
                      {fieldErrors.induk_unit_id[0]}
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
            aria-labelledby="delete-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
          >
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-100 p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center font-bold text-lg">
                  <AlertTriangle className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <h3 id="delete-modal-title" className="text-lg font-bold text-slate-900">
                    Konfirmasi Hapus Unit
                  </h3>
                  <p className="text-xs text-slate-500">Tindakan ini permanen di database</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus unit organisasi{" "}
                <strong className="text-slate-900 font-semibold">{deleteTarget.nama}</strong>?
              </p>

              <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-xs text-amber-900 font-medium leading-relaxed">
                Sistem menerapkan aturan <em>History-Preserving</em>: unit tidak dapat dihapus jika
                masih memiliki sub-unit atau dirujuk oleh jabatan struktural.
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
                  {loading ? "Menghapus..." : "Ya, Hapus Unit"}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
