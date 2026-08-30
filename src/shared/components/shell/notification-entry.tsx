"use client";

import * as React from "react";
import { Bell, CheckCheck } from "lucide-react";

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
        <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-2xl bg-white/95 backdrop-blur-xl p-4 shadow-xl shadow-slate-900/10 border border-slate-200/80 z-50 animate-in fade-in-0 zoom-in-95 duration-160">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h4 className="text-sm font-bold text-slate-900">Pemberitahuan</h4>
            <span className="text-xs text-slate-400 font-medium">0 baru</span>
          </div>

          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-2">
              <CheckCheck className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-slate-700 mb-1">Tidak Ada Pemberitahuan</p>
            <p className="text-[11px] text-slate-400 max-w-[200px] leading-relaxed">
              Pemberitahuan akademik dan sistem akan muncul di sini saat tersedia.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
