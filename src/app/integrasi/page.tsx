import { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { requirePermission } from "@/shared/infrastructure/authorization/authz-guard";
import { staffCapabilityService } from "@/shared/infrastructure/authorization/staff-capability-service";
import { AcademicShell } from "@/shared/components/shell/academic-shell";
import { integrationService } from "@/modules/integration/application/integration-service";
import { IntegrationPortalView } from "@/modules/integration/presentation/integration-portal-view";

export const metadata: Metadata = {
  title: "Pusat Integrasi & Layanan Eksternal — Ruang Pintar",
  description:
    "Manajemen adapter WhatsApp, Push Notification, Email Gateway, Cloud Storage, dan Webhook Event Hub sekolah.",
};

export default async function IntegrasiPage() {
  const user = await requireAuth();
  await requirePermission("integration.view", user);

  if (!user.sekolah_id) {
    redirect("/dashboard");
  }

  const staffCapabilities =
    user.peran_dasar === "SCHOOL_STAFF"
      ? await staffCapabilityService.getUserCapabilities(user.id)
      : [];

  const overview = await integrationService.getIntegrationOverview(user.sekolah_id);

  return (
    <AcademicShell
      user={user}
      userCapabilities={staffCapabilities}
      breadcrumbItems={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Pusat Integrasi", href: "/integrasi", isCurrent: true },
      ]}
    >
      <IntegrationPortalView initialData={overview} />
    </AcademicShell>
  );
}
