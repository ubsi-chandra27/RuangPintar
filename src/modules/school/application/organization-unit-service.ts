/**
 * Ruang Pintar — Organization Unit Application Service (M01)
 */

import { AuditContext, schoolRepository } from "../infrastructure/school-repository";
import {
  DuplicateOrganizationUnitError,
  OrganizationUnitNotFoundError,
  SchoolDomainError,
  UnitHasChildrenError,
  UnitReferencedByPositionError,
} from "../domain/school-errors";
import {
  CreateOrganizationUnitInput,
  OrganizationUnitDTO,
  UpdateOrganizationUnitInput,
} from "../domain/school-types";
import {
  createOrganizationUnitSchema,
  updateOrganizationUnitSchema,
} from "../domain/school-validation";

export class OrganizationUnitService {
  /**
   * Mengambil seluruh unit organisasi pada sekolah.
   */
  async getUnits(sekolahId: string): Promise<OrganizationUnitDTO[]> {
    const units = await schoolRepository.findOrganizationUnits(sekolahId);
    return units.map((u) => ({
      id: u.id,
      sekolah_id: u.sekolah_id,
      nama: u.nama,
      kode: u.kode,
      induk_unit_id: u.induk_unit_id,
      induk_unit_nama: u.induk_unit?.nama ?? null,
      sub_unit_count: u._count.sub_unit,
      jabatan_count: u._count.jabatan,
      created_at: u.created_at,
      updated_at: u.updated_at,
    }));
  }

  /**
   * Mengambil detail satu unit organisasi.
   */
  async getUnitById(id: string, sekolahId: string): Promise<OrganizationUnitDTO> {
    const unit = await schoolRepository.findOrganizationUnitById(id, sekolahId);
    if (!unit) {
      throw new OrganizationUnitNotFoundError(id);
    }
    return {
      id: unit.id,
      sekolah_id: unit.sekolah_id,
      nama: unit.nama,
      kode: unit.kode,
      induk_unit_id: unit.induk_unit_id,
      induk_unit_nama: unit.induk_unit?.nama ?? null,
      sub_unit_count: unit._count.sub_unit,
      jabatan_count: unit._count.jabatan,
      created_at: unit.created_at,
      updated_at: unit.updated_at,
    };
  }

  /**
   * Membuat unit organisasi baru.
   */
  async createUnit(
    sekolahId: string,
    rawInput: CreateOrganizationUnitInput,
    auditContext: AuditContext
  ): Promise<OrganizationUnitDTO> {
    const validated = createOrganizationUnitSchema.parse(rawInput);

    // Cek duplikasi nama pada sekolah yang sama
    const duplicate = await schoolRepository.findOrganizationUnitByName(sekolahId, validated.nama);
    if (duplicate) {
      throw new DuplicateOrganizationUnitError(validated.nama);
    }

    // Validasi induk unit bila ditentukan
    if (validated.induk_unit_id) {
      const parent = await schoolRepository.findOrganizationUnitById(
        validated.induk_unit_id,
        sekolahId
      );
      if (!parent) {
        throw new OrganizationUnitNotFoundError(validated.induk_unit_id);
      }
    }

    const created = await schoolRepository.createOrganizationUnit(
      sekolahId,
      {
        nama: validated.nama,
        kode: validated.kode,
        induk_unit_id: validated.induk_unit_id,
      },
      auditContext
    );

    return {
      id: created.id,
      sekolah_id: created.sekolah_id,
      nama: created.nama,
      kode: created.kode,
      induk_unit_id: created.induk_unit_id,
      sub_unit_count: 0,
      jabatan_count: 0,
      created_at: created.created_at,
      updated_at: created.updated_at,
    };
  }

  /**
   * Memperbarui unit organisasi.
   */
  async updateUnit(
    id: string,
    sekolahId: string,
    rawInput: UpdateOrganizationUnitInput,
    auditContext: AuditContext
  ): Promise<OrganizationUnitDTO> {
    const validated = updateOrganizationUnitSchema.parse(rawInput);

    const existing = await schoolRepository.findOrganizationUnitById(id, sekolahId);
    if (!existing) {
      throw new OrganizationUnitNotFoundError(id);
    }

    // Cek circular parent (unit tidak boleh menjadi induk dari dirinya sendiri)
    if (validated.induk_unit_id === id) {
      throw new SchoolDomainError(
        "Unit organisasi tidak dapat menjadi induk dari dirinya sendiri.",
        "INVALID_PARENT_UNIT",
        400
      );
    }

    // Cek duplikasi nama jika nama diubah
    if (validated.nama !== existing.nama) {
      const duplicate = await schoolRepository.findOrganizationUnitByName(
        sekolahId,
        validated.nama
      );
      if (duplicate && duplicate.id !== id) {
        throw new DuplicateOrganizationUnitError(validated.nama);
      }
    }

    // Validasi induk unit bila ditentukan
    if (validated.induk_unit_id) {
      const parent = await schoolRepository.findOrganizationUnitById(
        validated.induk_unit_id,
        sekolahId
      );
      if (!parent) {
        throw new OrganizationUnitNotFoundError(validated.induk_unit_id);
      }
    }

    const updated = await schoolRepository.updateOrganizationUnit(
      id,
      sekolahId,
      {
        nama: validated.nama,
        kode: validated.kode,
        induk_unit_id: validated.induk_unit_id,
      },
      auditContext
    );

    return {
      id: updated.id,
      sekolah_id: updated.sekolah_id,
      nama: updated.nama,
      kode: updated.kode,
      induk_unit_id: updated.induk_unit_id,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    };
  }

  /**
   * Menghapus unit organisasi (History-Preserving Rule).
   */
  async deleteUnit(id: string, sekolahId: string, auditContext: AuditContext): Promise<void> {
    const unit = await schoolRepository.findOrganizationUnitById(id, sekolahId);
    if (!unit) {
      throw new OrganizationUnitNotFoundError(id);
    }

    // History-Preserving Rule 1: Tolak jika masih memiliki sub-unit
    if (unit._count.sub_unit > 0) {
      throw new UnitHasChildrenError(unit.nama, unit._count.sub_unit);
    }

    // History-Preserving Rule 2: Tolak jika masih dirujuk oleh master jabatan
    if (unit._count.jabatan > 0) {
      throw new UnitReferencedByPositionError(unit.nama, unit._count.jabatan);
    }

    await schoolRepository.deleteOrganizationUnit(id, sekolahId, auditContext);
  }
}

export const organizationUnitService = new OrganizationUnitService();
