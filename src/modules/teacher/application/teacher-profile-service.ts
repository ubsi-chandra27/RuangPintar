/**
 * Ruang Pintar — M08 Teacher Profile Application Service
 */

import { recordAuditEvent } from "@/shared/infrastructure/audit/audit-logger";
import {
  TeacherAcademicHistoryError,
  TeacherNipDuplicateError,
  TeacherNotFoundError,
} from "../domain/teacher-errors";
import {
  CreateTeacherInput,
  BulkLifecycleResult,
  StatusKepegawaianGuru,
  StatusLifecycle,
  TeacherProfileDTO,
  UpdateTeacherInput,
} from "../domain/teacher-types";
import { CreateTeacherSchema, UpdateTeacherSchema } from "../domain/teacher-validation";
import { TeacherRepository } from "../infrastructure/teacher-repository";

export class TeacherProfileService {
  static async getTeachers(
    sekolah_id: string,
    options?: {
      search?: string;
      status_aktif?: boolean;
      status_lifecycle?: StatusLifecycle;
      status_kepegawaian?: StatusKepegawaianGuru;
      take?: number;
      skip?: number;
    }
  ): Promise<TeacherProfileDTO[]> {
    return TeacherRepository.findTeachers(sekolah_id, options);
  }

  static async getTeacherById(id: string, sekolah_id: string): Promise<TeacherProfileDTO> {
    const teacher = await TeacherRepository.findTeacherById(id, sekolah_id);
    if (!teacher) {
      throw new TeacherNotFoundError(id);
    }
    return teacher;
  }

  static async getTeacherByUserId(
    pengguna_id: string,
    sekolah_id?: string
  ): Promise<TeacherProfileDTO | null> {
    return TeacherRepository.findTeacherByUserId(pengguna_id, sekolah_id);
  }

  static async createTeacher(
    input: CreateTeacherInput,
    actorId?: string,
    actorRole?: string
  ): Promise<TeacherProfileDTO> {
    const validated = CreateTeacherSchema.parse(input);

    // Uniqueness check for NIP if provided
    if (validated.nip) {
      const existing = await TeacherRepository.findTeacherByNip(
        validated.nip,
        validated.sekolah_id
      );
      if (existing) {
        throw new TeacherNipDuplicateError(validated.nip);
      }
    }

    const created = await TeacherRepository.createTeacher({
      sekolah_id: validated.sekolah_id,
      pengguna_id: validated.pengguna_id || null,
      nip: validated.nip || null,
      nuptk: validated.nuptk || null,
      nama_lengkap: validated.nama_lengkap,
      gelar_depan: validated.gelar_depan || null,
      gelar_belakang: validated.gelar_belakang || null,
      jenis_kelamin: validated.jenis_kelamin,
      tempat_lahir: validated.tempat_lahir || null,
      tanggal_lahir: validated.tanggal_lahir || null,
      email: validated.email || null,
      telepon: validated.telepon || null,
      alamat: validated.alamat || null,
      status_kepegawaian: validated.status_kepegawaian as StatusKepegawaianGuru,
      status_aktif: validated.status_aktif,
      status_lifecycle: validated.status_lifecycle as StatusLifecycle,
      foto_url: validated.foto_url || null,
      catatan: validated.catatan || null,
    });

    if (actorId && actorRole) {
      await recordAuditEvent({
        sekolah_id: validated.sekolah_id,
        aktor_id: actorId,
        aktor_role: actorRole,
        aksi: "CREATE",
        tipe_sumber: "GURU",
        id_sumber: created.id,
        payload_sesudah: created as unknown as Record<string, unknown>,
      });
    }

    return created;
  }

  static async updateTeacher(
    input: UpdateTeacherInput,
    actorId?: string,
    actorRole?: string
  ): Promise<TeacherProfileDTO> {
    const validated = UpdateTeacherSchema.parse(input);

    const existing = await TeacherRepository.findTeacherById(validated.id, validated.sekolah_id);
    if (!existing) {
      throw new TeacherNotFoundError(validated.id);
    }

    // Check NIP uniqueness if changing
    if (validated.nip && validated.nip !== existing.nip) {
      const duplicateNip = await TeacherRepository.findTeacherByNip(
        validated.nip,
        validated.sekolah_id
      );
      if (duplicateNip && duplicateNip.id !== validated.id) {
        throw new TeacherNipDuplicateError(validated.nip);
      }
    }

    const updated = await TeacherRepository.updateTeacher({
      id: validated.id,
      sekolah_id: validated.sekolah_id,
      pengguna_id: validated.pengguna_id,
      nip: validated.nip,
      nuptk: validated.nuptk,
      nama_lengkap: validated.nama_lengkap,
      gelar_depan: validated.gelar_depan,
      gelar_belakang: validated.gelar_belakang,
      jenis_kelamin: validated.jenis_kelamin,
      tempat_lahir: validated.tempat_lahir,
      tanggal_lahir: validated.tanggal_lahir,
      email: validated.email,
      telepon: validated.telepon,
      alamat: validated.alamat,
      status_kepegawaian: validated.status_kepegawaian as StatusKepegawaianGuru,
      status_aktif: validated.status_aktif,
      status_lifecycle: validated.status_lifecycle as StatusLifecycle | undefined,
      foto_url: validated.foto_url,
      catatan: validated.catatan,
    });

    if (actorId && actorRole) {
      await recordAuditEvent({
        sekolah_id: validated.sekolah_id,
        aktor_id: actorId,
        aktor_role: actorRole,
        aksi: "UPDATE",
        tipe_sumber: "GURU",
        id_sumber: updated.id,
        payload_sebelum: existing as unknown as Record<string, unknown>,
        payload_sesudah: updated as unknown as Record<string, unknown>,
      });
    }

    return updated;
  }

  static async deleteTeacher(
    id: string,
    sekolah_id: string,
    actorId?: string,
    actorRole?: string
  ): Promise<boolean> {
    const existing = await TeacherRepository.findTeacherById(id, sekolah_id);
    if (!existing) {
      throw new TeacherNotFoundError(id);
    }

    const dependencies = await TeacherRepository.getTeacherDependencySummary(id, sekolah_id);
    if (dependencies.total > 0) {
      throw new TeacherAcademicHistoryError(existing.nama_lengkap);
    }

    try {
      const deleted = await TeacherRepository.deleteTeacher(id, sekolah_id);
      if (!deleted) {
        throw new TeacherNotFoundError(id);
      }
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2003"
      ) {
        throw new TeacherAcademicHistoryError(existing.nama_lengkap);
      }
      throw error;
    }

    if (actorId && actorRole) {
      await recordAuditEvent({
        sekolah_id,
        aktor_id: actorId,
        aktor_role: actorRole,
        aksi: "DELETE",
        tipe_sumber: "GURU",
        id_sumber: id,
        payload_sebelum: existing as unknown as Record<string, unknown>,
      });
    }

    return true;
  }

  static async deactivateTeacher(
    id: string,
    sekolah_id: string,
    actorId?: string,
    actorRole?: string
  ): Promise<TeacherProfileDTO> {
    return this.updateTeacher(
      { id, sekolah_id, status_aktif: false, status_lifecycle: "NONAKTIF" },
      actorId,
      actorRole
    );
  }

  static async archiveTeacher(
    id: string,
    sekolah_id: string,
    actorId?: string,
    actorRole?: string
  ): Promise<TeacherProfileDTO> {
    const existing = await TeacherRepository.findTeacherById(id, sekolah_id);
    if (!existing) {
      throw new TeacherNotFoundError(id);
    }

    const archived = await TeacherRepository.updateTeacherLifecycle(id, sekolah_id, "ARSIP");

    if (actorId && actorRole) {
      await recordAuditEvent({
        sekolah_id,
        aktor_id: actorId,
        aktor_role: actorRole,
        aksi: "UPDATE",
        tipe_sumber: "GURU",
        id_sumber: id,
        payload_sebelum: existing as unknown as Record<string, unknown>,
        payload_sesudah: archived as unknown as Record<string, unknown>,
      });
    }

    return archived;
  }

  static async restoreTeacher(
    id: string,
    sekolah_id: string,
    actorId?: string,
    actorRole?: string
  ): Promise<TeacherProfileDTO> {
    const existing = await TeacherRepository.findTeacherById(id, sekolah_id);
    if (!existing) {
      throw new TeacherNotFoundError(id);
    }

    const restored = await TeacherRepository.updateTeacherLifecycle(id, sekolah_id, "AKTIF");

    if (actorId && actorRole) {
      await recordAuditEvent({
        sekolah_id,
        aktor_id: actorId,
        aktor_role: actorRole,
        aksi: "UPDATE",
        tipe_sumber: "GURU",
        id_sumber: id,
        payload_sebelum: existing as unknown as Record<string, unknown>,
        payload_sesudah: restored as unknown as Record<string, unknown>,
      });
    }

    return restored;
  }

  static async bulkUpdateLifecycle(
    ids: string[],
    sekolah_id: string,
    status_lifecycle: StatusLifecycle,
    actorId?: string,
    actorRole?: string
  ): Promise<BulkLifecycleResult> {
    const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
    const result: BulkLifecycleResult = {
      requested: uniqueIds.length,
      updated: 0,
      deleted: 0,
      archived: status_lifecycle === "ARSIP" ? 0 : 0,
      rejected: [],
    };

    for (const id of uniqueIds) {
      try {
        await (status_lifecycle === "ARSIP"
          ? this.archiveTeacher(id, sekolah_id, actorId, actorRole)
          : this.updateTeacher({ id, sekolah_id, status_lifecycle }, actorId, actorRole));
        result.updated += 1;
        if (status_lifecycle === "ARSIP") result.archived += 1;
      } catch (error: unknown) {
        result.rejected.push({
          id,
          reason: error instanceof Error ? error.message : "Gagal memperbarui lifecycle guru.",
        });
      }
    }

    return result;
  }

  static async bulkDeleteTeachers(
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
        await this.deleteTeacher(id, sekolah_id, actorId, actorRole);
        result.deleted += 1;
      } catch (error: unknown) {
        if (error instanceof TeacherAcademicHistoryError) {
          try {
            await this.archiveTeacher(id, sekolah_id, actorId, actorRole);
            result.archived += 1;
          } catch (archiveError: unknown) {
            result.rejected.push({
              id,
              reason:
                archiveError instanceof Error ? archiveError.message : "Gagal mengarsipkan guru.",
            });
          }
        } else {
          result.rejected.push({
            id,
            reason: error instanceof Error ? error.message : "Gagal menghapus guru.",
          });
        }
      }
    }

    return result;
  }
}
