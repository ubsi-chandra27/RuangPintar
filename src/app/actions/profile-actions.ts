"use server";

/**
 * Ruang Pintar — Self-Service Profile Actions
 */

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { recordAuditEvent } from "@/shared/infrastructure/audit/audit-logger";

export interface ProfileActionResult {
  success: boolean;
  message: string;
}

export async function updateProfileSelfAction(
  _prevState: any,
  formData: FormData
): Promise<ProfileActionResult> {
  try {
    const user = await requireAuth();

    const username = (formData.get("username") as string)?.trim().toLowerCase();
    const email = (formData.get("email") as string)?.trim().toLowerCase() || null;
    const telepon = (formData.get("telepon") as string)?.trim() || null;
    const alamat = (formData.get("alamat") as string)?.trim() || null;
    const fotoUrlRaw = formData.get("foto_url") as string | null;
    const foto_url = fotoUrlRaw === "" ? null : (fotoUrlRaw ?? undefined);

    if (!username) {
      return { success: false, message: "Username tidak boleh kosong." };
    }

    if (username.length < 3 || username.length > 30) {
      return { success: false, message: "Username harus antara 3 hingga 30 karakter." };
    }

    const usernameRegex = /^[a-z0-9_.-]+$/;
    if (!usernameRegex.test(username)) {
      return {
        success: false,
        message: "Username hanya boleh berisi huruf kecil, angka, garis bawah, titik, dan strip.",
      };
    }

    // Check username uniqueness if changed
    if (username !== user.username) {
      const existingUser = await prisma.pengguna.findFirst({
        where: {
          username,
          NOT: { id: user.id },
        },
      });

      if (existingUser) {
        return { success: false, message: "Username sudah digunakan oleh akun lain." };
      }
    }

    // Check email uniqueness if changed
    if (email && email !== user.email) {
      const existingEmail = await prisma.pengguna.findFirst({
        where: {
          email,
          NOT: { id: user.id },
        },
      });

      if (existingEmail) {
        return { success: false, message: "Email sudah digunakan oleh akun lain." };
      }
    }

    // Update pengguna table
    await prisma.pengguna.update({
      where: { id: user.id },
      data: {
        username,
        email,
        ...(foto_url !== undefined ? { foto_url } : {}),
      },
    });

    // If user has a teacher domain profile, sync contact info & photo
    if (user.peran_dasar === "TEACHER") {
      const orConditions: Array<{ pengguna_id?: string; email?: string }> = [
        { pengguna_id: user.id },
      ];
      if (user.email) {
        orConditions.push({ email: user.email });
      }

      const guru = await prisma.guru.findFirst({
        where: {
          sekolah_id: user.sekolah_id || undefined,
          OR: orConditions,
        },
      });

      if (guru) {
        await prisma.guru.update({
          where: { id: guru.id },
          data: {
            pengguna_id: user.id, // Ensure explicit link
            email,
            telepon,
            alamat,
            ...(foto_url !== undefined ? { foto_url } : {}),
          },
        });
      }
    }

    // If user has a student domain profile, sync photo
    if (user.peran_dasar === "STUDENT") {
      await prisma.siswa.updateMany({
        where: { pengguna_id: user.id },
        data: {
          ...(foto_url !== undefined ? { foto_url } : {}),
        },
      });
    }

    // Audit log
    await recordAuditEvent({
      aktor_id: user.id,
      aktor_role: user.peran_dasar,
      aksi: "UPDATE_PROFILE_SELF",
      tipe_sumber: "PENGGUNA",
      id_sumber: user.id,
      sekolah_id: user.sekolah_id,
      payload_sesudah: { username, email, telepon, alamat },
    });

    revalidatePath("/profil");
    revalidatePath("/dashboard");
    revalidatePath("/kelas-saya");

    return {
      success: true,
      message: "Profil Anda berhasil diperbarui.",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Terjadi kesalahan saat menyimpan profil.",
    };
  }
}
