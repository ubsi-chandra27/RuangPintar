/**
 * Ruang Pintar — Route /cbt/start (Exam Starter & Redirector)
 *
 * Mendukung Token Ujian Masuk (ANBK / Sinkronisasi Pengawas Ruang)
 */

import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { cbtService } from "@/modules/cbt/application/cbt-service";
import { AlertCircle, ArrowLeft, ShieldAlert } from "lucide-react";
import { CbtTokenEntryCard } from "@/modules/cbt/presentation/cbt-token-entry-card";

interface PageProps {
  searchParams: Promise<{ ujianId?: string; token?: string }>;
}

export const metadata: Metadata = {
  title: "Memulai Ujian CBT — Ruang Pintar",
};

export default async function CbtStartPage({ searchParams }: PageProps) {
  const { ujianId, token } = await searchParams;
  const user = await requireAuth();

  if (!user.sekolah_id) {
    redirect("/dashboard");
  }

  if (!ujianId) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl p-8 text-center space-y-4 shadow-xl border border-slate-200/80 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold text-slate-800">Parameter Tidak Lengkap</h2>
          <p className="text-xs text-slate-500">ID Ujian CBT tidak disertakan dalam tautan.</p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Resolve Siswa
  let siswaId: string | null = null;
  if (user.peran_dasar === "STUDENT") {
    const siswa = await prisma.siswa.findFirst({
      where: { sekolah_id: user.sekolah_id, pengguna_id: user.id },
    });
    if (siswa) {
      siswaId = siswa.id;
    }
  } else if (user.peran_dasar === "SUPER_ADMIN") {
    // Super admin can start as first active student in school
    const siswa = await prisma.siswa.findFirst({
      where: { sekolah_id: user.sekolah_id, status_akademik: "AKTIF" },
    });
    if (siswa) {
      siswaId = siswa.id;
    }
  }

  if (!siswaId) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl p-8 text-center space-y-4 shadow-xl border border-slate-200/80 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200/60 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold text-slate-800">Akses Ditolak</h2>
          <p className="text-xs text-slate-500">
            Akun Anda tidak terdaftar sebagai peserta didik aktif di sekolah ini.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition shadow-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fetch Exam Details
  const exam = await prisma.ujianCbt.findUnique({
    where: { id: ujianId },
    include: {
      penugasan_mengajar: {
        include: {
          mata_pelajaran: { select: { nama: true } },
          rombel: { select: { nama: true } },
        },
      },
      snapshot_ujian: {
        orderBy: { nomor_snapshot: "desc" },
        take: 1,
      },
    },
  });

  // Check if student already has active attempt
  const existingAttempt = await prisma.sesiUjianSiswa.findFirst({
    where: {
      ujian_cbt_id: ujianId,
      siswa_id: siswaId,
      status: { in: ["SEDANG_MENGERJAKAN", "TERKUNCI_PELANGGARAN"] },
    },
  });

  if (existingAttempt) {
    redirect(`/cbt/${existingAttempt.id}`);
  }

  // If exam requires token and no token provided, render Token Entry Card
  if (exam?.gunakan_token && !token) {
    const studentInfo = await prisma.siswa.findUnique({
      where: { id: siswaId },
      select: { nama_lengkap: true, nis: true },
    });

    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <CbtTokenEntryCard
          ujianId={ujianId}
          judulUjian={exam.judul}
          mataPelajaran={exam.penugasan_mengajar.mata_pelajaran.nama}
          rombel={exam.penugasan_mengajar.rombel.nama}
          durasiMenit={exam.durasi_menit}
          totalSoal={exam.snapshot_ujian[0]?.total_soal || 0}
          siswaNama={studentInfo?.nama_lengkap || "Peserta Didik"}
          siswaNis={studentInfo?.nis || "-"}
        />
      </div>
    );
  }

  let attemptId: string | null = null;
  let errorMessage: string | null = null;

  try {
    const res = await cbtService.startOrResumeAttempt(
      ujianId,
      user.sekolah_id,
      siswaId,
      undefined,
      token
    );
    attemptId = res.session.id;
  } catch (err: any) {
    errorMessage = err?.message || "Tidak dapat memulai sesi ujian CBT.";
  }

  if (attemptId) {
    redirect(`/cbt/${attemptId}`);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl p-8 text-center space-y-4 shadow-xl border border-slate-200/80 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200/60 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-base font-bold text-slate-800">Kendala Memulai Ujian</h2>
        <p className="text-xs text-slate-600 leading-relaxed">{errorMessage}</p>
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
