"use server";

/**
 * Ruang Pintar — Notification Server Actions (Phase 17 / M17)
 * Server actions untuk popover notifikasi, penandaan terbaca, dan preferensi saluran.
 */

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { NotificationService } from "@/modules/notification/application/notification-service";
import { UpdateNotificationPreferenceInput } from "@/modules/notification/domain/notification-types";

export interface NotificationActionResult {
  success: boolean;
  message: string;
  data?: unknown;
}

const notificationService = new NotificationService();

/**
 * Server Action: Mengambil ringkasan notifikasi pengguna (unread count & list terbaru)
 */
export async function getNotificationSummaryAction(
  limit: number = 10
): Promise<NotificationActionResult> {
  try {
    const user = await requireAuth();
    const summary = await notificationService.getNotificationCenterSummary(user.id, limit);

    return {
      success: true,
      message: "Notifikasi berhasil dimuat.",
      data: summary,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal memuat notifikasi.",
    };
  }
}

/**
 * Server Action: Menandai satu notifikasi sebagai terbaca
 */
export async function markNotificationReadAction(
  notificationId: string
): Promise<NotificationActionResult> {
  try {
    const user = await requireAuth();
    const updated = await notificationService.markAsRead(notificationId, user.id);

    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Notifikasi ditandai telah dibaca.",
      data: updated,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal memperbarui status notifikasi.",
    };
  }
}

/**
 * Server Action: Menandai seluruh notifikasi pengguna sebagai terbaca
 */
export async function markAllNotificationsReadAction(): Promise<NotificationActionResult> {
  try {
    const user = await requireAuth();
    const count = await notificationService.markAllAsRead(user.id);

    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Semua (${count}) notifikasi telah ditandai terbaca.`,
      data: { count },
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal menandai semua notifikasi.",
    };
  }
}

/**
 * Server Action: Mengambil preferensi saluran notifikasi pengguna
 */
export async function getNotificationPreferenceAction(): Promise<NotificationActionResult> {
  try {
    const user = await requireAuth();
    const pref = await notificationService.getPreference(user.id);

    return {
      success: true,
      message: "Preferensi notifikasi berhasil dimuat.",
      data: pref,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal memuat preferensi notifikasi.",
    };
  }
}

/**
 * Server Action: Memperbarui preferensi notifikasi
 */
export async function updateNotificationPreferenceAction(
  input: UpdateNotificationPreferenceInput
): Promise<NotificationActionResult> {
  try {
    const user = await requireAuth();
    const updated = await notificationService.updatePreference(user.id, input);

    return {
      success: true,
      message: "Preferensi notifikasi berhasil disimpan.",
      data: updated,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal menyimpan preferensi notifikasi.",
    };
  }
}
