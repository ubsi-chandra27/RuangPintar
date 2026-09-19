"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { subscriptionService } from "@/modules/billing/application/subscription-service";
import { BillingActionResult, SubscriptionOrderDTO } from "@/modules/billing/domain/billing-types";

export async function initiateProCheckoutAction(
  durationMonths = 1
): Promise<BillingActionResult<SubscriptionOrderDTO>> {
  try {
    const user = await requireAuth();
    const order = await subscriptionService.createProOrder(user.id, durationMonths);
    return { success: true, data: order };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal memulai sesi pembayaran.";
    return { success: false, error: message };
  }
}

export async function checkOrderStatusAction(
  orderId: string
): Promise<BillingActionResult<SubscriptionOrderDTO | null>> {
  try {
    const user = await requireAuth();
    const order = await subscriptionService.getOrderStatus(orderId, user.id);
    return { success: true, data: order };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal memeriksa status pesanan.";
    return { success: false, error: message };
  }
}

export async function simulatePaymentSuccessAction(
  orderId: string
): Promise<BillingActionResult<SubscriptionOrderDTO>> {
  try {
    const user = await requireAuth();
    const updatedOrder = await subscriptionService.simulatePaymentSuccess(orderId, user.id);

    // Revalidasi dashboard & landing page agar badge lisensi terbarui
    revalidatePath("/dashboard");
    revalidatePath("/");
    revalidatePath("/profil");

    return { success: true, data: updatedOrder };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal memproses simulasi pembayaran.";
    return { success: false, error: message };
  }
}
