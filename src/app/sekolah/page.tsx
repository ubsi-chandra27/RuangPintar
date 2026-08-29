/**
 * Ruang Pintar — School & Organization Management Page (/sekolah)
 *
 * Server Component yang dilindungi requireAuth() dan otorisasi M02.
 */

import React from "react";
import { redirect } from "next/navigation";
import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { checkPermission } from "@/shared/infrastructure/authorization/authz-guard";
import { staffCapabilityService } from "@/shared/infrastructure/authorization/staff-capability-service";
import { AcademicShell } from "@/shared/components/shell/academic-shell";
import { PageHeader } from "@/shared/components/ui/page-header";
import { Breadcrumb } from "@/shared/components/shell/breadcrumb";
import { Badge } from "@/shared/components/ui/badge";
import { SchoolManagementTabs } from "@/modules/school/presentation/school-management-tabs";
import { schoolProfileService } from "@/modules/school/application/school-profile-service";
import { organizationUnitService } from "@/modules/school/application/organization-unit-service";
import { positionService } from "@/modules/school/application/position-service";
import { positionAssignmentService } from "@/modules/school/application/position-assignment-service";

export default async function SchoolManagementPage() {
  const user = await requireAuth();

  if (!user.sekolah_id) {
    redirect("/dashboard");
  }

  // Ambil capability bundle jika peran adalah SCHOOL_STAFF
  const staffCapabilities =
    user.peran_dasar === "SCHOOL_STAFF"
      ? await staffCapabilityService.getUserCapabilities(user.id)
      : [];

  // Evaluasi Hak Akses Server-Side
  const canViewSchool = await checkPermission("academic.school.view", {
    sekolah_id: user.sekolah_id,
  });

  const canManageSchool = await checkPermission("academic.school.manage", {
    sekolah_id: user.sekolah_id,
  });

  const canViewStructure = await checkPermission("academic.structure.view", {
    sekolah_id: user.sekolah_id,
  });

  const canManageStructure = await checkPermission("academic.structure.manage", {
    sekolah_id: user.sekolah_id,
  });

  // Jika tidak memiliki izin lihat profil maupun struktur -> redirect
  if (!canViewSchool && !canViewStructure) {
    redirect("/dashboard");
  }

  // Pengambilan Data Sesuai Izin
  const profile = await schoolProfileService.getProfile(user.sekolah_id);

  const units = canViewStructure ? await organizationUnitService.getUnits(user.sekolah_id) : [];

  const positions = canViewStructure ? await positionService.getPositions(user.sekolah_id) : [];

  const assignments = canViewStructure
    ? await positionAssignmentService.getAssignments(user.sekolah_id)
    : [];

  const personnel = canManageStructure
    ? await positionAssignmentService.getAssignablePersonnel(user.sekolah_id)
    : [];

  return (
    <AcademicShell user={user} userCapabilities={staffCapabilities}>
      <div className="space-y-6">
        <PageHeader
          title="Profil & Struktur Organisasi Sekolah"
          description="Pusat tata kelola identitas institusi, unit kerja, master jabatan struktural, dan penugasan personil."
          badge={<Badge variant="academic">Jenjang {profile.jenjang}</Badge>}
          breadcrumb={
            <Breadcrumb
              items={[
                { label: "Dashboard", href: "/dashboard" },
                { label: "Manajemen Sekolah", href: "/sekolah" },
              ]}
            />
          }
        />

        <SchoolManagementTabs
          profile={profile}
          units={units}
          positions={positions}
          assignments={assignments}
          personnel={personnel}
          canManageSchool={canManageSchool}
          canViewStructure={canViewStructure}
          canManageStructure={canManageStructure}
        />
      </div>
    </AcademicShell>
  );
}
