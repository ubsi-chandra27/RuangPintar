import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma, configureSqlitePragmas } from "@/shared/infrastructure/database/prisma";
import * as auditModule from "@/shared/infrastructure/audit/audit-logger";
import { recordAuditEvent, queryAuditLogs } from "@/shared/infrastructure/audit/audit-logger";
import { generateUlid } from "@/shared/lib/ulid";

describe("Audit Logger (M05) — Append-Only Trail", () => {
  const actorId = generateUlid();
  const resourceId = generateUlid();

  beforeAll(async () => {
    await configureSqlitePragmas(prisma);
  });

  afterAll(async () => {
    await prisma.logAudit.deleteMany({ where: { aktor_id: actorId } });
    await prisma.$disconnect();
  });

  it("verifies application-level contract exposing only append and query functions", () => {
    const exportedFunctions = Object.keys(auditModule);
    expect(exportedFunctions).toContain("recordAuditEvent");
    expect(exportedFunctions).toContain("queryAuditLogs");
    expect(exportedFunctions).not.toContain("updateAuditEvent");
    expect(exportedFunctions).not.toContain("deleteAuditEvent");
  });

  it("records an append-only audit event with JSON payloads and actor context", async () => {
    const log = await recordAuditEvent({
      aktor_id: actorId,
      aktor_role: "SUPER_ADMIN",
      aksi: "UPDATE_CONFIG",
      tipe_sumber: "KONFIGURASI",
      id_sumber: resourceId,
      payload_sebelum: { nilai: "lama" },
      payload_sesudah: { nilai: "baru" },
      ip_address: "127.0.0.1",
      user_agent: "Vitest Runner",
    });

    expect(log.id).toBeDefined();
    expect(log.aktor_id).toBe(actorId);
    expect(log.aksi).toBe("UPDATE_CONFIG");
    expect(JSON.parse(log.payload_sebelum!)).toEqual({ nilai: "lama" });
    expect(JSON.parse(log.payload_sesudah!)).toEqual({ nilai: "baru" });
  });

  it("appends multiple sequential audit events preserving history", async () => {
    await recordAuditEvent({
      aktor_id: actorId,
      aktor_role: "SUPER_ADMIN",
      aksi: "SECOND_ACTION",
      tipe_sumber: "KONFIGURASI",
      id_sumber: resourceId,
    });

    const { logs, total } = await queryAuditLogs({
      aktor_id: actorId,
      tipe_sumber: "KONFIGURASI",
    });

    expect(total).toBeGreaterThanOrEqual(2);
    expect(logs.some((l) => l.aksi === "SECOND_ACTION")).toBe(true);
    expect(logs.some((l) => l.aksi === "UPDATE_CONFIG")).toBe(true);
  });

  it("queries audit logs by actor and source filters", async () => {
    const { logs, total } = await queryAuditLogs({
      aktor_id: actorId,
      tipe_sumber: "KONFIGURASI",
    });

    expect(total).toBeGreaterThanOrEqual(1);
    expect(logs[0]?.aktor_id).toBe(actorId);
  });
});
