/**
 * Ruang Pintar — M10 Class Session Service Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { ClassSessionService } from "@/modules/schedule/application/class-session-service";
import { InvalidSessionStateTransitionError } from "@/modules/schedule/domain/schedule-errors";

vi.mock("@/shared/infrastructure/audit/audit-logger", () => ({
  recordAuditEvent: vi.fn().mockResolvedValue({ id: "AUDIT_01" }),
}));

describe("M10 Class Session Application Service", () => {
  let mockRepo: any;
  let service: ClassSessionService;

  beforeEach(() => {
    mockRepo = {
      findSessionById: vi.fn(),
      listSessions: vi.fn(),
      openClassSession: vi.fn(),
      closeClassSession: vi.fn(),
    };
    service = new ClassSessionService(mockRepo);
  });

  describe("Close Session Lifecycle", () => {
    it("should close an active DIMULAI session", async () => {
      const activeSession = {
        id: "SESI_01",
        sekolah_id: "SCH_01",
        rombel_nama: "X RPL 1",
        mata_pelajaran_nama: "Pemrograman Dasar",
        status: "DIMULAI",
      };
      const closedSession = {
        ...activeSession,
        status: "SELESAI",
        jam_selesai_aktual: new Date(),
      };

      mockRepo.findSessionById.mockResolvedValue(activeSession);
      mockRepo.closeClassSession.mockResolvedValue(closedSession);

      const result = await service.closeSession("USER_01", "TEACHER", "SESI_01", "SCH_01");

      expect(result.status).toBe("SELESAI");
      expect(mockRepo.closeClassSession).toHaveBeenCalledWith("SESI_01", "SCH_01", undefined);
    });

    it("should return early if session is already SELESAI", async () => {
      const finishedSession = {
        id: "SESI_01",
        sekolah_id: "SCH_01",
        status: "SELESAI",
      };
      mockRepo.findSessionById.mockResolvedValue(finishedSession);

      const result = await service.closeSession("USER_01", "TEACHER", "SESI_01", "SCH_01");
      expect(result.status).toBe("SELESAI");
      expect(mockRepo.closeClassSession).not.toHaveBeenCalled();
    });

    it("should throw InvalidSessionStateTransitionError when closing a DIBATALKAN session", async () => {
      const cancelledSession = {
        id: "SESI_01",
        sekolah_id: "SCH_01",
        status: "DIBATALKAN",
      };
      mockRepo.findSessionById.mockResolvedValue(cancelledSession);

      await expect(service.closeSession("USER_01", "TEACHER", "SESI_01", "SCH_01")).rejects.toThrow(
        InvalidSessionStateTransitionError
      );
    });
  });
});
