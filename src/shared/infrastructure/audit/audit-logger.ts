import { LogAudit } from "@prisma/client";
import { prisma } from "../database/prisma";
import { generateUlid } from "../../lib/ulid";
import type { TransactionClient } from "../database/transaction";

export interface CreateAuditEventInput {
  sekolah_id?: string | null;
  aktor_id: string;
  aktor_role: string;
  aksi: string;
  tipe_sumber: string;
  id_sumber: string;
  payload_sebelum?: Record<string, unknown> | null;
  payload_sesudah?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
}

export interface AuditQueryFilter {
  sekolah_id?: string;
  aktor_id?: string;
  tipe_sumber?: string;
  id_sumber?: string;
  limit?: number;
  offset?: number;
}

/**
 * Record an append-only audit log entry in the database.
 */
export async function recordAuditEvent(
  input: CreateAuditEventInput,
  db: TransactionClient | typeof prisma = prisma
): Promise<LogAudit> {
  const auditId = generateUlid();

  return await db.logAudit.create({
    data: {
      id: auditId,
      sekolah_id: input.sekolah_id ?? null,
      aktor_id: input.aktor_id,
      aktor_role: input.aktor_role,
      aksi: input.aksi,
      tipe_sumber: input.tipe_sumber,
      id_sumber: input.id_sumber,
      payload_sebelum: input.payload_sebelum ? JSON.stringify(input.payload_sebelum) : null,
      payload_sesudah: input.payload_sesudah ? JSON.stringify(input.payload_sesudah) : null,
      ip_address: input.ip_address ?? null,
      user_agent: input.user_agent ?? null,
    },
  });
}

/**
 * Query audit logs with pagination and filters.
 */
export async function queryAuditLogs(
  filter: AuditQueryFilter,
  db: TransactionClient | typeof prisma = prisma
): Promise<{ logs: LogAudit[]; total: number }> {
  const where = {
    ...(filter.sekolah_id ? { sekolah_id: filter.sekolah_id } : {}),
    ...(filter.aktor_id ? { aktor_id: filter.aktor_id } : {}),
    ...(filter.tipe_sumber ? { tipe_sumber: filter.tipe_sumber } : {}),
    ...(filter.id_sumber ? { id_sumber: filter.id_sumber } : {}),
  };

  const [logs, total] = await Promise.all([
    db.logAudit.findMany({
      where,
      orderBy: { dibuat_pada: "desc" },
      take: filter.limit ?? 50,
      skip: filter.offset ?? 0,
    }),
    db.logAudit.count({ where }),
  ]);

  return { logs, total };
}
