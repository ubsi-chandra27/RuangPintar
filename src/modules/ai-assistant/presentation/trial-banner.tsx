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
import { SchoolProposalModal } from "@/modules/school/presentation/school-proposal-modal";
import { SubscriptionCheckoutModal } from "@/modules/billing/presentation/subscription-checkout-modal";
import { QrCode } from "lucide-react";

export function TrialBanner() {
  const [trialStatus, setTrialStatus] = useState<TeacherTrialStatusDTO | null>(null);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [nearExpiryModalOpen, setNearExpiryModalOpen] = useState(false);
  const [extractionResult, setExtractionResult] = useState<ClassExtractionResult | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    async function loadStatus() {
      const res = await getTeacherTrialStatusAction();
      if (res.success && res.data) {
        const data = res.data as TeacherTrialStatusDTO;
        setTrialStatus(data);

        // Jika trial tersisa <= 3 hari dan belum pernah di-dismiss sesi ini, buka modal notifikasi
        if (data.is_trial && data.days_remaining <= 3) {
          const dismissed = sessionStorage.getItem("rp_dismissed_trial_alert");
          if (!dismissed) {
            setNearExpiryModalOpen(true);
          }
        }
      }
    }
    loadStatus();

    // Event listeners agar tombol di komponen lain bisa memicu modal
    const handleOpenPhoto = () => setPhotoModalOpen(true);
    const handleOpenCheckout = () => setCheckoutModalOpen(true);
    const handleOpenProposal = () => setProposalModalOpen(true);

    window.addEventListener("open-ai-photo-modal", handleOpenPhoto);
    window.addEventListener("open-subscription-modal", handleOpenCheckout);
    window.addEventListener("open-proposal-modal", handleOpenProposal);

    return () => {
      window.removeEventListener("open-ai-photo-modal", handleOpenPhoto);
      window.removeEventListener("open-subscription-modal", handleOpenCheckout);
      window.removeEventListener("open-proposal-modal", handleOpenProposal);
    };
  }, []);

  function handleExtractionComplete(res: ClassExtractionResult) {
    setExtractionResult(res);
    setPhotoModalOpen(false);
    setPreviewModalOpen(true);
  }

  function handleClassCreated(rombelId: string, namaRombel: string) {
    setPreviewModalOpen(false);
    setSuccessToast(`Kelas "${namaRombel}" berhasil diterbitkan dan siap diabsen!`);

    getTeacherTrialStatusAction().then((res) => {
      if (res.success && res.data) {
        setTrialStatus(res.data as TeacherTrialStatusDTO);
      }
    });

    setTimeout(() => {
      window.location.reload();
    }, 1200);
  }

  const handleDismissExpiryModal = () => {
    sessionStorage.setItem("rp_dismissed_trial_alert", "1");
    setNearExpiryModalOpen(false);
  };

  return (
    <>
      {/* Floating Success Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-2xl flex items-center gap-3 animate-fade-up">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-200" />
          <span>{successToast}</span>
          <button
            onClick={() => setSuccessToast(null)}
            className="ml-2 text-emerald-200 hover:text-white text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Near Expiry Academic Glass Modal (Hanya muncul jika masa uji coba <= 3 hari) */}
      {nearExpiryModalOpen && trialStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-up">
          <div className="w-full max-w-md rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-blue-500/30 p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#2563EB] dark:text-blue-400">
                  Pemberitahuan Lisensi
                </span>
                <h3 className="font-mono text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Masa Uji Coba Tersisa {trialStatus.days_remaining} Hari
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Masa uji coba gratis Guru Mandiri Anda akan segera berakhir. Anda dapat mengaktifkan
              Guru Pro secara mandiri atau mencetak surat usulan resmi untuk diajukan ke Kepala
              Sekolah.
            </p>

            <div className="space-y-2.5 pt-1">
              <button
                onClick={() => {
                  setNearExpiryModalOpen(false);
                  setCheckoutModalOpen(true);
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-mono text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <QrCode className="h-4 w-4" />
                <span>Upgrade Guru Pro (Rp 15.000 / bln)</span>
              </button>

              <button
                onClick={() => {
                  setNearExpiryModalOpen(false);
                  setProposalModalOpen(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <FileDown className="h-4 w-4 text-emerald-500" />
                <span>Cetak Usulan ke Kepala Sekolah</span>
              </button>

              <button
                onClick={handleDismissExpiryModal}
                className="w-full py-2 text-center text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              >
                Nanti Saja (Lanjutkan Mengajar)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Modals */}
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

      <SchoolProposalModal isOpen={proposalModalOpen} onClose={() => setProposalModalOpen(false)} />

      <SubscriptionCheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
      />
    </>
  );
}
