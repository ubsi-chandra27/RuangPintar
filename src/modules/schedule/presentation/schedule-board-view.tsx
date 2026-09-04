"use client";

import { useState, type CSSProperties } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import type { HariBelajar, ScheduleEntryDTO, TimeSlotDTO } from "../domain/schedule-types";
import { DAYS, dayLabel, slotsForDay, sortTimeSlots } from "../domain/time-slot-policy";
import { buildScheduleBlocks } from "../domain/schedule-board";
import { fieldClass } from "./schedule-ui";
import type { ScheduleSelection } from "./schedule-entry-modal";

export function ScheduleBoardView({
  entries,
  timeSlots,
  conflictIds,
  canManage,
  rombelId,
  teacherId,
  onCreate,
  onDetail,
}: {
  entries: ScheduleEntryDTO[];
  timeSlots: TimeSlotDTO[];
  conflictIds: Set<string>;
  canManage: boolean;
  rombelId?: string;
  teacherId?: string;
  onCreate: (selection: ScheduleSelection) => void;
  onDetail: (entries: ScheduleEntryDTO[]) => void;
}) {
  const days = DAYS.filter(
    (day, index) =>
      index < 5 ||
      entries.some((entry) => entry.hari === day) ||
      timeSlots.some((slot) => slot.status_aktif && slot.hari_khusus === day)
  );
  const [mobileDay, setMobileDay] = useState<HariBelajar>("SENIN");
  return (
    <section
      aria-label="Papan jadwal mingguan"
      className="rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div>
          <h3 className="font-bold text-slate-900">Jadwal mingguan</h3>
          <p className="mt-1 text-xs text-slate-600">
            Urutan slot per hari. Jam dan durasi mengikuti pola masing-masing hari.
          </p>
        </div>
        <span className="text-xs text-slate-600">
          {entries.length} alokasi · Klik pelajaran untuk detail
        </span>
      </div>
      <div className="p-3 xl:hidden">
        <label className="block text-sm font-medium">
          Hari yang ditampilkan
          <select
            className={fieldClass}
            value={mobileDay}
            onChange={(event) => setMobileDay(event.target.value as HariBelajar)}
          >
            {days.map((day) => (
              <option key={day} value={day}>
                {dayLabel(day)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div
        className="grid gap-3 p-3 xl:grid-cols-[repeat(var(--days),minmax(0,1fr))]"
        style={{ "--days": days.length } as CSSProperties}
      >
        {days.map((day) => {
          const dailyEntries = entries.filter((entry) => entry.hari === day);
          const available = slotsForDay(timeSlots, day);
          // Alokasi historis di luar pola aktif tetap terlihat untuk diperiksa operator.
          const extraIds = new Set(
            dailyEntries
              .filter((entry) => !available.some((slot) => slot.id === entry.slot_waktu_id))
              .map((entry) => entry.slot_waktu_id)
          );
          const slots = sortTimeSlots([
            ...available,
            ...timeSlots.filter((slot) => extraIds.has(slot.id)),
          ]);
          const blocks = buildScheduleBlocks(slots, dailyEntries, conflictIds);
          return (
            <section
              key={day}
              aria-label={`Jadwal ${dayLabel(day)}`}
              className={`min-w-0 ${day === mobileDay ? "block" : "hidden xl:block"}`}
            >
              <div className="mb-2 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3">
                <h4 className="text-sm font-bold text-slate-800">{dayLabel(day)}</h4>
                <span className="text-xs text-slate-600">{dailyEntries.length} JP</span>
              </div>
              <div className="grid auto-rows-[minmax(100px,auto)] gap-2 xl:auto-rows-[100px]">
                {blocks.map((block) => {
                  const firstSlot = block.slots[0],
                    lastSlot = block.slots.at(-1)!;
                  const firstEntry = block.entries[0];
                  const conflict = block.entries.some((entry) => conflictIds.has(entry.id));
                  const breakSlot = firstSlot.is_istirahat || firstSlot.is_upacara;
                  const outside = extraIds.has(firstSlot.id);
                  const time = `${firstSlot.jam_mulai}–${lastSlot.jam_selesai}`;
                  return (
                    <div
                      key={firstSlot.id}
                      className="min-w-0 xl:row-span-[var(--slot-span)]"
                      style={{ "--slot-span": block.slots.length } as CSSProperties}
                    >
                      {firstEntry ? (
                        <button
                          type="button"
                          onClick={() => onDetail(block.entries)}
                          className={`flex h-full min-h-24 w-full flex-col gap-1 overflow-y-auto rounded-xl border border-l-[3px] p-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${conflict || outside ? "border-rose-200 border-l-rose-600 bg-rose-50 hover:bg-rose-100" : "border-blue-100 border-l-blue-600 bg-blue-50/70 hover:bg-blue-100"}`}
                        >
                          <span className="flex flex-wrap items-center justify-between gap-1 text-[11px] font-medium text-slate-600">
                            <span>{time}</span>
                            <span>{block.slots.length} JP</span>
                          </span>
                          <strong className="text-xs leading-snug text-slate-900">
                            {firstEntry.mata_pelajaran_nama}
                          </strong>
                          <span className="text-[11px] leading-snug text-slate-700">
                            {rombelId ? firstEntry.guru_nama : firstEntry.rombel_nama}
                          </span>
                          {block.slots.length > 1 && firstEntry.ruangan && (
                            <span className="text-[11px] text-slate-600">{firstEntry.ruangan}</span>
                          )}
                          {conflict && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-rose-800">
                              <AlertTriangle className="h-3 w-3 shrink-0" />
                              Bentrok
                              {block.entries.length > block.slots.length
                                ? ` · ${block.entries.length} alokasi`
                                : ""}
                            </span>
                          )}
                          {outside && (
                            <span className="text-[11px] font-bold text-rose-800">
                              Di luar pola aktif
                            </span>
                          )}
                        </button>
                      ) : breakSlot ? (
                        <div className="flex h-full flex-col justify-center rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                          <span>{time}</span>
                          <strong className="mt-1 font-semibold">
                            {firstSlot.is_upacara ? "Upacara / Apel" : "Istirahat"}
                          </strong>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={!canManage || (!rombelId && !teacherId)}
                          onClick={() =>
                            onCreate({ rombelId, teacherId, day, slotId: firstSlot.id })
                          }
                          className="flex h-full min-h-24 w-full flex-col justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-white px-3 text-left text-xs text-slate-600 transition-colors enabled:hover:border-blue-400 enabled:hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-default"
                        >
                          <span>{time}</span>
                          <span className="flex items-center gap-1 font-medium">
                            {canManage && (rombelId || teacherId) ? (
                              <>
                                <Plus className="h-3 w-3" />
                                Isi jadwal
                              </>
                            ) : (
                              "Belum terjadwal"
                            )}
                          </span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              {!slots.length && <p className="p-4 text-sm text-slate-600">Belum ada slot waktu.</p>}
              {slots.length > 0 && (
                <p className="px-2 pt-3 text-[11px] text-slate-500">
                  Akhir pola · {slots.at(-1)?.jam_selesai}
                </p>
              )}
            </section>
          );
        })}
      </div>
    </section>
  );
}
