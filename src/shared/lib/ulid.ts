import { ulid, monotonicFactory } from "ulidx";

const monotonic = monotonicFactory();

/**
 * Generate standard 26-character lexicographically sortable ULID string.
 */
export function generateUlid(): string {
  return ulid();
}

/**
 * Generate monotonic ULID string guaranteed to be sequentially sortable even within the same millisecond.
 */
export function generateMonotonicUlid(): string {
  return monotonic();
}

/**
 * Validate whether a given string is a valid 26-character Crockford Base32 ULID.
 */
export function isValidUlid(id: unknown): id is string {
  if (typeof id !== "string") return false;
  if (id.length !== 26) return false;
  return /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/i.test(id);
}
