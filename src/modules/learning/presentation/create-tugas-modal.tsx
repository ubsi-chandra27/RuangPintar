"use client";

/**
 * Ruang Pintar — M11 Create Tugas Pembelajaran Modal
 */

import React, { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { X, ClipboardList, Loader2, Calendar, FileCheck } from "lucide-react";
import { createTugasAction } from "@/app/actions/learning-actions";
import { LingkupMateriDTO } from "../domain/learning-types";

interface CreateTugasModalProps {
  penugasanId: string;
  guruId: string;
  mapelId: string;
  lingkupMateriList: LingkupMateriDTO[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export function CreateTugasModal({
  penugasanId,
  guruId,
  mapelId,
  lingkupMateriList,
  isOpen,
  onClose,
  onSuccess,
  onError,
}: CreateTugasModalProps) {
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("penugasan_mengajar_id", penugasanId);
    formData.set("guru_id", guruId);
    formData.set("mata_pelajaran_id", mapelId);

    startTransition(async () => {
      const res = await createTugasAction(null, formData);
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
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border border-slate-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Terbitkan Tugas Kelas</h3>
              <p className="text-xs text-slate-500">
                Berikan instruksi penugasan mandiri / kelompok bagi siswa
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
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kaitkan ke BAB / Lingkup Materi
            </label>
            <select
              name="lingkup_materi_id"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            >
              <option value="">Umum / Tidak terikat BAB tertentu</option>
              {lingkupMateriList.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.kode ? `${b.kode}: ` : ""}
                  {b.judul}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Judul Tugas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="judul"
              required
              minLength={2}
              maxLength={200}
              placeholder="Contoh: Tugas Mandiri Analisis Algoritma Sorting"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Metode Pengumpulan
              </label>
              <select
                name="tipe_penyerahan"
                defaultValue="FILE"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              >
                <option value="FILE">Unggah Berkas / Dokumen</option>
                <option value="TEKS">Ketik Teks Jawaban Langsung</option>
                <option value="DARING">Tautan Daring / Repository</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tenggat Batas Waktu
              </label>
              <input
                type="datetime-local"
                name="batas_waktu"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Petunjuk & Kriteria Tugas <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="petunjuk"
              rows={4}
              required
              minLength={5}
              placeholder="Tuliskan petunjuk teknis pengerjaan, format berkas, serta kriteria penilaian tugas..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              name="izinkan_terlambat"
              value="true"
              className="h-4 w-4 rounded text-purple-600 border-slate-300 focus:ring-purple-500"
            />
            <span className="text-xs text-slate-700 font-semibold">
              Izinkan pengumpulan melewati batas waktu (ditandai Terlambat)
            </span>
          </label>

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
              <span>Terbitkan Tugas</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
