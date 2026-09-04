"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Clock, Coffee, Layers, Plus, Pencil, Trash2, LockKeyhole } from "lucide-react";
import { seedTimeSlotsAction } from "@/app/actions/schedule-actions";
import { Button } from "@/shared/components/ui/button";
import { Toast, type ToastType } from "@/shared/components/ui/toast";
import { TimeSlotDialog } from "./time-slot-dialog";
import { timeSlotEditLockReason } from "../domain/time-slot-usage";
import type { TimeSlotDTO } from "../domain/schedule-types";
import { DAYS, dayLabel, slotDuration, slotPatternLabel } from "../domain/time-slot-policy";
import {
  SchedulePagination,
  ScheduleToolbar,
  exportScheduleCsv,
  fieldClass,
  surfaceClass,
  tableClass,
} from "./schedule-ui";

export function TimeSlotsView({
  initialTimeSlots: slots,
  canManage,
}: {
  initialTimeSlots: TimeSlotDTO[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [pattern, setPattern] = useState("REGULAR");
  const [type, setType] = useState("ALL");
  const [sort, setSort] = useState("time");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(25);
  const [dialog, setDialog] = useState<{
    mode: "create" | "edit" | "delete";
    slot?: TimeSlotDTO;
  } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [pending, startTransition] = useTransition();
  const specialDays = DAYS.filter((day) => slots.some((slot) => slot.hari_khusus === day));
  const regularDays = DAYS.slice(0, 5).filter((day) => !specialDays.includes(day));
  const kind = (slot: TimeSlotDTO) =>
    slot.is_istirahat ? "Istirahat" : slot.is_upacara ? "Upacara / Apel" : "KBM";
  const scoped = slots.filter(
    (slot) => pattern === "ALL" || (slot.hari_khusus || "REGULAR") === pattern
  );
  const filtered = scoped
    .filter(
      (slot) =>
        `${slot.nama} ${slot.kode} ${slot.jam_mulai} ${slot.jam_selesai} ${slotPatternLabel(slot)}`
          .toLowerCase()
          .includes(search.trim().toLowerCase()) &&
        (type === "ALL" || kind(slot) === type)
    )
    .sort((a, b) => {
      if (sort === "name") return a.nama.localeCompare(b.nama, "id", { numeric: true });
      const patternOrder = (slot: TimeSlotDTO) =>
        slot.hari_khusus ? DAYS.indexOf(slot.hari_khusus as (typeof DAYS)[number]) + 1 : 0;
      return (
        patternOrder(a) - patternOrder(b) ||
        (sort === "late" ? -1 : 1) * a.jam_mulai.localeCompare(b.jam_mulai) ||
        a.kode.localeCompare(b.kode)
      );
    });
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / size)));
  const displayed = filtered.slice((currentPage - 1) * size, currentPage * size);
  const badge = (slot: TimeSlotDTO) => (
    <span
      className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${slot.is_istirahat || slot.is_upacara ? "border-amber-200 bg-amber-50 text-amber-800" : "border-blue-200 bg-blue-50 text-blue-800"}`}
    >
      {kind(slot)}
    </span>
  );
  const usageInfo = (slot: TimeSlotDTO) => (
    <div className="text-xs text-slate-600">
      <span>
        {slot.penggunaan
          ? slot.penggunaan.total
            ? `${slot.penggunaan.total} alokasi`
            : "Belum digunakan"
          : "Belum dimuat"}
      </span>
      {slot.penggunaan && timeSlotEditLockReason(slot.penggunaan) && (
        <span className="mt-1 flex items-center gap-1 text-amber-800">
          <LockKeyhole className="h-3 w-3" />
          Riwayat dilindungi
        </span>
      )}
    </div>
  );
  const actions = (slot: TimeSlotDTO, withText = false) => (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size={withText ? "default" : "icon"}
        aria-label={`Ubah ${slot.nama}`}
        title={`Ubah ${slot.nama}`}
        onClick={() => setDialog({ mode: "edit", slot })}
      >
        <Pencil className="h-4 w-4" />
        {withText && "Ubah"}
      </Button>
      <Button
        variant="ghost"
        size={withText ? "default" : "icon"}
        className="text-rose-700"
        aria-label={`Hapus ${slot.nama}`}
        title={`Hapus ${slot.nama}`}
        onClick={() => setDialog({ mode: "delete", slot })}
      >
        <Trash2 className="h-4 w-4" />
        {withText && "Hapus"}
      </Button>
    </div>
  );
  return (
    <div className="space-y-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-lg font-bold text-slate-900">Pola waktu pembelajaran</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Slot adalah rentang waktu, bukan jumlah jam durasi. Pilih pola untuk melihat urutan
              KBM dan istirahat sesuai waktu mulai.
            </p>
          </div>
          <span className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
            {slots.length} slot tersimpan
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Pola waktu">
          {[
            { value: "REGULAR", label: "Reguler" },
            ...specialDays.map((day) => ({ value: day, label: dayLabel(day) })),
            { value: "ALL", label: "Semua pola" },
          ].map((item) => (
            <Button
              key={item.value}
              variant={pattern === item.value ? "cobalt" : "outline"}
              aria-pressed={pattern === item.value}
              onClick={() => {
                setPattern(item.value);
                setPage(1);
              }}
            >
              {item.label}
              <span className="rounded bg-current/5 px-1.5 text-xs">
                {
                  slots.filter(
                    (slot) => item.value === "ALL" || (slot.hari_khusus || "REGULAR") === item.value
                  ).length
                }
              </span>
            </Button>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-600">
          {pattern === "REGULAR"
            ? `Pola reguler dipakai pada hari tanpa pola khusus${regularDays.length ? `, termasuk ${regularDays.map(dayLabel).join(", ")}` : ""}.`
            : pattern === "ALL"
              ? "Setiap pola ditampilkan terpisah dalam urutan waktu. Kolom No. adalah nomor baris, bukan nomor JP."
              : `Pola ${dayLabel(pattern)} menggantikan pola reguler pada hari tersebut.`}{" "}
          Nomor JP mengikuti nama slot; istirahat tidak dihitung sebagai JP.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[
          { label: "Slot dalam pola pilihan", count: scoped.length, Icon: Layers },
          {
            label: "Slot KBM",
            count: scoped.filter((slot) => !slot.is_istirahat && !slot.is_upacara).length,
            Icon: Clock,
          },
          {
            label: "Slot istirahat & upacara",
            count: scoped.filter((slot) => slot.is_istirahat || slot.is_upacara).length,
            Icon: Coffee,
          },
        ].map(({ label, count, Icon }) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 sm:p-4"
          >
            <div>
              <p className="text-xs font-medium text-slate-600">{label}</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {count} <span className="text-sm font-medium">Slot</span>
              </p>
            </div>
            <Icon className="hidden h-5 w-5 text-blue-600 sm:block" />
          </div>
        ))}
      </div>
      <ScheduleToolbar
        search={search}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder="Cari nama, kode, atau waktu slot..."
        sort={sort}
        onSort={(value) => {
          setSort(value);
          setPage(1);
        }}
        sortOptions={[
          { value: "time", label: "Urut: Waktu mulai" },
          { value: "late", label: "Urut: Waktu terakhir" },
          { value: "name", label: "Urut: Nama slot" },
        ]}
        onExport={() =>
          exportScheduleCsv("slot-waktu.csv", [
            [
              "No.",
              "Pola",
              "Nama slot",
              "Kode",
              "Mulai",
              "Selesai",
              "Durasi (menit)",
              "Jenis",
              "Status",
            ],
            ...filtered.map((slot, index) => [
              index + 1,
              slotPatternLabel(slot),
              slot.nama,
              slot.kode,
              slot.jam_mulai,
              slot.jam_selesai,
              slotDuration(slot),
              kind(slot),
              slot.status_aktif ? "Aktif" : "Nonaktif",
            ]),
          ])
        }
        filters={
          <>
            <label className="text-xs font-semibold">
              Jenis slot
              <select
                className={fieldClass}
                value={type}
                onChange={(event) => {
                  setType(event.target.value);
                  setPage(1);
                }}
              >
                {["ALL", "KBM", "Istirahat", "Upacara / Apel"].map((value) => (
                  <option key={value} value={value}>
                    {value === "ALL" ? "Semua jenis" : value}
                  </option>
                ))}
              </select>
            </label>
            <Button
              variant="ghost"
              onClick={() => {
                setType("ALL");
                setSearch("");
                setPage(1);
              }}
            >
              Reset filter
            </Button>
          </>
        }
      >
        {canManage && (
          <Button
            variant="cobalt"
            onClick={() => {
              setDialog({ mode: "create" });
            }}
          >
            <Plus className="h-4 w-4" />
            Tambah Slot Waktu
          </Button>
        )}
        {canManage && !slots.length && (
          <Button
            variant="outline"
            isLoading={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await seedTimeSlotsAction();
                setToast({ message: result.message, type: result.success ? "success" : "error" });
                if (result.success) router.refresh();
              })
            }
          >
            Muat Template Jam Sekolah
          </Button>
        )}
      </ScheduleToolbar>
      {type !== "ALL" && <p className="text-xs text-slate-600">Filter jenis: {type}</p>}
      <div className={surfaceClass}>
        <div className="hidden max-h-[640px] overflow-y-auto xl:block">
          <table className={tableClass}>
            <caption className="sr-only">
              Slot waktu pembelajaran menurut pola dan waktu mulai
            </caption>
            <thead>
              <tr>
                <th scope="col" className="w-[6%]">
                  No.
                </th>
                <th scope="col" className="w-[24%]">
                  Nama slot
                </th>
                <th scope="col" className="w-[12%]">
                  Pola hari
                </th>
                <th scope="col" className="w-[18%]">
                  Waktu
                </th>
                <th scope="col" className="w-[12%]">
                  Jenis
                </th>
                <th scope="col" className="w-[16%]">
                  Pemakaian
                </th>
                {canManage && (
                  <th scope="col" className="w-[120px]">
                    Aksi
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {displayed.map((slot, index) => (
                <tr key={slot.id}>
                  <td className="text-xs text-slate-600">{(currentPage - 1) * size + index + 1}</td>
                  <td>
                    <span className="block font-semibold text-slate-900">{slot.nama}</span>
                    <span className="block font-mono text-[11px] text-slate-500">{slot.kode}</span>
                  </td>
                  <td className="text-xs">{slotPatternLabel(slot)}</td>
                  <td className="font-medium tabular-nums">
                    {slot.jam_mulai}–{slot.jam_selesai}
                    <span className="block text-xs font-normal text-slate-600">
                      {slotDuration(slot)} menit
                    </span>
                  </td>
                  <td>{badge(slot)}</td>
                  <td>{usageInfo(slot)}</td>
                  {canManage && <td>{actions(slot)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="divide-y divide-slate-100 xl:hidden">
          {displayed.map((slot, index) => (
            <article key={slot.id} className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-bold">
                  {(currentPage - 1) * size + index + 1}. {slot.nama}
                </h3>
                {badge(slot)}
              </div>
              <p className="text-sm font-medium tabular-nums">
                {slot.jam_mulai}–{slot.jam_selesai}{" "}
                <span className="font-normal text-slate-600">· {slotDuration(slot)} menit</span>
              </p>
              <p className="text-xs text-slate-600">
                Pola {slotPatternLabel(slot)} · {slot.status_aktif ? "Aktif" : "Nonaktif"}
              </p>
              <p className="font-mono text-[11px] text-slate-500">{slot.kode}</p>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2">
                {usageInfo(slot)}
                {canManage && actions(slot, true)}
              </div>
            </article>
          ))}
        </div>
        {!displayed.length && (
          <p className="p-10 text-center text-sm text-slate-600">
            Tidak ada slot yang sesuai. Pilih pola lain atau ubah pencarian dan filter.
          </p>
        )}
        <SchedulePagination
          total={filtered.length}
          page={currentPage}
          size={size}
          onPage={setPage}
          onSize={(value) => {
            setSize(value);
            setPage(1);
          }}
        />
      </div>
      {dialog && (
        <TimeSlotDialog
          mode={dialog.mode}
          slot={dialog.slot}
          pattern={pattern}
          slots={slots}
          onClose={() => setDialog(null)}
          onSuccess={(message) => {
            setDialog(null);
            setToast({ message, type: "success" });
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
