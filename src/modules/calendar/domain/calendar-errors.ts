/**
 * Ruang Pintar — M09 Academic Calendar Domain Errors
 */

export class CalendarDomainError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string = "CALENDAR_DOMAIN_ERROR", statusCode: number = 400) {
    super(message);
    this.name = "CalendarDomainError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class CalendarEventNotFoundError extends CalendarDomainError {
  constructor(id: string) {
    super(
      `Agenda / Event kalender akademik dengan ID '${id}' tidak ditemukan.`,
      "CALENDAR_EVENT_NOT_FOUND",
      404
    );
  }
}

export class InvalidCalendarDateRangeError extends CalendarDomainError {
  constructor(message: string = "Tanggal selesai tidak boleh sebelum tanggal mulai.") {
    super(message, "INVALID_CALENDAR_DATE_RANGE", 400);
  }
}
