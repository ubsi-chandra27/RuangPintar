import { OutboxPesan } from "@prisma/client";
import { prisma } from "../database/prisma";
import { generateUlid } from "../../lib/ulid";
import type { TransactionClient } from "../database/transaction";

export interface PublishOutboxEventInput {
  tipe_event: string;
  tipe_agregat: string;
  id_agregat: string;
  payload: Record<string, unknown>;
  maks_percobaan?: number;
}

/**
 * Publish an event into the transactional outbox table within a database transaction.
 */
export async function publishOutboxEvent(
  input: PublishOutboxEventInput,
  db: TransactionClient | typeof prisma = prisma
): Promise<OutboxPesan> {
  const eventId = generateUlid();

  return await db.outboxPesan.create({
    data: {
      id: eventId,
      tipe_event: input.tipe_event,
      tipe_agregat: input.tipe_agregat,
      id_agregat: input.id_agregat,
      payload: JSON.stringify(input.payload),
      status: "PENDING",
      jumlah_percobaan: 0,
      maks_percobaan: input.maks_percobaan ?? 5,
      percobaan_berikutnya_pada: new Date(),
    },
  });
}

/**
 * Fetch pending outbox messages ready for processing.
 */
export async function fetchPendingOutboxEvents(
  batchSize: number = 20,
  db: TransactionClient | typeof prisma = prisma
): Promise<OutboxPesan[]> {
  const now = new Date();

  return await db.outboxPesan.findMany({
    where: {
      status: "PENDING",
      percobaan_berikutnya_pada: {
        lte: now,
      },
    },
    orderBy: { dibuat_pada: "asc" },
    take: batchSize,
  });
}

/**
 * Mark an outbox event as successfully processed.
 */
export async function markOutboxEventCompleted(
  id: string,
  db: TransactionClient | typeof prisma = prisma
): Promise<OutboxPesan> {
  return await db.outboxPesan.update({
    where: { id },
    data: {
      status: "COMPLETED",
      diproses_pada: new Date(),
      pesan_error: null,
    },
  });
}

/**
 * Mark an outbox event as failed with exponential backoff or final failure.
 */
export async function markOutboxEventFailed(
  id: string,
  errorMessage: string,
  retryDelaySeconds: number = 60,
  db: TransactionClient | typeof prisma = prisma
): Promise<OutboxPesan> {
  const current = await db.outboxPesan.findUnique({ where: { id } });
  if (!current) {
    throw new Error(`Outbox event with ID ${id} not found.`);
  }

  const nextAttemptCount = current.jumlah_percobaan + 1;
  const isFinalFailure = nextAttemptCount >= current.maks_percobaan;
  const nextAttemptTime = new Date(
    Date.now() + retryDelaySeconds * 1000 * Math.pow(2, nextAttemptCount - 1)
  );

  return await db.outboxPesan.update({
    where: { id },
    data: {
      status: isFinalFailure ? "FAILED" : "PENDING",
      jumlah_percobaan: nextAttemptCount,
      pesan_error: errorMessage,
      percobaan_berikutnya_pada: isFinalFailure
        ? current.percobaan_berikutnya_pada
        : nextAttemptTime,
    },
  });
}
