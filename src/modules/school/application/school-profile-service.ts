/**
 * Ruang Pintar — School Profile Application Service (M01)
 */

import { AuditContext, schoolRepository } from "../infrastructure/school-repository";
import { DuplicateNpsnError, SchoolNotFoundError } from "../domain/school-errors";
import { SchoolProfileDTO, UpdateSchoolProfileInput } from "../domain/school-types";
import { updateSchoolProfileSchema } from "../domain/school-validation";

export class SchoolProfileService {
  /**
   * Mengambil profil sekolah aktif.
   */
  async getProfile(sekolahId: string): Promise<SchoolProfileDTO> {
    const school = await schoolRepository.findSchoolById(sekolahId);
    if (!school) {
      throw new SchoolNotFoundError(sekolahId);
    }
    return school as SchoolProfileDTO;
  }

  /**
   * Memperbarui profil sekolah.
   */
  async updateProfile(
    sekolahId: string,
    rawInput: UpdateSchoolProfileInput,
    auditContext: AuditContext
  ): Promise<SchoolProfileDTO> {
    const validated = updateSchoolProfileSchema.parse(rawInput);

    const existingSchool = await schoolRepository.findSchoolById(sekolahId);
    if (!existingSchool) {
      throw new SchoolNotFoundError(sekolahId);
    }

    // Validasi keunikan NPSN bila diubah
    if (validated.npsn && validated.npsn !== existingSchool.npsn) {
      const duplicate = await schoolRepository.findSchoolByNpsn(validated.npsn);
      if (duplicate && duplicate.id !== sekolahId) {
        throw new DuplicateNpsnError(validated.npsn);
      }
    }

    const updated = await schoolRepository.updateSchoolProfile(
      sekolahId,
      {
        nama: validated.nama,
        npsn: validated.npsn,
        jenjang: validated.jenjang,
        alamat: validated.alamat,
        telepon: validated.telepon,
        email: validated.email,
        zona_waktu: validated.zona_waktu,
        logo_url: validated.logo_url,
      },
      auditContext
    );

    return updated as SchoolProfileDTO;
  }
}

export const schoolProfileService = new SchoolProfileService();
