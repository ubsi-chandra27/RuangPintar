"use client";

import React, { useState, useTransition } from "react";
import { X, Send, ShieldCheck, Users, Eye, AlertTriangle } from "lucide-react";
import { publishAssessmentAction } from "@/app/actions/assessment-actions";
import { PublicationAudience, DefinisiAsesmenDTO } from "../domain/assessment-types";

interface PublishAssessmentModalProps {
  asesmen: DefinisiAsesmenDTO | null;
  penugasanId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export function PublishAssessmentModal({
  asesmen,
  penugasanId,
  isOpen,
  onClose,
  onSuccess,
  onError,
}: PublishAssessmentModalProps) {
  const [isPending, startTransition] = useTransition();
  const [targetAudience, setTargetAudience] = useState<PublicationAudience>("SEMUA");
  const [catatan, setCatatan] = useState("");

  if (!isOpen || !asesmen) return null;

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await publishAssessmentAction(
        {
          asesmen_id: asesmen.id,
          target_audience: targetAudience,
          catatan: catatan.trim() || null,
        },
        penugasanId
      );

      if (res.success) {
        onSuccess("Nilai asesmen resmi dipublikasikan.");
        onClose();
      } else {
        onError(res.message);
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-modal-title"
    >
      <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200/80 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h2 id="publish-modal-title" className="text-base font-bold text-slate-800">
                Publikasikan Nilai Asesmen
              </h2>
              <p className="text-xs text-slate-500">
                Assessment Definition ≠ Grade ≠ Grade Publication
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handlePublish} className="p-6 space-y-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-1">
            <div className="font-bold text-slate-800 text-sm">{asesmen.judul}</div>
            <div className="text-slate-600 flex items-center gap-3">
              <span>
                Kategori: <strong className="text-slate-800">{asesmen.kategori}</strong>
              </span>
              <span>
                Dinilai:{" "}
                <strong className="text-slate-800">
                  {asesmen.total_siswa_dinilai}/{asesmen.total_siswa_rombel} Siswa
                </strong>
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-bold text-slate-700">Target Audiens Publikasi</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="audience"
                  value="SEMUA"
                  checked={targetAudience === "SEMUA"}
                  onChange={() => setTargetAudience("SEMUA")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="font-bold text-slate-800">Semua (Siswa & Orang Tua / Wali)</span>
                  <p className="text-[11px] text-slate-500">
                    Nilai dapat dilihat di portal Siswa dan pemantauan Orang Tua.
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="audience"
                  value="SISWA"
                  checked={targetAudience === "SISWA"}
                  onChange={() => setTargetAudience("SISWA")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="font-bold text-slate-800">Hanya Siswa</span>
                  <p className="text-[11px] text-slate-500">
                    Hanya tampil di portal dan aplikasi siswa.
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="audience"
                  value="WALI"
                  checked={targetAudience === "WALI"}
                  onChange={() => setTargetAudience("WALI")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="font-bold text-slate-800">Hanya Orang Tua / Wali</span>
                  <p className="text-[11px] text-slate-500">
                    Hanya tampil di laporan perkembangan nilai wali murid.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Pesan / Catatan Publikasi (Opsional)
            </label>
            <textarea
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan pengumuman nilai untuk siswa/wali..."
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
            />
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <span>
              Publikasi ini akan mengubah status asesmen menjadi <strong>PUBLISHED</strong>. Nilai
              yang sudah diisi akan resmi terlihat oleh audiens terpilih.
            </span>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-xl shadow-xs shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              {isPending ? "Mempublikasikan..." : "Publikasikan Sekarang"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
