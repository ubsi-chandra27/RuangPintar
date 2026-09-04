import React from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { slotsForDay } from "@/modules/schedule/domain/time-slot-policy";
import { buildScheduleBlocks } from "@/modules/schedule/domain/schedule-board";
import { ScheduleConflictDetector } from "@/modules/schedule/domain/conflict-detector";
import { ScheduleBoardView } from "@/modules/schedule/presentation/schedule-board-view";
import { TimeSlotsView } from "@/modules/schedule/presentation/time-slots-view";
import { ScheduleEntryModal } from "@/modules/schedule/presentation/schedule-entry-modal";
import { ScheduleDialog } from "@/modules/schedule/presentation/schedule-ui";
import type { ScheduleEntryDTO, TimeSlotDTO } from "@/modules/schedule/domain/schedule-types";
import type { TeachingAssignmentDTO } from "@/modules/teacher/domain/teacher-types";

vi.mock("@/app/actions/schedule-actions", () => ({
  createScheduleEntryAction: vi.fn(),
  createTimeSlotAction: vi.fn(),
  seedTimeSlotsAction: vi.fn(),
}));
const slot = (
  id: string,
  start: string,
  end: string,
  extra: Partial<TimeSlotDTO> = {}
): TimeSlotDTO => ({
  id,
  kode: id,
  nama: `Jam ${id}`,
  sekolah_id: "school",
  urutan: 1,
  jam_mulai: start,
  jam_selesai: end,
  is_istirahat: false,
  is_upacara: false,
  status_aktif: true,
  created_at: new Date(),
  updated_at: new Date(),
  ...extra,
});
const regular = slot("REG_1", "06:30", "07:15");
const next = slot("REG_2", "07:15", "08:00");
const rest = slot("REST", "08:00", "08:20", { is_istirahat: true, urutan: 5 });
const wednesday = slot("RABU_1", "06:30", "07:10", { hari_khusus: "RABU", urutan: 201 });
const makeEntry = (
  id: string,
  s: TimeSlotDTO,
  extra: Partial<ScheduleEntryDTO> = {}
): ScheduleEntryDTO => ({
  id,
  sekolah_id: "school",
  versi_jadwal_id: "version",
  tahun_ajaran_id: "year",
  rombel_id: "class",
  rombel_nama: "X RPL",
  penugasan_mengajar_id: "assignment",
  guru_id: "teacher",
  guru_nama: "Guru A",
  mata_pelajaran_id: "subject",
  mata_pelajaran_nama: "Matematika",
  mata_pelajaran_kode: "MTK",
  slot_waktu_id: s.id,
  slot_waktu_nama: s.nama,
  slot_waktu_jam_mulai: s.jam_mulai,
  slot_waktu_jam_selesai: s.jam_selesai,
  slot_waktu_urutan: s.urutan,
  hari: "SENIN",
  created_at: new Date(),
  updated_at: new Date(),
  ...extra,
});

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});

describe("Pola slot dan papan mingguan", () => {
  it("Escape menutup dialog dan tidak mengirim form", () => {
    const onClose = vi.fn();
    render(
      <ScheduleDialog title="Uji dialog" onClose={onClose}>
        <input aria-label="Isian" />
      </ScheduleDialog>
    );
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Isian" }), { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });
  it("memakai pola hari khusus, tanpa mencampur reguler atau slot nonaktif", () => {
    const slots = [
      next,
      wednesday,
      regular,
      rest,
      slot("OFF", "05:00", "06:00", { status_aktif: false }),
    ];
    expect(slotsForDay(slots, "RABU").map((s) => s.id)).toEqual(["RABU_1"]);
    expect(slotsForDay(slots, "SENIN").map((s) => s.id)).toEqual(["REG_1", "REG_2", "REST"]);
    expect(slotsForDay(slots, "KAMIS").map((s) => s.id)).toEqual(["REG_1", "REG_2", "REST"]);
  });
  it("menggabungkan JP berurutan tetapi memisahkan istirahat, guru/penugasan berbeda, dan konflik", () => {
    const e1 = makeEntry("e1", regular),
      e2 = makeEntry("e2", next);
    const blocks = buildScheduleBlocks([regular, next, rest], [e1, e2], new Set());
    expect(blocks[0].entries.map((e) => e.id)).toEqual(["e1", "e2"]);
    expect(blocks[1].entries).toHaveLength(0);
    expect(
      buildScheduleBlocks(
        [regular, next],
        [e1, { ...e2, penugasan_mengajar_id: "other" }],
        new Set()
      )
    ).toHaveLength(2);
    expect(buildScheduleBlocks([regular, next], [e1, e2], new Set(["e2"]))).toHaveLength(2);
    const afterBreak = slot("NEXT", "08:20", "09:00");
    expect(
      buildScheduleBlocks([next, rest, afterBreak], [e2, makeEntry("e3", afterBreak)], new Set())
    ).toHaveLength(3);
  });
  it("mendeteksi overlap lintas ID, ruangan, batas waktu, dan exclude saat edit", () => {
    const existing = makeEntry("e1", regular, { ruangan: "Lab 1" });
    const target = makeEntry("e2", slot("OVERLAP", "07:00", "08:00"), {
      rombel_id: "other",
      ruangan: " lab 1 ",
    });
    expect(ScheduleConflictDetector.checkConflict(target, [existing]).map((c) => c.type)).toEqual([
      "SLOT_CONFLICT",
      "TEACHER_CONFLICT",
    ]);
    expect(ScheduleConflictDetector.checkConflict(makeEntry("e3", next), [existing])).toEqual([]);
    expect(
      ScheduleConflictDetector.checkConflict({ ...existing, excludeEntryId: "e1" }, [existing])
    ).toEqual([]);
  });
  it("klik slot kosong meneruskan konteks rombel, hari, dan slot", () => {
    const onCreate = vi.fn();
    render(
      <ScheduleBoardView
        entries={[]}
        timeSlots={[regular, wednesday]}
        conflictIds={new Set()}
        canManage
        rombelId="class"
        onCreate={onCreate}
        onDetail={vi.fn()}
      />
    );
    const section = within(screen.getByRole("region", { name: "Jadwal Senin" }));
    fireEvent.click(section.getByRole("button", { name: /Isi jadwal/ }));
    expect(onCreate).toHaveBeenCalledWith({
      rombelId: "class",
      teacherId: undefined,
      day: "SENIN",
      slotId: "REG_1",
    });
  });
  it("klik slot kosong pada tampilan guru meneruskan konteks guru, hari, dan slot", () => {
    const onCreate = vi.fn();
    render(
      <ScheduleBoardView
        entries={[]}
        timeSlots={[regular, wednesday]}
        conflictIds={new Set()}
        canManage
        teacherId="teacher_1"
        onCreate={onCreate}
        onDetail={vi.fn()}
      />
    );
    const section = within(screen.getByRole("region", { name: "Jadwal Senin" }));
    fireEvent.click(section.getByRole("button", { name: /Isi jadwal/ }));
    expect(onCreate).toHaveBeenCalledWith({
      rombelId: undefined,
      teacherId: "teacher_1",
      day: "SENIN",
      slotId: "REG_1",
    });
  });
  it("pengguna baca saja tidak bisa menambahkan dari slot kosong", () => {
    render(
      <ScheduleBoardView
        entries={[]}
        timeSlots={[regular]}
        conflictIds={new Set()}
        canManage={false}
        rombelId="class"
        onCreate={vi.fn()}
        onDetail={vi.fn()}
      />
    );
    expect(
      within(screen.getByRole("region", { name: "Jadwal Senin" })).getByRole("button")
    ).toBeDisabled();
  });
  it("nomor baris dimulai 1 pada pola Rabu, bukan 201, dan istirahat diurutkan menurut jam", () => {
    render(<TimeSlotsView initialTimeSlots={[next, rest, regular, wednesday]} canManage={false} />);
    const table = within(screen.getByRole("table"));
    expect(table.getAllByRole("row")[1]).toHaveTextContent("Jam REG_1");
    fireEvent.click(screen.getByRole("button", { name: /^Rabu/ }));
    const row = table.getAllByRole("row")[1];
    expect(within(row).getAllByRole("cell")[0]).toHaveTextContent(/^1$/);
    expect(row).not.toHaveTextContent("201");
    expect(row).toHaveTextContent("40 menit");
  });
  it("form mengisi konteks klik dan mengganti pilihan slot saat hari berubah", () => {
    render(
      <ScheduleEntryModal
        isOpen
        onClose={vi.fn()}
        versionId="version"
        versionName="Draft"
        rombels={[{ id: "class", nama: "X RPL" }]}
        assignments={[]}
        timeSlots={[regular, wednesday, rest]}
        selection={{ rombelId: "class", day: "RABU", slotId: wednesday.id }}
        onSuccess={vi.fn()}
      />
    );
    expect(screen.getByLabelText("Hari pembelajaran")).toHaveValue("RABU");
    expect(screen.getByLabelText("Slot jam pelajaran")).toHaveValue("RABU_1");
    fireEvent.change(screen.getByLabelText("Hari pembelajaran"), { target: { value: "SENIN" } });
    expect(screen.getByLabelText("Slot jam pelajaran")).toHaveValue("REG_1");
    expect(
      within(screen.getByLabelText("Slot jam pelajaran")).queryByRole("option", { name: /REST/ })
    ).not.toBeInTheDocument();
  });
  it("menampilkan bentrok di form dan mencegah submit", () => {
    const assignment = {
      id: "assignment",
      rombel_id: "class",
      rombel_nama: "X RPL",
      status: "AKTIF",
      guru_id: "teacher",
      guru_nama: "Guru A",
      mata_pelajaran_nama: "Matematika",
      jumlah_jam_minggu: 2,
    } as TeachingAssignmentDTO;
    render(
      <ScheduleEntryModal
        isOpen
        onClose={vi.fn()}
        versionId="version"
        versionName="Draft"
        rombels={[{ id: "class", nama: "X RPL" }]}
        assignments={[assignment]}
        timeSlots={[regular]}
        entries={[makeEntry("e1", regular, { rombel_id: "other", rombel_nama: "XI RPL" })]}
        onSuccess={vi.fn()}
      />
    );
    fireEvent.change(screen.getByLabelText("Mata pelajaran dan guru"), {
      target: { value: "assignment" },
    });
    expect(screen.getByRole("alert")).toHaveTextContent("XI RPL");
    expect(screen.getByRole("button", { name: "Simpan Jadwal" })).toBeDisabled();
  });
  it("form mengisi otomatis rombel dan penugasan ketika dibuka dari konteks guru", () => {
    const assignment = {
      id: "assignment_guru_1",
      rombel_id: "class_x",
      rombel_nama: "X TKRO 1",
      status: "AKTIF",
      guru_id: "teacher_1",
      guru_nama: "Eri Chandra A",
      mata_pelajaran_nama: "Pemeliharaan Mesin",
      jumlah_jam_minggu: 4,
    } as TeachingAssignmentDTO;
    render(
      <ScheduleEntryModal
        isOpen
        onClose={vi.fn()}
        versionId="version"
        versionName="Draft"
        rombels={[
          { id: "class_dummy", nama: "X RPL 1" },
          { id: "class_x", nama: "X TKRO 1" },
        ]}
        assignments={[assignment]}
        timeSlots={[regular, next]}
        selection={{ teacherId: "teacher_1", day: "SELASA", slotId: next.id }}
        onSuccess={vi.fn()}
      />
    );
    expect(screen.getByLabelText("Rombongan belajar")).toHaveValue("class_x");
    expect(screen.getByLabelText("Mata pelajaran dan guru")).toHaveValue("assignment_guru_1");
    expect(screen.getByLabelText("Hari pembelajaran")).toHaveValue("SELASA");
    expect(screen.getByLabelText("Slot jam pelajaran")).toHaveValue("REG_2");
  });
});
