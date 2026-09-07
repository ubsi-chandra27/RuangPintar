/**
 * Ruang Pintar — Student Report Card Page (/rapor-siswa) (Phase 15 / M15)
 *
 * Portal Buku Nilai & Transkrip e-Rapor resmi Kurikulum Merdeka siswa.
 */

import React from "react";
import { redirect } from "next/navigation";
import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { AcademicShell } from "@/shared/components/shell/academic-shell";
import { studentExperienceService } from "@/modules/student/application/student-experience-service";
import { StudentReportCardView } from "@/modules/student/presentation/student-report-card-view";

export const metadata = {
  title: "Buku Nilai & e-Rapor Siswa — Ruang Pintar",
  description: "Transkrip nilai capaian pembelajaran dan lembar rapor resmi Kurikulum Merdeka.",
};

export const dynamic = "force-dynamic";

export default async function RaporSiswaPage() {
  const user = await requireAuth();

  if (user.peran_dasar !== "STUDENT" && user.peran_dasar !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  if (!user.sekolah_id) {
    redirect("/dashboard");
  }

  let reportCard;
  let grades;

  try {
    const [rc, pg] = await Promise.all([
      studentExperienceService.getReportCard(user.id, user.sekolah_id),
      studentExperienceService.getPublishedGrades(user.id, user.sekolah_id),
    ]);
    reportCard = rc;
    grades = pg.grades;
  } catch {
    redirect("/dashboard");
  }

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Buku Nilai & Rapor", href: "/rapor-siswa", isCurrent: true },
  ];

  return (
    <AcademicShell user={user} breadcrumbItems={breadcrumbItems}>
      <StudentReportCardView reportCard={reportCard} grades={grades} />
    </AcademicShell>
  );
}
