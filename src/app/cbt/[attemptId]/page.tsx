/**
 * Ruang Pintar — Route /cbt/[attemptId] (Secure CBT Exam Player)
 */

import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { cbtService } from "@/modules/cbt/application/cbt-service";
import { CbtPlayerView } from "@/modules/cbt/presentation/cbt-player-view";

interface PageProps {
  params: Promise<{ attemptId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { attemptId } = await params;
  return {
    title: `Lembar Ujian CBT — Ruang Pintar`,
    description: `Sesi pengerjaan ujian daring CBT ${attemptId}`,
  };
}

export default async function CbtPlayerPage({ params }: PageProps) {
  const { attemptId } = await params;
  const user = await requireAuth();

  if (!user.sekolah_id) {
    redirect("/dashboard");
  }

  // Resolve Siswa
  let siswaId: string | null = null;
  if (user.peran_dasar === "STUDENT") {
    const siswa = await prisma.siswa.findFirst({
      where: { sekolah_id: user.sekolah_id, pengguna_id: user.id },
    });
    if (siswa) {
      siswaId = siswa.id;
    }
  } else if (user.peran_dasar === "SUPER_ADMIN") {
    // For admin preview/test, fallback to session owner
    const session = await prisma.sesiUjianSiswa.findUnique({
      where: { id: attemptId },
      select: { siswa_id: true },
    });
    if (session) {
      siswaId = session.siswa_id;
    }
  }

  if (!siswaId) {
    redirect("/dashboard");
  }

  let payload;
  try {
    payload = await cbtService.getAttemptPlayer(attemptId, user.sekolah_id, siswaId);
  } catch (err: any) {
    // If exam was completed, check if result exists
    if (err?.name === "CbtAttemptClosedError" || err?.name === "CbtTimerExpiredError") {
      redirect(`/cbt/result/${attemptId}`);
    }
    notFound();
  }

  return (
    <CbtPlayerView
      initialSession={payload.session}
      manifest={payload.manifest}
      initialTimeRemainingSeconds={payload.timeRemainingSeconds}
      initialSavedAnswers={payload.savedAnswers}
      ujian={payload.ujian}
    />
  );
}
