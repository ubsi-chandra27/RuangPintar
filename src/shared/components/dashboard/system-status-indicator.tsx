"use client";

import * as React from "react";
import { Radio, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";

export type SystemHealthStatus = "normal" | "maintenance" | "incident";

export interface SystemStatusIndicatorProps {
  initialStatus?: SystemHealthStatus;
  className?: string;
}

export function SystemStatusIndicator({
  initialStatus = "normal",
  className = "",
}: SystemStatusIndicatorProps) {
  const [status, setStatus] = React.useState<SystemHealthStatus>(initialStatus);
  const [showTooltip, setShowTooltip] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowTooltip(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const config = {
    normal: {
      label: "Sistem Normal",
      desc: "Semua server & layanan berjalan lancar",
      dotColor: "bg-emerald-500",
      pingColor: "bg-emerald-400",
      textColor: "text-emerald-700 dark:text-emerald-400",
      borderColor: "border-emerald-400/40 dark:border-emerald-500/50",
      bgColor: "bg-emerald-500/10 dark:bg-emerald-950/40",
      glowColor: "shadow-[0_0_14px_rgba(16,185,129,0.35)]",
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    },
    maintenance: {
      label: "Pemeliharaan",
      desc: "Optimalisasi sistem sedang berlangsung",
      dotColor: "bg-amber-500",
      pingColor: "bg-amber-400",
      textColor: "text-amber-700 dark:text-amber-400",
      borderColor: "border-amber-400/40 dark:border-amber-500/50",
      bgColor: "bg-amber-500/10 dark:bg-amber-950/40",
      glowColor: "shadow-[0_0_14px_rgba(245,158,11,0.35)]",
      icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
    },
    incident: {
      label: "Gangguan Sistem",
      desc: "Terdapat kendala koneksi atau latensi tinggi",
      dotColor: "bg-rose-500",
      pingColor: "bg-rose-400",
      textColor: "text-rose-700 dark:text-rose-400",
      borderColor: "border-rose-400/40 dark:border-rose-500/50",
      bgColor: "bg-rose-500/10 dark:bg-rose-950/40",
      glowColor: "shadow-[0_0_14px_rgba(244,63,94,0.35)]",
      icon: <AlertCircle className="h-4 w-4 text-rose-500" />,
    },
  };

  const current = config[status];

  return (
    <div className={`relative inline-block ${className}`} ref={ref}>
      {/* Signal Status Trigger Button: Cukup ikon sinyal kecil tanpa tulisan teks */}
      <button
        type="button"
        onClick={() => setShowTooltip(!showTooltip)}
        aria-label={`Status Operasional: ${current.label}`}
        title={`Status: ${current.label} (${current.desc})`}
        className={`group flex items-center justify-center gap-1.5 p-1.5 px-2 rounded-full border ${current.borderColor} ${current.bgColor} ${current.glowColor} transition-all duration-300 backdrop-blur-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40`}
      >
        {/* Signal Waves Icon */}
        <Radio
          className={`h-3.5 w-3.5 ${current.textColor} transition-transform group-hover:scale-110`}
        />

        {/* Live Pulsing Beacon Dot */}
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${current.pingColor}`}
          />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${current.dotColor}`} />
        </span>
      </button>

      {/* Popover Card */}
      {showTooltip && (
        <div className="absolute right-0 sm:left-auto mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-750 shadow-2xl p-3 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            {current.icon}
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                {current.label}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{current.desc}</p>
            </div>
          </div>

          {/* Quick status selector / indicator guide */}
          <div className="mt-2.5 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Status Operasional Platform:
            </span>
            <button
              type="button"
              onClick={() => setStatus("normal")}
              className={`w-full flex items-center gap-2 p-1.5 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer ${
                status === "normal"
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
              <span>Normal (Hijau)</span>
            </button>
            <button
              type="button"
              onClick={() => setStatus("maintenance")}
              className={`w-full flex items-center gap-2 p-1.5 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer ${
                status === "maintenance"
                  ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
              <span>Pemeliharaan (Kuning)</span>
            </button>
            <button
              type="button"
              onClick={() => setStatus("incident")}
              className={`w-full flex items-center gap-2 p-1.5 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer ${
                status === "incident"
                  ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
              <span>Gangguan (Merah)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
