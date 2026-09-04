/**
 * Ruang Pintar — M12 Class Session Attendance Service Unit & Integration Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { AttendanceService } from "@/modules/attendance/application/attendance-service";
import { AttendanceRepository } from "@/modules/attendance/infrastructure/attendance-repository";
import {
  AttendanceNotAllowedError,
  SessionNotFoundError,
} from "@/modules/attendance/domain/attendance-errors";
import { prisma } from "@/shared/infrastructure/database/prisma";
import * as auditLogger from "@/shared/infrastructure/audit/audit-logger";

vi.mock("@/shared/infrastructure/database/prisma", () => ({
  prisma: {
    sesiKelasAktual: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    guru: {
      findFirst: vi.fn(),
    },
    penempatanRombel: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    presensiSesiKelas: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(async (callback) => {
      return callback(prisma);
    }),
  },
}));

vi.mock("@/shared/infrastructure/audit/audit-logger", () => ({
  recordAuditEvent: vi.fn().mockResolvedValue({ id: "audit-123" }),
}));

describe("AttendanceService", () => {
  let repository: AttendanceRepository;
  let service: AttendanceService;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new AttendanceRepository();
    service = new AttendanceService(repository);
  });

  describe("getSessionAttendance", () => {
    it("throws SessionNotFoundError when session does not exist", async () => {
      vi.spyOn(repository, "findSessionWithStudents").mockResolvedValue(null);

      await expect(service.getSessionAttendance("invalid-id", "sekolah-1")).rejects.toThrow(
        SessionNotFoundError
      );
    });

    it("returns session attendance DTO with students when session exists", async () => {
      const mockResult: any = {
        sesi_id: "sesi-1",
        sekolah_id: "sekolah-1",
        rombel_nama: "X RPL 1",
        mata_pelajaran_nama: "Matematika",
        total_siswa: 2,
        jumlah_hadir: 2,
        persentase_kehadiran: 100,
        sudah_diabsen: false,
        daftar_siswa: [
          { siswa_id: "s-1", nama_lengkap: "Ahmad", status: "HADIR" },
          { siswa_id: "s-2", nama_lengkap: "Budi", status: "HADIR" },
        ],
      };

      vi.spyOn(repository, "findSessionWithStudents").mockResolvedValue(mockResult);

      const result = await service.getSessionAttendance("sesi-1", "sekolah-1");

      expect(result.sesi_id).toBe("sesi-1");
      expect(result.daftar_siswa.length).toBe(2);
      expect(result.persentase_kehadiran).toBe(100);
    });
  });

  describe("saveSessionAttendance", () => {
    const sampleInput = {
      sesi_kelas_id: "sesi-1",
      sekolah_id: "sekolah-1",
      items: [
        { siswa_id: "s-1", status: "HADIR" as const },
        { siswa_id: "s-2", status: "IZIN" as const, catatan: "Ada acara keluarga" },
      ],
      alasan_koreksi: "Koreksi data absen",
    };

    it("throws SessionNotFoundError if session not found in database", async () => {
      (prisma.sesiKelasAktual.findFirst as any).mockResolvedValue(null);

      await expect(
        service.saveSessionAttendance("user-1", "SUPER_ADMIN", sampleInput)
      ).rejects.toThrow(SessionNotFoundError);
    });

    it("throws AttendanceNotAllowedError if a TEACHER is neither the assigned nor substitute teacher", async () => {
      (prisma.sesiKelasAktual.findFirst as any).mockResolvedValue({
        id: "sesi-1",
        sekolah_id: "sekolah-1",
        guru_id: "guru-authorized",
        guru_pengganti_id: null,
      });

      (prisma.guru.findFirst as any).mockResolvedValue({
        id: "guru-unauthorized",
        pengguna_id: "user-teacher",
      });

      await expect(
        service.saveSessionAttendance("user-teacher", "TEACHER", sampleInput)
      ).rejects.toThrow(AttendanceNotAllowedError);
    });

    it("allows assigned TEACHER to save attendance and records audit event", async () => {
      (prisma.sesiKelasAktual.findFirst as any).mockResolvedValue({
        id: "sesi-1",
        sekolah_id: "sekolah-1",
        guru_id: "guru-authorized",
        guru_pengganti_id: null,
      });

      (prisma.guru.findFirst as any).mockResolvedValue({
        id: "guru-authorized",
        pengguna_id: "user-teacher",
      });

      vi.spyOn(repository, "saveSessionAttendance").mockResolvedValue({
        total_siswa: 2,
        jumlah_hadir: 1,
        jumlah_izin: 1,
        jumlah_sakit: 0,
        jumlah_alpha: 0,
        jumlah_dispensasi: 0,
        jumlah_terlambat: 0,
        persentase_kehadiran: 50,
        sudah_diabsen: true,
      });

      const summary = await service.saveSessionAttendance("user-teacher", "TEACHER", sampleInput);

      expect(summary.total_siswa).toBe(2);
      expect(summary.jumlah_hadir).toBe(1);
      expect(summary.jumlah_izin).toBe(1);
      expect(summary.persentase_kehadiran).toBe(50);
      expect(auditLogger.recordAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          tipe_sumber: "PRESENSI_SESI_KELAS",
          aksi: "RECORD_CLASS_ATTENDANCE",
          aktor_id: "user-teacher",
        })
      );
    });

    it("allows SUPER_ADMIN to save attendance directly", async () => {
      (prisma.sesiKelasAktual.findFirst as any).mockResolvedValue({
        id: "sesi-1",
        sekolah_id: "sekolah-1",
        guru_id: "guru-other",
        guru_pengganti_id: null,
      });

      vi.spyOn(repository, "saveSessionAttendance").mockResolvedValue({
        total_siswa: 2,
        jumlah_hadir: 2,
        jumlah_izin: 0,
        jumlah_sakit: 0,
        jumlah_alpha: 0,
        jumlah_dispensasi: 0,
        jumlah_terlambat: 0,
        persentase_kehadiran: 100,
        sudah_diabsen: true,
      });

      const summary = await service.saveSessionAttendance("user-admin", "SUPER_ADMIN", sampleInput);

      expect(summary.persentase_kehadiran).toBe(100);
      expect(auditLogger.recordAuditEvent).toHaveBeenCalled();
    });
  });

  describe("getAssignmentAttendanceHistory", () => {
    it("delegates to repository getTeachingAssignmentAttendanceHistory", async () => {
      const mockHistory: any = [
        {
          sesi_id: "sesi-1",
          tanggal: new Date(),
          status_sesi: "DIMULAI",
          total_siswa: 30,
          jumlah_hadir: 28,
          persentase_kehadiran: 93,
          sudah_diabsen: true,
        },
      ];

      vi.spyOn(repository, "getTeachingAssignmentAttendanceHistory").mockResolvedValue(mockHistory);

      const history = await service.getAssignmentAttendanceHistory("penugasan-1", "sekolah-1");

      expect(history.length).toBe(1);
      expect(history[0].persentase_kehadiran).toBe(93);
    });
  });
});
