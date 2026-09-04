/**
 * Ruang Pintar — Self-Service Profile Page (/profil)
 */

import { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { staffCapabilityService } from "@/shared/infrastructure/authorization/staff-capability-service";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { AcademicShell } from "@/shared/components/shell/academic-shell";
import { PageHeader } from "@/shared/components/ui/page-header";
import { ProfileView } from "@/modules/profile/presentation/profile-view";
import { schoolProfileService } from "@/modules/school/application/school-profile-service";

export const metadata: Metadata = {
  title: "Profil Saya — Ruang Pintar",
  description: "Kelola profil pribadi, username, kontak, dan informasi kepegawaian",
};

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const user = await requireAuth();

  if (!user.sekolah_id) {
    redirect("/dashboard");
  }

  const [schoolProfile, staffCapabilities, userDb] = await Promise.all([
    schoolProfileService.getProfile(user.sekolah_id),
    user.peran_dasar === "SCHOOL_STAFF"
      ? staffCapabilityService.getUserCapabilities(user.id)
      : Promise.resolve([]),
    prisma.pengguna.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        username: true,
        email: true,
        nama_lengkap: true,
        peran_dasar: true,
        status_akun: true,
        created_at: true,
        terakhir_login_pada: true,
        foto_url: true,
      },
    }),
  ]);

  let teacherProfile: any = null;

  if (user.peran_dasar === "TEACHER") {
    const orConditions: Array<{ pengguna_id?: string; email?: string }> = [
      { pengguna_id: user.id },
    ];
    if (user.email) {
      orConditions.push({ email: user.email });
    }

    teacherProfile = await prisma.guru.findFirst({
      where: {
        sekolah_id: user.sekolah_id,
        OR: orConditions,
      },
      include: {
        penugasan_mengajar: {
          where: { status: "AKTIF" },
          include: {
            mata_pelajaran: {
              select: { nama: true, kode: true },
            },
            rombel: {
              select: {
                nama: true,
                tingkat: { select: { nama: true } },
              },
            },
          },
        },
      },
    });
  }

  const schoolName = schoolProfile?.nama || "Sekolah Ruang Pintar";

  return (
    <AcademicShell
      user={{
        ...user,
        foto_url: userDb?.foto_url || teacherProfile?.foto_url || null,
      }}
      userCapabilities={staffCapabilities}
      breadcrumbItems={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Profil Saya", href: "/profil", isCurrent: true },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title="Profil Saya"
          description="Kelola profil akun, username login, kontak pribadi, dan informasi kepegawaian Anda"
        />

        <ProfileView
          user={{
            id: user.id,
            username: userDb?.username || user.username,
            email: userDb?.email || user.email,
            nama_lengkap: userDb?.nama_lengkap || user.nama_lengkap,
            peran_dasar: userDb?.peran_dasar || user.peran_dasar,
            status_akun: userDb?.status_akun || user.status_akun,
            created_at: userDb?.created_at || new Date(),
            terakhir_login_pada: userDb?.terakhir_login_pada || null,
            foto_url: userDb?.foto_url || teacherProfile?.foto_url || null,
          }}
          schoolName={schoolName}
          teacherProfile={teacherProfile}
        />
      </div>
    </AcademicShell>
  );
}
