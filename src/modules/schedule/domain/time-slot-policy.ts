import type { HariBelajar, TimeSlotDTO } from "./schedule-types";

export const DAYS: HariBelajar[] = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU", "MINGGU"];
export const dayLabel = (day: string) => day.charAt(0) + day.slice(1).toLowerCase();

export function sortTimeSlots(slots: TimeSlotDTO[]): TimeSlotDTO[] {
  return [...slots].sort(
    (a, b) =>
      a.jam_mulai.localeCompare(b.jam_mulai) ||
      a.jam_selesai.localeCompare(b.jam_selesai) ||
      a.kode.localeCompare(b.kode)
  );
}

/** Pola khusus menggantikan pola reguler pada hari tersebut, tanpa bergantung kode impor. */
export function slotsForDay(slots: TimeSlotDTO[], day: HariBelajar): TimeSlotDTO[] {
  const active = slots.filter((slot) => slot.status_aktif);
  const special = active.filter((slot) => slot.hari_khusus === day);
  return sortTimeSlots(special.length ? special : active.filter((slot) => !slot.hari_khusus));
}

export function slotPatternLabel(slot: TimeSlotDTO): string {
  return slot.hari_khusus ? dayLabel(slot.hari_khusus) : "Reguler";
}

export function slotDuration(slot: Pick<TimeSlotDTO, "jam_mulai" | "jam_selesai">): number {
  const minutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };
  return minutes(slot.jam_selesai) - minutes(slot.jam_mulai);
}
