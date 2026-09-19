import React from "react";
import { Metadata } from "next";
import { MarketingKitView } from "@/modules/marketing/presentation/marketing-kit-view";

export const metadata: Metadata = {
  title: "Panduan Cepat Guru & Materi Pemasaran | Ruang Pintar",
  description:
    "Panduan operasional kilat 1 halaman untuk guru dan materi template promosi WhatsApp siap pakai untuk adopsi sekolah.",
};

export default function PanduanPage() {
  return <MarketingKitView />;
}
