/**
 * Ruang Pintar — M10 Actual Class Session Application Service
 */

import { recordAuditEvent } from "@/shared/infrastructure/audit/audit-logger";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { ClassSessionDTO, OpenClassSessionInput } from "../domain/schedule-types";
import {
  ClassSessionNotFoundError,
  InvalidSessionStateTransitionError,
} from "../domain/schedule-errors";
import { OpenClassSessionSchema } from "../domain/schedule-validation";
import { scheduleRepository, ScheduleRepository } from "../infrastructure/schedule-repository";

export class ClassSessionService {
  constructor(private readonly repository: ScheduleRepository = scheduleRepository) {}

  async listSessions(
    sekolah_id: string,
    filters?: {
      guru_id?: string;
      rombel_id?: string;
      tanggal?: Date;
      status?: string;
    }
  ): Promise<ClassSessionDTO[]> {
    return this.repository.listSessions(sekolah_id, filters);
  }

  async getSessionById(id: string, sekolah_id: string): Promise<ClassSessionDTO> {
    const session = await this.repository.findSessionById(id, sekolah_id);
    if (!session) throw new ClassSessionNotFoundError(id);
    return session;
  }

  async openSession(
    actorId: string,
    actorRole: string,
    input: OpenClassSessionInput
  ): Promise<ClassSessionDTO> {
    const validated = OpenClassSessionSchema.parse(input);

    const sessionDate = validated.tanggal ? new Date(validated.tanggal) : new Date();
    const startOfDay = new Date(sessionDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(sessionDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Duplicate prevention: If a session for this schedule entry or teacher+rombel+subject already DIMULAI today, return existing
    if (validated.jadwal_pelajaran_id) {
      const existing = await prisma.sesiKelasAktual.findFirst({
        where: {
          sekolah_id: validated.sekolah_id,
          jadwal_pelajaran_id: validated.jadwal_pelajaran_id,
          tanggal: { gte: startOfDay, lte: endOfDay },
          status: "DIMULAI",
        },
      });
      if (existing) {
        return this.getSessionById(existing.id, validated.sekolah_id);
      }
    }

    const created = await this.repository.openClassSession(validated);

    await recordAuditEvent({
      sekolah_id: validated.sekolah_id,
      aktor_id: actorId,
      aktor_role: actorRole,
      tipe_sumber: "SESI_KELAS_AKTUAL",
      id_sumber: created.id,
      aksi: "OPEN_CLASS_SESSION",
      payload_sesudah: created as unknown as Record<string, unknown>,
    });

    return created;
  }

  async closeSession(
    actorId: string,
    actorRole: string,
    id: string,
    sekolah_id: string,
    catatan?: string
  ): Promise<ClassSessionDTO> {
    const existing = await this.getSessionById(id, sekolah_id);

    if (existing.status === "SELESAI") {
      return existing;
    }

    if (existing.status !== "DIMULAI" && existing.status !== "TERJADWAL") {
      throw new InvalidSessionStateTransitionError(existing.status, "SELESAI");
    }

    const closed = await this.repository.closeClassSession(id, sekolah_id, catatan);

    await recordAuditEvent({
      sekolah_id,
      aktor_id: actorId,
      aktor_role: actorRole,
      tipe_sumber: "SESI_KELAS_AKTUAL",
      id_sumber: id,
      aksi: "CLOSE_CLASS_SESSION",
      payload_sebelum: existing as unknown as Record<string, unknown>,
      payload_sesudah: closed as unknown as Record<string, unknown>,
    });

    return closed;
  }
}

export const classSessionService = new ClassSessionService();
