/**
 * Ruang Pintar — M10 Jadwal Pelajaran Saya Route Page (/jadwal-saya)
 *
 * Server Component yang dilindungi requireAuth().
 * Menampilkan jadwal spesifik personal (Guru / Siswa).
 */

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, Clock, BookOpen, Layers } from "lucide-react";
import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { staffCapabilityService } from "@/shared/infrastructure/authorization/staff-capability-service";
import { AcademicShell } from "@/shared/components/shell/academic-shell";
import { scheduleService } from "@/modules/schedule/application/schedule-service";
import { MyScheduleView } from "@/modules/schedule/presentation/my-schedule-view";
import { schoolProfileService } from "@/modules/school/application/school-profile-service";
import { prisma } from "@/shared/infrastructure/database/prisma";

export const metadata = {
  title: "Jadwal Pelajaran Saya — Ruang Pintar",
  description: "Daftar jadwal pelajaran personal siswa atau penugasan mengajar guru.",
};

export const dynamic = "force-dynamic";

export default async function JadwalSayaPage() {
  const user = await requireAuth();
  if (!user.sekolah_id) {
    redirect("/dashboard");
  }

  // Capability bundle if SCHOOL_STAFF
  const staffCapabilities =
    user.peran_dasar === "SCHOOL_STAFF"
      ? await staffCapabilityService.getUserCapabilities(user.id)
      : [];

  const isTeacher = user.peran_dasar === "TEACHER";
  const [schoolProfile] = await Promise.all([schoolProfileService.getProfile(user.sekolah_id)]);

  let entries: any[] = [];
  let teacherProfile: any = null;

  if (isTeacher) {
    teacherProfile = await prisma.guru.findFirst({
      where: {
        sekolah_id: user.sekolah_id,
        OR: [{ pengguna_id: user.id }, { email: user.email }],
      },
    });

    if (teacherProfile) {
      entries = await scheduleService.listTeacherSchedule(teacherProfile.id, user.sekolah_id, true);
    }
  } else if (user.peran_dasar === "STUDENT") {
    // Look up student's active enrollment and rombel placement
    const student = await prisma.siswa.findFirst({
      where: {
        sekolah_id: user.sekolah_id,
        pengguna_id: user.id,
      },
      include: {
        keikutsertaan: {
          where: { status: "AKTIF" },
          include: {
            penempatan: {
              where: { status: "AKTIF" },
              include: { rombel: true },
            },
          },
        },
      },
    });

    const activePlacement = student?.keikutsertaan[0]?.penempatan[0];
    const activeRombelId = activePlacement?.rombel_id;
    if (activeRombelId) {
      const activeVersion = await prisma.versiJadwal.findFirst({
        where: { sekolah_id: user.sekolah_id, status: "PUBLISHED" },
      });
      if (activeVersion) {
        const allEntries = await scheduleService.listEntriesByVersion(
          activeVersion.id,
          user.sekolah_id
        );
        entries = allEntries.filter((e) => e.rombel_id === activeRombelId);
      }
    }
  } else {
    // For admin / staff preview: show published master entries
    const activeVersion = await prisma.versiJadwal.findFirst({
      where: { sekolah_id: user.sekolah_id, status: "PUBLISHED" },
    });
    if (activeVersion) {
      entries = await scheduleService.listEntriesByVersion(activeVersion.id, user.sekolah_id);
    }
  }

  const uniqueSubjects = new Set(entries.map((e) => e.mata_pelajaran_nama)).size;
  const uniqueRombels = new Set(entries.map((e) => e.rombel_nama)).size;

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
                <span className="text-slate-700 font-semibold">Jadwal Saya</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                    {isTeacher ? "Jadwal Mengajar Saya" : "Jadwal Pelajaran Saya"}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-700 font-bold text-xs">
                    {schoolProfile.nama}
                  </span>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-2xl">
                  {isTeacher
                    ? "Daftar alokasi waktu mengajar mingguan resmi dan akses langsung pembukaan sesi kelas KBM."
                    : "Jadwal mata pelajaran mingguan rombel belajar Anda berdasarkan publikasi kurikulum resmi."}
                </p>
              </div>

              {/* Quick Status Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700">
                  <Clock className="h-3.5 w-3.5 text-[#2563EB]" />
                  <span>
                    Total Sesi: <strong>{entries.length} Jam</strong>
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50/80 border border-emerald-200/80 text-xs font-semibold text-emerald-700">
                  <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                  <span>
                    Mata Pelajaran: <strong>{uniqueSubjects}</strong>
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-200/80 text-xs font-semibold text-[#2563EB]">
                  <Layers className="h-3.5 w-3.5 text-[#2563EB]" />
                  <span>
                    Rombel: <strong>{uniqueRombels}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Hero Illustration */}
            <div className="hidden md:flex flex-col items-center justify-center shrink-0 relative pr-4">
              <div className="relative w-44 h-36 lg:w-52 lg:h-44 transition-transform duration-500 hover:scale-105">
                <Image
                  src="/images/illustrations/academic-structure-3d.png"
                  alt="My Schedule Illustration"
                  fill
                  sizes="(max-width: 1024px) 176px, 208px"
                  className="object-contain drop-shadow-xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* My Schedule View Component */}
        <MyScheduleView
          entries={entries}
          teacherName={teacherProfile?.nama_lengkap ?? user.nama_lengkap}
          isTeacher={isTeacher}
        />
      </div>
    </AcademicShell>
  );
}
