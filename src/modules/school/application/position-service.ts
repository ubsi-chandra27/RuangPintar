/**
 * Ruang Pintar — Master Position Application Service (M01)
 */

import { AuditContext, schoolRepository } from "../infrastructure/school-repository";
import {
  DuplicatePositionCodeError,
  OrganizationUnitNotFoundError,
  PositionHasAssignmentsError,
  PositionNotFoundError,
} from "../domain/school-errors";
import { CreatePositionInput, PositionDTO, UpdatePositionInput } from "../domain/school-types";
import { createPositionSchema, updatePositionSchema } from "../domain/school-validation";

const CANONICAL_POSITION_CODES = new Set([
  "HEADMASTER",
  "VICE_PRINCIPAL_CURRICULUM",
  "VICE_PRINCIPAL_STUDENT_AFFAIRS",
  "PROGRAM_HEAD",
]);

export class PositionService {
  /**
   * Mengambil daftar seluruh master jabatan pada sekolah.
   */
  async getPositions(sekolahId: string): Promise<PositionDTO[]> {
    const positions = await schoolRepository.findPositions(sekolahId);
    return positions.map((p) => ({
      id: p.id,
      sekolah_id: p.sekolah_id,
      unit_id: p.unit_id,
      unit_nama: p.unit?.nama ?? null,
      kode_jabatan: p.kode_jabatan,
      nama_jabatan: p.nama_jabatan,
      tingkat_akses: p.tingkat_akses,
      is_canonical: CANONICAL_POSITION_CODES.has(p.kode_jabatan),
      penugasan_count: p._count.penugasan,
      created_at: p.created_at,
      updated_at: p.updated_at,
    }));
  }

  /**
   * Mengambil detail satu master jabatan.
   */
  async getPositionById(id: string, sekolahId: string): Promise<PositionDTO> {
    const p = await schoolRepository.findPositionById(id, sekolahId);
    if (!p) {
      throw new PositionNotFoundError(id);
    }
    return {
      id: p.id,
      sekolah_id: p.sekolah_id,
      unit_id: p.unit_id,
      unit_nama: p.unit?.nama ?? null,
      kode_jabatan: p.kode_jabatan,
      nama_jabatan: p.nama_jabatan,
      tingkat_akses: p.tingkat_akses,
      is_canonical: CANONICAL_POSITION_CODES.has(p.kode_jabatan),
      penugasan_count: p._count.penugasan,
      created_at: p.created_at,
      updated_at: p.updated_at,
    };
  }

  /**
   * Membuat master jabatan baru.
   */
  async createPosition(
    sekolahId: string,
    rawInput: CreatePositionInput,
    auditContext: AuditContext
  ): Promise<PositionDTO> {
    const validated = createPositionSchema.parse(rawInput);

    // Cek duplikasi kode jabatan pada sekolah yang sama
    const duplicate = await schoolRepository.findPositionByCode(sekolahId, validated.kode_jabatan);
    if (duplicate) {
      throw new DuplicatePositionCodeError(validated.kode_jabatan);
    }

    // Validasi unit organisasi jika ditentukan
    if (validated.unit_id) {
      const unit = await schoolRepository.findOrganizationUnitById(validated.unit_id, sekolahId);
      if (!unit) {
        throw new OrganizationUnitNotFoundError(validated.unit_id);
      }
    }

    const created = await schoolRepository.createPosition(
      sekolahId,
      {
        kode_jabatan: validated.kode_jabatan,
        nama_jabatan: validated.nama_jabatan,
        unit_id: validated.unit_id,
        tingkat_akses: validated.tingkat_akses,
      },
      auditContext
    );

    return {
      id: created.id,
      sekolah_id: created.sekolah_id,
      unit_id: created.unit_id,
      kode_jabatan: created.kode_jabatan,
      nama_jabatan: created.nama_jabatan,
      tingkat_akses: created.tingkat_akses,
      is_canonical: CANONICAL_POSITION_CODES.has(created.kode_jabatan),
      penugasan_count: 0,
      created_at: created.created_at,
      updated_at: created.updated_at,
    };
  }

  /**
   * Memperbarui master jabatan.
   */
  async updatePosition(
    id: string,
    sekolahId: string,
    rawInput: UpdatePositionInput,
    auditContext: AuditContext
  ): Promise<PositionDTO> {
    const validated = updatePositionSchema.parse(rawInput);

    const existing = await schoolRepository.findPositionById(id, sekolahId);
    if (!existing) {
      throw new PositionNotFoundError(id);
    }

    // Validasi unit organisasi jika ditentukan
    if (validated.unit_id) {
      const unit = await schoolRepository.findOrganizationUnitById(validated.unit_id, sekolahId);
      if (!unit) {
        throw new OrganizationUnitNotFoundError(validated.unit_id);
      }
    }

    const updated = await schoolRepository.updatePosition(
      id,
      sekolahId,
      {
        nama_jabatan: validated.nama_jabatan,
        unit_id: validated.unit_id,
        tingkat_akses: validated.tingkat_akses,
      },
      auditContext
    );

    return {
      id: updated.id,
      sekolah_id: updated.sekolah_id,
      unit_id: updated.unit_id,
      kode_jabatan: updated.kode_jabatan,
      nama_jabatan: updated.nama_jabatan,
      tingkat_akses: updated.tingkat_akses,
      is_canonical: CANONICAL_POSITION_CODES.has(updated.kode_jabatan),
      penugasan_count: existing._count.penugasan,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    };
  }

  /**
   * Menghapus jabatan (History-Preserving Rule).
   */
  async deletePosition(id: string, sekolahId: string, auditContext: AuditContext): Promise<void> {
    const position = await schoolRepository.findPositionById(id, sekolahId);
    if (!position) {
      throw new PositionNotFoundError(id);
    }

    // History-Preserving Rule: Tolak jika pernah memiliki penugasan personil
    if (position._count.penugasan > 0) {
      throw new PositionHasAssignmentsError(position.nama_jabatan, position._count.penugasan);
    }

    await schoolRepository.deletePosition(id, sekolahId, auditContext);
  }
}

export const positionService = new PositionService();
