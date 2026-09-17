"use client";

import * as React from "react";
import { Sun, Moon, Clock, Check } from "lucide-react";
import { useTheme, ThemeMode } from "./theme-provider";

export function ThemeSwitcher() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options: { mode: ThemeMode; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      mode: "light",
      label: "Mode Siang",
      desc: "Tampilan terang & jernih",
      icon: <Sun className="h-4 w-4 text-amber-500" />,
    },
    {
      mode: "dark",
      label: "Mode Malam",
      desc: "Tampilan gelap nyaman di mata",
      icon: <Moon className="h-4 w-4 text-indigo-400" />,
    },
    {
      mode: "auto",
      label: "Sesuai Jam Device",
      desc: "Otomatis: 06.00-18.00 Siang, 18.00-06.00 Malam",
      icon: <Clock className="h-4 w-4 text-blue-500" />,
    },
  ];

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Trigger Button: Sleek rounded capsule/circle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Pilih Mode Tampilan (Siang, Malam, Jam Device)"
        title="Mode Tampilan (Siang, Malam, Jam Device)"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-750 transition-all text-slate-600 dark:text-slate-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
      >
        {theme === "light" && (
          <Sun className="h-4 w-4 text-amber-500 animate-in spin-in-180 duration-300" />
        )}
        {theme === "dark" && (
          <Moon className="h-4 w-4 text-indigo-400 animate-in spin-in-180 duration-300" />
        )}
        {theme === "auto" && (
          <div className="relative flex items-center justify-center">
            {resolvedTheme === "dark" ? (
              <Moon className="h-4 w-4 text-blue-400" />
            ) : (
              <Sun className="h-4 w-4 text-blue-500" />
            )}
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-850" />
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Mode Tampilan
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              Sesuaikan dengan kenyamanan penglihatan Anda
            </span>
          </div>

          <div className="space-y-0.5">
            {options.map((opt) => {
              const isSelected = theme === opt.mode;
              return (
                <button
                  key={opt.mode}
                  type="button"
                  onClick={() => {
                    setTheme(opt.mode);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-blue-50/80 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`h-7 w-7 rounded-lg flex items-center justify-center ${
                        isSelected
                          ? "bg-blue-100/70 dark:bg-blue-900/40"
                          : "bg-slate-100 dark:bg-slate-800"
                      }`}
                    >
                      {opt.icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                        <span>{opt.label}</span>
                        {opt.mode === "auto" && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                            Auto
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight mt-0.5">
                        {opt.desc}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 text-[#2563EB] dark:text-blue-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
