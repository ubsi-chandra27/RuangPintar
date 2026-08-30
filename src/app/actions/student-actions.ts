"use server";

/**
 * Ruang Pintar — M07 Student Academic Lifecycle: Server Actions
 */

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { requirePermission } from "@/shared/infrastructure/authorization/authz-guard";
import { studentIdentityService } from "@/modules/student/application/student-identity-service";
import { studentEnrollmentService } from "@/modules/student/application/student-enrollment-service";
import { rombelPlacementService } from "@/modules/student/application/rombel-placement-service";
import { studentLifecycleService } from "@/modules/student/application/student-lifecycle-service";
import {
  BulkPlacementSchema,
  CreateEnrollmentSchema,
  CreatePlacementSchema,
  CreateStudentSchema,
  GraduateStudentSchema,
  MovePlacementSchema,
  PromoteStudentSchema,
  TransferOutStudentSchema,
  UpdateEnrollmentStatusSchema,
  UpdateStudentSchema,
} from "@/modules/student/domain/student-validation";
import { StudentDomainError } from "@/modules/student/domain/student-errors";

export interface StudentActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  data?: unknown;
}

// =========================================================================
// 1. STUDENT IDENTITY ACTIONS
// =========================================================================

export async function createStudentAction(
  _prevState: unknown,
  formData: FormData
): Promise<StudentActionResult> {
  try {
    const actor = await requireAuth();
    if (!actor.sekolah_id) {
      return { success: false, message: "Konteks sekolah tidak valid." };
    }

    await requirePermission("academic.students.manage", {
      sekolah_id: actor.sekolah_id,
    });

    const rawData = {
      nis: formData.get("nis")?.toString(),
      nisn: formData.get("nisn")?.toString() || undefined,
      nama_lengkap: formData.get("nama_lengkap")?.toString(),
      jenis_kelamin: formData.get("jenis_kelamin")?.toString(),
      tempat_lahir: formData.get("tempat_lahir")?.toString() || undefined,
      tanggal_lahir: formData.get("tanggal_lahir")?.toString() || undefined,
      agama: formData.get("agama")?.toString() || undefined,
      nik: formData.get("nik")?.toString() || undefined,
      alamat: formData.get("alamat")?.toString() || undefined,
      nama_wali: formData.get("nama_wali")?.toString() || undefined,
      telepon_wali: formData.get("telepon_wali")?.toString() || undefined,
      email_wali: formData.get("email_wali")?.toString() || undefined,
      status_akademik: (formData.get("status_akademik")?.toString() || "AKTIF") as any,
      foto_url: formData.get("foto_url")?.toString() || undefined,
      tanggal_masuk: formData.get("tanggal_masuk")?.toString() || undefined,
      catatan: formData.get("catatan")?.toString() || undefined,
      initial_tahun_ajaran_id: formData.get("initial_tahun_ajaran_id")?.toString() || undefined,
      initial_tingkat_id: formData.get("initial_tingkat_id")?.toString() || undefined,
      initial_rombel_id: formData.get("initial_rombel_id")?.toString() || undefined,
    };

    const parsed = CreateStudentSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        message: "Validasi data siswa gagal. Silakan periksa formulir.",
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const created = await studentIdentityService.createStudent(
      actor.sekolah_id,
      parsed.data as any,
      actor.id,
      actor.peran_dasar
    );

    revalidatePath("/data-siswa");
    return {
      success: true,
      message: `Siswa "${created.nama_lengkap}" (NIS: ${created.nis}) berhasil didaftarkan.`,
      data: created,
    };
  } catch (error) {
    if (error instanceof StudentDomainError) {
      return { success: false, message: error.message };
    }
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan sistem saat mendaftarkan siswa.",
    };
  }
}

export async function updateStudentAction(
  _prevState: unknown,
  formData: FormData
): Promise<StudentActionResult> {
  try {
    const actor = await requireAuth();
    if (!actor.sekolah_id) {
      return { success: false, message: "Konteks sekolah tidak valid." };
    }

    await requirePermission("academic.students.manage", {
      sekolah_id: actor.sekolah_id,
    });

    const id = formData.get("id")?.toString();
    if (!id) {
      return { success: false, message: "ID siswa wajib disertakan." };
    }

    const rawData = {
      nis: formData.get("nis")?.toString() || undefined,
      nisn: formData.get("nisn")?.toString() || undefined,
      nama_lengkap: formData.get("nama_lengkap")?.toString() || undefined,
      jenis_kelamin: (formData.get("jenis_kelamin")?.toString() as any) || undefined,
      tempat_lahir: formData.get("tempat_lahir")?.toString() || undefined,
      tanggal_lahir: formData.get("tanggal_lahir")?.toString() || undefined,
      agama: formData.get("agama")?.toString() || undefined,
      nik: formData.get("nik")?.toString() || undefined,
      alamat: formData.get("alamat")?.toString() || undefined,
      nama_wali: formData.get("nama_wali")?.toString() || undefined,
      telepon_wali: formData.get("telepon_wali")?.toString() || undefined,
      email_wali: formData.get("email_wali")?.toString() || undefined,
      status_akademik: (formData.get("status_akademik")?.toString() as any) || undefined,
      foto_url: formData.get("foto_url")?.toString() || undefined,
      catatan: formData.get("catatan")?.toString() || undefined,
    };

    const parsed = UpdateStudentSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        message: "Validasi pembaruan siswa gagal.",
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const updated = await studentIdentityService.updateStudent(
      id,
      actor.sekolah_id,
      parsed.data as any,
      actor.id,
      actor.peran_dasar
    );

    revalidatePath("/data-siswa");
    return {
      success: true,
      message: `Profil siswa "${updated.nama_lengkap}" berhasil diperbarui.`,
      data: updated,
    };
  } catch (error) {
    if (error instanceof StudentDomainError) {
      return { success: false, message: error.message };
    }
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan sistem saat memperbarui profil siswa.",
    };
  }
}

export async function deleteStudentAction(id: string): Promise<StudentActionResult> {
  try {
    const actor = await requireAuth();
    if (!actor.sekolah_id) {
      return { success: false, message: "Konteks sekolah tidak valid." };
    }

    await requirePermission("academic.students.manage", {
      sekolah_id: actor.sekolah_id,
    });

    await studentIdentityService.deleteStudent(id, actor.sekolah_id, actor.id, actor.peran_dasar);

    revalidatePath("/data-siswa");
    return {
      success: true,
      message: "Data siswa berhasil dihapus.",
    };
  } catch (error) {
    if (error instanceof StudentDomainError) {
      return { success: false, message: error.message };
    }
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan sistem saat menghapus data siswa.",
    };
  }
}

// =========================================================================
// 2. ENROLLMENT ACTIONS
// =========================================================================

export async function createEnrollmentAction(
  _prevState: unknown,
  formData: FormData
): Promise<StudentActionResult> {
  try {
    const actor = await requireAuth();
    if (!actor.sekolah_id) {
      return { success: false, message: "Konteks sekolah tidak valid." };
    }

    await requirePermission("academic.students.manage", {
      sekolah_id: actor.sekolah_id,
    });

    const rawData = {
      siswa_id: formData.get("siswa_id")?.toString(),
      tahun_ajaran_id: formData.get("tahun_ajaran_id")?.toString(),
      tingkat_id: formData.get("tingkat_id")?.toString() || undefined,
      status: (formData.get("status")?.toString() || "AKTIF") as any,
      tanggal_mulai: formData.get("tanggal_mulai")?.toString() || undefined,
      catatan: formData.get("catatan")?.toString() || undefined,
      initial_rombel_id: formData.get("initial_rombel_id")?.toString() || undefined,
    };

    const parsed = CreateEnrollmentSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        message: "Validasi keikutsertaan siswa gagal.",
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const created = await studentEnrollmentService.createEnrollment(
      actor.sekolah_id,
      parsed.data as any,
      actor.id,
      actor.peran_dasar
    );

    revalidatePath("/data-siswa");
    return {
      success: true,
      message: `Keikutsertaan akademik untuk "${created.siswa_nama}" berhasil didaftarkan.`,
      data: created,
    };
  } catch (error) {
    if (error instanceof StudentDomainError) {
      return { success: false, message: error.message };
    }
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan sistem saat mendaftarkan keikutsertaan.",
    };
  }
}

export async function updateEnrollmentStatusAction(
  _prevState: unknown,
  formData: FormData
): Promise<StudentActionResult> {
  try {
    const actor = await requireAuth();
    if (!actor.sekolah_id) {
      return { success: false, message: "Konteks sekolah tidak valid." };
    }

    await requirePermission("academic.students.manage", {
      sekolah_id: actor.sekolah_id,
    });

    const id = formData.get("id")?.toString();
    if (!id) {
      return { success: false, message: "ID keikutsertaan wajib disertakan." };
    }

    const rawData = {
      status: formData.get("status")?.toString() as any,
      tanggal_selesai: formData.get("tanggal_selesai")?.toString() || undefined,
      catatan: formData.get("catatan")?.toString() || undefined,
    };

    const parsed = UpdateEnrollmentStatusSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        message: "Validasi status keikutsertaan gagal.",
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const updated = await studentEnrollmentService.updateEnrollmentStatus(
      id,
      actor.sekolah_id,
      parsed.data as any,
      actor.id,
      actor.peran_dasar
    );

    revalidatePath("/data-siswa");
    return {
      success: true,
      message: `Status keikutsertaan "${updated.siswa_nama}" diubah menjadi ${updated.status}.`,
      data: updated,
    };
  } catch (error) {
    if (error instanceof StudentDomainError) {
      return { success: false, message: error.message };
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan sistem.",
    };
  }
}

export async function deleteEnrollmentAction(id: string): Promise<StudentActionResult> {
  try {
    const actor = await requireAuth();
    if (!actor.sekolah_id) {
      return { success: false, message: "Konteks sekolah tidak valid." };
    }

    await requirePermission("academic.students.manage", {
      sekolah_id: actor.sekolah_id,
    });

    await studentEnrollmentService.deleteEnrollment(
      id,
      actor.sekolah_id,
      actor.id,
      actor.peran_dasar
    );

    revalidatePath("/data-siswa");
    return {
      success: true,
      message: "Keikutsertaan akademik berhasil dihapus.",
    };
  } catch (error) {
    if (error instanceof StudentDomainError) {
      return { success: false, message: error.message };
    }
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan sistem saat menghapus keikutsertaan.",
    };
  }
}

// =========================================================================
// 3. ROMBEL PLACEMENT ACTIONS
// =========================================================================

export async function createPlacementAction(
  _prevState: unknown,
  formData: FormData
): Promise<StudentActionResult> {
  try {
    const actor = await requireAuth();
    if (!actor.sekolah_id) {
      return { success: false, message: "Konteks sekolah tidak valid." };
    }

    await requirePermission("academic.students.manage", {
      sekolah_id: actor.sekolah_id,
    });

    const rawData = {
      keikutsertaan_id: formData.get("keikutsertaan_id")?.toString(),
      rombel_id: formData.get("rombel_id")?.toString(),
      nomor_absen: formData.get("nomor_absen") ? Number(formData.get("nomor_absen")) : undefined,
      catatan: formData.get("catatan")?.toString() || undefined,
    };

    const parsed = CreatePlacementSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        message: "Validasi penempatan rombel gagal.",
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const created = await rombelPlacementService.createPlacement(
      actor.sekolah_id,
      parsed.data as any,
      actor.id,
      actor.peran_dasar
    );

    revalidatePath("/data-siswa");
    return {
      success: true,
      message: `Siswa "${created.siswa_nama}" berhasil ditempatkan pada kelas "${created.rombel_nama}".`,
      data: created,
    };
  } catch (error) {
    if (error instanceof StudentDomainError) {
      return { success: false, message: error.message };
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan saat menempatkan siswa.",
    };
  }
}

export async function movePlacementAction(
  _prevState: unknown,
  formData: FormData
): Promise<StudentActionResult> {
  try {
    const actor = await requireAuth();
    if (!actor.sekolah_id) {
      return { success: false, message: "Konteks sekolah tidak valid." };
    }

    await requirePermission("academic.students.manage", {
      sekolah_id: actor.sekolah_id,
    });

    const rawData = {
      keikutsertaan_id: formData.get("keikutsertaan_id")?.toString(),
      target_rombel_id: formData.get("target_rombel_id")?.toString(),
      nomor_absen: formData.get("nomor_absen") ? Number(formData.get("nomor_absen")) : undefined,
      alasan_pindah: formData.get("alasan_pindah")?.toString() || undefined,
    };

    const parsed = MovePlacementSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        message: "Validasi pemindahan rombel gagal.",
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const moved = await rombelPlacementService.movePlacement(
      actor.sekolah_id,
      parsed.data as any,
      actor.id,
      actor.peran_dasar
    );

    revalidatePath("/data-siswa");
    return {
      success: true,
      message: `Siswa "${moved.siswa_nama}" berhasil dipindahkan ke rombel "${moved.rombel_nama}".`,
      data: moved,
    };
  } catch (error) {
    if (error instanceof StudentDomainError) {
      return { success: false, message: error.message };
    }
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Terjadi kesalahan saat memindahkan rombel.",
    };
  }
}

export async function bulkPlacementAction(
  targetRombelId: string,
  keikutsertaanIds: string[]
): Promise<StudentActionResult> {
  try {
    const actor = await requireAuth();
    if (!actor.sekolah_id) {
      return { success: false, message: "Konteks sekolah tidak valid." };
    }

    await requirePermission("academic.students.manage", {
      sekolah_id: actor.sekolah_id,
    });

    const parsed = BulkPlacementSchema.safeParse({
      target_rombel_id: targetRombelId,
      keikutsertaan_ids: keikutsertaanIds,
    });

    if (!parsed.success) {
      return {
        success: false,
        message: "Validasi penempatan massal gagal.",
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const result = await rombelPlacementService.bulkPlacement(
      actor.sekolah_id,
      parsed.data,
      actor.id,
      actor.peran_dasar
    );

    revalidatePath("/data-siswa");
    return {
      success: true,
      message: `Berhasil menempatkan ${result.placedCount} siswa ke rombel tujuan.`,
      data: result,
    };
  } catch (error) {
    if (error instanceof StudentDomainError) {
      return { success: false, message: error.message };
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan saat penempatan massal.",
    };
  }
}

export async function deletePlacementAction(id: string): Promise<StudentActionResult> {
  try {
    const actor = await requireAuth();
    if (!actor.sekolah_id) {
      return { success: false, message: "Konteks sekolah tidak valid." };
    }

    await requirePermission("academic.students.manage", {
      sekolah_id: actor.sekolah_id,
    });

    await rombelPlacementService.deletePlacement(id, actor.sekolah_id, actor.id, actor.peran_dasar);

    revalidatePath("/data-siswa");
    return {
      success: true,
      message: "Penempatan rombel siswa berhasil dihapus.",
    };
  } catch (error) {
    if (error instanceof StudentDomainError) {
      return { success: false, message: error.message };
    }
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan sistem saat menghapus penempatan rombel.",
    };
  }
}

// =========================================================================
// 4. LIFECYCLE ACTIONS (PROMOTION, GRADUATION, TRANSFER)
// =========================================================================

export async function promoteStudentAction(
  _prevState: unknown,
  formData: FormData
): Promise<StudentActionResult> {
  try {
    const actor = await requireAuth();
    if (!actor.sekolah_id) {
      return { success: false, message: "Konteks sekolah tidak valid." };
    }

    await requirePermission("academic.students.manage", {
      sekolah_id: actor.sekolah_id,
    });

    const rawData = {
      siswa_id: formData.get("siswa_id")?.toString(),
      source_enrollment_id: formData.get("source_enrollment_id")?.toString(),
      target_tahun_ajaran_id: formData.get("target_tahun_ajaran_id")?.toString(),
      target_tingkat_id: formData.get("target_tingkat_id")?.toString(),
      target_rombel_id: formData.get("target_rombel_id")?.toString() || undefined,
      status_enrollment_lama: (formData.get("status_enrollment_lama")?.toString() ||
        "NAIK_KELAS") as any,
      catatan: formData.get("catatan")?.toString() || undefined,
    };

    const parsed = PromoteStudentSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        message: "Validasi promosi kenaikan kelas gagal.",
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const promoted = await studentLifecycleService.promoteStudent(
      actor.sekolah_id,
      parsed.data as any,
      actor.id,
      actor.peran_dasar
    );

    revalidatePath("/data-siswa");
    return {
      success: true,
      message: `Proses kenaikan kelas siswa "${promoted.siswa_nama}" berhasil diselesaikan.`,
      data: promoted,
    };
  } catch (error) {
    if (error instanceof StudentDomainError) {
      return { success: false, message: error.message };
    }
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Terjadi kesalahan saat proses promosi siswa.",
    };
  }
}

export async function graduateStudentAction(
  _prevState: unknown,
  formData: FormData
): Promise<StudentActionResult> {
  try {
    const actor = await requireAuth();
    if (!actor.sekolah_id) {
      return { success: false, message: "Konteks sekolah tidak valid." };
    }

    await requirePermission("academic.students.manage", {
      sekolah_id: actor.sekolah_id,
    });

    const rawData = {
      siswa_id: formData.get("siswa_id")?.toString(),
      source_enrollment_id: formData.get("source_enrollment_id")?.toString(),
      tanggal_lulus: formData.get("tanggal_lulus")?.toString() || undefined,
      catatan: formData.get("catatan")?.toString() || undefined,
    };

    const parsed = GraduateStudentSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        message: "Validasi kelulusan siswa gagal.",
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    await studentLifecycleService.graduateStudent(
      actor.sekolah_id,
      parsed.data as any,
      actor.id,
      actor.peran_dasar
    );

    revalidatePath("/data-siswa");
    return {
      success: true,
      message: "Kelulusan siswa berhasil dicatat dan status akademik diperbarui.",
    };
  } catch (error) {
    if (error instanceof StudentDomainError) {
      return { success: false, message: error.message };
    }
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Terjadi kesalahan saat mencatat kelulusan.",
    };
  }
}

export async function transferOutStudentAction(
  _prevState: unknown,
  formData: FormData
): Promise<StudentActionResult> {
  try {
    const actor = await requireAuth();
    if (!actor.sekolah_id) {
      return { success: false, message: "Konteks sekolah tidak valid." };
    }

    await requirePermission("academic.students.manage", {
      sekolah_id: actor.sekolah_id,
    });

    const rawData = {
      siswa_id: formData.get("siswa_id")?.toString(),
      source_enrollment_id: formData.get("source_enrollment_id")?.toString(),
      tanggal_keluar: formData.get("tanggal_keluar")?.toString() || undefined,
      alasan_keluar: formData.get("alasan_keluar")?.toString() || "",
      sekolah_tujuan: formData.get("sekolah_tujuan")?.toString() || undefined,
    };

    const parsed = TransferOutStudentSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        message: "Validasi mutasi keluar siswa gagal.",
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    await studentLifecycleService.transferOutStudent(
      actor.sekolah_id,
      parsed.data as any,
      actor.id,
      actor.peran_dasar
    );

    revalidatePath("/data-siswa");
    return {
      success: true,
      message: "Mutasi keluar siswa berhasil dicatat dan status akademik diperbarui.",
    };
  } catch (error) {
    if (error instanceof StudentDomainError) {
      return { success: false, message: error.message };
    }
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Terjadi kesalahan saat memproses mutasi siswa.",
    };
  }
}

export async function getStudentTimelineAction(siswaId: string) {
  try {
    const actor = await requireAuth();
    if (!actor.sekolah_id) {
      return { success: false, message: "Konteks sekolah tidak valid." };
    }

    await requirePermission("academic.students.view", {
      sekolah_id: actor.sekolah_id,
    });

    const history = await studentLifecycleService.getStudentAcademicTimeline(
      siswaId,
      actor.sekolah_id
    );

    return {
      success: true,
      data: history,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal memuat riwayat akademik siswa.",
    };
  }
}
