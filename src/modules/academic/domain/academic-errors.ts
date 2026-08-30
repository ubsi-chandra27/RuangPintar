/**
 * Ruang Pintar — Academic Period & Structure (M06) Domain Errors
 */

export class AcademicDomainError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number = 400, code: string = "ACADEMIC_DOMAIN_ERROR") {
    super(message);
    this.name = "AcademicDomainError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class AcademicYearNotFoundError extends AcademicDomainError {
  constructor(idOrName: string) {
    super(`Tahun ajaran '${idOrName}' tidak ditemukan.`, 404, "ACADEMIC_YEAR_NOT_FOUND");
    this.name = "AcademicYearNotFoundError";
  }
}

export class DuplicateAcademicYearError extends AcademicDomainError {
  constructor(nama: string) {
    super(
      `Tahun ajaran dengan nama '${nama}' sudah terdaftar di sekolah ini.`,
      409,
      "DUPLICATE_ACADEMIC_YEAR"
    );
    this.name = "DuplicateAcademicYearError";
  }
}

export class InvalidDateRangeError extends AcademicDomainError {
  constructor(message: string = "Tanggal mulai harus lebih awal daripada tanggal selesai.") {
    super(message, 400, "INVALID_DATE_RANGE");
    this.name = "InvalidDateRangeError";
  }
}

export class SemesterNotFoundError extends AcademicDomainError {
  constructor(idOrName: string) {
    super(`Semester '${idOrName}' tidak ditemukan.`, 404, "SEMESTER_NOT_FOUND");
    this.name = "SemesterNotFoundError";
  }
}

export class DuplicateSemesterError extends AcademicDomainError {
  constructor(kode: string, tahunAjaranNama: string) {
    super(
      `Semester '${kode}' sudah terdaftar pada tahun ajaran '${tahunAjaranNama}'.`,
      409,
      "DUPLICATE_SEMESTER"
    );
    this.name = "DuplicateSemesterError";
  }
}

export class SemesterOutOfBoundsError extends AcademicDomainError {
  constructor(
    message: string = "Rentang tanggal semester harus berada di dalam rentang tanggal tahun ajaran terkait."
  ) {
    super(message, 400, "SEMESTER_OUT_OF_BOUNDS");
    this.name = "SemesterOutOfBoundsError";
  }
}

export class PhaseNotFoundError extends AcademicDomainError {
  constructor(idOrKode: string) {
    super(`Fase pendidikan '${idOrKode}' tidak ditemukan.`, 404, "PHASE_NOT_FOUND");
    this.name = "PhaseNotFoundError";
  }
}

export class DuplicatePhaseError extends AcademicDomainError {
  constructor(kode: string) {
    super(`Fase pendidikan dengan kode '${kode}' sudah terdaftar.`, 409, "DUPLICATE_PHASE");
    this.name = "DuplicatePhaseError";
  }
}

export class GradeLevelNotFoundError extends AcademicDomainError {
  constructor(idOrKode: string) {
    super(`Tingkat kelas '${idOrKode}' tidak ditemukan.`, 404, "GRADE_LEVEL_NOT_FOUND");
    this.name = "GradeLevelNotFoundError";
  }
}

export class DuplicateGradeLevelError extends AcademicDomainError {
  constructor(kode: string) {
    super(`Tingkat kelas dengan kode '${kode}' sudah terdaftar.`, 409, "DUPLICATE_GRADE_LEVEL");
    this.name = "DuplicateGradeLevelError";
  }
}

export class ProgramNotFoundError extends AcademicDomainError {
  constructor(idOrKode: string) {
    super(`Program keahlian/jurusan '${idOrKode}' tidak ditemukan.`, 404, "PROGRAM_NOT_FOUND");
    this.name = "ProgramNotFoundError";
  }
}

export class DuplicateProgramError extends AcademicDomainError {
  constructor(kode: string) {
    super(`Program keahlian dengan kode '${kode}' sudah terdaftar.`, 409, "DUPLICATE_PROGRAM");
    this.name = "DuplicateProgramError";
  }
}

export class RombelNotFoundError extends AcademicDomainError {
  constructor(idOrName: string) {
    super(`Rombel '${idOrName}' tidak ditemukan.`, 404, "ROMBEL_NOT_FOUND");
    this.name = "RombelNotFoundError";
  }
}

export class DuplicateRombelError extends AcademicDomainError {
  constructor(nama: string, tahunAjaran: string) {
    super(
      `Rombel '${nama}' sudah terdaftar pada tahun ajaran '${tahunAjaran}'.`,
      409,
      "DUPLICATE_ROMBEL"
    );
    this.name = "DuplicateRombelError";
  }
}

export class RombelCapacityError extends AcademicDomainError {
  constructor(
    message: string = "Kapasitas rombel harus berupa bilangan bulat positif (minimal 1, maksimal 100)."
  ) {
    super(message, 400, "INVALID_ROMBEL_CAPACITY");
    this.name = "RombelCapacityError";
  }
}

export class HistoryProtectedError extends AcademicDomainError {
  constructor(resourceType: string, reason: string) {
    super(
      `Tidak dapat menghapus ${resourceType} karena memiliki data historis yang dilindungi (${reason}). Silakan arsipkan atau nonaktifkan.`,
      409,
      "HISTORY_PROTECTED"
    );
    this.name = "HistoryProtectedError";
  }
}

export class ActivePeriodConflictError extends AcademicDomainError {
  constructor(message: string) {
    super(message, 409, "ACTIVE_PERIOD_CONFLICT");
    this.name = "ActivePeriodConflictError";
  }
}
