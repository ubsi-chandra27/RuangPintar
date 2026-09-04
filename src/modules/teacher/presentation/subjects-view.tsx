"use client";

/**
 * Ruang Pintar — M08 Subjects Management View (Academic Glass UI v1.2)
 *
 * Mendukung:
 * - Checkbox multi-select (checked, unchecked, indeterminate, select all, reset selection)
 * - Bulk action: Arsipkan, Nonaktifkan, Hapus Permanen, Batal Pilih
 * - Filter status: Aktif (default), Nonaktif, Arsip, Semua
 * - Domain-safe deletion: jika mapel memiliki histori akademik, hard-delete ditolak dan diarahkan ke Arsip
 */

import React, { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  Download,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  ChevronDown,
  Check,
  RotateCcw,
  Archive,
  ShieldAlert,
} from "lucide-react";
import { createPortal } from "react-dom";
import {
  archiveSubjectAction,
  bulkDeleteSubjectsAction,
  bulkSubjectLifecycleAction,
  createSubjectAction,
  deactivateSubjectAction,
  deleteSubjectAction,
  restoreSubjectAction,
  updateSubjectAction,
} from "@/app/actions/teacher-actions";
import { SubjectDTO } from "../domain/teacher-types";
import { Toast, ToastType } from "@/shared/components/ui/toast";

interface SubjectsViewProps {
  initialSubjects: SubjectDTO[];
  canManage: boolean;
}

export function SubjectsView({ initialSubjects, canManage }: SubjectsViewProps) {
  const router = useRouter();
  const subjects = initialSubjects;

  const [searchQuery, setSearchQuery] = useState("");
  const [kelompokFilter, setKelompokFilter] = useState("ALL");
  // Filter status: AKTIF (default), NONAKTIF, ARSIP, ALL
  const [statusFilter, setStatusFilter] = useState<string>("AKTIF");
  const [sortBy, setSortBy] = useState("kode_asc");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Checkbox multi-select state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement>(null);

  // Popover toggle states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectDTO | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<SubjectDTO | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filter subjects by search, group, and lifecycle status
  const filteredSubjects = subjects.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = s.kode.toLowerCase().includes(q) || s.nama.toLowerCase().includes(q);

    const matchesKelompok = kelompokFilter === "ALL" || s.kelompok === kelompokFilter;

    const currentLifecycle = s.status_lifecycle || (s.status_aktif ? "AKTIF" : "NONAKTIF");

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "AKTIF" && currentLifecycle === "AKTIF") ||
      (statusFilter === "NONAKTIF" && currentLifecycle === "NONAKTIF") ||
      (statusFilter === "ARSIP" && currentLifecycle === "ARSIP");

    return matchesSearch && matchesKelompok && matchesStatus;
  });

  // Sort subjects
  const sortedSubjects = [...filteredSubjects].sort((a, b) => {
    switch (sortBy) {
      case "kode_asc":
        return a.kode.localeCompare(b.kode, "id");
      case "kode_desc":
        return b.kode.localeCompare(a.kode, "id");
      case "name_asc":
        return a.nama.localeCompare(b.nama, "id");
      case "name_desc":
        return b.nama.localeCompare(a.nama, "id");
      default:
        return a.kode.localeCompare(b.kode, "id");
    }
  });

  const totalPages = Math.ceil(sortedSubjects.length / rowsPerPage) || 1;
  const paginatedSubjects = sortedSubjects.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Indeterminate logic for Select All checkbox
  const isAllSelected =
    paginatedSubjects.length > 0 && paginatedSubjects.every((s) => selectedIds.has(s.id));
  const isIndeterminate = paginatedSubjects.some((s) => selectedIds.has(s.id)) && !isAllSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedSubjects.forEach((s) => next.delete(s.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedSubjects.forEach((s) => next.add(s.id));
        return next;
      });
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleExportCSV = () => {
    if (sortedSubjects.length === 0) {
      setToast({ message: "Tidak ada data mata pelajaran untuk diekspor.", type: "error" });
      return;
    }

    const headers = [
      "No",
      "Kode Mapel",
      "Nama Mata Pelajaran",
      "Kelompok",
      "Guru Pengajar",
      "Rombel Aktif",
      "Status Lifecycle",
      "Status",
      "Deskripsi",
    ];
    const escapeCsv = (val: unknown) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = sortedSubjects.map((s, idx) => [
      idx + 1,
      escapeCsv(s.kode),
      escapeCsv(s.nama),
      escapeCsv(s.kelompok || "UMUM"),
      escapeCsv(s.total_guru_pengajar || 0),
      escapeCsv(s.total_rombel_aktif || 0),
      escapeCsv(s.status_lifecycle || (s.status_aktif ? "AKTIF" : "NONAKTIF")),
      escapeCsv(s.status_aktif ? "Aktif" : "Nonaktif"),
      escapeCsv(s.deskripsi || "-"),
    ]);

    const delimiter = ";";
    const csvContent =
      "\uFEFF" + [headers.join(delimiter), ...rows.map((r) => r.join(delimiter))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `mata_pelajaran_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToast({
      message: `Berhasil mengekspor ${sortedSubjects.length} mata pelajaran ke CSV.`,
      type: "success",
    });
  };

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createSubjectAction(null, formData);
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        setIsCreateOpen(false);
        router.refresh();
      } else {
        setToast({ message: res.message, type: "error" });
      }
    });
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateSubjectAction(null, formData);
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        setEditingSubject(null);
        router.refresh();
      } else {
        setToast({ message: res.message, type: "error" });
      }
    });
  };

  const handleDeleteSubmit = () => {
    if (!deletingSubject) return;
    startTransition(async () => {
      const res = await deleteSubjectAction(deletingSubject.id);
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        setDeletingSubject(null);
        router.refresh();
      } else {
        setToast({ message: res.message, type: "error" });
      }
    });
  };

  const handleArchiveSubmit = (id?: string) => {
    const targetId = id || deletingSubject?.id;
    if (!targetId) return;
    startTransition(async () => {
      const res = await archiveSubjectAction(targetId);
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        setDeletingSubject(null);
        router.refresh();
      } else {
        setToast({ message: res.message, type: "error" });
      }
    });
  };

  const handleRestoreSubmit = (id: string) => {
    startTransition(async () => {
      const res = await restoreSubjectAction(id);
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        router.refresh();
      } else {
        setToast({ message: res.message, type: "error" });
      }
    });
  };

  const handleDeactivateSubmit = () => {
    if (!deletingSubject) return;
    startTransition(async () => {
      const res = await deactivateSubjectAction(deletingSubject.id);
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        setDeletingSubject(null);
        router.refresh();
      } else {
        setToast({ message: res.message, type: "error" });
      }
    });
  };

  // Bulk Actions
  const handleBulkArchive = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    startTransition(async () => {
      const res = await bulkSubjectLifecycleAction(ids, "ARSIP");
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        handleClearSelection();
        router.refresh();
      } else {
        setToast({ message: res.message, type: "error" });
      }
    });
  };

  const handleBulkDeactivate = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    startTransition(async () => {
      const res = await bulkSubjectLifecycleAction(ids, "NONAKTIF");
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        handleClearSelection();
        router.refresh();
      } else {
        setToast({ message: res.message, type: "error" });
      }
    });
  };

  const handleBulkDeleteSubmit = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    startTransition(async () => {
      const res = await bulkDeleteSubjectsAction(ids);
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        handleClearSelection();
        setIsBulkDeleteOpen(false);
        router.refresh();
      } else {
        setToast({ message: res.message, type: "error" });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}

      {/* Table Toolbar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search mata pelajaran, kode..."
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all shadow-2xs"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none hidden sm:block" />
            )}
          </div>

          {/* Action Toolbar Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0">
            {/* Filter Dropdown Button */}
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => {
                  setIsFilterOpen(!isFilterOpen);
                  setIsSortOpen(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border font-semibold text-xs sm:text-sm shadow-2xs transition-colors cursor-pointer shrink-0 ${
                  kelompokFilter !== "ALL" || statusFilter !== "AKTIF"
                    ? "border-blue-300 bg-blue-50/70 text-[#2563EB]"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                }`}
              >
                <Filter
                  className={`h-4 w-4 ${
                    kelompokFilter !== "ALL" || statusFilter !== "AKTIF"
                      ? "text-[#2563EB]"
                      : "text-slate-600"
                  }`}
                />
                <span>Filter</span>
                {(kelompokFilter !== "ALL" || statusFilter !== "AKTIF") && (
                  <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                )}
              </button>

              {/* Filter Popover Menu */}
              {isFilterOpen && (
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 p-4 rounded-2xl bg-white border border-slate-200 shadow-xl z-30 space-y-3 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Filter className="h-3.5 w-3.5 text-[#2563EB]" />
                      Filter Mata Pelajaran
                    </span>
                    {(kelompokFilter !== "ALL" || statusFilter !== "AKTIF") && (
                      <button
                        type="button"
                        onClick={() => {
                          setKelompokFilter("ALL");
                          setStatusFilter("AKTIF");
                          setCurrentPage(1);
                        }}
                        className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Reset
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Kelompok Mapel
                    </label>
                    <select
                      value={kelompokFilter}
                      onChange={(e) => {
                        setKelompokFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                    >
                      <option value="ALL">Semua Kelompok</option>
                      <option value="UMUM">Mata Pelajaran Umum</option>
                      <option value="KEJURUAN">Kejuruan / Produktif</option>
                      <option value="PILIHAN">Pilihan</option>
                      <option value="MUATAN_LOKAL">Muatan Lokal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Status Keaktifan
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                    >
                      <option value="AKTIF">Aktif Digunakan (Default)</option>
                      <option value="NONAKTIF">Nonaktif</option>
                      <option value="ARSIP">Arsip</option>
                      <option value="ALL">Semua Status</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Sort Dropdown Button */}
            <div className="relative" ref={sortRef}>
              <button
                type="button"
                onClick={() => {
                  setIsSortOpen(!isSortOpen);
                  setIsFilterOpen(false);
                }}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-2xs transition-colors cursor-pointer shrink-0"
              >
                <ArrowUpDown className="h-4 w-4 text-slate-600" />
                <span>Sort</span>
              </button>

              {/* Sort Popover Menu */}
              {isSortOpen && (
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-56 p-2 rounded-2xl bg-white border border-slate-200 shadow-xl z-30 space-y-1 animate-in fade-in zoom-in-95">
                  {[
                    { id: "kode_asc", label: "Kode (A - Z)" },
                    { id: "kode_desc", label: "Kode (Z - A)" },
                    { id: "name_asc", label: "Nama Mapel (A - Z)" },
                    { id: "name_desc", label: "Nama Mapel (Z - A)" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSortBy(opt.id);
                        setIsSortOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                        sortBy === opt.id
                          ? "bg-blue-50 text-[#2563EB] font-bold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {sortBy === opt.id && <Check className="h-3.5 w-3.5 text-[#2563EB]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Export Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-2xs transition-colors cursor-pointer shrink-0"
              title="Ekspor daftar mata pelajaran ke file CSV"
            >
              <Download className="h-4 w-4 text-slate-600" />
              <span>Export</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {/* + Tambah Mapel Primary Button */}
            {canManage && (
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Mata Pelajaran</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <div
          data-testid="bulk-toolbar"
          className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:px-5 rounded-2xl bg-slate-900/90 backdrop-blur-md text-white border border-slate-700/80 shadow-xl animate-in fade-in slide-in-from-top-2"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold">{selectedIds.size} data dipilih</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {canManage && (
              <>
                <button
                  type="button"
                  onClick={handleBulkArchive}
                  disabled={isPending}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600/90 hover:bg-purple-600 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  title="Arsipkan mapel terpilih"
                >
                  <Archive className="h-3.5 w-3.5" />
                  <span>Arsipkan</span>
                </button>
                <button
                  type="button"
                  onClick={handleBulkDeactivate}
                  disabled={isPending}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600/90 hover:bg-amber-600 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  title="Nonaktifkan mapel terpilih"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Nonaktifkan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsBulkDeleteOpen(true)}
                  disabled={isPending}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  title="Hapus permanen mapel terpilih"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Hapus Permanen</span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={handleClearSelection}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              Batal Pilih
            </button>
          </div>
        </div>
      )}

      {/* Desktop Table (>= 640px) */}
      <div className="overflow-hidden rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/90 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
              <tr>
                {/* Select All Checkbox */}
                <th className="w-12 px-4 py-3.5 text-center">
                  <input
                    type="checkbox"
                    ref={selectAllRef}
                    aria-label="Pilih semua mata pelajaran"
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded text-[#2563EB] border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="px-5 py-3.5">Kode</th>
                <th className="px-4 py-3.5">Nama Mata Pelajaran</th>
                <th className="px-4 py-3.5">Kelompok</th>
                <th className="px-4 py-3.5">Guru Pengajar</th>
                <th className="px-4 py-3.5">Rombel Aktif</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedSubjects.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-slate-400 text-xs sm:text-sm"
                  >
                    Tidak ada data mata pelajaran yang cocok.
                  </td>
                </tr>
              ) : (
                paginatedSubjects.map((s) => {
                  const lifecycle = s.status_lifecycle || (s.status_aktif ? "AKTIF" : "NONAKTIF");
                  const isSelected = selectedIds.has(s.id);

                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? "bg-blue-50/40" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="w-12 px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          aria-label={`Pilih mata pelajaran ${s.nama}`}
                          checked={isSelected}
                          onChange={() => handleToggleRow(s.id)}
                          className="w-4 h-4 rounded text-[#2563EB] border-slate-300 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Kode */}
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-xs bg-blue-50 text-[#2563EB] border border-blue-200 px-2.5 py-1 rounded-lg">
                          {s.kode}
                        </span>
                      </td>

                      {/* Nama */}
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-800 block">{s.nama}</span>
                        {s.deskripsi && (
                          <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                            {s.deskripsi}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {s.kelompok || "UMUM"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-700">
                          {s.total_guru_pengajar || 0} Guru
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-700">
                          {s.total_rombel_aktif || 0} Kelas
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                            lifecycle === "AKTIF"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : lifecycle === "ARSIP"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {lifecycle === "AKTIF"
                            ? "Aktif"
                            : lifecycle === "ARSIP"
                              ? "Arsip"
                              : "Nonaktif"}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        {canManage && (
                          <div className="flex items-center justify-end gap-1">
                            {lifecycle === "ARSIP" ? (
                              <button
                                onClick={() => handleRestoreSubmit(s.id)}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                                title="Pulihkan Mapel ke Aktif"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => setEditingSubject(s)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                                  title="Edit Mata Pelajaran"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                {s.bisa_hapus_permanen ? (
                                  <button
                                    onClick={() => setDeletingSubject(s)}
                                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                                    title="Hapus Mata Pelajaran"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setDeletingSubject(s)}
                                    className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors"
                                    title="Arsipkan Mapel (Memiliki Histori Akademik)"
                                  >
                                    <Archive className="h-4 w-4" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Menampilkan{" "}
            <span className="font-semibold text-slate-700">
              {sortedSubjects.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}
            </span>{" "}
            sampai{" "}
            <span className="font-semibold text-slate-700">
              {Math.min(currentPage * rowsPerPage, sortedSubjects.length)}
            </span>{" "}
            dari <span className="font-semibold text-slate-700">{sortedSubjects.length}</span> mapel
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 font-semibold">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Tambah Mapel */}
      {isCreateOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <Plus className="h-4 w-4 text-[#2563EB]" />
                  Tambah Mata Pelajaran
                </h3>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Kode Mapel *
                    </label>
                    <input
                      name="kode"
                      required
                      placeholder="MTK, BIN, PBO"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 uppercase font-mono font-bold text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Nama Mata Pelajaran *
                    </label>
                    <input
                      name="nama"
                      required
                      placeholder="Contoh: Matematika Wajib"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Kelompok Kurikulum
                  </label>
                  <select
                    name="kelompok"
                    defaultValue="UMUM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs"
                  >
                    <option value="UMUM">Mata Pelajaran Umum (Kelompok A/B)</option>
                    <option value="KEJURUAN">Kejuruan / Produktif (Kelompok C)</option>
                    <option value="PILIHAN">Mata Pelajaran Pilihan</option>
                    <option value="MUATAN_LOKAL">Muatan Lokal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Deskripsi / Silabus Singkat
                  </label>
                  <textarea
                    name="deskripsi"
                    rows={3}
                    placeholder="Keterangan cakupan materi atau kompetensi..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs disabled:opacity-50"
                  >
                    {isPending ? "Menyimpan..." : "Simpan Mapel"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Modal: Edit Mapel */}
      {editingSubject &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <Edit2 className="h-4 w-4 text-[#2563EB]" />
                  Edit Mata Pelajaran
                </h3>
                <button
                  onClick={() => setEditingSubject(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
                <input type="hidden" name="id" value={editingSubject.id} />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Kode Mapel *
                    </label>
                    <input
                      name="kode"
                      required
                      defaultValue={editingSubject.kode}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 uppercase font-mono font-bold text-slate-800 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Nama Mata Pelajaran *
                    </label>
                    <input
                      name="nama"
                      required
                      defaultValue={editingSubject.nama}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Kelompok Kurikulum
                    </label>
                    <select
                      name="kelompok"
                      defaultValue={editingSubject.kelompok || "UMUM"}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs"
                    >
                      <option value="UMUM">Umum</option>
                      <option value="KEJURUAN">Kejuruan</option>
                      <option value="PILIHAN">Pilihan</option>
                      <option value="MUATAN_LOKAL">Muatan Lokal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Status Lifecycle
                    </label>
                    <select
                      name="status_lifecycle"
                      defaultValue={
                        editingSubject.status_lifecycle ||
                        (editingSubject.status_aktif ? "AKTIF" : "NONAKTIF")
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs"
                    >
                      <option value="AKTIF">Aktif Digunakan</option>
                      <option value="NONAKTIF">Nonaktif</option>
                      <option value="ARSIP">Arsip</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    name="deskripsi"
                    rows={3}
                    defaultValue={editingSubject.deskripsi || ""}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingSubject(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs disabled:opacity-50"
                  >
                    {isPending ? "Memperbarui..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Modal: Konfirmasi Hapus / Arsip Mapel (Domain Protected) */}
      {deletingSubject &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
              {deletingSubject.bisa_hapus_permanen ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">Hapus Mata Pelajaran</h3>
                      <p className="text-xs text-slate-500">
                        {deletingSubject.nama} ({deletingSubject.kode})
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Mata pelajaran ini belum pernah digunakan dalam penugasan akademik. Data akan
                    dihapus secara permanen dari sistem.
                  </p>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setDeletingSubject(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleDeleteSubmit}
                      disabled={isPending}
                      className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs disabled:opacity-50"
                    >
                      {isPending ? "Menghapus..." : "Hapus Permanen"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
                      <Archive className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">
                        Histori Akademik Terdeteksi
                      </h3>
                      <p className="text-xs text-slate-500">
                        {deletingSubject.nama} ({deletingSubject.kode})
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200 text-xs text-purple-900 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-purple-800">
                      <ShieldAlert className="h-4 w-4 text-purple-600" />
                      <span>Hard Delete Dilarang</span>
                    </div>
                    <p className="leading-relaxed">
                      Mata pelajaran tidak dapat dihapus permanen karena memiliki histori akademik (
                      {deletingSubject.jumlah_histori_akademik || 0} data terkait: penugasan
                      mengajar, jadwal, atau sesi KBM). Gunakan Arsip untuk menyembunyikan dari
                      operasional.
                    </p>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setDeletingSubject(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Batal
                    </button>
                    {deletingSubject.status_aktif && (
                      <button
                        onClick={handleDeactivateSubmit}
                        disabled={isPending}
                        className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-semibold text-xs disabled:opacity-50"
                      >
                        {isPending ? "Memproses..." : "Nonaktifkan"}
                      </button>
                    )}
                    <button
                      onClick={() => handleArchiveSubmit(deletingSubject.id)}
                      disabled={isPending}
                      className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-500/20 disabled:opacity-50"
                    >
                      {isPending ? "Mengarsipkan..." : "Arsipkan Mapel"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* Modal: Konfirmasi Bulk Delete */}
      {isBulkDeleteOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Konfirmasi Hapus Massal</h3>
                  <p className="text-xs text-slate-500">
                    {selectedIds.size} mata pelajaran dipilih
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-semibold">Perlindungan Histori Akademik Aktif:</p>
                <p className="leading-relaxed">
                  Mata pelajaran yang belum memiliki histori akademik akan dihapus permanen. Mata
                  pelajaran yang memiliki histori (penugasan, jadwal, sesi KBM) akan otomatis
                  dialihkan ke status <strong>Arsip</strong> agar integritas kurikulum sekolah tetap
                  terjaga.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBulkDeleteOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  onClick={handleBulkDeleteSubmit}
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs disabled:opacity-50"
                >
                  {isPending ? "Memproses..." : "Lanjutkan Hapus & Arsip"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
