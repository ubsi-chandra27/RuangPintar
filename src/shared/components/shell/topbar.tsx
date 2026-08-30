"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, Search, Command, PanelLeftClose, PanelLeft } from "lucide-react";
import { UserMenu } from "./user-menu";
import { NotificationEntry } from "./notification-entry";
import { Breadcrumb, BreadcrumbItem } from "./breadcrumb";

export interface TopbarProps {
  user: {
    id: string;
    username: string;
    nama_lengkap: string;
    peran_dasar: string;
    sekolah_id?: string | null;
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
      className={`sticky top-0 z-20 flex h-20 w-full items-center justify-between bg-[#F8FAFC]/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 border-none transition-all duration-200 ${className}`}
    >
      {/* Left side: Desktop Sidebar Toggle + Floating Search Bar */}
      <div className="flex items-center gap-3 sm:gap-3.5 flex-1 max-w-xl">
        {/* Smartphone Drawer Trigger (HP only, < md) */}
        <button
          onClick={onOpenMobileDrawer}
          aria-label="Buka Menu Navigasi"
          className="md:hidden flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 p-2.5 rounded-xl transition-colors cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop / Tablet Modern Sidebar Toggle Button */}
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={isSidebarCollapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
            title={isSidebarCollapsed ? "Perluas Sidebar (Ctrl+B)" : "Ciutkan Sidebar (Ctrl+B)"}
            className="hidden md:flex items-center justify-center text-slate-400 hover:text-[#2563EB] hover:bg-slate-200/60 p-2.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 cursor-pointer flex-shrink-0"
          >
            {isSidebarCollapsed ? (
              <PanelLeft className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </button>
        )}

        {/* Modern Clean Search Bar (Active on both Mobile and Desktop) */}
        <div className="flex items-center justify-between h-10 w-full max-w-md rounded-xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.06)] border border-slate-200/70 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/15 pl-3.5 pr-2.5 text-xs text-slate-400 transition-all duration-200">
          <input
            type="text"
            placeholder="Cari siswa, guru, kelas, atau menu..."
            className="w-full bg-transparent text-slate-800 placeholder:text-slate-400 focus:outline-none text-xs sm:text-[13px]"
          />
          <button
            type="button"
            aria-label="Cari"
            className="p-1 rounded-lg text-slate-400 hover:text-[#2563EB] hover:bg-blue-50/80 transition-colors flex-shrink-0 cursor-pointer"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Right side: Floating Notification + Floating User Profile */}
      <div className="flex items-center gap-3">
        <NotificationEntry />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
