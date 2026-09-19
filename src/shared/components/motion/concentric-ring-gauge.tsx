"use client";

import * as React from "react";
import { AnimatedCounter } from "./animated-counter";

export interface RingSegment {
  id: string;
  label: string;
  count: number;
  percentage: number;
  color: string; // Hex atau Tailwind color
  strokeColor: string;
  bgColor: string;
}

export interface ConcentricRingGaugeProps {
  title?: string;
  subtitle?: string;
  centerValue: number; // Misal 96.4
  centerLabel?: string;
  segments: RingSegment[];
  className?: string;
}

export function ConcentricRingGauge({
  title = "Distribusi Partisipasi & Kehadiran",
  subtitle = "Rangkuman keterlibatan siswa seluruh rombel",
  centerValue,
  centerLabel = "Tingkat Kehadiran",
  segments,
  className = "",
}: ConcentricRingGaugeProps) {
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // Berikan sedikit jeda sebelum cincin berputar
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Konfigurasi radius 3 cincin konsentris
  // Ring 0 (Luar), Ring 1 (Tengah), Ring 2 (Dalam)
  const ringConfigs = [
    { radius: 80, strokeWidth: 10 },
    { radius: 64, strokeWidth: 10 },
    { radius: 48, strokeWidth: 10 },
  ];

  return (
    <div
      className={`rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between ${className}`}
    >
      {/* Header Card */}
      <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{title}</span>
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Main Gauge Graphic */}
      <div className="py-4 flex flex-col sm:flex-row items-center justify-center gap-6">
        <div className="relative w-52 h-52 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
            {segments.map((seg, idx) => {
              const cfg = ringConfigs[idx] || { radius: 32, strokeWidth: 8 };
              const circumference = 2 * Math.PI * cfg.radius;
              const targetOffset = circumference - (seg.percentage / 100) * circumference;
              const currentOffset = mounted ? targetOffset : circumference;
              const isHovered = hoveredId === seg.id;

              return (
                <g key={seg.id} className="transition-all duration-300">
                  {/* Background Track Circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r={cfg.radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={cfg.strokeWidth}
                    className="text-slate-100 dark:text-slate-800/70"
                  />

                  {/* Animated Value Ring */}
                  <circle
                    cx="100"
                    cy="100"
                    r={cfg.radius}
                    fill="none"
                    stroke={seg.strokeColor}
                    strokeWidth={isHovered ? cfg.strokeWidth + 2.5 : cfg.strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={currentOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out cursor-pointer drop-shadow-xs"
                    onMouseEnter={() => setHoveredId(seg.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  />
                </g>
              );
            })}
          </svg>

          {/* Center Info with Animated Counter */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              <AnimatedCounter value={centerValue} decimals={1} suffix="%" duration={1.4} />
            </span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mt-0.5">
              {centerLabel}
            </span>
          </div>
        </div>

        {/* Legend & Breakdown (Interaktif Hover) */}
        <div className="flex-1 w-full space-y-2.5">
          {segments.map((seg) => {
            const isHovered = hoveredId === seg.id;
            return (
              <div
                key={seg.id}
                onMouseEnter={() => setHoveredId(seg.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                  isHovered
                    ? "bg-slate-50 dark:bg-slate-800/90 border-blue-400/40 shadow-xs translate-x-1"
                    : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: seg.strokeColor }}
                  />
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {seg.label}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {seg.count.toLocaleString("id-ID")} entri
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                    <AnimatedCounter
                      value={seg.percentage}
                      decimals={1}
                      suffix="%"
                      duration={1.2}
                    />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
