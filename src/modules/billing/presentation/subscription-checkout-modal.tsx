"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  QrCode,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Clock,
  RefreshCw,
  Zap,
} from "lucide-react";
import {
  initiateProCheckoutAction,
  checkOrderStatusAction,
  simulatePaymentSuccessAction,
} from "@/app/actions/billing-actions";
import { SubscriptionOrderDTO } from "../domain/billing-types";

interface SubscriptionCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialOrderId?: string;
}

export function SubscriptionCheckoutModal({
  isOpen,
  onClose,
  onSuccess,
}: SubscriptionCheckoutModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [order, setOrder] = useState<SubscriptionOrderDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleClose = () => {
    setOrder(null);
    setIsSuccess(false);
    setErrorMessage(null);
    onClose();
  };

  // Inisiasi pesanan saat modal dibuka
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    startTransition(async () => {
      setLoading(true);
      setErrorMessage(null);
      const res = await initiateProCheckoutAction(1);
      if (!isMounted) return;
      setLoading(false);
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        setErrorMessage(res.error || "Gagal membuat sesi pembayaran.");
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Polling status pembayaran otomatis setiap 3 detik jika status masih PENDING
  useEffect(() => {
    if (!isOpen || !order || order.status === "PAID" || isSuccess) {
      return;
    }

    const interval = setInterval(async () => {
      const res = await checkOrderStatusAction(order.order_id);
      if (res.success && res.data && res.data.status === "PAID") {
        setIsSuccess(true);
        setOrder(res.data);
        if (onSuccess) onSuccess();
        router.refresh();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, order, isSuccess, onSuccess, router]);

  // Handler simulasi sukses (untuk pengujian & demo)
  const handleSimulatePayment = () => {
    if (!order) return;
    setLoading(true);
    startTransition(async () => {
      const res = await simulatePaymentSuccessAction(order.order_id);
      setLoading(false);
      if (res.success && res.data) {
        setOrder(res.data);
        setIsSuccess(true);
        if (onSuccess) onSuccess();
        router.refresh();
      } else {
        setErrorMessage(res.error || "Gagal menyimulasikan pembayaran.");
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/75 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Pembayaran Paket Guru Pro
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Otomatis via QRIS Resmi Bank Indonesia
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Modal */}
        <div className="p-6">
          {loading && !order ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                Menyiapkan barcode QRIS transaksi Anda...
              </p>
            </div>
          ) : errorMessage && !order ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center dark:border-red-900/50 dark:bg-red-950/30">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">{errorMessage}</p>
              <button
                onClick={handleClose}
                className="mt-3 text-xs font-semibold text-red-600 underline hover:text-red-700"
              >
                Tutup Jendela
              </button>
            </div>
          ) : isSuccess ? (
            /* Tampilan Berhasil */
            <div className="flex flex-col items-center justify-center py-6 text-center animate-in zoom-in-95 duration-300">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h4 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                Pembayaran Berhasil Diterima! 🎉
              </h4>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
                Selamat! Akun Anda kini aktif sebagai{" "}
                <span className="font-bold text-blue-600 dark:text-blue-400">Guru Pro</span> selama
                30 hari ke depan.
              </p>

              <div className="mt-6 w-full rounded-xl border border-slate-100 bg-slate-50 p-4 text-left dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex justify-between text-xs py-1">
                  <span className="text-slate-500">Nomor Pesanan:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {order?.order_id}
                  </span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-slate-500">Jumlah Dibayar:</span>
                  <span className="font-bold text-emerald-600">Rp 15.000</span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-slate-500">Metode:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    QRIS Instan
                  </span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-slate-500">Status Lisensi:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-blue-600">
                    <Sparkles className="h-3.5 w-3.5" /> GURU PRO AKTIF
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  handleClose();
                  router.push("/dashboard");
                  router.refresh();
                }}
                className="mt-6 w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:bg-blue-700 active:scale-[0.98]"
              >
                Mulai Mengajar dengan Guru Pro 🚀
              </button>
            </div>
          ) : (
            /* Tampilan QRIS Menunggu Pembayaran */
            <div>
              {/* Rincian Paket */}
              <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/70 p-3.5 dark:border-blue-950 dark:bg-blue-950/30">
                <div>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    PAKET BERLANGGANAN
                  </span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Guru Pro — 1 Bulan Penuh
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Total Tagihan</span>
                  <p className="text-lg font-black text-blue-600 dark:text-blue-400">Rp 15.000</p>
                </div>
              </div>

              {/* Tampilan Barcode QRIS */}
              <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-950">
                {/* Header QRIS Resmi */}
                <div className="mb-2 text-center">
                  <span className="text-[11px] font-bold tracking-wider text-slate-700 dark:text-slate-300">
                    QRIS • STANDAR PEMBAYARAN NASIONAL
                  </span>
                </div>

                {/* Simulated / Real QR Graphic */}
                <div className="relative flex h-52 w-52 items-center justify-center rounded-lg border-2 border-slate-900 bg-white p-2">
                  <svg
                    viewBox="0 0 100 100"
                    className="h-full w-full text-slate-900"
                    fill="currentColor"
                  >
                    {/* QR Code Pattern Graphic */}
                    <rect x="0" y="0" width="28" height="28" fill="currentColor" />
                    <rect x="4" y="4" width="20" height="20" fill="white" />
                    <rect x="8" y="8" width="12" height="12" fill="currentColor" />

                    <rect x="72" y="0" width="28" height="28" fill="currentColor" />
                    <rect x="76" y="4" width="20" height="20" fill="white" />
                    <rect x="80" y="8" width="12" height="12" fill="currentColor" />

                    <rect x="0" y="72" width="28" height="28" fill="currentColor" />
                    <rect x="4" y="76" width="20" height="20" fill="white" />
                    <rect x="8" y="80" width="12" height="12" fill="currentColor" />

                    {/* Inner dynamic dots */}
                    <rect x="36" y="8" width="6" height="6" />
                    <rect x="48" y="14" width="8" height="6" />
                    <rect x="40" y="24" width="6" height="8" />
                    <rect x="58" y="4" width="6" height="6" />
                    <rect x="10" y="38" width="8" height="6" />
                    <rect x="22" y="46" width="6" height="8" />
                    <rect x="34" y="40" width="12" height="12" />
                    <rect x="52" y="36" width="8" height="8" />
                    <rect x="66" y="44" width="10" height="6" />
                    <rect x="84" y="36" width="8" height="8" />
                    <rect x="38" y="60" width="8" height="8" />
                    <rect x="52" y="56" width="10" height="6" />
                    <rect x="68" y="62" width="8" height="12" />
                    <rect x="84" y="58" width="8" height="8" />
                    <rect x="38" y="78" width="10" height="8" />
                    <rect x="54" y="74" width="8" height="10" />
                    <rect x="68" y="82" width="14" height="6" />
                    <rect x="86" y="78" width="8" height="10" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-md bg-white p-1 shadow-md border border-slate-200">
                      <span className="text-[10px] font-black text-blue-600">RP</span>
                    </div>
                  </div>
                </div>

                {/* E-wallet Logo Badges */}
                <p className="mt-2 text-center text-[11px] text-slate-500 dark:text-slate-400">
                  Dapat di-scan dengan:{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    BCA • Mandiri • BRI • BNI • GoPay • Dana • OVO • ShopeePay
                  </span>
                </p>

                {/* Order ID & Status Polling */}
                <div className="mt-3 flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                  <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
                  <span>
                    Order: <strong className="font-mono">{order?.order_id}</strong>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1 text-amber-600 font-medium">
                    <Clock className="h-3 w-3" /> Menunggu Pembayaran
                  </span>
                </div>
              </div>

              {/* Panduan Singkat */}
              <div className="mt-3 flex items-start gap-2 text-xs text-slate-500">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                <span>
                  Buka aplikasi mobile banking atau dompet digital Anda, pilih menu{" "}
                  <strong>Scan QRIS</strong>, dan konfirmasi nominal <strong>Rp 15.000</strong>.
                  Akun akan aktif seketika tanpa perlu kirim bukti transfer.
                </span>
              </div>

              {/* Tombol Simulasi Pengujian (Hanya muncul jika simulator aktif) */}
              {order?.is_simulator && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-center dark:border-amber-900/50 dark:bg-amber-950/30">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                    <Zap className="h-4 w-4 text-amber-600" />
                    <span>Mode Pengujian & Demonstrasi SaaS</span>
                  </div>
                  <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">
                    Simulasikan pembayaran QRIS berhasil untuk memverifikasi alur aktivasi Guru Pro
                    tanpa mengurangi saldo asli:
                  </p>
                  <button
                    type="button"
                    onClick={handleSimulatePayment}
                    disabled={isPending}
                    className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {isPending ? "Memproses..." : "⚡ Simulasi Bayar QRIS Sukses (Instan)"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
