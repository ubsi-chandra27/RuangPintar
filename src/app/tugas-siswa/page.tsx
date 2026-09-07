/**
 * Ruang Pintar — Student Learning Page (/tugas-siswa) (Phase 15 / M15)
 *
 * Portal pembelajaran siswa terpadu untuk materi, tugas kelas, dan presensi.
 */

import React from "react";
import { redirect } from "next/navigation";
import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { AcademicShell } from "@/shared/components/shell/academic-shell";
import { studentExperienceService } from "@/modules/student/application/student-experience-service";
import { StudentLearningView } from "@/modules/student/presentation/student-learning-view";

export const metadata = {
  title: "Materi & Tugas Pembelajaran — Ruang Pintar",
  description: "Daftar materi pembelajaran, modul, dan lembar pengumpulan tugas siswa.",
};

export const dynamic = "force-dynamic";

export default async function TugasSiswaPage() {
  const user = await requireAuth();

  if (user.peran_dasar !== "STUDENT" && user.peran_dasar !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  if (!user.sekolah_id) {
    redirect("/dashboard");
  }

  let data;

  try {
    data = await studentExperienceService.getMaterialsAndAssignments(user.id, user.sekolah_id);
  } catch {
    // Jika siswa belum terdaftar di rombel aktif
    redirect("/dashboard");
  }

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Materi & Tugas", href: "/tugas-siswa", isCurrent: true },
  ];

  return (
    <AcademicShell user={user} breadcrumbItems={breadcrumbItems}>
      <StudentLearningView
        profile={data.profile}
        materials={data.materials}
        assignments={data.assignments}
        attendance={data.attendance}
      />
    </AcademicShell>
  );
}
