import * as React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface StatTrend {
  value: string;
  label?: string;
  isPositive?: boolean;
}

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: StatTrend;
  watermarkIcon?: React.ReactNode;
  description?: string;
  badge?: string;
  phaseDeferredNote?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  watermarkIcon,
  description,
  badge,
  phaseDeferredNote,
  className = "",
}: StatCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white border border-slate-100/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(37,99,235,0.08)] hover:border-blue-100 transition-all duration-200 p-5 flex flex-col justify-between ${className}`}
    >
      {/* Background Watermark Icon if provided */}
      {watermarkIcon && (
        <div className="absolute -right-2 -bottom-2 text-slate-200/40 pointer-events-none transform -rotate-6 select-none">
          {watermarkIcon}
        </div>
      )}

      <div>
        <div className="flex items-start justify-between gap-3">
          {icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB] shadow-sm border border-blue-100/60 flex-shrink-0">
              {icon}
            </div>
          )}

          {badge && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
              {badge}
            </span>
          )}
        </div>

        <div className="mt-3.5 space-y-1">
          <span className="text-xs font-semibold text-slate-500 tracking-wide block truncate">
            {label}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
            {value}
          </div>
        </div>
      </div>

      {/* Trend indicator or description */}
      {(trend || description || phaseDeferredNote) && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col gap-1.5 z-10">
          {trend && (
            <div className="flex items-center gap-1.5 text-xs">
              <span
                className={`inline-flex items-center gap-0.5 font-bold ${
                  trend.isPositive !== false ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {trend.isPositive !== false ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                <span>{trend.value}</span>
              </span>
              {trend.label && (
                <span className="text-slate-400 text-[11px] font-medium truncate">
                  {trend.label}
                </span>
              )}
            </div>
          )}

          {description && (
            <span className="text-xs text-slate-500 leading-relaxed truncate">{description}</span>
          )}

          {phaseDeferredNote && (
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-md w-fit">
              <span>ℹ️</span> {phaseDeferredNote}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

