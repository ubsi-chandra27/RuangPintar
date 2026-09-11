import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { AcademicShell } from "@/shared/components/shell/academic-shell";
import { MonitoringService } from "@/modules/monitoring/application/monitoring-service";
import { HomeroomDashboardView } from "@/modules/monitoring/presentation/homeroom-dashboard-view";

export const metadata = {
  title: "Portal Wali Kelas — Ruang Pintar",
  description: "Pusat monitoring siswa, absensi, ketuntasan tugas, dan pembinaan rombel",
};

interface WaliKelasPageProps {
  searchParams: Promise<{ rombelId?: string }>;
}

export default async function WaliKelasPage({ searchParams }: WaliKelasPageProps) {
  const user = await requireAuth();

  if (user.peran_dasar !== "TEACHER" && user.peran_dasar !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const { rombelId } = await searchParams;

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Wali Kelas", href: "/wali-kelas", isCurrent: true },
  ];

  let overview = null;
  let activeRombelsList: Array<{
    rombel_id: string;
    rombel_nama: string;
    guru_nama: string;
    kapasitas: number;
  }> = [];
  let errorMsg: string | null = null;

  try {
    overview = await MonitoringService.getHomeroomOverview(user, rombelId);
    activeRombelsList = await MonitoringService.getActiveHomeroomsList(user);
  } catch (err: unknown) {
    errorMsg =
      err instanceof Error
        ? err.message
        : "Anda belum memiliki penugasan resmi sebagai Wali Kelas pada semester ini.";
  }

  if (errorMsg || !overview) {
    return (
      <AcademicShell user={user} breadcrumbItems={breadcrumbItems}>
        <div className="max-w-2xl mx-auto my-12 p-8 rounded-3xl bg-white border border-slate-200 shadow-xl text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Portal Wali Kelas Belum Aktif</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            {errorMsg || "Data monitoring rombel tidak tersedia."}
          </p>
          <div className="pt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali ke Dashboard Utama</span>
            </Link>
          </div>
        </div>
      </AcademicShell>
    );
  }

  return (
    <AcademicShell user={user} breadcrumbItems={breadcrumbItems}>
      <HomeroomDashboardView
        initialData={overview}
        activeRombelsList={activeRombelsList}
        isSuperAdmin={user.peran_dasar === "SUPER_ADMIN"}
      />
    </AcademicShell>
  );
}
