"use client";

import * as React from "react";
import Link from "next/link";
import { User, LogOut, KeyRound, ChevronDown, Shield } from "lucide-react";
import { logoutAction } from "@/app/actions/auth-actions";
import { Badge } from "../ui/badge";

export interface UserMenuProps {
  user: {
    id: string;
    username: string;
    nama_lengkap: string;
    peran_dasar: string;
    sekolah_id?: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const roleLabelMap: Record<
    string,
    { label: string; variant: "cobalt" | "academic" | "success" | "info" | "warning" }
  > = {
    SUPER_ADMIN: { label: "Super Admin", variant: "academic" },
    SCHOOL_STAFF: { label: "Staf Sekolah", variant: "info" },
    TEACHER: { label: "Guru", variant: "cobalt" },
    STUDENT: { label: "Siswa", variant: "success" },
    GUARDIAN: { label: "Wali Siswa", variant: "warning" },
  };

  const roleMeta = roleLabelMap[user.peran_dasar] || {
    label: user.peran_dasar,
    variant: "cobalt",
  };

  // Get initials for avatar
  const initials =
    user.nama_lengkap
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase() || user.username.slice(0, 2).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Menu Pengguna"
        className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100/80 active:bg-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 cursor-pointer min-h-[44px]"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 text-white text-xs font-bold shadow-sm shadow-slate-900/10">
          {initials}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-800 leading-tight max-w-[130px] truncate">
            {user.nama_lengkap}
          </span>
          <span className="text-[11px] text-slate-500 font-medium leading-tight">
            {roleMeta.label}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform duration-160 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl bg-white/95 backdrop-blur-xl p-2 shadow-xl shadow-slate-900/10 border border-slate-200/80 z-50 animate-in fade-in-0 zoom-in-95 duration-160">
          {/* Identity Header */}
          <div className="p-3 border-b border-slate-100 mb-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-400">Akun Aktif</span>
              <Badge variant={roleMeta.variant}>{roleMeta.label}</Badge>
            </div>
            <p className="text-sm font-bold text-slate-900 truncate">{user.nama_lengkap}</p>
            <p className="text-xs text-slate-500 font-mono">@{user.username}</p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-0.5">
            <Link
              href="/ganti-password"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-slate-700 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors min-h-[40px]"
            >
              <KeyRound className="h-4 w-4 text-slate-400" />
              <span>Ganti Kata Sandi</span>
            </Link>

            <div className="border-t border-slate-100 my-1 pt-1" />

            {/* Logout Action */}
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors min-h-[40px] cursor-pointer"
              >
                <LogOut className="h-4 w-4 text-red-500" />
                <span>Keluar dari Akun</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
