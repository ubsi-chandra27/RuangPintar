"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastProps {
  type: ToastType;
  message: string;
  description?: string;
  onClose: () => void;
  duration?: number;
}

const emptySubscribe = () => () => {};

export function Toast({
  type,
  message,
  description,
  onClose,
  duration = 4000,
}: ToastProps) {
  const isMounted = React.useSyncExternalStore(emptySubscribe, () => true, () => false);

  React.useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isMounted) return null;

  const config = {
    success: {
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
      bgIcon: "bg-emerald-50 border-emerald-100",
      border: "border-emerald-100/90 shadow-emerald-500/10",
      titleColor: "text-slate-900",
    },
    error: {
      icon: <AlertCircle className="h-5 w-5 text-rose-600" />,
      bgIcon: "bg-rose-50 border-rose-100",
      border: "border-rose-100/90 shadow-rose-500/10",
      titleColor: "text-slate-900",
    },
    info: {
      icon: <Info className="h-5 w-5 text-[#2563EB]" />,
      bgIcon: "bg-blue-50 border-blue-100",
      border: "border-blue-100/90 shadow-blue-500/10",
      titleColor: "text-slate-900",
    },
  }[type];

  return createPortal(
    <div
      role="alert"
      aria-live="polite"
      className="fixed top-6 right-6 z-50 flex items-center justify-end pointer-events-none"
    >
      <div
        className={`pointer-events-auto flex items-start gap-3.5 p-4 pr-3 rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl border ${config.border} min-w-[320px] max-w-md animate-in slide-in-from-top-4 fade-in-0 duration-300`}
      >
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl border flex-shrink-0 ${config.bgIcon}`}
        >
          {config.icon}
        </div>

        <div className="flex-1 pt-0.5">
          <p className={`text-xs sm:text-[13px] font-bold ${config.titleColor}`}>
            {message}
          </p>
          {description && (
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup Notifikasi"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0 ml-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>,
    document.body
  );
}
