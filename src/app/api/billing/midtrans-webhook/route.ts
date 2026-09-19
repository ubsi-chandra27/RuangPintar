/**
 * Ruang Pintar — M23 Public Webhook Handler untuk Midtrans Payment Gateway
 *
 * Menerima POST notifikasi status pembayaran QRIS/Gopay/Shopeepay dari Midtrans
 */

import { NextRequest, NextResponse } from "next/server";
import { subscriptionService } from "@/modules/billing/application/subscription-service";
import { MidtransNotificationPayload } from "@/modules/billing/domain/billing-types";

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as MidtransNotificationPayload;

    if (!payload || !payload.order_id) {
      return NextResponse.json(
        { error: "Payload tidak valid, order_id tidak ditemukan." },
        { status: 400 }
      );
    }

    console.log(
      `[Midtrans Webhook] Menerima event untuk order: ${payload.order_id}, status: ${payload.transaction_status}`
    );

    const result = await subscriptionService.processWebhookNotification(payload);

    return NextResponse.json({
      status: "OK",
      message: "Notifikasi berhasil diproses.",
      data: result,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("[Midtrans Webhook Error]:", errorMsg);

    // Tetap kembalikan 200 jika order tidak ditemukan agar Midtrans tidak retry tanpa batas, tapi log error
    return NextResponse.json({ status: "ERROR", message: errorMsg }, { status: 200 });
  }
}
