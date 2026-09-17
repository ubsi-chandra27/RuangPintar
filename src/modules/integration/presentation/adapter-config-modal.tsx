"use client";

/**
 * Ruang Pintar — Adapter Configuration Modal (M20 Integration)
 * Academic Glass UI v1.2
 */

import React, { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  IntegrationServiceType,
  IntegrationProvider,
  IntegrationStatus,
} from "../domain/integration-types";
import { updateIntegrationConfigAction } from "@/app/actions/integration-actions";
import { Loader2, Key, CheckCircle2, ShieldAlert, X } from "lucide-react";

interface AdapterConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType: IntegrationServiceType;
  serviceName: string;
  currentProvider: IntegrationProvider;
  currentStatus: IntegrationStatus;
  onSuccess: () => void;
}

const emptySubscribe = () => () => {};

export function AdapterConfigModal({
  isOpen,
  onClose,
  serviceType,
  serviceName,
  currentProvider,
  currentStatus,
  onSuccess,
}: AdapterConfigModalProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [provider, setProvider] = useState<IntegrationProvider>(currentProvider);
  const [status, setStatus] = useState<IntegrationStatus>(currentStatus);
  const [apiKey, setApiKey] = useState("");
  const [senderInfo, setSenderInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isMounted || !isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await updateIntegrationConfigAction({
        tipe_layanan: serviceType,
        nama_konfigurasi: `${serviceName} Config`,
        provider,
        status,
        kredensial: apiKey ? { api_key: apiKey } : undefined,
        parameter: senderInfo ? { sender: senderInfo } : undefined,
      });

      onSuccess();
      onClose();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Gagal menyimpan konfigurasi");
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
            <div className="p-2.5 rounded-2xl bg-blue-50 text-[#2563EB] border border-blue-200/60">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Pengaturan: {serviceName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Konfigurasi provider dan kredensial koneksi layanan eksternal
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Mode Operasi Layanan</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as IntegrationStatus)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <SelectItemOption value="SIMULASI" label="Simulasi (Dev / Uji Coba Tanpa Pulsa)" />
              <SelectItemOption value="AKTIF" label="Aktif (Live Production Gateway)" />
              <SelectItemOption value="NONAKTIF" label="Nonaktif (Matikan Layanan)" />
            </select>
            <p className="text-[11px] text-slate-400">
              {status === "SIMULASI"
                ? "Mode aman: log tercatat tanpa memotong kuota/saldo nyata."
                : "Mode produksi: memerlukan API key sah dari provider."}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Pilihan Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as IntegrationProvider)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              {serviceType === "WHATSAPP" && (
                <>
                  <SelectItemOption value="WHATSAPP_FONNTE" label="Fonnte WhatsApp Gateway" />
                  <SelectItemOption value="WHATSAPP_META" label="Meta WhatsApp Cloud API" />
                </>
              )}
              {serviceType === "PUSH_NOTIFICATION" && (
                <SelectItemOption value="FCM" label="Google Firebase Cloud Messaging (FCM)" />
              )}
              {serviceType === "EMAIL" && (
                <>
                  <SelectItemOption value="RESEND" label="Resend Email API" />
                  <SelectItemOption value="SMTP" label="Custom SMTP Server" />
                </>
              )}
              {serviceType === "STORAGE" && (
                <>
                  <SelectItemOption value="LOCAL_DISK" label="Penyimpanan Lokal Server" />
                  <SelectItemOption value="S3" label="Amazon S3 / MinIO Compatible" />
                </>
              )}
              {serviceType === "WEBHOOK" && (
                <SelectItemOption value="CUSTOM_WEBHOOK" label="Custom HTTP Webhook Dispatcher" />
              )}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              API Key / Token Rahasia
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={
                status === "SIMULASI" ? "Opsional untuk mode simulasi" : "Masukkan API key provider"
              }
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-mono bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Sender Identifier / Nomor Pengirim
            </label>
            <input
              type="text"
              value={senderInfo}
              onChange={(e) => setSenderInfo(e.target.value)}
              placeholder="Contoh: 081234567890 atau notifikasi@sekolah.sch.id"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
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
              className="px-5 py-2 text-xs font-bold bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Simpan Konfigurasi</span>
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

function SelectItemOption({ value, label }: { value: string; label: string }) {
  return <option value={value}>{label}</option>;
}
