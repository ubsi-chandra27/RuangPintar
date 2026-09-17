/**
 * Ruang Pintar — Module M19: Reporting & Analytics Errors
 */

export class UnauthorizedLeadershipAccessError extends Error {
  public readonly statusCode = 403;
  public readonly code = "UNAUTHORIZED_LEADERSHIP_ACCESS";

  constructor(
    message: string = "Akses dashboard kepemimpinan ditolak. Anda tidak memiliki jabatan struktural aktif yang sesuai."
  ) {
    super(message);
    this.name = "UnauthorizedLeadershipAccessError";
  }
}

export class ReportGenerationError extends Error {
  public readonly statusCode = 500;
  public readonly code = "REPORT_GENERATION_FAILED";

  constructor(message: string = "Gagal mengagregasi data atau membuat dokumen laporan.") {
    super(message);
    this.name = "ReportGenerationError";
  }
}

export class InvalidReportFilterError extends Error {
  public readonly statusCode = 400;
  public readonly code = "INVALID_REPORT_FILTER";

  constructor(message: string = "Parameter filter laporan tidak valid.") {
    super(message);
    this.name = "InvalidReportFilterError";
  }
}
