/**
 * Ruang Pintar — Teacher & Teaching Assignment Page (/guru-pengajaran)
 *
 * Server Component yang dilindungi requireAuth() dan otorisasi M02/M08.
 */

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { GraduationCap, BookOpen, Layers, Users } from "lucide-react";
import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { checkPermission } from "@/shared/infrastructure/authorization/authz-guard";
import { staffCapabilityService } from "@/shared/infrastructure/authorization/staff-capability-service";
import { AcademicShell } from "@/shared/components/shell/academic-shell";
import { TeacherFacade } from "@/modules/teacher/application/teacher-facade";
import { TeacherManagementTabs } from "@/modules/teacher/presentation/teacher-management-tabs";
import { schoolProfileService } from "@/modules/school/application/school-profile-service";

export default async function TeacherManagementPage() {
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
  const canViewTeachers = await checkPermission("academic.teachers.view", {
    sekolah_id: user.sekolah_id,
  });

  const canManageTeachers = await checkPermission("academic.teachers.manage", {
    sekolah_id: user.sekolah_id,
  });

  // Jika tidak memiliki izin -> redirect ke dashboard
  if (!canViewTeachers && !canManageTeachers) {
    redirect("/dashboard");
  }

  // Pengambilan Data Dataset Pendidik & Profil Sekolah
  const [data, schoolProfile] = await Promise.all([
    TeacherFacade.getTeacherManagementData(user.sekolah_id),
    schoolProfileService.getProfile(user.sekolah_id),
  ]);

  const activeTeachersCount = data.teachers.filter((t) => t.status_aktif).length;
  const activeSubjectsCount = data.subjects.filter((subject) => subject.status_aktif).length;
  const activeTeachingAssignmentsCount = data.teachingAssignments.filter(
    (t) => t.status === "AKTIF"
  ).length;

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
                <span className="text-slate-700 font-semibold">Guru & Penugasan</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                    Pendidik & Penugasan Akademik
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-700 font-bold text-xs">
                    {schoolProfile.nama}
                  </span>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-2xl">
                  Pusat tata kelola profil pendidik profesional, master mata pelajaran kurikulum,
                  alokasi penugasan mengajar rombel, serta penetapan tanggung jawab wali kelas.
                </p>
              </div>

              {/* Quick Status Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700">
                  <GraduationCap className="h-3.5 w-3.5 text-[#2563EB]" />
                  <span>
                    Total Guru: <strong>{data.teachers.length}</strong>
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50/80 border border-emerald-200/80 text-xs font-semibold text-emerald-700">
                  <GraduationCap className="h-3.5 w-3.5 text-emerald-600" />
                  <span>
                    Guru Aktif: <strong>{activeTeachersCount}</strong>
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50/80 border border-indigo-200/80 text-xs font-semibold text-indigo-700">
                  <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
                  <span>
                    Mapel Aktif: <strong>{activeSubjectsCount}</strong>
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-200/80 text-xs font-semibold text-[#2563EB]">
                  <Layers className="h-3.5 w-3.5 text-[#2563EB]" />
                  <span>
                    Penugasan Aktif: <strong>{activeTeachingAssignmentsCount}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Hero Illustration */}
            <div className="hidden md:flex flex-col items-center justify-center shrink-0 relative pr-4">
              <div className="relative w-44 h-36 lg:w-52 lg:h-44 transition-transform duration-500 hover:scale-105">
                <Image
                  src="/images/illustrations/school-hero-3d.png"
                  alt="Teacher Lifecycle Illustration"
                  fill
                  sizes="(max-width: 1024px) 176px, 208px"
                  className="object-contain drop-shadow-xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Interactive Views */}
        <TeacherManagementTabs initialData={data} canManage={canManageTeachers} />
      </div>
    </AcademicShell>
  );
}
