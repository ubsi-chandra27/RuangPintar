/**
 * Ruang Pintar — M09 Academic Calendar Service & Validation Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { CalendarService } from "@/modules/calendar/application/calendar-service";
import { CreateCalendarEventSchema } from "@/modules/calendar/domain/calendar-validation";
import { CalendarEventNotFoundError } from "@/modules/calendar/domain/calendar-errors";

vi.mock("@/shared/infrastructure/audit/audit-logger", () => ({
  recordAuditEvent: vi.fn().mockResolvedValue({ id: "AUDIT_01" }),
}));

describe("M09 Academic Calendar Module", () => {
  let mockRepo: any;
  let service: CalendarService;

  beforeEach(() => {
    mockRepo = {
      listBySchool: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    service = new CalendarService(mockRepo);
  });

  describe("Calendar Validation Schema", () => {
    it("should accept a valid calendar event", () => {
      const valid = {
        sekolah_id: "SCH_01",
        tahun_ajaran_id: "TA_01",
        judul: "Masa Pengenalan Lingkungan Sekolah",
        tipe_event: "ORIENTASI" as const,
        tanggal_mulai: new Date("2026-07-15"),
        tanggal_selesai: new Date("2026-07-18"),
        libur_kbm: false,
      };

      const result = CreateCalendarEventSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject when tanggal_selesai is before tanggal_mulai", () => {
      const invalid = {
        sekolah_id: "SCH_01",
        tahun_ajaran_id: "TA_01",
        judul: "Libur Semester",
        tipe_event: "HARI_LIBUR" as const,
        tanggal_mulai: new Date("2026-07-20"),
        tanggal_selesai: new Date("2026-07-10"),
      };

      const result = CreateCalendarEventSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("Calendar Application Service", () => {
    it("should list calendar events for a school", async () => {
      const mockEvents = [
        {
          id: "EVT_01",
          sekolah_id: "SCH_01",
          judul: "MPLS 2026",
          tipe_event: "ORIENTASI",
          tanggal_mulai: new Date("2026-07-15"),
          tanggal_selesai: new Date("2026-07-18"),
        },
      ];
      mockRepo.listBySchool.mockResolvedValue(mockEvents);

      const res = await service.listEvents("SCH_01");
      expect(res).toEqual(mockEvents);
      expect(mockRepo.listBySchool).toHaveBeenCalledWith("SCH_01", undefined);
    });

    it("should throw CalendarEventNotFoundError when event not found", async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.getEventById("NON_EXIST", "SCH_01")).rejects.toThrow(
        CalendarEventNotFoundError
      );
    });
  });
});
