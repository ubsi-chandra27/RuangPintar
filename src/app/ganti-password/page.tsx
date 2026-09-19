import React from "react";
import { getCurrentUser } from "@/shared/infrastructure/auth/auth-guard";
import { AuthLoginLayout } from "@/shared/components/auth/auth-login-layout";
import { GantiPasswordForm } from "./ganti-password-form";

export const metadata = {
  title: "Ganti Kata Sandi — Ruang Pintar",
  description: "Perbarui kata sandi akun Ruang Pintar Anda",
};

export default async function GantiPasswordPage() {
  const user = await getCurrentUser();
  const isMandatory = Boolean(user?.harus_ganti_password);

  return (
    <AuthLoginLayout
      title={isMandatory ? "Wajib Ganti Kata Sandi" : "Atur Kata Sandi Baru"}
      description={
        isMandatory
          ? "Akun Anda diwajibkan untuk memperbarui kata sandi sebelum dapat melanjutkan ke sistem."
          : "Tetapkan kata sandi baru untuk mengamankan akun dan melanjutkan aktivitas belajar."
      }
      badge="Keamanan Akun"
      backLink={!isMandatory ? { href: "/login", label: "Kembali ke Masuk" } : undefined}
    >
      <GantiPasswordForm hasSession={Boolean(user)} isMandatory={isMandatory} />
    </AuthLoginLayout>
  );
}
