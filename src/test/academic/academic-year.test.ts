import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { academicYearService } from "@/modules/academic/application/academic-year-service";
import {
  DuplicateAcademicYearError,
  HistoryProtectedError,
  InvalidDateRangeError,
} from "@/modules/academic/domain/academic-errors";
import { ulid } from "ulidx";

describe("M06 — Academic Year Service", () => {
  let sekolahId: string;
  const actorId = "USR_" + ulid();
  const actorRole = "SUPER_ADMIN";

  beforeEach(async () => {
    sekolahId = ulid();
    await prisma.sekolah.create({
      data: {
        id: sekolahId,
        nama: `SMK Negeri ${sekolahId.substring(0, 6)}`,
        npsn: String(Math.floor(10000000 + Math.random() * 89999999)),
        jenjang: "SMK",
        zona_waktu: "Asia/Jakarta",
      },
    });
  });

  it("berhasil membuat tahun ajaran dengan tanggal valid dan status default DRAFT", async () => {
    const year = await academicYearService.createAcademicYear(
      sekolahId,
      {
        nama: "2026/2027",
        kode: "TA-2026-2027",
        tanggal_mulai: "2026-07-01",
        tanggal_selesai: "2027-06-30",
        status: "DRAFT",
      },
      actorId,
      actorRole
    );

    expect(year.id).toBeDefined();
    expect(year.nama).toBe("2026/2027");
    expect(year.status).toBe("DRAFT");
    expect(year.sekolah_id).toBe(sekolahId);
  });

  it("gagal membuat tahun ajaran jika tanggal mulai >= tanggal selesai", async () => {
    await expect(
      academicYearService.createAcademicYear(
        sekolahId,
        {
          nama: "2026/2027",
          tanggal_mulai: "2027-07-01",
          tanggal_selesai: "2026-06-30",
        },
        actorId,
        actorRole
      )
    ).rejects.toThrow(InvalidDateRangeError);
  });

  it("gagal membuat tahun ajaran duplikat pada sekolah yang sama", async () => {
    await academicYearService.createAcademicYear(
      sekolahId,
      {
        nama: "2026/2027",
        tanggal_mulai: "2026-07-01",
        tanggal_selesai: "2027-06-30",
      },
      actorId,
      actorRole
    );

    await expect(
      academicYearService.createAcademicYear(
        sekolahId,
        {
          nama: "2026/2027",
          tanggal_mulai: "2026-07-01",
          tanggal_selesai: "2027-06-30",
        },
        actorId,
        actorRole
      )
    ).rejects.toThrow(DuplicateAcademicYearError);
  });

  it("mengaktifkan tahun ajaran baru dan menonaktifkan/menyelesaikan tahun ajaran aktif sebelumnya", async () => {
    const year1 = await academicYearService.createAcademicYear(
      sekolahId,
      {
        nama: "2025/2026",
        tanggal_mulai: "2025-07-01",
        tanggal_selesai: "2026-06-30",
        status: "AKTIF",
      },
      actorId,
      actorRole
    );

    const year2 = await academicYearService.createAcademicYear(
      sekolahId,
      {
        nama: "2026/2027",
        tanggal_mulai: "2026-07-01",
        tanggal_selesai: "2027-06-30",
        status: "DRAFT",
      },
      actorId,
      actorRole
    );

    // Aktifkan year 2
    const activated = await academicYearService.activateAcademicYear(
      year2.id,
      sekolahId,
      actorId,
      actorRole
    );
    expect(activated.status).toBe("AKTIF");

    // Verifikasi year 1 berubah jadi SELESAI
    const oldYear = await academicYearService.getAcademicYearById(year1.id, sekolahId);
    expect(oldYear.status).toBe("SELESAI");
  });

  it("melindungi tahun ajaran dari penghapusan jika memiliki semester atau rombel terhubung", async () => {
    const year = await academicYearService.createAcademicYear(
      sekolahId,
      {
        nama: "2026/2027",
        tanggal_mulai: "2026-07-01",
        tanggal_selesai: "2027-06-30",
      },
      actorId,
      actorRole
    );

    // Hubungkan semester manual
    await prisma.semester.create({
      data: {
        id: ulid(),
        sekolah_id: sekolahId,
        tahun_ajaran_id: year.id,
        nama: "Semester Ganjil",
        kode: "GANJIL",
        urutan: 1,
        tanggal_mulai: new Date("2026-07-01"),
        tanggal_selesai: new Date("2026-12-31"),
        status: "DRAFT",
      },
    });

    await expect(
      academicYearService.deleteAcademicYear(year.id, sekolahId, actorId, actorRole)
    ).rejects.toThrow(HistoryProtectedError);
  });
});
