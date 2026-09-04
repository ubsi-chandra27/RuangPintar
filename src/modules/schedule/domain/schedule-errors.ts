/**
 * Ruang Pintar — M10 Scheduling & Class Session Domain Errors
 */

export class ScheduleDomainError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string = "SCHEDULE_DOMAIN_ERROR", statusCode: number = 400) {
    super(message);
    this.name = "ScheduleDomainError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class ScheduleVersionNotFoundError extends ScheduleDomainError {
  constructor(id: string) {
    super(`Versi jadwal dengan ID '${id}' tidak ditemukan.`, "SCHEDULE_VERSION_NOT_FOUND", 404);
  }
}

export class ScheduleEntryNotFoundError extends ScheduleDomainError {
  constructor(id: string) {
    super(
      `Entri jadwal pelajaran dengan ID '${id}' tidak ditemukan.`,
      "SCHEDULE_ENTRY_NOT_FOUND",
      404
    );
  }
}

export class TimeSlotNotFoundError extends ScheduleDomainError {
  constructor(id: string) {
    super(`Slot waktu pembelajaran dengan ID '${id}' tidak ditemukan.`, "TIME_SLOT_NOT_FOUND", 404);
  }
}

export class ClassSessionNotFoundError extends ScheduleDomainError {
  constructor(id: string) {
    super(
      `Sesi kelas pembelajaran aktual dengan ID '${id}' tidak ditemukan.`,
      "CLASS_SESSION_NOT_FOUND",
      404
    );
  }
}

export class ScheduleConflictError extends ScheduleDomainError {
  constructor(message: string) {
    super(message, "SCHEDULE_CONFLICT", 409);
  }
}

export class TeachingAssignmentRequiredError extends ScheduleDomainError {
  constructor(
    message: string = "Penugasan mengajar yang sah dan aktif wajib tersedia untuk membuat jadwal pelajaran."
  ) {
    super(message, "TEACHING_ASSIGNMENT_REQUIRED", 400);
  }
}

export class InvalidSessionStateTransitionError extends ScheduleDomainError {
  constructor(fromStatus: string, toStatus: string) {
    super(
      `Transisi status sesi kelas tidak sah: tidak dapat mengubah dari ${fromStatus} menjadi ${toStatus}.`,
      "INVALID_SESSION_STATE_TRANSITION",
      400
    );
  }
}
