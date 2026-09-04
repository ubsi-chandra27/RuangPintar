/**
 * Ruang Pintar — M11 Learning Domain Errors
 */

export class LearningDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LearningDomainError";
  }
}

export class LingkupMateriNotFoundError extends LearningDomainError {
  constructor(id: string) {
    super(`Lingkup materi dengan ID '${id}' tidak ditemukan.`);
    this.name = "LingkupMateriNotFoundError";
  }
}

export class TujuanPembelajaranNotFoundError extends LearningDomainError {
  constructor(id: string) {
    super(`Tujuan pembelajaran dengan ID '${id}' tidak ditemukan.`);
    this.name = "TujuanPembelajaranNotFoundError";
  }
}

export class MateriNotFoundError extends LearningDomainError {
  constructor(id: string) {
    super(`Materi pembelajaran dengan ID '${id}' tidak ditemukan.`);
    this.name = "MateriNotFoundError";
  }
}

export class TugasNotFoundError extends LearningDomainError {
  constructor(id: string) {
    super(`Tugas dengan ID '${id}' tidak ditemukan.`);
    this.name = "TugasNotFoundError";
  }
}

export class AdministrasiNotFoundError extends LearningDomainError {
  constructor(id: string) {
    super(`Catatan administrasi pembelajaran dengan ID '${id}' tidak ditemukan.`);
    this.name = "AdministrasiNotFoundError";
  }
}

export class TeacherClassAccessDeniedError extends LearningDomainError {
  constructor(resource: string = "Kelas ini") {
    super(`Akses ditolak: Anda tidak memiliki wewenang mengajar pada ${resource}.`);
    this.name = "TeacherClassAccessDeniedError";
  }
}

export class DuplicateBABKodeError extends LearningDomainError {
  constructor(kode: string) {
    super(`Kode BAB / Lingkup Materi '${kode}' sudah digunakan pada kelas ini.`);
    this.name = "DuplicateBABKodeError";
  }
}
