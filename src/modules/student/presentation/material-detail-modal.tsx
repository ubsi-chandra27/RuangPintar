"use client";

/**
 * Ruang Pintar — Material Detail Modal (Phase 15 / M15)
 *
 * Modal dialog penampil materi pembelajaran siswa:
 * - Pembacaan teks materi langsung
 * - Unduhan dokumen materi privat aman
 * - Akses tautan pembelajaran daring eksternal
 */

import React from "react";
import {
  BookOpen,
  Calendar,
  Download,
  ExternalLink,
  FileText,
  Video,
  Layers,
  Sparkles,
  X,
} from "lucide-react";
import { StudentMaterialItem } from "../domain/student-experience-types";

export interface MaterialDetailModalProps {
  material: StudentMaterialItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MaterialDetailModal({ material, isOpen, onClose }: MaterialDetailModalProps) {
  if (!isOpen || !material) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-slate-200/80 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold">
                {material.mataPelajaranNama}
              </span>
              {material.babJudul && (
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                  {material.babJudul}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                {material.tipeKonten}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] tracking-tight">
              {material.judul}
            </h2>
            <p className="text-xs text-slate-500">
              Diterbitkan oleh: <strong>{material.guruNama}</strong> •{" "}
              {material.tanggalPublikasiFormatted}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {material.deskripsi && (
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {material.deskripsi}
            </div>
          )}

          {/* Konten Berdasarkan Tipe */}
          <div className="space-y-4 my-2">
            {material.tipeKonten === "TEKS" && material.kontenTeks && (
              <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-line text-slate-700 font-sans">
                {material.kontenTeks}
              </div>
            )}

            {material.berkas && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/60 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-8 w-8 text-[#2563EB] shrink-0" />
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {material.berkas.namaFileAsli}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Dokumen Materi Belajar • {Math.round(material.berkas.ukuranByte / 1024)} KB
                    </p>
                  </div>
                </div>

                <a
                  href={`/api/berkas/${material.berkas.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  Unduh Berkas Materi
                </a>
              </div>
            )}

            {material.tautanUrl && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Tautan Sumber Belajar Daring:
                  </span>
                  <p className="text-xs text-[#2563EB] font-medium truncate">
                    {material.tautanUrl}
                  </p>
                </div>

                <a
                  href={material.tautanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4 text-[#2563EB]" />
                  Buka Tautan Eksternal
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
