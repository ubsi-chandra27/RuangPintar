import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { academicYearService } from "@/modules/academic/application/academic-year-service";
import { semesterService } from "@/modules/academic/application/semester-service";
import {
  DuplicateSemesterError,
  InvalidDateRangeError,
  SemesterOutOfBoundsError,
} from "@/modules/academic/domain/academic-errors";
import { ulid } from "ulidx";

describe("M06 — Semester Service", () => {
  let sekolahId: string;
  let yearId: string;
  const actorId = "USR_" + ulid();
  const actorRole = "SUPER_ADMIN";

  beforeEach(async () => {
    sekolahId = ulid();
    await prisma.sekolah.create({
      data: {
        id: sekolahId,
        nama: `SMA Negeri ${sekolahId.substring(0, 6)}`,
        npsn: String(Math.floor(10000000 + Math.random() * 89999999)),
        jenjang: "SMA",
        zona_waktu: "Asia/Jakarta",
      },
    });

    const year = await academicYearService.createAcademicYear(
      sekolahId,
      {
        nama: "2026/2027",
        tanggal_mulai: "2026-07-01",
        tanggal_selesai: "2027-06-30",
        status: "AKTIF",
      },
      actorId,
      actorRole
    );
    yearId = year.id;
  });

  it("berhasil membuat semester di dalam rentang tahun ajaran", async () => {
    const sem = await semesterService.createSemester(
      sekolahId,
      {
        tahun_ajaran_id: yearId,
        nama: "Semester Ganjil",
        kode: "GANJIL",
        urutan: 1,
        tanggal_mulai: "2026-07-01",
        tanggal_selesai: "2026-12-31",
      },
      actorId,
      actorRole
    );

    expect(sem.id).toBeDefined();
    expect(sem.nama).toBe("Semester Ganjil");
    expect(sem.kode).toBe("GANJIL");
    expect(sem.tahun_ajaran_id).toBe(yearId);
  });

  it("gagal membuat semester jika tanggal berada di luar rentang tahun ajaran", async () => {
    await expect(
      semesterService.createSemester(
        sekolahId,
        {
          tahun_ajaran_id: yearId,
          nama: "Semester Ganjil",
          kode: "GANJIL",
          urutan: 1,
          tanggal_mulai: "2025-01-01", // di luar 2026-07-01
          tanggal_selesai: "2026-12-31",
        },
        actorId,
        actorRole
      )
    ).rejects.toThrow(SemesterOutOfBoundsError);
  });

  it("gagal membuat semester jika tanggal mulai >= tanggal selesai", async () => {
    await expect(
      semesterService.createSemester(
        sekolahId,
        {
          tahun_ajaran_id: yearId,
          nama: "Semester Ganjil",
          kode: "GANJIL",
          urutan: 1,
          tanggal_mulai: "2026-12-31",
          tanggal_selesai: "2026-07-01",
        },
        actorId,
        actorRole
      )
    ).rejects.toThrow(InvalidDateRangeError);
  });

  it("gagal membuat semester dengan kode duplikat pada tahun ajaran yang sama", async () => {
    await semesterService.createSemester(
      sekolahId,
      {
        tahun_ajaran_id: yearId,
        nama: "Semester Ganjil",
        kode: "GANJIL",
        urutan: 1,
        tanggal_mulai: "2026-07-01",
        tanggal_selesai: "2026-12-31",
      },
      actorId,
      actorRole
    );

    await expect(
      semesterService.createSemester(
        sekolahId,
        {
          tahun_ajaran_id: yearId,
          nama: "Semester Ganjil Baru",
          kode: "GANJIL",
          urutan: 1,
          tanggal_mulai: "2026-07-01",
          tanggal_selesai: "2026-12-31",
        },
        actorId,
        actorRole
      )
    ).rejects.toThrow(DuplicateSemesterError);
  });

  it("mengaktifkan semester baru dan menonaktifkan semester aktif sebelumnya", async () => {
    const sem1 = await semesterService.createSemester(
      sekolahId,
      {
        tahun_ajaran_id: yearId,
        nama: "Semester Ganjil",
        kode: "GANJIL",
        urutan: 1,
        tanggal_mulai: "2026-07-01",
        tanggal_selesai: "2026-12-31",
        status: "AKTIF",
      },
      actorId,
      actorRole
    );

    const sem2 = await semesterService.createSemester(
      sekolahId,
      {
        tahun_ajaran_id: yearId,
        nama: "Semester Genap",
        kode: "GENAP",
        urutan: 2,
        tanggal_mulai: "2027-01-01",
        tanggal_selesai: "2027-06-30",
        status: "DRAFT",
      },
      actorId,
      actorRole
    );

    const activated = await semesterService.activateSemester(
      sem2.id,
      sekolahId,
      actorId,
      actorRole
    );
    expect(activated.status).toBe("AKTIF");

    const oldSem = await semesterService.getSemesterById(sem1.id, sekolahId);
    expect(oldSem.status).toBe("SELESAI");
  });
});
