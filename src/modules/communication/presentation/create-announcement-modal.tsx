"use client";

import * as React from "react";
import { X, Megaphone, Pin, Send, FileText, AlertCircle, Loader2, Paperclip } from "lucide-react";
import {
  AnnouncementCategory,
  AudienceTarget,
  CreateAnnouncementInput,
} from "../domain/communication-types";
import { createAnnouncementAction } from "@/app/actions/communication-actions";

interface RombelOption {
  id: string;
  nama: string;
}

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableRombels?: RombelOption[];
  onSuccess?: () => void;
}

export function CreateAnnouncementModal({
  isOpen,
  onClose,
  availableRombels = [],
  onSuccess,
}: CreateAnnouncementModalProps) {
  const [judul, setJudul] = React.useState("");
  const [konten, setKonten] = React.useState("");
  const [kategori, setKategori] = React.useState<AnnouncementCategory>("UMUM");
  const [targetAudiens, setTargetAudiens] = React.useState<AudienceTarget>("SEMUA");
  const [targetRombelId, setTargetRombelId] = React.useState<string>("");
  const [apakahDisematkan, setApakahDisematkan] = React.useState(false);
  const [lampiranUrl, setLampiranUrl] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (isPublish: boolean) => {
    setErrorMessage(null);

    if (judul.trim().length < 3) {
      setErrorMessage("Judul pengumuman minimal 3 karakter.");
      return;
    }
    if (konten.trim().length < 10) {
      setErrorMessage("Isi pengumuman minimal 10 karakter.");
      return;
    }
    if (targetAudiens === "ROMBEL" && !targetRombelId) {
      setErrorMessage("Pilih rombel sasaran spesifik.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: CreateAnnouncementInput = {
        judul: judul.trim(),
        konten: konten.trim(),
        kategori,
        target_audiens: targetAudiens,
        target_rombel_id: targetAudiens === "ROMBEL" ? targetRombelId : undefined,
        apakah_disematkan: apakahDisematkan,
        lampiran_url: lampiranUrl.trim() || undefined,
        status: isPublish ? "PUBLISHED" : "DRAFT",
      };

      const result = await createAnnouncementAction(payload);
      if (result.success) {
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(result.message || "Gagal menyimpan pengumuman.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan sistem saat menyimpan pengumuman.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-white/60 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 flex items-center justify-center">
              <Megaphone className="size-4.5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Buat Pengumuman Baru
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Publikasikan edaran resmi untuk komunitas sekolah
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {errorMessage && (
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs">
              <AlertCircle className="size-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Judul */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Judul Pengumuman <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Jadwal Pelaksanaan Asesmen Tengah Semester Ganjil"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>

          {/* Kategori & Audiens Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Kategori
              </label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value as AnnouncementCategory)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              >
                <option value="UMUM">Umum</option>
                <option value="AKADEMIK">Akademik</option>
                <option value="KEGIATAN">Kegiatan Sekolah</option>
                <option value="PENTING">Penting</option>
                <option value="DARURAT">Darurat / Mendesak</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Sasaran Audiens
              </label>
              <select
                value={targetAudiens}
                onChange={(e) => setTargetAudiens(e.target.value as AudienceTarget)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              >
                <option value="SEMUA">Semua Komunitas Sekolah</option>
                <option value="GURU">Khusus Dewan Guru</option>
                <option value="SISWA">Khusus Siswa</option>
                <option value="WALI">Khusus Orang Tua / Wali</option>
                <option value="ROMBEL">Rombongan Belajar Tertentu</option>
              </select>
            </div>
          </div>

          {/* Rombel Selector if target is ROMBEL */}
          {targetAudiens === "ROMBEL" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Pilih Rombel Sasaran <span className="text-rose-500">*</span>
              </label>
              <select
                value={targetRombelId}
                onChange={(e) => setTargetRombelId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              >
                <option value="">-- Pilih Rombel --</option>
                {availableRombels.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nama}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Konten */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Isi Pengumuman <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={5}
              value={konten}
              onChange={(e) => setKonten(e.target.value)}
              placeholder="Tuliskan rincian informasi pengumuman secara jelas..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-y"
            />
          </div>

          {/* Lampiran URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Tautan Lampiran Dokumen (Opsional)
            </label>
            <div className="relative flex items-center">
              <Paperclip className="absolute left-3.5 size-4 text-slate-400" />
              <input
                type="url"
                value={lampiranUrl}
                onChange={(e) => setLampiranUrl(e.target.value)}
                placeholder="https://... atau /api/berkas/..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Pinned Toggle */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <input
              type="checkbox"
              id="pinned-checkbox"
              checked={apakahDisematkan}
              onChange={(e) => setApakahDisematkan(e.target.checked)}
              className="size-4 rounded text-blue-600 focus:ring-blue-500/20 border-slate-300 dark:border-slate-600"
            />
            <label
              htmlFor="pinned-checkbox"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <Pin className="size-3.5 text-blue-600 dark:text-blue-400 rotate-45" />
              <span>Sematkan di Bagian Atas (Featured / Pinned)</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors active:scale-95 cursor-pointer"
          >
            Batal
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(false)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <FileText className="size-3.5 text-slate-500" />
              <span>Simpan Draf</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-blue-700 text-white transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
              <span>Terbitkan Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
