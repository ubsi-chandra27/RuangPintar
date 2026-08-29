import * as React from "react";
import { BookOpen, Calendar, Award, CheckCircle2, Clock } from "lucide-react";
import { PageHeader } from "@/shared/components/ui/page-header";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { StatCard } from "@/shared/components/dashboard/stat-card";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { AuthenticatedUser } from "@/shared/infrastructure/auth/auth-service";

export interface StudentDashboardProps {
  user: AuthenticatedUser;
}

export function StudentDashboard({ user }: StudentDashboardProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={`Halo, ${user.nama_lengkap}!`}
        description="Portal pembelajaran siswa dan ringkasan aktivitas akademik harian Anda."
        badge={<Badge variant="success">Siswa Aktif</Badge>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Pelajaran Hari Ini"
          value="0 Mapel"
          icon={<Calendar className="h-5 w-5 text-emerald-600" />}
          description="Mata pelajaran aktif hari ini"
          phaseDeferredNote="Jadwal aktif pada Phase 10"
        />
        <StatCard
          label="Tugas Mendatang"
          value="0 Tugas"
          icon={<BookOpen className="h-5 w-5 text-emerald-600" />}
          description="Tugas yang belum dikumpulkan"
          phaseDeferredNote="Materi & tugas aktif pada Phase 12"
        />
        <StatCard
          label="Presensi Saya"
          value="100%"
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
          description="Tingkat kehadiran sekolah"
          phaseDeferredNote="Presensi aktif pada Phase 13"
        />
        <StatCard
          label="Nilai Rata-rata"
          value="—"
          icon={<Award className="h-5 w-5 text-emerald-600" />}
          description="Nilai rapor semester berjalan"
          phaseDeferredNote="Penilaian aktif pada Phase 14"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card variant="glassElevated">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100/80">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-600" />
                <CardTitle className="text-base">Jadwal Pelajaran Hari Ini</CardTitle>
              </div>
              <Badge variant="neutral">Phase 10 Foundation</Badge>
            </CardHeader>
            <CardContent className="pt-6">
              <EmptyState
                title="Belum Ada Jadwal Pelajaran"
                description="Jadwal kelas dan mata pelajaran akan langsung tersedia setelah rombel dan jadwal kelas Anda ditentukan oleh sekolah."
                phaseDeferredNote="Modul M10 (Schedule) akan memuat jadwal harian siswa."
              />
            </CardContent>
          </Card>

          <Card variant="glassElevated">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100/80">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-600" />
                <CardTitle className="text-base">Tugas & Materi Belajar</CardTitle>
              </div>
              <Badge variant="neutral">Phase 12 Foundation</Badge>
            </CardHeader>
            <CardContent className="pt-6">
              <EmptyState
                title="Belum Ada Tugas Aktif"
                description="Tugas, PR, dan bahan materi dari bapak/ibu guru akan tampil di sini untuk dikerjakan dan dikumpulkan."
                phaseDeferredNote="Modul M12 (Assignments & Submissions) mengelola penyerahan tugas."
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card variant="glassElevated">
            <CardHeader className="pb-3 border-b border-slate-100/80">
              <CardTitle className="text-base">Tips Belajar</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="rounded-xl bg-emerald-50/60 border border-emerald-100 p-4 text-xs text-slate-700 space-y-2">
                <p className="font-semibold text-emerald-900">Siap Belajar Bersama Ruang Pintar!</p>
                <p className="leading-relaxed text-slate-600">
                  Pastikan akun Anda selalu aman dengan tidak membagikan kata sandi kepada orang
                  lain.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
