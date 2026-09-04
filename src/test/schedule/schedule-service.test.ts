/**
 * Ruang Pintar — M10 Master Schedule Application Service Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { ScheduleService } from "@/modules/schedule/application/schedule-service";
import { ScheduleVersionNotFoundError } from "@/modules/schedule/domain/schedule-errors";

vi.mock("@/shared/infrastructure/audit/audit-logger", () => ({
  recordAuditEvent: vi.fn().mockResolvedValue({ id: "AUDIT_01" }),
}));

vi.mock("@/shared/infrastructure/database/prisma", () => ({
  prisma: {
    penugasanMengajar: {
      findFirst: vi.fn(),
    },
    slotWaktu: {
      findFirst: vi.fn(),
    },
  },
}));

describe("M10 Master Schedule Service", () => {
  let mockRepo: any;
  let service: ScheduleService;

  beforeEach(() => {
    mockRepo = {
      listVersions: vi.fn(),
      findVersionById: vi.fn(),
      getPublishedVersion: vi.fn(),
      createVersion: vi.fn(),
      publishVersion: vi.fn(),
      listEntriesByVersion: vi.fn(),
      listEntriesByTeacher: vi.fn(),
      findEntryById: vi.fn(),
      createEntry: vi.fn(),
      deleteEntry: vi.fn(),
    };
    service = new ScheduleService(mockRepo);
  });

  describe("Schedule Versions & Publication", () => {
    it("should list schedule versions for school", async () => {
      const mockVersions = [
        {
          id: "VER_01",
          nama: "Jadwal Ganjil v1",
          status: "DRAFT",
        },
      ];
      mockRepo.listVersions.mockResolvedValue(mockVersions);

      const res = await service.listVersions("SCH_01");
      expect(res).toEqual(mockVersions);
      expect(mockRepo.listVersions).toHaveBeenCalledWith("SCH_01", undefined);
    });

    it("should throw ScheduleVersionNotFoundError when version does not exist", async () => {
      mockRepo.findVersionById.mockResolvedValue(null);

      await expect(service.getVersionById("NON_EXIST", "SCH_01")).rejects.toThrow(
        ScheduleVersionNotFoundError
      );
    });

    it("should publish a draft schedule version", async () => {
      const draftVersion = {
        id: "VER_01",
        nama: "Jadwal Ganjil v1",
        status: "DRAFT",
      };
      const publishedVersion = {
        ...draftVersion,
        status: "PUBLISHED",
      };

      mockRepo.findVersionById.mockResolvedValue(draftVersion);
      mockRepo.listEntriesByVersion.mockResolvedValue([{ id: "ENTRY_01", hari: "SENIN" }]);
      mockRepo.publishVersion.mockResolvedValue(publishedVersion);

      const res = await service.publishVersion(
        "ADMIN_01",
        "SUPER_ADMIN",
        "Admin",
        "VER_01",
        "SCH_01"
      );

      expect(res.status).toBe("PUBLISHED");
      expect(mockRepo.publishVersion).toHaveBeenCalledWith("VER_01", "SCH_01", "Admin");
    });
  });
});
