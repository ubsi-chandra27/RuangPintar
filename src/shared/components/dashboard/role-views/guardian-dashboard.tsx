import * as React from "react";
import { AuthenticatedUser } from "@/shared/infrastructure/auth/auth-service";
import { GuardianService } from "@/modules/guardian/application/guardian-service";
import { GuardianDashboardData } from "@/modules/guardian/domain/guardian-types";
import { getActiveChildIdFromCookie } from "@/app/actions/guardian-actions";
import { GuardianDashboardClient } from "@/modules/guardian/presentation/guardian-dashboard-client";
import { AlertCircle } from "lucide-react";

export interface GuardianDashboardProps {
  user: AuthenticatedUser;
  initialData?: GuardianDashboardData;
}

export async function GuardianDashboard({ user, initialData }: GuardianDashboardProps) {
  let dashboardData = initialData;

  if (!dashboardData) {
    try {
      const activeChildId = await getActiveChildIdFromCookie();
      const guardianService = new GuardianService();
      dashboardData = await guardianService.getDashboardData(user, activeChildId);
    } catch (err) {
      // Menangani kasus wali belum memiliki relasi terhubung
      return (
        <div className="space-y-6 pb-12">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 text-amber-900 shadow-2xs">
            <div className="flex items-start gap-3.5">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold">Relasi Siswa Belum Terverifikasi</h4>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Akun wali murid Anda belum memiliki data putra/putri yang terhubung dan
                  terverifikasi secara resmi oleh pihak sekolah. Silakan hubungi bagian Tata Usaha
                  sekolah untuk mengonfirmasi berkas Kartu Keluarga / Akta Kelahiran.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  return <GuardianDashboardClient data={dashboardData} />;
}
