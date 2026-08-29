import * as React from "react";
import { Building2, Users, ShieldCheck, FileSpreadsheet, Layers, Settings } from "lucide-react";
import { PageHeader } from "@/shared/components/ui/page-header";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { StatCard } from "@/shared/components/dashboard/stat-card";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { AuthenticatedUser } from "@/shared/infrastructure/auth/auth-service";
import { CapabilityBundle } from "@/shared/infrastructure/authorization/types";

export interface StaffDashboardProps {
  user: AuthenticatedUser;
  capabilities?: CapabilityBundle[];
}

export function StaffDashboard({ user, capabilities = [] }: StaffDashboardProps) {
  const capabilityLabels: Record<CapabilityBundle, string> = {
    SYSTEM_ADMIN: "Admin Sistem",
    ACADEMIC_OPERATOR: "Operator Kurikulum & Akademik",
    STUDENT_DATA_OPERATOR: "Operator Kesiswaan",
    REPORT_OPERATOR: "Operator Laporan & Ekspor",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Dashboard Operasional — ${user.nama_lengkap}`}
        description="Pusat administrasi operasional sekolah dan pengelolaan data platform."
        badge={<Badge variant="info">Staf Sekolah</Badge>}
      />

      {/* Capabilities Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500">Capability Aktif:</span>
        {capabilities.length > 0 ? (
          capabilities.map((cap) => (
            <Badge key={cap} variant="cobalt">
              {capabilityLabels[cap] || cap}
            </Badge>
          ))
        ) : (
          <Badge variant="neutral">Staf Umum (Tanpa Bundle Tambahan)</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Unit Sekolah"
          value="1 Sekolah"
          icon={<Building2 className="h-5 w-5 text-sky-600" />}
          description="Sekolah operasional aktif"
          phaseDeferredNote="Data master aktif pada Phase 06"
        />
        <StatCard
          label="Total Siswa"
          value="0"
          icon={<Users className="h-5 w-5 text-sky-600" />}
          description="Siswa terdaftar aktif"
          phaseDeferredNote="Master siswa aktif pada Phase 08"
        />
        <StatCard
          label="Tahun Ajaran"
          value="—"
          icon={<Layers className="h-5 w-5 text-sky-600" />}
          description="Tahun ajaran & semester aktif"
          phaseDeferredNote="Kalender aktif pada Phase 07"
        />
        <StatCard
          label="Status Platform"
          value="Operasional"
          icon={<ShieldCheck className="h-5 w-5 text-emerald-600" />}
          description="Pemeriksaan keamanan normal"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card variant="glassElevated">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100/80">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-sky-600" />
                <CardTitle className="text-base">Modul Operasional Aktif</CardTitle>
              </div>
              <Badge variant="neutral">Sesuai Capability</Badge>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {capabilities.length === 0 ? (
                <EmptyState
                  title="Belum Ada Capability Bundle Ditugaskan"
                  description="Hubungi Super Admin sekolah untuk memberikan capability bundle (Admin Sistem, Operator Akademik, Operator Kesiswaan, atau Operator Laporan) pada akun Anda."
                  phaseDeferredNote="Hak akses staf dikontrol melalui modul otorisasi M02."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {capabilities.includes("SYSTEM_ADMIN") && (
                    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1">
                      <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                        <Settings className="h-4 w-4 text-blue-600" />
                        <span>Administrasi Sistem</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Kelola konfigurasi platform global & log audit keamanan.
                      </p>
                    </div>
                  )}

                  {capabilities.includes("ACADEMIC_OPERATOR") && (
                    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1">
                      <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                        <Layers className="h-4 w-4 text-sky-600" />
                        <span>Operasional Akademik</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Kelola struktur kurikulum, rombel, dan penugasan guru.
                      </p>
                    </div>
                  )}

                  {capabilities.includes("STUDENT_DATA_OPERATOR") && (
                    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1">
                      <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                        <Users className="h-4 w-4 text-emerald-600" />
                        <span>Manajemen Kesiswaan</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Kelola biodata siswa, mutasi, dan presensi sekolah.
                      </p>
                    </div>
                  )}

                  {capabilities.includes("REPORT_OPERATOR") && (
                    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1">
                      <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                        <FileSpreadsheet className="h-4 w-4 text-purple-600" />
                        <span>Laporan & Analitik</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Ekspor rekapitulasi data akademik dan absensi sekolah.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card variant="glassElevated">
            <CardHeader className="pb-3 border-b border-slate-100/80">
              <CardTitle className="text-base">Informasi Staf</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="rounded-xl bg-sky-50/60 border border-sky-100 p-4 text-xs text-slate-700 space-y-2">
                <p className="font-semibold text-sky-900">Prinsip Least Privilege</p>
                <p className="leading-relaxed text-slate-600">
                  Staf sekolah hanya memiliki akses terhadap fungsi operasional yang telah
                  ditugaskan secara resmi oleh pengelola sistem.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
