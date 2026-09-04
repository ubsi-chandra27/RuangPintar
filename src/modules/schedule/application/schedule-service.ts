/**
 * Ruang Pintar — M10 Master Schedule Application Service
 */

import { recordAuditEvent } from "@/shared/infrastructure/audit/audit-logger";
import { prisma } from "@/shared/infrastructure/database/prisma";
import {
  CreateScheduleEntryInput,
  CreateScheduleVersionInput,
  ScheduleEntryDTO,
  ScheduleVersionDTO,
} from "../domain/schedule-types";
import {
  ScheduleConflictError,
  ScheduleEntryNotFoundError,
  ScheduleVersionNotFoundError,
  TeachingAssignmentRequiredError,
} from "../domain/schedule-errors";
import {
  CreateScheduleEntrySchema,
  CreateScheduleVersionSchema,
} from "../domain/schedule-validation";
import { ScheduleConflictDetector } from "../domain/conflict-detector";
import { slotsForDay } from "../domain/time-slot-policy";
import { scheduleRepository, ScheduleRepository } from "../infrastructure/schedule-repository";

export class ScheduleService {
  constructor(private readonly repository: ScheduleRepository = scheduleRepository) {}

  // ==========================================
  // VERSIONING & PUBLICATION
  // ==========================================

  async listVersions(sekolah_id: string, tahun_ajaran_id?: string): Promise<ScheduleVersionDTO[]> {
    return this.repository.listVersions(sekolah_id, tahun_ajaran_id);
  }

  async getVersionById(id: string, sekolah_id: string): Promise<ScheduleVersionDTO> {
    const version = await this.repository.findVersionById(id, sekolah_id);
    if (!version) throw new ScheduleVersionNotFoundError(id);
    return version;
  }

  async getPublishedVersion(
    sekolah_id: string,
    tahun_ajaran_id: string
  ): Promise<ScheduleVersionDTO | null> {
    return this.repository.getPublishedVersion(sekolah_id, tahun_ajaran_id);
  }

  async createVersion(
    actorId: string,
    actorRole: string,
    input: CreateScheduleVersionInput
  ): Promise<ScheduleVersionDTO> {
    const validated = CreateScheduleVersionSchema.parse(input);

    const created = await this.repository.createVersion(validated);

    await recordAuditEvent({
      sekolah_id: validated.sekolah_id,
      aktor_id: actorId,
      aktor_role: actorRole,
      tipe_sumber: "VERSI_JADWAL",
      id_sumber: created.id,
      aksi: "CREATE_SCHEDULE_VERSION",
      payload_sesudah: created as unknown as Record<string, unknown>,
    });

    return created;
  }

  async publishVersion(
    actorId: string,
    actorRole: string,
    actorName: string,
    id: string,
    sekolah_id: string
  ): Promise<ScheduleVersionDTO> {
    const version = await this.getVersionById(id, sekolah_id);

    if (version.status === "ARCHIVED")
      throw new Error("Versi arsip tidak dapat dipublikasikan kembali.");
    const entries = await this.repository.listEntriesByVersion(id, sekolah_id);
    if (!entries.length) throw new Error("Jadwal kosong belum dapat dipublikasikan.");
    for (const entry of entries) {
      const conflicts = ScheduleConflictDetector.checkConflict(
        { ...entry, excludeEntryId: entry.id },
        entries
      );
      if (conflicts.length) throw new ScheduleConflictError(conflicts[0].message);
    }
    const published = await this.repository.publishVersion(id, sekolah_id, actorName);

    await recordAuditEvent({
      sekolah_id,
      aktor_id: actorId,
      aktor_role: actorRole,
      tipe_sumber: "VERSI_JADWAL",
      id_sumber: id,
      aksi: "PUBLISH_SCHEDULE_VERSION",
      payload_sebelum: version as unknown as Record<string, unknown>,
      payload_sesudah: published as unknown as Record<string, unknown>,
    });

    return published;
  }

  // ==========================================
  // MASTER SCHEDULE ENTRIES
  // ==========================================

  async listEntriesByVersion(
    versi_jadwal_id: string,
    sekolah_id: string
  ): Promise<ScheduleEntryDTO[]> {
    return this.repository.listEntriesByVersion(versi_jadwal_id, sekolah_id);
  }

  async listTeacherSchedule(
    guru_id: string,
    sekolah_id: string,
    publishedOnly = true
  ): Promise<ScheduleEntryDTO[]> {
    return this.repository.listEntriesByTeacher(guru_id, sekolah_id, publishedOnly);
  }

  async createScheduleEntry(
    actorId: string,
    actorRole: string,
    input: CreateScheduleEntryInput,
    entryId?: string
  ): Promise<ScheduleEntryDTO> {
    const validated = CreateScheduleEntrySchema.parse(input);
    const version = await this.getVersionById(validated.versi_jadwal_id, validated.sekolah_id);
    if (version.status === "ARCHIVED") throw new Error("Versi arsip hanya dapat dibaca.");
    const previous = entryId
      ? await this.repository.findEntryById(entryId, validated.sekolah_id)
      : null;
    if (entryId && (!previous || previous.versi_jadwal_id !== version.id))
      throw new ScheduleEntryNotFoundError(entryId);

    // 1. Verify Teaching Assignment exists and is active
    const assignment = await prisma.penugasanMengajar.findFirst({
      where: {
        id: validated.penugasan_mengajar_id,
        sekolah_id: validated.sekolah_id,
        status: "AKTIF",
      },
      include: {
        guru: true,
        mata_pelajaran: true,
        rombel: true,
      },
    });

    if (!assignment) {
      throw new TeachingAssignmentRequiredError(
        "Penugasan mengajar tidak ditemukan atau tidak dalam status AKTIF."
      );
    }

    if (assignment.rombel_id !== validated.rombel_id) {
      throw new TeachingAssignmentRequiredError(
        `Penugasan mengajar ini ditujukan untuk rombel ${assignment.rombel.nama}, bukan rombel yang dipilih.`
      );
    }
    if (
      assignment.tahun_ajaran_id !== version.tahun_ajaran_id ||
      (version.semester_id && assignment.semester_id !== version.semester_id)
    ) {
      throw new TeachingAssignmentRequiredError(
        "Periode penugasan mengajar harus sesuai versi jadwal."
      );
    }

    // 2. Fetch TimeSlot info
    const slot = await prisma.slotWaktu.findFirst({
      where: { id: validated.slot_waktu_id, sekolah_id: validated.sekolah_id },
    });
    if (!slot) {
      throw new Error("Slot waktu pembelajaran tidak ditemukan.");
    }
    const timeSlots = await this.repository.listTimeSlots(validated.sekolah_id);
    if (
      slot.is_istirahat ||
      slot.is_upacara ||
      !slotsForDay(timeSlots, validated.hari).some((s) => s.id === slot.id)
    ) {
      throw new Error("Pilih slot KBM aktif yang sesuai pola waktu hari tersebut.");
    }

    // 3. Fetch existing entries in this schedule version to run Conflict Detection
    const existingEntries = await this.repository.listEntriesByVersion(
      validated.versi_jadwal_id,
      validated.sekolah_id
    );

    const conflicts = ScheduleConflictDetector.checkConflict(
      {
        excludeEntryId: entryId,
        guru_id: assignment.guru_id,
        guru_nama: assignment.guru.nama_lengkap,
        rombel_id: assignment.rombel_id,
        rombel_nama: assignment.rombel.nama,
        slot_waktu_id: slot.id,
        slot_waktu_nama: slot.nama,
        slot_waktu_jam_mulai: slot.jam_mulai,
        slot_waktu_jam_selesai: slot.jam_selesai,
        ruangan: validated.ruangan,
        hari: validated.hari,
      },
      existingEntries.map((e) => ({
        id: e.id,
        guru_id: e.guru_id,
        guru_nama: e.guru_nama,
        rombel_id: e.rombel_id,
        rombel_nama: e.rombel_nama,
        mata_pelajaran_nama: e.mata_pelajaran_nama,
        slot_waktu_id: e.slot_waktu_id,
        slot_waktu_nama: e.slot_waktu_nama,
        slot_waktu_jam_mulai: e.slot_waktu_jam_mulai,
        slot_waktu_jam_selesai: e.slot_waktu_jam_selesai,
        ruangan: e.ruangan,
        hari: e.hari,
      }))
    );

    if (conflicts.length > 0) {
      throw new ScheduleConflictError(conflicts[0].message);
    }

    // 4. Create Entry
    const derived = {
      tahun_ajaran_id: assignment.tahun_ajaran_id,
      semester_id: assignment.semester_id,
      guru_id: assignment.guru_id,
      mata_pelajaran_id: assignment.mata_pelajaran_id,
    };
    const created = entryId
      ? await this.repository.updateEntry(entryId, validated, derived)
      : await this.repository.createEntry(validated, derived);

    await recordAuditEvent({
      sekolah_id: validated.sekolah_id,
      aktor_id: actorId,
      aktor_role: actorRole,
      tipe_sumber: "JADWAL_PELAJARAN",
      id_sumber: created.id,
      aksi: entryId ? "UPDATE_SCHEDULE_ENTRY" : "CREATE_SCHEDULE_ENTRY",
      ...(previous ? { payload_sebelum: previous as unknown as Record<string, unknown> } : {}),
      payload_sesudah: created as unknown as Record<string, unknown>,
    });

    return created;
  }

  async deleteScheduleEntry(
    actorId: string,
    actorRole: string,
    id: string,
    sekolah_id: string
  ): Promise<boolean> {
    const existing = await this.repository.findEntryById(id, sekolah_id);
    if (!existing) throw new ScheduleEntryNotFoundError(id);
    const version = await this.getVersionById(existing.versi_jadwal_id, sekolah_id);
    if (version.status === "ARCHIVED") throw new Error("Versi arsip hanya dapat dibaca.");

    await this.repository.deleteEntry(id, sekolah_id);

    await recordAuditEvent({
      sekolah_id,
      aktor_id: actorId,
      aktor_role: actorRole,
      tipe_sumber: "JADWAL_PELAJARAN",
      id_sumber: id,
      aksi: "DELETE_SCHEDULE_ENTRY",
      payload_sebelum: existing as unknown as Record<string, unknown>,
    });

    return true;
  }
}

export const scheduleService = new ScheduleService();
