import { redirect } from "next/navigation";
import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { resolveUserCapabilities } from "@/shared/infrastructure/authorization/staff-capability-service";
import { AcademicShell } from "@/shared/components/shell/academic-shell";
import { CommunicationService } from "@/modules/communication/application/communication-service";
import { AnnouncementDirectoryView } from "@/modules/communication/presentation/announcement-directory-view";
import { prisma } from "@/shared/infrastructure/database/prisma";

export const metadata = {
  title: "Pengumuman Sekolah — Ruang Pintar",
  description: "Pusat komunikasi resmi dan edaran akademik sekolah",
};

interface PengumumanPageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function PengumumanPage({ searchParams }: PengumumanPageProps) {
  const user = await requireAuth();
  const capabilities = await resolveUserCapabilities(user);
  const { id: selectedId } = await searchParams;

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Pengumuman", href: "/pengumuman", isCurrent: true },
  ];

  const communicationService = new CommunicationService();
  const canManage =
    user.peran_dasar === "SUPER_ADMIN" ||
    user.peran_dasar === "SCHOOL_STAFF" ||
    user.peran_dasar === "TEACHER";

  let announcements: any[] = [];
  let availableRombels: { id: string; nama: string }[] = [];

  if (user.sekolah_id) {
    if (user.peran_dasar === "SUPER_ADMIN" || user.peran_dasar === "SCHOOL_STAFF") {
      announcements = await communicationService.getManageableAnnouncements(user.sekolah_id);
    } else {
      announcements = await communicationService.getAnnouncementsForUser(user.sekolah_id, {
        id: user.id,
        peran_dasar: user.peran_dasar as any,
      });
    }

    if (canManage) {
      availableRombels = await prisma.rombel.findMany({
        where: {
          sekolah_id: user.sekolah_id,
          status: "AKTIF",
        },
        select: { id: true, nama: true },
        orderBy: { nama: "asc" },
      });
    }
  }

  return (
    <AcademicShell user={user} userCapabilities={capabilities} breadcrumbItems={breadcrumbItems}>
      <AnnouncementDirectoryView
        announcements={announcements}
        canManage={canManage}
        availableRombels={availableRombels}
        initialSelectedId={selectedId || null}
      />
    </AcademicShell>
  );
}
