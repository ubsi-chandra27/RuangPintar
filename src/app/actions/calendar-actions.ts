"use server";

/**
 * Ruang Pintar — M09 Academic Calendar Server Actions
 */

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/shared/infrastructure/authorization/authz-guard";
import { calendarService } from "@/modules/calendar/application/calendar-service";
import {
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
} from "@/modules/calendar/domain/calendar-types";

export interface CalendarActionResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export async function createCalendarEventAction(
  _prevState: any,
  formData: FormData
): Promise<CalendarActionResult> {
  try {
    const user = await requirePermission("academic.calendar.manage");
    if (!user.sekolah_id) {
      return { success: false, message: "Konteks sekolah tidak valid." };
    }

    const input: CreateCalendarEventInput = {
      sekolah_id: user.sekolah_id,
      tahun_ajaran_id: formData.get("tahun_ajaran_id") as string,
      semester_id: (formData.get("semester_id") as string) || null,
      judul: formData.get("judul") as string,
      deskripsi: (formData.get("deskripsi") as string) || null,
      tipe_event: formData.get("tipe_event") as any,
      tanggal_mulai: formData.get("tanggal_mulai") as string,
      tanggal_selesai: formData.get("tanggal_selesai") as string,
      libur_kbm: formData.get("libur_kbm") === "true" || formData.get("libur_kbm") === "on",
      warna: (formData.get("warna") as string) || null,
    };

    const event = await calendarService.createEvent(user.id, user.peran_dasar, input);

    revalidatePath("/kalender-akademik");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Agenda '${event.judul}' berhasil ditambahkan ke Kalender Akademik.`,
      data: event,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal menambahkan agenda kalender.",
    };
  }
}

export async function updateCalendarEventAction(
  _prevState: any,
  formData: FormData
): Promise<CalendarActionResult> {
  try {
    const user = await requirePermission("academic.calendar.manage");
    if (!user.sekolah_id) {
      return { success: false, message: "Konteks sekolah tidak valid." };
    }

    const input: UpdateCalendarEventInput = {
      id: formData.get("id") as string,
      sekolah_id: user.sekolah_id,
      tahun_ajaran_id: formData.get("tahun_ajaran_id") as string,
      semester_id: (formData.get("semester_id") as string) || null,
      judul: formData.get("judul") as string,
      deskripsi: (formData.get("deskripsi") as string) || null,
      tipe_event: formData.get("tipe_event") as any,
      tanggal_mulai: formData.get("tanggal_mulai") as string,
      tanggal_selesai: formData.get("tanggal_selesai") as string,
      libur_kbm: formData.get("libur_kbm") === "true" || formData.get("libur_kbm") === "on",
      warna: (formData.get("warna") as string) || null,
    };

    const event = await calendarService.updateEvent(user.id, user.peran_dasar, input);

    revalidatePath("/kalender-akademik");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Agenda '${event.judul}' berhasil diperbarui.`,
      data: event,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal memperbarui agenda kalender.",
    };
  }
}

export async function deleteCalendarEventAction(id: string): Promise<CalendarActionResult> {
  try {
    const user = await requirePermission("academic.calendar.manage");
    if (!user.sekolah_id) {
      return { success: false, message: "Konteks sekolah tidak valid." };
    }

    await calendarService.deleteEvent(user.id, user.peran_dasar, id, user.sekolah_id);

    revalidatePath("/kalender-akademik");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Agenda kalender akademik berhasil dihapus.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal menghapus agenda kalender.",
    };
  }
}
