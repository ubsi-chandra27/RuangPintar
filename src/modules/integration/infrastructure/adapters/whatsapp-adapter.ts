/**
 * Ruang Pintar — WhatsApp Delivery Adapter (M20 Integration)
 *
 * Mendukung mode SIMULASI (tanpa pulsa untuk dev/test) dan mode
 * gateway produksi (Fonnte / Meta WhatsApp Business Cloud API).
 */

import { SendWhatsAppInput, SendWhatsAppResult } from "../../domain/integration-types";

export interface IWhatsAppAdapter {
  send(
    input: SendWhatsAppInput,
    apiKey?: string,
    senderNumber?: string
  ): Promise<SendWhatsAppResult>;
}

export class FonnteWhatsAppAdapter implements IWhatsAppAdapter {
  async send(
    input: SendWhatsAppInput,
    apiKey?: string,
    senderNumber?: string
  ): Promise<SendWhatsAppResult> {
    // Jika tidak ada API key atau dalam environment pengujian, jalankan mode simulasi aman
    if (!apiKey || apiKey.startsWith("sim_") || process.env.NODE_ENV === "test") {
      return {
        success: true,
        message_id: `wa_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        simulated: true,
      };
    }

    try {
      const response = await fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target: input.nomor_tujuan,
          message: input.pesan,
          countryCode: "62",
        }),
      });

      const data = (await response.json()) as { status?: boolean; id?: string; reason?: string };

      if (!response.ok || data.status === false) {
        return {
          success: false,
          error:
            data.reason || `HTTP ${response.status}: Gagal mengirim via gateway WhatsApp Fonnte`,
        };
      }

      return {
        success: true,
        message_id: data.id || `fonnte_${Date.now()}`,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Kesalahan koneksi gateway WhatsApp",
      };
    }
  }
}
