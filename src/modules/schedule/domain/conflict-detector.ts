/**
 * Ruang Pintar — M10 Schedule Conflict Detector (Domain Service)
 */

import { HariBelajar, ScheduleConflictItem } from "./schedule-types";

export interface ExistingScheduleEntryCheck {
  id: string;
  guru_id: string;
  guru_nama: string;
  rombel_id: string;
  rombel_nama: string;
  mata_pelajaran_nama: string;
  slot_waktu_id: string;
  slot_waktu_nama: string;
  slot_waktu_jam_mulai?: string;
  slot_waktu_jam_selesai?: string;
  ruangan?: string | null;
  hari: HariBelajar;
}

export class ScheduleConflictDetector {
  /**
   * Memeriksa apakah penambahan / pembaruan entri jadwal menyebabkan konflik sumber daya (Guru / Rombel).
   */
  static checkConflict(
    target: {
      excludeEntryId?: string;
      guru_id: string;
      guru_nama: string;
      rombel_id: string;
      rombel_nama: string;
      slot_waktu_id: string;
      slot_waktu_nama: string;
      slot_waktu_jam_mulai?: string;
      slot_waktu_jam_selesai?: string;
      ruangan?: string | null;
      hari: HariBelajar;
    },
    existingEntries: ExistingScheduleEntryCheck[]
  ): ScheduleConflictItem[] {
    const conflicts: ScheduleConflictItem[] = [];

    for (const entry of existingEntries) {
      if (target.excludeEntryId && entry.id === target.excludeEntryId) {
        continue;
      }

      // Check same day and time slot
      const overlaps =
        target.slot_waktu_jam_mulai &&
        target.slot_waktu_jam_selesai &&
        entry.slot_waktu_jam_mulai &&
        entry.slot_waktu_jam_selesai
          ? target.slot_waktu_jam_mulai < entry.slot_waktu_jam_selesai &&
            target.slot_waktu_jam_selesai > entry.slot_waktu_jam_mulai
          : entry.slot_waktu_id === target.slot_waktu_id;
      if (entry.hari === target.hari && overlaps) {
        if (
          target.ruangan?.trim() &&
          target.ruangan.trim().toLowerCase() === entry.ruangan?.trim().toLowerCase()
        ) {
          conflicts.push({
            type: "SLOT_CONFLICT",
            message: `Konflik Ruangan: ${target.ruangan} sudah digunakan ${entry.rombel_nama} (${entry.mata_pelajaran_nama}) pada ${target.hari}, ${entry.slot_waktu_nama}.`,
            conflicting_entry_id: entry.id,
          });
        }
        // 1. Teacher Conflict
        if (entry.guru_id === target.guru_id) {
          conflicts.push({
            type: "TEACHER_CONFLICT",
            message: `Konflik Guru: ${target.guru_nama} sudah memiliki jadwal mengajar di kelas ${entry.rombel_nama} (${entry.mata_pelajaran_nama}) pada hari ${target.hari}, ${target.slot_waktu_nama}.`,
            conflicting_entry_id: entry.id,
          });
        }

        // 2. Rombel Conflict
        if (entry.rombel_id === target.rombel_id) {
          conflicts.push({
            type: "ROMBEL_CONFLICT",
            message: `Konflik Rombel: Kelas ${target.rombel_nama} sudah memiliki jadwal mata pelajaran ${entry.mata_pelajaran_nama} bersama ${entry.guru_nama} pada hari ${target.hari}, ${target.slot_waktu_nama}.`,
            conflicting_entry_id: entry.id,
          });
        }
      }
    }

    return conflicts;
  }
}
