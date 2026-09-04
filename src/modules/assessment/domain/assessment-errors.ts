/**
 * Ruang Pintar — M13 Assessment & Gradebook Domain Errors
 */

export class AssessmentNotFoundError extends Error {
  constructor(id: string) {
    super(`Asesmen dengan ID '${id}' tidak ditemukan.`);
    this.name = "AssessmentNotFoundError";
  }
}

export class AssessmentAccessDeniedError extends Error {
  constructor(
    message = "Akses ditolak: Anda tidak memiliki wewenang mengelola penilaian pada penugasan ini."
  ) {
    super(message);
    this.name = "AssessmentAccessDeniedError";
  }
}

export class AssessmentFinalizedError extends Error {
  constructor(id: string) {
    super(
      `Asesmen '${id}' telah difinalisasi dan tidak dapat diubah tanpa prosedur koreksi khusus.`
    );
    this.name = "AssessmentFinalizedError";
  }
}

export class InvalidGradeValueError extends Error {
  constructor(value: number, min = 0, max = 100) {
    super(`Nilai '${value}' tidak valid. Nilai harus berada dalam rentang ${min} hingga ${max}.`);
    this.name = "InvalidGradeValueError";
  }
}

export class AssessmentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssessmentValidationError";
  }
}
