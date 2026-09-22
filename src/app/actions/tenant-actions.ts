"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { authService } from "@/shared/infrastructure/auth/auth-service";
import { getCurrentUser } from "@/shared/infrastructure/auth/auth-guard";
import { SESSION_COOKIE_NAME } from "@/shared/lib/session";

export type TenantActionResult = { success: true } | { success: false; error: string };

/** Server-authoritative session tenant switch. A client cannot switch by editing URL state. */
export async function switchActiveTenantAction(sekolahId: string): Promise<TenantActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Sesi telah berakhir. Silakan login kembali." };

    const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
    if (!token) return { success: false, error: "Sesi tenant tidak ditemukan." };

    await authService.switchActiveTenant(token, sekolahId);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengubah sekolah aktif.",
    };
  }
}
