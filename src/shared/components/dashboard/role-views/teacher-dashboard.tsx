import * as React from "react";
import Link from "next/link";
import {
  Calendar,
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
  School,
  ClipboardCheck,
  CheckCircle2,
  CheckSquare,
  Bell,
} from "lucide-react";
import { AuthenticatedUser } from "@/shared/infrastructure/auth/auth-service";
import { BaseRole } from "@/shared/infrastructure/authorization/types";
import { TeacherDashboardData, TeacherFacade } from "@/modules/teacher/application/teacher-facade";
import { scheduleService } from "@/modules/schedule/application/schedule-service";
import { classSessionService } from "@/modules/schedule/application/class-session-service";
import { CommunicationService } from "@/modules/communication/application/communication-service";
import { AnnouncementItem } from "@/modules/communication/domain/communication-types";
import {
  ClassSessionDTO,
  HariBelajar,
  ScheduleEntryDTO,
} from "@/modules/schedule/domain/schedule-types";
import {
  mergeConsecutiveScheduleEntries,
  MergedScheduleBlock,
} from "@/modules/schedule/domain/schedule-merger";
import { TeacherTodaySchedule } from "./teacher-today-schedule";
import { TeacherDigitalClockCalendar } from "./teacher-digital-clock-calendar";

export interface TeacherDashboardProps {
  user: AuthenticatedUser;
  initialData?: TeacherDashboardData;
  initialAnnouncements?: AnnouncementItem[];
}

export async function TeacherDashboard({
  user,
  initialData,
  initialAnnouncements,
}: TeacherDashboardProps) {
  const dashboardData =
    initialData || (await TeacherFacade.getTeacherDashboardData(user.id, user.sekolah_id));

  const {
    hasProfile,
    teacher,
    activeAssignments,
    activeHomeroom,
    totalJamMinggu,
    totalRombel,
    pendingTasks = [],
    totalTugasPerluDiperiksa = 0,
  } = dashboardData;
  const uniqueRombelCount = totalRombel ?? new Set(activeAssignments.map((a) => a.rombel_id)).size;
  const uniqueMapelCount =
    dashboardData.totalMataPelajaran ??
    new Set(activeAssignments.map((a) => a.mata_pelajaran_id)).size;

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
  let announcements: AnnouncementItem[] = initialAnnouncements || [];

  if (user.sekolah_id) {
    try {
      const promises: Promise<unknown>[] = [];

      if (teacher) {
        promises.push(
          scheduleService.listTeacherSchedule(teacher.id, user.sekolah_id, true).then((res) => {
            teacherSchedules = res;
            todaySchedules = teacherSchedules.filter((s) => s.hari === todayHari);
          })
        );
        promises.push(
          classSessionService
            .listSessions(user.sekolah_id, {
              guru_id: teacher.id,
              tanggal: new Date(),
            })
            .then((res) => {
              actualSessions = res;
            })
        );
      }

      if (!initialAnnouncements) {
        const comms = new CommunicationService();
        promises.push(
          comms
            .getAnnouncementsForUser(user.sekolah_id, {
              id: user.id,
              peran_dasar: user.peran_dasar as BaseRole,
            })
            .then((res: AnnouncementItem[]) => {
              announcements = res;
            })
        );
      }

      await Promise.all(promises);
    } catch {
      // Graceful fallback for partial or disconnected data
    }
  }

  // Gabungkan jam pelajaran berurutan untuk jadwal hari ini
  const mergedTodayBlocks = mergeConsecutiveScheduleEntries(todaySchedules);
  const totalJamHariIni = todaySchedules.length;

  // Preview penugasan & pengumuman
  const previewAssignments = activeAssignments.slice(0, 4);
  const latestAnnouncements = announcements.slice(0, 3);

  return (
    <div className="space-y-4 pb-8">
      {/* 1. Header Ringkas Guru */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-0.5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0F172A]">
              {namaGelar}
            </h1>
            {activeHomeroom && (
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/80">
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
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 shadow-xs text-xs font-semibold text-slate-700">
              <ShieldCheck className="h-3.5 w-3.5 text-[#2563EB]" />
              <span>NIP: {teacher.nip}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/70 text-xs font-bold text-emerald-700 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Tahun Ajaran Aktif</span>
          </div>
        </div>
      </div>

      {/* 2. Cockpit Sesi Mengajar Hari Ini (Card Utama Ramping + 3 Card Sesi Berikutnya) */}
      <TeacherTodaySchedule
        mergedBlocks={mergedTodayBlocks}
        actualSessions={actualSessions}
        todayHari={todayHari}
        totalJamHariIni={totalJamHariIni}
      />

      {/* 3. Operasional & Informasi Akademik (2 Kolom Seimbang: Kiri = Tugas & Aksi, Kanan = Pengumuman & Kalender) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start pt-1">
        {/* Kolom Kiri: Perlu Diperiksa & Dinilai + Aksi Cepat Guru */}
        <div className="space-y-4">
          {/* Companion Card: Perlu Diperiksa & Dinilai (To-Do List Guru) */}
          <div className="rounded-xl bg-white border border-slate-200/80 p-3.5 sm:p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="p-1 rounded-md bg-amber-50 text-amber-600 shrink-0">
                  <ClipboardCheck className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#0F172A] truncate">
                    Perlu Diperiksa & Dinilai
                  </h3>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    Tugas Menunggu Periksa
                  </span>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border shrink-0 ${
                  totalTugasPerluDiperiksa > 0
                    ? "bg-amber-50 text-amber-700 border-amber-200/80"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                }`}
              >
                {totalTugasPerluDiperiksa > 0
                  ? `${totalTugasPerluDiperiksa} Tugas Perlu Dinilai`
                  : "Semua Selesai Diperiksa"}
              </span>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="py-4 px-3 rounded-lg bg-slate-50/50 border border-dashed border-slate-200 text-center">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto mb-1 opacity-80" />
                <p className="text-xs font-bold text-slate-700">Semua Tugas Terkendali</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Belum ada pengumpulan tugas baru yang menunggu penilaian Anda.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingTasks.map((t) => (
                  <div
                    key={t.publikasi_id}
                    className="p-2.5 rounded-lg bg-slate-50/60 hover:bg-amber-50/40 border border-slate-200/70 hover:border-amber-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-blue-100 text-[#2563EB]">
                          {t.mata_pelajaran_kode}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 bg-white px-1.5 py-0.2 rounded-md border border-slate-200/80 shadow-2xs">
                          Kelas {t.rombel_nama}
                        </span>
                        {t.batas_waktu && (
                          <span className="text-[10px] text-slate-400">
                            Deadline:{" "}
                            {new Date(t.batas_waktu).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-1 truncate">
                        {t.judul_tugas}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <span>{t.total_dikumpulkan} Siswa Mengumpulkan</span>
                        {t.belum_dinilai > 0 ? (
                          <span className="font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.2 rounded-md text-[10px]">
                            {t.belum_dinilai} Belum Dinilai
                          </span>
                        ) : (
                          <span className="font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded-md text-[10px]">
                            Semua Dinilai
                          </span>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/kelas-saya/${t.penugasan_mengajar_id}`}
                      className="px-2.5 py-1.5 rounded-md bg-white hover:bg-[#2563EB] text-slate-700 hover:text-white border border-slate-200 hover:border-[#2563EB] text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-1 shrink-0 self-start sm:self-center"
                    >
                      <span>Periksa Tugas</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card: Aksi Cepat Guru (6 Modul Utama dalam 3 Kolom Ringkas) */}
          <div className="rounded-xl bg-white border border-slate-200/80 p-3.5 sm:p-4 shadow-xs space-y-2.5">
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
                className="p-2.5 rounded-lg bg-slate-50/60 hover:bg-blue-50/50 border border-slate-200/70 hover:border-blue-200 transition-all flex flex-col items-center text-center gap-1.5 group"
              >
                <div className="h-8 w-8 rounded-md bg-white border border-slate-200/80 text-slate-600 group-hover:text-[#2563EB] group-hover:border-blue-200 group-hover:bg-blue-50/50 shadow-2xs group-hover:scale-105 transition-all flex items-center justify-center">
                  <Calendar className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-[#2563EB] block leading-tight transition-colors">
                  Jadwal Saya
                </span>
              </Link>

              <Link
                href="/sesi-pembelajaran"
                className="p-2.5 rounded-lg bg-slate-50/60 hover:bg-blue-50/50 border border-slate-200/70 hover:border-blue-200 transition-all flex flex-col items-center text-center gap-1.5 group"
              >
                <div className="h-8 w-8 rounded-md bg-white border border-slate-200/80 text-slate-600 group-hover:text-[#2563EB] group-hover:border-blue-200 group-hover:bg-blue-50/50 shadow-2xs group-hover:scale-105 transition-all flex items-center justify-center">
                  <PlayCircle className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-[#2563EB] block leading-tight transition-colors">
                  Sesi KBM
                </span>
              </Link>

              <Link
                href="/kelas-saya"
                className="p-2.5 rounded-lg bg-slate-50/60 hover:bg-blue-50/50 border border-slate-200/70 hover:border-blue-200 transition-all flex flex-col items-center text-center gap-1.5 group"
              >
                <div className="h-8 w-8 rounded-md bg-white border border-slate-200/80 text-slate-600 group-hover:text-[#2563EB] group-hover:border-blue-200 group-hover:bg-blue-50/50 shadow-2xs group-hover:scale-105 transition-all flex items-center justify-center">
                  <School className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-[#2563EB] block leading-tight transition-colors">
                  Kelas Saya
                </span>
              </Link>

              <Link
                href="/penilaian"
                className="p-2.5 rounded-lg bg-slate-50/60 hover:bg-blue-50/50 border border-slate-200/70 hover:border-blue-200 transition-all flex flex-col items-center text-center gap-1.5 group"
              >
                <div className="h-8 w-8 rounded-md bg-white border border-slate-200/80 text-slate-600 group-hover:text-[#2563EB] group-hover:border-blue-200 group-hover:bg-blue-50/50 shadow-2xs group-hover:scale-105 transition-all flex items-center justify-center">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-[#2563EB] block leading-tight transition-colors">
                  Buku Nilai
                </span>
              </Link>

              <Link
                href="/cbt-ujian"
                className="p-2.5 rounded-lg bg-slate-50/60 hover:bg-blue-50/50 border border-slate-200/70 hover:border-blue-200 transition-all flex flex-col items-center text-center gap-1.5 group"
              >
                <div className="h-8 w-8 rounded-md bg-white border border-slate-200/80 text-slate-600 group-hover:text-[#2563EB] group-hover:border-blue-200 group-hover:bg-blue-50/50 shadow-2xs group-hover:scale-105 transition-all flex items-center justify-center">
                  <MonitorPlay className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-[#2563EB] block leading-tight transition-colors">
                  Ujian CBT
                </span>
              </Link>

              <Link
                href="/kalender-akademik"
                className="p-2.5 rounded-lg bg-slate-50/60 hover:bg-blue-50/50 border border-slate-200/70 hover:border-blue-200 transition-all flex flex-col items-center text-center gap-1.5 group"
              >
                <div className="h-8 w-8 rounded-md bg-white border border-slate-200/80 text-slate-600 group-hover:text-[#2563EB] group-hover:border-blue-200 group-hover:bg-blue-50/50 shadow-2xs group-hover:scale-105 transition-all flex items-center justify-center">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-[#2563EB] block leading-tight transition-colors">
                  Kalender
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Pengumuman Resmi Sekolah + Jam Digital & Kalender */}
        <div className="space-y-4">
          {/* Card: Pengumuman Resmi Sekolah */}
          <div className="rounded-xl bg-white border border-slate-200/80 p-3.5 sm:p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="p-1 rounded-md bg-blue-50 text-[#2563EB] shrink-0">
                  <Bell className="h-4 w-4" />
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold text-[#0F172A] truncate">
                  Pengumuman Resmi Sekolah
                </h3>
              </div>
              <Link
                href="/pengumuman"
                className="text-[11px] font-bold text-[#2563EB] hover:underline shrink-0 flex items-center gap-0.5"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {latestAnnouncements.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400">
                Tidak ada pengumuman baru saat ini.
              </div>
            ) : (
              <div className="space-y-2">
                {latestAnnouncements.map((ann) => (
                  <Link
                    key={ann.id}
                    href="/pengumuman"
                    className="p-2.5 rounded-lg bg-slate-50/60 hover:bg-blue-50/50 border border-slate-200/60 hover:border-blue-200 transition-all block group"
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md ${
                          ann.kategori === "PENTING" || ann.kategori === "DARURAT"
                            ? "bg-rose-100 text-rose-700"
                            : ann.kategori === "AKADEMIK"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-200/80 text-slate-700"
                        }`}
                      >
                        {ann.kategori}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {ann.dipublikasikan_pada
                          ? new Date(ann.dipublikasikan_pada).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                            })
                          : new Date(ann.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                            })}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#2563EB] line-clamp-1 transition-colors">
                      {ann.judul}
                    </h4>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Card: Jam Digital & Mini Kalender Bulanan */}
          <TeacherDigitalClockCalendar />

          {/* Mini Bar: Status Wali Kelas & Beban Kerja */}
          <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/70 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1.5 min-w-0">
              <Briefcase className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <Link
                href="/kelas-saya"
                className="text-[11px] hover:text-[#2563EB] hover:underline transition-colors truncate"
                title="Buka Daftar Kelas Saya"
              >
                Beban: <strong>{totalJamMinggu} JP / minggu</strong> ({uniqueRombelCount} Kelas •{" "}
                {uniqueMapelCount} Mapel)
              </Link>
            </div>
            {activeHomeroom ? (
              <Link
                href="/wali-kelas"
                className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors shrink-0"
              >
                <span>Wali {activeHomeroom.rombel_nama}</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            ) : (
              <span className="text-[10px] text-slate-400 shrink-0">Guru Mandiri</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
