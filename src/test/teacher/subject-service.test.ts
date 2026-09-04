import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { generateUlid } from "@/shared/lib/ulid";
import { SubjectService } from "@/modules/teacher/application/subject-service";
import {
  SubjectCodeDuplicateError,
  SubjectNotFoundError,
} from "@/modules/teacher/domain/teacher-errors";

describe("SubjectService (M08)", () => {
  let sekolahId: string;

  beforeEach(async () => {
    sekolahId = generateUlid();
    await prisma.sekolah.create({
      data: {
        id: sekolahId,
        nama: `Test School Subject ${sekolahId.slice(-4)}`,
        jenjang: "SMK",
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should create a subject successfully", async () => {
    const subject = await SubjectService.createSubject({
      sekolah_id: sekolahId,
      kode: "mtk",
      nama: "Matematika Diskrit",
      kelompok: "KEJURUAN",
      deskripsi: "Logika matematika & aljabar boolean",
    });

    expect(subject.id).toBeDefined();
    expect(subject.kode).toBe("MTK"); // Auto uppercase
    expect(subject.nama).toBe("Matematika Diskrit");
    expect(subject.kelompok).toBe("KEJURUAN");
    expect(subject.status_aktif).toBe(true);
  });

  it("should reject duplicate subject kode within the same school", async () => {
    await SubjectService.createSubject({
      sekolah_id: sekolahId,
      kode: "BIN",
      nama: "Bahasa Indonesia",
    });

    await expect(
      SubjectService.createSubject({
        sekolah_id: sekolahId,
        kode: "BIN",
        nama: "Bahasa Indonesia Tingkat Lanjut",
      })
    ).rejects.toThrow(SubjectCodeDuplicateError);
  });

  it("should update subject details correctly", async () => {
    const subject = await SubjectService.createSubject({
      sekolah_id: sekolahId,
      kode: "PBO",
      nama: "Pemrograman Berorientasi Objek",
    });

    const updated = await SubjectService.updateSubject({
      id: subject.id,
      sekolah_id: sekolahId,
      nama: "Pemrograman Berorientasi Objek Lanjut",
      kelompok: "KEJURUAN",
    });

    expect(updated.nama).toBe("Pemrograman Berorientasi Objek Lanjut");
    expect(updated.kelompok).toBe("KEJURUAN");
  });

  it("should throw SubjectNotFoundError when subject does not exist", async () => {
    await expect(SubjectService.getSubjectById(generateUlid(), sekolahId)).rejects.toThrow(
      SubjectNotFoundError
    );
  });

  it("should delete unused subject successfully", async () => {
    const subject = await SubjectService.createSubject({
      sekolah_id: sekolahId,
      kode: "SEJ",
      nama: "Sejarah Indonesia",
    });

    const deleted = await SubjectService.deleteSubject(subject.id, sekolahId);
    expect(deleted).toBe(true);

    await expect(SubjectService.getSubjectById(subject.id, sekolahId)).rejects.toThrow(
      SubjectNotFoundError
    );
  });
});
