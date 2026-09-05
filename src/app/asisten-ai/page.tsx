import { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { staffCapabilityService } from "@/shared/infrastructure/authorization/staff-capability-service";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { AcademicShell } from "@/shared/components/shell/academic-shell";
import { AiTeacherStudioView } from "@/modules/ai/presentation/ai-teacher-studio-view";

export const metadata: Metadata = {
  title: "Asisten AI Guru — Ruang Pintar",
  description:
    "Studio AI Guru bertenaga Google Gemini 2.0 Flash untuk pembuatan paket soal, modul ajar RPP Kurikulum Merdeka, dan materi pembelajaran.",
};

export default async function AsistenAiPage() {
  const user = await requireAuth();

  if (!user.sekolah_id) {
    redirect("/dashboard");
  }

  // Hanya Guru, Staf Sekolah, dan Super Admin yang berhak mengakses Studio AI Guru
  const allowedRoles = ["TEACHER", "SUPER_ADMIN", "SCHOOL_STAFF"];
  if (!allowedRoles.includes(user.peran_dasar)) {
    redirect("/dashboard");
  }

  const staffCapabilities =
    user.peran_dasar === "SCHOOL_STAFF"
      ? await staffCapabilityService.getUserCapabilities(user.id)
      : [];

  let teacherName = user.nama_lengkap;
  const subjectsMap = new Map<string, { id: string; nama: string; kode?: string }>();

  if (user.peran_dasar === "TEACHER") {
    const guru = await prisma.guru.findFirst({
      where: {
        sekolah_id: user.sekolah_id,
        pengguna_id: user.id,
      },
      include: {
        penugasan_mengajar: {
          where: { status: "AKTIF" },
          include: {
            mata_pelajaran: true,
          },
        },
      },
    });

    if (guru) {
      teacherName = guru.nama_lengkap;
      for (const p of guru.penugasan_mengajar) {
        if (p.mata_pelajaran) {
          subjectsMap.set(p.mata_pelajaran.id, {
            id: p.mata_pelajaran.id,
            nama: p.mata_pelajaran.nama,
            kode: p.mata_pelajaran.kode ?? undefined,
          });
        }
      }
    }
  }

  // Jika belum ada mata pelajaran dari penugasan, atau jika role adalah SUPER_ADMIN/SCHOOL_STAFF, ambil mapel aktif sekolah
  if (subjectsMap.size === 0) {
    const allMapel = await prisma.mataPelajaran.findMany({
      where: {
        sekolah_id: user.sekolah_id,
        status_aktif: true,
      },
      orderBy: { nama: "asc" },
      take: 20,
    });

    for (const m of allMapel) {
      subjectsMap.set(m.id, {
        id: m.id,
        nama: m.nama,
        kode: m.kode ?? undefined,
      });
    }
  }

  const subjects = Array.from(subjectsMap.values());

  return (
    <AcademicShell
      user={user}
      userCapabilities={staffCapabilities}
      breadcrumbItems={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Asisten AI Guru", href: "/asisten-ai", isCurrent: true },
      ]}
    >
      <AiTeacherStudioView
        userRole={user.peran_dasar}
        teacherName={teacherName}
        subjects={subjects}
      />
    </AcademicShell>
  );
}
