"use client";

import * as React from "react";
import { X, Calendar, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { createFollowUpAction } from "@/app/actions/monitoring-actions";

export interface CreateFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  catatanId: string;
  catatanJudul: string;
  siswaNama: string;
}

export function CreateFollowUpModal({
  isOpen,
  onClose,
  onSuccess,
  catatanId,
  catatanJudul,
  siswaNama,
}: CreateFollowUpModalProps) {
  const [tindakan, setTindakan] = React.useState("");
  const [targetTanggal, setTargetTanggal] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tindakan.trim() || tindakan.trim().length < 3) {
      setErrorMsg("Deskripsi rencana tindakan minimal 3 karakter.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await createFollowUpAction({
        catatan_id: catatanId,
        tindakan: tindakan.trim(),
        target_tanggal: targetTanggal ? targetTanggal : undefined,
      });

      if (res.success) {
        onSuccess();
        onClose();
        setTindakan("");
        setTargetTanggal("");
      } else {
        setErrorMsg(res.message || "Gagal menyimpan rencana tindak lanjut.");
      }
    } catch {
      setErrorMsg("Terjadi kendala saat menghubungi server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col">
        {/* Header Modal */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold">Tambah Rencana Tindak Lanjut</h2>
            <p className="text-[11px] text-slate-300">
              Siswa: <strong>{siswaNama}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <span className="font-semibold block text-[10px] text-slate-400 uppercase tracking-wider">
              Mengacu pada Catatan:
            </span>
            <span className="font-bold text-slate-800 line-clamp-1">{catatanJudul}</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              Rencana Tindakan Intervensi *
            </label>
            <textarea
              rows={3}
              value={tindakan}
              onChange={(e) => setTindakan(e.target.value)}
              placeholder="Contoh: Mengirim surat pemanggilan orang tua dan menjadwalkan konseling..."
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="h-3 w-3 text-blue-600" />
              <span>Target Tanggal Selesai (Opsional)</span>
            </label>
            <input
              type="date"
              value={targetTanggal}
              onChange={(e) => setTargetTanggal(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Simpan Tindak Lanjut</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
