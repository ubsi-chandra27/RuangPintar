/**
 * Ruang Pintar — M10 Time Slot Application Service
 */

import { recordAuditEvent } from "@/shared/infrastructure/audit/audit-logger";
import {
  CreateTimeSlotInput,
  TimeSlotDTO,
  TimeSlotMutationConfirmation,
} from "../domain/schedule-types";
import { ScheduleConflictDetector } from "../domain/conflict-detector";
import { slotsForDay } from "../domain/time-slot-policy";
import { timeSlotEditLockReason } from "../domain/time-slot-usage";
import { TimeSlotNotFoundError } from "../domain/schedule-errors";
import { CreateTimeSlotSchema } from "../domain/schedule-validation";
import { scheduleRepository, ScheduleRepository } from "../infrastructure/schedule-repository";

export class TimeSlotService {
  constructor(private readonly repository: ScheduleRepository = scheduleRepository) {}

  async listTimeSlots(sekolah_id: string): Promise<TimeSlotDTO[]> {
    return this.repository.listTimeSlots(sekolah_id);
  }

  async getTimeSlotById(id: string, sekolah_id: string): Promise<TimeSlotDTO> {
    const slot = await this.repository.findTimeSlotById(id, sekolah_id);
    if (!slot) throw new TimeSlotNotFoundError(id);
    return slot;
  }

  async createTimeSlot(
    actorId: string,
    actorRole: string,
    input: CreateTimeSlotInput
  ): Promise<TimeSlotDTO> {
    const validated = CreateTimeSlotSchema.parse(input);

    const created = await this.repository.createTimeSlot(validated);

    await recordAuditEvent({
      sekolah_id: validated.sekolah_id,
      aktor_id: actorId,
      aktor_role: actorRole,
      tipe_sumber: "SLOT_WAKTU",
      id_sumber: created.id,
      aksi: "CREATE_TIME_SLOT",
      payload_sesudah: created as unknown as Record<string, unknown>,
    });

    return created;
  }

  async updateTimeSlot(
    actorId: string,
    actorRole: string,
    id: string,
    input: CreateTimeSlotInput,
    confirmation: TimeSlotMutationConfirmation
  ): Promise<TimeSlotDTO> {
    return this.repository.withTransaction(async (repository, db) => {
      const before = await repository.findTimeSlotById(id, input.sekolah_id);
      if (!before) throw new TimeSlotNotFoundError(id);
      this.assertCurrent(before, confirmation);
      const lock = timeSlotEditLockReason(before.penggunaan);
      if (lock) throw new Error(lock);
      if (before.penggunaan!.total > 0 && !confirmation.konfirmasi_dampak) {
        throw new Error(
          `Konfirmasi perubahan pada ${before.penggunaan!.total} alokasi jadwal terlebih dahulu.`
        );
      }

      // Urutan internal dan status bukan isian edit; tidak boleh berubah lewat payload buatan.
      const validated = CreateTimeSlotSchema.parse({
        ...input,
        urutan: before.urutan,
        status_aktif: before.status_aktif,
      });
      const slots = await repository.listTimeSlots(input.sekolah_id);
      if (slots.some((slot) => slot.id !== id && slot.kode === validated.kode)) {
        throw new Error("Kode slot sudah digunakan. Pilih kode yang berbeda.");
      }
      const after = { ...before, ...validated };
      const timingChanged =
        before.jam_mulai !== after.jam_mulai || before.jam_selesai !== after.jam_selesai;
      const patternChanged = before.hari_khusus !== after.hari_khusus;
      const typeChanged =
        before.is_istirahat !== after.is_istirahat || before.is_upacara !== after.is_upacara;
      if (timingChanged || patternChanged || typeChanged) {
        const proposedSlots = slots.map((slot) => (slot.id === id ? after : slot));
        // Semua versi aktif diperiksa, karena satu master slot dapat dipakai lintas periode.
        for (const versionId of await repository.listActiveScheduleVersionIds(input.sekolah_id)) {
          const entries = await repository.listEntriesByVersion(versionId, input.sekolah_id);
          const proposedEntries = entries.map((entry) =>
            entry.slot_waktu_id === id
              ? {
                  ...entry,
                  slot_waktu_nama: after.nama,
                  slot_waktu_jam_mulai: after.jam_mulai,
                  slot_waktu_jam_selesai: after.jam_selesai,
                }
              : entry
          );
          for (const entry of entries) {
            const isKbm = (slot: TimeSlotDTO) =>
              slot.id === entry.slot_waktu_id && !slot.is_istirahat && !slot.is_upacara;
            const wasValid = slotsForDay(slots, entry.hari).some(isKbm);
            const remainsValid = slotsForDay(proposedSlots, entry.hari).some(isKbm);
            if ((wasValid || entry.slot_waktu_id === id) && !remainsValid) {
              throw new Error(
                `Perubahan pola/jenis membuat jadwal ${entry.rombel_nama} pada ${entry.hari} tidak memiliki slot KBM yang sesuai. Pindahkan alokasinya terlebih dahulu.`
              );
            }
            if (entry.slot_waktu_id !== id || !timingChanged) continue;
            const oldConflicts = new Set(
              ScheduleConflictDetector.checkConflict(
                { ...entry, excludeEntryId: entry.id },
                entries
              ).map((conflict) => `${conflict.type}:${conflict.conflicting_entry_id}`)
            );
            const conflict = ScheduleConflictDetector.checkConflict(
              {
                ...entry,
                excludeEntryId: entry.id,
                slot_waktu_jam_mulai: after.jam_mulai,
                slot_waktu_jam_selesai: after.jam_selesai,
              },
              proposedEntries
            ).find((item) => !oldConflicts.has(`${item.type}:${item.conflicting_entry_id}`));
            if (conflict) throw new Error(conflict.message);
          }
        }
        if (after.status_aktif && (timingChanged || patternChanged)) {
          const overlap = slots.find(
            (slot) =>
              slot.id !== id &&
              slot.status_aktif &&
              (slot.hari_khusus || null) === (after.hari_khusus || null) &&
              after.jam_mulai < slot.jam_selesai &&
              after.jam_selesai > slot.jam_mulai
          );
          if (overlap)
            throw new Error(
              `Waktu bertumpang tindih dengan slot '${overlap.nama}' (${overlap.jam_mulai}–${overlap.jam_selesai}) pada pola yang sama.`
            );
        }
      }
      const updated = await repository.updateTimeSlot(id, validated);
      await recordAuditEvent(
        {
          sekolah_id: input.sekolah_id,
          aktor_id: actorId,
          aktor_role: actorRole,
          tipe_sumber: "SLOT_WAKTU",
          id_sumber: id,
          aksi: "UPDATE_TIME_SLOT",
          payload_sebelum: before as unknown as Record<string, unknown>,
          payload_sesudah: { ...updated, penggunaan: before.penggunaan },
        },
        db
      );
      return updated;
    });
  }

  async deleteTimeSlot(
    actorId: string,
    actorRole: string,
    id: string,
    sekolah_id: string,
    confirmation: TimeSlotMutationConfirmation
  ): Promise<void> {
    await this.repository.withTransaction(async (repository, db) => {
      const before = await repository.findTimeSlotById(id, sekolah_id);
      if (!before) throw new TimeSlotNotFoundError(id);
      this.assertCurrent(before, confirmation);
      if (before.penggunaan!.total > 0) {
        throw new Error(
          `Slot digunakan pada ${before.penggunaan!.total} alokasi jadwal dan tidak dapat dihapus. Riwayat jadwal tetap dilindungi.`
        );
      }
      await repository.deleteTimeSlot(id, sekolah_id);
      await recordAuditEvent(
        {
          sekolah_id,
          aktor_id: actorId,
          aktor_role: actorRole,
          tipe_sumber: "SLOT_WAKTU",
          id_sumber: id,
          aksi: "DELETE_TIME_SLOT",
          payload_sebelum: before as unknown as Record<string, unknown>,
        },
        db
      );
    });
  }

  private assertCurrent(slot: TimeSlotDTO, confirmation: TimeSlotMutationConfirmation) {
    if (
      !slot.penggunaan ||
      slot.updated_at.toISOString() !== confirmation.updated_at ||
      slot.penggunaan.total !== confirmation.total_penggunaan
    ) {
      throw new Error(
        "Data slot atau pemakaiannya telah berubah. Muat ulang halaman dan tinjau kembali sebelum menyimpan."
      );
    }
  }

  async seedDefaultTimeSlotsIfEmpty(
    actorId: string,
    actorRole: string,
    sekolah_id: string
  ): Promise<TimeSlotDTO[]> {
    const existing = await this.repository.listTimeSlots(sekolah_id);
    if (existing.length > 0) return existing;

    const defaultSlots: Array<Omit<CreateTimeSlotInput, "sekolah_id">> = [
      {
        nama: "Upacara / Apel Pagi",
        kode: "UPACARA",
        urutan: 1,
        jam_mulai: "07:00",
        jam_selesai: "07:45",
        is_upacara: true,
      },
      { nama: "Jam Ke-1", kode: "JAM_1", urutan: 2, jam_mulai: "07:45", jam_selesai: "08:30" },
      { nama: "Jam Ke-2", kode: "JAM_2", urutan: 3, jam_mulai: "08:30", jam_selesai: "09:15" },
      { nama: "Jam Ke-3", kode: "JAM_3", urutan: 4, jam_mulai: "09:15", jam_selesai: "10:00" },
      {
        nama: "Istirahat Pertama",
        kode: "ISTIRAHAT_1",
        urutan: 5,
        jam_mulai: "10:00",
        jam_selesai: "10:30",
        is_istirahat: true,
      },
      { nama: "Jam Ke-4", kode: "JAM_4", urutan: 6, jam_mulai: "10:30", jam_selesai: "11:15" },
      { nama: "Jam Ke-5", kode: "JAM_5", urutan: 7, jam_mulai: "11:15", jam_selesai: "12:00" },
      {
        nama: "Istirahat Kedua / Ishoma",
        kode: "ISHOMA",
        urutan: 8,
        jam_mulai: "12:00",
        jam_selesai: "13:00",
        is_istirahat: true,
      },
      { nama: "Jam Ke-6", kode: "JAM_6", urutan: 9, jam_mulai: "13:00", jam_selesai: "13:45" },
      { nama: "Jam Ke-7", kode: "JAM_7", urutan: 10, jam_mulai: "13:45", jam_selesai: "14:30" },
      { nama: "Jam Ke-8", kode: "JAM_8", urutan: 11, jam_mulai: "14:30", jam_selesai: "15:15" },
    ];

    const results: TimeSlotDTO[] = [];
    for (const slot of defaultSlots) {
      const created = await this.repository.createTimeSlot({
        ...slot,
        sekolah_id,
      });
      results.push(created);
    }

    await recordAuditEvent({
      sekolah_id,
      aktor_id: actorId,
      aktor_role: actorRole,
      tipe_sumber: "SLOT_WAKTU",
      id_sumber: sekolah_id,
      aksi: "SEED_DEFAULT_TIME_SLOTS",
      payload_sesudah: { count: results.length },
    });

    return results;
  }
}

export const timeSlotService = new TimeSlotService();
