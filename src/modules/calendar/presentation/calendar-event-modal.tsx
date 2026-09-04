"use client";

/**
 * Ruang Pintar — M09 Calendar Event Modal (Academic Glass UI v1.2)
 */

import React, { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { X, Calendar, AlertCircle } from "lucide-react";
import {
  createCalendarEventAction,
  updateCalendarEventAction,
} from "@/app/actions/calendar-actions";
import { CalendarEventDTO, TipeEventKalender } from "../domain/calendar-types";
import { ToastType } from "@/shared/components/ui/toast";

interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: CalendarEventDTO | null;
  academicYears: Array<{ id: string; nama: string; status: string }>;
  semesters: Array<{ id: string; nama: string; tahun_ajaran_id: string }>;
  onSuccess: (toast: { message: string; type: ToastType }) => void;
}

export function CalendarEventModal({
  isOpen,
  onClose,
  eventToEdit,
  academicYears,
  semesters,
  onSuccess,
}: CalendarEventModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeYear = academicYears.find((y) => y.status === "AKTIF") || academicYears[0];
  const [tahunAjaranId, setTahunAjaranId] = useState(
    eventToEdit?.tahun_ajaran_id || activeYear?.id || ""
  );
  const [semesterId, setSemesterId] = useState(eventToEdit?.semester_id || "");
  const [tipeEvent, setTipeEvent] = useState<TipeEventKalender>(
    eventToEdit?.tipe_event || "KEGIATAN_SEKOLAH"
  );
  const [liburKbm, setLiburKbm] = useState(eventToEdit?.libur_kbm || false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    formData.set("tahun_ajaran_id", tahunAjaranId);
    formData.set("semester_id", semesterId);
    formData.set("tipe_event", tipeEvent);
    formData.set("libur_kbm", liburKbm ? "true" : "false");

    if (eventToEdit) {
      formData.set("id", eventToEdit.id);
    }

    startTransition(async () => {
      const res = eventToEdit
        ? await updateCalendarEventAction(null, formData)
        : await createCalendarEventAction(null, formData);

      if (res.success) {
        onSuccess({ message: res.message, type: "success" });
        onClose();
      } else {
        setErrorMsg(res.message);
      }
    });
  };

  const availableSemesters = semesters.filter((s) => s.tahun_ajaran_id === tahunAjaranId);

  const formatInputDate = (d?: Date | string) => {
    if (!d) return "";
    const dateObj = typeof d === "string" ? new Date(d) : d;
    return dateObj.toISOString().split("T")[0];
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-[#2563EB]">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {eventToEdit ? "Edit Agenda Kalender" : "Tambah Agenda Kalender Akademik"}
              </h3>
              <p className="text-xs text-slate-500">
                Jadwalkan kegiatan sekolah, masa ujian, atau hari libur resmi.
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Judul Agenda / Kegiatan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="judul"
              required
              defaultValue={eventToEdit?.judul || ""}
              placeholder="Contoh: Masa Pengenalan Lingkungan Sekolah (MPLS)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tahun Ajaran <span className="text-rose-500">*</span>
              </label>
              <select
                value={tahunAjaranId}
                onChange={(e) => setTahunAjaranId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
              >
                {academicYears.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.nama} {y.status === "AKTIF" ? "(Aktif)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Semester (Opsional)
              </label>
              <select
                value={semesterId}
                onChange={(e) => setSemesterId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
              >
                <option value="">Semua Semester / Tahunan</option>
                {availableSemesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tipe Agenda <span className="text-rose-500">*</span>
              </label>
              <select
                value={tipeEvent}
                onChange={(e) => {
                  const val = e.target.value as TipeEventKalender;
                  setTipeEvent(val);
                  if (val === "HARI_LIBUR") setLiburKbm(true);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
              >
                <option value="KEGIATAN_SEKOLAH">Kegiatan Sekolah</option>
                <option value="HARI_LIBUR">Hari Libur Resmi</option>
                <option value="UJIAN">Periode Ujian / Asesmen</option>
                <option value="ORIENTASI">Masa Orientasi / MPLS</option>
                <option value="HARI_EFEKTIF">Hari Efektif Khusus</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Status Pembelajaran
              </label>
              <div className="flex items-center h-[42px]">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={liburKbm}
                    onChange={(e) => setLiburKbm(e.target.checked)}
                    className="w-4 h-4 rounded text-[#2563EB] focus:ring-blue-500 border-slate-300"
                  />
                  <span className="text-xs font-medium text-slate-700">
                    Liburkan KBM (Kegiatan Belajar)
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tanggal Mulai <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="tanggal_mulai"
                required
                defaultValue={formatInputDate(eventToEdit?.tanggal_mulai || new Date())}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tanggal Selesai <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="tanggal_selesai"
                required
                defaultValue={formatInputDate(eventToEdit?.tanggal_selesai || new Date())}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Deskripsi / Catatan Tambahan
            </label>
            <textarea
              name="deskripsi"
              rows={3}
              defaultValue={eventToEdit?.deskripsi || ""}
              placeholder="Catatan pelaksanaan atau detail agenda kegiatan..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
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
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              {isPending ? "Menyimpan..." : eventToEdit ? "Simpan Perubahan" : "Tambah Agenda"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
