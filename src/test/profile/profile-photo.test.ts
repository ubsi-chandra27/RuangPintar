import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/shared/infrastructure/database/prisma";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { updateProfileSelfAction } from "@/app/actions/profile-actions";
import * as authGuard from "@/shared/infrastructure/auth/auth-guard";

describe("Self-Service Profile Photo Feature", () => {
  const testUserId = "user-test-photo-01";
  const testTeacherId = "guru-test-photo-01";
  const testSchoolId = "sekolah-test-photo-01";

  beforeEach(async () => {
    // Clean up
    await prisma.guru.deleteMany({ where: { id: testTeacherId } });
    await prisma.pengguna.deleteMany({ where: { id: testUserId } });
    await prisma.sekolah.deleteMany({ where: { id: testSchoolId } });

    // Seed test school
    await prisma.sekolah.create({
      data: {
        id: testSchoolId,
        nama: "SMA Negeri 1 Photo Test",
        jenjang: "SMA",
      },
    });

    // Seed test teacher user
    await prisma.pengguna.create({
      data: {
        id: testUserId,
        sekolah_id: testSchoolId,
        username: "guru_phototest",
        email: "guru_photo@sekolah.sch.id",
        password_hash: "hash_placeholder",
        nama_lengkap: "Budi Santoso, M.Pd.",
        peran_dasar: "TEACHER",
        status_akun: "AKTIF",
        foto_url: null,
      },
    });

    // Seed test teacher record
    await prisma.guru.create({
      data: {
        id: testTeacherId,
        sekolah_id: testSchoolId,
        pengguna_id: testUserId,
        nama_lengkap: "Budi Santoso",
        gelar_belakang: "M.Pd.",
        jenis_kelamin: "L",
        email: "guru_photo@sekolah.sch.id",
        telepon: "08123456789",
        foto_url: null,
      },
    });

    // Mock requireAuth
    vi.spyOn(authGuard, "requireAuth").mockResolvedValue({
      id: testUserId,
      sekolah_id: testSchoolId,
      username: "guru_phototest",
      email: "guru_photo@sekolah.sch.id",
      nama_lengkap: "Budi Santoso, M.Pd.",
      peran_dasar: "TEACHER",
      status_akun: "AKTIF",
      harus_ganti_password: false,
    });
  });

  it("berhasil mengunggah foto profil dan mensinkronisasikannya ke tabel Pengguna dan Guru", async () => {
    const fakeBase64 = "data:image/jpeg;base64,samplephoto123456789";
    const formData = new FormData();
    formData.append("username", "guru_phototest");
    formData.append("email", "guru_photo@sekolah.sch.id");
    formData.append("telepon", "08123456789");
    formData.append("alamat", "Jl. Merdeka No. 10");
    formData.append("foto_url", fakeBase64);

    const result = await updateProfileSelfAction(null, formData);
    expect(result.success).toBe(true);

    // Verify Pengguna updated
    const userAfter = await prisma.pengguna.findUnique({
      where: { id: testUserId },
    });
    expect(userAfter?.foto_url).toBe(fakeBase64);

    // Verify Guru synced
    const guruAfter = await prisma.guru.findUnique({
      where: { id: testTeacherId },
    });
    expect(guruAfter?.foto_url).toBe(fakeBase64);
  });

  it("berhasil menghapus foto profil (kembali ke inisial)", async () => {
    // First set photo
    await prisma.pengguna.update({
      where: { id: testUserId },
      data: { foto_url: "data:image/jpeg;base64,initialphoto" },
    });
    await prisma.guru.update({
      where: { id: testTeacherId },
      data: { foto_url: "data:image/jpeg;base64,initialphoto" },
    });

    // Send empty foto_url to remove
    const formData = new FormData();
    formData.append("username", "guru_phototest");
    formData.append("email", "guru_photo@sekolah.sch.id");
    formData.append("foto_url", "");

    const result = await updateProfileSelfAction(null, formData);
    expect(result.success).toBe(true);

    const userAfter = await prisma.pengguna.findUnique({
      where: { id: testUserId },
    });
    expect(userAfter?.foto_url).toBeNull();

    const guruAfter = await prisma.guru.findUnique({
      where: { id: testTeacherId },
    });
    expect(guruAfter?.foto_url).toBeNull();
  });

  it("merender komponen ProfileView dengan tombol upload foto dan inisial fallback", async () => {
    const React = await import("react");
    const { render, screen } = await import("@testing-library/react");
    const { ProfileView } = await import("@/modules/profile/presentation/profile-view");

    render(
      React.createElement(ProfileView, {
        user: {
          id: testUserId,
          username: "guru_phototest",
          email: "guru_photo@sekolah.sch.id",
          nama_lengkap: "Budi Santoso",
          peran_dasar: "TEACHER",
          status_akun: "AKTIF",
          created_at: new Date(),
          terakhir_login_pada: null,
          foto_url: null,
        },
        schoolName: "SMA Negeri 1 Photo Test",
        teacherProfile: null,
      })
    );

    // Initial fallback should render "BS"
    expect(screen.getAllByText("BS").length).toBeGreaterThan(0);
    // Foto Profil section should be visible
    expect(screen.getByText("Foto Profil Akun")).toBeDefined();
    expect(screen.getByText("Unggah Foto")).toBeDefined();
  });

  it("merender foto profil yang sudah tersimpan pada ProfileView", async () => {
    const React = await import("react");
    const { render, screen } = await import("@testing-library/react");
    const { ProfileView } = await import("@/modules/profile/presentation/profile-view");

    render(
      React.createElement(ProfileView, {
        user: {
          id: testUserId,
          username: "guru_phototest",
          email: "guru_photo@sekolah.sch.id",
          nama_lengkap: "Budi Santoso",
          peran_dasar: "TEACHER",
          status_akun: "AKTIF",
          created_at: new Date(),
          terakhir_login_pada: null,
          foto_url: "https://example.com/avatar.jpg",
        },
        schoolName: "SMA Negeri 1 Photo Test",
        teacherProfile: null,
      })
    );

    // Should show "Ganti Foto" and "Hapus Foto"
    expect(screen.getByText("Ganti Foto")).toBeDefined();
    expect(screen.getByText("Hapus Foto")).toBeDefined();
    expect(screen.getByText("Terpasang")).toBeDefined();
  });
});
