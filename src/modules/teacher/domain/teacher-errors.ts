/**
 * Ruang Pintar — M08 Teacher & Teaching Assignment Domain Errors
 */

export class TeacherDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TeacherDomainError";
  }
}

export class TeacherNotFoundError extends TeacherDomainError {
  constructor(id: string) {
    super(`Profil guru dengan ID '${id}' tidak ditemukan.`);
    this.name = "TeacherNotFoundError";
  }
}

export class TeacherNipDuplicateError extends TeacherDomainError {
  constructor(nip: string) {
    super(`Guru dengan NIP '${nip}' sudah terdaftar pada sekolah ini.`);
    this.name = "TeacherNipDuplicateError";
  }
}

export class SubjectNotFoundError extends TeacherDomainError {
  constructor(id: string) {
    super(`Mata pelajaran dengan ID '${id}' tidak ditemukan.`);
    this.name = "SubjectNotFoundError";
  }
}

export class SubjectCodeDuplicateError extends TeacherDomainError {
  constructor(kode: string) {
    super(`Mata pelajaran dengan kode '${kode}' sudah digunakan pada sekolah ini.`);
    this.name = "SubjectCodeDuplicateError";
  }
}

export class SubjectInUseError extends TeacherDomainError {
  constructor(nama: string, count: number) {
    super(
      `Mata pelajaran '${nama}' tidak dapat dihapus permanen karena memiliki ${count} histori akademik. Gunakan Arsip untuk menyembunyikan dari operasional.`
    );
    this.name = "SubjectInUseError";
  }
}

export class TeachingAssignmentInUseError extends TeacherDomainError {
  constructor(label: string, count: number) {
    super(
      `Penugasan mengajar '${label}' tidak dapat dihapus permanen karena memiliki ${count} histori akademik. Gunakan Arsip untuk menyembunyikan dari operasional.`
    );
    this.name = "TeachingAssignmentInUseError";
  }
}

export class DuplicateTeachingAssignmentError extends TeacherDomainError {
  constructor(guruNama: string, mapelNama: string, rombelNama: string) {
    super(
      `Penugasan mengajar aktif sudah ada untuk Guru '${guruNama}' pada mata pelajaran '${mapelNama}' di rombel '${rombelNama}'.`
    );
    this.name = "DuplicateTeachingAssignmentError";
  }
}

export class CrossSchoolBoundaryError extends TeacherDomainError {
  constructor(resource: string) {
    super(
      `Pelanggaran batas institusi: Resource '${resource}' berada di luar konteks sekolah aktif.`
    );
    this.name = "CrossSchoolBoundaryError";
  }
}

export class ActiveAssignmentProtectionError extends TeacherDomainError {
  constructor(nama: string) {
    super(
      `Guru '${nama}' tidak dapat dinonaktifkan/dihapus karena masih memiliki penugasan mengajar atau wali kelas yang berstatus AKTIF.`
    );
    this.name = "ActiveAssignmentProtectionError";
  }
}

export class TeacherAcademicHistoryError extends TeacherDomainError {
  constructor(nama: string) {
    super(
      `Guru '${nama}' tidak dapat dihapus permanen karena memiliki histori akademik. Gunakan Arsip untuk menyembunyikan dari operasional.`
    );
    this.name = "TeacherAcademicHistoryError";
  }
}

export class InvalidAcademicPeriodError extends TeacherDomainError {
  constructor(message: string) {
    super(`Periode akademik tidak valid: ${message}`);
    this.name = "InvalidAcademicPeriodError";
  }
}

export class HomeroomAlreadyAssignedError extends TeacherDomainError {
  constructor(rombelNama: string, currentTeacherNama: string) {
    super(
      `Rombel '${rombelNama}' sudah memiliki wali kelas aktif (${currentTeacherNama}). Tutup penugasan lama terlebih dahulu sebelum menugaskan wali kelas baru.`
    );
    this.name = "HomeroomAlreadyAssignedError";
  }
}
