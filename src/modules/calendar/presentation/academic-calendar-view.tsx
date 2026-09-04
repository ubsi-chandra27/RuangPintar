"use client";

/**
 * Ruang Pintar — M09 Academic Calendar Presentation View (Academic Glass UI v1.2)
 */

import React, { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  ChevronDown,
  RotateCcw,
  Check,
  X,
  Edit2,
  Trash2,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { createPortal } from "react-dom";
import { deleteCalendarEventAction } from "@/app/actions/calendar-actions";
import { CalendarEventDTO } from "../domain/calendar-types";
import { CalendarEventModal } from "./calendar-event-modal";
import { Toast, ToastType } from "@/shared/components/ui/toast";

interface AcademicCalendarViewProps {
  initialEvents: CalendarEventDTO[];
  academicYears: Array<{ id: string; nama: string; status: string }>;
  semesters: Array<{ id: string; nama: string; tahun_ajaran_id: string }>;
  canManage: boolean;
}

export function AcademicCalendarView({
  initialEvents,
  academicYears,
  semesters,
  canManage,
}: AcademicCalendarViewProps) {
  const router = useRouter();
  const events = initialEvents;

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [tahunAjaranFilter, setTahunAjaranFilter] = useState("ALL");
  const [tipeEventFilter, setTipeEventFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("date_asc");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Popover toggle states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Modals & Actions
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<CalendarEventDTO | null>(null);
  const [eventToDelete, setEventToDelete] = useState<CalendarEventDTO | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isPending, startTransition] = useTransition();

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

  // Filter events
  const filteredEvents = events.filter((e) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      e.judul.toLowerCase().includes(q) || (e.deskripsi && e.deskripsi.toLowerCase().includes(q));

    const matchesTA = tahunAjaranFilter === "ALL" || e.tahun_ajaran_id === tahunAjaranFilter;

    const matchesTipe = tipeEventFilter === "ALL" || e.tipe_event === tipeEventFilter;

    return matchesSearch && matchesTA && matchesTipe;
  });

  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case "date_asc":
        return new Date(a.tanggal_mulai).getTime() - new Date(b.tanggal_mulai).getTime();
      case "date_desc":
        return new Date(b.tanggal_mulai).getTime() - new Date(a.tanggal_mulai).getTime();
      case "title_asc":
        return a.judul.localeCompare(b.judul, "id");
      case "title_desc":
        return b.judul.localeCompare(a.judul, "id");
      default:
        return new Date(a.tanggal_mulai).getTime() - new Date(b.tanggal_mulai).getTime();
    }
  });

  const totalPages = Math.ceil(sortedEvents.length / rowsPerPage) || 1;
  const paginatedEvents = sortedEvents.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Metrics
  const totalHolidays = events.filter((e) => e.tipe_event === "HARI_LIBUR" || e.libur_kbm).length;
  const totalExams = events.filter((e) => e.tipe_event === "UJIAN").length;
  const totalActivities = events.filter(
    (e) => e.tipe_event === "KEGIATAN_SEKOLAH" || e.tipe_event === "ORIENTASI"
  ).length;

  const getEventBadge = (tipe: string, libur: boolean) => {
    switch (tipe) {
      case "HARI_LIBUR":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "UJIAN":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "ORIENTASI":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "HARI_EFEKTIF":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return libur
          ? "bg-rose-50 text-rose-700 border-rose-200"
          : "bg-blue-50 text-[#2563EB] border-blue-200";
    }
  };

  const formatTipeLabel = (tipe: string) => {
    switch (tipe) {
      case "HARI_LIBUR":
        return "Hari Libur Resmi";
      case "UJIAN":
        return "Periode Ujian / Asesmen";
      case "ORIENTASI":
        return "Masa Orientasi / MPLS";
      case "HARI_EFEKTIF":
        return "Hari Efektif Khusus";
      case "KEGIATAN_SEKOLAH":
        return "Kegiatan Sekolah";
      default:
        return "Lainnya";
    }
  };

  const handleExportCSV = () => {
    if (sortedEvents.length === 0) {
      setToast({ message: "Tidak ada agenda kalender untuk diekspor.", type: "error" });
      return;
    }

    const headers = [
      "No",
      "Judul Agenda",
      "Tipe Kegiatan",
      "Tahun Ajaran",
      "Tanggal Mulai",
      "Tanggal Selesai",
      "Libur KBM",
      "Deskripsi",
    ];

    const escapeCsv = (val: unknown) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = sortedEvents.map((e, idx) => [
      idx + 1,
      escapeCsv(e.judul),
      escapeCsv(formatTipeLabel(e.tipe_event)),
      escapeCsv(e.tahun_ajaran_nama),
      escapeCsv(new Date(e.tanggal_mulai).toLocaleDateString("id-ID")),
      escapeCsv(new Date(e.tanggal_selesai).toLocaleDateString("id-ID")),
      escapeCsv(e.libur_kbm ? "Ya (Libur KBM)" : "Tidak (KBM Berjalan)"),
      escapeCsv(e.deskripsi || "-"),
    ]);

    const delimiter = ";";
    const csvContent =
      "\uFEFF" + [headers.join(delimiter), ...rows.map((r) => r.join(delimiter))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `kalender_akademik_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToast({
      message: `Berhasil mengekspor ${sortedEvents.length} data agenda kalender ke CSV.`,
      type: "success",
    });
  };

  const handleDeleteSubmit = () => {
    if (!eventToDelete) return;
    startTransition(async () => {
      const res = await deleteCalendarEventAction(eventToDelete.id);
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        setEventToDelete(null);
        router.refresh();
      } else {
        setToast({ message: res.message, type: "error" });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Total Agenda</span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-800">
              {events.length} Agenda
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 text-[#2563EB]">
            <CalendarIcon className="h-6 w-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">
              Hari Libur & Cuti
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-rose-600">
              {totalHolidays} Hari
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Periode Ujian</span>
            <span className="text-xl sm:text-2xl font-extrabold text-purple-600">
              {totalExams} Periode
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Kegiatan & MPLS</span>
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-600">
              {totalActivities} Event
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Table Toolbar (UI Kit Standard: Search + Filter + Sort + Export + Primary Button) */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input with Leading & Trailing Icon */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search agenda kegiatan kalender..."
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
                  tahunAjaranFilter !== "ALL" || tipeEventFilter !== "ALL"
                    ? "border-blue-300 bg-blue-50/70 text-[#2563EB]"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                }`}
              >
                <Filter
                  className={`h-4 w-4 ${
                    tahunAjaranFilter !== "ALL" || tipeEventFilter !== "ALL"
                      ? "text-[#2563EB]"
                      : "text-slate-600"
                  }`}
                />
                <span>Filter</span>
                {(tahunAjaranFilter !== "ALL" || tipeEventFilter !== "ALL") && (
                  <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                )}
              </button>

              {/* Filter Popover Menu */}
              {isFilterOpen && (
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 p-4 rounded-2xl bg-white border border-slate-200 shadow-xl z-30 space-y-3 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Filter className="h-3.5 w-3.5 text-[#2563EB]" />
                      Filter Kalender
                    </span>
                    {(tahunAjaranFilter !== "ALL" || tipeEventFilter !== "ALL") && (
                      <button
                        type="button"
                        onClick={() => {
                          setTahunAjaranFilter("ALL");
                          setTipeEventFilter("ALL");
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
                      Tahun Ajaran
                    </label>
                    <select
                      value={tahunAjaranFilter}
                      onChange={(e) => {
                        setTahunAjaranFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                    >
                      <option value="ALL">Semua Tahun Ajaran</option>
                      {academicYears.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nama} {t.status === "AKTIF" ? "(Aktif)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Tipe Kegiatan
                    </label>
                    <select
                      value={tipeEventFilter}
                      onChange={(e) => {
                        setTipeEventFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                    >
                      <option value="ALL">Semua Tipe</option>
                      <option value="KEGIATAN_SEKOLAH">Kegiatan Sekolah</option>
                      <option value="HARI_LIBUR">Hari Libur Resmi</option>
                      <option value="UJIAN">Periode Ujian</option>
                      <option value="ORIENTASI">Masa Orientasi</option>
                      <option value="HARI_EFEKTIF">Hari Efektif Khusus</option>
                      <option value="LAINNYA">Lainnya</option>
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
                    { id: "date_asc", label: "Tanggal (Terdekat)" },
                    { id: "date_desc", label: "Tanggal (Terjauh)" },
                    { id: "title_asc", label: "Judul (A - Z)" },
                    { id: "title_desc", label: "Judul (Z - A)" },
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

            {/* Export Dropdown / Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-2xs transition-colors cursor-pointer shrink-0"
              title="Ekspor kalender akademik ke CSV"
            >
              <Download className="h-4 w-4 text-slate-600" />
              <span>Export</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {/* + Tambah Agenda Primary Button */}
            {canManage && (
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Agenda</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Table View (>= 768px) */}
      <div className="hidden md:block overflow-hidden rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Tanggal Pelaksanaan</th>
                <th className="px-4 py-3.5">Agenda / Kegiatan</th>
                <th className="px-4 py-3.5">Tipe Kegiatan</th>
                <th className="px-4 py-3.5">Tahun Ajaran</th>
                <th className="px-4 py-3.5">Status KBM</th>
                {canManage && <th className="px-5 py-3.5 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedEvents.length === 0 ? (
                <tr>
                  <td
                    colSpan={canManage ? 6 : 5}
                    className="px-6 py-12 text-center text-slate-400 text-xs sm:text-sm"
                  >
                    Tidak ada agenda kalender yang sesuai kriteria.
                  </td>
                </tr>
              ) : (
                paginatedEvents.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2 font-semibold text-slate-800">
                        <CalendarIcon className="h-4 w-4 text-[#2563EB]" />
                        <span>
                          {new Date(e.tanggal_mulai).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                          {new Date(e.tanggal_mulai).toDateString() !==
                            new Date(e.tanggal_selesai).toDateString() && (
                            <span className="text-slate-400 font-normal">
                              {" "}
                              -{" "}
                              {new Date(e.tanggal_selesai).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-900 block">{e.judul}</span>
                      {e.deskripsi && (
                        <span className="text-xs text-slate-500 line-clamp-1 block">
                          {e.deskripsi}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${getEventBadge(
                          e.tipe_event,
                          e.libur_kbm
                        )}`}
                      >
                        {formatTipeLabel(e.tipe_event)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-medium text-slate-800">{e.tahun_ajaran_nama}</span>
                      {e.semester_nama && (
                        <span className="text-[11px] text-slate-400 block">{e.semester_nama}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {e.libur_kbm ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Libur KBM
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          KBM Aktif
                        </span>
                      )}
                    </td>
                    {canManage && (
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEventToEdit(e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit agenda"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEventToDelete(e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus agenda"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Menampilkan</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none"
            >
              <option value={10}>10 Baris</option>
              <option value={20}>20 Baris</option>
              <option value={50}>50 Baris</option>
            </select>
            <span>dari {sortedEvents.length} agenda</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-semibold text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isCreateOpen && (
        <CalendarEventModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          academicYears={academicYears}
          semesters={semesters}
          onSuccess={(t) => {
            setToast(t);
            router.refresh();
          }}
        />
      )}

      {eventToEdit && (
        <CalendarEventModal
          isOpen={!!eventToEdit}
          onClose={() => setEventToEdit(null)}
          eventToEdit={eventToEdit}
          academicYears={academicYears}
          semesters={semesters}
          onSuccess={(t) => {
            setToast(t);
            router.refresh();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {eventToDelete &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-6 space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="p-3 rounded-2xl bg-rose-50">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Hapus Agenda Kalender?</h3>
                  <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Anda akan menghapus agenda <strong>&ldquo;{eventToDelete.judul}&rdquo;</strong> dari
                Kalender Akademik.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEventToDelete(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSubmit}
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-rose-500/20 cursor-pointer"
                >
                  {isPending ? "Menghapus..." : "Ya, Hapus"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
