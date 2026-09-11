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
        target_rombel_id: targetAudiens === "ROMBEL" ? targetRombelId : null,
        apakah_disematkan: apakahDisematkan,
        lampiran_url: lampiranUrl.trim() || null,
        status: isPublish ? "PUBLISHED" : "DRAFT",
      };

      const res = await createAnnouncementAction(payload);
      if (!res.success) {
        setErrorMessage(res.message);
        return;
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Buat Pengumuman Baru</h3>
              <p className="text-xs text-slate-500">
                Publikasikan informasi resmi ke komunitas sekolah
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {errorMessage && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Judul */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Judul Pengumuman <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Jadwal Pelaksanaan Asesmen Tengah Semester Ganjil"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Kategori & Audiens Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value as AnnouncementCategory)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="UMUM">Umum</option>
                <option value="AKADEMIK">Akademik</option>
                <option value="KEGIATAN">Kegiatan Sekolah</option>
                <option value="PENTING">Penting</option>
                <option value="DARURAT">Darurat / Mendesak</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sasaran Audiens</label>
              <select
                value={targetAudiens}
                onChange={(e) => setTargetAudiens(e.target.value as AudienceTarget)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pilih Rombel Sasaran <span className="text-red-500">*</span>
              </label>
              <select
                value={targetRombelId}
                onChange={(e) => setTargetRombelId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Isi Pengumuman <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              value={konten}
              onChange={(e) => setKonten(e.target.value)}
              placeholder="Tuliskan rincian informasi pengumuman secara jelas..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-y"
            />
          </div>

          {/* Lampiran URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tautan Lampiran Dokumen (Opsional)
            </label>
            <div className="relative flex items-center">
              <Paperclip className="absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                type="url"
                value={lampiranUrl}
                onChange={(e) => setLampiranUrl(e.target.value)}
                placeholder="https://... atau /api/berkas/..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Pinned Toggle */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <input
              type="checkbox"
              id="pinned-checkbox"
              checked={apakahDisematkan}
              onChange={(e) => setApakahDisematkan(e.target.checked)}
              className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500/20 border-slate-300"
            />
            <label
              htmlFor="pinned-checkbox"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer"
            >
              <Pin className="h-3.5 w-3.5 text-blue-600 rotate-45" />
              <span>Sematkan di Bagian Atas (Featured / Pinned)</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            Batal
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(false)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <FileText className="h-3.5 w-3.5 text-slate-500" />
              <span>Simpan Draf</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              <span>Terbitkan Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
