/**
 * Ruang Pintar — Email Delivery Adapter (M20 Integration)
 *
 * Mengirimkan email formal sekolah (Resend / SMTP compliant).
 */

import { SendEmailInput, SendEmailResult } from "../../domain/integration-types";

export interface IEmailAdapter {
  send(input: SendEmailInput, apiKey?: string, senderEmail?: string): Promise<SendEmailResult>;
}

export class ResendEmailAdapter implements IEmailAdapter {
  async send(
    input: SendEmailInput,
    apiKey?: string,
    senderEmail?: string
  ): Promise<SendEmailResult> {
    if (!apiKey || apiKey.startsWith("sim_") || process.env.NODE_ENV === "test") {
      return {
        success: true,
        email_id: `email_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        simulated: true,
      };
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: senderEmail || "Ruang Pintar <notifikasi@ruangpintar.sch.id>",
          to: [input.email_tujuan],
          subject: input.subjek,
          html: input.isi_html,
        }),
      });

      const data = (await response.json()) as { id?: string; message?: string };

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}: Gagal mengirim email via Resend`,
        };
      }

      return {
        success: true,
        email_id: data.id,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Kesalahan koneksi email provider",
      };
    }
  }
}
