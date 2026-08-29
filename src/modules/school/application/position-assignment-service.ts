/**
 * Ruang Pintar — Position Assignment Application Service (M01)
 */

import { AuditContext, schoolRepository } from "../infrastructure/school-repository";
import {
  InvalidPersonilError,
  PositionAssignmentNotFoundError,
  PositionNotFoundError,
  SchoolDomainError,
} from "../domain/school-errors";
import {
  AssignPositionInput,
  CancelPositionAssignmentInput,
  EndPositionAssignmentInput,
  PersonilOptionDTO,
  PositionAssignmentDTO,
} from "../domain/school-types";
import {
  assignPositionSchema,
  cancelPositionAssignmentSchema,
  endPositionAssignmentSchema,
} from "../domain/school-validation";

export class PositionAssignmentService {
  /**
   * Mengambil daftar penugasan jabatan pada sekolah.
   */
  async getAssignments(sekolahId: string, filterStatus?: string): Promise<PositionAssignmentDTO[]> {
    const assignments = await schoolRepository.findPositionAssignments(sekolahId, filterStatus);
    return assignments.map((a) => ({
      id: a.id,
      sekolah_id: a.sekolah_id,
      jabatan_id: a.jabatan_id,
      jabatan_nama: a.jabatan?.nama_jabatan,
      jabatan_kode: a.jabatan?.kode_jabatan,
      unit_nama: a.jabatan?.unit?.nama ?? null,
      personil_id: a.personil_id,
      personil_nama: a.personil_nama,
      personil_username: a.personil_username,
      berlaku_mulai: a.berlaku_mulai,
      berlaku_sampai: a.berlaku_sampai,
      status: a.status,
      catatan: a.catatan,
      created_at: a.created_at,
      updated_at: a.updated_at,
    }));
  }

  /**
   * Mengambil daftar personil aktif yang dapat ditugaskan.
   */
  async getAssignablePersonnel(sekolahId: string): Promise<PersonilOptionDTO[]> {
    const personnel = await schoolRepository.findAssignablePersonnel(sekolahId);
    return personnel.map((p) => ({
      id: p.id,
      username: p.username,
      nama_lengkap: p.nama_lengkap,
      peran_dasar: p.peran_dasar,
      status_akun: p.status_akun,
    }));
  }

  /**
   * Membuat penugasan jabatan baru untuk personil.
   */
  async assignPosition(
    sekolahId: string,
    rawInput: AssignPositionInput,
    auditContext: AuditContext
  ): Promise<PositionAssignmentDTO> {
    const validated = assignPositionSchema.parse(rawInput);

    // 1. Validasi Jabatan
    const position = await schoolRepository.findPositionById(validated.jabatan_id, sekolahId);
    if (!position) {
      throw new PositionNotFoundError(validated.jabatan_id);
    }

    // 2. Validasi Personil (Application-Level Invariant)
    const personil = await schoolRepository.findActiveUserInSchool(
      validated.personil_id,
      sekolahId
    );
    if (!personil) {
      throw new InvalidPersonilError(
        validated.personil_id,
        "akun tidak ditemukan atau tidak aktif di sekolah ini"
      );
    }

    // 3. Validasi Rentang Tanggal
    if (validated.berlaku_sampai && validated.berlaku_sampai < validated.berlaku_mulai) {
      throw new SchoolDomainError(
        "Tanggal selesai penugasan tidak boleh lebih awal dari tanggal mulai.",
        "INVALID_DATE_RANGE",
        400
      );
    }

    const created = await schoolRepository.createPositionAssignment(
      sekolahId,
      {
        personil_id: validated.personil_id,
        jabatan_id: validated.jabatan_id,
        berlaku_mulai: validated.berlaku_mulai,
        berlaku_sampai: validated.berlaku_sampai,
        catatan: validated.catatan,
      },
      auditContext
    );

    return {
      id: created.id,
      sekolah_id: created.sekolah_id,
      jabatan_id: created.jabatan_id,
      jabatan_nama: position.nama_jabatan,
      jabatan_kode: position.kode_jabatan,
      unit_nama: position.unit?.nama ?? null,
      personil_id: created.personil_id,
      personil_nama: personil.nama_lengkap,
      personil_username: personil.username,
      berlaku_mulai: created.berlaku_mulai,
      berlaku_sampai: created.berlaku_sampai,
      status: created.status,
      catatan: created.catatan,
      created_at: created.created_at,
      updated_at: created.updated_at,
    };
  }

  /**
   * Mengakhiri penugasan jabatan secara resmi (Status -> SELESAI).
   */
  async endAssignment(
    id: string,
    sekolahId: string,
    rawInput: EndPositionAssignmentInput,
    auditContext: AuditContext
  ): Promise<PositionAssignmentDTO> {
    const validated = endPositionAssignmentSchema.parse({
      assignment_id: id,
      ...rawInput,
    });

    const existing = await schoolRepository.findPositionAssignmentById(id, sekolahId);
    if (!existing) {
      throw new PositionAssignmentNotFoundError(id);
    }

    if (existing.status !== "AKTIF") {
      throw new SchoolDomainError(
        `Penugasan tidak dapat diakhiri karena saat ini berstatus '${existing.status}'.`,
        "INVALID_STATUS_TRANSITION",
        400
      );
    }

    if (validated.berlaku_sampai < existing.berlaku_mulai) {
      throw new SchoolDomainError(
        "Tanggal akhir penugasan tidak boleh mendahului tanggal mulai penugasan.",
        "INVALID_DATE_RANGE",
        400
      );
    }

    const updated = await schoolRepository.endPositionAssignment(
      id,
      sekolahId,
      validated.berlaku_sampai,
      validated.catatan,
      auditContext
    );

    return {
      id: updated.id,
      sekolah_id: updated.sekolah_id,
      jabatan_id: updated.jabatan_id,
      personil_id: updated.personil_id,
      berlaku_mulai: updated.berlaku_mulai,
      berlaku_sampai: updated.berlaku_sampai,
      status: updated.status,
      catatan: updated.catatan,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    };
  }

  /**
   * Membatalkan penugasan jabatan (Status -> DIBATALKAN).
   */
  async cancelAssignment(
    id: string,
    sekolahId: string,
    rawInput: CancelPositionAssignmentInput,
    auditContext: AuditContext
  ): Promise<PositionAssignmentDTO> {
    const validated = cancelPositionAssignmentSchema.parse({
      assignment_id: id,
      ...rawInput,
    });

    const existing = await schoolRepository.findPositionAssignmentById(id, sekolahId);
    if (!existing) {
      throw new PositionAssignmentNotFoundError(id);
    }

    if (existing.status === "DIBATALKAN") {
      throw new SchoolDomainError(
        "Penugasan sudah berstatus DIBATALKAN sebelumnya.",
        "ALREADY_CANCELLED",
        400
      );
    }

    const updated = await schoolRepository.cancelPositionAssignment(
      id,
      sekolahId,
      validated.catatan,
      auditContext
    );

    return {
      id: updated.id,
      sekolah_id: updated.sekolah_id,
      jabatan_id: updated.jabatan_id,
      personil_id: updated.personil_id,
      berlaku_mulai: updated.berlaku_mulai,
      berlaku_sampai: updated.berlaku_sampai,
      status: updated.status,
      catatan: updated.catatan,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    };
  }
}

export const positionAssignmentService = new PositionAssignmentService();
