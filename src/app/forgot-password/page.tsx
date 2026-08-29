import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Lupa Kata Sandi — Ruang Pintar",
  description: "Pemulihan kata sandi akun Ruang Pintar",
};

export default function ForgotPasswordPage() {
  return (
    <div className="relative min-h-screen w-full bg-[#F7F7F8] text-slate-900 flex flex-col justify-between items-center py-10 px-6 font-sans">
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

      {/* Info Card */}
      <div className="relative z-10 w-full max-w-[460px] bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/70 p-7 sm:p-9 shadow-xl shadow-slate-900/5 my-8">
        <div className="mb-6 flex flex-col items-center text-center gap-3">
          <div className="size-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <ShieldAlert className="size-7" />
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Lupa Kata Sandi?</h1>
          <p className="text-sm text-[#475569] leading-relaxed">
            Sesuai kebijakan keamanan platform akademik, pemulihan dan reset kata sandi akun
            dikelola langsung oleh <strong>Administrator / Operator Sekolah</strong>.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-xs text-slate-600 leading-relaxed space-y-2 mb-6">
          <p className="font-semibold text-slate-800">Langkah Pemulihan:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Hubungi tim Tata Usaha / Kurikulum / Operator Sekolah Anda.</li>
            <li>Sampaikan nama lengkap dan username akun sekolah Anda.</li>
            <li>
              Setelah kata sandi di-reset, Anda akan menerima kata sandi sementara dan diwajibkan
              membuat kata sandi baru saat login.
            </li>
          </ul>
        </div>

        <Link
          href="/login"
          className="h-12 w-full flex items-center justify-center gap-2 rounded-xl bg-[#1E293B] hover:bg-[#2B3B52] text-white font-semibold shadow-md shadow-slate-900/10 transition-all text-sm"
        >
          <ArrowLeft className="size-4" />
          <span>Kembali ke Halaman Masuk</span>
        </Link>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Ruang Pintar Platform
      </footer>
    </div>
  );
}
