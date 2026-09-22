import { afterEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { resolveTenantContext } from "@/shared/infrastructure/tenant/tenant-context";
import {
  getTenantEntitlement,
  isMutationPermission,
} from "@/shared/infrastructure/tenant/tenant-entitlement-service";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SaaS-04 entitlement permission classification", () => {
  it("mengizinkan permission baca saat tenant read-only", () => {
    expect(isMutationPermission("learning.material.view")).toBe(false);
    expect(isMutationPermission("assessment.grades.view")).toBe(false);
    expect(isMutationPermission("attendance.school.view")).toBe(false);
    expect(isMutationPermission("report.school.export")).toBe(false);
  });

  it("mengidentifikasi mutation permission untuk diblokir pada tenant read-only", () => {
    expect(isMutationPermission("learning.material.manage")).toBe(true);
    expect(isMutationPermission("attendance.session.record")).toBe(true);
    expect(isMutationPermission("assessment.grades.publish")).toBe(true);
    expect(isMutationPermission("cbt.attempt.start")).toBe(true);
    expect(isMutationPermission("academic.teaching_assignments.assign")).toBe(true);
    expect(isMutationPermission("assessment.grades.finalize")).toBe(true);
    expect(isMutationPermission("attendance.session.correct")).toBe(true);
    expect(isMutationPermission("communication.announcement.archive")).toBe(true);
    expect(isMutationPermission("tenant.membership.revoke")).toBe(true);
  });
});

describe("SaaS-04 active tenant context", () => {
  it("membentuk tenant context hanya dari membership ACTIVE milik pengguna", async () => {
    vi.spyOn(prisma.keanggotaanSekolah, "findUnique").mockResolvedValue({
      id: "MEMBERSHIP_01",
      sekolah_id: "SCH_01",
      peran_dasar_di_tenant: "TEACHER",
      status_keanggotaan: "ACTIVE",
      is_owner: false,
    } as any);

    await expect(resolveTenantContext("USER_01", "SCH_01")).resolves.toEqual({
      membershipId: "MEMBERSHIP_01",
      sekolahId: "SCH_01",
      peranDasar: "TEACHER",
      isOwner: false,
    });
  });

  it("menolak tenant context untuk membership non-active atau tidak ada tenant aktif", async () => {
    await expect(resolveTenantContext("USER_01", null)).resolves.toBeNull();

    vi.spyOn(prisma.keanggotaanSekolah, "findUnique").mockResolvedValue({
      id: "MEMBERSHIP_PENDING",
      sekolah_id: "SCH_01",
      peran_dasar_di_tenant: "TEACHER",
      status_keanggotaan: "PENDING",
      is_owner: false,
    } as any);

    await expect(resolveTenantContext("USER_01", "SCH_01")).resolves.toBeNull();
  });
});

describe("SaaS-04 tenant entitlement resolver", () => {
  it("mengubah trial atau subscription kedaluwarsa menjadi READ_ONLY saat dibaca", async () => {
    vi.spyOn(prisma.langgananTenant, "findFirst").mockResolvedValue({
      sekolah_id: "SCH_01",
      paket: "TRIAL",
      status: "TRIAL_ACTIVE",
      berakhir_pada: new Date(Date.now() - 60_000),
    } as any);

    await expect(getTenantEntitlement("SCH_01")).resolves.toMatchObject({
      sekolahId: "SCH_01",
      paket: "TRIAL",
      status: "READ_ONLY",
      allowsMutation: false,
    });
  });

  it("memperlakukan tenant tanpa entitlement sebagai READ_ONLY", async () => {
    vi.spyOn(prisma.langgananTenant, "findFirst").mockResolvedValue(null);

    await expect(getTenantEntitlement("SCH_EMPTY")).resolves.toMatchObject({
      sekolahId: "SCH_EMPTY",
      paket: "NONE",
      status: "READ_ONLY",
      allowsMutation: false,
    });
  });
});
