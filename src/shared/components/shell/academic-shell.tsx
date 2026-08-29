"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileDrawer } from "./mobile-drawer";
import { BreadcrumbItem } from "./breadcrumb";
import { BaseRole, CapabilityBundle } from "@/shared/infrastructure/authorization/types";

export interface AcademicShellProps {
  user: {
    id: string;
    username: string;
    nama_lengkap: string;
    peran_dasar: string;
    sekolah_id?: string | null;
  };
  userCapabilities?: CapabilityBundle[];
  breadcrumbItems?: BreadcrumbItem[];
  children: React.ReactNode;
}

export function AcademicShell({
  user,
  userCapabilities = [],
  breadcrumbItems,
  children,
}: AcademicShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = React.useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC]">
      {/* Desktop Sidebar / Rail */}
      <Sidebar
        userRole={user.peran_dasar as BaseRole}
        userCapabilities={userCapabilities}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        userRole={user.peran_dasar as BaseRole}
        userCapabilities={userCapabilities}
      />

      {/* Main Content Viewport */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <Topbar
          user={user}
          breadcrumbItems={breadcrumbItems}
          onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
