/**
 * Ruang Pintar — School & Organization (M01) Domain Errors
 */

export class SchoolDomainError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string = "SCHOOL_DOMAIN_ERROR", statusCode: number = 400) {
    super(message);
    this.name = "SchoolDomainError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class SchoolNotFoundError extends SchoolDomainError {
  constructor(sekolahId: string) {
    super(`Sekolah dengan ID '${sekolahId}' tidak ditemukan.`, "SCHOOL_NOT_FOUND", 404);
    this.name = "SchoolNotFoundError";
  }
}

export class OrganizationUnitNotFoundError extends SchoolDomainError {
  constructor(unitId: string) {
    super(`Unit Organisasi dengan ID '${unitId}' tidak ditemukan.`, "UNIT_NOT_FOUND", 404);
    this.name = "OrganizationUnitNotFoundError";
  }
}

export class PositionNotFoundError extends SchoolDomainError {
  constructor(positionId: string) {
    super(`Jabatan dengan ID '${positionId}' tidak ditemukan.`, "POSITION_NOT_FOUND", 404);
    this.name = "PositionNotFoundError";
  }
}

export class PositionAssignmentNotFoundError extends SchoolDomainError {
  constructor(assignmentId: string) {
    super(
      `Penugasan Jabatan dengan ID '${assignmentId}' tidak ditemukan.`,
      "ASSIGNMENT_NOT_FOUND",
      404
    );
    this.name = "PositionAssignmentNotFoundError";
  }
}

export class DuplicateOrganizationUnitError extends SchoolDomainError {
  constructor(nama: string) {
    super(
      `Unit organisasi dengan nama '${nama}' sudah terdaftar pada sekolah ini.`,
      "DUPLICATE_UNIT_NAME",
      409
    );
    this.name = "DuplicateOrganizationUnitError";
  }
}

export class DuplicatePositionCodeError extends SchoolDomainError {
  constructor(kode: string) {
    super(
      `Jabatan dengan kode '${kode}' sudah terdaftar pada sekolah ini.`,
      "DUPLICATE_POSITION_CODE",
      409
    );
    this.name = "DuplicatePositionCodeError";
  }
}

export class DuplicateNpsnError extends SchoolDomainError {
  constructor(npsn: string) {
    super(`NPSN '${npsn}' sudah digunakan oleh instansi sekolah lain.`, "DUPLICATE_NPSN", 409);
    this.name = "DuplicateNpsnError";
  }
}

export class InvalidPersonilError extends SchoolDomainError {
  constructor(personilId: string, reason: string = "tidak ditemukan atau tidak aktif") {
    super(
      `Personil '${personilId}' tidak valid untuk penugasan: ${reason}.`,
      "INVALID_PERSONIL",
      400
    );
    this.name = "InvalidPersonilError";
  }
}

export class HistoryConflictError extends SchoolDomainError {
  constructor(message: string) {
    super(message, "HISTORY_CONFLICT", 409);
    this.name = "HistoryConflictError";
  }
}

export class UnitHasChildrenError extends HistoryConflictError {
  constructor(unitNama: string, childrenCount: number) {
    super(
      `Unit organisasi '${unitNama}' tidak dapat dihapus karena masih memiliki ${childrenCount} sub-unit yang menginduk kepadanya. Hapus atau pindahkan sub-unit terlebih dahulu.`
    );
    this.name = "UnitHasChildrenError";
  }
}

export class UnitReferencedByPositionError extends HistoryConflictError {
  constructor(unitNama: string, positionCount: number) {
    super(
      `Unit organisasi '${unitNama}' tidak dapat dihapus karena dirujuk oleh ${positionCount} jabatan struktural. Ubah unit pada jabatan terkait terlebih dahulu.`
    );
    this.name = "UnitReferencedByPositionError";
  }
}

export class PositionHasAssignmentsError extends HistoryConflictError {
  constructor(positionNama: string, assignmentCount: number) {
    super(
      `Jabatan '${positionNama}' tidak dapat dihapus karena memiliki ${assignmentCount} rekam penugasan personil historis/aktif. Untuk mempertahankan integritas audit riwayat jabatan, jabatan tidak boleh dihapus secara permanen.`
    );
    this.name = "PositionHasAssignmentsError";
  }
}
