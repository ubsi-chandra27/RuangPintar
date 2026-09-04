"use server";

/**
 * Ruang Pintar — M11 Learning Server Actions
 */

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { requirePermission } from "@/shared/infrastructure/authorization/authz-guard";
import { learningService } from "@/modules/learning/application/learning-service";
import { LocalStorageAdapter } from "@/shared/infrastructure/storage/local-storage-adapter";

export interface LearningActionResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

function getSafeErrorMessage(error: any): string {
  if (error?.name?.includes("Error")) {
    return error.message;
  }
  return "Terjadi kesalahan saat memproses data pembelajaran.";
}

// ==========================================
// LINGKUP MATERI (BAB)
// ==========================================

export async function createLingkupMateriAction(
  _prevState: any,
  formData: FormData
): Promise<LearningActionResult> {
  try {
    const user = await requireAuth();
    await requirePermission("learning.material.manage");
    if (!user.sekolah_id) return { success: false, message: "Konteks sekolah tidak valid." };

    const penugasanId = formData.get("penugasan_mengajar_id") as string;
    const created = await learningService.createLingkupMateri(user.id, user.peran_dasar, {
      sekolah_id: user.sekolah_id,
      penugasan_mengajar_id: penugasanId,
      kode: (formData.get("kode") as string) || null,
      judul: formData.get("judul") as string,
      deskripsi: (formData.get("deskripsi") as string) || null,
      urutan: Number(formData.get("urutan")) || 1,
    });

    revalidatePath(`/kelas-saya/${penugasanId}`);
    revalidatePath("/kelas-saya");
    return {
      success: true,
      message: `BAB '${created.judul}' berhasil ditambahkan.`,
      data: created,
    };
  } catch (err) {
    return { success: false, message: getSafeErrorMessage(err) };
  }
}

export async function updateLingkupMateriAction(
  _prevState: any,
  formData: FormData
): Promise<LearningActionResult> {
  try {
    const user = await requireAuth();
    await requirePermission("learning.material.manage");
    if (!user.sekolah_id) return { success: false, message: "Konteks sekolah tidak valid." };

    const id = formData.get("id") as string;
    const penugasanId = formData.get("penugasan_mengajar_id") as string;

    const updated = await learningService.updateLingkupMateri(
      user.id,
      user.peran_dasar,
      id,
      user.sekolah_id,
      {
        kode: (formData.get("kode") as string) || null,
        judul: (formData.get("judul") as string) || undefined,
        deskripsi: (formData.get("deskripsi") as string) || null,
        urutan: formData.get("urutan") ? Number(formData.get("urutan")) : undefined,
        status: (formData.get("status") as any) || undefined,
      }
    );

    revalidatePath(`/kelas-saya/${penugasanId}`);
    revalidatePath("/kelas-saya");
    return {
      success: true,
      message: `BAB '${updated.judul}' berhasil diperbarui.`,
      data: updated,
    };
  } catch (err) {
    return { success: false, message: getSafeErrorMessage(err) };
  }
}

export async function deleteLingkupMateriAction(
  id: string,
  penugasanId: string
): Promise<LearningActionResult> {
  try {
    const user = await requireAuth();
    await requirePermission("learning.material.manage");
    if (!user.sekolah_id) return { success: false, message: "Konteks sekolah tidak valid." };

    await learningService.deleteLingkupMateri(user.id, user.peran_dasar, id, user.sekolah_id);

    revalidatePath(`/kelas-saya/${penugasanId}`);
    revalidatePath("/kelas-saya");
    return {
      success: true,
      message: "BAB berhasil dihapus.",
    };
  } catch (err) {
    return { success: false, message: getSafeErrorMessage(err) };
  }
}

// ==========================================
// TUJUAN PEMBELAJARAN (TP)
// ==========================================

export async function createTujuanPembelajaranAction(
  _prevState: any,
  formData: FormData
): Promise<LearningActionResult> {
  try {
    const user = await requireAuth();
    await requirePermission("learning.material.manage");
    if (!user.sekolah_id) return { success: false, message: "Konteks sekolah tidak valid." };

    const penugasanId = formData.get("penugasan_mengajar_id") as string;
    const created = await learningService.createTujuanPembelajaran(user.id, user.peran_dasar, {
      sekolah_id: user.sekolah_id,
      lingkup_materi_id: formData.get("lingkup_materi_id") as string,
      kode: (formData.get("kode") as string) || null,
      deskripsi: formData.get("deskripsi") as string,
      urutan: Number(formData.get("urutan")) || 1,
    });

    revalidatePath(`/kelas-saya/${penugasanId}`);
    return {
      success: true,
      message: `Tujuan Pembelajaran berhasil ditambahkan.`,
      data: created,
    };
  } catch (err) {
    return { success: false, message: getSafeErrorMessage(err) };
  }
}

export async function updateTujuanPembelajaranAction(
  _prevState: any,
  formData: FormData
): Promise<LearningActionResult> {
  try {
    const user = await requireAuth();
    await requirePermission("learning.material.manage");
    if (!user.sekolah_id) return { success: false, message: "Konteks sekolah tidak valid." };

    const id = formData.get("id") as string;
    const penugasanId = formData.get("penugasan_mengajar_id") as string;

    const updated = await learningService.updateTujuanPembelajaran(
      user.id,
      user.peran_dasar,
      id,
      user.sekolah_id,
      {
        kode: (formData.get("kode") as string) || null,
        deskripsi: (formData.get("deskripsi") as string) || undefined,
        urutan: formData.get("urutan") ? Number(formData.get("urutan")) : undefined,
      }
    );

    revalidatePath(`/kelas-saya/${penugasanId}`);
    return {
      success: true,
      message: "Tujuan Pembelajaran berhasil diperbarui.",
      data: updated,
    };
  } catch (err) {
    return { success: false, message: getSafeErrorMessage(err) };
  }
}

export async function deleteTujuanPembelajaranAction(
  id: string,
  penugasanId: string
): Promise<LearningActionResult> {
  try {
    const user = await requireAuth();
    await requirePermission("learning.material.manage");
    if (!user.sekolah_id) return { success: false, message: "Konteks sekolah tidak valid." };

    await learningService.deleteTujuanPembelajaran(user.id, user.peran_dasar, id, user.sekolah_id);

    revalidatePath(`/kelas-saya/${penugasanId}`);
    return {
      success: true,
      message: "Tujuan Pembelajaran berhasil dihapus.",
    };
  } catch (err) {
    return { success: false, message: getSafeErrorMessage(err) };
  }
}

// ==========================================
// MATERI PEMBELAJARAN
// ==========================================

export async function createMateriAction(
  _prevState: any,
  formData: FormData
): Promise<LearningActionResult> {
  try {
    const user = await requireAuth();
    await requirePermission("learning.material.manage");
    if (!user.sekolah_id) return { success: false, message: "Konteks sekolah tidak valid." };

    const penugasanId = formData.get("penugasan_mengajar_id") as string;
    const guruId = formData.get("guru_id") as string;

    let berkasId: string | null = (formData.get("berkas_id") as string) || null;
    const file = formData.get("file") as File | null;
    if (
      file &&
      typeof file === "object" &&
      file.size > 0 &&
      typeof file.arrayBuffer === "function"
    ) {
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

    const created = await learningService.createMateri(user.id, user.peran_dasar, {
      sekolah_id: user.sekolah_id,
      guru_id: guruId,
      penugasan_mengajar_id: penugasanId,
      lingkup_materi_id: (formData.get("lingkup_materi_id") as string) || null,
      mata_pelajaran_id: (formData.get("mata_pelajaran_id") as string) || null,
      judul: formData.get("judul") as string,
      deskripsi: (formData.get("deskripsi") as string) || null,
      tipe_konten: (formData.get("tipe_konten") as any) || "DOKUMEN",
      konten_teks: (formData.get("konten_teks") as string) || null,
      tautan_url: (formData.get("tautan_url") as string) || null,
      berkas_id: berkasId,
      publish_langsung: formData.get("publish_langsung") !== "false",
    });

    revalidatePath(`/kelas-saya/${penugasanId}`);
    revalidatePath("/kelas-saya");
    return {
      success: true,
      message: `Materi '${created.judul}' berhasil diterbitkan.`,
      data: created,
    };
  } catch (err) {
    return { success: false, message: getSafeErrorMessage(err) };
  }
}

export async function deleteMateriAction(
  id: string,
  penugasanId: string
): Promise<LearningActionResult> {
  try {
    const user = await requireAuth();
    await requirePermission("learning.material.manage");
    if (!user.sekolah_id) return { success: false, message: "Konteks sekolah tidak valid." };

    await learningService.deleteMateri(user.id, user.peran_dasar, id, user.sekolah_id);

    revalidatePath(`/kelas-saya/${penugasanId}`);
    revalidatePath("/kelas-saya");
    return {
      success: true,
      message: "Materi berhasil dihapus.",
    };
  } catch (err) {
    return { success: false, message: getSafeErrorMessage(err) };
  }
}

// ==========================================
// TUGAS PEMBELAJARAN
// ==========================================

export async function createTugasAction(
  _prevState: any,
  formData: FormData
): Promise<LearningActionResult> {
  try {
    const user = await requireAuth();
    await requirePermission("learning.assignment.manage");
    if (!user.sekolah_id) return { success: false, message: "Konteks sekolah tidak valid." };

    const penugasanId = formData.get("penugasan_mengajar_id") as string;
    const guruId = formData.get("guru_id") as string;

    const created = await learningService.createTugas(user.id, user.peran_dasar, {
      sekolah_id: user.sekolah_id,
      guru_id: guruId,
      penugasan_mengajar_id: penugasanId,
      lingkup_materi_id: (formData.get("lingkup_materi_id") as string) || null,
      mata_pelajaran_id: (formData.get("mata_pelajaran_id") as string) || null,
      judul: formData.get("judul") as string,
      petunjuk: formData.get("petunjuk") as string,
      tipe_penyerahan: (formData.get("tipe_penyerahan") as any) || "FILE",
      berkas_id: (formData.get("berkas_id") as string) || null,
      tanggal_mulai: (formData.get("tanggal_mulai") as string) || new Date(),
      batas_waktu: (formData.get("batas_waktu") as string) || null,
      izinkan_terlambat: formData.get("izinkan_terlambat") === "true",
    });

    revalidatePath(`/kelas-saya/${penugasanId}`);
    revalidatePath("/kelas-saya");
    return {
      success: true,
      message: `Tugas '${created.judul}' berhasil diterbitkan ke kelas.`,
      data: created,
    };
  } catch (err) {
    return { success: false, message: getSafeErrorMessage(err) };
  }
}

export async function deleteTugasAction(
  id: string,
  penugasanId: string
): Promise<LearningActionResult> {
  try {
    const user = await requireAuth();
    await requirePermission("learning.assignment.manage");
    if (!user.sekolah_id) return { success: false, message: "Konteks sekolah tidak valid." };

    await learningService.deleteTugas(user.id, user.peran_dasar, id, user.sekolah_id);

    revalidatePath(`/kelas-saya/${penugasanId}`);
    revalidatePath("/kelas-saya");
    return {
      success: true,
      message: "Tugas berhasil dihapus.",
    };
  } catch (err) {
    return { success: false, message: getSafeErrorMessage(err) };
  }
}

// ==========================================
// ADMINISTRASI PEMBELAJARAN (JURNAL KBM)
// ==========================================

export async function createAdministrasiAction(
  _prevState: any,
  formData: FormData
): Promise<LearningActionResult> {
  try {
    const user = await requireAuth();
    await requirePermission("learning.material.manage");
    if (!user.sekolah_id) return { success: false, message: "Konteks sekolah tidak valid." };

    const penugasanId = formData.get("penugasan_mengajar_id") as string;
    const guruId = formData.get("guru_id") as string;
    const tpIdsRaw = formData.getAll("tp_ids") as string[];

    const created = await learningService.createAdministrasi(user.id, user.peran_dasar, {
      sekolah_id: user.sekolah_id,
      penugasan_mengajar_id: penugasanId,
      sesi_kelas_aktual_id: (formData.get("sesi_kelas_aktual_id") as string) || null,
      guru_id: guruId,
      tanggal: (formData.get("tanggal") as string) || new Date(),
      pertemuan_ke: Number(formData.get("pertemuan_ke")) || 1,
      materi_disampaikan: formData.get("materi_disampaikan") as string,
      kegiatan_pembelajaran: (formData.get("kegiatan_pembelajaran") as string) || null,
      catatan_refleksi: (formData.get("catatan_refleksi") as string) || null,
      status_realisasi: (formData.get("status_realisasi") as any) || "TERLAKSANA",
      tp_ids: tpIdsRaw.filter(Boolean),
    });

    revalidatePath(`/kelas-saya/${penugasanId}`);
    revalidatePath("/kelas-saya");
    return {
      success: true,
      message: `Jurnal KBM Pertemuan ke-${created.pertemuan_ke} berhasil disimpan.`,
      data: created,
    };
  } catch (err) {
    return { success: false, message: getSafeErrorMessage(err) };
  }
}

export async function deleteAdministrasiAction(
  id: string,
  penugasanId: string
): Promise<LearningActionResult> {
  try {
    const user = await requireAuth();
    await requirePermission("learning.material.manage");
    if (!user.sekolah_id) return { success: false, message: "Konteks sekolah tidak valid." };

    await learningService.deleteAdministrasi(user.id, user.peran_dasar, id, user.sekolah_id);

    revalidatePath(`/kelas-saya/${penugasanId}`);
    revalidatePath("/kelas-saya");
    return {
      success: true,
      message: "Catatan jurnal KBM berhasil dihapus.",
    };
  } catch (err) {
    return { success: false, message: getSafeErrorMessage(err) };
  }
}
