import React from "react";
import { AuthLoginLayout } from "@/shared/components/auth/auth-login-layout";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Masuk — Ruang Pintar",
  description: "Masuk ke School Digital Operating Platform Ruang Pintar",
};

export default function LoginPage() {
  return (
    <AuthLoginLayout
      title="Masuk ke Ruang Pintar"
      description="Gunakan akun sekolah Anda untuk mengakses pembelajaran, aktivitas akademik, dan informasi sekolah."
    >
      <LoginForm />
    </AuthLoginLayout>
  );
}
