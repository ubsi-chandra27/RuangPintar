"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, KeyRound } from "lucide-react";
import { changePasswordAction, AuthActionResult } from "@/app/actions/auth-actions";

export function GantiPasswordForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result: AuthActionResult = await changePasswordAction(null, formData);
      if (!result.success) {
        setErrorMessage(result.error ?? "Gagal memperbarui kata sandi.");
      } else if (result.redirectUrl) {
        router.push(result.redirectUrl);
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-sm text-rose-800 shadow-sm"
        >
          <AlertCircle className="size-5 shrink-0 text-rose-600 mt-0.5" />
          <span className="leading-snug">{errorMessage}</span>
        </div>
      )}

      {/* Current Password */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="oldPassword" className="text-sm font-semibold text-slate-700 select-none">
          Kata Sandi Saat Ini
        </label>
        <input
          id="oldPassword"
          name="oldPassword"
          type="password"
          required
          disabled={isPending}
          placeholder="Masukkan kata sandi saat ini"
          className="h-12 w-full rounded-[10px] border border-slate-300 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20 disabled:bg-slate-100 transition-colors text-[15px]"
        />
      </div>

      {/* New Password */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="newPassword" className="text-sm font-semibold text-slate-700 select-none">
          Kata Sandi Baru
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          disabled={isPending}
          placeholder="Minimal 8 karakter (huruf & angka)"
          className="h-12 w-full rounded-[10px] border border-slate-300 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20 disabled:bg-slate-100 transition-colors text-[15px]"
        />
      </div>

      {/* Confirm New Password */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-semibold text-slate-700 select-none"
        >
          Konfirmasi Kata Sandi Baru
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          disabled={isPending}
          placeholder="Ketik ulang kata sandi baru"
          className="h-12 w-full rounded-[10px] border border-slate-300 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20 disabled:bg-slate-100 transition-colors text-[15px]"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="mt-2 h-12 w-full flex items-center justify-center gap-2 rounded-xl bg-[#1E293B] hover:bg-[#2B3B52] active:scale-[0.99] text-white font-semibold shadow-md shadow-slate-900/10 focus:outline-none focus:ring-3 focus:ring-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all text-base"
      >
        {isPending ? (
          <>
            <Loader2 className="size-5 animate-spin text-white" />
            <span>Menyimpan...</span>
          </>
        ) : (
          <>
            <KeyRound className="size-5" />
            <span>Simpan Kata Sandi Baru</span>
          </>
        )}
      </button>
    </form>
  );
}
