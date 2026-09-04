import type { ScheduleEntryDTO, TimeSlotDTO } from "./schedule-types";

export interface ScheduleBlock {
  slots: TimeSlotDTO[];
  entries: ScheduleEntryDTO[];
}

/** Penggabungan hanya visual; ID alokasi tetap terpisah untuk audit dan penyuntingan per JP. */
export function buildScheduleBlocks(
  slots: TimeSlotDTO[],
  entries: ScheduleEntryDTO[],
  conflictIds: Set<string>
): ScheduleBlock[] {
  const blocks: ScheduleBlock[] = [];
  for (const slot of slots) {
    const matches = entries.filter((entry) => entry.slot_waktu_id === slot.id);
    const previous = blocks.at(-1);
    const previousEntry = previous?.entries.at(-1);
    const entry = matches[0];
    if (
      previous &&
      previousEntry &&
      matches.length === 1 &&
      previous.entries.length === previous.slots.length &&
      previousEntry.penugasan_mengajar_id === entry.penugasan_mengajar_id &&
      previousEntry.rombel_id === entry.rombel_id &&
      (previousEntry.ruangan || "") === (entry.ruangan || "") &&
      (previousEntry.catatan || "") === (entry.catatan || "") &&
      previous.slots.at(-1)?.jam_selesai === slot.jam_mulai &&
      !slot.is_istirahat &&
      !slot.is_upacara &&
      !previous.slots.some((item) => item.is_istirahat || item.is_upacara) &&
      !conflictIds.has(entry.id) &&
      !previous.entries.some((item) => conflictIds.has(item.id))
    ) {
      previous.slots.push(slot);
      previous.entries.push(entry);
    } else blocks.push({ slots: [slot], entries: matches });
  }
  return blocks;
}
