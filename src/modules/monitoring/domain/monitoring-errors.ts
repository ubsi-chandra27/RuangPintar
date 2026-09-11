/**
 * Ruang Pintar — M18 Student Monitoring Domain Errors
 */

export class UnauthorizedHomeroomAccessError extends Error {
  constructor(message = "Akses ditolak: Anda bukan wali kelas sah dari rombel ini.") {
    super(message);
    this.name = "UnauthorizedHomeroomAccessError";
  }
}

export class HomeroomNotFoundError extends Error {
  constructor(message = "Data rombel atau penugasan wali kelas tidak ditemukan.") {
    super(message);
    this.name = "HomeroomNotFoundError";
  }
}

export class MonitoringNoteNotFoundError extends Error {
  constructor(message = "Catatan monitoring pembinaan siswa tidak ditemukan.") {
    super(message);
    this.name = "MonitoringNoteNotFoundError";
  }
}

export class FollowUpNotFoundError extends Error {
  constructor(message = "Tindak lanjut monitoring tidak ditemukan.") {
    super(message);
    this.name = "FollowUpNotFoundError";
  }
}

export class MonitoringValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MonitoringValidationError";
  }
}
