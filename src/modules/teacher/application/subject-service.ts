/**
 * Ruang Pintar — M08 Subject (Mata Pelajaran) Application Service
 */

import { recordAuditEvent } from "@/shared/infrastructure/audit/audit-logger";
import {
  SubjectCodeDuplicateError,
  SubjectInUseError,
  SubjectNotFoundError,
} from "../domain/teacher-errors";
import {
  BulkLifecycleResult,
  CreateSubjectInput,
  StatusLifecycle,
  SubjectDTO,
  UpdateSubjectInput,
} from "../domain/teacher-types";
import { CreateSubjectSchema, UpdateSubjectSchema } from "../domain/teacher-validation";
import { TeacherRepository } from "../infrastructure/teacher-repository";

export class SubjectService {
  static async getSubjects(
    sekolah_id: string,
    options?: {
      search?: string;
      status_aktif?: boolean;
      status_lifecycle?: StatusLifecycle;
      kelompok?: string;
      take?: number;
      skip?: number;
    }
  ): Promise<SubjectDTO[]> {
    return TeacherRepository.findSubjects(sekolah_id, options);
  }

  static async getSubjectById(id: string, sekolah_id: string): Promise<SubjectDTO> {
    const subject = await TeacherRepository.findSubjectById(id, sekolah_id);
    if (!subject) {
      throw new SubjectNotFoundError(id);
    }
    return subject;
  }

  static async createSubject(
    input: CreateSubjectInput,
    actorId?: string,
    actorRole?: string
  ): Promise<SubjectDTO> {
    const validated = CreateSubjectSchema.parse(input);

    const existingKode = await TeacherRepository.findSubjectByKode(
      validated.kode,
      validated.sekolah_id
    );
    if (existingKode) {
      throw new SubjectCodeDuplicateError(validated.kode);
    }

    const created = await TeacherRepository.createSubject({
      sekolah_id: validated.sekolah_id,
      kode: validated.kode,
      nama: validated.nama,
      kelompok: validated.kelompok || null,
      status_aktif: validated.status_aktif,
      status_lifecycle: validated.status_lifecycle as StatusLifecycle,
      deskripsi: validated.deskripsi || null,
    });

    if (actorId && actorRole) {
      await recordAuditEvent({
        sekolah_id: validated.sekolah_id,
        aktor_id: actorId,
        aktor_role: actorRole,
        aksi: "CREATE",
        tipe_sumber: "MATA_PELAJARAN",
        id_sumber: created.id,
        payload_sesudah: created as unknown as Record<string, unknown>,
      });
    }

    return created;
  }

  static async updateSubject(
    input: UpdateSubjectInput,
    actorId?: string,
    actorRole?: string
  ): Promise<SubjectDTO> {
    const validated = UpdateSubjectSchema.parse(input);

    const existing = await TeacherRepository.findSubjectById(validated.id, validated.sekolah_id);
    if (!existing) {
      throw new SubjectNotFoundError(validated.id);
    }

    if (validated.kode && validated.kode !== existing.kode) {
      const duplicateKode = await TeacherRepository.findSubjectByKode(
        validated.kode,
        validated.sekolah_id
      );
      if (duplicateKode && duplicateKode.id !== validated.id) {
        throw new SubjectCodeDuplicateError(validated.kode);
      }
    }

    const updated = await TeacherRepository.updateSubject({
      id: validated.id,
      sekolah_id: validated.sekolah_id,
      kode: validated.kode,
      nama: validated.nama,
      kelompok: validated.kelompok,
      status_aktif: validated.status_aktif,
      status_lifecycle: validated.status_lifecycle as StatusLifecycle | undefined,
      deskripsi: validated.deskripsi,
    });

    if (actorId && actorRole) {
      await recordAuditEvent({
        sekolah_id: validated.sekolah_id,
        aktor_id: actorId,
        aktor_role: actorRole,
        aksi: "UPDATE",
        tipe_sumber: "MATA_PELAJARAN",
        id_sumber: updated.id,
        payload_sebelum: existing as unknown as Record<string, unknown>,
        payload_sesudah: updated as unknown as Record<string, unknown>,
      });
    }

    return updated;
  }

  static async deleteSubject(
    id: string,
    sekolah_id: string,
    actorId?: string,
    actorRole?: string
  ): Promise<boolean> {
    const existing = await TeacherRepository.findSubjectById(id, sekolah_id);
    if (!existing) {
      throw new SubjectNotFoundError(id);
    }

    const usageCount = await TeacherRepository.countSubjectUsage(id, sekolah_id);
    if (usageCount > 0) {
      throw new SubjectInUseError(existing.nama, usageCount);
    }

    try {
      await TeacherRepository.deleteSubject(id, sekolah_id);
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2003"
      ) {
        throw new SubjectInUseError(existing.nama, usageCount || 1);
      }
      throw error;
    }

    if (actorId && actorRole) {
      await recordAuditEvent({
        sekolah_id,
        aktor_id: actorId,
        aktor_role: actorRole,
        aksi: "DELETE",
        tipe_sumber: "MATA_PELAJARAN",
        id_sumber: id,
        payload_sebelum: existing as unknown as Record<string, unknown>,
      });
    }

    return true;
  }

  static async deactivateSubject(
    id: string,
    sekolah_id: string,
    actorId?: string,
    actorRole?: string
  ): Promise<SubjectDTO> {
    return this.updateSubject(
      { id, sekolah_id, status_aktif: false, status_lifecycle: "NONAKTIF" },
      actorId,
      actorRole
    );
  }

  static async archiveSubject(
    id: string,
    sekolah_id: string,
    actorId?: string,
    actorRole?: string
  ): Promise<SubjectDTO> {
    const existing = await TeacherRepository.findSubjectById(id, sekolah_id);
    if (!existing) {
      throw new SubjectNotFoundError(id);
    }

    const archived = await TeacherRepository.updateSubjectLifecycle(id, sekolah_id, "ARSIP");

    if (actorId && actorRole) {
      await recordAuditEvent({
        sekolah_id,
        aktor_id: actorId,
        aktor_role: actorRole,
        aksi: "UPDATE",
        tipe_sumber: "MATA_PELAJARAN",
        id_sumber: id,
        payload_sebelum: existing as unknown as Record<string, unknown>,
        payload_sesudah: archived as unknown as Record<string, unknown>,
      });
    }

    return archived;
  }

  static async restoreSubject(
    id: string,
    sekolah_id: string,
    actorId?: string,
    actorRole?: string
  ): Promise<SubjectDTO> {
    const existing = await TeacherRepository.findSubjectById(id, sekolah_id);
    if (!existing) {
      throw new SubjectNotFoundError(id);
    }

    const restored = await TeacherRepository.updateSubjectLifecycle(id, sekolah_id, "AKTIF");

    if (actorId && actorRole) {
      await recordAuditEvent({
        sekolah_id,
        aktor_id: actorId,
        aktor_role: actorRole,
        aksi: "UPDATE",
        tipe_sumber: "MATA_PELAJARAN",
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
      archived: 0,
      rejected: [],
    };

    for (const id of uniqueIds) {
      try {
        await (status_lifecycle === "ARSIP"
          ? this.archiveSubject(id, sekolah_id, actorId, actorRole)
          : this.updateSubject({ id, sekolah_id, status_lifecycle }, actorId, actorRole));
        result.updated += 1;
        if (status_lifecycle === "ARSIP") result.archived += 1;
      } catch (error: unknown) {
        result.rejected.push({
          id,
          reason: error instanceof Error ? error.message : "Gagal memperbarui lifecycle mapel.",
        });
      }
    }

    return result;
  }

  static async bulkDeleteSubjects(
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
        await this.deleteSubject(id, sekolah_id, actorId, actorRole);
        result.deleted += 1;
      } catch (error: unknown) {
        if (error instanceof SubjectInUseError) {
          try {
            await this.archiveSubject(id, sekolah_id, actorId, actorRole);
            result.archived += 1;
          } catch (archiveError: unknown) {
            result.rejected.push({
              id,
              reason:
                archiveError instanceof Error
                  ? archiveError.message
                  : "Gagal mengarsipkan mata pelajaran.",
            });
          }
        } else {
          result.rejected.push({
            id,
            reason: error instanceof Error ? error.message : "Gagal menghapus mata pelajaran.",
          });
        }
      }
    }

    return result;
  }
}
