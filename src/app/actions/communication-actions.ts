"use server";

/**
 * Ruang Pintar — Communication Server Actions (Phase 17 / M16)
 * Server actions untuk manajemen pengumuman sekolah.
 */

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { CommunicationService } from "@/modules/communication/application/communication-service";
import {
  AnnouncementFilter,
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from "@/modules/communication/domain/communication-types";

export interface CommunicationActionResult {
  success: boolean;
  message: string;
  data?: unknown;
  errors?: Record<string, string[]>;
}

const communicationService = new CommunicationService();

/**
 * Server Action: Membuat pengumuman baru
 */
export async function createAnnouncementAction(
  input: CreateAnnouncementInput
): Promise<CommunicationActionResult> {
  try {
    const user = await requireAuth();
    if (!user.sekolah_id) {
      return { success: false, message: "Konteks sekolah tidak ditemukan pada akun Anda." };
    }

    // Role guard: SUPER_ADMIN, SCHOOL_STAFF, TEACHER
    if (
      user.peran_dasar !== "SUPER_ADMIN" &&
      user.peran_dasar !== "SCHOOL_STAFF" &&
      user.peran_dasar !== "TEACHER"
    ) {
      return {
        success: false,
        message: "Anda tidak memiliki izin membuat pengumuman.",
      };
    }

    const item = await communicationService.createAnnouncement(
      user.sekolah_id,
      {
        id: user.id,
        nama: user.nama_lengkap,
        peran: user.peran_dasar as any,
      },
      input
    );

    revalidatePath("/pengumuman");
    revalidatePath("/dashboard");

    return {
      success: true,
      message:
        item.status === "PUBLISHED"
          ? "Pengumuman berhasil diterbitkan dan notifikasi telah dikirim ke sasaran."
          : "Draf pengumuman berhasil disimpan.",
      data: item,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal membuat pengumuman.",
    };
  }
}

/**
 * Server Action: Memperbarui pengumuman
 */
export async function updateAnnouncementAction(
  id: string,
  input: UpdateAnnouncementInput
): Promise<CommunicationActionResult> {
  try {
    const user = await requireAuth();
    if (!user.sekolah_id) {
      return { success: false, message: "Konteks sekolah tidak ditemukan." };
    }

    const item = await communicationService.updateAnnouncement(
      id,
      user.sekolah_id,
      {
        id: user.id,
        nama: user.nama_lengkap,
        peran: user.peran_dasar as any,
      },
      input
    );

    revalidatePath("/pengumuman");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Pengumuman berhasil diperbarui.",
      data: item,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal memperbarui pengumuman.",
    };
  }
}

/**
 * Server Action: Menerbitkan pengumuman
 */
export async function publishAnnouncementAction(id: string): Promise<CommunicationActionResult> {
  try {
    const user = await requireAuth();
    if (!user.sekolah_id) {
      return { success: false, message: "Konteks sekolah tidak ditemukan." };
    }

    const item = await communicationService.publishAnnouncement(id, user.sekolah_id, {
      id: user.id,
      nama: user.nama_lengkap,
      peran: user.peran_dasar as any,
    });

    revalidatePath("/pengumuman");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Pengumuman berhasil diterbitkan ke sasaran audiens.",
      data: item,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal menerbitkan pengumuman.",
    };
  }
}

/**
 * Server Action: Mengarsipkan pengumuman
 */
export async function archiveAnnouncementAction(id: string): Promise<CommunicationActionResult> {
  try {
    const user = await requireAuth();
    if (!user.sekolah_id) {
      return { success: false, message: "Konteks sekolah tidak ditemukan." };
    }

    const item = await communicationService.archiveAnnouncement(id, user.sekolah_id, {
      id: user.id,
      nama: user.nama_lengkap,
      peran: user.peran_dasar as any,
    });

    revalidatePath("/pengumuman");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Pengumuman berhasil diarsipkan.",
      data: item,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal mengarsipkan pengumuman.",
    };
  }
}

/**
 * Server Action: Menghapus pengumuman
 */
export async function deleteAnnouncementAction(id: string): Promise<CommunicationActionResult> {
  try {
    const user = await requireAuth();
    if (!user.sekolah_id) {
      return { success: false, message: "Konteks sekolah tidak ditemukan." };
    }

    await communicationService.deleteAnnouncement(id, user.sekolah_id, {
      id: user.id,
      nama: user.nama_lengkap,
      peran: user.peran_dasar as any,
    });

    revalidatePath("/pengumuman");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Pengumuman berhasil dihapus.",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal menghapus pengumuman.",
    };
  }
}

/**
 * Server Action: Mengambil detail pengumuman
 */
export async function getAnnouncementDetailAction(id: string): Promise<CommunicationActionResult> {
  try {
    const user = await requireAuth();
    if (!user.sekolah_id) {
      return { success: false, message: "Konteks sekolah tidak ditemukan." };
    }
    const item = await communicationService.getAnnouncementById(id, user.sekolah_id);
    return {
      success: true,
      message: "Pengumuman berhasil dimuat.",
      data: item,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal memuat pengumuman.",
    };
  }
}
