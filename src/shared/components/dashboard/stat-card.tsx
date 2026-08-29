import * as React from "react";
import { Card } from "../ui/card";

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  badge?: string;
  phaseDeferredNote?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  description,
  badge,
  phaseDeferredNote,
  className = "",
}: StatCardProps) {
  return (
    <Card variant="statCard" className={`flex flex-col justify-between ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </span>
          <div className="text-2xl font-bold tracking-tight text-slate-900 mt-1">{value}</div>
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-sm border border-blue-100">
            {icon}
          </div>
        )}
      </div>

      {(description || phaseDeferredNote) && (
        <div className="mt-4 pt-3 border-t border-slate-100/80 flex flex-col gap-1 text-xs">
          {description && <span className="text-slate-500 leading-relaxed">{description}</span>}
          {phaseDeferredNote && (
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-medium">
              <span>ℹ️</span> {phaseDeferredNote}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
