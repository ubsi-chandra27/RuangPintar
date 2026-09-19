"use client";

import * as React from "react";

export interface BarChartItem {
  label: string; // Misal "Senin", "Selasa"
  value1: number; // Misal Sesi Terlaksana
  value2?: number; // Misal Sesi Terjadwal
  subtext?: string;
}

export interface StaggeredBarChartProps {
  title?: string;
  subtitle?: string;
  data: BarChartItem[];
  maxVal?: number;
  legend1?: string;
  legend2?: string;
  className?: string;
}

export function StaggeredBarChart({
  title = "Kepatuhan Jadwal KBM Mingguan",
  subtitle = "Sesi pembelajaran yang terlaksana vs terjadwal",
  data,
  maxVal,
  legend1 = "Terlaksana",
  legend2 = "Terjadwal",
  className = "",
}: StaggeredBarChartProps) {
  const [mounted, setMounted] = React.useState(false);
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 120);
    return () => clearTimeout(t);
  }, []);

  const computedMax = React.useMemo(() => {
    if (maxVal) return maxVal;
    const all = data.flatMap((d) => [d.value1, d.value2 || 0]);
    const m = Math.max(...all, 10);
    return Math.ceil(m * 1.15); // Add 15% headspace
  }, [data, maxVal]);

  return (
    <div
      className={`rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between ${className}`}
    >
      {/* Header & Legends */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Legend pills */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#2563EB]" />
            <span>{legend1}</span>
          </div>
          {legend2 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400" />
              <span>{legend2}</span>
            </div>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-56 pt-6 pb-2 flex items-end justify-between gap-2 sm:gap-4 relative">
        {data.map((item, idx) => {
          const heightPct1 = (item.value1 / computedMax) * 100;
          const heightPct2 = item.value2 ? (item.value2 / computedMax) * 100 : 0;
          const isHovered = hoveredIdx === idx;
          const transitionDelay = `${idx * 60}ms`;

          return (
            <div
              key={item.label}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
            >
              {/* Tooltip on Hover */}
              {isHovered && (
                <div className="absolute -top-12 z-20 px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-medium shadow-xl border border-slate-700/80 whitespace-nowrap animate-in fade-in zoom-in-95 pointer-events-none">
                  <p className="font-bold text-blue-400">{item.label}</p>
                  <p>
                    {legend1}: <span className="font-bold">{item.value1}</span>
                    {item.value2 !== undefined && ` / ${legend2}: ${item.value2}`}
                  </p>
                </div>
              )}

              {/* Bars container */}
              <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-44">
                {/* Bar 1: Primary Blue */}
                <div
                  className="w-full max-w-[18px] sm:max-w-[24px] rounded-t-md bg-[#2563EB] hover:bg-blue-500 transition-all duration-700 ease-out shadow-xs group-hover:scale-y-[1.03] origin-bottom"
                  style={{
                    height: mounted ? `${Math.max(heightPct1, 4)}%` : "0%",
                    transitionDelay,
                  }}
                />

                {/* Bar 2: Secondary Emerald */}
                {item.value2 !== undefined && (
                  <div
                    className="w-full max-w-[18px] sm:max-w-[24px] rounded-t-md bg-emerald-400 hover:bg-emerald-300 transition-all duration-700 ease-out shadow-xs group-hover:scale-y-[1.03] origin-bottom"
                    style={{
                      height: mounted ? `${Math.max(heightPct2, 4)}%` : "0%",
                      transitionDelay: `${idx * 60 + 30}ms`,
                    }}
                  />
                )}
              </div>

              {/* X-Axis Label */}
              <span
                className={`text-[11px] mt-2 font-medium transition-colors truncate max-w-full ${
                  isHovered
                    ? "text-[#2563EB] dark:text-blue-400 font-bold"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
