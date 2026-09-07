"use server";

/**
 * Ruang Pintar — Guardian Server Actions (Phase 16 / M15)
 * Server Actions untuk mutasi konteks anak dan pengajuan permohonan wali.
 */

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { GuardianService } from "@/modules/guardian/application/guardian-service";
import { LocalStorageAdapter } from "@/shared/infrastructure/storage/local-storage-adapter";

export interface GuardianActionResult {
  success: boolean;
  message: string;
  data?: unknown;
  errors?: Record<string, string[]>;
}

const guardianService = new GuardianService();
const ACTIVE_CHILD_COOKIE_KEY = "rp_active_child_id";

/**
 * Server Action: Mengganti konteks anak aktif terpilih
 */
export async function switchActiveChildAction(studentId: string): Promise<GuardianActionResult> {
  try {
    const user = await requireAuth();
    if (user.peran_dasar !== "GUARDIAN") {
      return { success: false, message: "Akses hanya untuk wali murid." };
    }

    const cookieStore = await cookies();
    cookieStore.set(ACTIVE_CHILD_COOKIE_KEY, studentId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 hari
    });

    revalidatePath("/dashboard");
    revalidatePath("/presensi-anak");
    revalidatePath("/nilai-anak");

    return {
      success: true,
      message: "Berhasil mengganti konteks anak terpilih.",
      data: { studentId },
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal mengganti konteks anak.",
    };
  }
}

/**
 * Server Action: Mengajukan permohonan izin sakit atau dispensasi kegiatan oleh orang tua
 */
export async function submitPengajuanWaliAction(
  _prevState: unknown,
  formData: FormData
): Promise<GuardianActionResult> {
  try {
    const user = await requireAuth();
    if (user.peran_dasar !== "GUARDIAN") {
      return { success: false, message: "Akses hanya untuk wali murid." };
    }

    const siswaId = formData.get("siswa_id") as string;
    const tipe = formData.get("tipe") as string;
    const judul = formData.get("judul") as string;
    const deskripsi = formData.get("deskripsi") as string;
    const tanggalMulai = (formData.get("tanggal_mulai") as string) || null;
    const tanggalSelesai = (formData.get("tanggal_selesai") as string) || null;

    let lampiranUrl: string | null = null;
    const file = formData.get("file") as File | null;
    if (
      file &&
      typeof file === "object" &&
      file.size > 0 &&
      typeof file.arrayBuffer === "function"
    ) {
      if (file.size > 10 * 1024 * 1024) {
        return {
          success: false,
          message: "Ukuran berkas melebihi batas maksimal 10 MB.",
        };
      }

      const storage = new LocalStorageAdapter();
      const buffer = Buffer.from(await file.arrayBuffer());
      const metadata = await storage.saveFile({
        sekolah_id: user.sekolah_id,
        nama_file_asli: file.name,
        mime_type: file.type || "application/octet-stream",
        content: buffer,
      });

      lampiranUrl = `/api/storage/${metadata.storage_key}`;
    }

    const pengajuan = await guardianService.submitPengajuanIzin(user, {
      siswa_id: siswaId,
      tipe: tipe as any,
      judul,
      deskripsi,
      tanggal_mulai: tanggalMulai,
      tanggal_selesai: tanggalSelesai,
      lampiran_url: lampiranUrl,
    });

    revalidatePath("/dashboard");
    revalidatePath("/presensi-anak");
    revalidatePath("/nilai-anak");

    return {
      success: true,
      message: "Permohonan izin / keterangan berhasil diajukan ke pihak sekolah.",
      data: pengajuan,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Terjadi kesalahan saat mengajukan permohonan.",
    };
  }
}

/**
 * Helper untuk membaca ID anak terpilih dari cookie (Server Side)
 */
export async function getActiveChildIdFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ACTIVE_CHILD_COOKIE_KEY)?.value;
}
