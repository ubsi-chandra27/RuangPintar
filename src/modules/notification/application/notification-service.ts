/**
 * Ruang Pintar — M17 Notification Application Service
 *
 * Mengelola notifikasi event-driven, status keterbacaan, dan transaksi outbox
 * dengan fail-safe delivery (FR-NOT-003).
 */

import { prisma } from "@/shared/infrastructure/database/prisma";
import { publishOutboxEvent } from "@/shared/infrastructure/outbox/outbox-service";
import { NotificationRepository } from "../infrastructure/notification-repository";
import {
  CreateNotificationInput,
  InAppNotificationItem,
  NotificationCenterSummary,
  NotificationPreferenceItem,
  UpdateNotificationPreferenceInput,
} from "../domain/notification-types";
import { NotificationNotFoundError } from "../domain/notification-errors";

export class NotificationService {
  constructor(private readonly repository: NotificationRepository = new NotificationRepository()) {}

  /**
   * Mengambil rangkuman notifikasi pengguna (unread count & list terbaru).
   */
  async getNotificationCenterSummary(
    userId: string,
    limit: number = 10
  ): Promise<NotificationCenterSummary> {
    const [unread_count, items] = await Promise.all([
      this.repository.getUnreadCount(userId),
      this.repository.getUserNotifications(userId, limit, false),
    ]);

    return {
      unread_count,
      items,
    };
  }

  /**
   * Menandai notifikasi sebagai terbaca.
   */
  async markAsRead(notificationId: string, userId: string): Promise<InAppNotificationItem> {
    const updated = await this.repository.markAsRead(notificationId, userId);
    if (!updated) {
      throw new NotificationNotFoundError(notificationId);
    }
    return updated;
  }

  /**
   * Menandai semua notifikasi pengguna sebagai terbaca.
   */
  async markAllAsRead(userId: string): Promise<number> {
    return await this.repository.markAllAsRead(userId);
  }

  /**
   * Mengambil preferensi notifikasi pengguna.
   */
  async getPreference(userId: string): Promise<NotificationPreferenceItem> {
    return await this.repository.getPreference(userId);
  }

  /**
   * Memperbarui preferensi notifikasi pengguna.
   */
  async updatePreference(
    userId: string,
    input: UpdateNotificationPreferenceInput
  ): Promise<NotificationPreferenceItem> {
    return await this.repository.updatePreference(userId, input);
  }

  /**
   * Event Dispatcher: Notifikasi Pengumuman Baru Diterbitkan (M16 -> M17).
   * Menentukan target penerima berdasarkan audiens dan rombel.
   */
  async dispatchAnnouncementNotifications(announcement: {
    id: string;
    sekolah_id: string;
    judul: string;
    target_audiens: string;
    target_rombel_id?: string | null;
  }): Promise<number> {
    const sekolahId = announcement.sekolah_id;
    let targetUserIds: string[] = [];

    if (announcement.target_audiens === "SEMUA") {
      const users = await prisma.pengguna.findMany({
        where: {
          sekolah_id: sekolahId,
          status_akun: "AKTIF",
        },
        select: { id: true },
      });
      targetUserIds = users.map((u) => u.id);
    } else if (announcement.target_audiens === "GURU") {
      const users = await prisma.pengguna.findMany({
        where: {
          sekolah_id: sekolahId,
          peran_dasar: "TEACHER",
          status_akun: "AKTIF",
        },
        select: { id: true },
      });
      targetUserIds = users.map((u) => u.id);
    } else if (announcement.target_audiens === "SISWA") {
      const users = await prisma.pengguna.findMany({
        where: {
          sekolah_id: sekolahId,
          peran_dasar: "STUDENT",
          status_akun: "AKTIF",
        },
        select: { id: true },
      });
      targetUserIds = users.map((u) => u.id);
    } else if (announcement.target_audiens === "WALI") {
      const users = await prisma.pengguna.findMany({
        where: {
          sekolah_id: sekolahId,
          peran_dasar: "GUARDIAN",
          status_akun: "AKTIF",
        },
        select: { id: true },
      });
      targetUserIds = users.map((u) => u.id);
    } else if (announcement.target_audiens === "ROMBEL" && announcement.target_rombel_id) {
      // Ambil siswa dalam rombel ini via relasi keikutsertaan -> siswa
      const placements = await prisma.penempatanRombel.findMany({
        where: {
          rombel_id: announcement.target_rombel_id,
          status: "AKTIF",
        },
        include: {
          keikutsertaan: {
            include: {
              siswa: {
                select: {
                  pengguna_id: true,
                  hubungan_wali: {
                    select: {
                      wali: {
                        select: { pengguna_id: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      const userSet = new Set<string>();
      for (const p of placements) {
        const student = p.keikutsertaan.siswa;
        if (student.pengguna_id) userSet.add(student.pengguna_id);
        for (const rel of student.hubungan_wali) {
          if (rel.wali.pengguna_id) userSet.add(rel.wali.pengguna_id);
        }
      }
      targetUserIds = Array.from(userSet);
    }

    if (targetUserIds.length === 0) return 0;

    // Batasi broadcast in-app maksimal 500 penerima per batch untuk performa SQLite
    const batchUsers = targetUserIds.slice(0, 500);

    const inputs: CreateNotificationInput[] = batchUsers.map((userId) => ({
      sekolah_id: sekolahId,
      pengguna_id: userId,
      judul: "Pengumuman Sekolah Baru",
      pesan: announcement.judul,
      tipe: "PENGUMUMAN_BARU",
      tautan_url: `/pengumuman?id=${announcement.id}`,
      data_tambahan: { pengumuman_id: announcement.id },
    }));

    const count = await this.repository.createBulk(inputs);

    // Fail-safe outbox delivery recording (FR-NOT-003)
    try {
      await publishOutboxEvent({
        tipe_event: "ANNOUNCEMENT_PUBLISHED",
        tipe_agregat: "PENGUMUMAN",
        id_agregat: announcement.id,
        payload: {
          sekolah_id: sekolahId,
          judul: announcement.judul,
          target_audiens: announcement.target_audiens,
          penerima_count: count,
        },
        maks_percobaan: 3,
      });
    } catch {
      // Non-blocking: outbox failure should not fail announcement
    }

    return count;
  }

  /**
   * Event Dispatcher: Notifikasi Pengajuan Izin Wali Diperbarui / Ditanggapi.
   */
  async dispatchGuardianRequestStatusNotification(params: {
    sekolah_id: string;
    wali_pengguna_id: string;
    judul: string;
    status: string;
    pengajuan_id: string;
  }): Promise<InAppNotificationItem> {
    const statusText = params.status === "DISETUJUI" ? "Disetujui" : "Ditolak / Perlu Perbaikan";

    const item = await this.repository.create({
      sekolah_id: params.sekolah_id,
      pengguna_id: params.wali_pengguna_id,
      judul: `Pengajuan Izin: ${statusText}`,
      pesan: `Permohonan izin "${params.judul}" telah ditanggapi oleh pihak sekolah.`,
      tipe: "PENGAJUAN_IZIN",
      tautan_url: `/dashboard`,
      data_tambahan: { pengajuan_id: params.pengajuan_id, status: params.status },
    });

    try {
      await publishOutboxEvent({
        tipe_event: "GUARDIAN_REQUEST_UPDATED",
        tipe_agregat: "PENGAJUAN_WALI",
        id_agregat: params.pengajuan_id,
        payload: {
          status: params.status,
          pengguna_id: params.wali_pengguna_id,
        },
      });
    } catch {
      // Non-blocking
    }

    return item;
  }
}
