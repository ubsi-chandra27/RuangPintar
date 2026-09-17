"use server";

/**
 * Ruang Pintar — Server Actions for M20 Integration Foundation
 *
 * Seluruh mutasi dan query konfigurasi integrasi dilindungi otorisasi server-side
 * `integration.view` dan `integration.manage` (SUPER_ADMIN / IT Administrator).
 */

import { requireAuth } from "@/shared/infrastructure/auth/auth-guard";
import { requirePermission } from "@/shared/infrastructure/authorization/authz-guard";
import { integrationService } from "@/modules/integration/application/integration-service";
import {
  UpdateIntegrationConfigInput,
  CreateWebhookEndpointInput,
  UpdateWebhookEndpointInput,
  updateIntegrationConfigSchema,
  createWebhookEndpointSchema,
  updateWebhookEndpointSchema,
} from "@/modules/integration/domain/integration-validation";
import { IntegrationServiceType } from "@/modules/integration/domain/integration-types";
import { revalidatePath } from "next/cache";

export async function getIntegrationOverviewAction() {
  const user = await requireAuth();
  await requirePermission("integration.view", user);
  if (!user.sekolah_id) throw new Error("Konteks sekolah tidak valid.");

  return integrationService.getIntegrationOverview(user.sekolah_id);
}

export async function updateIntegrationConfigAction(rawInput: UpdateIntegrationConfigInput) {
  const user = await requireAuth();
  await requirePermission("integration.manage", user);
  if (!user.sekolah_id) throw new Error("Konteks sekolah tidak valid.");

  const validated = updateIntegrationConfigSchema.parse(rawInput);
  const res = await integrationService.updateConfig(user.sekolah_id, user.id, validated);
  revalidatePath("/integrasi");
  return res;
}

export async function testServiceConnectionAction(serviceType: IntegrationServiceType) {
  const user = await requireAuth();
  await requirePermission("integration.manage", user);
  if (!user.sekolah_id) throw new Error("Konteks sekolah tidak valid.");

  const res = await integrationService.testServiceConnection(user.sekolah_id, serviceType);
  revalidatePath("/integrasi");
  return res;
}

export async function createWebhookEndpointAction(rawInput: CreateWebhookEndpointInput) {
  const user = await requireAuth();
  await requirePermission("integration.manage", user);
  if (!user.sekolah_id) throw new Error("Konteks sekolah tidak valid.");

  const validated = createWebhookEndpointSchema.parse(rawInput);
  const res = await integrationService.createWebhook(user.sekolah_id, user.id, validated);
  revalidatePath("/integrasi");
  return res;
}

export async function updateWebhookEndpointAction(
  webhookId: string,
  rawInput: UpdateWebhookEndpointInput
) {
  const user = await requireAuth();
  await requirePermission("integration.manage", user);
  if (!user.sekolah_id) throw new Error("Konteks sekolah tidak valid.");

  const validated = updateWebhookEndpointSchema.parse(rawInput);
  const res = await integrationService.updateWebhook(
    user.sekolah_id,
    webhookId,
    user.id,
    validated
  );
  revalidatePath("/integrasi");
  return res;
}

export async function deleteWebhookEndpointAction(webhookId: string) {
  const user = await requireAuth();
  await requirePermission("integration.manage", user);
  if (!user.sekolah_id) throw new Error("Konteks sekolah tidak valid.");

  const res = await integrationService.deleteWebhook(user.sekolah_id, webhookId, user.id);
  revalidatePath("/integrasi");
  return res;
}

export async function testWebhookEndpointAction(webhookId: string) {
  const user = await requireAuth();
  await requirePermission("integration.manage", user);
  if (!user.sekolah_id) throw new Error("Konteks sekolah tidak valid.");

  const res = await integrationService.testWebhookEndpoint(user.sekolah_id, webhookId);
  revalidatePath("/integrasi");
  return res;
}

export async function retryFailedDeliveryAction(logId: string) {
  const user = await requireAuth();
  await requirePermission("integration.manage", user);
  if (!user.sekolah_id) throw new Error("Konteks sekolah tidak valid.");

  const res = await integrationService.retryFailedDelivery(user.sekolah_id, logId);
  revalidatePath("/integrasi");
  return res;
}
