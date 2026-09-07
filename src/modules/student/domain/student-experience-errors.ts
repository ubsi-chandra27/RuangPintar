/**
 * Ruang Pintar — Student Experience Domain Errors (Phase 15 / M15)
 */

export class StudentExperienceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400
  ) {
    super(message);
    this.name = "StudentExperienceError";
  }
}

export class StudentNotFoundError extends StudentExperienceError {
  constructor(message = "Profil siswa tidak ditemukan atau belum terdaftar.") {
    super(message, "STUDENT_NOT_FOUND", 404);
  }
}

export class StudentEnrollmentNotFoundError extends StudentExperienceError {
  constructor(
    message = "Siswa belum memiliki keikutsertaan atau rombongan belajar aktif pada semester ini."
  ) {
    super(message, "STUDENT_ENROLLMENT_NOT_FOUND", 404);
  }
}

export class AssignmentSubmissionDeadlinePassedError extends StudentExperienceError {
  constructor(
    message = "Batas waktu penyerahan tugas telah terlewati dan tugas ini tidak menerima keterlambatan."
  ) {
    super(message, "ASSIGNMENT_DEADLINE_PASSED", 403);
  }
}

export class AssignmentNotFoundError extends StudentExperienceError {
  constructor(message = "Tugas yang dimaksud tidak ditemukan atau belum dipublikasikan.") {
    super(message, "ASSIGNMENT_NOT_FOUND", 404);
  }
}

export class UnauthorizedStudentAccessError extends StudentExperienceError {
  constructor(
    message = "Akses ditolak: Anda hanya dapat mengakses data akademik milik Anda sendiri."
  ) {
    super(message, "UNAUTHORIZED_STUDENT_ACCESS", 403);
  }
}
