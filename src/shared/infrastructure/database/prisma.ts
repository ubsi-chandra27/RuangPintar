import { PrismaClient } from "@prisma/client";

declare global {
  var __ruangPintarPrisma__: PrismaClient | undefined;
}

/**
 * Configure SQLite pragmas for performance, concurrency, foreign key enforcement, and data durability.
 */
export async function configureSqlitePragmas(client: PrismaClient): Promise<void> {
  // Enforce foreign key constraints
  await client.$queryRawUnsafe("PRAGMA foreign_keys = ON;");

  // Production-grade concurrency: Write-Ahead Logging (returns a result row in SQLite)
  await client.$queryRawUnsafe("PRAGMA journal_mode = WAL;");

  // Durability baseline: synchronous FULL
  await client.$queryRawUnsafe("PRAGMA synchronous = FULL;");

  // Busy timeout to handle brief concurrent write locks
  await client.$queryRawUnsafe("PRAGMA busy_timeout = 5000;");
}

function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

  return client;
}

export const prisma: PrismaClient = global.__ruangPintarPrisma__ ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__ruangPintarPrisma__ = prisma;
}

export default prisma;
