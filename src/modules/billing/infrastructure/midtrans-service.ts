/**
 * Ruang Pintar — M23 Midtrans Snap Service Adapter
 *
 * Mendukung Dual-Mode:
 * 1. Mode Production/Sandbox Resmi (menggunakan MIDTRANS_SERVER_KEY)
 * 2. Mode Simulator Interaktif (ketika key belum dipasang, memungkinkan QA langsung)
 */

import crypto from "crypto";
import { MidtransNotificationPayload } from "../domain/billing-types";

export interface CreateSnapTransactionInput {
  order_id: string;
  gross_amount: number;
  item_name: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
}

export interface SnapTransactionResult {
  token: string;
  redirect_url: string;
  qris_url?: string;
  is_simulator: boolean;
}

export class MidtransService {
  private readonly serverKey: string;
  private readonly isProduction: boolean;
  private readonly baseUrl: string;

  constructor() {
    this.serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    this.isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
    this.baseUrl = this.isProduction
      ? "https://app.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions";
  }

  get isConfigured(): boolean {
    return Boolean(this.serverKey && this.serverKey.trim().length > 5);
  }

  /**
   * Membuat transaksi Snap ke Midtrans atau ke mode simulasi jika belum ada key
   */
  async createTransaction(input: CreateSnapTransactionInput): Promise<SnapTransactionResult> {
    if (!this.isConfigured) {
      return this.createSimulatedTransaction(input);
    }

    try {
      const authString = Buffer.from(`${this.serverKey}:`).toString("base64");

      const payload = {
        transaction_details: {
          order_id: input.order_id,
          gross_amount: input.gross_amount,
        },
        item_details: [
          {
            id: "GURU-PRO-1M",
            price: input.gross_amount,
            quantity: 1,
            name: input.item_name,
          },
        ],
        customer_details: {
          first_name: input.customer_name,
          email: input.customer_email || "guru@sekolah.id",
          phone: input.customer_phone || "081234567890",
        },
        enabled_payments: ["other_qris", "gopay", "shopeepay"],
      };

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Basic ${authString}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(
          `[Midtrans] Gagal memanggil Snap API (${response.status}): ${errorText}. Beralih ke simulator.`
        );
        return this.createSimulatedTransaction(input);
      }

      const data = (await response.json()) as { token: string; redirect_url: string };

      return {
        token: data.token,
        redirect_url: data.redirect_url,
        is_simulator: false,
      };
    } catch (err) {
      console.warn(
        "[Midtrans] Exception saat request Snap API. Menggunakan simulator fallback:",
        err
      );
      return this.createSimulatedTransaction(input);
    }
  }

  /**
   * Generator simulasi transaksi lokal untuk keperluan demonstrasi & pengujian offline
   */
  private createSimulatedTransaction(input: CreateSnapTransactionInput): SnapTransactionResult {
    const mockToken = `SNAP-SIM-${crypto.randomBytes(8).toString("hex")}`;
    const mockRedirectUrl = `https://simulator.ruangpintar.id/qris/${input.order_id}`;

    return {
      token: mockToken,
      redirect_url: mockRedirectUrl,
      qris_url: `/api/billing/mock-qris/${input.order_id}`,
      is_simulator: true,
    };
  }

  /**
   * Memvalidasi keabsahan notifikasi webhook dari Midtrans via SHA-512 Signature Key
   * Rumus: SHA512(order_id + status_code + gross_amount + ServerKey)
   */
  verifySignature(payload: MidtransNotificationPayload): boolean {
    if (!this.isConfigured) {
      // Dalam mode simulator, izinkan verifikasi untuk testing
      return true;
    }

    if (!payload.signature_key) {
      return false;
    }

    const rawString = `${payload.order_id}${payload.status_code}${payload.gross_amount}${this.serverKey}`;
    const computedSignature = crypto.createHash("sha512").update(rawString).digest("hex");

    return computedSignature.toLowerCase() === payload.signature_key.toLowerCase();
  }
}

export const midtransService = new MidtransService();
