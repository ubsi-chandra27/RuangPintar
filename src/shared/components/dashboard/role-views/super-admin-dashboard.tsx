import * as React from "react";
import { ShieldAlert, Server, Database, Lock, Sliders, FileText } from "lucide-react";
import { PageHeader } from "@/shared/components/ui/page-header";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { StatCard } from "@/shared/components/dashboard/stat-card";
import { AuthenticatedUser } from "@/shared/infrastructure/auth/auth-service";

export interface SuperAdminDashboardProps {
  user: AuthenticatedUser;
}

export function SuperAdminDashboard({ user }: SuperAdminDashboardProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pusat Kendali Super Admin"
        description="Monitoring infrastruktur, persistensi database SQLite, konfigurasi sistem, dan log audit keamanan platform."
        badge={<Badge variant="academic">Super Admin</Badge>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Database Engine"
          value="SQLite WAL"
          icon={<Database className="h-5 w-5 text-slate-800" />}
          description="Prisma ORM with Foreign Keys ON"
        />
        <StatCard
          label="Sesi Server"
          value="Authoritative"
          icon={<Server className="h-5 w-5 text-slate-800" />}
          description="HttpOnly secure cookie token"
        />
        <StatCard
          label="Otorisasi Model"
          value="Default Deny"
          icon={<Lock className="h-5 w-5 text-slate-800" />}
          description="7-step hierarchical effective access"
        />
        <StatCard
          label="Audit Keamanan"
          value="Aktif (M05)"
          icon={<ShieldAlert className="h-5 w-5 text-slate-800" />}
          description="Append-oriented tamper audit log"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card variant="glassElevated">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100/80">
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-slate-800" />
                <CardTitle className="text-base">Infrastruktur Platform & Fondasi</CardTitle>
              </div>
              <Badge variant="success">Online</Badge>
            </CardHeader>
            <CardContent className="pt-6 space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-700">Arsitektur</span>
                <span className="font-mono text-slate-900 font-bold">
                  Modular Monolith (Next.js 16)
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-700">Autentikasi & Sesi (M02)</span>
                <span className="font-mono text-emerald-700 font-bold">
                  Bcrypt + SHA-256 (Phase 03 PASS)
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-700">Otorisasi & Capability (M02)</span>
                <span className="font-mono text-blue-700 font-bold">
                  AccessControlEngine (Phase 04 PASS)
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-700">Application Shell & UI (M02)</span>
                <span className="font-mono text-purple-700 font-bold">
                  Academic Glass UI v1.2 (Phase 05 ACTIVE)
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card variant="glassElevated">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100/80">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-800" />
                <CardTitle className="text-base">Status Sistem</CardTitle>
              </div>
              <Badge variant="neutral">Status</Badge>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="rounded-xl bg-slate-900 text-white p-4 text-xs space-y-2">
                <p className="font-bold text-sky-400">Ruang Pintar v1.0</p>
                <p className="leading-relaxed text-slate-300">
                  Sistem beroperasi normal pada database SQLite lokal. Seluruh aturan tata kelola
                  kanonikal terkunci.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
