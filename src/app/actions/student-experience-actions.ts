"use server";

/**
 * Ruang Pintar — Student Experience Server Actions (Phase 15 / M15)
 *
 * Mengelola server mutation dan query untuk pengalaman siswa:
 * - Penyerahan tugas mandiri siswa (teks & unggah dokumen)
 * - Validasi batas waktu & izin keterlambatan
 * - Revalidasi cache halaman Next.js
 */

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { requirePermission } from "@/shared/infrastructure/authorization/authz-guard";
import { studentExperienceService } from "@/modules/student/application/student-experience-service";
import { LocalStorageAdapter } from "@/shared/infrastructure/storage/local-storage-adapter";
import { StudentExperienceError } from "@/modules/student/domain/student-experience-errors";

export interface StudentExperienceActionResult {
  success: boolean;
  message: string;
  data?: unknown;
  errors?: Record<string, string[]>;
}

/**
 * Server Action: Penyerahan Tugas oleh Siswa (Submit Assignment)
 */
export async function submitStudentAssignmentAction(
  _prevState: unknown,
  formData: FormData
): Promise<StudentExperienceActionResult> {
  try {
    const user = await requireAuth();
    if (!user.sekolah_id) {
      return { success: false, message: "Konteks sekolah tidak valid." };
    }

    // Permission check
    await requirePermission("learning.assignment.submit");

    const publikasiTugasId = formData.get("publikasi_tugas_id") as string;
    const teksJawaban = (formData.get("teks_jawaban") as string) || null;
    const catatanSiswa = (formData.get("catatan_siswa") as string) || null;
    let berkasId = (formData.get("berkas_id") as string) || null;

    // Handle file upload if present
    const file = formData.get("file") as File | null;
    if (
      file &&
      typeof file === "object" &&
      file.size > 0 &&
      typeof file.arrayBuffer === "function"
    ) {
      // 10MB file limit
      if (file.size > 10 * 1024 * 1024) {
        return {
          success: false,
          message: "Ukuran berkas melebihi batas maksimal 10 MB.",
        };
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const storage = new LocalStorageAdapter();
      const metadata = await storage.saveFile({
        sekolah_id: user.sekolah_id,
        nama_file_asli: file.name,
        mime_type: file.type || "application/octet-stream",
        content: buffer,
      });
      berkasId = metadata.id;
    }

    if (!teksJawaban && !berkasId) {
      return {
        success: false,
        message: "Harap masukkan teks jawaban atau lampirkan berkas pengumpulan tugas.",
      };
    }

    const submission = await studentExperienceService.submitAssignment(user.id, user.sekolah_id, {
      publikasi_tugas_id: publikasiTugasId,
      teks_jawaban: teksJawaban,
      berkas_id: berkasId,
      catatan_siswa: catatanSiswa,
    });

    revalidatePath("/tugas-siswa");
    revalidatePath("/dashboard");

    const message =
      submission.status === "TERLAMBAT"
        ? "Tugas berhasil dikumpulkan (Tercatat Terlambat)."
        : "Tugas berhasil dikumpulkan tepat waktu.";

    return {
      success: true,
      message,
      data: submission,
    };
  } catch (err: unknown) {
    if (err instanceof StudentExperienceError) {
      return { success: false, message: err.message };
    }
    const message =
      err instanceof Error ? err.message : "Terjadi kesalahan saat mengumpulkan tugas.";
    return { success: false, message };
  }
}
