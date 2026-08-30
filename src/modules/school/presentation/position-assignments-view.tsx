"use client";

/**
 * Ruang Pintar — Position Assignments Management Component (Academic Glass UI v1.2)
 */

import React, { useState, useMemo, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Search,
  CalendarOff,
  XCircle,
  ChevronLeft,
  ChevronRight,
  X,
  UserCheck,
  Calendar,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { PersonilOptionDTO, PositionAssignmentDTO, PositionDTO } from "../domain/school-types";
import {
  assignPositionAction,
  cancelPositionAssignmentAction,
  endPositionAssignmentAction,
} from "@/app/actions/school-actions";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { Toast } from "@/shared/components/ui/toast";

interface PositionAssignmentsViewProps {
  initialAssignments: PositionAssignmentDTO[];
  positions: PositionDTO[];
  personnel: PersonilOptionDTO[];
  canManage: boolean;
}

const emptySubscribe = () => () => {};

export function PositionAssignmentsView({
  initialAssignments,
  positions,
  personnel,
  canManage,
}: PositionAssignmentsViewProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [assignments, setAssignments] = useState<PositionAssignmentDTO[]>(initialAssignments);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "AKTIF" | "SELESAI">("ALL");
  const [modalMode, setModalMode] = useState<"assign" | "end" | "cancel" | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<PositionAssignmentDTO | null>(null);
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

  // Filtered assignments calculation
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      // Status filter
      if (filterStatus !== "ALL" && a.status !== filterStatus) return false;

      // Search filter
      if (searchQuery.trim() === "") return true;
      const q = searchQuery.toLowerCase();
      return (
        (a.personil_nama?.toLowerCase() ?? "").includes(q) ||
        (a.personil_username?.toLowerCase() ?? "").includes(q) ||
        (a.jabatan_nama?.toLowerCase() ?? "").includes(q) ||
        (a.jabatan_kode?.toLowerCase() ?? "").includes(q) ||
        (a.catatan?.toLowerCase() ?? "").includes(q)
      );
    });
  }, [assignments, filterStatus, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredAssignments.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedAssignments = filteredAssignments.slice(startIndex, startIndex + pageSize);

  function openAssignModal() {
    setSelectedAssignment(null);
    setFieldErrors({});
    setModalMode("assign");
  }

  function openEndModal(assignment: PositionAssignmentDTO) {
    setSelectedAssignment(assignment);
    setFieldErrors({});
    setModalMode("end");
  }

  function openCancelModal(assignment: PositionAssignmentDTO) {
    setSelectedAssignment(assignment);
    setFieldErrors({});
    setModalMode("cancel");
  }

  function closeModal() {
    setModalMode(null);
    setSelectedAssignment(null);
    setFieldErrors({});
  }

  async function handleAssignSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canManage) return;

    setLoading(true);
    setToastMessage(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const res = await assignPositionAction(formData);

    if (res.success && res.data) {
      setToastMessage({
        type: "success",
        text: res.message ?? "Penugasan personil berhasil dicatat.",
      });
      setAssignments((prev) => [res.data as PositionAssignmentDTO, ...prev]);
      closeModal();
    } else if (!res.success) {
      setToastMessage({ type: "error", text: res.error });
      if (res.details) {
        setFieldErrors(res.details);
      }
    }
    setLoading(false);
  }

  async function handleEndSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedAssignment || !canManage) return;

    setLoading(true);
    setToastMessage(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const res = await endPositionAssignmentAction(selectedAssignment.id, formData);

    if (res.success && res.data) {
      setToastMessage({
        type: "success",
        text: res.message ?? "Penugasan berhasil diakhiri.",
      });
      const updated = res.data as PositionAssignmentDTO;
      setAssignments((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
      closeModal();
    } else if (!res.success) {
      setToastMessage({ type: "error", text: res.error });
      if (res.details) {
        setFieldErrors(res.details);
      }
    }
    setLoading(false);
  }

  async function handleCancelSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedAssignment || !canManage) return;

    setLoading(true);
    setToastMessage(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const res = await cancelPositionAssignmentAction(selectedAssignment.id, formData);

    if (res.success && res.data) {
      setToastMessage({
        type: "success",
        text: res.message ?? "Penugasan berhasil dibatalkan.",
      });
      const updated = res.data as PositionAssignmentDTO;
      setAssignments((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
      closeModal();
    } else if (!res.success) {
      setToastMessage({ type: "error", text: res.error });
      if (res.details) {
        setFieldErrors(res.details);
      }
    }
    setLoading(false);
  }

  function getStatusBadgeVariant(status: string): "success" | "neutral" | "danger" {
    if (status === "AKTIF") return "success";
    if (status === "SELESAI") return "neutral";
    return "danger";
  }

  function formatDate(d: Date | string | null | undefined): string {
    if (!d) return "-";
    const date = new Date(d);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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
        {/* Header Penugasan */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100/80">
                <UserCheck className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Penugasan Jabatan Struktural</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              Alokasi personil sekolah ke jabatan struktural beserta riwayat masa berlaku efektif.
            </p>
          </div>

          {canManage && (
            <button
              type="button"
              onClick={openAssignModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Tugaskan Personil</span>
            </button>
          )}
        </div>

        {assignments.length === 0 ? (
          <EmptyState
            title="Belum Ada Rekam Penugasan Jabatan"
            description="Tugaskan personil tenaga kependidikan atau guru ke jabatan struktural yang tersedia."
            action={
              canManage ? (
                <Button variant="cobalt" onClick={openAssignModal}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Buat Penugasan Pertama
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
                  placeholder="Cari nama personil, jabatan, atau SK..."
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

              {/* Status Tabs Capsule & Rows per page */}
              <div className="flex items-center gap-2 self-end md:self-auto">
                <div className="flex items-center rounded-xl bg-white p-1 border border-slate-200 shadow-sm text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterStatus("ALL");
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      filterStatus === "ALL"
                        ? "bg-[#2563EB] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Semua ({assignments.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterStatus("AKTIF");
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      filterStatus === "AKTIF"
                        ? "bg-[#2563EB] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Aktif ({assignments.filter((a) => a.status === "AKTIF").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterStatus("SELESAI");
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      filterStatus === "SELESAI"
                        ? "bg-[#2563EB] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Selesai ({assignments.filter((a) => a.status === "SELESAI").length})
                  </button>
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
            {filteredAssignments.length === 0 ? (
              <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-slate-200/60 space-y-2">
                <p className="text-sm font-bold text-slate-700">
                  Tidak ada data penugasan yang sesuai dengan filter
                </p>
                <p className="text-xs text-slate-500">
                  Coba ubah kata kunci atau pilih tab status yang lain.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterStatus("ALL");
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
                  {paginatedAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3"
                    >
                      {/* Card Header: Personil & Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 rounded-lg bg-blue-50 text-[#2563EB] flex-shrink-0 mt-0.5">
                            <UserCheck className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 leading-snug">
                              {assignment.personil_nama}
                            </h4>
                            <p className="text-xs font-mono text-slate-500 mt-0.5">
                              @{assignment.personil_username}
                            </p>
                          </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(assignment.status)}>
                          {assignment.status}
                        </Badge>
                      </div>

                      {/* Jabatan & Masa Berlaku */}
                      <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80">
                          <span className="text-slate-500 text-[11px]">Jabatan:</span>
                          <div className="text-right">
                            <span className="font-bold text-slate-900 text-xs block">
                              {assignment.jabatan_nama}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              {assignment.jabatan_kode}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80">
                          <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Periode:</span>
                          </div>
                          <span className="font-semibold text-slate-800 text-[11px]">
                            {formatDate(assignment.berlaku_mulai)} s.d.{" "}
                            {formatDate(assignment.berlaku_sampai)}
                          </span>
                        </div>

                        {assignment.catatan && (
                          <div className="flex items-start gap-1.5 p-2 rounded-xl bg-slate-50/80 text-[11px] text-slate-600">
                            <FileText className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                            <span>{assignment.catatan}</span>
                          </div>
                        )}
                      </div>

                      {/* Card Actions */}
                      {canManage && (
                        <div className="pt-2 border-t border-slate-100">
                          {assignment.status === "AKTIF" ? (
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => openEndModal(assignment)}
                                title={`Akhiri penugasan ${assignment.personil_nama}`}
                                aria-label={`Akhiri penugasan ${assignment.personil_nama}`}
                                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 transition-all cursor-pointer"
                              >
                                <CalendarOff className="h-3.5 w-3.5 text-amber-600" />
                                <span>Akhiri</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => openCancelModal(assignment)}
                                title={`Batalkan penugasan ${assignment.personil_nama}`}
                                aria-label={`Batalkan penugasan ${assignment.personil_nama}`}
                                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 border border-rose-200/80 transition-all cursor-pointer"
                              >
                                <XCircle className="h-3.5 w-3.5 text-rose-500" />
                                <span>Batalkan</span>
                              </button>
                            </div>
                          ) : (
                            <p className="text-center text-xs text-slate-400 italic py-1">
                              Arsip Historis (Purna Tugas)
                            </p>
                          )}
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
                        <th className="py-3.5 px-4 font-bold">Nama Personil</th>
                        <th className="py-3.5 px-4 font-bold">Jabatan Struktural</th>
                        <th className="py-3.5 px-4 font-bold">Periode Masa Berlaku</th>
                        <th className="py-3.5 px-4 font-bold">Status</th>
                        <th className="py-3.5 px-4 font-bold">Catatan</th>
                        {canManage && <th className="py-3.5 px-4 text-right font-bold">Aksi</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white font-medium">
                      {paginatedAssignments.map((assignment) => (
                        <tr key={assignment.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">
                              {assignment.personil_nama}
                            </div>
                            <div className="text-xs font-mono text-slate-500">
                              @{assignment.personil_username}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">
                              {assignment.jabatan_nama}
                            </div>
                            <div className="text-xs font-mono text-slate-500">
                              {assignment.jabatan_kode}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-600">
                            <div>
                              Mulai:{" "}
                              <span className="font-semibold text-slate-800">
                                {formatDate(assignment.berlaku_mulai)}
                              </span>
                            </div>
                            <div>
                              Sampai:{" "}
                              <span className="font-semibold text-slate-800">
                                {formatDate(assignment.berlaku_sampai)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge variant={getStatusBadgeVariant(assignment.status)}>
                              {assignment.status}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">
                            {assignment.catatan ?? "-"}
                          </td>
                          {canManage && (
                            <td className="py-3.5 px-4 text-right">
                              {assignment.status === "AKTIF" ? (
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => openEndModal(assignment)}
                                    title={`Akhiri penugasan ${assignment.personil_nama}`}
                                    aria-label={`Akhiri penugasan ${assignment.personil_nama}`}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 transition-all cursor-pointer shadow-xs"
                                  >
                                    <CalendarOff className="h-3.5 w-3.5 text-amber-600" />
                                    <span>Akhiri</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openCancelModal(assignment)}
                                    title={`Batalkan penugasan ${assignment.personil_nama}`}
                                    aria-label={`Batalkan penugasan ${assignment.personil_nama}`}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50/90 hover:bg-rose-100 hover:text-rose-700 border border-rose-200/80 transition-all cursor-pointer shadow-xs"
                                  >
                                    <XCircle className="h-3.5 w-3.5 text-rose-500" />
                                    <span>Batalkan</span>
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400 italic">
                                  Arsip Historis
                                </span>
                              )}
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
            {filteredAssignments.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Menampilkan{" "}
                  <strong className="text-slate-800 font-bold">
                    {startIndex + 1} - {Math.min(startIndex + pageSize, filteredAssignments.length)}
                  </strong>{" "}
                  dari{" "}
                  <strong className="text-slate-800 font-bold">{filteredAssignments.length}</strong>{" "}
                  penugasan
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

      {/* MODAL ASSIGN POSITION */}
      {isMounted &&
        modalMode === "assign" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="assign-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
          >
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <h3 id="assign-modal-title" className="text-lg font-bold text-slate-900">
                    Tugaskan Personil ke Jabatan
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

              <form onSubmit={handleAssignSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="assign-personil"
                    className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                  >
                    Pilih Personil (Staf / Guru) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="assign-personil"
                    name="personil_id"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all cursor-pointer"
                  >
                    <option value="">-- Pilih Akun Personil --</option>
                    {personnel.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nama_lengkap} (@{p.username} — {p.peran_dasar})
                      </option>
                    ))}
                  </select>
                  {fieldErrors.personil_id && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">
                      {fieldErrors.personil_id[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="assign-jabatan"
                    className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                  >
                    Jabatan Struktural <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="assign-jabatan"
                    name="jabatan_id"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all cursor-pointer"
                  >
                    <option value="">-- Pilih Jabatan --</option>
                    {positions.map((pos) => (
                      <option key={pos.id} value={pos.id}>
                        {pos.nama_jabatan} ({pos.kode_jabatan})
                      </option>
                    ))}
                  </select>
                  {fieldErrors.jabatan_id && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">
                      {fieldErrors.jabatan_id[0]}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="assign-mulai"
                      className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                    >
                      Berlaku Mulai <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="assign-mulai"
                      name="berlaku_mulai"
                      type="date"
                      required
                      defaultValue={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all"
                    />
                    {fieldErrors.berlaku_mulai && (
                      <p className="text-xs text-rose-600 mt-1 font-medium">
                        {fieldErrors.berlaku_mulai[0]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="assign-sampai"
                      className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                    >
                      Berlaku Sampai (Opsional)
                    </label>
                    <input
                      id="assign-sampai"
                      name="berlaku_sampai"
                      type="date"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all"
                    />
                    {fieldErrors.berlaku_sampai && (
                      <p className="text-xs text-rose-600 mt-1 font-medium">
                        {fieldErrors.berlaku_sampai[0]}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="assign-catatan"
                    className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                  >
                    Catatan / Nomor SK Penugasan (Opsional)
                  </label>
                  <textarea
                    id="assign-catatan"
                    name="catatan"
                    rows={2}
                    placeholder="Contoh: SK Pengangkatan No. 421/08/SK/2026"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all"
                  />
                  {fieldErrors.catatan && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">
                      {fieldErrors.catatan[0]}
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
                    {loading ? "Menyimpan..." : "Simpan Penugasan"}
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL END ASSIGNMENT */}
      {isMounted &&
        modalMode === "end" &&
        selectedAssignment &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="end-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
          >
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-3 text-amber-600">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center font-bold text-lg">
                  <CalendarOff className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 id="end-modal-title" className="text-lg font-bold text-slate-900">
                    Akhiri Masa Penugasan
                  </h3>
                  <p className="text-xs text-slate-500">Status akan diperbarui menjadi SELESAI</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Akhiri penugasan jabatan{" "}
                <strong className="text-slate-900 font-semibold">
                  {selectedAssignment.jabatan_nama}
                </strong>{" "}
                untuk personil{" "}
                <strong className="text-slate-900 font-semibold">
                  {selectedAssignment.personil_nama}
                </strong>
                .
              </p>

              <form onSubmit={handleEndSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="end-sampai"
                    className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                  >
                    Tanggal Selesai Penugasan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="end-sampai"
                    name="berlaku_sampai"
                    type="date"
                    required
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all"
                  />
                </div>

                <div>
                  <label
                    htmlFor="end-catatan"
                    className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                  >
                    Catatan Penutupan (Opsional)
                  </label>
                  <textarea
                    id="end-catatan"
                    name="catatan"
                    rows={2}
                    defaultValue={selectedAssignment.catatan ?? ""}
                    placeholder="Catatan purna tugas atau serah terima..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
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
                    {loading ? "Memproses..." : "Konfirmasi Selesai"}
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL CANCEL ASSIGNMENT */}
      {isMounted &&
        modalMode === "cancel" &&
        selectedAssignment &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
          >
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-100 p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center font-bold text-lg">
                  <AlertTriangle className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <h3 id="cancel-modal-title" className="text-lg font-bold text-slate-900">
                    Batalkan Penugasan Jabatan
                  </h3>
                  <p className="text-xs text-slate-500">Status akan diubah menjadi DIBATALKAN</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Batalkan penugasan jabatan{" "}
                <strong className="text-slate-900 font-semibold">
                  {selectedAssignment.jabatan_nama}
                </strong>{" "}
                untuk personil{" "}
                <strong className="text-slate-900 font-semibold">
                  {selectedAssignment.personil_nama}
                </strong>
                .
              </p>

              <form onSubmit={handleCancelSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="cancel-catatan"
                    className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                  >
                    Alasan Pembatalan <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="cancel-catatan"
                    name="catatan"
                    required
                    rows={2}
                    placeholder="Sebutkan alasan resmi pembatalan penugasan ini..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all"
                  />
                  {fieldErrors.catatan && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">
                      {fieldErrors.catatan[0]}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                    disabled={loading}
                    className="cursor-pointer"
                  >
                    Kembali
                  </Button>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={loading}
                    className="cursor-pointer"
                  >
                    {loading ? "Membatalkan..." : "Ya, Batalkan Penugasan"}
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
