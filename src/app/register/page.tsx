import { Metadata } from "next";
import { AuthLoginLayout } from "@/shared/components/auth/auth-login-layout";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Daftar Akun — Ruang Pintar",
  description: "Daftar akun Ruang Pintar untuk guru mandiri dan sekolah.",
};

export default function RegisterPage() {
  return (
    <AuthLoginLayout
      title="Daftar Akun Ruang Pintar"
      description="Buat akun baru untuk memulai pengalaman administrasi dan pembelajaran modern terintegrasi."
      badge="Registrasi Cepat"
      backLink={{ href: "/login", label: "Kembali ke Masuk" }}
    >
      <RegisterForm />
    </AuthLoginLayout>
  );
}
