"use client";
/* eslint-disable @next/next/no-img-element */

/**
 * Ruang Pintar — M07 Student Academic Lifecycle: Student Directory View
 */

import React, { useState, useTransition } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  UserCheck,
  GraduationCap,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  Filter,
  Users,
  AlertTriangle,
  X,
  Download,
  ArrowUpDown,
  Camera,
  Upload,
} from "lucide-react";
import { createPortal } from "react-dom";
import {
  createStudentAction,
  deleteStudentAction,
  graduateStudentAction,
  transferOutStudentAction,
  updateStudentAction,
} from "@/app/actions/student-actions";
import { StudentIdentityDTO } from "../domain/student-types";
import { StudentDetailModal } from "./student-detail-modal";
import { Toast, ToastType } from "@/shared/components/ui/toast";

interface StudentDirectoryViewProps {
  initialStudents: StudentIdentityDTO[];
  academicYears: Array<{ id: string; nama: string }>;
  gradeLevels: Array<{ id: string; nama: string; kode: string }>;
  rombels: Array<{ id: string; nama: string; tahun_ajaran_id: string; kapasitas: number }>;
  canManage: boolean;
}

export function StudentDirectoryView({
  initialStudents,
  academicYears,
  gradeLevels,
  rombels,
  canManage,
}: StudentDirectoryViewProps) {
  const [students] = useState<StudentIdentityDTO[]>(initialStudents);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [rombelFilter, setRombelFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("name_asc");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Photo states for forms
  const [createPhoto, setCreatePhoto] = useState<string | null>(null);
  const [editPhoto, setEditPhoto] = useState<string | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentIdentityDTO | null>(null);
  const [detailStudent, setDetailStudent] = useState<StudentIdentityDTO | null>(null);
  const [graduatingStudent, setGraduatingStudent] = useState<StudentIdentityDTO | null>(null);
  const [transferringStudent, setTransferringStudent] = useState<StudentIdentityDTO | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<StudentIdentityDTO | null>(null);

  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nisn && s.nisn.includes(searchQuery));

    const matchesStatus = statusFilter === "ALL" || s.status_akademik === statusFilter;
    const matchesRombel = rombelFilter === "ALL" || s.active_rombel_id === rombelFilter;

    return matchesSearch && matchesStatus && matchesRombel;
  });

  // Sort students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    switch (sortBy) {
      case "name_asc":
        return a.nama_lengkap.localeCompare(b.nama_lengkap, "id");
      case "name_desc":
        return b.nama_lengkap.localeCompare(a.nama_lengkap, "id");
      case "nis_asc":
        return a.nis.localeCompare(b.nis, undefined, { numeric: true });
      case "nis_desc":
        return b.nis.localeCompare(a.nis, undefined, { numeric: true });
      case "date_asc":
        return new Date(a.tanggal_masuk).getTime() - new Date(b.tanggal_masuk).getTime();
      case "date_desc":
      default:
        return new Date(b.tanggal_masuk).getTime() - new Date(a.tanggal_masuk).getTime();
    }
  });

  const totalPages = Math.ceil(sortedStudents.length / rowsPerPage) || 1;
  const paginatedStudents = sortedStudents.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setPhoto: (val: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setToast({ message: "Ukuran foto maksimal 2MB.", type: "error" });
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type)) {
      setToast({ message: "Format foto harus JPG, PNG, atau WebP.", type: "error" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhoto(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleExportCSV = () => {
    if (sortedStudents.length === 0) {
      setToast({ message: "Tidak ada data siswa untuk diekspor.", type: "error" });
      return;
    }

    const headers = [
      "No",
      "NIS",
      "NISN",
      "Nama Lengkap",
      "Jenis Kelamin",
      "Status Akademik",
      "Rombel",
      "Tingkat",
      "Nomor Absen",
      "Tempat Lahir",
      "Tanggal Lahir",
      "Agama",
      "NIK",
      "Alamat",
      "Nama Wali",
      "Telepon Wali",
      "Email Wali",
      "Tanggal Masuk",
    ];

    const escapeCsv = (val: unknown) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = sortedStudents.map((s, idx) => [
      idx + 1,
      escapeCsv(s.nis),
      escapeCsv(s.nisn || ""),
      escapeCsv(s.nama_lengkap),
      escapeCsv(s.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"),
      escapeCsv(s.status_akademik),
      escapeCsv(s.active_rombel_nama || "-"),
      escapeCsv(s.active_tingkat_nama || "-"),
      escapeCsv(s.active_nomor_absen || "-"),
      escapeCsv(s.tempat_lahir || "-"),
      escapeCsv(s.tanggal_lahir ? new Date(s.tanggal_lahir).toLocaleDateString("id-ID") : "-"),
      escapeCsv(s.agama || "-"),
      escapeCsv(s.nik || "-"),
      escapeCsv(s.alamat || "-"),
      escapeCsv(s.nama_wali || "-"),
      escapeCsv(s.telepon_wali || "-"),
      escapeCsv(s.email_wali || "-"),
      escapeCsv(new Date(s.tanggal_masuk).toLocaleDateString("id-ID")),
    ]);

    // Gunakan pemisah titik koma (;) agar Microsoft Excel (khususnya regional Indonesia/Windows) langsung otomatis memecah ke kolom A, B, C, dst.
    const delimiter = ";";
    const csvContent =
      "\uFEFF" + [headers.join(delimiter), ...rows.map((r) => r.join(delimiter))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `direktori_siswa_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToast({
      message: `Berhasil mengekspor ${sortedStudents.length} data siswa ke file CSV.`,
      type: "success",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AKTIF":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "LULUS":
        return "bg-blue-50 text-[#2563EB] border-blue-200";
      case "PINDAH":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "NONAKTIF":
      case "KELUAR":
      case "DROPOUT":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  // Form submissions
  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createStudentAction(null, formData);
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        setIsCreateOpen(false);
      } else {
        setToast({ message: res.message, type: "error" });
      }
    });
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateStudentAction(null, formData);
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        setEditingStudent(null);
      } else {
        setToast({ message: res.message, type: "error" });
      }
    });
  };

  const handleGraduateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await graduateStudentAction(null, formData);
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        setGraduatingStudent(null);
      } else {
        setToast({ message: res.message, type: "error" });
      }
    });
  };

  const handleTransferSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await transferOutStudentAction(null, formData);
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        setTransferringStudent(null);
      } else {
        setToast({ message: res.message, type: "error" });
      }
    });
  };

  const handleDeleteSubmit = () => {
    if (!deletingStudent) return;
    startTransition(async () => {
      const res = await deleteStudentAction(deletingStudent.id);
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        setDeletingStudent(null);
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

      {/* Directory Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-sm">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-[#2563EB]" />
            Buku Induk & Direktori Siswa
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Kelola data identitas individu siswa serta status akademik institusi.
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => {
              setCreatePhoto(null);
              setIsCreateOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Tambah Siswa
          </button>
        )}
      </div>

      {/* Filter, Sort & Export Toolbar */}
      <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-slate-200/80 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="sm:col-span-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama siswa, NIS, atau NISN..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="col-span-6 sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
            >
              <option value="ALL">Semua Status</option>
              <option value="AKTIF">Aktif</option>
              <option value="LULUS">Lulus</option>
              <option value="PINDAH">Pindah</option>
              <option value="NONAKTIF">Nonaktif / Keluar</option>
            </select>
          </div>

          {/* Rombel Filter */}
          <div className="col-span-6 sm:col-span-2">
            <select
              value={rombelFilter}
              onChange={(e) => {
                setRombelFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
            >
              <option value="ALL">Semua Rombel</option>
              {rombels.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="col-span-6 sm:col-span-2">
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
              >
                <option value="name_asc">Nama (A - Z)</option>
                <option value="name_desc">Nama (Z - A)</option>
                <option value="nis_asc">NIS (Terkecil)</option>
                <option value="nis_desc">NIS (Terbesar)</option>
                <option value="date_desc">Tgl Masuk (Terbaru)</option>
                <option value="date_asc">Tgl Masuk (Terlama)</option>
              </select>
            </div>
          </div>

          {/* Export CSV Button */}
          <div className="col-span-6 sm:col-span-2 flex justify-end">
            <button
              onClick={handleExportCSV}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
              title="Ekspor daftar siswa ke file CSV"
            >
              <Download className="h-4 w-4 text-[#2563EB]" />
              Ekspor CSV
            </button>
          </div>
        </div>
      </div>

      {/* Content: Mobile Cards (< 640px) */}
      <div className="block sm:hidden space-y-3">
        {paginatedStudents.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            Tidak ada data siswa yang cocok dengan filter pencarian.
          </div>
        ) : (
          paginatedStudents.map((student) => (
            <div
              key={student.id}
              className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  {student.foto_url ? (
                    <img
                      src={student.foto_url}
                      alt={student.nama_lengkap}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2563EB] to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                      {student.nama_lengkap.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                      {student.nama_lengkap}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      NIS: {student.nis} {student.nisn ? `• ${student.nisn}` : ""}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadge(
                    student.status_akademik
                  )}`}
                >
                  {student.status_akademik}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Rombel Aktif:</span>
                <span className="font-semibold text-slate-700">
                  {student.active_rombel_nama || "Belum Ditempatkan"}
                  {student.active_nomor_absen ? ` (#${student.active_nomor_absen})` : ""}
                </span>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-1 text-xs">
                <button
                  onClick={() => setDetailStudent(student)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-[#2563EB] font-semibold hover:bg-blue-100 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Detail
                </button>

                {canManage && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditPhoto(student.foto_url || null);
                        setEditingStudent(student);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                      title="Edit Siswa"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    {student.status_akademik === "AKTIF" && (
                      <>
                        <button
                          onClick={() => setTransferringStudent(student)}
                          className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Mutasi Keluar"
                        >
                          <ArrowRightLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setGraduatingStudent(student)}
                          className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Kelulusan"
                        >
                          <GraduationCap className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setDeletingStudent(student)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Content: Desktop Data Table (>= 640px) */}
      <div className="hidden sm:block overflow-hidden rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/90 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="px-5 py-3.5">Identitas Siswa</th>
                <th className="px-4 py-3.5">L/P</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Rombel & Tingkat</th>
                <th className="px-4 py-3.5">Wali / Kontak</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-400 text-xs sm:text-sm"
                  >
                    Tidak ada data siswa yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {s.foto_url ? (
                          <img
                            src={s.foto_url}
                            alt={s.nama_lengkap}
                            className="w-8 h-8 rounded-xl object-cover border border-slate-200 shadow-xs"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2563EB] to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                            {s.nama_lengkap.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span
                            className="font-bold text-slate-800 block hover:text-[#2563EB] cursor-pointer"
                            onClick={() => setDetailStudent(s)}
                          >
                            {s.nama_lengkap}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            NIS: {s.nis} {s.nisn ? `• NISN: ${s.nisn}` : ""}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-600">{s.jenis_kelamin}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                          s.status_akademik
                        )}`}
                      >
                        {s.status_akademik}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {s.active_rombel_nama ? (
                        <div>
                          <span className="font-semibold text-slate-800 block">
                            {s.active_rombel_nama}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {s.active_tingkat_nama ?? ""}
                            {s.active_nomor_absen ? ` • Absen #${s.active_nomor_absen}` : ""}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Belum Ditempatkan</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div>
                        <span className="font-medium text-slate-700 block">
                          {s.nama_wali || "-"}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {s.telepon_wali || s.email_wali || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setDetailStudent(s)}
                          className="p-1.5 rounded-lg text-[#2563EB] hover:bg-blue-50 transition-colors"
                          title="Lihat Detail & Riwayat"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {canManage && (
                          <>
                            <button
                              onClick={() => {
                                setEditPhoto(s.foto_url || null);
                                setEditingStudent(s);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                              title="Edit Profil"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            {s.status_akademik === "AKTIF" && (
                              <>
                                <button
                                  onClick={() => setTransferringStudent(s)}
                                  className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                                  title="Mutasi Keluar"
                                >
                                  <ArrowRightLeft className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setGraduatingStudent(s)}
                                  className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                                  title="Kelulusan"
                                >
                                  <GraduationCap className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => setDeletingStudent(s)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
          <span>
            Menampilkan{" "}
            <strong>
              {filteredStudents.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} -{" "}
              {Math.min(currentPage * rowsPerPage, filteredStudents.length)}
            </strong>{" "}
            dari <strong>{filteredStudents.length}</strong> siswa
          </span>
          <div className="flex items-center gap-2">
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
            >
              <option value={10}>10 Baris</option>
              <option value={25}>25 Baris</option>
              <option value={50}>50 Baris</option>
            </select>
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
      </div>

      {/* Modal: Tambah Siswa Baru */}
      {isCreateOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <Plus className="h-4 w-4 text-[#2563EB]" />
                  Tambah Data Siswa Baru
                </h3>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                onSubmit={handleCreateSubmit}
                className="p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm"
              >
                {/* Foto Profil Siswa */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="relative w-16 h-16 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-2xs">
                    {createPhoto ? (
                      <img src={createPhoto} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="h-6 w-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="block text-xs font-semibold text-slate-700">
                      Pas Foto Siswa (Opsional)
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Format JPG, PNG, atau WebP (Maksimal 2MB)
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer shadow-2xs transition-colors">
                        <Upload className="h-3.5 w-3.5 text-[#2563EB]" />
                        Pilih Foto
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/jpg"
                          onChange={(e) => handlePhotoUpload(e, setCreatePhoto)}
                          className="hidden"
                        />
                      </label>
                      {createPhoto && (
                        <button
                          type="button"
                          onClick={() => setCreatePhoto(null)}
                          className="px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                  <input type="hidden" name="foto_url" value={createPhoto || ""} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Nomor Induk Siswa (NIS) *
                    </label>
                    <input
                      name="nis"
                      required
                      placeholder="Contoh: 20261001"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      NISN (10 Digit Angka)
                    </label>
                    <input
                      name="nisn"
                      maxLength={10}
                      placeholder="Contoh: 0081234567"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Nama Lengkap Siswa *
                  </label>
                  <input
                    name="nama_lengkap"
                    required
                    placeholder="Nama lengkap sesuai akta / ijazah"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Jenis Kelamin *
                    </label>
                    <select
                      name="jenis_kelamin"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                    >
                      <option value="L">Laki-laki (L)</option>
                      <option value="P">Perempuan (P)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Tempat Lahir
                    </label>
                    <input
                      name="tempat_lahir"
                      placeholder="Kota/Kabupaten"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Tanggal Lahir
                    </label>
                    <input
                      type="date"
                      name="tanggal_lahir"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Nama Orang Tua / Wali
                    </label>
                    <input
                      name="nama_wali"
                      placeholder="Nama orang tua atau wali murid"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Telepon / WhatsApp Wali
                    </label>
                    <input
                      name="telepon_wali"
                      placeholder="08xxxxxxxxxx"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                    />
                  </div>
                </div>

                {/* Auto Enrollment options */}
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
                  <h5 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                    Keikutsertaan Awal (Opsional)
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Tahun Ajaran
                      </label>
                      <select
                        name="initial_tahun_ajaran_id"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
                      >
                        <option value="">-- Tanpa Pendaftaran Langsung --</option>
                        {academicYears.map((y) => (
                          <option key={y.id} value={y.id}>
                            {y.nama}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Tingkat Kelas
                      </label>
                      <select
                        name="initial_tingkat_id"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
                      >
                        <option value="">-- Pilih Tingkat --</option>
                        {gradeLevels.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.nama}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Rombel / Kelas
                      </label>
                      <select
                        name="initial_rombel_id"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
                      >
                        <option value="">-- Pilih Rombel --</option>
                        {rombels.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.nama} (Kapasitas: {r.kapasitas})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
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
                    {isPending ? "Menyimpan..." : "Simpan Siswa"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Modal: Edit Profil Siswa */}
      {editingStudent &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <Edit2 className="h-4 w-4 text-[#2563EB]" />
                  Edit Profil Siswa
                </h3>
                <button
                  onClick={() => setEditingStudent(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                onSubmit={handleEditSubmit}
                className="p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm"
              >
                <input type="hidden" name="id" value={editingStudent.id} />

                {/* Foto Profil Siswa */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="relative w-16 h-16 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-2xs">
                    {editPhoto ? (
                      <img src={editPhoto} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="h-6 w-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="block text-xs font-semibold text-slate-700">
                      Pas Foto Siswa (Opsional)
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Format JPG, PNG, atau WebP (Maksimal 2MB)
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer shadow-2xs transition-colors">
                        <Upload className="h-3.5 w-3.5 text-[#2563EB]" />
                        Ganti Foto
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/jpg"
                          onChange={(e) => handlePhotoUpload(e, setEditPhoto)}
                          className="hidden"
                        />
                      </label>
                      {editPhoto && (
                        <button
                          type="button"
                          onClick={() => setEditPhoto(null)}
                          className="px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                  <input type="hidden" name="foto_url" value={editPhoto || ""} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Nomor Induk Siswa (NIS) *
                    </label>
                    <input
                      name="nis"
                      defaultValue={editingStudent.nis}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      NISN (10 Digit)
                    </label>
                    <input
                      name="nisn"
                      defaultValue={editingStudent.nisn || ""}
                      maxLength={10}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Nama Lengkap Siswa *
                  </label>
                  <input
                    name="nama_lengkap"
                    defaultValue={editingStudent.nama_lengkap}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Status Akademik
                    </label>
                    <select
                      name="status_akademik"
                      defaultValue={editingStudent.status_akademik}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                    >
                      <option value="AKTIF">AKTIF</option>
                      <option value="NONAKTIF">NONAKTIF</option>
                      <option value="LULUS">LULUS</option>
                      <option value="PINDAH">PINDAH</option>
                      <option value="KELUAR">KELUAR</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Telepon Wali
                    </label>
                    <input
                      name="telepon_wali"
                      defaultValue={editingStudent.telepon_wali || ""}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingStudent(null)}
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

      {/* Modal: Kelulusan Siswa */}
      {graduatingStudent &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Kelulusan Siswa</h3>
                  <p className="text-xs text-slate-500">{graduatingStudent.nama_lengkap}</p>
                </div>
              </div>

              <form onSubmit={handleGraduateSubmit} className="space-y-4 text-xs">
                <input type="hidden" name="siswa_id" value={graduatingStudent.id} />
                <input
                  type="hidden"
                  name="source_enrollment_id"
                  value={graduatingStudent.active_enrollment_id || ""}
                />

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Kelulusan Resmi
                  </label>
                  <input
                    type="date"
                    name="tanggal_lulus"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Catatan Kelulusan (Opsional)
                  </label>
                  <input
                    name="catatan"
                    placeholder="Contoh: Lulus Angkatan 2026"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setGraduatingStudent(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                  >
                    {isPending ? "Memproses..." : "Konfirmasi Lulus"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Modal: Mutasi Keluar Siswa */}
      {transferringStudent &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
                  <ArrowRightLeft className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Mutasi Keluar Siswa</h3>
                  <p className="text-xs text-slate-500">{transferringStudent.nama_lengkap}</p>
                </div>
              </div>

              <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
                <input type="hidden" name="siswa_id" value={transferringStudent.id} />
                <input
                  type="hidden"
                  name="source_enrollment_id"
                  value={transferringStudent.active_enrollment_id || ""}
                />

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Alasan Mutasi / Pindah *
                  </label>
                  <input
                    name="alasan_keluar"
                    required
                    placeholder="Contoh: Mengikuti domisili orang tua"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Sekolah Tujuan (Opsional)
                  </label>
                  <input
                    name="sekolah_tujuan"
                    placeholder="Nama institusi atau sekolah baru"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setTransferringStudent(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                  >
                    {isPending ? "Memproses..." : "Konfirmasi Mutasi"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Modal: Hapus Siswa (Destructive Confirmation) */}
      {deletingStudent &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <AlertTriangle className="h-6 w-6" />
                <h3 className="font-bold text-slate-800 text-base">Hapus Data Siswa</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus data siswa{" "}
                <strong>&quot;{deletingStudent.nama_lengkap}&quot;</strong> (NIS:{" "}
                {deletingStudent.nis})? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingStudent(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSubmit}
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs disabled:opacity-50"
                >
                  {isPending ? "Menghapus..." : "Hapus Siswa"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Detail Modal Component */}
      <StudentDetailModal
        isOpen={Boolean(detailStudent)}
        onClose={() => setDetailStudent(null)}
        student={detailStudent}
      />
    </div>
  );
}
