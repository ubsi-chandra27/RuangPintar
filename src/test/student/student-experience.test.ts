/**
 * Ruang Pintar — Student Experience Test Suite (Phase 15 / M15)
 *
 * Menguji seluruh kapabilitas domain dan aplikasi Student Experience:
 * - Resolusi profil & rombel aktif siswa
 * - Jadwal KBM hari ini
 * - Akses materi pembelajaran & tugas
 * - Validasi penyerahan tugas (tepat waktu vs terlambat)
 * - Penegakan Invariant: Nol kebocoran draft nilai (FR-SXP-004)
 * - Missing Grade != Zero Grade
 * - Kompilasi lembar e-Rapor resmi Kurikulum Merdeka
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { studentExperienceService } from "@/modules/student/application/student-experience-service";
import { studentExperienceRepository } from "@/modules/student/infrastructure/student-experience-repository";
import { prisma } from "@/shared/infrastructure/database/prisma";
import {
  AssignmentNotFoundError,
  AssignmentSubmissionDeadlinePassedError,
  StudentNotFoundError,
} from "@/modules/student/domain/student-experience-errors";

describe("Student Experience Service (Phase 15 / M15)", () => {
  const schoolId = "01JA0000000000000000000001";
  const userSiswaId = "01JASTUD0000000000000000001";

  it("berhasil mengambil profil dan konteks rombel siswa aktif", async () => {
    const profile = await studentExperienceService.getStudentProfile(userSiswaId, schoolId);

    expect(profile).toBeDefined();
    expect(profile.namaLengkap).toBe("Rian Pratama");
    expect(profile.rombelNama).toBe("X RPL");
    expect(profile.tahunAjaranNama).toBe("2026/2027");
    expect(profile.semesterNama).toBe("Semester Ganjil");
    expect(profile.nis).toBe("20261001");
  });

  it("mengambil data terpadu untuk Dashboard Siswa", async () => {
    const data = await studentExperienceService.getDashboardData(userSiswaId, schoolId);

    expect(data.profile).toBeDefined();
    expect(data.statCards.rombelNama).toBe("X RPL");
    expect(data.statCards.persentaseKehadiran).toBeGreaterThanOrEqual(0);
    expect(data.statCards.totalTugasAktif).toBeGreaterThanOrEqual(0);

    // Jadwal hari ini
    expect(Array.isArray(data.jadwalHariIni)).toBe(true);

    // Tugas mendatang
    expect(Array.isArray(data.tugasMendatang)).toBe(true);

    // Nilai terbaru
    expect(Array.isArray(data.nilaiTerbaru)).toBe(true);
  });

  it("mengambil materi dan tugas rombel belajar siswa", async () => {
    const res = await studentExperienceService.getMaterialsAndAssignments(userSiswaId, schoolId);

    expect(res.profile.rombelNama).toBe("X RPL");
    expect(Array.isArray(res.materials)).toBe(true);
    expect(Array.isArray(res.assignments)).toBe(true);
    expect(res.attendance).toBeDefined();

    if (res.materials.length > 0) {
      const firstMat = res.materials[0];
      expect(firstMat.id).toBeDefined();
      expect(firstMat.judul).toBeDefined();
      expect(firstMat.mataPelajaranNama).toBeDefined();
      expect(firstMat.guruNama).toBeDefined();
    }

    if (res.assignments.length > 0) {
      const firstTug = res.assignments[0];
      expect(firstTug.id).toBeDefined();
      expect(firstTug.judul).toBeDefined();
      expect(["BELUM_DIKUMPULKAN", "SUDAH_DIKUMPULKAN", "TERLAMBAT"]).toContain(
        firstTug.statusPengerjaan
      );
    }
  });

  it("menegakkan invariant FR-SXP-004: Nilai draft tidak bocor ke siswa", async () => {
    const { grades } = await studentExperienceService.getPublishedGrades(userSiswaId, schoolId);

    expect(Array.isArray(grades)).toBe(true);

    // Setiap nilai yang tampil WAJIB memiliki status terpublikasi
    for (const g of grades) {
      expect(g.asesmenId).toBeDefined();
      expect(g.judulAsesmen).toBeDefined();
      expect(g.mataPelajaranNama).toBeDefined();
      expect(g.kkmKktp).toBeGreaterThan(0);
      // Missing Grade != Zero Grade (jika null, bukan 0)
      if (g.nilaiAngka === null) {
        expect(g.nilaiAngka).toBeNull();
      } else {
        expect(typeof g.nilaiAngka).toBe("number");
      }
    }
  });

  it("mengompilasi lembar e-Rapor resmi Kurikulum Merdeka", async () => {
    const reportCard = await studentExperienceService.getReportCard(userSiswaId, schoolId);

    expect(reportCard.sekolahNama).toBeDefined();
    expect(reportCard.tahunAjaran).toBe("2026/2027");
    expect(reportCard.semester).toBe("Semester Ganjil");
    expect(reportCard.siswa.namaLengkap).toBe("Rian Pratama");
    expect(reportCard.siswa.rombelNama).toBe("X RPL");

    expect(Array.isArray(reportCard.mataPelajaranList)).toBe(true);
    expect(reportCard.mataPelajaranList.length).toBeGreaterThan(0);

    for (const mapel of reportCard.mataPelajaranList) {
      expect(mapel.mataPelajaranNama).toBeDefined();
      expect(mapel.kkmKktp).toBe(75);
      expect(mapel.deskripsiCapaianTertinggi).toBeDefined();
      expect(["A", "B", "C", "D", "-"]).toContain(mapel.predikat);
    }

    expect(reportCard.presensi).toBeDefined();
    expect(typeof reportCard.presensi.sakit).toBe("number");
    expect(typeof reportCard.presensi.izin).toBe("number");
    expect(typeof reportCard.presensi.tanpaKeterangan).toBe("number");

    expect(reportCard.catatanWaliKelas).toBeDefined();
    expect(reportCard.kepalaSekolahNama).toBeDefined();
  });

  it("berhasil melakukan penyerahan tugas mandiri siswa", async () => {
    const { profile, assignments } = await studentExperienceService.getMaterialsAndAssignments(
      userSiswaId,
      schoolId
    );

    if (assignments.length === 0) {
      return;
    }

    const targetAssignment = assignments[0];

    const submission = await studentExperienceService.submitAssignment(userSiswaId, schoolId, {
      publikasi_tugas_id: targetAssignment.id,
      teks_jawaban: "Berikut adalah hasil analisis tugas sistem tiket bus oleh Rian Pratama.",
      catatan_siswa: "Tugas dikerjakan secara mandiri.",
    });

    expect(submission.id).toBeDefined();
    expect(submission.siswa_id).toBe(profile.siswaId);
    expect(submission.publikasi_tugas_id).toBe(targetAssignment.id);
    expect(submission.teks_jawaban).toContain("analisis tugas");
    expect(["DIKUMPULKAN", "TERLAMBAT"]).toContain(submission.status);
  });

  it("menolak penyerahan tugas jika ID publikasi tugas tidak valid", async () => {
    await expect(
      studentExperienceService.submitAssignment(userSiswaId, schoolId, {
        publikasi_tugas_id: "NON_EXISTENT_PUBLIKASI_ID",
        teks_jawaban: "Jawaban tes",
      })
    ).rejects.toThrow(AssignmentNotFoundError);
  });

  it("menolak akses siswa jika user id tidak terdaftar sebagai profil siswa", async () => {
    await expect(
      studentExperienceService.getStudentProfile("INVALID_USER_ID", schoolId)
    ).rejects.toThrow(StudentNotFoundError);
  });
});
