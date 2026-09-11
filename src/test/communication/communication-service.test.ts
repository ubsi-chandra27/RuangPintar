import { describe, it, expect, vi, beforeEach } from "vitest";
import { CommunicationService } from "@/modules/communication/application/communication-service";
import { CommunicationRepository } from "@/modules/communication/infrastructure/communication-repository";
import { NotificationService } from "@/modules/notification/application/notification-service";
import {
  AnnouncementValidationError,
  UnauthorizedAnnouncementManageError,
} from "@/modules/communication/domain/communication-errors";

vi.mock("@/shared/infrastructure/audit/audit-logger", () => ({
  recordAuditEvent: vi.fn().mockResolvedValue({ id: "AUDIT_01" }),
}));

describe("M16 Communication — Domain & Application Service", () => {
  let mockRepo: Partial<CommunicationRepository>;
  let mockNotificationService: Partial<NotificationService>;
  let service: CommunicationService;

  beforeEach(() => {
    mockRepo = {
      create: vi.fn(),
      update: vi.fn(),
      findById: vi.fn(),
      delete: vi.fn(),
      getVisibleForUser: vi.fn(),
      getManageableList: vi.fn(),
    };

    mockNotificationService = {
      dispatchAnnouncementNotifications: vi.fn().mockResolvedValue(10),
    };

    service = new CommunicationService(
      mockRepo as CommunicationRepository,
      mockNotificationService as NotificationService
    );
  });

  it("berhasil membuat draf pengumuman baru", async () => {
    const fakeAnnouncement = {
      id: "ANN_01",
      sekolah_id: "SCH_01",
      penulis_id: "USR_01",
      penulis: { id: "USR_01", nama_lengkap: "Admin Utama", peran_dasar: "SUPER_ADMIN" },
      judul: "Jadwal Ujian Sekolah",
      konten: "Ujian akan diselenggarakan minggu depan mulai Senin.",
      kategori: "AKADEMIK" as const,
      status: "DRAFT" as const,
      apakah_disematkan: false,
      lampiran_url: null,
      target_audiens: "SEMUA" as const,
      target_rombel_id: null,
      dipublikasikan_pada: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    (mockRepo.create as any).mockResolvedValue(fakeAnnouncement);

    const result = await service.createAnnouncement(
      "SCH_01",
      { id: "USR_01", nama: "Admin Utama", peran: "SUPER_ADMIN" },
      {
        judul: "Jadwal Ujian Sekolah",
        konten: "Ujian akan diselenggarakan minggu depan mulai Senin.",
        kategori: "AKADEMIK",
        target_audiens: "SEMUA",
        status: "DRAFT",
      }
    );

    expect(result.id).toBe("ANN_01");
    expect(result.status).toBe("DRAFT");
    expect(mockNotificationService.dispatchAnnouncementNotifications).not.toHaveBeenCalled();
  });

  it("menerbitkan pengumuman (PUBLISHED) memicu dispatch notifikasi ke M17", async () => {
    const fakeAnnouncement = {
      id: "ANN_02",
      sekolah_id: "SCH_01",
      penulis_id: "USR_01",
      penulis: { id: "USR_01", nama_lengkap: "Admin Utama", peran_dasar: "SUPER_ADMIN" },
      judul: "Edaran Pertemuan Wali Murid",
      konten: "Diharapkan kehadiran bapak/ibu wali murid pada hari Sabtu.",
      kategori: "PENTING" as const,
      status: "PUBLISHED" as const,
      apakah_disematkan: true,
      lampiran_url: null,
      target_audiens: "WALI" as const,
      target_rombel_id: null,
      dipublikasikan_pada: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    (mockRepo.create as any).mockResolvedValue(fakeAnnouncement);

    const result = await service.createAnnouncement(
      "SCH_01",
      { id: "USR_01", nama: "Admin Utama", peran: "SUPER_ADMIN" },
      {
        judul: "Edaran Pertemuan Wali Murid",
        konten: "Diharapkan kehadiran bapak/ibu wali murid pada hari Sabtu.",
        kategori: "PENTING",
        target_audiens: "WALI",
        status: "PUBLISHED",
      }
    );

    expect(result.status).toBe("PUBLISHED");
    expect(mockNotificationService.dispatchAnnouncementNotifications).toHaveBeenCalledWith({
      id: "ANN_02",
      sekolah_id: "SCH_01",
      judul: "Edaran Pertemuan Wali Murid",
      target_audiens: "WALI",
      target_rombel_id: null,
    });
  });

  it("menolak pembuatan pengumuman jika validasi tidak lolos (judul terlalu pendek)", async () => {
    await expect(
      service.createAnnouncement(
        "SCH_01",
        { id: "USR_01", nama: "Admin", peran: "SUPER_ADMIN" },
        {
          judul: "Hi",
          konten: "Ini konten pengumuman yang cukup panjang.",
          kategori: "UMUM",
          target_audiens: "SEMUA",
        }
      )
    ).rejects.toThrow(AnnouncementValidationError);
  });

  it("menolak target audiens ROMBEL jika target_rombel_id kosong", async () => {
    await expect(
      service.createAnnouncement(
        "SCH_01",
        { id: "USR_01", nama: "Admin", peran: "SUPER_ADMIN" },
        {
          judul: "Pengumuman Rombel Khusus",
          konten: "Informasi khusus rombel tanpa memilih rombel target.",
          kategori: "UMUM",
          target_audiens: "ROMBEL",
          target_rombel_id: null,
        }
      )
    ).rejects.toThrow(AnnouncementValidationError);
  });

  it("menolak pengeditan oleh pengguna yang bukan pembuat dan bukan admin", async () => {
    (mockRepo.findById as any).mockResolvedValue({
      id: "ANN_01",
      penulis_id: "GURU_01",
      judul: "Materi Matematika",
      status: "DRAFT",
    });

    await expect(
      service.updateAnnouncement(
        "ANN_01",
        "SCH_01",
        { id: "GURU_02", nama: "Guru Lain", peran: "TEACHER" },
        { judul: "Judul Baru yang Diubah" }
      )
    ).rejects.toThrow(UnauthorizedAnnouncementManageError);
  });
});
