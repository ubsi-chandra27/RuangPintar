/**
 * Ruang Pintar — M07 Student Academic Lifecycle: Lifecycle Orchestrator Service
 */

import { recordAuditEvent } from "@/shared/infrastructure/audit/audit-logger";
import { prisma } from "@/shared/infrastructure/database/prisma";
import {
  GraduateStudentInput,
  PromoteStudentInput,
  StudentAcademicHistoryDTO,
  StudentEnrollmentDTO,
  TransferOutStudentInput,
} from "../domain/student-types";
import {
  DuplicateEnrollmentError,
  EnrollmentNotFoundError,
  RombelCapacityExceededError,
  StudentNotFoundError,
} from "../domain/student-errors";
import { StudentRepository, studentRepository } from "../infrastructure/student-repository";

export class StudentLifecycleService {
  constructor(private readonly repo: StudentRepository = studentRepository) {}

  /**
   * Kenaikan / Promosi Tingkat Kelas ke Periode Baru (History-Preserving)
   */
  async promoteStudent(
    sekolahId: string,
    input: PromoteStudentInput,
    aktorId: string,
    aktorRole: string
  ): Promise<StudentEnrollmentDTO> {
    // 1. Verify Student & Source Enrollment
    const student = await this.repo.findStudentById(input.siswa_id, sekolahId);
    if (!student) {
      throw new StudentNotFoundError(input.siswa_id);
    }

    const sourceEnrollment = await this.repo.findEnrollmentById(
      input.source_enrollment_id,
      sekolahId
    );
    if (!sourceEnrollment) {
      throw new EnrollmentNotFoundError(input.source_enrollment_id);
    }

    // 2. Prevent duplicate enrollment in target academic year
    const existingTarget = await this.repo.findEnrollmentBySiswaAndTahun(
      input.siswa_id,
      input.target_tahun_ajaran_id
    );
    if (existingTarget) {
      const targetYear = await prisma.tahunAjaran.findUnique({
        where: { id: input.target_tahun_ajaran_id },
      });
      throw new DuplicateEnrollmentError(
        student.nama_lengkap,
        targetYear?.nama ?? input.target_tahun_ajaran_id
      );
    }

    // 3. If target rombel provided, check capacity
    if (input.target_rombel_id) {
      const targetRombel = await prisma.rombel.findFirst({
        where: { id: input.target_rombel_id, sekolah_id: sekolahId },
      });
      if (!targetRombel) {
        throw new Error(`Rombel target dengan ID ${input.target_rombel_id} tidak ditemukan.`);
      }

      const occupancy = await this.repo.countPlacementsInRombel(input.target_rombel_id, "AKTIF");
      if (occupancy >= targetRombel.kapasitas) {
        throw new RombelCapacityExceededError(
          targetRombel.nama,
          targetRombel.kapasitas,
          occupancy,
          1
        );
      }
    }

    const now = new Date();

    // 4. Atomic Execution
    // a. End active placement in source enrollment
    const activePlacement = await this.repo.findActivePlacementByEnrollment(
      input.source_enrollment_id
    );
    if (activePlacement) {
      await this.repo.updatePlacement(activePlacement.id, sekolahId, {
        status: "SELESAI",
        tanggal_selesai: now,
        catatan: "Selesai periode pembelajaran sebelumnya",
      });
    }

    // b. Complete source enrollment
    await this.repo.updateEnrollment(input.source_enrollment_id, sekolahId, {
      status: input.status_enrollment_lama ?? "NAIK_KELAS",
      tanggal_selesai: now,
      catatan: input.catatan?.trim() || "Promosi kenaikan tingkat kelas",
    });

    // c. Create new enrollment in target period & grade
    const newEnrollment = await this.repo.createEnrollment(sekolahId, {
      siswa_id: input.siswa_id,
      tahun_ajaran_id: input.target_tahun_ajaran_id,
      tingkat_id: input.target_tingkat_id,
      status: "AKTIF",
      tanggal_mulai: now,
      catatan: `Promosi dari ${sourceEnrollment.tingkat_nama ?? "Tingkat sebelumnya"} (${sourceEnrollment.tahun_ajaran_nama ?? ""})`,
    });

    // d. Create placement in new rombel if provided
    if (input.target_rombel_id) {
      await this.repo.createPlacement(sekolahId, {
        keikutsertaan_id: newEnrollment.id,
        rombel_id: input.target_rombel_id,
        tanggal_mulai: now,
      });
    }

    // e. Record Audit Event
    await recordAuditEvent({
      sekolah_id: sekolahId,
      aktor_id: aktorId,
      aktor_role: aktorRole,
      tipe_sumber: "SISWA_LIFECYCLE",
      id_sumber: input.siswa_id,
      aksi: "PROMOTE_STUDENT",
      payload_sebelum: sourceEnrollment as unknown as Record<string, unknown>,
      payload_sesudah: newEnrollment as unknown as Record<string, unknown>,
    });

    return (await this.repo.findEnrollmentById(newEnrollment.id, sekolahId)) ?? newEnrollment;
  }

  /**
   * Kelulusan Siswa (History-Preserving)
   */
  async graduateStudent(
    sekolahId: string,
    input: GraduateStudentInput,
    aktorId: string,
    aktorRole: string
  ): Promise<void> {
    const student = await this.repo.findStudentById(input.siswa_id, sekolahId);
    if (!student) {
      throw new StudentNotFoundError(input.siswa_id);
    }

    const sourceEnrollment = await this.repo.findEnrollmentById(
      input.source_enrollment_id,
      sekolahId
    );
    if (!sourceEnrollment) {
      throw new EnrollmentNotFoundError(input.source_enrollment_id);
    }

    const gradDate = input.tanggal_lulus ? new Date(input.tanggal_lulus) : new Date();

    // a. End active placement
    const activePlacement = await this.repo.findActivePlacementByEnrollment(
      input.source_enrollment_id
    );
    if (activePlacement) {
      await this.repo.updatePlacement(activePlacement.id, sekolahId, {
        status: "SELESAI",
        tanggal_selesai: gradDate,
        catatan: "Siswa telah dinyatakan Lulus",
      });
    }

    // b. Complete enrollment with status LULUS
    await this.repo.updateEnrollment(input.source_enrollment_id, sekolahId, {
      status: "LULUS",
      tanggal_selesai: gradDate,
      catatan: input.catatan?.trim() || "Dinyatakan Lulus",
    });

    // c. Update student identity status to LULUS
    await this.repo.updateStudent(input.siswa_id, sekolahId, {
      status_akademik: "LULUS",
      tanggal_keluar: gradDate,
      catatan: input.catatan?.trim() || "Lulus Pendidikan",
    });

    // d. Record Audit Event
    await recordAuditEvent({
      sekolah_id: sekolahId,
      aktor_id: aktorId,
      aktor_role: aktorRole,
      tipe_sumber: "SISWA_LIFECYCLE",
      id_sumber: input.siswa_id,
      aksi: "GRADUATE_STUDENT",
      payload_sebelum: student as unknown as Record<string, unknown>,
      payload_sesudah: {
        status_akademik: "LULUS",
        tanggal_keluar: gradDate,
        enrollment_id: input.source_enrollment_id,
      },
    });
  }

  /**
   * Mutasi Keluar Siswa (Transfer Out / Pindah Sekolah)
   */
  async transferOutStudent(
    sekolahId: string,
    input: TransferOutStudentInput,
    aktorId: string,
    aktorRole: string
  ): Promise<void> {
    const student = await this.repo.findStudentById(input.siswa_id, sekolahId);
    if (!student) {
      throw new StudentNotFoundError(input.siswa_id);
    }

    const sourceEnrollment = await this.repo.findEnrollmentById(
      input.source_enrollment_id,
      sekolahId
    );
    if (!sourceEnrollment) {
      throw new EnrollmentNotFoundError(input.source_enrollment_id);
    }

    const transferDate = input.tanggal_keluar ? new Date(input.tanggal_keluar) : new Date();
    const reasonText = `Pindah/Mutasi: ${input.alasan_keluar}${input.sekolah_tujuan ? ` (Tujuan: ${input.sekolah_tujuan})` : ""}`;

    // a. End active placement
    const activePlacement = await this.repo.findActivePlacementByEnrollment(
      input.source_enrollment_id
    );
    if (activePlacement) {
      await this.repo.updatePlacement(activePlacement.id, sekolahId, {
        status: "PINDAH",
        tanggal_selesai: transferDate,
        catatan: reasonText,
      });
    }

    // b. Complete enrollment with status PINDAH
    await this.repo.updateEnrollment(input.source_enrollment_id, sekolahId, {
      status: "PINDAH",
      tanggal_selesai: transferDate,
      catatan: reasonText,
    });

    // c. Update student identity status to PINDAH
    await this.repo.updateStudent(input.siswa_id, sekolahId, {
      status_akademik: "PINDAH",
      tanggal_keluar: transferDate,
      catatan: reasonText,
    });

    // d. Record Audit Event
    await recordAuditEvent({
      sekolah_id: sekolahId,
      aktor_id: aktorId,
      aktor_role: aktorRole,
      tipe_sumber: "SISWA_LIFECYCLE",
      id_sumber: input.siswa_id,
      aksi: "TRANSFER_OUT_STUDENT",
      payload_sebelum: student as unknown as Record<string, unknown>,
      payload_sesudah: {
        status_akademik: "PINDAH",
        tanggal_keluar: transferDate,
        alasan: input.alasan_keluar,
        sekolah_tujuan: input.sekolah_tujuan,
      },
    });
  }

  /**
   * Ambil Riwayat Lengkap Akademik Siswa
   */
  async getStudentAcademicTimeline(
    siswaId: string,
    sekolahId: string
  ): Promise<StudentAcademicHistoryDTO> {
    const history = await this.repo.getAcademicHistory(siswaId, sekolahId);
    if (!history) {
      throw new StudentNotFoundError(siswaId);
    }
    return history;
  }
}

export const studentLifecycleService = new StudentLifecycleService();
