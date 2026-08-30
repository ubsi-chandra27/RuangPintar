"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { User, LogOut, KeyRound, ChevronDown, Shield, X } from "lucide-react";
import { logoutAction } from "@/app/actions/auth-actions";
import { Badge } from "../ui/badge";

const emptySubscribe = () => () => {};

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
  const isMounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);
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
        setIsLogoutModalOpen(false);
      }
    }
    if (isOpen || isLogoutModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLogoutModalOpen]);

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
        className="flex items-center gap-2.5 p-1.5 pl-2 pr-2.5 rounded-2xl hover:bg-slate-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 cursor-pointer"
      >
        <div className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-gradient-to-tr from-[#1D4ED8] to-[#3B82F6] text-white text-xs font-extrabold shadow-sm">
          {initials}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-bold text-slate-800 leading-tight max-w-[140px] truncate">
            {user.nama_lengkap}
          </span>
          <span className="text-[10px] text-slate-500 font-medium leading-tight">
            {roleMeta.label}
          </span>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-160 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl bg-white/95 backdrop-blur-xl p-2 shadow-xl shadow-slate-900/10 border border-slate-200/80 z-40 animate-in fade-in-0 zoom-in-95 duration-160">
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

            {/* Logout Trigger Button */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsLogoutModalOpen(true);
              }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors min-h-[40px] cursor-pointer"
            >
              <LogOut className="h-4 w-4 text-red-500" />
              <span>Keluar dari Akun</span>
            </button>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal Dialog (Portaled to document.body for true viewport centering) */}
      {isMounted &&
        isLogoutModalOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in-0 duration-200"
            onClick={() => setIsLogoutModalOpen(false)}
          >
            <div
              className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100/80 animate-in zoom-in-95 duration-200 text-center flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close X Button */}
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                aria-label="Tutup Dialog"
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              {/* Warning Icon Badge */}
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-100/80 shadow-xs mb-4">
                <LogOut className="h-6 w-6 ml-0.5" />
              </div>

              {/* Title & Description */}
              <h3 id="logout-modal-title" className="text-lg font-bold text-slate-900 mb-1.5">
                Konfirmasi Keluar
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed mb-4 max-w-xs">
                Apakah Anda yakin ingin keluar dari sesi akun Ruang Pintar? Pastikan seluruh
                pekerjaan Anda telah tersimpan.
              </p>

              {/* User Session Identity Card */}
              <div className="flex items-center gap-3 w-full p-3 rounded-2xl bg-slate-50 border border-slate-100 mb-6 text-left">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-[#1D4ED8] to-[#3B82F6] text-white text-xs font-bold shadow-xs flex-shrink-0">
                  {initials}
                </div>
                <div className="flex flex-col overflow-hidden flex-1">
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {user.nama_lengkap}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium truncate">
                    @{user.username} • {roleMeta.label}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs sm:text-[13px] font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <form action={logoutAction} className="flex-1">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-[13px] font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Ya, Keluar
                  </button>
                </form>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
