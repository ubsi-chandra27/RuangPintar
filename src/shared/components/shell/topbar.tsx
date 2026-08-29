"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
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
  className?: string;
}

export function Topbar({
  user,
  breadcrumbItems = [{ label: "Dashboard", href: "/dashboard", isCurrent: true }],
  onOpenMobileDrawer,
  className = "",
}: TopbarProps) {
  return (
    <header
      className={`sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/85 backdrop-blur-xl px-4 sm:px-6 transition-all duration-200 ${className}`}
    >
      {/* Left side: Mobile menu toggle + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileDrawer}
          aria-label="Buka Menu Navigasi"
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 cursor-pointer min-h-[44px] min-w-[44px]"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile Logo Brand */}
        <Link
          href="/dashboard"
          className="md:hidden flex items-center gap-2"
          aria-label="Dashboard Ruang Pintar"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm border border-slate-200 p-1">
            <Image
              src="/images/brand/ruang-pintar-mark.png"
              alt="Logo Ruang Pintar"
              width={20}
              height={20}
              className="h-auto w-auto object-contain"
            />
          </div>
        </Link>

        {/* Desktop Breadcrumbs */}
        <div className="hidden sm:block">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Right side: Notification + User Menu */}
      <div className="flex items-center gap-2">
        <NotificationEntry />
        <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block" />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
