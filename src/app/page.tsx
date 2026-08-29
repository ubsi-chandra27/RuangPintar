import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/shared/infrastructure/auth/auth-guard";
import { logoutAction } from "@/app/actions/auth-actions";
import { LogOut, User, ShieldCheck } from "lucide-react";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-[#F7F7F8] font-sans">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-8 shadow-xl shadow-slate-900/5">
        <div className="flex items-center justify-center gap-3">
          <div className="size-12 rounded-2xl bg-white border border-slate-200 p-2 shadow-sm flex items-center justify-center">
            <Image
              src="/images/brand/ruang-pintar-mark.png"
              alt="Ruang Pintar"
              width={36}
              height={36}
              className="size-full object-contain"
            />
          </div>
          <div className="text-left">
            <h1 className="text-xl font-bold text-[#1E293B] leading-tight">Ruang Pintar</h1>
            <p className="text-xs text-slate-500 font-medium">School Digital Operating Platform</p>
          </div>
        </div>

        {user ? (
          <div className="space-y-4 pt-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-left">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm mb-1">
                <ShieldCheck className="size-4 text-emerald-600" />
                <span>Sesi Terautentikasi</span>
              </div>
              <p className="text-sm font-bold text-slate-800">{user.nama_lengkap}</p>
              <p className="text-xs text-slate-600">
                Username: <span className="font-mono">{user.username}</span> | Peran:{" "}
                <span className="font-semibold text-emerald-700">{user.peran_dasar}</span>
              </p>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-semibold text-sm transition-colors"
              >
                <LogOut className="size-4" />
                <span>Keluar dari Akun (Logout)</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-slate-600 leading-relaxed">
              Selamat datang di Ruang Pintar. Silakan masuk untuk mengakses ekosistem digital
              sekolah.
            </p>

            <Link
              href="/login"
              className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-[#1E293B] hover:bg-[#2B3B52] text-white font-semibold text-sm shadow-md shadow-slate-900/10 transition-all"
            >
              <User className="size-4" />
              <span>Masuk ke Halaman Login</span>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
