import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma, configureSqlitePragmas } from "@/shared/infrastructure/database/prisma";
import {
  publishOutboxEvent,
  fetchPendingOutboxEvents,
  markOutboxEventCompleted,
  markOutboxEventFailed,
} from "@/shared/infrastructure/outbox/outbox-service";
import { generateUlid } from "@/shared/lib/ulid";

describe("Transactional Outbox — Asynchronous Reliability", () => {
  const aggregateId = generateUlid();

  beforeAll(async () => {
    await configureSqlitePragmas(prisma);
  });

  afterAll(async () => {
    await prisma.outboxPesan.deleteMany({ where: { id_agregat: aggregateId } });
    await prisma.$disconnect();
  });

  it("publishes an outbox event in PENDING state", async () => {
    const event = await publishOutboxEvent({
      tipe_event: "AKADEMIK_SEMESTER_DIBUKA",
      tipe_agregat: "PERIODE_AKADEMIK",
      id_agregat: aggregateId,
      payload: { tahun: "2026/2027", semester: "Ganjil" },
      maks_percobaan: 3,
    });

    expect(event.id).toBeDefined();
    expect(event.status).toBe("PENDING");
    expect(event.jumlah_percobaan).toBe(0);
  });

  it("fetches pending outbox events", async () => {
    const pendingEvents = await fetchPendingOutboxEvents(10);
    const found = pendingEvents.find((e) => e.id_agregat === aggregateId);

    expect(found).toBeDefined();
  });

  it("marks an outbox event as COMPLETED", async () => {
    const event = await publishOutboxEvent({
      tipe_event: "TEST_COMPLETED",
      tipe_agregat: "TEST",
      id_agregat: aggregateId,
      payload: { ok: true },
    });

    const completed = await markOutboxEventCompleted(event.id);
    expect(completed.status).toBe("COMPLETED");
    expect(completed.diproses_pada).not.toBeNull();
  });

  it("increments attempt and marks as FAILED when max attempts exceeded (Negative Test)", async () => {
    const event = await publishOutboxEvent({
      tipe_event: "TEST_FAILED",
      tipe_agregat: "TEST",
      id_agregat: aggregateId,
      payload: { fail: true },
      maks_percobaan: 1, // Only 1 attempt
    });

    const failed = await markOutboxEventFailed(event.id, "Network timeout error");
    expect(failed.status).toBe("FAILED");
    expect(failed.jumlah_percobaan).toBe(1);
    expect(failed.pesan_error).toBe("Network timeout error");
  });
});
