/**
 * Ruang Pintar — Teacher & Teaching Assignment Page (/guru-pengajaran)
 *
 * Mendukung 2 mode operasional:
 * 1. Platform SaaS Multi-Tenant (SUPER_ADMIN): Menampilkan direktori seluruh dewan guru & penugasan
 *    jika diakses tanpa parameter sekolahId.
 * 2. Institusi Sekolah Tunggal: Menampilkan tab manajemen guru, mapel, penugasan KBM, dan wali kelas
 *    untuk sekolah aktif staf institusi atau sekolah yang dipilih oleh SUPER_ADMIN.
 */

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { GraduationCap, BookOpen, Layers, ArrowLeft } from "lucide-react";
import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { checkPermission } from "@/shared/infrastructure/authorization/authz-guard";
import { staffCapabilityService } from "@/shared/infrastructure/authorization/staff-capability-service";
import { AcademicShell } from "@/shared/components/shell/academic-shell";
import { TeacherFacade } from "@/modules/teacher/application/teacher-facade";
import { TeacherManagementTabs } from "@/modules/teacher/presentation/teacher-management-tabs";
import { SuperAdminTeacherDirectoryView } from "@/modules/teacher/presentation/super-admin-teacher-directory-view";
import { schoolProfileService } from "@/modules/school/application/school-profile-service";
import { prisma } from "@/shared/infrastructure/database/prisma";

interface TeacherManagementPageProps {
  searchParams?: Promise<{ sekolahId?: string }>;
}

export default async function TeacherManagementPage(props: TeacherManagementPageProps) {
  const user = await requireAuth();
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const isSuperAdmin = user.peran_dasar === "SUPER_ADMIN";

  // Mode 1: SUPER_ADMIN membuka direktori multi-tenant guru
  if (isSuperAdmin && !searchParams?.sekolahId) {
    const [rawTeachers, schools, totalTeachingAssignments] = await Promise.all([
      prisma.guru.findMany({
        orderBy: { created_at: "desc" },
        include: {
          sekolah: {
            select: { id: true, nama: true, jenjang: true },
          },
          pengguna: {
            select: { username: true, email: true, status_akun: true },
          },
          penugasan_mengajar: {
            where: { status: "AKTIF" },
            include: {
              mata_pelajaran: { select: { nama: true, kode: true } },
              rombel: { select: { nama: true } },
            },
          },
        },
      }),
      prisma.sekolah.findMany({
        select: { id: true, nama: true, jenjang: true },
        orderBy: { nama: "asc" },
      }),
      prisma.penugasanMengajar.count({
        where: { status: "AKTIF" },
      }),
    ]);

    return (
      <AcademicShell user={user} userCapabilities={[]}>
        <SuperAdminTeacherDirectoryView
          teachers={rawTeachers}
          schools={schools}
          totalTeachingAssignments={totalTeachingAssignments}
        />
      </AcademicShell>
    );
  }

  // Mode 2: Halaman manajemen guru sekolah tunggal
  const effectiveSekolahId = isSuperAdmin
    ? searchParams?.sekolahId ?? user.sekolah_id
    : user.sekolah_id;

  if (!effectiveSekolahId) {
    redirect(isSuperAdmin ? "/guru-pengajaran" : "/dashboard");
  }

  // Ambil capability bundle jika peran adalah SCHOOL_STAFF atau TEACHER
  const staffCapabilities =
    user.peran_dasar === "SCHOOL_STAFF" || user.peran_dasar === "TEACHER"
      ? await staffCapabilityService.getUserCapabilities(user.id)
      : [];

  // Evaluasi Hak Akses Server-Side
  const canViewTeachers = isSuperAdmin
    ? true
    : await checkPermission("academic.teachers.view", {
        sekolah_id: effectiveSekolahId,
      });

  const canManageTeachers = isSuperAdmin
    ? true
    : await checkPermission("academic.teachers.manage", {
        sekolah_id: effectiveSekolahId,
      });

  // Jika tidak memiliki izin -> redirect ke dashboard
  if (!canViewTeachers && !canManageTeachers) {
    redirect("/dashboard");
  }

  // Pengambilan Data Dataset Pendidik & Profil Sekolah dengan penanganan graceful
  let data;
  let schoolProfile;
  try {
    [data, schoolProfile] = await Promise.all([
      TeacherFacade.getTeacherManagementData(effectiveSekolahId),
      schoolProfileService.getProfile(effectiveSekolahId),
    ]);
  } catch {
    redirect(isSuperAdmin ? "/guru-pengajaran" : "/dashboard");
  }

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
              {isSuperAdmin ? (
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <Link href="/dashboard" className="hover:text-[#2563EB] transition-colors">
                    Dashboard
                  </Link>
                  <span>/</span>
                  <Link
                    href="/guru-pengajaran"
                    className="hover:text-[#2563EB] transition-colors"
                  >
                    Guru & Penugasan
                  </Link>
                  <span>/</span>
                  <span className="text-slate-700 font-semibold truncate max-w-[200px]">
                    {schoolProfile.nama}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <Link href="/dashboard" className="hover:text-[#2563EB] transition-colors">
                    Dashboard
                  </Link>
                  <span>/</span>
                  <span className="text-slate-700 font-semibold">Guru & Penugasan</span>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  {isSuperAdmin && (
                    <Link
                      href="/guru-pengajaran"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors mr-1"
                    >
                      <ArrowLeft className="size-3.5" />
                      <span>Kembali ke Direktori Guru</span>
                    </Link>
                  )}
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
