"use server";

/**
 * Ruang Pintar — M18 Student Monitoring Server Actions
 *
 * Mengatur interaksi server untuk dashboard wali kelas, agregasi indikator,
 * serta pembuatan/pembaruan catatan monitoring dan rencana tindak lanjut.
 */

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { MonitoringService } from "@/modules/monitoring/application/monitoring-service";
import {
  CreateFollowUpSchemaInput,
  CreateMonitoringNoteSchemaInput,
  UpdateFollowUpStatusSchemaInput,
  UpdateMonitoringNoteSchemaInput,
} from "@/modules/monitoring/domain/monitoring-validation";

export interface MonitoringActionResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * Mengambil ringkasan overview rombel perwalian beserta indikator seluruh siswa
 */
export async function getHomeroomOverviewAction(
  rombelId?: string
): Promise<MonitoringActionResult> {
  try {
    const user = await requireAuth();
    const overview = await MonitoringService.getHomeroomOverview(user, rombelId);
    return {
      success: true,
      message: "Data pemantauan rombel berhasil dimuat.",
      data: overview,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Gagal memuat overview rombel.";
    return {
      success: false,
      message: msg,
      error: msg,
    };
  }
}

/**
 * Mengambil rincian detail investigasi pemantauan satu siswa
 */
export async function getStudentMonitoringDetailAction(
  rombelId: string,
  siswaId: string
): Promise<MonitoringActionResult> {
  try {
    const user = await requireAuth();
    const detail = await MonitoringService.getStudentMonitoringDetail(user, rombelId, siswaId);
    return {
      success: true,
      message: "Data detail monitoring siswa berhasil dimuat.",
      data: detail,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Gagal memuat rincian siswa.";
    return {
      success: false,
      message: msg,
      error: msg,
    };
  }
}

/**
 * Membuat catatan monitoring pembinaan siswa baru
 */
export async function createMonitoringNoteAction(
  input: CreateMonitoringNoteSchemaInput
): Promise<MonitoringActionResult> {
  try {
    const user = await requireAuth();
    const note = await MonitoringService.createMonitoringNote(user, input);

    revalidatePath("/wali-kelas");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Catatan pembinaan siswa berhasil disimpan.",
      data: note,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Gagal menyimpan catatan monitoring.";
    return {
      success: false,
      message: msg,
      error: msg,
    };
  }
}

/**
 * Memperbarui catatan monitoring pembinaan siswa
 */
export async function updateMonitoringNoteAction(
  input: UpdateMonitoringNoteSchemaInput
): Promise<MonitoringActionResult> {
  try {
    const user = await requireAuth();
    const updated = await MonitoringService.updateMonitoringNote(user, input);

    revalidatePath("/wali-kelas");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Catatan pembinaan berhasil diperbarui.",
      data: updated,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Gagal memperbarui catatan.";
    return {
      success: false,
      message: msg,
      error: msg,
    };
  }
}

/**
 * Menambahkan tindak lanjut baru pada catatan monitoring yang ada
 */
export async function createFollowUpAction(
  input: CreateFollowUpSchemaInput
): Promise<MonitoringActionResult> {
  try {
    const user = await requireAuth();
    const followUp = await MonitoringService.createFollowUp(user, input);

    revalidatePath("/wali-kelas");

    return {
      success: true,
      message: "Rencana tindak lanjut berhasil ditambahkan.",
      data: followUp,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Gagal menambahkan tindak lanjut.";
    return {
      success: false,
      message: msg,
      error: msg,
    };
  }
}

/**
 * Memperbarui status / hasil penyelesaian rencana tindak lanjut
 */
export async function updateFollowUpStatusAction(
  input: UpdateFollowUpStatusSchemaInput
): Promise<MonitoringActionResult> {
  try {
    const user = await requireAuth();
    const updated = await MonitoringService.updateFollowUpStatus(user, input);

    revalidatePath("/wali-kelas");

    return {
      success: true,
      message: "Status tindak lanjut berhasil diperbarui.",
      data: updated,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Gagal memperbarui status tindak lanjut.";
    return {
      success: false,
      message: msg,
      error: msg,
    };
  }
}

/**
 * Mengambil daftar rombel aktif dengan wali kelas untuk navigasi supervisi
 */
export async function getActiveHomeroomsListAction(): Promise<MonitoringActionResult> {
  try {
    const user = await requireAuth();
    const list = await MonitoringService.getActiveHomeroomsList(user);
    return {
      success: true,
      message: "Daftar rombel aktif berhasil dimuat.",
      data: list,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Gagal memuat daftar rombel.";
    return {
      success: false,
      message: msg,
      error: msg,
    };
  }
}
