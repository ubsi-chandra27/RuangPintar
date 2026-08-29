"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  GraduationCap,
  FileCheck,
  BookOpen,
  Award,
  UserCheck,
  TrendingUp,
  Layers,
  UserSquare2,
  BarChart3,
  Settings,
  ShieldAlert,
  Building2,
  ChevronLeft,
  ChevronRight,
  LucideIcon,
} from "lucide-react";
import { BaseRole, CapabilityBundle } from "@/shared/infrastructure/authorization/types";
import { getFilteredNavigation, NavItem } from "./navigation-config";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Calendar,
  Users,
  GraduationCap,
  FileCheck,
  BookOpen,
  Award,
  UserCheck,
  TrendingUp,
  Layers,
  UserSquare2,
  BarChart3,
  Settings,
  ShieldAlert,
  Building2,
};

export interface SidebarProps {
  userRole: BaseRole;
  userCapabilities?: CapabilityBundle[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

export function Sidebar({
  userRole,
  userCapabilities = [],
  isCollapsed,
  onToggleCollapse,
  className = "",
}: SidebarProps) {
  const pathname = usePathname();
  const navigationGroups = getFilteredNavigation(userRole, userCapabilities);

  return (
    <aside
      aria-label="Navigasi Utama"
      className={`hidden md:flex flex-col border-r border-slate-200/80 bg-white/90 backdrop-blur-xl transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] z-30 select-none flex-shrink-0 ${
        isCollapsed ? "w-16" : "w-60"
      } ${className}`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center px-4 border-b border-slate-100/80 gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded-xl"
          aria-label="Beranda Ruang Pintar"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-200/60 p-1 flex-shrink-0">
            <Image
              src="/images/brand/ruang-pintar-mark.png"
              alt="Logo Ruang Pintar"
              width={28}
              height={28}
              priority
              className="h-auto w-auto object-contain"
            />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-slate-900 tracking-tight leading-tight truncate">
                Ruang Pintar
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide leading-tight truncate">
                Platform Sekolah
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Links Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-4 no-scrollbar">
        {navigationGroups.map((group) => (
          <div key={group.id} className="space-y-1">
            {!isCollapsed && (
              <h4 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 truncate">
                {group.title}
              </h4>
            )}
            <nav aria-label={group.title} className="space-y-1">
              {group.items.map((item) => {
                const IconComponent = ICON_MAP[item.iconName] || LayoutDashboard;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <div key={item.id} className="relative group">
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-160 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
                        isActive
                          ? "bg-blue-50/90 text-blue-700 shadow-sm border border-blue-100"
                          : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                      } ${isCollapsed ? "justify-center px-0" : ""}`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <IconComponent
                        className={`h-4 w-4 flex-shrink-0 transition-colors ${
                          isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                        }`}
                      />
                      {!isCollapsed && <span className="truncate flex-1">{item.title}</span>}
                      {!isCollapsed && item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 font-medium">
                          {item.badge}
                        </span>
                      )}
                    </Link>

                    {/* Accessible Hover Tooltip for Compact Rail */}
                    {isCollapsed && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 hidden group-hover:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium whitespace-nowrap shadow-lg z-50 animate-in fade-in-0 zoom-in-95 duration-160 pointer-events-none">
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="text-[10px] opacity-75">({item.badge})</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Collapse / Expand Rail Toggle Button */}
      <div className="p-2 border-t border-slate-100/80">
        <button
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? "Buka Sidebar Lengkap" : "Ciutkan Sidebar ke Rail"}
          className="flex w-full items-center justify-center gap-2 p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 cursor-pointer text-xs font-medium"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="truncate">Ciutkan Menu</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
