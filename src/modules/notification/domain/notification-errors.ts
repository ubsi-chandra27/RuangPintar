/**
 * Ruang Pintar — M17 Notification Domain Errors
 */

export class NotificationNotFoundError extends Error {
  constructor(id: string) {
    super(`Notifikasi dengan ID "${id}" tidak ditemukan.`);
    this.name = "NotificationNotFoundError";
  }
}

export class UnauthorizedNotificationAccessError extends Error {
  constructor() {
    super("Pengguna tidak berhak mengakses atau mengubah notifikasi milik pengguna lain.");
    this.name = "UnauthorizedNotificationAccessError";
  }
}

export class ExternalDeliveryError extends Error {
  constructor(channel: string, message: string) {
    super(`Pengiriman notifikasi eksternal via ${channel} gagal: ${message}`);
    this.name = "ExternalDeliveryError";
  }
}
