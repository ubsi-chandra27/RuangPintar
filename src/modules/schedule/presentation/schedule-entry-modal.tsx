"use client";

import { useState, useTransition } from "react";
import { createScheduleEntryAction } from "@/app/actions/schedule-actions";
import { Button } from "@/shared/components/ui/button";
import type { ToastType } from "@/shared/components/ui/toast";
import type { TeachingAssignmentDTO } from "@/modules/teacher/domain/teacher-types";
import type { HariBelajar, ScheduleEntryDTO, TimeSlotDTO } from "../domain/schedule-types";
import { DAYS, dayLabel, slotsForDay } from "../domain/time-slot-policy";
import { ScheduleConflictDetector } from "../domain/conflict-detector";
import { ScheduleDialog, fieldClass } from "./schedule-ui";

export interface ScheduleSelection {
  rombelId?: string;
  teacherId?: string;
  day?: HariBelajar;
  slotId?: string;
}
interface Props {
  isOpen: boolean;
  onClose: () => void;
  versionId: string;
  versionName: string;
  rombels: Array<{ id: string; nama: string; tingkat_nama?: string | null }>;
  assignments: TeachingAssignmentDTO[];
  timeSlots: TimeSlotDTO[];
  entries?: ScheduleEntryDTO[];
  selection?: ScheduleSelection;
  entry?: ScheduleEntryDTO;
  onSuccess: (toast: { message: string; type: ToastType }) => void;
}

export function ScheduleEntryModal({
  isOpen,
  onClose,
  versionId,
  versionName,
  rombels,
  assignments,
  timeSlots,
  entries = [],
  selection,
  entry,
  onSuccess,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const teacherAssignments = selection?.teacherId
    ? assignments.filter((a) => a.guru_id === selection.teacherId && a.status === "AKTIF")
    : [];

  const initialRombelId =
    entry?.rombel_id ||
    selection?.rombelId ||
    (teacherAssignments.length > 0 ? teacherAssignments[0].rombel_id : rombels[0]?.id) ||
    "";

  const [rombelId, setRombelId] = useState(initialRombelId);

  const getAvailableAssignments = (targetRombelId: string) => {
    const rombelAssignments = assignments.filter(
      (assignment) => assignment.rombel_id === targetRombelId && assignment.status === "AKTIF"
    );
    if (selection?.teacherId) {
      const teacherMatching = rombelAssignments.filter(
        (assignment) => assignment.guru_id === selection.teacherId
      );
      if (teacherMatching.length > 0) return teacherMatching;
    }
    return rombelAssignments;
  };

  const initialAvailableAssignments = getAvailableAssignments(initialRombelId);
  const initialAssignmentId =
    entry?.penugasan_mengajar_id ||
    (initialAvailableAssignments.length === 1 ? initialAvailableAssignments[0].id : "");

  const [assignmentId, setAssignmentId] = useState(initialAssignmentId);
  const [day, setDay] = useState<HariBelajar>(entry?.hari || selection?.day || "SENIN");
  const availableSlots = slotsForDay(timeSlots, day).filter(
    (slot) => !slot.is_istirahat && !slot.is_upacara
  );
  const [requestedSlot, setRequestedSlot] = useState(
    entry?.slot_waktu_id || selection?.slotId || ""
  );
  const slotId = availableSlots.some((slot) => slot.id === requestedSlot)
    ? requestedSlot
    : requestedSlot
      ? ""
      : availableSlots[0]?.id || "";
  const [room, setRoom] = useState(entry?.ruangan || "");
  const availableAssignments = getAvailableAssignments(rombelId);
  const assignment = availableAssignments.find((item) => item.id === assignmentId);
  const slot = availableSlots.find((item) => item.id === slotId);
  const conflicts =
    assignment && slot
      ? ScheduleConflictDetector.checkConflict(
          {
            excludeEntryId: entry?.id,
            guru_id: assignment.guru_id,
            guru_nama: assignment.guru_nama,
            rombel_id: rombelId,
            rombel_nama: assignment.rombel_nama,
            slot_waktu_id: slot.id,
            slot_waktu_nama: slot.nama,
            slot_waktu_jam_mulai: slot.jam_mulai,
            slot_waktu_jam_selesai: slot.jam_selesai,
            hari: day,
            ruangan: room,
          },
          entries
        )
      : [];
  if (!isOpen) return null;

  return (
    <ScheduleDialog
      title={entry ? "Ubah Jadwal Pelajaran" : "Tambah Jadwal Pelajaran"}
      onClose={onClose}
      busy={pending}
    >
      <p className="mb-4 text-xs text-slate-600">Versi: {versionName}</p>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          const form = new FormData(event.currentTarget);
          form.set("versi_jadwal_id", versionId);
          form.set("rombel_id", rombelId);
          form.set("penugasan_mengajar_id", assignmentId);
          form.set("hari", day);
          form.set("slot_waktu_id", slotId);
          if (entry) form.set("entry_id", entry.id);
          startTransition(async () => {
            const result = await createScheduleEntryAction(null, form);
            if (result.success) {
              onSuccess({ message: result.message, type: "success" });
              onClose();
            } else setError(result.message);
          });
        }}
      >
        {error && (
          <p
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
          >
            {error}
          </p>
        )}
        <label className="block space-y-1 text-sm font-medium">
          Rombongan belajar
          <select
            className={fieldClass}
            value={rombelId}
            onChange={(event) => {
              const newRombelId = event.target.value;
              setRombelId(newRombelId);
              const newAvailable = getAvailableAssignments(newRombelId);
              setAssignmentId(newAvailable.length === 1 ? newAvailable[0].id : "");
            }}
            required
          >
            {rombels.map((rombel) => (
              <option key={rombel.id} value={rombel.id}>
                {rombel.nama}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1 text-sm font-medium">
          Mata pelajaran dan guru
          <select
            className={fieldClass}
            required
            value={assignmentId}
            onChange={(event) => setAssignmentId(event.target.value)}
          >
            <option value="">Pilih penugasan mengajar</option>
            {availableAssignments.map((item) => (
              <option key={item.id} value={item.id}>
                {item.mata_pelajaran_nama} · {item.guru_nama} ({item.jumlah_jam_minggu} JP/minggu)
              </option>
            ))}
          </select>
        </label>
        {!availableAssignments.length && (
          <p className="text-sm text-amber-800">
            Belum ada penugasan aktif untuk rombel dan periode versi ini.
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1 text-sm font-medium">
            Hari pembelajaran
            <select
              className={fieldClass}
              value={day}
              onChange={(event) => {
                setDay(event.target.value as HariBelajar);
                setRequestedSlot("");
              }}
            >
              {DAYS.map((item) => (
                <option key={item} value={item}>
                  {dayLabel(item)}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1 text-sm font-medium">
            Slot jam pelajaran
            <select
              className={fieldClass}
              required
              value={slotId}
              onChange={(event) => setRequestedSlot(event.target.value)}
            >
              {!slotId && <option value="">Pilih slot KBM aktif</option>}
              {availableSlots.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama} ({item.jam_mulai}–{item.jam_selesai})
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="text-xs text-slate-600">
          Pilihan slot mengikuti pola waktu {dayLabel(day)}. Istirahat dan upacara tidak dapat diisi
          pelajaran.
        </p>
        <label className="block space-y-1 text-sm font-medium">
          Ruangan (opsional)
          <input
            name="ruangan"
            className={fieldClass}
            maxLength={100}
            value={room}
            onChange={(event) => setRoom(event.target.value)}
            placeholder="Contoh: Lab Komputer 1"
          />
        </label>
        <label className="block space-y-1 text-sm font-medium">
          Catatan (opsional)
          <textarea
            name="catatan"
            className={fieldClass}
            maxLength={1000}
            defaultValue={entry?.catatan || ""}
            rows={2}
          />
        </label>
        {conflicts.length > 0 && (
          <div
            role="alert"
            className="space-y-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
          >
            <strong>Jadwal bentrok</strong>
            {conflicts.map((conflict, index) => (
              <p key={index}>{conflict.message}</p>
            ))}
          </div>
        )}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="outline" disabled={pending} onClick={onClose}>
            Batal
          </Button>
          <Button
            type="submit"
            variant="cobalt"
            isLoading={pending}
            disabled={!assignment || !slot || conflicts.length > 0}
          >
            Simpan Jadwal
          </Button>
        </div>
      </form>
    </ScheduleDialog>
  );
}
