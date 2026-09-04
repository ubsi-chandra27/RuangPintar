"use client";

/**
 * Ruang Pintar — M11 Create Lingkup Materi (BAB) Modal
 */

import React, { useTransition } from "react";
import { createPortal } from "react-dom";
import { X, BookOpen, Loader2 } from "lucide-react";
import { createLingkupMateriAction } from "@/app/actions/learning-actions";

interface CreateBABModalProps {
  penugasanId: string;
  isOpen: boolean;
  onClose: () => void;
  nextUrutan: number;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export function CreateBABModal({
  penugasanId,
  isOpen,
  onClose,
  nextUrutan,
  onSuccess,
  onError,
}: CreateBABModalProps) {
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("penugasan_mengajar_id", penugasanId);

    startTransition(async () => {
      const res = await createLingkupMateriAction(null, formData);
      if (res.success) {
        onSuccess(res.message);
        onClose();
      } else {
        onError(res.message);
      }
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl border border-slate-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-[#2563EB]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Tambah Lingkup Materi (BAB)</h3>
              <p className="text-xs text-slate-500">
                Susun unit pokok materi pembelajaran kelas ini
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kode BAB</label>
              <input
                type="text"
                name="kode"
                placeholder="e.g. BAB 1"
                defaultValue={`BAB ${nextUrutan}`}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Urutan Ke-</label>
              <input
                type="number"
                name="urutan"
                defaultValue={nextUrutan}
                min={1}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Judul BAB / Lingkup Materi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="judul"
              placeholder="Contoh: Berpikir Komputasional & Pemecahan Masalah"
              required
              minLength={2}
              maxLength={200}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deskripsi Singkat (Opsional)
            </label>
            <textarea
              name="deskripsi"
              rows={3}
              placeholder="Ringkasan kompetensi pokok atau ruang lingkup yang dipelajari pada BAB ini..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Simpan BAB</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
