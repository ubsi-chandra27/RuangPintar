"use client";

/**
 * Ruang Pintar — M11 Edit Administrasi Pembelajaran (Jurnal KBM) Modal
 * Academic Glass UI v1.2
 */

import React, { useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, BookCheck, Loader2 } from "lucide-react";
import { updateAdministrasiAction } from "@/app/actions/learning-actions";
import {
  AdministrasiPembelajaranDTO,
  LingkupMateriDTO,
  TujuanPembelajaranDTO,
} from "../domain/learning-types";

interface EditJurnalModalProps {
  penugasanId: string;
  administrasi: AdministrasiPembelajaranDTO | null;
  lingkupMateriList: Array<LingkupMateriDTO & { tujuan_pembelajaran: TujuanPembelajaranDTO[] }>;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export function EditJurnalModal({
  penugasanId,
  administrasi,
  lingkupMateriList,
  isOpen,
  onClose,
  onSuccess,
  onError,
}: EditJurnalModalProps) {
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !administrasi) return null;

  const initialDateStr = administrasi.tanggal
    ? new Date(administrasi.tanggal).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  const linkedTpIds = new Set((administrasi.tp_terkait || []).map((t) => t.id));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("id", administrasi.id);
    formData.set("penugasan_mengajar_id", penugasanId);

    startTransition(async () => {
      const res = await updateAdministrasiAction(null, formData);
      if (res.success) {
        onSuccess(res.message);
        onClose();
      } else {
        onError(res.message);
      }
    });
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border border-slate-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
      >
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <BookCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Edit Jurnal Administrasi KBM</h3>
              <p className="text-xs text-slate-500">
                Perbarui agenda, realisasi, dan refleksi pertemuan ini
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          key={administrasi.id}
          onSubmit={handleSubmit}
          className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1"
        >
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pertemuan Ke- <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="pertemuan_ke"
                defaultValue={administrasi.pertemuan_ke}
                min={1}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal KBM <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="tanggal"
                defaultValue={initialDateStr}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Realisasi
              </label>
              <select
                name="status_realisasi"
                defaultValue={administrasi.status_realisasi || "TERLAKSANA"}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              >
                <option value="TERLAKSANA">Terlaksana</option>
                <option value="TERTUNDA">Tertunda</option>
                <option value="DIGANTI">Diganti</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Materi Pokok yang Disampaikan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="materi_disampaikan"
              defaultValue={administrasi.materi_disampaikan}
              required
              minLength={3}
              placeholder="Contoh: Pengenalan Sintaks Percabangan If-Else dan Switch"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {/* TP Terkait (Checkboxes) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tujuan Pembelajaran (TP) Terkait Pertemuan Ini
            </label>
            <div className="max-h-36 overflow-y-auto p-3 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
              {lingkupMateriList.flatMap((lm) => lm.tujuan_pembelajaran).length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  Belum ada TP yang didefinisikan pada BAB kelas ini.
                </p>
              ) : (
                lingkupMateriList.map((lm) =>
                  lm.tujuan_pembelajaran.map((tp) => (
                    <label
                      key={tp.id}
                      className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                    >
                      <input
                        type="checkbox"
                        name="tp_ids"
                        value={tp.id}
                        defaultChecked={linkedTpIds.has(tp.id)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mt-0.5"
                      />
                      <span className="leading-snug">
                        {tp.kode ? (
                          <strong className="text-slate-900 font-bold mr-1">[{tp.kode}]</strong>
                        ) : null}
                        {tp.deskripsi}
                        <span className="text-[10px] text-slate-400 block">BAB: {lm.judul}</span>
                      </span>
                    </label>
                  ))
                )
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ringkasan Kegiatan Pembelajaran (Opsional)
            </label>
            <textarea
              name="kegiatan_pembelajaran"
              defaultValue={administrasi.kegiatan_pembelajaran || ""}
              rows={3}
              placeholder="Contoh: Diskusi kelompok pemecahan masalah algoritma pencarian, dilanjutkan presentasi per kelompok."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Refleksi & Kendala Kelas (Opsional)
            </label>
            <textarea
              name="catatan_refleksi"
              defaultValue={administrasi.catatan_refleksi || ""}
              rows={2}
              placeholder="Contoh: Siswa antusias, namun sebagian masih kesulitan memahami nested loop. Perlu latihan tambahan."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
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
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
