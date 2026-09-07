/**
 * Ruang Pintar — M15 Guardian & Family Domain Errors
 * Definisi domain error untuk pengalaman orang tua / wali.
 */

export class GuardianNotFoundError extends Error {
  constructor(identifier: string) {
    super(`Profil wali murid tidak ditemukan untuk identitas: ${identifier}`);
    this.name = "GuardianNotFoundError";
  }
}

export class ChildNotLinkedError extends Error {
  constructor(guardianId: string, studentId: string) {
    super(
      `Siswa dengan ID "${studentId}" tidak terhubung dengan wali "${guardianId}" atau akses tidak diizinkan.`
    );
    this.name = "ChildNotLinkedError";
  }
}

export class UnverifiedRelationshipError extends Error {
  constructor(guardianId: string, studentId: string) {
    super(
      `Hubungan antara wali "${guardianId}" dan siswa "${studentId}" belum terverifikasi secara resmi oleh pihak sekolah.`
    );
    this.name = "UnverifiedRelationshipError";
  }
}

export class UnauthorizedGuardianActionError extends Error {
  constructor(action: string) {
    super(
      `Wali murid tidak diizinkan melakukan tindakan ini (${action}). Invariant: Guardian ≠ Student proxy.`
    );
    this.name = "UnauthorizedGuardianActionError";
  }
}

export class PengajuanWaliValidationError extends Error {
  constructor(message: string) {
    super(`Data pengajuan wali tidak valid: ${message}`);
    this.name = "PengajuanWaliValidationError";
  }
}
