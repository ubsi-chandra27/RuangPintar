import { describe, it, expect } from "vitest";
import { generateUlid, generateMonotonicUlid, isValidUlid } from "@/shared/lib/ulid";

describe("ULID Utility — Identifier Baseline", () => {
  it("generates valid 26-character Crockford Base32 ULIDs", () => {
    const id = generateUlid();
    expect(id).toHaveLength(26);
    expect(isValidUlid(id)).toBe(true);
  });

  it("generates monotonic ULIDs with lexicographical order within same millisecond", () => {
    const id1 = generateMonotonicUlid();
    const id2 = generateMonotonicUlid();
    const id3 = generateMonotonicUlid();

    expect(id1 < id2).toBe(true);
    expect(id2 < id3).toBe(true);
  });

  it("correctly rejects invalid ULID strings", () => {
    expect(isValidUlid("")).toBe(false);
    expect(isValidUlid("12345")).toBe(false);
    expect(isValidUlid("01K4AB7QZ7NJKP9R3AGT2F6HVMextra")).toBe(false);
    expect(isValidUlid("01K4AB7QZ7NJKP9R3AGT2F6HV_")).toBe(false); // Invalid character '_'
    expect(isValidUlid(null)).toBe(false);
    expect(isValidUlid(12345)).toBe(false);
  });
});
