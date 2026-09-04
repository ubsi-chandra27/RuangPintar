"use client";

/**
 * Ruang Pintar — M10 Actual Class Sessions Presentation View (Academic Glass UI v1.2)
 */

import React, { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  PlayCircle,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  ChevronDown,
  RotateCcw,
  Check,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  UserCheck,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  StopCircle,
} from "lucide-react";
import { createPortal } from "react-dom";
import { closeClassSessionAction } from "@/app/actions/class-session-actions";
import { ClassSessionDTO } from "../domain/schedule-types";
import { TeachingAssignmentDTO, TeacherProfileDTO } from "@/modules/teacher/domain/teacher-types";
import { ClassSessionModal } from "./class-session-modal";
import { SessionAttendanceModal } from "@/modules/attendance/presentation/session-attendance-modal";
import { Toast, ToastType } from "@/shared/components/ui/toast";

interface ClassSessionsViewProps {
  initialSessions: ClassSessionDTO[];
  rombels: Array<{ id: string; nama: string; tingkat_nama?: string | null }>;
  assignments: TeachingAssignmentDTO[];
  teachers: TeacherProfileDTO[];
  canManage: boolean;
}

export function ClassSessionsView({
  initialSessions,
  rombels,
  assignments,
  teachers,
  canManage,
}: ClassSessionsViewProps) {
  const router = useRouter();
  const sessions = initialSessions;

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [rombelFilter, setRombelFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("time_desc");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Popover toggle states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Modals & Action states
  const [attendanceModalSesiId, setAttendanceModalSesiId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [sessionToClose, setSessionToClose] = useState<ClassSessionDTO | null>(null);
  const [closeNote, setCloseNote] = useState("");
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

  // Filter sessions
  const filteredSessions = sessions.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.mata_pelajaran_nama.toLowerCase().includes(q) ||
      s.guru_nama.toLowerCase().includes(q) ||
      s.rombel_nama.toLowerCase().includes(q) ||
      (s.topik_pembelajaran && s.topik_pembelajaran.toLowerCase().includes(q)) ||
      (s.guru_pengganti_nama && s.guru_pengganti_nama.toLowerCase().includes(q));

    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
    const matchesRombel = rombelFilter === "ALL" || s.rombel_id === rombelFilter;

    return matchesSearch && matchesStatus && matchesRombel;
  });

  // Sort sessions
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    switch (sortBy) {
      case "time_desc":
        return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
      case "time_asc":
        return new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime();
      case "mapel_asc":
        return a.mata_pelajaran_nama.localeCompare(b.mata_pelajaran_nama, "id");
      case "guru_asc":
        return a.guru_nama.localeCompare(b.guru_nama, "id");
      default:
        return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
    }
  });

  const totalPages = Math.ceil(sortedSessions.length / rowsPerPage) || 1;
  const paginatedSessions = sortedSessions.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Metrics
  const activeSessionsCount = sessions.filter((s) => s.status === "DIMULAI").length;
  const completedSessionsCount = sessions.filter((s) => s.status === "SELESAI").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DIMULAI":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse";
      case "SELESAI":
        return "bg-blue-50 text-[#2563EB] border-blue-200";
      case "DIBATALKAN":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const handleCloseSessionSubmit = () => {
    if (!sessionToClose) return;
    startTransition(async () => {
      const res = await closeClassSessionAction(sessionToClose.id, closeNote);
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        setSessionToClose(null);
        setCloseNote("");
        router.refresh();
      } else {
        setToast({ message: res.message, type: "error" });
      }
    });
  };

  const handleExportCSV = () => {
    if (sortedSessions.length === 0) {
      setToast({ message: "Tidak ada sesi kelas untuk diekspor.", type: "error" });
      return;
    }

    const headers = [
      "No",
      "Tanggal",
      "Rombongan Belajar",
      "Mata Pelajaran",
      "Guru Pengampu",
      "Guru Pengganti",
      "Jam Mulai Aktual",
      "Jam Selesai Aktual",
      "Status",
      "Topik",
    ];

    const escapeCsv = (val: unknown) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = sortedSessions.map((s, idx) => [
      idx + 1,
      escapeCsv(new Date(s.tanggal).toLocaleDateString("id-ID")),
      escapeCsv(s.rombel_nama),
      escapeCsv(s.mata_pelajaran_nama),
      escapeCsv(s.guru_nama),
      escapeCsv(s.guru_pengganti_nama || "-"),
      escapeCsv(
        s.jam_mulai_aktual ? new Date(s.jam_mulai_aktual).toLocaleTimeString("id-ID") : "-"
      ),
      escapeCsv(
        s.jam_selesai_aktual ? new Date(s.jam_selesai_aktual).toLocaleTimeString("id-ID") : "-"
      ),
      escapeCsv(s.status),
      escapeCsv(s.topik_pembelajaran || "-"),
    ]);

    const delimiter = ";";
    const csvContent =
      "\uFEFF" + [headers.join(delimiter), ...rows.map((r) => r.join(delimiter))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sesi_pembelajaran_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToast({
      message: `Berhasil mengekspor ${sortedSessions.length} sesi kelas ke CSV.`,
      type: "success",
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">
              Sesi Kelas Berlangsung
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-600">
              {activeSessionsCount} Kelas Aktif
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <PlayCircle className="h-6 w-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">
              Sesi Kelas Selesai
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-blue-600">
              {completedSessionsCount} Selesai
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 text-[#2563EB]">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">
              Total Riwayat Sesi
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-800">
              {sessions.length} Kejadian Kelas
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
            <BookOpen className="h-6 w-6" />
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
              placeholder="Search guru, rombel, mapel, topik..."
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
                  statusFilter !== "ALL" || rombelFilter !== "ALL"
                    ? "border-blue-300 bg-blue-50/70 text-[#2563EB]"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                }`}
              >
                <Filter
                  className={`h-4 w-4 ${
                    statusFilter !== "ALL" || rombelFilter !== "ALL"
                      ? "text-[#2563EB]"
                      : "text-slate-600"
                  }`}
                />
                <span>Filter</span>
                {(statusFilter !== "ALL" || rombelFilter !== "ALL") && (
                  <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                )}
              </button>

              {/* Filter Popover Menu */}
              {isFilterOpen && (
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 p-4 rounded-2xl bg-white border border-slate-200 shadow-xl z-30 space-y-3 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Filter className="h-3.5 w-3.5 text-[#2563EB]" />
                      Filter Sesi Pembelajaran
                    </span>
                    {(statusFilter !== "ALL" || rombelFilter !== "ALL") && (
                      <button
                        type="button"
                        onClick={() => {
                          setStatusFilter("ALL");
                          setRombelFilter("ALL");
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
                      Status Sesi
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                    >
                      <option value="ALL">Semua Status Sesi</option>
                      <option value="DIMULAI">Sedang Berlangsung (DIMULAI)</option>
                      <option value="SELESAI">Selesai</option>
                      <option value="DIBATALKAN">Dibatalkan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Rombel / Kelas
                    </label>
                    <select
                      value={rombelFilter}
                      onChange={(e) => {
                        setRombelFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                    >
                      <option value="ALL">Semua Rombel</option>
                      {rombels.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nama} ({r.tingkat_nama || "Kelas"})
                        </option>
                      ))}
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
                    { id: "time_desc", label: "Terbaru Dibuka" },
                    { id: "time_asc", label: "Terlama" },
                    { id: "mapel_asc", label: "Mata Pelajaran (A - Z)" },
                    { id: "guru_asc", label: "Nama Guru (A - Z)" },
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
              title="Ekspor daftar sesi kelas ke CSV"
            >
              <Download className="h-4 w-4 text-slate-600" />
              <span>Export</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {/* + Buka Kelas Primary Button */}
            {canManage && (
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0"
              >
                <PlayCircle className="h-4 w-4" />
                <span>Buka Kelas</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Tanggal & Waktu Aktual</th>
                <th className="px-4 py-3.5">Rombel & Mapel</th>
                <th className="px-4 py-3.5">Guru Pengampu</th>
                <th className="px-4 py-3.5">Topik / Ruangan</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedSessions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-400 text-xs sm:text-sm"
                  >
                    Tidak ada sesi kelas pembelajaran yang cocok.
                  </td>
                </tr>
              ) : (
                paginatedSessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="font-bold text-slate-900">
                        {new Date(s.tanggal).toLocaleDateString("id-ID", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 font-mono">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>
                          {s.jam_mulai_aktual
                            ? new Date(s.jam_mulai_aktual).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                          {s.jam_selesai_aktual
                            ? ` - ${new Date(s.jam_selesai_aktual).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}`
                            : " (Aktif)"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-900 block">
                        {s.mata_pelajaran_nama}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold block">
                        {s.rombel_nama}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-semibold text-slate-800 block">{s.guru_nama}</span>
                      {s.guru_pengganti_nama && (
                        <span className="text-[11px] text-amber-600 font-medium block">
                          Pengganti: {s.guru_pengganti_nama}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {s.topik_pembelajaran ? (
                        <span className="font-medium text-slate-800 block">
                          {s.topik_pembelajaran}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs block">
                          Tanpa topik khusus
                        </span>
                      )}
                      {s.ruangan_aktual && (
                        <span className="text-[11px] text-blue-600 font-semibold block">
                          {s.ruangan_aktual}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                          s.status
                        )}`}
                      >
                        {s.status === "DIMULAI"
                          ? "Berlangsung"
                          : s.status === "SELESAI"
                            ? "Selesai"
                            : s.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setAttendanceModalSesiId(s.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2563EB] font-bold text-xs border border-blue-200/80 shadow-2xs transition-all cursor-pointer"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>Presensi</span>
                        </button>
                        {s.status === "DIMULAI" && canManage && (
                          <button
                            type="button"
                            onClick={() => setSessionToClose(s)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                          >
                            <StopCircle className="h-3.5 w-3.5 text-rose-400" />
                            <span>Tutup Kelas</span>
                          </button>
                        )}
                        {s.status === "SELESAI" && (
                          <span className="text-xs font-semibold text-slate-400">Selesai</span>
                        )}
                      </div>
                    </td>
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
            <span>dari {sortedSessions.length} sesi</span>
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

      {/* Class Session Modal */}
      {isCreateOpen && (
        <ClassSessionModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          rombels={rombels}
          assignments={assignments}
          teachers={teachers}
          onSuccess={(t) => {
            setToast(t);
            router.refresh();
          }}
        />
      )}

      {/* Close Class Session Confirmation Modal */}
      {sessionToClose &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-6 space-y-4">
              <div className="flex items-center gap-3 text-slate-900">
                <div className="p-3 rounded-2xl bg-blue-50 text-[#2563EB]">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Selesaikan Sesi Pembelajaran?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sesi kelas {sessionToClose.rombel_nama} ({sessionToClose.mata_pelajaran_nama})
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Catatan Penutup Sesi (Opsional)
                </label>
                <textarea
                  value={closeNote}
                  onChange={(e) => setCloseNote(e.target.value)}
                  rows={2}
                  placeholder="Catatan kemajuan materi, jurnal kelas, atau pekerjaan rumah..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSessionToClose(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleCloseSessionSubmit}
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black disabled:opacity-50 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {isPending ? "Menutup..." : "Ya, Selesaikan Kelas"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Class Session Attendance Modal (M12) */}
      <SessionAttendanceModal
        sesiId={attendanceModalSesiId}
        isOpen={Boolean(attendanceModalSesiId)}
        onClose={() => setAttendanceModalSesiId(null)}
        onSuccess={(msg) => {
          setToast({ message: msg, type: "success" });
          router.refresh();
        }}
        onError={(msg) => setToast({ message: msg, type: "error" })}
      />
    </div>
  );
}
