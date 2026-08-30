"use client";

/**
 * Ruang Pintar — M07 Student Academic Lifecycle: Student Rombel Placements View
 */

import React, { useState, useTransition } from "react";
import {
  BookOpen,
  Plus,
  Users,
  ArrowRightLeft,
  Trash2,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  Layers,
  X,
  AlertTriangle,
  Search,
} from "lucide-react";
import { createPortal } from "react-dom";
import {
  bulkPlacementAction,
  createPlacementAction,
  deletePlacementAction,
  movePlacementAction,
} from "@/app/actions/student-actions";
import { RombelPlacementDTO, StudentEnrollmentDTO } from "../domain/student-types";
import { Toast, ToastType } from "@/shared/components/ui/toast";

interface StudentPlacementsViewProps {
  initialPlacements: RombelPlacementDTO[];
  enrollments: StudentEnrollmentDTO[];
  rombels: Array<{
    id: string;
    nama: string;
    kapasitas: number;
    tingkat_nama?: string;
    program_nama?: string | null;
    tahun_ajaran_id: string;
  }>;
  academicYears: Array<{ id: string; nama: string; status: string }>;
  canManage: boolean;
}

export function StudentPlacementsView({
  initialPlacements,
  enrollments,
  rombels,
  academicYears,
  canManage,
}: StudentPlacementsViewProps) {
  const [placements] = useState<RombelPlacementDTO[]>(initialPlacements);
  const [selectedRombelId, setSelectedRombelId] = useState<string>(rombels[0]?.id || "ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [isPlaceOpen, setIsPlaceOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [movingPlacement, setMovingPlacement] = useState<RombelPlacementDTO | null>(null);
  const [deletingPlacement, setDeletingPlacement] = useState<RombelPlacementDTO | null>(null);

  // Bulk state
  const [bulkSelectedIds, setBulkSelectedIds] = useState<string[]>([]);
  const [bulkTargetRombelId, setBulkTargetRombelId] = useState<string>(rombels[0]?.id || "");

  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Find active rombel details
  const currentRombel = rombels.find((r) => r.id === selectedRombelId);
  const activePlacementsInRombel = placements.filter(
    (p) => (selectedRombelId === "ALL" || p.rombel_id === selectedRombelId) && p.status === "AKTIF"
  );

  const filteredPlacements = placements.filter((p) => {
    const matchesRombel = selectedRombelId === "ALL" || p.rombel_id === selectedRombelId;
    const matchesSearch =
      (p.siswa_nama && p.siswa_nama.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.siswa_nis && p.siswa_nis.includes(searchQuery));

    return matchesRombel && matchesSearch;
  });

  const totalPages = Math.ceil(filteredPlacements.length / rowsPerPage) || 1;
  const paginatedPlacements = filteredPlacements.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Unplaced active enrollments for placement modals
  const unplacedEnrollments = enrollments.filter(
    (e) => e.status === "AKTIF" && !e.active_rombel_id
  );

  const handlePlaceSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createPlacementAction(null, formData);
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        setIsPlaceOpen(false);
      } else {
        setToast({ message: res.message, type: "error" });
      }
    });
  };

  const handleMoveSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await movePlacementAction(null, formData);
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        setMovingPlacement(null);
      } else {
        setToast({ message: res.message, type: "error" });
      }
    });
  };

  const handleBulkSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (bulkSelectedIds.length === 0 || !bulkTargetRombelId) return;

    startTransition(async () => {
      const res = await bulkPlacementAction(bulkTargetRombelId, bulkSelectedIds);
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        setIsBulkOpen(false);
        setBulkSelectedIds([]);
      } else {
        setToast({ message: res.message, type: "error" });
      }
    });
  };

  const handleDeleteSubmit = () => {
    if (!deletingPlacement) return;
    startTransition(async () => {
      const res = await deletePlacementAction(deletingPlacement.id);
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        setDeletingPlacement(null);
      } else {
        setToast({ message: res.message, type: "error" });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-sm">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#2563EB]" />
            Penempatan Rombongan Belajar (Rombel)
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Alokasikan siswa terdaftar ke rombongan belajar dengan validasi batas kapasitas kelas.
          </p>
        </div>
        {canManage && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBulkOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              <Users className="h-4 w-4" />
              Penempatan Massal
            </button>
            <button
              onClick={() => setIsPlaceOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Tempatkan Siswa
            </button>
          </div>
        )}
      </div>

      {/* Rombel Selector & Capacity Card */}
      <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-slate-200/80 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-5">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Pilih Rombel / Kelas
            </label>
            <select
              value={selectedRombelId}
              onChange={(e) => {
                setSelectedRombelId(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
            >
              <option value="ALL">Semua Rombel</option>
              {rombels.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama} ({r.tingkat_nama ?? ""} {r.program_nama ? `• ${r.program_nama}` : ""})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4 relative">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Pencarian</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari siswa di rombel ini..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
              />
            </div>
          </div>

          {/* Capacity Status Pill */}
          {currentRombel && (
            <div className="sm:col-span-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Kapasitas Rombel
                </span>
                <span className="text-xs font-bold text-slate-700">
                  {activePlacementsInRombel.length} / {currentRombel.kapasitas} Siswa
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  activePlacementsInRombel.length >= currentRombel.kapasitas
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                {activePlacementsInRombel.length >= currentRombel.kapasitas
                  ? "Penuh"
                  : `Sisa ${currentRombel.kapasitas - activePlacementsInRombel.length} Kursi`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content: Mobile Cards (< 640px) */}
      <div className="block sm:hidden space-y-3">
        {paginatedPlacements.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            Tidak ada siswa yang ditempatkan pada rombel ini.
          </div>
        ) : (
          paginatedPlacements.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{p.siswa_nama}</h4>
                  <span className="text-[11px] text-slate-400 font-mono">NIS: {p.siswa_nis}</span>
                </div>
                {p.nomor_absen && (
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg">
                    Absen #{p.nomor_absen}
                  </span>
                )}
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Rombel:</span>
                <span className="font-semibold text-slate-700">
                  {p.rombel_nama} ({p.tingkat_nama ?? ""})
                </span>
              </div>

              {canManage && (
                <div className="flex items-center justify-end gap-1 pt-2 border-t border-slate-100 text-xs">
                  <button
                    onClick={() => setMovingPlacement(p)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 font-semibold hover:bg-amber-100"
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                    Pindah Rombel
                  </button>
                  <button
                    onClick={() => setDeletingPlacement(p)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                    title="Keluarkan dari Rombel"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Content: Desktop Table (>= 640px) */}
      <div className="hidden sm:block overflow-hidden rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/90 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="px-5 py-3.5 w-16">No. Absen</th>
                <th className="px-5 py-3.5">Nama & NIS Siswa</th>
                <th className="px-4 py-3.5">L/P</th>
                <th className="px-4 py-3.5">Rombel / Kelas</th>
                <th className="px-4 py-3.5">Tingkat & Jurusan</th>
                <th className="px-4 py-3.5">Status Penempatan</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedPlacements.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-slate-400 text-xs sm:text-sm"
                  >
                    Tidak ada siswa yang ditempatkan pada rombel ini.
                  </td>
                </tr>
              ) : (
                paginatedPlacements.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-bold font-mono text-slate-600">
                      {p.nomor_absen ? `#${p.nomor_absen}` : "-"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-slate-800 block">{p.siswa_nama}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        NIS: {p.siswa_nis}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-600">
                      {p.siswa_jenis_kelamin ?? "-"}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">{p.rombel_nama}</td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {p.tingkat_nama ?? ""}
                      {p.program_nama ? ` • ${p.program_nama}` : ""}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                          p.status === "AKTIF"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canManage && (
                          <>
                            <button
                              onClick={() => setMovingPlacement(p)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-semibold text-xs hover:bg-amber-100 transition-colors"
                              title="Pindah Rombel"
                            >
                              <ArrowRightLeft className="h-3.5 w-3.5" />
                              Pindah
                            </button>
                            <button
                              onClick={() => setDeletingPlacement(p)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                              title="Keluarkan dari Rombel"
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

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
          <span>
            Menampilkan{" "}
            <strong>
              {filteredPlacements.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} -{" "}
              {Math.min(currentPage * rowsPerPage, filteredPlacements.length)}
            </strong>{" "}
            dari <strong>{filteredPlacements.length}</strong> penempatan
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

      {/* Modal: Tempatkan Siswa Tunggal */}
      {isPlaceOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <Plus className="h-4 w-4 text-[#2563EB]" />
                  Tempatkan Siswa ke Rombel
                </h3>
                <button
                  onClick={() => setIsPlaceOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handlePlaceSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pilih Siswa Terdaftar (Belum Ditempatkan) *
                  </label>
                  <select
                    name="keikutsertaan_id"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800"
                  >
                    <option value="">-- Pilih Siswa Terdaftar --</option>
                    {enrollments
                      .filter((e) => e.status === "AKTIF")
                      .map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.siswa_nama} (NIS: {e.siswa_nis}) - {e.tahun_ajaran_nama}{" "}
                          {e.active_rombel_nama
                            ? `[Saat ini: ${e.active_rombel_nama}]`
                            : "[Belum Ditempatkan]"}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Rombel Tujuan *
                    </label>
                    <select
                      name="rombel_id"
                      defaultValue={selectedRombelId !== "ALL" ? selectedRombelId : ""}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800"
                    >
                      <option value="">-- Pilih Rombel --</option>
                      {rombels.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nama} (Kapasitas: {r.kapasitas})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nomor Absen (Opsional)
                    </label>
                    <input
                      type="number"
                      name="nomor_absen"
                      min={1}
                      placeholder="Otomatis jika kosong"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsPlaceOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold"
                  >
                    {isPending ? "Menempatkan..." : "Tempatkan Siswa"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Modal: Pindah Rombel */}
      {movingPlacement &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
                  <ArrowRightLeft className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Pindah Rombel / Kelas</h3>
                  <p className="text-xs text-slate-500">{movingPlacement.siswa_nama}</p>
                </div>
              </div>

              <form onSubmit={handleMoveSubmit} className="space-y-3 text-xs">
                <input
                  type="hidden"
                  name="keikutsertaan_id"
                  value={movingPlacement.keikutsertaan_id}
                />

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rombel Saat Ini</label>
                  <input
                    disabled
                    value={movingPlacement.rombel_nama || ""}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Rombel Tujuan *
                    </label>
                    <select
                      name="target_rombel_id"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-semibold"
                    >
                      <option value="">-- Pilih Rombel --</option>
                      {rombels
                        .filter((r) => r.id !== movingPlacement.rombel_id)
                        .map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.nama} (Kapasitas: {r.kapasitas})
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nomor Absen Baru
                    </label>
                    <input
                      type="number"
                      name="nomor_absen"
                      min={1}
                      placeholder="Opsional"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Alasan Pindah Rombel
                  </label>
                  <input
                    name="alasan_pindah"
                    placeholder="Contoh: Penyesuaian peminatan / kapasitas"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setMovingPlacement(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                  >
                    {isPending ? "Memindahkan..." : "Simpan Pemindahan"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Modal: Penempatan Massal (Bulk Placement) */}
      {isBulkOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#2563EB]" />
                  Penempatan Rombel Massal (Bulk Placement)
                </h3>
                <button
                  onClick={() => setIsBulkOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                onSubmit={handleBulkSubmit}
                className="space-y-4 flex-1 overflow-y-auto text-xs"
              >
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pilih Rombel Tujuan *
                  </label>
                  <select
                    value={bulkTargetRombelId}
                    onChange={(e) => setBulkTargetRombelId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-semibold"
                  >
                    {rombels.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nama} (Kapasitas: {r.kapasitas})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-700">
                      Pilih Siswa yang Belum Memiliki Rombel ({bulkSelectedIds.length} dipilih)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (bulkSelectedIds.length === unplacedEnrollments.length) {
                          setBulkSelectedIds([]);
                        } else {
                          setBulkSelectedIds(unplacedEnrollments.map((e) => e.id));
                        }
                      }}
                      className="text-xs font-semibold text-[#2563EB] hover:underline"
                    >
                      {bulkSelectedIds.length === unplacedEnrollments.length
                        ? "Batalkan Semua"
                        : "Pilih Semua"}
                    </button>
                  </div>

                  {unplacedEnrollments.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400">
                      Semua siswa terdaftar sudah memiliki rombel aktif.
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto">
                      {unplacedEnrollments.map((enr) => {
                        const isSelected = bulkSelectedIds.includes(enr.id);
                        return (
                          <div
                            key={enr.id}
                            onClick={() => {
                              setBulkSelectedIds((prev) =>
                                isSelected ? prev.filter((id) => id !== enr.id) : [...prev, enr.id]
                              );
                            }}
                            className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                              isSelected ? "bg-blue-50/80" : "hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {isSelected ? (
                                <CheckSquare className="h-4 w-4 text-[#2563EB]" />
                              ) : (
                                <Square className="h-4 w-4 text-slate-400" />
                              )}
                              <div>
                                <span className="font-bold text-slate-800 block">
                                  {enr.siswa_nama}
                                </span>
                                <span className="text-[11px] text-slate-400 font-mono">
                                  NIS: {enr.siswa_nis}{" "}
                                  {enr.tingkat_nama ? `• ${enr.tingkat_nama}` : ""}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsBulkOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || bulkSelectedIds.length === 0}
                    className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold disabled:opacity-50"
                  >
                    {isPending ? "Menempatkan..." : `Tempatkan ${bulkSelectedIds.length} Siswa`}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Modal: Hapus Penempatan */}
      {deletingPlacement &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <AlertTriangle className="h-6 w-6" />
                <h3 className="font-bold text-slate-800 text-base">Keluarkan dari Rombel</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin mengeluarkan siswa{" "}
                <strong>&quot;{deletingPlacement.siswa_nama}&quot;</strong> dari rombel{" "}
                <strong>{deletingPlacement.rombel_nama}</strong>?
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingPlacement(null)}
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
                  {isPending ? "Mengeluarkan..." : "Keluarkan"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
