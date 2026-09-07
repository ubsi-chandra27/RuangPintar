import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  GraduationCap,
  Sparkles,
  ArrowRight,
  MonitorPlay,
  AlertCircle,
  FileCheck2,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";
import { StatCard } from "@/shared/components/dashboard/stat-card";
import { AuthenticatedUser } from "@/shared/infrastructure/auth/auth-service";
import { studentExperienceService } from "@/modules/student/application/student-experience-service";
import { StudentDashboardData } from "@/modules/student/domain/student-experience-types";

export interface StudentDashboardProps {
  user: AuthenticatedUser;
  initialData?: StudentDashboardData;
}

export async function StudentDashboard({ user, initialData }: StudentDashboardProps) {
  const dashboardData =
    initialData ||
    (await studentExperienceService.getDashboardData(user.id, user.sekolah_id || ""));

  const { profile, statCards, jadwalHariIni, tugasMendatang, cbtMendatang, nilaiTerbaru } =
    dashboardData;

  // Format today's date in Indonesian
  const todayFormatted = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Fallback jika siswa belum terdaftar pada rombel aktif */}
      {!profile && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 text-amber-900 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold">Pendaftaran Kelas Belum Ditemukan</h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                Akun siswa Anda belum memiliki penempatan rombongan belajar aktif pada periode
                akademik saat ini. Silakan hubungi bagian Tata Usaha atau Operator Akademik sekolah
                Anda untuk verifikasi keikutsertaan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
              Halo, {profile ? profile.namaLengkap : user.nama_lengkap}! 👋
            </h1>
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              Siswa Aktif
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Portal pembelajaran siswa, jadwal pelajaran harian, materi KBM, dan evaluasi hasil
            belajar Anda.
          </p>
        </div>

        {/* Header Metadata Badges */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {profile?.nis && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-xs font-semibold text-slate-700">
              <ShieldCheck className="h-4 w-4 text-[#2563EB]" />
              <span>NIS: {profile.nis}</span>
            </div>
          )}

          {profile && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-xs font-semibold text-slate-700">
              <Calendar className="h-4 w-4 text-[#2563EB]" />
              <span>
                {profile.rombelNama} • {profile.semesterNama}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/70 text-xs font-bold text-emerald-700 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Presensi Aktif</span>
          </div>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Kelas Terdaftar"
          value={statCards.rombelNama}
          icon={<GraduationCap className="h-6 w-6" />}
          trend={{
            value: "Wali Kelas:",
            label: statCards.waliKelasNama,
            isPositive: true,
          }}
          watermarkIcon={<GraduationCap className="h-28 w-28" />}
        />
        <StatCard
          label="Kehadiran Saya"
          value={`${statCards.persentaseKehadiran}%`}
          icon={<CheckCircle2 className="h-6 w-6" />}
          trend={{
            value: `${statCards.totalHadir} Hadir`,
            label: `• ${statCards.totalAlpha} Alpha`,
            isPositive: statCards.totalAlpha === 0,
          }}
          watermarkIcon={<CheckCircle2 className="h-28 w-28" />}
        />
        <StatCard
          label="Tugas Perlu Dikerjakan"
          value={`${statCards.tugasPerluDikerjakan} Tugas`}
          icon={<BookOpen className="h-6 w-6" />}
          trend={{
            value: `${statCards.totalTugasAktif} Total`,
            label: "tugas diterbitkan",
            isPositive: statCards.tugasPerluDikerjakan === 0,
          }}
          watermarkIcon={<BookOpen className="h-28 w-28" />}
        />
        <StatCard
          label="Nilai Rata-rata"
          value={statCards.nilaiRataRata !== null ? String(statCards.nilaiRataRata) : "-"}
          icon={<Award className="h-6 w-6" />}
          trend={{
            value: "Asesmen:",
            label: "Resmi Terpublikasi",
            isPositive: true,
          }}
          watermarkIcon={<Award className="h-28 w-28" />}
        />
      </div>

      {/* Middle Section: Jadwal Pelajaran Hari Ini & Tugas/CBT */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Jadwal Hari Ini & Nilai Terbaru */}
        <div className="lg:col-span-2 space-y-6">
          {/* Jadwal Pelajaran Hari Ini */}
          <div className="rounded-2xl bg-white border border-slate-100/90 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#2563EB]" />
                <h3 className="text-base font-bold text-[#0F172A]">Jadwal Pelajaran Hari Ini</h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-[#2563EB]">
                {todayFormatted}
              </span>
            </div>

            {jadwalHariIni.length === 0 ? (
              <div className="py-8 text-center rounded-2xl bg-slate-50/70 border border-dashed border-slate-200 space-y-2">
                <CalendarDays className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">
                  Tidak Ada Jadwal KBM Terjadwal Hari Ini
                </p>
                <p className="text-[11px] text-slate-400">
                  Selamat beristirahat atau silakan pelajari modul materi mandiri.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {jadwalHariIni.map((jadwal) => {
                  const isActive = jadwal.status === "AKTIF";
                  const isDone = jadwal.status === "SELESAI";

                  return (
                    <div
                      key={jadwal.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isActive
                          ? "bg-blue-50/70 border-blue-200/80 shadow-xs"
                          : isDone
                            ? "bg-slate-50/70 border-slate-100"
                            : "bg-white hover:bg-slate-50/80 border-slate-100"
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`px-3 py-2 rounded-xl text-center shrink-0 shadow-2xs border ${
                            isActive
                              ? "bg-[#2563EB] text-white border-[#2563EB]"
                              : "bg-white border-slate-200/80 text-slate-800"
                          }`}
                        >
                          <span className="text-xs font-extrabold block">{jadwal.jamMulai}</span>
                          <span
                            className={`text-[10px] font-medium ${
                              isActive ? "text-blue-100" : "text-slate-400"
                            }`}
                          >
                            {jadwal.jamSelesai}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            {jadwal.mataPelajaranNama}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {jadwal.guruNama}
                            {jadwal.ruangan && ` • ${jadwal.ruangan}`}
                          </p>
                        </div>
                      </div>

                      <div className="self-start sm:self-center flex items-center gap-2">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 px-3 py-1 rounded-lg bg-blue-100">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                            Sedang Berlangsung
                          </span>
                        ) : isDone ? (
                          <span className="text-xs font-bold text-emerald-700 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200/60">
                            ✓ Selesai
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-slate-500 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200">
                            Mendatang
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Nilai Terbaru yang Dirilis */}
          <div className="rounded-2xl bg-white border border-slate-100/90 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-[#2563EB]" />
                <h3 className="text-base font-bold text-[#0F172A]">
                  Nilai Terbaru yang Dipublikasikan
                </h3>
              </div>
              <Link
                href="/rapor-siswa"
                className="text-xs font-bold text-[#2563EB] hover:text-blue-700 transition-colors inline-flex items-center gap-1"
              >
                Lihat Buku Nilai & Rapor <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {nilaiTerbaru.length === 0 ? (
              <div className="py-6 text-center rounded-2xl bg-slate-50/70 border border-dashed border-slate-200 space-y-1">
                <p className="text-xs font-bold text-slate-600">
                  Belum Ada Nilai yang Dipublikasikan
                </p>
                <p className="text-[11px] text-slate-400">
                  Nilai asesmen formatif dan sumatif akan muncul setelah dirilis secara resmi oleh
                  guru pengampu.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {nilaiTerbaru.map((nilai) => (
                  <div
                    key={nilai.asesmenId}
                    className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between gap-3 hover:border-blue-100 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          {nilai.kategori}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {nilai.tanggalPelaksanaanFormatted}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {nilai.judulAsesmen}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {nilai.mataPelajaranNama} • {nilai.guruNama}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                      <span className="text-[11px] text-slate-500 font-medium">
                        KKTP: {nilai.kkmKktp}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-extrabold px-2.5 py-0.5 rounded-lg border ${
                            nilai.isTuntas
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {nilai.nilaiAngka !== null ? nilai.nilaiAngka : "-"}
                        </span>
                        <span className="text-[11px] font-bold text-slate-600">
                          ({nilai.nilaiHuruf || "-"})
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: CBT Mendatang, Deadline Tugas, & Aksi Cepat */}
        <div className="space-y-6">
          {/* CBT & Ujian Terjadwal */}
          <div className="rounded-2xl bg-white border border-slate-100/90 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MonitorPlay className="h-4 w-4 text-[#2563EB]" />
                <h3 className="text-sm font-bold text-[#0F172A]">CBT & Ujian Online</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                Ujian Aktif
              </span>
            </div>

            {cbtMendatang.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                Tidak ada ujian CBT aktif atau terjadwal saat ini.
              </div>
            ) : (
              <div className="space-y-3">
                {cbtMendatang.map((cbt) => (
                  <div
                    key={cbt.ujianId}
                    className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/90 to-indigo-50/40 border border-blue-100 space-y-2.5 shadow-2xs"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{cbt.judul}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {cbt.mataPelajaranNama} • {cbt.durasiMenit} Menit
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-600 pt-2 border-t border-blue-200/50">
                      <span>KKTP: {cbt.kkmKktp}</span>
                      {cbt.attempt?.nilaiAkhir !== null && cbt.attempt?.nilaiAkhir !== undefined ? (
                        <span className="font-bold text-emerald-600">
                          Nilai: {cbt.attempt.nilaiAkhir}
                        </span>
                      ) : (
                        <span className="font-bold text-[#2563EB]">
                          {cbt.gunakanToken ? "Perlu Token" : "Siap Dikerjakan"}
                        </span>
                      )}
                    </div>

                    <Link
                      href="/cbt-ujian"
                      className="block w-full py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all text-center"
                    >
                      {cbt.actionLabel} →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tugas Mendekati Batas Waktu */}
          <div className="rounded-2xl bg-white border border-slate-100/90 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#2563EB]" />
                <h3 className="text-sm font-bold text-[#0F172A]">Tugas Kelas Mendatang</h3>
              </div>
              <Link
                href="/tugas-siswa"
                className="text-[11px] font-bold text-[#2563EB] hover:text-blue-700"
              >
                Lihat Semua
              </Link>
            </div>

            {tugasMendatang.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                Semua tugas telah diselesaikan dengan baik! 🎉
              </div>
            ) : (
              <div className="space-y-3">
                {tugasMendatang.map((tugas) => (
                  <div
                    key={tugas.id}
                    className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-blue-50/40 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{tugas.judul}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {tugas.mataPelajaranNama}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                          tugas.statusPengerjaan === "SUDAH_DIKUMPULKAN"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : tugas.isPastDeadline
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {tugas.statusPengerjaan === "SUDAH_DIKUMPULKAN"
                          ? "✓ Dikumpulkan"
                          : tugas.isPastDeadline
                            ? "Terlambat"
                            : "Perlu Dikerjakan"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-200/50">
                      <span>Batas Waktu:</span>
                      <span className="font-semibold text-slate-700 truncate max-w-[150px]">
                        {tugas.batasWaktuFormatted}
                      </span>
                    </div>

                    <Link
                      href="/tugas-siswa"
                      className="block text-center py-1.5 rounded-xl bg-white border border-slate-200/80 hover:bg-blue-50 hover:text-[#2563EB] text-slate-700 text-xs font-bold transition-all"
                    >
                      Buka Lembar Tugas →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Aksi Cepat Siswa */}
          <div className="rounded-2xl bg-white border border-slate-100/90 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#2563EB]" />
              <h3 className="text-sm font-bold text-[#0F172A]">Aksi Cepat Siswa</h3>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/jadwal-saya"
                className="p-3.5 rounded-xl bg-slate-50/80 hover:bg-blue-50/80 border border-slate-100 text-center transition-all group"
              >
                <Calendar className="h-5 w-5 mx-auto text-[#2563EB] mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800 block">Jadwal Saya</span>
              </Link>
              <Link
                href="/tugas-siswa"
                className="p-3.5 rounded-xl bg-slate-50/80 hover:bg-indigo-50/80 border border-slate-100 text-center transition-all group"
              >
                <BookOpen className="h-5 w-5 mx-auto text-indigo-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800 block">Materi & Tugas</span>
              </Link>
              <Link
                href="/cbt-ujian"
                className="p-3.5 rounded-xl bg-slate-50/80 hover:bg-purple-50/80 border border-slate-100 text-center transition-all group"
              >
                <MonitorPlay className="h-5 w-5 mx-auto text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800 block">CBT Ujian</span>
              </Link>
              <Link
                href="/rapor-siswa"
                className="p-3.5 rounded-xl bg-slate-50/80 hover:bg-emerald-50/80 border border-slate-100 text-center transition-all group"
              >
                <Award className="h-5 w-5 mx-auto text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800 block">Rapor Siswa</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
