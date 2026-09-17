"use client";

import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useSyncExternalStore } from "react";
import {
  Camera,
  UploadCloud,
  Sparkles,
  Loader2,
  X,
  AlertCircle,
  FileText,
  Check,
} from "lucide-react";
import { processClassPhotoAction } from "@/app/actions/smart-onboarding-actions";
import { ClassExtractionResult } from "../domain/ai-types";

interface SmartPhotoOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtractionComplete: (result: ClassExtractionResult) => void;
}

export function SmartPhotoOnboardingModal({
  isOpen,
  onClose,
  onExtractionComplete,
}: SmartPhotoOnboardingModalProps) {
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [namaKelasHint, setNamaKelasHint] = useState("");
  const [mataPelajaranHint, setMataPelajaranHint] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState("image/jpeg");
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isMounted || !isOpen) return null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  }

  async function handleScan() {
    if (!selectedImage) {
      setErrorMessage("Silakan pilih atau ambil foto lembar absensi terlebih dahulu.");
      return;
    }

    setProcessing(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("imageBase64", selectedImage);
    formData.append("mimeType", mimeType);
    if (namaKelasHint.trim()) formData.append("namaKelasHint", namaKelasHint.trim());
    if (mataPelajaranHint.trim()) formData.append("mataPelajaranHint", mataPelajaranHint.trim());

    const res = await processClassPhotoAction(formData);
    setProcessing(false);

    if (!res.success || !res.data) {
      setErrorMessage(res.error || "Gagal membaca foto lembar absensi.");
      return;
    }

    onExtractionComplete(res.data as ClassExtractionResult);
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-emerald-500/20 border border-sky-500/30 text-sky-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Buat Kelas Otomatis via Foto AI
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </h2>
              <p className="text-xs text-slate-400">
                Foto lembar kertas absensi kelas Anda, AI akan mengekstrak nama siswa secara instan.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={processing}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="p-5 sm:p-6 space-y-4">
          {/* Photo Dropzone */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Foto Lembar Absensi / Daftar Hadir Kertas <span className="text-rose-400">*</span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {selectedImage ? (
              <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-slate-950/60 p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedImage}
                      alt="Pratinjau Foto"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                      <Check className="w-3.5 h-3.5" />
                      Foto Terpilih Siap Pindai
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Klik ganti jika ingin memilih foto lain
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                >
                  Ganti Foto
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-8 px-4 border-2 border-dashed border-slate-700 hover:border-sky-500/60 bg-slate-950/50 hover:bg-slate-950/80 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all text-slate-400 group"
              >
                <div className="p-3 rounded-full bg-slate-900 border border-slate-800 text-sky-400 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-white block">
                    Ambil Foto Kamera HP atau Unggah Berkas
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Mendukung JPG, PNG, atau jepret langsung lembar kertas absensi
                  </span>
                </div>
              </button>
            )}
          </div>

          {/* Optional Hints */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Petunjuk Nama Kelas (Opsional)
              </label>
              <input
                type="text"
                value={namaKelasHint}
                onChange={(e) => setNamaKelasHint(e.target.value)}
                placeholder="Contoh: X MIPA 1"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Mata Pelajaran (Opsional)
              </label>
              <input
                type="text"
                value={mataPelajaranHint}
                onChange={(e) => setMataPelajaranHint(e.target.value)}
                placeholder="Contoh: Matematika"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 border-t border-slate-800 bg-slate-900/95 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleScan}
            disabled={processing || !selectedImage}
            className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                AI Sedang Membaca Kertas...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Pindai Lembar Absensi via AI
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
