import { redirect } from "next/navigation";
import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { AcademicShell } from "@/shared/components/shell/academic-shell";
import { GuardianService } from "@/modules/guardian/application/guardian-service";
import { getActiveChildIdFromCookie } from "@/app/actions/guardian-actions";
import { GuardianGradesView } from "@/modules/guardian/presentation/guardian-grades-view";
import { AlertCircle } from "lucide-react";

export const metadata = {
  title: "Perkembangan Nilai & Rapor Anak — Ruang Pintar",
  description: "Buku nilai asesmen resmi dan transkrip e-Rapor Kurikulum Merdeka",
};

export default async function NilaiAnakPage() {
  const user = await requireAuth();

  if (user.peran_dasar !== "GUARDIAN") {
    redirect("/dashboard");
  }

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Monitoring Anak", href: "/nilai-anak" },
    { label: "Perkembangan Nilai", href: "/nilai-anak", isCurrent: true },
  ];

  let data: Awaited<ReturnType<GuardianService["getChildGradesAndReport"]>> | null = null;
  let errorMessage: string | null = null;

  try {
    const activeChildId = await getActiveChildIdFromCookie();
    const guardianService = new GuardianService();
    data = await guardianService.getChildGradesAndReport(user, activeChildId);
  } catch {
    errorMessage =
      "Belum ditemukan data siswa yang terhubung atau belum ada publikasi nilai asesmen resmi dari pihak guru mata pelajaran.";
  }

  if (errorMessage || !data) {
    return (
      <AcademicShell user={user} breadcrumbItems={breadcrumbItems}>
        <div className="space-y-6 pb-12">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 text-amber-900 shadow-2xs">
            <div className="flex items-start gap-3.5">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold">Data Nilai Belum Dapat Dimuat</h4>
                <p className="text-xs text-amber-800 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          </div>
        </div>
      </AcademicShell>
    );
  }

  return (
    <AcademicShell user={user} breadcrumbItems={breadcrumbItems}>
      <GuardianGradesView
        activeChild={data.activeChild}
        linkedChildren={data.linkedChildren}
        publishedGrades={data.publishedGrades}
        reportCard={data.reportCard}
      />
    </AcademicShell>
  );
}
