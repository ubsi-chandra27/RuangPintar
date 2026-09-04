/**
 * Ruang Pintar — Route /kelas-saya (Teacher Classes & Learning Supervision Directory)
 */

import { Metadata } from "next";
import { redirect } from "next/navigation";
import { requirePermission } from "@/shared/infrastructure/authorization/authz-guard";
import { staffCapabilityService } from "@/shared/infrastructure/authorization/staff-capability-service";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { learningService } from "@/modules/learning/application/learning-service";
import { TeacherClassesView } from "@/modules/learning/presentation/teacher-classes-view";
import { AcademicShell } from "@/shared/components/shell/academic-shell";
import { PageHeader } from "@/shared/components/ui/page-header";
import { Badge } from "@/shared/components/ui/badge";
import { BookOpen, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Kelas Saya — Ruang Pintar",
  description: "Daftar kelas pembelajaran yang diampu guru dan supervisi kurikulum",
};

export default async function KelasSayaPage() {
  const user = await requirePermission("learning.material.view");

  if (!user.sekolah_id) {
    redirect("/dashboard");
  }

  const isAdmin = user.peran_dasar === "SUPER_ADMIN" || user.peran_dasar === "SCHOOL_STAFF";

  const staffCapabilities =
    user.peran_dasar === "SCHOOL_STAFF"
      ? await staffCapabilityService.getUserCapabilities(user.id)
      : [];

  let guruId: string | null = null;
  let teacherName = user.nama_lengkap;
  let teachersList: Array<{
    id: string;
    nama_lengkap: string;
    gelar_depan: string | null;
    gelar_belakang: string | null;
    total_kelas: number;
  }> = [];

  if (user.peran_dasar === "TEACHER") {
    const guru = await prisma.guru.findFirst({
      where: {
        sekolah_id: user.sekolah_id,
        pengguna_id: user.id,
      },
    });

    if (guru) {
      guruId = guru.id;
      teacherName = guru.nama_lengkap;
    }
  }

  // Jika Super Admin / Staff, muat daftar seluruh guru pengampu untuk filter supervisi
  if (isAdmin) {
    teachersList = await learningService.listTeachersWithAssignments(user.sekolah_id);
  }

  // Ambil data penugasan kelas:
  // - Guru: hanya kelas yang diampunya
  // - Admin: seluruh kelas sekolah (bisa difilter per guru di UI)
  const classes = await learningService.listTeacherClasses(
    user.sekolah_id,
    isAdmin ? null : guruId
  );

  return (
    <AcademicShell
      user={user}
      userCapabilities={staffCapabilities}
      breadcrumbItems={[
        { label: "Dashboard", href: "/dashboard" },
        { label: isAdmin ? "Supervisi Pembelajaran" : "Kelas Saya" },
      ]}
    >
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 sm:pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                {isAdmin ? "Supervisi Kelas & Pembelajaran" : "Kelas Saya"}
              </h1>
              {isAdmin ? (
                <Badge
                  variant="info"
                  className="gap-1.5 bg-indigo-50 text-indigo-700 border-indigo-200 text-xs"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Supervisi Admin</span>
                </Badge>
              ) : (
                <Badge
                  variant="info"
                  className="gap-1.5 bg-blue-50 text-[#2563EB] border-blue-200 text-xs"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Workspace Guru</span>
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 hidden sm:block">
              {isAdmin
                ? "Direktori supervisi kurikulum, modul materi, tugas, dan rekam jurnal KBM seluruh guru dan rombel sekolah"
                : "Ruang kerja pembelajaran terpadu untuk mengelola Lingkup Materi (BAB), modul bacaan, tugas, dan jurnal KBM"}
            </p>
          </div>
        </div>

        <TeacherClassesView
          classes={classes}
          teacherName={teacherName}
          isAdmin={isAdmin}
          teachersList={teachersList}
        />
      </div>
    </AcademicShell>
  );
}
