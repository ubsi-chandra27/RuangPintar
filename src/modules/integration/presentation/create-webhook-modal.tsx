"use client";

/**
 * Ruang Pintar — Create Webhook Endpoint Modal (M20 Integration)
 * Academic Glass UI v1.2
 */

import React, { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { WEBHOOK_AVAILABLE_EVENTS } from "../domain/integration-types";
import { createWebhookEndpointAction } from "@/app/actions/integration-actions";
import { Loader2, Plus, Webhook, ShieldAlert, Check, X } from "lucide-react";

interface CreateWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const emptySubscribe = () => () => {};

export function CreateWebhookModal({ isOpen, onClose, onSuccess }: CreateWebhookModalProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [nama, setNama] = useState("");
  const [urlTarget, setUrlTarget] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    "PRESENSI_SESI_SELESAI",
    "SISWA_TERCATAT_ALPHA",
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isMounted || !isOpen) return null;

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !urlTarget.trim()) {
      setErrorMessage("Nama dan URL target webhook wajib diisi.");
      return;
    }
    if (selectedEvents.length === 0) {
      setErrorMessage("Minimal pilih 1 event pemicu webhook.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await createWebhookEndpointAction({
        nama,
        url_target: urlTarget,
        event_langganan: selectedEvents,
        status: "AKTIF",
        retry_count_max: 3,
        timeout_detik: 10,
      });

      onSuccess();
      onClose();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Gagal mendaftarkan webhook");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200/60">
              <Webhook className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Tambah Webhook Baru
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kirimkan notifikasi HTTP POST otomatis saat event sekolah terjadi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Nama Integrasi Webhook</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Server Bot WA Sekolah / Web Dinas"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              URL Target Webhook (Endpoint)
            </label>
            <input
              type="url"
              value={urlTarget}
              onChange={(e) => setUrlTarget(e.target.value)}
              placeholder="https://api.sekolah-mitra.id/webhook/ruangpintar"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-mono bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Pilih Event Domain yang Memicu Webhook
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {WEBHOOK_AVAILABLE_EVENTS.map((ev) => {
                const isChecked = selectedEvents.includes(ev.event);
                return (
                  <div
                    key={ev.event}
                    onClick={() => toggleEvent(ev.event)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isChecked
                        ? "bg-indigo-50/70 border-indigo-200 text-indigo-900"
                        : "bg-slate-50/50 border-slate-200/70 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                        isChecked
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold block">{ev.label}</span>
                      <span className="text-[11px] text-slate-400 block leading-tight">
                        {ev.deskripsi}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Mendaftarkan...</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  <span>Daftarkan Webhook</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
