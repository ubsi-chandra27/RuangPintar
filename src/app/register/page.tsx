import { Metadata } from "next";
import { RegisterView } from "@/modules/ai-assistant/presentation/register-view";

export const metadata: Metadata = {
  title: "Daftar Akun Guru Mandiri — Ruang Pintar SaaS",
  description:
    "Coba gratis 30 hari Ruang Pintar: absensi kelas cepat 15 detik, rekapitulasi Kurikulum Merdeka format A4, dan pembuatan kelas otomatis via foto AI.",
};

export default function RegisterPage() {
  return <RegisterView />;
}
