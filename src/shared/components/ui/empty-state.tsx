import * as React from "react";
import { Info } from "lucide-react";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  phaseDeferredNote?: string;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  phaseDeferredNote,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/80 bg-white/60 backdrop-blur-sm p-8 text-center sm:p-12 ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm ring-8 ring-blue-50/50 mb-4">
        {icon || <Info className="h-6 w-6" />}
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md leading-relaxed mb-4">{description}</p>

      {phaseDeferredNote && (
        <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50/80 border border-amber-200/60 px-3 py-1.5 text-xs text-amber-800 font-medium mb-4">
          <span>ℹ️</span>
          <span>{phaseDeferredNote}</span>
        </div>
      )}

      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
