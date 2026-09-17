"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { smartOnboardingService } from "@/modules/ai-assistant/application/smart-onboarding-service";
import {
  SmartOnboardingRegistrationSchema,
  ConfirmClassCreationSchema,
} from "@/modules/ai-assistant/domain/ai-validation";
import {
  ClassExtractionResult,
  TeacherTrialStatusDTO,
} from "@/modules/ai-assistant/domain/ai-types";
import { getSessionCookieOptions } from "@/shared/lib/session";
import { getCurrentUser } from "@/shared/infrastructure/auth/auth-guard";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ConfirmClassResult {
  rombelId: string;
  namaRombel: string;
  totalSiswa: number;
  mataPelajaran: string;
}

/**
 * 1. Action: Registrasi Akun Guru Mandiri (SaaS Free Trial)
 */
export async function registerTeacherAction(
  formData: FormData
): Promise<ActionResult<{ user: any; sekolah: any; redirectUrl: string }>> {
  try {
    const rawData = {
      nama_lengkap: formData.get("nama_lengkap")?.toString() ?? "",
      email: formData.get("email")?.toString() ?? "",
      no_telepon: formData.get("no_telepon")?.toString() ?? undefined,
      password: formData.get("password")?.toString() ?? "",
      nama_sekolah: formData.get("nama_sekolah")?.toString() ?? "",
    };

    const parsed = SmartOnboardingRegistrationSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Data pendaftaran tidak valid.",
      };
    }

    const result = await smartOnboardingService.registerTeacher(parsed.data);

    // Set cookie sesi langsung agar guru otomatis login
    const cookieOptions = getSessionCookieOptions(result.rawSessionToken, true);
    const cookieStore = await cookies();
    cookieStore.set(cookieOptions.name, cookieOptions.value, {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: cookieOptions.path,
      expires: cookieOptions.expires,
      maxAge: cookieOptions.maxAge,
    });

    return {
      success: true,
      data: {
        user: result.user,
        sekolah: result.sekolah,
        redirectUrl: "/dashboard",
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal melakukan registrasi akun.",
    };
  }
}

/**
 * 2. Action: Pindai Foto Lembar Absensi Menggunakan Gemini Vision AI
 */
export async function processClassPhotoAction(
  formData: FormData
): Promise<ActionResult<ClassExtractionResult>> {
  try {
    const user = await getCurrentUser();
    if (!user || !user.sekolah_id) {
      return { success: false, error: "Sesi telah berakhir. Silakan login kembali." };
    }

    const imageBase64 = formData.get("imageBase64")?.toString() ?? "";
    const mimeType = formData.get("mimeType")?.toString() ?? "image/jpeg";
    const namaKelasHint = formData.get("namaKelasHint")?.toString() ?? undefined;
    const mataPelajaranHint = formData.get("mataPelajaranHint")?.toString() ?? undefined;

    if (!imageBase64 || imageBase64.length < 50) {
      return { success: false, error: "Berkas foto lembar absensi wajib disertakan." };
    }

    const extraction = await smartOnboardingService.processClassPhotoWithAi({
      userId: user.id,
      sekolahId: user.sekolah_id,
      imageBase64,
      mimeType,
      namaKelasHint,
      mataPelajaranHint,
    });

    return {
      success: true,
      data: extraction,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal mengekstrak data dari foto.",
    };
  }
}

/**
 * 3. Action: Konfirmasi & Terbitkan Kelas + Siswa (Human-in-the-Loop)
 */
export async function confirmClassCreationAction(
  payload: any
): Promise<ActionResult<ConfirmClassResult>> {
  try {
    const user = await getCurrentUser();
    if (!user || !user.sekolah_id) {
      return { success: false, error: "Sesi telah berakhir. Silakan login kembali." };
    }

    const parsed = ConfirmClassCreationSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Data konfirmasi kelas tidak valid.",
      };
    }

    const result = await smartOnboardingService.confirmAndCreateClass(
      user.id,
      user.sekolah_id,
      parsed.data
    );

    revalidatePath("/dashboard");
    revalidatePath("/kelas-saya");

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal membuat kelas dari hasil pemindaian AI.",
    };
  }
}

/**
 * 4. Action: Dapatkan Status Masa Percobaan Guru (Freemium Trial Status)
 */
export async function getTeacherTrialStatusAction(): Promise<ActionResult<TeacherTrialStatusDTO>> {
  try {
    const user = await getCurrentUser();
    if (!user || !user.sekolah_id) {
      return { success: false, error: "Tidak terautentikasi." };
    }

    const status = await smartOnboardingService.getTeacherTrialStatus(user.id, user.sekolah_id);
    return {
      success: true,
      data: status,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal mengambil status trial.",
    };
  }
}
