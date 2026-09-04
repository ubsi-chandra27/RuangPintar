"use client";

/**
 * Ruang Pintar — M11 Create Tujuan Pembelajaran (TP) Modal
 */

import React, { useTransition } from "react";
import { createPortal } from "react-dom";
import { X, Target, Loader2 } from "lucide-react";
import { createTujuanPembelajaranAction } from "@/app/actions/learning-actions";

interface CreateTPModalProps {
  penugasanId: string;
  lingkupMateriId: string;
  babJudul: string;
  isOpen: boolean;
  onClose: () => void;
  nextUrutan: number;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export function CreateTPModal({
  penugasanId,
  lingkupMateriId,
  babJudul,
  isOpen,
  onClose,
  nextUrutan,
  onSuccess,
  onError,
}: CreateTPModalProps) {
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("penugasan_mengajar_id", penugasanId);
    formData.set("lingkup_materi_id", lingkupMateriId);

    startTransition(async () => {
      const res = await createTujuanPembelajaranAction(null, formData);
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
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Tambah Tujuan Pembelajaran (TP)
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-xs">{babJudul}</p>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kode TP</label>
              <input
                type="text"
                name="kode"
                placeholder="e.g. TP 1.1"
                defaultValue={`TP ${nextUrutan}`}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
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
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rumusan Tujuan Pembelajaran <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="deskripsi"
              rows={4}
              required
              minLength={5}
              maxLength={500}
              placeholder="Contoh: Peserta didik mampu mengidentifikasi komponen arsitektur sistem komputer dan fungsinya secara tepat..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
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
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Simpan TP</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
