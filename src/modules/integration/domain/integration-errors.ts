/**
 * Ruang Pintar — M20 Integration Domain Errors
 */

export class IntegrationError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(message: string, code = "INTEGRATION_ERROR", statusCode = 400) {
    super(message);
    this.name = "IntegrationError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class IntegrationConfigNotFoundError extends IntegrationError {
  constructor(message = "Konfigurasi integrasi tidak ditemukan.") {
    super(message, "INTEGRATION_CONFIG_NOT_FOUND", 404);
    this.name = "IntegrationConfigNotFoundError";
  }
}

export class WebhookEndpointNotFoundError extends IntegrationError {
  constructor(message = "Endpoint webhook tidak ditemukan.") {
    super(message, "WEBHOOK_ENDPOINT_NOT_FOUND", 404);
    this.name = "WebhookEndpointNotFoundError";
  }
}

export class WebhookSignatureVerificationError extends IntegrationError {
  constructor(message = "Tanda tangan signature webhook tidak valid atau telah kedaluwarsa.") {
    super(message, "WEBHOOK_SIGNATURE_INVALID", 401);
    this.name = "WebhookSignatureVerificationError";
  }
}

export class AdapterExecutionError extends IntegrationError {
  constructor(message = "Gagal mengeksekusi adapter layanan eksternal.") {
    super(message, "ADAPTER_EXECUTION_ERROR", 502);
    this.name = "AdapterExecutionError";
  }
}

export class DuplicateDeliveryAttemptError extends IntegrationError {
  constructor(message = "Pengiriman dengan idempotency key ini sudah berhasil diproses.") {
    super(message, "DUPLICATE_DELIVERY_ATTEMPT", 409);
    this.name = "DuplicateDeliveryAttemptError";
  }
}
