"use client";

/**
 * Ruang Pintar — CBT Token Entry Confirmation Card (Academic Glass UI v1.2)
 *
 * Layar konfirmasi siswa sebelum masuk ujian ketika ujian mewajibkan token pengawas (ANBK Style).
 */

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Key,
  Clock,
  Layers,
  User,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { startAttemptWithTokenAction } from "@/app/actions/cbt-actions";

interface CbtTokenEntryCardProps {
  ujianId: string;
  judulUjian: string;
  mataPelajaran: string;
  rombel: string;
  durasiMenit: number;
  totalSoal: number;
  siswaNama: string;
  siswaNis: string;
}

export function CbtTokenEntryCard({
  ujianId,
  judulUjian,
  mataPelajaran,
  rombel,
  durasiMenit,
  totalSoal,
  siswaNama,
  siswaNis,
}: CbtTokenEntryCardProps) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setErrorMsg("Masukkan 6 karakter token yang diberikan oleh pengawas ruang.");
      return;
    }

    setErrorMsg("");
    startTransition(async () => {
      const res = await startAttemptWithTokenAction(ujianId, token.trim());
      if (res.success && res.data?.attemptId) {
        router.push(`/cbt/${res.data.attemptId}`);
      } else {
        setErrorMsg(res.message || "Token ujian tidak valid atau sudah kedaluwarsa.");
      }
    });
  };

  return (
    <div className="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 relative z-10 space-y-6">
      {/* Header Info */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center mx-auto">
          <Key className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Konfirmasi Masuk Ujian CBT</h2>
        <p className="text-xs text-slate-500">
          Ujian ini memerlukan kode token dari pengawas ruang kelas.
        </p>
      </div>

      {/* Participant & Exam Details Card */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/60">
          <span className="text-slate-500 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-slate-400" />
            Peserta:
          </span>
          <span className="font-bold text-slate-800">
            {siswaNama} ({siswaNis})
          </span>
        </div>

        <div className="space-y-1 text-xs">
          <p className="font-bold text-slate-900 text-sm">{judulUjian}</p>
          <p className="text-slate-500">
            {mataPelajaran} • {rombel}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-200/60">
            <Clock className="h-3.5 w-3.5 text-blue-600" />
            <span>
              Durasi: <strong>{durasiMenit} Menit</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-200/60">
            <Layers className="h-3.5 w-3.5 text-blue-600" />
            <span>
              Soal: <strong>{totalSoal} Butir</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Token Input Form */}
      <form onSubmit={handleStart} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 text-center">
            KODE TOKEN PENGAWAS RUANG
          </label>
          <input
            type="text"
            maxLength={8}
            autoFocus
            required
            value={token}
            onChange={(e) => {
              setToken(e.target.value.toUpperCase());
              if (errorMsg) setErrorMsg("");
            }}
            placeholder="Ketik 6 digit token..."
            className="w-full text-center font-mono font-extrabold text-xl sm:text-2xl tracking-[0.3em] uppercase py-3 rounded-2xl border-2 border-blue-300 bg-blue-50/20 text-blue-900 focus:outline-hidden focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-inner"
          />
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || !token.trim()}
          className="w-full py-3 rounded-2xl bg-blue-600 text-white text-xs sm:text-sm font-bold shadow-md hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isPending ? (
            "Memvalidasi Token..."
          ) : (
            <>
              <span>Mulai Kerjakan Soal</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center">
        <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Sesi ujian diawasi oleh sistem integritas & timer server.
        </p>
      </div>
    </div>
  );
}
