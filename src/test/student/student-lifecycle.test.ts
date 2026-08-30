import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { studentIdentityService } from "@/modules/student/application/student-identity-service";
import { studentEnrollmentService } from "@/modules/student/application/student-enrollment-service";
import { rombelPlacementService } from "@/modules/student/application/rombel-placement-service";
import { studentLifecycleService } from "@/modules/student/application/student-lifecycle-service";
import { ulid } from "ulidx";

describe("M07 — Student Lifecycle Orchestrator (Promotion, Graduation, Transfer)", () => {
  let sekolahId: string;
  let yearId1: string;
  let yearId2: string;
  let gradeId10: string;
  let gradeId11: string;
  let rombelId10: string;
  let rombelId11: string;
  let studentId: string;
  let enrollmentId1: string;
  const actorId = "USR_" + ulid();
  const actorRole = "SUPER_ADMIN";

  beforeEach(async () => {
    sekolahId = ulid();
    await prisma.sekolah.create({
      data: {
        id: sekolahId,
        nama: `SMK Unggul ${sekolahId.substring(0, 6)}`,
        npsn: String(Math.floor(10000000 + Math.random() * 89999999)),
        jenjang: "SMK",
        zona_waktu: "Asia/Jakarta",
      },
    });

    yearId1 = ulid();
    await prisma.tahunAjaran.create({
      data: {
        id: yearId1,
        sekolah_id: sekolahId,
        nama: "2025/2026",
        tanggal_mulai: new Date("2025-07-01"),
        tanggal_selesai: new Date("2026-06-30"),
        status: "SELESAI",
      },
    });

    yearId2 = ulid();
    await prisma.tahunAjaran.create({
      data: {
        id: yearId2,
        sekolah_id: sekolahId,
        nama: "2026/2027",
        tanggal_mulai: new Date("2026-07-01"),
        tanggal_selesai: new Date("2027-06-30"),
        status: "AKTIF",
      },
    });

    gradeId10 = ulid();
    await prisma.tingkatKelas.create({
      data: {
        id: gradeId10,
        sekolah_id: sekolahId,
        nama: "Kelas 10",
        kode: "10",
        urutan: 10,
      },
    });

    gradeId11 = ulid();
    await prisma.tingkatKelas.create({
      data: {
        id: gradeId11,
        sekolah_id: sekolahId,
        nama: "Kelas 11",
        kode: "11",
        urutan: 11,
      },
    });

    rombelId10 = ulid();
    await prisma.rombel.create({
      data: {
        id: rombelId10,
        sekolah_id: sekolahId,
        tahun_ajaran_id: yearId1,
        tingkat_id: gradeId10,
        nama: "X RPL 1",
        kapasitas: 36,
        status: "AKTIF",
      },
    });

    rombelId11 = ulid();
    await prisma.rombel.create({
      data: {
        id: rombelId11,
        sekolah_id: sekolahId,
        tahun_ajaran_id: yearId2,
        tingkat_id: gradeId11,
        nama: "XI RPL 1",
        kapasitas: 36,
        status: "AKTIF",
      },
    });

    const s = await studentIdentityService.createStudent(
      sekolahId,
      {
        nis: "20254001",
        nama_lengkap: "Bayu Pratama",
        jenis_kelamin: "L",
      },
      actorId,
      actorRole
    );
    studentId = s.id;

    const enr = await studentEnrollmentService.createEnrollment(
      sekolahId,
      {
        siswa_id: studentId,
        tahun_ajaran_id: yearId1,
        tingkat_id: gradeId10,
      },
      actorId,
      actorRole
    );
    enrollmentId1 = enr.id;

    await rombelPlacementService.createPlacement(
      sekolahId,
      {
        keikutsertaan_id: enrollmentId1,
        rombel_id: rombelId10,
        nomor_absen: 10,
      },
      actorId,
      actorRole
    );
  });

  it("berhasil melakukan promosi kenaikan kelas dan mempertahankan riwayat kelas sebelumnya", async () => {
    const promoted = await studentLifecycleService.promoteStudent(
      sekolahId,
      {
        siswa_id: studentId,
        source_enrollment_id: enrollmentId1,
        target_tahun_ajaran_id: yearId2,
        target_tingkat_id: gradeId11,
        target_rombel_id: rombelId11,
        status_enrollment_lama: "NAIK_KELAS",
      },
      actorId,
      actorRole
    );

    expect(promoted.id).toBeDefined();
    expect(promoted.tahun_ajaran_id).toBe(yearId2);
    expect(promoted.status).toBe("AKTIF");

    // Verify source enrollment is marked as NAIK_KELAS
    const oldEnr = await studentEnrollmentService.getEnrollmentById(enrollmentId1, sekolahId);
    expect(oldEnr.status).toBe("NAIK_KELAS");

    // Verify full academic timeline contains both enrollments
    const timeline = await studentLifecycleService.getStudentAcademicTimeline(studentId, sekolahId);
    expect(timeline.enrollments.length).toBe(2);
  });

  it("berhasil memproses kelulusan siswa dan memperbarui status akademik menjadi LULUS", async () => {
    await studentLifecycleService.graduateStudent(
      sekolahId,
      {
        siswa_id: studentId,
        source_enrollment_id: enrollmentId1,
        tanggal_lulus: "2026-06-15",
        catatan: "Lulus dengan predikat sangat memuaskan",
      },
      actorId,
      actorRole
    );

    const student = await studentIdentityService.getStudentById(studentId, sekolahId);
    expect(student.status_akademik).toBe("LULUS");
    expect(student.tanggal_keluar).toBeDefined();

    const enr = await studentEnrollmentService.getEnrollmentById(enrollmentId1, sekolahId);
    expect(enr.status).toBe("LULUS");
  });

  it("berhasil memproses mutasi keluar siswa dan memperbarui status akademik menjadi PINDAH", async () => {
    await studentLifecycleService.transferOutStudent(
      sekolahId,
      {
        siswa_id: studentId,
        source_enrollment_id: enrollmentId1,
        alasan_keluar: "Pindah domisili orang tua",
        sekolah_tujuan: "SMK Negeri 1 Surabaya",
      },
      actorId,
      actorRole
    );

    const student = await studentIdentityService.getStudentById(studentId, sekolahId);
    expect(student.status_akademik).toBe("PINDAH");

    const enr = await studentEnrollmentService.getEnrollmentById(enrollmentId1, sekolahId);
    expect(enr.status).toBe("PINDAH");
  });
});
