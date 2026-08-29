import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { staffCapabilityService } from "@/shared/infrastructure/authorization/staff-capability-service";
import { AcademicShell } from "@/shared/components/shell/academic-shell";
import { TeacherDashboard } from "@/shared/components/dashboard/role-views/teacher-dashboard";
import { StudentDashboard } from "@/shared/components/dashboard/role-views/student-dashboard";
import { GuardianDashboard } from "@/shared/components/dashboard/role-views/guardian-dashboard";
import { StaffDashboard } from "@/shared/components/dashboard/role-views/staff-dashboard";
import { SuperAdminDashboard } from "@/shared/components/dashboard/role-views/super-admin-dashboard";
import { CapabilityBundle } from "@/shared/infrastructure/authorization/types";

export const metadata = {
  title: "Dashboard — Ruang Pintar",
  description: "Portal operasional dan pembelajaran Ruang Pintar",
};

export default async function DashboardPage() {
  const user = await requireAuth();

  let capabilities: CapabilityBundle[] = [];
  if (user.peran_dasar === "SCHOOL_STAFF") {
    capabilities = await staffCapabilityService.getUserCapabilities(user.id);
  }

  const breadcrumbItems = [{ label: "Dashboard", href: "/dashboard", isCurrent: true }];

  return (
    <AcademicShell user={user} userCapabilities={capabilities} breadcrumbItems={breadcrumbItems}>
      {user.peran_dasar === "TEACHER" && <TeacherDashboard user={user} />}
      {user.peran_dasar === "STUDENT" && <StudentDashboard user={user} />}
      {user.peran_dasar === "GUARDIAN" && <GuardianDashboard user={user} />}
      {user.peran_dasar === "SCHOOL_STAFF" && (
        <StaffDashboard user={user} capabilities={capabilities} />
      )}
      {user.peran_dasar === "SUPER_ADMIN" && <SuperAdminDashboard user={user} />}
    </AcademicShell>
  );
}
