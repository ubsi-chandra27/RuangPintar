"use client";

import * as React from "react";
import { Menu, Search, PanelLeftClose, PanelLeft } from "lucide-react";
import { UserMenu } from "./user-menu";
import { NotificationEntry } from "./notification-entry";
import { ThemeSwitcher } from "./theme-switcher";
import { BreadcrumbItem } from "./breadcrumb";

export interface TopbarProps {
  user: {
    id: string;
    username: string;
    nama_lengkap: string;
    peran_dasar: string;
    sekolah_id?: string | null;
    foto_url?: string | null;
  };
  breadcrumbItems?: BreadcrumbItem[];
  onOpenMobileDrawer: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  className?: string;
}

export function Topbar({
  user,
  breadcrumbItems = [{ label: "Dashboard", href: "/dashboard", isCurrent: true }],
  onOpenMobileDrawer,
  isSidebarCollapsed = false,
  onToggleSidebar,
  className = "",
}: TopbarProps) {
  return (
    <header
      className={`sticky top-0 z-40 flex h-20 w-full items-center justify-between bg-[#F8FAFC]/90 dark:bg-[#090D16]/90 backdrop-blur-md px-3 sm:px-6 lg:px-8 border-b border-transparent dark:border-slate-800/40 transition-colors duration-200 ${className}`}
    >
      {/* Left side: Mobile Drawer Trigger + Desktop Sidebar Toggle + Dashboard Title */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Smartphone Drawer Trigger (< md) */}
        <button
          type="button"
          onClick={onOpenMobileDrawer}
          aria-label="Buka Menu Navigasi"
          className="md:hidden flex h-10 w-10 items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop Sidebar Toggle Button */}
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={isSidebarCollapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
            title={isSidebarCollapsed ? "Perluas Sidebar (Ctrl+B)" : "Ciutkan Sidebar (Ctrl+B)"}
            className="hidden md:flex h-10 w-10 items-center justify-center text-slate-400 hover:text-[#2563EB] hover:bg-slate-200/60 dark:hover:bg-slate-800 dark:hover:text-blue-400 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 cursor-pointer flex-shrink-0"
          >
            {isSidebarCollapsed ? (
              <PanelLeft className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </button>
        )}

        {/* Tulisan Dashboard di samping ciutkan sidebar (Hidden on mobile view, visible on md+) */}
        <div className="hidden md:flex items-center pl-1">
          <span className="text-base font-bold tracking-tight text-slate-800 dark:text-slate-100">
            Dashboard
          </span>
        </div>
      </div>

      {/* Right side: Compact Pill Search Bar + Theme Switcher + Notifications + User Menu */}
      <div className="flex items-center gap-1.5 sm:gap-3 flex-1 justify-end max-w-xl min-w-0">
        {/* Compact & Refined Pill Search Bar */}
        <div className="relative flex items-center justify-between h-9 sm:h-10 w-28 xs:w-36 sm:w-56 md:w-64 lg:w-72 rounded-full bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-750 shadow-2xs hover:shadow-xs focus-within:border-blue-500 dark:focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/15 pl-3 sm:pl-4 pr-2.5 transition-all duration-200 shrink">
          <input
            type="text"
            placeholder="Cari..."
            className="w-full bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none text-xs sm:text-[13px] block sm:hidden"
          />
          <input
            type="text"
            placeholder="Cari data, kelas, atau menu..."
            className="w-full bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none text-xs sm:text-[13px] hidden sm:block"
          />
          <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 dark:text-slate-500 shrink-0 ml-1.5 pointer-events-none" />
        </div>

        {/* Action Controls Cluster (shrink-0 mutlak agar tidak terpotong di Android) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Theme Mode Switcher (Ikon bersih tanpa lingkaran) */}
          <ThemeSwitcher />

          {/* Notification Bell */}
          <NotificationEntry />

          {/* User Profile */}
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
