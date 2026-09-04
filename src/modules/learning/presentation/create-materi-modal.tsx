"use client";

/**
 * Ruang Pintar — M11 Create Materi Pembelajaran Modal
 */

import React, { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  FileText,
  Loader2,
  Link as LinkIcon,
  FileCode,
  AlignLeft,
  UploadCloud,
} from "lucide-react";
import { createMateriAction } from "@/app/actions/learning-actions";
import { LingkupMateriDTO } from "../domain/learning-types";

interface CreateMateriModalProps {
  penugasanId: string;
  guruId: string;
  mapelId: string;
  lingkupMateriList: LingkupMateriDTO[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export function CreateMateriModal({
  penugasanId,
  guruId,
  mapelId,
  lingkupMateriList,
  isOpen,
  onClose,
  onSuccess,
  onError,
}: CreateMateriModalProps) {
  const [tipeKonten, setTipeKonten] = useState<"DOKUMEN" | "TEKS" | "TAUTAN" | "VIDEO">("DOKUMEN");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("penugasan_mengajar_id", penugasanId);
    formData.set("guru_id", guruId);
    formData.set("mata_pelajaran_id", mapelId);
    formData.set("tipe_konten", tipeKonten);
    formData.set("publish_langsung", "true");

    startTransition(async () => {
      const res = await createMateriAction(null, formData);
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
            <div className="p-2 rounded-xl bg-blue-50 text-[#2563EB]">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Terbitkan Materi Pembelajaran</h3>
              <p className="text-xs text-slate-500">
                Bagikan modul, teks bacaan, atau tautan ke siswa
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
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
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
              Judul Materi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="judul"
              required
              minLength={2}
              maxLength={200}
              placeholder="Contoh: Modul Pengantar Algoritma dan Struktur Data"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
            />
          </div>

          {/* Selector Tipe Konten */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Format / Tipe Materi
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTipeKonten("DOKUMEN")}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  tipeKonten === "DOKUMEN"
                    ? "bg-blue-50 border-blue-300 text-[#2563EB] ring-1 ring-blue-500/20"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <FileCode className="h-3.5 w-3.5" />
                <span>Dokumen</span>
              </button>

              <button
                type="button"
                onClick={() => setTipeKonten("TEKS")}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  tipeKonten === "TEKS"
                    ? "bg-blue-50 border-blue-300 text-[#2563EB] ring-1 ring-blue-500/20"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <AlignLeft className="h-3.5 w-3.5" />
                <span>Teks Artikel</span>
              </button>

              <button
                type="button"
                onClick={() => setTipeKonten("TAUTAN")}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  tipeKonten === "TAUTAN"
                    ? "bg-blue-50 border-blue-300 text-[#2563EB] ring-1 ring-blue-500/20"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <LinkIcon className="h-3.5 w-3.5" />
                <span>Tautan / Web</span>
              </button>
            </div>
          </div>

          {tipeKonten === "DOKUMEN" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unggah Berkas Modul / Dokumen <span className="text-rose-500">*</span>
              </label>
              <div className="relative border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-5 transition-colors text-center bg-slate-50/60 hover:bg-blue-50/30">
                <input
                  type="file"
                  name="file"
                  required
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center pointer-events-none">
                  <div className="p-3 rounded-2xl bg-blue-50 text-[#2563EB] mb-2 shadow-xs">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  {selectedFile ? (
                    <div>
                      <p className="text-xs font-bold text-slate-800 truncate max-w-xs">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Klik untuk ganti berkas
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-slate-700">
                        Pilih berkas dokumen atau seret ke sini
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Format PDF, Word, PowerPoint, Excel, atau ZIP (Maks. 25 MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {tipeKonten === "TAUTAN" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                URL Tautan <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                name="tautan_url"
                required
                placeholder="https://example.com/modul-pembelajaran"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
              />
            </div>
          )}

          {tipeKonten === "TEKS" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Isi Materi Teks <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="konten_teks"
                rows={5}
                required
                placeholder="Tuliskan materi pembelajaran atau penjelasan teori di sini..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Petunjuk Belajar / Deskripsi (Opsional)
            </label>
            <textarea
              name="deskripsi"
              rows={2}
              placeholder="Catatan atau instruksi bagi siswa saat mempelajari materi ini..."
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
              <span>Terbitkan Materi</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
