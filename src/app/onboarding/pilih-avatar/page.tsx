import React from "react";
import { Metadata } from "next";
import { AuthLoginLayout } from "@/shared/components/auth/auth-login-layout";
import { AvatarPicker } from "./avatar-picker";

export const metadata: Metadata = {
  title: "Pilih Avatar — Ruang Pintar",
  description: "Pilih avatar karakter astronot untuk profil akun Ruang Pintar Anda",
};

export default function PilihAvatarPage() {
  return (
    <AuthLoginLayout
      title="Pilih Avatar Anda"
      description="Pilih karakter astronot favorit Anda untuk mewakili profil belajar dan aktivitas akademik Anda di Ruang Pintar."
      badge="Langkah 2 dari 3"
      backLink={{ href: "/register", label: "Kembali ke Registrasi" }}
      wideForm={true}
    >
      <AvatarPicker />
    </AuthLoginLayout>
  );
}
