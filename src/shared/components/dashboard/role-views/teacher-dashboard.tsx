import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  GraduationCap,
  BookOpen,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  ShieldCheck,
  AlertCircle,
  PlayCircle,
  CalendarDays,
  FileSpreadsheet,
  MonitorPlay,
  Briefcase,
  ChevronRight,
} from "lucide-react";
import { AuthenticatedUser } from "@/shared/infrastructure/auth/auth-service";
import { TeacherDashboardData, TeacherFacade } from "@/modules/teacher/application/teacher-facade";
import { scheduleService } from "@/modules/schedule/application/schedule-service";
import { classSessionService } from "@/modules/schedule/application/class-session-service";
import {
  ClassSessionDTO,
  HariBelajar,
  ScheduleEntryDTO,
} from "@/modules/schedule/domain/schedule-types";
import { mergeConsecutiveScheduleEntries } from "@/modules/schedule/domain/schedule-merger";
import { TeacherTodaySchedule } from "./teacher-today-schedule";

export interface TeacherDashboardProps {
  user: AuthenticatedUser;
  initialData?: TeacherDashboardData;
}

export async function TeacherDashboard({ user, initialData }: TeacherDashboardProps) {
  const dashboardData =
    initialData || (await TeacherFacade.getTeacherDashboardData(user.id, user.sekolah_id));

  const {
    hasProfile,
    teacher,
    activeAssignments,
    activeHomeroom,
    totalJamMinggu,
    totalRombel,
    totalSiswaBinaan,
  } = dashboardData;

  const namaGelar = teacher?.nama_dengan_gelar || user.nama_lengkap;

  const hariMap: Record<number, HariBelajar> = {
    1: "SENIN",
    2: "SELASA",
    3: "RABU",
    4: "KAMIS",
    5: "JUMAT",
    6: "SABTU",
    0: "MINGGU",
  };
  const todayHari = hariMap[new Date().getDay()] || "SENIN";

  let teacherSchedules: ScheduleEntryDTO[] = [];
  let todaySchedules: ScheduleEntryDTO[] = [];
  let actualSessions: ClassSessionDTO[] = [];

  if (teacher && user.sekolah_id) {
    try {
      const [schedulesRes, sessionsRes] = await Promise.all([
        scheduleService.listTeacherSchedule(teacher.id, user.sekolah_id, true),
        classSessionService.listSessions(user.sekolah_id, {
          guru_id: teacher.id,
          tanggal: new Date(),
        }),
      ]);
      teacherSchedules = schedulesRes;
      todaySchedules = teacherSchedules.filter((s) => s.hari === todayHari);
      actualSessions = sessionsRes;
    } catch {
      teacherSchedules = [];
      todaySchedules = [];
      actualSessions = [];
    }
  }

  // Gabungkan jam pelajaran berurutan untuk jadwal hari ini
  const mergedTodayBlocks = mergeConsecutiveScheduleEntries(todaySchedules);
  const totalJamHariIni = todaySchedules.length;

  // Preview 4 penugasan mengajar di samping jadwal hari ini
  const previewAssignments = activeAssignments.slice(0, 4);

  return (
    <div className="space-y-4 pb-8">
      {/* 1. Header Ringkas (Compact Header) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0F172A]">
              Selamat Datang, {namaGelar}
            </h1>
            <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-[#2563EB] text-xs font-bold border border-blue-100">
              Guru Pengajar
            </span>
            {activeHomeroom && (
              <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                Wali Kelas {activeHomeroom.rombel_nama}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pusat operasional mengajar harian, pembukaan KBM rombel, dan pemantauan akademik.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {teacher?.nip && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-xs font-semibold text-slate-700">
              <ShieldCheck className="h-3.5 w-3.5 text-[#2563EB]" />
              <span>NIP: {teacher.nip}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/70 text-xs font-bold text-emerald-700 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Tahun Ajaran Aktif</span>
          </div>
        </div>
      </div>

      {/* 2. Slim KPI Bar (4 Kolom Ramping & Efisien) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Metric 1: Jadwal Hari Ini */}
        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50 text-[#2563EB] shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 block truncate">
              Jadwal Hari Ini
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-900 block truncate">
              {mergedTodayBlocks.length > 0
                ? `${mergedTodayBlocks.length} Sesi (${totalJamHariIni} JP)`
                : "0 Sesi"}
            </span>
          </div>
        </div>

        {/* Metric 2: Penugasan Mengajar */}
        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
            <Layers className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 block truncate">
              Penugasan Mengajar
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-900 block truncate">
              {activeAssignments.length} Penugasan
            </span>
          </div>
        </div>

        {/* Metric 3: Rombel Diampu */}
        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 block truncate">
              Kelas / Rombel Diampu
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-900 block truncate">
              {totalRombel} Rombel ({totalSiswaBinaan} Siswa)
            </span>
          </div>
        </div>

        {/* Metric 4: Status Wali Kelas */}
        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 block truncate">
              Status Wali Kelas
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-900 block truncate">
              {activeHomeroom ? activeHomeroom.rombel_nama : "Bukan Wali"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Command Center Grid: Berdampingan Kiri & Kanan (Pas 1 Layar / Zero-Scroll Design) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Kolom Kiri (7 Kolom): Kokpit Jadwal Mengajar Hari Ini */}
        <div className="lg:col-span-7">
          <TeacherTodaySchedule
            mergedBlocks={mergedTodayBlocks}
            actualSessions={actualSessions}
            todayHari={todayHari}
            totalJamHariIni={totalJamHariIni}
          />
        </div>

        {/* Kolom Kanan (5 Kolom): Aksi Cepat & Kelas Saya */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card A: Aksi Cepat Guru (6 Modul Utama dalam 3 Kolom Ringkas) */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-3.5 sm:p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#2563EB]" />
                <h3 className="text-xs sm:text-sm font-extrabold text-[#0F172A]">
                  Aksi Cepat Guru
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">Pintasan Fitur</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Link
                href="/jadwal-saya"
                className="p-2 rounded-xl bg-slate-50/70 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 transition-all flex flex-col items-center text-center gap-1 group"
              >
                <div className="h-7 w-7 rounded-lg bg-blue-100/70 text-[#2563EB] group-hover:scale-105 transition-transform flex items-center justify-center">
                  <Calendar className="h-3.5 w-3.5" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 block leading-tight">
                  Jadwal Saya
                </span>
              </Link>

              <Link
                href="/sesi-pembelajaran"
                className="p-2 rounded-xl bg-slate-50/70 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 transition-all flex flex-col items-center text-center gap-1 group"
              >
                <div className="h-7 w-7 rounded-lg bg-emerald-100/70 text-emerald-600 group-hover:scale-105 transition-transform flex items-center justify-center">
                  <PlayCircle className="h-3.5 w-3.5" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 block leading-tight">
                  Sesi KBM
                </span>
              </Link>

              <Link
                href="/kelas-saya"
                className="p-2 rounded-xl bg-slate-50/70 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 transition-all flex flex-col items-center text-center gap-1 group"
              >
                <div className="h-7 w-7 rounded-lg bg-indigo-100/70 text-indigo-600 group-hover:scale-105 transition-transform flex items-center justify-center">
                  <BookOpen className="h-3.5 w-3.5" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 block leading-tight">
                  Kelas Saya
                </span>
              </Link>

              <Link
                href="/penilaian"
                className="p-2 rounded-xl bg-slate-50/70 hover:bg-amber-50 border border-slate-100 hover:border-amber-200 transition-all flex flex-col items-center text-center gap-1 group"
              >
                <div className="h-7 w-7 rounded-lg bg-amber-100/70 text-amber-600 group-hover:scale-105 transition-transform flex items-center justify-center">
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 block leading-tight">
                  Buku Nilai
                </span>
              </Link>

              <Link
                href="/cbt-ujian"
                className="p-2 rounded-xl bg-slate-50/70 hover:bg-violet-50 border border-slate-100 hover:border-violet-200 transition-all flex flex-col items-center text-center gap-1 group"
              >
                <div className="h-7 w-7 rounded-lg bg-violet-100/70 text-violet-600 group-hover:scale-105 transition-transform flex items-center justify-center">
                  <MonitorPlay className="h-3.5 w-3.5" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 block leading-tight">
                  Ujian CBT
                </span>
              </Link>

              <Link
                href="/kalender-akademik"
                className="p-2 rounded-xl bg-slate-50/70 hover:bg-purple-50 border border-slate-100 hover:border-purple-200 transition-all flex flex-col items-center text-center gap-1 group"
              >
                <div className="h-7 w-7 rounded-lg bg-purple-100/70 text-purple-600 group-hover:scale-105 transition-transform flex items-center justify-center">
                  <CalendarDays className="h-3.5 w-3.5" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 block leading-tight">
                  Kalender
                </span>
              </Link>
            </div>
          </div>

          {/* Card B: Penugasan Mengajar & Kelas Saya (Workspace Hub Ringkas) */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-3.5 sm:p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 min-w-0">
                <Layers className="h-4 w-4 text-[#2563EB] shrink-0" />
                <h3 className="text-xs sm:text-sm font-extrabold text-[#0F172A] truncate">
                  Penugasan Mengajar & Kelas Saya
                </h3>
              </div>
              <Link
                href="/kelas-saya"
                className="text-[11px] font-bold text-[#2563EB] hover:underline shrink-0 flex items-center gap-0.5"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {!hasProfile ? (
              <div className="p-3 rounded-xl bg-amber-50 text-amber-900 text-xs">
                Profil pendidik belum ditautkan. Hubungi operator kurikulum sekolah.
              </div>
            ) : activeAssignments.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Belum ada penugasan mengajar aktif.
              </div>
            ) : (
              <div className="space-y-1.5">
                {previewAssignments.map((a) => (
                  <div
                    key={a.id}
                    className="p-2 sm:p-2.5 rounded-xl bg-slate-50/70 hover:bg-blue-50/50 border border-slate-100 hover:border-blue-200 transition-all flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-[#2563EB] shrink-0">
                        {a.mata_pelajaran_kode}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {a.mata_pelajaran_nama}
                        </h4>
                        <p className="text-[10px] text-slate-500">
                          {a.rombel_nama} • {a.jumlah_jam_minggu} JP
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/kelas-saya/${a.id}`}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#2563EB] text-slate-700 hover:text-white border border-slate-200 hover:border-[#2563EB] text-[11px] font-bold shadow-2xs transition-all shrink-0 flex items-center gap-1"
                    >
                      <span>Workspace</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                ))}

                {activeAssignments.length > 4 && (
                  <Link
                    href="/kelas-saya"
                    className="p-2 rounded-xl bg-blue-50/60 hover:bg-blue-50 border border-blue-100 text-center block text-[11px] font-bold text-[#2563EB] transition-colors"
                  >
                    Buka Direktori Lengkap ({activeAssignments.length} Kelas • {totalJamMinggu} JP)
                    →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Card C: Mini Bar Wali Kelas & Beban Kerja (Tipis & Elegan) */}
          <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-[11px]">
                Beban: <strong>{totalJamMinggu} JP / minggu</strong> (Standar Penuh)
              </span>
            </div>
            {activeHomeroom ? (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Wali {activeHomeroom.rombel_nama}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400">Guru Mandiri</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
