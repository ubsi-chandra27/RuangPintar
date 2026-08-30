"use client";

/**
 * Ruang Pintar — Academic Years & Semesters Management Component (Academic Glass UI v1.2)
 */

import React, { useState, useMemo, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  Calendar,
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Sparkles,
  CheckCircle2,
  Clock,
  Archive,
  AlertTriangle,
} from "lucide-react";
import { AcademicYearDTO, SemesterDTO, StatusPeriode } from "../domain/academic-types";
import {
  activateAcademicYearAction,
  activateSemesterAction,
  closeAcademicYearAction,
  createAcademicYearAction,
  createSemesterAction,
  deleteAcademicYearAction,
  deleteSemesterAction,
  updateAcademicYearAction,
  updateSemesterAction,
} from "@/app/actions/academic-actions";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { Toast } from "@/shared/components/ui/toast";

interface AcademicYearsViewProps {
  initialYears: AcademicYearDTO[];
  initialSemesters: SemesterDTO[];
  canManage: boolean;
}

const emptySubscribe = () => () => {};

export function AcademicYearsView({
  initialYears,
  initialSemesters,
  canManage,
}: AcademicYearsViewProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [years, setYears] = useState<AcademicYearDTO[]>(initialYears);
  const [semesters, setSemesters] = useState<SemesterDTO[]>(initialSemesters);

  // Modals state
  const [yearModalMode, setYearModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedYear, setSelectedYear] = useState<AcademicYearDTO | null>(null);
  const [deleteYearTarget, setDeleteYearTarget] = useState<AcademicYearDTO | null>(null);

  const [semModalMode, setSemModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<SemesterDTO | null>(null);
  const [targetYearForSemester, setTargetYearForSemester] = useState<AcademicYearDTO | null>(null);
  const [deleteSemTarget, setDeleteSemTarget] = useState<SemesterDTO | null>(null);

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Toolbar & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Active items
  const activeYear = years.find((y) => y.status === "AKTIF");
  const activeSemester = semesters.find((s) => s.status === "AKTIF");

  // Filtered years
  const filteredYears = useMemo(() => {
    return years.filter((y) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        y.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (y.kode && y.kode.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === "ALL" || y.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [years, searchQuery, statusFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredYears.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedYears = filteredYears.slice(startIndex, startIndex + pageSize);

  function formatDate(d: Date | string | null | undefined): string {
    if (!d) return "-";
    const date = new Date(d);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function getStatusBadge(status: StatusPeriode) {
    switch (status) {
      case "AKTIF":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" />
            Aktif
          </span>
        );
      case "SELESAI":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <Clock className="h-3 w-3" />
            Selesai
          </span>
        );
      case "DIARSIPKAN":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Archive className="h-3 w-3" />
            Diarsipkan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
            Draft
          </span>
        );
    }
  }

  // Handlers Year
  async function handleYearSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canManage) return;

    setLoading(true);
    setToastMessage(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    let res;

    if (yearModalMode === "create") {
      res = await createAcademicYearAction(formData);
    } else if (yearModalMode === "edit" && selectedYear) {
      res = await updateAcademicYearAction(selectedYear.id, formData);
    }

    if (res?.success) {
      setToastMessage({ type: "success", text: res.message ?? "Operasi berhasil." });
      setYearModalMode(null);
      setSelectedYear(null);
      if (yearModalMode === "create" && res.data) {
        setYears((prev) => [res.data as AcademicYearDTO, ...prev]);
      } else if (yearModalMode === "edit" && res.data) {
        const updated = res.data as AcademicYearDTO;
        setYears((prev) => prev.map((y) => (y.id === updated.id ? { ...y, ...updated } : y)));
      }
    } else if (res && !res.success) {
      setToastMessage({ type: "error", text: res.error });
      if (res.details) {
        setFieldErrors(res.details);
      }
    }
    setLoading(false);
  }

  async function handleActivateYear(year: AcademicYearDTO) {
    if (!canManage) return;
    setLoading(true);
    setToastMessage(null);

    const res = await activateAcademicYearAction(year.id);
    if (res.success && res.data) {
      const updated = res.data as AcademicYearDTO;
      setToastMessage({
        type: "success",
        text: res.message ?? "Tahun ajaran berhasil diaktifkan.",
      });
      setYears((prev) =>
        prev.map((y) => (y.id === updated.id ? updated : { ...y, status: "SELESAI" }))
      );
    } else if (!res.success) {
      setToastMessage({ type: "error", text: res.error });
    }
    setLoading(false);
  }

  async function handleCloseYear(year: AcademicYearDTO) {
    if (!canManage) return;
    setLoading(true);
    setToastMessage(null);

    const res = await closeAcademicYearAction(year.id);
    if (res.success && res.data) {
      const updated = res.data as AcademicYearDTO;
      setToastMessage({ type: "success", text: res.message ?? "Tahun ajaran ditutup." });
      setYears((prev) => prev.map((y) => (y.id === updated.id ? updated : y)));
    } else if (!res.success) {
      setToastMessage({ type: "error", text: res.error });
    }
    setLoading(false);
  }

  async function handleDeleteYearConfirm() {
    if (!deleteYearTarget || !canManage) return;
    setLoading(true);
    setToastMessage(null);

    const res = await deleteAcademicYearAction(deleteYearTarget.id);
    if (res.success) {
      setToastMessage({ type: "success", text: res.message ?? "Tahun ajaran berhasil dihapus." });
      setYears((prev) => prev.filter((y) => y.id !== deleteYearTarget.id));
      setDeleteYearTarget(null);
    } else if (!res.success) {
      setToastMessage({ type: "error", text: res.error });
    }
    setLoading(false);
  }

  // Handlers Semester
  async function handleSemesterSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canManage) return;

    setLoading(true);
    setToastMessage(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    let res;

    if (semModalMode === "create") {
      res = await createSemesterAction(formData);
    } else if (semModalMode === "edit" && selectedSemester) {
      res = await updateSemesterAction(selectedSemester.id, formData);
    }

    if (res?.success) {
      setToastMessage({ type: "success", text: res.message ?? "Operasi semester berhasil." });
      setSemModalMode(null);
      setSelectedSemester(null);
      setTargetYearForSemester(null);
      if (semModalMode === "create" && res.data) {
        setSemesters((prev) => [...prev, res.data as SemesterDTO]);
      } else if (semModalMode === "edit" && res.data) {
        const updated = res.data as SemesterDTO;
        setSemesters((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)));
      }
    } else if (res && !res.success) {
      setToastMessage({ type: "error", text: res.error });
      if (res.details) {
        setFieldErrors(res.details);
      }
    }
    setLoading(false);
  }

  async function handleActivateSemester(sem: SemesterDTO) {
    if (!canManage) return;
    setLoading(true);
    setToastMessage(null);

    const res = await activateSemesterAction(sem.id);
    if (res.success && res.data) {
      const updated = res.data as SemesterDTO;
      setToastMessage({ type: "success", text: res.message ?? "Semester berhasil diaktifkan." });
      setSemesters((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : { ...s, status: "SELESAI" }))
      );
    } else if (!res.success) {
      setToastMessage({ type: "error", text: res.error });
    }
    setLoading(false);
  }

  async function handleDeleteSemesterConfirm() {
    if (!deleteSemTarget || !canManage) return;
    setLoading(true);
    setToastMessage(null);

    const res = await deleteSemesterAction(deleteSemTarget.id);
    if (res.success) {
      setToastMessage({ type: "success", text: res.message ?? "Semester berhasil dihapus." });
      setSemesters((prev) => prev.filter((s) => s.id !== deleteSemTarget.id));
      setDeleteSemTarget(null);
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

      {/* 1. Context Banner Periode Aktif */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-xl shadow-blue-500/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-wide uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Konteks Operasional Aktif</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {activeYear ? activeYear.nama : "Belum Ada Tahun Ajaran Aktif"}
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 font-medium">
              {activeSemester ? (
                <span>
                  Semester:{" "}
                  <strong className="text-white font-bold">
                    {activeSemester.nama} ({activeSemester.kode})
                  </strong>{" "}
                  • Periode: {formatDate(activeSemester.tanggal_mulai)} s.d{" "}
                  {formatDate(activeSemester.tanggal_selesai)}
                </span>
              ) : (
                "Silakan aktifkan semester operasional untuk tahun ajaran aktif."
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {canManage && (
              <button
                type="button"
                onClick={() => {
                  setSelectedYear(null);
                  setFieldErrors({});
                  setYearModalMode("create");
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#2563EB] hover:bg-blue-50 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Tahun Ajaran</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Glass Container */}
      <div className="rounded-3xl bg-white border border-slate-100/90 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100/80">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Daftar Tahun Ajaran & Semester</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              Kelola siklus kalender tahunan sekolah beserta pembagian semester operasional.
            </p>
          </div>
        </div>

        {years.length === 0 ? (
          <EmptyState
            title="Belum Ada Tahun Ajaran"
            description="Buat tahun ajaran pertama untuk memulai penataan siklus akademik sekolah."
            action={
              canManage ? (
                <Button
                  variant="cobalt"
                  onClick={() => {
                    setSelectedYear(null);
                    setFieldErrors({});
                    setYearModalMode("create");
                  }}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Tambah Tahun Ajaran
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
                  placeholder="Cari nama tahun ajaran atau kode..."
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

              <div className="flex items-center gap-2 self-end md:self-auto">
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-600 shadow-sm">
                  <Filter className="h-3.5 w-3.5 text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent border-none text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="AKTIF">Aktif</option>
                    <option value="DRAFT">Draft</option>
                    <option value="SELESAI">Selesai</option>
                    <option value="DIARSIPKAN">Diarsipkan</option>
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

            {/* List of Years & their Semesters */}
            {filteredYears.length === 0 ? (
              <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-slate-200/60 space-y-2">
                <p className="text-sm font-bold text-slate-700">
                  Tidak ada tahun ajaran yang sesuai
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("ALL");
                  }}
                  className="mt-2 text-xs"
                >
                  Reset Filter
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedYears.map((year) => {
                  const yearSemesters = semesters.filter((s) => s.tahun_ajaran_id === year.id);

                  return (
                    <div
                      key={year.id}
                      className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-4 shadow-sm hover:border-blue-200 transition-all"
                    >
                      {/* Year Card Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 font-black text-sm">
                            {year.nama}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-bold text-slate-900">{year.nama}</h4>
                              {getStatusBadge(year.status)}
                              {year.kode && <Badge variant="neutral">{year.kode}</Badge>}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Periode: {formatDate(year.tanggal_mulai)} s.d{" "}
                              {formatDate(year.tanggal_selesai)}
                            </p>
                          </div>
                        </div>

                        {canManage && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {year.status !== "AKTIF" && (
                              <button
                                type="button"
                                onClick={() => handleActivateYear(year)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 cursor-pointer shadow-xs transition-all"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Jadikan Aktif</span>
                              </button>
                            )}

                            {year.status === "AKTIF" && (
                              <button
                                type="button"
                                onClick={() => handleCloseYear(year)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 cursor-pointer shadow-xs transition-all"
                              >
                                <Clock className="h-3.5 w-3.5" />
                                <span>Tutup Periode</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedYear(year);
                                setFieldErrors({});
                                setYearModalMode("edit");
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100/90 hover:bg-blue-50 hover:text-[#2563EB] border border-slate-200/80 cursor-pointer shadow-xs transition-all"
                            >
                              <Pencil className="h-3.5 w-3.5 text-slate-500" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteYearTarget(year)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 cursor-pointer shadow-xs transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Semesters Section */}
                      <div className="space-y-2.5 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Semester di Tahun Ini ({yearSemesters.length})
                          </span>
                          {canManage && (
                            <button
                              type="button"
                              onClick={() => {
                                setTargetYearForSemester(year);
                                setSelectedSemester(null);
                                setFieldErrors({});
                                setSemModalMode("create");
                              }}
                              className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:text-blue-700 cursor-pointer"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>Tambah Semester</span>
                            </button>
                          )}
                        </div>

                        {yearSemesters.length === 0 ? (
                          <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                            Belum ada semester. Tambahkan semester Ganjil dan Genap.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {yearSemesters.map((sem) => (
                              <div
                                key={sem.id}
                                className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-start justify-between gap-2"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-bold text-slate-900 text-sm">{sem.nama}</h5>
                                    {getStatusBadge(sem.status)}
                                    <Badge variant="cobalt">{sem.kode}</Badge>
                                  </div>
                                  <p className="text-[11px] text-slate-500">
                                    {formatDate(sem.tanggal_mulai)} s.d{" "}
                                    {formatDate(sem.tanggal_selesai)}
                                  </p>
                                </div>

                                {canManage && (
                                  <div className="flex items-center gap-1">
                                    {sem.status !== "AKTIF" && (
                                      <button
                                        type="button"
                                        onClick={() => handleActivateSemester(sem)}
                                        title="Aktifkan Semester"
                                        className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100 bg-white border border-slate-200 cursor-pointer shadow-xs transition-all text-xs font-bold"
                                      >
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedSemester(sem);
                                        setTargetYearForSemester(year);
                                        setFieldErrors({});
                                        setSemModalMode("edit");
                                      }}
                                      title="Edit Semester"
                                      className="p-1.5 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-[#2563EB] bg-white border border-slate-200 cursor-pointer shadow-xs transition-all"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeleteSemTarget(sem)}
                                      title="Hapus Semester"
                                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 bg-white border border-slate-200 cursor-pointer shadow-xs transition-all"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {filteredYears.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Menampilkan{" "}
                  <strong className="text-slate-800 font-bold">
                    {startIndex + 1} - {Math.min(startIndex + pageSize, filteredYears.length)}
                  </strong>{" "}
                  dari <strong className="text-slate-800 font-bold">{filteredYears.length}</strong>{" "}
                  tahun ajaran
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

      {/* MODAL CREATE / EDIT TAHUN AJARAN */}
      {isMounted &&
        yearModalMode &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="year-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
          >
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <h3 id="year-modal-title" className="text-lg font-bold text-slate-900">
                    {yearModalMode === "create" ? "Tambah Tahun Ajaran" : "Edit Tahun Ajaran"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setYearModalMode(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Tutup modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleYearSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="year-nama"
                    className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                  >
                    Nama Tahun Ajaran <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="year-nama"
                    name="nama"
                    type="text"
                    required
                    defaultValue={selectedYear?.nama ?? ""}
                    placeholder="Contoh: 2026/2027"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all"
                  />
                  {fieldErrors.nama && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.nama[0]}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="year-kode"
                    className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                  >
                    Kode Tahun Ajaran (Opsional)
                  </label>
                  <input
                    id="year-kode"
                    name="kode"
                    type="text"
                    defaultValue={selectedYear?.kode ?? ""}
                    placeholder="Contoh: TA-2026-2027"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm font-mono uppercase focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all"
                  />
                  {fieldErrors.kode && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.kode[0]}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="year-mulai"
                      className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                    >
                      Tanggal Mulai <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="year-mulai"
                      name="tanggal_mulai"
                      type="date"
                      required
                      defaultValue={
                        selectedYear
                          ? new Date(selectedYear.tanggal_mulai).toISOString().split("T")[0]
                          : "2026-07-01"
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all"
                    />
                    {fieldErrors.tanggal_mulai && (
                      <p className="text-xs text-rose-600 mt-1 font-medium">
                        {fieldErrors.tanggal_mulai[0]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="year-selesai"
                      className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                    >
                      Tanggal Selesai <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="year-selesai"
                      name="tanggal_selesai"
                      type="date"
                      required
                      defaultValue={
                        selectedYear
                          ? new Date(selectedYear.tanggal_selesai).toISOString().split("T")[0]
                          : "2027-06-30"
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all"
                    />
                    {fieldErrors.tanggal_selesai && (
                      <p className="text-xs text-rose-600 mt-1 font-medium">
                        {fieldErrors.tanggal_selesai[0]}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="year-status"
                    className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                  >
                    Status Siklus
                  </label>
                  <select
                    id="year-status"
                    name="status"
                    defaultValue={selectedYear?.status ?? "DRAFT"}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all cursor-pointer"
                  >
                    <option value="DRAFT">DRAFT — Periode Persiapan</option>
                    <option value="AKTIF">AKTIF — Periode Operasional Saat Ini</option>
                    <option value="SELESAI">SELESAI — Periode Selesai / Arsip</option>
                    <option value="DIARSIPKAN">DIARSIPKAN — Dokumen Historis</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setYearModalMode(null)}
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
                    {loading ? "Menyimpan..." : "Simpan Tahun Ajaran"}
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL CREATE / EDIT SEMESTER */}
      {isMounted &&
        semModalMode &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sem-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
          >
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <h3 id="sem-modal-title" className="text-lg font-bold text-slate-900">
                    {semModalMode === "create" ? "Tambah Semester" : "Edit Semester"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSemModalMode(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Tutup modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSemesterSubmit} className="space-y-4">
                <input
                  type="hidden"
                  name="tahun_ajaran_id"
                  value={targetYearForSemester?.id ?? selectedSemester?.tahun_ajaran_id ?? ""}
                />

                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 font-medium">
                  Tahun Ajaran:{" "}
                  <strong className="text-blue-950 font-bold">
                    {targetYearForSemester?.nama ?? selectedSemester?.tahun_ajaran_nama}
                  </strong>
                </div>

                <div>
                  <label
                    htmlFor="sem-nama"
                    className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                  >
                    Nama Semester <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="sem-nama"
                    name="nama"
                    type="text"
                    required
                    defaultValue={selectedSemester?.nama ?? "Semester Ganjil"}
                    placeholder="Contoh: Semester Ganjil"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all"
                  />
                  {fieldErrors.nama && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.nama[0]}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="sem-kode"
                      className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                    >
                      Kode Semester <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="sem-kode"
                      name="kode"
                      defaultValue={selectedSemester?.kode ?? "GANJIL"}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all cursor-pointer"
                    >
                      <option value="GANJIL">GANJIL — Semester 1</option>
                      <option value="GENAP">GENAP — Semester 2</option>
                      <option value="PENDEK">PENDEK — Semester Antara</option>
                    </select>
                    {fieldErrors.kode && (
                      <p className="text-xs text-rose-600 mt-1 font-medium">
                        {fieldErrors.kode[0]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="sem-urutan"
                      className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                    >
                      Urutan Periode
                    </label>
                    <input
                      id="sem-urutan"
                      name="urutan"
                      type="number"
                      min={1}
                      max={10}
                      defaultValue={selectedSemester?.urutan ?? 1}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="sem-mulai"
                      className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                    >
                      Tanggal Mulai <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="sem-mulai"
                      name="tanggal_mulai"
                      type="date"
                      required
                      defaultValue={
                        selectedSemester
                          ? new Date(selectedSemester.tanggal_mulai).toISOString().split("T")[0]
                          : "2026-07-01"
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all"
                    />
                    {fieldErrors.tanggal_mulai && (
                      <p className="text-xs text-rose-600 mt-1 font-medium">
                        {fieldErrors.tanggal_mulai[0]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="sem-selesai"
                      className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                    >
                      Tanggal Selesai <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="sem-selesai"
                      name="tanggal_selesai"
                      type="date"
                      required
                      defaultValue={
                        selectedSemester
                          ? new Date(selectedSemester.tanggal_selesai).toISOString().split("T")[0]
                          : "2026-12-31"
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all"
                    />
                    {fieldErrors.tanggal_selesai && (
                      <p className="text-xs text-rose-600 mt-1 font-medium">
                        {fieldErrors.tanggal_selesai[0]}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSemModalMode(null)}
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
                    {loading ? "Menyimpan..." : "Simpan Semester"}
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* CONFIRMATION DELETE TAHUN AJARAN */}
      {isMounted &&
        deleteYearTarget &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="del-year-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
          >
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-100 p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center font-bold text-lg">
                  <AlertTriangle className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <h3 id="del-year-title" className="text-lg font-bold text-slate-900">
                    Hapus Tahun Ajaran
                  </h3>
                  <p className="text-xs text-slate-500">Tindakan permanen di database</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus tahun ajaran{" "}
                <strong className="text-slate-900 font-semibold">{deleteYearTarget.nama}</strong>?
              </p>

              <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-xs text-amber-900 font-medium leading-relaxed">
                Tahun ajaran yang memiliki semester atau rombel terhubung tidak dapat dihapus
                (dilindungi integritas histori).
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => setDeleteYearTarget(null)}
                  disabled={loading}
                  className="cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteYearConfirm}
                  disabled={loading}
                  className="cursor-pointer"
                >
                  {loading ? "Menghapus..." : "Ya, Hapus"}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* CONFIRMATION DELETE SEMESTER */}
      {isMounted &&
        deleteSemTarget &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="del-sem-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
          >
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-100 p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center font-bold text-lg">
                  <AlertTriangle className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <h3 id="del-sem-title" className="text-lg font-bold text-slate-900">
                    Hapus Semester
                  </h3>
                  <p className="text-xs text-slate-500">Tindakan permanen di database</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus semester{" "}
                <strong className="text-slate-900 font-semibold">{deleteSemTarget.nama}</strong> (
                {deleteSemTarget.kode})?
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => setDeleteSemTarget(null)}
                  disabled={loading}
                  className="cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteSemesterConfirm}
                  disabled={loading}
                  className="cursor-pointer"
                >
                  {loading ? "Menghapus..." : "Ya, Hapus Semester"}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
