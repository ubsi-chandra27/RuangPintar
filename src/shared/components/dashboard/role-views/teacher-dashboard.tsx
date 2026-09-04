import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  GraduationCap,
  BookOpen,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  Megaphone,
  ArrowRight,
  Sparkles,
  ClipboardList,
  Layers,
  ShieldCheck,
  AlertCircle,
  PlayCircle,
  CalendarDays,
} from "lucide-react";
import { StatCard } from "@/shared/components/dashboard/stat-card";
import { AuthenticatedUser } from "@/shared/infrastructure/auth/auth-service";
import { TeacherDashboardData, TeacherFacade } from "@/modules/teacher/application/teacher-facade";
import { scheduleService } from "@/modules/schedule/application/schedule-service";
import { HariBelajar, ScheduleEntryDTO } from "@/modules/schedule/domain/schedule-types";

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
  if (teacher && user.sekolah_id) {
    try {
      teacherSchedules = await scheduleService.listTeacherSchedule(
        teacher.id,
        user.sekolah_id,
        true
      );
      todaySchedules = teacherSchedules.filter((s) => s.hari === todayHari);
    } catch {
      teacherSchedules = [];
      todaySchedules = [];
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
              Selamat Datang, {namaGelar}
            </h1>
            <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#2563EB] text-xs font-bold border border-blue-100">
              Guru Pengajar
            </span>
            {activeHomeroom && (
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                Wali Kelas {activeHomeroom.rombel_nama}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pusat kerja akademik, penugasan mengajar rombel, dan pemantauan kelas binaan.
          </p>
        </div>

        {/* Header Metadata Badges */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {teacher?.nip && (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-xs font-semibold text-slate-700">
              <ShieldCheck className="h-4 w-4 text-[#2563EB]" />
              <span>NIP: {teacher.nip}</span>
            </div>
          )}

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200/70 text-xs font-bold text-emerald-700 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Tahun Ajaran Aktif</span>
          </div>
        </div>
      </div>

      {/* Top 4 Real Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Penugasan Mengajar"
          value={`${activeAssignments.length} Penugasan`}
          icon={<Layers className="h-6 w-6" />}
          trend={{
            value: `${totalJamMinggu} JP/minggu`,
            label: "beban teralokasi",
            isPositive: true,
          }}
          watermarkIcon={<Layers className="h-28 w-28" />}
        />
        <StatCard
          label="Kelas / Rombel Diampu"
          value={`${totalRombel} Rombel`}
          icon={<Users className="h-6 w-6" />}
          trend={{
            value: `${totalSiswaBinaan} Siswa`,
            label: "terlayani aktif",
            isPositive: true,
          }}
          watermarkIcon={<Users className="h-28 w-28" />}
        />
        <StatCard
          label="Status Wali Kelas"
          value={activeHomeroom ? activeHomeroom.rombel_nama : "Bukan Wali"}
          icon={<GraduationCap className="h-6 w-6" />}
          trend={{
            value: activeHomeroom ? `${activeHomeroom.total_siswa_rombel || 0} Siswa` : "Mandiri",
            label: "kelas binaan",
            isPositive: !!activeHomeroom,
          }}
          watermarkIcon={<GraduationCap className="h-28 w-28" />}
        />
        <StatCard
          label="Jadwal Hari Ini"
          value={`${todaySchedules.length} Sesi`}
          icon={<Calendar className="h-6 w-6" />}
          trend={{
            value: `${teacherSchedules.length} Sesi`,
            label: "total jadwal mingguan",
            isPositive: true,
          }}
          watermarkIcon={<Calendar className="h-28 w-28" />}
        />
      </div>

      {/* Main Content Grid: Penugasan Mengajar Nyata & Status Akademik */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Penugasan Mengajar & Kelas Saya (Real Data) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Penugasan Mengajar Aktif (Real Data) */}
          <div className="rounded-2xl bg-white border border-slate-100/90 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-[#2563EB]" />
                <h3 className="text-base font-bold text-[#0F172A]">
                  Penugasan Mengajar & Kelas Saya
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/kelas-saya"
                  className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1"
                >
                  <span>Lihat Semua Kelas</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-[#2563EB]">
                  {activeAssignments.length} Kelas Aktif
                </span>
              </div>
            </div>

            {!hasProfile ? (
              <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs sm:text-sm space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <AlertCircle className="h-4 w-4" />
                  Profil Pendidik Belum Ditautkan
                </div>
                <p>
                  Akun login Anda belum ditautkan dengan profil pendidik di sistem. Hubungi operator
                  kurikulum atau administrator sekolah untuk melakukan penautan profil guru.
                </p>
              </div>
            ) : activeAssignments.length === 0 ? (
              <div className="p-8 text-center bg-slate-50/80 rounded-2xl border border-slate-100 text-slate-400 text-xs sm:text-sm space-y-1">
                <BookOpen className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-slate-600">Belum Ada Penugasan Mengajar Aktif</p>
                <p className="text-xs text-slate-400">
                  Operator akademik belum menetapkan penugasan mata pelajaran untuk Anda pada
                  periode ini.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeAssignments.map((a) => (
                  <div
                    key={a.id}
                    className="p-4 rounded-2xl bg-slate-50/80 hover:bg-blue-50/40 border border-slate-100 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {a.mata_pelajaran_kode}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">
                            {a.mata_pelajaran_nama}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            AKTIF
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Rombel:{" "}
                          <span className="font-semibold text-slate-700">{a.rombel_nama}</span>
                          {a.tingkat_nama ? ` (${a.tingkat_nama})` : ""} • {a.tahun_ajaran_nama}
                          {a.semester_nama ? ` - ${a.semester_nama}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-center">
                      <div className="text-right">
                        <span className="font-extrabold text-sm text-[#2563EB] block">
                          {a.jumlah_jam_minggu} JP
                        </span>
                        <span className="text-[10px] text-slate-400">per minggu</span>
                      </div>
                      <Link
                        href={`/kelas-saya/${a.id}`}
                        className="px-3 py-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>Workspace</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 2: Jadwal Pelajaran Hari Ini & Sesi Kelas (Phase 10 Real Data) */}
          <div className="rounded-2xl bg-white border border-slate-100/90 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#2563EB]" />
                <h3 className="text-base font-bold text-[#0F172A]">
                  Jadwal Mengajar Hari Ini ({todayHari})
                </h3>
              </div>
              <Link
                href="/jadwal-saya"
                className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1"
              >
                <span>Lihat Jadwal Lengkap</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {todaySchedules.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50/70 border border-dashed border-slate-200 text-center space-y-2">
                <Calendar className="h-7 w-7 mx-auto text-slate-400" />
                <p className="text-xs sm:text-sm font-semibold text-slate-700">
                  Tidak ada jadwal mengajar pada hari {todayHari}
                </p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Anda tidak memiliki alokasi jam mengajar hari ini. Anda dapat melihat jadwal hari
                  lainnya atau membuka sesi kelas mandiri.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaySchedules.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-2xl bg-blue-50/40 hover:bg-blue-50/80 border border-blue-100/80 hover:border-blue-300 hover:shadow-xs transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-white border border-blue-100 text-[#2563EB] font-bold text-xs shrink-0 text-center min-w-[65px]">
                        <div>{s.slot_waktu_jam_mulai}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {s.slot_waktu_nama}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {s.mata_pelajaran_nama}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-semibold text-slate-700">{s.rombel_nama}</span>
                          {s.ruangan && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600 font-medium">{s.ruangan}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <Link
                      href="/sesi-pembelajaran"
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all shrink-0"
                    >
                      <PlayCircle className="h-4 w-4" />
                      <span>Buka Kelas (KBM)</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Info Wali Kelas & Aksi Cepat */}
        <div className="space-y-6">
          {/* Card Wali Kelas */}
          <div className="rounded-2xl bg-white border border-slate-100/90 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <GraduationCap className="h-4 w-4 text-[#2563EB]" />
              <h3 className="text-base font-bold text-[#0F172A]">Tanggung Jawab Wali Kelas</h3>
            </div>

            {activeHomeroom ? (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/50 border border-blue-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-700">Rombel Binaan</span>
                  <span className="px-2 py-0.5 rounded-md bg-white font-bold text-xs text-[#2563EB] shadow-2xs">
                    {activeHomeroom.tahun_ajaran_nama}
                  </span>
                </div>
                <h4 className="text-lg font-black text-slate-800">{activeHomeroom.rombel_nama}</h4>
                <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-blue-200/50">
                  <span>Jumlah Siswa Terdaftar:</span>
                  <span className="font-bold text-slate-900">
                    {activeHomeroom.total_siswa_rombel || 0} Siswa
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 text-center text-xs text-slate-400">
                Tidak ada rombel binaan aktif sebagai wali kelas pada periode ini.
              </div>
            )}
          </div>

          {/* Quick Actions Guru */}
          <div className="rounded-2xl bg-white border border-slate-100/90 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#2563EB]" />
              <h3 className="text-base font-bold text-[#0F172A]">Aksi Cepat Guru</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/jadwal-saya"
                className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/40 transition-all flex flex-col items-center text-center gap-2 shadow-2xs group"
              >
                <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#2563EB] group-hover:scale-105 transition-transform flex items-center justify-center">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Jadwal Saya</span>
                  <span className="text-[10px] text-slate-400">Alokasi Mengajar</span>
                </div>
              </Link>

              <Link
                href="/sesi-pembelajaran"
                className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all flex flex-col items-center text-center gap-2 shadow-2xs group"
              >
                <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform flex items-center justify-center">
                  <PlayCircle className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Sesi KBM</span>
                  <span className="text-[10px] text-slate-400">Buka / Catat Sesi</span>
                </div>
              </Link>

              <Link
                href="/kalender-akademik"
                className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-purple-300 hover:bg-purple-50/40 transition-all flex flex-col items-center text-center gap-2 shadow-2xs group"
              >
                <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform flex items-center justify-center">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Kalender</span>
                  <span className="text-[10px] text-slate-400">Agenda Sekolah</span>
                </div>
              </Link>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center gap-2 opacity-60">
                <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Buku Nilai</span>
                  <span className="text-[10px] text-slate-400">Phase 14</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
