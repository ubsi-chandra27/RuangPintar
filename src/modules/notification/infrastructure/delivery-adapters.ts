/**
 * Ruang Pintar — M17 Notification Delivery Adapters
 *
 * Mengimplementasikan kontrak adapter pengiriman eksternal (WhatsApp, Email, Push/FCM).
 * Sesuai FR-NOT-003: Kegagalan delivery eksternal tidak membatalkan transaksi sumber.
 */

export interface ExternalNotificationMessage {
  id: string;
  recipient_user_id: string;
  recipient_name: string;
  phone_number?: string | null;
  email?: string | null;
  title: string;
  body: string;
  action_url?: string | null;
  metadata?: Record<string, unknown>;
}

export interface DeliveryResult {
  success: boolean;
  adapter_name: string;
  external_message_id?: string;
  error_message?: string;
  timestamp: Date;
}

export interface INotificationDeliveryAdapter {
  readonly channelName: string;
  send(message: ExternalNotificationMessage): Promise<DeliveryResult>;
}

/**
 * Mock / Local WhatsApp Gateway Adapter
 * Siap diintegrasikan ke provider riil (Meta Cloud API / Fonnte / Wablas) di masa mendatang.
 */
export class WhatsAppDeliveryAdapter implements INotificationDeliveryAdapter {
  readonly channelName = "WHATSAPP";

  async send(message: ExternalNotificationMessage): Promise<DeliveryResult> {
    if (!message.phone_number) {
      return {
        success: false,
        adapter_name: this.channelName,
        error_message: "Nomor WhatsApp penerima tidak tersedia.",
        timestamp: new Date(),
      };
    }

    // Simulasi pengiriman terstruktur (idempotent, safe, logging)
    // Core tidak boleh crash jika terjadi kegagalan jaringan luar
    return {
      success: true,
      adapter_name: this.channelName,
      external_message_id: `wa_${message.id}_${Date.now()}`,
      timestamp: new Date(),
    };
  }
}

/**
 * Mock Email Gateway Adapter (Resend / SMTP)
 */
export class EmailDeliveryAdapter implements INotificationDeliveryAdapter {
  readonly channelName = "EMAIL";

  async send(message: ExternalNotificationMessage): Promise<DeliveryResult> {
    if (!message.email) {
      return {
        success: false,
        adapter_name: this.channelName,
        error_message: "Alamat email penerima tidak tersedia.",
        timestamp: new Date(),
      };
    }

    return {
      success: true,
      adapter_name: this.channelName,
      external_message_id: `em_${message.id}_${Date.now()}`,
      timestamp: new Date(),
    };
  }
}
