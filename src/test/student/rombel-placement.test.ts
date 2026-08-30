import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { studentIdentityService } from "@/modules/student/application/student-identity-service";
import { studentEnrollmentService } from "@/modules/student/application/student-enrollment-service";
import { rombelPlacementService } from "@/modules/student/application/rombel-placement-service";
import { RombelCapacityExceededError } from "@/modules/student/domain/student-errors";
import { ulid } from "ulidx";

describe("M07 — Rombel Placement Service", () => {
  let sekolahId: string;
  let yearId: string;
  let gradeId: string;
  let rombelId1: string;
  let rombelId2: string;
  let enrollmentId1: string;
  let enrollmentId2: string;
  const actorId = "USR_" + ulid();
  const actorRole = "SUPER_ADMIN";

  beforeEach(async () => {
    sekolahId = ulid();
    await prisma.sekolah.create({
      data: {
        id: sekolahId,
        nama: `SMK Bina ${sekolahId.substring(0, 6)}`,
        npsn: String(Math.floor(10000000 + Math.random() * 89999999)),
        jenjang: "SMK",
        zona_waktu: "Asia/Jakarta",
      },
    });

    yearId = ulid();
    await prisma.tahunAjaran.create({
      data: {
        id: yearId,
        sekolah_id: sekolahId,
        nama: "2026/2027",
        tanggal_mulai: new Date("2026-07-01"),
        tanggal_selesai: new Date("2027-06-30"),
        status: "AKTIF",
      },
    });

    gradeId = ulid();
    await prisma.tingkatKelas.create({
      data: {
        id: gradeId,
        sekolah_id: sekolahId,
        nama: "Kelas 10",
        kode: "10",
        urutan: 10,
      },
    });

    // Rombel 1 with capacity 1
    rombelId1 = ulid();
    await prisma.rombel.create({
      data: {
        id: rombelId1,
        sekolah_id: sekolahId,
        tahun_ajaran_id: yearId,
        tingkat_id: gradeId,
        nama: "X RPL 1",
        kapasitas: 1,
        status: "AKTIF",
      },
    });

    // Rombel 2 with capacity 36
    rombelId2 = ulid();
    await prisma.rombel.create({
      data: {
        id: rombelId2,
        sekolah_id: sekolahId,
        tahun_ajaran_id: yearId,
        tingkat_id: gradeId,
        nama: "X RPL 2",
        kapasitas: 36,
        status: "AKTIF",
      },
    });

    const s1 = await studentIdentityService.createStudent(
      sekolahId,
      { nis: "20263001", nama_lengkap: "Siswa Satu", jenis_kelamin: "L" },
      actorId,
      actorRole
    );
    const enr1 = await studentEnrollmentService.createEnrollment(
      sekolahId,
      { siswa_id: s1.id, tahun_ajaran_id: yearId, tingkat_id: gradeId },
      actorId,
      actorRole
    );
    enrollmentId1 = enr1.id;

    const s2 = await studentIdentityService.createStudent(
      sekolahId,
      { nis: "20263002", nama_lengkap: "Siswa Dua", jenis_kelamin: "P" },
      actorId,
      actorRole
    );
    const enr2 = await studentEnrollmentService.createEnrollment(
      sekolahId,
      { siswa_id: s2.id, tahun_ajaran_id: yearId, tingkat_id: gradeId },
      actorId,
      actorRole
    );
    enrollmentId2 = enr2.id;
  });

  it("berhasil menempatkan siswa ke dalam rombel", async () => {
    const placement = await rombelPlacementService.createPlacement(
      sekolahId,
      {
        keikutsertaan_id: enrollmentId1,
        rombel_id: rombelId1,
        nomor_absen: 1,
      },
      actorId,
      actorRole
    );

    expect(placement.id).toBeDefined();
    expect(placement.rombel_nama).toBe("X RPL 1");
    expect(placement.nomor_absen).toBe(1);
    expect(placement.status).toBe("AKTIF");
  });

  it("menolak penempatan jika kapasitas rombel telah terpenuhi", async () => {
    // Fill rombel 1 (capacity 1)
    await rombelPlacementService.createPlacement(
      sekolahId,
      {
        keikutsertaan_id: enrollmentId1,
        rombel_id: rombelId1,
      },
      actorId,
      actorRole
    );

    // Attempt second placement into full rombel
    await expect(
      rombelPlacementService.createPlacement(
        sekolahId,
        {
          keikutsertaan_id: enrollmentId2,
          rombel_id: rombelId1,
        },
        actorId,
        actorRole
      )
    ).rejects.toThrow(RombelCapacityExceededError);
  });

  it("berhasil memindahkan rombel dan memelihara status historis penempatan lama (PINDAH)", async () => {
    const p1 = await rombelPlacementService.createPlacement(
      sekolahId,
      {
        keikutsertaan_id: enrollmentId1,
        rombel_id: rombelId1,
      },
      actorId,
      actorRole
    );

    const p2 = await rombelPlacementService.movePlacement(
      sekolahId,
      {
        keikutsertaan_id: enrollmentId1,
        target_rombel_id: rombelId2,
        alasan_pindah: "Penyesuaian kelas",
      },
      actorId,
      actorRole
    );

    expect(p2.rombel_nama).toBe("X RPL 2");
    expect(p2.status).toBe("AKTIF");

    // Check that p1 was closed with status PINDAH
    const oldP = await rombelPlacementService.getPlacementById(p1.id, sekolahId);
    expect(oldP.status).toBe("PINDAH");
  });

  it("berhasil melakukan penempatan massal (bulk placement)", async () => {
    const result = await rombelPlacementService.bulkPlacement(
      sekolahId,
      {
        target_rombel_id: rombelId2,
        keikutsertaan_ids: [enrollmentId1, enrollmentId2],
      },
      actorId,
      actorRole
    );

    expect(result.placedCount).toBe(2);
  });
});
