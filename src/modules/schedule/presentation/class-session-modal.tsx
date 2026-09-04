"use client";

/**
 * Ruang Pintar — M10 Open Class Session Modal (Academic Glass UI v1.2)
 */

import React, { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { X, PlayCircle, AlertCircle, Users } from "lucide-react";
import { openClassSessionAction } from "@/app/actions/class-session-actions";
import { TeachingAssignmentDTO, TeacherProfileDTO } from "@/modules/teacher/domain/teacher-types";
import { ToastType } from "@/shared/components/ui/toast";

interface ClassSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  rombels: Array<{ id: string; nama: string; tingkat_nama?: string | null }>;
  assignments: TeachingAssignmentDTO[];
  teachers: TeacherProfileDTO[];
  onSuccess: (toast: { message: string; type: ToastType }) => void;
}

export function ClassSessionModal({
  isOpen,
  onClose,
  rombels,
  assignments,
  teachers,
  onSuccess,
}: ClassSessionModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [selectedRombelId, setSelectedRombelId] = useState(rombels[0]?.id || "");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [selectedGuruPenggantiId, setSelectedGuruPenggantiId] = useState("");

  if (!isOpen) return null;

  const availableAssignments = assignments.filter(
    (a) => a.rombel_id === selectedRombelId && a.status === "AKTIF"
  );
  const selectedAssignment = assignments.find((a) => a.id === selectedAssignmentId);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    formData.set("penugasan_mengajar_id", selectedAssignment.id);
    formData.set("rombel_id", selectedAssignment.rombel_id);
    formData.set("mata_pelajaran_id", selectedAssignment.mata_pelajaran_id);
    formData.set("guru_id", selectedAssignment.guru_id);
    formData.set("tahun_ajaran_id", selectedAssignment.tahun_ajaran_id);
    if (selectedAssignment.semester_id) {
      formData.set("semester_id", selectedAssignment.semester_id);
    }
    if (selectedGuruPenggantiId) {
      formData.set("guru_pengganti_id", selectedGuruPenggantiId);
    }

    startTransition(async () => {
      const res = await openClassSessionAction(null, formData);
      if (res.success) {
        onSuccess({ message: res.message, type: "success" });
        onClose();
      } else {
        setErrorMsg(res.message);
      }
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-[#2563EB]">
              <PlayCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Buka Sesi Kelas Pembelajaran</h3>
              <p className="text-xs text-slate-500">
                Mulai sesi pertemuan aktual kegiatan belajar mengajar (KBM).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-700 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Rombel / Kelas <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedRombelId}
                onChange={(e) => {
                  setSelectedRombelId(e.target.value);
                  setSelectedAssignmentId("");
                }}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
              >
                {rombels.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nama} ({r.tingkat_nama || "Kelas"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mata Pelajaran & Guru <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedAssignmentId}
                onChange={(e) => setSelectedAssignmentId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
              >
                <option value="">-- Pilih Mata Pelajaran --</option>
                {availableAssignments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.mata_pelajaran_nama} — {a.guru_nama}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Guru Pengganti (Opsional)
            </label>
            <select
              value={selectedGuruPenggantiId}
              onChange={(e) => setSelectedGuruPenggantiId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
            >
              <option value="">-- Tidak ada guru pengganti (Guru Resmi) --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nama_lengkap} {t.nip ? `(NIP: ${t.nip})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ruangan Aktual
              </label>
              <input
                type="text"
                name="ruangan_aktual"
                placeholder="Contoh: Lab RPL, R. 101"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Topik / Materi Pokok
              </label>
              <input
                type="text"
                name="topik_pembelajaran"
                placeholder="Contoh: Dasar Algoritma & Flowchart"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Catatan Sesi Kelas
            </label>
            <textarea
              name="catatan"
              rows={2}
              placeholder="Catatan pelaksanaan sesi pembelajaran..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending || !selectedAssignmentId}
              className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              {isPending ? "Membuka Sesi..." : "Buka Kelas Sekarang"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
