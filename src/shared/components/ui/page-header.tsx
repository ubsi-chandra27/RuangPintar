import * as React from "react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  breadcrumb,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`flex flex-col gap-3 pb-6 ${className}`}>
      {breadcrumb && <div className="text-sm">{breadcrumb}</div>}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">{actions}</div>}
      </div>
    </div>
  );
}
