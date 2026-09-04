"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  PlayCircle,
  CalendarDays,
  UserCheck,
  TrendingUp,
  UserSquare2,
  Layers,
  GraduationCap,
  Building2,
  Menu,
  LucideIcon,
} from "lucide-react";
import { BaseRole, CapabilityBundle } from "@/shared/infrastructure/authorization/types";

export interface MobileBottomNavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface MobileBottomNavProps {
  userRole: BaseRole;
  userCapabilities?: CapabilityBundle[];
  onOpenMenu: () => void;
  className?: string;
}

export function getMobileBottomNavItems(
  userRole: BaseRole,
  userCapabilities: CapabilityBundle[] = []
): MobileBottomNavItem[] {
  switch (userRole) {
    case "TEACHER":
      return [
        { id: "home", label: "Beranda", href: "/dashboard", icon: LayoutDashboard },
        { id: "schedule", label: "Jadwal", href: "/jadwal-saya", icon: Calendar },
        { id: "classes", label: "Kelas", href: "/kelas-saya", icon: BookOpen },
        { id: "sessions", label: "Sesi KBM", href: "/sesi-pembelajaran", icon: PlayCircle },
      ];

    case "SUPER_ADMIN":
      return [
        { id: "home", label: "Beranda", href: "/dashboard", icon: LayoutDashboard },
        { id: "students", label: "Siswa", href: "/data-siswa", icon: UserSquare2 },
        { id: "academic", label: "Akademik", href: "/struktur-akademik", icon: Layers },
        { id: "teachers", label: "Guru", href: "/guru-pengajaran", icon: GraduationCap },
      ];

    case "SCHOOL_STAFF": {
      const items: MobileBottomNavItem[] = [
        { id: "home", label: "Beranda", href: "/dashboard", icon: LayoutDashboard },
      ];
      if (userCapabilities.includes("STUDENT_DATA_OPERATOR")) {
        items.push({ id: "students", label: "Siswa", href: "/data-siswa", icon: UserSquare2 });
      }
      if (userCapabilities.includes("ACADEMIC_OPERATOR")) {
        items.push({ id: "academic", label: "Akademik", href: "/struktur-akademik", icon: Layers });
        if (items.length < 4) {
          items.push({
            id: "teachers",
            label: "Guru",
            href: "/guru-pengajaran",
            icon: GraduationCap,
          });
        }
      }
      if (items.length < 4) {
        items.push({ id: "school", label: "Sekolah", href: "/sekolah", icon: Building2 });
      }
      return items.slice(0, 4);
    }

    case "STUDENT":
      return [
        { id: "home", label: "Beranda", href: "/dashboard", icon: LayoutDashboard },
        { id: "schedule", label: "Jadwal", href: "/jadwal-saya", icon: Calendar },
        { id: "calendar", label: "Kalender", href: "/kalender-akademik", icon: CalendarDays },
      ];

    case "GUARDIAN":
      return [
        { id: "home", label: "Beranda", href: "/dashboard", icon: LayoutDashboard },
        { id: "attendance", label: "Presensi", href: "/presensi-anak", icon: UserCheck },
        { id: "grades", label: "Nilai", href: "/nilai-anak", icon: TrendingUp },
      ];

    default:
      return [{ id: "home", label: "Beranda", href: "/dashboard", icon: LayoutDashboard }];
  }
}

export function MobileBottomNav({
  userRole,
  userCapabilities = [],
  onOpenMenu,
  className = "",
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const items = React.useMemo(
    () => getMobileBottomNavItems(userRole, userCapabilities),
    [userRole, userCapabilities]
  );

  return (
    <nav
      aria-label="Navigasi Bawah Mobile"
      className={`fixed bottom-0 left-0 right-0 z-30 flex md:hidden items-center justify-around bg-white/90 backdrop-blur-xl border-t border-slate-200/80 px-2 py-1 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] ${className}`}
      style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom))" }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === item.href || pathname.startsWith(item.href + "/");

        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`group flex flex-1 flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 min-h-[48px] ${
              isActive
                ? "text-[#2563EB] font-semibold"
                : "text-slate-500 hover:text-slate-800 font-medium"
            }`}
          >
            <div
              className={`relative flex items-center justify-center p-1 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-blue-50 text-[#2563EB] scale-105"
                  : "group-hover:bg-slate-100 text-slate-500"
              }`}
            >
              <Icon className="h-5 w-5 transition-transform group-active:scale-95" />
              {isActive && (
                <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-[#2563EB]" />
              )}
            </div>
            <span className="mt-0.5 text-[10px] leading-tight tracking-tight text-center truncate max-w-[64px]">
              {item.label}
            </span>
          </Link>
        );
      })}

      {/* Menu / Lainnya Drawer Trigger */}
      <button
        key="mobile-nav-menu"
        type="button"
        onClick={onOpenMenu}
        aria-label="Buka Menu Lainnya"
        className="group flex flex-1 flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 min-h-[48px] text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
      >
        <div className="flex items-center justify-center p-1 rounded-lg transition-all duration-200 group-hover:bg-slate-100 text-slate-500">
          <Menu className="h-5 w-5 transition-transform group-active:scale-95" />
        </div>
        <span className="mt-0.5 text-[10px] leading-tight tracking-tight text-center truncate max-w-[64px]">
          Menu
        </span>
      </button>
    </nav>
  );
}
