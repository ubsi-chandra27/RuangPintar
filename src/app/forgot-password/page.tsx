import React from "react";
import { AuthLoginLayout } from "@/shared/components/auth/auth-login-layout";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata = {
  title: "Lupa Kata Sandi — Ruang Pintar",
  description: "Pemulihan kata sandi akun Ruang Pintar",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLoginLayout
      badge="Pemulihan Akun"
      title="Lupa Kata Sandi?"
      description="Masukkan alamat email atau username sekolah Anda. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi."
      backLink={{ href: "/login", label: "Kembali ke Halaman Masuk" }}
    >
      <ForgotPasswordForm />
    </AuthLoginLayout>
  );
}
