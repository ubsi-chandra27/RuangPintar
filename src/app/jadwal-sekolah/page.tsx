/**
 * Ruang Pintar — M10 Master Jadwal Sekolah Route Page (/jadwal-sekolah)
 *
 * Server Component yang dilindungi requireAuth() dan otorisasi M02/M10.
 */

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, Clock, Layers, Users } from "lucide-react";
import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { checkPermission } from "@/shared/infrastructure/authorization/authz-guard";
import { staffCapabilityService } from "@/shared/infrastructure/authorization/staff-capability-service";
import { AcademicShell } from "@/shared/components/shell/academic-shell";
import { academicYearService } from "@/modules/academic/application/academic-year-service";
import { TeachingAssignmentService } from "@/modules/teacher/application/teaching-assignment-service";
import { scheduleService } from "@/modules/schedule/application/schedule-service";
import { timeSlotService } from "@/modules/schedule/application/time-slot-service";
import { ScheduleManagementTabs } from "@/modules/schedule/presentation/schedule-management-tabs";
import { schoolProfileService } from "@/modules/school/application/school-profile-service";
import { prisma } from "@/shared/infrastructure/database/prisma";

export const metadata = {
  title: "Jadwal Pelajaran Sekolah — Ruang Pintar",
  description: "Master jadwal pelajaran sekolah, versioning, dan alokasi slot waktu.",
};

export const dynamic = "force-dynamic";

export default async function JadwalSekolahPage() {
  const user = await requireAuth();
  if (!user.sekolah_id) {
    redirect("/dashboard");
  }

  // Capability bundle if SCHOOL_STAFF
  const staffCapabilities =
    user.peran_dasar === "SCHOOL_STAFF"
      ? await staffCapabilityService.getUserCapabilities(user.id)
      : [];

  const canViewSchedule = await checkPermission("schedule.master.view", {
    sekolah_id: user.sekolah_id,
  });
  const canManageSchedule = await checkPermission("schedule.master.manage", {
    sekolah_id: user.sekolah_id,
  });
  const canPublishSchedule = await checkPermission("schedule.master.publish", {
    sekolah_id: user.sekolah_id,
  });

  if (!canViewSchedule && !canManageSchedule) {
    redirect("/dashboard");
  }

  // Fetch academic years & school profile
  const [academicYears, schoolProfile] = await Promise.all([
    academicYearService.getAcademicYears(user.sekolah_id),
    schoolProfileService.getProfile(user.sekolah_id),
  ]);

  // Fetch versions
  let versions = await scheduleService.listVersions(user.sekolah_id);

  // If no version exists, create default draft version
  if (versions.length === 0 && academicYears.length > 0 && canManageSchedule) {
    const activeYear = academicYears.find((y: any) => y.status === "AKTIF") || academicYears[0];
    const defaultVersion = await scheduleService.createVersion(user.id, user.peran_dasar, {
      sekolah_id: user.sekolah_id,
      tahun_ajaran_id: activeYear.id,
      nama: `Jadwal Pembelajaran ${activeYear.nama} v1`,
    });
    versions = [defaultVersion];
  }

  // Fetch time slots (seed if empty)
  let timeSlots = await timeSlotService.listTimeSlots(user.sekolah_id);
  if (timeSlots.length === 0 && canManageSchedule) {
    timeSlots = await timeSlotService.seedDefaultTimeSlotsIfEmpty(
      user.id,
      user.peran_dasar,
      user.sekolah_id
    );
  }
  const activeTimeSlots = timeSlots.filter((slot) => slot.status_aktif);

  // Fetch rombels
  const rombelsData = await prisma.rombel.findMany({
    where: { sekolah_id: user.sekolah_id, status: "AKTIF" },
    include: { tingkat: true },
    orderBy: { nama: "asc" },
  });

  // Fetch teaching assignments
  const assignments = await TeachingAssignmentService.getTeachingAssignments(user.sekolah_id, {
    status: "AKTIF",
  });

  // Fetch entries for all versions
  const entries =
    versions.length > 0
      ? (
          await Promise.all(
            versions.map((v) => scheduleService.listEntriesByVersion(v.id, user.sekolah_id!))
          )
        ).flat()
      : [];

  const publishedVersion = versions.find((v) => v.status === "PUBLISHED");
  const activeVersion = publishedVersion || versions[0];
  const activeVersionEntries = activeVersion
    ? entries.filter((entry) => entry.versi_jadwal_id === activeVersion.id)
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
                <span className="text-slate-700 font-semibold">Jadwal Pelajaran</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                    Master Jadwal Pelajaran
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-700 font-bold text-xs">
                    {schoolProfile.nama}
                  </span>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-2xl">
                  Penyusunan jadwal alokasi mata pelajaran mingguan per rombel, pencegahan konflik
                  jam guru & rombel, master slot waktu KBM, serta publikasi jadwal pembelajaran
                  resmi.
                </p>
              </div>

              {/* Quick Status Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700">
                  <Layers className="h-3.5 w-3.5 text-[#2563EB]" />
                  <span>
                    Versi Jadwal: <strong>{versions.length}</strong>
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50/80 border border-emerald-200/80 text-xs font-semibold text-emerald-700">
                  <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                  <span>
                    Status: <strong>{publishedVersion ? "Terpublikasi" : "Draft"}</strong>
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50/80 border border-indigo-200/80 text-xs font-semibold text-indigo-700">
                  <Clock className="h-3.5 w-3.5 text-indigo-600" />
                  <span>
                    Slot Waktu: <strong>{activeTimeSlots.length}</strong>
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-200/80 text-xs font-semibold text-[#2563EB]">
                  <Users className="h-3.5 w-3.5 text-[#2563EB]" />
                  <span>
                    Alokasi Jadwal: <strong>{activeVersionEntries.length}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Hero Illustration */}
            <div className="hidden md:flex flex-col items-center justify-center shrink-0 relative pr-4">
              <div className="relative w-44 h-36 lg:w-52 lg:h-44 transition-transform duration-500 hover:scale-105">
                <Image
                  src="/images/illustrations/academic-structure-3d.png"
                  alt="Schedule Management Illustration"
                  fill
                  sizes="(max-width: 1024px) 176px, 208px"
                  className="object-contain drop-shadow-xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Tabs View */}
        <ScheduleManagementTabs
          versions={versions}
          entries={entries}
          timeSlots={timeSlots}
          rombels={rombelsData.map((r) => ({
            id: r.id,
            nama: r.nama,
            tingkat_nama: r.tingkat?.nama ?? null,
          }))}
          assignments={assignments}
          academicYears={academicYears.map((y: any) => ({
            id: y.id,
            nama: y.nama,
            status: y.status,
          }))}
          canManage={canManageSchedule}
          canPublish={canPublishSchedule}
        />
      </div>
    </AcademicShell>
  );
}
