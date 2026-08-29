"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  X,
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
  LucideIcon,
} from "lucide-react";
import { BaseRole, CapabilityBundle } from "@/shared/infrastructure/authorization/types";
import { getFilteredNavigation } from "./navigation-config";

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

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: BaseRole;
  userCapabilities?: CapabilityBundle[];
}

export function MobileDrawer({
  isOpen,
  onClose,
  userRole,
  userCapabilities = [],
}: MobileDrawerProps) {
  const pathname = usePathname();
  const navigationGroups = getFilteredNavigation(userRole, userCapabilities);

  // Close drawer when route changes
  React.useEffect(() => {
    onClose();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle Escape key
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 md:hidden flex"
      role="dialog"
      aria-modal="true"
      aria-label="Menu Navigasi Mobile"
    >
      {/* Backdrop with soft blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer panel */}
      <div className="relative flex flex-col w-[280px] max-w-[85vw] bg-white h-full shadow-2xl z-10 animate-in slide-in-from-left duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-200 p-1">
              <Image
                src="/images/brand/ruang-pintar-mark.png"
                alt="Logo Ruang Pintar"
                width={24}
                height={24}
                className="h-auto w-auto object-contain"
              />
            </div>
            <span className="text-sm font-bold text-slate-900">Ruang Pintar</span>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup Menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 cursor-pointer min-h-[44px] min-w-[44px]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 no-scrollbar">
          {navigationGroups.map((group) => (
            <div key={group.id} className="space-y-1">
              <h4 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {group.title}
              </h4>
              <nav aria-label={group.title} className="space-y-0.5">
                {group.items.map((item) => {
                  const IconComponent = ICON_MAP[item.iconName] || LayoutDashboard;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors min-h-[44px] ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-bold border border-blue-100"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <IconComponent
                        className={`h-4 w-4 flex-shrink-0 ${
                          isActive ? "text-blue-600" : "text-slate-400"
                        }`}
                      />
                      <span className="truncate flex-1">{item.title}</span>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 font-medium">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
