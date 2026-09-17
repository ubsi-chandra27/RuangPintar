"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Camera,
  Clock,
  Layers,
  FileDown,
  Lock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { SmartPhotoOnboardingModal } from "./smart-photo-onboarding-modal";
import { AiPreviewTableModal } from "./ai-preview-table-modal";
import { ClassExtractionResult, TeacherTrialStatusDTO } from "../domain/ai-types";
import { getTeacherTrialStatusAction } from "@/app/actions/smart-onboarding-actions";

export function TrialBanner() {
  const [trialStatus, setTrialStatus] = useState<TeacherTrialStatusDTO | null>(null);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [extractionResult, setExtractionResult] = useState<ClassExtractionResult | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    async function loadStatus() {
      const res = await getTeacherTrialStatusAction();
      if (res.success && res.data) {
        setTrialStatus(res.data as TeacherTrialStatusDTO);
      }
    }
    loadStatus();
  }, []);

  function handleExtractionComplete(res: ClassExtractionResult) {
    setExtractionResult(res);
    setPhotoModalOpen(false);
    setPreviewModalOpen(true);
  }

  function handleClassCreated(rombelId: string, namaRombel: string) {
    setPreviewModalOpen(false);
    setSuccessToast(`Kelas "${namaRombel}" berhasil diterbitkan dan siap diabsen!`);

    // Reload status
    getTeacherTrialStatusAction().then((res) => {
      if (res.success && res.data) {
        setTrialStatus(res.data as TeacherTrialStatusDTO);
      }
    });

    // Refresh halaman setelah 1 detik
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  }

  function handlePrintProposal() {
    window.print();
  }

  // Jika bukan trial/freemium, sembunyikan banner atau tampilkan versi ringkas
  if (!trialStatus || !trialStatus.is_trial) return null;

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900/90 via-sky-950/30 to-emerald-950/30 border border-sky-500/20 p-4 sm:p-5 shadow-xl backdrop-blur-md mb-6">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                Paket Guru Mandiri — Uji Coba Gratis
              </span>
              <span className="text-xs text-slate-400">
                • {trialStatus.days_remaining} hari tersisa
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Buku Kerja Digital & Asisten Cerdas Guru
            </h3>

            <p className="text-xs text-slate-400 max-w-2xl">
              Gunakan kuota Anda ({trialStatus.current_rombel_count} / {trialStatus.max_rombel}{" "}
              kelas) untuk absensi kilat 15 detik dan cetak rekapitulasi Kurikulum Merdeka.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              onClick={() => setPhotoModalOpen(true)}
              disabled={!trialStatus.can_create_rombel}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera className="w-4 h-4" />
              <span>+ Buat Kelas via Foto AI</span>
            </button>

            <button
              onClick={handlePrintProposal}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
              title="Cetak Surat Usulan Lisensi Sekolah"
            >
              <FileDown className="w-4 h-4 text-emerald-400" />
              <span>Cetak Usulan ke Kepsek</span>
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}
      </div>

      {/* Modals */}
      <SmartPhotoOnboardingModal
        isOpen={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        onExtractionComplete={handleExtractionComplete}
      />

      <AiPreviewTableModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        onSuccess={handleClassCreated}
        extractionData={extractionResult}
      />
    </>
  );
}
