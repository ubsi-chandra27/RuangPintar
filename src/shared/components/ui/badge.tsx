import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "neutral" | "info" | "success" | "warning" | "danger" | "cobalt" | "academic";
}

export function Badge({ className = "", variant = "neutral", children, ...props }: BadgeProps) {
  const variantStyles: Record<string, string> = {
    neutral: "bg-slate-100 text-slate-700 border-slate-200/80",
    info: "bg-sky-50 text-sky-700 border-sky-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    cobalt: "bg-blue-50 text-blue-700 border-blue-200",
    academic: "bg-slate-900 text-white border-slate-800",
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors ${
        variantStyles[variant] || variantStyles.neutral
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
