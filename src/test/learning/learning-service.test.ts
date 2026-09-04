/**
 * Ruang Pintar — M11 Learning Application Service Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { LearningService } from "@/modules/learning/application/learning-service";
import { TeacherClassAccessDeniedError } from "@/modules/learning/domain/learning-errors";

vi.mock("@/shared/infrastructure/audit/audit-logger", () => ({
  recordAuditEvent: vi.fn().mockResolvedValue({ id: "AUDIT_TEST" }),
}));

describe("M11 Learning Application Service", () => {
  let mockRepo: any;
  let service: LearningService;

  beforeEach(() => {
    mockRepo = {
      listTeacherClasses: vi.fn(),
      getTeacherClassWorkspace: vi.fn(),
      createLingkupMateri: vi.fn(),
      updateLingkupMateri: vi.fn(),
      deleteLingkupMateri: vi.fn(),
      createTujuanPembelajaran: vi.fn(),
      updateTujuanPembelajaran: vi.fn(),
      deleteTujuanPembelajaran: vi.fn(),
      createMateri: vi.fn(),
      deleteMateri: vi.fn(),
      createTugas: vi.fn(),
      deleteTugas: vi.fn(),
      createAdministrasi: vi.fn(),
      deleteAdministrasi: vi.fn(),
    };
    service = new LearningService(mockRepo);
  });

  describe("Teacher Classes Directory & Workspace Access", () => {
    it("should list teacher classes via repository", async () => {
      const mockClasses = [
        {
          id: "PENUGASAN_01",
          guru_id: "GURU_01",
          rombel_id: "R_01",
          rombel_nama: "X RPL 1",
          mata_pelajaran_nama: "Informatika",
          mata_pelajaran_kode: "INF",
          jumlah_jam_minggu: 4,
          total_siswa: 36,
          total_bab: 3,
        },
      ];
      mockRepo.listTeacherClasses.mockResolvedValue(mockClasses);

      const res = await service.listTeacherClasses("SCH_01", "GURU_01");
      expect(res).toEqual(mockClasses);
      expect(mockRepo.listTeacherClasses).toHaveBeenCalledWith("SCH_01", "GURU_01");
    });

    it("should return workspace when teacher is the assigned teacher", async () => {
      const mockWorkspace = {
        penugasan: {
          id: "PENUGASAN_01",
          guru_id: "GURU_01",
          guru_nama: "Pak Budi",
          rombel_nama: "X RPL 1",
          mata_pelajaran_nama: "Informatika",
        },
        total_siswa: 36,
        lingkup_materi: [],
        materi_list: [],
        tugas_list: [],
        administrasi_list: [],
        jadwal_list: [],
      };
      mockRepo.getTeacherClassWorkspace.mockResolvedValue(mockWorkspace);

      const res = await service.getClassWorkspace("PENUGASAN_01", "SCH_01", "GURU_01", false);
      expect(res).toEqual(mockWorkspace);
    });

    it("should deny access when teacher is NOT the assigned teacher", async () => {
      const mockWorkspace = {
        penugasan: {
          id: "PENUGASAN_01",
          guru_id: "GURU_01",
          guru_nama: "Pak Budi",
          rombel_nama: "X RPL 1",
          mata_pelajaran_nama: "Informatika",
        },
      };
      mockRepo.getTeacherClassWorkspace.mockResolvedValue(mockWorkspace);

      await expect(
        service.getClassWorkspace("PENUGASAN_01", "SCH_01", "GURU_OTHER", false)
      ).rejects.toThrow(TeacherClassAccessDeniedError);
    });

    it("should allow Super Admin to access workspace even if not the assigned teacher", async () => {
      const mockWorkspace = {
        penugasan: {
          id: "PENUGASAN_01",
          guru_id: "GURU_01",
          rombel_nama: "X RPL 1",
          mata_pelajaran_nama: "Informatika",
        },
      };
      mockRepo.getTeacherClassWorkspace.mockResolvedValue(mockWorkspace);

      const res = await service.getClassWorkspace("PENUGASAN_01", "SCH_01", null, true);
      expect(res).toEqual(mockWorkspace);
    });
  });

  describe("Lingkup Materi (BAB) Operations", () => {
    it("should create Lingkup Materi with valid input", async () => {
      const input = {
        sekolah_id: "SCH_01",
        penugasan_mengajar_id: "PENUGASAN_01",
        kode: "BAB 1",
        judul: "Berpikir Komputasional",
        deskripsi: "Konsep dasar algoritma",
        urutan: 1,
      };

      const mockCreated = { id: "LM_01", ...input, status: "AKTIF" };
      mockRepo.createLingkupMateri.mockResolvedValue(mockCreated);

      const res = await service.createLingkupMateri("USER_01", "TEACHER", input);
      expect(res).toEqual(mockCreated);
      expect(mockRepo.createLingkupMateri).toHaveBeenCalled();
    });

    it("should reject creating BAB with empty judul", async () => {
      const input = {
        sekolah_id: "SCH_01",
        penugasan_mengajar_id: "PENUGASAN_01",
        judul: "",
      };

      await expect(
        service.createLingkupMateri("USER_01", "TEACHER", input as any)
      ).rejects.toThrow();
    });
  });

  describe("Tujuan Pembelajaran (TP) Operations", () => {
    it("should create Tujuan Pembelajaran with valid input", async () => {
      const input = {
        sekolah_id: "SCH_01",
        lingkup_materi_id: "LM_01",
        kode: "TP 1.1",
        deskripsi: "Peserta didik mampu menjelaskan konsep dekomposisi persoalan",
        urutan: 1,
      };

      const mockCreated = { id: "TP_01", ...input, status: "AKTIF" };
      mockRepo.createTujuanPembelajaran.mockResolvedValue(mockCreated);

      const res = await service.createTujuanPembelajaran("USER_01", "TEACHER", input);
      expect(res).toEqual(mockCreated);
    });
  });

  describe("Administrasi Pembelajaran (Jurnal KBM) Operations", () => {
    it("should create Administrasi Pembelajaran with associated TPs", async () => {
      const input = {
        sekolah_id: "SCH_01",
        penugasan_mengajar_id: "PENUGASAN_01",
        guru_id: "GURU_01",
        tanggal: new Date(),
        pertemuan_ke: 1,
        materi_disampaikan: "Pengenalan Sintaks Dasar",
        kegiatan_pembelajaran: "Praktikum di lab komputer",
        catatan_refleksi: "Siswa aktif berdiskusi",
        status_realisasi: "TERLAKSANA" as const,
        tp_ids: ["TP_01", "TP_02"],
      };

      const mockCreated = { id: "ADM_01", ...input };
      mockRepo.createAdministrasi.mockResolvedValue(mockCreated);

      const res = await service.createAdministrasi("USER_01", "TEACHER", input);
      expect(res).toEqual(mockCreated);
      expect(mockRepo.createAdministrasi).toHaveBeenCalled();
    });
  });
});
