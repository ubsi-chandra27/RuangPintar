import { beforeEach, describe, expect, it, vi } from "vitest";
import { ScheduleService } from "@/modules/schedule/application/schedule-service";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { recordAuditEvent } from "@/shared/infrastructure/audit/audit-logger";
import { createScheduleEntryAction } from "@/app/actions/schedule-actions";
import { requirePermission } from "@/shared/infrastructure/authorization/authz-guard";

vi.mock("@/shared/infrastructure/database/prisma", () => ({
  prisma: { penugasanMengajar: { findFirst: vi.fn() }, slotWaktu: { findFirst: vi.fn() } },
}));
vi.mock("@/shared/infrastructure/audit/audit-logger", () => ({ recordAuditEvent: vi.fn() }));
vi.mock("@/shared/infrastructure/authorization/authz-guard", () => ({
  requirePermission: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const input = {
  sekolah_id: "school",
  versi_jadwal_id: "version",
  rombel_id: "class",
  penugasan_mengajar_id: "assignment",
  slot_waktu_id: "regular",
  hari: "SENIN" as const,
};
const regular = {
  id: "regular",
  kode: "REG_1",
  nama: "JP 1",
  urutan: 1,
  jam_mulai: "06:30",
  jam_selesai: "07:15",
  status_aktif: true,
  is_istirahat: false,
  is_upacara: false,
  hari_khusus: null,
};
const special = { ...regular, id: "wednesday", hari_khusus: "RABU" };
const existing = {
  id: "entry",
  ...input,
  guru_id: "teacher",
  guru_nama: "Guru A",
  rombel_nama: "X RPL",
  mata_pelajaran_nama: "Matematika",
  slot_waktu_nama: "JP 1",
  slot_waktu_jam_mulai: "06:30",
  slot_waktu_jam_selesai: "07:15",
};
const makeRepo = () => ({
  findVersionById: vi.fn().mockResolvedValue({
    id: "version",
    sekolah_id: "school",
    tahun_ajaran_id: "year",
    status: "DRAFT",
  }),
  findEntryById: vi.fn().mockResolvedValue(existing),
  listTimeSlots: vi.fn().mockResolvedValue([regular, special]),
  listEntriesByVersion: vi.fn().mockResolvedValue([]),
  createEntry: vi.fn().mockResolvedValue(existing),
  updateEntry: vi.fn().mockResolvedValue(existing),
  deleteEntry: vi.fn(),
  publishVersion: vi.fn(),
});

describe("Guard penyusunan jadwal di server", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.penugasanMengajar.findFirst).mockResolvedValue({
      id: "assignment",
      tahun_ajaran_id: "year",
      rombel_id: "class",
      guru_id: "teacher",
      mata_pelajaran_id: "subject",
      guru: { nama_lengkap: "Guru A" },
      rombel: { nama: "X RPL" },
    } as never);
    vi.mocked(prisma.slotWaktu.findFirst).mockResolvedValue(regular as never);
  });
  it("menolak slot reguler pada hari dengan pola khusus sebelum menulis", async () => {
    const repo = makeRepo();
    const service = new ScheduleService(repo as never);
    await expect(
      service.createScheduleEntry("actor", "SUPER_ADMIN", { ...input, hari: "RABU" })
    ).rejects.toThrow("sesuai pola");
    expect(repo.createEntry).not.toHaveBeenCalled();
  });
  it("menolak slot istirahat dan nonaktif", async () => {
    const repo = makeRepo();
    const service = new ScheduleService(repo as never);
    vi.mocked(prisma.slotWaktu.findFirst).mockResolvedValue({
      ...regular,
      is_istirahat: true,
    } as never);
    await expect(service.createScheduleEntry("actor", "SUPER_ADMIN", input)).rejects.toThrow(
      "slot KBM"
    );
    vi.mocked(prisma.slotWaktu.findFirst).mockResolvedValue(regular as never);
    repo.listTimeSlots.mockResolvedValue([{ ...regular, status_aktif: false }, special]);
    await expect(service.createScheduleEntry("actor", "SUPER_ADMIN", input)).rejects.toThrow(
      "slot KBM"
    );
  });
  it("menolak perubahan arsip dan ID edit di luar versi atau sekolah", async () => {
    const repo = makeRepo();
    const service = new ScheduleService(repo as never);
    repo.findVersionById.mockResolvedValue({
      ...(await repo.findVersionById()),
      status: "ARCHIVED",
    });
    await expect(
      service.createScheduleEntry("actor", "SUPER_ADMIN", input, "entry")
    ).rejects.toThrow("arsip");
    repo.findVersionById.mockResolvedValue({
      id: "version",
      sekolah_id: "school",
      tahun_ajaran_id: "year",
      status: "DRAFT",
    });
    repo.findEntryById.mockResolvedValue(null as never);
    await expect(
      service.createScheduleEntry("actor", "SUPER_ADMIN", input, "foreign-entry")
    ).rejects.toThrow();
    expect(repo.findEntryById).toHaveBeenCalledWith("foreign-entry", "school");
    expect(repo.updateEntry).not.toHaveBeenCalled();
  });
  it("menolak penugasan dari tahun ajaran lain", async () => {
    const repo = makeRepo();
    const service = new ScheduleService(repo as never);
    repo.findVersionById.mockResolvedValue({
      id: "version",
      sekolah_id: "school",
      tahun_ajaran_id: "other",
      status: "DRAFT",
    });
    await expect(service.createScheduleEntry("actor", "SUPER_ADMIN", input)).rejects.toThrow(
      "Periode penugasan"
    );
  });
  it("edit mempertahankan ID, mengecualikan entri sendiri, dan mencatat audit", async () => {
    const repo = makeRepo();
    const service = new ScheduleService(repo as never);
    repo.listEntriesByVersion.mockResolvedValue([existing] as never);
    await service.createScheduleEntry("actor", "SUPER_ADMIN", input, "entry");
    expect(repo.updateEntry).toHaveBeenCalledWith(
      "entry",
      expect.objectContaining(input),
      expect.objectContaining({ tahun_ajaran_id: "year" })
    );
    expect(repo.createEntry).not.toHaveBeenCalled();
    expect(recordAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({ aksi: "UPDATE_SCHEDULE_ENTRY", payload_sebelum: existing })
    );
  });
  it("bentrok lintas slot ditolak saat simpan dan sebelum publikasi", async () => {
    const repo = makeRepo();
    const service = new ScheduleService(repo as never);
    const conflicting = {
      ...existing,
      id: "other",
      slot_waktu_id: "different-id",
      rombel_id: "other-class",
      slot_waktu_jam_mulai: "07:00",
      slot_waktu_jam_selesai: "08:00",
    };
    repo.listEntriesByVersion.mockResolvedValue([conflicting] as never);
    await expect(service.createScheduleEntry("actor", "SUPER_ADMIN", input)).rejects.toThrow(
      "Konflik Guru"
    );
    repo.listEntriesByVersion.mockResolvedValue([existing, conflicting] as never);
    await expect(
      service.publishVersion("actor", "SUPER_ADMIN", "Admin", "version", "school")
    ).rejects.toThrow("Konflik Guru");
    expect(repo.publishVersion).not.toHaveBeenCalled();
  });
  it("server action tetap default deny meskipun entry_id dipalsukan", async () => {
    vi.mocked(requirePermission).mockRejectedValue(new Error("Akses ditolak"));
    const form = new FormData();
    form.set("entry_id", "entry");
    expect(await createScheduleEntryAction(null, form)).toEqual({
      success: false,
      message: "Akses ditolak",
    });
    expect(requirePermission).toHaveBeenCalledWith("schedule.master.manage");
    expect(prisma.penugasanMengajar.findFirst).not.toHaveBeenCalled();
  });
});
