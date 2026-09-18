"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { PasswordInput } from "@/shared/components/ui/password-input";
import { registerTeacherAction } from "@/app/actions/smart-onboarding-actions";

export function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const password = formData.get("password")?.toString() ?? "";
    const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";

    if (password.length < 6) {
      setErrorMessage("Kata sandi minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak sesuai.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await registerTeacherAction(formData);
        if (!res.success) {
          setErrorMessage(res.error || "Pendaftaran gagal. Periksa kembali formulir Anda.");
          return;
        }

        // Simpan nama pengguna untuk ucapan di onboarding
        const namaLengkap = formData.get("nama_lengkap")?.toString() ?? "";
        if (typeof window !== "undefined" && namaLengkap) {
          sessionStorage.setItem("rp_user_name", namaLengkap);
        }

        // Lanjut ke tahap berikutnya: Pilih Avatar
        router.push("/onboarding/pilih-avatar");
        router.refresh();
      } catch (err: any) {
        setErrorMessage(err.message || "Terjadi kesalahan saat memproses pendaftaran.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 sm:gap-4 w-full">
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs sm:text-sm text-rose-800 shadow-sm"
        >
          <AlertCircle className="size-4 sm:size-5 shrink-0 text-rose-600 mt-0.5" />
          <span className="leading-snug">{errorMessage}</span>
        </div>
      )}

      {/* Nama Lengkap */}
      <div className="flex flex-col gap-1">
        <label htmlFor="nama_lengkap" className="text-xs sm:text-sm font-semibold text-[#0F172A] select-none">
          Nama Lengkap & Gelar
        </label>
        <Input
          id="nama_lengkap"
          name="nama_lengkap"
          type="text"
          required
          disabled={isPending}
          placeholder="cth: Eri Chandra Apriyadi, S.Kom"
          className="h-10 sm:h-11 bg-white! text-slate-900! border-slate-200! placeholder:text-slate-400! shadow-xs text-[13px] sm:text-[14px]"
        />
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-xs sm:text-sm font-semibold text-[#0F172A] select-none">
          Email Akun
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          disabled={isPending}
          placeholder="nama@sekolah.sch.id atau gmail.com"
          className="h-10 sm:h-11 bg-white! text-slate-900! border-slate-200! placeholder:text-slate-400! shadow-xs text-[13px] sm:text-[14px]"
        />
      </div>

      {/* Username Akun */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label htmlFor="username" className="text-xs sm:text-sm font-semibold text-[#0F172A] select-none">
            Username Akun
          </label>
          <span className="text-[11px] text-slate-500 font-medium">Bisa otomatis dari email</span>
        </div>
        <Input
          id="username"
          name="username"
          type="text"
          disabled={isPending}
          placeholder="cth: wardahulfa (opsional, untuk login)"
          className="h-10 sm:h-11 bg-white! text-slate-900! border-slate-200! placeholder:text-slate-400! shadow-xs text-[13px] sm:text-[14px]"
        />
      </div>

      {/* Nama Sekolah */}
      <div className="flex flex-col gap-1">
        <label htmlFor="nama_sekolah" className="text-xs sm:text-sm font-semibold text-[#0F172A] select-none">
          Asal Sekolah / Institusi
        </label>
        <Input
          id="nama_sekolah"
          name="nama_sekolah"
          type="text"
          required
          disabled={isPending}
          placeholder="cth: SMK Otomindo Jakarta"
          className="h-10 sm:h-11 bg-white! text-slate-900! border-slate-200! placeholder:text-slate-400! shadow-xs text-[13px] sm:text-[14px]"
        />
      </div>

      {/* Kata Sandi & Konfirmasi Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-xs sm:text-sm font-semibold text-[#0F172A] select-none">
            Kata Sandi
          </label>
          <PasswordInput
            id="password"
            name="password"
            required
            disabled={isPending}
            placeholder="Minimal 6 karakter"
            className="h-10 sm:h-11 bg-white! text-slate-900! border-slate-200! placeholder:text-slate-400! shadow-xs text-[13px] sm:text-[14px]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="confirmPassword" className="text-xs sm:text-sm font-semibold text-[#0F172A] select-none">
            Konfirmasi Sandi
          </label>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            required
            disabled={isPending}
            placeholder="Ketik ulang sandi"
            className="h-10 sm:h-11 bg-white! text-slate-900! border-slate-200! placeholder:text-slate-400! shadow-xs text-[13px] sm:text-[14px]"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex flex-col gap-2.5 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="h-11 sm:h-12 w-full flex items-center justify-center gap-2 rounded-xl bg-[#1E293B] hover:bg-[#2B3B52] active:scale-[0.99] text-white font-semibold text-sm sm:text-base shadow-md shadow-slate-900/10 focus:outline-none focus:ring-3 focus:ring-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 sm:size-5 animate-spin text-white" />
              <span>Memproses Akun...</span>
            </>
          ) : (
            <>
              <span>Daftar & Lanjutkan ke Avatar</span>
              <ArrowRight className="size-4 sm:size-5" />
            </>
          )}
        </button>

        <div className="text-center text-xs text-slate-500 py-1">
          Sudah memiliki akun?{" "}
          <Link
            href="/login"
            className="font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline"
          >
            Masuk di sini
          </Link>
        </div>
      </div>
    </form>
  );
}
