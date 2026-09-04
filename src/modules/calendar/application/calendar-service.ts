/**
 * Ruang Pintar — M09 Academic Calendar Application Service
 */

import { recordAuditEvent } from "@/shared/infrastructure/audit/audit-logger";
import {
  CalendarEventDTO,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
} from "../domain/calendar-types";
import {
  CalendarEventNotFoundError,
  InvalidCalendarDateRangeError,
} from "../domain/calendar-errors";
import {
  CreateCalendarEventSchema,
  UpdateCalendarEventSchema,
} from "../domain/calendar-validation";
import { calendarRepository, CalendarRepository } from "../infrastructure/calendar-repository";

export class CalendarService {
  constructor(private readonly repository: CalendarRepository = calendarRepository) {}

  async listEvents(
    sekolah_id: string,
    filters?: {
      tahun_ajaran_id?: string;
      semester_id?: string;
      tipe_event?: string;
      dari_tanggal?: Date;
      sampai_tanggal?: Date;
    }
  ): Promise<CalendarEventDTO[]> {
    return this.repository.listBySchool(sekolah_id, filters);
  }

  async getEventById(id: string, sekolah_id: string): Promise<CalendarEventDTO> {
    const event = await this.repository.findById(id, sekolah_id);
    if (!event) {
      throw new CalendarEventNotFoundError(id);
    }
    return event;
  }

  async createEvent(
    actorId: string,
    actorRole: string,
    input: CreateCalendarEventInput
  ): Promise<CalendarEventDTO> {
    const validated = CreateCalendarEventSchema.parse(input);

    const created = await this.repository.create({
      ...validated,
      tanggal_mulai: validated.tanggal_mulai,
      tanggal_selesai: validated.tanggal_selesai,
    });

    await recordAuditEvent({
      sekolah_id: validated.sekolah_id,
      aktor_id: actorId,
      aktor_role: actorRole,
      tipe_sumber: "KALENDER_AKADEMIK",
      id_sumber: created.id,
      aksi: "CREATE_CALENDAR_EVENT",
      payload_sesudah: created as unknown as Record<string, unknown>,
    });

    return created;
  }

  async updateEvent(
    actorId: string,
    actorRole: string,
    input: UpdateCalendarEventInput
  ): Promise<CalendarEventDTO> {
    const validated = UpdateCalendarEventSchema.parse(input);

    const existing = await this.getEventById(validated.id, validated.sekolah_id);

    const updated = await this.repository.update({
      ...validated,
      tanggal_mulai: validated.tanggal_mulai,
      tanggal_selesai: validated.tanggal_selesai,
    });

    await recordAuditEvent({
      sekolah_id: validated.sekolah_id,
      aktor_id: actorId,
      aktor_role: actorRole,
      tipe_sumber: "KALENDER_AKADEMIK",
      id_sumber: updated.id,
      aksi: "UPDATE_CALENDAR_EVENT",
      payload_sebelum: existing as unknown as Record<string, unknown>,
      payload_sesudah: updated as unknown as Record<string, unknown>,
    });

    return updated;
  }

  async deleteEvent(
    actorId: string,
    actorRole: string,
    id: string,
    sekolah_id: string
  ): Promise<boolean> {
    const existing = await this.getEventById(id, sekolah_id);

    await this.repository.delete(id, sekolah_id);

    await recordAuditEvent({
      sekolah_id,
      aktor_id: actorId,
      aktor_role: actorRole,
      tipe_sumber: "KALENDER_AKADEMIK",
      id_sumber: id,
      aksi: "DELETE_CALENDAR_EVENT",
      payload_sebelum: existing as unknown as Record<string, unknown>,
    });

    return true;
  }
}

export const calendarService = new CalendarService();
