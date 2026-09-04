/**
 * Ruang Pintar — Academic Period & Structure Management Page (/struktur-akademik)
 *
 * Server Component yang dilindungi requireAuth() dan otorisasi M02/M06.
 */

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Layers, Sparkles, Calendar, BookOpen, Users } from "lucide-react";
import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { checkPermission } from "@/shared/infrastructure/authorization/authz-guard";
import { staffCapabilityService } from "@/shared/infrastructure/authorization/staff-capability-service";
import { AcademicShell } from "@/shared/components/shell/academic-shell";
import { academicFacade } from "@/modules/academic/application/academic-facade";
import { AcademicManagementTabs } from "@/modules/academic/presentation/academic-management-tabs";
import { schoolProfileService } from "@/modules/school/application/school-profile-service";

export default async function AcademicStructurePage() {
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
  const canViewStructure = await checkPermission("academic.structure.view", {
    sekolah_id: user.sekolah_id,
  });

  const canManageStructure = await checkPermission("academic.structure.manage", {
    sekolah_id: user.sekolah_id,
  });

  // Jika tidak memiliki izin lihat struktur -> redirect ke dashboard
  if (!canViewStructure && !canManageStructure) {
    redirect("/dashboard");
  }

  // Pengambilan Data Struktur Akademik & Profil Sekolah
  const [academicData, schoolProfile] = await Promise.all([
    academicFacade.getFullAcademicStructure(user.sekolah_id),
    schoolProfileService.getProfile(user.sekolah_id),
  ]);

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
                <span className="text-slate-700 font-semibold">Struktur Akademik</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                    Struktur Akademik & Periode
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-700 font-bold text-xs">
                    {schoolProfile.nama}
                  </span>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-2xl">
                  Pusat konfigurasi siklus tahun ajaran, pembagian semester, klasifikasi tingkat
                  kelas & fase kurikulum, program keahlian/jurusan, serta pembentukan rombongan
                  belajar (rombel).
                </p>
              </div>

              {/* Quick Status Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700">
                  <Calendar className="h-3.5 w-3.5 text-[#2563EB]" />
                  <span>
                    T.A:{" "}
                    <strong>
                      {academicData.activeYear ? academicData.activeYear.nama : "Belum Ada"}
                    </strong>
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700">
                  <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
                  <span>
                    Semester:{" "}
                    <strong>
                      {academicData.activeSemester ? academicData.activeSemester.nama : "Belum Ada"}
                    </strong>
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700">
                  <Users className="h-3.5 w-3.5 text-emerald-600" />
                  <span>
                    Total Rombel: <strong>{academicData.rombels.length}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side: 3D Pop-Out Academic Structure Illustration */}
            <div className="hidden md:block absolute -top-8 -right-2 lg:-right-4 w-72 lg:w-80 h-52 lg:h-60 pointer-events-none z-20">
              <Image
                src="/images/illustrations/academic-structure-3d.png"
                alt="Ilustrasi Struktur Akademik 3D"
                width={360}
                height={270}
                priority
                unoptimized
                className="w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.12)] hover:scale-105 transition-transform duration-300 pointer-events-auto cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Tab Interface */}
        <AcademicManagementTabs initialData={academicData} canManage={canManageStructure} />
      </div>
    </AcademicShell>
  );
}
