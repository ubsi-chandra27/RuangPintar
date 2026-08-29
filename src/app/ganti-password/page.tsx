import React from "react";
import Image from "next/image";
import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { GantiPasswordForm } from "./ganti-password-form";

export const metadata = {
  title: "Ganti Kata Sandi — Ruang Pintar",
  description: "Perbarui kata sandi akun Ruang Pintar Anda",
};

export default async function GantiPasswordPage() {
  const user = await requireAuth({ allowPasswordRequired: true });

  return (
    <div className="relative min-h-screen w-full bg-[#F7F7F8] text-slate-900 flex flex-col justify-between items-center py-10 px-6 font-sans">
      {/* Ambient Glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 50% 20%, rgba(14, 165, 233, 0.08), transparent 45%)",
        }}
      />

      {/* Brand Header */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="size-11 rounded-2xl bg-white/80 backdrop-blur-md shadow-sm border border-slate-200/60 p-2 flex items-center justify-center">
          <Image
            src="/images/brand/ruang-pintar-mark.png"
            alt="Ruang Pintar Mark"
            width={36}
            height={36}
            priority
            className="size-full object-contain"
          />
        </div>
        <span className="text-lg font-bold text-[#1E293B] tracking-tight">Ruang Pintar</span>
      </div>

      {/* Center Card */}
      <div className="relative z-10 w-full max-w-[460px] bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/70 p-7 sm:p-9 shadow-xl shadow-slate-900/5 my-8">
        <div className="mb-6 flex flex-col gap-1.5 text-left">
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Perbarui Kata Sandi</h1>
          <p className="text-sm text-[#475569] leading-relaxed">
            {user.harus_ganti_password
              ? "Akun Anda diwajibkan untuk mengganti kata sandi awal sebelum dapat melanjutkan."
              : "Masukkan kata sandi lama dan kata sandi baru untuk mengamankan akun Anda."}
          </p>
        </div>

        <GantiPasswordForm />
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Ruang Pintar Platform
      </footer>
    </div>
  );
}
