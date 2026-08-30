import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { programService } from "@/modules/academic/application/program-service";
import {
  DuplicateProgramError,
  ProgramNotFoundError,
} from "@/modules/academic/domain/academic-errors";
import { ulid } from "ulidx";

describe("M06 — Program Service", () => {
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

  it("berhasil membuat dan memperbarui program keahlian", async () => {
    const prog = await programService.createProgram(
      sekolahId,
      {
        kode: "RPL",
        nama: "Rekayasa Perangkat Lunak",
        jenjang: "SMK",
        status_aktif: true,
      },
      actorId,
      actorRole
    );

    expect(prog.id).toBeDefined();
    expect(prog.kode).toBe("RPL");
    expect(prog.status_aktif).toBe(true);

    const updated = await programService.updateProgram(
      prog.id,
      sekolahId,
      {
        nama: "Pengembangan Perangkat Lunak dan Gim",
      },
      actorId,
      actorRole
    );

    expect(updated.nama).toBe("Pengembangan Perangkat Lunak dan Gim");
  });

  it("gagal membuat program dengan kode duplikat", async () => {
    await programService.createProgram(
      sekolahId,
      {
        kode: "TKJ",
        nama: "Teknik Komputer dan Jaringan",
      },
      actorId,
      actorRole
    );

    await expect(
      programService.createProgram(
        sekolahId,
        {
          kode: "TKJ",
          nama: "Teknik Komputer & Jaringan Duplikat",
        },
        actorId,
        actorRole
      )
    ).rejects.toThrow(DuplicateProgramError);
  });

  it("gagal mengambil program yang tidak terdaftar", async () => {
    await expect(programService.getProgramById("PROG_TIDAK_ADA", sekolahId)).rejects.toThrow(
      ProgramNotFoundError
    );
  });
});
