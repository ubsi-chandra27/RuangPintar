import { redirect } from "next/navigation";
import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { getExamPrintDataAction } from "@/app/actions/cbt-actions";
import { ExamPrintView } from "@/modules/cbt/presentation/exam-print-view";

interface PageProps {
  params: Promise<{ ujianId: string }>;
  searchParams: Promise<{ penugasanId?: string }>;
}

export default async function ExamPrintPage({ params, searchParams }: PageProps) {
  const user = await requireAuth();
  if (!user) {
    redirect("/login");
  }

  const { ujianId } = await params;
  const { penugasanId } = await searchParams;

  const res = await getExamPrintDataAction(ujianId);

  if (!res.success || !res.data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto font-bold text-lg">
            !
          </div>
          <h2 className="text-sm font-bold text-slate-900">Gagal Memuat Naskah Cetak</h2>
          <p className="text-xs text-slate-600">
            {res.message || "Data naskah ujian tidak ditemukan."}
          </p>
        </div>
      </div>
    );
  }

  return <ExamPrintView data={res.data} penugasanId={penugasanId} />;
}
