"use client";

import * as React from "react";
import { Bell, CheckCheck, X } from "lucide-react";

export function NotificationEntry() {
  const [isOpen, setIsOpen] = React.useState(false);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
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

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Pemberitahuan Sistem"
        className="relative flex items-center justify-center text-slate-400 hover:text-[#2563EB] hover:bg-slate-200/60 p-2.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 cursor-pointer"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#2563EB] ring-2 ring-[#F8FAFC]" />
      </button>

      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm sm:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-x-4 top-20 sm:absolute sm:inset-auto sm:right-0 sm:mt-2 sm:w-80 origin-top-right rounded-2xl bg-white p-4 sm:p-5 shadow-2xl shadow-slate-900/20 border border-slate-200 z-50 animate-in fade-in-0 zoom-in-95 duration-160">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">Pemberitahuan</h4>
                <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-500 font-bold">
                  0 baru
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Tutup"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer sm:hidden"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 mb-3 shadow-xs">
                <CheckCheck className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 mb-1">
                Semua Sudah Terbaca
              </p>
              <p className="text-[11px] text-slate-400 max-w-[220px] leading-relaxed">
                Tidak ada tugas mendesak atau pengumuman baru saat ini.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
