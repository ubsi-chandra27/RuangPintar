"use client";
/* eslint-disable @next/next/no-img-element */

/**
 * Ruang Pintar — M08 Teaching Assignments Management View (Academic Glass UI v1.2)
 *
 * Features:
 * - Checkbox Multi-Select & Bulk Actions (Arsipkan, Selesaikan, Hapus Permanen, Batal Pilih)
 * - Posisi [CHECKBOX] [FOTO] [IDENTITAS]
 * - Avatar Guru 44px rounded-full object-cover shrink-0 aspect-square tanpa distorsi
 * - Filter Status: Aktif (default), Nonaktif, Arsip, Semua
 * - Domain-safe deletion: jika penugasan memiliki histori akademik (jadwal, sesi KBM), hard delete dilarang dan diarahkan ke Arsip
 * - Smart Grouped Matrix View & Detailed Flat Table View
 */

import React, { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Edit2,
  CheckCircle2,
  Download,
  X,
  Layers,
  ChevronLeft,
  ChevronRight,
  Filter,
  ChevronDown,
  RotateCcw,
  ArrowUpDown,
  LayoutGrid,
  List,
  Sparkles,
  Archive,
  Trash2,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import { createPortal } from "react-dom";
import {
  archiveTeachingAssignmentAction,
  bulkDeleteTeachingAssignmentsAction,
  bulkTeachingAssignmentLifecycleAction,
  closeTeachingAssignmentAction,
  createBulkTeachingAssignmentsAction,
  deleteTeachingAssignmentAction,
  restoreTeachingAssignmentAction,
  updateTeachingAssignmentAction,
} from "@/app/actions/teacher-actions";
import {
  StatusPenugasan,
  SubjectDTO,
  TeacherProfileDTO,
  TeachingAssignmentDTO,
} from "../domain/teacher-types";
import { Toast, ToastType } from "@/shared/components/ui/toast";

interface TeachingAssignmentsViewProps {
  initialAssignments: TeachingAssignmentDTO[];
  teachers: TeacherProfileDTO[];
  subjects: SubjectDTO[];
  academicYears: Array<{ id: string; nama: string; status: string }>;
  semesters: Array<{ id: string; nama: string; tahun_ajaran_id: string; status: string }>;
  rombels: Array<{
    id: string;
    nama: string;
    tingkat_nama?: string | null;
    tahun_ajaran_id: string;
  }>;
  canManage: boolean;
}

interface GroupedAssignment {
  key: string;
  guru_id: string;
  guru_nama: string;
  guru_nip?: string | null;
  guru_foto_url?: string | null;
  mata_pelajaran_id: string;
  mata_pelajaran_kode: string;
  mata_pelajaran_nama: string;
  tahun_ajaran_id: string;
  tahun_ajaran_nama: string;
  semester_nama?: string | null;
  status: string;
  rombels: Array<{
    assignment_id: string;
    rombel_id: string;
    rombel_nama: string;
    tingkat_nama?: string | null;
    jam: number;
    status: string;
    bisa_hapus_permanen?: boolean;
    jumlah_histori_akademik?: number;
    catatan?: string | null;
  }>;
  jam_per_rombel: number;
  total_jam: number;
}

export function TeachingAssignmentsView({
  initialAssignments,
  teachers,
  subjects,
  academicYears,
  semesters,
  rombels,
  canManage,
}: TeachingAssignmentsViewProps) {
  const router = useRouter();
  const assignments = initialAssignments;

  // View mode: 'grouped' (default) vs 'detailed'
  const [viewMode, setViewMode] = useState<"grouped" | "detailed">("grouped");

  const [searchQuery, setSearchQuery] = useState("");
  const [tahunAjaranFilter, setTahunAjaranFilter] = useState("ALL");
  const [rombelFilter, setRombelFilter] = useState("ALL");
  // Status filter: AKTIF (default), NONAKTIF, ARSIP, ALL
  const [statusFilter, setStatusFilter] = useState("AKTIF");
  const [sortBy, setSortBy] = useState("guru_asc");
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

  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState(
    academicYears.find((t) => t.status === "AKTIF")?.id || academicYears[0]?.id || ""
  );

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<TeachingAssignmentDTO | null>(null);
  const [closingAssignment, setClosingAssignment] = useState<TeachingAssignmentDTO | null>(null);
  const [deletingAssignment, setDeletingAssignment] = useState<TeachingAssignmentDTO | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // Bulk creation state
  const [selectedRombelIds, setSelectedRombelIds] = useState<string[]>([]);
  const [jamPerRombel, setJamPerRombel] = useState<number>(2);

  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Metrics
  const activeAssignments = assignments.filter((a) => a.status === "AKTIF");
  const totalJamAktif = activeAssignments.reduce((acc, a) => acc + a.jumlah_jam_minggu, 0);
  const uniqueTeachers = new Set(activeAssignments.map((a) => a.guru_id));
  const uniqueRombels = new Set(activeAssignments.map((a) => a.rombel_id));

  // Filter assignments
  const filteredAssignments = assignments.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      a.guru_nama.toLowerCase().includes(q) ||
      a.mata_pelajaran_nama.toLowerCase().includes(q) ||
      a.mata_pelajaran_kode.toLowerCase().includes(q) ||
      a.rombel_nama.toLowerCase().includes(q);

    const matchesTA = tahunAjaranFilter === "ALL" || a.tahun_ajaran_id === tahunAjaranFilter;
    const matchesRombel = rombelFilter === "ALL" || a.rombel_id === rombelFilter;

    let matchesStatus = false;
    if (statusFilter === "ALL") {
      matchesStatus = true;
    } else if (statusFilter === "AKTIF") {
      matchesStatus = a.status === "AKTIF";
    } else if (statusFilter === "NONAKTIF") {
      matchesStatus =
        a.status === "NONAKTIF" || a.status === "SELESAI" || a.status === "DIBATALKAN";
    } else if (statusFilter === "ARSIP") {
      matchesStatus = a.status === "ARSIP";
    }

    return matchesSearch && matchesTA && matchesRombel && matchesStatus;
  });

  // Group assignments by (guru_id + mata_pelajaran_id + tahun_ajaran_id + semester_id + status)
  const groupedMap = new Map<string, GroupedAssignment>();
  filteredAssignments.forEach((a) => {
    const key = `${a.guru_id}_${a.mata_pelajaran_id}_${a.tahun_ajaran_id}_${a.semester_id || "ALL"}_${a.status}`;
    if (!groupedMap.has(key)) {
      groupedMap.set(key, {
        key,
        guru_id: a.guru_id,
        guru_nama: a.guru_nama,
        guru_nip: a.guru_nip,
        guru_foto_url: a.guru_foto_url,
        mata_pelajaran_id: a.mata_pelajaran_id,
        mata_pelajaran_kode: a.mata_pelajaran_kode,
        mata_pelajaran_nama: a.mata_pelajaran_nama,
        tahun_ajaran_id: a.tahun_ajaran_id,
        tahun_ajaran_nama: a.tahun_ajaran_nama,
        semester_nama: a.semester_nama,
        status: a.status,
        rombels: [],
        jam_per_rombel: a.jumlah_jam_minggu,
        total_jam: 0,
      });
    }

    const group = groupedMap.get(key)!;
    group.rombels.push({
      assignment_id: a.id,
      rombel_id: a.rombel_id,
      rombel_nama: a.rombel_nama,
      tingkat_nama: a.tingkat_nama,
      jam: a.jumlah_jam_minggu,
      status: a.status,
      bisa_hapus_permanen: a.bisa_hapus_permanen,
      jumlah_histori_akademik: a.jumlah_histori_akademik,
      catatan: a.catatan,
    });
    group.total_jam += a.jumlah_jam_minggu;
    group.jam_per_rombel = a.jumlah_jam_minggu;
  });

  const groupedAssignments = Array.from(groupedMap.values());

  // Sort logic
  const sortedDetailedAssignments = [...filteredAssignments].sort((a, b) => {
    switch (sortBy) {
      case "guru_asc":
        return a.guru_nama.localeCompare(b.guru_nama, "id");
      case "guru_desc":
        return b.guru_nama.localeCompare(a.guru_nama, "id");
      case "mapel_asc":
        return a.mata_pelajaran_nama.localeCompare(b.mata_pelajaran_nama, "id");
      case "rombel_asc":
        return a.rombel_nama.localeCompare(b.rombel_nama, "id");
      case "jam_desc":
        return b.jumlah_jam_minggu - a.jumlah_jam_minggu;
      default:
        return a.guru_nama.localeCompare(b.guru_nama, "id");
    }
  });

  const sortedGroupedAssignments = [...groupedAssignments].sort((a, b) => {
    switch (sortBy) {
      case "guru_asc":
        return a.guru_nama.localeCompare(b.guru_nama, "id");
      case "guru_desc":
        return b.guru_nama.localeCompare(a.guru_nama, "id");
      case "mapel_asc":
        return a.mata_pelajaran_nama.localeCompare(b.mata_pelajaran_nama, "id");
      case "jam_desc":
        return b.total_jam - a.total_jam;
      default:
        return a.guru_nama.localeCompare(b.guru_nama, "id");
    }
  });

  const activeDatasetLength =
    viewMode === "grouped" ? sortedGroupedAssignments.length : sortedDetailedAssignments.length;
  const totalPages = Math.ceil(activeDatasetLength / rowsPerPage) || 1;

  const paginatedGrouped = sortedGroupedAssignments.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const paginatedDetailed = sortedDetailedAssignments.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Indeterminate logic for Select All in Detailed Mode
  const isAllDetailedSelected =
    paginatedDetailed.length > 0 && paginatedDetailed.every((a) => selectedIds.has(a.id));
  const isDetailedIndeterminate =
    paginatedDetailed.some((a) => selectedIds.has(a.id)) && !isAllDetailedSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isDetailedIndeterminate;
    }
  }, [isDetailedIndeterminate]);

  const handleToggleSelectAll = () => {
    if (isAllDetailedSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedDetailed.forEach((a) => next.delete(a.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedDetailed.forEach((a) => next.add(a.id));
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

  const handleToggleGroup = (group: GroupedAssignment) => {
    const groupAssignmentIds = group.rombels.map((r) => r.assignment_id);
    const allInGroupSelected = groupAssignmentIds.every((id) => selectedIds.has(id));

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allInGroupSelected) {
        groupAssignmentIds.forEach((id) => next.delete(id));
      } else {
        groupAssignmentIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const availableRombelsForForm = rombels.filter(
    (r) => !selectedTahunAjaran || r.tahun_ajaran_id === selectedTahunAjaran
  );
  const availableSemestersForForm = semesters.filter(
    (s) => !selectedTahunAjaran || s.tahun_ajaran_id === selectedTahunAjaran
  );

  const rombelsByTingkat = availableRombelsForForm.reduce<Record<string, typeof rombels>>(
    (acc, r) => {
      const key = r.tingkat_nama || "Lainnya";
      if (!acc[key]) acc[key] = [];
      acc[key].push(r);
      return acc;
    },
    {}
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AKTIF":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "SELESAI":
        return "bg-blue-50 text-[#2563EB] border-blue-200";
      case "ARSIP":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "DIBATALKAN":
      case "NONAKTIF":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const handleExportCSV = () => {
    if (filteredAssignments.length === 0) {
      setToast({ message: "Tidak ada data penugasan untuk diekspor.", type: "error" });
      return;
    }

    const headers = [
      "No",
      "Guru Pengajar",
      "NIP Guru",
      "Kode Mapel",
      "Mata Pelajaran",
      "Rombel",
      "Tingkat",
      "Tahun Ajaran",
      "Semester",
      "Beban Jam (JP)",
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

    const rows = filteredAssignments.map((a, idx) => [
      idx + 1,
      escapeCsv(a.guru_nama),
      escapeCsv(a.guru_nip || "-"),
      escapeCsv(a.mata_pelajaran_kode),
      escapeCsv(a.mata_pelajaran_nama),
      escapeCsv(a.rombel_nama),
      escapeCsv(a.tingkat_nama || "-"),
      escapeCsv(a.tahun_ajaran_nama),
      escapeCsv(a.semester_nama || "Semua Semester"),
      escapeCsv(a.jumlah_jam_minggu),
      escapeCsv(a.status),
      escapeCsv(new Date(a.berlaku_mulai).toLocaleDateString("id-ID")),
      escapeCsv(a.berlaku_sampai ? new Date(a.berlaku_sampai).toLocaleDateString("id-ID") : "-"),
      escapeCsv(a.catatan || "-"),
    ]);

    const delimiter = ";";
    const csvContent =
      "\uFEFF" + [headers.join(delimiter), ...rows.map((r) => r.join(delimiter))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `penugasan_mengajar_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToast({
      message: `Berhasil mengekspor ${filteredAssignments.length} penugasan mengajar ke CSV.`,
      type: "success",
    });
  };

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedRombelIds.length === 0) {
      setToast({ message: "Pilih minimal 1 rombongan belajar / kelas target.", type: "error" });
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.delete("rombel_ids");
    selectedRombelIds.forEach((id) => formData.append("rombel_ids", id));

    startTransition(async () => {
      const res = await createBulkTeachingAssignmentsAction(null, formData);
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        setIsCreateOpen(false);
        setSelectedRombelIds([]);
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
      const res = await updateTeachingAssignmentAction(null, formData);
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        setEditingAssignment(null);
        router.refresh();
      } else {
        setToast({ message: res.message, type: "error" });
      }
    });
  };

  const handleCloseSubmit = () => {
    if (!closingAssignment) return;
    startTransition(async () => {
      const res = await closeTeachingAssignmentAction(closingAssignment.id, "SELESAI");
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        setClosingAssignment(null);
        router.refresh();
      } else {
        setToast({ message: res.message, type: "error" });
      }
    });
  };

  const handleDeleteSubmit = () => {
    if (!deletingAssignment) return;
    startTransition(async () => {
      const res = await deleteTeachingAssignmentAction(deletingAssignment.id);
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        setDeletingAssignment(null);
        router.refresh();
      } else {
        setToast({ message: res.message, type: "error" });
      }
    });
  };

  const handleArchiveSubmit = (id?: string) => {
    const targetId = id || deletingAssignment?.id;
    if (!targetId) return;
    startTransition(async () => {
      const res = await archiveTeachingAssignmentAction(targetId);
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        setDeletingAssignment(null);
        router.refresh();
      } else {
        setToast({ message: res.message, type: "error" });
      }
    });
  };

  const handleRestoreSubmit = (id: string) => {
    startTransition(async () => {
      const res = await restoreTeachingAssignmentAction(id);
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        router.refresh();
      } else {
        setToast({ message: res.message, type: "error" });
      }
    });
  };

  // Bulk actions
  const handleBulkArchive = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    startTransition(async () => {
      const res = await bulkTeachingAssignmentLifecycleAction(ids, "ARSIP");
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        handleClearSelection();
        router.refresh();
      } else {
        setToast({ message: res.message, type: "error" });
      }
    });
  };

  const handleBulkClose = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    startTransition(async () => {
      const res = await bulkTeachingAssignmentLifecycleAction(ids, "SELESAI");
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
      const res = await bulkDeleteTeachingAssignmentsAction(ids);
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

  const handleToggleRombel = (id: string) => {
    setSelectedRombelIds((prev) =>
      prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id]
    );
  };

  const handleSelectAllInTingkat = (tingkatRombels: Array<{ id: string }>) => {
    const ids = tingkatRombels.map((r) => r.id);
    const allSelected = ids.every((id) => selectedRombelIds.includes(id));
    if (allSelected) {
      setSelectedRombelIds((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedRombelIds((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  const handleSelectAll = () => {
    if (selectedRombelIds.length === availableRombelsForForm.length) {
      setSelectedRombelIds([]);
    } else {
      setSelectedRombelIds(availableRombelsForForm.map((r) => r.id));
    }
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

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block">Penugasan Aktif</span>
          <span className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            {activeAssignments.length}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Penugasan Terdaftar</span>
        </div>
        <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block">
            Total Beban Jam (JP)
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#2563EB] tracking-tight">
            {totalJamAktif} JP
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Beban Jam / Minggu</span>
        </div>
        <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block">Pendidik Bertugas</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight">
            {uniqueTeachers.size}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Guru Mengajar Aktif</span>
        </div>
        <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block">Kelas Terlayani</span>
          <span className="text-xl sm:text-2xl font-black text-indigo-600 tracking-tight">
            {uniqueRombels.size}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Rombel Belajar Terjadwal</span>
        </div>
      </div>

      {/* Table Toolbar */}
      <div
        data-testid="teaching-assignment-toolbar"
        className="relative z-20 p-3 sm:p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-sm space-y-3"
      >
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search guru, mata pelajaran, rombel..."
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Controls: Mode Switcher + Popovers + Actions */}
          <div className="flex items-center gap-2 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0">
            {/* View Mode Switcher Toggle */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grouped")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "grouped"
                    ? "bg-white text-[#2563EB] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Tampilan Terkelompok per Guru & Mapel"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Terkelompok</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("detailed")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "detailed"
                    ? "bg-white text-[#2563EB] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Tampilan Rinci per Rombel (Flat Table)"
              >
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Tabel Rinci</span>
              </button>
            </div>

            {/* Filter Popover Button */}
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => {
                  setIsFilterOpen(!isFilterOpen);
                  setIsSortOpen(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border font-semibold text-xs sm:text-sm shadow-2xs transition-colors cursor-pointer shrink-0 ${
                  tahunAjaranFilter !== "ALL" || rombelFilter !== "ALL" || statusFilter !== "AKTIF"
                    ? "border-blue-300 bg-blue-50/70 text-[#2563EB]"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                }`}
              >
                <Filter
                  className={`h-4 w-4 ${
                    tahunAjaranFilter !== "ALL" ||
                    rombelFilter !== "ALL" ||
                    statusFilter !== "AKTIF"
                      ? "text-[#2563EB]"
                      : "text-slate-600"
                  }`}
                />
                <span>Filter</span>
                {(tahunAjaranFilter !== "ALL" ||
                  rombelFilter !== "ALL" ||
                  statusFilter !== "AKTIF") && (
                  <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                )}
              </button>

              {/* Filter Popover Menu */}
              {isFilterOpen && (
                <div
                  data-testid="teaching-assignment-filter-popover"
                  className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] p-4 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 space-y-3 animate-in fade-in zoom-in-95"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Filter className="h-3.5 w-3.5 text-[#2563EB]" />
                      Filter Penugasan Mengajar
                    </span>
                    {(tahunAjaranFilter !== "ALL" ||
                      rombelFilter !== "ALL" ||
                      statusFilter !== "AKTIF") && (
                      <button
                        type="button"
                        onClick={() => {
                          setTahunAjaranFilter("ALL");
                          setRombelFilter("ALL");
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
                      Rombongan Belajar (Rombel)
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
                          {r.nama} {r.tingkat_nama ? `(${r.tingkat_nama})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Status Penugasan
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                    >
                      <option value="AKTIF">Aktif (Default)</option>
                      <option value="NONAKTIF">Nonaktif / Selesai</option>
                      <option value="ARSIP">Arsip</option>
                      <option value="ALL">Semua Status</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Sort Popover Button */}
            <div className="relative" ref={sortRef}>
              <button
                type="button"
                onClick={() => {
                  setIsSortOpen(!isSortOpen);
                  setIsFilterOpen(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border font-semibold text-xs sm:text-sm shadow-2xs transition-colors cursor-pointer shrink-0 ${
                  sortBy !== "guru_asc"
                    ? "border-blue-300 bg-blue-50/70 text-[#2563EB]"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                }`}
              >
                <ArrowUpDown
                  className={`h-4 w-4 ${
                    sortBy !== "guru_asc" ? "text-[#2563EB]" : "text-slate-600"
                  }`}
                />
                <span className="hidden sm:inline">Urutkan</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {/* Sort Popover Menu */}
              {isSortOpen && (
                <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] p-2 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 space-y-1 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Pilihan Urutan
                  </div>
                  {[
                    { id: "guru_asc", label: "Nama Guru (A - Z)" },
                    { id: "guru_desc", label: "Nama Guru (Z - A)" },
                    { id: "mapel_asc", label: "Mata Pelajaran (A - Z)" },
                    { id: "jam_desc", label: "Beban Jam Terbesar" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSortBy(s.id);
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer ${
                        sortBy === s.id
                          ? "bg-blue-50 text-[#2563EB]"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span>{s.label}</span>
                      {sortBy === s.id && <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-2xs transition-colors cursor-pointer shrink-0"
              title="Ekspor data penugasan ke format CSV"
            >
              <Download className="h-4 w-4 text-slate-600" />
              <span className="hidden sm:inline">Ekspor CSV</span>
            </button>

            {/* Primary Action: Tetapkan Penugasan */}
            {canManage && (
              <button
                onClick={() => {
                  setSelectedRombelIds([]);
                  setJamPerRombel(2);
                  setIsCreateOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all cursor-pointer shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>+ Tetapkan Penugasan</span>
              </button>
            )}
          </div>
        </div>

        {/* Info Banner when in Grouped Mode */}
        {viewMode === "grouped" && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-[#2563EB]">
            <Sparkles className="h-4 w-4 shrink-0 text-blue-600" />
            <span>
              <strong>Mode Terkelompok Aktif:</strong> Penugasan guru untuk mata pelajaran yang sama
              dirangkum dalam 1 baris beserta daftar badge kelas dan total jam pelajaran (JP).
            </span>
          </div>
        )}
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <div
          data-testid="bulk-toolbar"
          className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:px-5 rounded-2xl bg-slate-900/90 backdrop-blur-md text-white border border-slate-700/80 shadow-xl animate-in fade-in slide-in-from-top-2"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold">
              {selectedIds.size} penugasan dipilih
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {canManage && (
              <>
                <button
                  type="button"
                  onClick={handleBulkArchive}
                  disabled={isPending}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600/90 hover:bg-purple-600 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  title="Arsipkan penugasan terpilih"
                >
                  <Archive className="h-3.5 w-3.5" />
                  <span>Arsipkan</span>
                </button>
                <button
                  type="button"
                  onClick={handleBulkClose}
                  disabled={isPending}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600/90 hover:bg-blue-600 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  title="Tandai penugasan terpilih sebagai selesai"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Selesaikan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsBulkDeleteOpen(true)}
                  disabled={isPending}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  title="Hapus permanen penugasan terpilih"
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

      {/* Main Table View */}
      <div className="relative z-0 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* ========================================================================= */}
        {/* 1. GROUPED MATRIX TABLE (DEFAULT) */}
        {/* ========================================================================= */}
        {viewMode === "grouped" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="w-12 px-4 py-3.5 text-center">Pilih</th>
                  <th className="px-5 py-3.5">Guru Pengajar</th>
                  <th className="px-4 py-3.5">Mata Pelajaran</th>
                  <th className="px-4 py-3.5 min-w-[280px]">Rombel yang Diampu (Kelas)</th>
                  <th className="px-4 py-3.5">Periode</th>
                  <th className="px-4 py-3.5">Beban Jam</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedGrouped.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                      <Layers className="h-10 w-10 mx-auto mb-2 opacity-40 text-slate-400" />
                      <p className="font-semibold text-slate-600">
                        Tidak ada penugasan mengajar yang cocok dengan filter
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedGrouped.map((g) => {
                    const groupAssignmentIds = g.rombels.map((r) => r.assignment_id);
                    const allInGroupSelected =
                      groupAssignmentIds.length > 0 &&
                      groupAssignmentIds.every((id) => selectedIds.has(id));
                    const someInGroupSelected =
                      groupAssignmentIds.some((id) => selectedIds.has(id)) && !allInGroupSelected;

                    return (
                      <tr key={g.key} className="hover:bg-blue-50/30 transition-colors group">
                        {/* Group Checkbox */}
                        <td className="w-12 px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            aria-label={`Pilih paket penugasan ${g.guru_nama} - ${g.mata_pelajaran_nama}`}
                            checked={allInGroupSelected}
                            ref={(el) => {
                              if (el) el.indeterminate = someInGroupSelected;
                            }}
                            onChange={() => handleToggleGroup(g)}
                            className="w-4 h-4 rounded text-[#2563EB] border-slate-300 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>

                        {/* Kolom 1: Guru Pengajar [FOTO] [IDENTITAS] */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {g.guru_foto_url ? (
                              <img
                                src={g.guru_foto_url}
                                alt={g.guru_nama}
                                className="w-11 h-11 rounded-full object-cover shrink-0 aspect-square border border-slate-200 shadow-2xs"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#2563EB] to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 aspect-square shadow-2xs">
                                {g.guru_nama.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <span className="font-bold text-slate-800 block text-xs sm:text-sm">
                                {g.guru_nama}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                NIP: {g.guru_nip || "-"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Kolom 2: Mata Pelajaran */}
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <span className="font-bold text-slate-800 block">
                              {g.mata_pelajaran_nama}
                            </span>
                            <span className="font-mono text-[10px] font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block">
                              {g.mata_pelajaran_kode}
                            </span>
                          </div>
                        </td>

                        {/* Kolom 3: Rombel Pills */}
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {g.rombels.map((r) => {
                              const isRombelSelected = selectedIds.has(r.assignment_id);
                              return (
                                <button
                                  key={r.assignment_id}
                                  type="button"
                                  onClick={() => handleToggleRow(r.assignment_id)}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                    isRombelSelected
                                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                      : "bg-white text-slate-700 border-slate-200 hover:border-blue-400"
                                  }`}
                                  title={`Klik untuk memilih kelas ${r.rombel_nama}`}
                                >
                                  <span>{r.rombel_nama}</span>
                                  <span
                                    className={`text-[10px] font-mono px-1 rounded ${
                                      isRombelSelected
                                        ? "bg-blue-700 text-blue-100"
                                        : "bg-slate-100 text-slate-500"
                                    }`}
                                  >
                                    {r.jam} JP
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </td>

                        {/* Kolom 4: Periode */}
                        <td className="px-4 py-4">
                          <span className="font-semibold text-slate-700 block">
                            {g.tahun_ajaran_nama}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            {g.semester_nama || "Semua Semester"}
                          </span>
                        </td>

                        {/* Kolom 5: Beban Jam */}
                        <td className="px-4 py-4">
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-[#2563EB] block text-sm sm:text-base">
                              {g.total_jam} JP
                            </span>
                            <span className="text-[10px] text-slate-400 block font-medium">
                              (@ {g.jam_per_rombel} JP / kelas)
                            </span>
                          </div>
                        </td>

                        {/* Kolom 6: Status */}
                        <td className="px-4 py-4">
                          <span
                            className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                              g.status
                            )}`}
                          >
                            {g.status}
                          </span>
                        </td>

                        {/* Kolom 7: Aksi */}
                        <td className="px-5 py-4 text-right">
                          {canManage && (
                            <div className="flex items-center justify-end gap-1">
                              {g.status === "ARSIP" ? (
                                <button
                                  onClick={() => {
                                    g.rombels.forEach((r) => handleRestoreSubmit(r.assignment_id));
                                  }}
                                  className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                                  title="Pulihkan Semua Penugasan dalam Paket ini"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      const firstA = assignments.find(
                                        (a) => a.id === g.rombels[0]?.assignment_id
                                      );
                                      if (firstA) setEditingAssignment(firstA);
                                    }}
                                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                                    title="Edit Penugasan"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  {g.status === "AKTIF" && (
                                    <button
                                      onClick={() => {
                                        const firstA = assignments.find(
                                          (a) => a.id === g.rombels[0]?.assignment_id
                                        );
                                        if (firstA) setClosingAssignment(firstA);
                                      }}
                                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                      title="Selesaikan Penugasan"
                                    >
                                      <CheckCircle2 className="h-4 w-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      const firstA = assignments.find(
                                        (a) => a.id === g.rombels[0]?.assignment_id
                                      );
                                      if (firstA) setDeletingAssignment(firstA);
                                    }}
                                    className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                                    title="Opsi Hapus / Arsipkan"
                                  >
                                    <Archive className="h-4 w-4" />
                                  </button>
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
        )}

        {/* ========================================================================= */}
        {/* 2. DETAILED FLAT TABLE (OPTIONAL TOGGLE) */}
        {/* ========================================================================= */}
        {viewMode === "detailed" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {/* Checkbox Select All */}
                  <th className="w-12 px-4 py-3.5 text-center">
                    <input
                      type="checkbox"
                      ref={selectAllRef}
                      aria-label="Pilih semua penugasan"
                      checked={isAllDetailedSelected}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded text-[#2563EB] border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  {/* [CHECKBOX] [FOTO] [IDENTITAS] */}
                  <th className="px-5 py-3.5">Guru Pengajar</th>
                  <th className="px-4 py-3.5">Mata Pelajaran</th>
                  <th className="px-4 py-3.5">Rombel</th>
                  <th className="px-4 py-3.5">Periode</th>
                  <th className="px-4 py-3.5">Beban Jam</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedDetailed.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                      <Layers className="h-10 w-10 mx-auto mb-2 opacity-40 text-slate-400" />
                      <p className="font-semibold text-slate-600">
                        Tidak ada data penugasan ditemukan
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedDetailed.map((a) => {
                    const isSelected = selectedIds.has(a.id);
                    return (
                      <tr
                        key={a.id}
                        className={`hover:bg-blue-50/30 transition-colors group ${
                          isSelected ? "bg-blue-50/40" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="w-12 px-4 py-3.5 text-center">
                          <input
                            type="checkbox"
                            aria-label={`Pilih penugasan ${a.guru_nama} - ${a.mata_pelajaran_nama} di ${a.rombel_nama}`}
                            checked={isSelected}
                            onChange={() => handleToggleRow(a.id)}
                            className="w-4 h-4 rounded text-[#2563EB] border-slate-300 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>

                        {/* [FOTO] [IDENTITAS GURU] */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {a.guru_foto_url ? (
                              <img
                                src={a.guru_foto_url}
                                alt={a.guru_nama}
                                className="w-11 h-11 rounded-full object-cover shrink-0 aspect-square border border-slate-200 shadow-2xs"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#2563EB] to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 aspect-square shadow-2xs">
                                {a.guru_nama.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <span className="font-bold text-slate-800 block">{a.guru_nama}</span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                NIP: {a.guru_nip || "-"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800">
                              {a.mata_pelajaran_nama}
                            </span>
                            <span className="font-mono text-[10px] font-bold text-[#2563EB] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                              {a.mata_pelajaran_kode}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="font-bold text-slate-800 block">{a.rombel_nama}</span>
                          {a.tingkat_nama && (
                            <span className="text-[11px] text-slate-400 block">
                              {a.tingkat_nama}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-slate-700 block">
                            {a.tahun_ajaran_nama}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            {a.semester_nama || "Semua Semester"}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="font-extrabold text-[#2563EB] block text-xs sm:text-sm">
                            {a.jumlah_jam_minggu} JP
                          </span>
                          <span className="text-[10px] text-slate-400">per minggu</span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                              a.status
                            )}`}
                          >
                            {a.status}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          {canManage && (
                            <div className="flex items-center justify-end gap-1">
                              {a.status === "ARSIP" ? (
                                <button
                                  onClick={() => handleRestoreSubmit(a.id)}
                                  className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                                  title="Pulihkan Penugasan ke Aktif"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => setEditingAssignment(a)}
                                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                                    title="Edit Beban Jam / Catatan"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>

                                  {a.status === "AKTIF" && (
                                    <button
                                      onClick={() => setClosingAssignment(a)}
                                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                      title="Tutup / Selesaikan Penugasan"
                                    >
                                      <CheckCircle2 className="h-4 w-4" />
                                    </button>
                                  )}

                                  {a.bisa_hapus_permanen ? (
                                    <button
                                      onClick={() => setDeletingAssignment(a)}
                                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                                      title="Hapus Penugasan"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => setDeletingAssignment(a)}
                                      className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                                      title="Arsipkan Penugasan (Memiliki Histori Akademik)"
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
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Menampilkan{" "}
            <span className="font-semibold text-slate-700">
              {activeDatasetLength > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}
            </span>{" "}
            sampai{" "}
            <span className="font-semibold text-slate-700">
              {Math.min(currentPage * rowsPerPage, activeDatasetLength)}
            </span>{" "}
            dari <span className="font-semibold text-slate-700">{activeDatasetLength}</span>{" "}
            {viewMode === "grouped" ? "paket penugasan terkelompok" : "penugasan kelas"}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 font-semibold">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: TETAPKAN PENUGASAN MENGAJAR */}
      {isCreateOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                    <Plus className="h-4 w-4 text-[#2563EB]" />
                    Tetapkan Penugasan Mengajar
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mendukung penugasan multi-rombel (misal: 10 kelas sekaligus) dalam 1 kali
                    simpan.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
                {/* 1. Pilih Guru */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Pilih Guru Pengajar *
                  </label>
                  <select
                    name="guru_id"
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
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

                {/* 2. Pilih Mapel */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Pilih Mata Pelajaran *
                  </label>
                  <select
                    name="mata_pelajaran_id"
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                  >
                    <option value="">-- Pilih Mata Pelajaran --</option>
                    {subjects
                      .filter((s) => s.status_aktif)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          [{s.kode}] {s.nama} ({s.kelompok || "UMUM"})
                        </option>
                      ))}
                  </select>
                </div>

                {/* 3. Periode & Beban Jam per Kelas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Tahun Ajaran *
                    </label>
                    <select
                      name="tahun_ajaran_id"
                      value={selectedTahunAjaran}
                      onChange={(e) => setSelectedTahunAjaran(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs"
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
                      Semester (Opsional)
                    </label>
                    <select
                      name="semester_id"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs"
                    >
                      <option value="">Semua Semester (1 Tahun Penuh)</option>
                      {availableSemestersForForm.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Beban Jam / Rombel (JP) *
                    </label>
                    <input
                      type="number"
                      name="jumlah_jam_minggu"
                      min={1}
                      max={40}
                      value={jamPerRombel}
                      onChange={(e) => setJamPerRombel(Number(e.target.value) || 1)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs font-bold text-[#2563EB] focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                    />
                  </div>
                </div>

                {/* 4. Multi-Select Rombel Checklist */}
                <div className="space-y-2 pt-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Pilih Rombongan Belajar (Kelas Target) *
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="text-[11px] font-bold text-[#2563EB] bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        {selectedRombelIds.length === availableRombelsForForm.length
                          ? "Batal Semua"
                          : "Pilih Semua"}
                      </button>
                      {Object.keys(rombelsByTingkat).map((tingkat) => (
                        <button
                          key={tingkat}
                          type="button"
                          onClick={() => handleSelectAllInTingkat(rombelsByTingkat[tingkat])}
                          className="text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          + {tingkat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="max-h-48 overflow-y-auto p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    {Object.keys(rombelsByTingkat).length === 0 ? (
                      <p className="text-xs text-slate-400 italic">
                        Tidak ada data rombel aktif pada tahun ajaran ini.
                      </p>
                    ) : (
                      Object.keys(rombelsByTingkat).map((tingkat) => (
                        <div key={tingkat} className="space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Tingkat: {tingkat}
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {rombelsByTingkat[tingkat].map((r) => {
                              const isChecked = selectedRombelIds.includes(r.id);
                              return (
                                <button
                                  key={r.id}
                                  type="button"
                                  onClick={() => handleToggleRombel(r.id)}
                                  className={`flex items-center gap-2 p-2 rounded-xl text-left border transition-all cursor-pointer ${
                                    isChecked
                                      ? "bg-blue-50 border-blue-300 text-[#2563EB]"
                                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    readOnly
                                    className="w-3.5 h-3.5 rounded text-[#2563EB] border-slate-300 focus:ring-blue-500 pointer-events-none"
                                  />
                                  <span className="text-xs font-semibold truncate">{r.nama}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 5. Live Workload Preview */}
                <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">
                    Total Rombel Dipilih: <strong>{selectedRombelIds.length}</strong>
                  </span>
                  <span className="text-[#2563EB] font-bold">
                    Kalkulasi Beban: {selectedRombelIds.length * jamPerRombel} JP / minggu
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {isPending ? "Menyimpan..." : "Simpan Penugasan"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL: EDIT PENUGASAN MENGAJAR */}
      {editingAssignment &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <Edit2 className="h-4 w-4 text-[#2563EB]" />
                  Edit Penugasan Mengajar
                </h3>
                <button
                  onClick={() => setEditingAssignment(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
                <input type="hidden" name="id" value={editingAssignment.id} />
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                  <p className="font-bold text-slate-800">{editingAssignment.guru_nama}</p>
                  <p className="text-slate-500">
                    {editingAssignment.mata_pelajaran_nama} ({editingAssignment.mata_pelajaran_kode}
                    ) • {editingAssignment.rombel_nama}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Beban Jam / Minggu (JP)
                    </label>
                    <input
                      type="number"
                      name="jumlah_jam_minggu"
                      min={1}
                      max={40}
                      defaultValue={editingAssignment.jumlah_jam_minggu}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Status Penugasan
                    </label>
                    <select
                      name="status"
                      defaultValue={editingAssignment.status}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs"
                    >
                      <option value="AKTIF">AKTIF</option>
                      <option value="SELESAI">SELESAI</option>
                      <option value="ARSIP">ARSIP</option>
                      <option value="DIBATALKAN">DIBATALKAN</option>
                      <option value="NONAKTIF">NONAKTIF</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Catatan</label>
                  <input
                    name="catatan"
                    defaultValue={editingAssignment.catatan || ""}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingAssignment(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs disabled:opacity-50 cursor-pointer"
                  >
                    {isPending ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL: SELESAIKAN PENUGASAN */}
      {closingAssignment &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-50 text-[#2563EB]">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Selesaikan Penugasan</h3>
                  <p className="text-xs text-slate-500">
                    {closingAssignment.mata_pelajaran_nama} di {closingAssignment.rombel_nama}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tandai penugasan mengajar untuk Guru <strong>{closingAssignment.guru_nama}</strong>{" "}
                sebagai <strong>SELESAI</strong>. Histori penugasan ini tetap tersimpan untuk rekam
                jejak akademik.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setClosingAssignment(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleCloseSubmit}
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? "Memproses..." : "Ya, Selesaikan"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL: HAPUS / ARSIP PENUGASAN (DOMAIN PROTECTED) */}
      {deletingAssignment &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
              {deletingAssignment.bisa_hapus_permanen ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">
                        Hapus Penugasan Mengajar
                      </h3>
                      <p className="text-xs text-slate-500">
                        {deletingAssignment.guru_nama} • {deletingAssignment.mata_pelajaran_nama} (
                        {deletingAssignment.rombel_nama})
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Penugasan ini belum memiliki jadwal atau data sesi KBM. Data penugasan akan
                    dihapus secara permanen dari sistem.
                  </p>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setDeletingAssignment(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleDeleteSubmit}
                      disabled={isPending}
                      className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs disabled:opacity-50 cursor-pointer"
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
                        {deletingAssignment.guru_nama} • {deletingAssignment.mata_pelajaran_nama} (
                        {deletingAssignment.rombel_nama})
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200 text-xs text-purple-900 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-purple-800">
                      <ShieldAlert className="h-4 w-4 text-purple-600" />
                      <span>Hard Delete Dilarang</span>
                    </div>
                    <p className="leading-relaxed">
                      Penugasan mengajar tidak dapat dihapus permanen karena memiliki histori
                      akademik ({deletingAssignment.jumlah_histori_akademik || 0} data terkait
                      jadwal atau sesi KBM). Gunakan Arsip untuk menyembunyikan dari operasional
                      tanpa merusak histori.
                    </p>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setDeletingAssignment(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Batal
                    </button>
                    {deletingAssignment.status === "AKTIF" && (
                      <button
                        onClick={() => {
                          const target = deletingAssignment;
                          setDeletingAssignment(null);
                          setClosingAssignment(target);
                        }}
                        disabled={isPending}
                        className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-semibold text-xs disabled:opacity-50 cursor-pointer"
                      >
                        Selesaikan
                      </button>
                    )}
                    <button
                      onClick={() => handleArchiveSubmit(deletingAssignment.id)}
                      disabled={isPending}
                      className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
                    >
                      {isPending ? "Mengarsipkan..." : "Arsipkan Penugasan"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* MODAL: BULK DELETE CONFIRMATION */}
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
                  <p className="text-xs text-slate-500">{selectedIds.size} penugasan dipilih</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-semibold">Perlindungan Histori Akademik Aktif:</p>
                <p className="leading-relaxed">
                  Penugasan yang belum memiliki jadwal atau sesi KBM akan dihapus permanen.
                  Penugasan yang telah memiliki histori akan otomatis dialihkan ke status{" "}
                  <strong>Arsip</strong> agar integritas data akademik tetap terjaga.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBulkDeleteOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleBulkDeleteSubmit}
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs disabled:opacity-50 cursor-pointer"
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
