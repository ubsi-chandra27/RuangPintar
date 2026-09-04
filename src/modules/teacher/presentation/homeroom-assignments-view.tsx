"use client";
/* eslint-disable @next/next/no-img-element */

/**
 * Ruang Pintar — M08 Homeroom Assignments Management View (Academic Glass UI v1.2)
 */

import React, { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  CheckCircle2,
  Users,
  GraduationCap,
  Download,
  X,
  AlertCircle,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Filter,
  ChevronDown,
  Check,
  RotateCcw,
  ArrowUpDown,
} from "lucide-react";
import { createPortal } from "react-dom";
import { assignHomeroomAction, closeHomeroomAction } from "@/app/actions/teacher-actions";
import { HomeroomAssignmentDTO, TeacherProfileDTO } from "../domain/teacher-types";
import { Toast, ToastType } from "@/shared/components/ui/toast";

interface HomeroomAssignmentsViewProps {
  initialHomerooms: HomeroomAssignmentDTO[];
  teachers: TeacherProfileDTO[];
  academicYears: Array<{ id: string; nama: string; status: string }>;
  rombels: Array<{
    id: string;
    nama: string;
    tingkat_nama?: string | null;
    tahun_ajaran_id: string;
  }>;
  canManage: boolean;
}

export function HomeroomAssignmentsView({
  initialHomerooms,
  teachers,
  academicYears,
  rombels,
  canManage,
}: HomeroomAssignmentsViewProps) {
  const router = useRouter();
  const homerooms = initialHomerooms;
  const [searchQuery, setSearchQuery] = useState("");
  const [tahunAjaranFilter, setTahunAjaranFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("AKTIF");
  const [sortBy, setSortBy] = useState("guru_asc");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

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

  // Form states
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState(
    academicYears.find((t) => t.status === "AKTIF")?.id || academicYears[0]?.id || ""
  );

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [closingHomeroom, setClosingHomeroom] = useState<HomeroomAssignmentDTO | null>(null);

  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Metrics
  const activeHomerooms = homerooms.filter((h) => h.status === "AKTIF");
  const totalRombelsInActiveTA = rombels.filter(
    (r) => !selectedTahunAjaran || r.tahun_ajaran_id === selectedTahunAjaran
  ).length;

  // Filter homerooms
  const filteredHomerooms = homerooms.filter((h) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      h.guru_nama.toLowerCase().includes(q) ||
      (h.guru_nip && h.guru_nip.toLowerCase().includes(q)) ||
      h.rombel_nama.toLowerCase().includes(q);

    const matchesTA = tahunAjaranFilter === "ALL" || h.tahun_ajaran_id === tahunAjaranFilter;

    const matchesStatus = statusFilter === "ALL" || h.status === statusFilter;

    return matchesSearch && matchesTA && matchesStatus;
  });

  // Sort homerooms
  const sortedHomerooms = [...filteredHomerooms].sort((a, b) => {
    switch (sortBy) {
      case "guru_asc":
        return a.guru_nama.localeCompare(b.guru_nama, "id");
      case "guru_desc":
        return b.guru_nama.localeCompare(a.guru_nama, "id");
      case "rombel_asc":
        return a.rombel_nama.localeCompare(b.rombel_nama, "id");
      case "created_desc":
        return (
          (b.berlaku_mulai ? new Date(b.berlaku_mulai).getTime() : 0) -
          (a.berlaku_mulai ? new Date(a.berlaku_mulai).getTime() : 0)
        );
      default:
        return a.guru_nama.localeCompare(b.guru_nama, "id");
    }
  });

  const totalPages = Math.ceil(sortedHomerooms.length / rowsPerPage) || 1;
  const paginatedHomerooms = sortedHomerooms.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const availableRombelsForForm = rombels.filter(
    (r) => !selectedTahunAjaran || r.tahun_ajaran_id === selectedTahunAjaran
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AKTIF":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "SELESAI":
        return "bg-blue-50 text-[#2563EB] border-blue-200";
      case "DIBATALKAN":
      case "NONAKTIF":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const handleExportCSV = () => {
    if (filteredHomerooms.length === 0) {
      setToast({ message: "Tidak ada data wali kelas untuk diekspor.", type: "error" });
      return;
    }

    const headers = [
      "No",
      "Rombongan Belajar",
      "Tingkat",
      "Guru Wali Kelas",
      "NIP Guru",
      "Tahun Ajaran",
      "Total Siswa Rombel",
      "Status",
      "Berlaku Mulai",
      "Berlaku Sampai",
      "Catatan",
    ];

    const escapeCsv = (val: unknown) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filteredHomerooms.map((h, idx) => [
      idx + 1,
      escapeCsv(h.rombel_nama),
      escapeCsv(h.tingkat_nama || "-"),
      escapeCsv(h.guru_nama),
      escapeCsv(h.guru_nip || "-"),
      escapeCsv(h.tahun_ajaran_nama),
      escapeCsv(h.total_siswa_rombel || 0),
      escapeCsv(h.status),
      escapeCsv(new Date(h.berlaku_mulai).toLocaleDateString("id-ID")),
      escapeCsv(h.berlaku_sampai ? new Date(h.berlaku_sampai).toLocaleDateString("id-ID") : "-"),
      escapeCsv(h.catatan || "-"),
    ]);

    const delimiter = ";";
    const csvContent =
      "\uFEFF" + [headers.join(delimiter), ...rows.map((r) => r.join(delimiter))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `wali_kelas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToast({
      message: `Berhasil mengekspor ${filteredHomerooms.length} data wali kelas ke CSV.`,
      type: "success",
    });
  };

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await assignHomeroomAction(null, formData);
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        setIsCreateOpen(false);
        router.refresh();
      } else {
        setToast({ message: res.message, type: "error" });
      }
    });
  };

  const handleCloseSubmit = () => {
    if (!closingHomeroom) return;
    startTransition(async () => {
      const res = await closeHomeroomAction(closingHomeroom.id, "SELESAI");
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        setClosingHomeroom(null);
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

      {/* Summary Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Wali Kelas Aktif</span>
            <span className="text-xl sm:text-2xl font-extrabold text-[#2563EB]">
              {activeHomerooms.length} Guru
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 text-[#2563EB]">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Rombel Terbina</span>
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-600">
              {activeHomerooms.length} / {totalRombelsInActiveTA || 0} Kelas
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">
              Rombel Belum Ber-Wali
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-amber-600">
              {Math.max(0, (totalRombelsInActiveTA || 0) - activeHomerooms.length)} Kelas
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
            <AlertCircle className="h-6 w-6" />
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
              placeholder="Search wali kelas atau nama rombel..."
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
                  tahunAjaranFilter !== "ALL" || statusFilter !== "AKTIF"
                    ? "border-blue-300 bg-blue-50/70 text-[#2563EB]"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                }`}
              >
                <Filter
                  className={`h-4 w-4 ${
                    tahunAjaranFilter !== "ALL" || statusFilter !== "AKTIF"
                      ? "text-[#2563EB]"
                      : "text-slate-600"
                  }`}
                />
                <span>Filter</span>
                {(tahunAjaranFilter !== "ALL" || statusFilter !== "AKTIF") && (
                  <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                )}
              </button>

              {/* Filter Popover Menu */}
              {isFilterOpen && (
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 p-4 rounded-2xl bg-white border border-slate-200 shadow-xl z-30 space-y-3 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Filter className="h-3.5 w-3.5 text-[#2563EB]" />
                      Filter Wali Kelas
                    </span>
                    {(tahunAjaranFilter !== "ALL" || statusFilter !== "AKTIF") && (
                      <button
                        type="button"
                        onClick={() => {
                          setTahunAjaranFilter("ALL");
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
                      Status Penetapan
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                    >
                      <option value="ALL">Semua Status</option>
                      <option value="AKTIF">Hanya Aktif</option>
                      <option value="SELESAI">Selesai</option>
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
                    { id: "guru_asc", label: "Nama Guru (A - Z)" },
                    { id: "guru_desc", label: "Nama Guru (Z - A)" },
                    { id: "rombel_asc", label: "Rombel (A - Z)" },
                    { id: "created_desc", label: "Terbaru Ditugaskan" },
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
              title="Ekspor daftar wali kelas ke file CSV"
            >
              <Download className="h-4 w-4 text-slate-600" />
              <span>Export</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {/* + Tetapkan Wali Kelas Primary Button */}
            {canManage && (
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Tetapkan Wali Kelas</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-hidden rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/90 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="px-5 py-3.5">Rombel Binaan</th>
                <th className="px-4 py-3.5">Guru Wali Kelas</th>
                <th className="px-4 py-3.5">Tahun Ajaran</th>
                <th className="px-4 py-3.5">Jumlah Siswa</th>
                <th className="px-4 py-3.5">Masa Berlaku</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedHomerooms.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-slate-400 text-xs sm:text-sm"
                  >
                    Tidak ada data penugasan wali kelas yang cocok.
                  </td>
                </tr>
              ) : (
                paginatedHomerooms.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-slate-800 block">{h.rombel_nama}</span>
                      {h.tingkat_nama && (
                        <span className="text-[11px] text-slate-400 block">{h.tingkat_nama}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {h.guru_foto_url ? (
                          <img
                            src={h.guru_foto_url}
                            alt={h.guru_nama}
                            className="w-8 h-8 rounded-xl object-cover border border-slate-200 shadow-2xs"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2563EB] to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                            {h.guru_nama.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-slate-800 block">{h.guru_nama}</span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            NIP: {h.guru_nip || "-"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-700">
                      {h.tahun_ajaran_nama}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-[#2563EB]">
                        {h.total_siswa_rombel || 0} Siswa
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      <span>Mulai: {new Date(h.berlaku_mulai).toLocaleDateString("id-ID")}</span>
                      {h.berlaku_sampai && (
                        <span className="block text-[11px] text-slate-400">
                          Selesai: {new Date(h.berlaku_sampai).toLocaleDateString("id-ID")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                          h.status
                        )}`}
                      >
                        {h.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {canManage && h.status === "AKTIF" && (
                        <button
                          onClick={() => setClosingHomeroom(h)}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-[#2563EB] hover:bg-blue-100 transition-colors"
                        >
                          Selesaikan
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Menampilkan{" "}
            <span className="font-semibold text-slate-700">
              {filteredHomerooms.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}
            </span>{" "}
            sampai{" "}
            <span className="font-semibold text-slate-700">
              {Math.min(currentPage * rowsPerPage, filteredHomerooms.length)}
            </span>{" "}
            dari <span className="font-semibold text-slate-700">{filteredHomerooms.length}</span>{" "}
            wali kelas
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

      {/* Modal: Tetapkan Wali Kelas Baru */}
      {isCreateOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <Plus className="h-4 w-4 text-[#2563EB]" />
                  Tetapkan Wali Kelas
                </h3>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Tahun Ajaran *
                  </label>
                  <select
                    name="tahun_ajaran_id"
                    value={selectedTahunAjaran}
                    onChange={(e) => setSelectedTahunAjaran(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                  >
                    {academicYears.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Pilih Rombongan Belajar (Kelas) *
                  </label>
                  <select
                    name="rombel_id"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                  >
                    <option value="">-- Pilih Rombel --</option>
                    {availableRombelsForForm.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nama} {r.tingkat_nama ? `(${r.tingkat_nama})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Pilih Guru Wali Kelas *
                  </label>
                  <select
                    name="guru_id"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                  >
                    <option value="">-- Pilih Guru --</option>
                    {teachers
                      .filter((t) => t.status_aktif)
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nama_dengan_gelar} (NIP: {t.nip || "-"})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Catatan Penugasan
                  </label>
                  <input
                    name="catatan"
                    placeholder="Contoh: SK Penetapan Wali Kelas No..."
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
                    {isPending ? "Menetapkan..." : "Tetapkan Wali Kelas"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Modal: Selesaikan Wali Kelas */}
      {closingHomeroom &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-50 text-[#2563EB]">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    Selesaikan Tugas Wali Kelas
                  </h3>
                  <p className="text-xs text-slate-500">
                    Wali Kelas {closingHomeroom.rombel_nama} ({closingHomeroom.guru_nama})
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tandai penugasan wali kelas untuk <strong>{closingHomeroom.guru_nama}</strong> pada
                rombel <strong>{closingHomeroom.rombel_nama}</strong> sebagai{" "}
                <strong>SELESAI</strong>. Rombel tersebut akan berstatus terbuka untuk penetapan
                wali kelas baru.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setClosingHomeroom(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  onClick={handleCloseSubmit}
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs disabled:opacity-50"
                >
                  {isPending ? "Memproses..." : "Ya, Selesaikan"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
