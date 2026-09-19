import React, { use } from "react";
import { AuthLoginLayout } from "@/shared/components/auth/auth-login-layout";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Masuk — Ruang Pintar",
  description: "Masuk ke School Digital Operating Platform Ruang Pintar",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams?:
    { reset?: string; registered?: string } | Promise<{ reset?: string; registered?: string }>;
}) {
  let statusMessage: string | undefined = undefined;

  if (searchParams) {
    const params =
      typeof (searchParams as any)?.then === "function"
        ? use(searchParams as Promise<{ reset?: string; registered?: string }>)
        : (searchParams as { reset?: string; registered?: string });

    if (params?.reset === "success") {
      statusMessage = "Kata sandi Anda berhasil diperbarui. Silakan masuk dengan kata sandi baru.";
    } else if (params?.registered === "success") {
      statusMessage = "Pendaftaran berhasil. Silakan masuk dengan akun baru Anda.";
    }
  }

  return (
    <AuthLoginLayout
      title="Masuk ke Ruang Pintar"
      description="Gunakan akun sekolah Anda untuk mengakses pembelajaran, aktivitas akademik, dan informasi sekolah."
    >
      <LoginForm status={statusMessage} />
    </AuthLoginLayout>
  );
}
