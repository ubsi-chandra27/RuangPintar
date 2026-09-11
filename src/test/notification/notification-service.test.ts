import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotificationService } from "@/modules/notification/application/notification-service";
import { NotificationRepository } from "@/modules/notification/infrastructure/notification-repository";
import { NotificationNotFoundError } from "@/modules/notification/domain/notification-errors";

vi.mock("@/shared/infrastructure/outbox/outbox-service", () => ({
  publishOutboxEvent: vi.fn().mockResolvedValue({ id: "OUTBOX_01", status: "PENDING" }),
}));

describe("M17 Notification — Domain & Application Service", () => {
  let mockRepo: Partial<NotificationRepository>;
  let service: NotificationService;

  beforeEach(() => {
    mockRepo = {
      getUnreadCount: vi.fn(),
      getUserNotifications: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      getPreference: vi.fn(),
      updatePreference: vi.fn(),
      create: vi.fn(),
      createBulk: vi.fn(),
    };

    service = new NotificationService(mockRepo as NotificationRepository);
  });

  it("mengambil rangkuman notifikasi pengguna (unread count & list)", async () => {
    (mockRepo.getUnreadCount as any).mockResolvedValue(3);
    (mockRepo.getUserNotifications as any).mockResolvedValue([
      {
        id: "NOTIF_01",
        judul: "Pengumuman Baru",
        pesan: "Jadwal ATS Ganjil telah terbit",
        tipe: "PENGUMUMAN_BARU",
        apakah_dibaca: false,
        created_at: new Date(),
      },
    ]);

    const result = await service.getNotificationCenterSummary("USR_01", 10);

    expect(result.unread_count).toBe(3);
    expect(result.items.length).toBe(1);
    expect(result.items[0].judul).toBe("Pengumuman Baru");
  });

  it("menandai satu notifikasi sebagai terbaca", async () => {
    (mockRepo.markAsRead as any).mockResolvedValue({
      id: "NOTIF_01",
      sekolah_id: "SCH_01",
      pengguna_id: "USR_01",
      judul: "Pengumuman Baru",
      pesan: "Jadwal ATS",
      tipe: "PENGUMUMAN_BARU",
      tautan_url: "/pengumuman",
      apakah_dibaca: true,
      dibaca_pada: new Date(),
      created_at: new Date(),
    });

    const result = await service.markAsRead("NOTIF_01", "USR_01");

    expect(result.apakah_dibaca).toBe(true);
    expect(mockRepo.markAsRead).toHaveBeenCalledWith("NOTIF_01", "USR_01");
  });

  it("melempar NotificationNotFoundError jika notifikasi tidak ditemukan saat dimark read", async () => {
    (mockRepo.markAsRead as any).mockResolvedValue(null);

    await expect(service.markAsRead("NOTIF_NONEXIST", "USR_01")).rejects.toThrow(
      NotificationNotFoundError
    );
  });

  it("menandai seluruh notifikasi pengguna sebagai terbaca", async () => {
    (mockRepo.markAllAsRead as any).mockResolvedValue(5);

    const count = await service.markAllAsRead("USR_01");

    expect(count).toBe(5);
    expect(mockRepo.markAllAsRead).toHaveBeenCalledWith("USR_01");
  });

  it("memperbarui preferensi notifikasi pengguna", async () => {
    (mockRepo.updatePreference as any).mockResolvedValue({
      id: "PREF_01",
      pengguna_id: "USR_01",
      in_app_aktif: true,
      whatsapp_aktif: false,
      email_aktif: true,
      notif_pengumuman: true,
      notif_tugas: true,
      notif_nilai: true,
      notif_presensi: true,
    });

    const result = await service.updatePreference("USR_01", {
      whatsapp_aktif: false,
      email_aktif: true,
    });

    expect(result.whatsapp_aktif).toBe(false);
    expect(result.email_aktif).toBe(true);
  });
});
