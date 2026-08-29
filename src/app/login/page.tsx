import React from "react";
import Image from "next/image";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Masuk — Ruang Pintar",
  description: "Masuk ke School Digital Operating Platform Ruang Pintar",
};

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full bg-[#F7F7F8] text-slate-900 flex flex-col justify-between overflow-x-hidden font-sans selection:bg-blue-500 selection:text-white">
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 88% 12%, rgba(14, 165, 233, 0.08), transparent 35%)",
        }}
      />

      {/* Top Header / Brand Navigation */}
      <header className="relative z-20 w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-6 flex items-center gap-3.5">
        <div className="size-11 sm:size-12 rounded-2xl bg-white/80 backdrop-blur-md shadow-sm border border-slate-200/60 p-2 flex items-center justify-center shrink-0">
          <Image
            src="/images/brand/ruang-pintar-mark.png"
            alt="Ruang Pintar Mark"
            width={40}
            height={40}
            priority
            className="size-full object-contain"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[17px] font-bold text-[#1E293B] tracking-tight leading-tight">
            Ruang Pintar
          </span>
          <span className="text-[11px] font-semibold text-[#475569] tracking-normal">
            Academic Learning Platform
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-[1440px] mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 items-center px-6 lg:px-12 pb-10">
        {/* Left Section: Artwork Hero (Desktop 58% ~ 7 cols) */}
        <div className="hidden lg:flex lg:col-span-7 relative h-[600px] xl:h-[680px] w-full items-center justify-center overflow-hidden rounded-3xl">
          <div className="relative size-full">
            <Image
              src="/images/auth/login-hero-astronaut.png"
              alt="Astronaut Belajar Ruang Pintar"
              fill
              priority
              className="object-contain object-left scale-105"
            />
          </div>
        </div>

        {/* Right Section: Login Form Card (Desktop 42% ~ 5 cols) */}
        <div className="w-full lg:col-span-5 flex flex-col items-center justify-center">
          <div className="w-full max-w-[470px] bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/70 p-7 sm:p-9 shadow-xl shadow-slate-900/5">
            {/* Header Form */}
            <div className="mb-7 flex flex-col gap-2 text-left">
              <h1 className="text-[28px] sm:text-[32px] font-bold text-[#0F172A] tracking-tight leading-tight">
                Masuk ke Ruang Pintar
              </h1>
              <p className="text-sm text-[#475569] leading-relaxed">
                Gunakan akun sekolah Anda untuk mengakses pembelajaran, aktivitas akademik, dan
                informasi sekolah.
              </p>
            </div>

            {/* Interactive Form Component */}
            <LoginForm />
          </div>

          {/* Mobile Artwork Preview (Under form on mobile) */}
          <div className="mt-8 lg:hidden relative h-48 w-full max-w-[320px] mx-auto opacity-90">
            <Image
              src="/images/auth/login-hero-astronaut.png"
              alt="Astronaut Belajar Ruang Pintar"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="relative z-10 w-full py-4 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Ruang Pintar Platform. Hak Cipta Dilindungi.
      </footer>
    </div>
  );
}
