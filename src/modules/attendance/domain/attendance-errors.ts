/**
 * Ruang Pintar — M12 Class Session Attendance Domain Errors
 */

export class AttendanceDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AttendanceDomainError";
  }
}

export class SessionNotFoundError extends AttendanceDomainError {
  constructor(sesiId: string) {
    super(`Sesi kelas aktual dengan ID '${sesiId}' tidak ditemukan.`);
    this.name = "SessionNotFoundError";
  }
}

export class AttendanceNotAllowedError extends AttendanceDomainError {
  constructor(message: string = "Anda tidak memiliki izin mencatat presensi pada sesi kelas ini.") {
    super(message);
    this.name = "AttendanceNotAllowedError";
  }
}

export class InvalidAttendanceStateError extends AttendanceDomainError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidAttendanceStateError";
  }
}
