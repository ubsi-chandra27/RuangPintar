"use client";

import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  Camera,
  PlusCircle,
  BookOpen,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

export function TeacherOnboardingCard() {
  const handleOpenManualClass = () => {
    window.dispatchEvent(new CustomEvent("open-manual-class-modal"));
  };

  const handleOpenAiPhoto = () => {
    window.dispatchEvent(new CustomEvent("open-ai-photo-modal"));
  };

  return (
    <div className="group relative rounded-[28px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl backdrop-saturate-150 border border-white/90 dark:border-blue-500/25 p-5 sm:p-7 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.04),0_0_0_1px_rgba(255,255,255,0.8)_inset] dark:shadow-[0_10px_35px_-5px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)_inset] overflow-hidden space-y-4 sm:space-y-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_22px_45px_-12px_rgba(37,99,235,0.18),0_0_0_1px_rgba(37,99,235,0.25)_inset] hover:border-blue-300/80 dark:hover:border-blue-500/50 animate-in fade-in-50 slide-in-from-bottom-3 duration-500">
      {/* Structural Accent Bar with Dynamic Glow on Hover */}
      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#2563EB] via-indigo-600 to-blue-500 rounded-l-[28px] group-hover:w-2 transition-all duration-300 shadow-sm shadow-blue-500/40" />

      {/* Ambient Glass Specular Sheen & Glow */}
      <div className="absolute -top-12 -right-12 w-72 h-44 bg-gradient-to-br from-blue-400/10 via-indigo-400/10 to-transparent dark:from-blue-500/10 dark:via-indigo-500/10 dark:to-transparent rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />

      {/* Header Info */}
      <div className="space-y-2 max-w-2xl pl-1 sm:pl-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/90 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 text-xs font-mono font-bold border border-blue-200/70 dark:border-blue-800/60 shadow-2xs">
          <GraduationCap className="h-3.5 w-3.5" />
          <span>Inisialisasi Rombel Belajar</span>
        </div>

        <h3 className="font-mono text-base sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Siapkan Rombel &amp; Daftar Siswa Pertama Anda
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Untuk mengaktifkan jadwal mengajar, presensi harian, dan pencatatan penilaian kurikulum
          merdeka, daftarkan rombel kelas yang Anda ampu. Klik salah satu metode di bawah untuk
          memulai:
        </p>
      </div>

      {/* Interactive Method Cards (Clickable & Dynamic Hover) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 pl-1 sm:pl-2">
        {/* Method 1: Manual */}
        <div
          onClick={handleOpenManualClass}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleOpenManualClass()}
          className="group/item p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/70 dark:bg-slate-800/40 backdrop-blur-md border border-slate-200/70 dark:border-slate-800/80 flex items-start justify-between gap-3 sm:gap-3.5 cursor-pointer transition-all duration-200 hover:scale-[1.015] hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/60 active:scale-[0.99]"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-blue-100/70 dark:bg-blue-950/80 text-[#2563EB] dark:text-blue-400 shrink-0 group-hover/item:scale-105 transition-transform">
              <Users className="h-4 w-4" />
            </div>
            <div className="space-y-0.5 sm:space-y-1">
              <h4 className="text-xs font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <span>Entri Rombel Mandiri</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Ketik nama kelas (SD/SMP/SMA), mapel, serta tempel daftar nama &amp; NIS dari
                spreadsheet.
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover/item:text-[#2563EB] group-hover/item:translate-x-0.5 transition-all shrink-0 mt-1" />
        </div>

        {/* Method 2: Scan */}
        <div
          onClick={handleOpenAiPhoto}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleOpenAiPhoto()}
          className="group/item p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/70 dark:bg-slate-800/40 backdrop-blur-md border border-slate-200/70 dark:border-slate-800/80 flex items-start justify-between gap-3 sm:gap-3.5 cursor-pointer transition-all duration-200 hover:scale-[1.015] hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-500/60 active:scale-[0.99]"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 shrink-0 group-hover/item:scale-105 transition-transform">
              <Camera className="h-4 w-4" />
            </div>
            <div className="space-y-0.5 sm:space-y-1">
              <h4 className="text-xs font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <span>Pindai Lembar Kertas</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Unggah foto lembar absensi fisik kelas Anda untuk ekstraksi nama siswa secara
                otomatis.
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover/item:text-emerald-600 group-hover/item:translate-x-0.5 transition-all shrink-0 mt-1" />
        </div>
      </div>

      {/* Actions Toolbar — Mobile-Optimized (Side-by-Side 2-Cols on Mobile, No Stacking) */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3 pt-1 pl-1 sm:pl-2">
        <button
          type="button"
          onClick={handleOpenManualClass}
          className="col-span-1 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-mono text-[11px] sm:text-xs font-bold whitespace-nowrap shadow-xs shadow-blue-500/25 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer transition-all active:scale-95"
        >
          <PlusCircle className="h-3.5 w-3.5 shrink-0" />
          <span>Buat Rombel Manual</span>
        </button>

        <button
          type="button"
          onClick={handleOpenAiPhoto}
          className="col-span-1 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/90 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 font-mono text-[11px] sm:text-xs font-bold whitespace-nowrap flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer transition-all active:scale-95"
        >
          <Camera className="h-3.5 w-3.5 text-[#2563EB] dark:text-blue-400 shrink-0" />
          <span>Pindai Lembar Absensi</span>
        </button>

        <Link
          href="/panduan"
          className="col-span-2 sm:col-auto sm:ml-auto px-2 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-mono text-[11px] sm:text-xs font-semibold flex items-center justify-center sm:justify-start gap-1 transition-colors"
        >
          <BookOpen className="h-3.5 w-3.5 shrink-0" />
          <span>Panduan Penggunaan</span>
          <ArrowRight className="h-3 w-3 shrink-0" />
        </Link>
      </div>
    </div>
  );
}
