"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { loginAction, AuthActionResult } from "@/app/actions/auth-actions";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result: AuthActionResult = await loginAction(null, formData);
      if (!result.success) {
        setErrorMessage(result.error ?? "Login gagal. Silakan coba lagi.");
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
          className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-sm text-rose-800 shadow-sm transition-all"
        >
          <AlertCircle className="size-5 shrink-0 text-rose-600 mt-0.5" />
          <span className="leading-snug">{errorMessage}</span>
        </div>
      )}

      {/* Username Field */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="username" className="text-sm font-semibold text-slate-700 select-none">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          disabled={isPending}
          placeholder="Masukkan username akun Anda"
          className="h-12 w-full rounded-[10px] border border-slate-300 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 transition-colors text-[15px]"
        />
      </div>

      {/* Password Field */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-semibold text-slate-700 select-none">
          Kata Sandi
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            disabled={isPending}
            placeholder="Masukkan kata sandi"
            className="h-12 w-full rounded-[10px] border border-slate-300 bg-white pl-4 pr-12 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 transition-colors text-[15px]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 size-8 flex items-center justify-center text-slate-400 hover:text-slate-700 focus:outline-none transition-colors"
          >
            {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </div>
      </div>

      {/* Remember Me & Forgot Password Row */}
      <div className="flex items-center justify-between min-h-[44px]">
        <label className="flex items-center gap-2.5 cursor-pointer select-none text-sm text-slate-600">
          <input
            id="remember"
            name="remember"
            type="checkbox"
            disabled={isPending}
            className="size-4.5 rounded border-slate-300 text-slate-800 focus:ring-blue-500"
          />
          <span>Ingat saya</span>
        </label>

        <Link
          href="/forgot-password"
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500/30 rounded transition-colors"
        >
          Lupa kata sandi?
        </Link>
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
            <span>Memproses...</span>
          </>
        ) : (
          <span>Masuk</span>
        )}
      </button>

      {/* Footer hint */}
      <p className="mt-2 text-center text-xs text-slate-500">
        Akun pengguna dikelola dan diterbitkan secara resmi oleh sekolah.
      </p>
    </form>
  );
}
