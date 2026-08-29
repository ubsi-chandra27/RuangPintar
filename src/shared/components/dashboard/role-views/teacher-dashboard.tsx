import * as React from "react";
import { Calendar, Users, GraduationCap, Bell, Clock, BookOpen } from "lucide-react";
import { PageHeader } from "@/shared/components/ui/page-header";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { StatCard } from "@/shared/components/dashboard/stat-card";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { AuthenticatedUser } from "@/shared/infrastructure/auth/auth-service";

export interface TeacherDashboardProps {
  user: AuthenticatedUser;
}

export function TeacherDashboard({ user }: TeacherDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`Selamat Datang, ${user.nama_lengkap}`}
        description="Pusat kerja akademik dan pengelolaan pengajaran kelas Anda."
        badge={<Badge variant="cobalt">Guru Pengajar</Badge>}
      />

      {/* Primary Stat / Overview Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Jadwal Hari Ini"
          value="0 Sesi"
          icon={<Calendar className="h-5 w-5" />}
          description="Sesi mengajar terjadwal hari ini"
          phaseDeferredNote="Jadwal master aktif pada Phase 10"
        />
        <StatCard
          label="Kelas Binaan"
          value="0 Rombel"
          icon={<Users className="h-5 w-5" />}
          description="Total rombel pengajaran semester ini"
          phaseDeferredNote="Penugasan mengajar aktif pada Phase 09"
        />
        <StatCard
          label="Tugas Masuk"
          value="0 Tugas"
          icon={<BookOpen className="h-5 w-5" />}
          description="Tugas siswa yang menunggu penilaian"
          phaseDeferredNote="Materi & tugas aktif pada Phase 12"
        />
        <StatCard
          label="Presensi Selesai"
          value="0%"
          icon={<Clock className="h-5 w-5" />}
          description="Tingkat ketuntasan presensi sesi"
          phaseDeferredNote="Presensi kelas aktif pada Phase 13"
        />
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Jadwal & Kelas */}
        <div className="space-y-6 lg:col-span-2">
          {/* Section: Jadwal Mengajar Terdekat */}
          <Card variant="glassElevated">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100/80">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-base">Jadwal Mengajar Terdekat</CardTitle>
              </div>
              <Badge variant="neutral">Phase 10 Foundation</Badge>
            </CardHeader>
            <CardContent className="pt-6">
              <EmptyState
                title="Belum Ada Jadwal Mengajar"
                description="Jadwal mengajar dan alokasi slot waktu akan ditampilkan secara otomatis setelah master schedule dikonfigurasikan pada Phase 10."
                phaseDeferredNote="Modul M10 (Schedule Execution) akan mengaktifkan jadwal real-time."
              />
            </CardContent>
          </Card>

          {/* Section: Kelas & Buku Nilai */}
          <Card variant="glassElevated">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100/80">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-base">Kelas Saya & Buku Nilai</CardTitle>
              </div>
              <Badge variant="neutral">Phase 09 & 14</Badge>
            </CardHeader>
            <CardContent className="pt-6">
              <EmptyState
                title="Belum Ada Rombel Ditugaskan"
                description="Daftar rombel, siswa, dan buku nilai akan muncul setelah penugasan mengajar (Teaching Assignment) diterbitkan oleh kurikulum sekolah."
                phaseDeferredNote="Modul M08 (Teacher Assignment) & M14 (Assessment) akan mengaktifkan buku nilai."
              />
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: Pengumuman & Info Sekolah */}
        <div className="space-y-6">
          <Card variant="glassElevated">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100/80">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-base">Pengumuman Sekolah</CardTitle>
              </div>
              <Badge variant="info">Info</Badge>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-4 text-xs text-slate-700 space-y-2">
                <p className="font-semibold text-blue-900">Selamat Datang di Ruang Pintar!</p>
                <p className="leading-relaxed text-slate-600">
                  Platform akademik sekolah terpadu ini sedang dalam tahap implementasi bertahap.
                  Fitur pengajaran dan penilaian akan aktif sesuai roadmap pengembangan.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
