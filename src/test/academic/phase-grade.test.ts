import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { phaseGradeService } from "@/modules/academic/application/phase-grade-service";
import {
  DuplicateGradeLevelError,
  DuplicatePhaseError,
  PhaseNotFoundError,
} from "@/modules/academic/domain/academic-errors";
import { ulid } from "ulidx";

describe("M06 — Phase & Grade Level Service", () => {
  let sekolahId: string;
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
  });

  it("berhasil membuat fase dan tingkat kelas yang terhubung", async () => {
    const phase = await phaseGradeService.createPhase(
      sekolahId,
      {
        nama: "Fase E",
        kode: "FASE_E",
        deskripsi: "Tingkat Kelas 10",
        urutan: 5,
      },
      actorId,
      actorRole
    );

    expect(phase.id).toBeDefined();
    expect(phase.kode).toBe("FASE_E");

    const grade = await phaseGradeService.createGradeLevel(
      sekolahId,
      {
        nama: "Kelas 10",
        kode: "10",
        fase_id: phase.id,
        urutan: 10,
      },
      actorId,
      actorRole
    );

    expect(grade.id).toBeDefined();
    expect(grade.fase_id).toBe(phase.id);
    expect(grade.fase_nama).toBe("Fase E");
  });

  it("gagal membuat fase dengan kode duplikat", async () => {
    await phaseGradeService.createPhase(
      sekolahId,
      {
        nama: "Fase E",
        kode: "FASE_E",
      },
      actorId,
      actorRole
    );

    await expect(
      phaseGradeService.createPhase(
        sekolahId,
        {
          nama: "Fase E Cadangan",
          kode: "FASE_E",
        },
        actorId,
        actorRole
      )
    ).rejects.toThrow(DuplicatePhaseError);
  });

  it("gagal membuat tingkat kelas jika fase_id tidak ditemukan", async () => {
    await expect(
      phaseGradeService.createGradeLevel(
        sekolahId,
        {
          nama: "Kelas 10",
          kode: "10",
          fase_id: "FASE_TIDAK_ADA",
        },
        actorId,
        actorRole
      )
    ).rejects.toThrow(PhaseNotFoundError);
  });

  it("gagal membuat tingkat kelas dengan kode duplikat", async () => {
    await phaseGradeService.createGradeLevel(
      sekolahId,
      {
        nama: "Kelas 10",
        kode: "10",
      },
      actorId,
      actorRole
    );

    await expect(
      phaseGradeService.createGradeLevel(
        sekolahId,
        {
          nama: "Kelas Sepuluh",
          kode: "10",
        },
        actorId,
        actorRole
      )
    ).rejects.toThrow(DuplicateGradeLevelError);
  });
});
