"use server";

/**
 * Ruang Pintar — M10 Master Schedule & Time Slots Server Actions
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/shared/infrastructure/authorization/authz-guard";
import { scheduleService } from "@/modules/schedule/application/schedule-service";
import { timeSlotService } from "@/modules/schedule/application/time-slot-service";
import {
  CreateScheduleEntryInput,
  CreateScheduleVersionInput,
  CreateTimeSlotInput,
  TimeSlotMutationConfirmation,
} from "@/modules/schedule/domain/schedule-types";

export interface ScheduleActionResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// ==========================================
// TIME SLOTS
// ==========================================

function timeSlotActionError(error: unknown): ScheduleActionResult {
  if (error instanceof z.ZodError) {
    return {
      success: false,
      message: error.issues[0]?.message || "Periksa kembali isian slot.",
      errors: error.flatten().fieldErrors,
    };
  }
  const code = typeof error === "object" && error && "code" in error ? error.code : null;
  if (code === "P2002")
    return { success: false, message: "Kode slot sudah digunakan. Pilih kode yang berbeda." };
  if (code === "P2003")
    return {
      success: false,
      message: "Slot sudah digunakan jadwal dan tidak dapat dihapus. Muat ulang halaman.",
    };
  if (code)
    return {
      success: false,
      message: "Perubahan belum tersimpan. Muat ulang halaman dan coba kembali.",
    };
  return {
    success: false,
    message: error instanceof Error ? error.message : "Gagal menyimpan perubahan slot waktu.",
  };
}

function timeSlotConfirmation(form: FormData): TimeSlotMutationConfirmation {
  return z
    .object({
      updated_at: z.string().datetime(),
      total_penggunaan: z.number().int().min(0),
      konfirmasi_dampak: z.boolean(),
    })
    .parse({
      updated_at: form.get("updated_at"),
      total_penggunaan: form.has("total_penggunaan") ? Number(form.get("total_penggunaan")) : -1,
      konfirmasi_dampak: form.get("konfirmasi_dampak") === "on",
    });
}

export async function updateTimeSlotAction(form: FormData): Promise<ScheduleActionResult> {
  try {
    const user = await requirePermission("schedule.master.manage");
    if (!user.sekolah_id) return { success: false, message: "Konteks sekolah tidak valid." };
    const slot = await timeSlotService.updateTimeSlot(
      user.id,
      user.peran_dasar,
      z.string().min(1).parse(form.get("slot_id")),
      {
        sekolah_id: user.sekolah_id,
        nama: form.get("nama") as string,
        kode: form.get("kode") as string,
        jam_mulai: form.get("jam_mulai") as string,
        jam_selesai: form.get("jam_selesai") as string,
        hari_khusus: (form.get("hari_khusus") as string) || null,
        is_istirahat: form.get("is_istirahat") === "true",
        is_upacara: form.get("is_upacara") === "true",
      },
      timeSlotConfirmation(form)
    );
    for (const path of ["/jadwal-sekolah", "/jadwal-saya", "/dashboard", "/sesi-pembelajaran"])
      revalidatePath(path);
    return { success: true, message: `Slot waktu '${slot.nama}' berhasil diperbarui.` };
  } catch (error) {
    return timeSlotActionError(error);
  }
}

export async function deleteTimeSlotAction(form: FormData): Promise<ScheduleActionResult> {
  try {
    const user = await requirePermission("schedule.master.manage");
    if (!user.sekolah_id) return { success: false, message: "Konteks sekolah tidak valid." };
    await timeSlotService.deleteTimeSlot(
      user.id,
      user.peran_dasar,
      z.string().min(1).parse(form.get("slot_id")),
      user.sekolah_id,
      timeSlotConfirmation(form)
    );
    for (const path of ["/jadwal-sekolah", "/jadwal-saya", "/dashboard"]) revalidatePath(path);
    return { success: true, message: "Slot waktu berhasil dihapus." };
  } catch (error) {
    return timeSlotActionError(error);
  }
}

export async function createTimeSlotAction(
  _prevState: any,
  formData: FormData
): Promise<ScheduleActionResult> {
  try {
    const user = await requirePermission("schedule.master.manage");
    if (!user.sekolah_id) return { success: false, message: "Konteks sekolah tidak valid." };

    const input: CreateTimeSlotInput = {
      sekolah_id: user.sekolah_id,
      nama: formData.get("nama") as string,
      kode: formData.get("kode") as string,
      urutan: parseInt(formData.get("urutan") as string, 10) || 1,
      jam_mulai: formData.get("jam_mulai") as string,
      jam_selesai: formData.get("jam_selesai") as string,
      is_istirahat:
        formData.get("is_istirahat") === "true" || formData.get("is_istirahat") === "on",
      is_upacara: formData.get("is_upacara") === "true" || formData.get("is_upacara") === "on",
      hari_khusus: (formData.get("hari_khusus") as string) || null,
      status_aktif: true,
    };

    const slot = await timeSlotService.createTimeSlot(user.id, user.peran_dasar, input);

    revalidatePath("/jadwal-sekolah");

    return {
      success: true,
      message: `Slot waktu '${slot.nama}' (${slot.jam_mulai} - ${slot.jam_selesai}) berhasil dibuat.`,
      data: slot,
    };
  } catch (error) {
    return timeSlotActionError(error);
  }
}

export async function seedTimeSlotsAction(): Promise<ScheduleActionResult> {
  try {
    const user = await requirePermission("schedule.master.manage");
    if (!user.sekolah_id) return { success: false, message: "Konteks sekolah tidak valid." };

    const slots = await timeSlotService.seedDefaultTimeSlotsIfEmpty(
      user.id,
      user.peran_dasar,
      user.sekolah_id
    );

    revalidatePath("/jadwal-sekolah");

    return {
      success: true,
      message: `Berhasil menyiapkan ${slots.length} master slot waktu standar sekolah.`,
      data: slots,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal menyiapkan slot waktu standar.",
    };
  }
}

// ==========================================
// SCHEDULE VERSION & PUBLICATION
// ==========================================

export async function createScheduleVersionAction(
  _prevState: any,
  formData: FormData
): Promise<ScheduleActionResult> {
  try {
    const user = await requirePermission("schedule.master.manage");
    if (!user.sekolah_id) return { success: false, message: "Konteks sekolah tidak valid." };

    const input: CreateScheduleVersionInput = {
      sekolah_id: user.sekolah_id,
      tahun_ajaran_id: formData.get("tahun_ajaran_id") as string,
      semester_id: (formData.get("semester_id") as string) || null,
      nama: formData.get("nama") as string,
      catatan: (formData.get("catatan") as string) || null,
    };

    const version = await scheduleService.createVersion(user.id, user.peran_dasar, input);

    revalidatePath("/jadwal-sekolah");

    return {
      success: true,
      message: `Versi jadwal '${version.nama}' (Draft v${version.nomor_versi}) berhasil dibuat.`,
      data: version,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal membuat versi jadwal.",
    };
  }
}

export async function publishScheduleVersionAction(
  versionId: string
): Promise<ScheduleActionResult> {
  try {
    const user = await requirePermission("schedule.master.publish");
    if (!user.sekolah_id) return { success: false, message: "Konteks sekolah tidak valid." };

    const published = await scheduleService.publishVersion(
      user.id,
      user.peran_dasar,
      user.nama_lengkap,
      versionId,
      user.sekolah_id
    );

    revalidatePath("/jadwal-sekolah");
    revalidatePath("/jadwal-saya");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Jadwal resmi '${published.nama}' berhasil dipublikasikan sebagai jadwal aktif sekolah.`,
      data: published,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal mempublikasikan jadwal.",
    };
  }
}

// ==========================================
// SCHEDULE ENTRIES
// ==========================================

export async function createScheduleEntryAction(
  _prevState: any,
  formData: FormData
): Promise<ScheduleActionResult> {
  try {
    const user = await requirePermission("schedule.master.manage");
    if (!user.sekolah_id) return { success: false, message: "Konteks sekolah tidak valid." };

    const input: CreateScheduleEntryInput = {
      sekolah_id: user.sekolah_id,
      versi_jadwal_id: formData.get("versi_jadwal_id") as string,
      rombel_id: formData.get("rombel_id") as string,
      penugasan_mengajar_id: formData.get("penugasan_mengajar_id") as string,
      slot_waktu_id: formData.get("slot_waktu_id") as string,
      hari: formData.get("hari") as any,
      ruangan: (formData.get("ruangan") as string) || null,
      catatan: (formData.get("catatan") as string) || null,
    };

    const entryId = formData.get("entry_id") as string | null;
    const entry = await scheduleService.createScheduleEntry(
      user.id,
      user.peran_dasar,
      input,
      entryId || undefined
    );

    revalidatePath("/jadwal-sekolah");
    revalidatePath("/jadwal-saya");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Jadwal pelajaran ${entry.mata_pelajaran_nama} (${entry.hari}, ${entry.slot_waktu_nama}) berhasil ${entryId ? "diperbarui" : "ditambahkan"}.`,
      data: entry,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal menambahkan jadwal pelajaran.",
    };
  }
}

export async function deleteScheduleEntryAction(id: string): Promise<ScheduleActionResult> {
  try {
    const user = await requirePermission("schedule.master.manage");
    if (!user.sekolah_id) return { success: false, message: "Konteks sekolah tidak valid." };

    await scheduleService.deleteScheduleEntry(user.id, user.peran_dasar, id, user.sekolah_id);

    revalidatePath("/jadwal-sekolah");
    revalidatePath("/jadwal-saya");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Entri jadwal pelajaran berhasil dihapus.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal menghapus entri jadwal.",
    };
  }
}
