import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { generateUlid } from "@/shared/lib/ulid";
import { TeacherProfileService } from "@/modules/teacher/application/teacher-profile-service";
import { TeacherRepository } from "@/modules/teacher/infrastructure/teacher-repository";
import {
  TeacherAcademicHistoryError,
  TeacherNipDuplicateError,
  TeacherNotFoundError,
} from "@/modules/teacher/domain/teacher-errors";

describe("TeacherProfileService (M08)", () => {
  let sekolahId: string;

  beforeEach(async () => {
    sekolahId = generateUlid();
    await prisma.sekolah.create({
      data: {
        id: sekolahId,
        nama: `Test School Teacher ${sekolahId.slice(-4)}`,
        jenjang: "SMK",
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function createTeachingHistory(guruId: string, status = "SELESAI") {
    const tahunAjaranId = generateUlid();
    const tingkatId = generateUlid();
    const rombelId = generateUlid();
    const mataPelajaranId = generateUlid();
    const penugasanId = generateUlid();

    await prisma.tahunAjaran.create({
      data: {
        id: tahunAjaranId,
        sekolah_id: sekolahId,
        nama: "2025/2026",
        kode: `TA-${tahunAjaranId.slice(-6)}`,
        tanggal_mulai: new Date("2025-07-01"),
        tanggal_selesai: new Date("2026-06-30"),
        status: "SELESAI",
      },
    });
    await prisma.tingkatKelas.create({
      data: {
        id: tingkatId,
        sekolah_id: sekolahId,
        kode: `10-${tingkatId.slice(-4)}`,
        nama: "Kelas 10",
      },
    });
    await prisma.rombel.create({
      data: {
        id: rombelId,
        sekolah_id: sekolahId,
        tahun_ajaran_id: tahunAjaranId,
        tingkat_id: tingkatId,
        nama: "X RPL Riwayat",
        status: "ARSIP",
      },
    });
    await prisma.mataPelajaran.create({
      data: {
        id: mataPelajaranId,
        sekolah_id: sekolahId,
        kode: `MAP-${mataPelajaranId.slice(-5)}`,
        nama: "Mata Pelajaran Riwayat",
      },
    });
    await prisma.penugasanMengajar.create({
      data: {
        id: penugasanId,
        sekolah_id: sekolahId,
        guru_id: guruId,
        mata_pelajaran_id: mataPelajaranId,
        tahun_ajaran_id: tahunAjaranId,
        rombel_id: rombelId,
        jumlah_jam_minggu: 2,
        status,
      },
    });

    return { tahunAjaranId, tingkatId, rombelId, mataPelajaranId, penugasanId };
  }

  it("should create a teacher profile successfully with string, Date, empty, or null birth date", async () => {
    // 1. With string date
    const teacherWithStringDate = await TeacherProfileService.createTeacher({
      sekolah_id: sekolahId,
      nip: "199001012020011001",
      nama_lengkap: "Agus Pratama",
      gelar_belakang: "S.Pd.",
      jenis_kelamin: "L",
      tanggal_lahir: "1990-01-01",
      status_kepegawaian: "TETAP",
      email: "agus.pratama@test.sch.id",
    });

    expect(teacherWithStringDate.id).toBeDefined();
    expect(teacherWithStringDate.nama_lengkap).toBe("Agus Pratama");
    expect(teacherWithStringDate.nama_dengan_gelar).toBe("Agus Pratama S.Pd.");
    expect(teacherWithStringDate.nip).toBe("199001012020011001");
    expect(teacherWithStringDate.tanggal_lahir).toBeInstanceOf(Date);

    // 2. With empty string date
    const teacherWithEmptyDate = await TeacherProfileService.createTeacher({
      sekolah_id: sekolahId,
      nama_lengkap: "Bambang Sutrisno",
      jenis_kelamin: "L",
      tanggal_lahir: "",
    });
    expect(teacherWithEmptyDate.id).toBeDefined();
    expect(teacherWithEmptyDate.tanggal_lahir).toBeNull();

    // 3. With Date object
    const teacherWithDateObj = await TeacherProfileService.createTeacher({
      sekolah_id: sekolahId,
      nama_lengkap: "Citra Lestari",
      jenis_kelamin: "P",
      tanggal_lahir: new Date("1995-10-20"),
    });
    expect(teacherWithDateObj.id).toBeDefined();
    expect(teacherWithDateObj.tanggal_lahir).toBeInstanceOf(Date);
  });

  it("should reject duplicate NIP within the same school", async () => {
    await TeacherProfileService.createTeacher({
      sekolah_id: sekolahId,
      nip: "199101012020011002",
      nama_lengkap: "Guru Pertama",
      jenis_kelamin: "L",
    });

    await expect(
      TeacherProfileService.createTeacher({
        sekolah_id: sekolahId,
        nip: "199101012020011002",
        nama_lengkap: "Guru Kedua",
        jenis_kelamin: "P",
      })
    ).rejects.toThrow(TeacherNipDuplicateError);
  });

  it("should update teacher profile correctly", async () => {
    const teacher = await TeacherProfileService.createTeacher({
      sekolah_id: sekolahId,
      nama_lengkap: "Dewi Safitri",
      jenis_kelamin: "P",
    });

    const updated = await TeacherProfileService.updateTeacher({
      id: teacher.id,
      sekolah_id: sekolahId,
      nama_lengkap: "Dewi Safitri",
      gelar_belakang: "M.Pd.",
      status_kepegawaian: "PNS",
    });

    expect(updated.nama_dengan_gelar).toBe("Dewi Safitri M.Pd.");
    expect(updated.status_kepegawaian).toBe("PNS");
  });

  it("should throw TeacherNotFoundError when updating non-existent teacher", async () => {
    await expect(
      TeacherProfileService.updateTeacher({
        id: generateUlid(),
        sekolah_id: sekolahId,
        nama_lengkap: "Non Existent",
      })
    ).rejects.toThrow(TeacherNotFoundError);
  });

  it("should delete teacher only when no academic dependency has ever existed", async () => {
    const teacher = await TeacherProfileService.createTeacher({
      sekolah_id: sekolahId,
      nama_lengkap: "Guru Sementara",
      jenis_kelamin: "L",
    });

    const deleted = await TeacherProfileService.deleteTeacher(teacher.id, sekolahId);
    expect(deleted).toBe(true);

    await expect(TeacherProfileService.getTeacherById(teacher.id, sekolahId)).rejects.toThrow(
      TeacherNotFoundError
    );
  });

  it("should reject hard-delete when teacher has a historical teaching assignment", async () => {
    const teacher = await TeacherProfileService.createTeacher({
      sekolah_id: sekolahId,
      nama_lengkap: "Guru Dengan Riwayat",
      jenis_kelamin: "P",
    });
    const history = await createTeachingHistory(teacher.id, "SELESAI");

    await expect(TeacherProfileService.deleteTeacher(teacher.id, sekolahId)).rejects.toThrow(
      TeacherAcademicHistoryError
    );

    expect(await prisma.guru.count({ where: { id: teacher.id } })).toBe(1);
    expect(await prisma.penugasanMengajar.count({ where: { id: history.penugasanId } })).toBe(1);
  });

  it("should deactivate a teacher without deleting historical academic data", async () => {
    const teacher = await TeacherProfileService.createTeacher({
      sekolah_id: sekolahId,
      nama_lengkap: "Guru Purna Tugas",
      jenis_kelamin: "L",
    });
    const history = await createTeachingHistory(teacher.id, "SELESAI");

    const deactivated = await TeacherProfileService.deactivateTeacher(teacher.id, sekolahId);

    expect(deactivated.status_aktif).toBe(false);
    expect(await prisma.guru.count({ where: { id: teacher.id, status_aktif: false } })).toBe(1);
    expect(await prisma.penugasanMengajar.count({ where: { id: history.penugasanId } })).toBe(1);
  });

  it("should audit M08-M10 dependencies including schedule and actual class session roles", async () => {
    const teacher = await TeacherProfileService.createTeacher({
      sekolah_id: sekolahId,
      nama_lengkap: "Guru Pengampu Riwayat",
      jenis_kelamin: "L",
    });
    const substitute = await TeacherProfileService.createTeacher({
      sekolah_id: sekolahId,
      nama_lengkap: "Guru Pengganti Riwayat",
      jenis_kelamin: "P",
    });
    const history = await createTeachingHistory(teacher.id, "SELESAI");
    const slotId = generateUlid();
    const versionId = generateUlid();
    const scheduleId = generateUlid();

    await prisma.penugasanWaliKelas.create({
      data: {
        id: generateUlid(),
        sekolah_id: sekolahId,
        guru_id: teacher.id,
        rombel_id: history.rombelId,
        tahun_ajaran_id: history.tahunAjaranId,
        status: "SELESAI",
      },
    });
    await prisma.slotWaktu.create({
      data: {
        id: slotId,
        sekolah_id: sekolahId,
        nama: "JP Riwayat",
        kode: `JP-${slotId.slice(-5)}`,
        jam_mulai: "07:00",
        jam_selesai: "07:45",
      },
    });
    await prisma.versiJadwal.create({
      data: {
        id: versionId,
        sekolah_id: sekolahId,
        tahun_ajaran_id: history.tahunAjaranId,
        nama: "Jadwal Riwayat",
        status: "ARSIP",
      },
    });
    await prisma.jadwalPelajaran.create({
      data: {
        id: scheduleId,
        sekolah_id: sekolahId,
        versi_jadwal_id: versionId,
        tahun_ajaran_id: history.tahunAjaranId,
        rombel_id: history.rombelId,
        penugasan_mengajar_id: history.penugasanId,
        guru_id: teacher.id,
        mata_pelajaran_id: history.mataPelajaranId,
        slot_waktu_id: slotId,
        hari: "SENIN",
      },
    });
    await prisma.sesiKelasAktual.create({
      data: {
        id: generateUlid(),
        sekolah_id: sekolahId,
        jadwal_pelajaran_id: scheduleId,
        penugasan_mengajar_id: history.penugasanId,
        rombel_id: history.rombelId,
        mata_pelajaran_id: history.mataPelajaranId,
        guru_id: teacher.id,
        guru_pengganti_id: substitute.id,
        tahun_ajaran_id: history.tahunAjaranId,
        tanggal: new Date("2026-01-12"),
        status: "SELESAI",
      },
    });

    const primarySummary = await TeacherRepository.getTeacherDependencySummary(
      teacher.id,
      sekolahId
    );
    const substituteSummary = await TeacherRepository.getTeacherDependencySummary(
      substitute.id,
      sekolahId
    );

    expect(primarySummary).toMatchObject({
      penugasan_mengajar: 1,
      penugasan_wali: 1,
      jadwal_pelajaran: 1,
      sesi_sebagai_pengampu: 1,
    });
    expect(substituteSummary.sesi_sebagai_pengganti).toBe(1);
    await expect(TeacherProfileService.deleteTeacher(substitute.id, sekolahId)).rejects.toThrow(
      TeacherAcademicHistoryError
    );
    expect(await prisma.guru.count({ where: { id: substitute.id } })).toBe(1);
  });
});
