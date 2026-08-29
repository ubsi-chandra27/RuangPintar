import * as React from "react";

export function DashboardGrid({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {children}
    </div>
  );
}

export function DashboardContentLayout({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`grid grid-cols-1 gap-6 lg:grid-cols-3 ${className}`}>{children}</div>;
}
