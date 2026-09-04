import { describe, it, expect, vi, beforeEach } from "vitest";
import { AssessmentService } from "@/modules/assessment/application/assessment-service";
import {
  AssessmentAccessDeniedError,
  AssessmentFinalizedError,
  AssessmentValidationError,
} from "@/modules/assessment/domain/assessment-errors";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { recordAuditEvent } from "@/shared/infrastructure/audit/audit-logger";

// Mock audit logger
vi.mock("@/shared/infrastructure/audit/audit-logger", () => ({
  recordAuditEvent: vi.fn().mockResolvedValue({ id: "AUDIT_1" }),
}));

describe("M13 Assessment & Gradebook — AssessmentService Domain Invariants", () => {
  let service: AssessmentService;
  let mockRepo: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRepo = {
      findById: vi.fn(),
      findByPenugasan: vi.fn(),
      findAssessmentGrades: vi.fn(),
      createAssessment: vi.fn(),
      updateAssessment: vi.fn(),
      deleteAssessment: vi.fn(),
      bulkSaveGrades: vi.fn(),
      publishAssessment: vi.fn(),
      getGradebookData: vi.fn(),
      getTeacherGradebookOverview: vi.fn(),
    };

    service = new AssessmentService(mockRepo);
  });

  const mockSekolahId = "01J00000000000000000000001";
  const mockPenugasanId = "01J000000000000000PENUGAS1";
  const mockGuruOwnerId = "01J000000000000000000GURU1";
  const mockOtherGuruId = "01J000000000000000000GURU2";

  it("enforces Teacher Scope Guard: rejects teacher who is not assigned to the class", async () => {
    vi.spyOn(prisma.penugasanMengajar, "findFirst").mockResolvedValue({
      id: mockPenugasanId,
      guru_id: mockGuruOwnerId,
      status: "AKTIF",
    } as any);

    await expect(
      service.getAssessments(mockPenugasanId, mockSekolahId, mockOtherGuruId, false)
    ).rejects.toThrow(AssessmentAccessDeniedError);

    // Super Admin can bypass
    mockRepo.findByPenugasan.mockResolvedValue([]);
    const adminResult = await service.getAssessments(mockPenugasanId, mockSekolahId, null, true);
    expect(adminResult).toEqual([]);
  });

  it("creates a new assessment with valid category, technique, and KKTP", async () => {
    vi.spyOn(prisma.penugasanMengajar, "findFirst").mockResolvedValue({
      id: mockPenugasanId,
      guru_id: mockGuruOwnerId,
      status: "AKTIF",
    } as any);

    const mockCreated = {
      id: "01J0000000000000000ASESMEN1",
      sekolah_id: mockSekolahId,
      penugasan_mengajar_id: mockPenugasanId,
      judul: "Formatif TP 1.1: Logika Pemrograman",
      kategori: "FORMATIF",
      teknik_penilaian: "TES_TERTULIS",
      bobot: 1,
      kkm_kktp: 75,
      status: "DRAFT",
    };
    mockRepo.createAssessment.mockResolvedValue(mockCreated);

    const result = await service.createAssessment(
      {
        penugasan_mengajar_id: mockPenugasanId,
        judul: "Formatif TP 1.1: Logika Pemrograman",
        kategori: "FORMATIF",
        teknik_penilaian: "TES_TERTULIS",
        bobot: 1,
        kkm_kktp: 75,
      },
      mockSekolahId,
      mockGuruOwnerId,
      false,
      "USER_123"
    );

    expect(result.id).toBe("01J0000000000000000ASESMEN1");
    expect(mockRepo.createAssessment).toHaveBeenCalledWith(
      expect.objectContaining({
        judul: "Formatif TP 1.1: Logika Pemrograman",
        kategori: "FORMATIF",
        kkm_kktp: 75,
      })
    );
    expect(recordAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        aksi: "CREATE_ASSESSMENT",
      })
    );
  });

  it("rejects invalid assessment input schema (validation error)", async () => {
    await expect(
      service.createAssessment(
        {
          penugasan_mengajar_id: mockPenugasanId,
          judul: "A", // too short (min 3)
          kategori: "INVALID_CAT" as any,
          teknik_penilaian: "TES_TERTULIS",
        },
        mockSekolahId,
        mockGuruOwnerId,
        true,
        "USER_123"
      )
    ).rejects.toThrow(AssessmentValidationError);
  });

  it("preserves Invariant: Missing Grade != Zero Grade during bulk save", async () => {
    mockRepo.findById.mockResolvedValue({
      id: "01J0000000000000000ASESMEN1",
      sekolah_id: mockSekolahId,
      penugasan_mengajar_id: mockPenugasanId,
      status: "DRAFT",
    });

    vi.spyOn(prisma.penugasanMengajar, "findFirst").mockResolvedValue({
      id: mockPenugasanId,
      guru_id: mockGuruOwnerId,
      status: "AKTIF",
    } as any);

    mockRepo.bulkSaveGrades.mockResolvedValue({ success: true, count: 2 });

    const gradesInput = [
      {
        siswa_id: "SISWA_1",
        nilai_angka: 85, // Nilai terisi
        capaian_kompetensi: "Tuntas optimal",
      },
      {
        siswa_id: "SISWA_2",
        nilai_angka: null, // Belum dinilai -> Missing Grade, TIDAK BOLEH jadi 0!
        capaian_kompetensi: null,
      },
    ];

    const result = await service.saveGrades(
      "01J0000000000000000ASESMEN1",
      gradesInput,
      mockSekolahId,
      mockGuruOwnerId,
      false,
      "USER_123",
      "Input nilai sesi 1"
    );

    expect(result.success).toBe(true);
    expect(mockRepo.bulkSaveGrades).toHaveBeenCalledWith(
      "01J0000000000000000ASESMEN1",
      mockSekolahId,
      expect.arrayContaining([
        expect.objectContaining({ siswa_id: "SISWA_1", nilai_angka: 85 }),
        expect.objectContaining({ siswa_id: "SISWA_2", nilai_angka: null }),
      ]),
      "USER_123",
      "Input nilai sesi 1"
    );
  });

  it("enforces Invariant: Assessment Definition != Grade != Grade Publication", async () => {
    mockRepo.findById.mockResolvedValue({
      id: "01J0000000000000000ASESMEN1",
      sekolah_id: mockSekolahId,
      penugasan_mengajar_id: mockPenugasanId,
      status: "DRAFT",
    });

    vi.spyOn(prisma.penugasanMengajar, "findFirst").mockResolvedValue({
      id: mockPenugasanId,
      guru_id: mockGuruOwnerId,
      status: "AKTIF",
    } as any);

    const mockPubRecord = {
      id: "01J00000000000000000000PUB1",
      asesmen_id: "01J0000000000000000ASESMEN1",
      target_audience: "SEMUA",
      status: "PUBLISHED",
      dipublikasikan_oleh: "USER_123",
    };
    mockRepo.publishAssessment.mockResolvedValue(mockPubRecord);

    const pub = await service.publishAssessment(
      "01J0000000000000000ASESMEN1",
      mockSekolahId,
      mockGuruOwnerId,
      false,
      "USER_123",
      "SEMUA",
      "Nilai resmi diumumkan"
    );

    expect(pub.status).toBe("PUBLISHED");
    expect(mockRepo.publishAssessment).toHaveBeenCalledWith(
      "01J0000000000000000ASESMEN1",
      mockSekolahId,
      "USER_123",
      "SEMUA",
      "Nilai resmi diumumkan"
    );
    expect(recordAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        aksi: "PUBLISH_ASSESSMENT_GRADES",
      })
    );
  });

  it("calculates Gradebook Matrix data properly", async () => {
    vi.spyOn(prisma.penugasanMengajar, "findFirst").mockResolvedValue({
      id: mockPenugasanId,
      guru_id: mockGuruOwnerId,
      status: "AKTIF",
    } as any);

    const mockGradebook = {
      penugasan_id: mockPenugasanId,
      sekolah_id: mockSekolahId,
      rombel_id: "ROMBEL_1",
      rombel_nama: "X RPL 1",
      mata_pelajaran_id: "MAPEL_1",
      mata_pelajaran_nama: "Pemrograman Web",
      kkm_default: 75,
      columns: [
        {
          id: "ASESMEN_1",
          judul: "Formatif TP 1",
          kategori: "FORMATIF",
          bobot: 1,
          kkm_kktp: 75,
          status: "PUBLISHED",
          is_published: true,
          tanggal_pelaksanaan: "2026-09-04T00:00:00.000Z",
        },
      ],
      rows: [
        {
          siswa_id: "SISWA_1",
          nis: "1001",
          nama_lengkap: "Budi Santoso",
          grades: {
            ASESMEN_1: {
              nilai_angka: 88,
              status: "PUBLISHED",
            },
          },
          rata_rata_formatif: 88,
          rata_rata_sumatif: null,
          nilai_akhir: 88,
          ketercapaian_kktp_persen: 100,
        },
      ],
      statistics: {
        total_siswa: 1,
        total_asesmen: 1,
        total_formatif: 1,
        total_sumatif: 0,
        rata_rata_kelas: 88,
        persentase_tuntas_kktp: 100,
      },
    };

    mockRepo.getGradebookData.mockResolvedValue(mockGradebook);

    const gradebook = await service.getGradebook(
      mockPenugasanId,
      mockSekolahId,
      mockGuruOwnerId,
      false
    );

    expect(gradebook.rombel_nama).toBe("X RPL 1");
    expect(gradebook.rows[0].grades["ASESMEN_1"].nilai_angka).toBe(88);
    expect(gradebook.statistics.rata_rata_kelas).toBe(88);
  });
});
