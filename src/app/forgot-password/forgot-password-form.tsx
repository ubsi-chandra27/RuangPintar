"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { CheckCircle2, Mail, ArrowRight, ShieldCheck } from "lucide-react";

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      // Simulasi pengiriman token reset
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsSubmitted(true);
    });
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col gap-4 sm:gap-5 w-full animate-in fade-in-0 duration-200">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 sm:p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>Tautan Reset Terkirim!</span>
          </div>
          <p className="text-xs sm:text-[13px] text-emerald-700 leading-relaxed">
            Instruksi dan tautan pemulihan kata sandi telah dikirim ke{" "}
            <strong className="font-semibold text-emerald-900">
              {emailOrUsername || "email Anda"}
            </strong>
            . Silakan periksa kotak masuk atau folder spam Anda.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <Link
            href="/ganti-password"
            className="h-11 sm:h-12 w-full flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm shadow-md shadow-blue-500/15 transition-all cursor-pointer"
          >
            <span>Buka Halaman Atur Kata Sandi Baru</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <button
            type="button"
            onClick={() => setIsSubmitted(false)}
            className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 p-2 cursor-pointer"
          >
            Kirim ulang ke email atau username lain
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5 w-full">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="identity" className="text-xs sm:text-sm font-semibold text-[#0F172A]">
          Email atau Username
        </Label>
        <div className="relative">
          <Input
            id="identity"
            name="identity"
            type="text"
            required
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            disabled={isPending}
            placeholder="nama@sekolah.sch.id atau username"
            inputSize="lg"
            className="h-11 sm:h-12 text-[14px] sm:text-[15px] bg-white! text-slate-900! border-slate-200! placeholder:text-slate-400! pl-10 shadow-xs"
          />
          <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Tautan pemulihan kata sandi berlaku selama 60 menit.
        </p>
      </div>

      <div className="flex flex-col gap-3 pt-1">
        <Button
          type="submit"
          size="lg"
          variant="primary"
          isLoading={isPending}
          disabled={isPending}
          className="h-11 sm:h-12 w-full rounded-xl bg-[#1E293B] hover:bg-[#26364B] text-white font-semibold text-[14px] sm:text-base shadow-md cursor-pointer"
        >
          Kirim Tautan Reset
        </Button>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Akun Anda dilindungi enkripsi platform. Jika Anda tidak memiliki akses email, hubungi
            Administrator / Operator Sekolah Anda.
          </p>
        </div>
      </div>
    </form>
  );
}
