"use server";

/**
 * Ruang Pintar — M10 Actual Class Session Server Actions
 */

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { classSessionService } from "@/modules/schedule/application/class-session-service";
import { OpenClassSessionInput } from "@/modules/schedule/domain/schedule-types";

export interface ClassSessionActionResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export async function openClassSessionAction(
  _prevState: any,
  formData: FormData
): Promise<ClassSessionActionResult> {
  try {
    const user = await requireAuth();
    if (!user.sekolah_id) return { success: false, message: "Konteks sekolah tidak valid." };

    const input: OpenClassSessionInput = {
      sekolah_id: user.sekolah_id,
      jadwal_pelajaran_id: (formData.get("jadwal_pelajaran_id") as string) || null,
      penugasan_mengajar_id: formData.get("penugasan_mengajar_id") as string,
      rombel_id: formData.get("rombel_id") as string,
      mata_pelajaran_id: formData.get("mata_pelajaran_id") as string,
      guru_id: formData.get("guru_id") as string,
      guru_pengganti_id: (formData.get("guru_pengganti_id") as string) || null,
      tahun_ajaran_id: formData.get("tahun_ajaran_id") as string,
      semester_id: (formData.get("semester_id") as string) || null,
      tanggal: (formData.get("tanggal") as string) || new Date(),
      ruangan_aktual: (formData.get("ruangan_aktual") as string) || null,
      topik_pembelajaran: (formData.get("topik_pembelajaran") as string) || null,
      catatan: (formData.get("catatan") as string) || null,
    };

    const session = await classSessionService.openSession(user.id, user.peran_dasar, input);

    revalidatePath("/sesi-pembelajaran");
    revalidatePath("/jadwal-saya");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Sesi pembelajaran kelas ${session.rombel_nama} (${session.mata_pelajaran_nama}) berhasil dibuka.`,
      data: session,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal membuka sesi pembelajaran.",
    };
  }
}

export async function closeClassSessionAction(
  sessionId: string,
  catatan?: string
): Promise<ClassSessionActionResult> {
  try {
    const user = await requireAuth();
    if (!user.sekolah_id) return { success: false, message: "Konteks sekolah tidak valid." };

    const closed = await classSessionService.closeSession(
      user.id,
      user.peran_dasar,
      sessionId,
      user.sekolah_id,
      catatan
    );

    revalidatePath("/sesi-pembelajaran");
    revalidatePath("/jadwal-saya");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Sesi pembelajaran ${closed.rombel_nama} telah ditutup dengan status SELESAI.`,
      data: closed,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal menutup sesi pembelajaran.",
    };
  }
}
