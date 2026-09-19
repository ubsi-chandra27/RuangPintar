"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Sparkles, CheckCircle, Rocket } from "lucide-react";
import { AVATAR_LIST, AvatarSvgIllustration } from "../pilih-avatar/avatar-picker";

export function SelesaiView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryAvatar = searchParams.get("avatar");
  const [userName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("rp_user_name") || "Guru Hebat";
    }
    return "Guru Hebat";
  });
  const [avatarId] = useState<string>(() => {
    if (queryAvatar) return queryAvatar;
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("rp_selected_avatar") || "kapten-kosmik";
    }
    return "kapten-kosmik";
  });

  const currentAvatar = AVATAR_LIST.find((a) => a.id === avatarId) || AVATAR_LIST[0];

  return (
    <div className="flex flex-col items-center text-center w-full py-2 sm:py-4">
      {/* Illuminated Big Avatar Display */}
      <div className="relative mb-6">
        {/* Ambient Glow */}
        <div
          className="absolute -inset-4 rounded-full blur-xl opacity-60 animate-pulse pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(37, 99, 235, 0.45) 0%, rgba(14, 165, 233, 0.15) 60%, transparent 80%)",
          }}
        />

        {/* Circular Outer Ring */}
        <div className="relative size-32 sm:size-36 rounded-full p-1.5 bg-gradient-to-tr from-blue-600 via-sky-400 to-indigo-500 shadow-xl shadow-blue-500/20 flex items-center justify-center">
          <div className="size-full rounded-full bg-white flex items-center justify-center p-2 shadow-inner">
            <AvatarSvgIllustration avatar={currentAvatar} size={108} />
          </div>
        </div>

        {/* Floating status badge */}
        <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1.5 shadow-md border-2 border-white flex items-center justify-center">
          <CheckCircle className="size-4 stroke-[2.5]" />
        </div>
      </div>

      {/* Greeting & Subheading */}
      <div className="space-y-1.5 mb-6 max-w-sm">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold">
          <Sparkles className="size-3.5 text-blue-600" />
          <span>Profil Siap Diluncurkan</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
          Selamat Datang, {userName}!
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Karakter <strong className="text-blue-600">{currentAvatar.name}</strong> kini resmi
          mewakili akun Anda. Bersiaplah mengelola kelas dan pembelajaran dengan lebih mudah dan
          cerdas.
        </p>
      </div>

      {/* Feature Pills */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-sm mb-6 text-center">
        <div className="rounded-xl border border-slate-200/80 bg-white/70 p-2.5 shadow-xs">
          <div className="text-xs font-bold text-slate-800">15 Detik</div>
          <div className="text-[10px] text-slate-500">Absensi Cepat</div>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white/70 p-2.5 shadow-xs">
          <div className="text-xs font-bold text-slate-800">Format A4</div>
          <div className="text-[10px] text-slate-500">Rekap Resmi</div>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white/70 p-2.5 shadow-xs">
          <div className="text-xs font-bold text-slate-800">Asisten AI</div>
          <div className="text-[10px] text-slate-500">Scan & Buat Soal</div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="w-full max-w-sm space-y-2.5">
        <Link
          href="/dashboard"
          className="h-12 sm:h-13 w-full flex items-center justify-center gap-2.5 rounded-xl bg-[#1E293B] hover:bg-[#2B3B52] active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-lg shadow-slate-900/15 focus:outline-none focus:ring-3 focus:ring-slate-900/20 transition-all cursor-pointer"
        >
          <Rocket className="size-4 sm:size-5" />
          <span>Mulai Aplikasi</span>
          <ArrowRight className="size-4 sm:size-5" />
        </Link>

        <p className="text-[11px] text-slate-400">
          Anda dapat mengubah avatar kapan saja melalui menu Profil Pengguna.
        </p>
      </div>
    </div>
  );
}
