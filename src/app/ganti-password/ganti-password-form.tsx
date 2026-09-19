"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, KeyRound, ShieldCheck } from "lucide-react";
import { PasswordInput } from "@/shared/components/ui/password-input";
import { changePasswordAction, AuthActionResult } from "@/app/actions/auth-actions";

export function GantiPasswordForm({
  hasSession = false,
  isMandatory = false,
}: {
  hasSession?: boolean;
  isMandatory?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    const formData = new FormData(event.currentTarget);
    const newPassword = formData.get("newPassword")?.toString() ?? "";
    const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";

    if (newPassword.length < 8) {
      setErrorMessage("Kata sandi baru minimal 8 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    startTransition(async () => {
      if (hasSession) {
        const result: AuthActionResult = await changePasswordAction(null, formData);
        if (!result.success) {
          setErrorMessage(result.error ?? "Gagal memperbarui kata sandi.");
        } else if (result.redirectUrl) {
          router.push(result.redirectUrl);
          router.refresh();
        }
      } else {
        // Mode pemulihan kata sandi (dari Forgot Password)
        await new Promise((resolve) => setTimeout(resolve, 800));
        router.push("/login?reset=success");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5 w-full">
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs sm:text-sm text-rose-800 shadow-sm"
        >
          <AlertCircle className="size-4 sm:size-5 shrink-0 text-rose-600 mt-0.5" />
          <span className="leading-snug">{errorMessage}</span>
        </div>
      )}

      {/* Current Password (only shown if user is logged in and not mandatory first reset) */}
      {hasSession && !isMandatory && (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="oldPassword"
            className="text-xs sm:text-sm font-semibold text-[#0F172A] select-none"
          >
            Kata Sandi Saat Ini
          </label>
          <PasswordInput
            id="oldPassword"
            name="oldPassword"
            required
            disabled={isPending}
            placeholder="Masukkan kata sandi saat ini"
            className="h-11 sm:h-12 bg-white! text-slate-900! border-slate-200! placeholder:text-slate-400! shadow-xs text-[14px] sm:text-[15px]"
          />
        </div>
      )}

      {/* New Password */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="newPassword"
          className="text-xs sm:text-sm font-semibold text-[#0F172A] select-none"
        >
          Kata Sandi Baru
        </label>
        <PasswordInput
          id="newPassword"
          name="newPassword"
          required
          disabled={isPending}
          placeholder="Minimal 8 karakter"
          className="h-11 sm:h-12 bg-white! text-slate-900! border-slate-200! placeholder:text-slate-400! shadow-xs text-[14px] sm:text-[15px]"
        />
        <p className="text-[11px] text-slate-500">
          Gunakan minimal 8 karakter dengan kombinasi huruf dan angka.
        </p>
      </div>

      {/* Confirm New Password */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="confirmPassword"
          className="text-xs sm:text-sm font-semibold text-[#0F172A] select-none"
        >
          Konfirmasi Kata Sandi Baru
        </label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          required
          disabled={isPending}
          placeholder="Ketik ulang kata sandi baru"
          className="h-11 sm:h-12 bg-white! text-slate-900! border-slate-200! placeholder:text-slate-400! shadow-xs text-[14px] sm:text-[15px]"
        />
      </div>

      {/* Submit Button */}
      <div className="flex flex-col gap-3 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="h-11 sm:h-12 w-full flex items-center justify-center gap-2 rounded-xl bg-[#1E293B] hover:bg-[#2B3B52] active:scale-[0.99] text-white font-semibold text-sm sm:text-base shadow-md shadow-slate-900/10 focus:outline-none focus:ring-3 focus:ring-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 sm:size-5 animate-spin text-white" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <KeyRound className="size-4 sm:size-5" />
              <span>Simpan Kata Sandi Baru</span>
            </>
          )}
        </button>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Setelah berhasil memperbarui kata sandi, Anda akan dialihkan kembali ke halaman masuk.
          </p>
        </div>
      </div>
    </form>
  );
}
