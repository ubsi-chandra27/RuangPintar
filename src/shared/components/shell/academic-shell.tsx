"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileDrawer } from "./mobile-drawer";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { BreadcrumbItem } from "./breadcrumb";
import { BaseRole, CapabilityBundle } from "@/shared/infrastructure/authorization/types";

export interface AcademicShellProps {
  user: {
    id: string;
    username: string;
    nama_lengkap: string;
    peran_dasar: string;
    sekolah_id?: string | null;
    foto_url?: string | null;
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

  // Global Keyboard Shortcut: Cmd+B / Ctrl+B to toggle sidebar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setIsSidebarCollapsed((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Scrollable Page Body with bottom clearance on mobile (< md) for MobileBottomNav */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-12 pt-2">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (< md) */}
      <MobileBottomNav
        userRole={user.peran_dasar as BaseRole}
        userCapabilities={userCapabilities}
        onOpenMenu={() => setIsMobileDrawerOpen(true)}
      />
    </div>
  );
}
