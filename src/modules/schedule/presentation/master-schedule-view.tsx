"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarDays, Eye, List, Plus, Send } from "lucide-react";
import {
  createScheduleVersionAction,
  deleteScheduleEntryAction,
  publishScheduleVersionAction,
} from "@/app/actions/schedule-actions";
import { Button } from "@/shared/components/ui/button";
import { Toast, type ToastType } from "@/shared/components/ui/toast";
import type { TeachingAssignmentDTO } from "@/modules/teacher/domain/teacher-types";
import type { ScheduleEntryDTO, ScheduleVersionDTO, TimeSlotDTO } from "../domain/schedule-types";
import { DAYS, dayLabel } from "../domain/time-slot-policy";
import { ScheduleConflictDetector } from "../domain/conflict-detector";
import { ScheduleEntryModal, type ScheduleSelection } from "./schedule-entry-modal";
import { ScheduleBoardView } from "./schedule-board-view";
import {
  ScheduleDialog,
  SchedulePagination,
  ScheduleToolbar,
  exportScheduleCsv,
  fieldClass,
  surfaceClass,
  tableClass,
} from "./schedule-ui";

interface MasterScheduleViewProps {
  versions: ScheduleVersionDTO[];
  initialEntries: ScheduleEntryDTO[];
  timeSlots: TimeSlotDTO[];
  rombels: Array<{ id: string; nama: string; tingkat_nama?: string | null }>;
  assignments: TeachingAssignmentDTO[];
  academicYears: Array<{ id: string; nama: string; status: string }>;
  canManage: boolean;
  canPublish: boolean;
}

export function MasterScheduleView({
  versions,
  initialEntries,
  timeSlots,
  rombels,
  assignments,
  academicYears,
  canManage,
  canPublish,
}: MasterScheduleViewProps) {
  const router = useRouter();
  const [versionId, setVersionId] = useState(
    versions.find((version) => version.status === "PUBLISHED")?.id || versions[0]?.id || ""
  );
  const activeVersion = versions.find((version) => version.id === versionId) || versions[0];
  const entries = useMemo(
    () => initialEntries.filter((entry) => entry.versi_jadwal_id === activeVersion?.id),
    [initialEntries, activeVersion?.id]
  );
  const periodAssignments = assignments.filter(
    (assignment) =>
      assignment.tahun_ajaran_id === activeVersion?.tahun_ajaran_id &&
      (!activeVersion?.semester_id || assignment.semester_id === activeVersion.semester_id)
  );
  const [mode, setMode] = useState<"BOARD" | "LIST">("BOARD");
  const [perspective, setPerspective] = useState<"ROMBEL" | "GURU">("ROMBEL");
  const [selectedRombel, setSelectedRombel] = useState(rombels[0]?.id || "");
  const teachers = [
    ...new Map(
      [...periodAssignments, ...entries].map((item) => [
        item.guru_id,
        { id: item.guru_id, nama: item.guru_nama },
      ])
    ).values(),
  ].sort((a, b) => a.nama.localeCompare(b.nama, "id"));
  const [teacherId, setTeacherId] = useState("");
  const currentTeacher =
    teachers.find((teacher) => teacher.id === teacherId)?.id || teachers[0]?.id || "";
  const [search, setSearch] = useState("");
  const [dayFilter, setDayFilter] = useState("ALL");
  const [rombelFilter, setRombelFilter] = useState("ALL");
  const [onlyConflicts, setOnlyConflicts] = useState(false);
  const [sort, setSort] = useState("time");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(25);
  const [selection, setSelection] = useState<ScheduleSelection | null>(null);
  const [editing, setEditing] = useState<ScheduleEntryDTO | undefined>();
  const [detail, setDetail] = useState<ScheduleEntryDTO[] | null>(null);
  const [deleting, setDeleting] = useState<ScheduleEntryDTO | null>(null);
  const [createVersion, setCreateVersion] = useState(false);
  const [publish, setPublish] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [pending, startTransition] = useTransition();
  const editable = canManage && !!activeVersion && activeVersion.status !== "ARCHIVED";
  const conflictMap = useMemo(
    () =>
      new Map(
        entries.map((entry) => [
          entry.id,
          ScheduleConflictDetector.checkConflict({ ...entry, excludeEntryId: entry.id }, entries),
        ])
      ),
    [entries]
  );
  const conflictIds = new Set(
    [...conflictMap].filter(([, conflicts]) => conflicts.length).map(([id]) => id)
  );
  const boardEntries = entries.filter((entry) =>
    perspective === "ROMBEL" ? entry.rombel_id === selectedRombel : entry.guru_id === currentTeacher
  );
  const listEntries = entries
    .filter((entry) => {
      const text =
        `${entry.guru_nama} ${entry.mata_pelajaran_nama} ${entry.rombel_nama} ${entry.ruangan || ""}`.toLowerCase();
      return (
        text.includes(search.trim().toLowerCase()) &&
        (dayFilter === "ALL" || entry.hari === dayFilter) &&
        (rombelFilter === "ALL" || entry.rombel_id === rombelFilter) &&
        (!onlyConflicts || conflictIds.has(entry.id))
      );
    })
    .sort((a, b) =>
      sort === "teacher"
        ? a.guru_nama.localeCompare(b.guru_nama, "id")
        : sort === "rombel"
          ? a.rombel_nama.localeCompare(b.rombel_nama, "id")
          : DAYS.indexOf(a.hari) - DAYS.indexOf(b.hari) ||
            a.slot_waktu_jam_mulai.localeCompare(b.slot_waktu_jam_mulai) ||
            a.rombel_nama.localeCompare(b.rombel_nama, "id")
    );
  const currentPage = Math.min(page, Math.max(1, Math.ceil(listEntries.length / size)));
  const displayed = listEntries.slice((currentPage - 1) * size, currentPage * size);
  const refresh = (message: string) => {
    setToast({ message, type: "success" });
    router.refresh();
  };
  const exportRows = (data: ScheduleEntryDTO[]) =>
    exportScheduleCsv("jadwal-pelajaran.csv", [
      ["Hari", "Mulai", "Selesai", "Rombel", "Mapel", "Guru", "Ruangan", "Versi"],
      ...data.map((entry) => [
        dayLabel(entry.hari),
        entry.slot_waktu_jam_mulai,
        entry.slot_waktu_jam_selesai,
        entry.rombel_nama,
        entry.mata_pelajaran_nama,
        entry.guru_nama,
        entry.ruangan,
        activeVersion?.nama,
      ]),
    ]);
  const add = (value: ScheduleSelection = {}) => {
    setEditing(undefined);
    setSelection(value);
  };
  const openDetail = (values: ScheduleEntryDTO[]) => {
    setDetail(values);
    setError("");
  };

  return (
    <div className="space-y-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
        <label className="block min-w-0 flex-1 space-y-1 text-xs font-semibold text-slate-600">
          Versi jadwal
          <select
            className={fieldClass}
            value={activeVersion?.id || ""}
            onChange={(event) => {
              setVersionId(event.target.value);
              setPage(1);
              setOnlyConflicts(false);
            }}
          >
            <option value="" disabled>
              Pilih versi
            </option>
            {versions.map((version) => (
              <option key={version.id} value={version.id}>
                {version.nama} ·{" "}
                {version.status === "PUBLISHED"
                  ? "Terpublikasi"
                  : version.status === "ARCHIVED"
                    ? "Arsip"
                    : "Draft"}
              </option>
            ))}
          </select>
        </label>
        {canManage && (
          <Button
            variant="outline"
            onClick={() => {
              setCreateVersion(true);
              setError("");
            }}
          >
            <Plus className="h-4 w-4" />
            Versi Baru
          </Button>
        )}
        {canPublish && activeVersion?.status === "DRAFT" && (
          <Button
            variant="cobalt"
            disabled={!entries.length}
            onClick={() => {
              setPublish(true);
              setError("");
            }}
          >
            <Send className="h-4 w-4" />
            Publikasikan
          </Button>
        )}
      </div>
      {activeVersion?.status === "PUBLISHED" && editable && (
        <p className="text-xs text-slate-600">
          Anda melihat jadwal terpublikasi. Perubahan yang disimpan langsung memperbarui jadwal
          resmi; setiap perubahan dicatat dalam audit.
        </p>
      )}
      {conflictIds.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          <p className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>
              <strong>{conflictIds.size} alokasi perlu diperiksa.</strong> Ada bentrok guru, rombel,
              atau ruangan pada versi ini.
            </span>
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setMode("LIST");
              setOnlyConflicts(true);
              setSearch("");
              setDayFilter("ALL");
              setRombelFilter("ALL");
              setPage(1);
            }}
          >
            Periksa bentrok
          </Button>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex rounded-xl border border-slate-200 bg-white p-1"
          role="group"
          aria-label="Tampilan jadwal"
        >
          <Button
            variant={mode === "BOARD" ? "cobalt" : "ghost"}
            aria-pressed={mode === "BOARD"}
            onClick={() => setMode("BOARD")}
          >
            <CalendarDays className="h-4 w-4" />
            Papan Jadwal
          </Button>
          <Button
            variant={mode === "LIST" ? "cobalt" : "ghost"}
            aria-pressed={mode === "LIST"}
            onClick={() => setMode("LIST")}
          >
            <List className="h-4 w-4" />
            Daftar
          </Button>
        </div>
        <p className="text-sm text-slate-600">
          {entries.length.toLocaleString("id-ID")} alokasi pada versi ini
        </p>
      </div>
      {mode === "BOARD" ? (
        <>
          <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <label className="block space-y-1 text-xs font-semibold text-slate-600">
              Lihat berdasarkan
              <select
                className={fieldClass}
                value={perspective}
                onChange={(event) => setPerspective(event.target.value as "ROMBEL" | "GURU")}
              >
                <option value="ROMBEL">Rombel</option>
                <option value="GURU">Guru</option>
              </select>
            </label>
            {perspective === "ROMBEL" ? (
              <label className="block min-w-0 flex-1 space-y-1 text-xs font-semibold text-slate-600">
                Pilih rombel
                <select
                  className={fieldClass}
                  value={selectedRombel}
                  onChange={(event) => setSelectedRombel(event.target.value)}
                >
                  {rombels.map((rombel) => (
                    <option key={rombel.id} value={rombel.id}>
                      {rombel.nama}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label className="block min-w-0 flex-1 space-y-1 text-xs font-semibold text-slate-600">
                Pilih guru
                <select
                  className={fieldClass}
                  value={currentTeacher}
                  onChange={(event) => setTeacherId(event.target.value)}
                >
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.nama}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <Button
              variant="outline"
              disabled={!boardEntries.length}
              onClick={() => exportRows(boardEntries)}
            >
              Ekspor tampilan
            </Button>
            {editable && (
              <Button
                variant="cobalt"
                onClick={() =>
                  add({
                    rombelId: perspective === "ROMBEL" ? selectedRombel : undefined,
                    teacherId: perspective === "GURU" ? currentTeacher : undefined,
                  })
                }
              >
                <Plus className="h-4 w-4" />
                Tambah Jadwal
              </Button>
            )}
          </div>
          <ScheduleBoardView
            entries={boardEntries}
            timeSlots={timeSlots}
            conflictIds={conflictIds}
            canManage={editable}
            rombelId={perspective === "ROMBEL" ? selectedRombel : undefined}
            teacherId={perspective === "GURU" ? currentTeacher : undefined}
            onCreate={add}
            onDetail={openDetail}
          />
        </>
      ) : (
        <>
          <ScheduleToolbar
            search={search}
            onSearch={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Cari guru, mapel, rombel, ruangan..."
            sort={sort}
            onSort={(value) => {
              setSort(value);
              setPage(1);
            }}
            sortOptions={[
              { value: "time", label: "Urut: Hari & jam" },
              { value: "teacher", label: "Urut: Guru" },
              { value: "rombel", label: "Urut: Rombel" },
            ]}
            onExport={() => exportRows(listEntries)}
            filters={
              <>
                <label className="text-xs font-semibold">
                  Hari
                  <select
                    className={fieldClass}
                    value={dayFilter}
                    onChange={(event) => {
                      setDayFilter(event.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="ALL">Semua hari</option>
                    {DAYS.map((day) => (
                      <option key={day} value={day}>
                        {dayLabel(day)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-semibold">
                  Rombel
                  <select
                    className={fieldClass}
                    value={rombelFilter}
                    onChange={(event) => {
                      setRombelFilter(event.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="ALL">Semua rombel</option>
                    {rombels.map((rombel) => (
                      <option key={rombel.id} value={rombel.id}>
                        {rombel.nama}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex min-h-11 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={onlyConflicts}
                    onChange={(event) => {
                      setOnlyConflicts(event.target.checked);
                      setPage(1);
                    }}
                  />
                  Hanya yang bentrok
                </label>
              </>
            }
          >
            {editable && (
              <Button variant="cobalt" onClick={() => add()}>
                <Plus className="h-4 w-4" />
                Tambah Jadwal
              </Button>
            )}
          </ScheduleToolbar>
          {(onlyConflicts || dayFilter !== "ALL" || rombelFilter !== "ALL") && (
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span>
                Filter aktif: {onlyConflicts ? "bentrok · " : ""}
                {dayFilter === "ALL" ? "semua hari" : dayLabel(dayFilter)} ·{" "}
                {rombelFilter === "ALL"
                  ? "semua rombel"
                  : rombels.find((r) => r.id === rombelFilter)?.nama}
              </span>
              <Button
                variant="ghost"
                onClick={() => {
                  setOnlyConflicts(false);
                  setDayFilter("ALL");
                  setRombelFilter("ALL");
                  setPage(1);
                }}
              >
                Reset filter
              </Button>
            </div>
          )}
          <div className={surfaceClass}>
            <div className="hidden max-h-[640px] overflow-y-auto lg:block">
              <table className={tableClass}>
                <caption className="sr-only">Daftar jadwal pelajaran</caption>
                <thead>
                  <tr>
                    <th scope="col" className="w-[17%]">
                      Hari & jam
                    </th>
                    <th scope="col" className="w-[14%]">
                      Rombel
                    </th>
                    <th scope="col" className="w-[27%]">
                      Mata pelajaran
                    </th>
                    <th scope="col" className="w-[22%]">
                      Guru
                    </th>
                    <th scope="col" className="w-[12%]">
                      Ruangan
                    </th>
                    <th scope="col" className="w-[8%]">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((entry) => (
                    <tr key={entry.id}>
                      <td>
                        <strong className="text-xs">{dayLabel(entry.hari)}</strong>
                        <span className="block text-xs text-slate-600">
                          {entry.slot_waktu_jam_mulai}–{entry.slot_waktu_jam_selesai}
                        </span>
                      </td>
                      <td className="font-semibold">{entry.rombel_nama}</td>
                      <td>
                        <span className="font-semibold">{entry.mata_pelajaran_nama}</span>
                        {conflictIds.has(entry.id) && (
                          <span className="mt-1 block text-xs font-semibold text-rose-700">
                            ⚠ Bentrok
                          </span>
                        )}
                      </td>
                      <td>{entry.guru_nama}</td>
                      <td className="break-words">{entry.ruangan || "—"}</td>
                      <td>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Detail ${entry.mata_pelajaran_nama} ${entry.rombel_nama} ${dayLabel(entry.hari)} ${entry.slot_waktu_jam_mulai}`}
                          onClick={() => openDetail([entry])}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="divide-y divide-slate-100 lg:hidden">
              {displayed.map((entry) => (
                <article key={entry.id} className="space-y-2 p-4">
                  <p className="text-xs font-medium text-slate-600">
                    {dayLabel(entry.hari)} · {entry.slot_waktu_jam_mulai}–
                    {entry.slot_waktu_jam_selesai}
                  </p>
                  <h3 className="text-sm font-bold">{entry.mata_pelajaran_nama}</h3>
                  <p className="text-sm text-slate-700">
                    {entry.rombel_nama} · {entry.guru_nama}
                  </p>
                  {conflictIds.has(entry.id) && (
                    <p className="text-xs font-semibold text-rose-700">Bentrok · perlu diperiksa</p>
                  )}
                  <Button variant="outline" onClick={() => openDetail([entry])}>
                    Lihat detail
                  </Button>
                </article>
              ))}
            </div>
            {!displayed.length && (
              <p className="p-10 text-center text-sm text-slate-600">
                Tidak ada jadwal yang sesuai. Ubah pencarian atau filter.
              </p>
            )}
            <SchedulePagination
              total={listEntries.length}
              page={currentPage}
              size={size}
              onPage={setPage}
              onSize={(value) => {
                setSize(value);
                setPage(1);
              }}
            />
          </div>
        </>
      )}
      {selection && activeVersion && (
        <ScheduleEntryModal
          isOpen
          onClose={() => {
            setSelection(null);
            setEditing(undefined);
          }}
          versionId={activeVersion.id}
          versionName={activeVersion.nama}
          rombels={rombels}
          assignments={periodAssignments}
          timeSlots={timeSlots}
          entries={entries}
          selection={selection}
          entry={editing}
          onSuccess={(value) => refresh(value.message)}
        />
      )}
      {detail && (
        <ScheduleDialog title="Detail Jadwal Pelajaran" onClose={() => setDetail(null)}>
          <div className="space-y-4">
            {detail.map((entry) => (
              <article key={entry.id} className="space-y-2 rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-medium text-slate-600">
                  {dayLabel(entry.hari)} · {entry.slot_waktu_jam_mulai}–
                  {entry.slot_waktu_jam_selesai} · {entry.slot_waktu_nama}
                </p>
                <h3 className="font-bold">{entry.mata_pelajaran_nama}</h3>
                <p className="text-sm">
                  {entry.rombel_nama} · {entry.guru_nama}
                </p>
                <p className="text-sm text-slate-600">
                  Ruangan: {entry.ruangan || "Belum ditetapkan"}
                </p>
                {entry.catatan && (
                  <p className="text-sm whitespace-pre-wrap text-slate-600">{entry.catatan}</p>
                )}
                {conflictMap.get(entry.id)?.map((conflict, index) => (
                  <p key={index} className="rounded-lg bg-rose-50 p-2 text-xs text-rose-800">
                    {conflict.message}
                  </p>
                ))}
                {editable && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDetail(null);
                        setEditing(entry);
                        setSelection({});
                      }}
                    >
                      Ubah slot ini
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-rose-700"
                      onClick={() => {
                        setDetail(null);
                        setDeleting(entry);
                        setError("");
                      }}
                    >
                      Hapus slot ini
                    </Button>
                  </div>
                )}
              </article>
            ))}
            <p className="text-xs text-slate-600">
              Blok berurutan digabung hanya untuk tampilan. Perubahan dilakukan per alokasi JP.
            </p>
          </div>
        </ScheduleDialog>
      )}
      {deleting && (
        <ScheduleDialog
          title="Hapus Alokasi Jadwal?"
          onClose={() => setDeleting(null)}
          busy={pending}
        >
          <p className="mb-4 text-sm">
            Hapus {deleting.mata_pelajaran_nama} di {deleting.rombel_nama},{" "}
            {dayLabel(deleting.hari)} {deleting.slot_waktu_jam_mulai}? Tindakan ini tidak dapat
            dibatalkan.
          </p>
          {error && (
            <p role="alert" className="mb-3 text-sm text-rose-700">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleting(null)} disabled={pending}>
              Batal
            </Button>
            <Button
              variant="destructive"
              isLoading={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await deleteScheduleEntryAction(deleting.id);
                  if (result.success) {
                    setDeleting(null);
                    refresh(result.message);
                  } else setError(result.message);
                })
              }
            >
              Hapus jadwal
            </Button>
          </div>
        </ScheduleDialog>
      )}
      {createVersion && (
        <ScheduleDialog
          title="Buat Versi Jadwal"
          onClose={() => setCreateVersion(false)}
          busy={pending}
        >
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              startTransition(async () => {
                const result = await createScheduleVersionAction(null, form);
                if (result.success) {
                  setCreateVersion(false);
                  if (result.data?.id) setVersionId(result.data.id);
                  refresh(result.message);
                } else setError(result.message);
              });
            }}
          >
            {error && (
              <p role="alert" className="text-sm text-rose-700">
                {error}
              </p>
            )}
            <label className="block space-y-1 text-sm">
              Tahun ajaran
              <select name="tahun_ajaran_id" required className={fieldClass}>
                {academicYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.nama}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1 text-sm">
              Nama versi
              <input
                name="nama"
                minLength={2}
                maxLength={200}
                required
                className={fieldClass}
                placeholder="Jadwal semester ganjil revisi 2"
              />
            </label>
            <label className="block space-y-1 text-sm">
              Catatan
              <textarea name="catatan" maxLength={1000} className={fieldClass} />
            </label>
            <p className="text-xs text-slate-600">
              Versi baru dimulai sebagai draft kosong. Jadwal resmi tetap aktif sampai draft
              dipublikasikan.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => setCreateVersion(false)}
              >
                Batal
              </Button>
              <Button type="submit" variant="cobalt" isLoading={pending}>
                Buat Draft
              </Button>
            </div>
          </form>
        </ScheduleDialog>
      )}
      {publish && activeVersion && (
        <ScheduleDialog
          title="Publikasikan Jadwal"
          onClose={() => setPublish(false)}
          busy={pending}
        >
          <p className="mb-4 text-sm">
            Jadikan {activeVersion.nama} jadwal resmi? Versi terpublikasi sebelumnya pada tahun
            ajaran ini akan diarsipkan. Sistem memeriksa bentrok sebelum publikasi.
          </p>
          {error && (
            <p role="alert" className="mb-4 text-sm text-rose-700">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" disabled={pending} onClick={() => setPublish(false)}>
              Batal
            </Button>
            <Button
              variant="cobalt"
              isLoading={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await publishScheduleVersionAction(activeVersion.id);
                  if (result.success) {
                    setPublish(false);
                    refresh(result.message);
                  } else setError(result.message);
                })
              }
            >
              Publikasikan jadwal
            </Button>
          </div>
        </ScheduleDialog>
      )}
    </div>
  );
}
