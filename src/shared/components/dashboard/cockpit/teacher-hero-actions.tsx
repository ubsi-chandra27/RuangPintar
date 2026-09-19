"use client";

import React from "react";
import Link from "next/link";
import { ClipboardCheck, Camera, BookOpen, Sparkles } from "lucide-react";

export interface TeacherHeroActionsProps {
  canCreateRombel?: boolean;
}

export function TeacherHeroActions({ canCreateRombel = true }: TeacherHeroActionsProps) {
  const handleOpenAiPhoto = () => {
    window.dispatchEvent(new CustomEvent("open-ai-photo-modal"));
  };

  const handleOpenManualClass = () => {
    window.dispatchEvent(new CustomEvent("open-manual-class-modal"));
  };

  return (
    <div className="flex items-center gap-2.5 pt-1.5 flex-wrap">
      {/* 1. Presensi Kilat (Primary Blue, Compact) */}
      <Link
        href="/presensi-kelas"
        className="px-3.5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-mono font-bold shadow-xs shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
      >
        <ClipboardCheck className="h-3.5 w-3.5" />
        <span>Presensi Kilat 15 Detik</span>
      </Link>

      {/* 2. Foto Absen AI Quick Action (Compact) */}
      <button
        type="button"
        onClick={handleOpenAiPhoto}
        disabled={!canCreateRombel}
        className="px-3.5 py-2 rounded-xl bg-slate-100/90 hover:bg-slate-200/90 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-blue-500/20 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Input Data Siswa & Rombel Otomatis dari Foto Lembar Absensi"
      >
        <Camera className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
        <span>+ Foto Absen AI</span>
      </button>

      {/* 3. Perangkat Ajar (Compact) */}
      <Link
        href="/sesi-pembelajaran"
        className="px-3.5 py-2 rounded-xl bg-slate-50/90 hover:bg-slate-100/90 dark:bg-slate-900/70 dark:hover:bg-slate-800/70 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
      >
        <BookOpen className="h-3.5 w-3.5" />
        <span>Perangkat Ajar</span>
      </Link>
    </div>
  );
}
