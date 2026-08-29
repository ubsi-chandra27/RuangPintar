import { PrismaClient, Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export interface TransactionOptions {
  maxWait?: number; // default: 5000 ms
  timeout?: number; // default: 10000 ms
  isolationLevel?: Prisma.TransactionIsolationLevel;
}

/**
 * Execute a unit of work within an interactive transaction with safe timeout and error boundary.
 */
export async function runInTransaction<T>(
  action: (tx: TransactionClient) => Promise<T>,
  options?: TransactionOptions
): Promise<T> {
  return await prisma.$transaction(
    async (tx) => {
      return await action(tx as unknown as TransactionClient);
    },
    {
      maxWait: options?.maxWait ?? 5000,
      timeout: options?.timeout ?? 10000,
      isolationLevel: options?.isolationLevel,
    }
  );
}
