/**
 * Ruang Pintar — M07 Student Academic Lifecycle: Domain Errors
 */

export abstract class StudentDomainError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class DuplicateNisError extends StudentDomainError {
  readonly code = "DUPLICATE_NIS";
  readonly statusCode = 409;

  constructor(nis: string) {
    super(`Siswa dengan NIS "${nis}" sudah terdaftar pada institusi ini.`);
  }
}

export class DuplicateNisnError extends StudentDomainError {
  readonly code = "DUPLICATE_NISN";
  readonly statusCode = 409;

  constructor(nisn: string) {
    super(`Siswa dengan NISN "${nisn}" sudah terdaftar.`);
  }
}

export class StudentNotFoundError extends StudentDomainError {
  readonly code = "STUDENT_NOT_FOUND";
  readonly statusCode = 404;

  constructor(id: string) {
    super(`Data siswa dengan ID "${id}" tidak ditemukan.`);
  }
}

export class EnrollmentNotFoundError extends StudentDomainError {
  readonly code = "ENROLLMENT_NOT_FOUND";
  readonly statusCode = 404;

  constructor(id: string) {
    super(`Keikutsertaan akademik siswa dengan ID "${id}" tidak ditemukan.`);
  }
}

export class DuplicateEnrollmentError extends StudentDomainError {
  readonly code = "DUPLICATE_ENROLLMENT";
  readonly statusCode = 409;

  constructor(siswaNama: string, tahunAjaranNama: string) {
    super(
      `Siswa "${siswaNama}" sudah memiliki keikutsertaan aktif pada Tahun Ajaran ${tahunAjaranNama}.`
    );
  }
}

export class PlacementNotFoundError extends StudentDomainError {
  readonly code = "PLACEMENT_NOT_FOUND";
  readonly statusCode = 404;

  constructor(id: string) {
    super(`Penempatan rombel dengan ID "${id}" tidak ditemukan.`);
  }
}

export class RombelCapacityExceededError extends StudentDomainError {
  readonly code = "ROMBEL_CAPACITY_EXCEEDED";
  readonly statusCode = 400;

  constructor(
    rombelNama: string,
    kapasitas: number,
    currentCount: number,
    incomingCount: number = 1
  ) {
    super(
      `Kapasitas rombel "${rombelNama}" tidak mencukupi (Kapasitas: ${kapasitas}, Terisi: ${currentCount}, Permintaan: ${incomingCount}).`
    );
  }
}

export class InvalidAcademicTransitionError extends StudentDomainError {
  readonly code = "INVALID_ACADEMIC_TRANSITION";
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}

export class CrossTenantStudentError extends StudentDomainError {
  readonly code = "CROSS_TENANT_STUDENT";
  readonly statusCode = 403;

  constructor() {
    super("Akses ditolak: Data siswa berada di luar batas institusi/sekolah Anda.");
  }
}

export class HistoryProtectedError extends StudentDomainError {
  readonly code = "HISTORY_PROTECTED";
  readonly statusCode = 409;

  constructor(resource: string, reason: string) {
    super(`Operasi ditolak pada ${resource}: ${reason}. Data historis dilindungi oleh platform.`);
  }
}
