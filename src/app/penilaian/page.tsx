import { Metadata } from "next";
import { redirect } from "next/navigation";
import { requirePermission } from "@/shared/infrastructure/authorization/authz-guard";
import { staffCapabilityService } from "@/shared/infrastructure/authorization/staff-capability-service";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { assessmentService } from "@/modules/assessment/application/assessment-service";
import { TeacherGradebookOverviewView } from "@/modules/assessment/presentation/teacher-gradebook-overview-view";
import { AcademicShell } from "@/shared/components/shell/academic-shell";

export const metadata: Metadata = {
  title: "Buku Nilai & Penilaian TP — Ruang Pintar",
  description: "Pusat rekapitulasi penilaian formatif, sumatif, dan buku nilai guru",
};

export default async function PenilaianPage() {
  const user = await requirePermission("assessment.grades.manage");

  if (!user.sekolah_id) {
    redirect("/dashboard");
  }

  const isSuperAdmin = user.peran_dasar === "SUPER_ADMIN";

  const staffCapabilities =
    user.peran_dasar === "SCHOOL_STAFF"
      ? await staffCapabilityService.getUserCapabilities(user.id)
      : [];

  let guruId: string | null = null;
  if (user.peran_dasar === "TEACHER") {
    const guru = await prisma.guru.findFirst({
      where: {
        sekolah_id: user.sekolah_id,
        pengguna_id: user.id,
      },
    });
    if (guru) {
      guruId = guru.id;
    }
  }

  const overviewList = await assessmentService.getTeacherOverview(
    user.sekolah_id,
    guruId,
    isSuperAdmin
  );

  return (
    <AcademicShell
      user={user}
      userCapabilities={staffCapabilities}
      breadcrumbItems={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Buku Nilai & Penilaian", href: "/penilaian", isCurrent: true },
      ]}
    >
      <TeacherGradebookOverviewView overviewList={overviewList} isSuperAdmin={isSuperAdmin} />
    </AcademicShell>
  );
}
