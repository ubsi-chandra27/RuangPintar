import React, { Suspense } from "react";
import { Metadata } from "next";
import { AuthLoginLayout } from "@/shared/components/auth/auth-login-layout";
import { SelesaiView } from "./selesai-view";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Mulai Perjalanan Anda — Ruang Pintar",
  description: "Selamat datang di Ruang Pintar Platform Operasional Sekolah Cerdas",
};

export default function SelesaiOnboardingPage() {
  return (
    <AuthLoginLayout
      title="Mulai Perjalanan Anda"
      description="Akun dan profil Anda telah siap. Selamat menjelajahi platform operasional sekolah cerdas Ruang Pintar."
      badge="Langkah Terakhir"
    >
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <Loader2 className="size-8 animate-spin mb-2 text-blue-600" />
            <span className="text-xs">Menyiapkan profil Anda...</span>
          </div>
        }
      >
        <SelesaiView />
      </Suspense>
    </AuthLoginLayout>
  );
}
