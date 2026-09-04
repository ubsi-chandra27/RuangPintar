/**
 * Ruang Pintar — M10 Schedule Conflict Detector Unit Tests
 */

import { describe, it, expect } from "vitest";
import {
  ScheduleConflictDetector,
  ExistingScheduleEntryCheck,
} from "@/modules/schedule/domain/conflict-detector";

describe("M10 Schedule Conflict Detector", () => {
  const existingEntries: ExistingScheduleEntryCheck[] = [
    {
      id: "ENTRY_01",
      guru_id: "GURU_BUDI",
      guru_nama: "Budi Santoso, S.Pd",
      rombel_id: "ROMBEL_10A",
      rombel_nama: "X RPL 1",
      mata_pelajaran_nama: "Matematika",
      slot_waktu_id: "SLOT_01",
      slot_waktu_nama: "Jam Ke-1",
      hari: "SENIN",
    },
    {
      id: "ENTRY_02",
      guru_id: "GURU_SITI",
      guru_nama: "Siti Rahma, M.Kom",
      rombel_id: "ROMBEL_10B",
      rombel_nama: "X RPL 2",
      mata_pelajaran_nama: "Pemrograman Dasar",
      slot_waktu_id: "SLOT_01",
      slot_waktu_nama: "Jam Ke-1",
      hari: "SENIN",
    },
  ];

  it("should detect teacher conflict when the same teacher is scheduled at the same time in another rombel", () => {
    const target = {
      guru_id: "GURU_BUDI",
      guru_nama: "Budi Santoso, S.Pd",
      rombel_id: "ROMBEL_10C", // Different rombel to isolate teacher conflict
      rombel_nama: "X RPL 3",
      slot_waktu_id: "SLOT_01",
      slot_waktu_nama: "Jam Ke-1",
      hari: "SENIN" as const,
    };

    const conflicts = ScheduleConflictDetector.checkConflict(target, existingEntries);

    expect(conflicts.length).toBe(1);
    expect(conflicts[0].type).toBe("TEACHER_CONFLICT");
    expect(conflicts[0].message).toContain("Konflik Guru: Budi Santoso");
  });

  it("should detect rombel conflict when the same rombel is scheduled for another subject at the same time", () => {
    const target = {
      guru_id: "GURU_ANDI", // Different teacher to isolate rombel conflict
      guru_nama: "Andi Wijaya, S.Pd",
      rombel_id: "ROMBEL_10A",
      rombel_nama: "X RPL 1",
      slot_waktu_id: "SLOT_01",
      slot_waktu_nama: "Jam Ke-1",
      hari: "SENIN" as const,
    };

    const conflicts = ScheduleConflictDetector.checkConflict(target, existingEntries);

    expect(conflicts.length).toBe(1);
    expect(conflicts[0].type).toBe("ROMBEL_CONFLICT");
    expect(conflicts[0].message).toContain("Konflik Rombel: Kelas X RPL 1");
  });

  it("should allow scheduling when there is no teacher or rombel conflict on different day or time slot", () => {
    const target = {
      guru_id: "GURU_BUDI",
      guru_nama: "Budi Santoso, S.Pd",
      rombel_id: "ROMBEL_10B",
      rombel_nama: "X RPL 2",
      slot_waktu_id: "SLOT_02", // Different slot
      slot_waktu_nama: "Jam Ke-2",
      hari: "SENIN" as const,
    };

    const conflicts = ScheduleConflictDetector.checkConflict(target, existingEntries);
    expect(conflicts.length).toBe(0);
  });
});
