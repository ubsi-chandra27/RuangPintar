/**
 * Ruang Pintar — M09 Kalender Akademik Route Page (/kalender-akademik)
 *
 * Server Component yang dilindungi requireAuth() dan otorisasi M02/M09.
 */

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, CalendarCheck, Sparkles, PartyPopper } from "lucide-react";
import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { checkPermission } from "@/shared/infrastructure/authorization/authz-guard";
import { staffCapabilityService } from "@/shared/infrastructure/authorization/staff-capability-service";
import { AcademicShell } from "@/shared/components/shell/academic-shell";
import { academicYearService } from "@/modules/academic/application/academic-year-service";
import { semesterService } from "@/modules/academic/application/semester-service";
import { calendarService } from "@/modules/calendar/application/calendar-service";
import { AcademicCalendarView } from "@/modules/calendar/presentation/academic-calendar-view";
import { schoolProfileService } from "@/modules/school/application/school-profile-service";

export const metadata = {
  title: "Kalender Akademik — Ruang Pintar",
  description: "Agenda kegiatan sekolah resmi, hari libur nasional, orientasi, dan periode ujian.",
};

export const dynamic = "force-dynamic";

export default async function KalenderAkademikPage() {
  const user = await requireAuth();
  if (!user.sekolah_id) {
    redirect("/dashboard");
  }

  // Capability bundle if SCHOOL_STAFF
  const staffCapabilities =
    user.peran_dasar === "SCHOOL_STAFF"
      ? await staffCapabilityService.getUserCapabilities(user.id)
      : [];

  const canViewCalendar = await checkPermission("academic.calendar.view", {
    sekolah_id: user.sekolah_id,
  });
  const canManageCalendar = await checkPermission("academic.calendar.manage", {
    sekolah_id: user.sekolah_id,
  });

  if (!canViewCalendar && !canManageCalendar) {
    redirect("/dashboard");
  }

  // Fetch data in parallel
  const [academicYears, semesters, events, schoolProfile] = await Promise.all([
    academicYearService.getAcademicYears(user.sekolah_id),
    semesterService.getSemesters(user.sekolah_id),
    calendarService.listEvents(user.sekolah_id),
    schoolProfileService.getProfile(user.sekolah_id),
  ]);

  const holidayCount = events.filter((e) => e.libur_kbm || e.tipe_event === "HARI_LIBUR").length;
  const examCount = events.filter((e) => e.tipe_event === "UJIAN").length;
  const eventCount = events.filter(
    (e) => e.tipe_event === "KEGIATAN_SEKOLAH" || e.tipe_event === "ORIENTASI"
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
                <span className="text-slate-700 font-semibold">Kalender Akademik</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                    Kalender Akademik Sekolah
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-700 font-bold text-xs">
                    {schoolProfile.nama}
                  </span>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-2xl">
                  Pusat agenda kegiatan institusi sekolah resmi, penetapan hari libur dan cuti
                  bersama, periode evaluasi/asesmen pembelajaran, serta kegiatan masa pengenalan
                  lingkungan sekolah (MPLS).
                </p>
              </div>

              {/* Quick Status Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700">
                  <CalendarDays className="h-3.5 w-3.5 text-[#2563EB]" />
                  <span>
                    Total Agenda: <strong>{events.length}</strong>
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50/80 border border-rose-200/80 text-xs font-semibold text-rose-700">
                  <PartyPopper className="h-3.5 w-3.5 text-rose-600" />
                  <span>
                    Libur & Cuti: <strong>{holidayCount}</strong>
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50/80 border border-purple-200/80 text-xs font-semibold text-purple-700">
                  <CalendarCheck className="h-3.5 w-3.5 text-purple-600" />
                  <span>
                    Periode Ujian: <strong>{examCount}</strong>
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50/80 border border-emerald-200/80 text-xs font-semibold text-emerald-700">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  <span>
                    Kegiatan & MPLS: <strong>{eventCount}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Hero Illustration */}
            <div className="hidden md:flex flex-col items-center justify-center shrink-0 relative pr-4">
              <div className="relative w-44 h-36 lg:w-52 lg:h-44 transition-transform duration-500 hover:scale-105">
                <Image
                  src="/images/illustrations/school-hero-3d.png"
                  alt="Academic Calendar Illustration"
                  fill
                  sizes="(max-width: 1024px) 176px, 208px"
                  className="object-contain drop-shadow-xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Academic Calendar View Component */}
        <AcademicCalendarView
          initialEvents={events}
          academicYears={academicYears.map((y: any) => ({
            id: y.id,
            nama: y.nama,
            status: y.status,
          }))}
          semesters={semesters.map((s: any) => ({
            id: s.id,
            nama: s.nama,
            tahun_ajaran_id: s.tahun_ajaran_id,
          }))}
          canManage={canManageCalendar}
        />
      </div>
    </AcademicShell>
  );
}
