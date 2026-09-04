"use client";

import { useState, useTransition } from "react";
import {
  createTimeSlotAction,
  updateTimeSlotAction,
  deleteTimeSlotAction,
} from "@/app/actions/schedule-actions";
import { Button } from "@/shared/components/ui/button";
import type { TimeSlotDTO } from "../domain/schedule-types";
import { DAYS, dayLabel } from "../domain/time-slot-policy";
import { timeSlotEditLockReason } from "../domain/time-slot-usage";
import { fieldClass, ScheduleDialog } from "./schedule-ui";

export function TimeSlotDialog({
  slot,
  mode,
  pattern,
  slots,
  onClose,
  onSuccess,
}: {
  slot?: TimeSlotDTO;
  mode: "create" | "edit" | "delete";
  pattern: string;
  slots: TimeSlotDTO[];
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const usage = slot?.penggunaan;
  const deleting = mode === "delete";
  const lock = slot
    ? deleting
      ? !usage
        ? "Informasi pemakaian belum tersedia. Muat ulang halaman."
        : usage.total > 0
          ? `Slot digunakan pada ${usage.total} alokasi jadwal dan tidak dapat dihapus. Pindahkan alokasi yang masih dapat diubah terlebih dahulu; alokasi arsip tetap dilindungi.`
          : null
      : timeSlotEditLockReason(usage)
    : null;
  const needsConfirmation = !deleting && !!usage?.total && !lock;
  const title = deleting ? "Hapus Slot Waktu" : slot ? "Ubah Slot Waktu" : "Tambah Slot Waktu";

  return (
    <ScheduleDialog title={title} onClose={onClose} busy={pending}>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (pending || lock || (needsConfirmation && !confirmed)) return;
          const form = new FormData(event.currentTarget);
          if (slot) {
            form.set("slot_id", slot.id);
            form.set("updated_at", new Date(slot.updated_at).toISOString());
            form.set("total_penggunaan", String(usage?.total ?? -1));
          }
          if (!deleting) {
            form.set("is_istirahat", String(form.get("jenis") === "ISTIRAHAT"));
            form.set("is_upacara", String(form.get("jenis") === "UPACARA"));
            form.set(
              "urutan",
              String(
                slots.filter((item) => (item.hari_khusus || "") === form.get("hari_khusus"))
                  .length + 1
              )
            );
          }
          setError("");
          startTransition(async () => {
            try {
              const result = deleting
                ? await deleteTimeSlotAction(form)
                : slot
                  ? await updateTimeSlotAction(form)
                  : await createTimeSlotAction(null, form);
              if (result.success) onSuccess(result.message);
              else setError(result.message);
            } catch {
              setError(
                "Koneksi terputus. Muat ulang halaman untuk memeriksa hasil sebelum mencoba kembali."
              );
            }
          });
        }}
      >
        {slot && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
            <p className="font-semibold break-words">
              {slot.nama}{" "}
              <span className="font-normal text-slate-600">
                · {slot.jam_mulai}–{slot.jam_selesai}
              </span>
            </p>
            {usage && (
              <>
                <p className="mt-1">
                  {usage.total
                    ? `Digunakan pada ${usage.total} alokasi jadwal.`
                    : "Belum digunakan pada alokasi jadwal."}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  {usage.draft} draft · {usage.published} terpublikasi · {usage.archived} arsip ·{" "}
                  {usage.sessions} sesi kelas
                </p>
              </>
            )}
          </div>
        )}
        {lock && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-relaxed text-amber-900">
            {lock}
          </p>
        )}
        {error && (
          <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">
            {error}
          </p>
        )}
        {deleting ? (
          !lock && (
            <p className="text-sm leading-relaxed text-slate-600">
              Hapus slot ini secara permanen? Slot akan dihapus dari pola waktu sekolah. Tindakan
              ini tidak dapat dibatalkan.
            </p>
          )
        ) : (
          <>
            <fieldset disabled={pending || !!lock} className="space-y-4 disabled:opacity-60">
              <label className="block space-y-1 text-sm">
                Nama slot
                <input
                  className={fieldClass}
                  name="nama"
                  required
                  minLength={2}
                  maxLength={100}
                  defaultValue={slot?.nama}
                  placeholder="Contoh: Jam ke-1"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block space-y-1 text-sm">
                  Kode unik
                  <input
                    className={fieldClass}
                    name="kode"
                    required
                    minLength={2}
                    maxLength={50}
                    defaultValue={slot?.kode}
                    placeholder="Contoh: SENIN_1"
                  />
                </label>
                <label className="block space-y-1 text-sm">
                  Pola hari
                  <select
                    name="hari_khusus"
                    className={fieldClass}
                    defaultValue={
                      slot
                        ? slot.hari_khusus || ""
                        : pattern === "REGULAR" || pattern === "ALL"
                          ? ""
                          : pattern
                    }
                  >
                    <option value="">Reguler (tanpa pola khusus)</option>
                    {DAYS.map((day) => (
                      <option key={day} value={day}>
                        {dayLabel(day)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <p className="text-xs text-slate-600">
                Pola khusus menggantikan seluruh pola reguler pada hari itu. Perubahan tidak boleh
                membuat alokasi jadwal kehilangan slot KBM yang sesuai.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1 text-sm">
                  Jam mulai
                  <input
                    type="time"
                    name="jam_mulai"
                    required
                    className={fieldClass}
                    defaultValue={slot?.jam_mulai}
                  />
                </label>
                <label className="block space-y-1 text-sm">
                  Jam selesai
                  <input
                    type="time"
                    name="jam_selesai"
                    required
                    className={fieldClass}
                    defaultValue={slot?.jam_selesai}
                  />
                </label>
              </div>
              <label className="block space-y-1 text-sm">
                Jenis slot
                <select
                  className={fieldClass}
                  name="jenis"
                  defaultValue={
                    slot?.is_istirahat ? "ISTIRAHAT" : slot?.is_upacara ? "UPACARA" : "KBM"
                  }
                >
                  <option value="KBM">Pembelajaran (KBM)</option>
                  <option value="ISTIRAHAT">Istirahat</option>
                  <option value="UPACARA">Upacara / Apel</option>
                </select>
              </label>
            </fieldset>
            {needsConfirmation && (
              <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-relaxed text-amber-900">
                <input
                  type="checkbox"
                  name="konfirmasi_dampak"
                  className="mt-1 h-4 w-4 shrink-0 accent-blue-600"
                  checked={confirmed}
                  disabled={pending}
                  onChange={(event) => setConfirmed(event.target.checked)}
                  required
                />
                <span>
                  Saya memahami perubahan berlaku pada seluruh {usage!.total} alokasi yang memakai
                  slot ini{usage!.published ? ", termasuk jadwal terpublikasi" : ""}. Sistem akan
                  memeriksa bentrok sebelum menyimpan.
                </span>
              </label>
            )}
          </>
        )}
        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="outline" disabled={pending} onClick={onClose}>
            {lock ? "Tutup" : "Batal"}
          </Button>
          <Button
            type="submit"
            variant={deleting ? "destructive" : "cobalt"}
            disabled={!!lock || (needsConfirmation && !confirmed)}
            isLoading={pending}
          >
            {deleting ? "Hapus Permanen" : slot ? "Simpan Perubahan" : "Simpan Slot"}
          </Button>
        </div>
      </form>
    </ScheduleDialog>
  );
}
