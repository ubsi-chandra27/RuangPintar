"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginAction, AuthActionResult } from "@/app/actions/auth-actions";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { PasswordInput } from "@/shared/components/ui/password-input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { TextLink } from "@/shared/components/ui/text-link";
import { Button } from "@/shared/components/ui/button";
import { InputError } from "@/shared/components/ui/input-error";

export function LoginForm({ status }: { status?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result: AuthActionResult = await loginAction(null, formData);
      if (!result.success) {
        setErrorMessage(result.error ?? "Login gagal. Silakan coba lagi.");
        // Reset password input on failure for security
        const passwordInput = form.querySelector<HTMLInputElement>('input[name="password"]');
        if (passwordInput) {
          passwordInput.value = "";
          passwordInput.focus();
        }
      } else if (result.redirectUrl) {
        router.push(result.redirectUrl);
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5 w-full" noValidate={false}>
      {/* Optional Success Status Banner */}
      {status && (
        <div
          role="status"
          className="rounded-[10px] border border-emerald-200 bg-emerald-50 p-3 text-xs sm:text-sm font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          {status}
        </div>
      )}

      {/* Username Field */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="username" className="text-xs sm:text-sm font-semibold text-[#0F172A]">
          Username
        </Label>
        <Input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          disabled={isPending}
          isError={Boolean(errorMessage)}
          placeholder="Masukkan username"
          inputSize="lg"
          className="h-11 sm:h-12 text-[14px] sm:text-[15px] bg-[#F8FAFC] sm:bg-white"
        />
        <InputError message={errorMessage} />
      </div>

      {/* Password Field */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password" className="text-xs sm:text-sm font-semibold text-[#0F172A]">
          Kata sandi
        </Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          required
          disabled={isPending}
          isError={Boolean(errorMessage)}
          placeholder="Masukkan kata sandi"
          inputSize="lg"
          className="h-11 sm:h-12 text-[14px] sm:text-[15px] bg-[#F8FAFC] sm:bg-white"
        />
      </div>

      {/* Remember Me & Forgot Password Row */}
      <div className="flex items-center justify-between min-h-[36px] sm:min-h-11">
        <Checkbox
          id="remember"
          name="remember"
          label="Ingat saya"
          disabled={isPending}
          className="text-xs sm:text-sm"
        />

        <TextLink href="/forgot-password" className="text-xs sm:text-sm">
          Lupa kata sandi?
        </TextLink>
      </div>

      {/* Primary Action Button */}
      <div className="flex flex-col gap-2 sm:gap-2.5 pt-0.5">
        <Button
          type="submit"
          size="lg"
          variant="primary"
          isLoading={isPending}
          disabled={isPending}
          className="h-11 sm:h-12 w-full rounded-[10px] sm:rounded-[12px] bg-[#1E293B] hover:bg-[#26364B] active:scale-[0.99] text-white font-semibold shadow-[0_6px_18px_rgba(15,23,42,0.14)] text-[14px] sm:text-base"
        >
          Masuk
        </Button>

        {/* Supporting Footer Text */}
        <p className="text-center text-[11px] sm:text-xs text-[#64748B] dark:text-slate-400">
          Akun dikelola oleh sekolah.
        </p>
      </div>
    </form>
  );
}
