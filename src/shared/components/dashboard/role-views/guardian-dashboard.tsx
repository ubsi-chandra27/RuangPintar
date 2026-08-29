import * as React from "react";
import { Users, CheckCircle2, Award, Bell, HeartHandshake } from "lucide-react";
import { PageHeader } from "@/shared/components/ui/page-header";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { StatCard } from "@/shared/components/dashboard/stat-card";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { AuthenticatedUser } from "@/shared/infrastructure/auth/auth-service";

export interface GuardianDashboardProps {
  user: AuthenticatedUser;
}

export function GuardianDashboard({ user }: GuardianDashboardProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={`Selamat Datang, Bapak/Ibu ${user.nama_lengkap}`}
        description="Portal monitoring perkembangan akademik dan kehadiran putra/putri Anda di sekolah."
        badge={<Badge variant="warning">Wali Siswa</Badge>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Siswa Terhubung"
          value="0 Siswa"
          icon={<Users className="h-5 w-5 text-amber-600" />}
          description="Putra/putri yang terverifikasi"
          phaseDeferredNote="Relasi wali aktif pada Phase 16"
        />
        <StatCard
          label="Kehadiran Hari Ini"
          value="—"
          icon={<CheckCircle2 className="h-5 w-5 text-amber-600" />}
          description="Status presensi anak hari ini"
          phaseDeferredNote="Presensi aktif pada Phase 13"
        />
        <StatCard
          label="Perkembangan Nilai"
          value="—"
          icon={<Award className="h-5 w-5 text-amber-600" />}
          description="Rata-rata penilaian anak"
          phaseDeferredNote="Penilaian aktif pada Phase 14"
        />
        <StatCard
          label="Pesan Guru"
          value="0"
          icon={<HeartHandshake className="h-5 w-5 text-amber-600" />}
          description="Catatan wali kelas & bimbingan"
          phaseDeferredNote="Komunikasi aktif pada Phase 19"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card variant="glassElevated">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100/80">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-base">Putra / Putri Binaan</CardTitle>
              </div>
              <Badge variant="neutral">Phase 16 Foundation</Badge>
            </CardHeader>
            <CardContent className="pt-6">
              <EmptyState
                title="Belum Ada Data Siswa Terhubung"
                description="Akun siswa putra/putri Anda akan muncul setelah proses verifikasi relasi wali murid dikonfirmasi oleh staf kesiswaan sekolah."
                phaseDeferredNote="Modul M15 (Guardian Management) memverifikasi hubungan wali & siswa."
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card variant="glassElevated">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100/80">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-base">Pusat Informasi</CardTitle>
              </div>
              <Badge variant="info">Info</Badge>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="rounded-xl bg-amber-50/60 border border-amber-100 p-4 text-xs text-slate-700 space-y-2">
                <p className="font-semibold text-amber-900">Kerjasama Sekolah & Orang Tua</p>
                <p className="leading-relaxed text-slate-600">
                  Melalui portal ini, orang tua dapat memantau kedisiplinan dan capaian belajar
                  putra/putri secara transparan dan berkala.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
