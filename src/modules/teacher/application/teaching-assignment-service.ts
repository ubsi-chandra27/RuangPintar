/**
 * Ruang Pintar — M08 Teaching Assignment Application Service
 */

import { prisma } from "@/shared/infrastructure/database/prisma";
import { recordAuditEvent } from "@/shared/infrastructure/audit/audit-logger";
import {
  CrossSchoolBoundaryError,
  DuplicateTeachingAssignmentError,
  TeacherNotFoundError,
  TeachingAssignmentInUseError,
} from "../domain/teacher-errors";
import {
  BulkLifecycleResult,
  CreateBulkTeachingAssignmentsInput,
  CreateTeachingAssignmentInput,
  StatusPenugasan,
  TeacherWorkloadDTO,
  TeachingAssignmentDTO,
  UpdateTeachingAssignmentInput,
} from "../domain/teacher-types";
import {
  CreateBulkTeachingAssignmentsSchema,
  CreateTeachingAssignmentSchema,
  UpdateTeachingAssignmentSchema,
} from "../domain/teacher-validation";
import { TeacherRepository } from "../infrastructure/teacher-repository";

export class TeachingAssignmentService {
  static async getTeachingAssignments(
    sekolah_id: string,
    options?: {
      guru_id?: string;
      mata_pelajaran_id?: string;
      rombel_id?: string;
      tahun_ajaran_id?: string;
      semester_id?: string;
      status?: StatusPenugasan;
      take?: number;
      skip?: number;
    }
  ): Promise<TeachingAssignmentDTO[]> {
    return TeacherRepository.findTeachingAssignments(sekolah_id, options);
  }

  static async getTeachingAssignmentById(
    id: string,
    sekolah_id: string
  ): Promise<TeachingAssignmentDTO | null> {
    return TeacherRepository.findTeachingAssignmentById(id, sekolah_id);
  }

  static async getTeacherWorkload(
    guru_id: string,
    sekolah_id: string,
    tahun_ajaran_id?: string
  ): Promise<TeacherWorkloadDTO> {
    const teacher = await TeacherRepository.findTeacherById(guru_id, sekolah_id);
    if (!teacher) {
      throw new TeacherNotFoundError(guru_id);
    }

    const assignments = await TeacherRepository.findTeachingAssignments(sekolah_id, {
      guru_id,
      tahun_ajaran_id,
      status: "AKTIF",
    });

    const homerooms = await TeacherRepository.findHomeroomAssignments(sekolah_id, {
      guru_id,
      tahun_ajaran_id,
      status: "AKTIF",
    });

    const uniqueRombels = new Set(assignments.map((a) => a.rombel_id));
    const uniqueSubjects = new Set(assignments.map((a) => a.mata_pelajaran_id));
    const totalJam = assignments.reduce((acc, a) => acc + a.jumlah_jam_minggu, 0);

    return {
      guru_id: teacher.id,
      nama_lengkap: teacher.nama_dengan_gelar,
      nip: teacher.nip,
      total_jam_minggu: totalJam,
      total_rombel: uniqueRombels.size,
      total_mapel: uniqueSubjects.size,
      penugasan_aktif: assignments,
      wali_kelas_aktif: homerooms.length > 0 ? homerooms[0] : null,
    };
  }

  static async createTeachingAssignment(
    input: CreateTeachingAssignmentInput,
    actorId?: string,
    actorRole?: string
  ): Promise<TeachingAssignmentDTO> {
    const validated = CreateTeachingAssignmentSchema.parse(input);

    // 1. Cross-school validation: Guru
    const teacher = await TeacherRepository.findTeacherById(
      validated.guru_id,
      validated.sekolah_id
    );
    if (!teacher) {
      throw new CrossSchoolBoundaryError(`Guru ${validated.guru_id}`);
    }

    // 2. Cross-school validation: Mata Pelajaran
    const subject = await TeacherRepository.findSubjectById(
      validated.mata_pelajaran_id,
      validated.sekolah_id
    );
    if (!subject) {
      throw new CrossSchoolBoundaryError(`Mata Pelajaran ${validated.mata_pelajaran_id}`);
    }

    // 3. Cross-school validation: Rombel
    const rombel = await prisma.rombel.findFirst({
      where: { id: validated.rombel_id, sekolah_id: validated.sekolah_id },
    });
    if (!rombel) {
      throw new CrossSchoolBoundaryError(`Rombel ${validated.rombel_id}`);
    }

    // 4. Duplicate/Conflict validation (active assignment for same subject in same rombel & period)
    const conflict = await TeacherRepository.findActiveAssignmentConflict(
      validated.sekolah_id,
      validated.mata_pelajaran_id,
      validated.rombel_id,
      validated.tahun_ajaran_id,
      validated.semester_id || null
    );

    if (conflict) {
      throw new DuplicateTeachingAssignmentError(
        conflict.guru.nama_lengkap,
        conflict.mata_pelajaran.nama,
        conflict.rombel.nama
      );
    }

    const created = await TeacherRepository.createTeachingAssignment({
      sekolah_id: validated.sekolah_id,
      guru_id: validated.guru_id,
      mata_pelajaran_id: validated.mata_pelajaran_id,
      tahun_ajaran_id: validated.tahun_ajaran_id,
      semester_id: validated.semester_id || null,
      rombel_id: validated.rombel_id,
      jumlah_jam_minggu: validated.jumlah_jam_minggu,
      berlaku_mulai: validated.berlaku_mulai || new Date(),
      status: validated.status as StatusPenugasan,
      catatan: validated.catatan || null,
    });

    if (actorId && actorRole) {
      await recordAuditEvent({
        sekolah_id: validated.sekolah_id,
        aktor_id: actorId,
        aktor_role: actorRole,
        aksi: "CREATE",
        tipe_sumber: "PENUGASAN_MENGAJAR",
        id_sumber: created.id,
        payload_sesudah: created as unknown as Record<string, unknown>,
      });
    }

    return created;
  }

  static async createBulkTeachingAssignments(
    input: CreateBulkTeachingAssignmentsInput,
    actorId?: string,
    actorRole?: string
  ): Promise<{
    created: TeachingAssignmentDTO[];
    skipped: Array<{ rombel_id: string; rombel_nama: string; reason: string }>;
  }> {
    const validated = CreateBulkTeachingAssignmentsSchema.parse(input);

    // 1. Cross-school validation: Guru
    const teacher = await TeacherRepository.findTeacherById(
      validated.guru_id,
      validated.sekolah_id
    );
    if (!teacher) {
      throw new CrossSchoolBoundaryError(`Guru ${validated.guru_id}`);
    }

    // 2. Cross-school validation: Mata Pelajaran
    const subject = await TeacherRepository.findSubjectById(
      validated.mata_pelajaran_id,
      validated.sekolah_id
    );
    if (!subject) {
      throw new CrossSchoolBoundaryError(`Mata Pelajaran ${validated.mata_pelajaran_id}`);
    }

    const createdList: TeachingAssignmentDTO[] = [];
    const skippedList: Array<{ rombel_id: string; rombel_nama: string; reason: string }> = [];

    for (const rombelId of validated.rombel_ids) {
      const rombel = await prisma.rombel.findFirst({
        where: { id: rombelId, sekolah_id: validated.sekolah_id },
      });

      if (!rombel) {
        skippedList.push({
          rombel_id: rombelId,
          rombel_nama: rombelId,
          reason: "Rombel tidak ditemukan di sekolah ini",
        });
        continue;
      }

      // Check conflict
      const conflict = await TeacherRepository.findActiveAssignmentConflict(
        validated.sekolah_id,
        validated.mata_pelajaran_id,
        rombelId,
        validated.tahun_ajaran_id,
        validated.semester_id || null
      );

      if (conflict) {
        skippedList.push({
          rombel_id: rombelId,
          rombel_nama: rombel.nama,
          reason: `Sudah diajar oleh ${conflict.guru.nama_lengkap}`,
        });
        continue;
      }

      const created = await TeacherRepository.createTeachingAssignment({
        sekolah_id: validated.sekolah_id,
        guru_id: validated.guru_id,
        mata_pelajaran_id: validated.mata_pelajaran_id,
        tahun_ajaran_id: validated.tahun_ajaran_id,
        semester_id: validated.semester_id || null,
        rombel_id: rombelId,
        jumlah_jam_minggu: validated.jumlah_jam_minggu,
        berlaku_mulai: validated.berlaku_mulai || new Date(),
        status: validated.status as StatusPenugasan,
        catatan: validated.catatan || null,
      });

      createdList.push(created);

      if (actorId && actorRole) {
        await recordAuditEvent({
          sekolah_id: validated.sekolah_id,
          aktor_id: actorId,
          aktor_role: actorRole,
          aksi: "CREATE",
          tipe_sumber: "PENUGASAN_MENGAJAR",
          id_sumber: created.id,
          payload_sesudah: created as unknown as Record<string, unknown>,
        });
      }
    }

    return {
      created: createdList,
      skipped: skippedList,
    };
  }

  static async updateTeachingAssignment(
    input: UpdateTeachingAssignmentInput,
    actorId?: string,
    actorRole?: string
  ): Promise<TeachingAssignmentDTO> {
    const validated = UpdateTeachingAssignmentSchema.parse(input);

    const existing = await TeacherRepository.findTeachingAssignmentById(
      validated.id,
      validated.sekolah_id
    );
    if (!existing) {
      throw new CrossSchoolBoundaryError(`Penugasan Mengajar ${validated.id}`);
    }

    const updated = await TeacherRepository.updateTeachingAssignment({
      id: validated.id,
      sekolah_id: validated.sekolah_id,
      jumlah_jam_minggu: validated.jumlah_jam_minggu,
      status: validated.status as StatusPenugasan,
      berlaku_sampai: validated.berlaku_sampai,
      catatan: validated.catatan,
    });

    if (actorId && actorRole) {
      await recordAuditEvent({
        sekolah_id: validated.sekolah_id,
        aktor_id: actorId,
        aktor_role: actorRole,
        aksi: "UPDATE",
        tipe_sumber: "PENUGASAN_MENGAJAR",
        id_sumber: updated.id,
        payload_sebelum: existing as unknown as Record<string, unknown>,
        payload_sesudah: updated as unknown as Record<string, unknown>,
      });
    }

    return updated;
  }

  static async closeTeachingAssignment(
    id: string,
    sekolah_id: string,
    status: StatusPenugasan = "SELESAI",
    actorId?: string,
    actorRole?: string
  ): Promise<boolean> {
    const existing = await TeacherRepository.findTeachingAssignmentById(id, sekolah_id);
    if (!existing) {
      throw new CrossSchoolBoundaryError(`Penugasan Mengajar ${id}`);
    }

    await TeacherRepository.closeTeachingAssignment(id, sekolah_id, status, new Date());

    if (actorId && actorRole) {
      await recordAuditEvent({
        sekolah_id,
        aktor_id: actorId,
        aktor_role: actorRole,
        aksi: "UPDATE",
        tipe_sumber: "PENUGASAN_MENGAJAR",
        id_sumber: id,
        payload_sebelum: existing as unknown as Record<string, unknown>,
        payload_sesudah: { status, berlaku_sampai: new Date() },
      });
    }

    return true;
  }

  static async archiveTeachingAssignment(
    id: string,
    sekolah_id: string,
    actorId?: string,
    actorRole?: string
  ): Promise<TeachingAssignmentDTO> {
    const existing = await TeacherRepository.findTeachingAssignmentById(id, sekolah_id);
    if (!existing) {
      throw new CrossSchoolBoundaryError(`Penugasan Mengajar ${id}`);
    }

    const archived = await TeacherRepository.updateTeachingAssignment({
      id,
      sekolah_id,
      status: "ARSIP",
      berlaku_sampai: existing.berlaku_sampai || new Date(),
    });

    if (actorId && actorRole) {
      await recordAuditEvent({
        sekolah_id,
        aktor_id: actorId,
        aktor_role: actorRole,
        aksi: "UPDATE",
        tipe_sumber: "PENUGASAN_MENGAJAR",
        id_sumber: id,
        payload_sebelum: existing as unknown as Record<string, unknown>,
        payload_sesudah: archived as unknown as Record<string, unknown>,
      });
    }

    return archived;
  }

  static async deleteTeachingAssignment(
    id: string,
    sekolah_id: string,
    actorId?: string,
    actorRole?: string
  ): Promise<boolean> {
    const existing = await TeacherRepository.findTeachingAssignmentById(id, sekolah_id);
    if (!existing) {
      throw new CrossSchoolBoundaryError(`Penugasan Mengajar ${id}`);
    }

    const dependencies = await TeacherRepository.getTeachingAssignmentDependencySummary(
      id,
      sekolah_id
    );
    if (dependencies.total > 0) {
      throw new TeachingAssignmentInUseError(
        `${existing.guru_nama} - ${existing.mata_pelajaran_nama} - ${existing.rombel_nama}`,
        dependencies.total
      );
    }

    try {
      await TeacherRepository.deleteTeachingAssignment(id, sekolah_id);
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2003"
      ) {
        throw new TeachingAssignmentInUseError(
          `${existing.guru_nama} - ${existing.mata_pelajaran_nama} - ${existing.rombel_nama}`,
          dependencies.total || 1
        );
      }
      throw error;
    }

    if (actorId && actorRole) {
      await recordAuditEvent({
        sekolah_id,
        aktor_id: actorId,
        aktor_role: actorRole,
        aksi: "DELETE",
        tipe_sumber: "PENUGASAN_MENGAJAR",
        id_sumber: id,
        payload_sebelum: existing as unknown as Record<string, unknown>,
      });
    }

    return true;
  }

  static async bulkUpdateLifecycle(
    ids: string[],
    sekolah_id: string,
    status: StatusPenugasan,
    actorId?: string,
    actorRole?: string
  ): Promise<BulkLifecycleResult> {
    const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
    const result: BulkLifecycleResult = {
      requested: uniqueIds.length,
      updated: 0,
      deleted: 0,
      archived: 0,
      rejected: [],
    };

    for (const id of uniqueIds) {
      try {
        await (status === "ARSIP"
          ? this.archiveTeachingAssignment(id, sekolah_id, actorId, actorRole)
          : this.updateTeachingAssignment({ id, sekolah_id, status }, actorId, actorRole));
        result.updated += 1;
        if (status === "ARSIP") result.archived += 1;
      } catch (error: unknown) {
        result.rejected.push({
          id,
          reason: error instanceof Error ? error.message : "Gagal memperbarui lifecycle penugasan.",
        });
      }
    }

    return result;
  }

  static async bulkDeleteTeachingAssignments(
    ids: string[],
    sekolah_id: string,
    actorId?: string,
    actorRole?: string
  ): Promise<BulkLifecycleResult> {
    const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
    const result: BulkLifecycleResult = {
      requested: uniqueIds.length,
      updated: 0,
      deleted: 0,
      archived: 0,
      rejected: [],
    };

    for (const id of uniqueIds) {
      try {
        await this.deleteTeachingAssignment(id, sekolah_id, actorId, actorRole);
        result.deleted += 1;
      } catch (error: unknown) {
        if (error instanceof TeachingAssignmentInUseError) {
          try {
            await this.archiveTeachingAssignment(id, sekolah_id, actorId, actorRole);
            result.archived += 1;
          } catch (archiveError: unknown) {
            result.rejected.push({
              id,
              reason:
                archiveError instanceof Error
                  ? archiveError.message
                  : "Gagal mengarsipkan penugasan mengajar.",
            });
          }
        } else {
          result.rejected.push({
            id,
            reason: error instanceof Error ? error.message : "Gagal menghapus penugasan mengajar.",
          });
        }
      }
    }

    return result;
  }
}
