/**
 * Ruang Pintar — School & Organization Management Page (/sekolah)
 *
 * Server Component yang dilindungi requireAuth() dan otorisasi M02.
 */

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, Sparkles, School } from "lucide-react";
import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { checkPermission } from "@/shared/infrastructure/authorization/authz-guard";
import { staffCapabilityService } from "@/shared/infrastructure/authorization/staff-capability-service";
import { AcademicShell } from "@/shared/components/shell/academic-shell";
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
        {/* Modern 3D Pop-Out Hero Card */}
        <div className="relative rounded-3xl bg-white border border-slate-100/90 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-visible">
          {/* Subtle Background Accent Gradient */}
          <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-blue-50/60 to-transparent rounded-r-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Left Content */}
            <div className="w-full md:max-w-[60%] lg:max-w-[66%] space-y-3.5">
              {/* Breadcrumb Navigation */}
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <Link href="/dashboard" className="hover:text-[#2563EB] transition-colors">
                  Dashboard
                </Link>
                <span>/</span>
                <span className="text-slate-700 font-semibold">Manajemen Sekolah</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                    {profile.nama}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-700 font-bold text-xs">
                    Jenjang {profile.jenjang}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Pusat tata kelola profil resmi institusi, struktur unit kerja, master jabatan
                  struktural, dan penugasan personil aktif sekolah.
                </p>
              </div>

              {/* Status & Metadata Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-600 font-medium">
                  <Building2 className="h-3.5 w-3.5 text-[#2563EB]" />
                  <span>
                    NPSN: <strong className="text-slate-800">{profile.npsn || "-"}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 font-medium">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Status: Terverifikasi Aktif</span>
                </div>
              </div>
            </div>

            {/* Right Side: 3D Pop-Out School Illustration */}
            <div className="hidden md:block absolute -top-8 -right-2 lg:-right-4 w-72 lg:w-80 h-52 lg:h-60 pointer-events-none z-20">
              <Image
                src="/images/illustrations/school-hero-3d.png"
                alt="Ilustrasi Gedung Sekolah 3D"
                width={360}
                height={270}
                priority
                unoptimized
                className="w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.12)] hover:scale-105 transition-transform duration-300 pointer-events-auto cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Sub-module Tabs */}
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
