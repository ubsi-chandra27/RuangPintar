"use client";

/**
 * Ruang Pintar — M11 Create Administrasi Pembelajaran (Jurnal KBM) Modal
 */

import React, { useTransition } from "react";
import { createPortal } from "react-dom";
import { X, BookCheck, Loader2 } from "lucide-react";
import { createAdministrasiAction } from "@/app/actions/learning-actions";
import { LingkupMateriDTO, TujuanPembelajaranDTO } from "../domain/learning-types";

interface CreateJurnalModalProps {
  penugasanId: string;
  guruId: string;
  lingkupMateriList: Array<LingkupMateriDTO & { tujuan_pembelajaran: TujuanPembelajaranDTO[] }>;
  isOpen: boolean;
  onClose: () => void;
  nextPertemuan: number;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export function CreateJurnalModal({
  penugasanId,
  guruId,
  lingkupMateriList,
  isOpen,
  onClose,
  nextPertemuan,
  onSuccess,
  onError,
}: CreateJurnalModalProps) {
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().slice(0, 10);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("penugasan_mengajar_id", penugasanId);
    formData.set("guru_id", guruId);

    startTransition(async () => {
      const res = await createAdministrasiAction(null, formData);
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
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <BookCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Isi Jurnal Administrasi KBM</h3>
              <p className="text-xs text-slate-500">
                Catat agenda dan realisasi pembelajaran pertemuan ini
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pertemuan Ke- <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="pertemuan_ke"
                defaultValue={nextPertemuan}
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
                defaultValue={todayStr}
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
                defaultValue="TERLAKSANA"
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
                  Belum ada TP yang didefinisikan pada BAB kelas ini. Anda tetap dapat menyimpan
                  jurnal KBM.
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
                        className="mt-0.5 h-3.5 w-3.5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                      />
                      <span>
                        <strong className="text-emerald-700">{tp.kode || "TP"}:</strong>{" "}
                        {tp.deskripsi}
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
              rows={2}
              placeholder="Aktivitas KBM: Penjelasan materi, praktikum mandiri, tanya jawab interaktif..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Refleksi & Kendala Kelas (Opsional)
            </label>
            <textarea
              name="catatan_refleksi"
              rows={2}
              placeholder="Catatan guru: Siswa antusias, kendala teknis PC 4 di lab, perlu remedial..."
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
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Simpan Jurnal KBM</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
