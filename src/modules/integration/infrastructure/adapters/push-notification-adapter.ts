/**
 * Ruang Pintar — Push Notification Adapter (M20 Integration)
 *
 * Menghubungkan platform ke Google Firebase Cloud Messaging (FCM) / Web Push API
 * untuk mengirimkan alert langsung ke layar smartphone murid & wali murid.
 */

import {
  SendPushNotificationInput,
  SendPushNotificationResult,
} from "../../domain/integration-types";

export interface IPushNotificationAdapter {
  send(input: SendPushNotificationInput, serverKey?: string): Promise<SendPushNotificationResult>;
}

export class FcmPushNotificationAdapter implements IPushNotificationAdapter {
  async send(
    input: SendPushNotificationInput,
    serverKey?: string
  ): Promise<SendPushNotificationResult> {
    // Mode simulasi otomatis untuk test dan offline dev
    if (!serverKey || serverKey.startsWith("sim_") || process.env.NODE_ENV === "test") {
      return {
        success: true,
        multicast_id: `fcm_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        simulated: true,
      };
    }

    try {
      // Standar pengiriman FCM v1 / Legacy HTTP endpoint
      const response = await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          Authorization: `key=${serverKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: input.fcm_token || `/topics/school_${input.sekolah_id}`,
          notification: {
            title: input.judul,
            body: input.isi,
            icon: "/icons/icon-192x192.png",
            click_action: input.action_url || "/dashboard",
          },
          data: {
            event: input.event_name,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const data = (await response.json()) as { multicast_id?: number; failure?: number };

      if (!response.ok || (data.failure && data.failure > 0)) {
        return {
          success: false,
          error: `HTTP ${response.status}: Gagal mengirim push notification ke perangkat`,
        };
      }

      return {
        success: true,
        multicast_id: String(data.multicast_id || Date.now()),
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Kesalahan koneksi FCM Push Notification",
      };
    }
  }
}
