/**
 * Ruang Pintar — M16 Communication Domain Errors
 */

export class AnnouncementNotFoundError extends Error {
  constructor(identifier: string) {
    super(`Pengumuman tidak ditemukan untuk ID: "${identifier}"`);
    this.name = "AnnouncementNotFoundError";
  }
}

export class UnauthorizedAnnouncementManageError extends Error {
  constructor(reason: string = "Pengguna tidak memiliki izin mengelola pengumuman") {
    super(`Akses ditolak: ${reason}`);
    this.name = "UnauthorizedAnnouncementManageError";
  }
}

export class AnnouncementAudienceMismatchError extends Error {
  constructor(audience: string) {
    super(`Target audiens pengumuman "${audience}" tidak valid atau rombel target wajib diisi.`);
    this.name = "AnnouncementAudienceMismatchError";
  }
}

export class AnnouncementValidationError extends Error {
  constructor(message: string) {
    super(`Validasi pengumuman gagal: ${message}`);
    this.name = "AnnouncementValidationError";
  }
}
