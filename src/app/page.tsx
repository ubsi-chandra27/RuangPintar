import React from "react";
import { getCurrentUser } from "@/shared/infrastructure/auth/auth-guard";
import { ModernLandingView } from "@/modules/marketing/presentation/modern-landing-view";

export default async function LandingPage() {
  const user = await getCurrentUser();

  return (
    <ModernLandingView
      user={
        user
          ? {
              id: user.id,
              nama: user.nama_lengkap,
              username: user.username,
              role: user.peran_dasar,
            }
          : null
      }
    />
  );
}
